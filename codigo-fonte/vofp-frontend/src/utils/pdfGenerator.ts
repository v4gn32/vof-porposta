import jsPDF from 'jspdf';
import { ProposalWithDetails } from '../types';

export const generateProposalPDF = (proposal: ProposalWithDetails): void => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = '#00E6E6';
  const secondaryColor = '#555F6E';
  
  // Header
  doc.setFillColor(0, 230, 230);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TecSolutions', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Soluções em Tecnologia da Informação', 20, 32);
  
  // Proposal info
  doc.setTextColor(85, 95, 110);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPOSTA COMERCIAL', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Proposta: ${proposal.number}`, 20, 65);
  doc.text(`Data: ${new Date(proposal.createdAt).toLocaleDateString('pt-BR')}`, 20, 72);
  doc.text(`Válida até: ${new Date(proposal.validUntil).toLocaleDateString('pt-BR')}`, 20, 79);
  
  // Client info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 20, 95);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${proposal.client.company}`, 20, 105);
  doc.text(`${proposal.client.name}`, 20, 112);
  doc.text(`${proposal.client.email}`, 20, 119);
  doc.text(`${proposal.client.phone}`, 20, 126);
  
  // Proposal title and description
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO:', 20, 145);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const titleLines = doc.splitTextToSize(proposal.title, 170);
  doc.text(titleLines, 20, 155);
  
  if (proposal.description) {
    const descLines = doc.splitTextToSize(proposal.description, 170);
    doc.text(descLines, 20, 165);
  }
  
  // Services table
  let yPosition = 185;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVIÇOS:', 20, yPosition);
  
  yPosition += 15;
  
  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition - 5, 170, 10, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Serviço', 25, yPosition);
  doc.text('Qtd', 120, yPosition);
  doc.text('Valor Unit.', 140, yPosition);
  doc.text('Total', 170, yPosition);
  
  yPosition += 10;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  proposal.items.forEach((item) => {
    const service = proposal.services.find(s => s.id === item.serviceId);
    if (service) {
      const serviceName = doc.splitTextToSize(service.name, 90)[0];
      doc.text(serviceName, 25, yPosition);
      doc.text(item.quantity.toString(), 125, yPosition);
      doc.text(`R$ ${item.unitPrice.toFixed(2)}`, 140, yPosition);
      doc.text(`R$ ${item.total.toFixed(2)}`, 165, yPosition);
      yPosition += 8;
    }
  });
  
  // Totals
  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`Subtotal: R$ ${proposal.subtotal.toFixed(2)}`, 140, yPosition);
  
  if (proposal.discount > 0) {
    yPosition += 8;
    doc.text(`Desconto: R$ ${proposal.discount.toFixed(2)}`, 140, yPosition);
  }
  
  yPosition += 8;
  doc.setFontSize(12);
  doc.text(`TOTAL: R$ ${proposal.total.toFixed(2)}`, 140, yPosition);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('TecSolutions - contato@tecsolutions.com.br - (11) 3333-4444', 20, 280);
  
  // Save PDF
  doc.save(`Proposta_${proposal.number}_${proposal.client.company}.pdf`);
};