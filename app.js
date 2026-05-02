import { ref, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { db } from "./firebase.js";
import { login, logout, observeAuth } from "./auth.js";
import { createTask, submitTask, approveTask, rejectTask, applyPoints } from "./taskService.js";

const DOM = {
  loginView: document.getElementById('login-view'),
  playerView: document.getElementById('player-view'),
  parentView: document.getElementById('parent-view'),
  userInfo: document.getElementById('user-info'),
  userEmail: document.getElementById('user-email'),
  userRole: document.getElementById('user-role'),
  userUid: document.getElementById('user-uid'),
  loginForm: document.getElementById('login-form'),
  logoutBtn: document.getElementById('logout-btn'),
  globalError: document.getElementById('global-error'),
  playerTasks: document.getElementById('player-tasks'),
  createTaskForm: document.getElementById('create-task-form'),
  assigneeSelect: document.getElementById('assignee-id'),
  pendingTasks: document.getElementById('pending-tasks'),
  approvedTasks: document.getElementById('approved-tasks'),
  taskDate: document.getElementById('task-date')
};

let currentUser = null;
let activeListeners = [];

const getTodayDate = () => new Date().toISOString().split('T')[0];
if(DOM.taskDate) DOM.taskDate.value = getTodayDate();

function showError(msg) {
  DOM.globalError.textContent = msg;
  DOM.globalError.classList.remove('hidden');
  setTimeout(() => DOM.globalError.classList.add('hidden'), 5000);
}

function clearListeners() {
  activeListeners.forEach(unsub => unsub());
  activeListeners = [];
}

observeAuth((user) => {
  currentUser = user;
  clearListeners();
  
  if (user) {
    DOM.userInfo.classList.remove('hidden');
    DOM.userEmail.textContent = user.email;
    DOM.userRole.textContent = user.role;
    DOM.userUid.textContent = `UID: ${user.uid}`;
    DOM.loginView.classList.add('hidden');
    
    if (user.role === 'parent') {
      DOM.playerView.classList.add('hidden');
      DOM.parentView.classList.remove('hidden');
      initParentView();
    } else {
      DOM.parentView.classList.add('hidden');
      DOM.playerView.classList.remove('hidden');
      initPlayerView();
    }
  } else {
    DOM.userInfo.classList.add('hidden');
    DOM.playerView.classList.add('hidden');
    DOM.parentView.classList.add('hidden');
    DOM.loginView.classList.remove('hidden');
  }
});

DOM.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await login(document.getElementById('email').value, document.getElementById('password').value);
  } catch (err) {
    showError("Login failed: " + err.message);
  }
});

DOM.logoutBtn.addEventListener('click', async () => {
  try {
    await logout();
  } catch(err) {
    showError("Logout failed: " + err.message);
  }
});

function renderTaskCard(logId, task, role, context = '') {
  const card = document.createElement('div');
  card.className = 'card';
  
  let actionsHTML = '';
  
  if (role === 'player' && task.status === 'TODO') {
    actionsHTML = `<button class="submit-btn">Submit Task</button>`;
  } else if (role === 'player' && task.status === 'PENDING_APPROVAL') {
    actionsHTML = `<button disabled>Waiting for Parent...</button>`;
  } else if (role === 'player' && task.status === 'REJECTED') {
    actionsHTML = `<button disabled style="background:red">Task Rejected</button>`;
  }
  
  if (role === 'parent' && task.status === 'PENDING_APPROVAL') {
    actionsHTML = `
      <select class="rating-select">
        <option value="PASS">PASS</option>
        <option value="GOOD">GOOD</option>
        <option value="EXCELLENT">EXCELLENT</option>
      </select>
      <button class="approve-btn" style="background:green">Approve</button>
      <button class="reject-btn" style="background:red">Reject</button>
    `;
  } else if (role === 'parent' && task.status === 'APPROVED' && task.pointsApplied === false) {
    actionsHTML = `<button class="apply-btn" style="background:purple">Apply Points</button>`;
  }

  card.innerHTML = `
    <h3>${task.taskId}</h3>
    <div class="data-row"><span class="status-badge">${task.status}</span></div>
    <div class="data-row"><strong>Task Points:</strong> ${task.taskPoints}</div>
    <div class="data-row"><strong>Earned:</strong> ${task.pointsEarned} | <strong>Applied:</strong> ${task.pointsApplied}</div>
    <div class="data-row"><strong>Version:</strong> ${task.version}</div>
    ${task.submittedBy ? `<div class="data-row"><strong>Submitted By:</strong> ${task.submittedBy}</div>` : ''}
    ${task.qualityRating ? `<div class="data-row"><strong>Rating:</strong> ${task.qualityRating}</div>` : ''}
    <div style="margin-top:10px">${actionsHTML}</div>
  `;

  if (role === 'player' && task.status === 'TODO') {
    card.querySelector('.submit-btn').onclick = async () => {
      try { await submitTask(logId, task); } catch (e) { showError(e.message); }
    };
  }

  if (role === 'parent' && task.status === 'PENDING_APPROVAL' && context === 'pending') {
    card.querySelector('.approve-btn').onclick = async () => {
      try { 
        const rating = card.querySelector('.rating-select').value;
        await approveTask(logId, task, rating); 
      } catch (e) { showError(e.message); }
    };
    card.querySelector('.reject-btn').onclick = async () => {
      try { await rejectTask(logId, task); } catch (e) { showError(e.message); }
    };
  }

  if (role === 'parent' && task.status === 'APPROVED' && task.pointsApplied === false && context === 'approved') {
    card.querySelector('.apply-btn').onclick = async () => {
      try { await applyPoints(logId, task); } catch (e) { showError(e.message); }
    };
  }

  return card;
}

function initPlayerView() {
  const today = getTodayDate();
  const tasksRef = ref(db, `todayTasksByUser/${currentUser.uid}/${today}`);
  
  const unsub = onValue(tasksRef, (snapshot) => {
    DOM.playerTasks.innerHTML = '';
    const tasks = snapshot.val() || {};
    Object.entries(tasks).forEach(([logId, task]) => {
      DOM.playerTasks.appendChild(renderTaskCard(logId, task, 'player'));
    });
  }, (err) => showError(err.message));
  
  activeListeners.push(unsub);
}

function initParentView() {
  const usersRef = ref(db, 'users');
  const unsubUsers = onValue(usersRef, (snapshot) => {
    DOM.assigneeSelect.innerHTML = '<option value="">Select Player...</option>';
    const users = snapshot.val() || {};
    Object.entries(users).forEach(([uid, data]) => {
      if (data.role === 'player') {
        DOM.assigneeSelect.innerHTML += `<option value="${uid}">${data.email || uid}</option>`;
      }
    });
  }, (err) => showError(err.message));
  activeListeners.push(unsubUsers);

  DOM.createTaskForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(
        DOM.assigneeSelect.value,
        document.getElementById('task-id').value,
        document.getElementById('task-points').value,
        document.getElementById('task-date').value
      );
      DOM.createTaskForm.reset();
      DOM.taskDate.value = getTodayDate();
    } catch (err) {
      showError(err.message);
    }
  };

  const pendingRef = ref(db, 'pendingApprovals');
  const unsubPending = onValue(pendingRef, (snapshot) => {
    DOM.pendingTasks.innerHTML = '';
    const tasks = snapshot.val() || {};
    Object.entries(tasks).forEach(([logId, task]) => {
      DOM.pendingTasks.appendChild(renderTaskCard(logId, task, 'parent', 'pending'));
    });
  }, (err) => showError(err.message));
  activeListeners.push(unsubPending);

  const approvedQuery = query(ref(db, 'taskLogs'), orderByChild('status'), equalTo('APPROVED'));
  const unsubApproved = onValue(approvedQuery, (snapshot) => {
    DOM.approvedTasks.innerHTML = '';
    const tasks = snapshot.val() || {};
    Object.entries(tasks).forEach(([logId, task]) => {
      if (!task.pointsApplied) {
        DOM.approvedTasks.appendChild(renderTaskCard(logId, task, 'parent', 'approved'));
      }
    });
  }, (err) => showError(err.message));
  activeListeners.push(unsubApproved);
}
