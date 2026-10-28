# Energy workspace cleanup — 28 October 2026

The editor's containing directory holds the original apartment project. The independent Energy repository is the nested `rahat-energy` directory. Open `Rahat Energy.code-workspace` from that directory to show only Energy files.

Removed the excluded `legacy-app`, `legacy-source` and `legacy-middleware.ts` resources from the Energy repository. A reversible backup is located at `/private/tmp/rahat-energy-legacy-backup-20261028`; temporary storage is not a permanent archive. The original apartment project remains untouched.

Removed obsolete TypeScript/lint legacy exclusions. Isolation verification now rejects reintroduced legacy resources and no longer requires the parent project's source files. Historical reports describe the earlier isolation stage and are retained as records.

No environment values, database connections, authentication behavior or commerce APIs were changed. Database activation remains pending valid saved Energy connection settings.

## Localhost correction

The apartment development server was still serving port 3000 from the containing directory. On the user's explicit request to remove it completely from this workspace, that server was stopped and the parent application's files, environment, dependencies and build output were moved to `/private/tmp/rahat-apartment-workspace-backup-20261028`. This private recovery backup is outside the workspace and is not permanent storage. Parent Git metadata was left untouched.

The containing directory now has only a small Energy launcher and the nested Energy application (plus existing Git metadata). Running `npm run dev` in either directory starts Energy. `scripts/dev.mjs` reserves port 3000 for an HTTP redirect to the canonical Energy preview on port 3001, which listens on IPv4 and IPv6. The redirect does not cache. No apartment app is served on either port.

Energy's `.env` was not moved or modified. Database activation remains a separate task.
