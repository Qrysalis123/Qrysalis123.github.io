const WIDTH = 177, HEIGHT = 177;
const CHARSET = "@$#*!=;:~-,.";
const N = 1000;
const tVals = Array.from({ length: N }, (_, i) => i * 7 * Math.PI / N);
const basePoints = tVals.map(t => {
  const x = Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5));
  const z = -Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5));
  return { x, y: 0, z };
});

const lx = 1, ly = -1, lz = -1;
const lnorm = Math.sqrt(lx * lx + ly * ly + lz * lz);
const llx = lx / lnorm, lly = ly / lnorm, llz = lz / lnorm;

function rotateZ(x, y, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x * c - y * s, x * s + y * c];
}

function rotateX(x, y, z, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x, y * c - z * s, y * s + z * c];
}

function rotateY(x, y, z, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x * c + z * s, y, -x * s + z * c];
}

function rotateXYZ(x, y, z, angle) {
  let [x1, y1, z1] = rotateX(x, y, z, angle);
  let [x2, y2] = rotateZ(x1, y1, angle);
  return rotateY(x2, y2, z1, angle);
}

function makeButterfly(preId, delay) {
  const pre = document.getElementById(preId);
  let A = delay;
  
  function render() {
    A += 0.01;
    const flap = Math.sin(17 * A);
    
    const buffer = [];
    const zbuf = new Array(WIDTH * HEIGHT).fill(-Infinity);
    for(let k = 0; k < WIDTH * HEIGHT; k++) {
      buffer[k] = k % WIDTH == WIDTH - 1 ? "\n" : " ";
    }
    
    for (let pt of basePoints) {
      let { x, y, z } = pt;
      let nx, ny;
      if (x < 0) [nx, ny] = rotateZ(x, y, flap);
      else [nx, ny] = rotateZ(x, y, -flap);
      
      let x1 = nx + 1.7, y1 = ny, z1 = z;
      let [xr, yr, zr] = rotateXYZ(x1, y1, z1, A);
      
      const sx = Math.floor(((xr + 5) / 17) * WIDTH);
      const sy = Math.floor(((zr + 5) / 43) * HEIGHT);
      if (sx < 0 || sx >= WIDTH || sy < 0 || sy >= HEIGHT) continue;
      
      const idx = sy * WIDTH + sx;
      if (yr > zbuf[idx]) {
        zbuf[idx] = yr;
        
        let t2 = Math.atan2(z, x) + 0.01;
        let x2 = Math.sin(t2) * (Math.exp(Math.cos(t2)) - 2 * Math.cos(4 * t2) - Math.pow(Math.sin(t2 / 12), 5));
        let z2 = Math.cos(t2) * (Math.exp(Math.cos(t2)) - 2 * Math.cos(4 * t2) - Math.pow(Math.sin(t2 / 12), 5));
        let dx = x2 - x, dz = z2 - z;
        
        let nxw = dz, nyw = 0, nzw = -dx;
        let [nxr, nyr, nzr] = rotateXYZ(nxw, nyw, nzw, A);
        
        let norm = Math.sqrt(nxr * nxr + nyr * nyr + nzr * nzr);
        nxr /= norm; nyr /= norm; nzr /= norm;
        
        let lum = Math.max(0, nxr * llx + nyr * lly + nzr * llz);
        let lidx = Math.floor(lum * (CHARSET.length - 1));
        buffer[idx] = CHARSET[lidx];
      }
    }
    pre.innerHTML = buffer.join("");
    requestAnimationFrame(render);
  }
  render();
}

makeButterfly('butterfly1', 5.0);
makeButterfly('butterfly2', 0);
makeButterfly('butterfly3', 1.7);
  