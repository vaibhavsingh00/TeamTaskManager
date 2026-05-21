import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, CheckSquare, ShieldCheck, KanbanSquare, Layers, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <ShieldCheck size={16} />, title: 'Admin controls', desc: 'Members, tasks, and access from one workspace' },
    { icon: <KanbanSquare size={16} />, title: 'Status tracking', desc: 'Move tasks from to-do to done with clarity' },
    { icon: <CheckSquare size={16} />, title: 'Deadline focus', desc: 'Overdue items stand out immediately' },
  ];

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] -top-40 -left-40 bg-blue-500/8 animate-float" />
      <div className="orb w-[400px] h-[400px] -bottom-20 -right-20 bg-violet-500/6 animate-float delay-3" />
      <div className="orb w-[300px] h-[300px] top-1/2 left-1/3 bg-cyan-400/5 animate-float delay-2" />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">

        {/* Left: Hero panel */}
        <section className="hero-panel order-2 lg:order-1 p-8 sm:p-10 animate-fade-up">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-60 animate-float"
            style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.12), transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute -left-8 bottom-0 h-44 w-44 rounded-full opacity-50 animate-float delay-2"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)', filter: 'blur(32px)' }} />

          <div className="relative">
            {/* Brand mark */}
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)', boxShadow: '0 4px 16px rgba(29,78,216,0.3)' }}>
                <Layers size={20} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>TeamTaskManager</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Team Workspace</div>
              </div>
            </div>

            <div className="accent-chip mb-5 w-fit">Collaborative planning, made sharp</div>
            <h1 className="max-w-sm text-4xl font-black tracking-tight text-slate-950 sm:text-5xl leading-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              A calmer way to<br />
              <span className="text-shimmer">move work forward.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-slate-500">
              TeamTaskManager helps teams create projects, assign work, and keep progress visible — without the clutter.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {features.map(({ icon, title, desc }, i) => (
                <div key={title} className={`rounded-2xl p-4 animate-fade-up delay-${i + 2}`}
                  style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(10,22,40,0.05)', backdropFilter: 'blur(12px)' }}>
                  <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
                    {icon}
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Form */}
        <section className="glass-card order-1 p-7 sm:p-8 animate-fade-up delay-1">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to your team workspace.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl p-4 text-sm"
              style={{ background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(252,165,165,0.5)', color: '#991b1b' }}>
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Email Address</label>
              <input type="email" required className="input-field" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Password</label>
              <input type="password" required className="input-field" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2 py-3.5 text-[14px]">
              {isLoading ? (
                <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight size={15} /></span>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm font-medium text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Sign up</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
