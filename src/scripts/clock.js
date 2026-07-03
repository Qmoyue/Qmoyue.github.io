let renderedCalendarKey = "";

function pad(value) {
  return String(value).padStart(2, "0");
}

function renderCalendar(now) {
  const monthLabel = document.querySelector("[data-calendar-month]");
  const todayLabel = document.querySelector("[data-calendar-today]");
  const daysGrid = document.querySelector("[data-calendar-days]");
  if (!monthLabel || !todayLabel || !daysGrid) return;

  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();
  const key = `${year}-${month}-${dayOfMonth}`;
  if (renderedCalendarKey === key) return;
  renderedCalendarKey = key;

  monthLabel.textContent = `${year} / ${pad(month + 1)}`;
  todayLabel.textContent = `${pad(month + 1)}.${pad(dayOfMonth)}`;

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < mondayOffset; index += 1) {
    const blank = document.createElement("span");
    blank.className = "is-blank";
    fragment.append(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cellDate = new Date(year, month, day);
    const cell = document.createElement("span");
    cell.textContent = String(day);
    if (day === dayOfMonth) {
      cell.classList.add("is-today");
      cell.setAttribute("aria-current", "date");
    }
    if (cellDate.getDay() === 0 || cellDate.getDay() === 6) cell.classList.add("is-weekend");
    fragment.append(cell);
  }

  daysGrid.replaceChildren(fragment);
}

function updateClock() {
  const clock = document.querySelector("[data-clock-time]");
  const date = document.querySelector("[data-clock-date]");
  const now = new Date();
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

  if (clock) {
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  if (date) {
    date.textContent = `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日${weekdays[now.getDay()]}`;
  }

  renderCalendar(now);
}

updateClock();
setInterval(updateClock, 1000);

