    import { auth, db } from "/firebase.js";
    import { doc, getDoc, updateDoc } from "firebase/firestore";

    const animalPics = [
      "bear.webp", "cooper.png", "dot.png", "fox.png", "lemur.webp", 
      "monkey.png", "professor.png", "rabbit.webp", "timmy.webp", "zuri.png"
    ];

    const displayNames = animalPics.map(name => name.split(".")[0]);

    let userData, userRef, uid;
    let userCoins = 0;
    let owned = [];
    let currentIndex = 0;

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

        document.getElementById("coinCount").textContent = `🪙 ${userCoins} Coins`;
        renderCarousel();

        // Add event listeners for navigation and buy buttons
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
      track.innerHTML = "";

      // Update Buy button text based on ownership
      const buyBtn = document.getElementById("buyBtn");
      buyBtn.textContent = owned[currentIndex] ? "✅ Owned" : "Buy for 20 🪙";
      buyBtn.disabled = owned[currentIndex];

      // Create cards for all pictures
      animalPics.forEach((pic, i) => {
        const card = document.createElement("div");
        card.className = "picture-card" + (i === currentIndex ? " active" : "") + (owned[i] ? " owned" : "");

        // Calculate distance from current index and set opacity
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

        const status = document.createElement("div");
        status.innerHTML = owned[i] ? "✅ Owned" : "20 🪙";
        status.className = "price-status";

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(status);

        track.appendChild(card);
      });

      // Adjust the transform to center the active card
      const cardWidth = 400;
      const activeCardWidth = 500;
      const gap = 40;
      const offset = -currentIndex * (cardWidth + gap);
      const activeCardAdjustment = (activeCardWidth - cardWidth) / 2;
      track.style.transform = `translateX(calc(50% - ${activeCardWidth / 2}px + ${offset}px + ${activeCardAdjustment}px))`;
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

    initShop();
