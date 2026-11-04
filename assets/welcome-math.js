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
      <span class="math-label">01 / CURRENT → POWER</span>
      <p class="math-line ohm" data-equation="ohm">V = IR</p>
      <div class="power-derivation">
        <p class="power-step" data-equation="power-start">P = VI</p>
        <p class="power-step" data-equation="power-substitution">P = (IR)I</p>
        <p class="power-step" data-equation="power-result">P = I<sup>2</sup>R</p>
      </div>
    </div>
    <div class="math-group math-current">
      <span class="math-label">02 / AT A JUNCTION</span>
      <p class="math-line" data-equation="kirchhoff">Σ I<sub>in</sub> = Σ I<sub>out</sub></p>
      <span class="math-caption">charge in = charge out</span>
    </div>
    <div class="math-group math-probability">
      <span class="math-label">03 / LOGITS → PROBABILITY</span>
      <p class="math-line linear" data-equation="linear">z = Wx + b</p>
      <p class="math-line softmax" data-equation="softmax"><span>p<sub>i</sub> = </span><span class="math-fraction"><span>exp(z<sub>i</sub>)</span><span>Σ<sub>j</sub> exp(z<sub>j</sub>)</span></span></p>
    </div>
    <div class="math-group math-gradient">
      <span class="math-label">04 / LOSS → GRADIENT</span>
      <p class="math-line loss" data-equation="loss">L = −log(p<sub>y</sub>)</p>
      <p class="math-line gradient" data-equation="gradient"><span class="math-fraction"><span>∂L</span><span>∂z<sub>i</sub></span></span><span> = p<sub>i</sub> − 1[i = y]</span></p>
    </div>
    <span class="manuscript-note">Illustrative relationships · no model training</span>`;
  veil.append(paper);
}
