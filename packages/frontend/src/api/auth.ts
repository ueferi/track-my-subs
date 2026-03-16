import type { AuthResponse, LoginRequest, RegisterRequest } from "shared";
import { apiClient } from "./client.js";

export const authApi = {
	register: (body: RegisterRequest) =>
		apiClient.post<AuthResponse>("/api/auth/register", body),
	login: (body: LoginRequest) =>
		apiClient.post<AuthResponse>("/api/auth/login", body),
};
