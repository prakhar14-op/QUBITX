import React, { useEffect, useRef, useState, lazy } from 'react';
import { Navbar as MainNavbar } from '../Navbar'; // Use the existing navbar
const Spline = lazy(() => import('@splinetool/react-spline'));

// HeroSplineBackground: The 3D Spline Scene
export function HeroSplineBackground() {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
            overflow: 'hidden',
            zIndex: 0
        }}>
            <Spline
                style={{
                    width: '100%',
                    height: '100%',
                }}
                scene="https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode"
            />
            {/* Dark Overlay for Text Readability */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `
            linear-gradient(to right, rgba(0, 0, 0, 0.8), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.8)),
            linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.9))
          `,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

// HeroContent: The text and buttons
export function HeroContent() {
    return (
        <div className="relative z-10 text-left text-white pt-32 sm:pt-40 md:pt-48 px-4 max-w-4xl mx-auto pointer-events-none">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 leading-tight tracking-tight drop-shadow-2xl pointer-events-auto">
                Credit Without <br className="sm:hidden" />Cash.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-90 max-w-2xl text-gray-200 pointer-events-auto">
                We lend <span className="text-[var(--cyber-green)] font-semibold">items</span>, not money.
                Eliminating diversion risk for the unbanked with an autonomous agent network.
            </p>
            <div className="flex pointer-events-auto flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                    className="bg-[var(--cyber-green)] hover:bg-[#00cc7d] text-black font-bold py-3 sm:py-4 px-8 rounded-full transition duration-300 w-full sm:w-auto shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:scale-105 cursor-pointer"
                >
                    Launch App
                </button>
                <button className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium py-3 sm:py-4 px-8 rounded-full transition duration-300 flex items-center justify-center w-full sm:w-auto backdrop-blur-md cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Watch Demo
                </button>
            </div>
        </div>
    );
}

// Original Full Section (Wrapper for backwards compatibility if needed, but we will use components directly)
export const HeroSection = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            <HeroSplineBackground />
            <div className="absolute inset-0 flex justify-center items-center z-10">
                <HeroContent />
            </div>
        </div>
    );
};
