import type { FastifyInstance } from "fastify";
import type { Currency } from "shared";
import { prisma } from "../db.js";
import { successResponse } from "../utils/response.js";

export async function currencyRoutes(fastify: FastifyInstance) {
	// GET /api/currencies
	fastify.get("/", async (_request, reply) => {
		const currencies = await prisma.currency.findMany({
			orderBy: { code: "asc" },
		});

		const data: Currency[] = currencies.map((c) => ({
			id: c.id,
			code: c.code,
			name: c.name,
			createdAt: c.createdAt.toISOString(),
			updatedAt: c.updatedAt.toISOString(),
		}));

		return reply.send(successResponse(data));
	});
}
