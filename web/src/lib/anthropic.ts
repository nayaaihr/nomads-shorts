import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

let _client: Anthropic | null = null;
export function getAnthropic(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic({ apiKey: env.anthropic.apiKey() });
  return _client;
}

// Current Haiku. Cheap ($1/M input tokens) and fast — plenty smart enough
// to read a transcript and pick clip-worthy moments.
export const MOMENT_PICKER_MODEL = "claude-haiku-4-5-20251001";
