import { testConnection } from "./db";

// DB接続をテスト
testConnection()
	.then((success) => {
		process.exit(success ? 0 : 1);
	})
	.catch((error) => {
		console.error("Error:", error);
		process.exit(1);
	});
