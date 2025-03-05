'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Info } from 'lucide-react';
import { saveMatrixState, loadMatrixState, clearMatrixState } from '../services/matrixStorage';
import PredictionResults from './PredictionResults';
import PatternReport from './PatternReport';
import { getLotteryResult } from '../services/lotteryApi';

interface Contest {
  id: number;
  date: string;
  result: string;
  numbers: number[];
}

interface MatrixState {
  matrix: string[];
  filters: {
    primeNumbers: boolean;
    evenNumbers: boolean;
    oddNumbers: boolean;
    largeSequence: boolean;
  };
  concatenatedValues: { forward: string; reverse: string; }[];
}

interface PatternReport {
  frequencias: Array<{
    numero: string;
    frequencia: number;
  }>;
  pares: Array<{
    par: string;
    ocorrencias: number;
    peso: number;
  }>;
  movimentos: Array<{
    tipo: string;
    par: string;
    parReverso: string;
    posicao: string;
    peso: number;
  }>;
}

export default function MegaSenaGenerator() {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [savedSets, setSavedSets] = useState<number[][]>([]);
  const [matrixValues, setMatrixValues] = useState<string[]>(Array(16).fill(''));
  const [predictions, setPredictions] = useState<number[][]>([]);
  const [patternReport, setPatternReport] = useState<PatternReport | null>(null);
  const [concatenatedValues, setConcatenatedValues] = useState<{ forward: string; reverse: string; }[]>([]);
  const [filters, setFilters] = useState({
    primeNumbers: false,
    evenNumbers: false,
    oddNumbers: true,
    evenAndOddNumbers: false,
    largeSequence: false,
  });
  
  const [contests, setContests] = useState<Contest[]>([{
    id: 0,
    date: '',
    result: '',
    numbers: [0, 0, 0, 0, 0, 0]
  }]);

  const [selectedContest, setSelectedContest] = useState<number | null>(null);

  const [previousContests, setPreviousContests] = useState<Contest[]>([{
    id: 0,
    date: '',
    result: '',
    numbers: [0, 0, 0, 0, 0, 0]
  }]);

  useEffect(() => {
    const savedState = loadMatrixState();
    if (savedState) {
      setMatrixValues(savedState.matrix);
      setFilters(savedState.filters);
      setConcatenatedValues(savedState.concatenatedValues);
    }

    const fetchContestData = async () => {
      try {
        // Fetch latest contest
        const latestResult = await getLotteryResult();
        // Fetch previous contest
        const previousResult = await getLotteryResult(latestResult.numero - 1);

        const formatContestData = (result: any): Contest => ({
          id: result.numero,
          date: result.dataApuracao,
          result: result.acumulado ? 'ACUMULADO' : 'PREMIADO',
          numbers: result.listaDezenas.map(Number)
        });

        setContests([
          formatContestData(latestResult),
          formatContestData(previousResult)
        ]);
      } catch (error) {
        console.error('Error fetching lottery data:', error);
      }
    };

    fetchContestData();
  }, []);

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

  const handleDeleteSavedSet = (index: number) => {
    const newSavedSets = [...savedSets];
    newSavedSets.splice(index, 1);
    setSavedSets(newSavedSets);
  };

  const handleFilterChange = (filterName: keyof typeof filters) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName]
    });
  };

  const calculateConcatenatedValues = (matrix: string[]) => {
    const newConcatenatedValues: { forward: string; reverse: string; }[] = [];

    // Horizontal concatenation
    for (let i = 0; i < 16; i += 4) {
      const row = matrix.slice(i, i + 4).join('');
      if (row.length === 4) {
        newConcatenatedValues.push({
          forward: row,
          reverse: row.split('').reverse().join('')
        });
      }
    }

    // Vertical concatenation
    for (let i = 0; i < 4; i++) {
      const column = [matrix[i], matrix[i + 4], matrix[i + 8], matrix[i + 12]].join('');
      if (column.length === 4) {
        newConcatenatedValues.push({
          forward: column,
          reverse: column.split('').reverse().join('')
        });
      }
    }

    // Diagonal concatenation (top-left to bottom-right)
    const diagonal1 = [matrix[0], matrix[5], matrix[10], matrix[15]].join('');
    if (diagonal1.length === 4) {
      newConcatenatedValues.push({
        forward: diagonal1,
        reverse: diagonal1.split('').reverse().join('')
      });
    }

    // Diagonal concatenation (top-right to bottom-left)
    const diagonal2 = [matrix[3], matrix[6], matrix[9], matrix[12]].join('');
    if (diagonal2.length === 4) {
      newConcatenatedValues.push({
        forward: diagonal2,
        reverse: diagonal2.split('').reverse().join('')
      });
    }

    setConcatenatedValues(newConcatenatedValues);
  };

  const generateSinglePrediction = (usedNumbers: Set<number>): number[] => {
    const prediction: number[] = [];
    const weights = new Map<number, number>();

    // Initialize weights based on matrix patterns
    for (let i = 1; i <= 60; i++) {
      weights.set(i, 1);
      // Increase weight if number appears in concatenated values
      concatenatedValues.forEach(value => {
        if (value.forward.includes(String(i % 10)) || value.reverse.includes(String(i % 10))) {
          weights.set(i, (weights.get(i) || 1) + 1);
        }
      });
    }

    // Generate numbers based on weights and filters
    while (prediction.length < 6) {
      const availableNumbers = Array.from({ length: 60 }, (_, i) => i + 1)
        .filter(num => !usedNumbers.has(num) && !prediction.includes(num) && applyFilters(num));

      if (availableNumbers.length === 0) break;

      const totalWeight = availableNumbers.reduce((sum, num) => sum + (weights.get(num) || 1), 0);
      let random = Math.random() * totalWeight;
      let selectedNumber = availableNumbers[0];

      for (const num of availableNumbers) {
        random -= (weights.get(num) || 1);
        if (random <= 0) {
          selectedNumber = num;
          break;
        }
      }

      prediction.push(selectedNumber);
      usedNumbers.add(selectedNumber);
    }

    return prediction;
  };

  const generatePredictions = () => {
    const newPredictions: number[][] = [];
    const usedNumbers = new Set<number>();

    // Generate predictions
    for (let i = 0; i < 6; i++) {
      const prediction = generateSinglePrediction(usedNumbers);
      if (prediction.length === 6) {
        newPredictions.push(prediction.sort((a, b) => a - b));
      }
    }

    // Generate pattern report
    const newPatternReport: PatternReport = {
      frequencias: generateFrequencyReport(newPredictions),
      pares: generatePairsAnalysis(newPredictions),
      movimentos: generateMovementAnalysis(newPredictions)
    };

    setPredictions(newPredictions);
    setPatternReport(newPatternReport);
    saveCurrentState();
  };

  const applyFilters = (num: number): boolean => {
    const isPrime = (n: number) => {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    if (filters.primeNumbers && !isPrime(num)) return false;
    if (filters.evenNumbers && num % 2 !== 0) return false;
    if (filters.oddNumbers && num % 2 === 0) return false;
    if (filters.evenAndOddNumbers) {
      const currentPrediction = predictions[predictions.length - 1] || [];
      const evenCount = currentPrediction.filter(n => n % 2 === 0).length;
      if (num % 2 === 0 && evenCount >= 3) return false;
      if (num % 2 !== 0 && (6 - evenCount) >= 3) return false;
    }

    return true;
  };

  const saveCurrentState = () => {
    const state: MatrixState = {
      matrix: matrixValues,
      filters,
      concatenatedValues
    };
    saveMatrixState(state);
  };

  // Add layout configuration
  const layout = [
    [true, false, false, true],  // x _ _ y
    [false, true, true, false],  // _ a b _
    [false, true, true, false],  // _ c d _
    [true, false, false, true]   // z _ _ w
  ];

  const handleMatrixInputChange = (index: number, value: string) => {
    // Only process input for visible cells based on layout
    if (!layout[Math.floor(index / 4)][index % 4]) {
      return;
    }

    // Allow empty value for clearing
    if (value === '') {
      const newMatrix = [...matrixValues];
      newMatrix[index] = '';
      setMatrixValues(newMatrix);
      calculateConcatenatedValues(newMatrix);
      return;
    }

    // Validate input to ensure it's a single digit between 0-9
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 9 || value.length > 1) {
      return;
    }

    // Check for duplicate values in visible cells
    const visibleCells = matrixValues.filter((_, idx) => 
      layout[Math.floor(idx / 4)][idx % 4]
    );
    if (visibleCells.includes(String(numValue))) {
      return;
    }

    const newMatrix = [...matrixValues];
    newMatrix[index] = String(numValue);
    setMatrixValues(newMatrix);
    calculateConcatenatedValues(newMatrix);
  };

  const clearMatrix = () => {
    setMatrixValues(Array(16).fill(''));
    setConcatenatedValues([]);
    clearMatrixState();
  };

  const formatNumber = (num: number) => num === 0 ? '?' : num.toString().padStart(2, '0');

  // Move the return statement to the correct level
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Panel - Number Generator */}
        <Card className="p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Números da MegaSena</h2>
          
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className="w-16 h-16 rounded-full bg-emerald-800 text-white flex items-center justify-center text-2xl font-bold"
              >
                {generatedNumbers[index] ? generatedNumbers[index] : '?'}
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Button 
              className="flex-1 bg-white text-emerald-800 border border-emerald-800 hover:bg-gray-100"
              onClick={handleGenerate}
            >
              Gerar
            </Button>
            <Button 
              className="flex-1 bg-emerald-800 text-white hover:bg-emerald-700"
              onClick={handleSave}
            >
              Salvar
            </Button>
          </div>

          {/* Matrix Input Grid */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Entrada da Matriz</h3>
            <div className="grid grid-cols-4 gap-4 w-fit mx-auto bg-gray-50 p-6 rounded-lg">
              {matrixValues.map((value, index) => {
                const isVisible = layout[Math.floor(index / 4)][index % 4];
                return isVisible ? (
                  <input
                    key={index}
                    type="text"
                    value={value}
                    onChange={(e) => handleMatrixInputChange(index, e.target.value)}
                    className="w-12 h-12 text-center border-2 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-lg font-semibold"
                    maxLength={1}
                  />
                ) : (
                  <div key={index} className="w-12 h-12"></div>
                );
              })}
            </div>

            {/* Concatenated Values Display */}
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-2">Concatenações</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-1">Horizontais</h5>
                  {concatenatedValues.slice(0, 4).map((value, index) => (
                    <div key={`h-${index}`} className="text-sm">
                      {value.forward} / {value.reverse}
                    </div>
                  ))}
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Verticais</h5>
                  {concatenatedValues.slice(4, 8).map((value, index) => (
                    <div key={`v-${index}`} className="text-sm">
                      {value.forward} / {value.reverse}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={generatePredictions}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Gerar Previsões
              </Button>
              <Button
                onClick={clearMatrix}
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Limpar Matriz
              </Button>
            </div>
          </div>
        </Card>

        {/* Middle Panel - Filters */}
        <Card className="p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Filtros e regras</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="primeNumbers" 
                checked={filters.primeNumbers}
                onCheckedChange={() => handleFilterChange('primeNumbers')}
              />
              <label htmlFor="primeNumbers" className="text-base">Números Primos</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="evenNumbers" 
                checked={filters.evenNumbers}
                onCheckedChange={() => handleFilterChange('evenNumbers')}
              />
              <label htmlFor="evenNumbers" className="text-base">Números Pares</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="oddNumbers" 
                checked={filters.oddNumbers}
                onCheckedChange={() => handleFilterChange('oddNumbers')}
              />
              <label htmlFor="oddNumbers" className="text-base">Números Ímpares</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="evenAndOddNumbers" 
                checked={filters.evenAndOddNumbers}
                onCheckedChange={() => handleFilterChange('evenAndOddNumbers')}
              />
              <label htmlFor="evenAndOddNumbers" className="text-base">Números Pares e Ímpares</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="largeSequence" 
                checked={filters.largeSequence}
                onCheckedChange={() => handleFilterChange('largeSequence')}
              />
              <label htmlFor="largeSequence" className="text-base">Sequência grande de Saltos</label>
            </div>
          </div>

          {/* Prediction Results */}
          {predictions.length > 0 && (
            <div className="mt-8">
              <PredictionResults predictions={predictions} />
            </div>
          )}
          
          {patternReport && (
            <div className="mt-8">
              <PatternReport report={patternReport} />
            </div>
          )}

          {/* Saved Games and Results */}
          {savedSets.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Jogos Salvos</h2>
              <div className="grid grid-cols-1 gap-4">
                {savedSets.map((set, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {set.map((number) => (
                        <div
                          key={number}
                          className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSavedSet(index)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </Button>
                  </Card>
                ))}
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Verificar Resultados</h2>
                <OfficialResults gameType="mega-sena" predictions={savedSets} />
              </div>
            </div>
          )}
        </Card>

        {/* Right Panel - Results */}
        <Card className="p-6 shadow-sm">
          <div className="space-y-6">
            {contests.map((contest, index) => (
              <div key={index} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-base font-medium">Concurso:</div>
                  <div className="bg-emerald-800 text-white py-2 px-4 rounded text-center font-bold">
                    {contest.id}
                  </div>
                  
                  <div className="text-base font-medium">Apuração:</div>
                  <div className="bg-emerald-800 text-white py-2 px-4 rounded text-center font-bold">
                    {contest.date}
                  </div>
                  
                  <div className="text-base font-medium">Resultado:</div>
                  <div className="bg-emerald-800 text-white py-2 px-4 rounded text-center font-bold">
                    {contest.result}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Dezenas sorteadas</h3>
                    {index === 0 && <Info className="h-5 w-5 text-gray-500" />}
                  </div>
                  
                  <div className="flex justify-start gap-2 mb-4">
                    {contest.numbers.map((number, idx) => (
                      <div 
                        key={idx} 
                        className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center text-lg font-bold"
                      >
                        {formatNumber(number)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {index === 0 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

  const generateFrequencyReport = (predictions: number[][]): Array<{ numero: string; frequencia: number }> => {
    const frequencyMap = new Map<number, number>();
    predictions.forEach(prediction => {
      prediction.forEach(num => {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
      });
    });

    return Array.from(frequencyMap.entries())
      .map(([numero, frequencia]) => ({
        numero: String(numero),
        frequencia
      }))
      .sort((a, b) => b.frequencia - a.frequencia);
  };

  const generatePairsAnalysis = (predictions: number[][]): Array<{ par: string; ocorrencias: number; peso: number }> => {
    const pairsMap = new Map<string, number>();
    predictions.forEach(prediction => {
      for (let i = 0; i < prediction.length - 1; i++) {
        for (let j = i + 1; j < prediction.length; j++) {
          const pair = `${prediction[i]}-${prediction[j]}`;
          pairsMap.set(pair, (pairsMap.get(pair) || 0) + 1);
        }
      }
    });

    return Array.from(pairsMap.entries())
      .map(([par, ocorrencias]) => ({
        par,
        ocorrencias,
        peso: ocorrencias / predictions.length
      }))
      .sort((a, b) => b.ocorrencias - a.ocorrencias);
  };

  const generateMovementAnalysis = (predictions: number[][]): Array<{ tipo: string; par: string; parReverso: string; posicao: string; peso: number }> => {
    const movements: Array<{ tipo: string; par: string; parReverso: string; posicao: string; peso: number }> = [];
    
    predictions.forEach(prediction => {
      for (let i = 0; i < prediction.length - 1; i++) {
        const current = prediction[i];
        const next = prediction[i + 1];
        const difference = next - current;
        const tipo = difference > 0 ? 'ascendente' : 'descendente';
        const par = `${current}-${next}`;
        const parReverso = `${next}-${current}`;
        const posicao = `${i + 1}-${i + 2}`;
        
        movements.push({
          tipo,
          par,
          parReverso,
          posicao,
          peso: 1
        });
      }
    });

    // Calculate weights based on occurrence frequency
    const movementWeights = movements.reduce((acc, movement) => {
      const key = `${movement.tipo}-${movement.par}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return movements.map(movement => ({
      ...movement,
      peso: movementWeights[`${movement.tipo}-${movement.par}`] / predictions.length
    }));
  };

  const [searchContest, setSearchContest] = useState<string>('');
  const [searchResult, setSearchResult] = useState<Contest | null>(null);

  const handleSearchContest = async () => {
    try {
      const result = await getLotteryResult(Number(searchContest));
      setSearchResult({
        id: result.numero,
        date: result.dataApuracao,
        result: result.acumulado ? 'ACUMULADO' : 'PREMIADO',
        numbers: result.listaDezenas.map(Number)
      });
    } catch (error) {
      console.error('Error fetching contest:', error);
      setSearchResult(null);
    }
  };

  // Add this section in the JSX, after the title "Números da MegaSena"
  <div className="mb-6">
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        value={searchContest}
        onChange={(e) => setSearchContest(e.target.value)}
        placeholder="Número do concurso"
        className="flex-1 p-2 border rounded-md"
      />
      <Button
        onClick={handleSearchContest}
        className="bg-emerald-800 text-white hover:bg-emerald-700"
      >
        Buscar
      </Button>
    </div>
    {searchResult && (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>Concurso: {searchResult.id}</div>
          <div>Data: {searchResult.date}</div>
          <div>Resultado: {searchResult.result}</div>
        </div>
        <div className="flex gap-2 justify-center">
          {searchResult.numbers.map((num, idx) => (
            <div
              key={idx}
              className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center text-lg font-bold"
            >
              {num}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
}