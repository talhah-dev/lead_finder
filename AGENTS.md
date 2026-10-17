<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Guidelines

1. **No unnecessary comments in code**: Do not write explanatory comments inside the code files. Keep code clean and self-explanatory.
2. **Use shadcn UI components**: Always install and use official shadcn components via `npx shadcn@latest add <component>`.
3. **Use default shadcn styling and Tailwind classes**: Rely on the default shadcn design tokens, theme variables, and Tailwind utilities instead of custom CSS.
4. **Minimalistic & Clean Design**: Keep the UI clean, uncluttered, focused, and purposeful. Avoid visual noise and excessive text.
