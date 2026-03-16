import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SubscriptionWithRelations } from "shared";
import { subscriptionsApi } from "../api/subscriptions.js";

export function SubscriptionListPage() {
	const [subscriptions, setSubscriptions] = useState<
		SubscriptionWithRelations[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchSubscriptions = async () => {
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
		};

		fetchSubscriptions();
	}, [navigate]);

	if (loading) return <p>読み込み中...</p>;
	if (error) return <p>{error}</p>;

	return (
		<div>
			<h1>サブスクリプション一覧</h1>
			<button type="button" onClick={() => navigate("/subscriptions/new")}>
				+ 新規追加
			</button>
			{subscriptions.length === 0 ? (
				<p>登録されているサブスクリプションはありません</p>
			) : (
				<ul>
					{subscriptions.map((sub) => (
						<li key={sub.id}>
							<span>{sub.name}</span>
							<span>¥{sub.price}</span>
							<span>{sub.billingCycle === "monthly" ? "月額" : "年額"}</span>
							<span>次回更新: {sub.nextRenewalDate}</span>
							<button
								type="button"
								onClick={() => navigate(`/subscriptions/${sub.id}/edit`)}
							>
								編集
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
