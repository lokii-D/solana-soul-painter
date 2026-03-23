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

    // 6. DeepSeek 诊断
    console.log(">>> [DIAGNOSTIC] Calling DeepSeek...");
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: `Roast this Solana wallet: ${address}` }], // 简化 Prompt 测试
        response_format: { type: "json_object" } 
      })
    });

    if (!dsRes.ok) {
      const errText = await dsRes.text();
      return NextResponse.json({ error: `DEBUG: DeepSeek Error: ${dsRes.status} - ${errText}` }, { status: 500 });
    }

    const dsData = await dsRes.json();
    return NextResponse.json({ message: "SUCCESS", data: dsData.choices[0].message.content });

  } catch (error: any) {
    console.error(">>> [DIAGNOSTIC] Fatal Error:", error);
    return NextResponse.json({ 
      error: "FATAL_EXCEPTION", 
      details: error.message,
      stack: error.stack?.substring(0, 100) 
    }, { status: 500 });
  }
}