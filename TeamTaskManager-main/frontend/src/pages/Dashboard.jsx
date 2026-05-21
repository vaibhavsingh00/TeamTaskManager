import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import { AlertCircle, Folder, Plus, Users, TrendingUp, Clock, CheckCircle2, Layers } from 'lucide-react';

const StatCard = ({ label, value, icon, style, delay }) => (
  <div className={`stat-card animate-fade-up ${delay}`}
    style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 20px rgba(10,22,40,0.06)', ...style }}>
    <div className="absolute inset-0 rounded-[1.25rem] opacity-40"
      style={{ background: 'radial-gradient(120% 120% at 80% 0%, rgba(29,78,216,0.06), transparent)' }} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">{label}</p>
        <div className="text-4xl font-black text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>{value ?? 0}</div>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.1), rgba(6,182,212,0.1))' }}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        API.get('/dashboard'),
        API.get('/projects'),
      ]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await API.post('/projects', newProject);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell min-h-screen">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading your workspace…</p>
          </div>
        </div>
      </div>
    );
  }

  const overdueCount = stats?.overdueTasks || 0;

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Navbar />
      <main className="page-wrap flex-1">

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl p-4 text-sm font-medium animate-fade-up"
            style={{ background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(252,165,165,0.5)', color: '#991b1b' }}>
            <AlertCircle size={16} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Hero panel */}
        <section className="hero-panel mb-8 animate-fade-up">
          <div className="orb w-80 h-80 -right-20 -top-10 bg-blue-500/8 animate-float" />
          <div className="orb w-60 h-60 -left-10 bottom-0 bg-cyan-400/6 animate-float delay-3" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10 items-center">
            <div>
              <div className="accent-chip mb-5 w-fit">
                <Layers size={10} /> Team command center
              </div>
              <h1 className="page-heading">
                Good to see you,<br />
                <span className="text-shimmer">{user.name.split(' ')[0]}.</span>
              </h1>
              <p className="page-subtitle">Track work, see team distribution, and keep projects moving without losing sight of deadlines.</p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="accent-chip"><Users size={10} /> {user.role || 'Member'}</span>
                <span className="accent-chip"><Folder size={10} /> {stats?.projectsCount || 0} projects</span>
                <span className="accent-chip"><TrendingUp size={10} /> {stats?.myTasksCount || 0} assigned to me</span>
              </div>
            </div>

            {/* Overdue callout */}
            <div className="flex-shrink-0 w-full max-w-[200px] rounded-2xl p-5 text-white lg:w-52"
              style={{ background: overdueCount > 0 ? 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' : 'linear-gradient(135deg, #065f46 0%, #0f766e 100%)', boxShadow: '0 8px 32px rgba(10,22,40,0.2)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 mb-2">
                {overdueCount > 0 ? 'Needs attention' : 'All caught up'}
              </p>
              <div className="text-5xl font-black mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{overdueCount}</div>
              <p className="text-[12px] text-white/70">{overdueCount === 1 ? 'overdue task' : 'overdue tasks'}</p>
            </div>
          </div>
        </section>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Active Projects" value={stats?.projectsCount} icon={<Folder size={18} className="text-blue-600" />} delay="delay-1" />
          <StatCard label="My Tasks" value={stats?.myTasksCount} icon={<TrendingUp size={18} className="text-cyan-600" />} delay="delay-2" />
          <StatCard label="Overdue" value={overdueCount}
            icon={<Clock size={18} style={{ color: overdueCount > 0 ? '#ef4444' : '#10b981' }} />}
            style={overdueCount > 0 ? { borderColor: 'rgba(252,165,165,0.5)' } : {}}
            delay="delay-3" />
        </div>

        {/* Projects section */}
        <div className="section-card p-6 md:p-8 animate-fade-up delay-2">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5" style={{ fontFamily: "'Syne', sans-serif" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: 'rgba(219,234,254,0.8)', border: '1px solid rgba(147,197,253,0.5)' }}>
                <Folder size={15} className="text-blue-600" />
              </div>
              Your Projects
            </h2>
            {user.role === 'Admin' && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary gap-2 py-2.5 text-[13px]">
                <Plus size={15} /> New Project
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
              style={{ border: '2px dashed rgba(203,213,225,0.8)', background: 'rgba(248,250,252,0.5)' }}>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(219,234,254,0.6)', border: '1px solid rgba(147,197,253,0.4)' }}>
                <Folder size={28} className="text-blue-400" />
              </div>
              <p className="text-base font-bold text-slate-600 mb-1">No projects yet</p>
              <p className="text-sm text-slate-400">Create your first project to start collaborating.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <div key={project._id} className={`delay-${(i % 5) + 1}`}>
                  <ProjectCard project={project} user={user} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {user.role === 'Admin' && showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowCreateModal(false)}>
          <div className="glass-card w-full max-w-md p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-slate-900 mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Project Name</label>
                <input type="text" required className="input-field" value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="My Awesome Project" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Description</label>
                <textarea className="input-field" rows="3" value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What is this project about?" />
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.7)' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary py-2.5 text-[13px]">Cancel</button>
                <button type="submit" disabled={isCreating} className="btn-primary py-2.5 text-[13px]">
                  {isCreating ? (
                    <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating…</span>
                  ) : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
