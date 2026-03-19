# MAR-5 Next.js Todo App

Minimal Next.js Todo application scaffold built with TypeScript and the App Router.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000` to view the Todo app shell.

## Production build

```bash
npm run build
npm run start
```

## Code quality

```bash
npm run lint
npm run format:check
npm run format
```

`npm run lint` runs the baseline quality gate for this repo:

- TypeScript type-checking via `tsc --noEmit`
- Repo-local formatting checks for line endings, trailing whitespace, and final newlines

Use `npm run format` to normalize the formatting baseline in place. Use
`npm run format:check` when you want the formatting check without modifying
files.

## Available scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs the code quality baseline
- `npm run format` normalizes the repo-local formatting baseline
- `npm run format:check` verifies the formatting baseline without changing files
- `npm run typecheck` runs the TypeScript compiler without emitting files
