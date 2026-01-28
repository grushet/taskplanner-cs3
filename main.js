
document.addEventListener('DOMContentLoaded', () => {
	
    // Populate the date/time spans if present
	const now = new Date();
	const pad = n => String(n).padStart(2, '0');

	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = now.getFullYear();

	const monthEl = document.getElementById('month');
	if (monthEl) monthEl.textContent = pad(now.getMonth() + 1);

	const dayEl = document.getElementById('day');
	if (dayEl) dayEl.textContent = pad(now.getDate());

	const minuteEl = document.getElementById('minute');
	if (minuteEl) minuteEl.textContent = pad(now.getMinutes());

	// Navigation: show/hide pages and set active link
	const links = document.querySelectorAll('.nav-link[data-target]');
	const pages = document.querySelectorAll('.page');

	function showPage(id, linkEl) {
		pages.forEach(p => {
			const isVisible = p.id === id;
			p.classList.toggle('active', isVisible);
			p.setAttribute('aria-hidden', !isVisible);
		});
		links.forEach(l => l.classList.toggle('active', l === linkEl));
	}

	links.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const target = link.dataset.target;
			if (target) {
				showPage(target, link);
			}
		});
	});

	// Start the page on the first link
	links[0].click();

	// Calendar functionality
	let currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
	const monthYearEl = document.getElementById('calendar-month-year');
	const calendarDaysEl = document.getElementById('calendar-days');
	const prevMonthBtn = document.getElementById('prev-month');
	const nextMonthBtn = document.getElementById('next-month');

	function renderCalendar() {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		// Update header
		const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'];
		monthYearEl.textContent = `${monthNames[month]} ${year}`;

		// Get first day of month and number of days
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();

		calendarDaysEl.innerHTML = '';

		// Previous month's days
		for (let i = firstDay - 1; i >= 0; i--) {
			const dayNum = daysInPrevMonth - i;
			const dateObj = new Date(year, month - 1, dayNum);
			const dayDiv = document.createElement('div');
			dayDiv.className = 'calendar-day other-month';
			dayDiv.textContent = dayNum;
			dayDiv.dataset.date = ymdFromDate(dateObj);
			// mark whether there are tasks for this date and whether they're all completed
			if (tasks) {
				const matches = tasks.filter(t => t.dueDate === dayDiv.dataset.date);
				if (!matches.length) {
					dayDiv.classList.add('no-task');
				} else if (matches.every(t => t.completed)) {
					dayDiv.classList.add('tasks-completed');
				} else {
					dayDiv.classList.add('has-task');
				}
			}
			calendarDaysEl.appendChild(dayDiv);
		}

		// Current month's days
		for (let day = 1; day <= daysInMonth; day++) {
			const dateObj = new Date(year, month, day);
			const dayDiv = document.createElement('div');
			dayDiv.className = 'calendar-day';
			dayDiv.textContent = day;
			dayDiv.dataset.date = ymdFromDate(dateObj);
			if (tasks) {
				const matches = tasks.filter(t => t.dueDate === dayDiv.dataset.date);
				if (!matches.length) {
					dayDiv.classList.add('no-task');
				} else if (matches.every(t => t.completed)) {
					dayDiv.classList.add('tasks-completed');
				} else {
					dayDiv.classList.add('has-task');
				}
			}

			// Highlight today
			if (day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
				dayDiv.classList.add('today');
			}

			// Highlight selected day
			if (selectedDate && dayDiv.dataset.date === selectedDate) {
				dayDiv.classList.add('selected-day');
			}

			calendarDaysEl.appendChild(dayDiv);
		}

		// Next month's days
		const totalCells = calendarDaysEl.children.length;
		const remainingCells = 42 - totalCells; // 6 rows * 7 days
		for (let day = 1; day <= remainingCells; day++) {
			const dateObj = new Date(year, month + 1, day);
			const dayDiv = document.createElement('div');
			dayDiv.className = 'calendar-day other-month';
			dayDiv.textContent = day;
			dayDiv.dataset.date = ymdFromDate(dateObj);
			if (tasks) {
				const matches = tasks.filter(t => t.dueDate === dayDiv.dataset.date);
				if (!matches.length) {
					dayDiv.classList.add('no-task');
				} else if (matches.every(t => t.completed)) {
					dayDiv.classList.add('tasks-completed');
				} else {
					dayDiv.classList.add('has-task');
				}
			}
			calendarDaysEl.appendChild(dayDiv);
		}

		// add click handlers for date selection
		Array.from(calendarDaysEl.querySelectorAll('.calendar-day')).forEach(d => {
			d.addEventListener('click', () => {
				// clear previous selection
				const prev = calendarDaysEl.querySelector('.calendar-day.selected-day');
				if (prev) prev.classList.remove('selected-day');
				d.classList.add('selected-day');
				selectedDate = d.dataset.date || null;
				renderDayTasks();
			});
		});
	}

	// helper to convert Date to YYYY-MM-DD local format
	function ymdFromDate(date) {
		if (!date) return null;
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	// render tasks for the currently selected day
	const dayTasksEl = document.getElementById('day-tasks');

	let selectedDate = ymdFromDate(now); // default to today

	function renderDayTasks() {
		if (!dayTasksEl) return;
		const title = document.createElement('h4');
		const dateObj = parseDateYMD(selectedDate);
		const isToday = selectedDate === ymdFromDate(now);
		if (isToday) title.textContent = 'Tasks for Today';
		else title.textContent = `Tasks for ${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
		const container = document.createElement('div');
		container.appendChild(title);

		// Add task for selected date control
		const addRow = document.createElement('div');
		addRow.className = 'day-add-row';
		const addBtn = document.createElement('button');
		addBtn.type = 'button';
		addBtn.className = 'day-add-btn';
		addBtn.textContent = '+ Add task for this day';
		addRow.appendChild(addBtn);
		container.appendChild(addRow);

		function startAddInline() {
			const input = document.createElement('input');
			input.type = 'text';
			input.placeholder = 'New task...';
			input.className = 'day-add-input';
			// replace button with input
			addRow.replaceChild(input, addBtn);
			input.focus();

			function commit() {
				const val = (input.value || '').trim();
				if (val) {
					addTaskWithDate(val, selectedDate);
				}
				renderDayTasks();
			}

			function cancel() {
				// restore button
				if (addRow.contains(input)) addRow.replaceChild(addBtn, input);
			}

			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') { e.preventDefault(); commit(); }
				if (e.key === 'Escape') { e.preventDefault(); cancel(); }
			});
			input.addEventListener('blur', () => { setTimeout(commit, 50); });
		}

		addBtn.addEventListener('click', startAddInline);

		const matches = tasks.filter(t => t.dueDate === selectedDate);
		if (!matches.length) {
			const p = document.createElement('div');
			p.className = 'no-tasks';
			p.textContent = isToday ? 'No tasks scheduled for today' : 'No tasks scheduled for this day';
			container.appendChild(p);
		} else {
			const ul = document.createElement('ul');
			matches.forEach(task => {
				const li = document.createElement('li');
				// reflect completed state in the row so we can style it (cross-out, dim, etc.)
				li.className = 'day-task-item' + (task.completed ? ' completed' : '');
				if (task.importance === 'high') li.classList.add('importance-high');
				else if (task.importance === 'low') li.classList.add('importance-low');
				
				const cb = document.createElement('input');
				cb.type = 'checkbox';
				cb.className = 'task-checkbox';
				cb.dataset.id = task.id;
				cb.checked = !!task.completed;
				const lbl = document.createElement('span');
				lbl.className = 'task-label';
				lbl.textContent = task.text;
				li.appendChild(cb);
				li.appendChild(lbl);
				
				// importance dropdown for day task view
				const impSelect = document.createElement('select');
				impSelect.className = 'task-importance-select';
				impSelect.dataset.id = task.id;
				
				const noneOpt = document.createElement('option');
				noneOpt.value = '';
				noneOpt.textContent = '—';
				noneOpt.selected = !task.importance;
				impSelect.appendChild(noneOpt);
				
				const highOpt = document.createElement('option');
				highOpt.value = 'high';
				highOpt.textContent = 'High';
				highOpt.selected = task.importance === 'high';
				impSelect.appendChild(highOpt);
				
				const medOpt = document.createElement('option');
				medOpt.value = 'med';
				medOpt.textContent = 'Med';
				medOpt.selected = task.importance === 'med';
				impSelect.appendChild(medOpt);
				
				const lowOpt = document.createElement('option');
				lowOpt.value = 'low';
				lowOpt.textContent = 'Low';
				lowOpt.selected = task.importance === 'low';
				impSelect.appendChild(lowOpt);
				
				impSelect.addEventListener('change', (e) => {
					const newImp = e.target.value || null;
					task.importance = newImp;
					saveTasks();
					renderTasks();
					renderDayTasks();
				});
				li.appendChild(impSelect);
				
				ul.appendChild(li);
			});
			container.appendChild(ul);
		}

		function addTaskWithDate(text, ymd) {
			const trimmed = String(text || '').trim();
			if (!trimmed) return;
			
			// Parse keywords from task text
			const { cleanText, dueDate: parsedDate } = parseTaskKeywords(trimmed);
			if (!cleanText) return; // if all text was keywords, skip

			// Use parsed date if available, otherwise use the provided date (from calendar)
			const finalDate = parsedDate || ymd || null;
			const task = { id: Date.now(), text: cleanText, completed: false, createdAt: Date.now(), dueDate: finalDate, importance: null };
			tasks.unshift(task);
			saveTasks();
			renderTasks();
			renderCalendar();
			renderDayTasks();
		}
		dayTasksEl.innerHTML = '';
		dayTasksEl.appendChild(container);
	}

	// listen for check toggles inside dayTasks
	if (dayTasksEl) {
		dayTasksEl.addEventListener('change', (e) => {
			const t = e.target;
			if (t && t.matches('input[type="checkbox"].task-checkbox')) {
				toggleTask(t.dataset.id, t.checked);
				// toggleTask will call renderTasks() and save; re-render day tasks
				renderDayTasks();
			}
		});
	}

	prevMonthBtn.addEventListener('click', () => {
		currentDate.setMonth(currentDate.getMonth() - 1);
		renderCalendar();
	});

	nextMonthBtn.addEventListener('click', () => {
		currentDate.setMonth(currentDate.getMonth() + 1);
		renderCalendar();
	});

	// Initial calendar render will happen after tasks are loaded so day cells can reflect task presence

	// ===== Task list functionality ===== \\

	const TASKS_KEY = 'tasks';
	let tasks = [];

	const taskInput = document.getElementById('new-task-input');
	const taskListEl = document.getElementById('task-list');

	// date input is optional — leave empty by default so user can enter a date if desired

	function loadTasks() {
		try {
			const raw = localStorage.getItem(TASKS_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch (e) {
			console.warn('Failed to parse tasks from storage, resetting.', e);
			localStorage.removeItem(TASKS_KEY);
			return [];
		}
	}

	function saveTasks() {
		localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
	}

	function renderTasks() {
		if (!taskListEl) return;
		taskListEl.innerHTML = '';
		tasks.forEach(task => {
			const li = document.createElement('li');
			li.className = 'task-item';
			if (task.completed) li.classList.add('completed');
			if (task.importance === 'high') li.classList.add('importance-high');
			else if (task.importance === 'low') li.classList.add('importance-low');

			// checkbox
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.id = `task-${task.id}`;
			checkbox.dataset.id = task.id;
			checkbox.checked = !!task.completed;
			checkbox.className = 'task-checkbox';

			// label
			const label = document.createElement('label');
			label.htmlFor = checkbox.id;
			label.textContent = task.text;
			label.className = 'task-label';

			li.appendChild(checkbox);
			li.appendChild(label);
			
			// importance dropdown
			const impSelect = document.createElement('select');
			impSelect.className = 'task-importance-select';
			impSelect.dataset.id = task.id;
			
			const noneOpt = document.createElement('option');
			noneOpt.value = '';
			noneOpt.textContent = '—';
			noneOpt.selected = !task.importance;
			impSelect.appendChild(noneOpt);
			
			const highOpt = document.createElement('option');
			highOpt.value = 'high';
			highOpt.textContent = 'High';
			highOpt.selected = task.importance === 'high';
			impSelect.appendChild(highOpt);
			
			const medOpt = document.createElement('option');
			medOpt.value = 'med';
			medOpt.textContent = 'Med';
			medOpt.selected = task.importance === 'med';
			impSelect.appendChild(medOpt);
			
			const lowOpt = document.createElement('option');
			lowOpt.value = 'low';
			lowOpt.textContent = 'Low';
			lowOpt.selected = task.importance === 'low';
			impSelect.appendChild(lowOpt);
			
			impSelect.addEventListener('change', (e) => {
				const newImp = e.target.value || null;
				task.importance = newImp;
				saveTasks();
				renderTasks();
			});
			li.appendChild(impSelect);
			
			// date badge or 'add date' affordance
			if (task.dueDate) {
				const badge = document.createElement('span');
				badge.className = 'task-date-badge';
				badge.tabIndex = 0;
				badge.title = new Date(task.dueDate).toLocaleDateString();
				badge.textContent = formatTaskDateDisplay(task.dueDate);
				
				// Apply red color if task is overdue
				if (isTaskOverdue(task)) {
					badge.style.color = '#ff6b6b';
				}
				
				// click or Enter on badge to edit
				badge.addEventListener('click', () => startEditingDate(task));
				badge.addEventListener('keydown', (e) => { if (e.key === 'Enter') startEditingDate(task); });
				li.appendChild(badge);
			} else {
				const add = document.createElement('button');
				add.type = 'button';
				add.className = 'task-date-add';
				add.textContent = '+ Add date';
				add.addEventListener('click', () => startEditingDate(task));
				li.appendChild(add);
			}
			taskListEl.appendChild(li);
		});
	}

	function startEditingDate(task) {
		// find the task's list item and replace the display with a date input
		const li = taskListEl.querySelector(`input[data-id="${task.id}"]`)?.closest('.task-item');
		if (!li) return;
		const existingBadge = li.querySelector('.task-date-badge, .task-date-add');
		const input = document.createElement('input');
		input.type = 'date';
		input.className = 'task-date-editor';
		input.value = task.dueDate || '';
		// replace badge/add-button with the editor
		if (existingBadge) existingBadge.replaceWith(input);
		input.focus();

		function commit() {
			const val = input.value || null;
			tasks = tasks.map(t => t.id === task.id ? Object.assign({}, t, { dueDate: val }) : t);
			saveTasks();
			renderTasks();
			renderCalendar();
			renderDayTasks();
		}

		function cancel() {
			renderTasks();
		}

		input.addEventListener('blur', commit);
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') { e.preventDefault(); commit(); }
			if (e.key === 'Escape') { e.preventDefault(); cancel(); }
		});
	}

	function parseTaskKeywords(text) {
		// Extract keywords starting with ! and return { cleanText, dueDate }
		const keywordRegex = /\s*!(\w+)/g;
		let cleanText = text;
		let dueDate = null;
		let match;

		while ((match = keywordRegex.exec(text)) !== null) {
			const keyword = match[1].toLowerCase();
			cleanText = cleanText.replace(match[0], ''); // remove keyword from text

			// Parse date keywords
			if (keyword === 'today') {
				dueDate = ymdFromDate(now);
			} else if (keyword === 'tomorrow') {
				const tomorrow = new Date(now);
				tomorrow.setDate(tomorrow.getDate() + 1);
				dueDate = ymdFromDate(tomorrow);
			} else if (keyword === 'monday' || keyword === 'mon') {
				const d = new Date(now);
				const day = d.getDay();
				const daysUntilMonday = (1 - day + 7) % 7 || 7;
				d.setDate(d.getDate() + daysUntilMonday);
				dueDate = ymdFromDate(d);
			} else if (keyword === 'tuesday' || keyword === 'tue') {
				const d = new Date(now);
				const day = d.getDay();
				const daysUntilTuesday = (2 - day + 7) % 7 || 7;
				d.setDate(d.getDate() + daysUntilTuesday);
				dueDate = ymdFromDate(d);
			} else if (keyword === 'wednesday' || keyword === 'wed') {
				const d = new Date(now);
				const day = d.getDay();
				const daysUntilWednesday = (3 - day + 7) % 7 || 7;
				d.setDate(d.getDate() + daysUntilWednesday);
				dueDate = ymdFromDate(d);
			} else if (keyword === 'thursday' || keyword === 'thu') {
				const d = new Date(now);
				const day = d.getDay();
				const daysUntilThursday = (4 - day + 7) % 7 || 7;
				d.setDate(d.getDate() + daysUntilThursday);
				dueDate = ymdFromDate(d);
			} else if (keyword === 'friday' || keyword === 'fri') {
				const d = new Date(now);
				const day = d.getDay();
				const daysUntilFriday = (5 - day + 7) % 7 || 7;
				d.setDate(d.getDate() + daysUntilFriday);
				dueDate = ymdFromDate(d);
			} else if (keyword === 'saturday' || keyword === 'sat') {
				const d = new Date(now);
				const day = d.getDay();
				const daysUntilSaturday = (6 - day + 7) % 7 || 7;
				d.setDate(d.getDate() + daysUntilSaturday);
				dueDate = ymdFromDate(d);
			} else if (keyword === 'sunday' || keyword === 'sun') {
				const d = new Date(now);
				const day = d.getDay();
				const daysUntilSunday = (0 - day + 7) % 7 || 7;
				d.setDate(d.getDate() + daysUntilSunday);
				dueDate = ymdFromDate(d);
			} else if (keyword === 'nextweek') {
				const d = new Date(now);
				d.setDate(d.getDate() + 7);
				dueDate = ymdFromDate(d);
			}
		}

		cleanText = cleanText.trim();
		return { cleanText, dueDate };
	}

	function addTask(text) {
		const trimmed = String(text || '').trim();
		if (!trimmed) return;
		
		// Parse keywords from task text
		const { cleanText, dueDate } = parseTaskKeywords(trimmed);
		if (!cleanText) return; // if all text was keywords, skip

		// Create task with parsed dueDate and no importance by default
		const task = { id: Date.now(), text: cleanText, completed: false, createdAt: Date.now(), dueDate: dueDate || null, importance: null };
		tasks.unshift(task);
		saveTasks();
		renderTasks();
		renderCalendar();
	}

	function toggleTask(id, completed) {
		const idx = tasks.findIndex(t => String(t.id) === String(id));
		if (idx === -1) return;
		tasks[idx].completed = !!completed;
		saveTasks();
		renderTasks();
		renderCalendar();
		renderDayTasks();
	}

	// helpers: parse YYYY-MM-DD to local Date (avoid timezone shift)
	function parseDateYMD(ymd) {
		if (!ymd) return null;
		const parts = String(ymd).split('-');
		if (parts.length !== 3) return null;
		const y = parseInt(parts[0], 10);
		const m = parseInt(parts[1], 10) - 1;
		const d = parseInt(parts[2], 10);
		return new Date(y, m, d);
	}

	function startOfWeekMon(date) {
		const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const day = (d.getDay() + 6) % 7; // 0=Mondayshift
		d.setDate(d.getDate() - day);
		d.setHours(0,0,0,0);
		return d;
	}

	function formatTaskDateDisplay(ymd) {
		const d = parseDateYMD(ymd);
		if (!d) return '';
		const today = new Date();
		
		// Normalize dates to compare just the day part
		const todayYMD = ymdFromDate(today);
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayYMD = ymdFromDate(yesterday);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowYMD = ymdFromDate(tomorrow);
		
		// Check for Today, Tomorrow, Yesterday
		if (ymd === todayYMD) {
			return 'Today';
		} else if (ymd === tomorrowYMD) {
			return 'Tomorrow';
		} else if (ymd === yesterdayYMD) {
			return 'Yesterday';
		}
		
		// For other dates, show weekday if in same week, otherwise show month/day
		const inSameWeek = startOfWeekMon(d).getTime() === startOfWeekMon(today).getTime();
		const day = d.getDay(); // 0 Sun .. 6 Sat
		const weekdayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
		if (inSameWeek && day >= 1 && day <= 5) {
			return weekdayNames[day];
		}
		// else show month day
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}
	
	function isTaskOverdue(task) {
		// A task is overdue if it's not completed and the due date is in the past
		if (task.completed || !task.dueDate) return false;
		const today = new Date();
		const todayYMD = ymdFromDate(today);
		return task.dueDate < todayYMD;
	}

	// load & initial render
	tasks = loadTasks();
	renderTasks();

	// Render calendar now that tasks are loaded so we can mark days correctly
	renderCalendar();
	renderDayTasks();

	// press enter to add
	if (taskInput) {
		taskInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				const val = taskInput.value;
				if (val && val.trim()) {
					addTask(val);
					taskInput.value = '';
					taskInput.focus();
				}
			}
		});
	}

	// checkbox handling
	if (taskListEl) {
		taskListEl.addEventListener('change', (e) => {
			const target = e.target;
			if (target && target.matches('input[type="checkbox"].task-checkbox')) {
				const id = target.dataset.id;
				toggleTask(id, target.checked);
			}
		});
	}

	// ===== Pomodoro Timer Integration ===== 
	// Only initialize if pomodoro elements exist on the page
	const pomoTimerEl = document.getElementById('pomodoro-timer');
	if (pomoTimerEl) {
		const POMO_SETTINGS_KEY = 'pomoSettings';
		const POMO_STATE_KEY = 'pomoState';

		const btnStart = document.getElementById('pomo-start');
		const btnPause = document.getElementById('pomo-pause');
		const btnReset = document.getElementById('pomo-reset');
		const btnSkip = document.getElementById('pomo-skip');
		const inputWork = document.getElementById('pomo-work');
		const inputShort = document.getElementById('pomo-short');
		const inputLong = document.getElementById('pomo-long');
		const inputSessions = document.getElementById('pomo-sessions');
		const displayCurrent = document.getElementById('pomo-current');
		const displayTotal = document.getElementById('pomo-total');

		let settings = { work: 25, short: 5, long: 15, sessions: 4 };
		let state = { mode: 'work', remaining: settings.work * 60, currentSession: 0, running: false };
		let intervalId = null;

		function loadSettings() {
			try {
				const raw = localStorage.getItem(POMO_SETTINGS_KEY);
				if (raw) settings = Object.assign(settings, JSON.parse(raw));
			} catch (e) { /* ignore */ }
		}

		function saveSettings() {
			try { localStorage.setItem(POMO_SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
		}

		function loadState() {
			try {
				const raw = localStorage.getItem(POMO_STATE_KEY);
				if (raw) {
					const s = JSON.parse(raw);
					state = Object.assign(state, s);
				}
			} catch (e) { /* ignore */ }
		}

		function saveState() {
			try { localStorage.setItem(POMO_STATE_KEY, JSON.stringify(state)); } catch (e) {}
		}

		function formatTime(sec) {
			const m = Math.floor(sec / 60);
			const s = sec % 60;
			return `${m}:${String(s).padStart(2, '0')}`;
		}

		function setRemainingFromMode() {
			if (state.mode === 'work') state.remaining = Math.max(1, settings.work) * 60;
			else if (state.mode === 'short') state.remaining = Math.max(1, settings.short) * 60;
			else state.remaining = Math.max(1, settings.long) * 60;
		}

		function updateUI() {
			pomoTimerEl.textContent = formatTime(state.remaining);
			displayCurrent && (displayCurrent.textContent = state.currentSession);
			displayTotal && (displayTotal.textContent = settings.sessions);
			// disable inputs while running
			const disabled = !!state.running;
			[inputWork, inputShort, inputLong, inputSessions].forEach(i => { if (i) i.disabled = disabled; });
		}

		function tick() {
			if (state.remaining > 0) {
				state.remaining -= 1;
				updateUI();
				saveState();
			} else {
				// period ended
				clearInterval(intervalId);
				intervalId = null;
				state.running = false;
				handlePeriodEnd();
			}
		}

		function startTimer() {
			if (intervalId) return; // already running
			state.running = true;
			intervalId = setInterval(tick, 1000);
			updateUI();
			saveState();
		}

		function pauseTimer() {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
			state.running = false;
			updateUI();
			saveState();
		}

		function resetTimer() {
			pauseTimer();
			state.mode = 'work';
			state.currentSession = 0;
			setRemainingFromMode();
			updateUI();
			saveState();
		}

		function handlePeriodEnd() {
			// simple visual flash using body class
			document.body.classList.add('pomo-flash');
			setTimeout(() => document.body.classList.remove('pomo-flash'), 600);

			// remember which mode just finished (work/short/long)
			const finishedMode = state.mode;

			if (finishedMode === 'work') {
				state.currentSession = (state.currentSession || 0) + 1;
				// if finished cycle -> long break, otherwise short break
				if (state.currentSession % settings.sessions === 0) {
					state.mode = 'long';
				} else {
					state.mode = 'short';
				}
			} else {
				// a break just finished — if it was a long break, we've completed a full cycle
				if (finishedMode === 'long') {
					// reset session counter so the next cycle starts at 0
					state.currentSession = 0;
				}
				state.mode = 'work';
			}
			setRemainingFromMode();
			// auto-start next period
			startTimer();
			saveState();
		}

		function skipPhase() {
			// Immediately end current period and move to next. Auto-starts next period.
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
			state.running = false;
			saveState();
			// set remaining to 0 so handlePeriodEnd treats it as finished
			state.remaining = 0;
			handlePeriodEnd();
		}

		// Wire UI events
		btnStart && btnStart.addEventListener('click', (e) => { e.preventDefault(); startTimer(); });
		btnPause && btnPause.addEventListener('click', (e) => { e.preventDefault(); pauseTimer(); });
		btnReset && btnReset.addEventListener('click', (e) => { e.preventDefault(); resetTimer(); });
		btnSkip && btnSkip.addEventListener('click', (e) => { e.preventDefault(); skipPhase(); });

		[inputWork, inputShort, inputLong, inputSessions].forEach(inp => {
			if (!inp) return;
			inp.addEventListener('change', () => {
				// read all values
				settings.work = Math.max(1, parseInt(inputWork.value, 10) || 25);
				settings.short = Math.max(1, parseInt(inputShort.value, 10) || 5);
				settings.long = Math.max(1, parseInt(inputLong.value, 10) || 15);
				settings.sessions = Math.max(1, parseInt(inputSessions.value, 10) || 4);
				saveSettings();
				// if not running, update remaining to reflect mode change
				if (!state.running) setRemainingFromMode();
				updateUI();
			});
		});

		// Initialize
		loadSettings();
		loadState();
		// merge loaded settings into inputs
		if (inputWork) inputWork.value = settings.work;
		if (inputShort) inputShort.value = settings.short;
		if (inputLong) inputLong.value = settings.long;
		if (inputSessions) inputSessions.value = settings.sessions;
		if (!state.remaining) setRemainingFromMode();
		updateUI();
	}

});
