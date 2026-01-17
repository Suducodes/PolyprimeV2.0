import React, { useCallback } from 'react';
import { Upload, FileCode } from 'lucide-react';
import { DEMO_DATA } from '../constants';

interface FileUploadProps {
  onDataLoaded: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        readFile(files[0]);
    }
  }, [onDataLoaded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onDataLoaded(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative group cursor-pointer border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-300 rounded-xl p-12 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-slate-800 group-hover:bg-cyan-900/30 group-hover:text-cyan-400 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-200">Drag & Drop FASTA File</h3>
            <p className="text-slate-400 mt-2">or click to browse local files</p>
          </div>
          <input 
            type="file" 
            accept=".fasta,.fa,.txt" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button 
          onClick={() => onDataLoaded(DEMO_DATA)}
          className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-cyan-900/30 text-cyan-400 border border-cyan-900 hover:border-cyan-500/50 rounded-lg transition-all duration-200 font-mono text-sm"
        >
          <FileCode className="w-4 h-4" />
          Load Demo Sugarcane Data
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
