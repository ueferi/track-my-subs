import type { Currency } from "shared";
import { apiClient } from "./client.js";

export const currenciesApi = {
	list: () => apiClient.get<Currency[]>("/api/currencies"),
};
