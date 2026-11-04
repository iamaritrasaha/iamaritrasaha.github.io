import { enter } from "../entry.js";
const plates = [
  [
    "SeeDL",
    "A Python library for inspecting captured activations, signed weights and quantum states.",
    "seedl",
  ],
  [
    "Infera",
    "A CSV becomes a statistical profile, a held-out regression evaluation and a Markdown report.",
    "Infera",
  ],
  [
    "PulseShift",
    "ESP32 firmware translates synthetic RPM into six addressable LEDs. Motorcycle qualification is pending.",
    "PulseShift",
  ],
];
const sheet = document.querySelector("article");
function turn(i, motion) {
  const [name, copy, repo] = plates[i];
  sheet.dataset.sheet = i;
  sheet.querySelector("small").textContent = "PLATE 0" + (i + 1) + " / 03";
  sheet.querySelector("h2").textContent = name;
  sheet.querySelector("p").textContent = copy;
  sheet.querySelector("a").href = "https://github.com/iamaritrasaha/" + repo;
  document
    .querySelectorAll("[data-i]")
    .forEach((button, n) =>
      button.setAttribute("aria-pressed", String(n === i)),
    );
  if (motion && !matchMedia("(prefers-reduced-motion: reduce)").matches)
    sheet.animate(
      [
        {
          transform: "perspective(950px) rotateX(-24deg)",
          transformOrigin: "top",
          opacity: 0.5,
        },
        { transform: "none", opacity: 1 },
      ],
      { duration: 440, easing: "ease-out" },
    );
}
document
  .querySelectorAll("[data-i]")
  .forEach((b, i) => (b.onclick = () => turn(i, true)));
turn(0, false);
enter("01 / 03", [
  { transform: "translateX(0)" },
  { transform: "translateX(0)", offset: 0.4 },
  { transform: "translateX(-101%)" },
]);
