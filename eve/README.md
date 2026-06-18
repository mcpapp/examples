# Eve

This is an Eve + MCPApp example stack: the browser is a generic MCPApp host
shell, and Eve owns json-render spec generation.

## Layout

- `apps/web` is a Next.js shell. It delegates Eve session loading and MCPApp
  event forwarding to `@mcpapp/eve`, then renders the returned spec.
- `apps/eve` is the backend. It serves a hello world MCPApp spec through Eve's
  native session endpoints.

There are no domain REST endpoints. The browser uses only Eve's session
contract under `/eve/v1/session*`.

## MCPApp Host

The frontend dependency is `@mcpapp/eve`, which wraps `@mcpapp/react` for Eve
session streams. The shell is the host only, with Eve acting as the spec and
event authority:

```tsx
export { EveMCPAppServer as default } from "@mcpapp/eve/next";
```

Eve owns json-render spec generation. Specs are projected from native Eve
stream events.

## Initial Render

`@mcpapp/eve/next` starts a standard Eve session at `/eve/v1/session`, reads
the session stream, and passes the first MCPApp spec to the renderer. This
keeps the browser on Eve's native contract while preserving Eve as the owner of
the rendered surface.

## Run

```bash
pnpm install
pnpm dev
```

The web app defaults to `http://127.0.0.1:3000`. `eve/next` starts and proxies
the Eve runtime for local development. The default path is deterministic and
does not need model credentials. Set `EVE_USE_MODEL=1` plus
`AI_GATEWAY_API_KEY` to route requests through the model-backed Eve agent loop.
The model path defaults to `openai/gpt-5-nano`; set `EVE_MODEL` to use a
different AI Gateway model.

## Useful commands

```bash
pnpm check
pnpm test
pnpm build
pnpm --filter eve-agent eve:info
pnpm --filter eve-agent eve:channels
WEB_PORT=3001 pnpm --filter eve-web test:e2e
```

`test:e2e` uses the same deterministic Eve `/eve/v1/session*` channel as local
development. The web app does not define fixture routes.
