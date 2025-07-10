import * as ExcelJS from "exceljs";
import * as cheerio from "cheerio";
import {logger} from '../utils/logger';

interface ExtractedStyles {
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  alignment?: string;
}

interface ExtractedContent {
  text: string;
  styles: ExtractedStyles;
}

const COLOR_MAP: Record<string, string> = {
    '#9c0007': '9C0007',  // Low range text (dark red)
    '#ffc7cd': 'FFC7CD',  // Low range background (light red)
    '#ba5700': 'BA5700',  // High range text (dark orange)
    '#ffeb9c': 'FFEB9C',  // High range background (light orange)
    '#016100': '016100',  // Normal range text (dark green)
    '#c6efcd': 'C6EFCD',  // Normal range background (light green)
    '#ffffff': 'FFFFFF',  // Default background
    'black': '000000',
    'white': 'FFFFFF'
};

const parseColor = (colorStr: string) => {
    if(!colorStr) return null;

    const cleanColor = colorStr.trim().toLowerCase();

    if(COLOR_MAP[cleanColor]) {
        return COLOR_MAP[cleanColor];
    }

    if(cleanColor.startsWith('#')) {
        const hex = cleanColor.substring(1).toUpperCase();
        return /^[0-9A-F]{6}$/i.test(hex) ? hex : null;
    }

    const rgbMatch = colorStr.match(/rgb\((\d+),?\s*(\d+),?\s*(\d+)\)/);
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        return [r, g, b]
        .map(val => parseInt(val, 10).toString(16).padStart(2, '0'))
        .join('').toUpperCase();
    }
  
    return null;
}

const extractStyledContent = (htmlContent: string) => {
    if (!htmlContent) {
        return { text: '', styles: {} };
    }
    
    if (!htmlContent.includes('<')) {
        return { text: htmlContent.trim(), styles: {} };
    }

    const $ = cheerio.load(htmlContent);

    $('br').replaceWith('\n');

    if(htmlContent.includes('<div style=')) {
        
        const div = $('div').first();

        if(!div.length) {
            const text = $.text().trim().replace(/\s+/g, ' ');
            return { text, styles: {} };
        }

        const text = div.text().trim();
        const style = div.attr('style') || '';
        const styles: ExtractedStyles = {};

        const styleMatches = {
            color: style.match(/color:\s*([^;]+)/),
            backgroundColor: style.match(/background-color:\s*([^;]+)/),
            fontWeight: style.match(/font-weight:\s*([^;]+)/),
            textAlign: style.match(/text-align:\s*([^;]+)/)
        };

        if (styleMatches.color) {
        const color = parseColor(styleMatches.color[1].trim());
        if (color) styles.color = color;
    }
    
    if (styleMatches.backgroundColor) {
        const bgColor = parseColor(styleMatches.backgroundColor[1].trim());
        if (bgColor) styles.backgroundColor = bgColor;
    }
    
    if (styleMatches.fontWeight) {
        const weight = styleMatches.fontWeight[1].trim();
        styles.bold = weight === 'bold' || parseInt(weight, 10) >= 700;
    }
    
    if (styleMatches.textAlign) {
        styles.alignment = styleMatches.textAlign[1].trim();
    }
    
    return { text, styles };
    } else {
        const text = $.text().trim().replace(/\s+/g, ' ');
        return { text, styles: {} };
    }
}

const applyCellStyling = (cell: ExcelJS.Cell, { text, styles }: any): void => {
  
  const cellText = text.replace(/\n/g, '\r\n');
  cell.value = cellText;
  
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  // Apply custom styles
  if (styles.color) {
    cell.font = { ...cell.font, color: { argb: styles.color } };
  }
  
  if (styles.backgroundColor) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: styles.backgroundColor }
    };
  }
  
  if (styles.bold) {
    cell.font = { ...cell.font, bold: true };
  }
  
  if (styles.alignment) {
    cell.alignment = { ...cell.alignment, horizontal: styles.alignment as ExcelJS.Alignment['horizontal'] };
  }
};

const extractTableData = ($: cheerio.CheerioAPI, table: any) => {
    const tableData: ExtractedContent[][] = [];
    $(table).find('tr').each((_, row) => {
        const rowData: ExtractedContent[] = [];

        $(row).find('td, th').each((_, cell) => {
            const cellHtml = $(cell).html() || '';
            const contentData = extractStyledContent(cellHtml)
            const cellStyle = $(cell).attr('style') || '';
            const bgMatch = cellStyle.match(/background-color:\s*([^;]+)/);

            if(bgMatch && !contentData.styles.backgroundColor) {
                const bgColor = parseColor(bgMatch[1].trim());
                if(bgColor) contentData.styles.backgroundColor = bgColor
            }

            rowData.push(contentData)
        });

        if(rowData.length > 0) {
            tableData.push(rowData);
        }
    });

    return tableData
}

const addTableToWorksheet = (
  worksheet: ExcelJS.Worksheet, 
  tableData: ExtractedContent[][], 
  startRow: number
): number => {
  tableData.forEach((rowData, rowIndex) => {
    rowData.forEach((cellData, colIndex) => {
      const cell = worksheet.getCell(startRow + rowIndex, colIndex + 1);
      applyCellStyling(cell, cellData);
    });
  });
  
  return startRow + tableData.length;
};

// Auto-fit columns based on content
const autoFitColumns = (worksheet: ExcelJS.Worksheet): void => {
  worksheet.columns.forEach(column => {
    let maxLength = 10;
    
    column.eachCell?.({ includeEmpty: true }, cell => {
      const length = cell.value ? cell.value.toString().length : 0;
      maxLength = Math.max(maxLength, length);
    });
    
    column.width = Math.min(maxLength + 2, 30);
  });
};

const createWorksheet = (workbook: ExcelJS.Workbook, $: cheerio.CheerioAPI, selector: string, sheetName: string) => {
    const worksheet = workbook.addWorksheet(sheetName);
    let currentRow = 1;

    $(selector).each((_, page) => {
        const pageTitle = $(page).find('h2').first().text().trim();
        if(pageTitle) {
            const titleCell = worksheet.getCell(currentRow, 1);
            titleCell.value = pageTitle;
            titleCell.font = {bold: true, size: 14};
            titleCell.alignment = {horizontal: 'center'};
            worksheet.mergeCells(currentRow, 1, currentRow, 10);
            currentRow += 2;
        }

        $(page).find('table').each((_, table) => {
            const tableData = extractTableData($, table);
            if(tableData.length > 0) {
                currentRow = addTableToWorksheet(worksheet, tableData, currentRow);
                currentRow += 2
            }
        });

        currentRow += 1;
    });

    autoFitColumns(worksheet);
    return worksheet
}

const validateHtmlContent = ($: cheerio.CheerioAPI) => {
    const hasOrchardSummaryTables = $('.orchard-summary-page table').length > 0;
    const hasBlockSummaryTables = $('.block-summary-page table').length > 0;

    return {hasOrchardSummaryTables, hasBlockSummaryTables}
}

export const processHtmlToExcel = async (htmlString: string) => {
    try {

        const $ = cheerio.load(htmlString);
        const { hasOrchardSummaryTables, hasBlockSummaryTables } = validateHtmlContent($);

        if(!hasOrchardSummaryTables && !hasBlockSummaryTables) {
            logger.error('No valid tables found in HTML Content');
            throw new Error("No valid tables");
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Exported Orchard Excel';
        workbook.created = new Date();

        if(hasOrchardSummaryTables) {
            createWorksheet(workbook, $, '.orchard-summary-page', 'Orchard Summary');
        }

        if(hasBlockSummaryTables) {
            createWorksheet(workbook, $, '.block-summary-page', 'Block Summary');
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return {
            buffer: Buffer.from(buffer),
            filename: 'orchard-report.xlsx',
            size: buffer.byteLength,
        }
    } catch (error) {
        throw error
    }
}