# PARENT APPROVAL ARCHITECTURE (LOCKED v1)

**Status:** LOCKED (Production-Ready)
**System:** Family Education Game App
**Stack:** React/Next.js, Firebase Realtime Database (RTDB), Cronjob Backend

## LOCKED PRINCIPLES

### 1. Frontend = State Changer + Authority Reader
**Frontend được phép:**
- Chuyển đổi trạng thái task (Approve/Reject) thông qua `runTransaction` an toàn.
- Render UI realtime dựa trên thay đổi của database.
- Đọc các trạng thái Summary/Economy Authority.

**Frontend TUYỆT ĐỐI KHÔNG:**
- Mint (Đúc) rewards hoặc XP.
- Tự quyết định unlock rewards.
- Trực tiếp update wallet/ledger/streak/stats.
- Tự quyết định/tính toán các Economy States mang tính quyết định (Authority).

### 2. Cronjob = Economy Authority
`task_approval.js` (Backend Cronjob) là **Authority duy nhất** cho:
- Quyết định Reward unlock.
- Tính toán `completion_rate` chính thức.
- Xử lý Streak logic.
- Ghi nhận Ledger và Wallet balance.
- Cấp (Grant) XP và Points.
- Các Derived States liên quan đến kinh tế.

### 3. Tasks Node = Operational State
Nhiệm vụ của node `tasks`:
- Phục vụ Realtime Queue.
- Cung cấp dữ liệu để Render Task List.
- Đếm số lượng hành vi bề mặt (Operational counts).

### 4. Summary Node = Derived Authority State
Nhiệm vụ của node `summary`:
- Lưu trữ Reward flags (`reward_78_unlocked`, `reward_100_unlocked`).
- Lưu trữ Completion rate chính thức.
- Phục vụ các UI liên quan đến kinh tế.

### 5. Queue ≠ Dashboard (Separation of Concerns)
- **Approval Queue:** Giao diện hành động (Transactional UI). Chỉ pull và xử lý các task ở trạng thái `submitted`.
- **Dashboard:** Giao diện phân tích (Analytics UI). Đọc và hiển thị số liệu từ cả Operational và Authority.

### 6. Frontend Calculations
- Các logic tính toán ở Frontend chỉ phục vụ mục đích Temporary Realtime UX.
- Chúng KHÔNG BAO GIỜ được dùng làm Economy Authority.

### 7. Monotonic Economy Principle
- Trạng thái kinh tế chỉ có thể tăng tiến thông qua sự xác thực của Backend Authority.
- Replay-Safe, Idempotent và Deterministic.
