import { ref, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { db } from "./firebase.js";
import { login, logout, observeAuth } from "./auth.js";
import { seedUsersIfEmpty, createTaskLog, submitTask, approveTask, rejectTask, getLocalYMD } from "./taskService.js";

// DOM Setup
const DOM = {
  loginView: document.getElementById('login-view'),
  playerView: document.getElementById('player-view'),
  parentView: document.getElementById('parent-view'),
  userInfo: document.getElementById('user-info'),
  userDisplay: document.getElementById('user-display'),
  loginForm: document.getElementById('login-form'),
  logoutBtn: document.getElementById('logout-btn'),
  errorBanner: document.getElementById('error-banner'),
  playerTasks: document.getElementById('player-tasks'),
  playerStats: document.getElementById('player-stats'),
  createTaskForm: document.getElementById('create-task-form'),
  pendingTasks: document.getElementById('pending-tasks'),
  approvedTasks: document.getElementById('approved-tasks'),
};

let currentUser = null;
let activeListeners = [];

function showError(msg) {
  DOM.errorBanner.textContent = msg;
  DOM.errorBanner.classList.remove('hidden');
  setTimeout(() => DOM.errorBanner.classList.add('hidden'), 5000);
}

function clearListeners() {
  activeListeners.forEach(unsub => unsub());
  activeListeners = [];
}

// Initialization Sequence
(async function init() {
  try {
    await seedUsersIfEmpty(); // Auto-seed 4 users if empty
  } catch (e) {
    console.error("Seed error (ignore if rules restrict):", e);
  }

  observeAuth((user) => {
    currentUser = user;
    clearListeners();
    
    if (user) {
      DOM.userInfo.classList.remove('hidden');
      DOM.userDisplay.textContent = `${user.email} (${user.role})`;
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
})();

DOM.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await login(document.getElementById('email').value, document.getElementById('password').value);
  } catch (err) {
    showError("Login failed: " + err.message);
  }
});

DOM.logoutBtn.addEventListener('click', async () => {
  await logout();
});

function renderTaskCard(logId, task, role, context = '') {
  const card = document.createElement('div');
  card.className = 'card';
  
  let actionsHTML = '';
  
  if (role === 'player' && task.status === 'TODO') {
    actionsHTML = `<button class="submit-btn">Complete & Submit</button>`;
  } else if (role === 'parent' && task.status === 'PENDING_APPROVAL' && context === 'pending') {
    actionsHTML = `
      <select class="rating-select">
        <option value="PASS">PASS (x1.0)</option>
        <option value="GOOD">GOOD (x1.2)</option>
        <option value="EXCELLENT">EXCELLENT (x1.5)</option>
      </select>
      <button class="approve-btn btn-success">Approve</button>
      <button class="reject-btn btn-danger">Reject</button>
    `;
  }

  card.innerHTML = `
    <h4>${task.taskId}</h4>
    <div class="badge">${task.status}</div>
    <div style="font-size: 0.9em; margin-top: 8px;">
      <strong>Base Points:</strong> ${task.taskPoints} <br>
      <strong>Version:</strong> ${task.version} <br>
      ${task.pointsEarned ? `<strong>Points Earned:</strong> ${task.pointsEarned} <br>` : ''}
      ${task.qualityRating ? `<strong>Rating:</strong> ${task.qualityRating} <br>` : ''}
      ${task.assigneeId !== currentUser?.uid ? `<strong>Assignee:</strong> ${task.assigneeId}` : ''}
    </div>
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
  return card;
}

function initPlayerView() {
  const today = getLocalYMD();
  
  // Player Stats Listener
  const userRef = ref(db, `users/${currentUser.uid}`);
  const unsubUser = onValue(userRef, (snap) => {
    const data = snap.val();
    if(data) {
        DOM.playerStats.innerHTML = `
           <strong>Level:</strong> ${data.level || 1} &nbsp;|&nbsp; 
           <strong>EXP:</strong> ${data.exp || 0} / ${50 * (data.level || 1)} &nbsp;|&nbsp; 
           <strong>Points:</strong> ${data.points || 0}
        `;
    }
  });
  activeListeners.push(unsubUser);

  // Player Tasks Listener
  const tasksRef = ref(db, `todayTasksByUser/${currentUser.uid}/${today}`);
  const unsubTasks = onValue(tasksRef, (snapshot) => {
    DOM.playerTasks.innerHTML = '';
    const tasks = snapshot.val() || {};
    Object.entries(tasks).forEach(([logId, task]) => {
      DOM.playerTasks.appendChild(renderTaskCard(logId, task, 'player'));
    });
  }, (err) => showError(err.message));
  activeListeners.push(unsubTasks);
}

function initParentView() {
  DOM.createTaskForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await createTaskLog(
        document.getElementById('assignee-id').value,
        document.getElementById('task-id').value,
        document.getElementById('task-points').value
      );
      DOM.createTaskForm.reset();
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
    const today = getLocalYMD();
    Object.entries(tasks).forEach(([logId, task]) => {
       if (task.date === today) {
         DOM.approvedTasks.appendChild(renderTaskCard(logId, task, 'parent', 'approved'));
       }
    });
  }, (err) => showError(err.message));
  activeListeners.push(unsubApproved);
}
