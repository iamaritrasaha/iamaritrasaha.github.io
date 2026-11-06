// A manuscript around the existing pixel-grid handoff. Illustration, not training.
export function mountWelcomeMath(veil) {
  const paper = document.createElement("div");
  paper.className = "welcome-math";
  paper.setAttribute("aria-hidden", "true");
  paper.innerHTML = `
    <span class="manuscript-label">FIELD NOTES / 01</span>
    <svg class="notebook-traces" viewBox="0 0 1440 900" preserveAspectRatio="none">
      <g fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke">
        <path pathLength="1" d="M40 120H150L166 104H380 M40 120V300H140L150 290L160 310L170 290L180 310L190 300H260 M150 120V180 M140 180H160 M135 190H165 M150 190V240H350"/>
        <path pathLength="1" d="M1050 160H1380V330H1280 M1090 640H1380V780H1080 M60 620H330V760H440"/>
        <path pathLength="1" d="M280 740H315M315 740L340 715M315 740L340 765 M1080 200H1140L1190 250H1370"/>
        <circle cx="150" cy="120" r="4"/><circle cx="1380" cy="640" r="4"/>
      </g>
    </svg>
    <div class="math-group math-power">
      <span class="manuscript-topic">01 / CURRENT → POWER</span>
      <p class="math-line ohm" data-equation="ohm">V = IR</p>
      <div class="power-derivation">
        <p class="power-step" data-equation="power-start">P = VI</p>
        <p class="power-step" data-equation="power-substitution">P = (IR)I</p>
        <p class="power-step" data-equation="power-result">P = I<sup>2</sup>R</p>
      </div>
    </div>
    <div class="math-group math-current">
      <span class="manuscript-topic">02 / AT A JUNCTION</span>
      <p class="math-line" data-equation="kirchhoff">Σ I<sub>in</sub> = Σ I<sub>out</sub></p>
      <span class="manuscript-caption">charge in = charge out</span>
    </div>
    <div class="math-group math-probability">
      <span class="manuscript-topic">03 / LOGITS → PROBABILITY</span>
      <p class="math-line linear" data-equation="linear">z = Wx + b</p>
      <p class="math-line softmax" data-equation="softmax"><span>p<sub>i</sub> = </span><span class="math-fraction"><span>exp(z<sub>i</sub>)</span><span>Σ<sub>j</sub> exp(z<sub>j</sub>)</span></span></p>
    </div>
    <div class="math-group math-gradient">
      <span class="manuscript-topic">04 / LOSS → GRADIENT</span>
      <p class="math-line loss" data-equation="loss">L = −log(p<sub>y</sub>)</p>
      <p class="math-line gradient" data-equation="gradient"><span class="math-fraction"><span>∂L</span><span>∂z<sub>i</sub></span></span><span> = p<sub>i</sub> − 1[i = y]</span></p>
    </div>
    <div class="math-group math-calculus">
      <span class="manuscript-topic">05 / ACCUMULATION → CHANGE</span>
      <p class="math-line" data-equation="calculus">∫<sub>a</sub><sup>b</sup> f′(x) dx = f(b) − f(a)</p>
      <p class="math-line tangent" data-equation="tangent">f(x + h) = f(x) + hf′(x) + O(h<sup>2</sup>)</p>
      <span class="manuscript-caption">local expansion · smooth f, h → 0</span>
    </div>
    <div class="math-group math-curvature">
      <span class="manuscript-topic">06 / HOW A CURVE BENDS</span>
      <p class="math-line" data-equation="curvature"><span>κ(x) = </span><span class="math-fraction"><span>|f″(x)|</span><span>(1 + [f′(x)]<sup>2</sup>)<sup>3/2</sup></span></span></p>
      <span class="manuscript-caption">graph y = f(x)</span>
      <svg class="curve-doodle" viewBox="0 0 260 65" fill="none" stroke="currentColor" stroke-width="1.2"><path pathLength="1" d="M8 52Q60 60 94 30T172 24T252 10 M60 60L128 0"/><circle cx="94" cy="30" r="3"/><path d="M20 59H246M20 59V5" opacity=".35"/></svg>
    </div>
    <div class="math-group hardware-doodle">
      <span class="manuscript-topic">07 / ESP32 · CIRCUIT DOODLE</span>
      <svg viewBox="0 0 330 150" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <g transform="rotate(-5 95 75)">
          <path pathLength="1" d="M40 20Q92 16 149 21L151 123Q98 128 39 123Z M59 31H130V65H59Z M66 37V45H77V37H88V45H99V37H110V45H121 M66 78L126 79L125 111L65 110Z"/>
          <path pathLength="1" d="M30 39H42M30 53H42M30 67H42M30 81H42M30 95H42M30 109H42 M149 39H161M149 53H161M149 67H161M149 81H161M149 95H161M149 109H161"/>
          <text x="73" y="99">ESP32</text>
        </g>
        <path pathLength="1" d="M165 82Q191 81 193 51L216 51L222 44L230 58L238 44L246 58L252 51H276 M276 51Q293 58 285 84L273 98L261 84Z M273 98V116H306 M297 116H317M300 122H314M304 128H310 M202 89Q208 107 241 111 M235 104L242 111L232 115"/>
        <text x="182" y="33">R</text><text x="289" y="77">LED</text><text x="169" y="140">pins → wires → light</text>
      </svg>
    </div>
    `;
  veil.append(paper);
  const epoch = document.createElement("div");
  epoch.className = "epoch-meter";
  epoch.setAttribute("aria-hidden", "true");
  epoch.innerHTML = `<div class="epoch-label"><span>INTRO EPOCH</span><span class="epoch-count"><i>01 / 03</i><i>02 / 03</i><i>03 / 03</i></span></div><div class="epoch-track"><i></i></div>`;
  veil.insertBefore(epoch, veil.querySelector("#welcome-keyboard-help"));
}
