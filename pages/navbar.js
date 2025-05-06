// navbar.js

import { auth, db } from '/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";

// Immediately execute after import, no need for DOMContentLoaded
const userNav = document.getElementById('userNav');

if (userNav) {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      console.log("User is not logged in");
      userNav.innerHTML = `
      <li class="nav-item">
        <a href="#" class="nav-link" id="loginTrigger">Account</a>
      </li>
    `;

      // Hide Learn and Rewards
  learnNav?.classList.add("d-none");
  rewardsNav?.classList.add("d-none");

      document.getElementById("loginTrigger")?.addEventListener("click", (e) => {
        e.preventDefault();
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
      });

      document.getElementById("registerTrigger")?.addEventListener("click", (e) => {
        e.preventDefault();
        const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
        registerModal.show();
      });

    } else {
      console.log("User is logged in", user.username || user.email);
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      console.log("User data:", userData);
      const level = userData.level || 1;
      const xp = userData.experience || 0;
      const coins = userData.coins || 0;

      userNav.innerHTML = `
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          ${userData.username || user.email}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown" style="min-width: 250px;">
          <li class="px-3 py-2">
            <div class="fw-bold mb-1">Level ${level}</div>
            <div class="progress mb-2" style="height: 8px;">
              <div class="progress-bar" role="progressbar" style="width: ${xp}%" aria-valuenow="${xp}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div><strong>Coins:</strong> ${coins}</div>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-center" href="/pages/profile.html">Edit Profile</a></li>
          <li><a class="dropdown-item text-center text-danger" href="#" id="logoutBtn">Logout</a></li>
        </ul>
      `;

      document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          console.log("User logged out successfully");
          window.location.href = "/pages/home.html";
        } catch (error) {
          console.error("Sign-out failed:", error);
          alert("Logout failed. Please try again.");
        }
      });
    }

    // Attach switch modal events after userNav is injected
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
      e.preventDefault();
      bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
      new bootstrap.Modal(document.getElementById('registerModal')).show();
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
      e.preventDefault();
      bootstrap.Modal.getInstance(document.getElementById('registerModal'))?.hide();
      new bootstrap.Modal(document.getElementById('loginModal')).show();
    });
  });
} else {
  console.error("userNav not found!");
}
