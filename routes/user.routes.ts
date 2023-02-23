import { CONFIG } from "../config";
import { MongoCollections } from "../services/Mongo";
import { FastifyApp } from "../social-lair-side-api";
import {
  LAIRS_SCHEMA,
  POST_USER_LOGIN_BODY_SCHEMA,
  POST_USER_LOGIN_RESPONSE_SCHEMA,
} from "./user.zod";
import fetch from "node-fetch";

// Generated by https://quicktype.io

export interface ISocialLairUser {
  user: {
    _id: string;
    email: string[];
    name: string;
    username: string;
    phone: string;
    uid: string;
    role: string;
    theme: string;
    image: string;
    coverImage: string;
    connections: string[];
    connectionRequests: string[];
    description: string;
    website: string;
    // options:                 UserOptions;
    lairs: {
      _id: string;
      name: string;
      adminUid: string;
      lairname: string;
      description: string;
      privacy: boolean;
      image: string;
      approvePosts: boolean;
      coverImage: null | string;
      numMembers: number;
      whoCanPost: InvitePrivacyOption;
      adminUids: string[];
      // options:        LairOptions;
      ownerUid: string;
      activityCount?: number;
      adminsToLair?: string[];
    }[];
    accessToken: string;
    connectionPrivacyOption: string;
    messagePrivacyOption: string;
    authType: string;
    invitePrivacyOption: InvitePrivacyOption;
    activityCount: number;
    deletedAt: null;
    billingLink: string;
    billingToken: string;
  };
}

export enum InvitePrivacyOption {
  Admin = "admin",
  Everyone = "everyone",
}

export function initUserRoutes(params: {
  app: FastifyApp;
  mongo: MongoCollections;
}) {
  const { app, mongo } = params;

  app.post(
    "/user/login",
    {
      schema: {
        body: POST_USER_LOGIN_BODY_SCHEMA,
        response: {
          200: POST_USER_LOGIN_RESPONSE_SCHEMA,
        },
        security: [{ authorization: [] }],
        tags: ["User"],
      },
    },
    async (req) => {
      const token = req.headers.authorization?.split("Bearer ")[1];
      if (token !== CONFIG.AUTH_TOKEN) throw new Error(`Unauthorized`);

      let { phone, passcode } = req.body;

      phone = phone.replace(/\s/g, "");
      phone = phone.trim();
      phone = phone.replace("+", "");

      const authTypeResponse = await fetch(
        `https://api.sociallair.io/auth/check_phone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone }),
        }
      );

      const authTypeResponseJSON: { authType: string; exists: boolean } =
        await authTypeResponse.json();

      if (!authTypeResponseJSON.exists)
        throw new Error(`User doesn't exist under phone +${phone}`);

      const loginResponse = await fetch(
        `https://api.sociallair.io/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            password: passcode,
            authType: authTypeResponseJSON.authType,
            inviteUUID: null,
          }),
        }
      );

      const loginResponseJSON: ISocialLairUser = await loginResponse.json();

      if (!loginResponseJSON.user?.uid) throw new Error(`Wrong passcode`);

      // Get the user zapier accessToken

      const user = await mongo.users.findOne({
        uid: loginResponseJSON.user.uid,
      });

      if (!user?.zapierAccessToken)
        throw new Error(`Zapier not enabled for user with phone +${phone}`);

      return {
        zapierAccessToken: user.zapierAccessToken,
      };
    }
  );

  app.get(
    "/user/lairs",
    {
      schema: {
        // response: {
        //   200: GET_USER_LAIRS_RESPONSE_SCHEMA,
        // },
        security: [{ authorization: [] }],

        tags: ["User"],
      },
    },
    async (req) => {
      let token = req.headers.authorization?.split("Bearer ")[1];
      token = token?.trim();
      if (!token) throw new Error(`Unauthorized`);

      const user = await mongo.users.findOne({
        zapierAccessToken: token,
      });

      if (!user) throw new Error(`Unauthorized`);

      const _lairs = await mongo.lairs
        .find({
          ownerUid: user.uid,
        })
        .toArray();

      // Small mapping to convert _id
      const lairs = _lairs.map((l) => ({ ...l, _id: l._id.toString() }));

      return {
        lairs,
      };
    }
  );
}
