import React from 'react';
import { CalculationResult, Loads } from '../types';

interface ResultsPanelProps {
  results: CalculationResult;
  loads: Loads;
  updateLoads: (l: Partial<Loads>) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, loads, updateLoads }) => {
  const isPass = results.summary.status === 'pass';

  return (
    <aside className="w-80 border-l border-gray-200 bg-white shrink-0 flex flex-col">
      <SectionHeader title="Solicitaciones y Resultados" />
      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Cargas de Diseño</h3>
            <div className="grid grid-cols-2 gap-2">
              <LoadInput label={`N (${results.units.force})`} value={loads.n} onChange={(v) => updateLoads({ n: v })} />
              <LoadInput label={`Mx (${results.units.moment})`} value={loads.mx} onChange={(v) => updateLoads({ mx: v })} />
              <LoadInput label={`My (${results.units.moment})`} value={loads.my} onChange={(v) => updateLoads({ my: v })} />
              <LoadInput label={`Vx (${results.units.force})`} value={loads.vx} onChange={(v) => updateLoads({ vx: v })} />
              <LoadInput label={`Vy (${results.units.force})`} value={loads.vy} onChange={(v) => updateLoads({ vy: v })} />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Análisis de Capacidad</h3>
            <MetricBar label="Placa Base (Esfuerzo)" utilization={results.plateUtilization} />
            <MetricBar 
              label="Aplastamiento Hormigón" 
              utilization={(results.concretePressure / (results.units.stress === 'MPa' ? 18 : 2.6)) * 100} 
            />
            <MetricBar label="Pandeo Local Placa" utilization={results.bucklingUtilization} />
            
            <div className="pt-4 border-t border-gray-100">
               <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
                  <span>Rigidez Rotacional (Sj)</span>
                  <span className="text-blue-600 font-mono italic">{results.rotationalStiffness} {results.units.stiffness}</span>
               </div>
               <p className="text-[9px] text-gray-400 leading-tight mt-1 opacity-70">Clasificación: {(results.rotationalStiffness > 20000) ? 'Rígida' : 'Semi-Rígida'}</p>
            </div>
          </div>
        </div>

        {!isPass && (
          <div className="mt-auto p-4 bg-red-50 border border-red-100 rounded-lg animate-pulse">
            <div className="flex gap-2">
              <div className="text-red-600 font-bold text-sm">⚠️</div>
              <div className="text-[11px] text-red-800 font-medium leading-relaxed">
                {results.summary.message}. Aumentar dimensiones de la placa o calidad del concreto.
              </div>
            </div>
          </div>
        )}
        
        {isPass && (
            <div className="mt-auto p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex gap-2">
                    <div className="text-green-600 font-bold text-sm">✓</div>
                    <div className="text-[11px] text-green-800 font-medium leading-relaxed">
                        Dimensionamiento óptimo. Todas las verificaciones cumplen normativa.
                    </div>
                </div>
            </div>
        )}
      </div>
    </aside>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-4 border-b border-gray-100 bg-gray-50">
    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</h2>
  </div>
);

const LoadInput: React.FC<{ label: string, value: number, onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div className="p-2 bg-gray-50 border border-gray-100 rounded">
    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{label}</div>
    <input 
      type="number" 
      className="w-full text-sm font-mono bg-transparent outline-none focus:text-blue-600"
      value={value} 
      onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))} 
    />
  </div>
);

const MetricBar: React.FC<{ label: string, utilization: number }> = ({ label, utilization }) => {
  const colorClass = utilization > 95 ? 'bg-red-500' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500';
  const textColorClass = utilization > 95 ? 'text-red-600' : utilization > 80 ? 'text-yellow-600' : 'text-green-600';
  
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1 font-medium text-gray-600">
        <span>{label}</span>
        <span className={textColorClass}>{Math.round(utilization)}%</span>
      </div>
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-500 ${colorClass}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
      </div>
    </div>
  );
};
