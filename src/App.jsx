import React, { useMemo, useState } from 'react';
import HeroScene from './components/HeroScene';
import DatasetSelector from './components/DatasetSelector';
import HyperparameterControls from './components/HyperparameterControls';
import SVMVisualizer from './components/SVMVisualizer';
import InfoPanel from './components/InfoPanel';

function App() {
  const [dataset, setDataset] = useState('linear_hard');
  const [seed, setSeed] = useState(42);
  const [params, setParams] = useState({ kernel: 'linear', C: 10, gamma: 1.2, rff: 300, epochs: 80 });

  const pageStyle = useMemo(
    () => ({ backgroundImage: 'radial-gradient(circle at 10% 10%, #0b1020, #05070f 60%)' }),
    []
  );

  return (
    <div className="min-h-screen w-full text-slate-900 antialiased dark:text-white" style={pageStyle}>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <HeroScene />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-4">
            <DatasetSelector
              dataset={dataset}
              onChange={setDataset}
              onRegenerate={() => setSeed((s) => s + 1)}
            />
            <HyperparameterControls params={params} onChange={setParams} />
            <SVMVisualizer dataset={dataset} params={params} seed={seed} />
          </div>
          <div className="space-y-4">
            <InfoPanel />
            <div className="rounded-xl border border-slate-200/30 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-1 text-base font-semibold">How to explore</h3>
              <ol className="list-inside list-decimal space-y-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <li>Start with the Linear (Hard-Margin Friendly) dataset.</li>
                <li>Increase C to emphasize a hard margin; decrease for a softer margin.</li>
                <li>Switch to the overlapping linear set to observe soft-margin behavior.</li>
                <li>Try the Two Moons dataset and switch kernel to RBF. Tune Gamma.</li>
              </ol>
            </div>
          </div>
        </div>

        <footer className="pb-8 text-center text-xs text-white/60">
          Built for interactive learning — classification only.
        </footer>
      </div>
    </div>
  );
}

export default App;
