import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import styles from "./AuthPage.module.css";

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
		<div className={styles.container}>
			<div className={styles.card}>
				<h1 className={styles.title}>ログイン</h1>
				<form onSubmit={handleSubmit}>
					<div className={styles.field}>
						<label className={styles.label} htmlFor={emailId}>
							メールアドレス
						</label>
						<input
							className={styles.input}
							id={emailId}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className={styles.field}>
						<label className={styles.label} htmlFor={passwordId}>
							パスワード
						</label>
						<input
							className={styles.input}
							id={passwordId}
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					{error && <p className={styles.error}>{error}</p>}
					<button className={styles.button} type="submit" disabled={loading}>
						{loading ? "ログイン中..." : "ログイン"}
					</button>
				</form>
				<p className={styles.footer}>
					アカウントをお持ちでない方は <Link to="/register">新規登録</Link>
				</p>
			</div>
		</div>
	);
}
