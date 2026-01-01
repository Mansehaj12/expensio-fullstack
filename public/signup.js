document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("newUsername").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value;

  const option = document.querySelector(
    'input[name="familyOption"]:checked'
  ).value;

  const familyName = document.getElementById("familyName")?.value || "";
  const familyCode = document.getElementById("familyCode")?.value || "";

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        option,
        familyName,
        familyCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Signup failed");
      return;
    }

    alert(
      `Signup successful!\nYour Family Code: ${data.familyCode}\nPlease save it`
    );

    window.location.href = "index.html"; // go to login
  } catch (err) {
    alert("Server error. Try again later.");
  }
});
