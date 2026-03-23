const axios = require('axios');

// ==========================================
// 1. 配置区：填入你的 API Key 和测试钱包地址
// ==========================================
const API_KEY = 'fc8f44dd-c6d0-48ea-88de-19ccc132ec47'; // 记得去 dev.helius.xyz 免费获取
const WALLET_ADDRESS = 'FrhLfj81LRpMR3EwSSCGPzHmxsnoq8h628ne68vK5oMN'; // 这是那个活跃的“路人”测试地址

// 定义主流币的合约地址 (SOL, USDC, USDT)
const MAIN_COINS = [
    "So11111111111111111111111111111111111111112", 
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"  
];

// ==========================================
// 2. 榨汁机函数：将 100 笔复杂 JSON 压缩成 4 个核心指标
// ==========================================
function analyzeWallet(transactions) {
    let nightOwlCount = 0;
    let shitcoinCount = 0;
    const actionCounts = {};

    transactions.forEach(tx => {
        // A. 统计深夜焦虑交易 (假设当地时间凌晨 1 点到 5 点)
        // 注意：这里拿到的 getHours() 是运行这段代码的电脑的本地时间
        const date = new Date(tx.timestamp * 1000);
        const hour = date.getHours();
        if (hour >= 1 && hour <= 5) {
            nightOwlCount++;
        }

        // B. 统计最爱操作 (比如 SWAP, NFT_MINT 等)
        const type = tx.type || "UNKNOWN";
        actionCounts[type] = (actionCounts[type] || 0) + 1;

        // C. 统计买土狗币频次 (提取 tokenTransfers 里的非主流币)
        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
            tx.tokenTransfers.forEach(transfer => {
                if (transfer.mint && !MAIN_COINS.includes(transfer.mint)) {
                    shitcoinCount++;
                }
            });
        }
    });

    // 计算占比并找出最频繁的操作
    const total = transactions.length;
    const nightOwlRate = total === 0 ? "0%" : `${Math.round((nightOwlCount / total) * 100)}%`;
    
    let favoriteAction = "NONE";
    if (Object.keys(actionCounts).length > 0) {
        favoriteAction = Object.keys(actionCounts).reduce((a, b) => actionCounts[a] > actionCounts[b] ? a : b);
    }

    // 组装最终喂给 AI 的极简对象
    return {
        total_txs: total,
        night_owl_rate: nightOwlRate,
        favorite_action: favoriteAction,
        shitcoin_count: shitcoinCount
    };
}

// ==========================================
// 3. 核心执行逻辑：发送网络请求 -> 拿到数据 -> 榨汁
// ==========================================
async function run() {
    const url = `https://api.helius.xyz/v0/addresses/${WALLET_ADDRESS}/transactions?api-key=${API_KEY}`;

    try {
        console.log(`🚀 正在向 Helius 请求 ${WALLET_ADDRESS} 的真实链上数据...`);
        const response = await axios.get(url);
        const transactions = response.data;
        
        console.log(`✅ 成功拉取 ${transactions.length} 笔交易记录。开始启动榨汁机...`);
        
        // 调用我们上面的分析函数
        const finalData = analyzeWallet(transactions);
        
        console.log("----------------------------------------");
        console.log("=== 🍹 榨汁完成！这是马上要发给 AI 的生辰八字 ===");
        console.log(JSON.stringify(finalData, null, 2));
        console.log("----------------------------------------");

    } catch (error) {
        console.error('❌ 获取或处理数据失败，请检查 API Key 是否正确填写：', error.message);
    }
}

// 4. 运行
run();