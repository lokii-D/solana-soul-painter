"use client"

import { useEffect, useRef } from "react"

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    
    // 💡 灵魂替换：去掉了日文，换成了 Web3 链上数据的“十六进制 + 二进制 + 终端符号”混编
    // 故意增加 0 和 1 的数量，让二进制流的感觉更强烈
    const chars = "0101010101ABCDEF0123456789$#/>_~|+-="
    const fontSize = 13
    let columns: number[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      const cols = Math.floor(canvas!.width / fontSize)
      columns = Array.from({ length: cols }, () => Math.random() * -100)
    }

    resize()
    window.addEventListener("resize", resize)

    function draw() {
      if (!ctx || !canvas) return
      // Fading trail (完美保留你的丝滑拖影算法)
      ctx.fillStyle = "rgba(5, 5, 8, 0.04)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`

      columns.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize

        // Bright leading char (完美保留你的头部爆闪白光+高亮绿算法)
        const brightness = Math.random()
        if (brightness > 0.98) {
          ctx.fillStyle = "#ffffff"
        } else if (brightness > 0.9) {
          ctx.fillStyle = "#00ff41"
        } else {
          ctx.fillStyle = `rgba(0, ${Math.floor(120 + Math.random() * 135)}, ${Math.floor(30 + Math.random() * 30)}, ${0.3 + Math.random() * 0.5})`
        }

        ctx.fillText(char, x, y * fontSize)

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          columns[i] = 0
        } else {
          columns[i] = y + 1
        }
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.18 }}
      aria-hidden="true"
    />
  )
}