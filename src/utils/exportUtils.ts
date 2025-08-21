import type { Database } from '../lib/supabase';

type TransportRecord = Database['public']['Tables']['transport_records']['Row'];

export class ExportUtils {
  static exportToCSV(records: TransportRecord[], filename: string = 'transport_records') {
    if (!records.length) {
      alert('NO RECORDS TO EXPORT');
      return;
    }

    // Define CSV headers
    const headers = [
      'SR NO',
      'SMS DATE',
      'LR DATE',
      'BILTY NO',
      'TRUCK NO',
      'TRANSPORT',
      'DESTINATION',
      'WEIGHT',
      'RATE',
      'TOTAL',
      'BILTY CHARGE',
      'FREIGHT AMOUNT',
      'ADVANCE',
      'ADVANCE DATE',
      'COMMISSION',
      'BALANCE PAID AMOUNT',
      'BALANCE PAID DATE',
      'NET AMOUNT',
      'IS BALANCE PAID',
      'DATE OF REACH',
      'DATE OF UNLOAD',
      'DAYS IN HOLD',
      'HOLDING CHARGE',
      'TOTAL HOLDING AMOUNT',
      'COURIER DATE',
      'CREATED AT'
    ];

    // Convert records to CSV format
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        record.srno || '',
        record.smsdate || '',
        record.lrdate || '',
        record.biltyno || '',
        record.truckno || '',
        record.transport || '',
        record.destination || '',
        record.weight || '',
        record.rate || '',
        record.total || '',
        record.biltycharge || '',
        record.freightamount || '',
        record.advance || '',
        record.advancedate || '',
        record.commission || '',
        record.balpaidamount || '',
        record.balpaiddate || '',
        record.netamount || '',
        record.isbalpaid || '',
        record.dateofreach || '',
        record.dateofunload || '',
        record.dayinhold || '',
        record.holdingcharge || '',
        record.totalholdingamount || '',
        record.courierdate || '',
        record.created_at ? new Date(record.created_at).toLocaleString() : ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportToPDF(records: TransportRecord[], filename: string = 'transport_records') {
    // This would require a PDF library like jsPDF
    // For now, we'll just show an alert
    alert('PDF EXPORT FEATURE COMING SOON!');
  }

  static printRecords(records: TransportRecord[]) {
    if (!records.length) {
      alert('NO RECORDS TO PRINT');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('POPUP BLOCKED. PLEASE ALLOW POPUPS FOR THIS SITE.');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TRANSPORT RECORDS</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status-paid { color: green; font-weight: bold; }
            .status-unpaid { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>TRANSPORT RECORDS</h1>
          <p>GENERATED ON: ${new Date().toLocaleString()}</p>
          <p>TOTAL RECORDS: ${records.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>TRUCK NO</th>
                <th>TRANSPORT</th>
                <th>DESTINATION</th>
                <th>BILTY NO</th>
                <th>WEIGHT</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>LR DATE</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(record => `
                <tr>
                  <td>${record.truckno || 'N/A'}</td>
                  <td>${record.transport || 'N/A'}</td>
                  <td>${record.destination || 'N/A'}</td>
                  <td>${record.biltyno || 'N/A'}</td>
                  <td>${record.weight || 'N/A'}</td>
                  <td>₹${record.total || '0'}</td>
                  <td class="${record.isbalpaid === 'YES' ? 'status-paid' : 'status-unpaid'}">
                    ${record.isbalpaid === 'YES' ? 'PAID' : 'UNPAID'}
                  </td>
                  <td>${record.lrdate || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}