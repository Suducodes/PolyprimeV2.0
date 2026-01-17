import React, { useState, useEffect } from 'react';
import { DnaSequence, Primer } from './types';
import { parseFasta, findUniquePrimers } from './utils/bioinformatics';
import FileUpload from './components/FileUpload';
import SequenceList from './components/SequenceList';
import PrimerResults from './components/PrimerResults';
import ConservationPlot from './components/ConservationPlot';
import { Cpu, Settings2, TestTube2, Sliders } from 'lucide-react';

const App: React.FC = () => {
  const [sequences, setSequences] = useState<DnaSequence[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [primers, setPrimers] = useState<Primer[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Design Parameters
  const [primerLength, setPrimerLength] = useState<number>(21);

  const handleDataLoaded = (content: string) => {
    try {
      const parsed = parseFasta(content);
      setSequences(parsed);
      setTargetId(null);
      setPrimers([]);
    } catch (error) {
      console.error("Failed to parse FASTA", error);
      alert("Invalid FASTA format.");
    }
  };

  const handleSelectTarget = (id: string) => {
    setTargetId(id);
  };

  // Run analysis when Target OR Parameters change
  useEffect(() => {
    if (targetId && sequences.length > 1) {
      const targetSeq = sequences.find(s => s.id === targetId);
      if (targetSeq) {
        setIsAnalyzing(true);
        // Debounce slightly to allow UI render
        const timer = setTimeout(() => {
          const results = findUniquePrimers(targetSeq, sequences, primerLength);
          setPrimers(results);
          setIsAnalyzing(false);
        }, 300);
        
        return () => clearTimeout(timer);
      }
    } else {
        setPrimers([]);
    }
  }, [targetId, sequences, primerLength]);

  const targetSeq = sequences.find(s => s.id === targetId);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">
      {/* Navbar / Header */}
      <header className="border-b border-cyan-900/30 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-cyber font-bold tracking-tight text-white">
                POLY<span className="text-cyan-400">PRIME</span>
              </h1>
              <p className="text-xs text-cyan-600 font-mono tracking-widest uppercase">Sugarcane Edition v2.0</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] text-slate-500 font-mono uppercase">Batch Processing</p>
                <p className="text-xs text-cyan-400 font-mono">{sequences.length > 0 ? `${sequences.length} Sequences Loaded` : 'Waiting for Input'}</p>
             </div>
            <div className="px-3 py-1 rounded-full border border-cyan-900/50 bg-cyan-950/20 text-cyan-500 text-xs font-mono animate-pulse">
              SYSTEM: ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Controls (Only visible if data loaded) */}
        <aside className="lg:col-span-1 space-y-6">
            {/* Upload Area */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-cyber text-slate-400 mb-4 flex items-center gap-2">
                    <TestTube2 className="w-4 h-4" /> INPUT SOURCE
                </h3>
                <FileUpload onDataLoaded={handleDataLoaded} />
            </div>

            {/* Parameter Controls */}
            {sequences.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-fade-in-up">
                    <h3 className="text-sm font-cyber text-slate-400 mb-6 flex items-center gap-2">
                        <Settings2 className="w-4 h-4" /> PRIMER PARAMETERS
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                                <span>LENGTH</span>
                                <span className="text-cyan-400">{primerLength} bp</span>
                            </div>
                            <input 
                                type="range" 
                                min="19" 
                                max="23" 
                                step="1"
                                value={primerLength}
                                onChange={(e) => setPrimerLength(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                                <span>19</span>
                                <span>23</span>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[10px] text-slate-500 font-mono space-y-2">
                            <div className="flex justify-between">
                                <span>Direction</span>
                                <span className="text-slate-300">Forward (5' - 3')</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Specificity</span>
                                <span className="text-slate-300">Rule of 3 + 3' End</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Tm Target</span>
                                <span className="text-slate-300">60°C</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </aside>

        {/* Right Content: Visualization & Results */}
        <div className="lg:col-span-3 space-y-8">
             {sequences.length > 0 ? (
                 <>
                    <SequenceList 
                        sequences={sequences} 
                        targetId={targetId} 
                        onSelectTarget={handleSelectTarget} 
                    />
                    
                    {targetId && targetSeq && (
                        <div className="border-t border-slate-800 pt-8 animate-fade-in-up">
                            {/* NEW: Conservation Genome Plot */}
                            <ConservationPlot 
                                seqLength={targetSeq.length} 
                                primers={primers} 
                                windowSize={primerLength} 
                            />
                            
                            <PrimerResults primers={primers} isAnalyzing={isAnalyzing} />
                        </div>
                    )}
                 </>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-12 bg-slate-900/20">
                    <Sliders className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-cyber text-lg">AWAITING BATCH DATA</p>
                    <p className="text-sm font-mono mt-2">Upload FASTA or Load Demo to Begin</p>
                </div>
             )}
        </div>
      </main>
    </div>
  );
};

export default App;