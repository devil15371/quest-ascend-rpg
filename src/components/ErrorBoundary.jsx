import React from 'react';
import { Cpu, RefreshCw } from 'lucide-react';
import { INITIAL_USER_STATE, saveUserData } from '../utils/storage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error in QuestAscend:", error, errorInfo);
  }

  handleResetState = () => {
    saveUserData(INITIAL_USER_STATE);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white font-orbitron">
          <div className="max-w-md w-full cyber-panel p-6 rounded-3xl border-2 border-cyan-500/60 shadow-2xl text-center space-y-4 bg-slate-950/95 cyber-hud-brackets">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-3xl">
              <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>

            <h2 className="text-xl font-black text-white uppercase">SYSTEM RECOVERY MATRIX</h2>
            <p className="text-xs font-rajdhani text-slate-300">
              A temporary state mismatch occurred. Tap below to refresh your session safely.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RELOAD SYSTEM</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs uppercase"
              >
                Reset App State to Defaults
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
