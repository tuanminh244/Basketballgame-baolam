import { ref, update, push, runTransaction, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { db, auth } from "./firebase.js";

// YYYY-MM-DD (LOCAL TIME)
export const getLocalYMD = () => {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
};

export async function seedUsersIfEmpty() {
  const usersRef = ref(db, 'users');
  const snap = await get(usersRef);
  if (!snap.exists()) {
    const seedData = {
      "usr_parent_1": { name: "Dad", role: "parent", points: 0, exp: 0, level: 1, currentStreak: 0 },
      "usr_parent_2": { name: "Mom", role: "parent", points: 0, exp: 0, level: 1, currentStreak: 0 },
      "usr_player_1": { name: "Kid A", role: "player", points: 0, exp: 0, level: 1, currentStreak: 0 },
      "usr_player_2": { name: "Kid B", role: "player", points: 0, exp: 0, level: 1, currentStreak: 0 }
    };
    await update(ref(db), { 'users': seedData });
    console.log("Seeded 4 default users successfully.");
  }
}

export async function createTaskLog(assigneeId, taskId, taskPoints) {
  const logId = push(ref(db, 'taskLogs')).key;
  const now = Date.now();
  const date = getLocalYMD();
  
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
    date: date,
    submittedBy: null,
    qualityRating: null
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
    version: newTask.version,
    createdAt: newTask.createdAt,
    updatedAt: newTask.updatedAt
  };

  const updates = {};
  updates[`taskLogs/${logId}`] = newTask;
  updates[`todayTasksByUser/${newTask.assigneeId}/${newTask.date}/${logId}`] = newTask;
  updates[`pendingApprovals/${logId}`] = pendingPayload;
  
  await update(ref(db), updates);
}

export async function approveTask(logId, currentTask, qualityRating) {
  const now = Date.now();
  
  // Quality Rating Multipliers[span_3](start_span)[span_3](end_span)
  let multiplier = 1.0; 
  if (qualityRating === 'GOOD') multiplier = 1.2;
  if (qualityRating === 'EXCELLENT') multiplier = 1.5;

  const earnedPoints = Math.round(currentTask.taskPoints * multiplier);
  const earnedExp = Math.round((currentTask.taskPoints / 2) * multiplier); // Base Exp = 50% of points[span_4](start_span)[span_4](end_span)
  
  const newTask = {
    ...currentTask,
    status: "APPROVED",
    pointsEarned: earnedPoints,
    pointsApplied: true, // Applied automatically on approval via transaction
    qualityRating: qualityRating,
    version: currentTask.version + 1,
    updatedAt: now
  };

  const updates = {};
  updates[`taskLogs/${logId}`] = newTask;
  updates[`todayTasksByUser/${newTask.assigneeId}/${newTask.date}/${logId}`] = newTask;
  updates[`pendingApprovals/${logId}`] = null;
  
  await update(ref(db), updates);

  // Run Transaction for User Points, EXP, and Levels
  const userRef = ref(db, `users/${newTask.assigneeId}`);
  await runTransaction(userRef, (user) => {
    if (user) {
      user.points = (user.points || 0) + earnedPoints;
      user.exp = (user.exp || 0) + earnedExp;
      
      // Level progression logic: EXP cần = 50 x level[span_5](start_span)[span_5](end_span)
      let expNeeded = 50 * (user.level || 1);
      while (user.exp >= expNeeded) {
        user.exp -= expNeeded;
        user.level = (user.level || 1) + 1;
        expNeeded = 50 * user.level;
      }
    }
    return user;
  });
}

export async function rejectTask(logId, currentTask) {
  const now = Date.now();
  
  const newTask = {
    ...currentTask,
    status: "REJECTED",
    pointsEarned: 0,
    qualityRating: null, 
    version: currentTask.version + 1,
    updatedAt: now
  };

  const updates = {};
  updates[`taskLogs/${logId}`] = newTask;
  updates[`todayTasksByUser/${newTask.assigneeId}/${newTask.date}/${logId}`] = newTask;
  updates[`pendingApprovals/${logId}`] = null;
  
  await update(ref(db), updates);
}
