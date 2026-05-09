const categories = [
  { max: 18.5, label: "Underweight", cls: "cat-low",  color: "#378ADD", msg: "You're below a healthy weight range. Consider a nutrient-rich diet and talk to a doctor." },
  { max: 25,   label: "Normal",      cls: "cat-ok",   color: "#4ade80", msg: "You're at a healthy weight. Keep it up with balanced eating and regular activity." },
  { max: 30,   label: "Overweight",  cls: "cat-high", color: "#fbbf24", msg: "Slightly above the healthy range. Small changes like daily walks can make a real difference." },
  { max: Infinity, label: "Obese",   cls: "cat-over", color: "#f87171", msg: "This range carries health risks. A doctor can help you build a safe plan." }
];

function calculate() {
  const h = parseFloat(document.getElementById("height").value);
  const w = parseFloat(document.getElementById("weight").value);

  document.getElementById("height-err").textContent = "";
  document.getElementById("weight-err").textContent = "";

  let valid = true;

  if (!h || h < 50 || h > 300) {
    document.getElementById("height-err").textContent = "Enter a height between 50–300 cm";
    valid = false;
  }
  if (!w || w < 10 || w > 500) {
    document.getElementById("weight-err").textContent = "Enter a weight between 10–500 kg";
    valid = false;
  }
  if (!valid) return;

  const bmi = w / Math.pow(h / 100, 2);
  const cat = categories.find(c => bmi < c.max);

  // meter: map BMI 10–40 → 0–100%
  const pct = Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);

  // healthy weight range for this height
  const hm = h / 100;
  const minW = (18.5 * hm * hm).toFixed(1);
  const maxW = (24.9 * hm * hm).toFixed(1);

  document.getElementById("bmi-value").textContent = bmi.toFixed(1);

  const catEl = document.getElementById("category");
  catEl.textContent = cat.label;
  catEl.className = "category " + cat.cls;

  document.getElementById("meter-fill").style.width = pct + "%";
  document.getElementById("meter-fill").style.background = cat.color;
  document.getElementById("meter-dot").style.left = pct + "%";

  document.getElementById("message").textContent = cat.msg;
  document.getElementById("suggestion").innerHTML =
    `Healthy weight for your height: <strong>${minW}–${maxW} kg</strong>`;

  document.getElementById("result").classList.remove("hidden");
}

function reset() {
  document.getElementById("height").value = "";
  document.getElementById("weight").value = "";
  document.getElementById("height-err").textContent = "";
  document.getElementById("weight-err").textContent = "";
  document.getElementById("result").classList.add("hidden");
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter") calculate();
});
