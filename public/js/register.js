document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop the page from reloading

    // Get user input from the form
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();
    const role = document.querySelector("#role").value;

    // Use our helper function to send the data to the server
    const res = await apiRequest("/auth/register", "POST", {
      name,
      email,
      password,
      role,
    });

    // Handle the server's response
    if (res.message === "Registered successfully") {
      alert("✅ Registered! You can now log in.");
      window.location.href = "login.html"; // Redirect to the login page
    } else {
      // Show any error message from the server (e.g., "User already exists")
      alert("❌ " + (res.message || "Registration failed."));
    }
  });
});
