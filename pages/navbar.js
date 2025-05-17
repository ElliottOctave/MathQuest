import { auth, db } from '/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";

// Immediately execute after import
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
      const coins = userData.coins || 0;
      const username = userData.username || user.email;
      const profilePicture = userData.current_profile_picture || "default_profile_pic.png";

      // Bepaal juiste pad op basis van of het de default is of een dier
      const profilePicturePath = profilePicture === "default_profile_pic.png"
        ? `assets/${profilePicture}`
        : `assets/animals/${profilePicture}`;

    userNav.innerHTML = `
      <li class="nav-item d-flex align-items-center">
        <a href="/pages/learn.html" class="nav-link me-3">Learn</a>
        <a href="/pages/rewards.html" class="nav-link me-3">Rewards</a>
        <div class="dropdown">
          <a class="nav-link dropdown-toggle p-0 d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="${profilePicturePath}" alt="Profile" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 5px rgba(0,0,0,0.2);">
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown" style="min-width: 250px;">
            <li class="px-3 pt-2 text-center">Welcome <strong>${username}</strong>!</li>
            <li class="px-3 py-2 text-center">
              <div>Coins: <strong>${coins}</strong></div>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-center text-danger" href="#" id="logoutBtn">Logout</a></li>
          </ul>
        </div>
      </li>
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
