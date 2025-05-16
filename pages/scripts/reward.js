// Firebase imports 
import { auth, db } from "/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// User variables 
let currentUser = null;
let userCoins = 0;
let featureUnlocked = false;

// Check user 
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      userCoins = userData.coins || 0;
      featureUnlocked = userData.unlocked_features?.[0] === 1;

      document.getElementById("coinCount").textContent = ` ${userCoins} Coins`;

      const vrLink = document.getElementById("vrLink");
      const lockOverlay = document.getElementById("vrLock");

      if (featureUnlocked) {
        vrLink.classList.add("unlocked");
        if (lockOverlay) lockOverlay.style.display = "none";
        vrLink.setAttribute("href", "/pages/VR-GAMES/vrmenu.html");
      }
    }
  }
});

// Show unlock popup 
window.unlockVRGame = async function (event) {
  event.preventDefault();
  if (!currentUser) return alert("Please log in.");
  if (featureUnlocked) {
    window.location.href = "/pages/VR-GAMES/vrmenu.html";
    return;
  }

  const popup = document.getElementById("confirmationPopup");
  const confirmBtn = popup.querySelector(".btn-success");

  if (userCoins < 50) {
    popup.querySelector("p").textContent = "You need 50 coins to unlock this game.";
    confirmBtn.style.display = "none";
  } else {
    popup.querySelector("p").textContent = "Spend 50 coins to unlock this game?";
    confirmBtn.style.display = "inline-block";
  }

  popup.style.display = "block";
};

// Unlock game 
window.confirmUnlock = async function () {
  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const newCoins = userData.coins - 50;
  const updatedFeatures = userData.unlocked_features || [];
  updatedFeatures[0] = 1;

  await updateDoc(userRef, {
    coins: newCoins,
    unlocked_features: updatedFeatures,
  });

  alert("🎉 Game Unlocked!");
  window.location.href = "/pages/VR-GAMES/vrmenu.html";
};

// Hide popup 
window.closePopup = function () {
  document.getElementById("confirmationPopup").style.display = "none";
};