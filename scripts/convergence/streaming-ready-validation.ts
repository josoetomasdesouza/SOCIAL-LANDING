import { strict as assert } from "node:assert"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const source = readFileSync(resolve(process.cwd(), "components/business/conversational-ai.tsx"), "utf8")

assert.match(source, /const \[isStreaming, setIsStreaming\] = useState\(false\)/)
assert.match(source, /const \[partialAssistantMessage, setPartialAssistantMessage\]/)
assert.match(source, /partialAssistantMessage \? \[\.\.\.messages, partialAssistantMessage\] : messages/)
assert.match(source, /const commitPartialAssistantMessage = useCallback/)
assert.match(source, /const clearPartialAssistantMessage = useCallback/)
assert.match(source, /disabled=\{!inputValue\.trim\(\) \|\| isTyping \|\| isStreaming\}/)

console.log("Streaming-ready validation: PASS")
