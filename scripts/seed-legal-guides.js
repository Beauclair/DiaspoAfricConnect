/**
 * One-time script to seed the `legalGuides` collection and migrate lawyer specializations.
 *
 * Run from the project root:
 *   node scripts/seed-legal-guides.js
 *
 * Uses the Firebase Admin SDK (service account auto-discovered via GOOGLE_APPLICATION_CREDENTIALS
 * or the default emulator/gcloud auth).
 */

const admin = require('firebase-admin');

admin.initializeApp({ projectId: 'diaspoafricconnect' });
const db = admin.firestore();

const { Timestamp } = admin.firestore;

const sampleGuides = [
  {
    title: 'Family-Based Green Card: Complete Guide',
    legalCategory: 'immigration',
    category: 'greencard',
    hostCountry: 'US',
    summary: 'Step-by-step process for obtaining a green card through family sponsorship, including immediate relatives and preference categories.',
    content: 'A family-based green card allows US citizens and lawful permanent residents to sponsor certain family members for permanent residence. The process involves filing a petition, waiting for a visa number (if applicable), and attending an interview.\n\nImmediate relatives of US citizens (spouses, unmarried children under 21, and parents) have no annual visa limits and can proceed directly. Other family preference categories may have wait times ranging from a few years to over a decade.',
    steps: [
      'Determine eligibility and appropriate family preference category',
      'US citizen/LPR sponsor files Form I-130 (Petition for Alien Relative)',
      'Wait for petition approval from USCIS',
      'When visa number is available, file Form I-485 (Adjustment of Status) or go through consular processing',
      'Complete biometrics appointment',
      'Attend interview at USCIS field office or US consulate',
      'Receive decision on green card application',
    ],
    requiredDocuments: [
      'Form I-130', 'Form I-485 or DS-260', 'Birth certificates',
      'Marriage certificate (if applicable)', 'Passport photos',
      'Affidavit of Support (I-864)', 'Tax returns (3 years)',
      'Medical examination (I-693)', 'Police clearance certificates',
    ],
    estimatedTimeline: '6-24 months',
    estimatedCost: '$1,760-$2,500',
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'H-1B Work Visa: What You Need to Know',
    legalCategory: 'immigration',
    category: 'visa',
    hostCountry: 'US',
    summary: 'Guide to the H-1B specialty occupation visa, including the lottery process, employer requirements, and application timeline.',
    content: 'The H-1B visa is a non-immigrant visa that allows US employers to temporarily employ foreign workers in specialty occupations. These are positions that require a bachelor\'s degree or higher in a specific field.\n\nThe annual cap is 65,000 visas plus 20,000 for those with US master\'s degrees. Registration typically opens in March for the October 1 start date.',
    steps: [
      'Find a US employer willing to sponsor your H-1B',
      'Employer registers for the H-1B lottery during registration period (March)',
      'If selected in lottery, employer files Labor Condition Application (LCA)',
      'Employer files Form I-129 with USCIS',
      'Attend visa interview at US embassy/consulate (if abroad)',
      'Enter the US on or after October 1',
    ],
    requiredDocuments: [
      'Form I-129', 'Labor Condition Application (LCA)',
      'Educational credentials and evaluations', 'Resume/CV',
      'Employer support letter', 'Passport', 'Previous US visa stamps (if any)',
    ],
    estimatedTimeline: '3-6 months',
    estimatedCost: '$2,500-$5,000',
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Path to US Citizenship: Naturalization',
    legalCategory: 'immigration',
    category: 'citizenship',
    hostCountry: 'US',
    summary: 'Complete guide to becoming a US citizen through naturalization, including eligibility requirements, the application process, and the citizenship test.',
    content: 'Naturalization is the process by which a foreign citizen becomes a US citizen. To be eligible, you generally must have been a lawful permanent resident (green card holder) for at least 5 years (3 years if married to a US citizen).\n\nYou must demonstrate good moral character, pass an English language test and a civics test about US history and government.',
    steps: [
      'Confirm eligibility (5 years as LPR, 3 if married to US citizen)',
      'File Form N-400 (Application for Naturalization)',
      'Complete biometrics appointment',
      'Attend naturalization interview',
      'Pass English and civics tests',
      'Receive decision',
      'Take the Oath of Allegiance at a ceremony',
    ],
    requiredDocuments: [
      'Form N-400', 'Green card (front and back copies)', 'Passport photos',
      'Tax returns (5 years)', 'Travel history records',
      'Marriage/divorce certificates (if applicable)', 'Selective Service registration (males 18-31)',
    ],
    estimatedTimeline: '8-14 months',
    estimatedCost: '$725-$1,200',
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Asylum in the US: Protection for Persecuted Individuals',
    legalCategory: 'immigration',
    category: 'asylum',
    hostCountry: 'US',
    summary: 'Understanding the asylum process for individuals fleeing persecution based on race, religion, nationality, political opinion, or social group.',
    content: 'Asylum is a form of protection that allows individuals who meet the definition of a refugee to remain in the United States. You must apply within one year of arrival, though exceptions exist.\n\nYou may apply affirmatively (if not in removal proceedings) or defensively (as a defense against removal). Successful applicants can eventually apply for a green card.',
    steps: [
      'Arrive in the US and file within one year',
      'File Form I-589 (Application for Asylum)',
      'Receive appointment notice for biometrics',
      'Attend asylum interview with USCIS officer (affirmative) or hearing before immigration judge (defensive)',
      'Provide evidence of persecution or fear of persecution',
      'Receive decision',
      'If granted, apply for green card after one year',
    ],
    requiredDocuments: [
      'Form I-589', 'Passport and travel documents',
      'Identity documents from home country', 'Evidence of persecution (photos, reports, letters)',
      'Country condition reports', 'Medical/psychological reports (if applicable)',
      'Affidavits from witnesses', 'Personal declaration/statement',
    ],
    estimatedTimeline: '6 months - 4+ years',
    estimatedCost: 'Free (filing fee waived)',
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Express Entry: Permanent Residence in Canada',
    legalCategory: 'immigration',
    category: 'permanent-residence',
    hostCountry: 'CA',
    summary: 'How to apply for Canadian permanent residence through Express Entry, including CRS scores, draws, and the Federal Skilled Worker Program.',
    content: 'Express Entry is Canada\'s primary system for managing applications for permanent residence from skilled workers. It covers three programs: Federal Skilled Worker Program (FSWP), Federal Skilled Trades Program (FSTP), and Canadian Experience Class (CEC).\n\nCandidates create an online profile and are ranked using the Comprehensive Ranking System (CRS). The highest-ranked candidates receive Invitations to Apply (ITAs) in regular draws.',
    steps: [
      'Check eligibility for one of the three Express Entry programs',
      'Get language test results (IELTS or TEF)',
      'Get Educational Credential Assessment (ECA) for foreign degrees',
      'Create an Express Entry profile online',
      'Receive Comprehensive Ranking System (CRS) score',
      'If invited, submit complete application within 60 days',
      'Complete medical exams and police certificates',
      'Receive Confirmation of Permanent Residence (COPR)',
    ],
    requiredDocuments: [
      'Language test results (IELTS/TEF)', 'Educational Credential Assessment (ECA)',
      'Passport', 'Proof of work experience (reference letters)',
      'Proof of funds', 'Police certificates', 'Medical exam results',
      'Photos (per IRCC specifications)',
    ],
    estimatedTimeline: '6-12 months',
    estimatedCost: 'CAD $1,365-$2,500',
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'UK Skilled Worker Visa: Complete Guide',
    legalCategory: 'immigration',
    category: 'work-permit',
    hostCountry: 'UK',
    summary: 'How to obtain a Skilled Worker visa to work in the UK, including sponsorship, salary thresholds, and the points-based system.',
    content: 'The Skilled Worker visa replaced the Tier 2 (General) visa. It allows you to come to or stay in the UK to do an eligible job with an approved employer. You need a job offer from a UK employer who holds a sponsor licence.\n\nYou must score enough points based on: job offer from approved sponsor (20 pts), job at appropriate skill level (20 pts), English language ability (10 pts), and meeting the salary threshold (20 pts).',
    steps: [
      'Get a job offer from a UK employer with a sponsor licence',
      'Employer assigns you a Certificate of Sponsorship (CoS)',
      'Prove your knowledge of English (IELTS for UKVI or equivalent)',
      'Apply online and pay the application fee and Immigration Health Surcharge',
      'Provide biometric information',
      'Attend an appointment at a visa application centre (if abroad)',
      'Receive decision and BRP (Biometric Residence Permit)',
    ],
    requiredDocuments: [
      'Certificate of Sponsorship (CoS)', 'Passport', 'Proof of English language ability',
      'Bank statements (maintenance funds)', 'Criminal record certificate',
      'TB test results (if from listed country)', 'Qualification certificates',
    ],
    estimatedTimeline: '3-8 weeks',
    estimatedCost: '£625-£1,423 + £1,035/year IHS',
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Titre de Séjour: Residence Permit in France',
    legalCategory: 'immigration',
    category: 'carte-de-sejour',
    hostCountry: 'FR',
    summary: 'Guide to obtaining and renewing a titre de séjour (residence permit) in France, covering salarié, vie privée et familiale, and talent categories.',
    content: 'A titre de séjour is a residence permit required for non-EU nationals staying in France for more than 3 months. There are several types depending on your situation: salarié (employee), vie privée et familiale (private and family life), passeport talent (for highly skilled workers), and étudiant (student).\n\nThe application is typically made at the préfecture of your place of residence. Processing times vary significantly by département.',
    steps: [
      'Enter France on the appropriate long-stay visa (visa long séjour)',
      'Validate your visa with OFII within 3 months of arrival',
      'Gather required documents based on your permit category',
      'Book an appointment at your local préfecture',
      'Submit your application and receive a récépissé (receipt)',
      'Attend any required interviews or medical examinations',
      'Collect your carte de séjour when notified',
    ],
    requiredDocuments: [
      'Valid passport with long-stay visa', 'OFII validation attestation',
      'Proof of address (quittance de loyer or attestation d\'hébergement)',
      'Passport photos (OFPRA format)', 'Employment contract or proof of activity',
      'Proof of income or resources', 'Health insurance attestation',
    ],
    estimatedTimeline: '2-6 months',
    estimatedCost: '€225-€269',
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'EU Blue Card: Working in Germany',
    legalCategory: 'immigration',
    category: 'aufenthaltstitel',
    hostCountry: 'DE',
    summary: 'How to obtain an EU Blue Card for highly qualified employment in Germany, including salary requirements and the path to permanent residence.',
    content: 'The EU Blue Card (Blaue Karte EU) is a residence permit for highly qualified non-EU nationals with a recognized university degree and a job offer meeting the minimum salary threshold.\n\nThe salary threshold is €45,300/year (or €41,041.80 for shortage occupations like IT, engineering, and natural sciences). After 21 months with B1 German or 27 months with A1 German, you can apply for permanent settlement (Niederlassungserlaubnis).',
    steps: [
      'Obtain a recognized university degree (check anabin database)',
      'Secure a job offer meeting the salary threshold',
      'Apply for a visa at the German embassy/consulate (if abroad)',
      'Register your address in Germany (Anmeldung)',
      'Apply for the Blue Card at the local Ausländerbehörde',
      'Provide all required documents and biometrics',
      'Receive your Blue Card (valid up to 4 years)',
    ],
    requiredDocuments: [
      'Recognized university degree (with anabin equivalence)', 'Employment contract',
      'Passport', 'Biometric photos', 'Proof of address (Meldebescheinigung)',
      'Health insurance certificate', 'CV/resume', 'Proof of degree recognition',
    ],
    estimatedTimeline: '4-12 weeks',
    estimatedCost: '€100-€140',
    lastUpdated: Timestamp.now(),
  },
];

// Old immigration sub-category keys that need migrating on lawyers
const OLD_KEYS = new Set([
  'visa', 'greencard', 'permanent-residence', 'indefinite-leave',
  'carte-de-sejour', 'aufenthaltstitel', 'asylum', 'citizenship',
  'work-permit', 'family', 'student', 'other',
]);

async function main() {
  // 1. Seed legalGuides if empty
  const guidesSnap = await db.collection('legalGuides').get();
  if (guidesSnap.size === 0) {
    console.log('Seeding legalGuides...');
    const batch = db.batch();
    for (const guide of sampleGuides) {
      batch.set(db.collection('legalGuides').doc(), guide);
    }
    await batch.commit();
    console.log(`Seeded ${sampleGuides.length} legal guides.`);
  } else {
    console.log(`legalGuides already has ${guidesSnap.size} docs, skipping.`);
  }

  // 2. Migrate lawyer specializations
  const lawyersSnap = await db.collection('lawyers').get();
  let migrated = 0;
  for (const doc of lawyersSnap.docs) {
    const specs = doc.data().specializations || [];
    if (specs.some(s => OLD_KEYS.has(s))) {
      const newSpecs = [...new Set(specs.map(s => {
        if (s === 'family') return 'family-law';
        if (OLD_KEYS.has(s)) return 'immigration';
        return s;
      }))];
      await doc.ref.update({ specializations: newSpecs });
      migrated++;
    }
  }
  console.log(`Migrated ${migrated} lawyer(s) specializations.`);
  console.log('Done!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
