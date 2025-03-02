/******************************************************
         * 1) Basic Canvas Setup
         ******************************************************/
const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener('resize', () => {
    resizeCanvas();
    drawFlowLines(time); // Redraw with current time
});

/******************************************************
 * 2) Basic Perlin Noise
 ******************************************************/
function generateRandomPermutation() {
    const arr = [];
    for (let i = 0; i < 256; i++) arr.push(i);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const permutation = generateRandomPermutation();
const p = new Array(512);
for (let i = 0; i < 512; i++) {
    p[i] = permutation[i % 256];
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}
function grad(hash, x, y) {
    const h = hash & 3;
    const u = (h < 2) ? x : y;
    const v = (h < 2) ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}
function perlin2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const topRight = p[p[X + 1] + Y + 1];
    const topLeft = p[p[X] + Y + 1];
    const bottomRight = p[p[X + 1] + Y];
    const bottomLeft = p[p[X] + Y];

    const u = fade(xf);
    const v = fade(yf);

    const n0 = grad(bottomLeft, xf, yf);
    const n1 = grad(bottomRight, xf - 1, yf);
    const ix0 = n0 + u * (n1 - n0);

    const n2 = grad(topLeft, xf, yf - 1);
    const n3 = grad(topRight, xf - 1, yf - 1);
    const ix1 = n2 + u * (n3 - n2);

    return ix0 + v * (ix1 - ix0); // ~[-1..1]
}

/******************************************************
 * 3) Draw Lines with Dark Gradient
 ******************************************************/
function drawFlowLines(time = 0) {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // ========== KEY PARAMETERS ========== 
    const SCALE = 0.003;   // Noise frequency
    const AMPLITUDE = 120;     // Wave height
    const LINE_SPACING = 20;      // Vertical gap between lines
    const WAVE_SPEED = 0.2;     // Speed factor for time
    // ===================================

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1) Create a vertical gradient from top to bottom
    //    Tweak colorStop(0) and colorStop(1) to match your reference
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    // Example colors: left=light, right=dark
    gradient.addColorStop(0, '#0e1526');

    gradient.addColorStop(0.5, '#555354');

    gradient.addColorStop(1, '#c4997e');

    // 2) Assign it once for all lines
    ctx.strokeStyle = gradient;

    // 3) Draw lines in horizontal bands
    for (let baseY = -AMPLITUDE; baseY < height + AMPLITUDE; baseY += LINE_SPACING) {
        ctx.beginPath();

        // Move to left edge
        const offset0 = AMPLITUDE * perlin2D(0 * SCALE, baseY * SCALE + time * WAVE_SPEED);
        ctx.moveTo(0, baseY + offset0);

        // Trace across the canvas
        for (let x = 1; x <= width; x++) {
            const n = perlin2D(x * SCALE, baseY * SCALE + time * WAVE_SPEED);
            const offset = AMPLITUDE * n;
            ctx.lineTo(x, baseY + offset);
        }
        ctx.stroke();
    }
}

/******************************************************
 * 4) Animation Loop
 ******************************************************/
let time = 0;
function animate() {
    time += 0.01;           // Increase time each frame
    drawFlowLines(time);    // Redraw lines with updated time
    requestAnimationFrame(animate);
}
animate();