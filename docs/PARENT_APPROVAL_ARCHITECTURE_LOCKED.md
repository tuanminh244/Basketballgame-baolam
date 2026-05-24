# PARENT_APPROVAL_ARCHITECTURE_LOCKED.md — APPROVAL FLOW LOCK

## 1. Purpose

This lock governs the parent/checker approval architecture for the Family Education Game.

It is separate from Coregame, Economy, Engine Rules, Firebase Schema, and Firebase Rules.

## 2. Locked Approval Flow

The approval flow is:

1. Daily reset creates player tasks.
2. Player submits a task for review.
3. Submitted task becomes `pending`.
4. Parent/checker reviews pending tasks.
5. Parent/checker sets task to `approved` or `rejected`.
6. Only `approved` tasks become input events for the Economy/Engine ledger.
7. Economy/Engine grants XP/Points through the locked ledger process.

## 3. Authority Boundary

The approval flow must not grant XP/Points directly.

UI, player pages, and checker pages must not write authoritative economy fields, including:

- XP balance
- Points balance
- Level
- Streak
- Reward unlock flags
- `summary.xp_granted`
- `summary.points_granted`

## 4. Status Rules

Allowed task states remain under the existing project locks.

General boundary:

- Player may move a task into a submitted/pending state.
- Player must not approve or reject their own task.
- Checker/admin may approve or reject pending tasks.
- Rejected tasks must not grant XP/Points.
- Approved tasks are inputs for Economy/Engine processing, not direct payout commands.

## 5. Approval Queue Rules

Approval queue must:

- Read from the locked daily log path.
- Show only tasks requiring parent/checker action.
- Preserve user/date/task identity.
- Avoid duplicate listeners.
- Clean up realtime listeners.
- Call service-layer functions where available.

## 6. Forbidden Changes

Do not implement:

- Player self-approval
- UI direct XP/Points grants
- Approval page direct writes to economy ledger
- Bypassing `pending` approval flow
- Treating `submit` as `approved`
- New approval status values unless explicitly approved
- New root DB nodes unless schema migration is explicitly approved
- Firebase Auth/custom claims as approval authority unless owner explicitly writes: AUTH MIGRATION REQUESTED

## 7. Integration Boundary

- `COREGAME_LOCK.md` defines the overall game flow.
- `PARENT_APPROVAL_ARCHITECTURE_LOCKED.md` defines approval authority and status transition boundaries.
- `ECONOMY_LOCK.md` defines XP/Points rules.
- `ENGINE_RULES_LOCK.md` defines engine/business-rule execution and ledger processing.
- `firebase_rules_LOCKED_v2` defines Firebase RTDB validation/security rules.

Do not merge these locks.
