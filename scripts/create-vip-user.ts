import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const phone = '18580025675';
  const password = '123456';
  const email = `${phone}@test.com`;
  
  console.log('🚀 为用户设置VIP会员...\n');
  console.log(`📱 手机号: ${phone}`);

  try {
    // 计算1年后的日期
    const vipExpireDate = new Date();
    vipExpireDate.setFullYear(vipExpireDate.getFullYear() + 1);

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        isVip: true,
        vipExpireAt: vipExpireDate
      },
      create: {
        email,
        password: hashedPassword,
        name: phone,
        isVip: true,
        vipExpireAt: vipExpireDate
      }
    });

    console.log('✅ VIP会员设置成功！');
    console.log(`   用户ID: ${user.id}`);
    console.log(`   手机号: ${phone}`);
    console.log(`   密码: ${password}`);
    console.log(`   VIP到期: ${vipExpireDate.toLocaleDateString('zh-CN')}`);
    console.log(`   剩余天数: 365天\n`);

  } catch (error) {
    console.error('❌ 操作失败:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
