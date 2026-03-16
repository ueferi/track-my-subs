import type { FastifyReply, FastifyRequest } from "fastify";

/** JWT認証を要求するpreHandlerフック */
export async function authenticate(
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> {
	try {
		await request.jwtVerify();
	} catch {
		reply.status(401).send({ success: false, error: "認証が必要です" });
	}
}
