// Scoreboard code
const form = document.getElementById("scoreForm");
const playerNameInput = document.getElementById("playerName");
const playerScoreInput = document.getElementById("playerScore");
const scoreTableBody = document.querySelector("#scoreTable tbody");
const resetBtn = document.getElementById("resetBtn");

// Add sound effects
const addScoreSound = new Audio(
  "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
);
const resetSound = new Audio(
  "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3",
);

// Add animation class
function addAnimationClass(element) {
  element.classList.add("animate");
  setTimeout(() => element.classList.remove("animate"), 500);
}

async function fetchScores() {
  try {
    const res = await fetch("/api/scores");
    const scores = await res.json();
    renderScores(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    showNotification("Error loading scores", "error");
  }
}

function renderScores(scores) {
  scoreTableBody.innerHTML = "";
  const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);

  sortedScores.forEach(([player, score], index) => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdScore = document.createElement("td");

    tdName.textContent = player;
    tdScore.textContent = score;

    // Add rank for top 3
    if (index < 3) {
      tdName.innerHTML = `<span class="rank rank-${index + 1}">${index + 1}</span> ${player}`;
    }

    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    scoreTableBody.appendChild(tr);

    // Add animation
    setTimeout(() => {
      tr.style.opacity = "1";
      tr.style.transform = "translateY(0)";
    }, index * 100);
  });
}

// Notification system
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = playerNameInput.value.trim();
  const score = parseInt(playerScoreInput.value, 10);

  if (name && !isNaN(score)) {
    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
      });
      addScoreSound.play();
      await fetchScores();
      form.reset();
      playerNameInput.focus();
      showNotification("Score added successfully!");
    } catch (error) {
      console.error("Error adding score:", error);
      showNotification("Error adding score", "error");
    }
  }
});

resetBtn.addEventListener("click", async () => {
  if (confirm("Are you sure you want to reset all scores?")) {
    try {
      await fetch("/api/scores/reset", { method: "POST" });
      resetSound.play();
      await fetchScores();
      showNotification("Scores reset successfully");
    } catch (error) {
      console.error("Error resetting scores:", error);
      showNotification("Error resetting scores", "error");
    }
  }
});

// Timer code
let timerInterval = null;
let remainingTime = 0;
let isPaused = false;
let timerEndSound = new Audio(
  "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
);

const inputHours = document.getElementById("inputHours");
const inputMinutes = document.getElementById("inputMinutes");
const inputSeconds = document.getElementById("inputSeconds");
const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtnTimer = document.getElementById("resetBtnTimer");

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingTime);

  // Add warning class when time is running low
  if (remainingTime <= 10) {
    timerDisplay.classList.add("warning");
  } else {
    timerDisplay.classList.remove("warning");
  }
}

function startTimer() {
  if (timerInterval) return;

  if (isPaused) {
    isPaused = false;
  } else {
    const hrs = parseInt(inputHours.value) || 0;
    const mins = parseInt(inputMinutes.value) || 0;
    const secs = parseInt(inputSeconds.value) || 0;
    remainingTime = hrs * 3600 + mins * 60 + secs;

    if (remainingTime <= 0) {
      showNotification("Please enter a time greater than 0", "error");
      return;
    }
  }

  updateDisplay();
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtnTimer.disabled = false;

  timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updateDisplay();

      // Visual feedback for last 10 seconds
      if (remainingTime <= 10) {
        timerDisplay.style.animation = "pulse 1s infinite";
      }
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      timerEndSound.play();
      showNotification("Time is up!", "warning");
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtnTimer.disabled = true;
      timerDisplay.style.animation = "";
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerInterval) return;
  clearInterval(timerInterval);
  timerInterval = null;
  isPaused = true;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  timerDisplay.style.animation = "";
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isPaused = false;
  remainingTime = 0;
  updateDisplay();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtnTimer.disabled = true;
  timerDisplay.style.animation = "";

  inputHours.value = "";
  inputMinutes.value = "";
  inputSeconds.value = "";
}

// Input validation for timer
function validateTimerInput(input) {
  const value = parseInt(input.value);
  const max = parseInt(input.getAttribute("max"));

  if (value > max) {
    input.value = max;
  } else if (value < 0) {
    input.value = 0;
  }
}

inputHours.addEventListener("input", () => validateTimerInput(inputHours));
inputMinutes.addEventListener("input", () => validateTimerInput(inputMinutes));
inputSeconds.addEventListener("input", () => validateTimerInput(inputSeconds));

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtnTimer.addEventListener("click", resetTimer);

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !timerInterval) {
    startTimer();
  } else if (e.key === " " && timerInterval) {
    pauseTimer();
  } else if (e.key === "Escape") {
    resetTimer();
  }
});

// Initial load
fetchScores();
updateDisplay();
