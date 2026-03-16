import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "./api/client.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { SubscriptionListPage } from "./pages/SubscriptionListPage.js";

/** 未ログイン専用ルート：ログイン済みなら / にリダイレクト */
function GuestRoute({ element }: { element: React.ReactElement }) {
	return isAuthenticated() ? <Navigate to="/" replace /> : element;
}

/** ログイン必須ルート：未ログインなら /login にリダイレクト */
function PrivateRoute({ element }: { element: React.ReactElement }) {
	return isAuthenticated() ? element : <Navigate to="/login" replace />;
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={<PrivateRoute element={<SubscriptionListPage />} />}
				/>
				<Route path="/login" element={<GuestRoute element={<LoginPage />} />} />
				<Route
					path="/register"
					element={<GuestRoute element={<RegisterPage />} />}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
