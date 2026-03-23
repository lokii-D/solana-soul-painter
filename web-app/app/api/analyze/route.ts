import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    // 🛡️ TIER 1: 域名安全校验
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isVercel = origin.endsWith('.vercel.app');

    if (origin && !isLocal && !isVercel && origin !== allowedOrigin) {
      return NextResponse.json({ error: `CSO_DEBUG: Origin:[${origin}]` }, { status: 403 });
    }

    // 🛡️ TIER 2: IP 限流 (1分钟3次)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const requestCount = await redis.incr(`limit_${ip}`);
    if (requestCount === 1) await redis.expire(`limit_${ip}`, 60);
    if (requestCount > 3) return NextResponse.json({ error: "TOO_FAST" }, { status: 429 });

    const { address, token } = await req.json();
    if (!address || !token) return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });

    // 🛡️ TIER 3: Turnstile 人机验证
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token }),
    });
    if (!(await verifyRes.json()).success) return NextResponse.json({ error: "BOT_DETECTED" }, { status: 403 });

    // 🛡️ TIER 4: Redis 缓存 (24小时)
    const cacheKey = `soul_${address}`;
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    // 🧠 TIER 5: Helius 抓取 + AI 灵魂拷问
    const heliusRes = await fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}`);
    const txs = await heliusRes.json();
    
    const prompt = `You are a ruthless Web3 oracle. Analyze this Solana wallet: ${JSON.stringify(txs.slice(0,12))}. 
    Output strict JSON: { "title": "", "title_tags": [], "mbti": "", "mbti_tags": [], "analysis": "", "roast": "" }`;

    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } })
    });

    const result = JSON.parse((await dsRes.json()).choices[0].message.content);
    await redis.set(cacheKey, result, { ex: 86400 });
    return NextResponse.json(result);

  } catch (e: any) {
    return NextResponse.json({ error: "SYSTEM_OFFLINE" }, { status: 500 });
  }
}