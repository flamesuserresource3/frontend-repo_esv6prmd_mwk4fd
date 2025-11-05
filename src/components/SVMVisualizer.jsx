import React, { useEffect, useMemo, useRef, useState } from 'react';

// Utility: pseudo-random generator to make regenerate deterministic per seed
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(prng) {
  // Box-Muller
  let u = 0, v = 0;
  while (u === 0) u = prng();
  while (v === 0) v = prng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Dataset generators
function makeBlobs({ n = 200, centers = [[-2, -2], [2, 2]], std = 0.5, seed = 42 }) {
  const prng = mulberry32(seed);
  const half = Math.floor(n / 2);
  const data = [];
  for (let i = 0; i < half; i++) {
    data.push({ x: [centers[0][0] + randn(prng) * std, centers[0][1] + randn(prng) * std], y: 1 });
  }
  for (let i = 0; i < n - half; i++) {
    data.push({ x: [centers[1][0] + randn(prng) * std, centers[1][1] + randn(prng) * std], y: -1 });
  }
  return data;
}

function makeMoons({ n = 200, noise = 0.2, seed = 123 }) {
  const prng = mulberry32(seed);
  const data = [];
  const half = Math.floor(n / 2);
  for (let i = 0; i < half; i++) {
    const t = Math.PI * (i / half);
    const x = Math.cos(t);
    const y = Math.sin(t);
    data.push({ x: [x + (prng() - 0.5) * noise, y + (prng() - 0.5) * noise], y: 1 });
  }
  for (let i = 0; i < n - half; i++) {
    const t = Math.PI * (i / half);
    const x = 1 - Math.cos(t);
    const y = 1 - Math.sin(t) - 0.5;
    data.push({ x: [x + (prng() - 0.5) * noise, y + (prng() - 0.5) * noise], y: -1 });
  }
  return data;
}

// Random Fourier Features for RBF kernel
function rffTransform(X, gamma, D, seed = 7) {
  const prng = mulberry32(seed);
  // w ~ N(0, 2*gamma I)
  const W = Array.from({ length: D }, () => [randn(prng) * Math.sqrt(2 * gamma), randn(prng) * Math.sqrt(2 * gamma)]);
  const b = Array.from({ length: D }, () => prng() * 2 * Math.PI);
  const Z = X.map((x) => {
    const z = new Array(D);
    for (let i = 0; i < D; i++) {
      const dot = W[i][0] * x[0] + W[i][1] * x[1] + b[i];
      z[i] = Math.sqrt(2 / D) * Math.cos(dot);
    }
    return z;
  });
  return { Z, W, b, scale: Math.sqrt(2 / D) };
}

// SGD for SVM (primal with hinge loss)
function trainLinearSVM({ X, y, C = 1, epochs = 50, lr = 0.1 }) {
  const d = X[0].length;
  let w = new Array(d).fill(0);
  let b = 0;
  const n = X.length;
  const prng = mulberry32(999);

  for (let ep = 0; ep < epochs; ep++) {
    for (let i = 0; i < n; i++) {
      // pick random sample
      const j = Math.floor(prng() * n);
      const xi = X[j];
      const yi = y[j];
      const margin = yi * (dot(w, xi) + b);
      // Weight decay part approximates L2 regularization
      for (let k = 0; k < d; k++) w[k] *= 1 - lr;
      if (margin < 1) {
        for (let k = 0; k < d; k++) w[k] += lr * C * yi * xi[k];
        b += lr * C * yi;
      }
    }
  }

  return { w, b };
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export default function SVMVisualizer({ dataset, params, seed }) {
  const canvasRef = useRef(null);
  const [supportIdxs, setSupportIdxs] = useState([]);

  const data = useMemo(() => {
    if (dataset === 'linear_hard') {
      return makeBlobs({ n: 220, centers: [[-2, -2], [2, 2]], std: 0.25, seed });
    } else if (dataset === 'linear_soft') {
      return makeBlobs({ n: 220, centers: [[-2, -1], [2, 1]], std: 1.0, seed });
    } else {
      return makeMoons({ n: 240, noise: 0.25, seed });
    }
  }, [dataset, seed]);

  // Prepare training matrices
  const X = useMemo(() => data.map((p) => p.x), [data]);
  const y = useMemo(() => data.map((p) => p.y), [data]);

  const model = useMemo(() => {
    if (params.kernel === 'linear') {
      const { w, b } = trainLinearSVM({ X, y, C: params.C, epochs: params.epochs, lr: 0.05 });
      return { predict: (x) => dot(w, x) + b, w, b, isLinear: true };
    }
    // RBF via RFF
    const { Z } = rffTransform(X, params.gamma, params.rff, 777);
    const { w, b } = trainLinearSVM({ X: Z, y, C: params.C, epochs: params.epochs, lr: 0.05 });
    return {
      predict: (x) => {
        const { Z: z } = rffTransform([x], params.gamma, params.rff, 777);
        return dot(w, z[0]) + b;
      },
      w,
      b,
      isLinear: false,
    };
  }, [X, y, params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Compute bounds from data with margins
    const xs = X.map((p) => p[0]);
    const ys = X.map((p) => p[1]);
    const minX = Math.min(...xs) - 1.5;
    const maxX = Math.max(...xs) + 1.5;
    const minY = Math.min(...ys) - 1.5;
    const maxY = Math.max(...ys) + 1.5;

    const toCanvas = (pt) => {
      const x = ((pt[0] - minX) / (maxX - minX)) * W;
      const y = H - ((pt[1] - minY) / (maxY - minY)) * H;
      return [x, y];
    };

    ctx.clearRect(0, 0, W, H);

    // Background decision field
    const img = ctx.createImageData(W, H);
    let p = 0;
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const x = minX + (i / W) * (maxX - minX);
        const yv = minY + ((H - j) / H) * (maxY - minY);
        const val = model.predict([x, yv]);
        const c1 = val >= 0 ? 80 : 20; // blue/pink balance
        const c2 = val < 0 ? 80 : 20;
        img.data[p++] = 30 + c2; // R
        img.data[p++] = 40; // G
        img.data[p++] = 120 + c1; // B
        img.data[p++] = 60; // A
      }
    }
    ctx.putImageData(img, 0, 0);

    // If linear, draw separating line and margins
    if (model.isLinear) {
      const w = model.w;
      const b = model.b;
      if (Math.hypot(w[0], w[1]) > 1e-6) {
        const drawLine = (offset) => {
          // w1*x + w2*y + b = offset
          const x1 = minX;
          const y1 = (-w[0] * x1 - b + offset) / w[1];
          const x2 = maxX;
          const y2 = (-w[0] * x2 - b + offset) / w[1];
          const p1 = toCanvas([x1, y1]);
          const p2 = toCanvas([x2, y2]);
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
        };

        // Decision boundary
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2;
        drawLine(0);
        ctx.stroke();
        // Margins at +/-1
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        drawLine(1);
        ctx.stroke();
        drawLine(-1);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw data points
    const sups = [];
    for (let i = 0; i < X.length; i++) {
      const pred = model.predict(X[i]);
      const margin = y[i] * pred;
      const [cx, cy] = toCanvas(X[i]);
      const isSup = margin <= 1.02; // approximate SVs
      if (isSup) sups.push(i);
      ctx.beginPath();
      ctx.arc(cx, cy, isSup ? 4 : 3, 0, Math.PI * 2);
      if (y[i] === 1) {
        ctx.fillStyle = isSup ? 'rgba(60,200,255,0.95)' : 'rgba(80,160,255,0.9)';
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      } else {
        ctx.fillStyle = isSup ? 'rgba(255,120,170,0.95)' : 'rgba(255,140,180,0.9)';
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      }
      ctx.fill();
      ctx.stroke();
    }
    setSupportIdxs(sups);
  }, [X, y, model]);

  return (
    <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-4">
      <div className="lg:col-span-3 rounded-2xl border border-slate-200/30 bg-white/80 p-2 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <canvas ref={canvasRef} width={900} height={540} className="h-[50vh] w-full rounded-xl" />
      </div>
      <div className="rounded-2xl border border-slate-200/30 bg-white/60 p-4 text-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Live Metrics</div>
        <ul className="space-y-1">
          <li>
            <span className="text-slate-600 dark:text-slate-200">Support vectors (approx): </span>
            <span className="font-semibold">{supportIdxs.length}</span>
          </li>
          <li>
            <span className="text-slate-600 dark:text-slate-200">Kernel: </span>
            <span className="font-semibold uppercase">{params.kernel}</span>
          </li>
          <li>
            <span className="text-slate-600 dark:text-slate-200">C: </span>
            <span className="font-semibold">{params.C.toFixed(2)}</span>
          </li>
          {params.kernel === 'rbf' && (
            <li>
              <span className="text-slate-600 dark:text-slate-200">Gamma: </span>
              <span className="font-semibold">{params.gamma.toFixed(2)}</span>
            </li>
          )}
          <li>
            <span className="text-slate-600 dark:text-slate-200">Epochs: </span>
            <span className="font-semibold">{params.epochs}</span>
          </li>
        </ul>
        <div className="mt-4 rounded-lg bg-black/80 p-3 text-xs text-white">
          Tip: Move C higher on the linear dataset to see a clear hard margin with wide gap. For the
          moons dataset, switch to RBF and tune Gamma to wrap tightly around the moons.
        </div>
      </div>
    </div>
  );
}
