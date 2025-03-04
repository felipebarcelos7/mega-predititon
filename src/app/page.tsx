'use client';

import { useState } from 'react';
import MegaSenaGenerator from '../components/MegaSenaGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-primary text-white p-4 text-center">
            <h1 className="text-2xl font-bold">
              Matriz de Predição
            </h1>
            <p className="text-sm text-blue-50">
              Análise preditiva de loteria
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <MegaSenaGenerator />
          </div>
        </div>
      </div>
    </main>
  );
}
