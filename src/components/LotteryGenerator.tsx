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
    <div className="lottery-container">
      {/* Left Panel - Number Selection */}
      <div className="panel">
        <h3 className="panel-title">Gerador de Números</h3>
        <div className="numbers-grid">
          {selectedNumbers.map((number, index) => (
            <div
              key={index}
              className="lottery-number placeholder"
            >
              {number > 0 ? number : '?'}
            </div>
          ))}
        </div>
        <div className="buttons-container">
          <button
            onClick={generateNumbers}
            className="btn-primary"
          >
            Gerar Números
          </button>
          <button
            onClick={saveNumbers}
            className="btn-success"
            disabled={!selectedNumbers.every(num => num > 0)}
          >
            Salvar Jogo
          </button>
        </div>
      </div>

      {/* Middle Panel - Filters */}
      <div className="panel">
        <h3 className="panel-title">Filtros de Geração</h3>
        <div className="filters-container">
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.primeNumbers}
              onChange={() => setFilters(prev => ({ ...prev, primeNumbers: !prev.primeNumbers }))}
              className="form-checkbox"
            />
            <span>Números Primos</span>
          </label>
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.evenNumbers}
              onChange={() => setFilters(prev => ({ ...prev, evenNumbers: !prev.evenNumbers }))}
              className="form-checkbox"
            />
            <span>Números Pares</span>
          </label>
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.oddNumbers}
              onChange={() => setFilters(prev => ({ ...prev, oddNumbers: !prev.oddNumbers }))}
              className="form-checkbox"
            />
            <span>Números Ímpares</span>
          </label>
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.evenAndOddNumbers}
              onChange={() => setFilters(prev => ({ ...prev, evenAndOddNumbers: !prev.evenAndOddNumbers }))}
              className="form-checkbox"
            />
            <span>Números Pares e Ímpares</span>
          </label>
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.largeSequenceJumps}
              onChange={() => setFilters(prev => ({ ...prev, largeSequenceJumps: !prev.largeSequenceJumps }))}
              className="form-checkbox"
            />
            <span>Sequência grande de Saltos</span>
          </label>
        </div>
      </div>

      {/* Right Panel - Contest Info */}
      <div className="panel">
        <h3 className="panel-title">Informações do Concurso</h3>
        {contestInfo && (
          <div className="contest-info">
            <div className="info-row">
              <span className="info-label">Concurso:</span>
              <span className="info-value highlight">{contestInfo.numero}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Data:</span>
              <span className="info-value">{new Date(contestInfo.dataApuracao).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value highlight">{contestInfo.acumulado ? 'ACUMULADO' : 'Premiado'}</span>
            </div>
            <div className="mt-4">
              <span className="section-title">Números Sorteados:</span>
              <div className="lottery-numbers-grid">
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
          <h4 className="section-title">Jogos Salvos</h4>
          <div className="saved-sets">
            {savedSets.length > 0 ? (
              savedSets.map((set, index) => (
                <div key={index} className="saved-set">
                  {set.map((num, numIndex) => (
                    <div key={numIndex} className="lottery-number text-sm">
                      {num}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Nenhum jogo salvo ainda</p>
            )}
          </div>
        </div>

        {/* Collections Section */}
        <div className="mt-6">
          <h4 className="section-title">Minhas Coleções</h4>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="collection-selector p-2"
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