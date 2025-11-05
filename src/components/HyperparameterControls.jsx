import React from 'react';

export default function HyperparameterControls({ params, onChange }) {
  const set = (key, value) => onChange({ ...params, [key]: value });

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200/30 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Kernel
        </label>
        <select
          value={params.kernel}
          onChange={(e) => set('kernel', e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
        >
          <option value="linear">Linear</option>
          <option value="rbf">RBF (Gaussian)</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
          C (Soft vs Hard Margin)
        </label>
        <input
          type="range"
          min={0.1}
          max={100}
          step={0.1}
          value={params.C}
          onChange={(e) => set('C', parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{params.C.toFixed(2)}</div>
      </div>

      {params.kernel === 'rbf' && (
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Gamma (RBF)
          </label>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={params.gamma}
            onChange={(e) => set('gamma', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{params.gamma.toFixed(2)}</div>
        </div>
      )}

      {params.kernel === 'rbf' && (
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Random Fourier Features
          </label>
          <input
            type="range"
            min={50}
            max={800}
            step={10}
            value={params.rff}
            onChange={(e) => set('rff', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{params.rff} dims</div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Epochs
        </label>
        <input
          type="range"
          min={1}
          max={200}
          step={1}
          value={params.epochs}
          onChange={(e) => set('epochs', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{params.epochs}</div>
      </div>
    </div>
  );
}
