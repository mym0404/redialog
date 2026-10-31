# Conditional Verification

## Native Rendering and Accessibility

For changes to animation, dismissal, layout, or portal integration, run the Expo example using `pnpm example ios` or `pnpm example android`. These scripts start Expo and open the selected platform; they are not automated assertions or native production builds. Use agent-device to exercise the relevant behavior on the selected device.

Check opening and closing, backdrop interaction, and Android hardware back when those paths change. For host routing, verify movement between hosts and removal/restoration of a destination in the native view tree.

For accessibility changes, test actual screen-reader behavior: initial focus, navigation among dialog controls, exclusion of background controls, and focus restoration after closing. Record the platform, device, and screen-reader state. JSX accessibility attributes or an accessibility-tree snapshot alone do not establish these behaviors.

The dialog integration test substitutes Reanimated operations, mocks native focus events, and advances fake timers. It proves routing, isolation priority, focus-event scheduling, and hide cleanup, not native animation timing or VoiceOver/TalkBack focus behavior. No checked-in device E2E suite currently supplies that coverage.

## Release Changes

- `pnpm changeset status` validates pending changesets and reports planned increments. It compares packages with the configured Git base and rejects changed packages with no changesets. It does not prove npm authentication or publishability.
- `pnpm version-packages` applies pending changesets to versions and changelogs, then updates the lockfile. It mutates files; validate configuration changes in an isolated copy when a real version increment is not intended.
- For versioning changes, verify that the intended public package receives the expected increment and changelog, peer ranges remain intentional, and private example packages stay outside releases.
- `pnpm release` builds and invokes Changesets publishing. It can publish to npm and create Git tags; it is not a verification-only command and does not run the full check suite, push Git refs, or create GitHub release pages.

The contributor guide owns the maintainer's release procedure. Changesets configuration disables automatic commits and private-package versioning.

The CI release job runs only after checks pass for a push to `main`. Pending changesets produce or update a version PR; after versioning removes those changesets, an unpublished version is published with Git tags and a GitHub release. Generated version PRs receive CI through explicit workflow dispatch, which does not run the release job. Their checks omit `changeset status` because versioning has already consumed their changesets; formatting, lint, types, tests, and build still run. Other branches fetch the full Git history and provide the local `main` ref required by Changesets. Workflow linting and an isolated version run validate configuration locally; only a pushed workflow can prove GitHub execution and OIDC publishing.
