const calendarTitle = document.getElementById("calendarTitle");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthButton = document.getElementById("prevMonthButton");
const nextMonthButton = document.getElementById("nextMonthButton");
const helpButton = document.getElementById("helpButton");
const helpDialog = document.getElementById("helpDialog");
const closeHelpButton = document.getElementById("closeHelpButton");
const statusText = document.getElementById("statusText");

const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

const requiredMembers = 3;

// Ver.0.2用の仮データです。Ver.0.3以降でFirebase連携に変更します。
const sampleAttendance = {
  // 例: "2026-07-08": 3
};

function pad2(num) {
  return String(num).padStart(2, "0");
}

function toDateKey(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function isSameDate(a, year, monthIndex, day) {
  return a.getFullYear() === year && a.getMonth() === monthIndex && a.getDate() === day;
}

function isWednesday(year, monthIndex, day) {
  const date = new Date(year, monthIndex, day);
  return date.getDay() === 3;
}

function getMondayBasedBlankCount(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0=日
  return (firstDay + 6) % 7; // 月曜始まりに変換
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const monthLabel = `${currentYear}年${currentMonth + 1}月`;
  calendarTitle.textContent = monthLabel;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const blankCount = getMondayBasedBlankCount(currentYear, currentMonth);

  for (let i = 0; i < blankCount; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = toDateKey(currentYear, currentMonth, day);
    const count = sampleAttendance[key] || 0;
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day-cell";

    if (isSameDate(today, currentYear, currentMonth, day)) {
      cell.classList.add("today");
    }

    if (isWednesday(currentYear, currentMonth, day)) {
      cell.classList.add("gym-day");
    }

    if (count >= requiredMembers) {
      cell.classList.add("confirmed");
    }

    const note = count >= requiredMembers
      ? `🟢${count}`
      : count > 0
        ? `${count}名`
        : isWednesday(currentYear, currentMonth, day)
          ? "候補"
          : "";

    cell.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="day-note">${note}</span>
    `;

    cell.addEventListener("click", () => {
      alert(`${currentMonth + 1}月${day}日\nVer.0.3で参加登録画面を追加します。`);
    });

    calendarGrid.appendChild(cell);
  }

  updateStatus();
}

function updateStatus() {
  // Ver.0.2では仮表示。Ver.0.3で次回開催候補日の人数から自動算出します。
  statusText.textContent = `あと${requiredMembers}名`;
}

prevMonthButton.addEventListener("click", () => {
  currentMonth -= 1;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear -= 1;
  }
  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  currentMonth += 1;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  renderCalendar();
});

helpButton.addEventListener("click", () => {
  if (typeof helpDialog.showModal === "function") {
    helpDialog.showModal();
  } else {
    alert("使い方\n1. 日付をタップ\n2. 名前を選択\n3. 参加するを押します");
  }
});

closeHelpButton.addEventListener("click", () => {
  helpDialog.close();
});

renderCalendar();
