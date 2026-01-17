import React from 'react';
import { X, Printer } from 'lucide-react';

// Função helper para formatar datas sem problemas de timezone
const formatDateLocal = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const InvoiceView = ({ invoice, onClose, onRefresh }) => {
  const getSimboloMoeda = (code) => {
    const symbols = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£' };
    return symbols[code] || code;
  };

  const handlePrint = () => {
    // Abrir página de impressão em nova aba
    const printUrl = `${window.location.origin}${window.location.pathname}?print=true&invoice=${invoice.id}`;
    window.open(printUrl, '_blank');
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'RASCUNHO',
      sent: 'ENVIADA',
      paid: 'PAGA',
      cancelled: 'CANCELADA'
    };
    return labels[status] || status.toUpperCase();
  };

  return (
    <div className="invoice-view-root fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Botões de ação (ocultos na impressão) */}
        <div className="no-print bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800">
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

        {/* Conteúdo da Invoice (print-friendly) */}
        <div className="invoice-container p-12 bg-white text-black">
          {/* Header */}
          <div className="border-b-2 border-slate-300 pb-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">INVOICE</h1>
                <p className="text-2xl font-mono font-bold text-indigo-600">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className={`text-lg font-black ${
                  invoice.status === 'paid' ? 'text-green-600' :
                  invoice.status === 'sent' ? 'text-blue-600' :
                  invoice.status === 'cancelled' ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {getStatusLabel(invoice.status)}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600 font-semibold">Data de Emissão</p>
                <p className="font-bold">{formatDateLocal(invoice.issue_date)}</p>
              </div>
              {invoice.due_date && (
                <div>
                  <p className="text-slate-600 font-semibold">Vencimento</p>
                  <p className="font-bold">{formatDateLocal(invoice.due_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            {/* De */}
            <div>
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">De:</h3>
              <div className="text-sm space-y-1">
                {invoice.company_name && <p className="font-bold text-base">{invoice.company_name}</p>}
                {invoice.company_address && <p className="text-slate-700">{invoice.company_address}</p>}
                {invoice.company_tax_id && <p className="text-slate-700">CNPJ: {invoice.company_tax_id}</p>}
              </div>
            </div>

            {/* Para */}
            <div>
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Para:</h3>
              <div className="text-sm space-y-1">
                {invoice.client_name && <p className="font-bold text-base">{invoice.client_name}</p>}
                {invoice.client_email && <p className="text-slate-700">{invoice.client_email}</p>}
                {invoice.client_address && <p className="text-slate-700">{invoice.client_address}</p>}
                {invoice.client_tax_id && <p className="text-slate-700">CNPJ: {invoice.client_tax_id}</p>}
              </div>
            </div>
          </div>

          {/* Período */}
          <div className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Período de Trabalho</p>
            <p className="font-bold text-slate-900">
              {formatDateLocal(invoice.date_from)} - {formatDateLocal(invoice.date_to)}
            </p>
          </div>

          {/* Tabela de Itens */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="text-left py-3 text-xs font-black text-slate-600 uppercase tracking-widest">Data</th>
                <th className="text-left py-3 text-xs font-black text-slate-600 uppercase tracking-widest">Projeto</th>
                <th className="text-left py-3 text-xs font-black text-slate-600 uppercase tracking-widest">Atividade</th>
                <th className="text-right py-3 text-xs font-black text-slate-600 uppercase tracking-widest">Horas</th>
                <th className="text-right py-3 text-xs font-black text-slate-600 uppercase tracking-widest">Valor/h</th>
                <th className="text-right py-3 text-xs font-black text-slate-600 uppercase tracking-widest">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.map((item, index) => {
                const subtotal = Number(item.horas) * Number(item.valor_hora_na_epoca);
                return (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-3 text-sm text-slate-700">{formatDateLocal(item.data)}</td>
                    <td className="py-3 text-sm text-slate-900 font-medium">{item.projeto_nome}</td>
                    <td className="py-3 text-sm text-slate-700">
                      <div>{item.atividade}</div>
                      {item.descricao && <div className="text-xs text-slate-500 mt-1">{item.descricao}</div>}
                    </td>
                    <td className="py-3 text-sm text-right font-mono">{item.horas}h</td>
                    <td className="py-3 text-sm text-right font-mono">{getSimboloMoeda(invoice.currency)} {Number(item.valor_hora_na_epoca).toFixed(2)}</td>
                    <td className="py-3 text-sm text-right font-mono font-bold">{getSimboloMoeda(invoice.currency)} {subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totais */}
          <div className="flex justify-end mb-10">
            <div className="w-80">
              <div className="flex justify-between py-3 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-600">Total de Horas:</span>
                <span className="font-mono font-bold">{invoice.total_hours}h</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-600">Subtotal:</span>
                <span className="font-mono font-bold">
                  {getSimboloMoeda(invoice.currency)} {Number(invoice.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {invoice.payment_method?.type === 'paypal' && invoice.payment_method?.paypal_fee_percentage && (
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-600">Taxa PayPal ({invoice.payment_method.paypal_fee_percentage}%):</span>
                  <span className="font-mono font-bold text-red-600">
                    {getSimboloMoeda(invoice.currency)} {(Number(invoice.total_amount) * Number(invoice.payment_method.paypal_fee_percentage) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-4 bg-indigo-50 px-4 rounded-lg mt-3">
                <span className="text-lg font-black text-slate-900 uppercase">Total:</span>
                <span className="text-2xl font-mono font-black text-indigo-600">
                  {getSimboloMoeda(invoice.currency)} {
                    invoice.payment_method?.type === 'paypal' && invoice.payment_method?.paypal_fee_percentage
                      ? (Number(invoice.total_amount) + (Number(invoice.total_amount) * Number(invoice.payment_method.paypal_fee_percentage) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : Number(invoice.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Informações de Pagamento */}
          {invoice.payment_method && (
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Dados para Pagamento</h4>

              {invoice.payment_method.type === 'pix' ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">PIX - {invoice.payment_method.name}</p>
                  <div className="bg-white p-4 rounded border border-slate-300">
                    <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Chave PIX</p>
                    <p className="text-sm font-mono font-bold text-slate-900">{invoice.payment_method.pix_key}</p>
                    <p className="text-xs text-slate-500 mt-1">Tipo: {invoice.payment_method.pix_key_type?.toUpperCase()}</p>
                  </div>
                </div>
              ) : invoice.payment_method.type === 'international' ? (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-900">Transferência Internacional - {invoice.payment_method.name}</p>
                  <div className="bg-white p-4 rounded border border-slate-300 space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-widest">Beneficiary Name</p>
                      <p className="text-sm text-slate-900">{invoice.payment_method.beneficiary_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-widest">Account Number (IBAN)</p>
                      <p className="text-sm font-mono text-slate-900">{invoice.payment_method.beneficiary_account_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-widest">SWIFT Code</p>
                      <p className="text-sm font-mono text-slate-900">{invoice.payment_method.swift_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-widest">Bank Name</p>
                      <p className="text-sm text-slate-900">{invoice.payment_method.bank_name}</p>
                    </div>
                    {invoice.payment_method.bank_address && (
                      <div>
                        <p className="text-xs text-slate-600 uppercase tracking-widest">Bank Address</p>
                        <p className="text-sm text-slate-700">{invoice.payment_method.bank_address}</p>
                      </div>
                    )}
                    {invoice.payment_method.intermediary_swift_code && (
                      <div className="pt-3 border-t border-slate-300">
                        <p className="text-xs text-slate-600 uppercase tracking-widest mb-2">Intermediary Bank</p>
                        <p className="text-xs text-slate-700">SWIFT: {invoice.payment_method.intermediary_swift_code}</p>
                        {invoice.payment_method.intermediary_bank_name && (
                          <p className="text-xs text-slate-700">{invoice.payment_method.intermediary_bank_name}</p>
                        )}
                        {invoice.payment_method.intermediary_bank_address && (
                          <p className="text-xs text-slate-700">{invoice.payment_method.intermediary_bank_address}</p>
                        )}
                        {invoice.payment_method.intermediary_account_number && (
                          <p className="text-xs text-slate-700">Account: {invoice.payment_method.intermediary_account_number}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : invoice.payment_method.type === 'paypal' ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">PayPal - {invoice.payment_method.name}</p>
                  <div className="bg-white p-4 rounded border border-slate-300">
                    <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Email PayPal</p>
                    <p className="text-sm font-mono font-bold text-slate-900">{invoice.payment_method.paypal_email}</p>
                    {invoice.payment_method.paypal_fee_percentage && (
                      <p className="text-xs text-slate-500 mt-2">Taxa: {invoice.payment_method.paypal_fee_percentage}%</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Fallback: Informações Bancárias antigas (se não houver payment_method) */}
          {!invoice.payment_method && invoice.company_bank_info && (
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Dados Bancários para Pagamento</h4>
              <p className="text-sm text-slate-700 whitespace-pre-line">{invoice.company_bank_info}</p>
            </div>
          )}

          {/* Notas */}
          {invoice.notes && (
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-3">Observações</h4>
              <p className="text-sm text-slate-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>Invoice gerada em {new Date().toLocaleDateString('pt-BR')} via Timesheet Master</p>
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
            padding: 20mm !important;
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
