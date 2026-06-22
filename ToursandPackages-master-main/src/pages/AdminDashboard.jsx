import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, RefreshCw, LogOut, Search, Calendar, Users, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0 });

  // Check if admin is already logged in on session start
  useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdmin(true);
      fetchUsers();
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      sessionStorage.setItem('adminToken', data.token);
      setIsAdmin(true);
      fetchUsers();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setStats({ totalUsers: data.users ? data.users.length : 0 });
      }
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAdmin(false);
    setAdminUsername('');
    setAdminPassword('');
    setUsers([]);
  };

  // Filter users based on query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-24 relative overflow-hidden">
      {/* Dynamic Backdrops */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!isAdmin ? (
            /* ADMIN LOGIN CARD */
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md mx-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-10"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 dark:from-slate-100 dark:via-white dark:to-slate-300 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white dark:text-slate-900" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">Admin Portal</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                  Sign in using your administrator credentials.
                </p>
              </div>

              {authError && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm font-semibold rounded-2xl border border-rose-200/50 dark:border-rose-900/50">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800/60 border border-transparent focus:border-slate-500/80 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/10 text-slate-900 dark:text-white placeholder-slate-400 text-[15px] font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800/60 border border-transparent focus:border-slate-500/80 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/10 text-slate-900 dark:text-white placeholder-slate-400 text-[15px] font-medium transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Secure Login'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          ) : (
            /* ADMIN DASHBOARD VIEW */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header metrics card */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">Admin Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Managing users spreadsheet database.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchUsers}
                    className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
                    title="Reload Data"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl transition-all shadow-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Grid indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Total Registered</p>
                    <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">{stats.totalUsers} Users</h3>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Database Format</p>
                    <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-1">Excel CSV Sheet</h3>
                  </div>
                </div>
              </div>

              {/* Table User list */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h4 className="text-lg font-black text-slate-950 dark:text-white">Registered Accounts</h4>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search username or email..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-800/50">
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">Username</th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">Email Address</th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">Registration Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              {user.username}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                              <span className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-slate-400" />
                                {user.email}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {user.registeredAt ? new Date(user.registeredAt).toLocaleString() : 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-medium text-sm">
                            {loading ? 'Fetching registered accounts...' : 'No users found matching query.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
