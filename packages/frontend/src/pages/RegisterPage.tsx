import {
	Alert,
	Anchor,
	Button,
	Container,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { register, error, loading } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await register(email, password);
		if (success) {
			navigate("/");
		}
	};

	return (
		<Container size={420} my={40}>
			<Title order={1} ta="center" fz="h2">
				新規登録
			</Title>
			<Paper withBorder shadow="sm" p="lg" mt="lg" radius="md">
				<form onSubmit={handleSubmit}>
					<Stack>
						<TextInput
							label="メールアドレス"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.currentTarget.value)}
							required
						/>
						<PasswordInput
							label="パスワード（8文字以上）"
							value={password}
							onChange={(e) => setPassword(e.currentTarget.value)}
							minLength={8}
							required
						/>
						{error && (
							<Alert color="red" variant="light">
								{error}
							</Alert>
						)}
						<Button type="submit" loading={loading} fullWidth>
							登録する
						</Button>
					</Stack>
				</form>
			</Paper>
			<Text ta="center" mt="md" size="sm">
				すでにアカウントをお持ちの方は{" "}
				<Anchor component={Link} to="/login">
					ログイン
				</Anchor>
			</Text>
		</Container>
	);
}
