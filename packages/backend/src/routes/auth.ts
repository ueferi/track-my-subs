import bcrypt from "bcrypt";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { AuthResponse, LoginRequest, RegisterRequest } from "shared";
import { prisma } from "../db.js";
import { errorResponse, successResponse } from "../utils/response.js";

const SALT_ROUNDS = 10;

export async function authRoutes(fastify: FastifyInstance) {
	// POST /api/auth/register
	fastify.post(
		"/register",
		async (request: FastifyRequest<{ Body: RegisterRequest }>, reply) => {
			const { email, password } = request.body;

			if (!email || !password) {
				return reply
					.status(400)
					.send(errorResponse("メールアドレスとパスワードは必須です"));
			}

			if (password.length < 8) {
				return reply
					.status(400)
					.send(errorResponse("パスワードは8文字以上で入力してください"));
			}

			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				return reply
					.status(409)
					.send(errorResponse("このメールアドレスは既に登録されています"));
			}

			const passwordDigest = await bcrypt.hash(password, SALT_ROUNDS);
			const user = await prisma.user.create({
				data: { email, passwordDigest },
			});

			const token = fastify.jwt.sign({ userId: user.id });

			const responseData: AuthResponse = {
				user: {
					id: user.id,
					email: user.email,
					createdAt: user.createdAt.toISOString(),
					updatedAt: user.updatedAt.toISOString(),
				},
				token,
			};

			return reply.status(201).send(successResponse(responseData));
		},
	);

	// POST /api/auth/login
	fastify.post(
		"/login",
		async (request: FastifyRequest<{ Body: LoginRequest }>, reply) => {
			const { email, password } = request.body;

			if (!email || !password) {
				return reply
					.status(400)
					.send(errorResponse("メールアドレスとパスワードは必須です"));
			}

			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				return reply
					.status(401)
					.send(
						errorResponse("メールアドレスまたはパスワードが正しくありません"),
					);
			}

			const passwordMatch = await bcrypt.compare(password, user.passwordDigest);

			if (!passwordMatch) {
				return reply
					.status(401)
					.send(
						errorResponse("メールアドレスまたはパスワードが正しくありません"),
					);
			}

			const token = fastify.jwt.sign({ userId: user.id });

			const responseData: AuthResponse = {
				user: {
					id: user.id,
					email: user.email,
					createdAt: user.createdAt.toISOString(),
					updatedAt: user.updatedAt.toISOString(),
				},
				token,
			};

			return reply.send(successResponse(responseData));
		},
	);
}
