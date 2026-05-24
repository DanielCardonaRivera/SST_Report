export interface Report {
  id: number;
  fecha: string;
  sede: string;
  planta: string;
  riesgo: string;
  nivel: string;
  descripcion: string;
  accion: string;
  reportador: string;
  cargo: string;
  ubicacion: string;
  estado: string;
  created_at?: string;
}

export interface KpiData {
  total: number;
  abiertos: number;
  IF: number;
  IS: number;
  ILI: number;
}

export interface TendenciaData {
  meses: string[];
  abiertos: number[];
  cerrados: number[];
}

export interface SstData {
  reportes: Report[];
  kpis: KpiData;
  tendencia: TendenciaData;
  total: number;
}

export interface SstOptions {
  sedes: { value: string; label: string }[];
  plantas: string[];
  riesgos: string[];
  estados: string[];
  niveles: string[];
}

export interface FilterState {
  sede: string;
  planta: string;
  riesgo: string;
  estado: string;
  desde: string;
  hasta: string;
}

export interface NewReportForm {
  fecha: string;
  sede: string;
  planta: string;
  riesgo: string;
  nivel: string;
  descripcion: string;
  accion: string;
  reportador: string;
  cargo: string;
  ubicacion: string;
}
