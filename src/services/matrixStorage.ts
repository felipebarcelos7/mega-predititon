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

const STORAGE_KEY = 'matrix_lotto_state';

export function saveMatrixState(state: MatrixState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving matrix state:', error);
  }
}

export function loadMatrixState(): MatrixState | null {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Error loading matrix state:', error);
    return null;
  }
}

export function clearMatrixState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing matrix state:', error);
  }
}