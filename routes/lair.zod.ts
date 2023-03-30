import { z } from "zod";

export const GET_LAIR_MEMBERS_PARAMS_SCHEMA = z.object({
  lairId: z.string().describe("The lair _id"),
});

export const GET_LAIR_LABELS_PARAMS_SCHEMA = z.object({
  lairId: z.string().describe("The lair _id"),
});

export const POST_LAIR_CREATE_POST_BODY_SCHEMA = z.object({
  lairId: z.string().describe("The lair _id"),
  content: z.string().describe("The contents of the post, on HTML form"),

  labels: z.array(z.string()).optional().describe("An array with label ids"),
  connections: z
    .array(z.string())
    .optional()
    .describe("An array with user ids members of the lair"),
});

export const POST_LAIR_CREATE_POST_RESPONSE_SCHEMA = z.object({
  postURL: z.string().describe("The URL of the created post"),
});

export const POST_LAIR_REMOVE_USER_BODY_SCHEMA = z.object({
  email: z.string().describe("A email from the user to be removed"),
  lairId: z.string().describe("The lair id"),
});

export const POST_LAIR_REMOVE_USER_RESPONSE_SCHEMA = z.object({
  success: z.boolean().describe("If the operation was successful"),
});

export const POST_LAIR_INVITE_BODY_SCHEMA = z.object({
  lairId: z.string().describe("The lair id"),
  email: z.string().describe("The email to be invited to the lair"),
  automaticallyEnter: z
    .boolean()
    .describe(
      "If the user should get a popup on" +
        " their end or automatically be inserted in the lair"
    ),
});
