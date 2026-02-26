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
const expensesTableBody = qs("#expensesTable tbody");
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
    const tr = document.createElement("tr");
    const tdDate = document.createElement("td");
    tdDate.textContent = ex.date || "";
    const tdDesc = document.createElement("td");
    tdDesc.textContent = ex.desc;
    const tdCat = document.createElement("td");
    tdCat.textContent = ex.category || defaultCategory;
    const tdAmt = document.createElement("td");
    tdAmt.textContent = `₹${ex.amount.toFixed(2)}`;
    const tdAct = document.createElement("td");
    tdAct.setAttribute("class", "delete-transaction-btn");
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
    tdAct.appendChild(del);
    tr.appendChild(tdAmt);
    tr.appendChild(tdCat);
    tr.appendChild(tdDesc);
    tr.appendChild(tdDate);
    tr.appendChild(tdAct);
    expensesTableBody.prepend(tr);
  });
}

function showMain() {
  document.body.style.overflow = "hidden";
  mainSection.style.display = "";
  setTimeout(() => {
    openingSection.style.display = "none";
    document.body.style.overflow = "";
  }, 300);
  renderExpenses();
  updateDisplays();
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

addExpenseBtn.addEventListener("click", addExpense);
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
}

resetBtn.addEventListener("click", () => {
  if (!confirm("Clear opening balance and all expenses?")) return;

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
  } else {
    // 🟢 OPEN
    formContainer.classList.add("show");
    card.style.filter = "brightness(25%)";
    formAccessBtn.classList.add("form-opened");

    setTimeout(() => {
      expenseForm.classList.add("active");
      amount.required = true;
      amount.focus(); // auto focus input
    }, 200); // match your animation time
  }
});

expensesTableBody.addEventListener("dblclick", (e) => {
  const clickedRow = e.target.closest("tr");
  if (!clickedRow) return;

  clickedRow.classList.toggle("active-row");
});
