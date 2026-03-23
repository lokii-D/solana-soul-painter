import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// 🛡️ 初始化 Upstash Redis
const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    // ==========================================
    // 🛡️ 第 1 层防线：CORS & Origin 校验 (已针对 Vercel 优化)
    // ==========================================
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    
    // 只要是本地、或者是你的 vercel 子域名，通通放行
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isVercel = origin.includes('.vercel.app');
    
    if (origin && !isLocal && !isVercel && origin !== allowedOrigin) {
      console.warn(`[SECURITY ALERT] BLOCKED ORIGIN: ${origin}`);
      return NextResponse.json({ 
        error: `ACCESS DENIED. UNREGISTERED TERMINAL. (Debug: Origin is ${origin})` 
      }, { status: 403 });
    }

    // ==========================================
    // 🛡️ 第 2 层防线：IP 级频率限制 (防脚本狂刷)
    // ==========================================
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `rate_limit_${ip}`;
    const requestCount = await redis.incr(rateLimitKey);
    
    if (requestCount === 1) {
      await redis.expire(rateLimitKey, 60); 
    }
    if (requestCount > 5) {
      return NextResponse.json({ error: "SYSTEM COOLING DOWN. WAIT 60 SECONDS." }, { status: 429 });
    }

    // ==========================================
    // 📥 解析请求数据
    // ==========================================
    const { address, token } = await req.json(); 
    if (!address) return NextResponse.json({ error: "Address is required" }, { status: 400 });

    // ==========================================
    // 🛡️ 第 3 层防线：Cloudflare Turnstile 人机验证
    // ==========================================
    if (!token) {
      return NextResponse.json({ error: "SECURITY CHECK FAILED: NO TOKEN" }, { status: 403 });
    }
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY, 
        response: token,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json({ error: "SECURITY CHECK FAILED: BOT DETECTED" }, { status: 403 });
    }

    // ==========================================
    // 🛡️ 第 4 层防线：Redis 缓存 (24小时内不重复算命)
    // ==========================================
    const cacheKey = `soul_scan_${address}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] Returning data for ${address}`);
      return NextResponse.json(cachedData);
    }

    // ==========================================
    // 🧠 核心逻辑：Helius 链上扫描 + DeepSeek AI 算命
    // ==========================================
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    // 1. 抓取 Helius 交易数据
    const heliusRes = await fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}`);
    if (!heliusRes.ok) throw new Error("HELIUS_FETCH_FAILED");
    const txs = await heliusRes.json();

    // 2. 构造“灵魂拷问”提示词 (保留你的 Solana 职业分析逻辑)
    const txSummary = JSON.stringify(Array.isArray(txs) ? txs.slice(0, 15) : []);
    const prompt = `You are a ruthless, cynical Web3 oracle. Analyze this Solana wallet data and roast the user. 
    DATA: ${txSummary}
    Output strict JSON only: {
      "title": "Hyper-specific title (e.g. Pump.fun Martyr)",
      "title_tags": ["3 technical keywords"],
      "mbti": "Web3 themed personality",
      "mbti_tags": ["3 psychological traits"],
      "analysis": "30-50 words breakdown of their habits",
      "roast": "One brutal punchline (max 20 words)"
    }`;

    // 3. 调用 DeepSeek
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" } 
      })
    });

    const dsData = await dsRes.json();
    const result = JSON.parse(dsData.choices[0].message.content);

    // ==========================================
    // 💾 最终产物：写入缓存并返回
    // ==========================================
    await redis.set(cacheKey, result, { ex: 86400 });
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[SERVER ERROR]", error);
    return NextResponse.json({ error: "THE CYBER-ORACLE IS OFFLINE. TRY AGAIN LATER." }, { status: 500 });
  }
}