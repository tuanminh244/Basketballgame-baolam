// COMPATIBILITY BRIDGE
// Bảo tồn tính tương thích ngược để tránh các "ghost imports" làm hỏng quá trình build.
// STRICT RULE: File này CHỈ phục vụ việc export tương thích. Tuyệt đối không thêm logic phụ.

export * from '@/lib/firebase/config';
