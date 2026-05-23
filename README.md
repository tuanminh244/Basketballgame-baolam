# Bảo Lâm / Bảo Linh Family Education Game

Private family-only education game app for daily tasks, rewards, shop, and parent approval flow.

## Important Architecture Decision

This project intentionally DOES NOT use Firebase Authentication.

Authentication is PIN-based and handled inside the app using Realtime Database `users`.
Do not propose Firebase Auth, custom claims, `auth.uid`, `auth.token.role`, or `auth != null` rules unless the owner explicitly requests an Auth Migration.

See:

- `AUTH_MODEL_LOCK.md`
- `COREGAME_LOCK.md`
- `ECONOMY_LOCK.md`
- `FIREBASE_SCHEMA_LOCK.md`
- `firebase_rules_LOCKED_v2.md`
- `TREE_STRUCTURE_LOCK.md`
- `MASTER LOCK CHECKLIST.md`

## Current Lock Status

| Area | Status |
|---|---|
| Auth model | Locked |
| Coregame | Locked |
| Economy | Locked |
| Firebase schema | Locked |
| Firebase rules | Locked as `firebase_rules_LOCKED_v2` |
| UI | Open / not locked |

UI is still under development. UI may be improved, but changes must not break Coregame, Economy, Firebase Schema, or Firebase Rules.

## Before Coding

Before writing or changing code, read the relevant lock files.

Minimum required reading:

1. `AUTH_MODEL_LOCK.md`
2. `COREGAME_LOCK.md`
3. `ECONOMY_LOCK.md`
4. `FIREBASE_SCHEMA_LOCK.md`
5. `firebase_rules_LOCKED_v2.md`
6. `MASTER LOCK CHECKLIST.md`

Do not code from assumptions.

## Forbidden Changes

Do not introduce:

- Firebase Auth
- Firebase custom claims
- `auth.uid`
- `auth.token.role`
- `auth != null` as a required rule
- New root database nodes unless explicitly approved
- New economy fields that bypass ledger logic
- Client-side point/XP granting
- UI changes that bypass parent approval

## Task Flow Summary

Daily reset creates tasks from task batches.

Players submit tasks.

Checkers approve or reject tasks.

Only approved tasks can grant XP/points.

Economy changes must be ledger-based and idempotent.

Shop/reward operations must not directly corrupt XP or points.

## AI / Reviewer Instructions

Any AI assistant or reviewer must follow the project lock files.

If an answer suggests Firebase Auth or `auth.token.role`, the answer is invalid unless the owner explicitly asked for an Auth Migration.

If UI is being changed, remember: UI is open, but game logic is locked.

## Development Rule

When modifying the project:

1. Identify affected area.
2. Read matching lock files.
3. Explain whether the change affects Coregame, Economy, Schema, Rules, or UI.
4. Code only the requested scope.
5. Run checklist before final answer.