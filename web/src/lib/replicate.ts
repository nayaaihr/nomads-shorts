import Replicate from "replicate";
import { env } from "@/lib/env";

let _client: Replicate | null = null;
export function getReplicate(): Replicate {
  if (_client) return _client;
  _client = new Replicate({ auth: env.replicate.apiToken() });
  return _client;
}
