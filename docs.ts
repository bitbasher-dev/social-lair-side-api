import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

async function initDocumentation(params: { app: FastifyInstance }) {
  const { app } = params;

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "SocialLair Side API",
        description: "API that gives external services SocialLair capabilities",
        version: "v1.0.3",
      },
      servers: [],
      components: {
        securitySchemes: {
          authorization: {
            name: "authorization",
            type: "apiKey",
            in: "header",
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  // Return the app with the type provider properly injected, so it can parse Zod
  // into params for req.body, req.params and req.query
  return app.withTypeProvider<ZodTypeProvider>();
}

export const docs = {
  initDocumentation,
};
