import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, ExternalLink, Server, Cloud, Shield, Database, Settings, GitBranch, 
  Terminal, Activity, Layers, Network, Lock, Box, Cpu, RefreshCcw, CheckCircle2 
} from 'lucide-react';

const DevOpsPortfolio = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  const skills = [
    { category: "Cloud", items: ["AWS", "Azure", "GCP"], icon: <Cloud className="text-blue-400" /> },
    { category: "IaC", items: ["Terraform", "Ansible"], icon: <Terminal className="text-purple-400" /> },
    { category: "Orchestration", items: ["Kubernetes", "Helm"], icon: <Layers className="text-emerald-400" /> },
    { category: "CI/CD", items: ["Jenkins", "Actions"], icon: <GitBranch className="text-red-400" /> },
    { category: "Monitoring", items: ["Grafana", "Prometheus"], icon: <Activity className="text-orange-400" /> },
    { category: "Security", items: ["SonarQube", "IAM"], icon: <Shield className="text-blue-500" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-grid-pattern"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            AWS Infrastructure <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Automation</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-8">Professional DevSecOps Engineer specializing in AWS and Kubernetes.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="px-6 py-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all">GitHub Repo</a>
            <button className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all">Live Demo</button>
          </div>
        </motion.header>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-16">
          {skills.map((skill, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-center">
              <div className="flex justify-center mb-2">{skill.icon}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{skill.category}</div>
            </div>
          ))}
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center gap-2 mb-8">
          {['architecture', 'cicd'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === tab ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-900/50 text-gray-400'}`}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'architecture' && (
            <motion.div key="arch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl bg-gray-900/80 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">AWS + EKS Infrastructure</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800 rounded border border-gray-700">VPC (10.0.0.0/16)</div>
                <div className="p-4 bg-gray-800 rounded border border-blue-500/50">EKS Cluster</div>
                <div className="p-4 bg-gray-800 rounded border border-gray-700">ALB / NAT Gateway</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 pt-8 border-t border-gray-900 text-center text-gray-500 text-sm">
          <p>© 2026 DevOps Portfolio</p>
        </footer>
      </div>
    </div>
  );
};

export default DevOpsPortfolio;
