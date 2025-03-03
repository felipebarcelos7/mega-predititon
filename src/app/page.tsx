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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-primary text-white p-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              MegaZinha do Fefe
            </h1>
            <p className="mt-2 text-sm sm:text-base text-blue-100">
              Seu assistente de previsão de loteria
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
              <select
                value={gameType}
                onChange={handleGameTypeChange}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
              >
                <option value="mega-sena">Mega-Sena</option>
                <option value="milionaria">Milionária</option>
                <option value="trevo">Trevo</option>
              </select>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 font-medium"
              >
                Recomeçar
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Gerador de Matrizes
                  </h2>
                  <MatrixInput
                    gameType={gameType}
                    onPredictionsGenerated={(newPredictions, newReport) => {
                      setPredictions(newPredictions);
                      setReport(newReport);
                    }}
                    onReset={handleReset}
                  />
                </div>
                
                {predictions.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Previsões Geradas
                    </h2>
                    <PredictionResults predictions={predictions} />
                  </div>
                )}
              </div>
              
              <div className="space-y-8">
                {predictions.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Resultados Oficiais
                    </h2>
                    <OfficialResults gameType={gameType} predictions={predictions} />
                  </div>
                )}
                
                {report && (
                  <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Relatório de Padrões
                    </h2>
                    <PatternReport report={report} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
