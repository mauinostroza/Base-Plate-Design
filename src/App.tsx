import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThreeView } from './components/ThreeView';
import { ResultsPanel } from './components/ResultsPanel';
import { ReportView } from './components/ReportView';
import { BasePlate, BoltConfiguration, Loads, STEEL_GRADES, UnitSystem, SteelProfile, AnchorChair } from './types';
import { calculateResults } from './lib/solver';

export default function App() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("METRIC");
  
  const [columnProfile, setColumnProfile] = useState<SteelProfile>({
    name: "HN 30x40.5",
    standard: "CHILE",
    h: 300, b: 200, tf: 10, tw: 6, area: 5160
  });

  const [anchorChair, setAnchorChair] = useState<AnchorChair>({
    enabled: false,
    height: 150,
    thickness: 12,
    width: 80,
    position: "WING_FACES"
  });

  const [plate, setPlate] = useState<BasePlate>({
    width: 450,
    height: 450,
    thickness: 20,
    material: STEEL_GRADES[2] // A270ES
  });

  const [bolts, setBolts] = useState<BoltConfiguration>({
    diameter: 24,
    grade: "8.8",
    countX: 2,
    countY: 3,
    spacingX: 300,
    spacingY: 150,
    offsetX: 0,
    offsetY: 0,
    embedment: 350
  });

  const [loads, setLoads] = useState<Loads>({
    n: 1250.0,
    mx: 85.5,
    my: 0,
    vx: 15,
    vy: 0
  });

  const results = useMemo(() => 
    calculateResults(plate, bolts, loads, unitSystem, columnProfile.h, anchorChair), 
    [plate, bolts, loads, unitSystem, columnProfile.h, anchorChair]
  );

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Navbar Minimalist */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg leading-none shadow-sm transition-transform hover:scale-105 cursor-pointer">Σ</div>
          <h1 className="text-lg font-semibold tracking-tight">BaseForge Pro <span className="text-gray-400 font-normal">| {unitSystem === 'METRIC' ? 'Global Engineering' : 'US Standards'}</span></h1>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <nav className="flex bg-gray-100 p-1 rounded-md">
            <button className="px-5 py-1 bg-white rounded shadow-sm text-blue-600 font-bold transition-all">Dimensionamiento</button>
            <button className="px-5 py-1 text-gray-500 hover:text-gray-700">Verificación</button>
          </nav>
          <button 
            onClick={() => setIsReportOpen(true)}
            className="px-6 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95"
          >
            Memoria de Cálculo
          </button>
        </div>
      </header>

      {/* Main Structural Area */}
      <main className="flex-1 flex overflow-hidden">
        <Sidebar 
          plate={plate} 
          updatePlate={(p) => setPlate(prev => ({ ...prev, ...p }))}
          bolts={bolts}
          updateBolts={(b) => setBolts(prev => ({ ...prev, ...b }))}
          loads={loads}
          updateLoads={(l) => setLoads(prev => ({ ...prev, ...l }))}
          unitSystem={unitSystem}
          setUnitSystem={setUnitSystem}
          columnProfile={columnProfile}
          setColumnProfile={setColumnProfile}
          anchorChair={anchorChair}
          setAnchorChair={setAnchorChair}
          onOpenReport={() => setIsReportOpen(true)}
        />
        
        <section className="flex-1 flex flex-col relative bg-[#EDF1F5] p-6 lg:p-8">
           <ThreeView 
              plate={plate} 
              bolts={bolts} 
              concrete={{ fck: 25, width: 800, height: 800, depth: 1000 }}
              columnProfile={columnProfile}
              anchorChair={anchorChair}
              stressData={Math.min(results.plateUtilization / 100, 1)} 
           />
        </section>

        <ResultsPanel 
          results={results} 
          loads={loads} 
          updateLoads={(l) => setLoads(prev => ({ ...prev, ...l }))} 
        />
      </main>

      {/* Footer Minimalist */}
      <footer className="h-8 border-t border-gray-200 bg-white px-4 flex items-center justify-between text-[10px] text-gray-400 shrink-0">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${results.summary.status === 'pass' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Solver Status: <span className="text-gray-600 font-medium italic">CBFEM-LNR Analytical Kernel 2.1.0</span></span>
        </div>
        <div className="flex gap-6 font-medium">
          <span className="uppercase tracking-widest">Unidades: {results.units.force}, {results.units.moment}</span>
          <span className="uppercase tracking-widest text-blue-500 font-bold border-l pl-6 border-slate-200">ICHA 2008 / AISC / EC3</span>
        </div>
      </footer>

      {isReportOpen && (
        <ReportView 
          plate={plate} 
          bolts={bolts} 
          concrete={{ fck: 25, width: 800, height: 800, depth: 1000 }}
          loads={loads} 
          results={results} 
          columnProfile={columnProfile}
          anchorChair={anchorChair}
          onClose={() => setIsReportOpen(false)} 
        />
      )}
    </div>
  );
}
