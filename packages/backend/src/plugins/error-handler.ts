import type { FastifyError, FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { errorResponse } from "../utils/response.js";

async function errorHandlerPlugin(fastify: FastifyInstance) {
	fastify.setErrorHandler((error: FastifyError, _request, reply) => {
		const statusCode = error.statusCode ?? 500;

		if (statusCode === 401) {
			return reply.status(401).send(errorResponse("認証が必要です"));
		}

		if (statusCode >= 400 && statusCode < 500) {
			return reply.status(statusCode).send(errorResponse(error.message));
		}

		fastify.log.error(error);
		return reply
			.status(500)
			.send(errorResponse("サーバーエラーが発生しました"));
	});
}

export default fp(errorHandlerPlugin);
