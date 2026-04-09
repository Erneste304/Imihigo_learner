import PDFDocument from 'pdfkit'
import { v4 as uuid } from 'uuid'
import { db } from '../data/store.js'

export const certificationService = {
  // Issue a new international certificate
  issueCertificate: async (userId: string, courseId: string, level: string = 'intermediate') => {
    const user = db.users.find(u => u.id === userId)
    const course = db.courses.find(c => c.id === courseId)
    
    if (!user || !course) throw new Error('User or Course not found')
    
    // Generate unique verifiable IDs
    const certNumber = `IMH-${new Date().getFullYear()}-${uuid().slice(0, 8).toUpperCase()}`
    const blockchainTx = `0x${uuid().replace(/-/g, '')}`
    const verificationCode = uuid().slice(-6).toUpperCase()

    const certificate = {
      id: uuid(),
      userId,
      courseId,
      courseName: course.title,
      certificateId: certNumber,
      level: level as any,
      score: 95, // Simulated score
      issuedBy: 'IMIHIGO' as const,
      isValidGlobally: true,
      blockchainTx,
      verificationCode,
      issuedAt: new Date().toISOString(),
      paymentStatus: 'paid' as const,
      pdfUrl: `/api/certification/download/${certNumber}`
    }

    db.internationalCertificates.push(certificate)
    return certificate
  },

  // Create professional PDF
  generatePDF: (cert: any, userName: string, res: any) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 })
    
    // Header
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff')
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(10).stroke('#1e40af')
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1).stroke('#93c5fd')

    // Title
    doc.fillColor('#1e40af').fontSize(44).font('Helvetica-Bold').text('IMIHIGO LEARN', 0, 100, { align: 'center' })
    doc.fillColor('#64748b').fontSize(14).font('Helvetica').text('GLOBAL SKILLS VERIFICATION & CERTIFICATION', 0, 150, { align: 'center' })

    doc.moveDown(2)
    doc.fillColor('#0f172a').fontSize(28).text('INTERNATIONAL CERTIFICATE', { align: 'center' })
    
    doc.moveDown(1.5)
    doc.fillColor('#64748b').fontSize(16).text('This is to certify that', { align: 'center' })
    
    doc.moveDown(0.5)
    doc.fillColor('#1d4ed8').fontSize(40).font('Helvetica-Bold').text(userName.toUpperCase(), { align: 'center' })
    
    doc.moveDown(0.5)
    doc.fillColor('#64748b').fontSize(16).font('Helvetica').text('has achieved the level of', { align: 'center' })
    doc.fillColor('#0f172a').fontSize(22).text(cert.level.toUpperCase(), { align: 'center' })
    
    doc.moveDown(0.5)
    doc.fillColor('#64748b').fontSize(16).text('in the specialized course', { align: 'center' })
    doc.fillColor('#1e40af').fontSize(26).font('Helvetica-Bold').text(cert.courseName, { align: 'center' })

    // Details section
    const startY = 440
    doc.fontSize(10).fillColor('#64748b')
    doc.text(`Certificate No: ${cert.certificateId}`, 100, startY)
    doc.text(`Issued Date: ${new Date(cert.issuedAt).toLocaleDateString()}`, 100, startY + 15)
    doc.text(`Verification Code: ${cert.verificationCode}`, 100, startY + 30)
    
    doc.text('Blockchain Verification Hash:', 450, startY)
    doc.fillColor('#3b82f6').text(cert.blockchainTx, 450, startY + 15, { width: 300 })

    // Seal and signature
    doc.circle(doc.page.width / 2, 500, 40).lineWidth(2).stroke('#1e40af')
    doc.fontSize(8).fillColor('#1e40af').text('VERIFIED', doc.page.width / 2 - 20, 495)

    doc.pipe(res)
    doc.end()
  },

  // Public verification logic
  verify: async (certId: string) => {
    const cert = db.internationalCertificates.find(c => 
      c.certificateId === certId || c.verificationCode === certId
    )
    if (!cert) return null
    
    const user = db.users.find(u => u.id === cert.userId)
    return {
      certificate: cert,
      user: user ? { name: user.name, avatar: user.avatar } : null
    }
  }
}
