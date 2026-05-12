// BẢN VÁ TƯƠNG THÍCH NGƯỢC (BACKWARD COMPATIBILITY BRIDGE)
// File này chỉ đóng vai trò cầu nối để các file API/Route cũ gọi đến đúng nguồn
// TUYỆT ĐỐI KHÔNG KHỞI TẠO LẠI firebase-admin TẠI ĐÂY để tránh lỗi duplicate instance.

export * from '../../../scripts/shared/firebaseAdmin';
export { default } from '../../../scripts/shared/firebaseAdmin';
