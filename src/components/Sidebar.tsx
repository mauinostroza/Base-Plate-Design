import React from 'react';
import { BasePlate, BoltConfiguration, Loads, STEEL_GRADES, SteelProfile, UnitSystem, AnchorChair } from '../types';
import { ALL_PROFILES } from '../lib/profiles';

interface SidebarProps {
  plate: BasePlate;
  bolts: BoltConfiguration;
  loads: Loads;
  unitSystem: UnitSystem;
  columnProfile: SteelProfile;
  anchorChair: AnchorChair;
  updatePlate: (p: Partial<BasePlate>) => void;
  updateBolts: (b: Partial<BoltConfiguration>) => void;
  updateLoads: (l: Partial<Loads>) => void;
  setUnitSystem: (u: UnitSystem) => void;
  setColumnProfile: (p: SteelProfile) => void;
  setAnchorChair: (a: AnchorChair) => void;
  onOpenReport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  plate, bolts, loads, unitSystem, columnProfile, anchorChair,
  updatePlate, updateBolts, updateLoads, setUnitSystem, setColumnProfile, setAnchorChair,
  onOpenReport
}) => {
  const handleProfileChange = (profileName: string) => {
    if (profileName === "CUSTOM") {
        setColumnProfile({ ...columnProfile, name: "CUSTOM", standard: "CUSTOM" });
        return;
    }
    
    const profile = ALL_PROFILES.find(p => p.name === profileName);
    if (profile) {
        setColumnProfile(profile);
        updatePlate({ width: profile.b + 150, height: profile.h + 150 });
    }
  };

  const isCustom = columnProfile.standard === "CUSTOM";

  return (
    <aside className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shadow-sm">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Configuración Avanzada</h2>
        <select 
            value={unitSystem} 
            onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
            className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded"
        >
            <option value="METRIC">Metric (tonf, m)</option>
            <option value="IMPERIAL">Imperial (kip, ft)</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
        {/* Perfil & Placa */}
        <div className="space-y-4">
          <SectionLabel label="Sección de Columna" />
          <select 
            className="w-full border border-gray-200 rounded p-2 text-xs bg-white font-medium"
            value={columnProfile.name}
            onChange={(e) => handleProfileChange(e.target.value)}
          >
            <option value="CUSTOM">-- PERFIL PERSONALIZADO --</option>
            <optgroup label="Chilean (ICHA 2008)">
              {ALL_PROFILES.filter(p => p.standard === "CHILE").map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </optgroup>
            <optgroup label="AISC (North American)">
              {ALL_PROFILES.filter(p => p.standard === "AISC").map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </optgroup>
            <optgroup label="European (Eurocode)">
              {ALL_PROFILES.filter(p => p.standard === "EURO").map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </optgroup>
          </select>

          {isCustom && (
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-3">
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest text-center">Dimensiones</p>
                <div className="grid grid-cols-2 gap-2">
                    <Input label="h (mm)" value={columnProfile.h} onChange={(v) => setColumnProfile({ ...columnProfile, h: v })} />
                    <Input label="b (mm)" value={columnProfile.b} onChange={(v) => setColumnProfile({ ...columnProfile, b: v })} />
                </div>
            </div>
          )}

          <SectionLabel label="Placa Base" />
          <div className="grid grid-cols-2 gap-2">
            <Input label={`Ancho (${unitSystem === 'METRIC' ? 'mm' : 'in'})`} value={plate.width} onChange={(v) => updatePlate({ width: v })} min={100} />
            <Input label={`Largo (${unitSystem === 'METRIC' ? 'mm' : 'in'})`} value={plate.height} onChange={(v) => updatePlate({ height: v })} min={100} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label={`Espesor (${unitSystem === 'METRIC' ? 'mm' : 'in'})`} value={plate.thickness} onChange={(v) => updatePlate({ thickness: v })} min={5} />
            <div>
                <label className="text-[9px] text-gray-400 uppercase font-bold">Acero</label>
                <select 
                    className="w-full mt-1 border border-gray-200 rounded p-2 text-xs bg-white"
                    value={plate.material.name}
                    onChange={(e) => {
                        const grade = STEEL_GRADES.find(g => g.name === e.target.value);
                        if (grade) updatePlate({ material: grade });
                    }}
                >
                    {STEEL_GRADES.map(g => (
                        <option key={g.name} value={g.name}>{g.name}</option>
                    ))}
                </select>
            </div>
          </div>
        </div>

        {/* Pernos */}
        <div className="space-y-4">
          <SectionLabel label="Pernos de Anclaje" />
          <div className="p-3 bg-gray-50 rounded border border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <Input label="Cant. X" value={bolts.countX} onChange={(v) => updateBolts({ countX: v })} min={1} />
                <Input label="Cant. Y" value={bolts.countY} onChange={(v) => updateBolts({ countY: v })} min={1} />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <Input label={`S_x (mm)`} value={bolts.spacingX} onChange={(v) => updateBolts({ spacingX: v })} min={50} />
               <Input label={`S_y (mm)`} value={bolts.spacingY} onChange={(v) => updateBolts({ spacingY: v })} min={50} />
            </div>
          </div>
        </div>

        {/* Silla */}
        <div className="space-y-4">
          <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-between">
            Silla de Anclaje
            <input 
              type="checkbox" 
              checked={anchorChair.enabled} 
              onChange={(e) => setAnchorChair({ ...anchorChair, enabled: e.target.checked })}
              className="accent-blue-600 rounded cursor-pointer"
            />
          </label>
          
          {anchorChair.enabled && (
             <div className="p-3 bg-blue-50/30 rounded border border-blue-100 space-y-3">
                <div className="space-y-2">
                   <label className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Posición</label>
                   <select 
                    className="w-full border border-gray-200 rounded p-1.5 text-[10px] bg-white font-medium"
                    value={anchorChair.position}
                    onChange={(e) => setAnchorChair({ ...anchorChair, position: e.target.value as any })}
                   >
                     <option value="WING_FACES">Caras de Ala</option>
                     <option value="INTERIOR">Interior (Almas)</option>
                     <option value="FULL">Contorno Total</option>
                   </select>
                </div>
                <Input label="Altura (mm)" value={anchorChair.height} onChange={(v) => setAnchorChair({ ...anchorChair, height: v })} min={10} />
                <div className="grid grid-cols-2 gap-2">
                    <Input label="e (mm)" value={anchorChair.thickness} onChange={(v) => setAnchorChair({ ...anchorChair, thickness: v })} min={5} />
                    <Input label="Profundidad (mm)" value={anchorChair.depth} onChange={(v) => setAnchorChair({ ...anchorChair, depth: v })} min={20} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Ancho entre alas (mm)" value={anchorChair.width} onChange={(v) => setAnchorChair({ ...anchorChair, width: v })} min={30} />
                </div>
                <div className="text-[8px] text-blue-500/70 italic font-medium leading-tight border-t border-blue-100/50 pt-2 mt-1">
                  ✓ La silla incluye stiffeners integrados en cada perno de anclaje
                </div>
             </div>
          )}
        </div>

        {/* Botón Memoria */}
        <button 
          onClick={onOpenReport}
          className="w-full py-4 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
        >
          <span>MEMORIA TÉCNICA</span>
        </button>
      </div>
    </aside>
  );
};

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <label className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest border-l-2 border-blue-500 pl-2">{label}</label>
);

interface InputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, min }) => (
  <div>
    <label className="text-[9px] text-gray-400 uppercase font-bold tracking-tight mb-1 block">{label}</label>
    <input 
      type="number"
      className="w-full border border-gray-100 rounded p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono shadow-inner" 
      value={value}
      min={min}
      onChange={(e) => {
        const val = parseFloat(e.target.value) || 0;
        onChange(min !== undefined ? Math.max(min, val) : val);
      }}
    />
  </div>
);




