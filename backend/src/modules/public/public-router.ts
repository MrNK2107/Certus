import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { wrapAsync } from '../../middleware';

const router = Router();

router.get('/overview', (_req: Request, res: Response) => {
  res.json({
    name: 'MSME Financial Health Card',
    description: 'Consent-driven alternate-data credit decision support for MSME financial inclusion',
    version: '1.0.0',
  });
});

router.get('/pillars', (_req: Request, res: Response) => {
  res.json([
    { name: 'REVENUE_STABILITY', label: 'Revenue Stability', description: 'Measures whether the business shows stable or growing revenue behavior over time' },
    { name: 'CASH_FLOW_HEALTH', label: 'Cash Flow Health', description: 'Measures whether the business manages liquidity in a sustainable way' },
    { name: 'COMPLIANCE_DISCIPLINE', label: 'Compliance Discipline', description: 'Measures whether the business behaves consistently with formal obligations' },
    { name: 'OPERATIONAL_MATURITY', label: 'Operational Maturity', description: 'Measures whether the business appears established, stable, and continuously operating' },
    { name: 'CREDIT_BEHAVIOR', label: 'Credit Behavior', description: 'Measures how the borrower has behaved with formal credit' },
    { name: 'DIGITAL_COMMERCIAL_ACTIVITY', label: 'Digital Commercial Activity', description: 'Measures the digital visibility and digital payment behavior' },
  ]);
});

router.get('/sources', (_req: Request, res: Response) => {
  res.json([
    { type: 'AA', label: 'Account Aggregator / Bank Statements', priority: 'CORE' },
    { type: 'GST', label: 'GST Returns', priority: 'CORE' },
    { type: 'BUREAU', label: 'Credit Bureau', priority: 'CORE' },
    { type: 'UPI', label: 'UPI / Digital Collections', priority: 'SUPPORTING' },
    { type: 'EPFO', label: 'EPFO / Payroll', priority: 'SUPPORTING' },
    { type: 'REGISTRATION', label: 'Registration / Entity Records', priority: 'SUPPORTING' },
  ]);
});

router.get('/faq', (_req: Request, res: Response) => {
  res.json([
    { question: 'Why not bureau-only?', answer: 'Bureau-only systems miss NTC and thin-file businesses.' },
    { question: 'What if a source is missing?', answer: 'Missingness reduces confidence and completeness, not health.' },
    { question: 'How is consent handled?', answer: 'Consent is granular, per-source, and revocable at any time.' },
    { question: 'What is the Financial Health Card?', answer: 'A multi-pillar assessment with explainable scores, not a black-box score.' },
  ]);
});

router.post('/contact-inquiry', wrapAsync(async (req: Request, res: Response) => {
  const { name, email, message } = req.body as { name?: string; email?: string; message?: string };
  if (!name || !email || !message) {
    res.status(400).json({
      errorCode: 'VALIDATION_ERROR',
      message: 'name, email, and message are required',
    });
    return;
  }
  res.status(201).json({ message: 'Inquiry received', inquiryId: `inq-${uuidv4().substring(0, 8)}` });
}));

export default router;
