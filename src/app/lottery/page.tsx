'use client';

import { useState } from 'react';
import LotteryGenerator from '../../components/LotteryGenerator';

export default function LotteryPage() {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);

  const handleNumbersGenerated = (numbers: number[]) => {
    setGeneratedNumbers(numbers);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-primary text-white p-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Gerador de Números da MegaSena
            </h1>
            <p className="mt-2 text-sm sm:text-base text-blue-100">
              Gere seus números da sorte para a MegaSena
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <LotteryGenerator onNumbersGenerated={handleNumbersGenerated} />
          </div>
        </div>
      </div>
    </main>
  );
}