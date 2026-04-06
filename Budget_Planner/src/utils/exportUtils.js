import { format } from 'date-fns';

export function exportToCSV(expenses, categories) {
  const headers = ['Date', 'Title', 'Category', 'Amount', 'Payment Method', 'Notes'];
  const rows = expenses.map(e => {
    const cat = categories.find(c => c.id === e.categoryId);
    return [
      format(new Date(e.date), 'yyyy-MM-dd HH:mm'),
      `"${e.title.replace(/"/g, '""')}"`,
      cat ? cat.name : e.categoryId,
      e.amount.toFixed(2),
      e.paymentMethod || '',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSV(expenses, categories) {
  const csv = exportToCSV(expenses, categories);
  const filename = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

export function downloadBackup(backupJson) {
  const filename = `expense_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadFile(backupJson, filename, 'application/json');
}
