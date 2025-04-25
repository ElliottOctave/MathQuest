// auth.js

import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc  } from "firebase/firestore";

// Handle Registration
export async function handleRegister(event) {
  event.preventDefault();

  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create user document with default level 1
    await setDoc(doc(db, 'users', uid), {
      email: email,
      level: 1
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
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();

    // Optional: redirect or refresh page
    location.reload();

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


  document.addEventListener('DOMContentLoaded', () => {
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const profileNav = document.getElementById('profileNav');  
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User is logged in:', user.uid);
        // User is logged in
        if (loginNav) loginNav.style.display = 'none';
        if (registerNav) registerNav.style.display = 'none';
        if (profileNav) profileNav.style.display = 'block';
      } else {
        // User is NOT logged in
        console.log('No user is logged in');
        if (loginNav) loginNav.style.display = 'block';
        if (registerNav) registerNav.style.display = 'block';
        if (profileNav) profileNav.style.display = 'none';
      }
    });
  });
  

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