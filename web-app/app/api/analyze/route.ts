import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// 🛡️ 尝试初始化 Redis，失败直接报在控制台
const redis = Redis.fromEnv();

export async function POST(req: Request) {
  console.log(">>> [DIAGNOSTIC] Request Received");
  
  try {
    // 1. 域名校验诊断
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'NO_ORIGIN';
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'NOT_SET';
    console.log(`>>> [DIAGNOSTIC] Origin: ${origin}, Allowed: ${allowedOrigin}`);

    // 临时测试：先允许所有请求，排除域名干扰
    // if (origin && !origin.includes('localhost') && !origin.includes('vercel.app')) { ... }

    // 2. 解析 Body 诊断
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "DEBUG: Invalid JSON in request body" }, { status: 400 });
    }
    const { address, token } = body;
    console.log(`>>> [DIAGNOSTIC] Address: ${address}, Token: ${token ? 'PROVIDED' : 'MISSING'}`);

    // 3. 环境变量诊断 (不打印 Key，只打印是否存在)
    const envCheck = {
      HELIUS: !!process.env.HELIUS_API_KEY,
      DEEPSEEK: !!process.env.DEEPSEEK_API_KEY,
      REDIS: !!process.env.UPSTASH_REDIS_REST_URL,
      TURNSTILE: !!process.env.TURNSTILE_SECRET_KEY
    };
    console.log(">>> [DIAGNOSTIC] Env Status:", envCheck);

    if (!envCheck.HELIUS || !envCheck.DEEPSEEK) {
      return NextResponse.json({ error: `DEBUG: Missing Env Keys: ${JSON.stringify(envCheck)}` }, { status: 500 });
    }

    // 4. Redis 诊断
    try {
      await redis.set("test_connection", "ok", { ex: 10 });
    } catch (e: any) {
      return NextResponse.json({ error: `DEBUG: Redis Connection Failed: ${e.message}` }, { status: 500 });
    }

    // 5. Helius 诊断
    console.log(">>> [DIAGNOSTIC] Fetching Helius...");
    const heliusRes = await fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}`);
    if (!heliusRes.ok) {
      return NextResponse.json({ error: `DEBUG: Helius API Error: ${heliusRes.statusText}` }, { status: 500 });
    }
    const txs = await heliusRes.json();

    // 6. DeepSeek 修复版 (严格包含 json 关键字和完整算命逻辑)
    console.log(">>> [DIAGNOSTIC] Calling DeepSeek with full roast logic...");
    
    const txSummary = JSON.stringify(Array.isArray(txs) ? txs.slice(0, 15) : []);
    const prompt = `You are a ruthless, cynical Web3 oracle. Analyze this Solana wallet data and roast the user. 
    DATA: ${txSummary}
    Your response MUST be a strict JSON object with these exact keys: 
    "title" (Max 3 words), 
    "title_tags" (3 tech keywords), 
    "mbti" (Web3 personality), 
    "mbti_tags" (3 traits), 
    "analysis" (30-50 words), 
    "roast" (One brutal punchline). 
    Remember, the output must be in valid json format.`;

    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }], 
        response_format: { type: "json_object" } 
      })
    });

    if (!dsRes.ok) {
      const errText = await dsRes.text();
      return NextResponse.json({ error: `DEBUG: DeepSeek Error: ${dsRes.status} - ${errText}` }, { status: 500 });
    }

    const dsData = await dsRes.json();
    const aiResult = JSON.parse(dsData.choices[0].message.content);

    // 7. 写入缓存并真实返回前端需要的数据结构
    const cacheKey = `soul_scan_${address}`;
    await redis.set(cacheKey, aiResult, { ex: 86400 });
    
    console.log(">>> [DIAGNOSTIC] Success! Data cached and returning to frontend.");
    return NextResponse.json(aiResult);

  } catch (error: any) {
    console.error(">>> [DIAGNOSTIC] Fatal Error:", error);
    return NextResponse.json({ 
      error: "FATAL_EXCEPTION", 
      details: error.message,
      stack: error.stack?.substring(0, 100) 
    }, { status: 500 });
  }
}