'use client';

import { useState, useEffect } from 'react';
import { getLotteryResult } from '../services/lotteryApi';

interface LotteryGeneratorProps {
  onNumbersGenerated?: (numbers: number[]) => void;
}

interface ContestInfo {
  numero: number;
  dataApuracao: string;
  listaDezenas: string[];
  acumulado: boolean;
}

export default function LotteryGenerator({ onNumbersGenerated }: LotteryGeneratorProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(Array(6).fill(0));
  const [filters, setFilters] = useState({
    primeNumbers: false,
    evenNumbers: false,
    oddNumbers: false,
    evenAndOddNumbers: false,
    largeSequenceJumps: false
  });
  const [contestInfo, setContestInfo] = useState<ContestInfo | null>(null);
  const [savedSets, setSavedSets] = useState<number[][]>([]);
  const [collections, setCollections] = useState<string[]>(['Minha Coleção 1']);
  const [selectedCollection, setSelectedCollection] = useState('Minha Coleção 1');

  useEffect(() => {
    fetchLatestContest();
  }, []);

  const fetchLatestContest = async () => {
    try {
      const result = await getLotteryResult();
      setContestInfo(result);
    } catch (error) {
      console.error('Error fetching contest info:', error);
    }
  };

  const generateNumbers = () => {
    let numbers: number[] = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 60) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    numbers.sort((a, b) => a - b);
    setSelectedNumbers(numbers);
    if (onNumbersGenerated) {
      onNumbersGenerated(numbers);
    }
  };

  const saveNumbers = () => {
    if (selectedNumbers.every(num => num > 0)) {
      setSavedSets(prev => [...prev, [...selectedNumbers]]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Left Panel - Number Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {selectedNumbers.map((number, index) => (
            <div
              key={index}
              className="lottery-number placeholder"
            >
              {number > 0 ? number : '?'}
            </div>
          ))}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={generateNumbers}
            className="btn-primary"
          >
            Gerar
          </button>
          <button
            onClick={saveNumbers}
            className="btn-success"
            disabled={!selectedNumbers.every(num => num > 0)}
          >
            Salvar
          </button>
        </div>
      </div>

      {/* Middle Panel - Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.primeNumbers}
              onChange={() => setFilters(prev => ({ ...prev, primeNumbers: !prev.primeNumbers }))}
              className="form-checkbox"
            />
            Números Primos
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.evenNumbers}
              onChange={() => setFilters(prev => ({ ...prev, evenNumbers: !prev.evenNumbers }))}
              className="form-checkbox"
            />
            Números Pares
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.oddNumbers}
              onChange={() => setFilters(prev => ({ ...prev, oddNumbers: !prev.oddNumbers }))}
              className="form-checkbox"
            />
            Números Ímpares
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.evenAndOddNumbers}
              onChange={() => setFilters(prev => ({ ...prev, evenAndOddNumbers: !prev.evenAndOddNumbers }))}
              className="form-checkbox"
            />
            Números Pares e Ímpares
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.largeSequenceJumps}
              onChange={() => setFilters(prev => ({ ...prev, largeSequenceJumps: !prev.largeSequenceJumps }))}
              className="form-checkbox"
            />
            Sequência grande de Saltos
          </label>
        </div>
      </div>

      {/* Right Panel - Contest Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Informações do Concurso</h3>
        {contestInfo && (
          <div className="space-y-3">
            <div>
              <span className="font-medium">Concurso:</span>
              <span className="ml-2">{contestInfo.numero}</span>
            </div>
            <div>
              <span className="font-medium">Data:</span>
              <span className="ml-2">{new Date(contestInfo.dataApuracao).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2">{contestInfo.acumulado ? 'ACUMULADO' : 'Premiado'}</span>
            </div>
            <div>
              <span className="font-medium">Números Sorteados:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {contestInfo.listaDezenas.map((num, index) => (
                  <div key={index} className="lottery-number">
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Saved Numbers Section */}
        <div className="mt-6">
          <h4 className="font-medium mb-2">Dezenas não salvas</h4>
          <div className="space-y-2">
            {savedSets.map((set, index) => (
              <div key={index} className="flex flex-wrap gap-2">
                {set.map((num, numIndex) => (
                  <div key={numIndex} className="lottery-number text-sm">
                    {num}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Collections Section */}
        <div className="mt-6">
          <h4 className="font-medium mb-2">Minhas coleções</h4>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="w-full input-field"
          >
            {collections.map((collection, index) => (
              <option key={index} value={collection}>
                {collection}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}