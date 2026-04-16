/**
 * Exporte les données en format CSV
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  columns?: string[]
) {
  if (data.length === 0) {
    console.warn("Aucune donnée à exporter");
    return;
  }

  // Déterminer les colonnes
  const cols = columns || Object.keys(data[0]);

  // Créer l'en-tête CSV
  const header = cols.map(col => `"${col}"`).join(",");

  // Créer les lignes CSV
  const rows = data.map(row =>
    cols.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '""';
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      if (typeof value === "object") return `"${JSON.stringify(value)}"`;
      return `"${value}"`;
    }).join(",")
  );

  const csv = [header, ...rows].join("\n");

  // Télécharger le fichier
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Exporte les données en format Excel (XLSX)
 * Note: Nécessite la bibliothèque 'xlsx' installée
 */
export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  columns?: string[]
) {
  try {
    // Dynamiquement importer xlsx si disponible
    const XLSX = require("xlsx");

    const cols = columns || Object.keys(data[0]);
    const worksheet = XLSX.utils.json_to_sheet(data, { header: cols });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Excel export non disponible. Utilisez CSV à la place.", error);
    exportToCSV(data, filename, columns);
  }
}

/**
 * Télécharge un fichier
 */
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formate les données pour l'export
 */
export function formatDataForExport(
  data: Record<string, any>[],
  formatters?: Record<string, (value: any) => string>
): Record<string, any>[] {
  return data.map(row => {
    const formatted: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      formatted[key] = formatters?.[key] ? formatters[key](value) : value;
    }
    return formatted;
  });
}
