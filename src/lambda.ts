import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"
import SuperJSON from "superjson"
import { AIServiceInstance } from "./ai.service"
import { LambdaInput } from "./types"

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
	const apiKey = event.headers["x-api-key"]
	const inputs: LambdaInput[] = JSON.parse(event.body)

	console.log("inputs", inputs)

	if (!apiKey) {
		return {
			statusCode: 401,
			body: JSON.stringify({ message: "API Key missing" }),
		}
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

	return {
		statusCode: 200,
		body: superJson,
	}
}
