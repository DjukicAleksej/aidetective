
import React, { useState } from 'react';

interface AuthViewProps {
    onAuthSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            // Simple mock authentication - replace with your actual auth logic
            if (email && password) {
                if (isSignUp) {
                    setMessage('Registration successful! You can now log in.');
                } else {
                    onAuthSuccess();
                }
            } else {
                throw new Error('Please enter both email and password.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 text-white">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-lg p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-[#d4af37] mb-2 tracking-wide">Thorne & Co.</h1>
                    <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">Investigation Suite</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-medium">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 focus:border-[#d4af37]/50 p-3 text-sm text-white outline-none transition-colors rounded-sm"
                            placeholder="detective@agency.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 focus:border-[#d4af37]/50 p-3 text-sm text-white outline-none transition-colors rounded-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-sm leading-relaxed">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-sm leading-relaxed">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#d4af37] hover:bg-[#c4a030] text-black font-medium text-sm py-3 uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 rounded-sm"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Initialize Key' : 'Access Archives')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                            setMessage(null);
                        }}
                        className="text-xs text-white/40 hover:text-[#d4af37] transition-colors uppercase tracking-wider"
                    >
                        {isSignUp ? 'Already have access? Log In' : 'Need clearance? Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
