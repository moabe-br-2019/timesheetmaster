import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Trash2, CheckCircle2, X, Filter, Calendar } from 'lucide-react';
import InvoiceView from './InvoiceView';

// Função helper para formatar datas sem problemas de timezone
const formatDateLocal = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const Invoices = ({ projects, clients }) => {
  const [invoices, setInvoices] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [form, setForm] = useState({
    clientId: '',
    projectIds: [],
    dateFrom: '',
    dateTo: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentMethodId: '',
    notes: ''
  });

  const authHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchInvoices();
    fetchCompanySettings();
    fetchPaymentMethods();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices', { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const res = await fetch('/api/settings/company', { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setCompanySettings(data);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods', { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleCreateInvoice = async (e, status = 'draft') => {
    e.preventDefault();

    if (form.projectIds.length === 0) {
      alert('Selecione pelo menos um projeto');
      return;
    }

    const clientData = clients.find(c => c.id === parseInt(form.clientId));

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          clientId: form.clientId || null,
          projectIds: form.projectIds,
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
          issueDate: form.issueDate,
          dueDate: form.dueDate || null,
          paymentMethodId: form.paymentMethodId || null,
          companyInfo: companySettings,
          clientInfo: clientData ? {
            name: clientData.email,
            email: clientData.email
          } : null,
          notes: form.notes,
          status
        })
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setForm({
          clientId: '',
          projectIds: [],
          dateFrom: '',
          dateTo: '',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          paymentMethodId: '',
          notes: ''
        });
        fetchInvoices();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao criar invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Erro ao criar invoice');
    }
  };

  const handleViewInvoice = async (invoice) => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setSelectedInvoice(data);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    if (!confirm('Marcar esta invoice como paga? Todos os registros associados serão marcados como pagos.')) return;

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
        headers: authHeader()
      });

      if (res.ok) {
        fetchInvoices();
        alert('Invoice marcada como paga!');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm('Deletar esta invoice? Esta ação não pode ser desfeita.')) return;

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: authHeader()
      });

      if (res.ok) {
        fetchInvoices();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao deletar invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const toggleProjectSelection = (projectId) => {
    setForm(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter(id => id !== projectId)
        : [...prev.projectIds, projectId]
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-slate-600 text-slate-200',
      sent: 'bg-blue-600 text-white',
      paid: 'bg-green-600 text-white',
      cancelled: 'bg-red-600 text-white'
    };
    const labels = {
      draft: 'Rascunho',
      sent: 'Enviada',
      paid: 'Paga',
      cancelled: 'Cancelada'
    };
    return { class: badges[status] || badges.draft, label: labels[status] || status };
  };

  const getSimboloMoeda = (code) => {
    const symbols = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£' };
    return symbols[code] || code;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <FileText className="text-indigo-500" /> Invoices / Faturas
        </h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-all"
        >
          <Plus size={18} /> Nova Invoice
        </button>
      </div>

      {/* Lista de Invoices */}
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-24 text-center">
            <FileText className="mx-auto text-slate-800 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Nenhuma invoice criada ainda.</p>
          </div>
        ) : (
          invoices.map(invoice => {
            const statusBadge = getStatusBadge(invoice.status);
            return (
              <div
                key={invoice.id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl font-black text-white">{invoice.invoice_number}</span>
                      <span className={`text-xs font-black px-3 py-1 rounded-lg uppercase ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-1">
                      Cliente: <span className="text-slate-300">{invoice.client_name || invoice.client_email || 'Não especificado'}</span>
                    </p>
                    <p className="text-slate-500 text-xs">
                      Período: {formatDateLocal(invoice.date_from)} - {formatDateLocal(invoice.date_to)}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-emerald-400 font-mono font-black text-lg">
                        {getSimboloMoeda(invoice.currency)} {Number(invoice.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-500 text-sm">{invoice.total_hours}h trabalhadas</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-all"
                      title="Visualizar"
                    >
                      <Eye size={18} />
                    </button>
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkPaid(invoice.id)}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-all"
                        title="Marcar como Paga"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    {(invoice.status === 'draft' || invoice.status === 'cancelled') && (
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Criar Invoice */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
              <FileText size={28} className="text-indigo-500" /> Nova Invoice
            </h3>

            <form onSubmit={(e) => handleCreateInvoice(e, 'draft')} className="space-y-5">
              {/* Cliente */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Cliente (Opcional)</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer font-medium"
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                >
                  <option value="">Sem cliente específico</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.email}</option>
                  ))}
                </select>
              </div>

              {/* Projetos */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest mb-3 block">
                  Projetos * ({form.projectIds.length} selecionados)
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => toggleProjectSelection(p.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        form.projectIds.includes(p.id) ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-sm font-medium">{p.nome}</span>
                      {form.projectIds.includes(p.id) && <CheckCircle2 size={16} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Data Inicial *</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                    value={form.dateFrom}
                    onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Data Final *</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                    value={form.dateTo}
                    onChange={(e) => setForm({ ...form, dateTo: e.target.value })}
                  />
                </div>
              </div>

              {/* Datas da Invoice */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Data de Emissão *</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Vencimento (Opcional)</label>
                  <input
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Forma de Pagamento (Opcional)</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer font-medium"
                  value={form.paymentMethodId}
                  onChange={(e) => setForm({ ...form, paymentMethodId: e.target.value })}
                >
                  <option value="">Nenhuma (usar info antiga)</option>
                  {paymentMethods.map(pm => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name} ({pm.type === 'pix' ? 'PIX' : 'Internacional'} - {pm.currency})
                      {pm.is_default === 1 ? ' ★' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Observações (Opcional)</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-700 font-medium h-24 resize-none text-sm"
                  placeholder="Notas, termos de pagamento, etc..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black py-5 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Salvar como Rascunho
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreateInvoice(e, 'sent')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Criar e Marcar como Enviada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Invoice */}
      {isViewModalOpen && selectedInvoice && (
        <InvoiceView
          invoice={selectedInvoice}
          onClose={() => setIsViewModalOpen(false)}
          onRefresh={fetchInvoices}
        />
      )}
    </div>
  );
};

export default Invoices;
