import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Trash2, Check, X, Shield } from 'lucide-react';

const Users = ({ projects }) => {
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
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
                   <p className="text-slate-500 text-xs mt-1">Criado em: {new Date(client.created_at).toLocaleDateString()}</p>
                 </div>
                 <button onClick={() => deleteClient(client.id)} className="text-slate-600 hover:text-red-400 p-2">
                   <Trash2 size={18} />
                 </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-black text-white mb-6">Novo Acesso de Cliente</h3>
            
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email do Cliente</label>
                <input 
                  required
                  type="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha Provisória</label>
                <input 
                  required
                  type="password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Projetos Permitidos</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 max-h-40 overflow-y-auto space-y-1">
                  {projects.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => toggleProjectSelection(p.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${form.projectIds.includes(p.id) ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                      <span className="text-sm font-medium">{p.nome}</span>
                      {form.projectIds.includes(p.id) && <Check size={14} />}
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-xs text-slate-600 p-2">Nenhum projeto disponível.</p>}
                </div>
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-2">
                Criar Acesso
              </button>
            </form>
          </div>
        </div>
       )}
    </div>
  );
};

export default Users;
