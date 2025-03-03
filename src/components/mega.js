/**
 * mega.js - Funções utilitárias para geração e manipulação de números da MegaSena
 */

/**
 * Gera 6 números aleatórios únicos entre 1 e 60
 * @returns {number[]} Array com 6 números ordenados
 */
export const generateRandomNumbers = () => {
  const numbers = [];
  while (numbers.length < 6) {
    const randomNum = Math.floor(Math.random() * 60) + 1;
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum);
    }
  }
  return numbers.sort((a, b) => a - b);
};

/**
 * Verifica se um número é primo
 * @param {number} num - Número a ser verificado
 * @returns {boolean} - Verdadeiro se o número for primo
 */
export const isPrime = (num) => {
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

/**
 * Gera números com base nos filtros selecionados
 * @param {Object} filters - Objeto com os filtros selecionados
 * @returns {number[]} - Array com 6 números que atendem aos filtros
 */
export const generateFilteredNumbers = (filters) => {
  let numbers = [];
  let attempts = 0;
  const maxAttempts = 1000; // Evita loop infinito
  
  while (numbers.length < 6 && attempts < maxAttempts) {
    attempts++;
    const randomNum = Math.floor(Math.random() * 60) + 1;
    
    if (numbers.includes(randomNum)) continue;
    
    // Aplica filtros
    if (filters.primeNumbers && !isPrime(randomNum)) continue;
    if (filters.evenNumbers && randomNum % 2 !== 0) continue;
    if (filters.oddNumbers && randomNum % 2 === 0) continue;
    
    // Verifica se já temos números suficientes para aplicar o filtro de sequência
    if (filters.largeSequence && numbers.length > 0) {
      const lastNum = numbers[numbers.length - 1];
      if (Math.abs(randomNum - lastNum) > 15) continue; // Evita saltos muito grandes
    }
    
    numbers.push(randomNum);
  }
  
  // Se não conseguiu gerar 6 números com os filtros, gera aleatoriamente
  if (numbers.length < 6) {
    return generateRandomNumbers();
  }
  
  return numbers.sort((a, b) => a - b);
};

/**
 * Verifica a distribuição de números pares e ímpares
 * @param {number[]} numbers - Array de números
 * @returns {Object} - Objeto com contagem de pares e ímpares
 */
export const checkEvenOddDistribution = (numbers) => {
  const even = numbers.filter(num => num % 2 === 0).length;
  const odd = numbers.length - even;
  return { even, odd };
};

/**
 * Calcula a soma dos números
 * @param {number[]} numbers - Array de números
 * @returns {number} - Soma dos números
 */
export const calculateSum = (numbers) => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

/**
 * Verifica se os números estão bem distribuídos nas dezenas
 * @param {number[]} numbers - Array de números
 * @returns {Object} - Distribuição por dezenas
 */
export const checkDecadeDistribution = (numbers) => {
  const distribution = {
    '1-10': 0,
    '11-20': 0,
    '21-30': 0,
    '31-40': 0,
    '41-50': 0,
    '51-60': 0
  };
  
  numbers.forEach(num => {
    if (num >= 1 && num <= 10) distribution['1-10']++;
    else if (num >= 11 && num <= 20) distribution['11-20']++;
    else if (num >= 21 && num <= 30) distribution['21-30']++;
    else if (num >= 31 && num <= 40) distribution['31-40']++;
    else if (num >= 41 && num <= 50) distribution['41-50']++;
    else if (num >= 51 && num <= 60) distribution['51-60']++;
  });
  
  return distribution;
};

/**
 * Formata um número para sempre ter 2 dígitos
 * @param {number} num - Número a ser formatado
 * @returns {string} - Número formatado
 */
export const formatNumber = (num) => {
  return num === 0 ? '?' : num.toString().padStart(2, '0');
};

/**
 * Verifica se um conjunto de números já foi sorteado anteriormente
 * @param {number[]} numbers - Array de números
 * @param {Array} contests - Array de concursos anteriores
 * @returns {boolean} - Verdadeiro se o conjunto já foi sorteado
 */
export const checkIfAlreadyDrawn = (numbers, contests) => {
  return contests.some(contest => {
    const sortedContestNumbers = [...contest.numbers].sort((a, b) => a - b);
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    return sortedContestNumbers.every((num, index) => num === sortedNumbers[index]);
  });
};

/**
 * Gera uma matriz de frequência dos números da MegaSena
 * @param {Array} contests - Array de concursos anteriores
 * @returns {Array} - Matriz de frequência
 */
export const generateFrequencyMatrix = (contests) => {
  const frequencyMatrix = Array(60).fill(0);
  
  contests.forEach(contest => {
    contest.numbers.forEach(num => {
      if (num > 0 && num <= 60) {
        frequencyMatrix[num - 1]++;
      }
    });
  });
  
  return frequencyMatrix;
};

/**
 * Gera números com base na frequência histórica
 * @param {Array} frequencyMatrix - Matriz de frequência
 * @param {string} strategy - Estratégia ('hot', 'cold', 'balanced')
 * @returns {number[]} - Array com 6 números
 */
export const generateByFrequency = (frequencyMatrix, strategy) => {
  // Cria uma cópia da matriz de frequência com índices
  const numbersWithFrequency = frequencyMatrix.map((freq, index) => ({
    number: index + 1,
    frequency: freq
  }));
  
  // Ordena com base na estratégia
  if (strategy === 'hot') {
    // Números mais frequentes
    numbersWithFrequency.sort((a, b) => b.frequency - a.frequency);
  } else if (strategy === 'cold') {
    // Números menos frequentes
    numbersWithFrequency.sort((a, b) => a.frequency - b.frequency);
  } else {
    // Estratégia balanceada - mistura números quentes e frios
    const hot = numbersWithFrequency.slice().sort((a, b) => b.frequency - a.frequency).slice(0, 30);
    const cold = numbersWithFrequency.slice().sort((a, b) => a.frequency - b.frequency).slice(0, 30);
    
    // Seleciona 3 de cada
    const selected = [];
    for (let i = 0; i < 3; i++) {
      const randomHotIndex = Math.floor(Math.random() * hot.length);
      selected.push(hot[randomHotIndex].number);
      hot.splice(randomHotIndex, 1);
      
      const randomColdIndex = Math.floor(Math.random() * cold.length);
      selected.push(cold[randomColdIndex].number);
      cold.splice(randomColdIndex, 1);
    }
    
    return selected.sort((a, b) => a - b);
  }
  
  // Seleciona os 6 primeiros números
  return numbersWithFrequency.slice(0, 6).map(item => item.number).sort((a, b) => a - b);
};
