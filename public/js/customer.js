// public/js/customer.js

document.addEventListener("DOMContentLoaded", async () => {
  // 1. --- Security and User Check ---
  // NEW CODE:
  const user = getCurrentUser();
  if (!user) {
    console.log("❌ No valid token found - redirecting to login");
    window.location.replace("/login.html"); 
    return;
  }

  if (user.role !== "customer") {
    console.log("❌ User role is:", user.role, "- not a customer");
    alert("Access Denied. This page is for customers only.");
    localStorage.removeItem("token");
    window.location.replace("/login.html"); 
    return;
  }

  // 2. --- Get HTML Element References ---
  const container = document.querySelector(".container");
  const logoutBtn = document.querySelector("#logoutBtn");
  const transferForm = document.querySelector("#transferForm");
  const recipientSelect = document.querySelector("#recipient");
  const amountInput = document.querySelector("#transferAmount");

  // 3. --- Display Initial User Information ---
  const balanceElem = document.createElement("h3");
  balanceElem.id = "balanceDisplay";
  balanceElem.textContent = `Balance: ₹${user.balance.toLocaleString()}`;
  container.insertBefore(balanceElem, container.children[1]);

  // 4. --- Attach Event Listeners ---
  logoutBtn.addEventListener("click", logout);

  transferForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const recipientId = recipientSelect.value;
    const amount = amountInput.value;

    if (!recipientId) {
      alert("❌ Please select a recipient.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("❌ Please enter a valid, positive amount.");
      return;
    }

    const res = await apiRequest("/payments/transfer", "POST", {
      recipientId,
      amount,
    });

    if (res.message === "Transfer successful!") {
      alert("✅ " + res.message);
      document.querySelector(
        "#balanceDisplay"
      ).textContent = `Balance: ₹${res.newBalance.toLocaleString()}`;
      transferForm.reset();
    } else {
      alert("❌ " + (res.message || "An unknown error occurred."));
    }
  });

  // 5. --- Function to Load Dynamic Data ---
  async function loadUsersForTransfer() {
    const users = await apiRequest("/payments/users");

    if (users && Array.isArray(users) && users.length > 0) {
      users.forEach((u) => {
        const option = document.createElement("option");
        option.value = u._id;
        option.textContent = u.name;
        recipientSelect.appendChild(option);
      });
    }
  }

  // 6. --- Initial Function Call ---
  loadUsersForTransfer();
});
