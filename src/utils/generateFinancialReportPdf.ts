import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialReportData } from './generateFinancialReportHtml';

/**
 * Generates and downloads a clean, printable PDF summary of financial data
 * Works seamlessly across phones (iOS/Android), tablets, and desktop systems.
 */
export function generateFinancialReportPdf(data: FinancialReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const formatMoney = (val: number) => {
    return `${data.currencySymbol || '$'}${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('AURA WEALTH & FINANCIAL REPORT', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Executive Financial Health, Asset Allocation & Solvency Summary', margin, 18);
  doc.text(`Generated: ${data.generatedDate} | Denominated in ${data.currency}`, margin, 23);

  // Client Details (Right side of banner)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Client: ${data.userName || 'Account Holder'}`, pageWidth - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Account: ${data.userEmail || 'Private Portfolio'}`, pageWidth - margin, 20, { align: 'right' });

  let currentY = 36;

  // Key KPI Cards (4 columns)
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 18;

  const kpis = [
    { label: 'NET WORTH', value: formatMoney(data.netWorth), color: [16, 185, 129] }, // emerald
    { label: 'TOTAL ASSETS', value: formatMoney(data.totalAssets), color: [59, 130, 246] }, // blue
    { label: 'TOTAL DEBTS', value: formatMoney(data.totalLiabilities), color: [239, 68, 68] }, // red
    { label: 'FIN HEALTH', value: `${data.healthScore ?? 85}/100 (${data.healthGrade ?? 'A'})`, color: [168, 85, 247] }, // purple
  ];

  kpis.forEach((kpi, index) => {
    const x = margin + index * (cardWidth + 3);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.label, x + cardWidth / 2, currentY + 5, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + cardWidth / 2, currentY + 13, { align: 'center' });
  });

  currentY += cardHeight + 6;

  // Cash Flow & Runway Metrics Row
  const cfCardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cfMetrics = [
    { label: 'Monthly Income', val: formatMoney(data.monthlyIncome) },
    { label: 'Monthly Burn', val: formatMoney(data.monthlyExpenses) },
    { label: 'Net Monthly Savings', val: `${formatMoney(data.netSavings)} (${data.savingsRate.toFixed(1)}%)` },
    { label: 'Liquid Cash Runway', val: `${data.liquidRunwayMonths.toFixed(1)} mos (${formatMoney(data.liquidCash)})` },
  ];

  cfMetrics.forEach((metric, index) => {
    const x = margin + index * (cfCardWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cfCardWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(metric.label, x + 3, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(metric.val, x + 3, currentY + 11);
  });

  currentY += 18;

  // 1. Assets Table
  if (data.assets && data.assets.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Asset Portfolio Holdings (${data.assets.length})`, margin, currentY);
    currentY += 3;

    const assetRows = data.assets.map(a => {
      const pct = data.totalAssets > 0 ? ((a.value / data.totalAssets) * 100).toFixed(1) + '%' : '0%';
      return [
        a.name,
        a.category.toUpperCase(),
        a.institution || 'Self-Custody',
        formatMoney(a.value),
        pct,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Asset Description', 'Category', 'Institution', 'Valuation', 'Share']],
      body: assetRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 26 },
        2: { cellWidth: 28 },
        3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 16, halign: 'right' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 2. Liabilities Table
  if (data.liabilities && data.liabilities.length > 0) {
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Liabilities & Debt Obligations (${data.liabilities.length})`, margin, currentY);
    currentY += 3;

    const debtRows = data.liabilities.map(l => [
      l.name,
      l.category.toUpperCase(),
      l.institution || 'Direct',
      `${(l.interestRate ?? 0).toFixed(1)}%`,
      formatMoney(l.monthlyPayment ?? 0),
      formatMoney(l.balance),
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Liability Description', 'Category', 'Lender / Bank', 'APR', 'Monthly Pmt', 'Outstanding Balance']],
      body: debtRows,
      theme: 'grid',
      headStyles: {
        fillColor: [225, 29, 72], // rose-600
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 24 },
        2: { cellWidth: 26 },
        3: { cellWidth: 16, halign: 'right' },
        4: { cellWidth: 24, halign: 'right' },
        5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 3. Financial Goals Table
  if (data.goals && data.goals.length > 0) {
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Financial Milestones & Target Goals (${data.goals.length})`, margin, currentY);
    currentY += 3;

    const goalRows = data.goals.map(g => {
      const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      return [
        g.name,
        g.category,
        formatMoney(g.currentAmount),
        formatMoney(g.targetAmount),
        `${pct}%`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Milestone Goal', 'Category', 'Funded Amount', 'Target Goal', 'Progress']],
      body: goalRows,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235], // blue-600
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 32 },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Add Page Numbers & Footer to all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.text('Aura Private Wealth Statement • Confidential & Proprietary', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Trigger browser download of pristine PDF
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`Aura_Financial_Report_${dateStr}.pdf`);
}
