'use client';

import { useState } from 'react';
import OfficialResults from '../components/OfficialResults';
import MatrixInput from '../components/MatrixInput';
import PredictionResults from '../components/PredictionResults';
import PatternReport from '../components/PatternReport';

export default function Home() {
  const [gameType, setGameType] = useState('mega-sena');
  const [predictions, setPredictions] = useState<number[][]>([]);
  const [report, setReport] = useState<any>(null);

  const handleGameTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGameType(event.target.value);
  };

  const handleReset = () => {
    setPredictions([]);
    setReport(null);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">MegaZinha do Fefe</h1>
          <div className="flex justify-center gap-4">
            <select
              value={gameType}
              onChange={handleGameTypeChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            >
              <option value="mega-sena">Mega-Sena</option>
              <option value="milionaria">Milionária</option>
              <option value="trevo">Trevo</option>
            </select>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              Recomeçar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <MatrixInput
              gameType={gameType}
              onPredictionsGenerated={(newPredictions, newReport) => {
                setPredictions(newPredictions);
                setReport(newReport);
              }}
              onReset={handleReset}
            />
            {predictions.length > 0 && (
              <PredictionResults predictions={predictions} />
            )}
          </div>
          
          <div className="space-y-8">
            {predictions.length > 0 && (
              <OfficialResults gameType={gameType} predictions={predictions} />
            )}
            {report && <PatternReport report={report} />}
          </div>
        </div>
      </div>
    </main>
  );
}
