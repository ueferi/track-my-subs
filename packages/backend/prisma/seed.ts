import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// カテゴリのシードデータ
	const categories = [
		"エンタメ",
		"音楽",
		"動画",
		"ゲーム",
		"クラウドストレージ",
		"ビジネス・生産性",
		"ニュース・情報",
		"学習・教育",
		"フィットネス・健康",
		"その他",
	];

	const categoryCount = await prisma.category.count();
	if (categoryCount === 0) {
		await prisma.category.createMany({
			data: categories.map((name) => ({ name })),
		});
	}

	// 通貨のシードデータ
	const currencies = [
		{ code: "JPY", name: "日本円" },
		{ code: "USD", name: "米ドル" },
		{ code: "EUR", name: "ユーロ" },
		{ code: "GBP", name: "英ポンド" },
		{ code: "AUD", name: "オーストラリアドル" },
		{ code: "CAD", name: "カナダドル" },
	];

	for (const currency of currencies) {
		await prisma.currency.upsert({
			where: { code: currency.code },
			update: {},
			create: currency,
		});
	}

	console.log("Seed completed.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
