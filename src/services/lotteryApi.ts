interface LotteryResult {
  numero: number;
  dataApuracao: string;
  listaDezenas: string[];
  acumulado: boolean;
  valorAcumuladoProximoConcurso: number;
  valorEstimadoProximoConcurso: number;
  listaRateioPremio: {
    descricaoFaixa: string;
    faixa: number;
    numeroDeGanhadores: number;
    valorPremio: number;
  }[];
  localSorteio: string;
  nomeMunicipioUFSorteio: string;
}

const GAME_ENDPOINTS = {
  'mega-sena': 'megasena',
  'milionaria': 'milionaria',
  'trevo': 'trevo'
};

export async function getLotteryResult(concursoNumber?: number, gameType: string = 'mega-sena'): Promise<LotteryResult> {
  const game = GAME_ENDPOINTS[gameType] || GAME_ENDPOINTS['mega-sena'];
  const endpoint = concursoNumber
    ? `https://servicebus2.caixa.gov.br/portaldeloterias/api/${game}/${concursoNumber}`
    : `https://servicebus2.caixa.gov.br/portaldeloterias/api/${game}/`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${gameType} lottery data (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${gameType} lottery data:`, error);
    throw error;
  }
}
