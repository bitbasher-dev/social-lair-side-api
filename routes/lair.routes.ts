import { ObjectId } from "mongodb";
import { MongoCollections, PostStatus, TiptapPost } from "../services/Mongo";
import { FastifyApp } from "../social-lair-side-api";
import {
  POST_LAIR_CREATE_POST_BODY_SCHEMA,
  POST_LAIR_CREATE_POST_RESPONSE_SCHEMA,
} from "./lair.zod";

export function initLairRoutes(params: {
  app: FastifyApp;
  mongo: MongoCollections;
}) {
  const { app, mongo } = params;

  app.post(
    "/lair/post",
    {
      schema: {
        body: POST_LAIR_CREATE_POST_BODY_SCHEMA,
        response: {
          200: POST_LAIR_CREATE_POST_RESPONSE_SCHEMA,
        },
        security: [{ authorization: [] }],

        tags: ["User"],
      },
    },
    async (req) => {
      let token = req.headers.authorization?.split("Bearer ")[1];
      token = token?.trim();
      if (!token) throw new Error(`Unauthorized`);

      const { content, lairId } = req.body;

      const user = await mongo.users.findOne({
        zapierAccessToken: token,
      });

      if (!user) throw new Error(`Unauthorized`);

      const lair = await mongo.lairs.findOne({
        _id: new ObjectId(lairId),
        ownerUid: user.uid,
      });
      if (!lair)
        throw new Error(
          `No lair found with _id ${lairId} or user is not owner of the lair`
        );

      const postToBeCreated: TiptapPost = {
        isDraft: false,
        upVotes: [],
        downVotes: [],
        comments: [],
        relevance: new Date().getTime(),
        status: PostStatus.approved,
        createdAt: new Date(),

        authorUid: user.uid,
        tiptapContent: content,
        images: [],
        lairId: lair._id.toString(),
        options: {},
      };

      const post = await mongo.posts.insertOne(postToBeCreated);

      return {
        postURL: `https://app.sociallair.io/lair/${lair.lairname}/?postId=${post.insertedId}`,
      };
    }
  );
}
