'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    pendingQueue: 0,
    articlesThisWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch articles count
        const articlesRes = await fetch('/api/admin/articles?limit=1');
        const articlesData = await articlesRes.json();

        // Fetch queue count
        const queueRes = await fetch('/api/admin/queue');
        const queueData = await queueRes.json();

        setStats({
          totalArticles: articlesData.total || 0,
          pendingQueue: queueData.queue?.length || 0,
          articlesThisWeek: articlesData.thisWeek || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cream">Dashboard</h1>
        <p className="text-cream/60 mt-1">Welcome to the admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Articles */}
        <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cream/60 text-sm">Total Articles</p>
              <p className="text-3xl font-bold text-cream mt-1">
                {isLoading ? '-' : stats.totalArticles}
              </p>
            </div>
            <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Queue */}
        <div className="bg-dark-card border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cream/60 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">
                {isLoading ? '-' : stats.pendingQueue}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-dark-card border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cream/60 text-sm">Added This Week</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {isLoading ? '-' : stats.articlesThisWeek}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-card border border-gold/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-cream mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/ai-review"
            className="flex items-center gap-3 p-4 bg-dark-bg rounded-lg border border-gold/10 hover:border-gold/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-cream font-medium">AI Review</p>
              <p className="text-cream/50 text-sm">Approve reflections</p>
            </div>
          </Link>

          <Link
            href="/admin/queue"
            className="flex items-center gap-3 p-4 bg-dark-bg rounded-lg border border-gold/10 hover:border-gold/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-cream font-medium">News Queue</p>
              <p className="text-cream/50 text-sm">{stats.pendingQueue} pending</p>
            </div>
          </Link>

          <Link
            href="/admin/add"
            className="flex items-center gap-3 p-4 bg-dark-bg rounded-lg border border-gold/10 hover:border-gold/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-cream font-medium">Add Article</p>
              <p className="text-cream/50 text-sm">Manual entry</p>
            </div>
          </Link>

          <Link
            href="/admin/articles"
            className="flex items-center gap-3 p-4 bg-dark-bg rounded-lg border border-gold/10 hover:border-gold/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <p className="text-cream font-medium">Manage Articles</p>
              <p className="text-cream/50 text-sm">{stats.totalArticles} total</p>
            </div>
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-dark-bg rounded-lg border border-gold/10 hover:border-gold/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center group-hover:bg-gold/30 transition-colors">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-cream font-medium">View Site</p>
              <p className="text-cream/50 text-sm">Public view</p>
            </div>
          </a>
        </div>
      </div>

      {/* Setup Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-blue-400 font-medium mb-2">Setup Required</h3>
        <p className="text-cream/70 text-sm mb-4">
          To use the admin panel, you need to set up Supabase and add environment variables:
        </p>
        <ul className="text-cream/60 text-sm space-y-1 list-disc list-inside">
          <li>Create a Supabase project at supabase.com</li>
          <li>Run the SQL schema to create tables</li>
          <li>Add SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY to .env.local</li>
          <li>Add ADMIN_PASSWORD to .env.local</li>
        </ul>
      </div>
    </div>
  );
}
