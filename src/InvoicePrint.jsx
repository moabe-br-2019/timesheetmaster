import React, { useEffect } from 'react';

const InvoicePrint = ({ invoice }) => {
  const getSimboloMoeda = (code) => {
    const symbols = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£' };
    return symbols[code] || code;
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

  // Dispara impressão automaticamente após carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Wrapper para simular página A4 */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl" style={{ minHeight: '297mm' }}>
        <div className="p-12 text-black">
      {/* Header */}
      <div className="border-b-2 border-slate-300 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">INVOICE</h1>
            <p className="text-2xl font-mono font-bold text-indigo-600">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-lg font-bold text-sm ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
              invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-slate-100 text-slate-600'
            }`}>
              {getStatusLabel(invoice.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Informações da Empresa e Cliente */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">De (Prestador)</h3>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900">{invoice.company_name || 'Nome da Empresa'}</p>
            {invoice.company_address && <p className="text-sm text-slate-700 mt-1">{invoice.company_address}</p>}
            {invoice.company_tax_id && <p className="text-sm text-slate-600 mt-1">Tax ID: {invoice.company_tax_id}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Para (Cliente)</h3>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900">{invoice.client_name || 'Nome do Cliente'}</p>
            {invoice.client_email && <p className="text-sm text-slate-700 mt-1">{invoice.client_email}</p>}
            {invoice.client_address && <p className="text-sm text-slate-700 mt-1">{invoice.client_address}</p>}
            {invoice.client_tax_id && <p className="text-sm text-slate-600 mt-1">Tax ID: {invoice.client_tax_id}</p>}
          </div>
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Data de Emissão</p>
          <p className="text-sm font-mono font-bold text-slate-900">{new Date(invoice.issue_date).toLocaleDateString('pt-BR')}</p>
        </div>
        {invoice.due_date && (
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Vencimento</p>
            <p className="text-sm font-mono font-bold text-slate-900">{new Date(invoice.due_date).toLocaleDateString('pt-BR')}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Período</p>
          <p className="text-sm font-mono text-slate-900">
            {new Date(invoice.date_from).toLocaleDateString('pt-BR')} - {new Date(invoice.date_to).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Itens */}
      <div className="mb-8">
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Itens</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="text-left p-3 text-xs font-black text-slate-700 uppercase tracking-widest">Data</th>
              <th className="text-left p-3 text-xs font-black text-slate-700 uppercase tracking-widest">Projeto</th>
              <th className="text-left p-3 text-xs font-black text-slate-700 uppercase tracking-widest">Atividade</th>
              <th className="text-right p-3 text-xs font-black text-slate-700 uppercase tracking-widest">Horas</th>
              <th className="text-right p-3 text-xs font-black text-slate-700 uppercase tracking-widest">Valor/Hora</th>
              <th className="text-right p-3 text-xs font-black text-slate-700 uppercase tracking-widest">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="p-3 text-sm font-mono text-slate-900">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3 text-sm text-slate-900">{item.projeto_nome}</td>
                <td className="p-3 text-sm text-slate-700">{item.atividade}</td>
                <td className="p-3 text-sm font-mono text-right text-slate-900">{Number(item.horas).toFixed(2)}h</td>
                <td className="p-3 text-sm font-mono text-right text-slate-900">
                  {getSimboloMoeda(item.moeda_na_epoca || invoice.currency)} {Number(item.valor_hora_na_epoca).toFixed(2)}
                </td>
                <td className="p-3 text-sm font-mono text-right font-bold text-slate-900">
                  {getSimboloMoeda(item.moeda_na_epoca || invoice.currency)} {(Number(item.horas) * Number(item.valor_hora_na_epoca)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totais */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-sm font-medium text-slate-600">Total de Horas:</span>
            <span className="text-sm font-mono font-bold text-slate-900">{Number(invoice.total_hours).toFixed(2)}h</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-sm font-medium text-slate-600">Subtotal:</span>
            <span className="text-sm font-mono font-bold text-slate-900">
              {getSimboloMoeda(invoice.currency)} {Number(invoice.total_amount).toFixed(2)}
            </span>
          </div>
          {invoice.payment_method?.type === 'paypal' && invoice.payment_method?.paypal_fee_percentage && (
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-sm font-medium text-slate-600">Taxa PayPal ({invoice.payment_method.paypal_fee_percentage}%):</span>
              <span className="text-sm font-mono font-bold text-red-600">
                {getSimboloMoeda(invoice.currency)} {(Number(invoice.total_amount) * Number(invoice.payment_method.paypal_fee_percentage) / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-indigo-50 px-4 rounded-lg mt-2">
            <span className="text-base font-black text-slate-900 uppercase tracking-wide">Total:</span>
            <span className="text-xl font-mono font-black text-indigo-600">
              {getSimboloMoeda(invoice.currency)} {
                invoice.payment_method?.type === 'paypal' && invoice.payment_method?.paypal_fee_percentage
                  ? (Number(invoice.total_amount) + (Number(invoice.total_amount) * Number(invoice.payment_method.paypal_fee_percentage) / 100)).toFixed(2)
                  : Number(invoice.total_amount).toFixed(2)
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
            <div className="space-y-3">
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

      {/* Fallback: Informações Bancárias antigas */}
      {!invoice.payment_method && invoice.company_bank_info && (
        <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Dados Bancários para Pagamento</h4>
          <p className="text-sm text-slate-700 whitespace-pre-line">{invoice.company_bank_info}</p>
        </div>
      )}

      {/* Notas */}
      {invoice.notes && (
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-8">
          <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-3">Observações</h4>
          <p className="text-sm text-slate-700 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>Invoice gerada em {new Date().toLocaleDateString('pt-BR')} via Timesheet Master</p>
      </div>

      {/* Estilos para impressão */}
      <style>{`
        /* Forçar background branco em todo o documento */
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          background: #f5f5f5 !important;
          min-height: 100vh !important;
        }

        /* Remover qualquer background escuro do App */
        body > div {
          background: transparent !important;
        }

        @media print {
          html, body, #root {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body > div {
            background: white !important;
          }

          .shadow-2xl {
            box-shadow: none !important;
          }

          .max-w-\\[210mm\\] {
            max-width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        @media screen {
          .max-w-\\[210mm\\] {
            margin-top: 2rem;
            margin-bottom: 2rem;
          }
        }
      `}</style>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
