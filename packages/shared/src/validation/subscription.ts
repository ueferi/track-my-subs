import type { UpdateSubscriptionRequest } from "../types/index.js";

/** 金額の上限（DB の列 Decimal(10,2) に収まる最大値） */
export const MAX_PRICE = 99_999_999.99;
/** サービス名の最大文字数（DB の列 VarChar(255)） */
export const MAX_NAME_LENGTH = 255;
export const MIN_NOTIFY_BEFORE = 0;
export const MAX_NOTIFY_BEFORE = 30;

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

/** 各関数はエラーがあればメッセージを、なければ null を返す */
export const validateName = (name: unknown): string | null => {
	if (typeof name !== "string" || name === "") {
		return "サービス名を入力してください";
	}
	if (name.length > MAX_NAME_LENGTH) {
		return `サービス名は${MAX_NAME_LENGTH}文字以内で入力してください`;
	}
	return null;
};

export const validatePrice = (price: unknown): string | null => {
	if (typeof price !== "string" || price === "") {
		return "金額を入力してください";
	}
	if (!PRICE_PATTERN.test(price)) {
		return "金額は0以上の数値で、小数は第2位まで入力してください";
	}
	if (Number(price) > MAX_PRICE) {
		return "金額は99,999,999.99以下で入力してください";
	}
	return null;
};

export const validateNotifyBefore = (value: unknown): string | null =>
	typeof value === "number" &&
	Number.isInteger(value) &&
	value >= MIN_NOTIFY_BEFORE &&
	value <= MAX_NOTIFY_BEFORE
		? null
		: `更新通知は${MIN_NOTIFY_BEFORE}〜${MAX_NOTIFY_BEFORE}の整数で入力してください`;

type ValidatedFields = Pick<
	UpdateSubscriptionRequest,
	"name" | "price" | "notifyBefore"
>;

/** 送られてきた項目だけを検証し、最初に見つかったエラーを返す（API 用） */
export const validateSubscriptionFields = (
	input: {
		[K in keyof ValidatedFields]?: unknown;
	},
): string | null =>
	[
		input.name !== undefined ? validateName(input.name) : null,
		input.price !== undefined ? validatePrice(input.price) : null,
		input.notifyBefore !== undefined
			? validateNotifyBefore(input.notifyBefore)
			: null,
	].find((error) => error !== null) ?? null;
