import { useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BillingCycle, Category, Currency } from "shared";
import { categoriesApi } from "../api/categories.js";
import { currenciesApi } from "../api/currencies.js";
import { subscriptionsApi } from "../api/subscriptions.js";
import styles from "./SubscriptionFormPage.module.css";

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

	const uid = useId();
	const nameId = `${uid}-name`;
	const priceId = `${uid}-price`;
	const currencyId = `${uid}-currencyId`;
	const billingCycleId = `${uid}-billingCycle`;
	const startDateId = `${uid}-startDate`;
	const nextRenewalDateId = `${uid}-nextRenewalDate`;
	const categoryIdId = `${uid}-categoryId`;
	const notifyBeforeId = `${uid}-notifyBefore`;
	const isActiveId = `${uid}-isActive`;

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

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		if (type === "checkbox") {
			setValues((prev) => ({
				...prev,
				[name]: (e.target as HTMLInputElement).checked,
			}));
		} else {
			setValues((prev) => ({ ...prev, [name]: value }));
		}
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

	if (loading) return <p>読み込み中...</p>;

	return (
		<div className={styles.container}>
			<h1>
				{isEdit ? "サブスクリプションを編集" : "サブスクリプションを追加"}
			</h1>

			{error && <p className={styles.error}>{error}</p>}

			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.field}>
					<label htmlFor={nameId}>サービス名</label>
					<input
						id={nameId}
						name="name"
						type="text"
						value={values.name}
						onChange={handleChange}
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={priceId}>金額</label>
					<input
						id={priceId}
						name="price"
						type="text"
						inputMode="decimal"
						value={values.price}
						onChange={handleChange}
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={currencyId}>通貨</label>
					<select
						id={currencyId}
						name="currencyId"
						value={values.currencyId}
						onChange={handleChange}
					>
						<option value="">選択してください</option>
						{currencies.map((c) => (
							<option key={c.id} value={String(c.id)}>
								{c.code} - {c.name}
							</option>
						))}
					</select>
				</div>

				<div className={styles.field}>
					<label htmlFor={billingCycleId}>請求サイクル</label>
					<select
						id={billingCycleId}
						name="billingCycle"
						value={values.billingCycle}
						onChange={handleChange}
						required
					>
						<option value="monthly">月額</option>
						<option value="yearly">年額</option>
					</select>
				</div>

				<div className={styles.field}>
					<label htmlFor={startDateId}>開始日</label>
					<input
						id={startDateId}
						name="startDate"
						type="date"
						value={values.startDate}
						onChange={handleChange}
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={nextRenewalDateId}>次回更新日</label>
					<input
						id={nextRenewalDateId}
						name="nextRenewalDate"
						type="date"
						value={values.nextRenewalDate}
						onChange={handleChange}
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={categoryIdId}>カテゴリ</label>
					<select
						id={categoryIdId}
						name="categoryId"
						value={values.categoryId}
						onChange={handleChange}
					>
						<option value="">選択してください</option>
						{categories.map((c) => (
							<option key={c.id} value={String(c.id)}>
								{c.name}
							</option>
						))}
					</select>
				</div>

				<div className={styles.field}>
					<label htmlFor={notifyBeforeId}>更新通知（日前）</label>
					<input
						id={notifyBeforeId}
						name="notifyBefore"
						type="number"
						min="0"
						max="30"
						value={values.notifyBefore}
						onChange={handleChange}
						required
					/>
				</div>

				<div className={styles.fieldInline}>
					<input
						id={isActiveId}
						name="isActive"
						type="checkbox"
						checked={values.isActive}
						onChange={handleChange}
					/>
					<label htmlFor={isActiveId}>有効</label>
				</div>

				<div className={styles.actions}>
					<button
						type="button"
						onClick={() => navigate("/")}
						disabled={submitting}
					>
						キャンセル
					</button>
					<button type="submit" disabled={submitting}>
						{submitting ? "保存中..." : isEdit ? "更新する" : "登録する"}
					</button>
				</div>
			</form>
		</div>
	);
}
