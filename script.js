const budgetForm = document.getElementById("budgetForm");
const categoryForm = document.getElementById("categoryForm");

const setupSection = document.getElementById("setupSection");
const budgetSection = document.getElementById("budgetSection");

const budgetTitle = document.getElementById("budgetTitle");
const displayDate = document.getElementById("displayDate");
const incomeDisplay = document.getElementById("incomeDisplay");
const plannedDisplay = document.getElementById("plannedDisplay");
const balanceDisplay = document.getElementById("balanceDisplay");
const budgetBody = document.getElementById("budgetBody");

const currencySelect = document.getElementById("currency");
const colorPicker = document.getElementById("colorPicker");
const selectedEmoji = document.getElementById("selectedEmoji");

const budgetType = document.getElementById("budgetType");
const monthlyFields = document.getElementById("monthlyFields");
const dateRangeFields = document.getElementById("dateRangeFields");

let budgets = [];
let activeBudgetId = null;

function getCurrencySymbol() {
    return currencySelect.value === "USD" ? "$" : "₱";
}

function formatMoney(amount) {
    return `${getCurrencySymbol()}${Number(amount).toLocaleString()}`;
}

function getTextColor(backgroundColor) {
  // Remove the # from a hex color like #FE8254
  const hex = backgroundColor.replace("#", "");

  // Convert hex pairs to red, green, blue numbers
  const red = parseInt(hex.substring(0, 2), 16);
  const green = parseInt(hex.substring(2, 4), 16);
  const blue = parseInt(hex.substring(4, 6), 16);

  // Calculate brightness
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  // Light background = dark text, dark background = white text
  return brightness > 160 ? "#1F2937" : "#FFFFFF";
}

function updateBudgetTypeFields() {
    const isMonthly = budgetType.value === "monthly";

    monthlyFields.classList.toggle("hidden", !isMonthly);
    dateRangeFields.classList.toggle("hidden", isMonthly);

    if (isMonthly) {
        document.getElementById("salary").placeholder = "Monthly Income";
    } else {
        document.getElementById("salary").placeholder = "Income for This Cutoff";
    }
}

budgetType.addEventListener("change", updateBudgetTypeFields);
updateBudgetTypeFields();

function getActiveBudget() {
    return budgets.find((item) => item.id === activeBudgetId);
}

function saveBudgets() {
    localStorage.setItem("budgets", JSON.stringify(budgets));
    localStorage.setItem("activeBudgetId", activeBudgetId);
}

function renderBudgetSelector() {
    const selector = document.getElementById("budgetSelector");

    selector.innerHTML = budgets.map((item) => `
    <option value="${item.id}">
      ${item.title}
    </option>
  `).join("");

    selector.value = activeBudgetId;
}

function saveBudget() {
    localStorage.setItem("myBudget", JSON.stringify(budget));
}

function renderBudget() {
    const budget = getActiveBudget();

    if (!budget) return;

    budgetTitle.textContent = budget.title;
    if (budget.type === "monthly") {
        displayDate.textContent = budget.month;
    } else {
        displayDate.textContent = `${budget.startDate} to ${budget.endDate}`;
    }

    const totalPlanned = budget.categories.reduce((total, item) => {
        return total + item.amount;
    }, 0);

    const remaining = budget.income - totalPlanned;

    incomeDisplay.textContent = formatMoney(budget.income);
    plannedDisplay.textContent = formatMoney(totalPlanned);
    balanceDisplay.textContent = formatMoney(remaining);

    budgetBody.innerHTML = "";

    budget.categories.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
      <td class="border p-2">${item.emoji} ${item.name}</td>
      <td class="border p-2 text-right">${formatMoney(item.amount)}</td>
      <td class="border p-2 text-right">${formatMoney(remaining)}</td>
      <td class="border p-2 text-center">
        <button
          onclick="deleteCategory(${index})"
          class="text-red-500 hover:underline"
        >
          Delete
        </button>
      </td>
    `;

        budgetBody.appendChild(row);
    });

    renderBudgetSelector();
    saveBudgets();
}

budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newBudget = {
        id: crypto.randomUUID(),
        type: budgetType.value,
        title: document.getElementById("title").value,
        income: Number(document.getElementById("salary").value),
        categories: []
    };

    if (newBudget.type === "monthly") {
        newBudget.month = document.getElementById("monthPicker").value;
    } else {
        newBudget.startDate = document.getElementById("startDate").value;
        newBudget.endDate = document.getElementById("endDate").value;
    }

    budgets.push(newBudget);
    activeBudgetId = newBudget.id;

    setupSection.classList.add("hidden");
    budgetSection.classList.remove("hidden");

    budgetForm.reset();
    renderBudget();
});

categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const budget = getActiveBudget();

    if (!budget) return;

    budget.categories.push({
        name: document.getElementById("category").value,
        amount: Number(document.getElementById("amount").value),
        emoji: selectedEmoji.value
    });

    categoryForm.reset();
    selectedEmoji.value = "✨";

    renderBudget();
});

document.querySelectorAll(".emojiBtn").forEach((button) => {
    button.addEventListener("click", () => {
        selectedEmoji.value = button.dataset.emoji;

        document.querySelectorAll(".emojiBtn").forEach((emojiButton) => {
            emojiButton.classList.remove("ring-2", "ring-[#FE8254]");
        });

        button.classList.add("ring-2", "ring-[#FE8254]");
    });
});

function deleteCategory(index) {
    const budget = getActiveBudget();

    if (!budget) return;

    budget.categories.splice(index, 1);
    renderBudget();
}

document.getElementById("newBudgetBtn").addEventListener("click", () => {
    budgetSection.classList.add("hidden");
    setupSection.classList.remove("hidden");

    budgetForm.reset();
});

document.getElementById("deleteBudgetBtn").addEventListener("click", () => {
  const budget = getActiveBudget();

  if (!budget) return;

  const shouldDelete = confirm(
    `Delete "${budget.title}"? This cannot be undone.`
  );

  if (!shouldDelete) return;

  // Remove only the currently active budget
  budgets = budgets.filter((item) => item.id !== activeBudgetId);

  // If another budget exists, open the newest remaining one
  if (budgets.length > 0) {
    activeBudgetId = budgets[budgets.length - 1].id;
    renderBudget();
    return;
  }

  // If there are no budgets left, return to the setup screen
  activeBudgetId = null;
  localStorage.removeItem("budgets");
  localStorage.removeItem("activeBudgetId");

  budgetSection.classList.add("hidden");
  setupSection.classList.remove("hidden");
  budgetForm.reset();
});

document.getElementById("budgetSelector").addEventListener("change", (event) => {
    activeBudgetId = event.target.value;
    renderBudget();
});

function applyThemeColor(color) {
  const textColor = getTextColor(color);

  document.documentElement.style.setProperty("--user-color", color);
  document.documentElement.style.setProperty("--user-text-color", textColor);
}

colorPicker.addEventListener("input", (event) => {
    const chosenColor = event.target.value;

    applyThemeColor(chosenColor);
    localStorage.setItem("themeColor", chosenColor);
});

currencySelect.addEventListener("change", renderBudget);

window.addEventListener("load", () => {
    const savedBudgets = localStorage.getItem("budgets");
    const savedActiveBudgetId = localStorage.getItem("activeBudgetId");
    const savedThemeColor = localStorage.getItem("themeColor");

    if (savedThemeColor) {
    applyThemeColor(savedThemeColor);
    colorPicker.value = savedThemeColor;
    }

    if (savedBudgets) {
        budgets = JSON.parse(savedBudgets);
        activeBudgetId = savedActiveBudgetId || budgets[0]?.id;

        if (budgets.length > 0) {
            setupSection.classList.add("hidden");
            budgetSection.classList.remove("hidden");

            renderBudget();
        }
    }
});

document.querySelectorAll(".budgetTypeBtn").forEach((button) => {
  button.addEventListener("click", () => {
    budgetType.value = button.dataset.budgetType;

    budgetType.dispatchEvent(new Event("change"));

    document.querySelectorAll(".budgetTypeBtn").forEach((item) => {
      item.classList.remove("border-[#3F5A52]", "bg-[#E9E1CA]");
      item.classList.add("border-transparent", "bg-[#FFF8F3]");
    });

    button.classList.remove("border-transparent", "bg-[#FFF8F3]");
    button.classList.add("border-[#3F5A52]", "bg-[#E9E1CA]");
  });
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}