# FINAL GAME ECONOMY SYSTEM SPECIFICATION (LOCKED)  
  
## 1. ARCHITECTURE OVERVIEW  
  
Hệ thống Economy Engine vận hành dựa trên kiến trúc Cron-based Stateful Ledger Architecture. Hệ thống sử dụng cơ chế Stateless Batch Processing, được kích hoạt tự động bởi GitHub Actions Cron Engine mỗi 5 phút, thay thế hoàn toàn mô hình event-driven Cloud Functions.  
  
Core Principles (Nguyên tắc cốt lõi):  
* Idempotent: Hệ thống thực thi 1 lần hay nhiều lần trên cùng một dataset đều đảm bảo một trạng thái đầu ra duy nhất.  
* Retry-safe: An toàn khi thực thi lại do lỗi mạng, crash hoặc timeout.  
* Race-condition-safe: Xử lý triệt để tranh chấp dữ liệu khi các chu kỳ Cron chạy chồng chéo (overlap).  
* Stateless Batch Processing: Engine không lưu trữ trạng thái trong memory, mọi quyết định tính toán đều dựa trên Database Ledger.  
* Monotonic State: Trạng thái tài sản và phần thưởng chỉ có chiều tịnh tiến (tăng/chốt), không quay lui.  
* Delta Reward System: Phần thưởng được cấp phát dựa trên độ chênh lệch (delta) giữa tổng nỗ lực thực tế và tổng tài sản đã cấp.  
  
---  
  
## 2. DATA SCHEMA & SOURCE OF TRUTH  
  
Kiến trúc quy định rõ ranh giới dữ liệu: tasks chỉ đóng vai trò là Input Events (Sự kiện đầu vào), trong khi summary đóng vai trò là State Ledger (Sổ cái trạng thái) và là Single Source of Truth duy nhất phục vụ tính toán phần thưởng.  
  
### 2.1. PATH CƠ SỞ  
daily_logs_{yyyy_mm}/{date}/{user_id}/  
  
### 2.2. DATA STRUCTURE  
  
// TASKS (Input Events Only)  
"tasks": {  
  "{task_id}": {  
    "status": "pending | approved | rejected",  
    "xp_earned": number,  
    "point_earned": number  
  }  
}  
  
// SUMMARY (State Ledger - Single Source of Truth)  
"summary": {  
  "completion_rate": number,       // Format: 0 -> 100  
  "reward_78_unlocked": boolean,   // Monotonic flag  
  "reward_100_unlocked": boolean,  // Monotonic flag  
  "xp_granted": number,            // Cumulative Ledger (Monotonic)  
  "points_granted": number         // Cumulative Ledger (Monotonic)  
}  
  
// USERS (Target Wallet)  
"users/{user_id}": {  
  "role": "player",  
  "current_xp": number,  
  "total_points": number,  
  "level": number,  
  "current_streak": number  
}  
  
// SYSTEM CONFIG  
"system_config/level_thresholds": {  
  "1": 0,  
  "2": 300,  
  "3": 700,  
  ...  
}  
  
---  
  
## 3. CORE ECONOMY PRINCIPLES  
  
### 3.1. MONOTONIC STATE  
Các trường dữ liệu sau thuộc nhóm ONE-WAY / MONOTONIC STATE (Trạng thái đơn điệu). Hệ thống chỉ được phép chuyển đổi từ false -> true hoặc tăng dần giá trị số học:  
* reward_78_unlocked  
* reward_100_unlocked  
* xp_granted  
* points_granted  
  
### 3.2. KHÔNG BAO GIỜ ROLLBACK  
Nghiêm cấm mọi hành vi (bao gồm cả manual admin override) lùi trạng thái hệ thống. KHÔNG BAO GIỜ:  
* Rollback reward flags (true -> false)  
* Rollback xp_granted  
* Rollback points_granted  
  
### 3.3. DELTA-BASED REWARD  
Giá trị phần thưởng (XP, Points) phải được tính toán động (dynamically calculated) bằng công thức độ lệch chuẩn:  
* deltaXp = totalApprovedXp - xp_granted  
* deltaPoints = totalApprovedPoints - points_granted  
  
### 3.4. CƠ CHẾ IDEMPOTENCY  
Tính tất định (Idempotency) CHỈ được phép dựa vào Sổ cái: summary.xp_granted và summary.points_granted.  
  
### 3.5. FIREBASE CONSTRAINTS (DEPRECATED METHODS)  
Để đảm bảo an toàn tuyệt đối trên Production, hệ thống Economy CẤM TUYỆT ĐỐI sử dụng các phương pháp sau:  
* Cloud Functions event-driven assumptions  
* Task-level processed flags (is_rewarded ở từng task)  
* rewardProcessed flag  
* Kỹ thuật approved_at hacks (sign-flip timestamp)  
* Array slicing (cắt mảng để phân biệt task cũ/mới)  
* Task ordering delta calculation (tính reward dựa trên thứ tự duyệt task)  
  
---  
  
## 4. FUNCTION B — CRON-BASED ECONOMY ENGINE (FLOW)  
  
Quy trình này được Cron Engine thực thi định kỳ mỗi 5 phút. Quy trình áp dụng Stateless Batch Processing, lặp qua tất cả user.  
  
### STEP 1 — SCAN INPUT (RETROACTIVE APPROVAL SUPPORT)  
Cron Engine bắt buộc phải hỗ trợ duyệt bù task (delayed/retroactive approval) thông qua Window cho phép.  
* Action: Quét toàn bộ dữ liệu log của TODAY và YESTERDAY.  
* Path:  
  * daily_logs_{currentMonth}/{today}/*  
  * daily_logs_{currentMonth}/{yesterday}/*  
* (Lưu ý: KHÔNG quét sâu hơn yesterday để chống suy giảm hiệu năng và rủi ro replay).  
  
### STEP 2 — AGGREGATE TASKS  
Từ snapshot của các task được quét, tính toán 4 chỉ số tổng hợp:  
* totalTasks  
* approvedTasks  
* totalApprovedXp (Tổng xp_earned của các task status == "approved")  
* totalApprovedPoints (Tổng point_earned của các task status == "approved")  
  
### STEP 3 — CALCULATE COMPLETION RATE  
* Formula: completion_rate = Math.floor((approvedTasks / totalTasks) * 100)  
* Format: Bắt buộc sử dụng integer 0 -> 100 (KHÔNG dùng float 0 -> 1).  
  
### STEP 4 — READ CURRENT STATE  
Đọc trạng thái hiện tại từ Sổ cái (summary):  
* reward_78_unlocked  
* reward_100_unlocked  
* xp_granted  
* points_granted  
  
### STEP 5 — CALCULATE DELTA  
Tính toán chênh lệch phần thưởng cần cấp phát:  
* deltaXp = totalApprovedXp - xp_granted  
* deltaPoints = totalApprovedPoints - points_granted  
  
### STEP 6 — TRANSACTION LOCK (SUMMARY)  
* Rule: BẮT BUỘC khởi tạo Firebase Transaction tại node summary. Các step từ 7 đến 12 phải nằm trong transaction này để chống race condition. Mục tiêu là khóa update đồng thời cho completion_rate, reward flags, và granted ledger.  
  
### STEP 7 — REWARD GATEWAYS  
Kiểm tra các mốc phần thưởng dựa trên completion_rate.  
* (Lưu ý: completion_rate có thể nhảy trực tiếp từ 0 -> 100 trong 1 chu kỳ. Hệ thống PHẢI hỗ trợ kích hoạt BOTH Gateways tuần tự).  
  
GATEWAY 78%:  
IF (completion_rate >= 78 AND reward_78_unlocked != true) THEN:  
  - Set trigger_streak_check = true  
  - Set reward_78_unlocked = true  
  
GATEWAY 100%:  
IF (completion_rate == 100 AND reward_100_unlocked != true) THEN:  
  - Set reward_100_unlocked = true  
  
### STEP 8 — USER REWARD TRANSACTION  
* Rule: Mở transaction tại node users/{user_id}.  
* APPLY DELTA:  
  * current_xp += deltaXp  
  * total_points += deltaPoints  
  
### STEP 9 — LEVEL SYSTEM  
Kiểm tra thăng cấp dựa trên bảng cấu hình tĩnh.  
* Rule: Dùng /system_config/level_thresholds. KHÔNG dùng công thức level * xp.  
  IF current_xp >= level_thresholds[current_level + 1] THEN:  
      level += 1  
  
### STEP 10 — STREAK SYSTEM (NULL-SAFE)  
* Rule: STREAK KHÔNG kích hoạt theo task. Streak CHỈ kích hoạt khi reward_78_unlocked được unlock lần đầu tiên trong ngày (trigger_streak_check == true từ Step 7).  
* Null-safe First Day Logic: Nếu dữ liệu hôm qua không tồn tại (user mới), mặc định yesterday.completion_rate = 0.  
* Flow:  
  IF (trigger_streak_check == true):  
      IF (yesterday summary does not exist):  
          yesterday_completion_rate = 0  
            
      IF (yesterday_completion_rate >= 78):  
          current_streak += 1  
      ELSE:  
          current_streak = 1  
  
### STEP 11 — STREAK BONUS  
* Rule: Check bonus dựa trên biến current_streak VỪA ĐƯỢC CẬP NHẬT ở Step 10.  
  IF current_streak == 7:  
      total_points += 50  
  IF current_streak == 30:  
      total_points += 300  
  
### STEP 12 — UPDATE LEDGER  
Sau khi apply reward thành công lên user, cập nhật Sổ cái (Ledger chỉ tăng).  
  xp_granted = totalApprovedXp  
  points_granted = totalApprovedPoints  
*(Commit Firebase Transaction tại đây).*  
  
### STEP 13 — FAIL SAFE  
Nếu có bất kỳ lỗi nào xảy ra trong phiên chạy:  
* Lỗi 1 user data / Transaction fail / Data invalid.  
* THEN: Log error -> Skip user hiện tại -> Tiếp tục loop các user khác.  
* CẤM: Không được crash toàn bộ Engine, đảm bảo batch processing tiếp tục chạy.  
  
---  
  
## 5. STREAK SYSTEM & EXECUTION EXAMPLES  
  
Thứ tự thực thi của Streak System BẮT BUỘC BỊ KHÓA (EXPLICIT STREAK EXECUTION ORDER) theo đúng tuyến tính: Step 10 (Tính toán cập nhật current_streak) -> Step 11 (Kiểm tra Bonus dựa trên cập nhật mới nhất, KHÔNG dùng previous value).  
  
### 5.1. STREAK GRANT BONUS EXAMPLE  
* Day 6: completion_rate = 100%  
* Day 7: completion_rate = 100%  
* Step 10: Yesterday completion_rate >= 78 => current_streak = 6 + 1 = 7.  
* Step 11: Check current_streak == 7 => Khớp điều kiện => grant +50 points.  
  
### 5.2. STREAK RESET EXAMPLE  
* Day 6: completion_rate = 50%  
* Day 7: completion_rate = 100%  
* Step 10: Yesterday completion_rate < 78 => current_streak = 1 (Chuỗi bị reset/bắt đầu lại).  
* Step 11: Check current_streak == 1 => Không thỏa mãn 7 hoặc 30 => NO bonus granted.  
  
---  
  
## 6. CONCURRENCY & LEDGER MODEL RATIONALE  
  
Hệ thống Economy Engine bắt buộc phải hỗ trợ: GitHub Actions overlap, concurrent cron execution, retry-safe execution, duplicate run safety.  
  
Vì sao completion_rate KHÔNG ĐỦ để tính Delta XP?  
* Nó chỉ là Aggregate state (% tổng hợp).  
* Không chứa Reward history (Không biết 10% vừa tăng đến từ task lớn hay task nhỏ).  
* Task order không deterministic (Không xác định trước thứ tự Parent sẽ approve).  
  
Vì sao Cron Engine cần CUMULATIVE LEDGER (xp_granted, points_granted)?  
* Cron chạy dạng Snapshot-based processing (Chỉ lấy dữ liệu hiện tại, không có event history lưu theo thời gian).  
* Ledger bắt buộc phải tồn tại để đóng vai trò đối chiếu (Replay-safe idempotency). Kể cả khi 2 cron chạy cùng 1 giây, tiến trình đầu tiên update Ledger xong, tiến trình thứ hai sẽ có totalApproved - granted = 0 (Delta = 0), ngăn chặn hoàn toàn race-condition và double reward.  
  
---  
  
## 7. SYSTEM INTEGRATION NOTES  
  
Hệ thống Economy Engine (Function B) đóng vai trò lõi, các Function khác phải tương tác dựa trên boundary khắt khe:  
  
### 7.1. FUNCTION A — DAILY RESET  
* Boundary: Chịu trách nhiệm reset daily tasks cho ngày mới.  
* Lock: KHÔNG ĐƯỢC PHÉP reset xp_granted hay points_granted của quá khứ cho đến khi dữ liệu được chuyển vào archive theo retention policy. Sổ cái phải được nguyên vẹn để phục vụ Retroactive Approval.  
  
### 7.2. FUNCTION C — PENALTY SYSTEM  
* Boundary: Hệ thống phạt hoạt động độc lập để trừ điểm hành vi.  
* Lock: KHÔNG ĐƯỢC PHÉP rollback hay can thiệp vào Ledger (xp_granted, points_granted).  
  
### 7.3. FUNCTION D — REWARD / STORE SYSTEM  
* Boundary: Quản lý giao dịch đổi điểm lấy quà của User.  
* Lock: Reward Store CHỈ được phép đọc total_points và level để xử lý thanh toán. KHÔNG được đọc hay chỉnh sửa xp_granted và points_granted. Ledger hoàn toàn độc lập với luồng e-commerce.  
