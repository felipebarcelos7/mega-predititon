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
  const [drawInfo, setDrawInfo] = useState<LotteryDraw | null>(null);

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
      setDrawInfo(result);
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
    <div className="space-y-8">
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">Resultado Oficial - {gameType.toUpperCase()}</h3>
        
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 justify-center mb-4">
            <input
              type="number"
              value={contestNumber}
              onChange={(e) => setContestNumber(e.target.value)}
              placeholder="Número do concurso"
              className="w-40 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 hover:border-green-300"
            />
            <button
              onClick={fetchLotteryResult}
              disabled={loading}
              className="h-12 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Buscar Resultado'}
            </button>
          </div>

          {drawInfo && (
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2">
                  <p className="text-emerald-600 font-semibold">Concurso:</p>
                  <p className="text-lg font-bold text-emerald-800">{drawInfo.numero}</p>
                </div>
                <div className="p-2">
                  <p className="text-emerald-600 font-semibold">Apuração:</p>
                  <p className="text-lg font-bold text-emerald-800">{new Date(drawInfo.dataApuracao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="p-2">
                  <p className="text-emerald-600 font-semibold">Resultado:</p>
                  <p className="text-lg font-bold text-emerald-800">{drawInfo.acumulado ? 'ACUMULADO' : 'PREMIADO'}</p>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center">
              {officialNumbers.map((num, index) => (
                <input
                  key={index}
                  type="number"
                  min={config.minValue}
                  max={config.maxValue}
                  value={num || ''}
                  onChange={(e) => handleNumberChange(index, e.target.value)}
                  className={`w-16 h-16 text-center text-xl font-bold ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'} border-2 rounded-full focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 hover:border-green-300 shadow-sm`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={verifyMatches}
            className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg mx-auto block"
          >
            Verificar Acertos
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <h4 className="text-xl font-bold mb-6 text-gray-800 text-center">Resultados da Verificação</h4>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {predictions.map((prediction, setIndex) => (
              <div key={setIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-200 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex flex-wrap gap-3 justify-center">
                  {prediction.map((number, numIndex) => (
                    <div
                      key={numIndex}
                      className={`w-12 h-12 rounded-full ${matches[setIndex][numIndex] ? 'bg-green-500 shadow-green-200' : 'bg-blue-500 shadow-blue-200'} text-white flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105`}
                    >
                      {number}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center font-semibold text-gray-700">
                  Acertos: <span className="text-green-600">{matches[setIndex].filter(Boolean).length}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
