const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const inputPath = path.join(__dirname, '..', 'docs', 'CONTEXTO_PROJETO.md');
const outputPath = path.join(__dirname, '..', 'docs', 'CONTEXTO_PROJETO.pdf');

const markdown = fs.readFileSync(inputPath, 'utf8');
const lines = markdown.split(/\r?\n/);

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  info: {
    Title: 'Contexto do Projeto — Sonda Leitura',
    Author: 'Sonda Leitura',
  },
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
let inCodeBlock = false;

function ensureSpace(height = 20) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function writeParagraph(text, options = {}) {
  if (!text.trim()) {
    doc.moveDown(0.4);
    return;
  }

  ensureSpace(30);
  doc.font(options.font || 'Helvetica').fontSize(options.size || 10).fillColor('#111111');
  doc.text(text, {
    width: pageWidth,
    align: options.align || 'left',
    continued: false,
  });
  doc.moveDown(options.spacing || 0.3);
}

for (const rawLine of lines) {
  const line = rawLine.replace(/\t/g, '  ');

  if (line.startsWith('```')) {
    inCodeBlock = !inCodeBlock;
    if (inCodeBlock) {
      ensureSpace(20);
      doc.moveDown(0.2);
    } else {
      doc.moveDown(0.4);
    }
    continue;
  }

  if (inCodeBlock) {
    ensureSpace(14);
    doc.font('Courier').fontSize(8.5).fillColor('#222222');
    doc.text(line || ' ', { width: pageWidth });
    continue;
  }

  if (line.trim() === '---') {
    ensureSpace(20);
    doc.moveDown(0.2);
    doc
      .strokeColor('#cccccc')
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
    doc.moveDown(0.5);
    continue;
  }

  if (line.startsWith('# ')) {
    ensureSpace(40);
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#0b3d91');
    doc.text(line.slice(2).trim(), { width: pageWidth });
    doc.moveDown(0.6);
    continue;
  }

  if (line.startsWith('## ')) {
    ensureSpace(30);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1a1a1a');
    doc.text(line.slice(3).trim(), { width: pageWidth });
    doc.moveDown(0.4);
    continue;
  }

  if (line.startsWith('### ')) {
    ensureSpace(24);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#333333');
    doc.text(line.slice(4).trim(), { width: pageWidth });
    doc.moveDown(0.3);
    continue;
  }

  if (/^\|.+\|$/.test(line.trim()) && !line.includes('---')) {
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);
    writeParagraph(cells.join('  |  '), { font: 'Helvetica', size: 9 });
    continue;
  }

  if (/^\|[-:\s|]+\|$/.test(line.trim())) {
    continue;
  }

  if (line.startsWith('- ')) {
    writeParagraph(`• ${line.slice(2).trim()}`, { size: 10 });
    continue;
  }

  if (/^\d+\.\s/.test(line)) {
    writeParagraph(line.trim(), { size: 10 });
    continue;
  }

  if (line.startsWith('*') && line.endsWith('*')) {
    writeParagraph(line.replace(/\*/g, '').trim(), { font: 'Helvetica-Oblique', size: 9 });
    continue;
  }

  writeParagraph(line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1'), { size: 10 });
}

doc.end();

stream.on('finish', () => {
  console.log(`PDF gerado em: ${outputPath}`);
});

stream.on('error', (error) => {
  console.error('Erro ao gerar PDF:', error);
  process.exit(1);
});
