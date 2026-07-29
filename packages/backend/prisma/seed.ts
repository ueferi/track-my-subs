import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "Demo1234!";

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

	// デモアカウントのシードデータ
	const passwordDigest = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
	const demoUser = await prisma.user.upsert({
		where: { email: DEMO_EMAIL },
		update: {},
		create: {
			email: DEMO_EMAIL,
			passwordDigest,
		},
	});

	const categoryRecords = await prisma.category.findMany();
	const currencyRecords = await prisma.currency.findMany();

	const categoryIdByName = (name: string) =>
		categoryRecords.find((c) => c.name === name)?.id ?? null;
	const currencyIdByCode = (code: string) =>
		currencyRecords.find((c) => c.code === code)?.id ?? null;

	const demoSubscriptions = [
		{
			name: "Netflix",
			price: "1980",
			currencyCode: "JPY",
			billingCycle: "monthly",
			categoryName: "動画",
			startDate: "2024-01-15",
			nextRenewalDate: "2026-08-15",
			isActive: true,
		},
		{
			name: "Spotify",
			price: "980",
			currencyCode: "JPY",
			billingCycle: "monthly",
			categoryName: "音楽",
			startDate: "2023-06-01",
			nextRenewalDate: "2026-08-01",
			isActive: true,
		},
		{
			name: "iCloud+",
			price: "400",
			currencyCode: "JPY",
			billingCycle: "monthly",
			categoryName: "クラウドストレージ",
			startDate: "2023-03-10",
			nextRenewalDate: "2026-08-10",
			isActive: true,
		},
		{
			name: "Notion Plus",
			price: "10",
			currencyCode: "USD",
			billingCycle: "monthly",
			categoryName: "ビジネス・生産性",
			startDate: "2024-02-01",
			nextRenewalDate: "2026-08-01",
			isActive: true,
		},
		{
			name: "Udemy Personal Plan",
			price: "180",
			currencyCode: "USD",
			billingCycle: "yearly",
			categoryName: "学習・教育",
			startDate: "2024-05-20",
			nextRenewalDate: "2027-05-20",
			isActive: true,
		},
		{
			name: "Peloton App",
			price: "12.99",
			currencyCode: "USD",
			billingCycle: "monthly",
			categoryName: "フィットネス・健康",
			startDate: "2024-04-01",
			nextRenewalDate: "2026-08-01",
			isActive: true,
		},
		{
			name: "PlayStation Plus",
			price: "8600",
			currencyCode: "JPY",
			billingCycle: "yearly",
			categoryName: "ゲーム",
			startDate: "2023-11-01",
			nextRenewalDate: "2026-11-01",
			isActive: true,
		},
		{
			name: "The New York Times",
			price: "25",
			currencyCode: "USD",
			billingCycle: "monthly",
			categoryName: "ニュース・情報",
			startDate: "2024-07-01",
			nextRenewalDate: "2026-08-01",
			isActive: true,
		},
		{
			name: "旧クラウドストレージサービス",
			price: "500",
			currencyCode: "JPY",
			billingCycle: "monthly",
			categoryName: "その他",
			startDate: "2022-01-01",
			nextRenewalDate: "2026-01-01",
			isActive: false,
		},
	];

	for (const sub of demoSubscriptions) {
		const existing = await prisma.subscription.findFirst({
			where: { userId: demoUser.id, name: sub.name },
		});

		if (!existing) {
			await prisma.subscription.create({
				data: {
					userId: demoUser.id,
					name: sub.name,
					price: sub.price,
					currencyId: currencyIdByCode(sub.currencyCode),
					billingCycle: sub.billingCycle,
					startDate: new Date(sub.startDate),
					nextRenewalDate: new Date(sub.nextRenewalDate),
					isActive: sub.isActive,
					categoryId: categoryIdByName(sub.categoryName),
				},
			});
		}
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
