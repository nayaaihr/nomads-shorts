import { Inngest } from "inngest";

// v4 API. Event types are inferred at .send time; if we want stricter
// typing later, we can add a `staticSchema` block per the docs.
export const inngest = new Inngest({ id: "nomads-shorts" });

// Event catalog (shape reference for callers). Kept in sync with `.send`
// call sites — TypeScript won't enforce this yet.
export type Events = {
  "video/submitted": { videoId: string };
};
