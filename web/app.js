// Light interactivity: ripple feel on quick actions, no framework deps.
document.querySelectorAll(".qa-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }],
      { duration: 180, easing: "ease-out" }
    );
  });
});

document.querySelector(".fab")?.addEventListener("click", () => {
  // Placeholder: hook up to add-task flow later
  console.log("FAB: add new item");
});
