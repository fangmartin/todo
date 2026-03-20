# Todo App

This repository contains a small Todo application built with Next.js 16, the App Router, React 19, and TypeScript.

The app is designed to keep a short personal task list easy to manage in the browser. Todos are stored in `localStorage` when browser storage is available, and the UI falls back to a session-only mode with a notice if persistence is blocked.

## Feature summary

- Add todos from the composer
- Mark todos complete or incomplete
- Edit existing todo titles
- Delete individual todos
- Filter the list by all, active, and completed items
- Clear all completed todos in one action
- Restore saved todos after a page reload

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the local development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run build
npm run start
npm test
npm run test:watch
npm run lint
npm run typecheck
npm run format:check
npm run format
```

What each command does:

- `npm run dev`: start the Next.js development server
- `npm run build`: create a production build
- `npm run start`: serve the production build locally
- `npm test`: run the Vitest suite once
- `npm run test:watch`: run tests in watch mode
- `npm run lint`: run the repository quality gate (`typecheck` plus formatting checks)
- `npm run typecheck`: run TypeScript without emitting files
- `npm run format:check`: verify the repository formatting baseline
- `npm run format`: rewrite files to match the formatting baseline

## Validate the app

Use this sequence to verify the app and the documented workflow:

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Suggested manual check while `npm run dev` is running:

1. Add a todo.
2. Edit it, toggle completion, and switch between the filter buttons.
3. Reload the page and confirm the todo persists.
4. Mark a todo complete and use `Clear completed`.

## Testing and quality notes

- Tests run with Vitest in a `jsdom` environment.
- `npm run lint` does not invoke ESLint in this repository. It currently verifies TypeScript correctness and the repo-local formatting baseline.
