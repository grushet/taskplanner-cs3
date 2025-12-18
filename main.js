
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
			const dayDiv = document.createElement('div');
			dayDiv.className = 'calendar-day other-month';
			dayDiv.textContent = daysInPrevMonth - i;
			calendarDaysEl.appendChild(dayDiv);
		}

		// Current month's days
		for (let day = 1; day <= daysInMonth; day++) {
			const dayDiv = document.createElement('div');
			dayDiv.className = 'calendar-day';
			dayDiv.textContent = day;

			// Highlight today
			if (day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
				dayDiv.classList.add('today');
			}

			calendarDaysEl.appendChild(dayDiv);
		}

		// Next month's days
		const totalCells = calendarDaysEl.children.length;
		const remainingCells = 42 - totalCells; // 6 rows * 7 days
		for (let day = 1; day <= remainingCells; day++) {
			const dayDiv = document.createElement('div');
			dayDiv.className = 'calendar-day other-month';
			dayDiv.textContent = day;
			calendarDaysEl.appendChild(dayDiv);
		}
	}

	prevMonthBtn.addEventListener('click', () => {
		currentDate.setMonth(currentDate.getMonth() - 1);
		renderCalendar();
	});

	nextMonthBtn.addEventListener('click', () => {
		currentDate.setMonth(currentDate.getMonth() + 1);
		renderCalendar();
	});

	// Initial calendar render
	renderCalendar();

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
			// date badge or 'add date' affordance
			if (task.dueDate) {
				const badge = document.createElement('span');
				badge.className = 'task-date-badge';
				badge.tabIndex = 0;
				badge.title = new Date(task.dueDate).toLocaleDateString();
				badge.textContent = formatTaskDateDisplay(task.dueDate);
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

	function addTask(text) {
		const trimmed = String(text || '').trim();
		if (!trimmed) return;
		// due date is optional and can be added inline after creation
		const task = { id: Date.now(), text: trimmed, completed: false, createdAt: Date.now(), dueDate: null };
		tasks.unshift(task);
		saveTasks();
		renderTasks();
	}

	function toggleTask(id, completed) {
		const idx = tasks.findIndex(t => String(t.id) === String(id));
		if (idx === -1) return;
		tasks[idx].completed = !!completed;
		saveTasks();
		renderTasks();
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
		const inSameWeek = startOfWeekMon(d).getTime() === startOfWeekMon(today).getTime();
		const day = d.getDay(); // 0 Sun .. 6 Sat
		const weekdayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
		if (inSameWeek && day >= 1 && day <= 5) {
			return weekdayNames[day];
		}
		// else show month day
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}

	// load & initial render
	tasks = loadTasks();
	renderTasks();

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

});
