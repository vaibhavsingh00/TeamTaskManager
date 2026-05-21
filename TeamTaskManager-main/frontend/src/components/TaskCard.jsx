import { Clock, User as UserIcon, Pencil, Trash2, AlertCircle, Loader, CheckCircle } from 'lucide-react';

const statusConfig = {
  'Done':        { bg: 'rgba(209,250,229,0.8)', text: '#065f46', border: 'rgba(167,243,208,0.7)', icon: <CheckCircle size={10}/> },
  'In Progress': { bg: 'rgba(254,243,199,0.8)', text: '#92400e', border: 'rgba(252,211,77,0.5)',  icon: <Loader size={10}/> },
  'To Do':       { bg: 'rgba(241,245,249,0.8)', text: '#374151', border: 'rgba(203,213,225,0.7)', icon: <AlertCircle size={10}/> },
};
const priorityConfig = {
  'High':   { bar: 'linear-gradient(90deg,#ef4444,#f97316)', badge: 'rgba(254,226,226,0.85)', badgeText: '#991b1b', badgeBorder: 'rgba(252,165,165,0.6)' },
  'Medium': { bar: 'linear-gradient(90deg,#f59e0b,#eab308)', badge: 'rgba(254,243,199,0.85)', badgeText: '#92400e', badgeBorder: 'rgba(252,211,77,0.5)' },
  'Low':    { bar: 'linear-gradient(90deg,#38bdf8,#34d399)', badge: 'rgba(224,242,254,0.85)', badgeText: '#075985', badgeBorder: 'rgba(125,211,252,0.5)' },
};

const TaskCard = ({ task, user, isAdmin, handleStatusChange, onEditTask, onDeleteTask }) => {
  const isAssignedToMe = task.assignedTo?._id === user._id || task.assignedTo === user._id;
  const canChangeStatus = isAdmin || isAssignedToMe;
  const s = statusConfig[task.status] || statusConfig['To Do'];
  const p = priorityConfig[task.priority] || priorityConfig['Medium'];

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <div className="group relative overflow-hidden rounded-[1.2rem] animate-fade-up"
      style={{
        border: '1px solid rgba(226,232,240,0.8)',
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 4px rgba(10,22,40,0.04), 0 8px 24px rgba(10,22,40,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(10,22,40,0.06), 0 16px 40px rgba(10,22,40,0.09)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(10,22,40,0.04), 0 8px 24px rgba(10,22,40,0.05)'; }}>

      {/* Priority bar */}
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: p.bar }} />

      <div className="p-4 pt-5">
        {/* Status + Priority row */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="task-status-badge flex items-center gap-1"
            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
            {s.icon} {task.status}
          </span>
          <span className="task-status-badge"
            style={{ background: p.badge, color: p.badgeText, border: `1px solid ${p.badgeBorder}` }}>
            {task.priority}
          </span>
        </div>

        {/* Title */}
        <h4 className="mb-2 text-[14px] font-bold leading-snug text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mb-3 line-clamp-2 text-[12px] leading-5 text-slate-500">{task.description}</p>
        )}

        {/* Meta row */}
        <div className="mb-4 flex items-center justify-between pt-3 text-[11px] font-semibold"
          style={{ borderTop: '1px solid rgba(226,232,240,0.6)' }}>
          <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            <Clock size={11} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] text-red-600 font-bold">Overdue</span>}
          </span>
          {task.assignedTo && (
            <span className="flex items-center gap-1 rounded-xl px-2 py-1"
              style={{ background: 'rgba(241,245,249,0.9)', color: '#475569', border: '1px solid rgba(226,232,240,0.7)' }}>
              <UserIcon size={10} /> {task.assignedTo.name?.split(' ')[0] || 'User'}
            </span>
          )}
        </div>

        {/* Actions */}
        {canChangeStatus ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              {task.status !== 'To Do' && (
                <button onClick={() => handleStatusChange(task._id, 'To Do')}
                  className="rounded-xl py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-150 hover:scale-[1.02]"
                  style={{ background: 'rgba(241,245,249,0.9)', color: '#475569', border: '1px solid rgba(226,232,240,0.8)' }}>
                  To Do
                </button>
              )}
              {task.status !== 'In Progress' && (
                <button onClick={() => handleStatusChange(task._id, 'In Progress')}
                  className="rounded-xl py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-150 hover:scale-[1.02]"
                  style={{ background: 'rgba(254,251,235,0.9)', color: '#92400e', border: '1px solid rgba(252,211,77,0.4)' }}>
                  Start
                </button>
              )}
              {task.status !== 'Done' && (
                <button onClick={() => handleStatusChange(task._id, 'Done')}
                  className="rounded-xl py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-150 hover:scale-[1.02]"
                  style={{ background: 'rgba(209,250,229,0.9)', color: '#065f46', border: '1px solid rgba(167,243,208,0.5)' }}>
                  Done
                </button>
              )}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => onEditTask?.(task)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-150 hover:scale-[1.02]"
                  style={{ background: 'rgba(219,234,254,0.9)', color: '#1e40af', border: '1px solid rgba(147,197,253,0.5)' }}>
                  <Pencil size={10} /> Edit
                </button>
                <button type="button" onClick={() => onDeleteTask?.(task)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-150 hover:scale-[1.02]"
                  style={{ background: 'rgba(254,226,226,0.9)', color: '#991b1b', border: '1px solid rgba(252,165,165,0.5)' }}>
                  <Trash2 size={10} /> Delete
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ background: 'rgba(248,250,252,0.9)', color: '#94a3b8', border: '1px solid rgba(226,232,240,0.7)' }}>
            View Only
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
