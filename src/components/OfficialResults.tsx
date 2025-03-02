'use client';

import { useState, useEffect } from 'react';
import { getLotteryResult } from '../services/lotteryApi';

interface OfficialResultsProps {
  gameType: string;
  predictions: number[][];
}

interface LotteryDraw {
  numero: number;
  dataApuracao: string;
  listaDezenas: string[];
  acumulado: boolean;
  valorAcumuladoProximoConcurso: number;
  valorEstimadoProximoConcurso: number;
  listaRateioPremio: {
    descricaoFaixa: string;
    faixa: number;
    numeroDeGanhadores: number;
    valorPremio: number;
  }[];
  localSorteio: string;
  nomeMunicipioUFSorteio: string;
}

interface GameConfig {
  maxNumbers: number;
  minValue: number;
  maxValue: number;
}

const GAME_CONFIGS: Record<string, GameConfig> = {
  'mega-sena': { maxNumbers: 6, minValue: 1, maxValue: 60 },
  'milionaria': { maxNumbers: 6, minValue: 1, maxValue: 50 },
  'trevo': { maxNumbers: 2, minValue: 1, maxValue: 6 }
};

export default function OfficialResults({ gameType, predictions }: OfficialResultsProps) {
  const config = GAME_CONFIGS[gameType] || GAME_CONFIGS['mega-sena'];
  const [officialNumbers, setOfficialNumbers] = useState<number[]>(Array(config.maxNumbers).fill(0));
  const [matches, setMatches] = useState<boolean[][]>([]);
  const [error, setError] = useState<string>('');
  const [contestNumber, setContestNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setOfficialNumbers(Array(config.maxNumbers).fill(0));
    setMatches([]);
    setError('');
    setContestNumber('');
  }, [gameType]);

  const fetchLotteryResult = async () => {
    if (!contestNumber) {
      setError('Por favor, insira o número do concurso');
      return;
    }

    const parsedContestNumber = parseInt(contestNumber);
    if (isNaN(parsedContestNumber) || parsedContestNumber <= 0) {
      setError('Número do concurso inválido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await getLotteryResult(parsedContestNumber, gameType);
      const numbers = result.listaDezenas.map(num => parseInt(num));
      setOfficialNumbers(numbers);
    } catch (error) {
      setError('Erro ao buscar resultado do concurso. Tente novamente.');
      console.error('Error fetching lottery result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    const parsedValue = parseInt(value);
    setError('');
    
    if (value && (isNaN(parsedValue) || parsedValue < config.minValue || parsedValue > config.maxValue)) {
      setError(`Os números devem estar entre ${config.minValue} e ${config.maxValue}`);
      return;
    }

    const newNumbers = [...officialNumbers];
    if (parsedValue && newNumbers.includes(parsedValue)) {
      setError('Número já foi inserido');
      return;
    }

    newNumbers[index] = parsedValue || 0;
    setOfficialNumbers(newNumbers);
  };

  const verifyMatches = () => {
    if (officialNumbers.some(num => num === 0)) {
      setError('Por favor, insira todos os números oficiais!');
      return;
    }

    const uniqueNumbers = new Set(officialNumbers);
    if (uniqueNumbers.size !== officialNumbers.length) {
      setError('Todos os números devem ser únicos!');
      return;
    }

    const newMatches = predictions.map(prediction =>
      prediction.map(num => officialNumbers.includes(num))
    );
    setMatches(newMatches);
    setError('');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Resultado Oficial - {gameType.toUpperCase()}</h3>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 justify-center mb-4">
          <input
            type="number"
            value={contestNumber}
            onChange={(e) => setContestNumber(e.target.value)}
            placeholder="Número do concurso"
            className="w-40 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 hover:border-blue-300"
          />
          <button
            onClick={fetchLotteryResult}
            disabled={loading}
            className="h-12 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Buscando...' : 'Buscar Resultado'}
          </button>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {officialNumbers.map((num, index) => (
            <input
              key={index}
              type="number"
              min={config.minValue}
              max={config.maxValue}
              value={num || ''}
              onChange={(e) => handleNumberChange(index, e.target.value)}
              className={`w-16 h-16 text-center text-lg font-semibold ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'} border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 hover:border-blue-300`}
            />
          ))}
        </div>

        {error && (
          <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={verifyMatches}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
        >
          Verificar Acertos
        </button>

        {matches.length > 0 && (
          <div className="space-y-6 mt-6">
            {predictions.map((prediction, setIndex) => (
              <div key={setIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-200">
                <div className="flex flex-wrap gap-3">
                  {prediction.map((number, numIndex) => (
                    <div
                      key={numIndex}
                      className={`w-12 h-12 rounded-full ${matches[setIndex][numIndex] ? 'bg-green-500 shadow-green-200' : 'bg-blue-500 shadow-blue-200'} text-white flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105`}
                    >
                      {number}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Acertos: {matches[setIndex].filter(Boolean).length}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
