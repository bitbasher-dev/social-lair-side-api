import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastify, {
  FastifyBaseLogger,
  FastifyInstance,
  RawServerDefault,
} from "fastify";

import { docs } from "./docs";

import { IncomingMessage, ServerResponse } from "http";
import { initUserRoutes } from "./routes/user.routes";
import { initMongoDB, MongoCollections } from "./services/Mongo";
import { initLairRoutes } from "./routes/lair.routes";
import { IACLService, initACL } from "./services/ACL";

export type FastifyApp = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export type IServices = {
  mongo: MongoCollections;
  ACL: IACLService;
};

async function run() {
  console.log(`Starting server...`);

  const appWithoutDocs = fastify();
  appWithoutDocs.setValidatorCompiler(validatorCompiler);
  appWithoutDocs.setSerializerCompiler(serializerCompiler);

  const mongo = await initMongoDB();
  const ACL = initACL({ mongo });

  const app = await docs.initDocumentation({ app: appWithoutDocs });

  const services = {
    mongo,
    ACL,
  };

  initUserRoutes({
    app,
    services,
  });

  initLairRoutes({
    app,
    services,
  });

  await appWithoutDocs.ready();
  appWithoutDocs.swagger();

  await appWithoutDocs.listen({ port: 3030 });
  console.log(`Documentation at http://localhost:3030/docs`);
}

run();
