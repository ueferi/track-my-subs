import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { register, error, loading } = useAuth();
	const navigate = useNavigate();
	const emailId = useId();
	const passwordId = useId();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await register(email, password);
		if (success) {
			navigate("/");
		}
	};

	return (
		<div>
			<h1>新規登録</h1>
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
					<label htmlFor={passwordId}>パスワード（8文字以上）</label>
					<input
						id={passwordId}
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						minLength={8}
						required
					/>
				</div>
				{error && <p>{error}</p>}
				<button type="submit" disabled={loading}>
					{loading ? "登録中..." : "登録する"}
				</button>
			</form>
			<p>
				すでにアカウントをお持ちの方は <a href="/login">ログイン</a>
			</p>
		</div>
	);
}
