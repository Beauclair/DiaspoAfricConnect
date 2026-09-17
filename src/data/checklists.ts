import { HostCountryCode } from '../constants/countries';

export interface ChecklistSection {
  title: string;
  items: string[];
}

export const CHECKLISTS: Record<HostCountryCode, ChecklistSection[]> = {
  US: [
    {
      title: 'Personal Documents',
      items: [
        'Valid Passport',
        'Birth Certificate (with translation if needed)',
        'Marriage Certificate (if applicable)',
        'National ID Card',
        'Passport-style Photos (2x2)',
        'Social Security Card (if issued)',
      ],
    },
    {
      title: 'Immigration Documents',
      items: [
        'I-94 Arrival/Departure Record',
        'Current Visa / Status Documents',
        'Previous Immigration Approvals',
        'Employment Authorization Document (EAD)',
        'Travel Document / Advance Parole',
      ],
    },
    {
      title: 'Financial Documents',
      items: [
        'Tax Returns (last 3 years)',
        'W-2 Forms / Pay Stubs',
        'Bank Statements (last 6 months)',
        'Affidavit of Support (I-864)',
        'Employment Verification Letter',
      ],
    },
    {
      title: 'Supporting Documents',
      items: [
        'Police Clearance Certificate',
        'Medical Examination Results (I-693)',
        'Proof of Address (utility bills, lease)',
        'Academic Credentials / Diplomas',
        'Professional Licenses / Certifications',
      ],
    },
  ],
  CA: [
    {
      title: 'Personal Documents',
      items: [
        'Valid Passport',
        'Birth Certificate (with translation if needed)',
        'Marriage Certificate (if applicable)',
        'National ID Card',
        'Passport-style Photos (Canadian spec)',
      ],
    },
    {
      title: 'Immigration Documents',
      items: [
        'Study Permit / Work Permit',
        'Visitor Record',
        'Confirmation of Permanent Residence (COPR)',
        'PR Card (if applicable)',
        'Previous Immigration Documents',
      ],
    },
    {
      title: 'Financial Documents',
      items: [
        'CRA Tax Returns / Notice of Assessment (NOA)',
        'T4 Slips / Pay Stubs',
        'Bank Statements (last 6 months)',
        'Proof of Funds (settlement funds)',
        'Employment Letter',
      ],
    },
    {
      title: 'Supporting Documents',
      items: [
        'Police Clearance Certificate',
        'Medical Exam (IMM 1017)',
        'Proof of Address (utility bills, lease)',
        'Educational Credential Assessment (ECA)',
        'Language Test Results (IELTS / TEF)',
      ],
    },
  ],
  UK: [
    {
      title: 'Personal Documents',
      items: [
        'Valid Passport',
        'Birth Certificate (with translation if needed)',
        'Marriage Certificate (if applicable)',
        'Biometric Residence Permit (BRP)',
        'Passport-style Photos (UK spec)',
      ],
    },
    {
      title: 'Immigration Documents',
      items: [
        'Current Visa / BRP',
        'Previous Visa Documents',
        'TB Test Certificate (if applicable)',
        'Certificate of Sponsorship (if employer-sponsored)',
      ],
    },
    {
      title: 'Financial Documents',
      items: [
        'Bank Statements (last 6 months)',
        'Payslips (last 6 months)',
        'HMRC Tax Documents',
        'Sponsor Maintenance Letter (if applicable)',
        'Council Tax Bills',
      ],
    },
    {
      title: 'Supporting Documents',
      items: [
        'Police Clearance (ACRO Certificate)',
        'English Language Test (IELTS for UKVI / SELT)',
        'ENIC UK Credential Evaluation',
        'Proof of Address (council tax, utility bills)',
        'NHS Surcharge Payment Confirmation',
      ],
    },
  ],
  FR: [
    {
      title: 'Personal Documents',
      items: [
        'Valid Passport',
        'Birth Certificate (with apostille)',
        'Marriage Certificate (if applicable)',
        'Passport-style Photos (French spec)',
        'CNI (if applicable)',
      ],
    },
    {
      title: 'Immigration Documents',
      items: [
        'Current Titre de Sejour',
        'Visa Long Sejour',
        'Recepisse (receipt of application)',
        'OFII Attestation',
        'Previous Residence Permits',
      ],
    },
    {
      title: 'Financial Documents',
      items: [
        'Avis d\'Imposition (tax notice)',
        'Fiches de Paie (last 3 months payslips)',
        'Bank Statements (last 3 months)',
        'Proof of Sufficient Resources',
        'Employment Contract',
      ],
    },
    {
      title: 'Supporting Documents',
      items: [
        'Casier Judiciaire (criminal record)',
        'Medical Certificate (OFII)',
        'Proof of Address (quittance de loyer)',
        'Diplomas with Sworn Translation',
        'Assurance Maladie (health insurance)',
      ],
    },
  ],
  DE: [
    {
      title: 'Personal Documents',
      items: [
        'Valid Passport',
        'Birth Certificate (with apostille)',
        'Marriage Certificate (if applicable)',
        'Biometric Photos (German spec)',
        'Anmeldung (city registration)',
      ],
    },
    {
      title: 'Immigration Documents',
      items: [
        'Current Aufenthaltstitel (residence permit)',
        'Visa',
        'Fiktionsbescheinigung (if applicable)',
        'Previous Residence Permits',
      ],
    },
    {
      title: 'Financial Documents',
      items: [
        'Steuerbescheid (tax assessment)',
        'Lohnabrechnung (payslips)',
        'Bank Statements (last 3 months)',
        'Blocked Account Proof (if applicable)',
        'Employment Contract',
      ],
    },
    {
      title: 'Supporting Documents',
      items: [
        'Police Clearance Certificate',
        'Health Insurance Certificate',
        'Meldebescheinigung (proof of address)',
        'Credential Recognition (anabin)',
        'Language Certificate (A1/B1)',
      ],
    },
  ],
};
