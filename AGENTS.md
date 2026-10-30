# Repository Knowledge

## Project Purpose

Redialog is a React Native library for imperative dialogs and bottom sheets. It provides reusable show/hide controls and portal rendering for applications that need overlays outside the caller's local layout.

## Tech Stack

- TypeScript and React Native, with React Native Reanimated 4 and Worklets for animation.
- An Expo example app consumes the local library through a pnpm workspace dependency.
- mise pins Node.js and pnpm in `mise.toml`; `package.json` records the package manager and dependency contracts. Keep consumer peer ranges distinct from the versions used to develop the example.
- Oxfmt formats files; Oxlint checks JavaScript and TypeScript; TypeScript checks types. Jest and React Native Testing Library provide component tests.
- React Native Builder Bob generates CommonJS, ES modules, and declaration files. Changesets manages release notes, version increments, and npm publishing.

## Project Tree

- `src/index.tsx`: public package exports.
- `src/component/`: dialog presentation and render-prop controls.
- `src/hook/`: imperative controls and parameterized dialog adapters.
- `src/internal/`: portal hosting and shared runtime helpers.
- `src/__tests__/`: portal contracts and dialog-to-portal integration tests.
- `example/`: runnable Expo consumer of the local library.
- `lib/`: generated package output; change sources instead of editing output.
- `.changeset/`: release configuration and pending release notes.
- `.github/` and `lefthook.yml`: CI setup and local Git checks.

## Verification

Run commands from the repository root with mise activated, or prefix them with `mise exec --`. After dependency changes, verify `pnpm install --frozen-lockfile` and include the updated lockfile.

| Command                 | Coverage and limits                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pnpm format:check`     | Checks supported repository files with Oxfmt; generated output and the pnpm lockfile are excluded.                |
| `pnpm lint`             | Runs configured Oxlint rules, including React Hooks checks; does not replace TypeScript or native runtime checks. |
| `pnpm typecheck`        | Runs the root TypeScript configuration, including library, example, and test sources; does not build native apps. |
| `pnpm test --runInBand` | Runs the Jest component suite; does not establish on-device behavior.                                             |
| `pnpm build`            | Generates JavaScript distributions and declarations with Bob; does not run tests or compile iOS/Android apps.     |

CI checks formatting, lint, types, changeset validity, Jest tests, and the package build. The pre-commit hook checks staged JavaScript/TypeScript with Oxlint, repository formatting, and types when applicable; commit-msg checks Conventional Commits. Neither replaces the complete verification sequence above.

## Knowledge System

Root `AGENTS.md` is the default fact owner and the only router to knowledge and troubleshooting documents. Each retained fact has one owner; each routed document owns only the responsibilities assigned below. Update the owner and this routing section together when ownership or paths change.

- .agents/knowledge/domain.md
  Owns domain terminology, dialog lifecycle, and portal routing contracts. Read before changing those behaviors.
- .agents/knowledge/verification.md
  Owns conditional device, accessibility, and release verification, including test limitations. Read when changing those areas.
- .agents/troubleshooting/changesets-root-package.md
  Owns the Changesets workspace-discovery decision. Read before diagnosing a missing release target or changing workspace package selection.
