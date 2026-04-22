
export type ProfileStandard = "AISC" | "EURO" | "CHILE" | "CUSTOM";
export type UnitSystem = "METRIC" | "IMPERIAL";

export interface SteelProfile {
  name: string;
  standard: ProfileStandard;
  h: number; // Height (mm or in)
  b: number; // Width (mm or in)
  tf: number; // Flange thickness (mm or in)
  tw: number; // Web thickness (mm or in)
  area: number; 
}

export interface BasePlate {
  width: number;
  height: number;
  thickness: number;
  material: SteelGrade;
}

export interface SteelGrade {
  name: string;
  fy: number; // MPa or ksi
  fu: number; 
  e: number;  
  standard: string;
}

export interface BoltConfiguration {
  diameter: number;
  grade: string;
  countX: number;
  countY: number;
  spacingX: number;
  spacingY: number;
  offsetX: number; 
  offsetY: number;
  embedment: number;
}

export interface Loads {
  n: number;  
  mx: number; 
  my: number; 
  vx: number; 
  vy: number; 
}

export type AnchorChairPosition = "WING_FACES" | "INTERIOR" | "FULL";
export type StiffenerPosition = "OUTER" | "INNER" | "FACES";

export interface AnchorChair {
  enabled: boolean;
  height: number; 
  thickness: number; 
  width: number;
  position: AnchorChairPosition; // New
}

export interface StiffenerConfig {
  enabled: boolean;
  count: number;
  thickness: number;
  height: number;
  position: StiffenerPosition;
}

export interface CalculationResult {
  plateStress: number; 
  plateUtilization: number;
  boltTension: number; 
  boltShear: number;   
  concretePressure: number; 
  rotationalStiffness: number; 
  bucklingUtilization: number;
  boltForces: number[]; // Individual bolt forces
  maxPlateStressPoint: { x: number, y: number }; // For report
  units: {
    force: string;
    moment: string;
    stress: string;
    length: string;
    stiffness: string;
  };
  summary: {
    status: "pass" | "fail" | "warning";
    message: string;
  };
}

export const STEEL_GRADES: SteelGrade[] = [
  { name: "A36", fy: 250, fu: 400, e: 200000, standard: "ASTM" },
  { name: "S355", fy: 355, fu: 510, e: 210000, standard: "Euro" },
  { name: "A270ES", fy: 270, fu: 420, e: 210000, standard: "NCh 203" },
  { name: "A345ES", fy: 345, fu: 480, e: 210000, standard: "NCh 203" },
  { name: "Gr.50", fy: 345, fu: 450, e: 200000, standard: "AISC" },
];
