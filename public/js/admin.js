// public/js/admin.js

document.addEventListener("DOMContentLoaded", async () => {
  // 1. --- Security Check ---
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    alert("Access Denied. Please login as an admin.");
    window.location.href = "login.html";
    return;
  }

  // 2. --- Get HTML Element References ---
  const transactionLogList = document.querySelector("#allPayments");
  const logoutBtn = document.querySelector("#logoutBtn");
  const pageTitle = document.querySelector("h2");

  // 3. --- Attach Event Listeners ---
  logoutBtn.addEventListener("click", logout);

  // 4. --- Main Data-Loading Function ---
  async function loadTransactionLogs() {
    const transactions = await apiRequest("/payments/transactions");

    // This robust check prevents script crashes if the API fails.
    if (transactions && Array.isArray(transactions)) {
      // --- SUCCESS PATH ---
      transactionLogList.innerHTML = "";
      pageTitle.textContent = "All User Transaction Logs";

      if (transactions.length > 0) {
        transactions.forEach((t) => {
          const li = document.createElement("li");
          const senderName = t.senderId ? t.senderId.name : "[Deleted User]";
          const recipientName = t.recipientId
            ? t.recipientId.name
            : "[Deleted User]";

          li.innerHTML = `
              <div>
                <strong>${senderName}</strong> sent <strong>₹${t.amount.toLocaleString()}</strong> to <strong>${recipientName}</strong>
              </div>
              <div class="timestamp">
                On: ${new Date(t.createdAt).toLocaleString()}
              </div>
            `;
          transactionLogList.appendChild(li);
        });
      } else {
        transactionLogList.innerHTML =
          "<li>No transactions have been made yet.</li>";
      }
    } else {
      // --- FAILURE PATH ---
      const errorMessage = transactions
        ? transactions.message
        : "An unknown error occurred.";
      alert("❌ Error fetching logs: " + errorMessage);
      pageTitle.textContent = "Error Loading Data";
      transactionLogList.innerHTML = `<li>Failed to load transaction logs.</li>`;
    }
  }

  // 5. --- Initial Call ---
  loadTransactionLogs();
});
