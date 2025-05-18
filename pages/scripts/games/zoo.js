// zoo.js
import { auth, db } from "/firebase.js";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const animals = [
  { name: 'bear', img: 'bear.webp', price: 10, displayName: 'Benny the Bear' },
  { name: 'fox', img: 'fox.png', price: 10, displayName: 'Foxy the Fox' },
  { name: 'zuri', img: 'zuri.png', price: 10, displayName: 'Zuri the Zebra' },
  { name: 'professor', img: 'professor.png', price: 10, displayName: 'Professor Puzzlo' },
  { name: 'rabbit', img: 'rabbit.webp', price: 10, displayName: 'Ruby the Rabbit' },
  { name: 'cooper', img: 'cooper.png', price: 10, displayName: 'Captain Cooper' },
  { name: 'lemur', img: 'lemur.webp', price: 10, displayName: 'Leo the Lemur' },
  { name: 'timmy', img: 'timmy.webp', price: 10, displayName: 'Timmy the Turtle' },
  { name: 'dot', img: 'dot.png', price: 10, displayName: 'Detective Dot' },
  { name: 'Suzie', img: 'squirrel.webp', price: 10, displayName: 'Suzie the Squirrel' },
  { name: 'bob', img: 'bob.png', price: 10, displayName: 'Bob the Beaver' },
  { name: 'milo', img: 'monkey.png', price: 10, displayName: 'Milo the Monkey' }
];

const shopEl = document.getElementById('shop');
const zooEl = document.getElementById('zoo');
const zooGuide = document.getElementById('zoo-guide');
const coinDisplay = document.getElementById('coinDisplay');
let currentUser = null;

// Clear zoo
function resetZoo() {
  document.querySelectorAll('.zoo-animal').forEach(a => a.remove());
}

// Add animal to zoo
function placeAnimal(animal, position) {
  const zooAnimal = document.createElement('img');
  zooAnimal.src = `assets/animals/${animal.img}`;
  zooAnimal.className = 'zoo-animal';
  zooAnimal.id = `zoo-${animal.name}`;
  zooAnimal.draggable = true;

  const zooWidth = zooEl.offsetWidth;
  const zooHeight = zooEl.offsetHeight;

  // Set position
  const left = position ? zooWidth * position.left : (zooWidth - 80) / 2;
  const top = position ? zooHeight * position.top : zooHeight - 100;

  zooAnimal.style.left = `${left}px`;
  zooAnimal.style.top = `${top}px`;

  // Start drag
  zooAnimal.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', animal.name);
    zooAnimal.dataset.dragging = true;
    zooAnimal.style.transform = 'scale(1.1) translateY(-4px)';
  });

  // End drag and save position
  zooAnimal.addEventListener('dragend', async (e) => {
    zooAnimal.style.transform = 'scale(1)';
    zooAnimal.dataset.dragging = false;

    const zooRect = zooEl.getBoundingClientRect();
    const x = e.pageX - zooRect.left - 40;
    const y = e.pageY - zooRect.top - 40;
    const maxX = zooEl.offsetWidth - 80;
    const maxY = zooEl.offsetHeight - 80;
    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(0, Math.min(y, maxY));

    zooAnimal.style.left = `${clampedX}px`;
    zooAnimal.style.top = `${clampedY}px`;

    // Save to Firestore
    const percentLeft = clampedX / zooEl.offsetWidth;
    const percentTop = clampedY / zooEl.offsetHeight;

    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const currentPositions = userData.zooPositions || {};

    currentPositions[animal.name] = { left: percentLeft, top: percentTop };

    await updateDoc(userRef, {
      zooPositions: currentPositions
    });
  });

  zooEl.appendChild(zooAnimal);
}

// Check user login
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  currentUser = user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const owned = userData.animals || [];
  const coins = userData.coins || 0;
  const zooPositions = userData.zooPositions || {};

  coinDisplay.textContent = `Coins: ${coins}`;

  // Build shop
  animals.forEach(animal => {
    const wrapper = document.createElement("div");
    wrapper.className = 'animal-card d-flex align-items-center justify-content-between';

    const infoCol = document.createElement("div");
    infoCol.className = 'd-flex align-items-center';

    const img = document.createElement("img");
    img.src = `assets/animals/${animal.img}`;
    img.alt = animal.name;
    img.width = 80;
    img.classList.add('animal-img', 'me-3');

    const label = document.createElement("div");
    label.textContent = animal.displayName;
    label.className = 'fw-bold';

    infoCol.appendChild(img);
    infoCol.appendChild(label);

    const btnBuy = document.createElement("button");
    btnBuy.className = 'btn btn-primary btn-sm';
    btnBuy.innerText = `Buy (${animal.price})`;

    const btnPlace = document.createElement("button");
    btnPlace.className = 'btn btn-success btn-sm';
    btnPlace.innerText = 'Place in Zoo';
    btnPlace.style.display = 'none';

    const btnContainer = document.createElement("div");
    btnContainer.className = 'btn-row';
    btnContainer.appendChild(btnBuy);
    btnContainer.appendChild(btnPlace);

    wrapper.appendChild(infoCol);
    wrapper.appendChild(btnContainer);
    shopEl.appendChild(wrapper);

    // Show owned animals
    if (owned.includes(animal.name)) {
      img.classList.add("owned");
      btnBuy.disabled = true;
      btnBuy.className = "btn btn-secondary btn-sm";
      btnBuy.innerText = "Owned";
      btnPlace.style.display = "inline-block";
    }

    // Place saved animals
    if (zooPositions[animal.name]) {
      placeAnimal(animal, zooPositions[animal.name]);
    }

    // Buy animal
    btnBuy.onclick = async () => {
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      const currentCoins = data.coins || 0;

      if (currentCoins < animal.price) return alert("Not enough coins!");
      if (data.animals?.includes(animal.name)) return;

      const updatedCoins = currentCoins - animal.price;
      const updatedAnimals = [...(data.animals || []), animal.name];

      await updateDoc(userRef, {
        coins: updatedCoins,
        animals: updatedAnimals
      });

      coinDisplay.textContent = `Coins: ${updatedCoins}`;
      btnBuy.innerText = "Owned";
      btnBuy.disabled = true;
      btnBuy.className = "btn btn-secondary btn-sm";
      btnPlace.style.display = "inline-block";
    };

    // Place animal
    btnPlace.onclick = () => {
      if (document.getElementById(`zoo-${animal.name}`)) return;
      placeAnimal(animal);
    };
  });
});


// Ensure this function is called after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.querySelector(".zoo-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      // Remove animals from UI
      document.querySelectorAll(".zoo-animal").forEach((a) => a.remove());

      // Clear in Firestore
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        zooPositions: {}
      });

      console.log("Zoo cleared successfully");
    });
  }
});
