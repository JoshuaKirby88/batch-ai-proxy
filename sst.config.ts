/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "batch-ai-proxy",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: {
				aws: {
					region: "us-east-1",
				},
			},
		}
	},
	async run() {
		new sst.aws.Function("MainFunction", {
			handler: "src/lambda.handler",
			runtime: "nodejs22.x",
			memory: "3000 MB",
			timeout: "900 seconds",
			url: true,
			architecture: "arm64",
		})
	},
})
