'use client';

import { useState, useEffect } from 'react';
import { getLotteryResult } from '../services/lotteryApi';
import { saveMatrixState, loadMatrixState, clearMatrixState } from '../services/matrixStorage';

interface MatrixInputProps {
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

export default function MatrixInput({ gameType, onPredictionsGenerated }: MatrixInputProps) {
  const [matrix, setMatrix] = useState<string[]>(Array(16).fill(''));
  const [currentDraw, setCurrentDraw] = useState<LotteryDraw | null>(null);
  const [previousDraw, setPreviousDraw] = useState<LotteryDraw | null>(null);
  const [contestNumber, setContestNumber] = useState<string>('');
  const [filters, setFilters] = useState({
    primeNumbers: false,
    evenNumbers: false,
    oddNumbers: false,
    largeSequence: false
  });

  const layout = [
    [true, false, false, true],  // x _ _ y
    [false, true, true, false],   // _ a b _
    [false, true, true, false],   // _ c d _
    [true, false, false, true]    // z _ _ w
  ];

  const [concatenatedValues, setConcatenatedValues] = useState<{ forward: string; reverse: string }[]>([]);

  const handleCellChange = (index: number, value: string) => {
    // Only process input for visible cells based on layout
    if (!layout[Math.floor(index / 4)][index % 4]) {
      return;
    }

    // Allow empty value for clearing
    if (value === '') {
      const newMatrix = [...matrix];
      newMatrix[index] = '';
      setMatrix(newMatrix);
      updateConcatenatedValues(newMatrix);
      saveMatrixState({ matrix: newMatrix, filters, concatenatedValues });
      return;
    }

    // Validate input to ensure it's a single digit between 0-9
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 9 || value.length > 1) {
      return;
    }

    // Check for duplicate values in visible cells
    const visibleCells = matrix.filter((_, idx) => layout[Math.floor(idx / 4)][idx % 4]);
    if (visibleCells.includes(String(numValue))) {
      return;
    }

    const newMatrix = [...matrix];
    newMatrix[index] = String(numValue);
    setMatrix(newMatrix);
    updateConcatenatedValues(newMatrix);
    saveMatrixState({ matrix: newMatrix, filters, concatenatedValues });
  };

  const handleFilterChange = (filterName: string) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterName]: !prev[filterName]
      };
      saveMatrixState({ matrix, filters: newFilters, concatenatedValues });
      return newFilters;
    });
  };

  const clearMatrix = () => {
    const emptyMatrix = Array(16).fill('');
    setMatrix(emptyMatrix);
    setConcatenatedValues([]);
    setFilters({
      primeNumbers: false,
      evenNumbers: false,
      oddNumbers: false,
      largeSequence: false
    });
    clearMatrixState();
    onPredictionsGenerated([], { frequencias: [], pares: [], movimentos: [] });
  };

  useEffect(() => {
    const savedState = loadMatrixState();
    if (savedState) {
      setMatrix(savedState.matrix);
      setFilters(savedState.filters);
      setConcatenatedValues(savedState.concatenatedValues);
    }

    const fetchLotteryData = async (contestNumber?: number) => {
      try {
        const latest = await getLotteryResult(contestNumber);
        setCurrentDraw({
          concurso: latest.numero,
          data: latest.dataApuracao,
          dezenas: latest.listaDezenas,
          acumulado: latest.acumulado,
          valorAcumulado: latest.valorAcumuladoProximoConcurso
        });
        if (latest.numero > 1) {
          const previous = await getLotteryResult(latest.numero - 1);
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
  }, []);

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

  const processMatrix = () => {
    const { movimentos, frequencia } = extractMovements();
    const paresComPeso = new Map<string, { count: number; peso: number }>();

    // Process movements and their weights with enhanced pattern analysis
    movimentos.forEach(mov => {
      const pesoBase = calculatePesoBase(mov);
      const pesoPar = paresComPeso.get(mov.par) || { count: 0, peso: 0 };
      paresComPeso.set(mov.par, {
        count: pesoPar.count + 1,
        peso: pesoPar.peso + pesoBase
      });

      // Process reverse pairs with pattern consideration
      if (mov.par !== mov.parReverso) {
        const pesoParReverso = paresComPeso.get(mov.parReverso) || { count: 0, peso: 0 };
        paresComPeso.set(mov.parReverso, {
          count: pesoParReverso.count + 1,
          peso: pesoParReverso.peso + calculatePesoBase({ ...mov, par: mov.parReverso, parReverso: mov.par })
        });
      }
    });

    const predictions: number[][] = [];

    // Generate number sets based on enhanced pattern analysis
    for (let i = 1; i <= 4; i++) {
      const numeros = Array.from(paresComPeso.entries())
        .sort((a, b) => b[1].peso - a[1].peso)
        .map(([par, { peso }]) => {
          const base = parseInt(par);
          return generateNumberFromPattern(base, peso, i);
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

  const calculatePesoBase = (mov: Movement) => {
    let peso = mov.peso;
    
    // Adjust weight based on movement type
    switch (mov.tipo) {
      case 'diagonal':
        peso *= 1.5; // Diagonal patterns have higher significance
        break;
      case 'horizontal':
      case 'vertical':
        peso *= 1.2; // Straight line patterns have medium significance
        break;
      default:
        peso *= 1.0; // Additional patterns maintain base significance
    }

    // Consider position-based weight adjustments
    if (mov.posicao.startsWith('d')) peso *= 1.3; // Diagonal positions
    if (mov.posicao.startsWith('h')) peso *= 1.2; // Horizontal positions
    if (mov.posicao.startsWith('v')) peso *= 1.1; // Vertical positions

    return peso;
  };

  const generateNumberFromPattern = (base: number, peso: number, variacao: number) => {
    const primos = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];
    const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
    
    // Use multiple mathematical sequences for better distribution
    const primoIndex = base % primos.length;
    const fiboIndex = (base + variacao) % fibonacci.length;
    
    // Combine different mathematical patterns
    const num = Math.floor(
      ((base * primos[primoIndex] + fibonacci[fiboIndex]) * peso + variacao * 7) % 60
    ) + 1;
    
    return num;
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
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  };

  const extractMovements = () => {
    const movimentos: Movement[] = [];
    const frequencia = new Map<string, number>();

    // Process each concatenated value
    concatenatedValues.forEach((value, index) => {
      const { forward, reverse } = value;
      
      // Update frequency count
      if (forward) {
        frequencia.set(forward, (frequencia.get(forward) || 0) + 1);
        if (forward !== reverse) {
          frequencia.set(reverse, (frequencia.get(reverse) || 0) + 1);
        }
      }
  
      // Determine movement type and position
      let tipo = '';
      let posicao = '';
      let peso = 1;
  
      if (index < 5) {
        tipo = 'horizontal';
        posicao = `h${index + 1}`;
        peso = 2;
      } else if (index < 9) {
        tipo = 'vertical';
        posicao = `v${index - 4}`;
        peso = 2;
      } else if (index < 14) {
        tipo = 'adicional';
        posicao = `a${index - 8}`;
        peso = 1;
      } else {
        tipo = 'diagonal';
        posicao = `d${index - 13}`;
        peso = 3;
      }
  
      if (forward) {
        movimentos.push({
          tipo,
          par: forward,
          parReverso: reverse,
          peso,
          posicao
        });
      }
    });
  
    return { movimentos, frequencia };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Entrada da Matriz</h2>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        {layout.flat().map((isVisible, index) => (
          <div key={index} className={`${isVisible ? '' : 'invisible'} flex justify-center relative`}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={matrix[index]}
              onChange={(e) => handleCellChange(index, e.target.value)}
              className="w-16 h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 hover:border-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-gray-300"
              disabled={!isVisible}
            />
          </div>
        ))}
      </div>

      {/* Concatenated Values Display */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Concatenações</h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Diagonal Combinations */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Diagonais</h4>
            <div className="grid gap-6">
              {concatenatedValues.slice(14).map((value, index) => (
                <div key={`d-${index}`} className="flex gap-4 items-center">
                  <span className="text-red-500 font-bold">{value?.forward}</span>
                  <span className="text-blue-500">|</span>
                  <span className="text-red-500 font-bold">{value?.reverse}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal Concatenations */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Horizontais</h4>
            <div className="space-y-2">
              {concatenatedValues.slice(0, 5).map((value, index) => (
                <div key={`h-${index}`} className="flex gap-4 items-center">
                  <span className="text-red-500 font-bold">{value?.forward}</span>
                  <span className="text-blue-500">|</span>
                  <span className="text-red-500 font-bold">{value?.reverse}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Vertical Concatenations */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Verticais</h4>
            <div className="space-y-2">
              {concatenatedValues.slice(5, 9).map((value, index) => (
                <div key={`v-${index}`} className="flex gap-4 items-center">
                  <span className="text-red-500 font-bold">{value?.forward}</span>
                  <span className="text-blue-500">|</span>
                  <span className="text-red-500 font-bold">{value?.reverse}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Combinations */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Combinações Extras</h4>
            <div className="space-y-2 grid-cols-2 ">
              {concatenatedValues.slice(9, 14).map((value, index) => (
                <div key={`a-${index}`} className="flex gap-4 items-center">
                  <span className="text-red-500 font-bold">{value?.forward}</span>
                  <span className="text-blue-500">|</span>
                  <span className="text-red-500 font-bold">{value?.reverse}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-green-50 rounded-lg p-4 mb-6">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Filtros e regras</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div 
              onClick={() => handleFilterChange('primeNumbers')}
              className={`w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${filters.primeNumbers ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'}`}
              title="Números Primos"
            >
              <span className="font-bold text-xl">P</span>
            </div>
            <span className="text-sm text-green-700 font-medium">Primos</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => handleFilterChange('evenNumbers')}
              className={`w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${filters.evenNumbers ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'}`}
              title="Números Pares"
            >
              <span className="font-bold text-xl">2n</span>
            </div>
            <span className="text-sm text-green-700 font-medium">Pares</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => handleFilterChange('oddNumbers')}
              className={`w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${filters.oddNumbers ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'}`}
              title="Números Ímpares"
            >
              <span className="font-bold text-xl">2n+1</span>
            </div>
            <span className="text-sm text-green-700 font-medium">Ímpares</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => handleFilterChange('largeSequence')}
              className={`w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${filters.largeSequence ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'}`}
              title="Sequência grande de Saltos"
            >
              <span className="font-bold text-xl">S</span>
            </div>
            <span className="text-sm text-green-700 font-medium">Sequência</span>
          </div>
        </div>
      </div>

      {currentDraw && (
        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Último Sorteio</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={contestNumber}
                onChange={(e) => setContestNumber(e.target.value)}
                placeholder="Número do concurso"
                className="px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => fetchLotteryData(parseInt(contestNumber))}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
              >
                Buscar
              </button>
            </div>
            <div>
              <p className="text-green-700">Status: {currentDraw?.acumulado ? 'ACUMULADO' : 'PREMIADO'}</p>
              <p className="text-green-700">Valor: R$ {(currentDraw?.valorAcumulado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-green-700 font-semibold">Dezenas sorteadas:</p>
            <div className="flex gap-2 mt-2">
              {currentDraw.dezenas.map((numero, index) => (
                <span key={index} className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-full font-bold">
                  {numero}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={clearMatrix}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
        >
          Limpar Matriz
        </button>
        <button
          onClick={processMatrix}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium"
        >
          Processar Matriz
        </button>
      </div>
    </div>
  );
}
