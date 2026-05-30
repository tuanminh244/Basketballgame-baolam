# COREGAME_LOCK.md

# Bảo Lâm / Bảo Linh Family Education Game

## Core Game Lock — Firebase Auth Model

---

## 1. File Identity Lock

Tên file này phải giữ nguyên:

```txt
COREGAME_LOCK.md
```

Không đổi tên thành:

```txt
coregame
Coregame.txt
COREGAME_LOCKED_v7.md
COREGAME_LOCKED_FINAL.md
coregame_v3.md
```

Mọi cập nhật coregame phải được ghi vào đúng file `COREGAME_LOCK.md`.

---

## 2. Mục tiêu hệ thống

Đây là app giáo dục gia đình cho Bảo Lâm và Bảo Linh.

Mục tiêu chính:

```txt
- Giao nhiệm vụ học tập / sinh hoạt hằng ngày
- Trẻ hoàn thành nhiệm vụ và gửi chờ duyệt
- Mẹ kiểm tra và duyệt / từ chối
- Bố quản trị hệ thống
- Hệ thống ghi nhận XP, điểm, streak, reward, penalty
- Dữ liệu chống gian lận bằng Firebase Auth, Firebase Rules và backend/admin logic
- Trải nghiệm đăng nhập cho trẻ vẫn đơn giản bằng PIN
```

Core gameplay không thay đổi khi chuyển sang Firebase Auth.

---

## 3. Auth Model Lock

Project dùng Firebase Authentication.

Mô hình chính thức:

```txt
Firebase Email/Password Auth
PIN UI = Firebase Auth password
Firebase Auth UID = database user_id
Custom Claims role = admin / checker / player
Firebase Realtime Database Rules dùng auth.uid và auth.token.role
```

Firebase Auth là security boundary chính.

Không dùng no-auth.

Không dùng frontend PIN/localStorage làm security boundary.

Không đọc `/users/{user_id}/pass_pin` để login trước Firebase Auth.

---

## 4. Firebase Auth UID Lock

Firebase Auth UID phải trùng chính xác database user_id hiện tại.

Bộ user_id hiện dùng:

```txt
blam_01  = Bảo Lâm
blinh_02 = Bảo Linh
mom_03   = Mẹ
dad_04   = Bố
```

Ví dụ đúng:

```txt
Firebase Auth UID: blam_01
Database path:     /users/blam_01
```

Nếu Firebase Auth UID là random UID do Firebase Console tạo tự động, rules dùng `auth.uid == $user_id` sẽ báo `Permission denied`.

Firebase Auth users phải được tạo hoặc cập nhật bằng Admin SDK với UID cố định.

---

## 5. Firebase Auth Email Mapping

Email nội bộ phải dùng pattern:

```txt
{user_id}@family.local
```

Mapping chính thức:

```txt
blam_01  -> blam_01@family.local
blinh_02 -> blinh_02@family.local
mom_03   -> mom_03@family.local
dad_04   -> dad_04@family.local
```

PIN trên UI là password Firebase Auth account tương ứng.

Không dùng mapping ngắn kiểu:

```txt
blam@family.local
blinh@family.local
mom@family.local
dad@family.local
```

vì dễ gây lệch với database user_id.

---

## 6. Custom Claims Lock

Mỗi Firebase Auth user bắt buộc có custom claim `role`.

```txt
dad_04   -> role = admin
mom_03   -> role = checker
blam_01  -> role = player
blinh_02 -> role = player
```

Firebase Rules được phép và bắt buộc dùng:

```js
auth != null
auth.uid
auth.token.role
```

---

## 7. Login Flow Lock

Flow login đúng:

```txt
1. Người dùng chọn profile: Bảo Lâm / Bảo Linh / Mẹ / Bố
2. App map profile sang Firebase Auth email theo pattern {user_id}@family.local
3. Người dùng nhập PIN
4. App gọi signInWithEmailAndPassword(auth, email, pin)
5. Firebase Auth login thành công
6. App lấy auth.uid và custom claims
7. App mới đọc Realtime Database
```

Flow sai, bị cấm:

```txt
Nhập PIN
-> đọc /users/{user_id}/pass_pin
-> so PIN ở frontend
```

Lý do: trước Firebase Auth login thì `auth == null`, Firebase Rules sẽ chặn.

---

## 8. AuthService Lock

`authService.ts` không được scan `/users` để tìm PIN.

Sai:

```txt
read /users
find user by pass_pin
set local session
```

Đúng:

```txt
profile selected
-> user_id known
-> email = {user_id}@family.local
-> signInWithEmailAndPassword(auth, email, pin)
-> getIdTokenResult(true)
-> read claims.role
```

Sau khi Firebase Auth login thành công mới được đọc `/users/{auth.uid}`.

---

## 9. Firebase Rules File Name Lock

Tên file Firebase Rules phải giữ nguyên:

```txt
firebase_rules_LOCKED_v2.json
```

Không đổi tên thành:

```txt
firebase_rules_LOCKED_v3.json
firebase_rules_FINAL.json
firebase_rules_auth.json
```

Được phép patch nội dung `firebase_rules_LOCKED_v2.json` lên logic tương đương v3, gồm:

```txt
- thêm reward_offers rule
- thêm task_templates .indexOn ["owner_id"]
- thu hẹp users read theo auth model
- giữ auth.uid / auth.token.role
```

Nhưng tên file vẫn là `firebase_rules_LOCKED_v2.json`.

---

## 10. Firebase Rules Model

Rules phải giữ root lock:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

Rules phải dùng Firebase Auth:

```js
auth != null
auth.uid
auth.token.role
```

Không được mở sensitive nodes bằng:

```json
".read": true
```

Đặc biệt cấm:

```json
"users": {
  ".read": true
}
```

vì sẽ làm lộ `pass_pin`.

---

## 11. Vai trò hệ thống

### 11.1 Admin / Bố

Admin là:

```txt
dad_04
```

Admin có quyền:

```txt
- Quản lý system_config
- Quản lý task_templates
- Quản lý task_batches
- Quản lý rewards
- Quản lý reward_batches
- Quản lý store_items
- Tạo reward_offers
- Ghi penalty_logs
- Ghi admin_logs
- Cập nhật daily summary
- Chạy backend/Admin SDK/cron nếu cần
```

Admin không nên xóa dữ liệu lịch sử. Các node audit quan trọng dùng `newData.exists()` để chặn delete từ client.

---

### 11.2 Checker / Mẹ

Checker là:

```txt
mom_03
```

Checker có quyền:

```txt
- Đọc dashboard của các con
- Đọc user_index
- Đọc daily_logs của các con
- Đọc transactions của các con
- Đọc penalty_logs của các con
- Duyệt task pending -> approved / rejected
- Duyệt transaction pending_delivery -> delivered / cancelled
```

Checker không được:

```txt
- Tạo task template
- Sửa điểm
- Tạo penalty log
- Tạo reward offer
- Sửa system_config
- Ghi admin_logs
```

---

### 11.3 Player / Bảo Lâm, Bảo Linh

Players:

```txt
blam_01  = Bảo Lâm
blinh_02 = Bảo Linh
```

Player có quyền:

```txt
- Đọc dữ liệu của chính mình
- Đọc task hôm nay của mình
- Chuyển task todo -> pending
- Tạo transaction mua reward nếu đủ điểm và còn hàng
```

Player không được:

```txt
- Sửa XP
- Sửa points
- Sửa streak
- Giả danh checker qua verified_by
- Đọc data riêng của người khác
- Tạo reward_offers
- Ghi penalty_logs
- Ghi admin_logs
```

---

## 12. Firebase RTDB Structure Lock

### 12.1 system_config

Path:

```txt
/system_config
```

Lưu cấu hình chung:

```txt
XP ratio
point ratio
penalty cap
reward threshold
streak rule
daily reset config
economy config
current_month_node
```

Read:

```txt
auth != null
```

Write:

```txt
admin only
```

---

### 12.1.1 current_month_node Lock

`system_config` phải có pointer tháng hiện tại để frontend hooks, daily reset engine, cron engine và approval pages biết partition daily log nào đang active.

Required field:

```json
{
  "current_month_node": "daily_logs_2026_05"
}
```

Ý nghĩa:

```txt
current_month_node = tên node daily_logs_YYYY_MM hiện tại
```

Ví dụ:

```txt
/system_config/current_month_node = "daily_logs_2026_05"
```

Frontend và backend không được tự đoán node tháng nếu `system_config/current_month_node` đã tồn tại.

Nếu thiếu `current_month_node`, các luồng sau có thể hỏng:

```txt
- load daily logs
- player task list
- checker approval queue
- daily reset
- reward_offers
- cron summary
```

`current_month_node` do admin/backend quản lý.

---

### 12.2 users

Path:

```txt
/users/{user_id}
```

Schema:

```json
{
  "name": "Bảo Lâm",
  "role": "player",
  "pass_pin": "******",
  "stats": {
    "level": 1,
    "current_xp": 0,
    "total_points": 0,
    "current_streak": 0,
    "daily_penalty_accumulated": 0
  }
}
```

Ghi chú:

```txt
pass_pin có thể tồn tại legacy
pass_pin không phải security boundary
Login phải qua Firebase Auth
Không đọc pass_pin trước Firebase login
```

Read:

```txt
Owner đọc field của mình
Admin/checker đọc dashboard cần thiết
pass_pin chỉ owner/admin đọc nếu rules cho phép
```

Write:

```txt
admin only
backend/Admin SDK có thể update stats
```

Cấm mở:

```json
"users": {
  ".read": true
}
```

---

### 12.3 user_index

Path:

```txt
/user_index/{user_id}: true
```

Ví dụ:

```json
{
  "blam_01": true,
  "blinh_02": true
}
```

Dùng để checker/admin biết danh sách user cần load dashboard.

Read:

```txt
admin/checker
```

Write:

```txt
admin only
```

Schema:

```txt
value must be boolean
```

---

### 12.4 task_templates

Path:

```txt
/task_templates/{task_id}
```

Schema gợi ý:

```json
{
  "name": "Đọc sách 20 phút",
  "description": "Đọc sách hoặc truyện phù hợp độ tuổi",
  "owner_id": "blam_01",
  "difficulty_level": 3,
  "xp_reward": 10,
  "point_reward": 5,
  "category": "reading",
  "active": true
}
```

Read:

```txt
auth != null
```

Write:

```txt
admin only
```

Index bắt buộc trong `firebase_rules_LOCKED_v2.json` sau patch:

```json
".indexOn": ["owner_id"]
```

---

### 12.5 task_batches

Path:

```txt
/task_batches/{batch_id}
```

Dùng để lưu batch nhiệm vụ sinh theo ngày/lịch.

Read:

```txt
auth != null
```

Write:

```txt
admin only
```

---

### 12.6 daily_logs

Path động theo tháng:

```txt
/daily_logs_YYYY_MM/{YYYY-MM-DD}/{user_id}
```

Ví dụ:

```txt
/daily_logs_2026_05/2026-05-30/blam_01
```

Node con chính:

```txt
summary
tasks
reward_offers
```

Read:

```txt
owner/admin/checker
```

Không đặt broad `.read` hoặc `.write` ở `$monthly_log` nếu làm cascade mở dữ liệu ngoài ý muốn.

---

## 13. Daily Summary

Path:

```txt
/daily_logs_YYYY_MM/{date}/{user_id}/summary
```

Schema:

```json
{
  "completion_rate": 0,
  "status": "ongoing",
  "reward_78_unlocked": false,
  "reward_100_unlocked": false,
  "xp_granted": 0,
  "points_granted": 0
}
```

Allowed status:

```txt
ongoing
incomplete
partial
completed
```

Reward persistence:

```txt
reward_78_unlocked: false -> true only
reward_100_unlocked: false -> true only
```

Không rollback từ `true` về `false`.

Admin SDK bypasses rules, nên backend cũng phải tự giữ luật one-way lock.

---

## 14. Daily Tasks

Path:

```txt
/daily_logs_YYYY_MM/{date}/{user_id}/tasks/{task_id}
```

Schema:

```json
{
  "status": "todo",
  "xp_earned": 10,
  "point_earned": 5,
  "verified_by": "mom_03",
  "updated_at": 1710000000000
}
```

Allowed status:

```txt
todo
pending
approved
rejected
```

---

## 15. Task State Machine Lock

Luồng hợp lệ:

```txt
todo -> pending -> approved
todo -> pending -> rejected
```

Player chỉ được:

```txt
todo -> pending
```

Checker chỉ được:

```txt
pending -> approved
pending -> rejected
```

Admin/backend có thể ghi theo logic hệ thống.

---

### 15.1 Parent Approval Architecture Reference

Chi tiết approval queue rules, anti-bypass rules, parent decision flow, checker responsibility, và approval-to-economy boundary được định nghĩa trong:

```txt
PARENT_APPROVAL_ARCHITECTURE_LOCKED.md
```

`COREGAME_LOCK.md` chỉ khóa state machine cấp cao:

```txt
todo -> pending -> approved
todo -> pending -> rejected
```

`PARENT_APPROVAL_ARCHITECTURE_LOCKED.md` là authority document cho:

```txt
- checker queue
- approval screen
- anti-bypass approval
- parent approval responsibility
- task approval boundary
- reward approval boundary
```

Không được merge `PARENT_APPROVAL_ARCHITECTURE_LOCKED.md` vào `COREGAME_LOCK.md`.

Không được sửa approval architecture nếu chỉ đang patch coregame hoặc economy.

---

## 16. XP / Point Fields Lock

Fields:

```txt
xp_earned
point_earned
```

Luật:

```txt
Admin/backend được set giá trị
Player không được tạo giá trị mới
Player/checker được giữ nguyên giá trị đã tồn tại khi update status
Không ai ngoài admin/backend được sửa XP/point
```

Rule pattern đã chốt:

```js
auth.token.role == 'admin'
|| !newData.exists()
|| (data.exists() && data.val() == newData.val())
```

Không được đổi lại thành:

```js
auth.token.role == 'admin' || !newData.exists()
```

vì sẽ block Player/Checker sau khi backend đã ghi XP/point.

---

## 17. verified_by Lock

Field:

```txt
verified_by
```

Luật:

```txt
Admin/checker được ghi
Player không được tạo hoặc sửa
Ngăn player giả danh người duyệt
```

Rule pattern:

```js
auth.token.role == 'admin'
|| auth.token.role == 'checker'
|| !newData.exists()
```

---

## 18. Reward Offers

Path:

```txt
/daily_logs_YYYY_MM/{date}/{user_id}/reward_offers/{offer_id}
```

Reward offer là phần thưởng cụ thể được backend/admin sinh ra cho một ngày cụ thể.

Schema:

```json
{
  "offer_id": "offer_001",
  "user_id": "blam_01",
  "owner_id": "blam_01",
  "child_scope": "blam",
  "reward_id": "reward_001",
  "reward_name": "Thêm 10 phút màn hình",
  "reward_tier": "small",
  "reward_category": "screen_time",
  "daily_slot_type": "normal_daily",
  "status": "offered",
  "value_score": 80,
  "desire_score": 9,
  "shop_price_points": 0,
  "screen_time_flag": true,
  "screen_time_minutes": 10,
  "requires_parent_approval": true,
  "approval_basis": "daily_completion",
  "anchor_reward_flag": false,
  "anchor_bucket": "daily",
  "parent_script": "auto_daily_reward",
  "created_at": 1710000000000,
  "expires_at": 1710086400000,
  "claimed_at": 0,
  "created_by": "system",
  "source": "daily_engine"
}
```

Read:

```txt
owner/admin/checker
```

Write:

```txt
admin only
```

Không dùng:

```json
".read": true
".write": false
```

trong bản Firebase Auth hiện tại.

---

## 19. Reward Offers Migration Lock

`reward_offers` là schema migration đã được approve để patch vào **file cũ**:

```txt
firebase_rules_LOCKED_v2.json
```

Không tạo file mới tên:

```txt
firebase_rules_LOCKED_v3.json
```

Nội dung `firebase_rules_LOCKED_v2.json` sau patch phải cho phép node `reward_offers` trong:

```txt
/daily_logs_YYYY_MM/{date}/{user_id}/reward_offers/{offer_id}
```

với auth layer đầy đủ.

Trước khi code frontend/backend sử dụng `reward_offers`, phải bảo đảm `firebase_rules_LOCKED_v2.json` đã được patch và deploy.

---

## 20. Transactions

Path:

```txt
/transactions/{user_id}/{trans_id}
```

Schema:

```json
{
  "user_id": "blam_01",
  "item_type": "store_item",
  "item_id": "item_001",
  "cost": 20,
  "status": "pending_delivery",
  "created_at": 1710000000000,
  "updated_at": 1710000000000
}
```

Allowed status:

```txt
pending_delivery
delivered
cancelled
```

Player được tạo transaction nếu:

```txt
auth.uid == user_id
transaction chưa tồn tại
status == pending_delivery
cost khớp store_items/{item_id}/cost
users/{user_id}/stats/total_points >= cost
store_items/{item_id}/stock > 0
```

Checker được đổi:

```txt
pending_delivery -> delivered
pending_delivery -> cancelled
```

---

## 21. Penalty Logs

Path:

```txt
/penalty_logs/{user_id}/{pen_id}
```

Schema:

```json
{
  "user_id": "blam_01",
  "points_deducted": 5,
  "reason": "Không hoàn thành nhiệm vụ",
  "created_by": "dad_04",
  "created_at": 1710000000000
}
```

Write:

```txt
admin only
```

Read:

```txt
owner/admin/checker
```

Immutable:

```txt
user_id
points_deducted
created_at
```

---

## 22. Rewards

Path:

```txt
/rewards/{reward_id}
```

Reward master list.

Schema gợi ý:

```json
{
  "owner_id": "blam_01",
  "name": "Thêm 10 phút màn hình",
  "type": "screen_time",
  "lifecycle": {
    "claim_type": "manual",
    "expiry": "daily"
  }
}
```

Read:

```txt
auth != null
```

Write:

```txt
admin only
```

---

## 23. Reward Batches

Path:

```txt
/reward_batches/{batch_id}
```

Schema:

```json
{
  "owner_id": "blam_01",
  "reward_level": 3,
  "status": "active",
  "created_by": "dad_04",
  "rewards": {}
}
```

Allowed status:

```txt
active
inactive
```

Read:

```txt
auth != null
```

Write:

```txt
admin only
```

---

## 24. Achievements

Path:

```txt
/achievements/{achievement_id}
```

Schema:

```json
{
  "owner_id": "blam_01",
  "type": "streak",
  "name": "5 ngày liên tiếp",
  "xp_bonus": 20,
  "point_bonus": 10,
  "created_by": "system",
  "date": "2026-05-30",
  "created_at": 1710000000000
}
```

Read:

```txt
auth != null
```

Write:

```txt
admin only
```

---

## 25. Admin Logs

Path:

```txt
/admin_logs/{log_id}
```

Schema:

```json
{
  "action_type": "override_points",
  "target_user": "blam_01",
  "value_changed": {},
  "reason": "Manual correction",
  "created_at": 1710000000000
}
```

Read:

```txt
admin only
```

Write:

```txt
admin only
```

Audit logs không nên bị delete.

---

## 26. Backend / Cloud Functions / Admin SDK

Firebase Rules không làm toán game.

Backend/Admin SDK xử lý:

```txt
Tạo daily logs
Clone task_templates vào daily_logs
Tính completion_rate
Cộng XP
Cộng points
Unlock reward_78 / reward_100
Sinh reward_offers
Trừ points khi mua
Trừ stock
Tính streak
Áp dụng penalty cap
Ghi admin_logs
```

Admin SDK bypasses Firebase Rules, nên backend phải tự giữ invariant:

```txt
Không rollback reward unlock
Không ghi sai economy
Không phá audit log
Không double spend
Không trừ điểm âm
```

---

## 27. Lock File Authority

Các lock file liên quan phải giữ đúng vai trò riêng:

```txt
COREGAME_LOCK.md
ECONOMY_LOCK.md
ENGINE_RULES_LOCK.md
PARENT_APPROVAL_ARCHITECTURE_LOCKED.md
TREE_STRUCTURE_LOCK.md
firebase_rules_LOCKED_v2.json
```

Không được merge các lock file này với nhau.

Không được đổi tên file.

Không được tạo bản `v3`, `v7`, `FINAL` nếu user không yêu cầu.

---

## 28. Final Coregame Lock

Không được quay lại no-auth.

Không được thay Firebase Auth bằng frontend PIN/localStorage.

Không được dùng `.read: true` cho sensitive nodes.

Không được để AI rewrite rules theo mô hình khác.

Không đổi tên file lock cũ.

Firebase Auth là security boundary.

PIN chỉ là password để đăng nhập Firebase Auth.

Core gameplay không đổi khi migrate Auth.
