'use client';

interface PatternReportProps {
  report: {
    frequencias: Array<{
      numero: string;
      frequencia: number;
    }>;
    pares: Array<{
      par: string;
      ocorrencias: number;
      peso: number;
    }>;
    movimentos: Array<{
      tipo: string;
      par: string;
      parReverso: string;
      posicao: string;
      peso: number;
    }>;
  } | null;
}

export default function PatternReport({ report }: PatternReportProps) {
  if (!report) return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Relatório de Padrões</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Frequência Individual dos Números</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {report.frequencias.map(({ numero, frequencia }, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Número {numero}:</span>
                <span className="ml-2">{frequencia}x</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Análise de Pares</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.pares
              .sort((a, b) => b.peso - a.peso)
              .slice(0, 10)
              .map(({ par, ocorrencias, peso }, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">Par {par}</div>
                  <div className="text-sm text-gray-600">
                    <span>{ocorrencias} ocorrências</span>
                    <span className="ml-2">(Peso: {peso})</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Movimentos Detectados</h3>
          <div className="space-y-3">
            {report.movimentos
              .filter((mov, index, self) =>
                index === self.findIndex(m => m.tipo === mov.tipo && m.par === mov.par)
              )
              .map((mov, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{mov.tipo.toUpperCase()}</div>
                  <div className="text-sm text-gray-600">
                    <div>Par: {mov.par} → {mov.parReverso}</div>
                    <div>Posição: {mov.posicao}</div>
                    <div>Peso: {mov.peso}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
