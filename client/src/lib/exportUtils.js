/**
 * Export transactions to CSV file
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToCSV = (transactions, filename = 'transactions') => {
    if (!transactions || transactions.length === 0) {
        console.warn('No transactions to export');
        return;
    }

    // Define CSV headers
    const headers = [
        'Date',
        'Type',
        'Category',
        'Description',
        'Amount (₹)',
        'Account',
        'Merchant',
    ];

    // Convert transactions to CSV rows
    const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString('en-IN'),
        t.type,
        t.category,
        t.description || '',
        t.amount.toFixed(2),
        t.accountId?.name || 'N/A',
        t.merchant || '',
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row =>
            row.map(cell =>
                // Escape quotes and wrap in quotes if contains comma
                typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
                    ? `"${cell.replace(/"/g, '""')}"`
                    : cell
            ).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Export data as JSON file
 * @param {any} data - Data to export
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToJSON = (data, filename = 'export') => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default { exportToCSV, exportToJSON };
