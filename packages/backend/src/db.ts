import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// DB接続テスト
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // テーブル数を確認
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    console.log(`📊 Found ${tables.length} tables:`, tables.map(t => t.tablename));

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
