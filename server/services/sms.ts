import africastalking from 'africastalking'

// Assuming credentials or falling back to sandbox 
const credentials = {
  apiKey: process.env.AFRICAS_TALKING_API_KEY || 'sandbox',
  username: process.env.AFRICAS_TALKING_USERNAME || 'sandbox'
}

let africasTalkingClient: any = null
try {
  africasTalkingClient = africastalking(credentials)
} catch (e) {
  // Gracefully fail if API keys are strictly invalid lengths or missing entirely in strict mode
  console.log('Africa is talking client failed to init without valid credentials.')
}

export const sendSMS = async (phoneNumber: string, message: string) => {
  if (!africasTalkingClient) {
    console.log(`[SMS MOCK] To ${phoneNumber}: ${message}`)
    return true
  }

  try {
    const result = await africasTalkingClient.SMS.send({
      to: phoneNumber.startsWith('+') ? phoneNumber : `+250${phoneNumber.replace(/^0/, '')}`,
      message: message,
      from: process.env.SMS_SENDER_ID || 'IMIHIGO'
    })
    console.log('SMS sent successfully:', result)
    return result
  } catch (error) {
    console.error('SMS sending failed:', error)
    return null
  }
}

export const sendJobAlertSMS = async (phoneNumber: string, jobTitle: string, company: string) => {
  const message = `Imihigo Learn: Job Alert! ${jobTitle} at ${company}. Apply now via the app.`
  return await sendSMS(phoneNumber, message)
}

export const sendAssessmentReminder = async (phoneNumber: string, assessmentName: string) => {
  const message = `Reminder: Don't forget to take your ${assessmentName} assessment today! Validate your skills on Imihigo Learn.`
  return await sendSMS(phoneNumber, message)
}
