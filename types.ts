export interface DnaSequence {
  id: string;
  header: string;
  sequence: string;
  length: number;
}

export type SpecificityClass = 'High' | 'SNP' | 'None';

export interface CrossReactivityDetail {
  alleleId: string;
  alleleHeader: string;
  mismatches: number;
  mismatchIndices: number[]; // 0-based relative to window
  sequence: string; // The best matching sequence found in this allele
}

export interface Primer {
  id: string;
  sequence: string;
  start: number; // 0-indexed position (relative to gene start)
  end: number;
  tm: number; // Melting Temperature
  gc: number; // GC Content percentage
  minMismatches: number; // The lowest hamming distance found (Worst case)
  mismatchIndices: number[]; // Relative indices (0-20) where mismatches occur
  worstOffTargetSeq: string; // The sequence of the background allele that matched best
  specificityClass: SpecificityClass;
  score: number; // Composite score
  crossReactivity: CrossReactivityDetail[]; // V2.0: Full profile against all alleles
}

export interface AnalysisResult {
  targetId: string;
  primers: Primer[];
  timestamp: number;
}