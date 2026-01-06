// ===========================================
// WYDAD AC - GÉNÉRATEUR PDF
// ===========================================

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');

// Couleurs WAC
const WAC_RED = '#BE1522';
const WAC_WHITE = '#FFFFFF';
const WAC_BLACK = '#1A1A1A';
const WAC_GRAY = '#666666';

// ===========================================
// GÉNÉRER UN TICKET PDF
// ===========================================
const generateTicketPDF = async (ticket, match, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A5',
        layout: 'landscape',
        margins: { top: 30, bottom: 30, left: 30, right: 30 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== EN-TÊTE =====
      // Bande rouge en haut
      doc.rect(0, 0, doc.page.width, 60).fill(WAC_RED);
      
      // Titre
      doc.fillColor(WAC_WHITE)
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('WYDAD ATHLETIC CLUB', 30, 18, { align: 'center' });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('BILLET OFFICIEL - E-TICKET', 30, 42, { align: 'center' });

      // ===== INFORMATIONS MATCH =====
      doc.fillColor(WAC_BLACK)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text(match.home_team, 30, 80);
      
      doc.fontSize(14)
         .fillColor(WAC_GRAY)
         .text('VS', 30, 102, { continued: true })
         .fillColor(WAC_BLACK)
         .font('Helvetica-Bold')
         .text(`  ${match.away_team}`);

      // Date et heure
      const matchDate = new Date(match.match_date);
      const dateStr = matchDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = matchDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.fontSize(11)
         .fillColor(WAC_GRAY)
         .font('Helvetica')
         .text(`📅 ${dateStr}`, 30, 130)
         .text(`⏰ ${timeStr}`, 30, 145)
         .text(`🏟️ ${match.stadium}`, 30, 160);

      // ===== DÉTAILS BILLET =====
      doc.rect(30, 185, 250, 80).stroke(WAC_RED);
      
      doc.fillColor(WAC_RED)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('DÉTAILS DU BILLET', 40, 192);

      doc.fillColor(WAC_BLACK)
         .fontSize(11)
         .font('Helvetica')
         .text(`Section: ${ticket.section.toUpperCase()}`, 40, 210)
         .text(`Quantité: ${ticket.quantity} place(s)`, 40, 225)
         .text(`Prix total: ${ticket.total_price} MAD`, 40, 240);

      // ===== INFORMATIONS CLIENT =====
      doc.rect(30, 275, 250, 60).stroke(WAC_GRAY);
      
      doc.fillColor(WAC_GRAY)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('TITULAIRE', 40, 282);

      doc.fillColor(WAC_BLACK)
         .fontSize(11)
         .font('Helvetica')
         .text(`👤 ${user.name}`, 40, 300)
         .text(`📧 ${user.email}`, 40, 315);

      // ===== QR CODE =====
      const qrData = JSON.stringify({
        ticket_id: ticket.id,
        match_id: match.id,
        qr_code: ticket.qr_code,
        valid: true
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 120,
        margin: 1,
        color: { dark: WAC_RED, light: WAC_WHITE }
      });

      // Convertir data URL en buffer
      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, 450, 100, { width: 120 });

      doc.fillColor(WAC_GRAY)
         .fontSize(8)
         .font('Helvetica')
         .text('Scannez pour valider', 450, 225, { width: 120, align: 'center' });

      // Numéro de ticket
      doc.fillColor(WAC_RED)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(`N° ${ticket.qr_code}`, 450, 240, { width: 120, align: 'center' });

      // ===== PIED DE PAGE =====
      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(WAC_BLACK);
      
      doc.fillColor(WAC_WHITE)
         .fontSize(8)
         .font('Helvetica')
         .text('Ce billet est personnel et non cessible. Présentez-le à l\'entrée du stade.', 30, doc.page.height - 30, { align: 'center' })
         .text('© 2026 Wydad Athletic Club - Tous droits réservés', 30, doc.page.height - 18, { align: 'center' });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

// ===========================================
// GÉNÉRER UNE FACTURE PDF
// ===========================================
const generateInvoicePDF = async (order, items, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== EN-TÊTE =====
      doc.rect(0, 0, doc.page.width, 100).fill(WAC_RED);
      
      doc.fillColor(WAC_WHITE)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('WYDAD ATHLETIC CLUB', 50, 30);
      
      doc.fontSize(14)
         .font('Helvetica')
         .text('BOUTIQUE OFFICIELLE - FACTURE', 50, 65);

      // ===== INFORMATIONS FACTURE =====
      doc.fillColor(WAC_BLACK)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text(`FACTURE`, 50, 120);

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor(WAC_GRAY)
         .text(`N° ${order.order_number}`, 50, 145)
         .text(`Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, 50, 160);

      // Statut
      const statusColors = {
        'pending': '#FFA500',
        'paid': '#28A745',
        'shipped': '#17A2B8',
        'delivered': '#28A745',
        'cancelled': '#DC3545'
      };
      const statusLabels = {
        'pending': 'En attente',
        'paid': 'Payée',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'cancelled': 'Annulée'
      };

      doc.fillColor(statusColors[order.status] || WAC_GRAY)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(`Statut: ${statusLabels[order.status] || order.status}`, 400, 145);

      // ===== INFORMATIONS CLIENT =====
      doc.rect(50, 190, 230, 90).stroke(WAC_GRAY);
      
      doc.fillColor(WAC_RED)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('FACTURER À', 60, 200);

      doc.fillColor(WAC_BLACK)
         .fontSize(11)
         .font('Helvetica')
         .text(user.name, 60, 220)
         .text(user.email, 60, 235)
         .text(user.phone || '', 60, 250);

      // ===== ADRESSE DE LIVRAISON =====
      doc.rect(310, 190, 230, 90).stroke(WAC_GRAY);
      
      doc.fillColor(WAC_RED)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('LIVRER À', 320, 200);

      doc.fillColor(WAC_BLACK)
         .fontSize(11)
         .font('Helvetica')
         .text(order.shipping_address, 320, 220, { width: 210 })
         .text(order.shipping_city, 320, 250)
         .text(order.shipping_phone, 320, 265);

      // ===== TABLEAU DES PRODUITS =====
      const tableTop = 310;
      
      // En-tête du tableau
      doc.rect(50, tableTop, 495, 25).fill(WAC_RED);
      
      doc.fillColor(WAC_WHITE)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('PRODUIT', 60, tableTop + 8)
         .text('TAILLE', 280, tableTop + 8)
         .text('QTÉ', 340, tableTop + 8)
         .text('PRIX UNIT.', 390, tableTop + 8)
         .text('TOTAL', 480, tableTop + 8);

      // Lignes des produits
      let yPosition = tableTop + 30;
      
      doc.fillColor(WAC_BLACK).font('Helvetica').fontSize(10);

      items.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#F8F8F8' : WAC_WHITE;
        doc.rect(50, yPosition - 5, 495, 25).fill(bgColor);
        
        doc.fillColor(WAC_BLACK)
           .text(item.product_name.substring(0, 35), 60, yPosition, { width: 210 })
           .text(item.size || '-', 280, yPosition)
           .text(item.quantity.toString(), 340, yPosition)
           .text(`${item.unit_price} MAD`, 390, yPosition)
           .text(`${item.total_price} MAD`, 480, yPosition);
        
        yPosition += 25;
      });

      // ===== TOTAUX =====
      yPosition += 20;
      
      const subtotal = order.total_amount - order.shipping_fee;
      
      doc.fontSize(11)
         .font('Helvetica')
         .text('Sous-total:', 380, yPosition)
         .text(`${subtotal.toFixed(2)} MAD`, 480, yPosition);
      
      yPosition += 20;
      doc.text('Livraison:', 380, yPosition)
         .text(order.shipping_fee > 0 ? `${order.shipping_fee.toFixed(2)} MAD` : 'GRATUITE', 480, yPosition);
      
      yPosition += 25;
      doc.rect(370, yPosition - 5, 175, 30).fill(WAC_RED);
      
      doc.fillColor(WAC_WHITE)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('TOTAL:', 380, yPosition + 2)
         .text(`${order.total_amount.toFixed(2)} MAD`, 470, yPosition + 2);

      // ===== INFORMATIONS DE PAIEMENT =====
      if (order.payment_method) {
        yPosition += 50;
        doc.fillColor(WAC_GRAY)
           .fontSize(10)
           .font('Helvetica')
           .text(`Méthode de paiement: ${order.payment_method}`, 50, yPosition);
        
        if (order.payment_ref) {
          doc.text(`Référence: ${order.payment_ref}`, 50, yPosition + 15);
        }
      }

      // ===== QR CODE =====
      const qrData = JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        total: order.total_amount
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 80,
        margin: 1
      });

      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, 480, yPosition + 40, { width: 60 });

      // ===== PIED DE PAGE =====
      doc.rect(0, doc.page.height - 60, doc.page.width, 60).fill(WAC_BLACK);
      
      doc.fillColor(WAC_WHITE)
         .fontSize(9)
         .font('Helvetica')
         .text('Wydad Athletic Club - Boutique Officielle', 50, doc.page.height - 50, { align: 'center' })
         .text('Stade Mohammed V, Boulevard Zerktouni, Casablanca, Maroc', 50, doc.page.height - 38, { align: 'center' })
         .text('Email: boutique@wac.ma | Tél: +212 522 123 456', 50, doc.page.height - 26, { align: 'center' });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

// ===========================================
// GÉNÉRER UN REÇU PDF SIMPLE
// ===========================================
const generateReceiptPDF = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [226, 400], // Format reçu (80mm x ~140mm)
        margins: { top: 20, bottom: 20, left: 15, right: 15 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // En-tête
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(WAC_RED)
         .text('WYDAD AC', { align: 'center' });
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor(WAC_BLACK)
         .text('Boutique Officielle', { align: 'center' })
         .text('----------------------------', { align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(9)
         .text(`Date: ${new Date().toLocaleDateString('fr-FR')}`);
      doc.text(`Heure: ${new Date().toLocaleTimeString('fr-FR')}`);
      doc.text(`N°: ${data.reference || 'N/A'}`);
      
      doc.text('----------------------------', { align: 'center' });

      // Articles
      if (data.items) {
        data.items.forEach(item => {
          doc.text(`${item.name}`);
          doc.text(`  ${item.qty} x ${item.price} = ${item.total} MAD`);
        });
      }

      doc.text('----------------------------', { align: 'center' });
      
      doc.font('Helvetica-Bold')
         .text(`TOTAL: ${data.total || 0} MAD`, { align: 'right' });

      doc.moveDown();
      doc.font('Helvetica')
         .fontSize(8)
         .text('Merci pour votre achat!', { align: 'center' })
         .text('DIMA WYDAD 🔴⚪', { align: 'center' });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateTicketPDF,
  generateInvoicePDF,
  generateReceiptPDF
};
