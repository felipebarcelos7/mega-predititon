export interface MatrixData {
  id: string;
  name: string;
  data: number[][];
  createdAt: Date;
  updatedAt: Date;
}

export const createEmptyMatrix = (rows: number, cols: number): number[][] => {
  return Array(rows).fill(null).map(() => Array(cols).fill(0));
};

export const generateRandomMatrix = (rows: number, cols: number, min: number, max: number): number[][] => {
  return Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => Math.floor(Math.random() * (max - min + 1)) + min)
  );
};

export const serializeMatrix = (matrix: number[][]): string => {
  return JSON.stringify(matrix);
};

export const deserializeMatrix = (data: string): number[][] => {
  return JSON.parse(data);
};

export const validateNumbers = (numbers: number[], min: number, max: number): boolean => {
  if (!Array.isArray(numbers)) return false;
  return numbers.every(num => num >= min && num <= max);
};

export const calculateFrequency = (matrices: number[][][]): Map<number, number> => {
  const frequency = new Map<number, number>();
  
  matrices.forEach(matrix => {
    matrix.forEach(row => {
      row.forEach(num => {
        frequency.set(num, (frequency.get(num) || 0) + 1);
      });
    });
  });
  
  return frequency;
};
