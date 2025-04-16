// Add hover effect to buttons
const buttons = document.querySelectorAll("button");
buttons.forEach(btn => {
  btn.addEventListener("mouseover", () => btn.classList.add("shadow-lg"));
  btn.addEventListener("mouseout", () => btn.classList.remove("shadow-lg"));
});