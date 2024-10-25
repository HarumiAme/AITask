import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20"></div>
      
      <nav className="container mx-auto px-6 py-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold text-white">TaskAI</span>
          </div>
          <div className="space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-white/90 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6 inline-block">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 animate-gradient-x">
              Manage Tasks Smarter with AI Assistance
            </h1>
          </div>
          <p className="text-xl text-slate-300/90 mb-12 leading-relaxed">
            Transform your productivity with AI-powered task management. Create,
            organize, and complete tasks more efficiently than ever before.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl transition-all duration-200 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-2 text-lg font-semibold">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Smart Task Management
            </h3>
            <p className="text-slate-300/90">
              Organize tasks with intuitive controls and nested subtasks for better
              project management.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              AI Task Generation
            </h3>
            <p className="text-slate-300/90">
              Let AI help you break down complex tasks and suggest relevant
              subtasks automatically.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <BrainCircuit className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Smart Suggestions
            </h3>
            <p className="text-slate-300/90">
              Get intelligent suggestions for task organization and priority
              management.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;