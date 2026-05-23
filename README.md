# Bảo Lâm / Bảo Linh Family Education Game

Private family-only education game app for daily tasks, rewards, shop, and parent approval flow.

## Important Architecture Decision

This project intentionally DOES NOT use Firebase Authentication.

Authentication is PIN-based and handled inside the app using Realtime Database `users`.
Do not propose Firebase Auth, custom claims, `auth.uid`, `auth.token.role`, or `auth != null` rules unless the owner explicitly requests an Auth Migration.

## Lock File Separation

`ENGINE_RULES_LOCK.md` and `firebase_rules_LOCKED_v2` are different locks.

| Lock file | Purpose |
|---|---|
| `PARENT_APPROVAL_ARCHITECTURE_LOCKED.md` | Parent/checker approval architecture lock: player submit, pending queue, approve/reject authority, task status transitions, and approval-to-economy boundary. |
| `ENGINE_RULES_LOCK.md` | App engine / business-rule execution lock: daily reset, reward processing, idempotency, ledger behavior, backend/service authority. |
| `firebase_rules_LOCKED_v2.md` / `.json` | Firebase Realtime Database security and validation rules baseline. |

Do not merge these two concepts.
Do not rename one into the other.
Both must be checked when a task touches game flow, economy, backend scripts, rules, or database writes.

## Current Lock Status

| Area | Status |
|---|---|
| Auth model | Locked |
| Coregame | Locked |
| Economy | Locked |
| Parent approval architecture | Locked as `PARENT_APPROVAL_ARCHITECTURE_LOCKED.md` |
| Engine rules | Locked as `ENGINE_RULES_LOCK.md` |
| Firebase schema | Locked |
| Firebase rules | Locked as `firebase_rules_LOCKED_v2` |
| Tree structure | Locked |
| UI | Open / not locked |

UI is still under development. UI may be improved, completed, refactored, and polished, but changes must not break Auth, Coregame, Parent Approval, Economy, Engine Rules, Firebase Schema, Tree Structure, or Firebase Rules.

There is no active `UI_LOCK` for this project.

## Required Reading Order

Before coding, reviewing, debugging, or proposing changes, read files in this order:

1. `README.md` — project overview and current lock status
2. `AUTH_MODEL_LOCK.md` — no Firebase Auth, PIN login model
3. `MASTER LOCK CHECKLIST.md` — global pass/fail checklist
4. `COREGAME_LOCK.md` — locked gameplay rules
5. `ECONOMY_LOCK.md` — locked XP/points/reward economy
6. `ENGINE_RULES_LOCK.md` — locked engine/business-rule execution behavior
7. `FIREBASE_SCHEMA_LOCK.md` — locked database schema
8. `TREE_STRUCTURE_LOCK.md` — locked file/folder structure
9. `firebase_rules_LOCKED_v2.md` or `firebase_rules_LOCKED_v2.json` — Firebase RTDB rules baseline
10. `Types+Hooks+Contexts+Services+Lib+Engine+App+Components.md` — required for code tasks
11. Current target source file(s)

## README Rule

`README.md` is the project entry point.

If README conflicts with a specific lock file, the specific lock file wins.
README explains the project. Lock files govern the project.

## Forbidden Changes

Do not introduce:

- Firebase Auth
- Firebase custom claims
- `auth.uid`
- `auth.token.role`
- `auth != null` as a required RTDB rule
- New root database nodes unless explicitly approved
- New economy fields that bypass ledger logic
- Client-side point/XP granting
- UI changes that bypass parent approval or economy authority
- Any merge/rename between `ENGINE_RULES_LOCK.md` and `firebase_rules_LOCKED_v2`

## Task Flow Summary

Daily reset creates tasks from task batches.
Players submit tasks.
Checkers approve or reject tasks.
Only approved tasks can grant XP/points.
Approval flow must not grant XP/Points directly.
Economy changes must be ledger-based and idempotent.
Shop/reward operations must not directly corrupt XP or points.

## AI / Reviewer Instructions

Any AI assistant or reviewer must follow the project lock files.

If an answer suggests Firebase Auth or `auth.token.role`, the answer is invalid unless the owner explicitly asked for an Auth Migration.

If an answer treats `ENGINE_RULES_LOCK.md` and `firebase_rules_LOCKED_v2` as the same file, the answer is invalid.

If UI is being changed, remember: UI is open, but game logic is locked.

## Development Rule

When modifying the project:

1. Identify affected area.
2. Read matching lock files.
3. Explain whether the change affects Auth, Coregame, Economy, Engine Rules, Schema, Firebase Rules, Tree, or UI.
4. Code only the requested scope.
5. Run checklist before final answer.
