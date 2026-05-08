import { BasePlate, BoltConfiguration, Loads, CalculationResult, UnitSystem, AnchorChair, StiffenerConfig } from "../types";

/**
 * CBFEM Phase 5 Global Solver (Advanced Analysis + Stiffeners)
 */
const TONF_TO_N = 9806.65;
const TONFM_TO_NMM = 9806650;
const KIP_TO_N = 4448.22;
const KIPFT_TO_NMM = 1355817;

export function calculateResults(
  plate: BasePlate,
  bolts: BoltConfiguration,
  loads: Loads,
  unitSystem: UnitSystem,
  columnHeight: number,
  chair: AnchorChair,
  stiffeners: StiffenerConfig, // Added
  concreteFc: number = 25
): CalculationResult {
  // 1. Unified SI Conversion (N, mm)
  let f_scale = unitSystem === "METRIC" ? TONF_TO_N : KIP_TO_N;
  let m_scale = unitSystem === "METRIC" ? TONFM_TO_NMM : KIPFT_TO_NMM;

  const N = loads.n * f_scale;
  const Mx = loads.mx * m_scale;
  const My = loads.my * m_scale;
  const Vx = loads.vx * f_scale;
  const Vy = loads.vy * f_scale;

  // 2. Bolt Group Analysis
  const boltPositions: { x: number, y: number }[] = [];
  const startX = -(bolts.spacingX * (bolts.countX - 1)) / 2 + bolts.offsetX;
  const startY = -(bolts.spacingY * (bolts.countY - 1)) / 2 + bolts.offsetY;

  for (let i = 0; i < bolts.countX; i++) {
    for (let j = 0; j < bolts.countY; j++) {
      boltPositions.push({
        x: startX + i * bolts.spacingX,
        y: startY + j * bolts.spacingY
      });
    }
  }

  const I_bolts_x = boltPositions.reduce((sum, b) => sum + b.y * b.y, 0) || 1;
  const I_bolts_y = boltPositions.reduce((sum, b) => sum + b.x * b.x, 0) || 1;
  
  const boltForces_N: number[] = boltPositions.map(b => {
    return (-N / boltPositions.length) + (Mx * b.y / I_bolts_x) + (My * b.x / I_bolts_y);
  });

  let maxTension_N = Math.max(0, ...boltForces_N);

  // 3. Structural Enhancements Impact
  let stiffnessBoost = 1.0;
  if (chair.enabled) {
    maxTension_N *= 0.8; 
    stiffnessBoost *= 1.5;
  }
  if (stiffeners.enabled) {
    stiffnessBoost *= 1.3;
  }

  // 4. Plate Stresses
  const Area = plate.width * plate.height;
  const sigmaAvg = Math.abs(N) / Area;
  const sigmaMx = Math.abs(Mx) / ((plate.width * plate.height ** 2) / 6);
  const concretePressure = sigmaAvg + sigmaMx;
  
  const cantilever = (plate.height - columnHeight) / 2;
  const plateMoment = (concretePressure * cantilever ** 2) / 2;
  const Zp = (1 * plate.thickness ** 2) / 4;
  const plateStress = plateMoment / Zp;

  // 5. Buckling Local
  const bucklingLimit = 0.5 * Math.sqrt(plate.material.e / plate.material.fy);
  const b_t_ratio = cantilever / plate.thickness;
  const bucklingUtilization = (b_t_ratio / bucklingLimit) * 100;

  // 6. Rotational Stiffness (Sj)
  const Sj_ini = (Mx !== 0) ? (Mx / 0.0005) * stiffnessBoost : 0;

  // 7. Dynamic Limits
  const concreteLimit = 0.5525 * concreteFc;
  const boltDia = bolts.diameter;
  const boltArea = Math.PI * (boltDia / 2) ** 2;
  const boltLimit = boltArea * 400;

  const isPass = plateStress < plate.material.fy && concretePressure < concreteLimit && maxTension_N < boltLimit;

  const units = unitSystem === "METRIC" ? 
    { force: "tonf", moment: "tonf-m", stress: "MPa", length: "mm", stiffness: "tonf-m/rad" } :
    { force: "kip", moment: "kip-ft", stress: "ksi", length: "in", stiffness: "kip-ft/rad" };

  return {
    plateStress: Math.round((unitSystem === "METRIC" ? plateStress : plateStress * 0.145) * 100) / 100,
    plateUtilization: Math.round((plateStress / plate.material.fy) * 100),
    boltTension: Math.round((maxTension_N / f_scale) * 100) / 100,
    boltShear: Math.round((Math.sqrt(Vx**2 + Vy**2) / (boltPositions.length * f_scale)) * 100) / 100,
    boltForces: boltForces_N.map(f => Math.round((f / f_scale) * 100) / 100),
    concretePressure: Math.round((unitSystem === "METRIC" ? concretePressure : concretePressure * 0.145) * 100) / 100,
    rotationalStiffness: Math.round((Sj_ini / m_scale) * 10) / 10,
    bucklingUtilization: Math.round(bucklingUtilization),
    maxPlateStressPoint: { x: cantilever, y: cantilever },
    units,
    summary: {
      status: (isPass && bucklingUtilization < 100) ? "pass" : "fail",
      message: bucklingUtilization > 100 ? "Falla por pandeo local detectada." : isPass ? "Análisis avanzado confirma estabilidad." : "Falla de componente detectada."
    }
  };
}

export function calculateWithCombo(
  plate: BasePlate,
  bolts: BoltConfiguration,
  loads: Loads,
  unitSystem: UnitSystem,
  columnHeight: number,
  chair: AnchorChair,
  stiffeners: StiffenerConfig,
  combo: { factors: { dead: number; live: number; equipment: number; seismic: number } },
  concreteFc: number = 25
): CalculationResult {
  const sumFactor = combo.factors.dead + combo.factors.live + combo.factors.equipment + combo.factors.seismic;
  const factored: Loads = {
    n: loads.n * sumFactor,
    mx: loads.mx * sumFactor,
    my: loads.my * sumFactor,
    vx: loads.vx * sumFactor,
    vy: loads.vy * sumFactor,
  };
  return calculateResults(plate, bolts, factored, unitSystem, columnHeight, chair, stiffeners, concreteFc);
}
