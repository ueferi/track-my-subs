import Fastify from "fastify";
import corsPlugin from "./plugins/cors.js";
import errorHandlerPlugin from "./plugins/error-handler.js";
import jwtPlugin from "./plugins/jwt.js";
import { authRoutes } from "./routes/auth.js";

export function buildApp() {
	const fastify = Fastify({
		logger: true,
	});

	// プラグイン登録
	fastify.register(corsPlugin);
	fastify.register(jwtPlugin);
	fastify.register(errorHandlerPlugin);

	// ルート登録
	fastify.register(authRoutes, { prefix: "/api/auth" });

	// ヘルスチェック
	fastify.get("/api/health", async () => {
		return { success: true, data: { status: "ok" } };
	});

	return fastify;
}
