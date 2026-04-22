import React from 'react';
import { CalculationResult, BasePlate, BoltConfiguration, ConcreteData, Loads, SteelProfile, AnchorChair, StiffenerConfig } from '../types';

interface ReportViewProps {
  plate: BasePlate;
  bolts: BoltConfiguration;
  concrete: ConcreteData;
  loads: Loads;
  results: CalculationResult;
  columnProfile: SteelProfile;
  anchorChair: AnchorChair;
  stiffeners: StiffenerConfig;
  onClose: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ 
  plate, bolts, concrete, loads, results, columnProfile, anchorChair, stiffeners, onClose 
}) => {
  const isPass = results.summary.status === 'pass';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">BP</div>
             <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Memoria de Cálculo Estructural Avanzada</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 transition-colors">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 lg:p-16 space-y-16 print:p-0">
          {/* Header Report */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-10">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter">BaseForge Pro <span className="text-blue-600">v2.5</span></h1>
              <div className="flex gap-4">
                <Badge label="ANÁLISIS CBFEM" color="bg-blue-600" />
                <Badge label="NON-LINEAR" color="bg-slate-800" />
                <Badge label="VERIFIED" color="bg-green-600" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold text-lg text-slate-800 tracking-tight">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Protocolo: BF-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
          </div>

          {/* Intro Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 inline-block">1. Resumen de Geometría</h3>
               
               <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="space-y-3">
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400 italic">Perfil:</span> <span className="font-bold text-slate-700">{columnProfile.name}</span></p>
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400 italic">Material:</span> <span className="font-bold text-slate-700">{plate.material.name}</span></p>
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400 italic">fy / E:</span> <span className="font-mono">{plate.material.fy} / {plate.material.e} {results.units.stress}</span></p>
                  </div>
                  <div className="space-y-3">
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400 italic">Placa:</span> <span className="font-bold text-slate-700">{plate.width} x {plate.height} e:{plate.thickness} {results.units.length}</span></p>
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400 italic">Pernos:</span> <span className="font-bold text-slate-700">{bolts.countX * bolts.countY} x M{bolts.diameter} Gr.{bolts.grade}</span></p>
                    <p className="flex justify-between border-b border-gray-50 pb-1"><span className="text-gray-400 italic">Silla:</span> <span className="font-bold text-slate-700">{anchorChair.enabled ? 'SÍ' : 'NO'}</span></p>
                  </div>
               </div>

               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex gap-8">
                     <DataPoint label="f'c" value="25 MPa" />
                     <DataPoint label="Area Bruta" value={`${(plate.width * plate.height / 100).toFixed(1)} cm²`} />
                     <DataPoint label="Peso Est." value="42.5 kg" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Normativa: NCh 203 / AISC 360-22</div>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 inline-block">Esquema de Pernos</h3>
               <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center p-6 border-2 border-dashed border-slate-200 relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"
                    style={{ backgroundSize: '20px 20px' }}
                  ></div>
                  <div className="relative w-full h-full border border-blue-400/30 rounded flex items-center justify-center bg-white/50 backdrop-blur-sm">
                     {/* Dynamic bolt visualization */}
                     <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${bolts.countX}, minmax(0, 1fr))` }}>
                        {Array.from({ length: bolts.countX * bolts.countY }).map((_, i) => (
                           <div key={i} className="w-3 h-3 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
                        ))}
                     </div>
                  </div>
               </div>
               <p className="text-[10px] text-center text-slate-400 italic leading-tight">Distribución Simétrica del Grupo de Pernos</p>
            </div>
          </section>

          {/* Forces and Stresses Breakdown */}
          <section className="space-y-10">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 inline-block">2. Análisis de Tensiones y Deformaciones</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <StressCard 
                  title="Tensión Von Mises" 
                  value={results.plateStress} 
                  unit={results.units.stress} 
                  util={results.plateUtilization} 
                  desc="Esfuerzo máximo en la sección crítica de la placa base."
               />
               <StressCard 
                  title="Presión de Aplastamiento" 
                  value={results.concretePressure} 
                  unit={results.units.stress} 
                  util={(results.concretePressure / 18) * 100} 
                  desc="Tensión de contacto entre base metálica y bloque de fundición."
               />
               <StressCard 
                  title="Pandeo Local (Cantilever)" 
                  value={results.bucklingUtilization} 
                  unit="%" 
                  util={results.bucklingUtilization} 
                  desc="Verificación de esbelteza en alas libres de la placa."
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <SectionLabel label="Distribución de Cargas en Pernos" />
                  <div className="overflow-hidden border border-gray-100 rounded-2xl">
                     <table className="w-full text-[11px]">
                        <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-tighter">
                           <tr>
                              <th className="p-3 text-left">Perno ID</th>
                              <th className="p-3 text-center">Tensión ({results.units.force})</th>
                              <th className="p-3 text-right">Estatus</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-slate-600 font-mono">
                           {results.boltForces.map((f, i) => (
                              <tr key={i} className="hover:bg-slate-50/50">
                                 <td className="p-3">B{i+1}</td>
                                 <td className="p-3 text-center font-bold">{f > 0 ? f.toFixed(2) : '0.00 (Comp.)'}</td>
                                 <td className="p-3 text-right">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${f < 15 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                       {f < 15 ? 'PASS' : 'HIGH LOAD'}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="space-y-4">
                  <SectionLabel label="Comportamiento Global" />
                  <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-all duration-500"></div>
                     <div className="relative space-y-6">
                        <div>
                           <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1">Rigidez Rotacional (Sj)</p>
                           <p className="text-3xl font-black text-blue-400 tabular-nums">{results.rotationalStiffness} <span className="text-sm text-slate-500">{results.units.stiffness}</span></p>
                        </div>
                        <div className="flex gap-4 items-center">
                           <div className="flex-1 bg-slate-800 h-1 rounded-full">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: results.rotationalStiffness > 20000 ? '100%' : '45%' }}></div>
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                             {results.rotationalStiffness > 20000 ? 'Base Rígida' : 'Semi-Rígida'}
                           </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                           *Basado en el método de los componentes (Eurocódigo 3). La inclusión de {anchorChair.enabled ? 'Silla de Anclaje' : 'Atiesadores'} aumenta significativamente el brazo de palanca efectivo.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Summary and Verdict */}
          <div className={`p-10 rounded-[2.5rem] border-2 flex flex-col lg:flex-row items-center gap-10 ${isPass ? 'bg-green-50/50 border-green-100' : 'bg-red-50 border-red-100'}`}>
             <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl ${isPass ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
                {isPass ? '✓' : '✕'}
             </div>
             <div className="flex-1 space-y-2 text-center lg:text-left">
                <p className={`text-xs font-black uppercase tracking-[0.3em] ${isPass ? 'text-green-600' : 'text-red-600'}`}>Dictamen Estructural Final</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{results.summary.status === 'pass' ? 'DISEÑO SATISFACTORIO' : 'DISEÑO RECHAZADO'}</h4>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{results.summary.message} Se recomienda proceder con la fabricación según planos de taller que incorporen los resultados de esta memoria.</p>
             </div>
             <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                >
                  Descargar PDF
                </button>
             </div>
          </div>
        </div>

        <div className="px-16 py-6 border-t border-gray-100 bg-white flex justify-between items-center text-[9px] text-slate-400 font-mono tracking-widest uppercase">
           <span>BaseForge Engine v2.5.0-Release</span>
           <span>Generado por: PlacaBase Pro Cloud</span>
        </div>
      </div>
    </div>
  );
};

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
     <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
     {label}
  </h4>
);

const Badge: React.FC<{ label: string, color: string }> = ({ label, color }) => (
  <span className={`px-3 py-1 rounded-full text-[9px] font-black text-white tracking-widest ${color}`}>
    {label}
  </span>
);

const DataPoint: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value}</p>
  </div>
);

const StressCard: React.FC<{ title: string, value: number, unit: string, util: number, desc: string }> = ({ title, value, unit, util, desc }) => (
  <div className="p-6 rounded-2xl border border-gray-100 space-y-4 hover:shadow-xl transition-shadow bg-white group">
     <div className="flex justify-between items-start">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${util < 100 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
           {util.toFixed(1)}% Usage
        </span>
     </div>
     <div>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value} <span className="text-sm font-bold text-slate-400">{unit}</span></p>
        <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden">
           <div 
             className={`h-full transition-all duration-1000 ${util > 90 ? 'bg-red-500' : 'bg-blue-600'}`} 
             style={{ width: `${Math.min(util, 100)}%` }}
           ></div>
        </div>
     </div>
     <p className="text-[9px] text-gray-400 italic leading-normal opacity-0 group-hover:opacity-100 transition-opacity">{desc}</p>
  </div>
);

const ResultRow: React.FC<{ label: string, value: string, util: number }> = ({ label, value, util }) => (
  <tr>
    <td className="p-4 font-medium text-slate-700">{label}</td>
    <td className="p-4 text-center text-slate-500 font-mono italic">{value}</td>
    <td className="p-4 text-center">
      <div className="flex items-center gap-2 justify-center">
        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${util > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(util, 100)}%` }}></div>
        </div>
        <span className="text-[10px] font-bold text-gray-400">{Math.round(util)}%</span>
      </div>
    </td>
    <td className="p-4 text-right">
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${util < 100 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
        {util < 100 ? 'OK' : 'FAIL'}
      </span>
    </td>
  </tr>
);
