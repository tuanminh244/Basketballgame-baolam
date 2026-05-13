// scripts/engine/approvalEngine.js

// STATUS: Reserved — Required by TREE_STRUCTURE_LOCK
//
// Transition validation is currently enforced by Firebase Security Rules
// during write-time operations.
//
// This module is intentionally preserved for:
// - future admin override flows
// - server-side audit validation
// - backend approval orchestration expansion

const { APPROVAL_STATUSES } = require('../shared/constants');

function validateTransition(currentStatus, targetStatus) {
  if (currentStatus !== APPROVAL_STATUSES.PENDING) {
    return false;
  }

  if (
    targetStatus !== APPROVAL_STATUSES.APPROVED &&
    targetStatus !== APPROVAL_STATUSES.REJECTED
  ) {
    return false;
  }

  return true;
}

module.exports = {
  validateTransition
};
