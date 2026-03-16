import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, error, loading } = useAuth();
	const navigate = useNavigate();
	const emailId = useId();
	const passwordId = useId();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await login(email, password);
		if (success) {
			navigate("/");
		}
	};

	return (
		<div>
			<h1>ログイン</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor={emailId}>メールアドレス</label>
					<input
						id={emailId}
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor={passwordId}>パスワード</label>
					<input
						id={passwordId}
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				{error && <p>{error}</p>}
				<button type="submit" disabled={loading}>
					{loading ? "ログイン中..." : "ログイン"}
				</button>
			</form>
			<p>
				アカウントをお持ちでない方は <a href="/register">新規登録</a>
			</p>
		</div>
	);
}
