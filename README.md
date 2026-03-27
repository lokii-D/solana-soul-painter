# 🔮 Solana Soul Painter (索拉纳灵魂画师)

> **"Your On-Chain Personality Roast & Web3 Social Fission Engine."**
> 
> 你的链上赛博算命机与 Web3 社交裂变引擎。

🔗 **Live App:** [https://solana-soul-painter.vercel.app/](https://solana-soul-painter.vercel.app/)

---

## 🌐 Vision (项目愿景)

Solana Soul Painter is a non-custodial wallet behavioral analysis protocol powered by LLMs and native on-chain data. It transforms cold transaction logs into "Social Capital" through semantic analysis and AI-driven roasts.

在 Web3 世界中，钱包地址通常是冰冷的字符。本项目旨在通过数据语义化与 AI 情感分析，将用户的链上交互记录转化为极具传播价值的“社交资本”。

## ⚙️ Technical Architecture (技术架构)

- **Data Ingestion**: Helius API (Fetching transactions & metadata)
- **AI Inference**: DeepSeek-V3 (Structured JSON outputs & personality roasting)
- **Security & Cache**: Upstash Redis (24h caching) & Cloudflare Turnstile
- **Frontend**: Next.js + Framer Motion + Tailwind CSS

## 🧬 The Cyber-Oracle Taxonomy (人格分类学)

AI analyzes transaction intent and risk tolerance to categorize users into 5 archetypes:
1. 🩸 **The Trench Warrior** (PVP / Memecoin degen)
2. 🖼️ **The Illiquid Bagholder** (NFT collector)
3. 🌾 **The Yield Boomer** (DeFi farmer / Stablecoin lover)
4. 🤖 **The Sweaty Sniper** (MEV / Bot failed attempts)
5. 👻 **The Ghost Node** (Low frequency / Scared observer)

## 🛠️ How to Run Locally (本地开发)

1. Clone the repo: `git clone https://github.com/loki-D/solana-soul-painter.git`
2. Install dependencies: `cd web-app && npm install`
3. Configure `.env` with your Helius & DeepSeek keys.
4. Run: `npm run dev`

---

## ⚖️ License
MIT License. **Roast responsibly.**