'use client';

import { useState, useEffect } from 'react';
import { getLotteryResult } from '../services/lotteryApi';

interface LotteryGeneratorProps {
  gameType: string;
  onSaveSet?: (numbers: number[]) => void;
}

interface LotteryDraw {
  concurso: number;
  data: string;
  dezenas: string[];
  acumulado: boolean;
  valorAcumulado: number | undefined;
}

export default function LotteryGenerator({ gameType, onSaveSet }: LotteryGeneratorProps) {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [savedSets, setSavedSets] = useState<number[][]>([]);
  const [currentDraw, setCurrentDraw] = useState<LotteryDraw | null>(null);
  const [filters, setFilters] = useState({
    primeNumbers: false,
    evenNumbers: false,
    oddNumbers: false,
    largeSequence: false
  });

  useEffect(() => {
    fetchLatestDraw();
  }, [gameType]);

  const fetchLatestDraw = async () => {
    try {
      const result = await getLotteryResult(gameType, 'latest');
      setCurrentDraw(result);
    } catch (error) {
      console.error('Error fetching lottery results:', error);
    }
  };

  const generateRandomNumbers = () => {
    const maxNumber = gameType === 'mega-sena' ? 60 : gameType === 'milionaria' ? 50 : 80;
    const count = gameType === 'mega-sena' ? 6 : gameType === 'milionaria' ? 6 : 15;
    
    let numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(num)) {
        if (applyFilters(num)) {
          numbers.push(num);
        }
      }
    }
    
    setGeneratedNumbers(numbers.sort((a, b) => a - b));
  };

  const applyFilters = (num: number): boolean => {
    if (!Object.values(filters).some(f => f)) return true;

    const isPrime = (n: number): boolean => {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    if (filters.primeNumbers && !isPrime(num)) return false;
    if (filters.evenNumbers && num % 2 !== 0) return false;
    if (filters.oddNumbers && num % 2 === 0) return false;
    if (filters.largeSequence && num > 30) return false;

    return true;
  };

  const handleFilterChange = (filterName: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const saveCurrentSet = () => {
    if (generatedNumbers.length > 0) {
      setSavedSets(prev => [...prev, generatedNumbers]);
      if (onSaveSet) {
        onSaveSet(generatedNumbers);
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Lottery Number Generator</h2>
      
      <div className="mb-4">
        <button
          onClick={generateRandomNumbers}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
        >
          Generate Numbers
        </button>
        <button
          onClick={saveCurrentSet}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={generatedNumbers.length === 0}
        >
          Save Set
        </button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Filters:</h3>
        <div className="flex gap-2">
          {Object.entries(filters).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleFilterChange(key)}
                className="mr-2"
              />
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Generated Numbers:</h3>
        <div className="flex gap-2">
          {generatedNumbers.map((num, index) => (
            <span
              key={index}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full"
            >
              {num}
            </span>
          ))}
        </div>
      </div>

      {currentDraw && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Latest Draw:</h3>
          <p>Contest: {currentDraw.concurso}</p>
          <p>Date: {currentDraw.data}</p>
          <div className="flex gap-2 mt-2">
            {currentDraw.dezenas.map((num, index) => (
              <span
                key={index}
                className="w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-full"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Saved Sets:</h3>
        <div className="space-y-2">
          {savedSets.map((set, setIndex) => (
            <div key={setIndex} className="flex gap-2">
              {set.map((num, numIndex) => (
                <span
                  key={numIndex}
                  className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full"
                >
                  {num}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}