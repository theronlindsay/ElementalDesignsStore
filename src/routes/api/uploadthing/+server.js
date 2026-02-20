import { createRouteHandler } from "uploadthing/server";
import { ourFileRouter } from "./core";
import { env } from '$env/dynamic/private';

// Export routes for standard UploadThing handlers
const handler = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: env.UPLOADTHING_TOKEN
  }
});

export { handler as GET, handler as POST };
