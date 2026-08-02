import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function corsPlugin(fastify: FastifyInstance) {
	const origin = process.env.CORS_ORIGIN ?? true;
	await fastify.register(cors, {
		origin,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	});
}

export default fp(corsPlugin);
