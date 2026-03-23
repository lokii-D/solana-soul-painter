import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// 🛡️ Initialize Upstash Redis connection via environment variables
const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    // ==========================================
    // 🛡️ DEFENSE TIER -1: CORS & ORIGIN 智能白名单校验
    // ==========================================
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    
    // 精确匹配本地环境，防止黑客伪造包含 localhost 的假域名
    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'); 
    const isVercel = origin.endsWith('.vercel.app'); 
    
    if (origin && !isLocal && !isVercel && origin !== allowedOrigin) {
      console.warn(`[SECURITY ALERT] UNAUTHORIZED ORIGIN BLOCKED: ${origin}`);
      return NextResponse.json({ 
        error: `ACCESS DENIED. UNREGISTERED TERMINAL.` 
      }, { status: 403 });
    }

    // ==========================================
    // 🛡️ DEFENSE TIER -0.5: IP RATE LIMITING (防脚本狂刷)
    // ==========================================
    // 防止黑客通过伪造 x-forwarded-for 绕过限流（取逗号分隔的第一个真实IP）
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown-cyber-entity';
    const rateLimitKey = `rate_limit_${ip}`;
    
    const requestCount = await redis.incr(rateLimitKey);
    if (requestCount === 1) {
      await redis.expire(rateLimitKey, 60); 
    }
    if (requestCount > 5) { // 稍微放宽到一分钟 5 次，防止误伤分享页面的快速测试
      console.warn(`[SECURITY ALERT] RATE LIMIT EXCEEDED FOR IP: ${ip}`);
      return NextResponse.json({ 
        error: "SYSTEM COOLING DOWN. YOU ARE SCANNING TOO FAST. WAIT 60 SECONDS." 
      }, { status: 429 });
    }

    // 尝试解析 Body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "INVALID JSON PAYLOAD" }, { status: 400 });
    }

    const { address: rawAddress, token } = body; 
    
    // ==========================================
    // 🛡️ DEFENSE TIER -0.1: INPUT SANITATION (终极防代码注入)
    // ==========================================
    if (!rawAddress || typeof rawAddress !== 'string') {
      return NextResponse.json({ error: "MISSING OR INVALID ADDRESS" }, { status: 400 });
    }

    // 核心清洗：去除所有隐形字符、换行和前后空格
    const address = rawAddress.trim();

    // 严格校验 Solana 地址格式 (Base58, 32-44字符)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaAddressRegex.test(address)) {
      // 截断日志，防止被传进来的十万字长代码撑爆 Vercel Logs
      console.warn(`[SECURITY ALERT] MALFORMED ADDRESS INJECTION ATTEMPT: ${address.substring(0, 50)}...`);
      return NextResponse.json({ error: "INVALID SOLANA ADDRESS FORMAT" }, { status: 400 });
    }

    console.log(`[SECURITY LOG] Incoming soul scan request for address: ${address} from IP: ${ip}`);

    // ==========================================
    // 🛡️ DEFENSE TIER 0: CLOUDFLARE TURNSTILE 
    // ==========================================
    if (!token) {
      console.error("[SECURITY ALERT] Blocked request: Missing Turnstile token.");
      return NextResponse.json({ error: "SECURITY CHECK FAILED: NO TOKEN PROVIDED. ARE YOU A BOT?" }, { status: 403 });
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
      console.error("[SECURITY ALERT] Blocked request: Turnstile validation failed.");
      return NextResponse.json({ error: "SECURITY CHECK FAILED: BOT DETECTED." }, { status: 403 });
    }

    // ==========================================
    // 🛡️ DEFENSE TIER 1: UPSTASH REDIS CACHE 
    // ==========================================
    const cacheKey = `soul_scan_${address}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`[SECURITY LOG] 🛡️ CACHE HIT! Returning historical data for ${address}. API cost: $0.`);
      return NextResponse.json(cachedData);
    }

    // ==========================================
    // 🧠 ENHANCED AI LOGIC (Deep Data Extraction)
    // ==========================================
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!HELIUS_API_KEY || !DEEPSEEK_API_KEY) {
      throw new Error("SERVER_CONFIG_ERROR"); 
    }

    // 1. 🔍 调用 Helius 抓取最近交易
    const heliusUrl = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}`;
    const heliusRes = await fetch(heliusUrl);
    if (!heliusRes.ok) throw new Error("HELIUS_API_FAILURE");
    
    const txs = await heliusRes.json();
    const txCount = Array.isArray(txs) ? txs.length : 0;

    // 提取最近 15 笔交易的硬核细节
    const txDetails = Array.isArray(txs) 
      ? txs.slice(0, 15).map((t: any) => ({
          type: t.type || "UNKNOWN", 
          source: t.source || "UNKNOWN", 
          desc: t.description ? t.description.substring(0, 100) : "No description", 
          fee: t.fee ? (t.fee / 1e9).toFixed(5) + " SOL" : "0 SOL"
        }))
      : [];

    const txSummary = JSON.stringify({
      total_recent_txs: txCount,
      recent_patterns: txDetails
    });

    // 💡 100% 原汁原味保留的系统提示词
    const prompt = `You are a ruthless, highly analytical, and cynical Web3 cyber-oracle. Analyze the following Solana wallet data and roast the user without mercy.

ON-CHAIN DATA:
${txSummary}

ANALYSIS INSTRUCTIONS & ARCHETYPES:
1. Identify their exact Solana archetype based on the 'source' and 'type' of their transactions:
   - If mostly 'PUMP_FUN' or 'RAYDIUM' SWAPs: They are a trench warrior, shitcoin gambler, or PVP victim.
   - If mostly 'MAGIC_EDEN' or 'TENSOR' or 'MINT': They are a JPEG addict, illiquid NFT bagholder.
   - If mostly 'JUPITER' or 'KAMINO' or 'MARGINFI': They are a yield boomer, points farmer, or DeFi peasant.
   - If extremely high frequency + high fees: They are a failed MEV bot or sweaty sniper.
   - If 0-3 txs or mostly TRANSFERS: They are a ghost wallet, dust collector, or scared observer.
2. AVOID generic titles like "EXIT LIQUIDITY". Be hyper-specific to the protocols they use.
3. Your tone must be cold, terminal-like, and deeply cynical. 

OUTPUT FORMAT (STRICTLY IN ENGLISH, output must be in valid JSON format):
{
  "title": "A hardcore, cyberpunk/Web3 title based on their exact behavior (e.g., 'PUMP.FUN MARTYR', 'TENSOR GAMBLER', 'YIELD BOOMER', 'GHOST NODE'). Max 3 words.",
  "title_tags": ["Array of 3 technical keywords reflecting their txs (e.g., 'HIGH-SLIPPAGE', 'JPEG-HOARDER', 'RUG-SURVIVOR')"],
  "mbti": "A Web3-themed personality type (e.g., 'ENFP-SHITCOINER', 'INTJ-ARBBOT', 'ISTJ-FARMER', 'INFP-LURKER')",
  "mbti_tags": ["Array of 3 psychological traits (e.g., 'DELUSIONAL', 'FOMO-DRIVEN', 'PARANOID')"],
  "analysis": "A cold, analytical breakdown (30-50 words) diagnosing their on-chain behavior. MUST mention specific protocols (Pump.fun, Jupiter, etc.) if they appear in the data. Sound like a terminal log.",
  "roast": "One brutal, highly specific punchline roasting their exact trading habits based on the data provided (max 20 words)."
}`;

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

    if (!dsRes.ok) throw new Error("DEEPSEEK_API_FAILURE");

    const dsData = await dsRes.json();
    const aiContent = dsData.choices[0].message.content;
    const result = JSON.parse(aiContent); 

    // ==========================================
    // 🛡️ DEFENSE TIER 2: WRITE TO CACHE 
    // ==========================================
    await redis.set(cacheKey, result, { ex: 86400 });
    console.log(`[SECURITY LOG] ✅ Fresh data encrypted and cached in Redis. 24-hour shield activated for ${address}.`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[FATAL INTERNAL ERROR] Cyber-Oracle malfunction:", error.message || error);
    return NextResponse.json({ 
      error: "THE CYBER-ORACLE IS CURRENTLY UNREACHABLE. DATA CORRUPTED OR SYSTEM OVERLOAD." 
    }, { status: 500 });
  }
}