import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Redis } from '@upstash/redis';

// 初始化 Redis
const redis = Redis.fromEnv();

// ==========================================
// 🛡️ 魔法 1：专门给 Twitter 爬虫看的信息 (Server Side)
// ==========================================
export async function generateMetadata({ params }: { params: { address: string } }): Promise<Metadata> {
  const address = params.address;
  const cacheKey = `soul_scan_${address}`;
  
  // 去 Redis 里把这个用户的算命结果捞出来
  const cachedData: any = await redis.get(cacheKey);

  // 如果找不到（比如过期了），就给一张默认的图
  if (!cachedData) {
    return {
      title: 'Solana Soul Painter | Scan Your Cyber Fate',
      description: 'Enter your SOL address to decrypt your on-chain archetype.',
    };
  }

  // 提取他专属的人格和头衔
  const { title, mbti, roast } = cachedData;

  // 拼接成你那个能自动生成图片的 API 链接
  // 注意：这里必须是你网站的绝对路径！
  const baseUrl = process.env.ALLOWED_ORIGIN || 'https://solana-soul-painter.vercel.app';
  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&mbti=${encodeURIComponent(mbti)}&roast=${encodeURIComponent(roast)}`;

  // 把它喂给推特爬虫！
  return {
    title: `My Solana Soul: ${title}`,
    description: `Alignment: ${mbti} | ${roast}`,
    openGraph: {
      images: [ogImageUrl],
    },
    twitter: {
      card: 'summary_large_image', // 告诉推特：我要展示大图卡片！
      images: [ogImageUrl],
    },
  };
}

// ==========================================
// 🛡️ 魔法 2：真实用户点进来怎么办？
// ==========================================
export default function SharePage() {
  // 爬虫只看上面的 metadata，不会执行这里的逻辑。
  // 但是真实的人类用户点开推特里的链接，会执行到这里，我们直接把他强行“传送”回首页去算命！
  redirect('/');
}