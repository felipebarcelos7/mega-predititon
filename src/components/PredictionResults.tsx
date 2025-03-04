'use client';

interface PredictionResultsProps {
  predictions: number[][];
}

export default function PredictionResults({ predictions }: PredictionResultsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Palpites Gerados</h2>
      <div className="space-y-6">
        {predictions.map((prediction, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Conjunto {index + 1}</h3>
            <div className="flex flex-wrap gap-3">
              {prediction.map((number, numIndex) => (
                <div
                  key={numIndex}
                  className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm transition-transform hover:scale-105"
                >
                  {number}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}