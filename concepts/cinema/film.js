import { enter } from "../entry.js";
const control = document.querySelector("input"),
  g = document.querySelector("#exposure"),
  lamps = document.querySelector("#lamps");
lamps.innerHTML = "<i></i>".repeat(6);
const paths = Array.from({ length: 105 }, (_, i) => {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", i % 4 === 0 ? "#ffd393" : "#ba5968");
  p.setAttribute("stroke-width", i % 4 === 0 ? "1.2" : ".7");
  g.append(p);
  return p;
});
function draw() {
  const t = control.value / 100;
  paths.forEach((p, i) => {
    const k = i / 105;
    let d = "";
    for (let x = -10; x <= 1210; x += 8) {
      const u = x / 1200;
      const y =
        300 +
        100 * k +
        Math.sin(u * 7 + k * 2 + t) * 90 +
        Math.cos(u * 11 - k * 4 + t * 4) * 72 +
        Math.sin(u * 4 + k * 3) * k * 150;
      d += (x === -10 ? "M" : "L") + x + " " + y.toFixed(1);
    }
    p.setAttribute("d", d);
  });
  document.querySelector("output").value = control.value.padStart(3, "0");
  [...lamps.children].forEach((el, i) =>
    el.classList.toggle("on", i < Math.round(t * 6)),
  );
}
control.oninput = draw;
draw();
enter("A / S", [
  { clipPath: "inset(0)" },
  { clipPath: "inset(0)", offset: 0.45 },
  { clipPath: "inset(49.99% 0)" },
]);
const advance = document.createElement("button");
advance.textContent = "Advance signal cue →";
document.querySelector("#lamps").after(advance);
advance.onclick = () => {
  control.value = String(
    Math.round((((Math.round((control.value / 100) * 6) + 1) % 7) / 6) * 100),
  );
  draw();
};
