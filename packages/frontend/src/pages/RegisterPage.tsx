import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import styles from "./AuthPage.module.css";

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
		<div className={styles.container}>
			<div className={styles.card}>
				<h1 className={styles.title}>新規登録</h1>
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
							パスワード（8文字以上）
						</label>
						<input
							className={styles.input}
							id={passwordId}
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							minLength={8}
							required
						/>
					</div>
					{error && <p className={styles.error}>{error}</p>}
					<button className={styles.button} type="submit" disabled={loading}>
						{loading ? "登録中..." : "登録する"}
					</button>
				</form>
				<p className={styles.footer}>
					すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
				</p>
			</div>
		</div>
	);
}
