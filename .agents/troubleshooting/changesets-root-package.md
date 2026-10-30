# Keep the Root Package Discoverable by Changesets

Decision date: 2026-10-31

## Observed Failure and Cause

With only `example` listed in `pnpm-workspace.yaml`, the package-discovery implementation used by Changesets returned only `redialog-example`. It omitted `redialog` from the package list used for release planning, even though pnpm itself includes the workspace root.

The discovery library expands the explicit workspace package patterns. It reports the workspace root separately; that separate root metadata does not make it a release candidate. Repeating discovery with `'.'` added to the patterns returned both packages. An isolated Changesets version run then updated the public library and its changelog while leaving the private example's version unchanged.

## Decision and Recurrence Guard

Keep `'.'` explicitly included in the workspace package patterns while the publishable library resides at the repository root. Do not remove it as redundant merely because pnpm install or the example app still works.

If a library changeset reports an unknown package, or release planning omits the library, inspect Changesets package discovery before renaming the package, ignoring the changeset, or changing release scope. Use `pnpm changeset status` with a pending library changeset to check the planned target.

Before reversing this decision, demonstrate that the installed Changesets discovery implementation includes the intended publishable package without this entry, then verify version and changelog generation in an isolated copy. Moving the publishable package requires equivalent discovery and release evidence for its new location.
