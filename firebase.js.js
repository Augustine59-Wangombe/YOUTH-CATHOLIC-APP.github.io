import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) {
    console.error("❌ registerForm not found in DOM!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try { const getVal = (id) => form.querySelector(`#${id}`)?.value || "";
      const data = {
        name: form.name?.value || "",
        diocese: form.diocese?.value || "",
        denary: form.denary?.value || "",
        parish: form.parish?.value || "",
        local_church: form.local_church?.value || "",
        Education: form.Education?.value || "",
        Current_Status: form["Current-Status"]?.value ||"",
        Baptised: form.Baptised?.value || "",
        Confirmed: form.Confirmed?. value || "",
        Gender: form.Gender?.value || "",
        Marital_Status: form["Marital-Status"]?.value || "",
        Different_abled: form["Different-abled"]?.value || "",
        role: form.role?.value || "",
        Age: form.Age?.value || "",
        position: form.position?.value || "",
        phone: form.phone?.value || "",
        Email: form.Email?. value|| "",
        password: form.password?.value || "",
        timestamp: new Date()
      };

      await addDoc(collection(db, "registrations"), data);
      alert("✅ Registration saved successfully!");
      window.location.href="Youths dashboard.html";   
      form.reset();
    } catch (error) {
      console.error("❌ Error saving registration:", error);
      alert("Error saving registration. Check console for details.");
    }
  });
});















