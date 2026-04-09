import ExcelJS from 'exceljs'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { certificationService } from './certification.js'
import { db } from '../data/store.js'

export const bulkCertificateService = {
  // Parse Excel and return list of recipients
  parseExcel: async (filePath: string) => {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.getWorksheet(1)
    
    const recipients: any[] = []
    worksheet?.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Skip header
      recipients.push({
        name: row.getCell(1).value,
        email: row.getCell(2).value,
        courseName: row.getCell(3).value,
        level: row.getCell(4).value || 'intermediate'
      })
    })
    
    return recipients
  },

  // Bulk generate certificates and return ZIP stream
  generateBulkZip: async (recipients: any[], outputStream: any) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.pipe(outputStream)

    for (const recipient of recipients) {
      // Logic for bulk processing:
      // 1. Create/Find user
      let user = db.users.find(u => u.email === recipient.email)
      if (!user) {
        // Create dummy user for the certificate if doesn't exist
        user = {
          id: uuid(),
          name: recipient.name,
          email: recipient.email,
          password: 'bulk-generated',
          role: 'jobseeker',
          skills: [],
          verified: false,
          createdAt: new Date().toISOString(),
          tokens: 0
        }
        db.users.push(user)
      }

      // 2. Find course
      const course = db.courses.find(c => c.title.toLowerCase().includes(recipient.courseName.toLowerCase()))
      if (!course) continue

      // 3. Issue certificate
      const cert = await certificationService.issueCertificate(user.id, course.id, recipient.level)

      // 4. Generate PDF and append to ZIP
      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        const chunks: any[] = []
        const doc = new (require('pdfkit'))({ size: 'A4', layout: 'landscape' })
        doc.on('data', (chunk: any) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        
        // Use the common PDF generation logic
        certificationService.generatePDF(cert, user!.name, doc)
      })

      archive.append(pdfBuffer, { name: `${cert.certificateId}_${recipient.name.replace(/\s+/g, '_')}.pdf` })
    }

    await archive.finalize()
  }
}
