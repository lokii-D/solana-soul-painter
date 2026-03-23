import './globals.css' // 💡 就是缺了这一行！网页没穿衣服！

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}