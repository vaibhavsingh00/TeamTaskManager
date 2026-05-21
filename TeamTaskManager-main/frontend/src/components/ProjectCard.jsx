import { Link } from 'react-router-dom';
import { Users, ArrowRight, Crown, UserCircle2 } from 'lucide-react';

const ProjectCard = ({ project, user }) => {
  const isAdmin = (project.admin?._id === user._id) || (project.admin === user._id);
  const memberCount = (project.members?.length || 0) + 1;

  const handleMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--rx', `${y * -10}deg`);
    el.style.setProperty('--ry', `${x * 10}deg`);
    el.style.setProperty('--gx', `${(e.clientX - rect.left)}px`);
    el.style.setProperty('--gy', `${(e.clientY - rect.top)}px`);
  };
  const handleMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  const gradients = isAdmin
    ? { bar: 'linear-gradient(90deg,#6d28d9,#1d4ed8,#0891b2)', bg: 'rgba(237,233,254,0.6)' }
    : { bar: 'linear-gradient(90deg,#1d4ed8,#0891b2,#10b981)', bg: 'rgba(219,234,254,0.5)' };

  return (
    <Link
      to={`/projects/${project._id}`}
      className="card-3d group relative block overflow-hidden rounded-[1.4rem] animate-fade-up"
      style={{
        border: '1px solid rgba(255,255,255,0.9)',
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 4px 6px -1px rgba(10,22,40,0.05), 0 16px 40px -8px rgba(10,22,40,0.09)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top gradient bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] transition-all duration-300 group-hover:h-[4px]"
        style={{ background: gradients.bar }} />

      {/* Spotlight on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[1.4rem]"
        style={{ background: 'radial-gradient(200px circle at var(--gx,50%) var(--gy,50%), rgba(29,78,216,0.04), transparent 70%)' }} />

      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-1 text-base font-bold text-slate-900 tracking-tight transition-colors group-hover:text-blue-700"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              {project.name}
            </h3>
          </div>
          <span className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{
              background: isAdmin ? 'rgba(237,233,254,0.8)' : 'rgba(241,245,249,0.8)',
              color: isAdmin ? '#6d28d9' : '#475569',
              border: `1px solid ${isAdmin ? 'rgba(196,181,253,0.6)' : 'rgba(203,213,225,0.7)'}`,
            }}>
            {isAdmin ? <Crown size={10} /> : <UserCircle2 size={10} />}
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>

        <p className="mb-5 min-h-[40px] line-clamp-2 text-sm leading-6 text-slate-500">
          {project.description || 'No description provided.'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid rgba(226,232,240,0.7)' }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            {/* Mini avatar stack */}
            <div className="flex -space-x-1.5 mr-1">
              {Array.from({ length: Math.min(memberCount, 3) }).map((_, i) => (
                <div key={i} className="h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold"
                  style={{
                    background: ['linear-gradient(135deg,#6d28d9,#1d4ed8)', 'linear-gradient(135deg,#1d4ed8,#0891b2)', 'linear-gradient(135deg,#0891b2,#10b981)'][i],
                    zIndex: 3 - i,
                  }} />
              ))}
            </div>
            <Users size={12} /> {memberCount} member{memberCount !== 1 ? 's' : ''}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:gap-1.5">
            Open <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
