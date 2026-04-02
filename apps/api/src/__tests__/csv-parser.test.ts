import { describe, it, expect } from 'vitest';
import { parseCsv } from '../lib/csv-parser.js';

describe('parseCsv', () => {
  it('returns empty array for empty input', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('returns empty array when only header line present', () => {
    expect(parseCsv('id,title,price')).toEqual([]);
  });

  it('parses basic CSV with single row', () => {
    const csv = 'id,title,price\n1,Test Apartment,100000';
    const result = parseCsv(csv);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: '1', title: 'Test Apartment', price: '100000' });
  });

  it('parses multiple rows', () => {
    const csv = 'id,city\n1,Zagreb\n2,Split';
    const result = parseCsv(csv);
    expect(result).toHaveLength(2);
    expect(result[0]?.city).toBe('Zagreb');
    expect(result[1]?.city).toBe('Split');
  });

  it('handles quoted values with commas inside', () => {
    const csv = 'id,title\n1,"Two, bed apartment"';
    const result = parseCsv(csv);
    expect(result[0]?.title).toBe('Two, bed apartment');
  });

  it('handles escaped double quotes inside quoted fields', () => {
    const csv = 'id,title\n1,"He said ""nice"""';
    const result = parseCsv(csv);
    expect(result[0]?.title).toBe('He said "nice"');
  });

  it('skips rows with mismatched column count', () => {
    const csv = 'id,title,price\n1,Only Two';
    const result = parseCsv(csv);
    expect(result).toHaveLength(0);
  });

  it('handles CRLF line endings', () => {
    const csv = 'id,city\r\n1,Zagreb\r\n2,Split';
    const result = parseCsv(csv);
    expect(result).toHaveLength(2);
  });

  it('trims whitespace from non-quoted fields', () => {
    const csv = 'id, city\n 1 , Zagreb ';
    const result = parseCsv(csv);
    expect(result[0]?.['city']).toBe('Zagreb');
  });
});
