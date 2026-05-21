import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <nav className="sticky top-0 z-40" style={{
      borderBottom: '1px solid rgba(255,255,255,0.7)',
      background: 'rgba(248,251,255,0.8)',
      backdropFilter: 'blur(24px) saturate(1.6)',
      boxShadow: '0 1px 0 rgba(29,78,216,0.05), 0 8px 32px rgba(10,22,40,0.06)',
    }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)', boxShadow: '0 4px 12px rgba(29,78,216,0.35)' }}>
            <Layers size={18} className="text-white" strokeWidth={2.5} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #1d4ed8 100%)' }} />
            <Layers size={18} className="text-white absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
              <div className="font-bold text-[15px] tracking-tight" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}>
                TeamTaskManager
              </div>
            <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-400">Team Workspace</div>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* User pill */}
          <div className="flex items-center gap-2.5 rounded-2xl px-3 py-2"
            style={{ border: '1px solid rgba(226,232,240,0.9)', background: 'rgba(255,255,255,0.9)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] font-bold text-slate-800 leading-tight">{user.name}</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">{user.role || 'Member'}</div>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="group inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-bold text-slate-600 transition-all duration-200"
            style={{ border: '1px solid rgba(226,232,240,0.9)', background: 'rgba(255,255,255,0.9)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(254,242,242,0.95)'; e.currentTarget.style.borderColor = 'rgba(254,202,202,0.9)'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.borderColor = 'rgba(226,232,240,0.9)'; e.currentTarget.style.color = '#475569'; }}>
            <LogOut size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
