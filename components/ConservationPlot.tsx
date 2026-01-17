import React from 'react';
import { Primer } from '../types';

interface ConservationPlotProps {
  seqLength: number;
  primers: Primer[];
  windowSize: number;
}

const ConservationPlot: React.FC<ConservationPlotProps> = ({ seqLength, primers, windowSize }) => {
  // Create a map of genomic position -> score
  // We initialize an array representing the genome.
  // Value 0 = Unsafe/No Primer. 1 = SNP. 3 = High Spec.
  const scoreMap = new Array(seqLength).fill(0);

  primers.forEach(p => {
    // For visualization, we mark the START position of the primer
    const idx = p.start - 1; 
    if (idx < seqLength) {
        const val = p.specificityClass === 'High' ? 3 : (p.specificityClass === 'SNP' ? 1 : 0);
        // Keep the highest score found at this index
        if (val > scoreMap[idx]) scoreMap[idx] = val;
    }
  });

  // Condense the plot if genome is huge (simple subsampling for visual fit)
  // For demo data (~600bp), we can render 1:1 or 1:2
  
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
      <h3 className="text-xs font-cyber text-slate-400 mb-2 uppercase tracking-wider">Genomic Safety Map</h3>
      <div className="relative h-12 w-full flex items-end gap-[1px] bg-slate-950/50 rounded overflow-hidden">
        {scoreMap.map((score, i) => {
            // Color logic
            let bgClass = 'bg-slate-800'; // Default unsafe
            let heightClass = 'h-1';
            
            if (score === 3) {
                bgClass = 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]';
                heightClass = 'h-full';
            } else if (score === 1) {
                bgClass = 'bg-yellow-500';
                heightClass = 'h-1/2';
            }

            return (
                <div 
                    key={i}
                    className={`flex-1 ${bgClass} ${heightClass} min-w-[2px] transition-all`}
                    title={`Pos ${i+1}: ${score === 3 ? 'High Specificity' : score === 1 ? 'SNP Specific' : 'Unsafe'}`}
                />
            );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-1">
          <span>1</span>
          <span>{Math.floor(seqLength / 2)}</span>
          <span>{seqLength} bp</span>
      </div>
    </div>
  );
};

export default ConservationPlot;