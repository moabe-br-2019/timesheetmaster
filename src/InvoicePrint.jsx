import React, { useEffect } from 'react';

// Função helper para formatar datas sem problemas de timezone
const formatDateLocal = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const InvoicePrint = ({ invoice, language = 'pt', showDescription = false }) => {
  const getSimboloMoeda = (code) => {
    const symbols = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£' };
    return symbols[code] || code;
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
        <div className="p-10 text-black">
      {/* Header */}
      <div className="border-b-2 border-slate-300 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">INVOICE</h1>
            <p className="text-xl font-mono font-bold text-indigo-600">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-3 py-1 rounded-lg font-bold text-xs ${
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
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('De (Prestador)', 'From (Provider)')}</h3>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 text-sm">{invoice.company_name || t('Nome da Empresa', 'Company Name')}</p>
            {invoice.company_address && <p className="text-xs text-slate-700 mt-1">{invoice.company_address}</p>}
            {invoice.company_tax_id && <p className="text-xs text-slate-600 mt-1">{t('CNPJ', 'Tax ID')}: {invoice.company_tax_id}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('Para (Cliente)', 'To (Client)')}</h3>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 text-sm">{invoice.client_name || t('Nome do Cliente', 'Client Name')}</p>
            {invoice.client_email && <p className="text-xs text-slate-700 mt-1">{invoice.client_email}</p>}
            {invoice.client_address && <p className="text-xs text-slate-700 mt-1">{invoice.client_address}</p>}
            {invoice.client_tax_id && <p className="text-xs text-slate-600 mt-1">{t('CNPJ', 'Tax ID')}: {invoice.client_tax_id}</p>}
          </div>
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{t('Data de Emissão', 'Issue Date')}</p>
          <p className="text-xs font-mono font-bold text-slate-900">{formatDateLocal(invoice.issue_date)}</p>
        </div>
        {invoice.due_date && (
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{t('Vencimento', 'Due Date')}</p>
            <p className="text-xs font-mono font-bold text-slate-900">{formatDateLocal(invoice.due_date)}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{t('Período', 'Period')}</p>
          <p className="text-xs font-mono text-slate-900">
            {formatDateLocal(invoice.date_from)} - {formatDateLocal(invoice.date_to)}
          </p>
        </div>
      </div>

      {/* Itens */}
      <div className="mb-6">
        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">{t('Itens', 'Items')}</h3>
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '32%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="text-left p-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">{t('Data', 'Date')}</th>
              <th className="text-left p-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">{t('Projeto', 'Project')}</th>
              <th className="text-left p-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">{t('Atividade', 'Activity')}</th>
              <th className="text-right p-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">{t('Horas', 'Hours')}</th>
              <th className="text-right p-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">{t('Valor/Hora', 'Rate/Hour')}</th>
              <th className="text-right p-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">{t('Total', 'Total')}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="p-2 text-xs font-mono text-slate-900">{formatDateLocal(item.data)}</td>
                <td className="p-2 text-xs text-slate-900">{item.projeto_nome}</td>
                <td className="p-2 text-xs text-slate-700">
                  <div className="break-words">{item.atividade}</div>
                  {showDescription && item.descricao && (
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight break-words">{item.descricao}</div>
                  )}
                </td>
                <td className="p-2 text-xs font-mono text-right text-slate-900 whitespace-nowrap">{Number(item.horas).toFixed(2)}h</td>
                <td className="p-2 text-xs font-mono text-right text-slate-900 whitespace-nowrap">
                  {getSimboloMoeda(item.moeda_na_epoca || invoice.currency)} {Number(item.valor_hora_na_epoca).toFixed(2)}
                </td>
                <td className="p-2 text-xs font-mono text-right font-bold text-slate-900 whitespace-nowrap">
                  {getSimboloMoeda(item.moeda_na_epoca || invoice.currency)} {(Number(item.horas) * Number(item.valor_hora_na_epoca)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totais */}
      <div className="flex justify-end mb-6">
        <div className="w-60">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-xs font-medium text-slate-600">{t('Total de Horas:', 'Total Hours:')}</span>
            <span className="text-xs font-mono font-bold text-slate-900">{Number(invoice.total_hours).toFixed(2)}h</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-xs font-medium text-slate-600">{t('Subtotal:', 'Subtotal:')}</span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {getSimboloMoeda(invoice.currency)} {Number(invoice.total_amount).toFixed(2)}
            </span>
          </div>
          {invoice.payment_method?.type === 'paypal' && invoice.payment_method?.paypal_fee_percentage && (
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-xs font-medium text-slate-600">{t('Taxa PayPal', 'PayPal Fee')} ({invoice.payment_method.paypal_fee_percentage}%):</span>
              <span className="text-xs font-mono font-bold text-red-600">
                {getSimboloMoeda(invoice.currency)} {(Number(invoice.total_amount) * Number(invoice.payment_method.paypal_fee_percentage) / 100).toFixed(2)}
              </span>
            </div>
          )}
          {invoice.payment_method?.type === 'stripe' && invoice.payment_method?.stripe_fee_percentage && invoice.payment_method?.show_fee_on_invoice === 1 && (
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-xs font-medium text-slate-600">{t('Taxa Stripe', 'Stripe Fee')} ({invoice.payment_method.stripe_fee_percentage}%):</span>
              <span className="text-xs font-mono font-bold text-red-600">
                {getSimboloMoeda(invoice.currency)} {(Number(invoice.total_amount) * Number(invoice.payment_method.stripe_fee_percentage) / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-indigo-50 px-3 rounded-lg mt-2">
            <span className="text-sm font-black text-slate-900 uppercase tracking-wide">{t('Total:', 'Total:')}</span>
            <span className="text-lg font-mono font-black text-indigo-600">
              {getSimboloMoeda(invoice.currency)} {
                (() => {
                  let total = Number(invoice.total_amount);
                  if (invoice.payment_method?.type === 'paypal' && invoice.payment_method?.paypal_fee_percentage) {
                    total += Number(invoice.total_amount) * Number(invoice.payment_method.paypal_fee_percentage) / 100;
                  } else if (invoice.payment_method?.type === 'stripe' && invoice.payment_method?.stripe_fee_percentage && invoice.payment_method?.show_fee_on_invoice === 1) {
                    total += Number(invoice.total_amount) * Number(invoice.payment_method.stripe_fee_percentage) / 100;
                  }
                  return total.toFixed(2);
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

              {/* Link de pagamento Stripe */}
              {invoice.stripe_payment_link && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-[10px] text-blue-600 uppercase tracking-widest mb-2">{t('Link de Pagamento', 'Payment Link')}</p>
                  <a
                    href={invoice.stripe_payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline break-all block"
                  >
                    {invoice.stripe_payment_link}
                  </a>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Fallback: Informações Bancárias antigas */}
      {!invoice.payment_method && invoice.company_bank_info && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{t('Dados Bancários para Pagamento', 'Bank Information for Payment')}</h4>
          <p className="text-xs text-slate-700 whitespace-pre-line">{invoice.company_bank_info}</p>
        </div>
      )}

      {/* Notas */}
      {invoice.notes && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
          <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2">{t('Observações', 'Notes')}</h4>
          <p className="text-xs text-slate-700 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
        <p>{t('Invoice gerada em', 'Invoice generated on')} {new Date().toLocaleDateString('pt-BR')} {t('via', 'via')} Timesheet Master</p>
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
