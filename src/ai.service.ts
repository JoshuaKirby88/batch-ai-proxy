import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { LanguageModelV1, generateObject, generateText } from "ai"
import jsonSchemaToZod from "json-schema-to-zod"
import * as z from "zod"
import { LambdaInput } from "./types"

export class AIServiceInstance {
	private models

	constructor(input: { apiKey: string }) {
		this.models = {
			"openai.chat": createOpenAI({ apiKey: input.apiKey }),
			"google.generative-ai": createGoogleGenerativeAI({ apiKey: input.apiKey }),
			"anthropic.messages": createAnthropic({ apiKey: input.apiKey }),
		}
	}

	getModel(input: Pick<LambdaInput, "provider" | "modelId">): LanguageModelV1 {
		return this.models[input.provider](input.modelId)
	}

	async getCompletion(input: LambdaInput) {
		const result = await generateText({
			model: this.getModel(input),
			messages: input.messages,
		})

		return result
	}

	async getStructuredCompletion(input: LambdaInput) {
		const result = await generateObject({
			model: this.getModel(input),
			messages: input.messages,
			schema: new Function("z", `return (${jsonSchemaToZod(input.jsonSchema)})`)(z),
		})

		return result
	}
}
