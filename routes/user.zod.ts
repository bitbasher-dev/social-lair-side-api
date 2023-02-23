import { z } from "zod";

export const POST_USER_LOGIN_BODY_SCHEMA = z.object({
  phone: z.string().describe("A phone with country code"),
  passcode: z.string().length(4).describe("A passcode with exactly 4 digits"),
});

export const POST_USER_LOGIN_RESPONSE_SCHEMA = z.object({
  zapierAccessToken: z.string().describe("An AccessToken to use on User"),
});

export const LAIRS_SCHEMA = z.object({
  _id: z.string(),
  name: z.string(),
  lairname: z.string(),
  description: z.string(),
  ownerUid: z.string(),
  adminUids: z.string().array(),
  image: z.string().nullish(),
  coverImage: z.string().nullish(),
  deletedAt: z.date().optional().nullable(),
  suspended: z.number().optional().nullable(),
  pinnedOrder: z.string().array(),
  maxAdmins: z.number().optional().nullable(),
  options: z.object({
    biggerEmojis: z.boolean(),
    whoCanPost: z.string(),
    whoCanComment: z.string(),
    approvePosts: z.boolean(),
    approveComments: z.boolean(),
    privacy: z.boolean(),
    adminCanEditPost: z.boolean(),
    adminCanArchivePost: z.boolean(),
    adminCanEditAds: z.boolean(),
    adminCanRemoveFromLair: z.boolean(),
    adminCanHideComment: z.boolean(),
    adminCanBumpPost: z.boolean(),
    allowVotes: z.boolean(),
    hideLastLink: z.boolean(),
    pinnedShowContent: z.string(),
    pinnedColor: z.string().optional().nullable(),
  }),
  lairAdvertisementsId: z.string().optional().nullable(),

  activityCount: z.number(),
});

// export const GET_USER_LAIRS_RESPONSE_SCHEMA = z.object({
//   lairs: LAIRS_SCHEMA.array(),
// });
