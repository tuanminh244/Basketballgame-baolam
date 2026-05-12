function validateUserId(userId) {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error(`[ValidationError] Invalid userId: ${userId}`);
  }
}

function validateDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    throw new Error(`[ValidationError] Invalid date format. Expected YYYY-MM-DD, got: ${dateString}`);
  }
}

function validateApprovalPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[ValidationError] Approval payload must be an object');
  }
  if (!payload.taskId || typeof payload.taskId !== 'string') {
    throw new Error('[ValidationError] Missing or invalid taskId in payload');
  }
  if (!payload.status || !['approved', 'rejected'].includes(payload.status)) {
    throw new Error(`[ValidationError] Invalid status in payload: ${payload.status}`);
  }
}

module.exports = {
  validateUserId,
  validateDate,
  validateApprovalPayload
};
