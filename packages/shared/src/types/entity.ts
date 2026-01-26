/** 請求サイクル */
export type BillingCycle = "monthly" | "yearly";

/** ユーザー（APIレスポンス用。パスワードは含まない） */
export interface User {
	id: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}

/** カテゴリ */
export interface Category {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
}

/** 通貨 */
export interface Currency {
	id: number;
	code: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

/** サブスクリプション */
export interface Subscription {
	id: string;
	userId: string;
	name: string;
	price: string;
	currencyId: number | null;
	billingCycle: BillingCycle;
	startDate: string;
	nextRenewalDate: string;
	notifyBefore: number;
	isActive: boolean;
	categoryId: number | null;
	createdAt: string;
	updatedAt: string;
}

/** サブスクリプション（リレーション付き） */
export interface SubscriptionWithRelations extends Subscription {
	currency: Currency | null;
	category: Category | null;
}
