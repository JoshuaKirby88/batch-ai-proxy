import { CoreMessage } from "ai"
import { JSONSchema7 } from "json-schema"

export type LambdaInput = {
	provider: string
	modelId: string
	messages: CoreMessage[]
	jsonSchema: JSONSchema7 | undefined
}
