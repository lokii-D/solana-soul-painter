"use client"

import { useEffect, useState } from "react"
import { Terminal } from "lucide-react"

const SCAN_MESSAGES = [
  "[NET] INFILTRATING SOLANA LEDGER",
  "[DATA] DECODING WALLET DNA SEQUENCE",
  "[SYS] TRAVERSING HISTORICAL TX HASHES",
  "[AI] EXTRACTING ON-CHAIN KARMA",
  "[SYS] QUANTIFYING DEGEN EXPOSURE",
  "[NET] SYNCHRONIZING WITH RPC NODES",
  "[DATA] TARGET WALLET LOCKED & ISOLATED",
  "[AI] CALCULATING TOTAL REKT METRICS",
  "[SYS] CONSTRUCTING SOUL ARCHITECTURE",
  "[AI] GENERATING CYBER FATE MANIFEST",
]

export function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState("")

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % SCAN_MESSAGES.length)
    }, 1400)
    return () => clearInterval(msgTimer)
  }, [])

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)
    return () => clearInterval(dotTimer)
  }, [])

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 3
      })
    }, 200)
    return () => clearInterval(progressTimer)
  }, [])

  return (
    // 💡 核心修改：lg:w-1/2 强行锁定电脑屏幕 1/2 宽度
    <div className="flex flex-col items-center justify-center gap-8 w-full lg:w-1/2 mx-auto font-sans animate-in fade-in zoom-in duration-500">
      <style jsx global>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-spin { animation: radar-spin 2s linear infinite; }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-blink { animation: cursor-blink 0.8s infinite; }
      `}</style>
      
      <div className="relative w-32 h-32 flex shrink-0 items-center justify-center">
        {[1, 0.65, 0.35].map((scale, i) => (
          <div key={i} className="absolute rounded-full border" style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, borderColor: `rgba(0, 255, 65, ${0.15 + i * 0.1})`, boxShadow: i === 0 ? "0 0 15px rgba(0,255,65,0.2)" : "none" }} />
        ))}
        <div className="absolute w-full h-full radar-spin">
          <div className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left" style={{ background: "linear-gradient(90deg, rgba(0,255,65,0.9), transparent)", boxShadow: "0 0 6px rgba(0,255,65,0.8)" }} />
        </div>
        <div className="absolute w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_10px_#00ff41]" />
        {[ { top: "20%", left: "65%" }, { top: "60%", left: "30%" }, { top: "45%", left: "75%" } ].map((pos, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full animate-pulse" style={{ top: pos.top, left: pos.left, background: i === 0 ? "#0aefff" : "#00ff41", boxShadow: i === 0 ? "0 0 6px #0aefff" : "0 0 6px #00ff41", animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>

      <div className="w-full rounded-xl p-6 relative overflow-hidden bg-[#050508]/60 backdrop-blur-xl border border-[rgba(0,255,65,0.2)] shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff41]/20 to-transparent" />
        
        <div className="flex items-start gap-3">
          <Terminal className="w-4 h-4 text-[#00ff41] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-mono tracking-[0.2em] leading-relaxed text-[#00ff41] uppercase min-h-[3rem]">
              {SCAN_MESSAGES[msgIndex]}
              <span className="text-[#0aefff] ml-1 font-bold cursor-blink">{dots}</span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-[9px] font-mono tracking-[0.3em] uppercase mb-2 text-gray-500">
            <span>PROCESS_STAGING</span>
            <span className="text-[#0aefff]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #00ff41, #0aefff)", boxShadow: "0 0 10px rgba(0,255,65,0.4)" }} />
          </div>
        </div>
      </div>

      <div className="w-full space-y-2 px-1">
        {["AUTHENTICATING_NODE", "PARSING_HISTORY", "NEURAL_MAPPING"].map((line, i) => (
          <div key={i} className="flex items-center justify-between text-[9px] font-mono tracking-[0.2em] text-gray-600 uppercase">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${i <= (progress/33) ? 'bg-[#00ff41] animate-pulse' : 'bg-gray-800'}`} />
              {line}
            </div>
            <span>{i <= (progress/33) ? "[READY]" : "[WAIT]"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}