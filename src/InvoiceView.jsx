import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';

// Função helper para formatar datas sem problemas de timezone
const formatDateLocal = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const InvoiceView = ({ invoice, onClose, onRefresh }) => {
  const [showDescription, setShowDescription] = useState(false);
  const [language, setLanguage] = useState('pt'); // 'pt' ou 'en'

  const getSimboloMoeda = (code) => {
    const symbols = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£' };
    return symbols[code] || code;
  };

  const handlePrint = () => {
    // Abrir página de impressão em nova aba com parâmetros de linguagem e descrição
    const printUrl = `${window.location.origin}${window.location.pathname}?print=true&invoice=${invoice.id}&lang=${language}&desc=${showDescription}`;
    window.open(printUrl, '_blank');
  };

  const handleMarkAsPaid = async () => {
    if (!window.confirm('Marcar esta invoice como paga? Isso irá atualizar todas as atividades relacionadas.')) {
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar invoice como paga');
      }

      alert('Invoice marcada como paga com sucesso!');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      alert('Erro ao marcar invoice como paga: ' + err.message);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: language === 'en' ? 'DRAFT' : 'RASCUNHO',
      sent: language === 'en' ? 'SENT' : 'ENVIADA',
      paid: language === 'en' ? 'PAID' : 'PAGA',
      cancelled: language === 'en' ? 'CANCELLED' : 'CANCELADA'
    };
    return labels[status] || status.toUpperCase();
  };

  const t = (pt, en) => language === 'en' ? en : pt;

  return (
    <div className="invoice-view-root fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Botões de ação (ocultos na impressão) */}
        <div className="no-print bg-slate-900 p-4 border-b border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              <Printer size={18} /> Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Controles de visualização */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Checkbox Mostrar Descrição */}
            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showDescription}
                onChange={(e) => setShowDescription(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
              />
              Mostrar descrição
            </label>

            {/* Toggle de Idioma */}
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">Idioma:</span>
              <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  language === 'pt'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                EN
              </button>
            </div>

            {/* Botão Marcar como Paga */}
            {invoice.status !== 'paid' && (
              <button
                onClick={handleMarkAsPaid}
                className="ml-auto flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm"
              >
                ✓ Marcar como Paga
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo da Invoice (print-friendly) */}
        <div className="invoice-container p-10 bg-white text-black">
          {/* Header */}
          <div className="border-b-2 border-slate-300 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">INVOICE</h1>
                <p className="text-xl font-mono font-bold text-indigo-600">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 mb-1">{t('Status', 'Status')}</p>
                <p className={`text-base font-black ${
                  invoice.status === 'paid' ? 'text-green-600' :
                  invoice.status === 'sent' ? 'text-blue-600' :
                  invoice.status === 'cancelled' ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {getStatusLabel(invoice.status)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-600 font-semibold">{t('Data de Emissão', 'Issue Date')}</p>
                <p className="font-bold">{formatDateLocal(invoice.issue_date)}</p>
              </div>
              {invoice.due_date && (
                <div>
                  <p className="text-slate-600 font-semibold">{t('Vencimento', 'Due Date')}</p>
                  <p className="font-bold">{formatDateLocal(invoice.due_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* De */}
            <div>
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('De:', 'From:')}</h3>
              <div className="text-xs space-y-1">
                {invoice.company_name && <p className="font-bold text-sm">{invoice.company_name}</p>}
                {invoice.company_address && <p className="text-slate-700">{invoice.company_address}</p>}
                {invoice.company_tax_id && <p className="text-slate-700">{t('CNPJ', 'Tax ID')}: {invoice.company_tax_id}</p>}
              </div>
            </div>

            {/* Para */}
            <div>
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('Para:', 'To:')}</h3>
              <div className="text-xs space-y-1">
                {invoice.client_name && <p className="font-bold text-sm">{invoice.client_name}</p>}
                {invoice.client_email && <p className="text-slate-700">{invoice.client_email}</p>}
                {invoice.client_address && <p className="text-slate-700">{invoice.client_address}</p>}
                {invoice.client_tax_id && <p className="text-slate-700">{t('CNPJ', 'Tax ID')}: {invoice.client_tax_id}</p>}
              </div>
            </div>
          </div>

          {/* Período */}
          <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{t('Período de Trabalho', 'Work Period')}</p>
            <p className="font-bold text-slate-900 text-xs">
              {formatDateLocal(invoice.date_from)} - {formatDateLocal(invoice.date_to)}
            </p>
          </div>

          {/* Tabela de Itens */}
          <table className="w-full mb-6 border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="text-left py-2 px-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('Data', 'Date')}</th>
                <th className="text-left py-2 px-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('Projeto', 'Project')}</th>
                <th className="text-left py-2 px-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('Atividade', 'Activity')}</th>
                <th className="text-right py-2 px-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('Horas', 'Hours')}</th>
                <th className="text-right py-2 px-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('Valor/h', 'Rate/h')}</th>
                <th className="text-right py-2 px-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('Subtotal', 'Subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.map((item) => {
                const subtotal = Number(item.horas) * Number(item.valor_hora_na_epoca);
                return (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-2 px-1 text-xs text-slate-700">{formatDateLocal(item.data)}</td>
                    <td className="py-2 px-1 text-xs text-slate-900 font-medium">{item.projeto_nome}</td>
                    <td className="py-2 px-1 text-xs text-slate-700">
                      <div className="break-words">{item.atividade}</div>
                      {showDescription && item.descricao && (
                        <div className="text-[10px] text-slate-500 mt-1 leading-tight break-words">{item.descricao}</div>
                      )}
                    </td>
                    <td className="py-2 px-1 text-xs text-right font-mono whitespace-nowrap">{item.horas}h</td>
                    <td className="py-2 px-1 text-xs text-right font-mono whitespace-nowrap">{getSimboloMoeda(invoice.currency)} {Number(item.valor_hora_na_epoca).toFixed(2)}</td>
                    <td className="py-2 px-1 text-xs text-right font-mono font-bold whitespace-nowrap">{getSimboloMoeda(invoice.currency)} {subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totais */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-600">{t('Total de Horas:', 'Total Hours:')}</span>
                <span className="font-mono font-bold text-xs">{invoice.total_hours}h</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-600">{t('Subtotal:', 'Subtotal:')}</span>
                <span className="font-mono font-bold text-xs">
                  {getSimboloMoeda(invoice.currency)} {Number(invoice.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {invoice.payment_method?.type === 'paypal' && invoice.payment_method?.paypal_fee_percentage && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-600">{t('Taxa PayPal', 'PayPal Fee')} ({invoice.payment_method.paypal_fee_percentage}%):</span>
                  <span className="font-mono font-bold text-red-600 text-xs">
                    {getSimboloMoeda(invoice.currency)} {(Number(invoice.total_amount) * Number(invoice.payment_method.paypal_fee_percentage) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {invoice.payment_method?.type === 'stripe' && invoice.payment_method?.stripe_fee_percentage && invoice.payment_method?.show_fee_on_invoice === 1 && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-600">{t('Taxa Stripe', 'Stripe Fee')} ({invoice.payment_method.stripe_fee_percentage}%):</span>
                  <span className="font-mono font-bold text-red-600 text-xs">
                    {getSimboloMoeda(invoice.currency)} {(Number(invoice.total_amount) * Number(invoice.payment_method.stripe_fee_percentage) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-indigo-50 px-4 rounded-lg mt-2">
                <span className="text-sm font-black text-slate-900 uppercase">{t('Total:', 'Total:')}</span>
                <span className="text-lg font-mono font-black text-indigo-600">
                  {getSimboloMoeda(invoice.currency)} {
                    (() => {
                      let total = Number(invoice.total_amount);
                      if (invoice.payment_method?.type === 'paypal' && invoice.payment_method?.paypal_fee_percentage) {
                        total += Number(invoice.total_amount) * Number(invoice.payment_method.paypal_fee_percentage) / 100;
                      } else if (invoice.payment_method?.type === 'stripe' && invoice.payment_method?.stripe_fee_percentage && invoice.payment_method?.show_fee_on_invoice === 1) {
                        total += Number(invoice.total_amount) * Number(invoice.payment_method.stripe_fee_percentage) / 100;
                      }
                      return total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Informações de Pagamento */}
          {invoice.payment_method && (
            <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('Dados para Pagamento', 'Payment Information')}</h4>

              {invoice.payment_method.type === 'pix' ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900">PIX - {invoice.payment_method.name}</p>
                  <div className="bg-white p-3 rounded border border-slate-300">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">{t('Chave PIX', 'PIX Key')}</p>
                    <p className="text-xs font-mono font-bold text-slate-900">{invoice.payment_method.pix_key}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{t('Tipo', 'Type')}: {invoice.payment_method.pix_key_type?.toUpperCase()}</p>
                  </div>
                </div>
              ) : invoice.payment_method.type === 'international' ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900">{t('Transferência Internacional', 'International Transfer')} - {invoice.payment_method.name}</p>
                  <div className="bg-white p-3 rounded border border-slate-300 space-y-2">
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest">Beneficiary Name</p>
                      <p className="text-xs text-slate-900">{invoice.payment_method.beneficiary_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest">Account Number (IBAN)</p>
                      <p className="text-xs font-mono text-slate-900">{invoice.payment_method.beneficiary_account_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest">SWIFT Code</p>
                      <p className="text-xs font-mono text-slate-900">{invoice.payment_method.swift_code}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest">Bank Name</p>
                      <p className="text-xs text-slate-900">{invoice.payment_method.bank_name}</p>
                    </div>
                    {invoice.payment_method.bank_address && (
                      <div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest">Bank Address</p>
                        <p className="text-xs text-slate-700">{invoice.payment_method.bank_address}</p>
                      </div>
                    )}
                    {invoice.payment_method.intermediary_swift_code && (
                      <div className="pt-2 border-t border-slate-300">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Intermediary Bank</p>
                        <p className="text-[10px] text-slate-700">SWIFT: {invoice.payment_method.intermediary_swift_code}</p>
                        {invoice.payment_method.intermediary_bank_name && (
                          <p className="text-[10px] text-slate-700">{invoice.payment_method.intermediary_bank_name}</p>
                        )}
                        {invoice.payment_method.intermediary_bank_address && (
                          <p className="text-[10px] text-slate-700">{invoice.payment_method.intermediary_bank_address}</p>
                        )}
                        {invoice.payment_method.intermediary_account_number && (
                          <p className="text-[10px] text-slate-700">Account: {invoice.payment_method.intermediary_account_number}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : invoice.payment_method.type === 'paypal' ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900">PayPal - {invoice.payment_method.name}</p>
                  <div className="bg-white p-3 rounded border border-slate-300">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Email PayPal</p>
                    <p className="text-xs font-mono font-bold text-slate-900">{invoice.payment_method.paypal_email}</p>
                    {invoice.payment_method.paypal_fee_percentage && (
                      <p className="text-[10px] text-slate-500 mt-1">{t('Taxa', 'Fee')}: {invoice.payment_method.paypal_fee_percentage}%</p>
                    )}
                  </div>
                </div>
              ) : invoice.payment_method.type === 'stripe' ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900">Stripe - {invoice.payment_method.name}</p>
                  <div className="bg-white p-3 rounded border border-slate-300">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Email Stripe</p>
                    <p className="text-xs font-mono font-bold text-slate-900">{invoice.payment_method.stripe_email}</p>
                    {invoice.payment_method.stripe_fee_percentage && invoice.payment_method.show_fee_on_invoice === 1 && (
                      <p className="text-[10px] text-slate-500 mt-1">{t('Taxa', 'Fee')}: {invoice.payment_method.stripe_fee_percentage}%</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Fallback: Informações Bancárias antigas (se não houver payment_method) */}
          {!invoice.payment_method && invoice.company_bank_info && (
            <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('Dados Bancários para Pagamento', 'Bank Information for Payment')}</h4>
              <p className="text-xs text-slate-700 whitespace-pre-line">{invoice.company_bank_info}</p>
            </div>
          )}

          {/* Notas */}
          {invoice.notes && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2">{t('Observações', 'Notes')}</h4>
              <p className="text-xs text-slate-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
            <p>{t('Invoice gerada em', 'Invoice generated on')} {new Date().toLocaleDateString('pt-BR')} {t('via', 'via')} Timesheet Master</p>
          </div>
        </div>
      </div>

      {/* Estilos para impressão */}
      <style>{`
        @media print {
          /* Ocultar todos os elementos exceto o conteúdo da invoice */
          body > *:not(.invoice-view-root) {
            display: none !important;
          }

          /* Ocultar overlay e elementos de navegação */
          .no-print {
            display: none !important;
          }

          /* Resetar estilos do modal para impressão */
          .invoice-view-root {
            position: static !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
          }

          .invoice-view-root > div {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }

          .invoice-container {
            padding: 15mm !important;
            max-width: 100% !important;
          }

          /* Garantir que o body tenha fundo branco */
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Forçar cores para impressão */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceView;
