import { z } from "zod";

export const POST_LAIR_CREATE_POST_BODY_SCHEMA = z.object({
  lairId: z.string().describe("The lair _id"),
  content: z.string().describe("The contents of the post, on HTML form"),
});

export const POST_LAIR_CREATE_POST_RESPONSE_SCHEMA = z.object({
  postURL: z.string().describe("The URL of the created post"),
});
