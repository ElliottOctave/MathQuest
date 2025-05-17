// shop.js
import { auth, db } from "/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const animalPics = [
  "bear.webp", "cooper.png", "dot.png", "fox.png", "lemur.webp",
  "monkey.png", "professor.png", "rabbit.webp", "timmy.webp", "zuri.png", "squirrel.webp"
];

const displayNames = animalPics.map(name => name.split(".")[0]);

let userData, userRef, uid;
let userCoins = 0;
let owned = [];
let currentIndex = 0;
let currentProfilePicture = "default_profile_pic.png";

async function initShop() {
  auth.onAuthStateChanged(async user => {
    if (!user) return alert("Please log in.");
    uid = user.uid;
    userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    userData = userSnap.data();
    userCoins = userData.coins || 0;
    owned = userData.profile_pictures || Array(animalPics.length).fill(0);
    currentProfilePicture = userData.current_profile_picture || "default_profile_pic.png";

    document.getElementById("coinCount").textContent = `🪙 ${userCoins} Coins`;
    renderCarousel();

    // ✅ Static button listeners
    document.getElementById("prevBtn").addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + animalPics.length) % animalPics.length;
      renderCarousel();
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % animalPics.length;
      renderCarousel();
    });

    document.getElementById("buyBtn").addEventListener("click", () => {
      buyPicture(currentIndex);
    });
  });
}

function renderCarousel() {
  const track = document.getElementById("pictureCarousel");
  const controls = document.getElementById("carousel-controls");
  const buyBtn = document.getElementById("buyBtn");

  track.innerHTML = "";

  animalPics.forEach((pic, i) => {
    const card = document.createElement("div");
    card.className = "picture-card" + (i === currentIndex ? " active" : "") + (owned[i] ? " owned" : "");

    const distance = Math.min(
      Math.abs(i - currentIndex),
      Math.abs(i - currentIndex + animalPics.length),
      Math.abs(i - currentIndex - animalPics.length)
    );
    const opacity = i === currentIndex ? 1 : Math.max(0.2, 1 - 0.2 * distance);
    card.style.opacity = opacity;

    const img = document.createElement("img");
    img.src = `/pages/assets/animals/${pic}`;
    img.alt = displayNames[i];
    img.className = "bounce";

    const title = document.createElement("div");
    title.textContent = displayNames[i].charAt(0).toUpperCase() + displayNames[i].slice(1);
    title.style.color = "deepskyblue";
    title.style.fontWeight = "bold";

    const status = document.createElement("div");
    status.className = "price-status d-flex align-items-center justify-content-center gap-2";
    const label = document.createElement("span");

    if (pic === currentProfilePicture) {
      label.innerHTML = `🧢 <span style="color:green; font-weight:bold">Equipped</span>`;
      if (i === currentIndex) {
        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.className = "carousel-btn ms-2";
        remove.onclick = removePicture;
        status.appendChild(label);
        status.appendChild(remove);
      } else {
        status.appendChild(label);
      }
    } else if (owned[i]) {
      label.innerHTML = `✅ <span style="color:#888">Owned</span>`;
      if (i === currentIndex) {
        const equip = document.createElement("button");
        equip.textContent = "Equip";
        equip.className = "carousel-btn ms-2";
        equip.onclick = () => equipPicture(currentIndex);
        status.appendChild(label);
        status.appendChild(equip);
      } else {
        status.appendChild(label);
      }
    } else {
      label.innerHTML = `20 🪙`;
      status.appendChild(label);
    }

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(status);
    track.appendChild(card);
  });

  const cardWidth = 400;
  const activeCardWidth = 500;
  const gap = 40;
  const offset = -currentIndex * (cardWidth + gap);
  const activeCardAdjustment = (activeCardWidth - cardWidth) / 2;
  const totalOffset = offset + activeCardAdjustment;

  track.style.transform = `translateX(calc(50% - ${activeCardWidth / 2}px + ${totalOffset}px))`;

  if (buyBtn) {
    buyBtn.style.display = owned[currentIndex] ? "none" : "inline-block";
  }
}

async function buyPicture(index) {
  if (owned[index]) return alert("Already owned.");
  if (userCoins < 20) return alert("Not enough coins!");

  userCoins -= 20;
  owned[index] = 1;

  await updateDoc(userRef, {
    coins: userCoins,
    profile_pictures: owned
  });

  document.getElementById("coinCount").textContent = `🪙 ${userCoins} Coins`;
  renderCarousel();
  alert("🎉 Picture unlocked!");
}

async function equipPicture(index) {
  if (!owned[index]) return alert("You don't own this picture!");
  const newPic = animalPics[index];

  await updateDoc(userRef, {
    current_profile_picture: newPic
  });

  currentProfilePicture = newPic;
  renderCarousel();
  updateNavbar(newPic);
}

function updateNavbar(profilePictureName) {
  const imgElement = document.querySelector("#userDropdown img");
  if (!imgElement) {
    console.warn("Navbar profile image not found.");
    return;
  }

  const isDefault = profilePictureName === "default_profile_pic.png";
  const profilePicturePath = isDefault
    ? `assets/${profilePictureName}`
    : `assets/animals/${profilePictureName}`;

  imgElement.src = profilePicturePath;
}


async function removePicture() {
  await updateDoc(userRef, {
    current_profile_picture: "default_profile_pic.png"
  });

  currentProfilePicture = "default_profile_pic.png";
  renderCarousel();
  alert("❌ Profile picture removed!");
}

initShop();
