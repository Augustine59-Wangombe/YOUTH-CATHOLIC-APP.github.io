// -----------------------
// SHOW FORM FUNCTION
// -----------------------
window.showform = function(formId) {
  document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
  const el = document.getElementById(formId);
  if (el) el.classList.add("active");
};

// -----------------------
// FIRESTORE SETUP
// -----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeKby7DVfy8070ZjgVRqN-dauNiK_CrQ",
  authDomain: "nyeri-catholic-youth-app.firebaseapp.com",
  projectId: "nyeri-catholic-youth-app",
  storageBucket: "nyeri-catholic-youth-app.appspot.com",
  messagingSenderId: "2807748399",
  appId: "1:2807748399:web:a33bb5ea33a2ad87bb3da",
  measurementId: "G-9HRL154BDP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -----------------------
// PAY & REGISTER USER
// -----------------------
document.getElementById("payBtn").addEventListener("click", async () => {
  const form = document.getElementById("registerForm");
  const phone = form.phone.value;
  const status = document.getElementById("paymentStatus");
  const amount = 100; // Membership fee

  if (!phone) { 
    status.textContent = "Please enter your phone number!"; 
    return; 
  }

  status.textContent = "Processing STK Push...";

  try {
    // Trigger STK Push via Cloudflare Worker
    const res = await fetch("https://<YOUR_WORKER_URL>", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount })
    });

    const data = await res.json();
    console.log("STK Push Response:", data);

    // For testing: assume payment is successful immediately
    status.textContent = "Payment successful! Saving registration...";

    // Check if email already exists in Firestore
    const email = form.Email.value.toLowerCase();
    const q = query(collection(db, "registrations"), where("Email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("This email is already registered. Please login.");
      showform("login-form");
      return;
    }

    // Collect registration data
    const registrationData = {
      name: form.name?.value || "",
      diocese: form.diocese?.value || "",
      denary: form.denary?.value || "",
      parish: form.parish?.value || "",
      local_church: form.local_church?.value || "",
      Education: form.Education?.value || "",
      Current_Status: form["Current-Status"]?.value || "",
      Baptised: form.Baptised?.value || "",
      Confirmed: form.Confirmed?.value || "",
      Gender: form.Gender?.value || "",
      Marital_Status: form["Marital-Status"]?.value || "",
      Different_abled: form["Different-abled"]?.value || "",
      role: form.role?.value || "",
      Age: form.Age?.value || "",
      position: form.position?.value || "",
      phone: phone,
      Email: email,
      password: form.password?.value || "",
      timestamp: new Date()
    };

    await addDoc(collection(db, "registrations"), registrationData);

    alert("✅ Registration and payment saved!");
    form.reset();
    window.location.href = "Youths dashboard.html";

  } catch (err) {
    console.error(err);
    status.textContent = "Failed to process payment/registration.";
  }
});

// -----------------------
// LOGIN USER
// -----------------------
window.loginUser = async function() {
  const email = document.getElementById("loginEmail").value.toLowerCase();
  const password = document.getElementById("loginPassword").value;

  try {
    const q = query(collection(db, "registrations"), where("Email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("This account does not exist. Please register.");
      showform("register-form");
      return;
    }

    const userDoc = querySnapshot.docs[0].data();
    if (userDoc.password !== password) {
      alert("Wrong password. Try again.");
      return;
    }

    localStorage.setItem("loggedInUser", email);
    window.location.href = "Youths dashboard.html";

  } catch (err) {
    console.error(err);
    alert("Error logging in. Check console.");
  }
};

// -----------------------
// LOGOUT USER
// -----------------------
window.logoutUser = function() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
};

// -----------------------
// DENARY → PARISH & LEADERSHIP LOGIC
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

  // Leadership logic
  const roleSelect = document.getElementById('role');
  const leadershipSection = document.getElementById('leadershipSection');
  const positionSection = document.getElementById('positionSection');
  const levelSelect = document.getElementById('level');
  const positionSelect = document.getElementById('position');

  const parishPositions = ["Parish Coordinator","Parish vice coordinator","Parish Secretary","Parish vice secretary","Parish Treasurer","Parish litergist","Parish vice litergist","Parish organing secretary","Parish games captain","Parish Disciplinarian"];
  const localPositions = ["Local Coordinator","Local vice coordinator","Local Secretary","Local vice secretary","Local litergist","Local vice litergist","Local organing secretary","Local games captain","Local Disciplinarian"];

  if (roleSelect) {
    roleSelect.addEventListener('change', function() {
      if (this.value === 'leader') {
        leadershipSection.style.display = 'block';
      } else {
        leadershipSection.style.display = 'none';
        positionSection.style.display = 'none';
      }
    });
  }

  if (levelSelect) {
    levelSelect.addEventListener('change', function() {
      positionSelect.innerHTML = '<option value="">-- Choose Position --</option>';

      if (this.value === 'parish') {
        parishPositions.forEach(pos => {
          const option = document.createElement('option');
          option.value = pos;
          option.textContent = pos;
          positionSelect.appendChild(option);
        });
        positionSection.style.display = 'block';
      } else if (this.value === 'local') {
        localPositions.forEach(pos => {
          const option = document.createElement('option');
          option.value = pos;
          option.textContent = pos;
          positionSelect.appendChild(option);
        });
        positionSection.style.display = 'block';
      } else {
        positionSection.style.display = 'none';
      }
    });
  }
});

