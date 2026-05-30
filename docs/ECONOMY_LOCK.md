# ECONOMY_LOCK.md

# Bảo Lâm / Bảo Linh Family Education Game

## Economy Lock — Firebase Auth Model

---

## 1. File Identity Lock

Tên file này phải giữ nguyên:

```txt
ECONOMY_LOCK.md
```

Không đổi tên thành:

```txt
Economy.txt
ecomomy
ECONOMY_LOCKED_v7.md
ECONOMY_LOCKED_FINAL.md
economy_v3.md
```

Mọi cập nhật economy phải được ghi vào đúng file `ECONOMY_LOCK.md`.

---

## 2. Mục tiêu Economy

Game economy dùng để:

```txt
- Tạo động lực hoàn thành nhiệm vụ
- Chuyển công sức học tập thành XP và điểm
- Cho trẻ đổi điểm lấy phần thưởng
- Khuyến khích streak và hoàn thành ngày
- Giữ hệ thống công bằng
- Chống gian lận điểm, reward, transaction
```

---

## 3. Economy Auth Boundary Lock

Economy sử dụng Firebase Auth làm security boundary.

Client identity:

```js
auth.uid
```

Role:

```js
auth.token.role
```

Không dùng frontend PIN/localStorage để quyết định quyền ghi economy.

PIN chỉ là Firebase Auth password.

Các write quan trọng của economy phải do:

```txt
admin
backend
Admin SDK
Cloud Functions
trusted cron
```

hoặc rule auth-based cho phép rõ ràng.

---

## 4. User IDs và Roles

User IDs phải trùng Firebase Auth UID và database user_id:

```txt
blam_01
blinh_02
mom_03
dad_04
```

Roles:

```txt
dad_04   -> admin
mom_03   -> checker
blam_01  -> player
blinh_02 -> player
```

Player không được ghi trực tiếp vào economy stats.

---

## 5. Firebase Rules File Name Lock

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

## 6. User Economy Stats

Path:

```txt
/users/{user_id}/stats
```

Schema:

```json
{
  "level": 1,
  "current_xp": 0,
  "total_points": 0,
  "current_streak": 0,
  "daily_penalty_accumulated": 0
}
```

Field meaning:

```txt
level = cấp hiện tại
current_xp = XP hiện tại trong cấp
total_points = điểm có thể tiêu
current_streak = chuỗi ngày hoàn thành
daily_penalty_accumulated = tổng điểm phạt trong ngày
```

Player không được tự sửa stats.

Stats được update bởi admin/backend.

---

## 7. XP và Points

Mỗi task có:

```txt
xp_earned
point_earned
```

Nguyên tắc:

```txt
XP dùng để lên cấp
Points dùng để mua reward/shop
Points không được âm
XP không được âm
Player không tự ghi XP/points
Checker không tự sửa XP/points
Backend/admin là nguồn ghi đáng tin cậy
```

---

## 8. Task Reward Ratio

Quy tắc mặc định:

```txt
point_earned = xp_earned / 2
```

Điểm phải là integer.

Không dùng số thập phân.

Ví dụ hợp lệ:

```txt
XP 10 -> Point 5
XP 20 -> Point 10
XP 30 -> Point 15
```

Ví dụ không hợp lệ:

```txt
XP 15 -> Point 7.5
XP 25 -> Point 12.5
```

Seed task phải bảo đảm `point_reward` là integer.

---

## 9. XP / Point Anti-Cheat

Fields:

```txt
xp_earned
point_earned
```

Rule pattern đúng:

```js
auth.token.role == 'admin'
|| !newData.exists()
|| (data.exists() && data.val() == newData.val())
```

Ý nghĩa:

```txt
Admin/backend được ghi giá trị
Player không được tạo giá trị mới
Player/checker được giữ nguyên giá trị khi update status
Không ai ngoài admin/backend được sửa XP/point
```

Không được dùng pattern sai:

```js
auth.token.role == 'admin' || !newData.exists()
```

Pattern sai này sẽ block player/checker sau khi backend đã ghi XP/point.

---

## 10. Completion Rate

Daily completion rate:

```txt
completion_rate = approved_tasks / total_tasks * 100
```

Allowed range:

```txt
0 <= completion_rate <= 100
```

Trạng thái ngày:

```txt
ongoing
incomplete
partial
completed
```

Backend chịu trách nhiệm tính toán.

Rules chỉ validate schema/range.

---

## 11. Daily Reward Unlock Thresholds

Hệ thống có hai ngưỡng reward daily:

```txt
78%
100%
```

### 11.1 reward_78_unlocked

Bật khi completion_rate đạt ngưỡng 78%.

Persistence:

```txt
false -> true allowed
true -> false forbidden
```

### 11.2 reward_100_unlocked

Bật khi completion_rate đạt 100%.

Persistence:

```txt
false -> true allowed
true -> false forbidden
```

Cloud Functions/Admin SDK cũng phải tự giữ luật này vì Admin SDK bypasses rules.

---

## 12. Reward Offers

Reward offer là phần thưởng cụ thể được sinh ra cho một user trong một ngày.

Path:

```txt
/daily_logs_YYYY_MM/{date}/{user_id}/reward_offers/{offer_id}
```

Reward offer không phải reward master.

Reward offer là instance hiển thị cho user.

---

## 13. Reward Offers Migration Lock

`reward_offers` là schema migration đã được approve để patch vào file cũ:

```txt
firebase_rules_LOCKED_v2.json
```

Không tạo file mới tên:

```txt
firebase_rules_LOCKED_v3.json
```

Trước khi frontend/backend sử dụng `reward_offers`, phải bảo đảm `firebase_rules_LOCKED_v2.json` đã được patch và deploy.

Patch bắt buộc gồm:

```txt
reward_offers rule trong daily_logs
auth-based read owner/admin/checker
admin-only write
schema validation đầy đủ
```

---

## 14. Reward Offer Permission Lock

Reward offers phải dùng Firebase Auth.

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

Player không được tự tạo hoặc sửa reward offer.

Checker không được tự tạo reward offer.

---

## 15. Reward Offer Schema

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
  "parent_script": "daily_reward_engine",
  "created_at": 1710000000000,
  "expires_at": 1710086400000,
  "claimed_at": 0,
  "created_by": "system",
  "source": "daily_engine"
}
```

---

## 16. Reward Offer Status

Allowed status:

```txt
offered
claimed
expired
cancelled
```

Meaning:

```txt
offered = đang hiển thị cho user
claimed = đã nhận
expired = hết hạn
cancelled = bị hủy bởi parent/backend
```

Claim logic nên đi qua backend hoặc admin-controlled flow.

---

## 17. Reward Tier

Allowed reward_tier:

```txt
small
medium
large
special
special_medium
special_large
surprise
```

Tier dùng để phân loại độ lớn phần thưởng.

---

## 18. Daily Slot Type

Allowed daily_slot_type:

```txt
normal_daily
daily_screen_boost_78
daily_screen_boost_100
streak_5_screen
streak_10_screen
streak_5_reward
streak_10_reward
shop
surprise
```

Ý nghĩa:

```txt
normal_daily = reward thường
daily_screen_boost_78 = reward khi đạt 78%
daily_screen_boost_100 = reward khi đạt 100%
streak_5_screen = reward màn hình cho streak 5 ngày
streak_10_screen = reward màn hình cho streak 10 ngày
streak_5_reward = reward vật phẩm cho streak 5 ngày
streak_10_reward = reward vật phẩm cho streak 10 ngày
shop = reward mua bằng điểm
surprise = reward bất ngờ
```

---

## 19. Value Score và Desire Score

```txt
value_score: 1..100
desire_score: 1..10
```

`value_score` đo giá trị hệ thống.

`desire_score` đo mức hấp dẫn với trẻ.

Reward tốt nên có desire_score phù hợp độ tuổi, sở thích và mục tiêu giáo dục.

---

## 20. Screen Time Reward

Fields:

```txt
screen_time_flag
screen_time_minutes
```

Rules:

```txt
screen_time_minutes >= 0
screen_time_minutes <= 150
```

Screen time reward phải được parent/backend kiểm soát.

---

## 21. Parent Approval

Fields:

```txt
requires_parent_approval
approval_basis
parent_script
```

Nếu reward nhạy cảm hoặc cần xác nhận thực tế, phải yêu cầu parent approval.

Checker/parent approval flow phải tuân theo:

```txt
PARENT_APPROVAL_ARCHITECTURE_LOCKED.md
```

---

## 22. Anchor Rewards

Fields:

```txt
anchor_reward_flag
anchor_bucket
```

Anchor reward là reward có vai trò neo động lực mạnh.

Ví dụ:

```txt
reward cực kỳ thích
reward gắn với mục tiêu dài hạn
reward dùng để kéo engagement
```

---

## 23. Store Items

Path:

```txt
/store_items/{item_id}
```

Schema:

```json
{
  "name": "Đổi 20 phút chơi game",
  "cost": 50,
  "stock": 3,
  "owner_id": "blam_01",
  "created_by": "dad_04",
  "created_at": 1710000000000
}
```

Rules:

```txt
cost >= 0
stock >= 0
admin write
auth read
```

---

## 24. Shop Transactions

Path:

```txt
/transactions/{user_id}/{trans_id}
```

Player tạo transaction khi mua item.

Điều kiện:

```txt
auth.uid == user_id
status == pending_delivery
cost == store_items/{item_id}/cost
users/{user_id}/stats/total_points >= cost
store_items/{item_id}/stock > 0
```

Transaction status:

```txt
pending_delivery
delivered
cancelled
```

Checker có thể chuyển:

```txt
pending_delivery -> delivered
pending_delivery -> cancelled
```

---

## 25. Atomic Economy Requirement

Rules chỉ kiểm tra điều kiện.

Rules không trừ điểm.

Rules không trừ stock.

Các thao tác sau phải atomic ở backend:

```txt
total_points = total_points - cost
stock = stock - 1
transaction status update
admin log
```

Khuyến nghị dùng Cloud Functions/Admin SDK.

Nếu chưa dùng Cloud Functions, backend/script trusted vẫn phải bảo đảm không double spend.

---

## 26. Penalty System

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

Rules:

```txt
points_deducted > 0
created_at immutable
points_deducted immutable
admin write only
```

---

## 27. Daily Penalty Cap

Hệ thống có thể dùng:

```txt
daily_penalty_accumulated
```

để giới hạn tổng điểm bị phạt trong ngày.

Penalty cap phải do backend/admin logic xử lý.

Rules không cộng dồn được penalty cap.

---

## 28. Streak

Streak tăng khi ngày đạt điều kiện hoàn thành.

Gợi ý:

```txt
completion_rate >= 78% -> eligible streak
completion_rate == 100% -> perfect day
```

Streak reward có thể sinh ở:

```txt
streak_5_screen
streak_10_screen
streak_5_reward
streak_10_reward
```

Backend chịu trách nhiệm tính streak.

---

### 28.1 Engine Rules Reference

Chi tiết thuật toán streak, delta calculation, cron execution order, idempotency, reward grant order, fail-safe rules, và các bước engine runtime được định nghĩa trong:

```txt
ENGINE_RULES_LOCK.md
```

`ECONOMY_LOCK.md` khóa economy model:

```txt
- XP
- points
- reward
- reward_offers
- transactions
- penalty
- streak economy impact
```

`ENGINE_RULES_LOCK.md` khóa engine/business-rule execution:

```txt
- daily cron steps
- approval handler
- XP/points delta calculation
- reward unlock execution
- streak calculation execution
- fail-safe and idempotency
```

Hai file này là hai lock riêng biệt.

Không được merge `ECONOMY_LOCK.md` với `ENGINE_RULES_LOCK.md`.

Nếu có mâu thuẫn về cách chạy engine, ưu tiên `ENGINE_RULES_LOCK.md`.

Nếu có mâu thuẫn về economy schema hoặc reward model, ưu tiên `ECONOMY_LOCK.md`.

---

## 29. Achievements Economy

Path:

```txt
/achievements/{achievement_id}
```

Achievement có thể cộng:

```txt
xp_bonus
point_bonus
```

Achievement write:

```txt
admin/backend only
```

Achievement read:

```txt
auth != null
```

---

## 30. Admin Logs

Mọi thay đổi economy quan trọng nên ghi log:

```txt
/admin_logs/{log_id}
```

Ví dụ action_type:

```txt
grant_xp
grant_points
deduct_points
create_reward_offer
claim_reward
cancel_reward
override_transaction
apply_penalty
```

Admin logs không nên bị delete.

---

## 31. Economy Anti-Cheat Rules

Player không được:

```txt
Tự sửa total_points
Tự sửa current_xp
Tự sửa level
Tự sửa streak
Tự tạo penalty
Tự tạo reward offer
Tự sửa reward offer
Tự sửa xp_earned
Tự sửa point_earned
Tự fake verified_by
Tự sửa cost transaction
```

---

## 32. Economy Backend Responsibilities

Backend/Admin SDK chịu trách nhiệm:

```txt
Sinh daily task
Sinh reward offer
Cộng XP
Cộng points
Trừ points
Trừ stock
Unlock reward
Expire reward
Claim reward
Ghi admin log
Tính streak
Áp dụng penalty cap
Bảo vệ reward persistence
```

---

## 33. No-Auth Forbidden

Không được chuyển economy sang no-auth.

Không được dùng:

```txt
.read: true
.write: false
```

cho các node nhạy cảm cần phân quyền.

Không được bỏ:

```js
auth != null
auth.uid
auth.token.role
```

Firebase Auth là boundary chính.

---

## 34. Lock File Authority

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

## 35. Final Economy Lock

Economy chỉ hợp lệ khi:

```txt
Firebase Auth hoạt động
UID trùng user_id
Custom Claims có role
Rules auth-based được giữ nguyên
Backend xử lý toán học và atomic update
Reward persistence không bị rollback
Player không thể tự tạo giá trị economy
Tên file cũ được giữ nguyên
```

Đây là bản Economy lock cập nhật theo Firebase Auth model, dùng trực tiếp cho file `ECONOMY_LOCK.md`.
