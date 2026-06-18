import { defineChannel, GET, POST } from "eve/channels";
import { helloWorldSpec } from "../../agent/tools/hello_world.js";

const fixtureSessionId = "fixture_session";
const fixtureContinuationToken = "fixture_continuation";

export function useFixtureEveChannel(): boolean {
  return process.env.EVE_TEST_FIXTURE === "1";
}

export const fixtureEveChannel = defineChannel({
  routes: [
    POST("/eve/v1/session", startFixtureSession),
    POST("/eve/v1/session/:sessionId", continueFixtureSession),
    GET("/eve/v1/session/:sessionId/stream", streamFixtureSession),
  ],
});

async function startFixtureSession(): Promise<Response> {
  return fixtureSessionResponse();
}

async function continueFixtureSession(): Promise<Response> {
  return fixtureSessionResponse();
}

async function streamFixtureSession(): Promise<Response> {
  return fixtureStream();
}

export function fixtureStream(): Response {
  const result = {
    type: "result.completed",
    data: {
      result: helloWorldSpec(),
      sequence: 0,
      stepIndex: 0,
      turnId: "fixture_turn",
    },
  };
  const completed = {
    type: "session.completed",
    data: {
      sequence: 0,
      turnId: "fixture_turn",
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

function fixtureSessionResponse(): Response {
  return Response.json(
    {
      continuationToken: fixtureContinuationToken,
      sessionId: fixtureSessionId,
    },
    {
      headers: {
        "x-eve-session-id": fixtureSessionId,
      },
    },
  );
}
