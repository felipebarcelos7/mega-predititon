'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Info } from 'lucide-react';
import { saveMatrixState, loadMatrixState, clearMatrixState } from '../services/matrixStorage';
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

export default function MegaSenaGenerator() {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [savedSets, setSavedSets] = useState<number[][]>([]);
  const [matrixValues, setMatrixValues] = useState<string[]>(Array(16).fill(''));
  const [predictions, setPredictions] = useState<number[][]>([]);
  const [concatenatedValues, setConcatenatedValues] = useState<{ forward: string; reverse: string; }[]>([]);
  const [filters, setFilters] = useState({
    primeNumbers: false,
    evenNumbers: false,
    oddNumbers: true,
    evenAndOddNumbers: false,
    largeSequence: false,
  });
  
  const [contests, setContests] = useState<Contest[]>([{
    id: 2670,
    date: '31/12/2023',
    result: 'ACUMULADO',
    numbers: [0, 0, 0, 0, 0, 0]
  },
  {
    id: 2669,
    date: '16/12/2023',
    result: 'ACUMULADO',
    numbers: [4, 7, 16, 35, 46, 54]
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

  const handleMatrixInputChange = (index: number, value: string) => {
    if (value === '' || (value.length === 1 && /^[0-9]$/.test(value))) {
      const newMatrix = [...matrixValues];
      newMatrix[index] = value;
      setMatrixValues(newMatrix);
      calculateConcatenatedValues(newMatrix);
    }
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

  const generatePredictions = () => {
    const newPredictions: number[][] = [];
    const usedNumbers = new Set<number>();
    const validNumbers = Array.from({ length: 60 }, (_, i) => i + 1);

    // Helper functions
    const isPrime = (num: number) => {
      if (num < 2) return false;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
      }
      return true;
    };

    const isEven = (num: number) => num % 2 === 0;

    // Filter numbers based on selected filters
    const filteredNumbers = validNumbers.filter(num => {
      if (filters.primeNumbers && !isPrime(num)) return false;
      if (filters.evenNumbers && !isEven(num)) return false;
      if (filters.oddNumbers && isEven(num)) return false;
      return true;
    });

    // Generate predictions based on concatenated values
    concatenatedValues.forEach(({ forward, reverse }) => {
      const forwardNum = parseInt(forward);
      const reverseNum = parseInt(reverse);

      if (!isNaN(forwardNum) && !isNaN(reverseNum)) {
        const prediction: number[] = [];
        let attempts = 0;
        const maxAttempts = 100;

        while (prediction.length < 6 && attempts < maxAttempts) {
          attempts++;
          const baseNum = attempts % 2 === 0 ? forwardNum : reverseNum;
          const num = (baseNum % 60) + 1;

          if (
            !usedNumbers.has(num) &&
            filteredNumbers.includes(num) &&
            !prediction.includes(num)
          ) {
            prediction.push(num);
            usedNumbers.add(num);
          }
        }

        if (prediction.length === 6) {
          newPredictions.push(prediction.sort((a, b) => a - b));
        }
      }
    });

    setPredictions(newPredictions);
    saveCurrentState();
  };

  const saveCurrentState = () => {
    const state: MatrixState = {
      matrix: matrixValues,
      filters,
      concatenatedValues
    };
    saveMatrixState(state);
  };

  const clearMatrix = () => {
    setMatrixValues(Array(16).fill(''));
    setConcatenatedValues([]);
    clearMatrixState();
  };

  const formatNumber = (num: number) => num === 0 ? '?' : num.toString().padStart(2, '0');

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
            <h3 className="text-lg font-semibold mb-4">Matriz de Previsão</h3>
            <div className="grid grid-cols-4 gap-2">
              {matrixValues.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  onChange={(e) => handleMatrixInputChange(index, e.target.value)}
                  className="w-12 h-12 text-center border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  maxLength={1}
                />
              ))}
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
              <h3 className="text-lg font-semibold mb-4">Previsões Geradas</h3>
              <div className="space-y-4">
                {predictions.map((prediction, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {prediction.map((number, numIndex) => (
                        <div
                          key={numIndex}
                          className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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