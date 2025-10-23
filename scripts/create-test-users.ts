import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始创建测试用户...\n');

  // VIP用户数据
  const vipUser = {
    email: '13800138000@test.com',
    phone: '13800138000',
    password: '123456',
    name: 'VIP会员',
    isVip: true,
    vipExpireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年后过期
  };

  // 普通用户数据
  const normalUser = {
    email: '13900139000@test.com',
    phone: '13900139000',
    password: '123456',
    name: '普通用户',
    isVip: false,
    vipExpireAt: null
  };

  try {
    // 创建VIP用户
    console.log('👑 创建VIP用户...');
    const hashedPasswordVip = await bcrypt.hash(vipUser.password, 10);
    
    const createdVipUser = await prisma.user.upsert({
      where: { email: vipUser.email },
      update: {
        password: hashedPasswordVip,
        name: vipUser.name,
        isVip: vipUser.isVip,
        vipExpireAt: vipUser.vipExpireAt
      },
      create: {
        email: vipUser.email,
        password: hashedPasswordVip,
        name: vipUser.name,
        isVip: vipUser.isVip,
        vipExpireAt: vipUser.vipExpireAt
      }
    });

    console.log('✅ VIP用户创建成功:');
    console.log(`   ID: ${createdVipUser.id}`);
    console.log(`   手机号: ${vipUser.phone}`);
    console.log(`   密码: ${vipUser.password}`);
    console.log(`   VIP到期: ${vipUser.vipExpireAt.toLocaleDateString('zh-CN')}\n`);

    // 创建普通用户
    console.log('👤 创建普通用户...');
    const hashedPasswordNormal = await bcrypt.hash(normalUser.password, 10);
    
    const createdNormalUser = await prisma.user.upsert({
      where: { email: normalUser.email },
      update: {
        password: hashedPasswordNormal,
        name: normalUser.name,
        isVip: normalUser.isVip,
        vipExpireAt: normalUser.vipExpireAt
      },
      create: {
        email: normalUser.email,
        password: hashedPasswordNormal,
        name: normalUser.name,
        isVip: normalUser.isVip,
        vipExpireAt: normalUser.vipExpireAt
      }
    });

    console.log('✅ 普通用户创建成功:');
    console.log(`   ID: ${createdNormalUser.id}`);
    console.log(`   手机号: ${normalUser.phone}`);
    console.log(`   密码: ${normalUser.password}\n`);

    console.log('🎉 测试用户创建完成！\n');
    console.log('📝 登录信息：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 VIP用户:');
    console.log(`   手机号: ${vipUser.phone}`);
    console.log(`   密码: ${vipUser.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 普通用户:');
    console.log(`   手机号: ${normalUser.phone}`);
    console.log(`   密码: ${normalUser.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 创建用户失败:', error);
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
