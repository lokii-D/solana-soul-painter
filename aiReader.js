const { OpenAI } = require("openai");

// ==========================================
// 1. 配置区：填入你的 DeepSeek API Key
// ==========================================
const DEEPSEEK_API_KEY = "sk-73e1241256804531b57b0a3e2b5921a2";

// 初始化 OpenAI 客户端，但是把请求地址指向 DeepSeek 的国内服务器
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com', // 关键！指向 DeepSeek
    apiKey: DEEPSEEK_API_KEY
});

// ==========================================
// 2. 核心逻辑：把生辰八字喂给 AI
// ==========================================
async function generateFortune(walletData) {
    const prompt = `
    大师，请帮我看看这个钱包的生辰八字：
    - 总交易量: ${walletData.total_txs} 笔
    - 深夜焦虑率: ${walletData.night_owl_rate}
    - 最爱操作: ${walletData.favorite_action}
    - 买土狗币次数: ${walletData.shitcoin_count}

    请基于以上数据，开始你的毒舌算命：
    `;

    try {
        console.log("🔮 大师正在摸你的链上骨相，掐指一算...");
        
        const response = await openai.chat.completions.create({
            model: "deepseek-chat", // 使用 DeepSeek 的对话模型
            messages: [
                { 
                    role: "system", 
                    content: "你现在是一个混迹 Web3 多年、说话极度毒舌又扎心的‘链上算命大师’。你要根据我提供的 Solana 钱包数据，对这个钱包的主人进行无情的性格分析和运势预测。语言要幽默、讽刺、多用网络梗，字数控制在 200 字左右。" 
                },
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            temperature: 0.8 // 让大模型的语气更奔放一点
        });
        
        console.log("\n----------------------------------------");
        console.log("📜 【链上算命结果出炉】\n");
        console.log(response.choices[0].message.content);
        console.log("----------------------------------------");
    } catch (error) {
        console.error("❌ 大师施法被打断了:", error.message);
    }
}
