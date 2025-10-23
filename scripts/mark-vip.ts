import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as path from 'path';

// 加载环境变量
config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function main() {
  console.log('开始标记VIP剧集...');

  // 获取所有剧集
  const allDramas = await prisma.drama.findMany({
    select: { id: true }
  });

  console.log(`总剧集数: ${allDramas.length}`);

  // 随机选择30%的剧集标记为VIP
  const vipCount = Math.floor(allDramas.length * 0.3);
  console.log(`将标记 ${vipCount} 部剧集为VIP`);

  // 随机打乱数组
  const shuffled = allDramas.sort(() => Math.random() - 0.5);
  const vipDramas = shuffled.slice(0, vipCount);

  // 批量更新
  const vipIds = vipDramas.map(d => d.id);
  
  await prisma.drama.updateMany({
    where: {
      id: {
        in: vipIds
      }
    },
    data: {
      isVip: true
    }
  });

  console.log(`\n✅ 成功标记 ${vipCount} 部剧集为VIP！`);
  
  // 验证
  const vipDramaCount = await prisma.drama.count({
    where: { isVip: true }
  });
  
  console.log(`当前VIP剧集总数: ${vipDramaCount}`);
}

main()
  .catch((e) => {
    console.error('标记VIP失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
