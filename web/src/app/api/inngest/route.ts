import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processVideo } from "@/inngest/functions";

// Inngest calls this endpoint to invoke our functions. In dev, `inngest dev`
// discovers this route automatically at http://localhost:3000/api/inngest.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processVideo],
});
