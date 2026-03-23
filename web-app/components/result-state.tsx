"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface ResultStateProps {
  address: string
  onReset: () => void
  posterData?: any 
}

const SideCard = ({ subtitle, title, tags = [] }: { subtitle: string, title: string, tags?: string[] }) => (
  <div className="w-full h-full flex flex-col items-center justify-center border border-[#00FF41] bg-transparent shadow-[0_0_8px_#00FF41] rounded-[4px] relative px-[10px]">
    <div className="w-full text-[clamp(16px,1.5vw,24px)] font-mono text-[#00FF41] font-bold uppercase text-center leading-none shrink-0 truncate">
      {title}
    </div>
    <div className="mt-[2vh] w-full text-[clamp(10px,1vw,12px)] font-mono text-[#00FFFF] uppercase text-center leading-none shrink-0 truncate">
      {subtitle}
    </div>
    {tags.length > 0 && (
      <div className="mt-[3vh] flex flex-col items-center gap-[1.5vh] w-full">
        {tags.map((tag, i) => (
          <span 
            key={i} 
            className="w-[90%] max-w-[180px] text-[clamp(9px,0.8vw,12px)] font-mono px-[5px] py-[8px] rounded-[4px] uppercase border border-[#00FF41] text-[#00FFFF] bg-[rgba(0,0,0,0.7)] tracking-[1px] text-center shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

export function ResultState({ onReset, posterData }: ResultStateProps) {
  const analysisText = posterData?.data?.analysis || "SYSTEM SCAN: 100 TXs detected. Pattern analysis reveals compulsive trading behavior with no coherent strategy. Gas fees exceed portfolio gains. Wallet functions as a liquidity provider for smarter traders. Terminal velocity toward zero confirmed."
  const roastText = posterData?.data?.roast || "Your portfolio is just a public service donation to whales who actually know what they're doing."
  const title = posterData?.data?.title || "EXIT LIQUIDITY"
  const mbti = posterData?.data?.mbti || "ESTP-DEGEN"

  const titleTags = posterData?.data?.title_tags || ["HIGH-FREQUENCY", "GAS-BURNING", "MICRO-LOSS"]
  const mbtiTags = posterData?.data?.mbti_tags || ["IMPULSIVE", "RISK-SEEKING", "HOPIUM-ADDICT"]

  // ==========================================
  // 🚀 全新注入的裂变魔法函数 (链接紧随排版版)
  // ==========================================
  const handleTwitterShare = () => {
    // 1. 直接定义好带网址的完整文案
    // 注意：这里我们手动把 https 链接拼在手指 👇 后面
    const siteUrl = "\nhttps://solana-soul-painter.vercel.app";
    
    const tweetText = `My On-Chain Soul Scan is complete 💀\n\nClass: [ ${title} ]\nAlignment: [ ${mbti} ]\n\n"${roastText}"\n\nScan your wallet here 👇\n${siteUrl}`;

    // 2. 【关键】只传 text 参数，绝对不要再传 &url= 了！
    // 这样推特就会强迫把网址显示在正文里
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    // 3. 打开窗口
    window.open(twitterIntentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden bg-transparent">
      
      <div className="w-[92vw] h-[92vh] max-w-[1440px] min-w-[1024px] flex flex-col justify-between items-center font-sans relative">
        
        {/* 顶部两行文字 */}
        <div className="w-full flex flex-col items-center mt-[4vh] shrink-0">
          <div className="text-[18px] font-mono text-[#00FF41] font-bold tracking-[1.5px] uppercase text-center leading-none">
            SOLANA-SOUL-PAINTER
          </div>
          <div className="mt-[2vh] text-[16px] font-mono text-[#00FFFF] tracking-[2px] uppercase text-center leading-none">
            ENTER SOL ADDRESS TO DECRYPT YOUR CYBER FATE
          </div>
        </div>

        <div className="w-full mt-[4vh] flex-1 min-h-0 flex flex-row items-stretch shrink-0">
          
          {/* 左卡片 */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-[25%] min-w-0 shrink-0 h-full">
            <SideCard subtitle="CLASS OVERVIEW" title={title} tags={titleTags} />
          </motion.div>

          {/* 中间主卡片 */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex-1 mx-[2%] min-w-0 h-full flex flex-col items-center justify-center border border-[#00FF41] bg-transparent shadow-[0_0_8px_#00FF41] rounded-[4px]"
          >
            <div className="w-[85%] relative aspect-[1200/630] rounded-[4px] overflow-hidden border border-[#00FF41]/40 shrink-0 bg-[rgba(0,0,0,0.5)]">
              {posterData?.url ? (
                <Image src={posterData.url} alt="Diagnostic Output" fill className="object-cover" unoptimized />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[12px] font-mono text-[#00FF41] animate-pulse uppercase tracking-[2px]">
                    LOADING_ENCRYPTED_DATA...
                  </div>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)", backgroundSize: "100% 4px" }} />
            </div>
            
            <div className="mt-[3vh] px-[30px] w-full flex items-center justify-center overflow-hidden shrink-0">
              <p className="text-[14px] font-mono text-[#FFFFFF] leading-[1.6] text-center break-words">
                "{roastText}"
              </p>
            </div>
          </motion.div>

          {/* 右卡片 */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="w-[25%] min-w-0 shrink-0 h-full">
            <SideCard subtitle="ALIGNMENT TRAIT" title={mbti} tags={mbtiTags} />
          </motion.div>

        </div>

        {/* 系统诊断栏 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full mt-[2vh] flex flex-col items-center shrink-0"
        >
          <div className="w-full rounded-[4px] border border-[#00FF41] bg-transparent shadow-[0_0_8px_#00FF41] py-[2vh] px-[20px] flex flex-col items-center justify-center">
            <p className="text-[12px] font-mono text-[#FFFFFF] leading-[1.6] text-center break-words">
              {analysisText}
            </p>
          </div>
        </motion.div>

        {/* 判决文本 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="w-full mt-[1.5vh] flex items-center justify-center shrink-0"
        >
          <div className="text-[14px] font-mono text-[#FF0000] font-bold uppercase text-center tracking-[1px]">
            [ FATAL VERDICT ]
          </div>
        </motion.div>

        {/* 按钮区 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-[30px] w-full mt-[2vh] shrink-0"
        >
          <button onClick={onReset} className="w-[200px] py-[1.2vh] rounded-[4px] text-[13px] font-mono text-[#00FF41] font-bold uppercase border border-[#00FF41] bg-[rgba(0,0,0,0.7)] shadow-[0_0_8px_#00FF41] hover:bg-[#00FF41]/20 transition-all text-center">
            SCAN AGAIN
          </button>
          
          <button 
            onClick={handleTwitterShare} 
            className="w-[200px] py-[1.2vh] rounded-[4px] text-[13px] font-mono text-[#00FF41] font-bold uppercase border border-[#00FF41] bg-[rgba(0,0,0,0.7)] shadow-[0_0_8px_#00FF41] hover:bg-[#00FF41]/20 transition-all text-center block"
          >
            SHARE TO X
          </button>
        </motion.div>

        {/* 唯一免责声明 */}
        <div className="w-full flex flex-col items-center justify-center text-[10px] font-mono text-[#A9A9A9] uppercase tracking-[1px] mt-[2vh] mb-[1vh] shrink-0">
          <p>FOR ENTERTAINMENT ONLY · NOT FINANCIAL ADVICE</p>
          <p className="mt-[0.5vh]">POWERED BY SOLANA · AI GENERATED · WEB3 NATIVE</p>
        </div>

      </div>
    </div>
  )
}