# LENA V1 — Reliability Audit

## Applied
- Fixed database path mismatch: runtime DB is now project-root `data.sqlite`.
- Database model initialization is awaited before the bot starts processing events.
- Reduced SQLite pool size and added BUSY/LOCKED retry handling.
- Fixed missing `moment` dependency usage by using `moment-timezone`.
- Hardened Users/Threads/Currencies CRUD against missing rows and ID type mismatch.
- Made currency increments/decrements safer and rejected non-finite values.
- Removed the forced hourly MQTT restart timer.
- Removed the automatic process respawn loop from `index.js`.
- Added a bounded HTTP client with timeout, redirect, size and retry controls.
- Removed clearly unused npm dependencies to reduce install/build weight.
- Removed the `uuid` runtime dependency by using Node's `crypto.randomUUID()`.
- Disabled `shell.js` and `run.js` by default because they execute arbitrary commands/code.
- Removed the bundled Facebook session/cookie from the distributed ZIP.
- Added safer `.gitignore` rules for credentials, state and SQLite sidecar files.

## Important
The project still contains an unofficial Facebook/FCA integration. This audit does not attempt to bypass platform warnings, authentication controls, or platform restrictions, and external third-party API endpoints remain dependent on their availability and terms.

## Database
The supplied `Fca_Database/database.sqlite` was not the database path used by the Sequelize runtime. It is retained as source data for inspection but is not automatically merged into the new runtime database to avoid destructive/ambiguous migration.

## Deployment
Use Node.js 20 LTS or a compatible Node 20–24 runtime. Install dependencies with `npm install`, then run `npm start`.
