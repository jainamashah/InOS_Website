// Waitlist signups are delivered by FormSubmit (https://formsubmit.co) to this inbox.
// The first submission triggers an activation email that must be confirmed once.
const CONTACT_EMAIL = "jainam@u.nus.edu";
const ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

const form = document.getElementById("waitlist");
const emailInput = document.getElementById("email");
const status = document.getElementById("form-status");
const success = document.getElementById("success");
const successEmail = document.getElementById("success-email");
const defaultNote = status.textContent;

document.getElementById("year").textContent = new Date().getFullYear();

function setError(message) {
  form.classList.add("is-error");
  status.innerHTML = message;
}

function clearError() {
  form.classList.remove("is-error");
  status.textContent = defaultNote;
}

function showSuccess(email) {
  successEmail.textContent = email;
  form.hidden = true;
  success.hidden = false;
}

emailInput.addEventListener("input", () => {
  if (form.classList.contains("is-error")) clearError();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (form.classList.contains("is-loading")) return;

  const email = emailInput.value.trim();

  // Bots fill the hidden honeypot field; quietly pretend it worked.
  if (form.elements._honey.value) {
    showSuccess(email);
    return;
  }

  if (!email || !emailInput.checkValidity()) {
    setError("Please enter a valid email address.");
    emailInput.focus();
    return;
  }

  clearError();
  form.classList.add("is-loading");
  form.querySelector("button").disabled = true;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        _subject: "New InOS waitlist signup",
        _template: "table",
        _captcha: "false",
        signed_up_at: new Date().toISOString(),
        page: window.location.href,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== "true") {
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    showSuccess(email);
  } catch (err) {
    console.error("Waitlist signup failed:", err);
    setError(
      `Something went wrong. Please try again, or email ` +
        `<a href="mailto:${CONTACT_EMAIL}?subject=InOS%20waitlist">${CONTACT_EMAIL}</a>.`
    );
  } finally {
    form.classList.remove("is-loading");
    form.querySelector("button").disabled = false;
  }
});
