import { DnaSequence, Primer, SpecificityClass, CrossReactivityDetail } from '../types';

/**
 * Safe ID Generator for browser compatibility
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Parses a standard FASTA string.
 */
export const parseFasta = (content: string): DnaSequence[] => {
  const sequences: DnaSequence[] = [];
  const lines = content.split('\n');
  
  let currentHeader = '';
  let currentSeq = '';

  const commitSequence = () => {
    if (currentHeader && currentSeq) {
      sequences.push({
        id: generateId(),
        header: currentHeader,
        sequence: currentSeq.toUpperCase().replace(/[^ATGC-]/g, ''), 
        length: currentSeq.length
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) {
      commitSequence();
      currentHeader = trimmed.slice(1);
      currentSeq = '';
    } else {
      currentSeq += trimmed;
    }
  }
  commitSequence();
  return sequences;
};

export const calculateTm = (sequence: string): number => {
  const cleanSeq = sequence.replace(/-/g, '');
  const length = cleanSeq.length;
  if (length === 0) return 0;
  
  const matches = cleanSeq.match(/[GC]/g);
  const gcCount = matches ? matches.length : 0;
  return 64.9 + (41 * (gcCount - 16.4)) / length;
};

export const calculateGC = (sequence: string): number => {
  const cleanSeq = sequence.replace(/-/g, '');
  if (cleanSeq.length === 0) return 0;
  const matches = cleanSeq.match(/[GC]/g);
  const gcCount = matches ? matches.length : 0;
  return (gcCount / cleanSeq.length) * 100;
};

/**
 * Compares two strings of equal length.
 * Returns an array of indices where they differ.
 */
const getMismatchIndices = (seq1: string, seq2: string): number[] => {
    if (!seq1 || !seq2) return [];
    const indices: number[] = [];
    const len = Math.min(seq1.length, seq2.length);
    for (let i = 0; i < len; i++) {
        if (seq1[i] !== seq2[i]) {
            indices.push(i);
        }
    }
    return indices;
};

/**
 * Core Logic: "Deep Analysis" Engine V2.0
 * Scans the ENTIRE background sequence for off-targets.
 * Returns full cross-reactivity profiles for reporting.
 */
export const findUniquePrimers = (
  target: DnaSequence,
  allSequences: DnaSequence[],
  windowSize: number
): Primer[] => {
  const results: Primer[] = [];
  const backgroundSequences = allSequences.filter(s => s.id !== target.id);
  
  if (!target || !target.sequence) return [];

  // Iterate through the TARGET sequence
  for (let i = 0; i <= target.sequence.length - windowSize; i++) {
    const candidateWindow = target.sequence.slice(i, i + windowSize);
    
    // Constraint: Primer cannot contain gaps
    if (candidateWindow.includes('-')) continue;

    const crossReactivity: CrossReactivityDetail[] = [];
    let isUnique = true;

    // Optimization: If no background sequences, dummy data (rare case)
    if (backgroundSequences.length === 0) {
        // Treat as unique
    } else {
        
        // Check EVERY background allele
        for (const bgSeq of backgroundSequences) {
            
            // Optimization: Skip if background is too short
            if (bgSeq.sequence.length < windowSize) continue;

            // Scan the ENTIRE background allele to find the best match site
            let bestMatchInThisAllele = Infinity;
            let bestSeqInThisAllele = "";
            let bestIndicesInThisAllele: number[] = [];
            
            // Sliding window over the BACKGROUND allele
            for (let j = 0; j <= bgSeq.sequence.length - windowSize; j++) {
                const bgWindow = bgSeq.sequence.slice(j, j + windowSize);
                
                // Fast Hamming Distance Check
                let currentMismatches = 0;
                // Optimization: If we already exceed the best match found in this allele, stop counting
                for (let k = 0; k < windowSize; k++) {
                    if (candidateWindow[k] !== bgWindow[k]) {
                        currentMismatches++;
                        if (currentMismatches > bestMatchInThisAllele) break; 
                    }
                }

                if (currentMismatches < bestMatchInThisAllele) {
                    bestMatchInThisAllele = currentMismatches;
                    bestSeqInThisAllele = bgWindow;
                }

                if (bestMatchInThisAllele === 0) break; // Found exact match in this allele
            }

            // If we found an exact match in ANY background allele, this primer is invalid.
            if (bestMatchInThisAllele === 0) {
                isUnique = false;
                break; // Stop checking other alleles, this primer is dead.
            }

            // Calculate exact indices for the report
            bestIndicesInThisAllele = getMismatchIndices(candidateWindow, bestSeqInThisAllele);

            // Add to profile
            crossReactivity.push({
                alleleId: bgSeq.id,
                alleleHeader: bgSeq.header,
                mismatches: bestMatchInThisAllele,
                mismatchIndices: bestIndicesInThisAllele,
                sequence: bestSeqInThisAllele
            });
        }
    }

    if (isUnique) {
        // Find the global worst case from the profile
        // If backgroundSequences was empty, minMismatches is windowSize
        let globalMinMismatches = windowSize;
        let globalWorstSeq = "N".repeat(windowSize);
        let globalMismatchIndices: number[] = [];

        if (crossReactivity.length > 0) {
            // Sort by mismatches ascending (worst offenders first)
            crossReactivity.sort((a, b) => a.mismatches - b.mismatches);
            
            const worst = crossReactivity[0];
            globalMinMismatches = worst.mismatches;
            globalWorstSeq = worst.sequence;
            globalMismatchIndices = worst.mismatchIndices;
        }

        let specificityClass: SpecificityClass = 'None';
        
        // Rule of 3
        if (globalMinMismatches >= 3) {
            specificityClass = 'High';
        } 
        // SNP Rule: 1-2 mismatches. 
        else if (globalMinMismatches >= 1) {
             const has3PrimeMismatch = globalMismatchIndices.some(idx => idx >= windowSize - 5);
             if (has3PrimeMismatch) {
                 specificityClass = 'SNP';
             } else {
                 specificityClass = 'None'; // Mismatch is at 5' end
             }
        }

        const tm = calculateTm(candidateWindow);
        const gc = calculateGC(candidateWindow);

        if (tm >= 55 && tm <= 68 && specificityClass !== 'None') {
            results.push({
                id: `${target.id}_${i}`,
                sequence: candidateWindow,
                start: i + 1,
                end: i + windowSize,
                tm,
                gc,
                minMismatches: globalMinMismatches,
                mismatchIndices: globalMismatchIndices,
                worstOffTargetSeq: globalWorstSeq,
                specificityClass,
                score: (globalMinMismatches * 10) - (Math.abs(tm - 60)),
                crossReactivity // Store the full V2.0 profile
            });
        }
    }
  }

  return results.sort((a, b) => b.score - a.score);
};