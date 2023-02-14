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

export type FastifyApp = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

async function run() {
  console.log(`Queue instantiated`);

  const appWithoutDocs = fastify();
  appWithoutDocs.setValidatorCompiler(validatorCompiler);
  appWithoutDocs.setSerializerCompiler(serializerCompiler);

  const app = await docs.initDocumentation({ app: appWithoutDocs });

  await appWithoutDocs.ready();
  appWithoutDocs.swagger();

  await appWithoutDocs.listen({ port: 3030 });
  console.log(`Documentation at http://localhost:3030/docs`);
}

run();
