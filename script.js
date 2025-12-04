// -----------------------
// SHOW FORM FUNCTION
// -----------------------
window.showform = function(formId) {
  document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
  const el = document.getElementById(formId);
  if (el) el.classList.add("active");
};

// -----------------------
// REGISTER USER (AFTER PAYMENT)
// -----------------------
async function registerUserAfterPayment() {
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value.toLowerCase();
  const password = document.getElementById("password").value;
  const denary = document.getElementById("denary").value;
  const parish = document.getElementById("parish").value;
  const role = document.getElementById("role").value;
  const level = document.getElementById("level").value;
  const position = document.getElementById("position").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[email]) {
    alert("This email is already registered. Please login instead.");
    showform("login-form");
    return;
  }

  // Save user after payment success
  users[email] = {
    fullName,
    email,
    password,
    denary,
    parish,
    role,
    level,
    position,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful! Please login.");
  showform("login-form");
}

// -----------------------
// LOGIN USER
// -----------------------
window.loginUser = function() {
  const email = document.getElementById("loginEmail").value.toLowerCase();
  const password = document.getElementById("loginPassword").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[email]) {
    alert("This account does not exist. Please register.");
    showform("register-form");
    return;
  }

  if (users[email].password !== password) {
    alert("Wrong password. Try again.");
    return;
  }

  localStorage.setItem("loggedInUser", email);
  window.location.href = "Youths dashboard.html";
};

// -----------------------
// LOGOUT USER
// -----------------------
window.logoutUser = function() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
};

// -----------------------
// DENARY → PARISH LOGIC
// -----------------------
document.addEventListener('DOMContentLoaded', function() {
  const parishData = {
    nyeri: ["Our Lady of Consolata Cathedral","St. Jude Parish","King'ong'o Parish","Mwenji Parish","Kiamuiru Parish","Mathari Institutions Chaplaincy","St. Charles Lwanga Parish"],
    othaya: ["Othaya Parish","Kariko Parish","Birithia Parish","Karima Parish","Kagicha Parish","Karuthi Parish","Kigumo Parish"],
    karatina: ["Karatina Parish","Miiri Parish","Giakaibei Parish","Gikumbo Parish","Gathugu Parish","Ngandu Parish","Kabiru-ini Parish","Kahira-ini Parish"],
    mukurweini: ["Mukurwe-ini Parish","Kaheti Parish","Kimondo Parish","Gikondi Parish"],
    mweiga: ["Mweiga Parish","Endarasha Parish","Gatarakwa Parish","Karemeno Parish","Mugunda Parish","Sirima Parish","Winyumiririe Parish","Kamariki Parish"],
    tetu: ["Tetu Parish","Wamagana Parish","Kigogo-ini Parish","Itheguri Parish","Gititu Parish","Kagaita Parish","Giakanja Parish","Karangia Parish"],
    naromoru: ["Narumoru Town Parish","Irigithathi Parish","Thegu Parish","Kiganjo Parish","Munyu Parish"],
    nanyuki: ["Nanyuki Parish","Dol Dol Parish","Matanya Parish","St. Teresa Parish","Kalalu Parish"]
  };

  const denarySelect = document.getElementById("denary");
  const parishSelect = document.getElementById("parish");

  if (denarySelect && parishSelect) {
    denarySelect.addEventListener("change", function() {
      const selectedDenary = this.value;
      parishSelect.innerHTML = "";
      if (selectedDenary && parishData[selectedDenary]) {
        const defaultOption = document.createElement("option");
        defaultOption.text = "-- Choose Parish --";
        parishSelect.add(defaultOption);
        parishData[selectedDenary].forEach(parish => {
          const option = document.createElement("option");
          option.text = parish;
          option.value = parish.toLowerCase().replace(/\s+/g, "_");
          parishSelect.add(option);
        });
      } else {
        parishSelect.innerHTML = "<option>-- Select Denary First --</option>";
      }
    });
  }

  // -----------------------
  // LEADERSHIP LOGIC
  // -----------------------
  const roleSelect = document.getElementById('role');
  const leadershipSection = document.getElementById('leadershipSection');
  const positionSection = document.getElementById('positionSection');
  const levelSelect = document.getElementById('level');
  const positionSelect = document.getElementById('position');

  const parishPositions = ["Parish Coordinator","Parish vice coordinator","Parish Secretary","Parish vice secretary","Parish Treasurer","Parish litergist","Parish vice litergist","Parish organing secretary","Parish games captain","Parish Disciplinarian"];
  const localPositions = ["Local Coordinator","Local vice coordinator","Local Secretary","Local vice secretary","Local litergist","Local vice litergist","Local organing secretary","Local games captain","Local Disciplinarian"];

  if (roleSelect) {
    roleSelect.addEventListener('change', function() {
      if (this.value === 'leader') leadershipSection.style.display = 'block';
      else { leadershipSection.style.display = 'none'; positionSection.style.display = 'none'; }
    });
  }

  if (levelSelect) {
    levelSelect.addEventListener('change', function() {
      positionSelect.innerHTML = '<option value="">-- Choose Position --</option>';
      if (this.value === 'parish') { parishPositions.forEach(pos => { const option = document.createElement('option'); option.value = pos; option.textContent = pos; positionSelect.appendChild(option); }); positionSection.style.display = 'block'; }
      else if (this.value === 'local') { localPositions.forEach(pos => { const option = document.createElement('option'); option.value = pos; option.textContent = pos; positionSelect.appendChild(option); }); positionSection.style.display = 'block'; }
      else positionSection.style.display = 'none';
    });
  }
});

// ----------------------------
// M-PESA STK PUSH
// ----------------------------
async function sendSTKPush() {
  const phoneInput = document.getElementById("phone");
  const phone = phoneInput.value.replace(/\s+/g, "");

  if (!phone.startsWith("254") || phone.length !== 12) {
    alert("Enter valid phone number in format 2547XXXXXXXX");
    return;
  }

  try {
    const res = await fetch("https://catholic100system.wangombeaugustine58.workers.dev/stkpush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone, amount: 100 })
    });

    const data = await res.json();
    console.log("STK Response:", data);
    alert("If the number is valid, you will receive an STK prompt.");

    // ----------------------------
    // POLL PAYMENT STATUS
    // ----------------------------
    pollPaymentStatus(phone);

  } catch (err) {
    console.error(err);
    alert("STK request failed. Check console.");
  }
}

// ----------------------------
// POLL PAYMENT STATUS
// ----------------------------
async function pollPaymentStatus(phone) {
  const statusEl = document.getElementById("paymentStatus");
  statusEl.textContent = "Waiting for payment confirmation...";

  const maxAttempts = 12; // e.g., 12 times = 1 minute
  const interval = 5000; // 5 seconds
  let attempts = 0;

  const timer = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(`https://catholic100system.wangombeaugustine58.workers.dev/check-payment?phone=${phone}`);
      const data = await res.json();
      if (data.paid) {
        clearInterval(timer);
        statusEl.textContent = "Payment received! Registering...";
        await registerUserAfterPayment();
      } else {
        statusEl.textContent = "Waiting for payment confirmation...";
      }

      if (attempts >= maxAttempts) {
        clearInterval(timer);
        statusEl.textContent = "Payment not detected. Please try again.";
      }
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error checking payment. Try again.";
      clearInterval(timer);
    }
  }, interval);
}

// ----------------------------
// ATTACH BUTTON EVENT
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.getElementById("payBtn");
  if (payBtn) {
    payBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sendSTKPush();
    });
  }
});
