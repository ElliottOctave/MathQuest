import { auth, db } from "/firebase.js";
import { doc, getDoc } from "firebase/firestore";

const gameConfig = {
  game1: { name: "Addition Adventure", link: "/pages/games/addition.html", section: "algebra" },
  game2: { name: "Subtraction Safari", link: "/pages/games/subtraction.html", section: "algebra" },
  game3: { name: "Equation Builder", link: "/pages/games/equation.html", section: "algebra" },
  game4: { name: "Count to 120", link: "games/counting.html", section: "number" },
  game5: { name: "Place Value Party", link: "games/placevalue.html", section: "number" },
  game6: { name: "Tens & Ones", link: "games/tensones.html", section: "number" },
  game7: { name: "Length Challenge", link: "games/lengthchallenge.html", section: "measurement" },
  game8: { name: "Tell the Time", link: "games/telltime.html", section: "measurement" },
  game9: { name: "Data Detective", link: "games/data_detective.html", section: "measurement" },
  game10: { name: "Shape Sorter", link: "#", section: "geometry" },
  game11: { name: "Build a Shape", link: "#", section: "geometry" },
  game12: { name: "Fractions & Pieces", link: "#", section: "geometry" },
};

const usedMessages = {
  green: new Set(),
  orange: new Set(),
  red: new Set(),
  notPlayed: new Set(),
  notEnough: new Set()
};

const feedbackText = {
  green: [
    "You're doing great at", "You're a superstar at", "Awesome job with",
    "You're amazing at", "That one looks easy for you!", "Keep it up with",
    "You're flying through", "You really get"
  ],
  orange: [
    "is going well, but a little more practice will help.",
    "can be confusing. But you're getting better.",
    "is improving! Keep playing to master it.",
    "needs a bit more attention, you're close!",
    "might need one more try.",
    "could use a quick refresh.",
    "is almost there!",
    "you're doing okay, but keep going."
  ],
  red: [
    "is still a bit tricky. Let's practice more.",
    "is tough, but don't give up.",
    "really needs some practice. You can do it!",
    "is challenging now, but you're learning.",
    "needs more attention, but you’re getting stronger.",
    "is hard right now, try again soon.",
    "takes a bit of effort, don’t stop!",
    "looks difficult, but you’ll get it!"
  ],
  notPlayed: [
    "This one is waiting for you to try it!",
    "Start this adventure whenever you're ready!",
    "You haven’t tried this game yet, give it a go!",
    "Let’s begin your journey with this one!",
    "Click and explore something brand new!",
    "This game is excited to meet you!",
    "Give this one a try and see what happens!",
    "A fun challenge is just one click away!"
  ],  
  notEnough: [
    "You've started this one, keep going!",
    "You're off to a great start, play it again soon!",
    "You've already played it, try a few more times!",
    "A few more games will help you improve here!",
    "You're getting the hang of it, let’s keep practicing!",
    "You're on your way, just a bit more to go!",
    "You’ve got momentum, let’s build on it!",
    "You’ve made progress, now let’s finish strong!"
  ]  
};

function getUniqueRandom(group) {
  const available = feedbackText[group].filter(msg => !usedMessages[group].has(msg));
  const choice = available[Math.floor(Math.random() * available.length)];
  usedMessages[group].add(choice);
  return choice;
}

function createTile({ gameId, avg, retryArr }) {
  const { name, link, section } = gameConfig[gameId];
  const wrapper = document.querySelector(`#${section}-tiles`);
  let tileClass = "gray-tile";
  let message;
  const tile = document.createElement("a");
  tile.href = link;

  if (retryArr.length >= 5) {
    if (avg <= 1) {
      tileClass = "green-tile";
      message = `${getUniqueRandom("green")} ${name}.`;
    } else if (avg <= 3) {
      tileClass = "orange-tile";
      message = `${name} ${getUniqueRandom("orange")}`;
    } else {
      tileClass = "red-tile";
      message = `${name} ${getUniqueRandom("red")}`;
    }
  } else {
    if (retryArr.length === 0) {
      message = getUniqueRandom("notPlayed");
    } else {
      message = getUniqueRandom("notEnough");
    }
  }

  tile.className = `game-tile ${tileClass}`;
  tile.innerHTML = `<strong>${name}</strong><div>${message}</div>`;
  wrapper.appendChild(tile);
}


async function generateDashboardTiles() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();

    for (let i = 1; i <= 12; i++) {
      const key = `retryFrequency_game${i}`;
      const retries = data[key] || [];
      const avg = retries.length > 0 ? retries.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, retries.length) : 0;
      createTile({ gameId: `game${i}`, avg, retryArr: retries });
    }
  });
}

document.addEventListener("DOMContentLoaded", generateDashboardTiles);
