# @netgoat/ui

NetGoat design system — tokens and React components extracted from the product UI so teams can share one visual language.

## What's included

- **Tokens** (`styles/tokens.css`) — dark-first oklch palette from `frontend/app/globals.css`, plus brand / surface / semantic colors used in dashboard chrome
- **Components** — Button, Badge, Input, Textarea, Label, Card, Alert, Separator, Checkbox, Switch, Tabs, Avatar, Skeleton, Spinner, Kbd, Empty, Field, Progress, Table
- **Banner variants** — shared semantic status classes for banners / chips

## Install (workspace)

```bash
# from repo root
bun install
```

Consumers depend on:

```json
{
  "dependencies": {
    "@netgoat/ui": "workspace:*"
  }
}
```

## Usage

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from "@netgoat/ui"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="brand">Add domain</Button>
      </CardContent>
    </Card>
  )
}
```

Import tokens after Tailwind in your global CSS:

```css
@import "tailwindcss";
@import "@netgoat/ui/styles.css";
```

Force dark (product default):

```html
<html class="dark">
```

## Fonts

- **UI:** Plus Jakarta Sans → `--font-sans`
- **Wordmark:** Cal Sans → `--font-calsans`

## Docs

Run the developer docs app:

```bash
cd design-docs
bun run dev
```

Open http://localhost:3100
