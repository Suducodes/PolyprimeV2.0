import React from 'react';
import { Primer } from '../types';
import { FlaskConical, Thermometer, Hash, Ban, Trophy, Fingerprint, Eye, FileText, Printer } from 'lucide-react';

interface PrimerResultsProps {
  primers: Primer[];
  isAnalyzing: boolean;
}

const PrimerResults: React.FC<PrimerResultsProps> = ({ primers, isAnalyzing }) => {
  
  const generatePDFReport = () => {
    if (primers.length === 0) return;

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        alert("Please allow popups to generate the report.");
        return;
    }

    const dateStr = new Date().toLocaleString();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PolyPrime Report - ${dateStr}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; padding: 40px; max-width: 1000px; mx-auto; }
          h1 { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 5px; }
          .meta { color: #555; font-size: 0.9em; margin-bottom: 30px; }
          .primer-block { border: 1px solid #ccc; padding: 20px; margin-bottom: 30px; page-break-inside: avoid; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          .primer-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .seq { font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.2em; letter-spacing: 1px; }
          .stats { font-size: 0.9em; color: #444; margin-bottom: 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .stat-box { background: #f9f9f9; padding: 8px; border-radius: 4px; border: 1px solid #eee; }
          
          table { width: 100%; border-collapse: collapse; font-size: 0.85em; margin-top: 10px; }
          th, td { border: 1px solid #e0e0e0; padding: 6px 10px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
          tr:nth-child(even) { background-color: #fcfcfc; }
          .mismatch-seq { font-family: 'Courier New', monospace; }
          .diff-idx { color: #dc2626; font-weight: bold; }
          
          .tag { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.7em; font-weight: bold; text-transform: uppercase; color: white;}
          .tag-high { background-color: #16a34a; }
          .tag-snp { background-color: #eab308; }

          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>PolyPrime Specificity Report</h1>
        <div class="meta">
            Generated: ${dateStr}<br/>
            Engine: PolyPrime V2.0 Sugarcane Edition<br/>
            Candidates Found: ${primers.length}
        </div>

        ${primers.map((p, idx) => `
          <div class="primer-block">
            <div class="primer-header">
                <div>
                    <span class="seq">${p.sequence}</span>
                    <span class="tag ${p.specificityClass === 'High' ? 'tag-high' : 'tag-snp'}">${p.specificityClass} Specificity</span>
                </div>
                <div style="font-size: 1.5em; font-weight: bold; color: #333;">#${idx + 1}</div>
            </div>

            <div class="stats">
                <div class="stat-box"><strong>Position:</strong> ${p.start}</div>
                <div class="stat-box"><strong>Tm:</strong> ${p.tm.toFixed(1)}°C</div>
                <div class="stat-box"><strong>GC:</strong> ${p.gc.toFixed(1)}%</div>
                <div class="stat-box"><strong>Min Mismatches:</strong> ${p.minMismatches}</div>
            </div>

            <h3>Cross-Reactivity Matrix</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 30%">Allele / Background ID</th>
                        <th style="width: 10%">Mismatches</th>
                        <th style="width: 40%">Nearest Sequence Match</th>
                        <th style="width: 20%">Diff Positions (1-${p.sequence.length})</th>
                    </tr>
                </thead>
                <tbody>
                    ${p.crossReactivity.map(cr => `
                        <tr>
                            <td>${cr.alleleHeader}</td>
                            <td><strong>${cr.mismatches}</strong></td>
                            <td class="mismatch-seq">${cr.sequence}</td>
                            <td class="diff-idx">${cr.mismatchIndices.map(i => i + 1).join(', ')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
          </div>
        `).join('')}

        <script>
            window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  if (isAnalyzing) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12 text-center">
        <div className="inline-block w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
        <p className="font-cyber text-cyan-400 animate-pulse">ANALYZING SPECIFICITY PROFILE...</p>
      </div>
    );
  }

  if (primers.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 border border-red-900/50 bg-red-950/10 rounded-xl flex flex-col items-center justify-center text-center">
        <Ban className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-red-400">No Specific Primers Found</h3>
        <p className="text-slate-400 mt-2 max-w-md">
          Every window in the target sequence has a perfect match (0 mismatches) in at least one background allele.
        </p>
      </div>
    );
  }

  const bestPrimer = primers[0];
  const isHighSpec = bestPrimer.specificityClass === 'High';

  return (
    <div className="w-full max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-cyber text-slate-100">CANDIDATES IDENTIFIED <span className="text-cyan-500">[{primers.length}]</span></h2>
        </div>
        <button 
            onClick={generatePDFReport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-900/50 hover:border-cyan-400/50 rounded-lg transition-all font-mono text-sm"
        >
            <Printer className="w-4 h-4" />
            GENERATE REPORT
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* HERO CARD - BEST PRIMER */}
        <div className={`relative bg-slate-900 border ${isHighSpec ? 'border-green-500/50' : 'border-yellow-500/50'} rounded-xl p-6 md:p-8 shadow-2xl overflow-hidden`}>
            {/* Status Bar */}
            <div className={`absolute top-0 left-0 w-full h-1 ${isHighSpec ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            
            <div className="flex flex-col gap-6 relative z-10">
                
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className={`w-5 h-5 ${isHighSpec ? 'text-green-400' : 'text-yellow-400'}`} />
                            <span className={`${isHighSpec ? 'text-green-400' : 'text-yellow-400'} font-bold tracking-wider text-sm font-cyber uppercase`}>
                                {isHighSpec ? 'High Specificity Candidate' : 'SNP-Specific Candidate'}
                            </span>
                        </div>
                        <h3 className="text-3xl font-mono text-white tracking-widest">{bestPrimer.sequence}</h3>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className={`text-4xl font-bold font-mono ${isHighSpec ? 'text-green-500' : 'text-yellow-500'}`}>{bestPrimer.minMismatches}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Mismatches</div>
                    </div>
                </div>

                {/* VISUAL PROOF: MINI ALIGNMENT */}
                <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-sm md:text-base leading-relaxed overflow-x-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 border-b border-slate-800 pb-2">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span className="uppercase tracking-wider">Visual Proof vs. Worst Off-Target</span>
                    </div>
                    
                    {/* Target Row */}
                    <div className="flex whitespace-nowrap">
                        <span className="w-24 text-slate-500 text-xs py-1">TARGET</span>
                        <span className="text-cyan-300 tracking-[0.3em] font-bold">{bestPrimer.sequence}</span>
                    </div>

                    {/* Background Row */}
                    <div className="flex whitespace-nowrap">
                        <span className="w-24 text-slate-500 text-xs py-1">OFF-TARGET</span>
                        <div className="tracking-[0.3em]">
                            {bestPrimer.worstOffTargetSeq.split('').map((base, i) => {
                                const isMismatch = bestPrimer.sequence[i] !== base;
                                return (
                                    <span key={i} className={isMismatch ? "text-red-500 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-slate-700"}>
                                        {base}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                    
                    {/* Position Markers */}
                     <div className="flex whitespace-nowrap mt-1">
                        <span className="w-24"></span>
                        <div className="flex text-[8px] text-slate-700 tracking-[0.3em]">
                             {bestPrimer.sequence.split('').map((_, i) => (
                                 <span key={i} className="flex justify-center w-[1ch]">{i+1}</span>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                     <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                        <p className="text-slate-500 text-[10px] font-mono mb-1">POSITION</p>
                        <div className="flex items-center gap-2">
                             <Hash className="w-4 h-4 text-cyan-600" />
                             <span className="text-slate-200 font-bold">{bestPrimer.start}</span>
                        </div>
                    </div>
                     <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                        <p className="text-slate-500 text-[10px] font-mono mb-1">MELTING TEMP</p>
                         <div className="flex items-center gap-2">
                             <Thermometer className="w-4 h-4 text-cyan-600" />
                             <span className="text-slate-200 font-bold">{bestPrimer.tm.toFixed(1)}°C</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700 col-span-2">
                        <p className="text-slate-500 text-[10px] font-mono mb-1">FINGERPRINT (MISMATCH LOCATIONS)</p>
                        <div className="flex items-center gap-2">
                             <Fingerprint className="w-4 h-4 text-cyan-600" />
                             <span className="text-slate-200 font-mono text-xs">
                                 {bestPrimer.mismatchIndices.map(i => i + 1).join(', ')}
                             </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* LIST VIEW FOR OTHERS */}
        {primers.length > 1 && (
             <div className="space-y-4">
                 <div className="flex items-center justify-between mt-8 mb-2">
                     <h3 className="text-slate-500 font-mono text-xs uppercase tracking-widest">Alternative Candidates</h3>
                     <span className="text-xs text-slate-600 font-mono">Full details available in PDF Report</span>
                 </div>
                 {primers.slice(1, 11).map((primer) => {
                     const isHigh = primer.specificityClass === 'High';
                     return (
                        <div key={primer.id} className="bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-all group">
                             <div className="flex items-center gap-4">
                                 <div className={`w-2 h-2 rounded-full ${isHigh ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                 <div>
                                     <p className="font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">{primer.sequence}</p>
                                     <p className="text-[10px] text-slate-500 font-mono">
                                         Mismatch Indices: {primer.mismatchIndices.map(i => i+1).join(', ')}
                                     </p>
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-6 text-xs font-mono text-slate-400">
                                 <span>Tm: {primer.tm.toFixed(1)}</span>
                                 <span>Pos: {primer.start}</span>
                                 <span className={`px-2 py-1 rounded bg-slate-800 border ${isHigh ? 'border-green-900 text-green-400' : 'border-yellow-900 text-yellow-400'}`}>
                                     {primer.minMismatches} Diff
                                 </span>
                             </div>
                        </div>
                     );
                 })}
             </div>
        )}
      </div>
    </div>
  );
};

export default PrimerResults;