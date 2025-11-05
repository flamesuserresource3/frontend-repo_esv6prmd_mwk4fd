import React from 'react';

export default function InfoPanel() {
  return (
    <div className="rounded-xl border border-slate-200/30 bg-white/60 p-4 text-sm leading-relaxed text-slate-700 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
      <h3 className="mb-1 text-base font-semibold">What you are seeing</h3>
      <ul className="list-inside list-disc space-y-1">
        <li>
          Hard margin aims to separate perfectly with the widest gap. Increase C to penalize
          misclassifications heavily.
        </li>
        <li>
          Soft margin allows some violations for better generalization. Lower C to permit margin
          slack.
        </li>
        <li>
          Linear kernel draws a straight separating line with margins at +1 and -1.
        </li>
        <li>
          RBF kernel bends the boundary using Random Fourier Features to approximate the
          non-linear mapping. Tune Gamma to control boundary complexity.
        </li>
      </ul>
    </div>
  );
}
