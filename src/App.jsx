import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Briefcase,
  Calendar,
  Settings,
  LayoutDashboard,
  ChevronRight,
  X,
  Globe,
  PlusCircle,
  ArrowLeftRight,
  Save,
  TrendingUp,
  AlignLeft,
  Filter,
  LogOut,
  CheckCircle2,
  Circle,
  User,
  Key
} from 'lucide-react';
import Login from './Login';
import Users from './Users';
import { Users as UsersIcon } from 'lucide-react';

const App = () => {
  // --- Auth State ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const openLogoutConfirm = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRegistros([]);
    setProjetos([]);
    setIsLogoutConfirmOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  // --- Estados Principais ---
  const [view, setView] = useState('dashboard');
  const [filtroProjetoId, setFiltroProjetoId] = useState('todos');
  const [filtroMesAno, setFiltroMesAno] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [registros, setRegistros] = useState([]);
  const [projetos, setProjetos] = useState([]);

  // --- Estados para Modais de Confirmação ---
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: null, // 'registro' ou 'projeto'
    id: null,
    nome: null
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Estados para troca de senha
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // --- API Helpers ---
  const authHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Helper to check auth and logout if unauthorized
  const checkAuthResponse = async (response) => {
    if (response.status === 401) {
      handleLogout();
      return null;
    }
    return response;
  };

  // --- Fetch Data on Load ---
  useEffect(() => {
    if (user) {
      fetch('/api/projects', { headers: authHeader() })
        .then(checkAuthResponse)
        .then(res => res ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data)) setProjetos(data);
        })
        .catch(err => console.error("Error fetching projects:", err));

      fetch('/api/registros', { headers: authHeader() })
        .then(checkAuthResponse)
        .then(res => res ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data)) setRegistros(data);
        })
        .catch(err => console.error("Error fetching records:", err));
    }
  }, [user]);

  // Fechar modais com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (deleteConfirmModal.isOpen) {
          setDeleteConfirmModal({ isOpen: false, type: null, id: null, nome: null });
        }
        if (isProfileModalOpen) {
          setIsProfileModalOpen(false);
        }
        if (isLogoutConfirmOpen) {
          setIsLogoutConfirmOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [deleteConfirmModal.isOpen, isProfileModalOpen, isLogoutConfirmOpen]);

  // --- Estados do Formulário de Registro ---
  const [form, setForm] = useState({
    projetoId: '',
    atividade: '',
    descricao: '',
    horas: '',
    data: new Date().toISOString().split('T')[0]
  });

  // --- Estados de Gestão de Projetos ---
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false); // true = visualização, false = edição
  const [currentProjectForm, setCurrentProjectForm] = useState({
    id: null,
    nome: '',
    valorHora: '',
    moeda: 'BRL',
    atividades: [],
    novaAtividade: ''
  });

  // --- Opções de Moeda ---
  const moedas = [
    { code: 'BRL', symbol: 'R$', label: 'Real (BRL)' },
    { code: 'USD', symbol: 'US$', label: 'Dólar (USD)' },
    { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
    { code: 'GBP', symbol: '£', label: 'Libra (GBP)' }
  ];

  // Gerar lista de meses/anos disponíveis nos registros
  const mesesDisponiveis = useMemo(() => {
    const meses = new Set();
    registros.forEach(reg => {
      // reg.data está no formato YYYY-MM-DD
      const mesAno = reg.data.substring(0, 7); // YYYY-MM
      meses.add(mesAno);
    });
    return Array.from(meses).sort().reverse(); // Mais recentes primeiro
  }, [registros]);

  // Filtragem de Registros
  const registrosFiltrados = useMemo(() => {
    let filtered = registros;

    // Filtro por projeto
    if (filtroProjetoId !== 'todos') {
      filtered = filtered.filter(r => r.projetoId === filtroProjetoId);
    }

    // Filtro por mês/ano
    if (filtroMesAno !== 'todos') {
      filtered = filtered.filter(r => r.data.substring(0, 7) === filtroMesAno);
    }

    return filtered;
  }, [registros, filtroProjetoId, filtroMesAno]);

  // --- Cálculos (baseados nos registros filtrados) ---
  const stats = useMemo(() => {
    const totalHoras = registrosFiltrados.reduce((acc, curr) => acc + Number(curr.horas), 0);
    const totaisPorMoeda = registrosFiltrados.reduce((acc, curr) => {
      const moeda = curr.moedaNaEpoca || 'BRL';
      const subtotal = Number(curr.horas) * (curr.valorHoraNaEpoca || 0);
      acc[moeda] = (acc[moeda] || 0) + subtotal;
      return acc;
    }, {});

    // Calcular totais pagos e não pagos por moeda
    const pagosPorMoeda = {};
    const naoPagosPorMoeda = {};

    registrosFiltrados.forEach(reg => {
      const moeda = reg.moedaNaEpoca || 'BRL';
      const valor = Number(reg.horas) * (reg.valorHoraNaEpoca || 0);

      if (reg.pago) {
        pagosPorMoeda[moeda] = (pagosPorMoeda[moeda] || 0) + valor;
      } else {
        naoPagosPorMoeda[moeda] = (naoPagosPorMoeda[moeda] || 0) + valor;
      }
    });

    return { totalHoras, totaisPorMoeda, pagosPorMoeda, naoPagosPorMoeda };
  }, [registrosFiltrados]);

  // --- Ações ---
  const handleAddRegistro = async (e) => {
    e.preventDefault();
    if (!form.projetoId || !form.atividade || !form.horas) return;

    const proj = projetos.find(p => p.id === form.projetoId);
    const novo = {
      id: crypto.randomUUID(),
      projetoId: form.projetoId,
      atividade: form.atividade,
      descricao: form.descricao,
      hours: Number(form.horas), // Note: API expects 'hours' but frontend used 'horas' for display
      horas: Number(form.horas), // Keeping both for compatibility with current UI usage
      data: form.data,
      projetoNome: proj.nome,
      valorHoraNaEpoca: proj.valorHora,
      moedaNaEpoca: proj.moeda,
      pago: false // Default: não pago
    };

    try {
      const res = await fetch('/api/registros', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(novo)
      });

      const checkedRes = await checkAuthResponse(res);
      if (!checkedRes) return;

      if (checkedRes.ok) {
        setRegistros([novo, ...registros]);
        setForm({ ...form, atividade: '', descricao: '', horas: '' });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to save record", error);
    }
  };

  const openDeleteRegistroModal = (registro) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'registro',
      id: registro.id,
      nome: registro.atividade
    });
  };

  const deleteRegistro = async (id) => {
    try {
      const res = await fetch(`/api/registros/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });

      const checkedRes = await checkAuthResponse(res);
      if (!checkedRes) return;

      if (checkedRes.ok) {
        setRegistros(registros.filter(r => r.id !== id));
        setDeleteConfirmModal({ isOpen: false, type: null, id: null, nome: null });
      }
    } catch (error) {
      console.error("Failed to delete record", error);
    }
  };

  const togglePagamento = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/registros/${id}`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ pago: !currentStatus })
      });

      const checkedRes = await checkAuthResponse(res);
      if (!checkedRes) return;

      if (checkedRes.ok) {
        setRegistros(registros.map(r => r.id === id ? { ...r, pago: !currentStatus } : r));
      }
    } catch (error) {
      console.error("Failed to update payment status", error);
    }
  };

  // --- Ações de Projetos ---
  const openNewProjectModal = () => {
    setCurrentProjectForm({
      id: null,
      nome: '',
      valorHora: '',
      moeda: 'BRL',
      atividades: [],
      novaAtividade: ''
    });
    setIsViewMode(false);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (projeto) => {
    setCurrentProjectForm({
      id: projeto.id,
      nome: projeto.nome,
      valorHora: projeto.valorHora,
      moeda: projeto.moeda,
      atividades: [...projeto.atividades],
      novaAtividade: ''
    });
    setIsViewMode(false);
    setIsProjectModalOpen(true);
  };

  const openViewProjectModal = (projeto) => {
    setCurrentProjectForm({
      id: projeto.id,
      nome: projeto.nome,
      valorHora: projeto.valorHora,
      moeda: projeto.moeda,
      atividades: [...projeto.atividades],
      novaAtividade: ''
    });
    setIsViewMode(true);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!currentProjectForm.nome || !currentProjectForm.valorHora) return;

    if (currentProjectForm.id) {
      // Editar
      const updatedProject = {
        nome: currentProjectForm.nome, 
        valorHora: Number(currentProjectForm.valorHora), 
        moeda: currentProjectForm.moeda, 
        atividades: currentProjectForm.atividades
      };

      try {
        const res = await fetch(`/api/projects/${currentProjectForm.id}`, {
          method: 'PUT',
          headers: authHeader(),
          body: JSON.stringify(updatedProject)
        });

        const checkedRes = await checkAuthResponse(res);
        if (!checkedRes) return;

        if (checkedRes.ok) {
          setProjetos(projetos.map(p =>
            p.id === currentProjectForm.id ? { ...p, ...updatedProject } : p
          ));
        }
      } catch (error) {
        console.error("Failed to update project", error);
      }

    } else {
      // Criar
      const novo = {
        id: crypto.randomUUID(),
        nome: currentProjectForm.nome,
        valorHora: Number(currentProjectForm.valorHora),
        moeda: currentProjectForm.moeda,
        atividades: currentProjectForm.atividades
      };

      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: authHeader(),
          body: JSON.stringify(novo)
        });

        const checkedRes = await checkAuthResponse(res);
        if (!checkedRes) return;

        if (checkedRes.ok) {
          setProjetos([...projetos, novo]);
        }
      } catch (error) {
        console.error("Failed to create project", error);
      }
    }
    setIsProjectModalOpen(false);
  };

  const openDeleteProjetoModal = (projeto) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'projeto',
      id: projeto.id,
      nome: projeto.nome
    });
  };

  const deleteProjeto = async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });

      const checkedRes = await checkAuthResponse(res);
      if (!checkedRes) return;

      if (checkedRes.ok) {
        setProjetos(projetos.filter(p => p.id !== id));
        setDeleteConfirmModal({ isOpen: false, type: null, id: null, nome: null });
      }
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  const addActivityToForm = () => {
    if (!currentProjectForm.novaAtividade) return;
    setCurrentProjectForm({
      ...currentProjectForm,
      atividades: [...currentProjectForm.atividades, currentProjectForm.novaAtividade],
      novaAtividade: ''
    });
  };

  const removeActivityFromForm = (ativName) => {
    setCurrentProjectForm({
      ...currentProjectForm,
      atividades: currentProjectForm.atividades.filter(a => a !== ativName)
    });
  };

  const projetoAtualNoForm = projetos.find(p => p.id === form.projetoId);
  const getSimboloMoeda = (code) => moedas.find(m => m.code === code)?.symbol || code;

  // Formatar mês/ano para exibição
  const formatarMesAno = (mesAno) => {
    const [ano, mes] = mesAno.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  // Função para trocar senha
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Erro ao alterar senha');
        return;
      }

      setPasswordSuccess('Senha alterada com sucesso!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError('Erro ao alterar senha');
    }
  };

  // --- Render Login if not authenticated ---
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-20 selection:bg-indigo-500/30">
      {/* Navbar Superior */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/40">T</div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Timesheet<span className="text-indigo-500 font-black">Master</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button 
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all duration-200 ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutDashboard size={18} /> <span className="text-sm font-semibold hidden sm:inline">Dashboard</span>
              </button>
              
              {isAdmin && (
                <>
                  <button 
                    onClick={() => setView('settings')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all duration-200 ${view === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Briefcase size={18} /> <span className="text-sm font-semibold hidden sm:inline">Meus Projetos</span>
                  </button>
                  <button 
                    onClick={() => setView('users')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all duration-200 ${view === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <UsersIcon size={18} /> <span className="text-sm font-semibold hidden sm:inline">Clientes</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="p-3 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all"
                title="Perfil"
              >
                <User size={20} />
              </button>

              <button
                onClick={openLogoutConfirm}
                className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        {view === 'users' && isAdmin ? (
          <Users projects={projetos} />
        ) : view === 'settings' && isAdmin ? (
          /* ABA DE PROJETOS */
          <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto space-y-8">
            <div className="w-full">
               <h3 className="font-black text-slate-500 uppercase text-xs tracking-[0.2em] mb-6">Projetos Ativos</h3>
               <div className="space-y-4">
                  {projetos.map(p => (
                    <div
                      key={p.id}
                      onClick={() => isAdmin ? openEditProjectModal(p) : openViewProjectModal(p)}
                      className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 group shadow-lg cursor-pointer hover:bg-slate-800/50 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                          <Briefcase size={26} />
                        </div>
                        <div>
                          <h4 className="font-black text-xl text-white mb-1">{p.nome}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold bg-slate-950 text-slate-400 px-3 py-1 rounded-lg border border-slate-800">
                              {getSimboloMoeda(p.moeda)} {p.valorHora}/h
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              {p.atividades.length} atividades
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                         {isAdmin && (
                           <button
                              onClick={(e) => { e.stopPropagation(); openDeleteProjetoModal(p); }}
                              className="p-3 hover:bg-red-500/10 rounded-xl text-slate-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={20} />
                            </button>
                         )}
                          <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
               </div>
            </div>

             {/* FAB para Novo Projeto */}
            {isAdmin && (
              <button
                onClick={openNewProjectModal}
                className="fixed bottom-8 right-8 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-900/50 transition-all hover:scale-110 active:scale-95 z-40"
              >
                <Plus size={32} />
              </button>
            )}
          </div>
        ) : view === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Resumo Financeiro - 4 Cards em uma linha */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Tempo Total */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <Clock size={24} />
                  </div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tempo Total</p>
                </div>
                <p className="text-3xl font-mono font-black text-white">{stats.totalHoras}<span className="text-lg text-indigo-500/50 ml-1">h</span></p>
              </div>

              {/* Faturamento/Investimento Total */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                    <DollarSign size={24} />
                  </div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {isAdmin ? 'Faturamento' : 'Investido'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {Object.keys(stats.totaisPorMoeda).length === 0 ? (
                    <p className="text-slate-600 italic text-xs">Aguardando...</p>
                  ) : (
                    Object.entries(stats.totaisPorMoeda).map(([moeda, total]) => (
                      <p key={moeda} className="text-xl font-mono font-black text-emerald-400">
                        {getSimboloMoeda(moeda)} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    ))
                  )}
                </div>
              </div>

              {/* Valores Pagos */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {isAdmin ? 'Recebidos' : 'Pagos'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {Object.keys(stats.pagosPorMoeda).length === 0 ? (
                    <p className="text-slate-600 italic text-xs">Nenhum</p>
                  ) : (
                    Object.entries(stats.pagosPorMoeda).map(([moeda, total]) => (
                      <p key={moeda} className="text-xl font-mono font-black text-green-400">
                        {getSimboloMoeda(moeda)} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    ))
                  )}
                </div>
              </div>

              {/* Valores Não Pagos */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                    <Circle size={24} />
                  </div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {isAdmin ? 'A Receber' : 'Pendente'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {Object.keys(stats.naoPagosPorMoeda).length === 0 ? (
                    <p className="text-slate-600 italic text-xs">Tudo pago!</p>
                  ) : (
                    Object.entries(stats.naoPagosPorMoeda).map(([moeda, total]) => (
                      <p key={moeda} className="text-xl font-mono font-black text-amber-400">
                        {getSimboloMoeda(moeda)} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              
              {/* Lista de Registros */}
              <div className="w-full space-y-6">
                {/* Filtros de Logs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
                  <h3 className="font-black text-slate-500 uppercase text-xs tracking-[0.2em]">Histórico de Atividades</h3>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Filtro de Projeto */}
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2">
                      <Filter size={16} className="text-indigo-400" />
                      <select
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-300 cursor-pointer w-full sm:w-auto"
                        value={filtroProjetoId}
                        onChange={(e) => setFiltroProjetoId(e.target.value)}
                      >
                        <option value="todos" className="bg-slate-900 text-slate-300">Todos os Projetos</option>
                        {projetos.map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-900 text-slate-300">{p.nome}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro de Mês/Ano */}
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2">
                      <Calendar size={16} className="text-emerald-400" />
                      <select
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-300 cursor-pointer w-full sm:w-auto"
                        value={filtroMesAno}
                        onChange={(e) => setFiltroMesAno(e.target.value)}
                      >
                        <option value="todos" className="bg-slate-900 text-slate-300">Todos os Períodos</option>
                        {mesesDisponiveis.map(mesAno => (
                          <option key={mesAno} value={mesAno} className="bg-slate-900 text-slate-300">
                            {formatarMesAno(mesAno)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {registrosFiltrados.length === 0 ? (
                  <div className="bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-24 text-center">
                    <Clock className="mx-auto text-slate-800 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">
                      {filtroProjetoId === 'todos' && filtroMesAno === 'todos'
                        ? "Nenhum registro no momento."
                        : "Nenhum registro para os filtros selecionados."}
                    </p>
                    {(filtroProjetoId !== 'todos' || filtroMesAno !== 'todos') && (
                      <button
                        onClick={() => {
                          setFiltroProjetoId('todos');
                          setFiltroMesAno('todos');
                        }}
                        className="text-indigo-400 text-xs font-bold mt-4 underline decoration-indigo-500/30"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrosFiltrados.map((reg) => (
                      <div key={reg.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl group hover:border-slate-600 hover:bg-slate-900 transition-all duration-300">
                        {/* Header: Projeto, Data, Badge Status */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-lg uppercase tracking-wider">{reg.projetoNome}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">{reg.data.split('-').reverse().join('/')}</span>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 ${
                            reg.pago
                              ? 'text-green-400 bg-green-400/10'
                              : 'text-amber-400 bg-amber-400/10'
                          }`}>
                            {reg.pago ? (
                              <><CheckCircle2 size={12} /> Pago</>
                            ) : (
                              <><Circle size={12} /> Pendente</>
                            )}
                          </span>
                        </div>

                        {/* Atividade */}
                        <h4 className="font-bold text-slate-100 text-lg leading-tight mb-3">{reg.atividade}</h4>

                        {/* Descrição */}
                        {reg.descricao && (
                          <div className="mb-4 flex gap-2 items-start text-slate-400 text-sm leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                            <AlignLeft size={14} className="mt-1 flex-shrink-0 text-slate-600" />
                            <p>{reg.descricao}</p>
                          </div>
                        )}

                        {/* Footer: Duração, Valor, Toggle, Delete */}
                        <div className="flex items-center justify-between gap-6 pt-3 border-t border-slate-800/50">
                          <div className="flex items-center gap-6">
                            {/* Duração */}
                            <div>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Duração</p>
                              <p className="font-mono font-black text-white text-lg">{reg.horas}h</p>
                            </div>

                            {/* Valor (Admin only) */}
                            {isAdmin && (
                              <div>
                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Valor</p>
                                <p className="text-emerald-400 font-mono font-black text-lg whitespace-nowrap">
                                  {getSimboloMoeda(reg.moedaNaEpoca)} {(reg.horas * reg.valorHoraNaEpoca).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Toggle e Delete (Admin only) */}
                          {isAdmin && (
                            <div className="flex items-center gap-4">
                              {/* Toggle Switch de Pagamento */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  {reg.pago ? 'Pago' : 'Pendente'}
                                </span>
                                <button
                                  onClick={() => togglePagamento(reg.id, reg.pago)}
                                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                    reg.pago
                                      ? 'bg-green-500 focus:ring-green-500'
                                      : 'bg-slate-700 focus:ring-slate-500'
                                  }`}
                                  title={reg.pago ? 'Marcar como não pago' : 'Marcar como pago'}
                                >
                                  <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                      reg.pago ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>

                              {/* Botão Delete */}
                              <button
                                onClick={() => openDeleteRegistroModal(reg)}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                title="Deletar registro"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

      {/* FAB para Novo Log (apenas na dashboard e apenas para admin) */}
      {view === 'dashboard' && isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl shadow-indigo-900/50 transition-all hover:scale-110 active:scale-95 z-40"
        >
          <Plus size={32} />
        </button>
      )}

      {/* Modal de Novo Log */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
              <PlusCircle size={28} className="text-indigo-500" /> Novo Log
            </h3>
            
            <form onSubmit={handleAddRegistro} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Selecione o Projeto</label>
                <select 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer font-medium"
                  value={form.projetoId}
                  onChange={(e) => setForm({...form, projetoId: e.target.value, atividade: ''})}
                >
                  <option value="" className="bg-slate-900 text-slate-300">Escolha um projeto...</option>
                  {projetos.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-slate-300">{p.nome} ({getSimboloMoeda(p.moeda)})</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">O que você fez?</label>
                {projetoAtualNoForm && projetoAtualNoForm.atividades.length > 0 ? (
                  <select 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer font-medium"
                    value={form.atividade}
                    onChange={(e) => setForm({...form, atividade: e.target.value})}
                  >
                    <option value="" className="bg-slate-900 text-slate-300">Selecione uma atividade...</option>
                    {projetoAtualNoForm.atividades.map((a, i) => <option key={i} value={a} className="bg-slate-900 text-slate-300">{a}</option>)}
                    <option value="Outra..." className="bg-slate-900 text-slate-300">Outra atividade...</option>
                  </select>
                ) : (
                  <input 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-700 font-medium"
                    placeholder="Ex: Refatoração de código"
                    value={form.atividade}
                    onChange={(e) => setForm({...form, atividade: e.target.value})}
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Descrição (Resumo)</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-700 font-medium h-24 resize-none text-sm"
                  placeholder="Descreva brevemente o que foi feito..."
                  value={form.descricao}
                  onChange={(e) => setForm({...form, descricao: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Horas</label>
                  <input 
                    required
                    type="number" step="0.1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                    placeholder="0.0"
                    value={form.horas}
                    onChange={(e) => setForm({...form, horas: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Data</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-mono font-bold"
                    value={form.data}
                    onChange={(e) => setForm({...form, data: e.target.value})}
                  />
                </div>
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-95 text-sm uppercase tracking-widest mt-2">
                Registrar Tempo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Projeto (Criar/Editar/Visualizar) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
              <Briefcase size={28} className={isViewMode ? "text-indigo-500" : "text-emerald-500"} />
              {isViewMode ? 'Detalhes do Projeto' : (currentProjectForm.id ? 'Editar Projeto' : 'Novo Projeto')}
            </h3>

            {isViewMode ? (
              /* Modo Visualização (Cliente) */
              <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome do Projeto</label>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 font-medium text-slate-200">
                    {currentProjectForm.nome}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Valor/Hora</label>
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 font-mono font-bold text-slate-200">
                      {getSimboloMoeda(currentProjectForm.moeda)} {currentProjectForm.valorHora}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Moeda</label>
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 font-bold text-slate-200">
                      {moedas.find(m => m.code === currentProjectForm.moeda)?.label || currentProjectForm.moeda}
                    </div>
                  </div>
                </div>

                {/* Lista de Atividades (Somente Visualização) */}
                <div className="pt-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest mb-3 block">Atividades Disponíveis</label>

                  <div className="space-y-2">
                    {currentProjectForm.atividades.length === 0 ? (
                       <p className="text-slate-600 italic text-xs text-center py-2">Nenhuma atividade cadastrada.</p>
                    ) : (
                      currentProjectForm.atividades.map((ativ, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl">
                          <span className="text-slate-300 text-sm font-medium">{ativ}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest mt-4"
                >
                  Fechar
                </button>
              </div>
            ) : (
              /* Modo Edição (Admin) */
              <form onSubmit={handleSaveProject} className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome do Projeto</label>
                  <input
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                    placeholder="Ex: App de Delivery"
                    value={currentProjectForm.nome}
                    onChange={(e) => setCurrentProjectForm({...currentProjectForm, nome: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Valor/Hora</label>
                    <div className="relative mt-2">
                      <input
                        required
                        type="number"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 pl-14 outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono font-bold"
                        placeholder="0"
                        value={currentProjectForm.valorHora}
                        onChange={(e) => setCurrentProjectForm({...currentProjectForm, valorHora: e.target.value})}
                      />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none select-none">
                        {getSimboloMoeda(currentProjectForm.moeda)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Moeda</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer font-bold appearance-none"
                      value={currentProjectForm.moeda}
                      onChange={(e) => setCurrentProjectForm({...currentProjectForm, moeda: e.target.value})}
                    >
                      {moedas.map(m => <option key={m.code} value={m.code} className="bg-slate-900 text-slate-300">{m.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Gestão de Atividades no Modal */}
                <div className="pt-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest mb-2 block">Atividades Padrão</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium text-sm placeholder:text-slate-700"
                      placeholder="Nova atividade..."
                      value={currentProjectForm.novaAtividade}
                      onChange={(e) => setCurrentProjectForm({...currentProjectForm, novaAtividade: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivityToForm())}
                    />
                    <button
                      type="button"
                      onClick={addActivityToForm}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-xl transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentProjectForm.atividades.length === 0 ? (
                       <p className="text-slate-600 italic text-xs text-center py-2">Nenhuma atividade cadastrada.</p>
                    ) : (
                      currentProjectForm.atividades.map((ativ, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl flex justify-between items-center group">
                          <span className="text-slate-300 text-sm font-medium">{ativ}</span>
                          <button
                            type="button"
                            onClick={() => removeActivityFromForm(ativ)}
                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/40 transition-all active:scale-95 text-sm uppercase tracking-widest mt-4">
                  {currentProjectForm.id ? 'Salvar Alterações' : 'Criar Projeto'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-900/50 w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Ícone de Aviso */}
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={32} className="text-red-400" />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-black mb-2 text-white">
                {deleteConfirmModal.type === 'projeto' ? 'Deletar Projeto?' : 'Deletar Registro?'}
              </h3>

              {/* Mensagem */}
              <p className="text-slate-400 mb-2">
                Tem certeza que deseja deletar{' '}
                <span className="font-bold text-white">"{deleteConfirmModal.nome}"</span>?
              </p>

              {deleteConfirmModal.type === 'projeto' && (
                <p className="text-xs text-amber-400 bg-amber-400/10 px-3 py-2 rounded-lg mb-6 border border-amber-400/20">
                  Os registros de tempo passados não serão apagados, mas o projeto sumirá da lista.
                </p>
              )}

              <p className="text-sm text-red-400 font-semibold mb-6">
                Esta ação não pode ser desfeita.
              </p>

              {/* Botões */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirmModal({ isOpen: false, type: null, id: null, nome: null })}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmModal.type === 'projeto') {
                      deleteProjeto(deleteConfirmModal.id);
                    } else {
                      deleteRegistro(deleteConfirmModal.id);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-900/40"
                >
                  Sim, Deletar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsProfileModalOpen(false);
                setIsChangingPassword(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordError('');
                setPasswordSuccess('');
              }}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Ícone de Perfil */}
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                {isChangingPassword ? (
                  <Key size={40} className="text-indigo-400" />
                ) : (
                  <User size={40} className="text-indigo-400" />
                )}
              </div>

              {/* Título */}
              <h3 className="text-2xl font-black mb-6 text-white">
                {isChangingPassword ? 'Alterar Senha' : 'Meu Perfil'}
              </h3>

              {!isChangingPassword ? (
                <>
                  {/* Informações */}
                  <div className="w-full space-y-4 mb-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Email</label>
                      <p className="text-slate-200 font-medium break-all">{user.email}</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Tipo de Conta</label>
                      <p className="text-slate-200 font-bold">
                        {user.role === 'admin' ? (
                          <span className="text-indigo-400">Administrador</span>
                        ) : (
                          <span className="text-emerald-400">Cliente</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="w-full space-y-3">
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Key size={20} />
                      Alterar Senha
                    </button>

                    <button
                      onClick={() => setIsProfileModalOpen(false)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
                    >
                      Fechar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Formulário de Troca de Senha */}
                  <form onSubmit={handleChangePassword} className="w-full space-y-4 mb-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest block mb-2 text-left">Senha Atual</label>
                      <input
                        type="password"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest block mb-2 text-left">Nova Senha</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest block mb-2 text-left">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>

                    {passwordError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
                        {passwordError}
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center font-medium">
                        {passwordSuccess}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
                      >
                        Confirmar
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Logout */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Ícone de Logout */}
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                <LogOut size={32} className="text-amber-400" />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-black mb-2 text-white">Sair da Conta?</h3>

              {/* Mensagem */}
              <p className="text-slate-400 mb-6">
                Tem certeza que deseja sair?
              </p>

              {/* Botões */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-900/40"
                >
                  Sim, Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
};

export default App;