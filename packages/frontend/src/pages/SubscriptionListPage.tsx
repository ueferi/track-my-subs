import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SubscriptionWithRelations } from "shared";
import { subscriptionsApi } from "../api/subscriptions.js";
import styles from "./SubscriptionListPage.module.css";

export function SubscriptionListPage() {
	const [subscriptions, setSubscriptions] = useState<
		SubscriptionWithRelations[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const fetchSubscriptions = useCallback(async () => {
		const result = await subscriptionsApi.list();
		setLoading(false);

		if (!result.success) {
			setError(result.error);
			if (result.error === "認証が必要です") {
				navigate("/login");
			}
			return;
		}

		setSubscriptions(result.data.subscriptions);
	}, [navigate]);

	useEffect(() => {
		fetchSubscriptions();
	}, [fetchSubscriptions]);

	const handleDelete = async (id: string) => {
		if (!window.confirm("このサブスクリプションを削除しますか？")) return;

		const result = await subscriptionsApi.delete(id);
		if (!result.success) {
			alert(result.error);
			return;
		}

		setSubscriptions((prev) => prev.filter((s) => s.id !== id));
	};

	if (loading) return <p>読み込み中...</p>;

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1>サブスクリプション一覧</h1>
				<button
					type="button"
					className={styles.addButton}
					onClick={() => navigate("/subscriptions/new")}
				>
					+ 新規追加
				</button>
			</div>

			{error && <p className={styles.error}>{error}</p>}

			{subscriptions.length === 0 ? (
				<p className={styles.empty}>
					登録されているサブスクリプションはありません
				</p>
			) : (
				<ul className={styles.list}>
					{subscriptions.map((sub) => (
						<li key={sub.id} className={styles.item}>
							<div className={styles.info}>
								<span className={styles.name}>{sub.name}</span>
								<span className={styles.meta}>
									{sub.price}
									{sub.currency ? ` ${sub.currency.code}` : ""} /{" "}
									{sub.billingCycle === "monthly" ? "月額" : "年額"}
									{sub.category ? ` · ${sub.category.name}` : ""}
								</span>
								<span className={styles.meta}>
									次回更新: {sub.nextRenewalDate}
								</span>
							</div>
							<div className={styles.itemActions}>
								<button
									type="button"
									className={styles.editButton}
									onClick={() => navigate(`/subscriptions/${sub.id}/edit`)}
								>
									編集
								</button>
								<button
									type="button"
									className={styles.deleteButton}
									onClick={() => handleDelete(sub.id)}
								>
									削除
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
