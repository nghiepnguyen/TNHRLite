/**
 * Export Utilities
 * Functions for converting data and triggering browser downloads.
 */

/**
 * Escapes CSV special characters (commas, double quotes, newlines)
 */
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Downloads candidate application data as a CSV file
 */
export const exportCandidatesToCSV = (applications: any[], candidatesMap: Record<string, any>, jobTitle: string) => {
  if (!applications || applications.length === 0) {
    alert("No data to export.");
    return;
  }

  // Define headers and data mapping
  const columns = [
    { header: 'Full Name', key: 'fullName', getter: (app: any) => candidatesMap[app.candidateId]?.fullName },
    { header: 'Title', key: 'title', getter: (app: any) => candidatesMap[app.candidateId]?.currentTitle },
    { header: 'Stage', key: 'stage' },
    { header: 'Match Score (%)', key: 'fitScore' },
    { header: 'Priority', key: 'priority' },
    { header: 'Owner', key: 'owner' },
    { header: 'Next Step', key: 'nextStep' },
    { header: 'Interview Date', key: 'interviewDate', getter: (app: any) => app.interview?.date },
    { header: 'Interview Status', key: 'interviewStatus', getter: (app: any) => app.interview?.status },
    { header: 'Offer Value', key: 'offerValue', getter: (app: any) => app.offer?.value },
    { header: 'Applied At', key: 'createdAt', getter: (app: any) => app.createdAt?.seconds ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : '' }
  ];

  // Build CSV Header
  const headerRow = columns.map(c => escapeCSV(c.header)).join(',');

  // Build rows
  const rows = applications.map(app => {
    return columns.map(col => {
      const val = col.getter ? col.getter(app) : app[col.key as keyof any];
      return escapeCSV(val);
    }).join(',');
  });

  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split('T')[0];
  const safeJobTitle = jobTitle.replace(/[^a-z0-9]/gi, '_');
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeJobTitle}_Pipeline_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
