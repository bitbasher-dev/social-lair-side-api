import { ObjectId, WithId } from "mongodb";
import fetch from "node-fetch";
import { Label, PostStatus, TiptapPost, UserInfo } from "../services/Mongo";
import { FastifyApp, IServices } from "../social-lair-side-api";
import {
  GET_LAIR_LABELS_PARAMS_SCHEMA,
  GET_LAIR_MEMBERS_PARAMS_SCHEMA,
  POST_LAIR_CREATE_POST_BODY_SCHEMA,
  POST_LAIR_CREATE_POST_RESPONSE_SCHEMA,
  POST_LAIR_INVITE_BODY_SCHEMA,
  POST_LAIR_REMOVE_USER_BODY_SCHEMA,
  POST_LAIR_REMOVE_USER_RESPONSE_SCHEMA,
} from "./lair.zod";

export function initLairRoutes(params: {
  app: FastifyApp;
  services: IServices;
}) {
  const { app, services } = params;
  const { ACL, mongo } = services;

  app.get(
    "/lair/members/:lairId",
    {
      schema: {
        params: GET_LAIR_MEMBERS_PARAMS_SCHEMA,

        security: [{ authorization: [] }],
        tags: ["Lair"],
      },
    },
    async (req) => {
      const token = req.headers.authorization?.split("Bearer ")[1];
      const { user } = await ACL.getUserFromToken({ token });

      const { lairId } = req.params;

      const isOwnerOrAdmin = await ACL.isUserOwnerOrAdminFromLair({
        lairId,
        userUid: user.uid,
      });

      if (!isOwnerOrAdmin) throw new Error(`Unauthorized`);

      const membersFromLair = await mongo.lairsUsers
        .find({
          lairId: lairId,
        })
        .toArray();

      const membersUid = membersFromLair.map(
        (memberFromLair) => memberFromLair.userUid
      );

      const members = await mongo.users
        .find(
          {
            uid: { $in: membersUid },
          },
          {
            projection: {
              name: 1,
              username: 1,
              image: 1,
              uid: 1,
              deletedAt: 1,
            },
          }
        )

        .toArray();

      return {
        members: members
          .map((m) => {
            const memberWithoutId: Omit<WithId<UserInfo>, "_id"> & {
              _id?: ObjectId;
            } = m;
            delete memberWithoutId._id;

            return { ...memberWithoutId, id: m.uid };
          })
          .filter((m) => !m.deletedAt),
      };
    }
  );
  app.get(
    "/lair/labels/:lairId",
    {
      schema: {
        params: GET_LAIR_LABELS_PARAMS_SCHEMA,

        security: [{ authorization: [] }],
        tags: ["Lair"],
      },
    },
    async (req) => {
      const token = req.headers.authorization?.split("Bearer ")[1];
      const { user } = await ACL.getUserFromToken({ token });

      const { lairId } = req.params;

      const isOwnerOrAdmin = await ACL.isUserOwnerOrAdminFromLair({
        lairId,
        userUid: user.uid,
      });

      if (!isOwnerOrAdmin) throw new Error(`Unauthorized`);

      const labelsFromLair = await mongo.labels
        .find({
          lairId,
          public: true,
        })
        .toArray();

      const labelsFromUser = await mongo.labels
        .find({
          lairId,
          public: false,
          userUid: user.uid,
        })
        .toArray();

      let labels = [...labelsFromLair, ...labelsFromUser];

      // Remove repetitions
      let labelIdMaps: { [labelId: string]: WithId<Label> } = {};
      labels.forEach((l) => (labelIdMaps[l._id!.toHexString()] = l));

      labels = Object.values(labelIdMaps);

      return { labels: labels.map((l) => ({ ...l, id: l._id })) };
    }
  );

  app.post(
    "/lair/post",
    {
      schema: {
        body: POST_LAIR_CREATE_POST_BODY_SCHEMA,
        response: {
          200: POST_LAIR_CREATE_POST_RESPONSE_SCHEMA,
        },

        security: [{ authorization: [] }],
        tags: ["Lair"],
      },
    },
    async (req) => {
      const token = req.headers.authorization?.split("Bearer ")[1];
      const { user } = await ACL.getUserFromToken({ token });

      const { content, lairId, labels, connections } = req.body;

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
        tags: connections,
      };

      const post = await mongo.posts.insertOne(postToBeCreated);

      // Add this post id to each label
      if (labels)
        await mongo.labels.updateMany(
          {
            _id: { $in: labels.map((lId) => new ObjectId(lId)) },
          },
          {
            $addToSet: { postsId: `${post.insertedId}` },
          }
        );

      return {
        postURL: `https://app.sociallair.io/lair/${lair.lairname}/?postId=${post.insertedId}`,
      };
    }
  );

  app.post(
    "/lair/invite",
    {
      schema: {
        body: POST_LAIR_INVITE_BODY_SCHEMA,

        security: [{ authorization: [] }],
        tags: ["Lair"],
      },
    },
    async (req) => {
      const token = req.headers.authorization?.split("Bearer ")[1];
      const { user } = await ACL.getUserFromToken({ token });

      const { lairId, automaticallyEnter, email } = req.body;

      const isOwnerOrAdmin = await ACL.isUserOwnerOrAdminFromLair({
        lairId,
        userUid: user.uid,
      });

      if (!isOwnerOrAdmin) throw new Error(`Unauthorized`);

      // Do a fetch to the official API
      const respose = await fetch(`https://api.sociallair.io/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          lairIds: [lairId],
          emails: [email],
          automaticallyEnter: !!automaticallyEnter,
        }),
      });

      return respose.json();
    }
  );

  app.post(
    "/lair/remove_user",
    {
      schema: {
        body: POST_LAIR_REMOVE_USER_BODY_SCHEMA,
        response:{
          200: POST_LAIR_REMOVE_USER_RESPONSE_SCHEMA
        },
        security: [{ authorization: [] }],
        tags: ["Lair"],
      },
    },
    async (req) => {
      const token = req.headers.authorization?.split("Bearer ")[1];
      const { user } = await ACL.getUserFromToken({ token });

      const { lairId, email } = req.body;

      const isOwnerOrAdmin = await ACL.isUserOwnerOrAdminFromLair({
        lairId,
        userUid: user.uid,
      });

      if (!isOwnerOrAdmin) throw new Error(`Unauthorized`);

      const userToBeingRemoved = await mongo.users.findOne({
        email: { $in: [email] },
      });

      if (!userToBeingRemoved) throw new Error(`User not found`);

      const deleteResult = await mongo.lairsUsers.deleteOne({
        lairId,
        userUid: userToBeingRemoved.uid,
      });

      return { success: !!deleteResult.deletedCount };
    }
  );
}
