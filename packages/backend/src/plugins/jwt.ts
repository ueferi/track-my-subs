import jwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function jwtPlugin(fastify: FastifyInstance) {
	await fastify.register(jwt, {
		secret: process.env.JWT_SECRET || "default-secret-change-me",
		sign: {
			expiresIn: "7d",
		},
	});
}

export default fp(jwtPlugin);
