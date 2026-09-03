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

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, error, loading } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await login(email, password);
		if (success) {
			navigate("/");
		}
	};

	return (
		<Container size={420} my={40}>
			<Title order={1} ta="center" fz="h2">
				ログイン
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
							label="パスワード"
							value={password}
							onChange={(e) => setPassword(e.currentTarget.value)}
							required
						/>
						{error && (
							<Alert color="red" variant="light">
								{error}
							</Alert>
						)}
						<Button type="submit" loading={loading} fullWidth>
							ログイン
						</Button>
					</Stack>
				</form>
			</Paper>
			<Text ta="center" mt="md" size="sm">
				アカウントをお持ちでない方は{" "}
				<Anchor component={Link} to="/register">
					新規登録
				</Anchor>
			</Text>
		</Container>
	);
}
