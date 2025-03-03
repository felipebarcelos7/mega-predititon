'use client';

import { useState, useEffect } from 'react';
import { getLotteryResult } from '../services/lotteryApi';
import { saveMatrixState, loadMatrixState, clearMatrixState } from '../services/matrixStorage';

interface LotteryGeneratorProps {
  gameType: string;
  onPredictionsGenerated: (predictions: number[][], report: any) => void;
}

interface LotteryDraw {
  concurso: number;
  data: string;
  dezenas: string[];
  acumulado: boolean;
  valorAcumulado: number | undefined;
}

interface Movement {
  tipo: string;
  par: string;
  parReverso: string;
  peso: number;
  posicao: string;
}

export default function LotteryGenerator({ gameType, onPredictionsGenerated }: LotteryGeneratorProps) {
  // Matrix-based state
  const [matrix, setMatrix] = useState<string[]>(Array(16).fill(''));
  const [concatenatedValues, setConcatenatedValues] = useState<{ forward: string; reverse: string }[]>([]);
  
  // Random generator state
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [savedSets, setSavedSets] = useState<number[][]>([]);
  
  // Shared state
  const [currentDraw, setCurrentDraw] = useState<LotteryDraw | null>(null);
  const [previousDraw, setPreviousDraw] = useState<LotteryDraw | null>(null);
  const [filters, setFilters] = useState({
    primeNumbers: false,
    evenNumbers: false,
    oddNumbers: true,
    evenAndOddNumbers: false,
    largeSequence: false
  });

  const layout = [
    [true, false, false, true],  // x _ _ y
    [false, true, true, false],   // _ a b _
    [false, true, true, false],   // _ c d _
    [true, false, false, true]    // z _ _ w
  ];

  // Matrix input handlers
  const handleCellChange = (index: number, value: string) => {
    if (!layout[Math.floor(index / 4)][index % 4]) return;

    if (value === '') {
      const newMatrix = [...matrix];
      newMatrix[index] = '';
      setMatrix(newMatrix);
      updateConcatenatedValues(newMatrix);
      saveMatrixState({ matrix: newMatrix, filters, concatenatedValues });
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 9) return;

    const newMatrix = [...matrix];
    newMatrix[index] = String(numValue);
    setMatrix(newMatrix);
    updateConcatenatedValues(newMatrix);
    saveMatrixState({ matrix: newMatrix, filters, concatenatedValues });
  };

  // Random number generation
  const generateRandomNumbers = () => {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const randomNum = Math.floor(Math.random() * 60) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  const handleGenerate = () => {
    setGeneratedNumbers(generateRandomNumbers());
  };

  const handleSave = () => {
    if (generatedNumbers.length === 6) {
      setSavedSets([...savedSets, [...generatedNumbers]]);
    }
  };

  // Shared filter handler
  const handleFilterChange = (filterName: keyof typeof filters) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterName]: !prev[filterName]
      };
      saveMatrixState({ matrix, filters: newFilters, concatenatedValues });
      return newFilters;
    });
  };

  // Matrix processing
  const processMatrix = () => {
    const { movimentos, frequencia } = extractMovements();
    const paresComPeso = new Map<string, { count: number; peso: number }>();

    // Process movements and their weights
    movimentos.forEach(mov => {
      const pesoBase = mov.peso;
      const pesoPar = paresComPeso.get(mov.par) || { count: 0, peso: 0 };
      paresComPeso.set(mov.par, {
        count: pesoPar.count + 1,
        peso: pesoPar.peso + pesoBase
      });

      // Also process reverse pairs
      if (mov.par !== mov.parReverso) {
        const pesoParReverso = paresComPeso.get(mov.parReverso) || { count: 0, peso: 0 };
        paresComPeso.set(mov.parReverso, {
          count: pesoParReverso.count + 1,
          peso: pesoParReverso.peso + pesoBase
        });
      }
    });

    const predictions: number[][] = [];

    // Generate number sets based on weights and filters
    for (let i = 1; i <= 4; i++) {
      const numeros = Array.from(paresComPeso.entries())
        .sort((a, b) => b[1].peso - a[1].peso)
        .map(([par, { peso }]) => {
          const base = parseInt(par);
          return applyOffsets(base, peso + i);
        });

      let numerosUnicos = Array.from(new Set(numeros))
        .filter(n => n >= 1 && n <= 60);

      // Apply filters
      if (filters.primeNumbers) {
        numerosUnicos = numerosUnicos.filter(n => isPrime(n));
      }
      if (filters.evenNumbers) {
        numerosUnicos = numerosUnicos.filter(n => n % 2 === 0);
      }
      if (filters.oddNumbers) {
        numerosUnicos = numerosUnicos.filter(n => n % 2 !== 0);
      }
      if (filters.largeSequence) {
        numerosUnicos = numerosUnicos.filter((n, idx, arr) => {
          if (idx === 0) return true;
          return Math.abs(n - arr[idx - 1]) > 5;
        });
      }

      const selectedNumbers = numerosUnicos.slice(0, 6).sort((a, b) => a - b);
      if (selectedNumbers.length === 6) {
        predictions.push(selectedNumbers);
      }
    }

    const report = generateReport(movimentos, paresComPeso, frequencia);
    onPredictionsGenerated(predictions, report);
  };

  const applyOffsets = (numero: number, variacao = 0) => {
    const primos = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];
    const primoIndex = numero % primos.length;
    return Math.floor((numero * primos[primoIndex] + (13 + variacao)) % 60) + 1;
  };

  const generateReport = (
    movimentos: Movement[],
    pares: Map<string, { count: number; peso: number }>,
    frequencia: Map<string, number>
  ) => {
    return {
      frequencias: Array.from(frequencia.entries()).map(([num, freq]) => ({
        numero: num,
        frequencia: freq
      })),
      pares: Array.from(pares.entries()).map(([par, { count, peso }]) => ({
        par,
        ocorrencias: count,
        peso
      })),
      movimentos: movimentos.map(mov => ({
        tipo: mov.tipo,
        par: mov.par,
        parReverso: mov.parReverso,
        posicao: mov.posicao,
        peso: mov.peso
      }))
    };
  };

  const isPrime = (num: number): boolean => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    let i = 5;
    while (i * i <= num) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
      i += 6;
    }
    return true;
  };

  const extractMovements = () => {
    const movimentos: Movement[] = [];
    const frequencia = new Map<string, number>();

    // Helper function to add movement
    const addMovimento = (tipo: string, par: string, parReverso: string, peso: number, posicao: string) => {
      movimentos.push({ tipo, par, parReverso, peso, posicao });
      
      // Update frequency
      const digito1 = par[0];
      const digito2 = par[1];
      frequencia.set(digito1, (frequencia.get(digito1) || 0) + 1);
      frequencia.set(digito2, (frequencia.get(digito2) || 0) + 1);
    };

    // Process concatenated values
    concatenatedValues.forEach((value, index) => {
      const forward = value.forward;
      const reverse = value.reverse;
      
      if (forward.length === 2) {
        addMovimento('concatenacao', forward, reverse, 3, `pos_${index}`);
      }
    });

    return { movimentos, frequencia };
  };

  const updateConcatenatedValues = (newMatrix: string[]) => {
    const validPositions = layout.flat().map((isVisible, i) => isVisible ? i : -1).filter(i => i !== -1);
    const newConcatenatedValues = [];

    // Helper function to add concatenation if both positions are filled
    const addConcatenation = (pos1: number, pos2: number) => {
      if (newMatrix[pos1] && newMatrix[pos2]) {
        newConcatenatedValues.push({
          forward: `${newMatrix[pos1]}${newMatrix[pos2]}`,
          reverse: `${newMatrix[pos2]}${newMatrix[pos1]}`
        });
      }
    };

    // Horizontal combinations
    const horizontalPairs = [
      [0, 3],   // First row
      [4, 5], [5, 6],  // Second row
      [8, 9], [9, 10],  // Third row
      [12, 15]  // Fourth row
    ];

    // Vertical combinations
    const verticalPairs = [
      [0, 4], [4, 8], [8, 12],  // Left column
      [3, 6], [6, 10], [10, 15]  // Right column
    ];

    // Additional combinations (including special pairs)
    const additionalPairs = [
      [0, 1], [1, 4],  // Special pairs 01/10, 14/41
      [0, 2], [2, 3],  // Special pairs 02/20, 23/32
      [5, 7], [7, 6],  // Middle connections
      [8, 13], [13, 15],  // Bottom connections
      [9, 0], [0, 9],  // Special pair 90/09
      [1, 5], [5, 9],  // Cross connections
      [2, 6], [6, 10]  // Cross connections
    ];

    // Diagonal combinations
    const diagonalPairs = [
      [0, 5], [5, 10], [10, 15],  // Main diagonal
      [3, 5], [5, 8], [8, 12],    // Counter diagonal
      [4, 9], [9, 15],            // Additional diagonals
      [0, 6], [6, 12]             // Additional diagonals
    ];

    // Process all pairs
    [...horizontalPairs, ...verticalPairs, ...additionalPairs, ...diagonalPairs].forEach(([pos1, pos2]) => {
      if (validPositions.includes(pos1) && validPositions.includes(pos2)) {
        addConcatenation(pos1, pos2);
      }
    });

    // Remove duplicates while preserving order
    const uniquePairs = new Map();
    newConcatenatedValues.forEach(pair => {
      const key = `${pair.forward}-${pair.reverse}`;
      if (!uniquePairs.has(key)) {
        uniquePairs.set(key, pair);
      }
    });

    setConcatenatedValues(Array.from(uniquePairs.values()));
  };

  // Format number helper
  const formatNumber = (num: number) => {
    return num === 0 ? '?' : num.toString().padStart(2, '0');
  };

  // Load saved state and fetch lottery data
  useEffect(() => {
    const savedState = loadMatrixState();
    if (savedState) {
      setMatrix(savedState.matrix);
      setFilters(savedState.filters);
      setConcatenatedValues(savedState.concatenatedValues);
    }

    const fetchLotteryData = async () => {
      try {
        const latest = await getLotteryResult(undefined, gameType);
        setCurrentDraw({
          concurso: latest.numero,
          data: latest.dataApuracao,
          dezenas: latest.listaDezenas,
          acumulado: latest.acumulado,
          valorAcumulado: latest.valorAcumuladoProximoConcurso
        });

        if (latest.numero > 1) {
          const previous = await getLotteryResult(latest.numero - 1, gameType);
          setPreviousDraw({
            concurso: previous.numero,
            data: previous.dataApuracao,
            dezenas: previous.listaDezenas,
            acumulado: previous.acumulado,
            valorAcumulado: previous.valorAcumuladoProximoConcurso
          });
        }
      } catch (error) {
        console.error('Error fetching lottery data:', error);
      }
    };

    fetchLotteryData();
  }, [gameType]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Matrix Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Matriz de Previsão</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {matrix.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  onChange={(e) => handleCellChange(index, e.target.value)}
                  className={`w-12 h-12 text-center text-lg font-bold rounded-lg border-2 ${layout[Math.floor(index / 4)][index % 4] ? 'bg-white border-emerald-500' : 'bg-gray-100 border-gray-200'}`}
                  disabled={!layout[Math.floor(index / 4)][index % 4]}
                />
              ))}
            </div>
            <button
              onClick={processMatrix}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Processar Matriz
            </button>
          </div>
        </div>

        {/* Random Generator Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Gerador Aleatório</h2>
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold"
                >
                  {generatedNumbers[index] ? formatNumber(generatedNumbers[index]) : '?'}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                className="flex-1 py-2 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Gerar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Filtros</h2>
            <div className="space-y-4">
              {Object.entries(filters).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleFilterChange(key as keyof typeof filters)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{key}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Sets Section */}
      {savedSets.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Conjuntos Salvos</h2>
          <div className="space-y-4">
            {savedSets.map((set, index) => (
              <div key={index} className="flex gap-2">
                {set.map((number, numIndex) => (
                  <div
                    key={numIndex}
                    className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold"
                  >
                    {formatNumber(number)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}