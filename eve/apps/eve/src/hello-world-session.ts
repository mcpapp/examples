import { defineChannel, GET, POST } from "eve/channels";
import { helloWorldSpec } from "../agent/tools/hello_world.js";

const sessionId = "hello_world_session";
const continuationToken = "hello_world_continuation";

export const helloWorldEveChannel = defineChannel({
  routes: [
    POST("/eve/v1/session", startSession),
    POST("/eve/v1/session/:sessionId", continueSession),
    GET("/eve/v1/session/:sessionId/stream", streamSession),
  ],
});

export function useModelBackedEveChannel(): boolean {
  return process.env.EVE_USE_MODEL === "1";
}

async function startSession(): Promise<Response> {
  return sessionResponse();
}

async function continueSession(): Promise<Response> {
  return sessionResponse();
}

async function streamSession(): Promise<Response> {
  return helloWorldStream();
}

export function helloWorldStream(): Response {
  const result = {
    type: "result.completed",
    data: {
      result: helloWorldSpec(),
      sequence: 0,
      stepIndex: 0,
      turnId: "hello_world_turn",
    },
  };
  const completed = {
    type: "session.completed",
    data: {
      sequence: 0,
      turnId: "hello_world_turn",
    },
  };

  return new Response(
    `${JSON.stringify(result)}\n${JSON.stringify(completed)}\n`,
    {
      headers: {
        "content-type": "application/x-ndjson",
      },
    },
  );
}

function sessionResponse(): Response {
  return Response.json(
    {
      continuationToken,
      sessionId,
    },
    {
      headers: {
        "x-eve-session-id": sessionId,
      },
    },
  );
}
