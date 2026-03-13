const qs = (s) => document.querySelector(s);
const openingKey = "expenses_opening";
const expensesKey = "expenses_list";
const openingInput = qs("#openingInput");
const setOpeningBtn = qs("#setOpeningBtn");
const openingSection = qs("#openingSection");
const mainSection = qs("#mainSection");
const openingDisplay = qs("#openingDisplay");
const spentDisplay = qs("#spentDisplay");
const remainingDisplay = qs("#remainingDisplay");
const desc = qs("#desc");
const categoryEl = qs("#category");
const amount = qs("#amount");
const addExpenseBtn = qs("#addExpenseBtn");
const expensesTableBody = qs("#expensesTable");
const resetBtn = qs("#resetBtn");
const defaultCategory = "General";

const card = qs(".card");
const formContainer = qs(".form-container");
const formAccessBtn = qs(".form-access-btn");
const expenseForm = qs("#expenseForm");

let opening = 0;
let expenses = [];

function save() {
  localStorage.setItem(openingKey, String(opening));
  localStorage.setItem(expensesKey, JSON.stringify(expenses));
}

function load() {
  const o = localStorage.getItem(openingKey);
  const e = localStorage.getItem(expensesKey);
  opening = o ? parseFloat(o) : 0;
  expenses = e ? JSON.parse(e) : [];
  expenses = expenses.map((it) => ({
    ...it,
    category: it.category || defaultCategory,
  }));
}

function updateDisplays() {
  const spent = expenses.reduce((s, it) => s + Number(it.amount), 0);
  const remaining = opening - spent;
  openingDisplay.textContent = `₹${opening.toFixed(2)}`;
  spentDisplay.textContent = `₹${spent.toFixed(2)}`;
  remainingDisplay.textContent = `₹${remaining.toFixed(2)}`;
  remainingDisplay.classList.toggle("neg", remaining < 0);
}

function renderExpenses() {
  expensesTableBody.innerHTML = "";
  expenses.forEach((ex, idx) => {
    const transaction = document.createElement("div");
    transaction.className = "transaction-row";
    transaction.setAttribute("data-idx", idx);
    transaction.setAttribute(
      "title",
      `Category: ${ex.category}\nDescription: ${ex.desc}\nAmount: ₹${ex.amount.toFixed(2)}\nDate: ${ex.date}`,
    );
    const date = createDateElement(ex.date);
    const description = document.createElement("div");
    description.setAttribute("class", "transaction-desc");
    description.setAttribute("title", `Description: ${ex.desc}`);
    description.setAttribute("data-desc", ex.desc);
    description.textContent = ex.desc;
    const category = document.createElement("div");
    category.setAttribute("class", "transaction-category");
    category.setAttribute("title", `Category: ${ex.category}`);
    category.setAttribute("data-category", ex.category);
    category.textContent = ex.category || defaultCategory;
    const amountDisplay = document.createElement("div");
    amountDisplay.setAttribute("class", "transaction-amount");
    amountDisplay.setAttribute("title", `Amount: ₹${ex.amount.toFixed(2)}`);
    amountDisplay.setAttribute("data-amount", ex.amount);
    amountDisplay.textContent = `₹${ex.amount.toFixed(2)}`;
    const action = document.createElement("td");
    action.setAttribute("title", "Delete this transaction");
    action.setAttribute("data-idx", idx);
    action.setAttribute("class", "delete-transaction-btn");
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "ghost";
    del.style.padding = "6px 8px";
    del.onclick = () => {
      const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?",
      );

      if (!confirmDelete) return; // stop if user clicks Cancel

      expenses.splice(idx, 1);
      save();
      renderExpenses();
      updateDisplays();
    };
    action.appendChild(del);
    transaction.appendChild(amountDisplay);
    transaction.appendChild(category);
    transaction.appendChild(description);
    transaction.appendChild(date);
    transaction.appendChild(action);
    expensesTableBody.prepend(transaction);
  });
}

function createDateElement(dateTime) {
  const dateDiv = document.createElement("div");
  dateDiv.className = "transaction-date";
  dateDiv.setAttribute("title", `Date: ${dateTime}`);

  if (!dateTime) return dateDiv;

  const parts = dateTime.split(", ");
  // because toLocaleString() returns: "3/13/2026, 10:42:21 PM"

  const datePart = parts[0] || "";
  const timePart = parts[1] || "";

  const dateSpan = document.createElement("span");
  dateSpan.className = "date-part";
  dateSpan.textContent = datePart;

  const timeSpan = document.createElement("span");
  timeSpan.className = "time-part";
  timeSpan.textContent = timePart;

  dateDiv.appendChild(dateSpan);
  dateDiv.appendChild(timeSpan);

  return dateDiv;
}

function showMain() {
  document.body.style.overflow = "hidden";
  mainSection.style.display = "";
  setTimeout(() => {
    openingSection.style.display = "none";
    document.body.style.overflow = "";
  }, 300);
  setTimeout(() => {
    renderExpenses();
    updateDisplays();
  }, 300);
}

setOpeningBtn.addEventListener("click", () => {
  const v = parseFloat(openingInput.value);
  if (isNaN(v) || v < 0) {
    alert("Enter a valid non-negative opening balance");
    return;
  }
  opening = v;
  save();
  showMain();
  openingSection.style.animation = "removeScreenAnimation 0.3s forwards";
  mainSection.style.animation = "showScreenAnimation 0.3s forwards";
  formContainer.style.display = "flex";
});

openingInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") setOpeningBtn.click();
});

expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();
  addExpense();
});
function addExpense() {
  let d = desc.value.trim();
  const c = categoryEl && categoryEl.value ? categoryEl.value : defaultCategory;
  const a = parseFloat(amount.value);

  if (d === "") {
    d = "Expense";
  }

  if (isNaN(a) || a <= 0) {
    alert("Enter a positive amount");
    return;
  }

  expenses.push({
    category: c,
    amount: Number(a),
    desc: d,
    date: new Date().toLocaleString(),
  });

  save();
  renderExpenses();
  updateDisplays();

  desc.value = "";
  amount.value = "";
  amount.focus();

  formAccessBtn.click();
  amount.required = false;

  setTimeout(() => {
    sendNotification(`Added new expense of ₹${a}`);
  }, 200);
}

resetBtn.addEventListener("click", () => {
  if (!confirm("Clear opening balance and all expenses?")) return;

  if (!confirm("All the data will be deleted. Are you sure?")) return;

  document.body.style.overflow = "hidden";
  openingSection.style.display = "";
  openingSection.style.animation = "showScreenAnimation 0.3s forwards";
  mainSection.style.animation = "removeScreenAnimation 0.3s forwards";
  formContainer.style.display = "none";
  setTimeout(() => {
    document.body.style.overflow = "";
    localStorage.removeItem(openingKey);
    localStorage.removeItem(expensesKey);
    opening = 0;
    expenses = [];
    mainSection.style.display = "none";
    openingInput.value = "";
  }, 300);
});

// init
load();
if (opening > 0) showMain();
else {
  openingSection.style.display = "";
  mainSection.style.display = "none";
  formContainer.style.display = "none";
}

//
//
//

formAccessBtn.addEventListener("click", () => {
  const isOpen = formContainer.classList.contains("show");

  if (isOpen) {
    // 🔴 CLOSE
    formContainer.classList.remove("show");
    expenseForm.classList.remove("active");
    formAccessBtn.classList.remove("form-opened");
    card.style.filter = "";
    mainSection.style.top = "";
    document.body.querySelector(".reset-all-btn").style.display = "";
  } else {
    // 🟢 OPEN
    formContainer.classList.add("show");
    card.style.filter = "brightness(25%)";
    formAccessBtn.classList.add("form-opened");
    mainSection.style.top = "-60px";
    document.body.querySelector(".reset-all-btn").style.display = "none";

    setTimeout(() => {
      expenseForm.classList.add("active");
      amount.required = true;
    }, 200); // match your animation time
  }
});

let pressTimer;
const longPressDuration = 500; // 500ms = half second
expensesTableBody.addEventListener("touchstart", (e) => {
  const clickedRow = e.target.closest("div");
  if (!clickedRow) return;

  pressTimer = setTimeout(() => {
    clickedRow.classList.toggle("active-row");
  }, longPressDuration);
});

expensesTableBody.addEventListener("touchend", () => {
  clearTimeout(pressTimer);
});

expensesTableBody.addEventListener("touchmove", () => {
  clearTimeout(pressTimer);
});

//
//
//
//
const notifications = qs(".notifications");
function sendNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notifications.prepend(notification);
  if (navigator) {
    navigator.vibrate(200);
  }

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

//
//
//
//
let cats = {};
expenses.forEach((e) => {
  if (!cats[e.category]) {
    cats[e.category] = {
      count: 1,
      totalAmount: e.amount,
    };
  } else {
    cats[e.category].count++;
    cats[e.category].totalAmount += e.amount;
  }
});
