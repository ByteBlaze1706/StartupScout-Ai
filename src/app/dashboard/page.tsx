'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, BarChart3, TrendingUp, ShieldCheck, Folder, 
  Trash2, Copy, Eye, ExternalLink, Zap, Layers, Download, 
  History, Sparkles, RefreshCw, FileText, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { db, DBProject } from '@/lib/db';
import { exportReportToPDF } from '@/lib/pdfExport';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const list = await db.getProjects();
    setProjects(list);
    setLoading(false);
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
  }, []);

  const refreshProjects = async () => {
    const list = await db.getProjects();
    setProjects(list);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this project? This will permanently remove all analysis data.')) {
      await db.deleteProject(id);
      await refreshProjects();
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const duplicated = await db.duplicateProject(id);
    if (duplicated) {
      await refreshProjects();
    }
  };

  // Quick Action Handlers
  const handleExportLatestReport = async () => {
    if (projects.length === 0) {
      alert('No projects available to export. Create a startup analysis first!');
      return;
    }
    const latest = projects[0];
    exportReportToPDF(latest);
    
    // Increment count on server
    try {
      await fetch(`/api/projects/${latest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment_export' })
      });
      await refreshProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenLatestPitchDeck = () => {
    if (projects.length === 0) {
      alert('No projects available. Create a startup analysis first!');
      return;
    }
    router.push(`/dashboard/projects/${projects[0].id}`);
  };

  const handleDuplicateLatest = async () => {
    if (projects.length === 0) {
      alert('No projects available to duplicate.');
      return;
    }
    const latest = projects[0];
    const duplicated = await db.duplicateProject(latest.id);
    if (duplicated) {
      await refreshProjects();
      alert(`Duplicated project: ${latest.name}`);
    }
  };

  // 1. Advanced Founder Analytics Calculations
  const totalAnalyses = projects.length;
  
  const scores = projects.map(p => p.report?.score?.overall || 0);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const avgScore = totalAnalyses > 0 
    ? Math.round(scores.reduce((acc, s) => acc + s, 0) / totalAnalyses) 
    : 0;

  const totalReportsExported = projects.reduce((acc, p) => acc + (p.exportCount || 0), 0);

  // 2. Dynamic Activity Feed generation from project logs
  interface ActivityLog {
    id: string;
    text: string;
    time: string;
    icon: React.ReactNode;
  }

  const generateActivityFeed = (): ActivityLog[] => {
    const feed: ActivityLog[] = [];
    
    projects.forEach((proj) => {
      const dateStr = new Date(proj.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Creation activity
      feed.push({
        id: `created-${proj.id}`,
        text: `Analysis created for ${proj.name}`,
        time: dateStr,
        icon: <Plus className="w-3 h-3 text-violet-400" />
      });

      // Export activity
      if (proj.exportCount && proj.exportCount > 0) {
        feed.push({
          id: `export-${proj.id}`,
          text: `Report for ${proj.name} exported (${proj.exportCount} time${proj.exportCount > 1 ? 's' : ''})`,
          time: dateStr,
          icon: <Download className="w-3 h-3 text-cyan-400" />
        });
      }

      // Duplication indicator
      if (proj.name.endsWith('(Copy)')) {
        feed.push({
          id: `dup-${proj.id}`,
          text: `Duplicated research archive of ${proj.name.replace(' (Copy)', '')}`,
          time: dateStr,
          icon: <Copy className="w-3 h-3 text-amber-400" />
        });
      }

      // Copilot activity
      if (proj.report?.chatHistory && proj.report.chatHistory.length > 0) {
        feed.push({
          id: `copilot-${proj.id}`,
          text: `AI Copilot conversation updated for ${proj.name}`,
          time: dateStr,
          icon: <Sparkles className="w-3 h-3 text-emerald-400" />
        });
      }
    });

    // Sort feed entries by timestamp (simulated descending order by array index since newer projects are first)
    return feed.slice(0, 5);
  };

  const activityFeed = generateActivityFeed();

  // 3. Advanced Recharts data formatting
  // Chart A: Score distribution counts
  const scoreBrackets = {
    '90+ Exceptional': 0,
    '80-89 Excellent': 0,
    '70-79 Validated': 0,
    '<70 Repivot': 0
  };
  projects.forEach(p => {
    const s = p.report?.score?.overall || 0;
    if (s >= 90) scoreBrackets['90+ Exceptional'] += 1;
    else if (s >= 80) scoreBrackets['80-89 Excellent'] += 1;
    else if (s >= 70) scoreBrackets['70-79 Validated'] += 1;
    else scoreBrackets['<70 Repivot'] += 1;
  });
  const scoreDistributionData = Object.entries(scoreBrackets).map(([name, count]) => ({ name, count }));

  // Chart B: Industry breakdown
  const industryCounts: Record<string, number> = {};
  projects.forEach(p => {
    const ind = p.industry || 'Other';
    industryCounts[ind] = (industryCounts[ind] || 0) + 1;
  });
  const industryData = Object.entries(industryCounts).map(([name, value]) => ({ name, value }));

  // Chart C: Revenue Economics Index
  const revenuePotentialData = projects.map(p => {
    const tiers = p.report?.revenueModels || [];
    const avgTierPrice = tiers.length > 0 
      ? Math.round(tiers.reduce((acc, t) => acc + (parseInt(t.monthlyPricing.replace(/[^0-9]/g, '')) || 0), 0) / tiers.length) 
      : 49;
    return {
      name: p.name.length > 10 ? p.name.substring(0, 8) + '...' : p.name,
      avgPricing: avgTierPrice,
      viability: p.report?.score?.overall || 70
    };
  });

  // Chart D: Opportunities Count
  const marketOpportunityData = projects.map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 8) + '...' : p.name,
    opportunities: p.report?.opportunities?.length || 0,
    competitors: p.report?.competitors?.length || 0
  })).reverse();

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="flex flex-col gap-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Founder Portfolio</h1>
          <p className="text-xs text-zinc-500 font-light mt-1">Review validation scores, export pitch documents, and coordinate agent loops.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title="Refresh Portfolio"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/dashboard/analyze"
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-600/15"
          >
            <Plus className="w-4 h-4" />
            <span>Analyze Startup</span>
          </Link>
        </div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Analyses Completed", val: totalAnalyses, icon: <BarChart3 className="w-4 h-4 text-violet-400" /> },
          { label: "Average Startup Score", val: totalAnalyses > 0 ? `${avgScore}/100` : '—', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
          { label: "Highest Startup Score", val: totalAnalyses > 0 ? `${highestScore}/100` : '—', icon: <TrendingUp className="w-4 h-4 text-cyan-400" /> },
          { label: "Lowest Startup Score", val: totalAnalyses > 0 ? `${lowestScore}/100` : '—', icon: <History className="w-4 h-4 text-amber-400" /> },
          { label: "Reports Exported", val: totalReportsExported, icon: <Download className="w-4 h-4 text-rose-400" /> }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-[9px] uppercase font-mono tracking-wider font-semibold">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{stat.val}</div>
            <div className="absolute right-0 bottom-0 w-12 h-12 bg-white/1 rounded-full translate-x-4 translate-y-4" />
          </div>
        ))}
      </div>

      {/* Center Layout: Quick Actions & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-bold text-white">Quick Actions</h2>
            <p className="text-[10px] text-zinc-500">Fast triggers for active portfolios</p>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <Link
              href="/dashboard/analyze"
              className="p-3 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-white flex items-center justify-between text-xs font-semibold group transition-all"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-400" />
                <span>Analyze Startup</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handleExportLatestReport}
              disabled={projects.length === 0}
              className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 flex items-center justify-between text-xs font-semibold group transition-all"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Latest Report</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleOpenLatestPitchDeck}
              disabled={projects.length === 0}
              className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 flex items-center justify-between text-xs font-semibold group transition-all"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Open Pitch Deck</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleDuplicateLatest}
              disabled={projects.length === 0}
              className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 flex items-center justify-between text-xs font-semibold group transition-all"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Duplicate Latest Project</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-8 glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-bold text-white">Activity Feed</h2>
            <p className="text-[10px] text-zinc-500">Live operational ledger logs</p>
          </div>
          <div className="flex flex-col gap-3">
            {activityFeed.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No recent activity to display. Get started by analyzing a concept.
              </div>
            ) : (
              activityFeed.map((log) => (
                <div key={log.id} className="flex justify-between items-center border-b border-zinc-900 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 shrink-0">
                      {log.icon}
                    </div>
                    <span className="text-xs font-semibold text-zinc-300 truncate max-w-xs sm:max-w-md">{log.text}</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 shrink-0 ml-4">{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Advanced Charts Panels */}
      {isClient && totalAnalyses > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Score Distribution */}
          <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Startup Score Distribution</h3>
              <p className="text-[10px] text-zinc-500">Breakdown of portfolios by overall grade bracket</p>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', fontSize: '10px' }} />
                  <Bar dataKey="count" name="Startup Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Revenue Potential Economics */}
          <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Monetization Economics</h3>
              <p className="text-[10px] text-zinc-500">Comparing average tier pricing to AI validation coefficients</p>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenuePotentialData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="avgPricing" name="Avg Subscription ($)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="viability" name="Viability Index" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Industry Share Distribution */}
          <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Portfolio Industries</h3>
              <p className="text-[10px] text-zinc-500">Breakdown of commercial categories</p>
            </div>
            <div className="h-60 w-full flex items-center justify-center">
              <div className="w-[50%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[50%] flex flex-col gap-1.5 text-[10px]">
                {industryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-zinc-400 truncate font-semibold">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 4: Market Dynamics Area */}
          <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Market Opportunities vs Competitor Density</h3>
              <p className="text-[10px] text-zinc-500">Ratio of calculated opportunities to competitors found</p>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketOpportunityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Area type="monotone" dataKey="opportunities" name="Opportunities Count" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="competitors" name="Competitors Found" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Startup Analyses Table */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Startup Analyses</h2>
          <p className="text-xs text-zinc-500 font-light">Your history of analyzed startup concepts.</p>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl border border-zinc-900 p-12 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <span className="text-zinc-500 text-xs mt-2">Loading validation database...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card rounded-2xl border border-zinc-900 p-12 text-center flex flex-col items-center justify-center gap-4">
            <Layers className="w-8 h-8 text-zinc-600" />
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-bold text-zinc-400">No projects found</h3>
              <p className="text-[10px] text-zinc-500">Get started by analyzing your first business concept.</p>
            </div>
            <Link
              href="/dashboard/analyze"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white mt-2"
            >
              Analyze Idea
            </Link>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-zinc-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-500 uppercase font-mono text-[9px] tracking-wider">
                    <th className="p-4 font-bold">Startup Name</th>
                    <th className="p-4 font-bold">Industry</th>
                    <th className="p-4 font-bold">Stage</th>
                    <th className="p-4 font-bold text-center">Score</th>
                    <th className="p-4 font-bold text-center">Exports</th>
                    <th className="p-4 font-bold">Date Created</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => (
                    <tr 
                      key={proj.id} 
                      className="border-b border-zinc-900 hover:bg-zinc-950/20 transition-colors"
                    >
                      <td className="p-4">
                        <Link href={`/dashboard/projects/${proj.id}`} className="font-bold text-zinc-200 hover:text-violet-400 truncate block max-w-xs">
                          {proj.name}
                        </Link>
                      </td>
                      <td className="p-4 text-zinc-400 truncate">{proj.industry}</td>
                      <td className="p-4 text-zinc-400 font-light">{proj.stage}</td>
                      <td className="p-4 text-center">
                        <span className={`
                          px-2 py-0.5 rounded-full text-[10px] font-bold
                          ${(proj.report?.score?.overall || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            (proj.report?.score?.overall || 0) >= 65 ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
                        `}>
                          {proj.report?.score?.overall || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center text-zinc-400 font-mono">{proj.exportCount || 0}</td>
                      <td className="p-4 text-zinc-500 font-mono text-[10px]">
                        {new Date(proj.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/projects/${proj.id}`}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            title="View Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={(e) => handleDuplicate(proj.id, e)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(proj.id, e)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
