import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type {
	CreateSubscriptionRequest,
	SubscriptionListData,
	SubscriptionWithRelations,
	UpdateSubscriptionRequest,
} from "shared";
import { prisma } from "../db.js";
import { authenticate } from "../hooks/auth.js";
import { errorResponse, successResponse } from "../utils/response.js";

type PrismaSubscriptionWithRelations = Prisma.SubscriptionGetPayload<{
	include: { currency: true; category: true };
}>;

function toSubscriptionResponse(
	sub: PrismaSubscriptionWithRelations,
): SubscriptionWithRelations {
	return {
		id: sub.id,
		userId: sub.userId,
		name: sub.name,
		price: sub.price.toString(),
		currencyId: sub.currencyId,
		billingCycle: sub.billingCycle as SubscriptionWithRelations["billingCycle"],
		startDate: sub.startDate.toISOString().split("T")[0],
		nextRenewalDate: sub.nextRenewalDate.toISOString().split("T")[0],
		notifyBefore: sub.notifyBefore,
		isActive: sub.isActive,
		categoryId: sub.categoryId,
		createdAt: sub.createdAt.toISOString(),
		updatedAt: sub.updatedAt.toISOString(),
		currency: sub.currency
			? {
					id: sub.currency.id,
					code: sub.currency.code,
					name: sub.currency.name,
					createdAt: sub.currency.createdAt.toISOString(),
					updatedAt: sub.currency.updatedAt.toISOString(),
				}
			: null,
		category: sub.category
			? {
					id: sub.category.id,
					name: sub.category.name,
					createdAt: sub.category.createdAt.toISOString(),
					updatedAt: sub.category.updatedAt.toISOString(),
				}
			: null,
	};
}

export async function subscriptionRoutes(fastify: FastifyInstance) {
	fastify.addHook("preHandler", authenticate);

	// GET /api/subscriptions
	fastify.get("/", async (request, reply) => {
		const { userId } = request.user;

		const subscriptions = await prisma.subscription.findMany({
			where: { userId },
			include: { currency: true, category: true },
			orderBy: { createdAt: "desc" },
		});

		const data: SubscriptionListData = {
			subscriptions: subscriptions.map(toSubscriptionResponse),
			total: subscriptions.length,
		};

		return reply.send(successResponse(data));
	});

	// GET /api/subscriptions/:id
	fastify.get(
		"/:id",
		async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
			const { userId } = request.user;
			const { id } = request.params;

			const subscription = await prisma.subscription.findFirst({
				where: { id, userId },
				include: { currency: true, category: true },
			});

			if (!subscription) {
				return reply
					.status(404)
					.send(errorResponse("サブスクリプションが見つかりません"));
			}

			return reply.send(successResponse(toSubscriptionResponse(subscription)));
		},
	);

	// POST /api/subscriptions
	fastify.post(
		"/",
		async (
			request: FastifyRequest<{ Body: CreateSubscriptionRequest }>,
			reply,
		) => {
			const { userId } = request.user;
			const body = request.body;

			if (
				!body.name ||
				!body.price ||
				!body.billingCycle ||
				!body.startDate ||
				!body.nextRenewalDate
			) {
				return reply
					.status(400)
					.send(errorResponse("必須項目が不足しています"));
			}

			const subscription = await prisma.subscription.create({
				data: {
					userId,
					name: body.name,
					price: new Prisma.Decimal(body.price),
					currencyId: body.currencyId ?? null,
					billingCycle: body.billingCycle,
					startDate: new Date(body.startDate),
					nextRenewalDate: new Date(body.nextRenewalDate),
					notifyBefore: body.notifyBefore ?? 7,
					isActive: body.isActive ?? true,
					categoryId: body.categoryId ?? null,
				},
				include: { currency: true, category: true },
			});

			return reply
				.status(201)
				.send(successResponse(toSubscriptionResponse(subscription)));
		},
	);

	// PUT /api/subscriptions/:id
	fastify.put(
		"/:id",
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Body: UpdateSubscriptionRequest;
			}>,
			reply,
		) => {
			const { userId } = request.user;
			const { id } = request.params;
			const body = request.body;

			const existing = await prisma.subscription.findFirst({
				where: { id, userId },
			});

			if (!existing) {
				return reply
					.status(404)
					.send(errorResponse("サブスクリプションが見つかりません"));
			}

			const updateData: Prisma.SubscriptionUpdateInput = {};
			if (body.name !== undefined) updateData.name = body.name;
			if (body.price !== undefined)
				updateData.price = new Prisma.Decimal(body.price);
			if (body.currencyId !== undefined)
				updateData.currency =
					body.currencyId !== null
						? { connect: { id: body.currencyId } }
						: { disconnect: true };
			if (body.billingCycle !== undefined)
				updateData.billingCycle = body.billingCycle;
			if (body.startDate !== undefined)
				updateData.startDate = new Date(body.startDate);
			if (body.nextRenewalDate !== undefined)
				updateData.nextRenewalDate = new Date(body.nextRenewalDate);
			if (body.notifyBefore !== undefined)
				updateData.notifyBefore = body.notifyBefore;
			if (body.isActive !== undefined) updateData.isActive = body.isActive;
			if (body.categoryId !== undefined)
				updateData.category =
					body.categoryId !== null
						? { connect: { id: body.categoryId } }
						: { disconnect: true };

			const subscription = await prisma.subscription.update({
				where: { id },
				data: updateData,
				include: { currency: true, category: true },
			});

			return reply.send(successResponse(toSubscriptionResponse(subscription)));
		},
	);

	// DELETE /api/subscriptions/:id
	fastify.delete(
		"/:id",
		async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
			const { userId } = request.user;
			const { id } = request.params;

			const existing = await prisma.subscription.findFirst({
				where: { id, userId },
			});

			if (!existing) {
				return reply
					.status(404)
					.send(errorResponse("サブスクリプションが見つかりません"));
			}

			await prisma.subscription.delete({ where: { id } });

			return reply.send(successResponse({ message: "削除しました" }));
		},
	);
}
