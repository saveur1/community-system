import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import * as React from 'react';

// Define a generic interface for the data structure
interface PDFExportData {
  [key: string]: string | number | boolean | null | undefined | object;
}

// Options interface with generic type for data
interface PDFExportOptions<T extends PDFExportData> {
  data: T[];
  fileName: string;
  title: string;
  headerFormatter?: (key: string) => string;
  maxColumnWidth?: number;
  truncateLength?: number;
  rowsPerPage?: number; // Optional: enables pagination if provided
}

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 15,
    borderBottom: '2 solid #E5E7EB',
    paddingBottom: 10,
  },
  companyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logo: {
    width: 50,
    height: 50,
  },
  companyDetails: {
    flex: 1,
    marginLeft: 15,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  companyText: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
    color: '#1F2937',
  },
  reportDate: {
    fontSize: 9,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 15,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#E5E7EB',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    padding: 6,
    minHeight: 20,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#E5E7EB',
    padding: 6,
    minHeight: 18,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 7,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 7,
    borderTop: '1 solid #E5E7EB',
    paddingTop: 8,
  },
});

// Main PDF generation function
export const generatePDFReport = async <T extends PDFExportData>(
  options: PDFExportOptions<T>,
): Promise<void> => {
  const {
    data,
    fileName,
    title,
    headerFormatter,
    maxColumnWidth = 150,
    truncateLength = 30,
    rowsPerPage,
  } = options;

  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No data available to export');
  }

  try {
    // Header formatter
    const defaultHeaderFormatter = (key: string): string =>
      key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^\w|\s\w/g, (m) => m.toUpperCase());
    const formatHeader = headerFormatter ?? defaultHeaderFormatter;

    // Get keys from first data item
    const first = data[0];
    const keys = Object.keys(first) as (keyof T)[];

    // Calculate dynamic column width
    const availableWidth = 100; // 100% width
    const numberOfColumns = keys.length;
    const dynamicColumnWidth = Math.min(
      Math.max(availableWidth / numberOfColumns, 8), // Minimum 8% width
      maxColumnWidth,
    );

    // Truncate text helper
    const truncateText = (text: string, maxLength: number = truncateLength): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    };

    // Split data into pages if pagination is enabled
    const pages = rowsPerPage
      ? Array.from(
          { length: Math.ceil(data.length / rowsPerPage) },
          (_, i) => data.slice(i * rowsPerPage, (i + 1) * rowsPerPage),
        )
      : [data];

    // Determine page orientation
    const pageOrientation = numberOfColumns > 6 ? 'landscape' : 'portrait';

    // PDF Document Component
    const PDFDocument: React.FC = () =>
      React.createElement(
        Document,
        null,
        pages.map((pageData, pageIndex) =>
          React.createElement(
            Page,
            {
              key: `page-${pageIndex}`,
              size: 'A4',
              style: styles.page,
              orientation: pageOrientation,
            },
            // Header Section
            React.createElement(
              View,
              { style: styles.header },
              React.createElement(
                View,
                { style: styles.companyInfo },
                React.createElement(Image, {
                  style: styles.logo,
                  src: '/logo.png',
                }),
                React.createElement(
                  View,
                  { style: styles.companyDetails },
                  React.createElement(Text, { style: styles.companyName }, 'RICH CLS'),
                  React.createElement(
                    Text,
                    { style: styles.companyText },
                    'Address: 332M+24C, KN 14 Ave, Kigali',
                  ),
                  React.createElement(Text, { style: styles.companyText }, 'Phone: 0784 390 384'),
                  React.createElement(Text, { style: styles.companyText }, 'Email: richrwanda@gmail.com'),
                ),
              ),
              React.createElement(Text, { style: styles.reportTitle }, `${title} Report`),
              React.createElement(
                Text,
                { style: styles.reportDate },
                `Generated on ${new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}`,
              ),
            ),
            // Table Section
            React.createElement(
              View,
              { style: styles.table },
              // Table Header
              React.createElement(
                View,
                { style: styles.tableRow },
                keys.map((key) =>
                  React.createElement(
                    View,
                    {
                      style: { ...styles.tableColHeader, width: `${dynamicColumnWidth}%` },
                      key: String(key),
                    },
                    React.createElement(
                      Text,
                      { style: styles.tableCellHeader },
                      truncateText(formatHeader(String(key)), 15),
                    ),
                  ),
                ),
              ),
              // Table Rows
              pageData.map((item, index) =>
                React.createElement(
                  View,
                  { style: styles.tableRow, key: `${pageIndex}-${index}` },
                  keys.map((key) => {
                    const value = item[key];
                    let displayValue = '';
                    if (value === null || value === undefined) {
                      displayValue = '';
                    } else if (typeof value === 'object') {
                      displayValue = truncateText(JSON.stringify(value));
                    } else {
                      displayValue = truncateText(String(value));
                    }
                    return React.createElement(
                      View,
                      { style: { ...styles.tableCol, width: `${dynamicColumnWidth}%` }, key: String(key) },
                      React.createElement(Text, { style: styles.tableCell, wrap: false }, displayValue),
                    );
                  }),
                ),
              ),
            ),
            // Footer
            React.createElement(
              Text,
              { style: styles.footer },
              `© ${new Date().getFullYear()} RICH CLS. All rights reserved. | Page ${pageIndex + 1} of ${
                pages.length
              }`,
            ),
          ),
        ),
      );

    // Generate and download PDF
    const blob = await pdf(React.createElement(PDFDocument)).toBlob();
    saveAs(blob, `${fileName}_report.pdf`);
  } catch (err) {
    console.error('Failed to export PDF:', err);
    throw new Error('Failed to export PDF. Please try again.');
  }
};