import { useToast } from './use-toast';

export const useCSVExport = () => {
  const { toast } = useToast();

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    try {
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header.toLowerCase().replace(/ /g, '_')];
            // Handle values with commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: `${filename} has been downloaded`,
      });

      return true;
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data to CSV',
        variant: 'destructive'
      });
      return false;
    }
  };

  return { exportToCSV };
};
