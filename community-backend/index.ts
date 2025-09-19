import config from "@/config/config";
import app from "@/server";

const server = app.listen(config.port, () => {
	const { nodeEnv, host, port } = config;
	console.log(`Server (${nodeEnv}) running on port http://${host}:${port}`);
});

const onCloseSignal = () => {
	console.log("sigint received, shutting down");
	server.close(() => {
		console.log("server closed");
		process.exit();
	});
	setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
