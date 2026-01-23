import React, { useState, useEffect } from 'react';
import { Building2, Save, Loader } from 'lucide-react';

const CompanySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyTaxId: '',
    companyEmail: '',
    companyPhone: '',
    companyBankInfo: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/company', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Configurações salvas com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao salvar configurações');
      }
    } catch (err) {
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
          <Building2 size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">Configurações da Empresa</h2>
          <p className="text-slate-400 text-sm mt-1">
            Estes dados serão exibidos no campo "DE:" das suas invoices
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-6">
          {/* Nome da Empresa */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
              Nome da Empresa *
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-200"
              placeholder="Ex: Mowebstudio"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
              Endereço Completo
            </label>
            <textarea
              value={formData.companyAddress}
              onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-200 resize-none"
              placeholder="Rua, número, bairro, cidade, estado, CEP"
            />
          </div>

          {/* CNPJ/Tax ID */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
              CNPJ / Tax ID
            </label>
            <input
              type="text"
              value={formData.companyTaxId}
              onChange={(e) => setFormData({ ...formData, companyTaxId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-200"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-200"
                placeholder="contato@empresa.com"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-200"
                placeholder="(00) 0000-0000"
              />
            </div>
          </div>

          {/* Informações Bancárias */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
              Informações Bancárias
            </label>
            <textarea
              value={formData.companyBankInfo}
              onChange={(e) => setFormData({ ...formData, companyBankInfo: e.target.value })}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-200 resize-none"
              placeholder="Banco, Agência, Conta, Tipo de conta, PIX"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-3"
        >
          {saving ? (
            <>
              <Loader className="animate-spin" size={20} />
              Salvando...
            </>
          ) : (
            <>
              <Save size={20} />
              Salvar Configurações
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CompanySettings;
