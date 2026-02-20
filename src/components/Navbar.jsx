import React, { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";

const menuItems = [
    { name: "Features", href: "#features" },
    { name: "Solution", href: "#solution" },
    { name: "Pricing", href: "#pricing" },
    { name: "Agent Demo", href: "#demo" },
    { name: "Credit Mesh", href: "#mesh" },
    { name: "Agent Workflow", href: "#workflow" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
];

export function Navbar({ onNavigate }) {
    const [menuState, setMenuState] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50);
    });

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
            <nav
                className={`mx-auto max-w-7xl px-4 md:px-8 transition-all duration-300 ${scrolled
                    ? "bg-black/40 backdrop-blur-xl border border-white/10 rounded-full mx-4 mt-2"
                    : "bg-transparent border-transparent"
                    }`}
            >
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => onNavigate && onNavigate('home')}
                    >
                        <div className="w-8 h-8 rounded-lg bg-[var(--cyber-green)] flex items-center justify-center text-black font-bold text-xl">P</div>
                        <span className="font-bold text-xl tracking-wider text-white">PurposePay</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8">
                        <ul className="flex gap-8 text-sm font-medium">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        onClick={(e) => {
                                            if (item.name === "Agent Demo") {
                                                e.preventDefault();
                                                if (onNavigate) onNavigate('demo');
                                            } else if (item.name === "Credit Mesh") {
                                                e.preventDefault();
                                                if (onNavigate) onNavigate('mesh');
                                            } else if (item.name === "Agent Workflow") {
                                                e.preventDefault();
                                                if (onNavigate) onNavigate('agent-workflow');
                                            }
                                        }}
                                        target={item.target || "_self"}
                                        rel={item.target === "_blank" ? "noopener noreferrer" : ""}
                                        className="text-white/90 hover:text-[var(--cyber-green)] transition-colors duration-200 cursor-pointer"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="h-4 w-[1px] bg-white/20"></div>
                        <div className="flex gap-4">
                            <button className="text-sm font-medium text-white hover:text-white/80">Login</button>
                            <button className="px-4 py-2 text-sm font-bold text-black bg-white rounded-full hover:bg-[var(--cyber-green)] transition-colors">
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMenuState(!menuState)}
                        className="lg:hidden text-white"
                    >
                        {menuState ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {menuState && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-16 left-4 right-4 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl"
                    >
                        <ul className="flex flex-col gap-4 text-center">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        target={item.target || "_self"}
                                        rel={item.target === "_blank" ? "noopener noreferrer" : ""}
                                        onClick={(e) => {
                                            if (item.name === "Agent Demo") {
                                                e.preventDefault();
                                                if (onNavigate) onNavigate('demo');
                                                setMenuState(false);
                                            } else if (item.name === "Credit Mesh") {
                                                e.preventDefault();
                                                if (onNavigate) onNavigate('mesh');
                                                setMenuState(false);
                                            } else if (item.name === "Agent Workflow") {
                                                e.preventDefault();
                                                if (onNavigate) onNavigate('agent-workflow');
                                                setMenuState(false);
                                            } else {
                                                setMenuState(false);
                                            }
                                        }}
                                        className="text-lg text-white/90 hover:text-[var(--cyber-green)] block py-2 cursor-pointer"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col gap-3">
                            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10">Login</button>
                            <button className="w-full py-3 bg-[var(--cyber-green)] text-black font-bold rounded-xl hover:bg-[#00cc7d]">Sign Up</button>
                        </div>
                    </motion.div>
                )}
            </nav>
        </header>
    );
}
