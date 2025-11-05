import React from 'react';

const DATASETS = [
  { id: 'linear_hard', label: 'Linear (Hard-Margin Friendly)' },
  { id: 'linear_soft', label: 'Linear (Soft-Margin Overlap)' },
  { id: 'moons', label: 'Non-Linear (Two Moons)' },
];

export default function DatasetSelector({ dataset, onChange, onRegenerate }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/30 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Dataset
        </label>
        <select
          value={dataset}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
        >
          {DATASETS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onRegenerate}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
      >
        Regenerate Data
      </button>
    </div>
  );
}
