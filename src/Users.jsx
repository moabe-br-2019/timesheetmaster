import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Trash2, Check, X, Shield, Edit } from 'lucide-react';

const Users = ({ projects }) => {
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    projectIds: []
  });
  const [editForm, setEditForm] = useState({
    id: null,
    email: '',
    projectIds: []
  });

  const authHeader = {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients', { headers: authHeader });
      if (res.ok) setClients(await res.json());
    } catch (error) {
      console.error("Error fetching clients", error);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({ email: '', password: '', projectIds: [] });
        fetchClients();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error("Error creating client", error);
    }
  };

  const deleteClient = async (id) => {
    if (!confirm('Tem certeza? O cliente perderá acesso.')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: authHeader
      });
      if (res.ok) fetchClients();
    } catch (error) {
      console.error("Error deleting client", error);
    }
  };

  const toggleProjectSelection = (projectId) => {
    setForm(prev => {
      const exists = prev.projectIds.includes(projectId);
      return {
        ...prev,
        projectIds: exists
          ? prev.projectIds.filter(id => id !== projectId)
          : [...prev.projectIds, projectId]
      };
    });
  };

  const toggleEditProjectSelection = (projectId) => {
    setEditForm(prev => {
      const exists = prev.projectIds.includes(projectId);
      return {
        ...prev,
        projectIds: exists
          ? prev.projectIds.filter(id => id !== projectId)
          : [...prev.projectIds, projectId]
      };
    });
  };

  const openEditModal = (client) => {
    setEditForm({
      id: client.id,
      email: client.email,
      projectIds: [...client.projectIds]
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${editForm.id}`, {
        method: 'PUT',
        headers: authHeader,
        body: JSON.stringify({ projectIds: editForm.projectIds })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditForm({ id: null, email: '', projectIds: [] });
        fetchClients();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao atualizar cliente');
      }
    } catch (error) {
      console.error("Error updating client", error);
      alert('Erro ao atualizar cliente');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-black text-white flex items-center gap-3">
           <UsersIcon className="text-indigo-500" /> Gestão de Clientes
         </h2>
         <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-all"
         >
           <Plus size={18} /> Novo Cliente
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {clients.length === 0 ? (
           <p className="text-slate-500 italic">Nenhum cliente cadastrado.</p>
         ) : (
           clients.map(client => (
             <div key={client.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-white text-lg">{client.email}</h3>
                   <p className="text-slate-500 text-xs mt-1">Criado em: {new Date(client.created_at * 1000).toLocaleDateString()}</p>
                 </div>
                 <div className="flex gap-2">
                   <button
                     onClick={() => openEditModal(client)}
                     className="text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/10 p-2 rounded-xl transition-all"
                     title="Editar projetos"
                   >
                     <Edit size={18} />
                   </button>
                   <button
                     onClick={() => deleteClient(client.id)}
                     className="text-slate-600 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-xl transition-all"
                     title="Deletar cliente"
                   >
                     <Trash2 size={18} />
                   </button>
                 </div>
               </div>
               
               <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                 <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Acesso aos Projetos:</p>
                 <div className="flex flex-wrap gap-2">
                   {client.projectIds && client.projectIds.length > 0 ? (
                     client.projectIds.map(pid => {
                       const proj = projects.find(p => p.id === pid);
                       return (
                         <span key={pid} className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-lg border border-indigo-500/20">
                           {proj ? proj.nome : 'Projeto Removido'}
                         </span>
                       );
                     })
                   ) : (
                     <span className="text-xs text-slate-600 italic">Nenhum projeto atribuído</span>
                   )}
                 </div>
               </div>
             </div>
           ))
         )}
       </div>

      {/* Modal Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
              <UsersIcon size={28} className="text-indigo-500" /> Novo Cliente
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Email do Cliente</label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-700 font-medium"
                  placeholder="cliente@exemplo.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Senha Provisória</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-700 font-medium"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest mb-3 block">Projetos Permitidos</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => toggleProjectSelection(p.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${form.projectIds.includes(p.id) ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                      <span className="text-sm font-medium">{p.nome}</span>
                      {form.projectIds.includes(p.id) && <Check size={16} />}
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-xs text-slate-600 italic text-center py-2">Nenhum projeto disponível.</p>}
                </div>
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-95 text-sm uppercase tracking-widest mt-2">
                Criar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
              <Edit size={28} className="text-emerald-500" /> Editar Cliente
            </h3>

            <form onSubmit={handleUpdateClient} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Email do Cliente</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 text-slate-400 font-medium">
                  {editForm.email}
                </div>
                <p className="text-xs text-slate-600 mt-1 ml-1">O email não pode ser alterado</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest mb-3 block">Projetos Permitidos</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => toggleEditProjectSelection(p.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${editForm.projectIds.includes(p.id) ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                      <span className="text-sm font-medium">{p.nome}</span>
                      {editForm.projectIds.includes(p.id) && <Check size={16} />}
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-xs text-slate-600 italic text-center py-2">Nenhum projeto disponível.</p>}
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1">
                  {editForm.projectIds.length === 0
                    ? 'Selecione pelo menos um projeto'
                    : `${editForm.projectIds.length} projeto(s) selecionado(s)`}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/40 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
