
let userCoins = 10;  // Example of user's coins, you should replace it with real data

// Function to handle unlocking the VR Game
function unlockVRGame(event) {
  // Show confirmation popup no matter the coin amount
  document.getElementById('confirmationPopup').style.display = 'block';
}

// Confirm unlocking of VR Game and deduct 10 coins
function confirmUnlock() {
  if (userCoins >= 10) {
    userCoins -= 10;  // Deduct coins when confirmed
    const vrGameBtn = document.getElementById('vrGameBtn');
    vrGameBtn.classList.remove('locked');
    vrGameBtn.classList.add('unlocked', 'unlock-animation');
    vrGameBtn.innerHTML = '🎮 Play a VR Game';  // Change button text to unlocked
    vrGameBtn.removeAttribute('onclick');  // Remove onclick after unlocking
  } else {
    alert('You do not have enough coins to unlock the VR game!');
  }
  closePopup(); // Close the confirmation popup
}

// Close the confirmation popup
function closePopup() {
  document.getElementById('confirmationPopup').style.display = 'none';
}

// Check if user has enough coins on page load
window.onload = function () {
  const vrGameBtn = document.getElementById('vrGameBtn');
  if (userCoins >= 10) {
    // The button should be unlocked if user has enough coins
    vrGameBtn.classList.remove('locked');
    vrGameBtn.classList.add('unlocked');
    vrGameBtn.innerHTML = '🎮 Play a VR Game';
  } else {
    // Keep it locked if not enough coins
    vrGameBtn.classList.add('locked');
    vrGameBtn.innerHTML = '🔒 Play a VR Game';
  }
};
