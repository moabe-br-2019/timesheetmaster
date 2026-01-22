import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, X, Check, DollarSign } from 'lucide-react';

// Componente FormModal extraído para evitar perda de foco
const FormModal = ({ isOpen, onClose, onSubmit, isEdit, form, setForm, handleTypeChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
          <CreditCard size={28} className="text-indigo-500" /> {isEdit ? 'Editar' : 'Nova'} Forma de Pagamento
        </h3>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Nome */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
              placeholder="Ex: PIX Principal, Bank Transfer USD..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Tipo de Pagamento */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest mb-3 block">Tipo de Pagamento *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('pix')}
                className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                  form.type === 'pix'
                    ? 'border-indigo-600 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <DollarSign size={18} />
                  PIX (BRL)
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('international')}
                className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                  form.type === 'international'
                    ? 'border-indigo-600 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard size={18} />
                  Internacional (USD)
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('paypal')}
                className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                  form.type === 'paypal'
                    ? 'border-indigo-600 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard size={18} />
                  PayPal (USD)
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('stripe')}
                className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                  form.type === 'stripe'
                    ? 'border-indigo-600 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard size={18} />
                  Stripe (USD)
                </div>
              </button>
            </div>
          </div>

          {/* Campos específicos para PIX */}
          {form.type === 'pix' && (
            <>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Tipo de Chave PIX *</label>
                <select
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer font-medium"
                  value={form.pixKeyType}
                  onChange={(e) => setForm({ ...form, pixKeyType: e.target.value })}
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">Email</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Chave PIX *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                  placeholder="Digite a chave PIX..."
                  value={form.pixKey}
                  onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Campos específicos para Internacional */}
          {form.type === 'international' && (
            <>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome do Beneficiário *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                  placeholder="Beneficiary name..."
                  value={form.beneficiaryName}
                  onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Número da Conta (IBAN) *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                  placeholder="IBAN or account number..."
                  value={form.beneficiaryAccountNumber}
                  onChange={(e) => setForm({ ...form, beneficiaryAccountNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">SWIFT Code *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold uppercase"
                  placeholder="SWIFT/BIC code..."
                  value={form.swiftCode}
                  onChange={(e) => setForm({ ...form, swiftCode: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome do Banco *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                  placeholder="Bank name..."
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Endereço do Banco</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium h-20 resize-none text-sm"
                  placeholder="Bank address..."
                  value={form.bankAddress}
                  onChange={(e) => setForm({ ...form, bankAddress: e.target.value })}
                />
              </div>

              {/* Banco Intermediário (Opcional) */}
              <div className="border-t border-slate-800 pt-5">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Banco Intermediário (Opcional)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">SWIFT Code Intermediário</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold uppercase"
                      placeholder="Intermediary SWIFT..."
                      value={form.intermediarySwiftCode}
                      onChange={(e) => setForm({ ...form, intermediarySwiftCode: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome do Banco Intermediário</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                      placeholder="Intermediary bank name..."
                      value={form.intermediaryBankName}
                      onChange={(e) => setForm({ ...form, intermediaryBankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Endereço do Banco Intermediário</label>
                    <textarea
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium h-20 resize-none text-sm"
                      placeholder="Intermediary bank address..."
                      value={form.intermediaryBankAddress}
                      onChange={(e) => setForm({ ...form, intermediaryBankAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Número da Conta Intermediária</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                      placeholder="Intermediary account number..."
                      value={form.intermediaryAccountNumber}
                      onChange={(e) => setForm({ ...form, intermediaryAccountNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Campos específicos para PayPal */}
          {form.type === 'paypal' && (
            <>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Email PayPal *</label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                  placeholder="seu-email@paypal.com"
                  value={form.paypalEmail}
                  onChange={(e) => setForm({ ...form, paypalEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Taxa PayPal (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                  placeholder="6.0"
                  value={form.paypalFeePercentage}
                  onChange={(e) => setForm({ ...form, paypalFeePercentage: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-2 ml-1">Taxa padrão do PayPal: 6%</p>
              </div>
            </>
          )}

          {/* Campos específicos para Stripe */}
          {form.type === 'stripe' && (
            <>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Email Stripe *</label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                  placeholder="seu-email@stripe.com"
                  value={form.stripeEmail}
                  onChange={(e) => setForm({ ...form, stripeEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Taxa Stripe (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                  placeholder="6.0"
                  value={form.stripeFeePercentage}
                  onChange={(e) => setForm({ ...form, stripeFeePercentage: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-2 ml-1">Taxa padrão do Stripe: 6%</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showFeeOnInvoice"
                  className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer"
                  checked={form.showFeeOnInvoice}
                  onChange={(e) => setForm({ ...form, showFeeOnInvoice: e.target.checked })}
                />
                <label htmlFor="showFeeOnInvoice" className="text-sm font-medium text-slate-300 cursor-pointer">
                  Mostrar taxa na invoice
                </label>
              </div>
            </>
          )}

          {/* Dados da Entidade (PF/PJ) - Para todos os tipos */}
          <div className="border-t border-slate-800 pt-5">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Dados do Titular</h4>

            <div className="mb-4">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest mb-3 block">Tipo de Pessoa</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, entityType: 'pf' })}
                  className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                    form.entityType === 'pf'
                      ? 'border-indigo-600 bg-indigo-600/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Pessoa Física (PF)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, entityType: 'pj' })}
                  className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                    form.entityType === 'pj'
                      ? 'border-indigo-600 bg-indigo-600/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Pessoa Jurídica (PJ)
                </button>
              </div>
            </div>

            {form.entityType && (
              <>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                    {form.entityType === 'pf' ? 'Nome Completo' : 'Razão Social'}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                    placeholder={form.entityType === 'pf' ? 'Seu nome completo...' : 'Razão social da empresa...'}
                    value={form.entityName}
                    onChange={(e) => setForm({ ...form, entityName: e.target.value })}
                  />
                </div>
                <div className="mt-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                    {form.entityType === 'pf' ? 'CPF' : 'CNPJ'}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-medium"
                    placeholder={form.entityType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    value={form.entityTaxId}
                    onChange={(e) => setForm({ ...form, entityTaxId: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Observações</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium h-20 resize-none text-sm"
              placeholder="Notas adicionais..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Marcar como Padrão */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefault"
              className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-slate-300 cursor-pointer">
              Marcar como forma de pagamento padrão
            </label>
          </div>

          {/* Botões */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-95 text-sm uppercase tracking-widest"
          >
            {isEdit ? 'Salvar Alterações' : 'Criar Forma de Pagamento'}
          </button>
        </form>
      </div>
    </div>
  );
};

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'pix',
    currency: 'BRL',
    pixKey: '',
    pixKeyType: 'cpf',
    beneficiaryName: '',
    beneficiaryAccountNumber: '',
    swiftCode: '',
    bankName: '',
    bankAddress: '',
    intermediarySwiftCode: '',
    intermediaryBankName: '',
    intermediaryBankAddress: '',
    intermediaryAccountNumber: '',
    entityType: '',
    entityName: '',
    entityTaxId: '',
    paypalEmail: '',
    paypalFeePercentage: 6.0,
    stripeEmail: '',
    stripeFeePercentage: 6.0,
    showFeeOnInvoice: true,
    isDefault: false,
    notes: ''
  });

  const authHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

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

  const handleCreatePaymentMethod = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        resetForm();
        fetchPaymentMethods();
        alert('Forma de pagamento criada com sucesso!');
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao criar forma de pagamento');
      }
    } catch (error) {
      console.error('Error creating payment method:', error);
      alert('Erro ao criar forma de pagamento');
    }
  };

  const handleUpdatePaymentMethod = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/payment-methods/${selectedMethod.id}`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setSelectedMethod(null);
        resetForm();
        fetchPaymentMethods();
        alert('Forma de pagamento atualizada com sucesso!');
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao atualizar forma de pagamento');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      alert('Erro ao atualizar forma de pagamento');
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (!confirm('Desativar esta forma de pagamento? Ela não será mais exibida na lista.')) return;

    try {
      const res = await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });

      if (res.ok) {
        fetchPaymentMethods();
        alert('Forma de pagamento desativada com sucesso!');
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao desativar forma de pagamento');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Erro ao desativar forma de pagamento');
    }
  };

  const handleEdit = (method) => {
    setSelectedMethod(method);
    setForm({
      name: method.name || '',
      type: method.type || 'pix',
      currency: method.currency || 'BRL',
      pixKey: method.pix_key || '',
      pixKeyType: method.pix_key_type || 'cpf',
      beneficiaryName: method.beneficiary_name || '',
      beneficiaryAccountNumber: method.beneficiary_account_number || '',
      swiftCode: method.swift_code || '',
      bankName: method.bank_name || '',
      bankAddress: method.bank_address || '',
      intermediarySwiftCode: method.intermediary_swift_code || '',
      intermediaryBankName: method.intermediary_bank_name || '',
      intermediaryBankAddress: method.intermediary_bank_address || '',
      intermediaryAccountNumber: method.intermediary_account_number || '',
      entityType: method.entity_type || '',
      entityName: method.entity_name || '',
      entityTaxId: method.entity_tax_id || '',
      paypalEmail: method.paypal_email || '',
      paypalFeePercentage: method.paypal_fee_percentage || 6.0,
      stripeEmail: method.stripe_email || '',
      stripeFeePercentage: method.stripe_fee_percentage || 6.0,
      showFeeOnInvoice: method.show_fee_on_invoice === 1,
      isDefault: method.is_default === 1,
      notes: method.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      name: '',
      type: 'pix',
      currency: 'BRL',
      pixKey: '',
      pixKeyType: 'cpf',
      beneficiaryName: '',
      beneficiaryAccountNumber: '',
      swiftCode: '',
      bankName: '',
      bankAddress: '',
      intermediarySwiftCode: '',
      intermediaryBankName: '',
      intermediaryBankAddress: '',
      intermediaryAccountNumber: '',
      entityType: '',
      entityName: '',
      entityTaxId: '',
      paypalEmail: '',
      paypalFeePercentage: 6.0,
      stripeEmail: '',
      stripeFeePercentage: 6.0,
      showFeeOnInvoice: true,
      isDefault: false,
      notes: ''
    });
  };

  const handleTypeChange = (newType) => {
    setForm({
      ...form,
      type: newType,
      currency: newType === 'pix' ? 'BRL' : 'USD'
    });
  };

  const getCurrencySymbol = (code) => {
    const symbols = { BRL: 'R$', USD: 'US$' };
    return symbols[code] || code;
  };

  const getPixKeyTypeLabel = (type) => {
    const labels = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      email: 'Email',
      phone: 'Telefone',
      random: 'Chave Aleatória'
    };
    return labels[type] || type;
  };

  const PaymentMethodCard = ({ method }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl font-black text-white">{method.name}</span>
            {method.is_default === 1 && (
              <span className="text-xs font-black px-3 py-1 rounded-lg bg-indigo-600 text-white uppercase">
                Padrão
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mb-1">
            Tipo: <span className="text-slate-300">
              {method.type === 'pix' ? 'PIX' : method.type === 'paypal' ? 'PayPal' : method.type === 'stripe' ? 'Stripe' : 'Transferência Internacional'}
            </span>
          </p>
          <p className="text-slate-400 text-sm">
            Moeda: <span className="text-slate-300 font-mono">{getCurrencySymbol(method.currency)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(method)}
            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-all"
            title="Editar"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDeletePaymentMethod(method.id)}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
            title="Desativar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {method.type === 'pix' && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Chave PIX</p>
          <p className="text-slate-300 font-mono text-sm">{method.pix_key}</p>
          <p className="text-slate-500 text-xs mt-1">{getPixKeyTypeLabel(method.pix_key_type)}</p>
        </div>
      )}

      {method.type === 'international' && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Beneficiário</p>
            <p className="text-slate-300 text-sm">{method.beneficiary_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Conta (IBAN)</p>
            <p className="text-slate-300 font-mono text-sm">{method.beneficiary_account_number}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">SWIFT</p>
            <p className="text-slate-300 font-mono text-sm">{method.swift_code}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Banco</p>
            <p className="text-slate-300 text-sm">{method.bank_name}</p>
            {method.bank_address && <p className="text-slate-500 text-xs">{method.bank_address}</p>}
          </div>
          {method.intermediary_swift_code && (
            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Banco Intermediário</p>
              <p className="text-slate-400 text-xs">SWIFT: {method.intermediary_swift_code}</p>
              {method.intermediary_bank_name && <p className="text-slate-400 text-xs">{method.intermediary_bank_name}</p>}
            </div>
          )}
        </div>
      )}

      {method.type === 'paypal' && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Email PayPal</p>
          <p className="text-slate-300 font-mono text-sm">{method.paypal_email}</p>
          {method.paypal_fee_percentage && (
            <p className="text-slate-500 text-xs mt-1">Taxa: {method.paypal_fee_percentage}%</p>
          )}
        </div>
      )}

      {method.type === 'stripe' && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Email Stripe</p>
          <p className="text-slate-300 font-mono text-sm">{method.stripe_email}</p>
          {method.stripe_fee_percentage && (
            <p className="text-slate-500 text-xs mt-1">Taxa: {method.stripe_fee_percentage}%</p>
          )}
          {method.show_fee_on_invoice !== undefined && (
            <p className="text-slate-500 text-xs mt-1">
              Mostrar taxa na invoice: {method.show_fee_on_invoice === 1 ? 'Sim' : 'Não'}
            </p>
          )}
        </div>
      )}

      {method.notes && (
        <p className="text-slate-500 text-sm mt-3 italic">{method.notes}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <CreditCard className="text-indigo-500" /> Formas de Pagamento
        </h2>
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-all"
        >
          <Plus size={18} /> Nova Forma de Pagamento
        </button>
      </div>

      {/* Lista de Formas de Pagamento */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-24 text-center">
            <CreditCard className="mx-auto text-slate-800 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Nenhuma forma de pagamento cadastrada ainda.</p>
          </div>
        ) : (
          paymentMethods.map(method => (
            <PaymentMethodCard key={method.id} method={method} />
          ))
        )}
      </div>

      {/* Modal Criar */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePaymentMethod}
        isEdit={false}
        form={form}
        setForm={setForm}
        handleTypeChange={handleTypeChange}
      />

      {/* Modal Editar */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMethod(null);
          resetForm();
        }}
        form={form}
        setForm={setForm}
        handleTypeChange={handleTypeChange}
        onSubmit={handleUpdatePaymentMethod}
        isEdit={true}
      />
    </div>
  );
};

export default PaymentMethods;
