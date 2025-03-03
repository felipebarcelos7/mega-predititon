ate({
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

  // Format number to always have 2 digits
  const formatNumber = (num: number) => {
    return num === 0 ? '?' : num.toString().padStart(2, '0');
  };

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
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="evenAndOddNumbers2" 
                checked={filters.evenAndOddNumbers}
                onCheckedChange={() => handleFilterChange('evenAndOddNumbers')}
              />
              <label htmlFor="evenAndOddNumbers2" className="text-base">Números Pares e Ímpares</label>
            </div>
          </div>
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

      {/* Bottom Panel - Saved Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Dezenas não salvas</h2>
          
          <div className="space-y-4">
            {[...Array(2)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap gap-2">
                {[1, 27, 30, 41, 46, 57].map((number, index) => (
                  <div 
                    key={index} 
                    className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center text-lg font-bold"
                  >
                    {formatNumber(number)}
                  </div>
                ))}
                <Button variant="outline" className="w-12 h-12 p-0 rounded-full">
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="w-12 h-12 p-0 rounded-full">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Minhas coleções</h2>
            <Select defaultValue="teste">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teste">Teste</SelectItem>
                <SelectItem value="favoritos">Favoritos</SelectItem>
                <SelectItem value="recentes">Recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            {[...Array(2)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap gap-2">
                {[1, 27, 30, 41, 46, 57].map((number, index) => (
                  <div 
                    key={index} 
                    className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center text-lg font-bold"
                  >
                    {formatNumber(number)}
                  </div>
                ))}
                <Button variant="outline" className="w-12 h-12 p-0 rounded-full">
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="w-12 h-12 p-0 rounded-full">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}