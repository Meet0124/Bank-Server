document.addEventListener("DOMContentLoaded", () => {
  // This part of the code will do nothing until a user can successfully log in
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const user = jwt_decode(token);
      window.location.href =
        user.role === "admin" ? "admin.html" : "customer.html";
      return;
    } catch {
      localStorage.removeItem("token");
    }
  }

  const form = document.querySelector("#loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    // In Step 3, this API call will fail (likely with a 404),
    // which is the expected behavior.
    const res = await apiRequest("/auth/login", "POST", { email, password });

    if (res.token) {
      // This block will not be reached until Step 4 is complete
      localStorage.setItem("token", res.token);
      const user = jwt_decode(res.token);
      window.location.href =
        user.role === "admin" ? "admin.html" : "customer.html";
    } else {
      // In Step 3, this is the block that will run, showing an error.
      alert("❌ " + (res.message || "Login service is not available yet."));
    }
  });
});
