import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroScene() {
  return (
    <section className="relative h-[55vh] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
      <Spline
        scene="https://prod.spline.design/wwTRdG1D9CkNs368/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          SVM Playground
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-white/85 sm:text-base">
          Explore Support Vector Machines interactively. Switch datasets, tune hyperparameters, and see
          how margins and decision boundaries change in real time.
        </p>
      </div>
    </section>
  );
}
