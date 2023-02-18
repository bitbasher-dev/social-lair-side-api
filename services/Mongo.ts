// services/Mongo.ts
import { Collection, MongoClient, ObjectId } from "mongodb";
import { CONFIG } from "../config";

export enum Theme {
  dark = "dark",
  light = "light",
}

export enum PostStatus {
  approved = "approved",
  pending = "pending",
  refused = "refused",
  pinned = "pinned",
}
export enum CommentStatus {
  approved = "approved",
  pending = "pending",
  refused = "refused",
  pinned = "pinned",
}

export enum UserRole {
  user = "user",
  client = "client",
}

export enum UserGroup {
  owner = "owner",
  ownerAndAdmin = "ownerAndAdmin",
  everyone = "everyone",
}

export enum LairUserStatus {
  approved = "approved",
  requested = "requested",
  invited = "invited",
  blocked = "blocked",
  deleted = "deleted",
}

export enum FontSize {
  small = "small",
  medium = "medium",
  large = "large",
}

export enum NotificationOption {
  all = "all",
  push = "push",
  email = "email",
  none = "none",
}

export enum PinnedShowContent {
  fully = "fully",
  partially = "partially",
  collapse = "collapse",
}

export enum PinnedShowLairContent {
  fully = "fully",
  collapse = "collapse",
  partially = "partially",
}

export enum PrivacyOption {
  EVERYONE = "everyone",
  MUTUAL_CONNECTION = "mutualConnection",
  MUTUAL_LAIR = "mutualLair",
  NONE = "none",
}

export enum PrivacyDMOption {
  EVERYONE = "everyone",
  MUTUAL_CONNECTION = "mutualConnection",
  MUTUAL_LAIR = "mutualLair",
  ONLY_CONNECTIONS = "onlyConnections",
  NONE = "none",
}

export enum WhenPinnedExpires {
  remove = "remove",
  collapse = "collapse",
}

export enum PinnedColorBody {
  title = "title",
  full = "full",
}

export interface ContentStructure {
  blocks: any[];
  entityMap?: any;
}

export const enum UserAuthType {
  SOCIALLAIR = "SOCIALLAIR",
  LEARNISTIC = "LEARNISTIC",

  // Enum used for migration from the old dev environment to the production one
  LEARNISTIC_DEV = "LEARNISTIC_DEV",
}

// If UserAuthType.SOCIALLAIR we've an entry here,
// else, we hit firebase
export interface SocialLairAuth {
  // For now, it's <PHONE>@learnistic.com for compatibility
  email: string;
  // It's <PASS[4]>99 for compatibility
  password: string;
  // Starts with SL
  uid: string;
}

export interface UserInfo {
  uid: string;
  billingToken?: string;
  name: string;
  accessToken: string;
  zapierAccessToken?: string;
  apiKey: string;
  username: string;
  description: string;
  email: string[];
  phone: string;
  connections: string[];
  connectionRequests: string[];
  image: string | null;
  coverImage: string | null;
  theme: Theme;
  website: string;
  role: UserRole;
  deletedAt?: Date;
  options: {
    fontSize: FontSize;
    notifications: {
      showAll: boolean;
      comments: NotificationOption;
      upAndDownVotes: NotificationOption;
      tag: NotificationOption;
    };
    emailNotifications?: {
      enabled: boolean;

      comments: NotificationOption;
      subcomments: NotificationOption;
      directMessage: NotificationOption;
      tag: NotificationOption;
      newPost: NotificationOption;

      type: "immediately" | "daily";

      /**
       * This will be a timestamp for the next time the user should receive their email.
       * This timestamp will be updated by a day every time we send the notification
       */
      timeToSend?: number;
    };
  };
  connectionPrivacyOption: PrivacyOption;
  messagePrivacyOption: PrivacyDMOption;
  invitePrivacyOption: PrivacyDMOption;
  startTestDrive?: boolean;
  authType: UserAuthType;

  activityCount: number;
}

export interface Lair {
  _id?: ObjectId;
  name: string;
  lairname: string;
  description: string;
  ownerUid: string;
  adminUids: string[];
  image: string | null;
  coverImage: string | null;
  deletedAt?: Date;
  suspended?: number;
  pinnedOrder: string[];
  maxAdmins?: number;
  options: {
    biggerEmojis: boolean;
    whoCanPost: UserGroup;
    whoCanComment: UserGroup;
    approvePosts: boolean;
    approveComments: boolean;
    privacy: boolean;
    adminCanEditPost: boolean;
    adminCanArchivePost: boolean;
    adminCanEditAds: boolean;
    adminCanRemoveFromLair: boolean;
    adminCanHideComment: boolean;
    adminCanBumpPost: boolean;
    allowVotes: boolean;
    hideLastLink: boolean;
    pinnedShowContent: PinnedShowLairContent;
    pinnedColor?: string;
  };
  lairAdvertisementsId?: string;

  activityCount: number;
}

export const enum AdvertisementType {
  TEXT = "TEXT",
  SQUARE = "SQUARE",
  FULL = "FULL",
}

export type Advertisement =
  | {
      type: AdvertisementType.TEXT;
      displayUrl: string;
      url: string;
      slug: string;
      title: string;
      subtitle: string;
      active: boolean;
      createdAt: Date;
    }
  | {
      type: AdvertisementType.SQUARE | AdvertisementType.FULL;
      displayUrl: string;
      url: string;
      slug: string;
      title: string;
      subtitle: string;
      active: boolean;
      createdAt: Date;
      image: string;
    };

export interface LairAdvertisements {
  _id?: ObjectId;
  advertisements: Advertisement[];
}

export interface LastLairPost {
  lairId: string;
  lastPostReadId: string;
}

export interface LairUser {
  _id?: ObjectId;
  userUid: string;
  lairId: string;
  status: LairUserStatus;
  isMuted: boolean;
  labelsSort: string[];
  lastPostReadId?: string;
  entryDate?: Date;
}

export interface DEPRECATED__DraftPost {
  _id?: ObjectId;
  content: ContentStructure;
  authorUid: string;
  lairId: string;
  status: PostStatus;
  upVotes: string[];
  downVotes: string[];
  images: string[];
  comments: Comment[];
  relevance: number;
  tags?: string[];
  title?: string;
  options: {
    shouldShowThumbLink?: boolean;
    whenPinnedExpires?: WhenPinnedExpires;
    expirePinnedDate?: Date;
    daysAfterUserJoins?: number;
    pinnedColorBody?: PinnedColorBody;
  };
  unlisted?: boolean;
  createdAt: Date;
  isDraft: true;
  scheduleTime?: number;
  notificationId?: string;
  mentionNotificationId?: string;

  // Keywords array
  keywords?: string[];
}

export interface TiptapPost {
  _id?: ObjectId;
  tiptapContent: string;
  authorUid: string;
  lairId: string;
  status: PostStatus;
  upVotes: string[];
  downVotes: string[];
  images: string[];
  comments: Comment[];
  relevance: number;
  tags?: string[];
  title?: string;
  options: {
    shouldShowThumbLink?: boolean;
    whenPinnedExpires?: WhenPinnedExpires;
    expirePinnedDate?: Date;
    daysAfterUserJoins?: number;
    pinnedColorBody?: PinnedColorBody;
  };
  unlisted?: boolean;
  createdAt: Date;
  isDraft: false | undefined;
  schedule?: number;
  scheduleTime?: number;
  notificationId?: string;
  mentionNotificationId?: string;

  // Keywords array
  keywords?: string[];
}

export type Post = DEPRECATED__DraftPost | TiptapPost;

export interface DraftSubComment {
  id: string;
  authorUid: string;
  content: ContentStructure;
  status?: CommentStatus;
  upVotes: string[];
  downVotes: string[];
  image?: string;
  isDraft: true;
  createdAt: Date;
  hidden?: boolean;
}
export interface TiptapSubComment {
  id: string;
  authorUid: string;
  tiptapContent: string;
  status?: CommentStatus;
  upVotes: string[];
  downVotes: string[];
  image?: string;
  isDraft: false | undefined;
  createdAt: Date;
  hidden?: boolean;
}

export interface Upsell {
  _id: ObjectId;
  uid: string;
  description: string;
  price: number; // Integer

  needShipping: boolean;
  learnistic?: {
    virtualAppId: string;
    tags: number[];
  };
}

export type SubComment = DraftComment | TiptapSubComment;

export interface DraftComment {
  id: string;
  authorUid: string;
  content: ContentStructure;
  status?: CommentStatus;
  upVotes: string[];
  downVotes: string[];
  subComments: SubComment[];
  image?: string | string[];
  isDraft: true;
  createdAt: Date;
  hidden?: boolean;
}

export interface TiptapComment {
  id: string;
  authorUid: string;
  tiptapContent: string;
  status?: CommentStatus;
  upVotes: string[];
  downVotes: string[];
  subComments: SubComment[];
  image?: string | string[];
  isDraft: false | undefined;
  createdAt: Date;
  hidden?: boolean;
}

export type Comment = DraftComment | TiptapComment;

export interface Invite {
  email: string;
  inviteUUID: string;

  // In case the invite came from a Form,
  // used for tag propagation on Berserker currently
  formId?: string;
  formName?: string;
}

export interface Label {
  _id?: ObjectId;
  name: string;
  color: string;
  public: boolean;
  lairId: string;
  userUid: string;
  postsId: string[];
}

export interface Referral {
  _id: ObjectId;
  userUid: string;
  uniqueClicks: {
    ip: string;
    timestamp: number;
  }[];
  clicks: number;
  url: string;
  signups: {
    uid: string;
    timestamp: number;
  }[];
}

export interface Billing {
  _id: ObjectId;
  userUid: string;

  // To know if the user has been migrated from the old billing system
  notMigrated?: boolean;

  // Timestamp present only if testDriveActivated = true
  testDriveExpiration?: number;
  testDriveActivated: boolean;

  active: boolean;

  stripeCustomerId?: string;
  subscriptionId?: string;
  extraLairs: number;
  paymentMethodId?: string;
  maxAdmins?: number;
  admins?: string[];

  lastIp?: string;

  upsells?: (Upsell & { paid?: boolean; paymentIntent: string })[];

  activationTime?: number;
  canSendInvoice?: boolean;
  invoiceSent: boolean;
  amountPaid?: number;

  vatId?: string;

  learnisticInfo?: {
    country_code: string;
    phone: string;
  };

  billingInfo?: {
    billing_address: {
      street: string;
      state_region: string;
      city: string;
      country: string;
      zip_code: string;
    };

    shipping_address: {
      street: string;
      state_region: string;
      city: string;
      country: string;
      zip_code: string;
    };
  };
}

export interface BillingInfo {}
export interface PasswordResetRequest {
  userUid: string;
  passwordResetUUID: string;
  expirationDate: Date;
}

export interface OpenGraphScrap {
  url: string;
  result: {
    ogTitle?: string;
    ogDescription?: string;
    ogUrl: string;
    ogImage?: {
      url: string;
    };
  } | null;
}

export interface HelpScout {
  userUid: string;
  customerId: number;
  createdAt: number;
}

export interface Report {
  authorUid: string;
  date: Date;
  reason: string;
}

export interface Reported {
  _id?: ObjectId;
  reports: Report[];
  postId: string;
  commentId?: string;
  subCommentId?: string;
  lairId: string;
}

export interface LairBackup {
  _id?: ObjectId;
  prevLairId: string;
  hashKey: string;
  checksum: string;
  iv: string;
}

export interface Sequence {
  _id: "invoiceId";
  sequence_value: number;
}

// Auxiliary type that locks concurrent operations using
// findOneAndUpdate (locking the entry in a single query)
export interface Mutex {
  _id?: ObjectId;
  key: string;
  value: boolean;
}

export interface MongoCollections {
  auth: Collection<SocialLairAuth>;
  users: Collection<UserInfo>;
  posts: Collection<Post>;
  archivedPosts: Collection<Post>;
  lairs: Collection<Lair>;
  lairsUsers: Collection<LairUser>;
  lairAdvertisements: Collection<LairAdvertisements>;
  invites: Collection<Invite>;
  notifications: Collection<Notification>;
  archivedNotifications: Collection<Notification>;
  opengraph: Collection<OpenGraphScrap>;
  labels: Collection<Label>;
  referrals: Collection<Referral>;
  billing: Collection<Billing>;
  passwordResetRequest: Collection<PasswordResetRequest>;
  helpScout: Collection<HelpScout>;
  upsells: Collection<Upsell>;
  reported: Collection<Reported>;
  lairBackups: Collection<LairBackup>;
  logs: Collection<any>;
  sequences: Collection<Sequence>;
  mutexes: Collection<Mutex>;

  rawMongoClient: MongoClient;

  // messages: Collection<MongoMessage>;
  // shortlinks: Collection<Shortlink>;
  // integrations: Collection<Integration>;
  // mutableConfig: Collection<MutableConfig>;
  // webhooks: Collection<Webhook>;
  // forms: Collection<Form>;
  // userMutePreferences: Collection<IMuteNotifications>;
  // invoices: Collection<SocialLairInvoice>;
}

export async function initMongoDB(): Promise<MongoCollections> {
  // Create a new MongoClient
  const client = new MongoClient(CONFIG.DB_URL);
  await client.connect();
  const db = client.db(CONFIG.DB_NAME);

  // This table only makes sense on server runtime
  await db.collection<Mutex>("mutexes").deleteMany({});

  console.log(`Connected to MongoDB!`);

  return {
    auth: db.collection<SocialLairAuth>("auth"),
    users: db.collection<UserInfo>("users"),
    posts: db.collection<Post>("posts"),
    archivedPosts: db.collection<Post>("archivedPosts"),
    lairs: db.collection<Lair>("lairs"),
    lairsUsers: db.collection<LairUser>("lairsUsers"),
    lairAdvertisements: db.collection<LairAdvertisements>("lairAdvertisements"),
    invites: db.collection<Invite>("invites"),
    notifications: db.collection<Notification>("notifications"),
    opengraph: db.collection<OpenGraphScrap>("opengraph"),
    labels: db.collection<Label>("labels"),
    referrals: db.collection<Referral>("referrals"),
    billing: db.collection<Billing>("billing"),
    archivedNotifications: db.collection<Notification>("archivedNotifications"),
    passwordResetRequest: db.collection<PasswordResetRequest>(
      "passwordResetRequest"
    ),
    helpScout: db.collection<HelpScout>("helpScout"),
    upsells: db.collection<Upsell>("upsells"),
    reported: db.collection<Reported>("reported"),
    lairBackups: db.collection<LairBackup>("lairBackups"),
    logs: db.collection<any>("logs"),
    sequences: db.collection<Sequence>("sequences"),
    mutexes: db.collection<Mutex>("mutexes"),

    // messages: db.collection<MongoMessage>("messages"),
    // shortlinks: db.collection<Shortlink>("shortlink"),
    // integrations: db.collection<Integration>("integrations"),
    // mutableConfig: db.collection<MutableConfig>("mutableConfig"),
    // invoices: db.collection<SocialLairInvoice>("invoices"),
    // webhooks: db.collection<Webhook>("webhooks"),
    // forms: db.collection<Form>("forms"),
    // userMutePreferences: db.collection<IMuteNotifications>(
    //   "userMutePreferences"
    // ),

    rawMongoClient: client,
  };
}
