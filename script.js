// script.js

let schedule = JSON.parse(localStorage.getItem('schedule')) || [];
let dayNotes = JSON.parse(localStorage.getItem('dayNotes')) || {};
let currentDate = new Date();
let currentEditingTimeField = null;

// Mode switching
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const daySelection = document.getElementById('day-selection');
        const dateSelection = document.getElementById('date-selection');
        if (this.value === 'day') {
            daySelection.classList.remove('hidden');
            dateSelection.classList.add('hidden');
        } else {
            daySelection.classList.add('hidden');
            dateSelection.classList.remove('hidden');
        }
    });
});

// Set language based on browser settings
document.documentElement.lang = (navigator.language || navigator.userLanguage || 'en').slice(0,2);

// Top Bar Navigation
// Modal Controls
function openAddTaskModal() {
  document.getElementById('add-task-modal').classList.remove('hidden');
}
function closeAddTaskModal() {
  document.getElementById('add-task-modal').classList.add('hidden');
}
function openViewModal() {
  document.getElementById('view-modal').classList.remove('hidden');
}
function closeViewModal() {
  document.getElementById('view-modal').classList.add('hidden');
}
function openSettingsModal() {
  document.getElementById('settings-modal').classList.remove('hidden');
}
function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

// Navigation handlers (scroll to relevant sections)
function showAddTask() {
  document.getElementById('add-task-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  closeViewModal();
}
function showWeekView() {
  document.querySelector('.week-view-box').scrollIntoView({ behavior: 'smooth', block: 'start' });
  closeViewModal();
}
function showMonthView() {
  document.querySelector('.month-view-box').scrollIntoView({ behavior: 'smooth', block: 'start' });
  closeViewModal();
}

// Optional: close modals when clicking the background
document.addEventListener('click', function(e) {
  ['add-task-modal','view-modal','settings-modal'].forEach(function(id) {
    var modal = document.getElementById(id);
    if (modal && !modal.classList.contains('hidden') && e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');  
    }
    localStorage.setItem('theme', theme);
  }

document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('theme-toggle');
    const thumb = document.getElementById('toggle-thumb');
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    if (toggle && thumb) {
        // Set initial thumb position and active class
        thumb.style.transform = savedTheme === 'dark' ? 'translateX(1.25rem)' : 'translateX(0)';
        toggle.classList.toggle('active', savedTheme === 'dark');

        toggle.addEventListener('click', function() {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'light' : 'dark');
            // Move thumb and update class
            const nowDark = !isDark;
            thumb.style.transform = nowDark ? 'translateX(1.25rem)' : 'translateX(0)';
            toggle.classList.toggle('active', nowDark);
        });
    }
});

function toggleLanguageSection() {
    const langSection = document.getElementById('language-section');
    const themeSection = document.getElementById('theme-section');
    const langArrow = document.getElementById('language-arrow');
    langSection.style.display = (langSection.style.display === 'block') ? 'none' : 'block';
    langArrow.className = (langSection.style.display === 'block') ? 'fas fa-angle-up' : 'fas fa-angle-down';
    themeSection.style.display = 'none';
    document.getElementById('theme-arrow').className = 'fas fa-angle-down';
  }
  function openLoginModal() { document.getElementById('login-modal').classList.remove('hidden'); }
  function closeLoginModal() { document.getElementById('login-modal').classList.add('hidden'); }

// Add task
function addTask(day, startTime, endTime, task, repeat = false) {
    const dayEl = document.getElementById('day');
    const startEl = document.getElementById('start-time');
    const endEl = document.getElementById('end-time');
    const taskEl = document.getElementById('task');
    const repeatEl = document.getElementById('repeat-task');
    const repeatModeEl = document.getElementById('repeat-mode');
    const googleSyncEl = document.getElementById('google-sync');
    const modeEl = document.querySelector('input[name="mode"]:checked');

    if (!day && dayEl) day = dayEl.value;
    if (!startTime && startEl) startTime = startEl.value;
    if (!endTime && endEl) endTime = endEl.value;
    if (!task && taskEl) task = taskEl.value.trim();

    repeat = repeatEl?.checked || false; // Determine if repeat is checked
    const repeatMode = repeatModeEl?.value || 'weekly';
    const googleSync = googleSyncEl?.checked || false;

    // Handle date mode
    if (modeEl?.value === 'date') {
        const ddEl = document.getElementById('select-day');
        const mmEl = document.getElementById('select-month');
        const yyEl = document.getElementById('select-year');
        if (ddEl && mmEl && yyEl) {
            const dd = ddEl.value;
            const mm = mmEl.value;
            const yy = yyEl.value; // can be blank

            // If repeat is unchecked, year is required
            if (!repeat && !yy) {
                alert('Please select a year if the task does not repeat.');
                return; // Exit if no year is selected
            }

            if (dd && mm) {
                // Store in your task object:
                taskDate = {
                    day: Number(dd),
                    month: Number(mm),
                    year: yy ? Number(yy) : null // Null if year is not selected
                };

                // You can now use taskDate in your schedule array
            } else {
                alert('Please select both day and month');
                return; // Exit if day or month is not selected
            }
        }
    }

    schedule.push({ day, startTime, endTime, task, repeat, repeatMode, googleSync });
    localStorage.setItem('schedule', JSON.stringify(schedule));
    renderSchedule();

    // Clear form
    if (taskEl) taskEl.value = '';
    if (startEl) startEl.value = '';
    if (endEl) endEl.value = '';
    if (dayEl) dayEl.value = '';
}

// Schedule rendering
function renderSchedule() {
    const list = document.getElementById('schedule-list');
    const calendar = document.getElementById('calendar');
    const monthGrid = document.getElementById('month-grid');
    const monthTitle = document.getElementById('month-title');

    if (!list || !calendar || !monthGrid) {
        console.error('Required DOM elements not found');
        return;
    }

    list.innerHTML = calendar.innerHTML = monthGrid.innerHTML = '';

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const map = Object.fromEntries(days.map(d => [d, []]));
    schedule.forEach((item, i) => {
        item.index = i;
        if (map[item.day]) {
            map[item.day].push(item);
        }
    });

    // WEEK VIEW
    days.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        const tasks = map[day] || [];
        let html = '';
        if (!tasks.length) {
            html += `<p class='task-item' style="color: #888; font-style:italic;">No tasks</p>`;
        }
        html += tasks.map(e =>
            `<p class='task-item' title="${e.task}">${e.task}</p>`
        ).join('');
        cell.innerHTML = html;
        cell.onclick = () => showDetails(day, tasks);
        calendar.appendChild(cell);
    });

    // MONTH VIEW
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const todayDate = today.getDate();
    const isTodayMonth = today.getFullYear() === year && today.getMonth() === month;

    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    if (monthTitle) {
        monthTitle.textContent = `${currentDate.toLocaleString('en-US', { month: 'long' })} ${year}`;
    }

    // Empty cells for offset
    for (let i = 0; i < offset; i++) {
        monthGrid.appendChild(document.createElement('div'));
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const match = schedule.filter(e => e.day === dayName);
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';

        const isToday = isTodayMonth && i === todayDate;
        let html = `
            <div style="text-align:center; font-weight:bold;${isToday ? 'color:#2563eb;' : ''}">${i}</div>
        `;
        html += match.map(e => `<p class='task-item' title="${e.task}">${e.task}</p>`).join('');
        cell.innerHTML = html;
        cell.onclick = () => showDetails(`${dayName} ${i}`, match);
        monthGrid.appendChild(cell);
    }

    // TASK LIST
    schedule.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'task-item-container';
        div.innerHTML = `
            <div class='task-item-header'>
                <span>
                    <i class="fas fa-clock" style="color:#2563eb;margin-right:5px;"></i>
                    <strong style="color:#2563eb;">${item.day}</strong> 
                    <span style="color:#555;">${item.startTime}–${item.endTime}:</span> 
                    <span style="font-weight:500">${item.task}</span>
                    ${item.repeat ? ` <span style="font-size:0.9em; background:#def7ec; color:#047857; border-radius:5px; padding:2px 6px;">repeats ${item.repeatMode}</span>` : ""}
                    ${item.googleSync ? ` <i class="fas fa-sync" style="color:#2563eb;" title="Google Sync"></i>` : ""}
                </span>
                <span>
                    <button onclick='removeTask(${index})' title="Delete" style="color:#e11d48; border:none; background:none; font-size:1.1em; margin-right:6px;">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button onclick='showClone(${index})' title="Clone" style="color:#2563eb; border:none; background:none; font-size:1.1em; margin-right:6px;">
                        <i class="fas fa-clone"></i>
                    </button>
                    <button onclick='showEdit(${index})' title="Edit" style="color:#f59e42; border:none; background:none; font-size:1.1em;">
                        <i class="fas fa-edit"></i>
                    </button>
                </span>
            </div>
            <div id='clone-${index}' class='hidden'></div>
        `;
        list.appendChild(div);
    });
}

// Time popup management
function openTimePopup(targetBtnId, hiddenInputId) {
    currentEditingTimeField = { btn: document.getElementById(targetBtnId), input: document.getElementById(hiddenInputId) };
    const popup = document.getElementById('time-popup');
    const popupTime = document.getElementById('popup-time');
    // Pre-fill with current value if any:
    popupTime.value = currentEditingTimeField.input.value || '';
    popup.classList.remove('hidden');
    popupTime.focus();
}

function closeTimePopup() {
    document.getElementById('time-popup').classList.add('hidden');
    currentEditingTimeField = null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Open popup on button click
    document.getElementById('start-time-btn').onclick = function() {
        openTimePopup('start-time-btn', 'start-time');
    };
    document.getElementById('end-time-btn').onclick = function() {
        openTimePopup('end-time-btn', 'end-time');
    };

    // Handle popup buttons
    document.getElementById('set-time-popup').onclick = function() {
        const value = document.getElementById('popup-time').value;
        if (currentEditingTimeField && value) {
            currentEditingTimeField.input.value = value;
            // Update button label
            currentEditingTimeField.btn.textContent = value;
            closeTimePopup();
        }
    };

    const themeSelect = document.getElementById('theme-select');
if (themeSelect) {
    const savedTheme = localStorage.getItem('theme');
    themeSelect.value = savedTheme || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    themeSelect.addEventListener('change', function() {
        const value = themeSelect.value;
        document.documentElement.classList.toggle('dark', value === 'dark');
        localStorage.setItem('theme', value);
    });
}

    document.getElementById('cancel-time-popup').onclick = function() {
        closeTimePopup();
    };
    // Close popup when clicking outside modal-inner
    document.getElementById('time-popup').onclick = function(e) {
        if (e.target === this) closeTimePopup();
    };
});


function initializeFAB() {
    const fab = document.getElementById("fab");
    const fabModal = document.getElementById("fab-modal");
    if (fab && fabModal) {
        fab.onclick = (e) => {
            e.stopPropagation();
            fabModal.style.display = fabModal.style.display === "block" ? "none" : "block";
        };
        document.addEventListener('click', function(event) {
            if (!fab.contains(event.target) && !fabModal.contains(event.target)) {
                fabModal.style.display = "none";
            }
        });
    }
}

function closeFab() {
    const fabModal = document.getElementById("fab-modal");
    if (fabModal) fabModal.style.display = "none";
}

function openTaskForm() {
    closeFab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('task').focus();
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
    updateMonthYearSelectors();
}

function goToToday() {
    currentDate = new Date();
    renderSchedule();
    updateMonthYearSelectors();
}

function updateMonthYearSelectors() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    if (monthSelect) monthSelect.value = currentDate.getMonth();
    if (yearSelect) yearSelect.value = currentDate.getFullYear();
}

function removeTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        schedule.splice(index, 1);
        localStorage.setItem('schedule', JSON.stringify(schedule));
        renderSchedule();
    }
}

function showClone(index) {
    const container = document.getElementById(`clone-${index}`);
    if (!container) return;
    const item = schedule[index];
    container.innerHTML = `
        <div style="margin:8px 0; padding:10px; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb;">
            <strong>Clone Task</strong><br>
            <select id='clone-day-${index}'>
                ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    .map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
            <input type='time' id='clone-start-${index}'>
            <input type='time' id='clone-end-${index}'>
            <button onclick='submitClone(${index})' style="background:#047857; color:#fff; border-radius:4px; border:none; padding:4px 12px; margin-left:6px;">Add Copy</button>
            <button onclick='hideClone(${index})' style="background:#6b7280; color:#fff; border-radius:4px; border:none; padding:4px 12px; margin-left:6px;">Cancel</button>
        </div>
    `;
    container.classList.remove('hidden');
}

function hideClone(index) {
    const container = document.getElementById(`clone-${index}`);
    if (container) container.classList.add('hidden');
}

function submitClone(index) {
    const base = schedule[index];
    const dayEl = document.getElementById(`clone-day-${index}`);
    const startEl = document.getElementById(`clone-start-${index}`);
    const endEl = document.getElementById(`clone-end-${index}`);
    if (dayEl && startEl && endEl) {
        const day = dayEl.value;
        const start = startEl.value;
        const end = endEl.value;
        if (day && start && end) {
            addTask(day, start, end, base.task, base.repeat);
            hideClone(index);
        } else {
            alert('Please fill in all fields');
        }
    }
}

function showEdit(index) {
    const item = schedule[index];
    const container = document.getElementById(`clone-${index}`);
    if (!container) return;
    container.innerHTML = `
        <div style="margin:8px 0; padding:10px; background:#fffbe5; border-radius:8px; border:1px solid #f59e42;">
            <strong>Edit Task</strong><br>
            <select id='edit-day-${index}'>
                ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    .map(d => `<option value="${d}"${d === item.day ? " selected" : ""}>${d}</option>`).join('')}
            </select>
            <input type='time' id='edit-start-${index}' value='${item.startTime}'>
            <input type='time' id='edit-end-${index}' value='${item.endTime}'>
            <input type='text' id='edit-task-${index}' value='${item.task}'>
            <button onclick='submitEdit(${index})' style="background:#f59e42; color:#fff; border-radius:4px; border:none; padding:4px 12px; margin-left:6px;">Save</button>
            <button onclick='hideClone(${index})' style="background:#6b7280; color:#fff; border-radius:4px; border:none; padding:4px 12px; margin-left:6px;">Cancel</button>
        </div>
    `;
    container.classList.remove('hidden');
}

function submitEdit(index) {
    const dayEl = document.getElementById(`edit-day-${index}`);
    const startEl = document.getElementById(`edit-start-${index}`);
    const endEl = document.getElementById(`edit-end-${index}`);
    const taskEl = document.getElementById(`edit-task-${index}`);
    if (dayEl && startEl && endEl && taskEl) {
        const day = dayEl.value;
        const start = startEl.value;
        const end = endEl.value;
        const task = taskEl.value.trim();
        if (day && start && end && task) {
            schedule[index] = { ...schedule[index], day, startTime: start, endTime: end, task };
            localStorage.setItem('schedule', JSON.stringify(schedule));
            renderSchedule();
        } else {
            alert('Please fill in all fields');
        }
    }
}

function showDetails(day, matchedTasks) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;
    const title = `📌 Details for ${day}`;
    const html = `
        <button onclick="closeModal()" class="modal-close">×</button>
        <h2 style="font-size:1.3em; font-weight:700; margin-bottom:1em;">${title}</h2>
        ${
            matchedTasks.length === 0
                ? `<div style="text-align:center; padding:2em 0; color:#888;">
                        <i class="fas fa-calendar-times" style="font-size:2em; color:#bbb;"></i>
                        <p style="margin:0.5em 0;"><strong>No tasks scheduled</strong></p>
                        <p style="font-size:0.95em;">Use the Add Task button to create one.</p>
                   </div>`
                : matchedTasks.map((e, i) => {
                    const id = e.index ?? i;
                    return `
                        <div style="margin-bottom:1.2em; padding:0.8em 0.7em; background:#f9fafb; border-radius:8px;">
                            <p style="color:#2563eb; margin-bottom:0.5em; font-weight:600;">
                                <i class="fas fa-clock" style="margin-right:4px;"></i>${e.day} ${e.startTime}–${e.endTime}: ${e.task}
                            </p>
                            <textarea id="note-${id}" placeholder="Add notes for this task..." style="width:100%; min-height:48px; border:1px solid #e5e7eb; border-radius:6px; padding:6px;">${e.note || ""}</textarea>
                        </div>
                    `;
                  }).join('')
        }
    `;
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function closeModal() {
    // Save notes
    schedule.forEach((item, index) => {
        const el = document.getElementById(`note-${index}`);
        if (el) item.note = el.value.trim();
    });
    localStorage.setItem('schedule', JSON.stringify(schedule));
    localStorage.setItem('dayNotes', JSON.stringify(dayNotes));
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeSelect = document.getElementById('theme-select');
if (themeSelect) {
    const savedTheme = localStorage.getItem('theme');
    themeSelect.value = savedTheme || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    themeSelect.addEventListener('change', function() {
        const value = themeSelect.value;
        document.documentElement.classList.toggle('dark', value === 'dark');
        localStorage.setItem('theme', value);
    });
}

    // Notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Year selectors
    const yearSelect = document.getElementById('year-select');
    const selectYear = document.getElementById('select-year');
    for (let y = 2020; y <= 2035; y++) {
        if (yearSelect) yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
        if (selectYear) selectYear.innerHTML += `<option value="${y}">${y}</option>`;
    }
    if (yearSelect) {
        yearSelect.value = currentDate.getFullYear();
        yearSelect.addEventListener('change', () => {
            currentDate.setFullYear(parseInt(yearSelect.value));
            renderSchedule();
        });
    }
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        monthSelect.value = currentDate.getMonth();
        monthSelect.addEventListener('change', () => {
            currentDate.setMonth(parseInt(monthSelect.value));
            renderSchedule();
        });
    }

    // FAB
    initializeFAB();

    // Modal close on background
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    // Initial render
    renderSchedule();
});
