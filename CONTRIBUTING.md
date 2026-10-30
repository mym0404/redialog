# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

This project is a monorepo managed using [pnpm workspaces](https://pnpm.io/workspaces). It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

Install [mise](https://mise.jdx.dev/), then run these commands in the root directory to use the pinned Node.js and pnpm versions and install dependencies:

```sh
mise trust
mise install
mise exec -- pnpm install --frozen-lockfile
```

The commands below assume mise is activated in your shell. Otherwise, prefix them with `mise exec --`. Commit `pnpm-lock.yaml` whenever dependencies change.

The [example app](/example/) demonstrates usage of the library. You need to run it to test any changes you make.

It is configured to use the local version of the library, so any changes you make to the library's source code will be reflected in the example app. Changes to the library's JavaScript code will be reflected in the example app without a rebuild, but native code changes will require a rebuild of the example app.

You can use various commands from the root directory to work with the project.

To start the packager:

```sh
pnpm example start
```

To run the example app on Android:

```sh
pnpm example android
```

To run the example app on iOS:

```sh
pnpm example ios
```

To run the example app on Web:

```sh
pnpm example web
```

Make sure your code passes TypeScript, Oxlint, and Oxfmt checks. Run the following to verify:

```sh
pnpm typecheck
pnpm lint
pnpm format:check
```

To fix formatting errors, run the following:

```sh
pnpm format
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
pnpm test
```

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and tests

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting, and [Jest](https://jestjs.io/) for testing.

Our pre-commit hooks run Oxlint, Oxfmt, and TypeScript checks.

### Publishing to npm

We use [Changesets](https://changesets.dev/) to record release notes, update package versions, and publish to npm. Only `redialog` is released; the example app is private and is not versioned or published.

For a change to the published library, add a changeset and commit the generated Markdown file with the code:

```sh
pnpm changeset
```

Select `redialog`, choose `patch`, `minor`, or `major`, and describe the change for library users. Tooling-only changes do not require a changeset.

After a push to `main` passes CI, GitHub Actions creates or updates one version PR for the pending changesets. The PR updates `package.json`, `CHANGELOG.md`, and the lockfile. CI also runs on the generated release branch through an explicit workflow dispatch.

Review and merge the version PR to publish. The next successful CI run on `main` publishes the new version to npm, pushes the package tag, and creates a GitHub release. Publishing uses npm trusted publishing (OIDC), so no `NPM_TOKEN` secret is needed. Changes without pending changesets or an unpublished version do not create a release.

The repository must allow GitHub Actions to create pull requests. On npm, the `redialog` trusted publisher must allow publishing from GitHub repository `mym0404/redialog`, workflow `ci.yml`, with no environment restriction. Keep the workflow filename and npm trust configuration in sync.

To inspect pending releases locally:

```sh
pnpm changeset status
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test --runInBand
pnpm build
```

`pnpm version-packages` and `pnpm release` are the commands used by automation. The first applies pending version changes; the second builds and publishes versions that are not yet on npm. Git tags use package names, such as `redialog@1.1.0`.

### Scripts

The `package.json` file contains various scripts for common tasks:

- `pnpm install`: setup project by installing dependencies.
- `pnpm typecheck`: type-check files with TypeScript.
- `pnpm lint`: lint files with Oxlint.
- `pnpm lint:fix`: apply automatic lint fixes.
- `pnpm format`: format files with Oxfmt.
- `pnpm format:check`: check formatting without changing files.
- `pnpm test`: run unit tests with Jest.
- `pnpm changeset`: add a release note and choose the version increment.
- `pnpm version-packages`: apply changesets and update the lockfile.
- `pnpm release`: build and publish unreleased package versions to npm.
- `pnpm example start`: start the Metro server for the example app.
- `pnpm example android`: run the example app on Android.
- `pnpm example ios`: run the example app on iOS.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
