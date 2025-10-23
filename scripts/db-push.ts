import dotenv from 'dotenv';
import { execSync } from 'child_process';

// 加载环境变量
dotenv.config({ path: '.env.local' });

console.log('🔄 推送数据库schema...\n');

try {
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('\n✅ 数据库schema推送成功！');
} catch (error) {
  console.error('\n❌ 数据库schema推送失败:', error);
  process.exit(1);
}
