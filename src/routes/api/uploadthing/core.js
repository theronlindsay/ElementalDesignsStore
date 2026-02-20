import { createUploadthing } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // This code runs on your server before upload.
      // Whatever you return here is accessible in onUploadComplete as `metadata`.
      return { userId: "anonymous" }; 
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      // Return something if you want it to be accessible inside the client-side onClientUploadComplete callback
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
};
