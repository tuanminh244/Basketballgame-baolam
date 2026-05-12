const { APPROVAL_STATUSES } = require('../shared/constants');

function validateTransition(currentStatus, targetStatus) {
  if (currentStatus !== APPROVAL_STATUSES.PENDING) {
    return false;
  }
  if (targetStatus !== APPROVAL_STATUSES.APPROVED && targetStatus !== APPROVAL_STATUSES.REJECTED) {
    return false;
  }
  return true;
}

module.exports = { validateTransition };
