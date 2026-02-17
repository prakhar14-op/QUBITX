import React, { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Handle, Position, BaseEdge, getBezierPath } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Activity, Info, ShieldCheck } from 'lucide-react';

/* --- 1. CUSTOM NODE COMPONENT (DotNode) --- */
const DotNode = ({ data, selected }) => {
    // Colors matching the "Market Topology" reference
    let bgClass = 'bg-gray-500';

    switch (data.category) {
        case 'finance':
            bgClass = 'bg-[#8b5cf6]'; // Violet/Purple
            break;
        case 'it':
            bgClass = 'bg-[#06b6d4]'; // Cyan/Teal
            break;
        case 'infra':
            bgClass = 'bg-[#10b981]'; // Emerald/Green
            break;
        case 'consumer':
            bgClass = 'bg-[#ec4899]'; // Pink/Red
            break;
        default:
            bgClass = 'bg-gray-500';
    }

    return (
        <div className="relative group flex flex-col items-center justify-center">
            <Handle type="target" position={Position.Top} className="opacity-0" />

            {/* The Dot */}
            <div className={`w-3 h-3 rounded-full ${bgClass} ${selected ? 'ring-2 ring-white scale-125' : ''} shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-300`} />

            {/* The Label (Directly below/inside like stock tickers) */}
            <div className="absolute top-4 w-max text-center pointer-events-none">
                <p className={`text-[10px] font-sans font-medium tracking-tight ${selected ? 'text-white' : 'text-gray-300'} drop-shadow-md`}>
                    {data.label}
                </p>
            </div>

            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
};

/* --- 2. CUSTOM EDGE COMPONENT (ThinLine) --- */
const ThinEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) => {
    const [edgePath] = getBezierPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
    });

    return (
        <BaseEdge
            path={edgePath}
            markerEnd={markerEnd}
            style={{ strokeWidth: 1, stroke: '#475569', opacity: 0.4 }}
        />
    );
};

/* --- INITIAL GRAPH DATA --- */
const initialNodes = [
    // Center / Hub
    { id: 'user', type: 'dotNode', position: { x: 400, y: 300 }, data: { label: 'USER.CORE', category: 'finance' } },

    // Financial Ring
    { id: 'bank1', type: 'dotNode', position: { x: 250, y: 200 }, data: { label: 'HDFCBANK.NS', category: 'finance' } },
    { id: 'bank2', type: 'dotNode', position: { x: 550, y: 200 }, data: { label: 'ICICIBANK.NS', category: 'finance' } },
    { id: 'kotak', type: 'dotNode', position: { x: 400, y: 150 }, data: { label: 'KOTAKBANK.NS', category: 'finance' } },
    { id: 'sbi', type: 'dotNode', position: { x: 320, y: 220 }, data: { label: 'SBIN.NS', category: 'finance' } },

    // IT Core
    { id: 'tcs', type: 'dotNode', position: { x: 150, y: 300 }, data: { label: 'TCS.NS', category: 'it' } },
    { id: 'infy', type: 'dotNode', position: { x: 100, y: 250 }, data: { label: 'INFY.NS', category: 'it' } },
    { id: 'hcl', type: 'dotNode', position: { x: 180, y: 260 }, data: { label: 'HCLTECH.NS', category: 'it' } },

    // Infra / Energy
    { id: 'rel', type: 'dotNode', position: { x: 400, y: 400 }, data: { label: 'RELIANCE.NS', category: 'it' } }, // Using Cyan for reliance as per image usually
    { id: 'ntpc', type: 'dotNode', position: { x: 500, y: 350 }, data: { label: 'NTPC.NS', category: 'infra' } },
    { id: 'power', type: 'dotNode', position: { x: 150, y: 350 }, data: { label: 'POWERGRID.NS', category: 'it' } },

    // Consumer / Others
    { id: 'asian', type: 'dotNode', position: { x: 600, y: 450 }, data: { label: 'ASIANPAINT.NS', category: 'consumer' } },
    { id: 'titan', type: 'dotNode', position: { x: 550, y: 500 }, data: { label: 'TITAN.NS', category: 'consumer' } },
    { id: 'itc', type: 'dotNode', position: { x: 650, y: 500 }, data: { label: 'ITC.NS', category: 'consumer' } },

    // Far nodes
    { id: 'jsw', type: 'dotNode', position: { x: 150, y: 500 }, data: { label: 'JSWSTEEL.NS', category: 'infra' } },
    { id: 'tata', type: 'dotNode', position: { x: 200, y: 450 }, data: { label: 'TATAMOTORS.NS', category: 'infra' } },
];

const initialEdges = [
    { id: 'e1', source: 'user', target: 'bank1', type: 'thinEdge' },
    { id: 'e2', source: 'user', target: 'bank2', type: 'thinEdge' },
    { id: 'e3', source: 'user', target: 'kotak', type: 'thinEdge' },
    { id: 'e4', source: 'user', target: 'tcs', type: 'thinEdge' },
    { id: 'e5', source: 'user', target: 'rel', type: 'thinEdge' },

    { id: 'e6', source: 'bank1', target: 'sbi', type: 'thinEdge' },
    { id: 'e7', source: 'bank2', target: 'sbi', type: 'thinEdge' },

    { id: 'e8', source: 'tcs', target: 'infy', type: 'thinEdge' },
    { id: 'e9', source: 'tcs', target: 'hcl', type: 'thinEdge' },
    { id: 'e10', source: 'tcs', target: 'power', type: 'thinEdge' },

    { id: 'e11', source: 'rel', target: 'ntpc', type: 'thinEdge' },
    { id: 'e12', source: 'rel', target: 'asian', type: 'thinEdge' },

    { id: 'e13', source: 'asian', target: 'titan', type: 'thinEdge' },
    { id: 'e14', source: 'asian', target: 'itc', type: 'thinEdge' },

    { id: 'e15', source: 'user', target: 'tata', type: 'thinEdge' },
    { id: 'e16', source: 'tata', target: 'jsw', type: 'thinEdge' },
];

const nodeTypes = { dotNode: DotNode };
const edgeTypes = { thinEdge: ThinEdge };

export default function CreditReliabilityMesh({ onBack }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);

    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm text-white font-sans flex flex-col overflow-hidden">

            {/* Header */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-white" />
                            Market Topology
                        </h1>
                        <p className="text-xs text-gray-500 tracking-wide">Real-time correlation network & contagion analysis</p>
                    </div>
                </div>
                <button className="px-4 py-2 border border-blue-600/50 text-blue-400 text-sm font-medium rounded hover:bg-blue-600/10 transition-colors flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Simulate Market Shock
                </button>
            </header>

            {/* Content Container */}
            <div className="flex-1 flex p-4 gap-4 overflow-hidden">

                {/* Visualizer (Left) */}
                <div className="flex-1 relative bg-[#0B0E14] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                    {/* Floating Legend */}
                    <div className="absolute top-6 left-6 z-10 bg-[#151921]/90 backdrop-blur p-4 rounded-xl border border-white/5 flex flex-col gap-2 shadow-lg">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                            <span className="text-[11px] text-gray-300 font-medium">Finance</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></span>
                            <span className="text-[11px] text-gray-300 font-medium">IT Services</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                            <span className="text-[11px] text-gray-300 font-medium">Infra/Energy</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]"></span>
                            <span className="text-[11px] text-gray-300 font-medium">Consumer</span>
                        </div>
                    </div>

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        className="bg-transparent"
                        minZoom={0.5}
                        maxZoom={2}
                        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    >
                        {/* Very subtle dark grid if needed, or just plain dark */}
                        <Background color="#1f2937" gap={50} size={1} className="opacity-10" />
                        <Controls className="bg-[#151921] border-white/10 text-gray-400" showInteractive={false} />
                    </ReactFlow>
                </div>

                {/* Metrics Sidebar (Right) */}
                <div className="w-80 flex flex-col gap-4">

                    {/* Topology Metrics Card */}
                    <div className="bg-[#0B0E14] rounded-2xl border border-white/5 p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-gray-200 mb-6 flex items-center gap-2">
                            <Info className="w-4 h-4 text-gray-500" /> Topology Metrics
                        </h3>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Critical Cluster</span>
                                <span className="text-[#ef4444] font-mono font-medium">Financial Core</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Spectral Radius</span>
                                <span className="text-[#3b82f6] font-mono font-medium">1.2154</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Avg. Path Length</span>
                                <span className="text-[#3b82f6] font-mono font-medium">4.58</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">HDFC Centrality</span>
                                <span className="text-[#3b82f6] font-mono font-medium">1.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Node Analysis Card */}
                    <div className="flex-1 bg-[#0B0E14] rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col">
                        <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-gray-500" /> Node Analysis
                        </h3>

                        {selectedNode ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 space-y-4"
                            >
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Selected Entity</span>
                                    <h4 className="text-lg font-mono text-white mb-2">{selectedNode.data.label}</h4>
                                    <div className={`text-xs px-2 py-1 rounded inline-block ${selectedNode.data.category === 'finance' ? 'bg-violet-500/20 text-violet-300' :
                                        selectedNode.data.category === 'it' ? 'bg-cyan-500/20 text-cyan-300' :
                                            selectedNode.data.category === 'infra' ? 'bg-emerald-500/20 text-emerald-300' :
                                                'bg-pink-500/20 text-pink-300'
                                        }`}>
                                        {selectedNode.data.category.toUpperCase()} SECTOR
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500">Contagion Probability</p>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[76%] bg-gradient-to-r from-blue-500 to-red-500"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                                        <span>Low</span>
                                        <span className="text-red-400">High (76%)</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center p-4 opacity-50">
                                <p className="text-xs text-gray-500">Select a node to view <br /> contagion analysis</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
