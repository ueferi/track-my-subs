import {
	Alert,
	Button,
	Card,
	Container,
	Group,
	Loader,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
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

	const deleteSubscription = async (id: string) => {
		const result = await subscriptionsApi.delete(id);
		if (!result.success) {
			notifications.show({ color: "red", message: result.error });
			return;
		}

		setSubscriptions((prev) => prev.filter((s) => s.id !== id));
	};

	const handleDelete = (sub: SubscriptionWithRelations) => {
		modals.openConfirmModal({
			title: "サブスクリプションの削除",
			children: (
				<Text size="sm">
					「{sub.name}」を削除しますか？この操作は取り消せません。
				</Text>
			),
			labels: { confirm: "削除する", cancel: "キャンセル" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteSubscription(sub.id),
		});
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
			<Group justify="space-between" mb="lg">
				<Title order={1} fz="h2">
					サブスクリプション一覧
				</Title>
				{/* 操作ボタン領域（今後ログアウトボタンを追加予定） */}
				<Group gap="sm">
					<Button onClick={() => navigate("/subscriptions/new")}>
						+ 新規追加
					</Button>
				</Group>
			</Group>

			{error && (
				<Alert color="red" variant="light" mb="md">
					{error}
				</Alert>
			)}

			{subscriptions.length === 0 ? (
				<Text c="dimmed" ta="center" mt="xl">
					登録されているサブスクリプションはありません
				</Text>
			) : (
				<Stack gap="sm">
					{subscriptions.map((sub) => (
						<Card key={sub.id} withBorder radius="md" padding="md">
							<Group justify="space-between" wrap="nowrap">
								<Stack gap={4}>
									<Text fw={600}>{sub.name}</Text>
									<Text size="sm" c="dimmed">
										{sub.price}
										{sub.currency ? ` ${sub.currency.code}` : ""} /{" "}
										{sub.billingCycle === "monthly" ? "月額" : "年額"}
										{sub.category ? ` · ${sub.category.name}` : ""}
									</Text>
									<Text size="sm" c="dimmed">
										次回更新: {sub.nextRenewalDate}
									</Text>
								</Stack>
								<Group gap="xs" wrap="nowrap">
									<Button
										variant="default"
										size="xs"
										onClick={() => navigate(`/subscriptions/${sub.id}/edit`)}
									>
										編集
									</Button>
									<Button
										variant="light"
										color="red"
										size="xs"
										onClick={() => handleDelete(sub)}
									>
										削除
									</Button>
								</Group>
							</Group>
						</Card>
					))}
				</Stack>
			)}
		</Container>
	);
}
