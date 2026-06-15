'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Trash2, Copy, Eye, Calendar, Layers, Download } from 'lucide-react';
import { db } from '@/lib/db';

export default function ProjectsHistoryPage() {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest_score, lowest_score

  const loadData = async () => {
    const list = await db.getProjects();
    setProjects(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    const list = await db.getProjects();
    setProjects(list);
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await db.deleteProject(id);
      await handleRefresh();
    }
  };

  const handleDuplicate = async (id, e) => {
    e.preventDefault();
    const duplicated = await db.duplicateProject(id);
    if (duplicated) {
      await handleRefresh();
    }
  };

  // Get unique options dynamically from projects list
  const industriesList = ['All', ...Array.from(new Set(projects.map((p) => p.industry || 'Tech')))];
  const countriesList = ['All', ...Array.from(new Set(projects.map((p) => p.country || 'Global')))];
  const stagesList = ['All', 'Idea Stage', 'MVP / Prototype', 'Pre-seed Stage', 'Seed Stage', 'Bootstrapped'];
  const scoresList = [
  { label: 'All Scores', val: 'All' },
  { label: '80+ Exceptional', val: '80+' },
  { label: '70-79 Validated', val: '70-79' },
  { label: '<70 Repivot', val: '<70' }];


  // Filtering Logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.idea.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.industry && p.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === 'All' || p.stage === stageFilter;
    const matchesIndustry = industryFilter === 'All' || p.industry === industryFilter;
    const matchesCountry = countryFilter === 'All' || p.country === countryFilter;

    // Score Range Matching
    const scoreVal = p.report?.score?.overall || 0;
    let matchesScore = true;
    if (scoreFilter === '80+') {
      matchesScore = scoreVal >= 80;
    } else if (scoreFilter === '70-79') {
      matchesScore = scoreVal >= 70 && scoreVal < 80;
    } else if (scoreFilter === '<70') {
      matchesScore = scoreVal < 70;
    }

    return matchesSearch && matchesStage && matchesIndustry && matchesCountry && matchesScore;
  });

  // Sorting Logic
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const scoreA = a.report?.score?.overall || 0;
    const scoreB = b.report?.score?.overall || 0;
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    if (sortBy === 'newest') return timeB - timeA;
    if (sortBy === 'oldest') return timeA - timeB;
    if (sortBy === 'highest_score') return scoreB - scoreA;
    if (sortBy === 'lowest_score') return scoreA - scoreB;
    return 0;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Project Archive</h1>
        <p className="text-xs text-zinc-500 font-light mt-1">Search, duplicate, filter, or inspect startup analysis reports.</p>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-xl">
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, idea description, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-violet-600 focus:outline-none text-xs text-white placeholder-zinc-500" />
            
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-violet-600 focus:outline-none text-xs text-white cursor-pointer font-medium">
              
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_score">Highest Score</option>
              <option value="lowest_score">Lowest Score</option>
            </select>
          </div>
        </div>

        {/* Row 2: Filtering Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-zinc-900 pt-4 mt-2">
          {/* Industry Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold">Industry</span>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-violet-600 focus:outline-none cursor-pointer">
              
              {industriesList.map((ind) =>
              <option key={ind} value={ind}>{ind}</option>
              )}
            </select>
          </div>

          {/* Country Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold">Country</span>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-violet-600 focus:outline-none cursor-pointer">
              
              {countriesList.map((c) =>
              <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold">Startup Stage</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-violet-600 focus:outline-none cursor-pointer">
              
              {stagesList.map((st) =>
              <option key={st} value={st}>{st}</option>
              )}
            </select>
          </div>

          {/* Score Range Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold">Score Viability</span>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-violet-600 focus:outline-none cursor-pointer">
              
              {scoresList.map((item) =>
              <option key={item.val} value={item.val}>{item.label}</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Custom Projects */}
      {sortedProjects.length === 0 ?
      <div className="glass-card rounded-2xl border border-zinc-900 p-16 text-center flex flex-col items-center justify-center gap-4">
          <Layers className="w-8 h-8 text-zinc-700" />
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-bold text-zinc-400">No projects match filters</h3>
            <p className="text-[10px] text-zinc-500">Try adjusting your query or create a new validation report.</p>
          </div>
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((proj) => {
          const isDemo = proj.id.startsWith('demo-');
          const scoreVal = proj.report?.score?.overall || 0;

          return (
            <div
              key={proj.id}
              className={`
                  glass-card rounded-2xl border p-5 flex flex-col justify-between gap-5 relative overflow-hidden group
                  ${isDemo ? 'border-zinc-900/60 bg-zinc-900/5' : 'border-zinc-900 hover:border-zinc-800'}
                `}>
              
                {/* Score Indicator Tag Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              scoreVal >= 80 ? 'bg-emerald-500' : scoreVal >= 65 ? 'bg-violet-500' : 'bg-amber-500'}`
              } />

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors truncate">
                      {proj.name}
                    </h3>
                    <span className={`
                      text-[9px] font-mono px-2 py-0.5 rounded shrink-0 font-bold uppercase
                      ${isDemo ? 'bg-violet-950/20 text-violet-400 border border-violet-900/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-850'}
                    `}>
                      {isDemo ? 'Sandbox' : 'Validated'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] font-semibold text-zinc-500 font-mono">
                    <span>{proj.industry}</span>
                    <span>•</span>
                    <span>{proj.country || 'Global'}</span>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-normal font-light line-clamp-3 mt-1.5">
                    {proj.idea}
                  </p>
                </div>

                <div className="border-t border-zinc-900/60 pt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{new Date(proj.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                    </div>
                    
                    {/* Score badge */}
                    <div className="flex items-center gap-1">
                      <span>Score:</span>
                      <span className={`font-bold ${
                    scoreVal >= 80 ? 'text-emerald-400' : scoreVal >= 65 ? 'text-violet-400' : 'text-amber-400'}`
                    }>{scoreVal}</span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-900/60">
                    <span className="text-[10px] text-zinc-500 font-mono italic max-w-[120px] truncate">{proj.stage}</span>
                    
                    <div className="flex items-center gap-2">
                      {/* Exports Counter label */}
                      <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-0.5 mr-1" title="PDF Reports Exported">
                        <Download className="w-3 h-3" />
                        <span>{proj.exportCount || 0}</span>
                      </span>

                      <Link
                      href={`/dashboard/projects/${proj.id}`}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors border border-zinc-850"
                      title="View Report">
                      
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors border border-zinc-850"
                      title="Duplicate">
                      
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                      onClick={(e) => handleDelete(proj.id, e)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-rose-400 transition-colors border border-zinc-850"
                      title="Delete">
                      
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>);

        })}
        </div>
      }
    </div>);

}