import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold text-white">TaskAI</span>
          </div>
          <div className="space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-white hover:text-blue-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">
            Manage Tasks Smarter with{' '}
            <span className="text-blue-400">AI Assistance</span>
          </h1>
          <p className="text-xl text-slate-300 mb-12">
            Transform your productivity with AI-powered task management. Create,
            organize, and complete tasks more efficiently than ever before.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 text-lg font-semibold"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Smart Task Management
            </h3>
            <p className="text-slate-300">
              Organize tasks with intuitive controls and nested subtasks for better
              project management.
            </p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              AI Task Generation
            </h3>
            <p className="text-slate-300">
              Let AI help you break down complex tasks and suggest relevant
              subtasks automatically.
            </p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <BrainCircuit className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Smart Suggestions
            </h3>
            <p className="text-slate-300">
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