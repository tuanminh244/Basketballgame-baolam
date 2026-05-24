# COREGAME.TXT - FINAL LOCK VERSION  
**AUTHORITATIVE ARCHITECTURE DOCUMENT & SINGLE SOURCE OF TRUTH**  
**PROJECT:** Family Education Game (2026 - 2036)  
  
---  
  
## 1. SYSTEM OVERVIEW  
  
**Mục tiêu hệ thống:**   
Một Gamified Life Simulator dành cho gia đình (4 thành viên), duy trì liên tục trong 10 năm. Giúp trẻ em xây dựng thói quen thông qua động lực nội tại (phát triển bản thân) và động lực ngoại tại (phần thưởng).  
  
**Philosophy (Triết lý cốt lõi):**  
*   **XP (Kinh nghiệm):** Đại diện cho sự tiến bộ dài hạn. Chỉ TĂNG, không bao giờ GIẢM (bảo vệ tâm lý trẻ).  
*   **Points (Điểm):** Đại diện cho tiền tệ kinh tế ngắn hạn. Có thể dùng để mua sắm và bị trừ đi khi tiêu dùng hoặc bị phạt.  
  
**4 Roles & Authentication (Plaintext PIN):**  
1.  **Bố (Admin):** Pass `004164` - Toàn quyền cấu hình, thiết lập kinh tế.  
2.  **Mẹ (Checker):** Pass `888330` - Kiểm duyệt, đánh giá tiến độ.  
3.  **Bảo Lâm (Player 1):** Pass `1234` - Thực thi nhiệm vụ.  
4.  **Bảo Linh (Player 2):** Pass `5678` - Thực thi nhiệm vụ.  
*(Hệ thống KHÔNG dùng Firebase Auth. PIN được check plaintext trực tiếp tại Client để tối ưu tốc độ cho trẻ em).*  
  
**Game Loop:**  
Giao việc (10 task/ngày) -> Thực thi -> Kiểm duyệt -> Tính toán & Trả thưởng -> Tiêu dùng.  
  
---  
  
## 2. CORE ARCHITECTURE  
  
Hệ thống được thiết kế dựa trên các nguyên lý kiến trúc sau:  
*   **Firebase RTDB FREE-First:** Lưu trữ trên Realtime Database. Dữ liệu siêu nhẹ, tối ưu để chạy miễn phí trong suốt 10 năm.  
*   **Flat NoSQL:** Không lồng ghép object quá 3 tầng. Dùng Object Key thay cho Array để tránh lỗi Index Shift.  
*   **Snapshot Cron Architecture:** KHÔNG dùng Firebase Cloud Functions. Mọi logic tính toán thưởng được trigger bằng GitHub Actions chạy mỗi 5 phút/lần.  
*   **Stateless Reward Engine:** Engine không giữ memory tạm thời. Mọi tính toán thưởng (Delta Calculation) đều dựa trên phép trừ giữa Snapshot thực tế và Cumulative Ledger (Sổ cái tích lũy).  
*   **Monotonic State Machine:** Trạng thái thưởng và tiến trình chỉ đi theo một chiều tiến lên (Monotonic).  
*   **Idempotency (Tính lũy đẳng):** Đảm bảo an toàn tuyệt đối, hệ thống dù có chạy trùng lặp (Overlap Cron) cũng không bao giờ phát sinh lỗi nhân đôi phần thưởng (Double Reward).  
  
---  
  
## 3. FINAL DATABASE STRUCTURE  
  
*Tất cả format dùng snake_case, Array được thay thế bằng Indexed Object.*  
  
{  
  "system_config": {  
    "timezone": "Asia/Ho_Chi_Minh",  
    "launch_date": "2026-05-01",  
    "current_month_node": "daily_logs_2026_05",  
    "level_thresholds": {  
      "2": 300, "3": 700, "4": 1300, "5": 2000, "6": 3000,  
      "7": 4500, "8": 6500, "9": 9000, "10": 12000  
    }  
  },  
  
  "users": {  
    "blam_01": {   
      "name": "Bảo Lâm", "role": "player", "pass_pin": "1234",   
      "stats": { "level": 1, "current_xp": 150, "total_points": 50, "current_streak": 5 }   
    },  
    "blinh_02": {   
      "name": "Bảo Linh", "role": "player", "pass_pin": "5678",   
      "stats": { "level": 1, "current_xp": 100, "total_points": 20, "current_streak": 3 }   
    },  
    "mom_03": { "name": "Mẹ", "role": "checker", "pass_pin": "888330" },  
    "dad_04": { "name": "Bố", "role": "admin", "pass_pin": "004164" }  
  },  
  
  "store_items": {  
    "item_01": {  
      "name": "30 phút chơi iPad", "cost": 100, "stock": 999,   
      "created_by": "dad_04", "created_at": 1683116000  
    }  
  },  
  
  "task_templates": {  
    "tmpl_blam_01": { "owner_id": "blam_01", "name": "Toán tư duy", "difficulty_level": 1, "xp_reward": 10, "point_reward": 5 },  
    "tmpl_blam_10": { "owner_id": "blam_01", "name": "Đọc sách TA 30p", "difficulty_level": 10, "xp_reward": 100, "point_reward": 50 }  
  },  
  
  "task_batches": {  
    "batch_blam_lvl1_01": {   
      "owner_id": "blam_01", "created_by": "dad_04", "status": "active",   
      "tasks": { "0": "tmpl_blam_01", "1": "tmpl_blam_02", "9": "tmpl_blam_10" }   
    }  
  },  
  
  "rewards": {  
    "rew_blam_snack": {   
      "owner_id": "blam_01", "name": "Bánh Snack", "type": "completion_78",  
      "lifecycle": { "unlock_condition": 78, "claim_type": "auto", "expiry": "daily", "usage_limit": 1 }  
    }  
  },  
  
  "reward_batches": {  
    "rbatch_blam_lvl1": {  
      "owner_id": "blam_01", "reward_level": 1, "status": "active",  
      "rewards": { "0": "rew_blam_snack" }  
    }  
  },  
  
  "daily_logs_2026_05": {  
    "2026-05-03": {  
      "blam_01": {  
        "summary": {   
          "completion_rate": 80,   
          "status": "ongoing",  
          "xp_granted": 10,  
          "points_granted": 5,  
          "reward_78_unlocked": true,  
          "reward_100_unlocked": false  
        },  
        "tasks": {  
          "tmpl_blam_01": { "status": "approved", "xp_earned": 10, "point_earned": 5, "verified_by": "mom_03" }  
        }  
      }  
    }  
  },  
  
  "transactions": {  
    "trans_01": { "user_id": "blam_01", "item_id": "item_01", "cost": 100, "status": "pending_delivery", "created_at": 1683116000 }  
  },  
  
  "achievements": {  
    "achv_01": {   
      "owner_id": "blam_01",   
      "type": "school",   
      "name": "Điểm 10 Toán",   
      "xp_bonus": 100,   
      "point_bonus": 50,   
      "created_by": "dad_04",   
      "date": "2026-05-03",   
      "created_at": 1683117000   
    }  
  },  
  
  "penalty_logs": {  
    "pen_01": {   
      "user_id": "blam_01",   
      "points_deducted": 20,   
      "reason": "Không dọn đồ chơi",   
      "created_by": "dad_04",   
      "created_at": 1683118000   
    }  
  },  
  
  "admin_logs": {  
    "admin_log_01": {   
      "action_type": "revoke_points",   
      "target_user": "blam_01",   
      "value_changed": {   
        "points": -50   
      },   
      "reason": "Sửa lỗi cộng trùng",   
      "created_at": 1683120000   
    }  
  }  
}  
  
---  
  
## 4. FINAL GAME FLOW  
  
*   **Daily Reset (00:00):** GitHub Actions gọi cron quét `task_batches`. Tìm batch có `status == "active"` khớp với user, clone 10 tasks vào `daily_logs_{yyyy_mm}` của ngày hôm nay.  
*   **Task Execution:** Con tick task, hệ thống chuyển `status` thành `pending`.  
*   **Approval:** Mẹ kiểm tra, nếu OK đổi `status` thành `approved`.  
*   **Reward Unlock (22:00):** Tính `% completion_rate`. Nếu >= 78%, bật cờ `reward_78_unlocked = true`. Trích xuất phần thưởng từ `reward_batches` đang `active` tương ứng với Level của user.  
*   **Transaction Flow:** Con mua đồ -> trừ Point -> tạo bản ghi `transactions` với `status: pending_delivery`. Bố/mẹ trao quà thực tế -> update thành `delivered`.  
*   **Batch Flow:** Khi thăng cấp, Admin (Bố) chỉ cần set batch của level mới thành `active`, batch cũ thành `archived`. Hôm sau hệ thống tự clone theo cấu hình mới.  
  
---  
  
## 5. FINAL REWARD ENGINE & STATE MACHINE  
  
Hệ thống định nghĩa rõ ràng:  
*   **TASKS:** Chỉ là INPUT EVENTS.  
*   **SUMMARY:** Là STATE và là SOURCE OF TRUTH duy nhất.  
  
**Cumulative Grant Ledger (Sổ cái tích lũy):**  
Hai trường `xp_granted` và `points_granted` trong node `summary` chịu trách nhiệm lưu trữ tổng khối lượng thưởng đã được rót vào tài khoản của Player trong ngày hôm đó.  
  
**Engine Flow (Triggered by 5-min Cron):**  
1.  **Scan:** Quét toàn bộ `tasks` có `status == "approved"`.  
2.  **Calculate Totals:** Tính tổng tuyệt đối từ snapshot hiện tại:  
    *   `totalApprovedXp` = SUM(XP từ các task approved).  
    *   `totalApprovedPoints` = SUM(Points từ các task approved).  
3.  **Calculate Delta:**   
    *   `deltaXp = totalApprovedXp - summary.xp_granted`  
    *   `deltaPoints = totalApprovedPoints - summary.points_granted`  
4.  **Grant & Commit:** Nếu `delta > 0`:  
    *   Cộng `deltaXp` và `deltaPoints` vào `users/{uid}/stats`.  
    *   Update `summary.xp_granted = totalApprovedXp`.  
    *   Update `summary.points_granted = totalApprovedPoints`.  
  
**Idempotency Guarantees:** Nhờ công thức Delta này, nếu GitHub Actions chạy overlap (2 luồng chạy đè lên nhau cùng 1 giây), phép tính `delta` của luồng chạy sau sẽ tự động bằng `0`, ngăn chặn hoàn toàn lỗi cộng đúp phần thưởng.  
  
**Monotonic State Rule:**  
Các cờ sau chỉ được phép TĂNG, cấm giảm:  
*   `reward_78_unlocked`  
*   `reward_100_unlocked`  
*   `xp_granted`  
*   `points_granted`  
  
---  
  
## 6. BANNED TECHNIQUES (KỸ THUẬT BỊ CẤM NGHIÊM NGẶT)  
  
Đội ngũ Dev KHÔNG BAO GIỜ được sử dụng các phương pháp xử lý trạng thái sau đây:  
❌ `rewardProcessed` flags nằm trong từng task đơn lẻ.  
❌ Kỹ thuật sign-flip (đảo dấu `approved_at` để đánh dấu đã xử lý).  
❌ Phụ thuộc vào Task Ordering (Giả định mẹ duyệt task 1 rồi mới đến task 2).  
❌ Tính Delta bằng Array slicing (Chỉ lấy mảng các task mới duyệt ra trừ).  
❌ Rollback `xp_granted` hoặc `points_granted`.  
  
---  
  
## 7. ROLE PERMISSIONS  
  
*   **Player (Con):**  
    *   `Read`: Chỉ xem `users/self`, `daily_logs/current`, `store_items`, `rewards/self`, `system_config`.  
    *   `Write`: Tạo `transactions` (chỉ khi đủ tiền, stock > 0). Đổi trạng thái daily task của chính mình thành `pending`.  
*   **Mẹ (Checker):**  
    *   `Read`: Đọc Dashboard toàn cục (`users`, `daily_logs`, `transactions`).  
    *   `Write`: CHỈ update trường `status` và `verified_by` trong `daily_logs` (thành `approved`/`rejected`) và `transactions` (thành `delivered`/`cancelled`). Không có quyền tạo/xóa task, không có quyền phạt điểm.  
*   **Bố (Admin):**  
    *   `Read / Write`: Toàn quyền (`true`) trên Root DB. Là người duy nhất được can thiệp vào `system_config`, `task_batches`, `reward_batches`, `penalty_logs`, `store_items`.  
  
---  
  
## 8. SECURITY & CRON REQUIREMENTS  
  
*   **GitHub Actions Cron:** Lập lịch gọi API mỗi 5 phút/lần để kích hoạt Reward Engine và 00:00 hàng ngày để kích hoạt Reset Logic.  
*   **Firebase Admin SDK:** Cron job sẽ chạy thông qua Service Account để bỏ qua Firebase Security Rules, cho phép đọc/ghi trạng thái Ledger an toàn mà Client không can thiệp được.  
*   **Monotonic Validation Rules:** Trên Firebase Rules, trường `xp_granted` phải có rule: `newData.val() >= data.val()`.  
  
---  
  
## 9. EDGE CASES HANDLING  
  
*   **Offline Mode:** Sử dụng `keepSynced(true)` trên Client. Firebase tự động lưu Cache và đẩy state khi có mạng.  
*   **Reward Expire:** Nếu Reward có `expiry: daily`, đúng 23:59 cron job tự động clear khỏi túi đồ của Player.  
*   **Batch Switching (Đổi level):** Đổi Batch thành `active` vào giữa ngày KHÔNG làm hỏng data ngày hôm đó. Task mới sẽ chỉ xuất hiện vào lúc 00:00 rạng sáng hôm sau.  
*   **Transaction Cancelled:** Nếu Mẹ không mua được quà, update `status` thành `cancelled`. Cron phát hiện và refund `cost` ngược lại vào ví Player.  
*   **Stock = 0:** Mọi request tạo `transaction` bị Firebase Rules Reject lập tức.  
*   **Mẹ Quên Duyệt Task:** Mẹ duyệt bù task của ngày hôm qua. Reward Engine (Cron) scan quá khứ, phát hiện Delta > 0, lập tức cấp XP/Points và tính toán bù Streak chính xác.  
*   **Double Reward Prevention:** Đã được chặn triệt để qua Cumulative Grant Ledger.  
  
---  
  
## 10. ARCHITECTURAL DECISIONS  
  
*   **Vì sao dùng Snapshot Cron?** Rẻ, bền bỉ và không phụ thuộc vào trạng thái Event-driven khó kiểm soát. Thay vì hứng hàng trăm event lẻ tẻ (Cloud Functions tốn tiền), hệ thống định kỳ chụp 1 bức ảnh (Snapshot) và xử lý sự khác biệt (Delta).  
*   **Vì sao dùng Grant Ledger (`xp_granted`)?** Để tách bạch giữa "Cái đã được duyệt" và "Cái đã được trả". Cần Ledger làm mỏ neo để tính toán ra Delta phân phối an toàn.  
*   **Vì sao `completion_rate` không đủ tính Delta?** Tỷ lệ % chỉ là chỉ số gộp (Aggregate state). Các task có XP (10, 50, 100) khác nhau. Nhìn vào % không thể truy xuất ngược ra hệ thống đang nợ user bao nhiêu XP.  
*   **Vì sao Monotonic State quan trọng?** Trẻ em rất nhạy cảm với việc bị "tước đoạt". Hệ thống Monotonic giúp Backend không bao giờ phải viết logic Rollback phức tạp, giữ nguyên vẹn động lực nội tại. (Phạt đã có `penalty_logs` trừ Points ngoại tại, không chạm vào XP).  
*   **Vì sao RTDB FREE đủ dùng 10 năm?** Vì áp dụng cấu trúc dữ liệu phẳng (Flat NoSQL) và tự động rẽ nhánh theo tháng (`daily_logs_yyyy_mm`). Cây JSON không bao giờ bị phình to (Over-fetching).  
  
---  
  
## 11. FINAL LOCK CONFIRMATION  
  
👉 **ĐÂY LÀ LOCK VERSION.**  
👉 **ĐÂY LÀ AUTHORITATIVE DOCUMENT DUY NHẤT VÀ CUỐI CÙNG.**  
👉 Hệ thống đã hoàn thiện 100% về mặt thiết kế kỹ thuật, kinh tế và kiến trúc vận hành.  
👉 KHÔNG thực hiện bất kỳ lệnh Redesign, thêm Feature, hoặc thay đổi Logic nào nữa.  
👉 MỌI thao tác code, setup Firebase Rules, viết API backend hay lập trình UI/UX Frontend TỪ NAY VỀ SAU **BẮT BUỘC** phải tuân thủ nghiêm ngặt tài liệu này.   
  
[END OF DOCUMENT]  
