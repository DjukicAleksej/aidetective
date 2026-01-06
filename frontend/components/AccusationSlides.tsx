import React, { useState } from 'react';
import { AccusationResult } from '../types';

interface AccusationSlidesProps {
    result: AccusationResult;
    onComplete: () => void;
}

const AccusationSlides: React.FC<AccusationSlidesProps> = ({ result, onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { type: 'overview', title: 'The Case Overview' },
        { type: 'victim', title: 'The Victim' },
        { type: 'suspects', title: 'Party Analysis' },
        { type: 'evidence', title: 'Key Evidence' },
        { type: 'timeline', title: 'Timeline Reconstruction' },
        { type: 'motive', title: 'The Motive' },
        { type: 'method', title: 'The Methods' },
        { type: 'reveal', title: 'The Killer' },
        { type: 'monologue', title: 'Benoit Blanc\'s Final Words' },
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const renderSlideContent = () => {
        switch (slides[currentSlide].type) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-serif italic">
                            "{result.case_overview.summary}"
                        </p>
                    </div>
                );
            case 'victim':
                return (
                    <div className="space-y-4">
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center mb-6">
                            <span className="text-4xl">✝</span>
                        </div>
                        <h3 className="text-3xl text-[#d4af37] font-serif">{result.victim_profile.name}</h3>
                        <p className="text-white/60 text-lg">{result.victim_profile.background}</p>
                    </div>
                );
            case 'suspects':
                return (
                    <div className="grid grid-cols-1 gap-6 text-left">
                        {result.suspects_analysis.map((suspect, idx) => (
                            <div key={idx} className="p-6 border border-white/10 bg-white/5 rounded-lg space-y-2">
                                <h4 className="text-xl text-[#d4af37] font-serif">{suspect.name}</h4>
                                <p className="text-sm text-red-400/80"><span className="uppercase text-xs tracking-wider opacity-60">Suspicion:</span> {suspect.initial_suspicion}</p>
                                <p className="text-sm text-green-400/80"><span className="uppercase text-xs tracking-wider opacity-60">Exoneration:</span> {suspect.why_not_guilty}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'evidence':
                return (
                    <div className="space-y-6 text-left">
                        {result.key_evidence.map((ev, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-serif font-bold">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h4 className="text-lg text-white font-medium">{ev.description}</h4>
                                    <p className="text-white/50 text-sm mt-1">{ev.importance}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'timeline':
                return (
                    <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8 py-4 text-left">
                        {result.timeline_reconstruction.map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-[#d4af37] ring-4 ring-[#050505]" />
                                <span className="text-[#d4af37] font-mono text-xs mb-1 block">{item.time}</span>
                                <h4 className="text-white text-lg">{item.event}</h4>
                                <p className="text-white/40 italic text-sm mt-1">{item.implication}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'motive':
                return (
                    <div className="p-8 border border-[#d4af37]/20 bg-[#d4af37]/5 rounded-lg max-w-2xl mx-auto">
                        <h3 className="text-xl text-white font-serif mb-4">The Reason Why</h3>
                        <p className="text-lg text-white/80 leading-relaxed">{result.motive.description}</p>
                    </div>
                );
            case 'method':
                return (
                    <div className="p-8 border border-white/10 bg-white/5 rounded-lg max-w-2xl mx-auto">
                        <h3 className="text-xl text-white font-serif mb-4">The Method</h3>
                        <p className="text-lg text-white/80 leading-relaxed">{result.method.description}</p>
                    </div>
                );
            case 'reveal':
                return (
                    <div className="animate-in zoom-in duration-1000 space-y-8">
                        <div className="text-xs uppercase tracking-[0.5em] text-red-500 font-bold animate-pulse">The Killer Is</div>
                        <h1 className="text-6xl md:text-7xl font-serif text-white font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-red-600">
                            {result.killer_reveal.name}
                        </h1>
                        <p className="text-2xl text-white/60 font-serif italic max-w-2xl mx-auto">
                            "{result.killer_reveal.reveal_line}"
                        </p>
                    </div>
                );
            case 'monologue':
                return (
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8 w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#d4af37] opacity-80">
                            {/* Placeholder for Benoit Blanc avatar */}
                            <div className="w-full h-full bg-gradient-to-br from-[#d4af37] to-black" />
                        </div>
                        <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-serif italic text-center">
                            "{result.final_monologue.text}"
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full">
            {/* Progress */}
            <div className="w-full max-w-md mx-auto mb-12 flex gap-1">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= currentSlide ? 'bg-[#d4af37]' : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>

            {/* Header */}
            <div className="text-center mb-10 w-full">
                <h2 className="text-sm uppercase tracking-[0.3em] text-[#d4af37] mb-2">Phase {currentSlide + 1} of {slides.length}</h2>
                <h1 className="text-3xl md:text-4xl font-serif text-white transition-all duration-500">{slides[currentSlide].title}</h1>
            </div>

            {/* Content Container */}
            <div className="w-full flex-1 flex flex-col justify-center items-center text-center transition-all duration-500 min-h-[400px]">
                {renderSlideContent()}
            </div>

            {/* Navigation */}
            <div className="mt-12 flex items-center gap-6">
                <button
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className={`px-6 py-3 text-xs uppercase tracking-widest transition-colors ${currentSlide === 0 ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:text-white'
                        }`}
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#d4af37]/20"
                >
                    {currentSlide === slides.length - 1 ? 'Close Case' : 'Continue'}
                </button>
            </div>
        </div>
    );
};

export default AccusationSlides;
