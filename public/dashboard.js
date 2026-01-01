let expenseChart = null;
let monthlyChart = null;

// ==========================
// AUTH CHECK (JWT)
// ==========================
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

if (!token) {
  alert("Please login again");
  window.location.href = "index.html";
}

// Display username
const userNameEl = document.getElementById("userName");
if (userNameEl) {
  userNameEl.textContent = username.charAt(0).toUpperCase() + username.slice(1);
}

// TEMP: Show family label (until backend /me route is added)
const familyCodeText = document.getElementById("familyCodeText");
if (familyCodeText) {
  familyCodeText.textContent = "Shared Family";
}

// ==========================
// API BASE URL
// ==========================
const API_BASE = "http://localhost:5000/api";

// ==========================
// GLOBAL STATE
// ==========================
let familyExpenses = [];
let chart;

// ==========================
// FETCH FAMILY EXPENSES
// ==========================
async function loadExpenses() {
  try {
    const res = await fetch(`${API_BASE}/expense`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Server error while loading expenses");
      return;
    }

    const expenses = await res.json();
    const mobileList = document.createElement("div");
    mobileList.className = "mobile-expense-list";

    expenses.forEach((exp) => {
      const card = document.createElement("div");
      card.className = "expense-card";

      card.innerHTML = `
    <h4>${exp.detail}</h4>
    <p>€${exp.amount} • ${exp.status}</p>
    <p>${exp.merchant}</p>
    <p>${exp.date}</p>
  `;

      mobileList.appendChild(card);
    });

    document.querySelector(".expenses-section").appendChild(mobileList);

    // ✅ ADD CHART CALLS HERE
    updateChart(expenses);
    renderMonthlyChart(expenses);

    tableBody.innerHTML = "";

    if (expenses.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:20px;">
            No expenses found
          </td>
        </tr>`;
      return;
    }

    expenses.forEach((exp) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${exp.date}</td>
        <td>${exp.detail}</td>
        <td>${exp.merchant}</td>
        <td>€${exp.amount}</td>
        <td>${exp.status}</td>
        <td>${exp.addedBy}</td>
        <td>
          <button onclick="deleteExpense('${exp._id}')">
            <i class="fa fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    alert("Server error while loading expenses");
  }
}

// ==========================
// RENDER TABLE
// ==========================

function renderExpenses(expenses) {
  tableBody.innerHTML = "";

  if (!expenses.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:#9ca3af;">
          No expenses found
        </td>
      </tr>`;
    return;
  }

  expenses.forEach((exp) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.detail}</td>
      <td>${exp.merchant}</td>
      <td>€${exp.amount}</td>
      <td>${exp.status}</td>
      <td>${exp.addedBy?.username || "You"}</td>
      <td>
        <button onclick="deleteExpense('${exp._id}')">
          🗑
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

const tableBody = document.querySelector("#expenseTable tbody");

function renderTable() {
  tableBody.innerHTML = "";

  if (familyExpenses.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:#9ca3af; padding:20px;">
          No expense records found.
        </td>
      </tr>`;
    return;
  }

  familyExpenses.forEach((exp, index) => {
    const statusClass =
      exp.status === "submitted" ? "status-submitted" : "status-pending";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.detail}</td>
      <td>${exp.merchant}</td>
      <td>€${exp.amount}</td>
      <td><span class="${statusClass}">${exp.status}</span></td>
      <td>${exp.addedBy}</td>
      <td>
        <button class="delete-btn" data-id="${exp._id}">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", deleteExpense);
  });
}

// ==========================
// DELETE EXPENSE
// ==========================
async function deleteExpense(id) {
  if (!confirm("Delete expense?")) return;

  await fetch(`${API_BASE}/expense/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  loadExpenses();
}

// ==========================
// ADD EXPENSE
// ==========================
const modal = document.getElementById("expenseModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.querySelector(".close-btn");

if (openBtn && modal && closeBtn) {
  openBtn.onclick = () => (modal.style.display = "flex");
  closeBtn.onclick = () => (modal.style.display = "none");
}

document
  .getElementById("addExpenseForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const expense = {
      date: expDate.value,
      detail: expCategory.value,
      merchant: expMerchant.value,
      amount: Number(expAmount.value),
      status: expStatus.value,
    };

    try {
      const res = await fetch(`${API_BASE}/expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expense),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      modal.style.display = "none";
      e.target.reset();
      loadExpenses();
    } catch (err) {
      alert("Failed to save expense");
      console.error(err);
    }
  });

// ==========================
// CHART
// ==========================
function updateChart(expenses) {
  const ctx = document.getElementById("expenseChart");
  if (!ctx) return;

  const categoryTotals = {};

  expenses.forEach((exp) => {
    categoryTotals[exp.detail] = (categoryTotals[exp.detail] || 0) + exp.amount;
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#fb923c",
            "#3b82f6",
            "#22c55e",
            "#a855f7",
            "#f43f5e",
            "#14b8a6",
            "#eab308",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#fff" },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function renderMonthlyChart(expenses) {
  const ctx = document.getElementById("monthlyTrendChart");
  if (!ctx) return;

  const monthlyTotals = {};

  expenses.forEach((exp) => {
    const month = exp.date.slice(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
  });

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(monthlyTotals),
      datasets: [
        {
          label: "Monthly Spending (€)",
          data: Object.values(monthlyTotals),
          borderColor: "#fb923c",
          backgroundColor: "rgba(251,146,60,0.3)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#fff" },
        },
      },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } },
      },
      responsive: true,
    },
  });
}

// ==========================
// SUMMARY CARDS
// ==========================
function updateStats(expenses) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const submitted = expenses.filter((e) => e.status === "submitted").length;
  const pending = expenses.length - submitted;
  const avg = expenses.length ? total / expenses.length : 0;

  totalSpent.textContent = `€${total}`;
  submittedCount.textContent = submitted;
  pendingCount.textContent = pending;
  avgSpent.textContent = `€${avg.toFixed(0)}`;
}

// ==========================
// LOGOUT
// ==========================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

// ==========================
// CATEGORY PICKER (FIXED)
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const categoryInput = document.getElementById("expCategory");
  const categoryModal = document.getElementById("categoryModal");
  const closeCategory = document.getElementById("closeCategory");

  if (!categoryInput || !categoryModal) {
    console.error("Category elements missing");
    return;
  }

  categoryInput.addEventListener("click", () => {
    categoryModal.style.display = "block";
  });

  closeCategory.addEventListener("click", () => {
    categoryModal.style.display = "none";
  });

  document.querySelectorAll(".category-item").forEach((item) => {
    item.addEventListener("click", () => {
      categoryInput.value = item.innerText.trim();
      categoryModal.style.display = "none";
    });
  });
});

// ==========================
// INITIAL LOAD
// ==========================
loadExpenses();
