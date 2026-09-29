export interface FinancialReportData {
  userName: string;
  userEmail: string;
  currency: string;
  currencySymbol: string;
  generatedDate: string;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  savingsRate: number;
  liquidCash: number;
  liquidRunwayMonths: number;
  debtToAssetRatio: number;
  healthScore?: number;
  healthGrade?: string;
  assets: Array<{
    name: string;
    category: string;
    value: number;
    currency?: string;
    institution?: string;
  }>;
  liabilities: Array<{
    name: string;
    category: string;
    balance: number;
    interestRate?: number;
    monthlyPayment?: number;
    institution?: string;
  }>;
  budgets?: Array<{
    category: string;
    allocatedAmount: number;
    period: string;
  }>;
  goals?: Array<{
    name: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
  }>;
}

export function generateFinancialReportHtml(data: FinancialReportData): string {
  const formatMoney = (val: number) => {
    return `${data.currencySymbol}${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const assetAllocation = data.assets.map(a => {
    const pct = data.totalAssets > 0 ? ((a.value / data.totalAssets) * 100).toFixed(1) : '0';
    return { ...a, pct };
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aura Financial Health & Solvency Report - ${data.generatedDate}</title>
  <style>
    @page {
      margin: 12mm 10mm 14mm 10mm;
      size: A4 portrait;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #0f172a;
      background: #f8fafc;
      font-size: 13px;
      line-height: 1.5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      background: #1e293b;
      color: #ffffff;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .toolbar h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #334155;
      color: #ffffff;
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      color: #64748b;
      font-size: 12px;
      margin: 4px 0 0 0;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .meta-box strong {
      color: #0f172a;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 28px;
    }
    .kpi-card {
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .kpi-card.highlight {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .kpi-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 900;
      font-family: monospace, sans-serif;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .kpi-val.emerald { color: #059669; }
    .kpi-val.rose { color: #e11d48; }
    .kpi-val.blue { color: #2563eb; }
    .kpi-sub {
      font-size: 10px;
      color: #64748b;
      margin-top: 4px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e293b;
      border-left: 4px solid #2563eb;
      padding-left: 10px;
      margin: 28px 0 14px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-title span.badge {
      font-size: 10px;
      background: #e2e8f0;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      color: #475569;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 11px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 10px 12px;
      font-weight: 700;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #fcfdfe;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: monospace, sans-serif; }
    .tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      background: #e0f2fe;
      color: #0369a1;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .container {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .toolbar {
        display: none !important;
      }
    }
    @media (max-width: 640px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="toolbar no-print">
      <div>
        <h3>Financial Summary &amp; Solvency Report</h3>
        <p style="margin: 2px 0 0 0; font-size: 11px; opacity: 0.8;">Downloadable on phone, tablet, or desktop systems anywhere</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-primary" onclick="window.print()">
          🖨️ Print / Save PDF
        </button>
      </div>
    </div>

    <div class="header">
      <div>
        <h1 class="brand-title">AURA WEALTH &amp; FINANCIAL REPORT</h1>
        <p class="brand-subtitle">Executive Financial Position, Cash Flow &amp; Solvency Audit</p>
      </div>
      <div class="meta-box">
        <div>Client: <strong>${data.userName || 'Account Holder'}</strong></div>
        <div>Email: <strong>${data.userEmail || 'Private Portfolio'}</strong></div>
        <div>Date Generated: <strong>${data.generatedDate}</strong></div>
        <div>Reporting Currency: <strong>${data.currency} (${data.currencySymbol})</strong></div>
      </div>
    </div>

    <!-- Core KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-title">Net Worth (Equity)</div>
        <div class="kpi-val emerald">${formatMoney(data.netWorth)}</div>
        <div class="kpi-sub">Total Assets minus Liabilities</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Gross Assets</div>
        <div class="kpi-val blue">${formatMoney(data.totalAssets)}</div>
        <div class="kpi-sub">${data.assets.length} diversified holdings</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Total Liabilities</div>
        <div class="kpi-val rose">${formatMoney(data.totalLiabilities)}</div>
        <div class="kpi-sub">Debt-to-Asset: ${data.debtToAssetRatio.toFixed(1)}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Financial Health</div>
        <div class="kpi-val blue">${data.healthScore ?? 85}/100</div>
        <div class="kpi-sub">Grade ${data.healthGrade ?? 'A'} • Solvency Protected</div>
      </div>
    </div>

    <!-- Cashflow Summary -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">Monthly Income</div>
        <div class="kpi-val emerald">${formatMoney(data.monthlyIncome)}</div>
        <div class="kpi-sub">Inflow per month</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Monthly Burn</div>
        <div class="kpi-val rose">${formatMoney(data.monthlyExpenses)}</div>
        <div class="kpi-sub">Operating expenses</div>
      </div>
      <div class="kpi-card highlight">
        <div class="kpi-title">Net Savings Surplus</div>
        <div class="kpi-val emerald">${formatMoney(data.netSavings)}</div>
        <div class="kpi-sub">Savings Rate: ${data.savingsRate.toFixed(1)}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Liquid Runway Buffer</div>
        <div class="kpi-val">${data.liquidRunwayMonths.toFixed(1)} Mo</div>
        <div class="kpi-sub">${formatMoney(data.liquidCash)} in cash/bank</div>
      </div>
    </div>

    <!-- Assets Ledger -->
    <div class="section-title">
      <span>1. Asset Portfolio Holdings</span>
      <span class="badge">${data.assets.length} Holdings</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Asset Name</th>
          <th>Category</th>
          <th>Institution</th>
          <th class="text-right">Valuation</th>
          <th class="text-right">Share %</th>
        </tr>
      </thead>
      <tbody>
        ${assetAllocation.length > 0 ? assetAllocation.map(a => `
          <tr>
            <td><strong>${a.name}</strong></td>
            <td><span class="tag">${a.category}</span></td>
            <td>${a.institution || '—'}</td>
            <td class="text-right font-mono font-bold">${formatMoney(a.value)}</td>
            <td class="text-right font-mono">${a.pct}%</td>
          </tr>
        `).join('') : `
          <tr><td colspan="5" class="text-center" style="padding: 16px; color: #94a3b8;">No assets recorded</td></tr>
        `}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background: #f8fafc; border-top: 2px solid #cbd5e1;">
          <td colspan="3">Total Portfolio Assets</td>
          <td class="text-right font-mono text-emerald">${formatMoney(data.totalAssets)}</td>
          <td class="text-right font-mono">100.0%</td>
        </tr>
      </tfoot>
    </table>

    <!-- Liabilities Ledger -->
    <div class="section-title">
      <span>2. Liabilities &amp; Outstanding Debt</span>
      <span class="badge">${data.liabilities.length} Accounts</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Liability / Loan Name</th>
          <th>Category</th>
          <th>Institution</th>
          <th class="text-center">APR Rate</th>
          <th class="text-right">Monthly EMI</th>
          <th class="text-right">Outstanding Balance</th>
        </tr>
      </thead>
      <tbody>
        ${data.liabilities.length > 0 ? data.liabilities.map(l => `
          <tr>
            <td><strong>${l.name}</strong></td>
            <td><span class="tag" style="background:#ffe4e6; color:#be123c;">${l.category}</span></td>
            <td>${l.institution || '—'}</td>
            <td class="text-center font-mono">${l.interestRate ? `${l.interestRate}%` : '0%'}</td>
            <td class="text-right font-mono">${l.monthlyPayment ? formatMoney(l.monthlyPayment) : '—'}</td>
            <td class="text-right font-mono font-bold" style="color: #be123c;">${formatMoney(l.balance)}</td>
          </tr>
        `).join('') : `
          <tr><td colspan="6" class="text-center" style="padding: 16px; color: #059669;">Debt-Free: No outstanding liabilities recorded.</td></tr>
        `}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background: #f8fafc; border-top: 2px solid #cbd5e1;">
          <td colspan="5">Total Outstanding Debt</td>
          <td class="text-right font-mono" style="color: #be123c;">${formatMoney(data.totalLiabilities)}</td>
        </tr>
      </tfoot>
    </table>

    ${data.budgets && data.budgets.length > 0 ? `
    <!-- Budget Allocations -->
    <div class="section-title">
      <span>3. Budget Envelopes</span>
      <span class="badge">${data.budgets.length} Envelopes</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Period</th>
          <th class="text-right">Allocated Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.budgets.map(b => `
          <tr>
            <td><strong>${b.category}</strong></td>
            <td>${b.period}</td>
            <td class="text-right font-mono font-bold">${formatMoney(b.allocatedAmount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${data.goals && data.goals.length > 0 ? `
    <!-- Goals & Milestones -->
    <div class="section-title">
      <span>4. Financial Goals &amp; Milestones</span>
      <span class="badge">${data.goals.length} Goals</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Goal Name</th>
          <th>Category</th>
          <th class="text-right">Current Saved</th>
          <th class="text-right">Target Amount</th>
          <th class="text-right">Progress</th>
        </tr>
      </thead>
      <tbody>
        ${data.goals.map(g => {
          const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
          return `
            <tr>
              <td><strong>${g.name}</strong></td>
              <td>${g.category}</td>
              <td class="text-right font-mono">${formatMoney(g.currentAmount)}</td>
              <td class="text-right font-mono font-bold">${formatMoney(g.targetAmount)}</td>
              <td class="text-right font-mono" style="font-weight: bold; color: ${pct >= 100 ? '#059669' : '#2563eb'};">${pct}%</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="footer">
      <div>Aura Private Wealth • End-to-End Client Financial Statement</div>
      <div>Confidential &amp; Proprietary • Page 1 of 1</div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadFinancialReportFile(data: FinancialReportData): void {
  const htmlContent = generateFinancialReportHtml(data);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `Aura_Financial_Report_${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
