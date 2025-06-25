let schedule = JSON.parse(localStorage.getItem('schedule')) || [];
let dayNotes = JSON.parse(localStorage.getItem('dayNotes')) || {};
let currentDate = new Date();
let day = new Date(`1970-01-05T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long' }); // fallback

function addTask(day, startTime, endTime, task, repeat = false) {
  if (!day) day = document.getElementById('day').value;
  if (!startTime) startTime = document.getElementById('start-time').value;
  if (!endTime) endTime = document.getElementById('end-time').value;
  if (!task) task = document.getElementById('task').value.trim();

  repeat = document.getElementById('repeat-task')?.checked || false;
  const repeatMode = document.getElementById('repeat-mode')?.value || 'weekly';
  const googleSync = document.getElementById('google-sync')?.checked || false;

  if (document.getElementById('mode').value === 'date') {
    const dd = document.getElementById('select-day').value;
    const mm = document.getElementById('select-month').value;
    const yy = document.getElementById('select-year').value;
    if (dd && mm && yy) {
      const date = new Date(`${yy}-${mm}-${dd}`);
      day = date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  }

  if (!day || !startTime || !endTime || !task) return;

  schedule.push({ day, startTime, endTime, task, repeat, repeatMode, googleSync });
  localStorage.setItem('schedule', JSON.stringify(schedule));
  renderSchedule();
}

const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
if (!daysList.includes(day)) {
  const dateInput = document.getElementById('select-date')?.value;
  if (dateInput) {
    const date = new Date(dateInput);
    day = date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}

function renderSchedule() {
  const list = document.getElementById('schedule-list');
  const calendar = document.getElementById('calendar');
  const monthGrid = document.getElementById('month-grid');
  const monthTitle = document.getElementById('month-title');
  list.innerHTML = calendar.innerHTML = monthGrid.innerHTML = '';

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const map = Object.fromEntries(days.map(d => [d, []]));
  schedule.forEach((item, i) => {
    item.index = i;
    map[item.day].push(item);
  });

  // WEEK VIEW
  days.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    const tasks = map[day];
    let html = '';

    if (!tasks.length) {
      html += `<p class='text-gray-500 text-xs italic mb-1'>No tasks</p>`;
    }
    html += tasks.map(e =>
      `<p class='text-xs text-green-300 truncate task-item' title="${e.task}">${e.task}</p>`
    ).join('');
    cell.onclick = () => showDetails(day, tasks);
    calendar.appendChild(cell);
    cell.innerHTML = html;
  });

  // MONTH VIEW
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayDate = today.getDate();
  const isTodayMonth = today.getFullYear() === year && today.getMonth() === month;

  const first = new Date(year, month, 1);
  const offset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthTitle.textContent = `${currentDate.toLocaleString('en-US', { month: 'long' })} ${year}`;

  for (let i = 0; i < offset; i++) {
    monthGrid.appendChild(document.createElement('div'));
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const match = schedule.filter(e => e.day === dayName);
    const cell = document.createElement('div');
    cell.className = 'calendar-cell relative';

    const isToday = isTodayMonth && i === todayDate;
    let html = `
      <div class="flex justify-center items-center h-6">
        <span class="${isToday ? "inline-block w-6 h-6 flex items-center justify-center border border-white rounded-full" : ""} text-white font-bold text-sm">
          ${i}
        </span>
      </div>
    `;
    html += match.map(e => `<p class='text-xs text-blue-300 truncate task-item' title="${e.task}">${e.task}</p>`).join('');
    cell.innerHTML = html;
    cell.title = `Day ${i}`;
    cell.onclick = () => showDetails(i, match);
    monthGrid.appendChild(cell);
  }

  // TASK LIST
  schedule.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'bg-gray-700 p-3 rounded';
    div.innerHTML = `
      <div class='flex justify-between items-center'>
        <span>🕒 <strong>${item.day}</strong> ${item.startTime}–${item.endTime}: ${item.task}
          ${item.repeat ? ` (repeats ${item.repeatMode})` : ""}
          ${item.googleSync ? ` 🔗 Google` : ""}
        </span>
        <div class='flex items-center space-x-2'>
          <button onclick='removeTask(${index})' class='text-red-400 text-lg'>×</button>
          <button onclick='showClone(${index})' class='text-blue-400 text-lg'>🔁</button>
          <button onclick='showEdit(${index})' class='text-yellow-400 text-lg'>✏️</button>
        </div>
      </div>
      <div id='clone-${index}' class='hidden mt-2 space-y-1'></div>
    `;
    list.appendChild(div);
  });
}

document.getElementById("fab").onclick = () => {
  document.getElementById("fab-modal").style.display = "flex";
};

function closeFab() {
  document.getElementById("fab-modal").style.display = "none";
}
function openTaskForm() {
  closeFab();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function openEventForm() {
  closeFab();
  alert("Event Form Coming Soon!");
}
function openNoteForm() {
  closeFab();
  alert("Note Form Coming Soon!");
}

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderSchedule();
}

function goToToday() {
  currentDate = new Date();
  renderSchedule();
}

function removeTask(index) {
  schedule.splice(index, 1);
  localStorage.setItem('schedule', JSON.stringify(schedule));
  renderSchedule();
}

function showClone(index) {
  const container = document.getElementById(`clone-${index}`);
  const item = schedule[index];
  container.innerHTML = `
    <select id='clone-day-${index}' class='w-full p-1 rounded'>
      ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        .map(d => `<option>${d}</option>`).join('')}
    </select>
    <div class='flex gap-1'>
      <input type='time' id='clone-start-${index}' class='w-1/2 p-1 rounded'>
      <input type='time' id='clone-end-${index}' class='w-1/2 p-1 rounded'>
    </div>
    <button onclick='submitClone(${index})' class='w-full p-1 rounded bg-green-600 hover:bg-green-700'>➕ Add Copy</button>
  `;
  container.classList.remove('hidden');
}

function submitClone(index) {
  const base = schedule[index];
  const day = document.getElementById(`clone-day-${index}`).value;
  const start = document.getElementById(`clone-start-${index}`).value;
  const end = document.getElementById(`clone-end-${index}`).value;
  if (day && start && end) addTask(day, start, end, base.task, base.repeat);
}

function showEdit(index) {
  const item = schedule[index];
  const container = document.getElementById(`clone-${index}`);
  container.innerHTML = `
    <select id='edit-day-${index}' class='w-full p-1 rounded'>
      ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        .map(d => `<option${d === item.day ? " selected" : ""}>${d}</option>`).join('')}
    </select>
    <div class='flex gap-1'>
      <input type='time' id='edit-start-${index}' class='w-1/2 p-1 rounded' value='${item.startTime}'>
      <input type='time' id='edit-end-${index}' class='w-1/2 p-1 rounded' value='${item.endTime}'>
    </div>
    <input type='text' id='edit-task-${index}' class='w-full p-1 rounded' value='${item.task}'>
    <button onclick='submitEdit(${index})' class='w-full p-1 rounded bg-yellow-500 hover:bg-yellow-600'>✅ Save changes</button>
  `;
  container.classList.remove('hidden');
}

function submitEdit(index) {
  const day = document.getElementById(`edit-day-${index}`).value;
  const start = document.getElementById(`edit-start-${index}`).value;
  const end = document.getElementById(`edit-end-${index}`).value;
  const task = document.getElementById(`edit-task-${index}`).value;
  if (!day || !start || !end || !task) return;

  schedule[index] = { ...schedule[index], day, startTime: start, endTime: end, task };
  localStorage.setItem('schedule', JSON.stringify(schedule));
  renderSchedule();
}

function showDetails(day, matchedTasks) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const title = typeof day === "string"
    ? `📌 Details for ${day}`
    : `📌 Details for Day ${day}`;

  const html = `
    <button onclick="closeModal()" class="modal-close">×</button>
    <h2 class='text-xl font-bold mb-2'>${title}</h2>
    ${
      matchedTasks.length === 0
        ? `<div class="space-y-1"><p class="text-gray-400 font-semibold">No tasks</p><p class="text-sm italic text-gray-500">Use the Add button to create one.</p></div>`
        : matchedTasks.map((e, i) => {
            const id = e.index ?? i;
            return `
              <div class='mb-3'>
                <p class='text-blue-300 mb-1'>📅 ${e.day} ${e.startTime}–${e.endTime}: ${e.task}</p>
                <textarea id="note-${id}" placeholder="Write note here..." class="w-full p-2 rounded bg-gray-700 text-sm text-white resize-none">${e.note || ""}</textarea>
              </div>
            `;
          }).join('')
    }
  `;
  content.innerHTML = html;
  modal.style.display = 'flex';
}

function closeModal() {
  schedule.forEach((item, index) => {
    const el = document.getElementById(`note-${index}`);
    if (el) schedule[index].note = el.value.trim();
  });

  const dayNoteField = document.getElementById('day-note');
  if (dayNoteField && dayNoteField.dataset.key) {
    dayNotes[dayNoteField.dataset.key] = dayNoteField.value.trim();
  }

  localStorage.setItem('schedule', JSON.stringify(schedule));
  localStorage.setItem('dayNotes', JSON.stringify(dayNotes));
  document.getElementById('modal').style.display = 'none';
}

// Theme toggle
const toggle = document.getElementById('theme-toggle');
const thumb = document.getElementById('toggle-thumb');
if (toggle) {
  toggle.addEventListener('change', () => {
    const isDark = toggle.checked;
    document.documentElement.classList.toggle('dark', isDark);
    thumb.style.transform = isDark ? 'translateX(1.25rem)' : 'translateX(0)';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
  if (localStorage.getItem('theme') === 'dark') {
    toggle.checked = true;
    document.documentElement.classList.add('dark');
    thumb.style.transform = 'translateX(1.25rem)';
  }
}

// Notifications
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Init month & year selectors
for (let y = 2020; y <= 2035; y++) {
  document.getElementById('year-select').innerHTML += `<option value="${y}">${y}</option>`;
}
document.getElementById('month-select').value = currentDate.getMonth();
document.getElementById('year-select').value = currentDate.getFullYear();
document.getElementById('month-select').addEventListener('change', () => {
  currentDate.setMonth(parseInt(document.getElementById('month-select').value));
  renderSchedule();
});
document.getElementById('year-select').addEventListener('change', () => {
  currentDate.setFullYear(parseInt(document.getElementById('year-select').value));
  renderSchedule();
});

renderSchedule();
