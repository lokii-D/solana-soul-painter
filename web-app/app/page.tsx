"use client"

import React, { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Zap } from "lucide-react"
// 💡 引入 Solana 官方校验工具
import { PublicKey } from "@solana/web3.js"
import { Turnstile } from "@marsidev/react-turnstile"
import { MatrixRain } from "../components/matrix-rain"
import { LoadingState } from "../components/loading-state"
import { ResultState } from "../components/result-state"

type AppState = "initial" | "loading" | "result"

const VARIANTS = {
  enter: { opacity: 0, y: 24, filter: "blur(8px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -24, filter: "blur(8px)" },
}

export default function SoulPainterPage() {
  const [appState, setAppState] = useState<AppState>("initial")
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [posterData, setPosterData] = useState<{ url: string; data?: any } | null>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async () => {
    // 1️⃣ 第一重过滤：基础长度
    if (address.length < 32) {
      setError("INVALID LENGTH. ENTER A VALID SOLANA ADDRESS.")
      return
    }

    // 2️⃣ 第二重过滤：真正的 Solana 地址格式校验
    try {
      // 如果输入的字符串不是合法的 Base58 地址，这一步会直接报错
      new PublicKey(address);
    } catch (e) {
      setError("INVALID SOLANA ADDRESS. STOP TROLLING THE ORACLE.");
      return
    }

    // 3️⃣ 第三重过滤：人机验证
    if (!token) {
      setError("SECURITY CHECK REQUIRED. VERIFY YOU ARE HUMAN.")
      return
    }

    setError("")
    setAppState("loading")
    setPosterData(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, token })
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setAppState("initial");
        return;
      }

      const url = `/api/og?title=${encodeURIComponent(result.title)}&mbti=${encodeURIComponent(result.mbti)}&roast=${encodeURIComponent(result.roast)}`;
      
      setPosterData({ url, data: result });
      setAppState("result");
    } catch (e) {
      setError("NETWORK CONGESTION. SYSTEM OVERLOAD. TRY AGAIN.");
      setAppState("initial");
    }
  }

  function handleReset() {
    setAddress("")
    setError("")
    setPosterData(null)
    setAppState("initial")
    setToken(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <main suppressHydrationWarning className="relative min-h-screen w-full overflow-hidden cyber-grid bg-[#050508] font-sans flex flex-col items-center">
      
      <MatrixRain />
      <div className="fixed top-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(0,255,65,0.04)_0%,transparent_70%)]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(0,255,255,0.04)_0%,transparent_70%)]" />

      {appState !== "result" && (
        <>
          <header className="relative z-10 w-full flex flex-col items-center justify-start pt-[20px] h-[8vh] shrink-0">
            <div className="glitch-text text-[18px] font-mono text-[#00FF41] font-bold tracking-[1.5px] uppercase text-center" data-text="solana-soul-painter">
              solana-soul-painter
            </div>
          </header>
          <div className="relative z-10 w-full flex flex-col items-center mt-[24px] shrink-0">
            <h1 className="relative inline-block">
              <span className="card-shimmer text-[16px] font-mono text-[#00FFFF] tracking-[2px] uppercase text-center">
                ENTER SOL ADDRESS TO DECRYPT YOUR CYBER FATE
              </span>
            </h1>
          </div>
        </>
      )}

      <div className={appState === "result" ? "relative z-10 flex-1 flex flex-col justify-center w-full h-full absolute inset-0 mx-auto" : "relative z-10 flex-1 flex flex-col justify-center w-[84vw] mx-auto mt-[40px] mb-[20px]"}>
        <AnimatePresence mode="wait">
          {appState === "initial" && (
            <motion.div key="initial" variants={VARIANTS} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex justify-center w-full">
              <InitialState address={address} setAddress={setAddress} onSubmit={handleSubmit} onKeyDown={handleKeyDown} error={error} token={token} setToken={setToken} mounted={mounted} />
            </motion.div>
          )}

          {appState === "loading" && (
            <motion.div key="loading" variants={VARIANTS} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="flex justify-center w-full">
              <LoadingState />
            </motion.div>
          )}

          {appState === "result" && (
            <motion.div key="result" variants={VARIANTS} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }} className="w-full h-full">
              <ResultState address={address} onReset={handleReset} posterData={posterData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {appState !== "result" && (
        <footer className="relative z-10 mt-auto pb-[20px] text-center text-[10px] font-mono text-[#A9A9A9] uppercase shrink-0">
          <p>FOR ENTERTAINMENT ONLY · NOT FINANCIAL ADVICE</p>
          <p className="mt-[5px]">POWERED BY SOLANA · AI GENERATED · WEB3 NATIVE</p>
        </footer>
      )}
    </main>
  )
}

function InitialState({ address, setAddress, onSubmit, onKeyDown, error, token, setToken, mounted }: any) {
  return (
    <div className="flex flex-col items-center gap-[24px] w-full lg:w-[46%] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="glass-card w-full flex flex-col items-center p-[20px] rounded-[4px] border border-[#00FFFF] bg-[#050508]/80 backdrop-blur-md shadow-[0_0_8px_#00FF41]">
        <label htmlFor="sol-address" className="text-[12px] font-mono text-[#00FFFF] uppercase mb-[15px] text-center tracking-[2px]">
          TARGET WALLET ADDRESS
        </label>
        
        <input
          id="sol-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} onKeyDown={onKeyDown}
          placeholder="PASTE ADDRESS HERE..."
          className="neon-input w-full text-center py-[15px] text-[14px] font-mono bg-black/50 outline-none focus:ring-1 focus:ring-[#00FF41] uppercase tracking-[1px] border border-[#00FFFF]/50 text-[#00FF41] rounded-[4px] transition-all"
          spellCheck={false} autoComplete="off"
        />
        
        <div className="min-h-[20px] mt-[15px] flex justify-center w-full">
          {error && (
            <p className="text-[12px] font-mono uppercase text-[#FF0000] text-center tracking-widest flex items-center gap-2">
              <span className="animate-pulse">⚠</span> ERR: {error}
            </p>
          )}
        </div>
      </div>

      <div className="w-full flex justify-center items-center min-h-[65px] [&>div]:mx-auto [&>div]:flex [&>div]:justify-center">
        {mounted && (
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setToken(token)}
            onExpire={() => setToken(null)}
            options={{ theme: "dark" }}
            className="mx-auto"
            style={{ margin: "0 auto" }}
          />
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={!token}
        className={`relative w-[60%] min-w-[240px] py-[15px] rounded-[4px] text-[13px] font-bold font-mono text-[#00FF41] uppercase border border-[#00FFFF] bg-[#050508]/80 shadow-[0_0_8px_#00FF41] transition-all overflow-hidden group flex justify-center items-center gap-[10px] ${
          !token ? "opacity-40 cursor-not-allowed grayscale" : "hover:scale-[1.02] active:scale-95"
        }`}
      >
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,65,0.1)_50%,transparent_100%)]" />
        <Zap className="w-4 h-4 fill-[#00FF41] z-10" /> 
        <span className="z-10 tracking-[2px]">{!token ? "VERIFYING HUMANITY..." : "INITIATE SOUL SCAN"}</span>
        <Zap className="w-4 h-4 fill-[#00FF41] z-10" />
      </button>

      <div className="flex flex-wrap gap-2 justify-center pt-[10px]">
        {["ON-CHAIN DATA", "AI ANALYSIS", "CYBER FATE"].map((tag) => (
          <span
            key={tag}
            className="text-[9px] font-mono px-3 py-1.5 rounded-[4px] uppercase tracking-[0.2em] bg-black/40 border border-[#00FFFF]/30 text-[#00FFFF]/70"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}