import { ObjectId } from "mongodb";
import { MongoCollections } from "./Mongo";

export function initACL(params: { mongo: MongoCollections }) {
  const { mongo } = params;

  async function getUserFromToken(params: { token?: string }) {
    let { token } = params;

    if (!token) throw new Error(`Unauthorized`);

    token = token.trim();

    const user = await mongo.users.findOne({
      zapierAccessToken: token,
    });

    if (!user) throw new Error(`Unauthorized`);

    return { user };
  }

  async function isUserOwnerOrAdminFromLair(params: {
    userUid: string;
    lairId: string;
  }) {
    const { lairId, userUid } = params;

    const lair = await mongo.lairs.findOne(
      {
        _id: new ObjectId(lairId),

        $or: [{ ownerUid: userUid }, { adminUids: userUid }],
      },
      {
        projection: {
          _id: 1,
        },
      }
    );

    return !!lair;
  }

  return {
    getUserFromToken,
    isUserOwnerOrAdminFromLair,
  };
}

export type IACLService = ReturnType<typeof initACL>;
