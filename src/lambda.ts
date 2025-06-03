import { APIGatewayProxyEventV2 } from "aws-lambda"
import { ResponseStream, streamifyResponse } from "lambda-stream"
import SuperJSON from "superjson"
import { AIServiceInstance } from "./ai.service"
import { LambdaInput } from "./types"

const _handler = async (event: APIGatewayProxyEventV2, responseStream: ResponseStream): Promise<void> => {
	responseStream.setContentType("application/json")
	const apiKey = event.headers["x-api-key"]
	const inputs: LambdaInput[] = JSON.parse(event.body)

	console.log("inputs", inputs)

	if (!apiKey) {
		responseStream.destroy(new Error("API Key missing"))

		// return {
		// 	statusCode: 401,
		// 	body: JSON.stringify({ message: "API Key missing" }),
		// }
	}

	const AIService = new AIServiceInstance({ apiKey })

	const responses = await Promise.all(
		inputs.map(async input => {
			// Generate text
			if (!input.jsonSchema) {
				return await AIService.getCompletion(input)
			}

			// Generate object
			else {
				return await AIService.getStructuredCompletion(input)
			}
		}),
	)

	console.log("responses", responses)

	const superJson = SuperJSON.stringify(responses.map(response => ({ ...response })))

	responseStream.write(superJson)
	responseStream.end()

	// return {
	// 	statusCode: 200,
	// 	body: superJson,
	// }
}

export const handler = streamifyResponse(_handler)
