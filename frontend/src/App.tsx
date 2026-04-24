import React, { useState } from 'react';
import axios from 'axios';
import { 
  TreePine, 
  AlertCircle, 
  Layers, 
  Activity, 
  Send, 
  Loader2,
  ChevronRight,
  TriangleAlert,
  Hexagon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShaderShowcase from "@/components/ui/hero";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/bfhl';

// Recursive Tree Component
interface NodeProps {
  name: string;
  children: Record<string, any>;
  depth?: number;
}

const Node: React.FC<NodeProps> = ({ name, children, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const childKeys = Object.keys(children);
  const hasChildren = childKeys.length > 0;

  return (
    <div className="node" style={{ marginLeft: depth === 0 ? 0 : '1.5rem' }}>
      <div 
        className="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors py-1"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        {hasChildren && (
          <ChevronRight 
            size={16} 
            className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} 
            style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
          />
        )}
        {!hasChildren && <Hexagon size={12} className="text-gray-500" />}
        <span className="font-semibold text-lg">{name}</span>
      </div>
      
      {isOpen && hasChildren && (
        <div className="ml-4 border-l border-indigo-500/30">
          {childKeys.map(key => (
            <Node key={key} name={key} children={children[key]} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const [showTool, setShowTool] = useState(false);
  const [input, setInput] = useState('["A->B", "A->C", "B->D", "E->F", "F->G", "G->E", "H->H", "A->B", "X->Y", "Z->Y"]');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      let cleanedInput = input.trim();
      let parsedData;
      
      if (cleanedInput.startsWith('[')) {
        parsedData = JSON.parse(cleanedInput);
      } else {
        parsedData = cleanedInput.split(',').map(s => s.trim()).filter(s => s);
      }

      const response = await axios.post(API_URL, { data: parsedData });
      setData(response.data);
      
      setTimeout(() => {
        document.getElementById('results-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!showTool ? (
          <motion.section 
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="relative h-screen w-full"
          >
            <ShaderShowcase onGetStarted={() => setShowTool(true)} />
          </motion.section>
        ) : (
          <motion.section 
            key="app"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            id="main-app" 
            className="container mx-auto px-4 py-12 relative z-10"
          >
            <button 
              onClick={() => setShowTool(false)}
              className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to start</span>
            </button>

            <header className="mb-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                Build Your Hierarchy
              </h2>
              <p className="text-slate-400 text-lg">Input your node relationships below to generate interactive trees.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <section className="glass-panel">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="text-cyan-400" />
                  <h3 className="text-xl font-semibold">Configuration</h3>
                </div>
                
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm text-slate-400 mb-2">Edge Definitions</label>
                      <textarea 
                        className="input-area w-full"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='["A->B", "B->C"]'
                      />
                   </div>

                  <button 
                    className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 group" 
                    onClick={handleSubmit} 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                    {loading ? 'Analyzing Graph...' : 'Generate Visualization'}
                  </button>

                  {error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                      <TriangleAlert size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  {data && (
                    <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                      <div className="flex items-center gap-3">
                        <Layers size={20} className="text-indigo-400" />
                        <h4 className="text-lg font-medium">Quick Stats</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel border-white/5 p-4 rounded-2xl bg-white/5">
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Trees</div>
                          <div className="text-3xl font-bold text-white">{data.summary.total_trees}</div>
                        </div>
                        <div className="glass-panel border-white/5 p-4 rounded-2xl bg-white/5">
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cycles</div>
                          <div className="text-3xl font-bold text-orange-400">{data.summary.total_cycles}</div>
                        </div>
                      </div>

                      <div className="glass-panel border-white/5 p-4 rounded-2xl bg-white/5">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Largest Root</div>
                        <div className="text-xl font-bold text-cyan-400">{data.summary.largest_tree_root || 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Results Section */}
              <section id="results-view" className="glass-panel flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-2">
                  <TreePine className="text-indigo-400" />
                  <h3 className="text-xl font-semibold">Hierarchy Visualizer</h3>
                </div>

                {!data && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center py-20">
                    <Activity size={64} className="opacity-10 mb-4" />
                    <p className="max-w-xs">Waiting for graph input. Configure your edges and click generate to view the hierarchy.</p>
                  </div>
                )}

                {data && (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {data.hierarchies.map((h: any, i: number) => (
                      <div key={i} className={`glass-panel p-6 rounded-2xl border-l-4 ${h.has_cycle ? 'border-orange-500/50' : 'border-emerald-500/50'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${h.has_cycle ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {h.has_cycle ? 'Cycle Detected' : `Depth: ${h.depth}`}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">NODE_{h.root}</span>
                        </div>
                        
                        {h.has_cycle ? (
                          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex gap-3 items-center text-orange-200/70 text-sm italic">
                            <TriangleAlert size={14} />
                            <span>Infinite recursion found starting at <strong>{h.root}</strong></span>
                          </div>
                        ) : (
                          <Node name={h.root} children={h.tree} />
                        )}
                      </div>
                    ))}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pb-4">
                      <div>
                        <h5 className="text-[10px] uppercase tracking-tighter text-slate-500 mb-3 flex items-center gap-2">
                          <AlertCircle size={12} className="text-red-500" /> Invalid Format
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {data.invalid_entries.length > 0 ? data.invalid_entries.map((val: string, i: number) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[10px] border border-red-500/20 font-mono">
                              {val}
                            </span>
                          )) : <span className="text-[10px] text-slate-600">None detected</span>}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-[10px] uppercase tracking-tighter text-slate-500 mb-3 flex items-center gap-2">
                          <Layers size={12} className="text-orange-500" /> Duplicate Edges
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {data.duplicate_edges.length > 0 ? data.duplicate_edges.map((val: string, i: number) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 text-[10px] border border-orange-500/20 font-mono">
                              {val}
                            </span>
                          )) : <span className="text-[10px] text-slate-600">No duplicates</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <footer className="mt-32 pt-10 border-t border-white/5 text-center px-4">
                <p className="text-slate-500 text-xs tracking-[0.2em] mb-4 uppercase">SRM ENGINEERING CHALLENGE 2026</p>
                <div className="flex justify-center gap-8 text-[10px] text-slate-400 font-light">
                  <span>{data?.user_id || 'john_doe_17091999'}</span>
                  <span>•</span>
                  <span>{data?.college_roll_number || 'SRM12345'}</span>
                </div>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
