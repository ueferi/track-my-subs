import type { FastifyInstance } from "fastify";
import type { Category } from "shared";
import { prisma } from "../db.js";
import { successResponse } from "../utils/response.js";

export async function categoryRoutes(fastify: FastifyInstance) {
	// GET /api/categories
	fastify.get("/", async (_request, reply) => {
		const categories = await prisma.category.findMany({
			orderBy: { name: "asc" },
		});

		const data: Category[] = categories.map((c) => ({
			id: c.id,
			name: c.name,
			createdAt: c.createdAt.toISOString(),
			updatedAt: c.updatedAt.toISOString(),
		}));

		return reply.send(successResponse(data));
	});
}
