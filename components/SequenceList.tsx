import React from 'react';
import { DnaSequence } from '../types';
import { Target, AlignLeft, GripVertical, AlertCircle } from 'lucide-react';

interface SequenceListProps {
  sequences: DnaSequence[];
  targetId: string | null;
  onSelectTarget: (id: string) => void;
}

const SequenceList: React.FC<SequenceListProps> = ({ sequences, targetId, onSelectTarget }) => {
  if (sequences.length === 0) return null;

  // Find the target sequence object for comparison
  const targetSeq = sequences.find(s => s.id === targetId);
  const maxLength = Math.max(...sequences.map(s => s.length));

  // If we have more than 10 sequences, we limit the height and scroll vertically
  const containerHeight = sequences.length > 12 ? 'h-[500px]' : 'h-auto';

  return (
    <div className="w-full max-w-7xl mx-auto mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-cyber text-slate-200 tracking-wide">
            DIFFERENCE VIEWER <span className="text-slate-500 text-sm font-mono">// {sequences.length} ALLELES</span>
          </h2>
        </div>
        {!targetId ? (
             <div className="flex items-center gap-2 text-yellow-500 bg-yellow-950/30 px-3 py-1 rounded-full border border-yellow-500/30 animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-mono font-bold">SELECT TARGET ALLELE TO BEGIN</span>
             </div>
        ) : (
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase">
                <div className="flex items-center gap-1"><span className="text-slate-600 font-bold">.</span> Conserved</div>
                <div className="flex items-center gap-1"><span className="text-pink-500 font-bold">A/T/C/G</span> Mismatch (SNP)</div>
            </div>
        )}
      </div>
      
      {/* Browser Container */}
      <div className={`w-full bg-slate-950 border border-slate-800 rounded-xl shadow-2xl relative flex flex-col ${containerHeight}`}>
        
        {/* Sticky Header: Ruler */}
        <div className="bg-slate-900 border-b border-slate-800 shrink-0 overflow-hidden relative z-20">
             <div className="w-full overflow-hidden">
                <div className="flex pl-44 py-2 font-mono text-[10px] text-cyan-700 select-none whitespace-nowrap">
                    {Array.from({ length: Math.ceil(maxLength / 10) }).map((_, i) => (
                        <span key={i} style={{ width: '10ch' }} className="border-l border-slate-800 pl-1 inline-block">
                            {(i * 10) + 1}
                        </span>
                    ))}
                </div>
             </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-[#050b1d]">
          <div className="inline-block min-w-full p-4">
            
            {/* If a target is selected, PIN IT TO THE TOP visually in the list (or just highlight it) */}
            {/* For this specific requirement, we render the list normally, but handle visuals */}
            
            <div className="flex flex-col gap-[2px]">
              {sequences.map((seq) => {
                const isTarget = targetId === seq.id;
                
                return (
                  <div 
                    key={seq.id}
                    onClick={() => onSelectTarget(seq.id)}
                    className={`
                      flex items-center h-8 transition-all duration-100 cursor-pointer rounded
                      ${isTarget 
                        ? 'bg-cyan-900/30 border border-cyan-500/50 sticky top-0 z-10 backdrop-blur-sm shadow-lg mb-4' 
                        : 'hover:bg-slate-900 border border-transparent hover:border-slate-800 opacity-80 hover:opacity-100'
                      }
                    `}
                  >
                    {/* ID Column */}
                    <div className={`w-40 flex-shrink-0 px-2 flex items-center justify-between border-r ${isTarget ? 'border-cyan-700' : 'border-slate-800'} mr-4 bg-inherit`}>
                      <div className="flex items-center gap-2 overflow-hidden">
                          {isTarget && <Target className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
                          <span className={`text-[10px] font-mono truncate w-28 ${isTarget ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                            {seq.header}
                          </span>
                      </div>
                    </div>

                    {/* Sequence Visualization */}
                    <div className="font-mono text-xs tracking-[0.2em] whitespace-nowrap flex items-center select-none">
                      {seq.sequence.split('').map((base, idx) => {
                        
                        let renderChar = base;
                        let className = "text-slate-600"; 

                        if (targetId) {
                           if (isTarget) {
                               // Target Row: Show full sequence in Cyan
                               className = "text-cyan-200 font-bold";
                           } else if (targetSeq && targetSeq.sequence[idx] === base) {
                               // Match: Show Dot
                               renderChar = ".";
                               className = "text-slate-700 font-light"; 
                           } else {
                               // Mismatch: Show Base in Pink/Red
                               className = "text-pink-500 font-bold drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]";
                           }
                        } else {
                            // No Target Selected: Greyed out view
                             className = "text-slate-700";
                        }

                        return (
                          <span key={idx} className={`inline-block w-[1ch] text-center ${className}`}>
                            {renderChar}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceList;