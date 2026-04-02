export interface CsvRow {
  [key: string]: string;
}

function splitRespectingQuotes(line: string, delimiter = ','): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

export function parseCsv(csvText: string): CsvRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = splitRespectingQuotes(lines[0]).map((h) => h.replace(/^"|"$/g, ''));

  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRespectingQuotes(lines[i]);
    if (values.length !== headers.length) continue;

    const row: CsvRow = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? '').replace(/^"|"$/g, '');
    });
    rows.push(row);
  }

  return rows;
}
