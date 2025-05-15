// zoo.js
import { auth, db } from "/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  { name: 'dot', img: 'dot.png', price: 10, displayName: 'Detective Dog' }
];

let currentUserData = null;
const ownedAnimals = {};
const shopEl = document.getElementById('shop');
const zooEl = document.getElementById('zoo');
const zooGuide = document.getElementById('zoo-guide');

function resetZoo() {
  document.querySelectorAll('.zoo-animal').forEach(a => a.remove());
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  currentUserData = userSnap.data();
  const userAnimals = currentUserData.animals || [];
  const coins = currentUserData.coins || 0;

  const coinDisplay = document.getElementById("coinDisplay");
  if (coinDisplay) coinDisplay.textContent = `Coins: ${coins}`;

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

    if (userAnimals.includes(animal.name)) {
      img.classList.add("owned");
      btnBuy.disabled = true;
      btnBuy.className = 'btn btn-secondary btn-sm';
      btnBuy.innerText = "Owned";
      btnPlace.style.display = "inline-block";
      ownedAnimals[animal.name] = true;
    }

    btnBuy.onclick = async () => {
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const owned = userData.animals || [];
      const coins = userData.coins || 0;

      if (owned.includes(animal.name)) return;
      if (coins < animal.price) {
        alert("Not enough coins.");
        return;
      }

      const updatedCoins = coins - animal.price;
      const updatedAnimals = [...owned, animal.name];

      await updateDoc(userRef, {
        coins: updatedCoins,
        animals: updatedAnimals
      });

      const coinDisplay = document.getElementById("coinDisplay");
      if (coinDisplay) coinDisplay.textContent = `Coins: ${updatedCoins}`;

      btnBuy.innerText = "Owned";
      btnBuy.className = "btn btn-secondary btn-sm";
      btnBuy.disabled = true;
      btnPlace.style.display = "inline-block";
    };

    btnPlace.onclick = () => {
      if (document.getElementById(`zoo-${animal.name}`)) return;

      const zooAnimal = document.createElement("img");
      zooAnimal.src = `assets/animals/${animal.img}`;
      zooAnimal.className = 'zoo-animal';
      zooAnimal.id = `zoo-${animal.name}`;

      const zooWidth = zooEl.offsetWidth;
      const zooHeight = zooEl.offsetHeight;
      const animalSize = 80;
      const centerX = (zooWidth - animalSize) / 2;
      const bottomY = zooHeight - animalSize - 20;

      zooAnimal.style.left = `${centerX}px`;
      zooAnimal.style.top = `${bottomY}px`;
      zooAnimal.draggable = true;

      zooAnimal.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', animal.name);
        zooAnimal.dataset.dragging = true;
        zooAnimal.style.transform = 'scale(1.1) translateY(-4px)';
      });

      zooAnimal.addEventListener('dragend', (e) => {
        const zooRect = zooEl.getBoundingClientRect();
        const x = e.pageX - zooRect.left - 40;
        const y = e.pageY - zooRect.top - 40;
        const maxX = zooEl.offsetWidth - 80;
        const maxY = zooEl.offsetHeight - 80;

        const clampedX = Math.max(0, Math.min(x, maxX));
        const clampedY = Math.max(0, Math.min(y, maxY));

        zooAnimal.style.left = `${clampedX}px`;
        zooAnimal.style.top = `${clampedY}px`;
        zooAnimal.style.transform = 'scale(1)';
        zooAnimal.dataset.dragging = false;
      });

      zooEl.appendChild(zooAnimal);
    };
  });
});
