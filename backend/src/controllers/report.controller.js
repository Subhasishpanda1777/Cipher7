const PDFDocument = require('pdfkit');
const screeningService = require('../services/screening.service');
const therapyService = require('../services/therapy.service');
const HttpError = require('../utils/httpError');

function formatPercent(value) {
  if (value === undefined || value === null) return '--';
  return `${Math.round(value * 100)}%`;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}

async function generateParentSummary(req, res) {
  const user = req.user;
  if (user.role !== 'parent') {
    throw new HttpError(403, 'Only parents can generate this report');
  }
  const screenings = await screeningService.listScreeningsByUser(user.id);
  const therapySessions = await therapyService.listSessionsByUser(user.id);

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="visionai-report-${user.firstName || 'parent'}.pdf"`
  );

  doc.pipe(res);

  doc
    .fontSize(20)
    .fillColor('#104e7b')
    .text('VisionAI Parent Summary', { align: 'left' })
    .moveDown(0.5);
  doc
    .fontSize(12)
    .fillColor('#333333')
    .text(`Generated for: ${user.firstName} ${user.lastName}`)
    .text(`Role: ${user.role}`)
    .text(`Generated on: ${new Date().toLocaleString()}`)
    .moveDown(1);

  doc
    .fontSize(16)
    .fillColor('#104e7b')
    .text('Screening Overview')
    .moveDown(0.5);

  if (screenings.length === 0) {
    doc.fontSize(12).fillColor('#333333').text('No screenings recorded yet.');
  } else {
    const latest = screenings[0];
    doc
      .fontSize(12)
      .fillColor('#333333')
      .text(`Latest screening: ${formatDate(latest.createdAt)}`)
      .text(`Alignment score: ${formatPercent(latest.alignmentScore)}`)
      .text(`Tracking score: ${formatPercent(latest.trackingScore)}`)
      .text(`Contrast score: ${formatPercent(latest.contrastScore)}`)
      .text(`Final risk classification: ${latest.classification}`)
      .moveDown(0.5);

    doc.text('Recent screenings:').moveDown(0.3);
    screenings.slice(0, 5).forEach((screen) => {
      doc
        .fontSize(11)
        .text(
          `• ${formatDate(screen.createdAt)} — Risk: ${formatPercent(
            screen.finalRiskScore
          )} (${screen.classification})`
        );
    });
  }

  doc.moveDown(1);
  doc
    .fontSize(16)
    .fillColor('#104e7b')
    .text('Therapy Progress')
    .moveDown(0.5);

  if (therapySessions.length === 0) {
    doc.fontSize(12).fillColor('#333333').text('No therapy sessions recorded yet.');
  } else {
    const totalMinutes = therapySessions.reduce(
      (sum, session) => sum + (session.durationMinutes || 0),
      0
    );
    doc
      .fontSize(12)
      .fillColor('#333333')
      .text(`Sessions logged: ${therapySessions.length}`)
      .text(`Total minutes practiced: ${totalMinutes}`)
      .moveDown(0.5);

    doc.text('Recent sessions:').moveDown(0.3);
    therapySessions.slice(0, 5).forEach((session) => {
      doc
        .fontSize(11)
        .text(
          `• ${formatDate(session.sessionDate)} — ${session.gameType} (points: ${
            session.pointsEarned || 0
          }, streak: ${session.streak || 0})`
        );
    });
  }

  doc.moveDown(1);
  doc
    .fontSize(16)
    .fillColor('#104e7b')
    .text('Next Steps')
    .moveDown(0.5);
  doc
    .fontSize(12)
    .fillColor('#333333')
    .text('• Share this report with your ophthalmologist for professional advice.')
    .text('• Keep daily therapy sessions short and playful for sustainable progress.')
    .text('• Schedule follow-up VisionAI screenings monthly or as recommended.')
    .moveDown(1);

  doc
    .fontSize(10)
    .fillColor('#999999')
    .text(
      'Disclaimer: VisionAI is a preliminary screening and therapy support tool. It does not replace professional medical diagnosis or treatment.',
      { align: 'center' }
    );

  doc.end();
}

module.exports = {
  generateParentSummary,
};
