
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
});
