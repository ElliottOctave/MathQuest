// auth.js

import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc  } from "firebase/firestore";

// Handle Registration
export async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create user document with default level 1
    await setDoc(doc(db, 'users', uid), {
      username: username,
      email: email,
      level: 1,
      coins: 0,
      time_game1: [],
      retryFrequency_game1: [],
      difficulty_game1: 1,
      time_game2: [],
      retryFrequency_game2: [],
      difficulty_game2: 1,
      time_game3: [],
      retryFrequency_game3: [],
      difficulty_game3: 1,
      time_game4: [],
      retryFrequency_game4: [],
      difficulty_game4: 1,
      time_game5: [],
      retryFrequency_game5: [],
      difficulty_game5: 1,
      time_game6: [],
      retryFrequency_game6: [],
      difficulty_game6: 1,
      time_game7: [],
      retryFrequency_game7: [],
      difficulty_game7: 1,
      time_game8: [],
      retryFrequency_game8: [],
      difficulty_game8: 1,
      time_game9: [],
      retryFrequency_game9: [],
      difficulty_game9: 1,
      time_game10: [],
      retryFrequency_game10: [],
      difficulty_game10: 1,
      time_game11: [],
      retryFrequency_game11: [],
      difficulty_game11: 1,
      time_game12: [],
      retryFrequency_game12: [],
      difficulty_game12: 1,
      unlocked_features:[0],
      profile_pictures: [0,0,0,0,0,0,0,0,0,0,0,0],
      current_profile_picture: "default_profile_picture.png"
    });

    alert('Registration successful! You can now log in.');
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
  } catch (error) {
    console.error(error);
    alert('Registration failed: ' + error.message);
  }
}

// Handle Login
export async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc.data();

    console.log('User level:', userData.level);
    localStorage.setItem('userLevel', userData.level);
    localStorage.setItem('userUID', uid);

    alert('Login successful!');
    window.location.href = "/pages/home.html";
  } catch (error) {
    console.error(error);
    alert('Login failed: ' + error.message);
  }
}

// Handle updating user level
async function updateUserLevel(newLevel) {
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      level: newLevel
    });
  }

export function requireLogin() {
  
  onAuthStateChanged(auth, (user) => {
    document.body.classList.add("loaded");

    if (!user) {
      console.warn("🚫 Not logged in — redirecting to home...");
      window.location.href = "/pages/main.html";
    }
  });
}
  

// Attach event listeners once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('#registerModal form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  const loginForm = document.querySelector('#loginModal form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});