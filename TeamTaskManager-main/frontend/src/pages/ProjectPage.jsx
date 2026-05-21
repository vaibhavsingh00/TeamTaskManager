import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import { Plus, ArrowLeft, Users, ClipboardList, CheckCircle2, X, Crown } from 'lucide-react';

const emptyTaskForm = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'Medium',
  status: 'To Do',
  assignedTo: '',
};

const COLUMNS = [
  { status: 'To Do',       label: 'To Do',       dot: 'bg-slate-400',  accent: 'rgba(100,116,139,0.15)', accentBorder: 'rgba(148,163,184,0.4)', count: 'bg-slate-100 text-slate-600' },
  { status: 'In Progress', label: 'In Progress',  dot: 'bg-amber-400',  accent: 'rgba(245,158,11,0.1)',  accentBorder: 'rgba(252,211,77,0.5)',  count: 'bg-amber-50 text-amber-700' },
  { status: 'Done',        label: 'Done',         dot: 'bg-emerald-400', accent: 'rgba(16,185,129,0.1)', accentBorder: 'rgba(110,231,183,0.5)', count: 'bg-emerald-50 text-emerald-700' },
];

const ProjectPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('create');
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showDeleteTaskConfirmation, setShowDeleteTaskConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [newTask, setNewTask] = useState(emptyTaskForm);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [notification, setNotification] = useState(null);

  const fetchProjectData = async () => {
    try {
      const { data: projectsData } = await API.get('/projects');
      const currentProject = projectsData.find(p => p._id === id);
      if (!currentProject) throw new Error('Project not found');
      setProject(currentProject);
      const { data: tasksData } = await API.get(`/tasks/project/${id}`);
      setTasks(tasksData);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchProjectData(); }, [id]);

  const fetchAvailableUsers = async () => {
    try {
      const { data } = await API.get('/auth/users');
      setAvailableUsers(data);
    } catch (err) { console.error(err); }
  };

  const buildEmailSuggestions = (value, users = availableUsers) => {
    if (!project) return [];
    const currentMemberIds = project.members?.map(m => m._id) || [];
    const adminId = project.admin?._id || project.admin;
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return users.filter(u => u._id !== adminId && !currentMemberIds.includes(u._id) &&
      (u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))).slice(0, 5);
  };

  useEffect(() => {
    if (showMemberModal) { fetchAvailableUsers(); } else { setNewMemberEmail(''); setEmailSuggestions([]); }
  }, [showMemberModal]);

  useEffect(() => {
    if (showMemberModal) setEmailSuggestions(newMemberEmail.trim() ? buildEmailSuggestions(newMemberEmail) : []);
  }, [availableUsers, project, newMemberEmail, showMemberModal]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openCreateTaskModal = () => { setTaskModalMode('create'); setTaskToEdit(null); setNewTask(emptyTaskForm); setShowTaskModal(true); };
  const openEditTaskModal = (task) => {
    setTaskModalMode('edit'); setTaskToEdit(task);
    setNewTask({ title: task.title || '', description: task.description || '', dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '', priority: task.priority || 'Medium', status: task.status || 'To Do', assignedTo: task.assignedTo?._id || task.assignedTo || '' });
    setShowTaskModal(true);
  };
  const closeTaskModal = () => { setShowTaskModal(false); setTaskToEdit(null); setTaskModalMode('create'); setNewTask(emptyTaskForm); };

  const handleEmailChange = e => { setNewMemberEmail(e.target.value); setEmailSuggestions(buildEmailSuggestions(e.target.value)); };
  const selectSuggestion = email => { setNewMemberEmail(email); setEmailSuggestions([]); };

  const handleStatusChange = async (taskId, newStatus) => {
    try { await API.patch(`/tasks/${taskId}`, { status: newStatus }); fetchProjectData(); }
    catch (err) { showNotification(err.response?.data?.message || 'Error updating status', 'error'); }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (taskModalMode === 'edit' && taskToEdit) {
        await API.patch(`/tasks/${taskToEdit._id}`, newTask);
        showNotification('Task updated!', 'success');
      } else {
        await API.post('/tasks', { ...newTask, projectId: id });
        showNotification('Task created!', 'success');
      }
      closeTaskModal(); fetchProjectData();
    } catch (err) { showNotification(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDeleteTask = task => { setTaskToDelete(task); setShowDeleteTaskConfirmation(true); };
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try { await API.delete(`/tasks/${taskToDelete._id}`); showNotification('Task deleted!', 'success'); setShowDeleteTaskConfirmation(false); setTaskToDelete(null); fetchProjectData(); }
    catch (err) { showNotification(err.response?.data?.message || 'Error deleting task', 'error'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try { await API.post(`/projects/${id}/add-member`, { email: newMemberEmail }); setShowMemberModal(false); setNewMemberEmail(''); setEmailSuggestions([]); showNotification('Member added!', 'success'); fetchProjectData(); }
    catch (err) { showNotification(err.response?.data?.message || 'Error adding member', 'error'); }
  };

  const handleRemoveMember = member => { setMemberToRemove(member); setShowRemoveConfirmation(true); };
  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try { await API.delete(`/projects/${id}/remove-member/${memberToRemove._id}`); showNotification('Member removed!', 'success'); setShowRemoveConfirmation(false); setMemberToRemove(null); fetchProjectData(); }
    catch (err) { showNotification(err.response?.data?.message || 'Error removing member', 'error'); }
  };

  if (loading) return (
    <div className="app-shell min-h-screen"><Navbar />
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading board…</p>
        </div>
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="app-shell min-h-screen"><Navbar />
      <main className="page-wrap">
        <div className="mt-10 rounded-2xl py-16 px-6 text-center"
          style={{ border: '2px dashed rgba(203,213,225,0.8)', background: 'rgba(248,250,252,0.6)' }}>
          <p className="font-bold text-lg text-slate-700 mb-2">Project not found</p>
          <p className="text-sm text-slate-400 mb-6">{error || "This project doesn't exist or you don't have access."}</p>
          <Link to="/" className="btn-primary py-2.5 text-sm"><ArrowLeft size={15} /> Back to Dashboard</Link>
        </div>
      </main>
    </div>
  );

  const isAdmin = (project.admin?._id === user._id) || (project.admin === user._id);
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const progressPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const renderColumn = ({ status, label, dot, accent, accentBorder, count }) => {
    const colTasks = tasks.filter(t => t.status === status);
    return (
      <div key={status} className="kanban-col animate-fade-up">
        {/* Column header */}
        <div className="kanban-col-header">
          <div className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dot}`} />
            <h3 className="text-[13px] font-bold text-slate-700">{label}</h3>
          </div>
          <span className={`rounded-xl px-2.5 py-1 text-[11px] font-bold ${count}`}
            style={{ border: `1px solid ${accentBorder}` }}>
            {colTasks.length}
          </span>
        </div>

        {/* Tasks */}
        <div className="kanban-col-body">
          {colTasks.map(task => (
            <TaskCard key={task._id} task={task} user={user} isAdmin={isAdmin}
              handleStatusChange={handleStatusChange} onEditTask={openEditTaskModal} onDeleteTask={handleDeleteTask} />
          ))}
          {colTasks.length === 0 && (
            <div className="flex h-24 items-center justify-center rounded-2xl text-[12px] font-medium text-slate-400"
              style={{ border: '1.5px dashed rgba(203,213,225,0.7)', background: 'rgba(248,250,252,0.5)' }}>
              No tasks here
            </div>
          )}
        </div>
      </div>
    );
  };

  const toastColors = {
    success: { bg: 'rgba(209,250,229,0.97)', border: 'rgba(110,231,183,0.6)', text: '#065f46' },
    error:   { bg: 'rgba(254,226,226,0.97)', border: 'rgba(252,165,165,0.6)', text: '#991b1b' },
    info:    { bg: 'rgba(219,234,254,0.97)', border: 'rgba(147,197,253,0.6)', text: '#1e40af' },
  };

  return (
    <div className="app-shell min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      {/* Toast */}
      {notification && (() => {
        const t = toastColors[notification.type] || toastColors.info;
        return (
          <div className="toast fixed top-4 right-4 z-50 rounded-2xl px-5 py-3 text-sm font-bold shadow-xl"
            style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.text, boxShadow: '0 8px 32px rgba(10,22,40,0.12)' }}>
            {notification.message}
          </div>
        );
      })()}

      {/* Page header */}
      <header className="page-wrap pb-0">
        <div className="hero-panel p-6 sm:p-8">
          <div className="orb w-64 h-64 -right-10 -top-10 bg-cyan-400/6 animate-float" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <Link to="/" className="accent-chip mb-4 inline-flex text-blue-700 hover:text-blue-800 transition-colors">
                <ArrowLeft size={12} /> Back to Dashboard
              </Link>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {project.name}
                </h1>
                {isAdmin && (
                  <span className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ background: 'rgba(237,233,254,0.8)', color: '#6d28d9', border: '1px solid rgba(196,181,253,0.6)' }}>
                    <Crown size={11} /> Admin View
                  </span>
                )}
              </div>
              <p className="page-subtitle max-w-2xl">{project.description || 'A shared workspace for your team to ship work with clarity.'}</p>

              {/* Stats chips + progress */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="accent-chip"><Users size={11} /> {(project.members?.length || 0) + 1} collaborators</span>
                <span className="accent-chip"><ClipboardList size={11} /> {tasks.length} tasks</span>
                <span className="accent-chip"><CheckCircle2 size={11} /> {doneCount} done</span>
                {tasks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ background: 'rgba(226,232,240,0.8)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #10b981, #0891b2)' }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{progressPct}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <button onClick={() => setShowMemberModal(true)} className="btn-secondary gap-2 py-2.5 text-[13px]">
                  <Users size={16} /> Manage Members
                </button>
              )}
              {isAdmin && (
                <button onClick={openCreateTaskModal} className="btn-primary gap-2 py-2.5 text-[13px]">
                  <Plus size={16} /> Add Task
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Kanban board */}
      <main className="page-wrap flex-1 overflow-x-auto pt-6">
        <div className="flex gap-5 pb-4" style={{ minWidth: 'fit-content' }}>
          {COLUMNS.map(col => renderColumn(col))}
        </div>
      </main>

      {/* ── Task Modal ── */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card w-full max-w-md p-8 animate-scale-in">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
              {taskModalMode === 'edit' ? 'Edit Task' : 'New Task'}
            </div>
            <h2 className="mb-6 text-xl font-black text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Task details</h2>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Title</label>
                <input type="text" required className="input-field" value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title…" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Description</label>
                <textarea className="input-field" rows="3" value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Optional description…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Due Date</label>
                  <input type="date" required className="input-field" value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Priority</label>
                  <select className="input-field font-medium" value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Status</label>
                <select className="input-field font-medium" value={newTask.status}
                  onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                  <option>To Do</option><option>In Progress</option><option>Done</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Assign To</label>
                <select className="input-field font-medium" value={newTask.assignedTo}
                  onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                  <option value="">Unassigned (Open)</option>
                  {project.members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  <option value={project.admin._id || project.admin}>Myself (Admin)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.7)' }}>
                <button type="button" onClick={closeTaskModal} className="btn-secondary py-2.5 text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary py-2.5 text-[13px]">
                  {taskModalMode === 'edit' ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Members Modal ── */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowMemberModal(false)}>
          <div className="glass-card w-full max-w-md p-8 max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={e => e.stopPropagation()}>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Team Management</div>
            <h2 className="mb-6 text-xl font-black text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Manage Members</h2>

            <div className="mb-7">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Current Members ({(project.members?.length || 0) + 1})
              </h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {/* Admin */}
                <div className="flex items-center justify-between rounded-2xl p-3"
                  style={{ background: 'rgba(237,233,254,0.6)', border: '1px solid rgba(196,181,253,0.5)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl text-[12px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6d28d9, #1d4ed8)' }}>
                      {project.admin?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">{project.admin?.name || 'Admin'}</p>
                      <p className="text-[11px] text-slate-500">{project.admin?.email}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-bold"
                    style={{ background: 'rgba(237,233,254,0.9)', color: '#6d28d9', border: '1px solid rgba(196,181,253,0.6)' }}>
                    <Crown size={10} /> Admin
                  </span>
                </div>

                {project.members?.length > 0 ? project.members.map(member => (
                  <div key={member._id} className="flex items-center justify-between rounded-2xl p-3"
                    style={{ background: 'rgba(248,250,252,0.9)', border: '1px solid rgba(226,232,240,0.7)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl text-[12px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)' }}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">{member.name}</p>
                        <p className="text-[11px] text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveMember(member)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(254,226,226,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <X size={15} />
                    </button>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 italic py-2">No members added yet</p>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(226,232,240,0.7)' }} className="pt-6">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Add Member</h3>
              <form onSubmit={handleAddMember} className="space-y-3">
                <div className="relative">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">User Email</label>
                  <input type="email" required placeholder="user@example.com" className="input-field"
                    value={newMemberEmail} onChange={handleEmailChange}
                    onBlur={() => setTimeout(() => setEmailSuggestions([]), 200)} autoFocus />
                  {emailSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-2xl shadow-xl"
                      style={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(226,232,240,0.9)', backdropFilter: 'blur(12px)' }}>
                      {emailSuggestions.map(u => (
                        <button key={u._id} type="button" onClick={() => selectSuggestion(u.email)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                          style={{ borderBottom: '1px solid rgba(241,245,249,0.8)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(219,234,254,0.4)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)' }}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-800">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary py-2.5 text-[13px]">Cancel</button>
                  <button type="submit" className="btn-primary py-2.5 text-[13px]">Add Member</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove Member Confirm ── */}
      {showRemoveConfirmation && memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowRemoveConfirmation(false)}>
          <div className="glass-card w-full max-w-sm p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(254,226,226,0.8)', border: '1px solid rgba(252,165,165,0.5)' }}>
              <X size={22} style={{ color: '#dc2626' }} />
            </div>
            <h2 className="mb-2 text-xl font-black text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Remove Member?</h2>
            <p className="mb-7 text-[14px] text-slate-500 leading-6">
              Remove <span className="font-bold text-slate-700">{memberToRemove.name}</span> from this project? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRemoveConfirmation(false)} className="btn-secondary py-2.5 text-[13px]">Cancel</button>
              <button onClick={confirmRemoveMember} className="rounded-2xl px-5 py-2.5 text-[13px] font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Task Confirm ── */}
      {showDeleteTaskConfirmation && taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowDeleteTaskConfirmation(false)}>
          <div className="glass-card w-full max-w-sm p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(254,226,226,0.8)', border: '1px solid rgba(252,165,165,0.5)' }}>
              <X size={22} style={{ color: '#dc2626' }} />
            </div>
            <h2 className="mb-2 text-xl font-black text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Delete Task?</h2>
            <p className="mb-7 text-[14px] text-slate-500 leading-6">
              Delete <span className="font-bold text-slate-700">"{taskToDelete.title}"</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteTaskConfirmation(false)} className="btn-secondary py-2.5 text-[13px]">Cancel</button>
              <button onClick={confirmDeleteTask} className="rounded-2xl px-5 py-2.5 text-[13px] font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}>
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
