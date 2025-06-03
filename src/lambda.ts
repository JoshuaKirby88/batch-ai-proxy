import { APIGatewayProxyEventV2 } from "aws-lambda"
import { ResponseStream, streamifyResponse } from "lambda-stream"
import SuperJSON from "superjson"
import { AIServiceInstance } from "./ai.service"
import { LambdaInput } from "./types"

const _handler = (event: APIGatewayProxyEventV2, responseStream: ResponseStream): Promise<void> => {
	return new Promise(async resolve => {
		try {
			const apiKey = event.headers["x-api-key"]
			const inputs: LambdaInput[] = JSON.parse(event.body)

			if (!apiKey) {
				throw new Error("API key is missing")
			}

			console.log("inputs", inputs)

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
			resolve()
		} catch (error) {
			console.log("error", error)

			const superJson = SuperJSON.stringify(error)
			console.log("superJson", superJson)
			responseStream.write(superJson)
			responseStream.end()
			resolve()
		}
	})
}

export const handler = streamifyResponse(_handler)
