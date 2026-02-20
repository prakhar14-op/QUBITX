
import React, { useState, useEffect, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    MarkerType,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, ArrowRight, ShieldCheck, ShoppingCart, Loader2 } from 'lucide-react';
import axios from 'axios';

// --- Custom Components ---

const DotNode = ({ data }) => {
    return (
        <div className="relative flex flex-col items-center">
            <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
            <div
                className={`w-3 h-3 rounded-full shadow-[0_0_10px_2px] ${data.colorClass} transition-all duration-500`}
                style={{ backgroundColor: data.color }}
            />
            {data.label && (
                <div className="absolute top-4 text-[10px] text-gray-400 whitespace-nowrap font-mono tracking-wider pointer-events-none">
                    {data.label}
                </div>
            )}
            <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
        </div>
    );
};

const TypingText = ({ text, speed = 30 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <p className="text-sm md:text-base text-gray-300 font-mono leading-relaxed">{displayedText}</p>;
};

// --- Constants ---

const nodeTypes = { dot: DotNode };

const STAGES = {
    REJECTION: 0,
    DISCOVERY: 1,
    VERIFICATION: 2,
    ESCROW: 3,
};

const API_BASE = 'http://localhost:8000/api';

// --- Main Component ---

export default function AgenticSupplyChainFinance() {
    const [workflowStage, setWorkflowStage] = useState(STAGES.REJECTION);
    const [isLoading, setIsLoading] = useState(false);

    // Data States
    const [riskData, setRiskData] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [escrowDetails, setEscrowDetails] = useState(null);

    // React Flow State - Use hook imported from @xyflow (which wraps inside provider usually)
    // Note: useNodesState/useEdgesState should be used inside component OR wrapped.
    // However, App.jsx uses <AgenticSupplyChainFinance /> inside <App>.
    // It should work.

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // --- Graph Logic ---

    const updateGraph = useCallback((stage, currentVendors = [], activeVendor = null) => {
        let newNodes = [];
        let newEdges = [];

        // Common Nodes
        const userNode = {
            id: 'user',
            type: 'dot',
            position: { x: 100, y: 300 },
            data: { color: '#FFFFFF', colorClass: 'bg-white shadow-white/50', label: 'User (Borrower)' },
        };

        if (stage === STAGES.REJECTION) {
            const bankNode = {
                id: 'bank',
                type: 'dot',
                position: { x: 400, y: 300 },
                data: { color: '#EF4444', colorClass: 'bg-red-500 shadow-red-500/50', label: 'Traditional Bank' },
            };

            newNodes = [userNode, bankNode];
            newEdges = [
                {
                    id: 'e-user-bank',
                    source: 'user',
                    target: 'bank',
                    animated: true,
                    style: { stroke: '#EF4444', strokeWidth: 2, strokeDasharray: '5,5' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444' },
                },
            ];
        } else if (stage >= STAGES.DISCOVERY) {
            // Broker Agent
            const brokerNode = {
                id: 'broker',
                type: 'dot',
                position: { x: 300, y: 300 },
                data: { color: '#06B6D4', colorClass: 'bg-cyan-500 shadow-cyan-500/50', label: 'Broker Agent' },
            };
            newNodes = [userNode, brokerNode];

            // Edge: User -> Broker
            newEdges.push({
                id: 'e-user-broker',
                source: 'user',
                target: 'broker',
                animated: true,
                style: { stroke: '#06B6D4', strokeWidth: 1.5 },
            });

            // Dynamic Vendors
            if (currentVendors.length > 0) {
                currentVendors.forEach((v, index) => {
                    const yPos = 150 + (index * 150);
                    const vendorNode = {
                        id: `vendor-${v.id}`,
                        type: 'dot',
                        position: { x: 550, y: yPos },
                        data: {
                            color: '#10B981',
                            colorClass: 'bg-emerald-500 shadow-emerald-500/50',
                            label: v.name
                        },
                    };
                    newNodes.push(vendorNode);

                    // Edge: Broker -> Vendor
                    const isSelected = activeVendor && activeVendor.id === v.id;
                    const isVerificationStage = stage >= STAGES.VERIFICATION;

                    newEdges.push({
                        id: `e-broker-${v.id}`,
                        source: 'broker',
                        target: `vendor-${v.id}`,
                        animated: isSelected && isVerificationStage,
                        style: {
                            stroke: isSelected ? '#06B6D4' : '#334155',
                            strokeWidth: isSelected ? 3 : 1,
                            opacity: isSelected || !activeVendor ? 1 : 0.3
                        },
                    });
                });
            }

            // Stage 4: Escrow
            if (stage === STAGES.ESCROW && activeVendor) {
                const escrowNode = {
                    id: 'escrow',
                    type: 'dot',
                    position: { x: 425, y: 225 },
                    data: { color: '#F59E0B', colorClass: 'bg-amber-500 shadow-amber-500/80 ring-2 ring-amber-300', label: 'Escrow Agent' },
                };
                newNodes.push(escrowNode);

                newEdges.push({
                    id: 'e-escrow-vendor',
                    source: 'escrow',
                    target: `vendor-${activeVendor.id}`,
                    animated: true,
                    style: { stroke: '#F59E0B', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' },
                });

                newEdges.push({
                    id: 'e-user-escrow',
                    source: 'user',
                    target: 'escrow',
                    animated: true,
                    style: { stroke: '#F59E0B', strokeWidth: 2 },
                });
            }
        }

        setNodes(newNodes);
        setEdges(newEdges);
    }, [setNodes, setEdges]);


    // --- API & Workflow Logic ---

    // 1. Initial Load: Risk Assessment
    useEffect(() => {
        const fetchRisk = async () => {
            setIsLoading(true);
            try {
                // Add error handling for connection
                const res = await axios.post(`${API_BASE}/risk-assessment`, {
                    user_id: "u123",
                    credit_score: 650
                });
                setRiskData(res.data);
                if (res.data.status === 'rejected') {
                    setWorkflowStage(STAGES.REJECTION);
                }
            } catch (err) {
                console.error("API Error", err);
                // Fallback for demo if API fails?
                setRiskData({
                    status: 'rejected',
                    reason: 'Network Error (Using Fallback)',
                    agent_triggered: true,
                    message: 'API failed. Using simulated response.'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchRisk();
    }, []);

    // Update graph when stage or data changes
    useEffect(() => {
        updateGraph(workflowStage, vendors, selectedVendor);
    }, [workflowStage, vendors, selectedVendor, updateGraph]);


    const handleExploreAgent = () => {
        setWorkflowStage(STAGES.DISCOVERY);
    };

    const handleCategoryClick = async (category) => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/broker/find-vendors`, { category });
            if (res.data && res.data.length > 0) {
                setVendors(res.data);
                setSelectedVendor(res.data[0]); // Pick first one for demo flow
                setWorkflowStage(STAGES.VERIFICATION);
            }
        } catch (err) {
            console.error("API Error", err);
            // Fallback
            setVendors([{ id: 'v1', name: 'Simulated Vendor', price: 10000, trust_score: 95 }]);
            setSelectedVendor({ id: 'v1', name: 'Simulated Vendor', price: 10000, trust_score: 95 });
            setWorkflowStage(STAGES.VERIFICATION);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprovePurchase = async () => {
        if (!selectedVendor) return;
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/escrow/execute`, {
                vendor_id: selectedVendor.id,
                amount: selectedVendor.price
            });
            setEscrowDetails(res.data);
            setWorkflowStage(STAGES.ESCROW);
        } catch (err) {
            console.error(err);
            setEscrowDetails({ tx_hash: '0xSIMULATED', voucher_code: 'SIM-001' });
            setWorkflowStage(STAGES.ESCROW);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setWorkflowStage(STAGES.REJECTION);
        setVendors([]);
        setSelectedVendor(null);
        setEscrowDetails(null);
    };


    // --- Sidebar Renders ---

    const renderSidebarContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                    <Loader2 className="w-8 h-8 text-[var(--cyber-green)] animate-spin" />
                    <p className="text-sm font-mono text-gray-400">Agent Swarm Processing...</p>
                </div>
            );
        }

        switch (workflowStage) {
            case STAGES.REJECTION:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <AlertCircle className="text-red-500 w-6 h-6" />
                            <div>
                                <h3 className="font-bold text-red-400">
                                    Loan Status: {riskData?.status === 'rejected' ? 'Rejected' : 'Pending'}
                                </h3>
                                <p className="text-xs text-red-300/70">{riskData?.reason || 'Checking credit...'}</p>
                            </div>
                        </div>

                        {riskData?.agent_triggered && (
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10 min-h-[100px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">System Agent</span>
                                </div>
                                <TypingText text={riskData.message} speed={20} />
                            </div>
                        )}

                        {riskData?.agent_triggered && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.5 }}
                                onClick={handleExploreAgent}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all flex items-center justify-center gap-2 group"
                            >
                                Explore Agent Options
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        )}
                    </div>
                );

            case STAGES.DISCOVERY:
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 min-h-[100px]">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Broker Agent</span>
                            </div>
                            <TypingText text="I cannot give you cash, but I can finance your supplies directly. What do you need today?" speed={20} />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {['Fertilizer', 'Seeds', 'Equipment'].map((item, idx) => (
                                <motion.button
                                    key={item}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1 + idx * 0.2 }}
                                    onClick={() => handleCategoryClick(item)}
                                    className={`p-3 rounded-md border text-left transition-all flex items-center justify-between ${item === 'Fertilizer'
                                            ? 'border-emerald-500/50 bg-emerald-900/10 hover:bg-emerald-900/30 text-emerald-100'
                                            : 'border-white/10 bg-white/5 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <span>{item}</span>
                                    {item === 'Fertilizer' && <ShoppingCart className="w-4 h-4 opacity-50" />}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                );

            case STAGES.VERIFICATION:
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-cyan-900/10 border border-cyan-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Verification Complete</span>
                            </div>
                            {selectedVendor && (
                                <>
                                    <h3 className="text-lg font-bold text-white mb-1">Vendor Verified</h3>
                                    <p className="text-sm text-gray-300">{selectedVendor.name}</p>
                                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Price Locked</span>
                                        <span className="font-mono text-emerald-400 font-bold">₹{selectedVendor.price}</span>
                                    </div>
                                    <div className="mt-1 flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Trust Score</span>
                                        <span className="text-sm text-gray-300">{selectedVendor.trust_score}%</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleApprovePurchase}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
                        >
                            Approve Purchase
                            <ShieldCheck className="w-5 h-5" />
                        </motion.button>
                    </div>
                );

            case STAGES.ESCROW:
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 bg-amber-900/10 border border-amber-500/50 rounded-xl text-center"
                        >
                            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <CheckCircle className="w-8 h-8 text-amber-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Loan Approved</h2>
                            <p className="text-amber-200/80 mb-6">Funds transferred directly to vendor.</p>

                            {escrowDetails && (
                                <div className="space-y-2 text-sm font-mono bg-black/40 p-4 rounded-lg text-left border border-white/5">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Voucher</span>
                                        <span className="text-white">{escrowDetails.voucher_code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tx Hash</span>
                                        <span className="text-emerald-400 truncate w-32">{escrowDetails.tx_hash}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className="text-cyan-400">EXECUTED</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            onClick={handleReset}
                            className="w-full py-3 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all text-sm"
                        >
                            Reset Simulation
                        </motion.button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex w-full h-[800px] bg-[#0B0E14] text-white overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            {/* LEFT: React Flow Graph (70%) */}
            <div className="w-[70%] h-full relative border-r border-white/5">
                <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-xs font-mono text-gray-400">Market Topology View</span>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                    className="bg-[#0B0E14]"
                    minZoom={0.5}
                    maxZoom={1.5}
                >
                    <Background color="#334155" gap={20} size={1} />
                    <Controls className="!bg-white/5 !border-white/10 [&>button]:!text-gray-400 [&>button:hover]:!bg-white/10" />
                </ReactFlow>
            </div>

            {/* RIGHT: Agent Action Center (30%) */}
            <div className="w-[30%] h-full flex flex-col bg-[#0f1219]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-black/20">
                    <h2 className="text-xl font-bold font-mono tracking-tight text-white/90">Agent Action Center</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${workflowStage === STAGES.REJECTION ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                            {workflowStage === STAGES.REJECTION ? 'Protocol Inactive' : 'Protocol Active'}
                        </span>
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={workflowStage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            {renderSidebarContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer/Logs */}
                <div className="p-4 bg-black/40 border-t border-white/5 text-[10px] font-mono text-gray-600">
                    <p>System ID: 8821-X</p>
                    <p>Latency: 12ms</p>
                </div>
            </div>
        </div>
    );
}
