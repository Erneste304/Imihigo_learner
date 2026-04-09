import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './TermsConditions.module.css'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using Imihigo Learn ("the Platform", "we", "our", or "us"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.

These Terms constitute a legally binding agreement between you and Imihigo Learn Ltd, a company registered in Rwanda. By registering an account, you confirm that you are at least 16 years old and have the legal capacity to enter into this agreement.

We reserve the right to update these Terms at any time. Continued use of the Platform after changes are published constitutes acceptance of the revised Terms. We will notify users of material changes via email or prominent notice on the Platform.`
  },
  {
    id: 'accounts',
    title: '2. User Accounts & Registration',
    content: `To access certain features of the Platform you must create an account. You agree to:

• Provide accurate, current, and complete information during registration.
• Maintain and promptly update your account information to keep it accurate.
• Keep your password confidential and not share it with any third party.
• Notify us immediately at support@imihigo.rw of any unauthorized use of your account.
• Be responsible for all activity that occurs under your account.

Imihigo Learn reserves the right to suspend or terminate accounts that provide false information, violate these Terms, or engage in behavior detrimental to other users or the Platform.

Each person may maintain only one account. Creating multiple accounts to circumvent suspensions or gain unfair advantages is strictly prohibited.`
  },
  {
    id: 'assessments',
    title: '3. Skill Assessments & Certification',
    content: `Imihigo Learn provides AI-powered skill assessments and issues digital certificates upon successful completion. By participating in assessments, you agree to:

• Complete all assessments independently without external assistance, notes, or unauthorized resources unless explicitly permitted.
• Allow the Platform to activate your device camera for real-time proctoring during assessments.
• Accept that any detected cheating, impersonation, or academic dishonesty will result in immediate assessment disqualification, certificate revocation, and possible account suspension.
• Understand that certificates are issued only for scores of 70% or above on proctored assessments.

Certificates issued by Imihigo Learn represent your demonstrated skill level at the time of assessment. We do not guarantee employment outcomes based on certification. Employers using our verification system independently assess your credentials.

Blockchain-anchored certificates are permanent records on the Polygon network. Once issued, the certificate hash cannot be deleted from the blockchain, though your profile access may be restricted for violations.`
  },
  {
    id: 'conduct',
    title: '4. Acceptable Use & Code of Conduct',
    content: `You agree not to use the Platform to:

• Upload, post, or share content that is illegal, defamatory, obscene, hateful, or harassing.
• Impersonate any person or entity or falsely state your affiliation.
• Attempt to gain unauthorized access to any part of the Platform or its systems.
• Use automated tools, bots, or scrapers to extract Platform data without written permission.
• Post misleading job listings, false credentials, or fraudulent employer profiles.
• Engage in any activity that disrupts, damages, or overburdens our infrastructure.
• Violate any applicable Rwandan law or international regulation.

Community Learning Hub content must be original or properly licensed. Posting copyrighted material without authorization is prohibited and may result in content removal and account termination.

We reserve the right to remove any content and suspend any account that violates these standards, at our sole discretion and without prior notice.`
  },
  {
    id: 'employers',
    title: '5. Employer & Job Posting Rules',
    content: `Employers using the Platform to post jobs or verify candidate credentials agree to:

• Post only genuine, available job opportunities with accurate descriptions and compensation ranges.
• Not discriminate in hiring based on gender, ethnicity, religion, disability, or any characteristic protected under Rwandan law.
• Use candidate information obtained through the Platform solely for hiring decisions related to posted positions.
• Not share candidate data with third parties without the candidate's explicit consent.
• Maintain the confidentiality of any personal information accessed through the Platform.

Job postings that contain false information, discriminatory language, or that are used for data harvesting rather than genuine hiring will be removed. Repeat violations will result in employer account termination.

Imihigo Learn is not responsible for employment decisions made by employers using our Platform. We facilitate connections and verification but are not a party to any employment contracts.`
  },
  {
    id: 'payments',
    title: '6. Payments, Fees & Refunds',
    content: `Certain features of the Platform require payment. By making a purchase, you agree to:

• Pay all applicable fees, taxes, and charges associated with your selected plan or service.
• Provide valid and accurate payment information.
• Authorize us to charge your payment method for recurring subscriptions until cancelled.

Supported payment methods include MTN Mobile Money, Airtel Money, Stripe (card payments), and PayPal. All prices are displayed in Rwandan Francs (RWF) or USD where applicable.

Refund Policy:
• Assessment fees are non-refundable once an assessment has commenced.
• Course enrollment fees may be refunded within 7 days of purchase if less than 20% of course content has been accessed.
• Premium subscription fees are non-refundable for the current billing period.
• International certificate fees are non-refundable once the certificate has been generated.

For payment disputes, contact billing@imihigo.rw within 30 days of the transaction.`
  },
  {
    id: 'privacy',
    title: '7. Privacy & Data Protection',
    content: `Imihigo Learn takes your privacy seriously and complies with Rwanda's Law No. 058/2021 on the Protection of Personal Data and Privacy.

We collect and process the following data:
• Account information (name, email, phone number, profile photo).
• Assessment results, scores, and performance data.
• Payment information (processed securely via third-party processors — we do not store card numbers).
• Device and usage data for proctoring and fraud prevention.
• Camera recordings during proctored assessments (retained for 90 days then deleted).

Your data is used to:
• Provide and improve Platform services.
• Issue and verify certificates.
• Match candidates to job opportunities.
• Send relevant notifications (you may opt out in settings).

We do not sell your personal data to third parties. Employer access to your profile is only granted when you apply to their posted positions. You may request deletion of your account data at privacy@imihigo.rw; note that blockchain certificate records cannot be deleted.`
  },
  {
    id: 'ip',
    title: '8. Intellectual Property',
    content: `All Platform content, including but not limited to software, algorithms, assessment questions, design, branding, and text, is owned by Imihigo Learn Ltd or its licensors and is protected by applicable intellectual property laws.

You are granted a limited, non-exclusive, non-transferable license to use the Platform for personal, non-commercial purposes in accordance with these Terms.

User-generated content (tutorials, community posts) remains your property. By posting content on the Platform, you grant Imihigo Learn a worldwide, royalty-free license to display, reproduce, and distribute that content on the Platform.

You may not copy, modify, distribute, reverse-engineer, or create derivative works from any Platform content without our express written permission.`
  },
  {
    id: 'termination',
    title: '9. Account Suspension & Termination',
    content: `Imihigo Learn may suspend or terminate your account at any time for:

• Violation of these Terms or our Community Guidelines.
• Cheating on assessments or attempting to fraudulently obtain certificates.
• Providing false registration information.
• Non-payment of applicable fees.
• Conduct harmful to other users, employers, or the Platform.
• Extended inactivity (accounts inactive for more than 24 months may be archived).

Upon termination:
• Your access to the Platform will be immediately revoked.
• Your earned certificates remain valid and verifiable on the blockchain.
• You may request an export of your data within 30 days of termination.

You may terminate your account at any time by contacting support@imihigo.rw. Active subscription fees are not refunded upon voluntary termination.

Imihigo Learn reserves the right to refuse service to anyone for any reason not prohibited by applicable law.`
  },
  {
    id: 'liability',
    title: '10. Limitation of Liability & Disclaimers',
    content: `The Platform is provided "as is" without warranties of any kind. Imihigo Learn makes no guarantees regarding:
• Uninterrupted or error-free Platform availability.
• Accuracy or completeness of assessment content.
• Employment outcomes resulting from Platform use.
• The continued employment of any employer posting jobs.

To the fullest extent permitted by law, Imihigo Learn shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of earnings, data, or business opportunities, even if we have been advised of the possibility of such damages.

Our total liability to you for any claim arising from use of the Platform shall not exceed the amount you paid to us in the 12 months preceding the claim, or 50,000 RWF, whichever is greater.

Nothing in these Terms excludes liability for fraud, death or personal injury caused by negligence, or any other liability that cannot be excluded under Rwandan law.`
  },
  {
    id: 'governing',
    title: '11. Governing Law & Disputes',
    content: `These Terms are governed by and construed in accordance with the laws of the Republic of Rwanda. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the Rwandan courts.

Before initiating formal legal proceedings, you agree to attempt resolution through our customer support team at legal@imihigo.rw. We will endeavor to respond within 10 business days.

If a dispute cannot be resolved informally within 30 days, either party may seek resolution through the Rwanda Arbitration Centre, with arbitration proceedings conducted in English or Kinyarwanda.`
  },
  {
    id: 'contact',
    title: '12. Contact Information',
    content: `For any questions, concerns, or notices related to these Terms, please contact us:

Imihigo Learn Ltd
KG 501 Street, Kigali, Rwanda

Email: legal@imihigo.rw
Support: support@imihigo.rw
Privacy: privacy@imihigo.rw
Billing: billing@imihigo.rw

Business Hours: Monday – Friday, 8:00 AM – 6:00 PM (CAT)

These Terms were last updated on April 9, 2026. By continuing to use the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.`
  },
]

export default function TermsConditions() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badge}>Legal Document</div>
          <h1 className={styles.title}>Terms & Conditions</h1>
          <p className={styles.subtitle}>
            Please read these Terms and Conditions carefully before using the Imihigo Learn platform.
            These terms govern your access to and use of all our services.
          </p>
          <div className={styles.meta}>
            <span>📅 Last updated: April 9, 2026</span>
            <span>📍 Governing Law: Republic of Rwanda</span>
            <span>🌐 Language: English</span>
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.toc}>
            <div className={styles.tocTitle}>Table of Contents</div>
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`${styles.tocLink} ${activeSection === s.id ? styles.tocLinkActive : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                {s.title}
              </a>
            ))}
            <div className={styles.tocDivider} />
            <Link to="/" className={styles.tocBack}>← Back to Home</Link>
          </aside>

          <main className={styles.content}>
            <div className={styles.intro}>
              <strong>Summary:</strong> By using Imihigo Learn, you agree to take assessments honestly, respect other users, provide accurate information, and comply with Rwandan law. We protect your data, issue tamper-proof credentials, and may suspend accounts that violate these rules. For full details, read each section below.
            </div>

            {sections.map(s => (
              <section key={s.id} id={s.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>{s.title}</h2>
                <div className={styles.sectionContent}>
                  {s.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className={styles.acceptBox}>
              <div className={styles.acceptIcon}>✅</div>
              <div>
                <strong>You accept these Terms by using our Platform.</strong>
                <p>Continued use of Imihigo Learn after the "Last updated" date above constitutes your acceptance of these Terms and Conditions.</p>
              </div>
              <Link to="/auth?tab=register" className={styles.acceptBtn}>Create Account</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
