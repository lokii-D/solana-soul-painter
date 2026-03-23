import { ImageResponse } from 'next/og';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

// 💡 锁定 Node.js 运行时，以支持 fs 本地文件读取
export const runtime = 'nodejs';

/**
 * 💡 核心修复：确保导出名称为大写的 GET
 * 无信息减损：保留所有动态背景切换逻辑、遮罩层、赛博文字排版
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. 获取参数 (保留所有原有字段)
    const title = (searchParams.get('title') || 'UNKNOWN ENTITY').toUpperCase();
    const mbti = (searchParams.get('mbti') || 'N/A').toUpperCase();
    const roast = searchParams.get('roast') || 'SYSTEM ERROR. DATA CORRUPTED.';

    // ==========================================
    // 💡 2. 动态背景判定逻辑 (全面扩充词库，捕获最新 AI 毒舌词汇)
    // ==========================================
    // ==========================================
    // 💡 2. 动态背景判定逻辑 (已为你扩充“超纲”词汇)
    // ==========================================
    let bgName = 'default.jpg';
    
    if (title.includes('EXIT') || title.includes('LIQUIDITY') || title.includes('REKT') || title.includes('BAGHOLDER') || title.includes('MARTYR') || title.includes('SLERF') || title.includes('BOME')) {
      bgName = 'rekt.jpg'; 
    } 
    else if (title.includes('WHALE') || title.includes('DIAMOND') || title.includes('GOD') || title.includes('BOOMER') || title.includes('YIELD') || title.includes('FARMER')) {
      bgName = 'whale.jpg'; 
    } 
    // 💡 在这里加上了 SPAMMER, BOT, SNIPER, MEV (高频刷子/机器人/垃圾制造者)
    else if (title.includes('DEGEN') || title.includes('GAMBLER') || title.includes('PAPER') || title.includes('FOMO') || title.includes('RAYDIUM') || title.includes('SWAP') || title.includes('ZOMBIE') || title.includes('PUMP') || title.includes('SPAMMER') || title.includes('BOT') || title.includes('SNIPER') || title.includes('MEV')) {
      bgName = 'degen.jpg'; 
    }
    else if (title.includes('GHOST') || title.includes('DUST') || title.includes('COLLECTOR') || title.includes('OBSERVER') || title.includes('DEAD') || title.includes('LURKER')) {
      bgName = 'ghost.jpg'; 
    }
    // ==========================================
    // 💡 3. 智能路径读取 (Base64 方案 + 强力容错降级)
    // ==========================================
    const projectRoot = process.cwd();
    // 提取为函数，方便复用
    const getPossiblePaths = (filename: string) => [
      join(projectRoot, 'public', 'bgs', filename),
      join(projectRoot, 'web-app', 'public', 'bgs', filename),
    ];

    let base64Image = '';
    
    // 第一步：尝试读取精准匹配的背景图
    for (const p of getPossiblePaths(bgName)) {
      if (existsSync(p)) {
        const imageBuffer = readFileSync(p);
        base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        break;
      }
    }

    // 第二步：容错降级 (如果匹配到了比如 ghost.jpg，但你忘了传这张图到文件夹，自动用 default.jpg 兜底)
    if (!base64Image && bgName !== 'default.jpg') {
      console.warn(`[OG Warning] Background ${bgName} not found, falling back to default.jpg`);
      for (const p of getPossiblePaths('default.jpg')) {
        if (existsSync(p)) {
          const imageBuffer = readFileSync(p);
          base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
          break;
        }
      }
    }

    // 4. 构建渲染响应 (严格遵守 Satori Flex 规范，完美保留你的排版与特效)
    return new ImageResponse(
      (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#050508',
          position: 'relative',
        }}>
          {/* 背景图层 */}
          {base64Image && (
            <img
              src={base64Image}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          {/* 赛博遮罩层 (无损保留原有透明度) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundColor: 'rgba(5, 5, 8, 0.7)',
            backgroundImage: 'linear-gradient(to bottom, rgba(5,5,8,0.4), rgba(5,5,8,0.95))'
          }} />

          {/* 前景内容区 (无损保留 Apple 式对称排版) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            height: '100%',
            width: '100%',
            position: 'relative',
            textAlign: 'center',
          }}>
            {/* 顶部标识 */}
            <div style={{ 
              display: 'flex', 
              color: '#00FFFF', 
              fontSize: 22, 
              letterSpacing: 6, 
              marginBottom: 'auto', 
              fontWeight: 'bold' 
            }}>
              // SOLANA SOUL PAINTER
            </div>
            
            {/* 结论标题与 MBTI (主视觉区域) */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              marginBottom: '40px' 
            }}>
              <div style={{ 
                display: 'flex',
                color: '#00FF41', 
                fontSize: 84, 
                fontWeight: 900, 
                letterSpacing: -2 
              }}>
                {title}
              </div>
              <div style={{ 
                display: 'flex',
                color: '#00FFFF', 
                fontSize: 24, 
                marginTop: 10, 
                letterSpacing: 4, 
                borderTop: '1px solid #00FFFF', 
                paddingTop: '10px' 
              }}>
                CLASS: {mbti}
              </div>
            </div>

            {/* 吐槽金句区 (保留红色边框效果) */}
            <div style={{ 
              display: 'flex', 
              color: '#FFFFFF', 
              fontSize: 32, 
              lineHeight: 1.5, 
              maxWidth: '900px',
              fontStyle: 'italic',
              borderLeft: '4px solid #FF0000',
              paddingLeft: '20px',
            }}>
              "{roast}"
            </div>

            {/* 底部随机码 */}
            <div style={{ 
              display: 'flex', 
              color: '#00FF41', 
              fontSize: 14, 
              marginTop: 'auto', 
              opacity: 0.5 
            }}>
              SYS_LOG // DECRYPT_SUCCESS // {Math.random().toString(36).substring(7).toUpperCase()}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("Critical OG Error:", e);
    return new Response(`OG_GENERATION_FAILED: ${e.message}`, { status: 500 });
  }
}