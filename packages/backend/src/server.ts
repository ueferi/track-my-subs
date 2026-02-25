import "./types.js";
import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

async function start() {
	const app = buildApp();

	try {
		await app.listen({ port: PORT, host: HOST });
	} catch (error) {
		app.log.error(error);
		process.exit(1);
	}
}

start();
