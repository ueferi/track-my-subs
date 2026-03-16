import type { Category } from "shared";
import { apiClient } from "./client.js";

export const categoriesApi = {
	list: () => apiClient.get<Category[]>("/api/categories"),
};
