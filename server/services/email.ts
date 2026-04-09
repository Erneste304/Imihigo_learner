import nodemailer from 'nodemailer'

// Using Ethereal or Mock SMTP config for testing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass'
  }
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"Imihigo Learn" <hello@imihigo.rw>',
      to,
      subject,
      html
    })
    console.log(`Email sent: ${info.messageId} to ${to}`)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <div style="background-color: #6366f1; padding: 20px; text-align: center;">
        <h1 style="color: white;">Welcome to Imihigo Learn! 🎉</h1>
      </div>
      <div style="padding: 20px;">
        <h2>Hello ${name},</h2>
        <p>Thank you for joining Imihigo Learn - Rwanda's first AI-powered skill verification platform!</p>
        <ul>
          <li>✅ Complete your profile</li>
          <li>✅ Take skill assessments</li>
          <li>✅ Get blockchain-verified credentials</li>
        </ul>
      </div>
    </div>
  `
  return await sendEmail(email, 'Welcome to Imihigo Learn!', html)
}

export const sendAssessmentResultEmail = async (email: string, name: string, assessmentName: string, score: number, passed: boolean) => {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Hello ${name},</h2>
      <p>You have completed the <strong>${assessmentName}</strong> assessment.</p>
      <h3>Score: ${score}% - ${passed ? 'PASSED!' : 'Not Passed'}</h3>
    </div>
  `
  return await sendEmail(email, `Assessment Result: ${assessmentName}`, html)
}
