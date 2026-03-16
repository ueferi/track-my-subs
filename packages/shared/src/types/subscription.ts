import type { BillingCycle, SubscriptionWithRelations } from "./entity.js";

/** サブスクリプション作成リクエスト */
export interface CreateSubscriptionRequest {
	name: string;
	price: string;
	currencyId?: number | null;
	billingCycle: BillingCycle;
	startDate: string;
	nextRenewalDate: string;
	notifyBefore?: number;
	isActive?: boolean;
	categoryId?: number | null;
}

/** サブスクリプション更新リクエスト（全フィールド任意） */
export interface UpdateSubscriptionRequest {
	name?: string;
	price?: string;
	currencyId?: number | null;
	billingCycle?: BillingCycle;
	startDate?: string;
	nextRenewalDate?: string;
	notifyBefore?: number;
	isActive?: boolean;
	categoryId?: number | null;
}

/** サブスクリプション一覧レスポンスのデータ部分 */
export interface SubscriptionListData {
	subscriptions: SubscriptionWithRelations[];
	total: number;
}
