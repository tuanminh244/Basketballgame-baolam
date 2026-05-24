# TREE STRUCTURE LOCK — HARD LOCK VERSION  
  
Status: HARD LOCKED  
Architecture Type: Next.js App Router + Firebase Realtime Database  
Backend Processing: GitHub Actions + Node.js Scripts  
Cloud Functions: FORBIDDEN  
Architecture Drift: FORBIDDEN  
  
This document defines the FINAL locked project tree.  
  
NO MORE RESTRUCTURING ALLOWED.  
  
⸻  
  
## CORE LOCK PRINCIPLES  
  
This structure is optimized for:  
* Long-term maintainability  
* Family-scale usage  
* Minimal complexity  
* Firebase Realtime architecture  
* AI-safe development  
* Stable 5–10 year maintenance  
  
This project is NOT:  
* enterprise SaaS  
* multiplayer game backend  
* microservice system  
* event-driven distributed backend  
  
DO NOT over-engineer.  
  
⸻  
  
## FINAL LOCKED TREE  
  
root/  
│  
├── .github/  
│   └── workflows/  
│       ├── economy-engine.yml  
│       ├── daily-reset.yml  
│       └── approval_cleanup.yml  
│  
├── docs/  
│   ├── TREE_STRUCTURE_LOCK.md  
│   ├── COREGAME_LOCK.md  
│   ├── ECONOMY_LOCK.md  
│   ├── FIREBASE_SCHEMA_LOCK.md  
│   ├── PARENT_APPROVAL_ARCHITECTURE_LOCKED.md  
│   ├── ENGINE_RULES_LOCK.md  
│   ├── SECURITY_LOCK.md  
│   ├── UI_LOCK.md  
│   └── CHANGELOG.md  
│  
├── public/  
│  
├── scripts/  
│   │  
│   ├── engine/  
│   │   ├── rewardEngine.js  
│   │   ├── streakEngine.js  
│   │   ├── levelEngine.js  
│   │   ├── approvalEngine.js  
│   │   └── economyEngine.js  
│   │  
│   ├── shared/  
│   │   ├── firebaseAdmin.js  
│   │   ├── constants.js  
│   │   ├── validators.js  
│   │   └── logger.js  
│   │  
│   ├── daily_reset.js  
│   ├── task_approval.js  
│   └── cleanup.js  
│  
├── src/  
│   │  
│   ├── app/  
│   │   ├── layout.tsx  
│   │   ├── page.tsx  
│   │   ├── login/  
│   │   │   └── page.tsx  
│   │   ├── (player)/  
│   │   │   ├── layout.tsx  
│   │   │   ├── player-home/  
│   │   │   │   └── page.tsx  
│   │   │   ├── rewards/  
│   │   │   │   └── page.tsx  
│   │   │   ├── wallet/  
│   │   │   │   └── page.tsx  
│   │   │   └── settings/  
│   │   │       └── page.tsx  
│   │   └── (checker)/  
│   │       ├── layout.tsx  
│   │       ├── dashboard/  
│   │       │   └── page.tsx  
│   │       ├── queue/  
│   │       │   └── page.tsx  
│   │       └── reports/  
│   │           └── page.tsx  
│   │  
│   ├── components/  
│   │   ├── ui/  
│   │   ├── player/  
│   │   └── checker/  
│   │  
│   ├── contexts/  
│   │   ├── AuthContext.tsx  
│   │   └── SessionContext.tsx  
│   │  
│   ├── hooks/  
│   │   ├── useAuth.ts  
│   │   ├── useDailyLog.ts  
│   │   ├── useApprovalQueue.ts  
│   │   ├── useRewards.ts  
│   │   ├── useUserStats.ts  
│   │   ├── useWallet.ts  
│   │   └── useRealtimeStatus.ts  
│   │  
│   ├── services/  
│   │   ├── authService.ts  
│   │   ├── taskService.ts  
│   │   ├── approvalService.ts  
│   │   ├── transactionService.ts  
│   │   ├── rewardService.ts  
│   │   ├── penaltyService.ts  
│   │   └── notificationService.ts  
│   │  
│   ├── engine/  
│   │   ├── xpEngine.ts  
│   │   ├── rewardEngine.ts  
│   │   ├── streakEngine.ts  
│   │   ├── levelEngine.ts  
│   │   ├── approvalEngine.ts  
│   │   ├── economyEngine.ts  
│   │   └── validators.ts  
│   │  
│   ├── lib/  
│   │   ├── firebase/  
│   │   │   ├── config.ts  
│   │   │   ├── refs.ts  
│   │   │   └── queries.ts  
│   │   └── constants.ts  
│   │  
│   ├── utils/  
│   │   ├── time.ts  
│   │   ├── calculations.ts  
│   │   ├── validators.ts  
│   │   ├── storage.ts  
│   │   ├── formatter.ts  
│   │   └── logger.ts  
│   │  
│   ├── types/  
│   │   ├── index.ts  
│   │   ├── auth.ts  
│   │   ├── economy.ts  
│   │   ├── rewards.ts  
│   │   └── tasks.ts  
│   │  
│   └── styles/  
│       ├── globals.css  
│       ├── variables.css  
│       └── theme.ts  
│  
├── firebase.json  
├── firebase_rules_LOCKED_v2.json  
├── .firebaserc  
├── .env.local.example  
├── .gitignore  
├── next.config.js  
├── postcss.config.js  
├── tailwind.config.js  
├── tsconfig.json  
├── package.json  
└── README.md  
  
⸻  
  
## LAYER RESPONSIBILITIES  
  
⸻  
  
### .github/workflows/  
**Purpose:**  
Cron automation only.  
  
**Rules:**  
* MUST NOT contain business logic  
* ONLY execute scripts  
  
**cron_engine.yml**  
Runs:  
* reward engine  
* streak processing  
* economy updates  
Schedule:  
* every 5 minutes  
  
**daily_reset.yml**  
Runs:  
* daily_reset.js  
Schedule:  
* daily at 00:00  
  
**approval_cleanup.yml**  
Runs:  
* cleanup.js  
Purpose:  
* archive logs  
* cleanup stale records  
* reduce DB growth  
  
⸻  
  
### docs/  
**Purpose:**  
Permanent architecture lock documents.  
  
These documents are SOURCE OF TRUTH.  
DO NOT:  
* duplicate architecture rules elsewhere  
* create alternative lock systems  
  
⸻  
  
### scripts/  
**Purpose:**  
Server-authoritative processing.  
  
**Environment:**  
* Node.js  
* Firebase Admin SDK  
* GitHub Actions  
  
`scripts/` is authoritative backend logic.  
  
⸻  
  
### scripts/engine/  
**Purpose:**  
Authoritative economy + reward processing.  
  
**IMPORTANT:**  
This layer is the FINAL source of truth.  
  
**rewardEngine.js**  
Responsibilities:  
* reward delta calculation  
* XP grants  
* point grants  
* reward payouts  
MUST NEVER be duplicated in frontend.  
  
**streakEngine.js**  
Responsibilities:  
* streak tracking  
* streak bonus calculation  
* streak reset handling  
  
**levelEngine.js**  
Responsibilities:  
* level threshold checks  
* level-up processing  
  
**approvalEngine.js**  
Responsibilities:  
* approval processing logic  
* approval state transitions  
* approval reward preparation  
  
**economyEngine.js**  
Responsibilities:  
* wallet updates  
* economy balancing  
* spending calculations  
  
**IMPORTANT ENGINE RULE**  
`scripts/engine/`:  
* authoritative  
* writes database  
* processes rewards  
  
`src/engine/`:  
* UI helper only  
* NEVER authoritative  
  
⸻  
  
### scripts/shared/  
**Purpose:**  
Reusable server-side helpers.  
  
**firebaseAdmin.js**  
ONLY Admin SDK initialization point.  
DO NOT initialize Admin SDK elsewhere.  
  
**constants.js**  
Shared backend constants.  
Examples:  
* level thresholds  
* reward gates  
* cron timing  
  
**validators.js**  
Server-authoritative validation.  
Examples:  
* anti-cheat validation  
* reward validation  
* economy validation  
  
**logger.js**  
Server-side logging utilities.  
  
⸻  
  
**daily_reset.js**  
**Purpose:**  
Generate daily logs from templates.  
Runs:  
* once daily  
Responsibilities:  
* clone tasks  
* reset daily states  
  
**task_approval.js**  
**Purpose:**  
Approval queue processing.  
Responsibilities:  
* validate pending approvals  
* process approval states  
* sync approval consistency  
  
**cleanup.js**  
**Purpose:**  
Long-term DB maintenance.  
Responsibilities:  
* archive logs  
* cleanup stale records  
* reduce DB size growth  
`cleanup.js` is REQUIRED. DO NOT REMOVE.  
  
⸻  
  
### src/  
**Purpose:**  
Frontend application only.  
  
**Environment:**  
* Browser  
* React  
* Firebase Client SDK  
  
`src/` MUST NEVER:  
* initialize Admin SDK  
* run cron logic  
* perform authoritative economy writes  
  
⸻  
  
### src/app/  
**Purpose:**  
Next.js App Router pages.  
  
**login/**  
Authentication entry point.  
  
**(player)/**  
Player-facing routes.  
Examples:  
* player-home  
* rewards  
* wallet  
* settings  
  
**(checker)/**  
Checker/admin routes.  
Examples:  
* dashboard  
* approval queue  
* reports  
  
⸻  
  
### src/components/  
**Purpose:**  
Reusable UI rendering.  
  
Components MUST:  
* render UI only  
* call hooks/services  
  
Components MUST NOT:  
* calculate rewards  
* contain economy logic  
* write Firebase directly  
  
⸻  
  
### src/contexts/  
**Purpose:**  
Global lightweight state.  
  
**AuthContext.tsx**  
Stores:  
* auth user  
* role  
* session state  
  
**SessionContext.tsx**  
Stores:  
* temporary session state  
* UI session synchronization  
  
⸻  
  
### src/hooks/  
**Purpose:**  
Realtime Firebase listeners.  
  
Hooks:  
* subscribe to Firebase  
* sync UI state  
* cleanup listeners  
  
Hooks MUST NOT:  
* contain reward logic  
* mutate economy  
* calculate authoritative rewards  
  
⸻  
  
### src/services/  
**Purpose:**  
Firebase Client SDK writes.  
  
Services:  
* handle user actions  
* write Firebase updates  
  
Services MUST NOT:  
* contain cron logic  
* contain authoritative economy calculations  
  
⸻  
  
### src/engine/  
**Purpose:**  
Frontend helper calculations only.  
NOT authoritative.  
  
**xpEngine.ts**  
Display-only XP calculations.  
  
**rewardEngine.ts**  
Frontend reward previews only.  
MUST NOT grant rewards.  
  
**streakEngine.ts**  
Display-only streak calculations.  
  
**levelEngine.ts**  
Frontend level display calculations.  
  
**approvalEngine.ts**  
Frontend approval UI calculations only.  
  
**economyEngine.ts**  
Frontend wallet preview calculations only.  
  
**validators.ts**  
Frontend validation before submit.  
  
**IMPORTANT ENGINE LOCK**  
Frontend engine:  
* UI helper only  
Backend engine:  
* authoritative source of truth  
DO NOT merge these layers.  
  
⸻  
  
### src/lib/firebase/  
**Purpose:**  
Firebase infrastructure layer.  
  
**config.ts**  
Firebase Client SDK initialization.  
  
**refs.ts**  
SINGLE SOURCE OF TRUTH for ALL database paths.  
DO NOT hardcode paths elsewhere.  
  
**queries.ts**  
One-time Firebase read helpers.  
NOT realtime listeners.  
  
⸻  
  
### src/utils/  
**Purpose:**  
Generic utilities only.  
  
`utils/` MUST NOT:  
* contain business logic  
* contain reward engines  
* duplicate validators  
  
⸻  
  
### FIREBASE FILES  
  
**firebase.json**  
Firebase local project configuration.  
MUST reference:  
`firebase_rules_LOCKED_v2.json`  
  
**firebase_rules_LOCKED_v2.json**  
LOCKED database rules.  
DO NOT rename.  
DO NOT duplicate.  
  
⸻  
  
## FINAL HARD LOCK RULES  
  
FORBIDDEN:  
* restructuring folders  
* renaming layers  
* duplicate engines  
* duplicate validators  
* duplicate reward logic  
* duplicate level logic  
* architecture rewrites  
  
ALLOWED:  
* add features  
* add components  
* add pages  
* extend services carefully  
  
This tree is FINAL.  
  
END OF HARD LOCK  
