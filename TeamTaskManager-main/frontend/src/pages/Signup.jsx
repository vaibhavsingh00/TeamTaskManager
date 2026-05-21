import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, CheckSquare, Rocket, Users, Layers, ArrowRight, Crown, UserCircle2 } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signup(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <Users size={16} />, title: 'Role based', desc: 'Admins manage people and tasks' },
    { icon: <Rocket size={16} />, title: 'Fast setup', desc: 'Start collaborating in minutes' },
    { icon: <CheckSquare size={16} />, title: 'Clean visibility', desc: 'Track progress without noise' },
  ];

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="orb w-[500px] h-[500px] -top-40 -right-40 bg-cyan-400/7 animate-float" />
      <div className="orb w-[400px] h-[400px] bottom-0 -left-20 bg-blue-500/6 animate-float delay-2" />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[420px_1fr]">

        {/* Left: Form */}
        <section className="glass-card p-7 sm:p-8 animate-fade-up">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Create your account</h2>
            <p className="mt-2 text-sm text-slate-500">Join your team and start managing tasks.</p>
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
              <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Full Name</label>
              <input type="text" required className="input-field" value={name}
                onChange={e => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Email Address</label>
              <input type="email" required className="input-field" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Password</label>
              <input type="password" required minLength={6} className="input-field" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>

            {/* Role selector */}
            <div>
              <label className="mb-2 block text-[13px] font-bold text-slate-700">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'Member', icon: <UserCircle2 size={16}/>, desc: 'Work on tasks' },
                  { val: 'Admin',  icon: <Crown size={16}/>,       desc: 'Manage projects' },
                ].map(({ val, icon, desc }) => (
                  <label key={val} className="cursor-pointer">
                    <input type="radio" name="role" value={val} checked={role === val} onChange={() => setRole(val)} className="sr-only" />
                    <div className="rounded-2xl p-3.5 transition-all duration-200"
                      style={{
                        border: role === val ? '2px solid rgba(29,78,216,0.6)' : '1.5px solid rgba(203,213,225,0.8)',
                        background: role === val ? 'rgba(219,234,254,0.6)' : 'rgba(248,250,252,0.8)',
                        boxShadow: role === val ? '0 0 0 4px rgba(29,78,216,0.08)' : 'none',
                      }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: role === val ? '#1d4ed8' : '#64748b' }}>{icon}</span>
                        <span className="text-[13px] font-bold" style={{ color: role === val ? '#1d4ed8' : '#374151' }}>{val}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-[14px] mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating…</span>
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight size={15} /></span>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Sign in</Link>
          </p>
        </section>

        {/* Right: Hero */}
        <section className="hero-panel hidden lg:block p-10 animate-fade-up delay-1">
          <div className="absolute -left-16 top-8 h-56 w-56 rounded-full opacity-60 animate-float"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute -right-8 bottom-0 h-44 w-44 rounded-full opacity-50 animate-float delay-3"
            style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.1), transparent 70%)', filter: 'blur(32px)' }} />

          <div className="relative">
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

            <div className="accent-chip mb-5 w-fit">Built for team execution</div>
            <h1 className="max-w-sm text-4xl font-black tracking-tight text-slate-950 leading-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Keep every project<br />
              <span className="text-shimmer">visible from day one.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-slate-500">
              Create a workspace where admins manage tasks, members stay aligned, and every deadline has a clear owner.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {features.map(({ icon, title, desc }, i) => (
                <div key={title} className={`rounded-2xl p-4 animate-fade-up delay-${i + 2}`}
                  style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(10,22,40,0.05)' }}>
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
      </div>
    </div>
  );
};

export default Signup;
