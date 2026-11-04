export function enter(label, frames) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = document.createElement("div");
  el.className = "entry";
  el.textContent = label;
  const skip = document.createElement("button");
  skip.textContent = "Skip";
  skip.onclick = () => el.remove();
  el.append(skip);
  document.body.append(el);
  el.animate(frames, {
    duration: 1050,
    easing: "cubic-bezier(.65,0,.24,1)",
    fill: "forwards",
  }).onfinish = () => el.remove();
}
