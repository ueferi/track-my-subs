import type { ApiResponse } from "shared";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function getToken(): string | null {
	return localStorage.getItem("token");
}

export function setToken(token: string): void {
	localStorage.setItem("token", token);
}

export function removeToken(): void {
	localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
	return getToken() !== null;
}

async function request<T>(
	path: string,
	options: RequestInit = {},
): Promise<ApiResponse<T>> {
	const token = getToken();

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers,
	});

	return response.json() as Promise<ApiResponse<T>>;
}

export const apiClient = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body: unknown) =>
		request<T>(path, { method: "POST", body: JSON.stringify(body) }),
	put: <T>(path: string, body: unknown) =>
		request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
	delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
