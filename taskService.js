import { ref, update, push, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { db, auth } from "./firebase.js";

export async function createTask(assigneeId, taskId, taskPoints, date) {
  const logId = push(ref(db, 'taskLogs')).key;
  const now = Date.now();
  
  const task = {
    assigneeId,
    taskId,
    taskPoints: Number(taskPoints),
    status: "TODO",
    pointsEarned: 0,
    pointsApplied: false,
    version: 1,
    createdAt: now,
    updatedAt: now,
    date
  };

  const updates = {};
  updates[`taskLogs/${logId}`] = task;
  updates[`todayTasksByUser/${assigneeId}/${date}/${logId}`] = task;
  
  await update(ref(db), updates);
}

export async function submitTask(logId, currentTask) {
  const uid = auth.currentUser.uid;
  const now = Date.now();
  
  const newTask = {
    ...currentTask,
    status: "PENDING_APPROVAL",
    submittedBy: uid,
    version: currentTask.version + 1,
    updatedAt: now
  };

  const pendingPayload = {
    taskId: newTask.taskId,
    taskPoints: newTask.taskPoints,
    assigneeId: newTask.assigneeId,
    status: newTask.status,
    submittedBy: newTask.submittedBy,
    version: newTask.version
  };

  const updates = {};
  updates[`taskLogs/${logId}`] = newTask;
  updates[`todayTasksByUser/${newTask.assigneeId}/${newTask.date}/${logId}`] = newTask;
  updates[`pendingApprovals/${logId}`] = pendingPayload;
  
  await update(ref(db), updates);
}

export async function approveTask(logId, currentTask, qualityRating) {
  const now = Date.now();
  
  const newTask = {
    ...currentTask,
    status: "APPROVED",
    pointsEarned: currentTask.taskPoints,
    qualityRating: qualityRating,
    version: currentTask.version + 1,
    updatedAt: now
  };

  const updates = {};
  updates[`taskLogs/${logId}`] = newTask;
  updates[`todayTasksByUser/${newTask.assigneeId}/${newTask.date}/${logId}`] = newTask;
  updates[`pendingApprovals/${logId}`] = null;
  
  await update(ref(db), updates);
}

export async function rejectTask(logId, currentTask) {
  const now = Date.now();
  
  const newTask = {
    ...currentTask,
    status: "REJECTED",
    pointsEarned: 0,
    version: currentTask.version + 1,
    updatedAt: now
  };

  const updates = {};
  updates[`taskLogs/${logId}`] = newTask;
  updates[`todayTasksByUser/${newTask.assigneeId}/${newTask.date}/${logId}`] = newTask;
  updates[`pendingApprovals/${logId}`] = null;
  
  await update(ref(db), updates);
}

export async function applyPoints(logId, currentTask) {
  const now = Date.now();
  
  const newTask = {
    ...currentTask,
    pointsApplied: true,
    version: currentTask.version + 1,
    updatedAt: now
  };

  const updates = {};
  updates[`taskLogs/${logId}`] = newTask;
  updates[`todayTasksByUser/${newTask.assigneeId}/${newTask.date}/${logId}`] = newTask;
  updates[`users/${newTask.assigneeId}/points`] = increment(newTask.pointsEarned);
  
  await update(ref(db), updates);
}
