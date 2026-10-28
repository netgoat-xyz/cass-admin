## What does this change do?

<!-- One or two sentences. Link the issue it closes. -->

Closes #

## How was it verified?

<!-- Commands you ran, plus anything a reviewer should click through. -->

```bash
bun install --frozen-lockfile && bun run lint && bun run typecheck && bun run build
```

## Checklist

- [ ] No `.env`, credentials, keys or build output committed
- [ ] Behaviour preserved for existing callers unless the change is intentional
- [ ] Docs updated if configuration, endpoints or deployment changed
