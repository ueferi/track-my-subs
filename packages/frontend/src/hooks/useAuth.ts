import { useState } from "react";
import type { User } from "shared";
import { authApi } from "../api/auth.js";
import { removeToken, setToken } from "../api/client.js";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const register = async (email: string, password: string) => {
		setLoading(true);
		setError(null);
		const result = await authApi.register({ email, password });
		setLoading(false);

		if (!result.success) {
			setError(result.error);
			return false;
		}

		setToken(result.data.token);
		setUser(result.data.user);
		return true;
	};

	const login = async (email: string, password: string) => {
		setLoading(true);
		setError(null);
		const result = await authApi.login({ email, password });
		setLoading(false);

		if (!result.success) {
			setError(result.error);
			return false;
		}

		setToken(result.data.token);
		setUser(result.data.user);
		return true;
	};

	const logout = () => {
		removeToken();
		setUser(null);
	};

	return { user, error, loading, register, login, logout };
}
