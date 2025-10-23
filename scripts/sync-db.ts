import dotenv from 'dotenv';
import { execSync } from 'child_process';

// 加载环境变量
dotenv.config({ path: '.env.local' });

console.log('🔄 同步数据库schema...\n');

try {
  console.log('1️⃣ 生成Prisma客户端...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n2️⃣ 推送schema到数据库...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ 数据库同步成功！');
} catch (error) {
  console.error('\n❌ 数据库同步失败:', error);
  process.exit(1);
}
