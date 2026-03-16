import type {
	CreateSubscriptionRequest,
	SubscriptionListData,
	SubscriptionWithRelations,
	UpdateSubscriptionRequest,
} from "shared";
import { apiClient } from "./client.js";

export const subscriptionsApi = {
	list: () => apiClient.get<SubscriptionListData>("/api/subscriptions"),
	get: (id: string) =>
		apiClient.get<SubscriptionWithRelations>(`/api/subscriptions/${id}`),
	create: (body: CreateSubscriptionRequest) =>
		apiClient.post<SubscriptionWithRelations>("/api/subscriptions", body),
	update: (id: string, body: UpdateSubscriptionRequest) =>
		apiClient.put<SubscriptionWithRelations>(`/api/subscriptions/${id}`, body),
	delete: (id: string) =>
		apiClient.delete<{ message: string }>(`/api/subscriptions/${id}`),
};
