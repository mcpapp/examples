# Repository Notes

- Keep the web shell generic: no customer/domain imports in `apps/web`.
- Browser-to-backend traffic must use Eve's native `/eve/v1/session*`
  contract only.
- Customer data, authorization decisions, direct backend function calls, and
  json-render spec generation belong in `apps/eve`.
- JavaScript/TypeScript code should follow the ES2025/ES2026 preferences from
  the project prompt where the runtime supports them.
