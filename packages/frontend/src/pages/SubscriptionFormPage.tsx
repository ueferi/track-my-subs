import {
	Alert,
	Button,
	Checkbox,
	Container,
	Group,
	Loader,
	NumberInput,
	Select,
	Stack,
	TextInput,
	Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BillingCycle, Category, Currency } from "shared";
import { categoriesApi } from "../api/categories.js";
import { currenciesApi } from "../api/currencies.js";
import { subscriptionsApi } from "../api/subscriptions.js";

interface FormValues {
	name: string;
	price: string;
	currencyId: string;
	billingCycle: BillingCycle;
	startDate: string;
	nextRenewalDate: string;
	notifyBefore: string;
	isActive: boolean;
	categoryId: string;
}

const defaultValues: FormValues = {
	name: "",
	price: "",
	currencyId: "",
	billingCycle: "monthly",
	startDate: "",
	nextRenewalDate: "",
	notifyBefore: "3",
	isActive: true,
	categoryId: "",
};

const billingCycleOptions = [
	{ value: "monthly", label: "月額" },
	{ value: "yearly", label: "年額" },
];

export function SubscriptionFormPage() {
	const { id } = useParams<{ id: string }>();
	const isEdit = id !== undefined;
	const navigate = useNavigate();

	const [values, setValues] = useState<FormValues>(defaultValues);
	const [categories, setCategories] = useState<Category[]>([]);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(isEdit);

	useEffect(() => {
		const fetchMeta = async () => {
			const [catResult, curResult] = await Promise.all([
				categoriesApi.list(),
				currenciesApi.list(),
			]);
			if (catResult.success) setCategories(catResult.data);
			if (curResult.success) setCurrencies(curResult.data);
		};
		fetchMeta();
	}, []);

	useEffect(() => {
		if (!isEdit || !id) return;

		const fetchSubscription = async () => {
			const result = await subscriptionsApi.get(id);
			setLoading(false);

			if (!result.success) {
				setError(result.error);
				return;
			}

			const sub = result.data;
			setValues({
				name: sub.name,
				price: sub.price,
				currencyId: sub.currencyId !== null ? String(sub.currencyId) : "",
				billingCycle: sub.billingCycle,
				startDate: sub.startDate,
				nextRenewalDate: sub.nextRenewalDate,
				notifyBefore: String(sub.notifyBefore),
				isActive: sub.isActive,
				categoryId: sub.categoryId !== null ? String(sub.categoryId) : "",
			});
		};

		fetchSubscription();
	}, [id, isEdit]);

	const setField = <K extends keyof FormValues>(
		key: K,
		value: FormValues[K],
	) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);

		const payload = {
			name: values.name,
			price: values.price,
			currencyId: values.currencyId ? Number(values.currencyId) : null,
			billingCycle: values.billingCycle,
			startDate: values.startDate,
			nextRenewalDate: values.nextRenewalDate,
			notifyBefore: Number(values.notifyBefore),
			isActive: values.isActive,
			categoryId: values.categoryId ? Number(values.categoryId) : null,
		};

		const result =
			isEdit && id
				? await subscriptionsApi.update(id, payload)
				: await subscriptionsApi.create(payload);

		setSubmitting(false);

		if (!result.success) {
			setError(result.error);
			return;
		}

		navigate("/");
	};

	if (loading) {
		return (
			<Container size="sm" my="xl">
				<Group justify="center">
					<Loader />
				</Group>
			</Container>
		);
	}

	return (
		<Container size="sm" my="xl">
			<Title order={1} fz="h2" mb="lg">
				{isEdit ? "サブスクリプションを編集" : "サブスクリプションを追加"}
			</Title>

			{error && (
				<Alert color="red" variant="light" mb="md">
					{error}
				</Alert>
			)}

			<form onSubmit={handleSubmit}>
				<Stack>
					<TextInput
						label="サービス名"
						value={values.name}
						onChange={(e) => setField("name", e.currentTarget.value)}
						required
					/>

					<TextInput
						label="金額"
						inputMode="decimal"
						value={values.price}
						onChange={(e) => setField("price", e.currentTarget.value)}
						required
					/>

					<Select
						label="通貨"
						placeholder="選択してください"
						data={currencies.map((c) => ({
							value: String(c.id),
							label: `${c.code} - ${c.name}`,
						}))}
						value={values.currencyId || null}
						onChange={(v) => setField("currencyId", v ?? "")}
						clearable
					/>

					<Select
						label="請求サイクル"
						data={billingCycleOptions}
						value={values.billingCycle}
						onChange={(v) => {
							if (v) setField("billingCycle", v as BillingCycle);
						}}
						allowDeselect={false}
						required
					/>

					<DatePickerInput
						label="開始日"
						placeholder="日付を選択"
						value={values.startDate || null}
						onChange={(v) => setField("startDate", v ?? "")}
						valueFormat="YYYY-MM-DD"
						required
					/>

					<DatePickerInput
						label="次回更新日"
						placeholder="日付を選択"
						value={values.nextRenewalDate || null}
						onChange={(v) => setField("nextRenewalDate", v ?? "")}
						valueFormat="YYYY-MM-DD"
						required
					/>

					<Select
						label="カテゴリ"
						placeholder="選択してください"
						data={categories.map((c) => ({
							value: String(c.id),
							label: c.name,
						}))}
						value={values.categoryId || null}
						onChange={(v) => setField("categoryId", v ?? "")}
						clearable
					/>

					<NumberInput
						label="更新通知（日前）"
						description="※ 現在この設定は保存のみで、メール通知の送信機能は開発中です"
						min={0}
						max={30}
						value={
							values.notifyBefore === "" ? "" : Number(values.notifyBefore)
						}
						onChange={(v) =>
							setField("notifyBefore", v === "" ? "" : String(v))
						}
						required
					/>

					<Checkbox
						label="有効"
						checked={values.isActive}
						onChange={(e) => setField("isActive", e.currentTarget.checked)}
					/>

					<Group justify="flex-end">
						<Button
							variant="default"
							onClick={() => navigate("/")}
							disabled={submitting}
						>
							キャンセル
						</Button>
						<Button type="submit" loading={submitting}>
							{isEdit ? "更新する" : "登録する"}
						</Button>
					</Group>
				</Stack>
			</form>
		</Container>
	);
}
