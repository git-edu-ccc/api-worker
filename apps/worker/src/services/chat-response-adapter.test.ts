import { describe, expect, it, vi } from "vitest";

vi.mock("../wasm/core", () => ({
	adaptChatJsonViaWasm: vi.fn(() => null),
	adaptSseLineViaWasm: vi.fn((payload: Record<string, unknown>) => {
		const choices = Array.isArray(payload.choices)
			? (payload.choices as Record<string, unknown>[])
			: [];
		const firstChoice =
			choices[0] && typeof choices[0] === "object" ? choices[0] : null;
		const delta =
			firstChoice?.delta && typeof firstChoice.delta === "object"
				? (firstChoice.delta as Record<string, unknown>)
				: {};
		const usage =
			payload.usage && typeof payload.usage === "object"
				? (payload.usage as Record<string, unknown>)
				: {};
		const content = delta.content;
		const finishReason =
			typeof firstChoice?.finish_reason === "string"
				? firstChoice.finish_reason
				: null;
		return {
			text: typeof content === "string" ? content : "",
			stopReason: finishReason === "tool_calls" ? "tool_use" : finishReason,
			finishReason: null,
			eventType: null,
			outputTokens:
				typeof usage.completion_tokens === "number"
					? usage.completion_tokens
					: null,
		};
	}),
	geminiUsageTokensViaWasm: vi.fn(() => null),
}));

import { adaptChatResponse } from "./chat-response-adapter";

function createSseResponse(events: Array<Record<string, unknown>>): Response {
	const body = `${events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("")}data: [DONE]\n\n`;
	return new Response(body, {
		headers: {
			"content-type": "text/event-stream; charset=utf-8",
		},
	});
}

describe("adaptChatResponse", () => {
	it("将 OpenAI tool_calls 流式转换为 Anthropic tool_use 事件流", async () => {
		const response = createSseResponse([
			{
				id: "chatcmpl_tool",
				object: "chat.completion.chunk",
				choices: [
					{
						index: 0,
						delta: {
							role: "assistant",
							tool_calls: [
								{
									index: 0,
									id: "call_weather",
									type: "function",
									function: {
										name: "get_weather",
										arguments: "",
									},
								},
							],
						},
						finish_reason: null,
					},
				],
			},
			{
				id: "chatcmpl_tool",
				object: "chat.completion.chunk",
				choices: [
					{
						index: 0,
						delta: {
							tool_calls: [
								{
									index: 0,
									function: {
										arguments: '{"city":"Shang',
									},
								},
							],
						},
						finish_reason: null,
					},
				],
			},
			{
				id: "chatcmpl_tool",
				object: "chat.completion.chunk",
				choices: [
					{
						index: 0,
						delta: {
							tool_calls: [
								{
									index: 0,
									function: {
										arguments: 'hai"}',
									},
								},
							],
						},
						finish_reason: "tool_calls",
					},
				],
				usage: {
					completion_tokens: 12,
				},
			},
		]);

		const transformed = await adaptChatResponse({
			response,
			upstreamProvider: "openai",
			downstreamProvider: "anthropic",
			upstreamEndpoint: "chat",
			downstreamEndpoint: "chat",
			model: "gpt-4.1",
			isStream: true,
		});

		const text = await transformed.text();

		expect(text).toContain("event: message_start");
		expect(text).toContain('"type":"tool_use"');
		expect(text).toContain('"name":"get_weather"');
		expect(text).toContain('"partial_json":"{\\"city\\":\\"Shang"');
		expect(text).toContain('"partial_json":"hai\\"}"');
		expect(text).toContain('"stop_reason":"tool_use"');
		expect(text).toContain('"output_tokens":12');
		expect(text).toContain("event: message_stop");
	});
});
