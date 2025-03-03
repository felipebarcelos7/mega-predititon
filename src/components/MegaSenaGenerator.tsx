import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Info, Trash2, Bookmark, RefreshCw } from 'lucide-react';

interface Contest {
  id: number;
  date: string;
  result: string;
  numbers: number[];
}

export default function MegaSenaGenerator() {
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [savedSets, setSavedSets] = useState<number[][]>([]);
  const [filters, setFilters] = useState({
    primeNumbers: false,
    evenNumbers: false,
    oddNumbers: true,
    evenAndOddNumbers: false,
    largeSequence: false,
  });
  
  const [contests, setContests] = useState<Contest[]>([
    {
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
    }
  ]);

  // Prime numbers check function
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

  const generateRandomNumbers = () => {
    let numbers: number[] = [];
    let attempts = 0;
    const maxAttempts = 100;

    // Reset conflicting filters
    if (filters.evenNumbers && filters.oddNumbers) {
      setFilters(prev => ({
        ...prev,
        evenNumbers: false,
        oddNumbers: false,
        evenAndOddNumbers: true
      }));
    }

    const isValidNumber = (num: number): boolean => {
      if (filters.primeNumbers && !isPrime(num)) return false;
      if (filters.evenNumbers && num % 2 !== 0) return false;
      if (filters.oddNumbers && num % 2 === 0) return false;
      if (filters.evenAndOddNumbers) {
        const currentEvenCount = numbers.filter(n => n % 2 === 0).length;
        const currentOddCount = numbers.filter(n => n % 2 !== 0).length;
        if (num % 2 === 0 && currentEvenCount >= 3) return false;
        if (num % 2 !== 0 && currentOddCount >= 3) return false;
      }
      if (filters.largeSequence) {
        const lastNumber = numbers[numbers.length - 1];
        if (lastNumber && Math.abs(num - lastNumber) < 5) return false;
      }
      return true;
    };

    while (numbers.length < 6 && attempts < maxAttempts) {
      attempts++;
      const randomNum = Math.floor(Math.random() * 60) + 1;
      
      if (numbers.includes(randomNum)) continue;
      if (!isValidNumber(randomNum)) continue;
      
      numbers.push(randomNum);
    }

    if (numbers.length < 6) {
      numbers = [];
      while (numbers.length < 6) {
        const randomNum = Math.floor(Math.random() * 60) + 1;
        if (!numbers.includes(randomNum)) {
          numbers.push(randomNum);
        }
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

  // Format number to always have 2 digits
  const formatNumber = (num: number) => {
    return num === 0 ? '?' : num.toString().padStart(2, '0');
  };

  // Generate numbers on component mount
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel - Number Generator */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-emerald-100 overflow-hidden">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800">Números da MegaSena</h2>
          
          <div className="flex justify-center gap-3 mb-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center text-2xl font-bold shadow-md transform hover:scale-105 transition-transform duration-200"
              >
                {generatedNumbers[index] ? generatedNumbers[index] : '?'}
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Button 
              className="flex-1 bg-white text-emerald-800 border-2 border-emerald-800 hover:bg-emerald-50 transition-colors duration-200 font-semibold"
              onClick={handleGenerate}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar
            </Button>
            <Button 
              className="flex-1 bg-emerald-800 text-white hover:bg-emerald-700 transition-colors duration-200 font-semibold"
              onClick={handleSave}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </Card>

        {/* Middle Panel - Filters */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-emerald-100">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800">Filtros e regras</h2>
          
          <div className="space-y-5">
            <div className="flex items-center space-x-3 hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-200">
              <Checkbox 
                id="primeNumbers" 
                checked={filters.primeNumbers}
                onCheckedChange={() => handleFilterChange('primeNumbers')}
                className="border-emerald-600 data-[state=checked]:bg-emerald-600"
              />
              <label htmlFor="primeNumbers" className="text-base cursor-pointer">Números Primos</label>
            </div>
            
            <div className="flex items-center space-x-3 hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-200">
              <Checkbox 
                id="evenNumbers" 
                checked={filters.evenNumbers}
                onCheckedChange={() => handleFilterChange('evenNumbers')}
                className="border-emerald-600 data-[state=checked]:bg-emerald-600"
              />
              <label htmlFor="evenNumbers" className="text-base cursor-pointer">Números Pares</label>
            </div>
            
            <div className="flex items-center space-x-3 hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-200">
              <Checkbox 
                id="oddNumbers" 
                checked={filters.oddNumbers}
                onCheckedChange={() => handleFilterChange('oddNumbers')}
                className="border-emerald-600 data-[state=checked]:bg-emerald-600"
              />
              <label htmlFor="oddNumbers" className="text-base cursor-pointer">Números Ímpares</label>
            </div>
            
            <div className="flex items-center space-x-3 hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-200">
              <Checkbox 
                id="evenAndOddNumbers" 
                checked={filters.evenAndOddNumbers}
                onCheckedChange={() => handleFilterChange('evenAndOddNumbers')}
                className="border-emerald-600 data-[state=checked]:bg-emerald-600"
              />
              <label htmlFor="evenAndOddNumbers" className="text-base cursor-pointer">Números Pares e Ímpares</label>
            </div>
            
            <div className="flex items-center space-x-3 hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-200">
              <Checkbox 
                id="largeSequence" 
                checked={filters.largeSequence}
                onCheckedChange={() => handleFilterChange('largeSequence')}
                className="border-emerald-600 data-[state=checked]:bg-emerald-600"
              />
              <label htmlFor="largeSequence" className="text-base cursor-pointer">Sequência grande de Saltos</label>
            </div>
          </div>
        </Card>

        {/* Right Panel - Results */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-emerald-100">
          <div className="space-y-6">
            {contests.map((contest, index) => (
              <div key={index} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-base font-medium text-emerald-800">Concurso:</div>
                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-2 px-4 rounded-lg text-center font-bold shadow-sm">
                    {contest.id}
                  </div>
                  
                  <div className="text-base font-medium text-emerald-800">Apuração:</div>
                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-2 px-4 rounded-lg text-center font-bold shadow-sm">
                    {contest.date}
                  </div>
                  
                  <div className="text-base font-medium text-emerald-800">Resultado:</div>
                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-2 px-4 rounded-lg text-center font-bold shadow-sm">
                    {contest.result}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-emerald-800">Dezenas sorteadas</h3>
                    {index === 0 && <Info className="h-5 w-5 text-emerald-600" />}
                  </div>
                  
                  <div className="flex justify-start gap-2 mb-4">
                    {contest.numbers.map((number, idx) => (
                      <div 
                        key={idx} 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center text-lg font-bold shadow-md"
                      >
                        {formatNumber(number)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {index === 0 && <Separator className="my-4 bg-emerald-200" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Panel - Saved Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-emerald-100">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800">Jogos Gerados</h2>
          
          <div className="space-y-4">
            {savedSets.length > 0 ? (
              savedSets.map((set, setIndex) => (
                <div key={setIndex} className="flex flex-wrap gap-2 items-center p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors duration-200">
                  {set.map((number, index) => (
                    <div 
                      key={index} 
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center text-lg font-bold shadow-sm"
                    >
                      {formatNumber(number)}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-12 h-12 p-0 rounded-full border-emerald-300 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                    onClick={() => handleDeleteSavedSet(setIndex)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum jogo salvo ainda. Gere números e clique em "Salvar".
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-emerald-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-800">Minhas coleções</h2>
            <Select defaultValue="teste">
              <SelectTrigger className="w-32 border-emerald-300 focus:ring-emerald-500">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teste">Teste</SelectItem>
                <SelectItem value="favoritos">Favoritos</SelectItem>
                <SelectItem value="recentes">Recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              Selecione uma coleção para visualizar os jogos salvos.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}