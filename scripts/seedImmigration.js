/**
 * Seed US immigration guides and lawyers into Firestore.
 *
 * Usage:
 *   node scripts/seedImmigration.js <email> <password>
 *
 * The script signs in with your existing account to satisfy
 * Firestore security rules, then writes the seed data.
 */

const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, query, where, Timestamp, terminate } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBqfIyOBPgjM4yRSMeA0nt68C7u9uRkHws',
  authDomain: 'diaspoafricconnect.firebaseapp.com',
  projectId: 'diaspoafricconnect',
  storageBucket: 'diaspoafricconnect.firebasestorage.app',
  messagingSenderId: '277479570571',
  appId: '1:277479570571:web:7a993449b788c53502688e',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── Immigration Guides (US) ──────────────────────────────────────────

const US_GUIDES = [
  {
    title: 'Understanding US Visa Types',
    category: 'visa',
    hostCountry: 'US',
    summary: 'A comprehensive overview of the most common US visa categories for African immigrants, including tourist, work, and specialty visas.',
    content: `The United States offers dozens of visa categories, each designed for a specific purpose. For members of the African diaspora, the most relevant categories typically include:

B-1/B-2 (Tourist/Business): Short-term visas for visiting family, tourism, or business meetings. Valid for up to 6 months per visit, with the visa itself often valid for 10 years.

H-1B (Specialty Occupation): For professionals with a bachelor's degree or higher in a specific field. This is one of the most popular work visas but is subject to an annual cap of 85,000 (including 20,000 for advanced degree holders). Your employer must sponsor you.

L-1 (Intracompany Transfer): For employees being transferred from an overseas office to a US office of the same company. No annual cap, making it a valuable alternative to H-1B.

O-1 (Extraordinary Ability): For individuals who have demonstrated extraordinary ability in sciences, arts, education, business, or athletics. No annual cap.

TN (NAFTA/USMCA): Only for citizens of Canada and Mexico in certain professional occupations.

E-2 (Treaty Investor): Available to nationals of countries that have a treaty of commerce with the US. Several African countries qualify, including Cameroon, Republic of Congo, Ethiopia, Liberia, Senegal, and Togo.

Each visa type has different requirements, processing times, and pathways to permanent residence. It's crucial to understand which category fits your situation before applying.`,
    steps: [
      'Determine which visa category matches your purpose of travel and qualifications',
      'Gather required documentation (passport, photos, financial records, employment letters)',
      'Complete Form DS-160 (Online Nonimmigrant Visa Application) at ceac.state.gov',
      'Pay the visa application fee ($185 for most nonimmigrant visas)',
      'Schedule and attend your visa interview at the US Embassy/Consulate in your country',
      'Wait for visa processing (times vary by post and category)',
      'If approved, receive your passport with the visa stamp and plan your travel',
    ],
    requiredDocuments: [
      'Valid passport (must be valid for at least 6 months beyond your intended stay)',
      'Completed DS-160 confirmation page',
      'Visa application fee payment receipt',
      'Passport-style photo (2x2 inches, white background)',
      'Proof of ties to your home country (employment, property, family)',
      'Financial documents showing ability to support yourself',
      'Letter of invitation or employment offer (if applicable)',
      'Previous US visas (if any)',
    ],
    estimatedTimeline: '2–6 months',
    estimatedCost: '$185–$460',
  },
  {
    title: 'Pathways to a Green Card (Permanent Residence)',
    category: 'greencard',
    hostCountry: 'US',
    summary: 'Step-by-step guide to obtaining lawful permanent residence in the United States through employment, family sponsorship, or the diversity visa lottery.',
    content: `A Green Card (Form I-551) grants you lawful permanent resident status, allowing you to live and work permanently in the United States. There are several pathways:

Employment-Based Green Cards:
- EB-1: Priority workers (extraordinary ability, outstanding professors/researchers, multinational managers)
- EB-2: Professionals with advanced degrees or exceptional ability (includes National Interest Waiver)
- EB-3: Skilled workers, professionals, and other workers
- EB-4: Special immigrants (religious workers, certain government employees)
- EB-5: Immigrant investors ($800,000–$1,050,000 investment)

Family-Based Green Cards:
- Immediate relatives of US citizens (spouse, unmarried children under 21, parents)
- Family preference categories (adult children, siblings of US citizens, spouses/children of permanent residents)

Diversity Visa Lottery (DV Lottery):
This is particularly important for the African diaspora. The DV lottery makes 55,000 green cards available annually to nationals of countries with historically low immigration rates to the US. Many African countries are eligible, and Africa typically receives one of the largest regional allocations. Applications are free and open once a year (usually October–November).

Asylum/Refugee Status:
Those who have been granted asylum or admitted as refugees can apply for a green card after one year.

The process typically involves labor certification (PERM) for employment-based categories, an approved immigrant petition (I-130 or I-140), and either adjustment of status (I-485, if you're in the US) or consular processing (if abroad).`,
    steps: [
      'Determine your eligibility category (employment, family, diversity lottery, or asylum)',
      'For employment-based: your employer files PERM Labor Certification with the DOL',
      'File the immigrant petition (Form I-140 for employment, I-130 for family)',
      'Wait for your priority date to become current (check the Visa Bulletin monthly)',
      'File Form I-485 (Adjustment of Status) if in the US, or go through consular processing abroad',
      'Complete biometrics appointment (fingerprints and photo)',
      'Attend your interview (at USCIS office or US consulate)',
      'Receive your Green Card by mail after approval',
    ],
    requiredDocuments: [
      'Birth certificate with English translation',
      'Valid passport',
      'Two passport-style photos',
      'Medical examination results (Form I-693, by USCIS-approved doctor)',
      'Police clearance certificates from all countries lived in for 6+ months',
      'Employment verification letters',
      'Tax returns (last 3 years)',
      'Form I-864 Affidavit of Support (for family-based)',
      'Marriage certificate (if applicable)',
      'Evidence of qualifying relationship or employment',
    ],
    estimatedTimeline: '1–10+ years (varies greatly by category and country of birth)',
    estimatedCost: '$1,225–$3,500+',
  },
  {
    title: 'Applying for Asylum in the United States',
    category: 'asylum',
    hostCountry: 'US',
    summary: 'Essential guide for African immigrants seeking asylum protection in the US, including eligibility, the application process, and what to expect.',
    content: `Asylum is a form of protection that allows individuals who meet the definition of a refugee to remain in the United States. To qualify, you must demonstrate that you have been persecuted or have a well-founded fear of persecution based on:

- Race
- Religion
- Nationality
- Membership in a particular social group
- Political opinion

This protection is critical for many African immigrants fleeing conflict, political persecution, or targeted violence in their home countries.

Types of Asylum:
1. Affirmative Asylum: Filed with USCIS within one year of arriving in the US (even if undocumented). You are interviewed by an asylum officer in a non-adversarial setting.
2. Defensive Asylum: Filed in immigration court as a defense against removal (deportation). You must convince an immigration judge.

Important notes:
- The one-year filing deadline is strict but has limited exceptions (changed country conditions, extraordinary circumstances)
- You can include your spouse and unmarried children under 21 on your application
- You may apply for work authorization (EAD) 180 days after filing
- After one year of asylum status, you can apply for a Green Card
- Asylum is free to apply for — you do NOT need to pay a filing fee

Many African asylum seekers have strong cases based on political persecution, ethnic/tribal conflict, gender-based violence, LGBTQ+ persecution, and religious persecution. Detailed, consistent, and well-documented testimony is crucial.`,
    steps: [
      'Arrive in the United States (you must be physically present to apply)',
      'File Form I-589 (Application for Asylum) within one year of your last arrival',
      'USCIS sends a receipt notice and schedules biometrics (fingerprints)',
      'Prepare your declaration — a detailed personal statement of your persecution',
      'Gather supporting evidence (country condition reports, medical records, photos, news articles)',
      'Attend your asylum interview or court hearing',
      'Receive a decision (granted, referred to court, or denied)',
      'If granted, apply for a Green Card after one year (Form I-485)',
    ],
    requiredDocuments: [
      'Form I-589 (Application for Asylum and Withholding of Removal)',
      'Valid passport or travel document (if available — not required)',
      'Identity documents (national ID, birth certificate)',
      'Detailed personal declaration/affidavit',
      'Country condition evidence (US State Dept reports, Human Rights Watch, Amnesty International)',
      'Any evidence of persecution (photos, medical records, police reports, threatening letters)',
      'Affidavits from witnesses or family members',
      'Expert witness letters (if available)',
      'Proof of entry to the US (I-94, visa stamp)',
    ],
    estimatedTimeline: '6 months – 4+ years',
    estimatedCost: 'Free (no filing fee)',
  },
  {
    title: 'US Citizenship Through Naturalization',
    category: 'citizenship',
    hostCountry: 'US',
    summary: 'Complete guide to becoming a US citizen through naturalization, including eligibility requirements, the civics test, and the oath ceremony.',
    content: `Naturalization is the process by which a lawful permanent resident (Green Card holder) becomes a US citizen. US citizenship grants you the right to vote, travel with a US passport, sponsor family members, and access federal benefits.

General Eligibility Requirements:
- Be at least 18 years old
- Be a lawful permanent resident (Green Card holder) for at least 5 years (3 years if married to a US citizen)
- Have continuous residence in the US for at least 5 years (3 if married to a citizen)
- Be physically present in the US for at least 30 months (18 months if married to a citizen) out of the 5 (or 3) years
- Have lived in the state/district where you're applying for at least 3 months
- Be able to read, write, and speak basic English
- Have knowledge of US history and government (civics test)
- Be a person of good moral character
- Be willing to take the Oath of Allegiance

The Civics Test:
You'll be asked up to 10 questions from a list of 100 possible questions about US history and government. You must answer at least 6 correctly. USCIS provides free study materials and practice tests online.

The English Test:
During your interview, the officer will test your ability to read, write, and speak English. This includes reading a sentence aloud, writing a sentence, and conversing in English.

Special considerations for African-born citizens:
- The US generally allows dual citizenship, but check your home country's laws — some African countries do not allow it
- Some countries (e.g., Nigeria, Ghana, Kenya) have pathways to retain or regain citizenship even after naturalizing elsewhere`,
    steps: [
      'Confirm you meet all eligibility requirements (time as LPR, physical presence, etc.)',
      'File Form N-400 (Application for Naturalization) online or by mail',
      'Pay the filing fee ($760, or fee waiver if eligible)',
      'Complete biometrics appointment (fingerprints and photo)',
      'Study for the civics and English tests using USCIS resources',
      'Attend your naturalization interview at the local USCIS office',
      'Pass the English and civics tests during the interview',
      'Receive a decision (approved, continued, or denied)',
      'Attend the Oath of Allegiance ceremony and receive your Certificate of Naturalization',
      'Apply for your US passport',
    ],
    requiredDocuments: [
      'Completed Form N-400',
      'Copy of Green Card (front and back)',
      'Two passport-style photos',
      'Tax returns for the last 5 years (or 3 years if married to US citizen)',
      'Travel history (all trips outside the US in the qualifying period)',
      'Marriage certificate (if married to US citizen)',
      'Divorce/death certificates for prior marriages (if applicable)',
      'Court records (if any criminal history, even dismissed charges)',
      'Evidence of good moral character',
      'Selective Service registration (for males 18–31)',
    ],
    estimatedTimeline: '8–14 months',
    estimatedCost: '$760 (fee waiver available)',
  },
  {
    title: 'Employment Authorization Document (EAD / Work Permit)',
    category: 'work-permit',
    hostCountry: 'US',
    summary: 'How to obtain an Employment Authorization Document (EAD) to legally work in the United States while your immigration case is pending.',
    content: `An Employment Authorization Document (EAD), commonly known as a work permit, allows foreign nationals to work legally in the United States. Unlike work visas (which are tied to a specific employer), an EAD lets you work for any employer.

Who can apply for an EAD:
- Asylum applicants (after filing or 180 days waiting)
- Adjustment of status applicants (pending I-485)
- DACA recipients
- Certain visa holders' spouses (H-4, L-2, E-1/E-2)
- TPS (Temporary Protected Status) holders — several African countries are designated
- Students seeking practical training (OPT)
- Refugees

TPS Countries (Africa):
Several African countries have Temporary Protected Status designation, which allows nationals to live and work in the US. Countries have included: Somalia, South Sudan, Sudan, Ethiopia, Cameroon, and others. TPS designations change — check the USCIS website for current designations.

The EAD card is typically valid for 1–2 years and must be renewed before it expires. Apply early for renewal (up to 180 days before expiration) because processing times can be long.

Important: Working without authorization can jeopardize your immigration status. Always ensure you have a valid EAD or other work authorization before starting employment.`,
    steps: [
      'Determine your eligibility category for an EAD',
      'File Form I-765 (Application for Employment Authorization)',
      'Pay the filing fee ($410) or apply for a fee waiver — some categories are fee-exempt',
      'Submit supporting documentation specific to your eligibility category',
      'Complete biometrics if required',
      'Wait for processing (check current processing times on USCIS website)',
      'Receive your EAD card by mail',
      'Begin working — provide your EAD to your employer for I-9 verification',
      'Track your expiration date and file for renewal 120–180 days in advance',
    ],
    requiredDocuments: [
      'Form I-765 (Application for Employment Authorization)',
      'Copy of passport/travel document',
      'Two passport-style photos',
      'Copy of your most recent I-94 arrival record',
      'Copy of last EAD (if renewing)',
      'Receipt notice of pending application (I-485, I-589, etc.)',
      'Evidence of eligibility (varies by category)',
      'Copy of Form I-797 approval notices (if applicable)',
    ],
    estimatedTimeline: '3–7 months',
    estimatedCost: '$0–$410 (varies by category)',
  },
  {
    title: 'Family-Based Immigration to the US',
    category: 'family',
    hostCountry: 'US',
    summary: 'Guide to sponsoring family members for immigration to the United States, including immediate relatives and family preference categories.',
    content: `Family-based immigration is one of the most common pathways to the US, and it plays a vital role in reuniting African families separated across continents.

Who can be sponsored:
As a US Citizen, you can sponsor:
- Spouse (immediate relative — no visa number wait)
- Unmarried children under 21 (immediate relative)
- Parents (immediate relative — if you're 21+)
- Married children (Family Preference 3rd — long wait)
- Brothers and sisters (Family Preference 4th — very long wait)

As a Permanent Resident (Green Card holder), you can sponsor:
- Spouse (Family Preference 2A)
- Unmarried children under 21 (Family Preference 2A)
- Unmarried children over 21 (Family Preference 2B)

Important wait time reality:
Immediate relatives of US citizens have NO annual numerical limits — these cases are processed as quickly as the paperwork allows. However, family preference categories are subject to per-country limits and can involve very long waits:
- 2A (spouse/minor children of LPR): 2–5 years
- 2B (unmarried adult children of LPR): 5–10 years
- 3rd (married children of US citizens): 10–15 years
- 4th (siblings of US citizens): 15–23 years

The Affidavit of Support (Form I-864) is a legal contract where the sponsor agrees to financially support the immigrant. The sponsor must demonstrate income at 125% of the federal poverty guidelines.

For African families, the long wait times in preference categories are particularly challenging. It's important to file the petition (I-130) as early as possible to establish a priority date, and to explore whether any other immigration pathway might be faster.`,
    steps: [
      'Determine your eligibility as a sponsor and your relative\'s category',
      'File Form I-130 (Petition for Alien Relative) with USCIS',
      'Pay the filing fee ($625)',
      'Wait for I-130 approval (6–12 months for immediate relatives, longer for preference)',
      'Wait for a visa number to become available (check Visa Bulletin — immediate relatives skip this)',
      'Beneficiary files Form I-485 (if in the US) or completes consular processing at US embassy',
      'Complete medical examination and background checks',
      'Attend interview (USCIS office or US consulate)',
      'Receive Green Card after approval',
    ],
    requiredDocuments: [
      'Form I-130 (Petition for Alien Relative)',
      'Proof of US citizenship or permanent resident status (passport, certificate, Green Card)',
      'Proof of relationship (birth certificate, marriage certificate)',
      'Passport-style photos of both petitioner and beneficiary',
      'Form I-864 Affidavit of Support',
      'Sponsor\'s tax returns (last 3 years), W-2s, pay stubs',
      'Beneficiary\'s birth certificate with English translation',
      'Beneficiary\'s passport',
      'Medical examination results (Form I-693)',
      'Police clearance from all countries lived in 6+ months',
      'Evidence of bona fide relationship (for spouses: photos, communication logs, shared finances)',
    ],
    estimatedTimeline: '1–23+ years (depending on category)',
    estimatedCost: '$625–$3,000+',
  },
  {
    title: 'Student Visa Guide (F-1 and M-1)',
    category: 'student',
    hostCountry: 'US',
    summary: 'Everything you need to know about obtaining an F-1 or M-1 student visa to study in the United States, from admission to post-graduation work options.',
    content: `Studying in the US is a common first step for many African immigrants. The F-1 visa (academic studies) and M-1 visa (vocational/technical studies) allow you to pursue education at US institutions.

F-1 Visa (Academic Students):
- For full-time study at an accredited college, university, seminary, conservatory, academic high school, elementary school, or language training program
- Allows limited on-campus employment (20 hours/week during school, full-time during breaks)
- OPT (Optional Practical Training): Up to 12 months of work authorization in your field after completing your program. STEM graduates can extend for an additional 24 months (total 36 months)
- CPT (Curricular Practical Training): Work authorization for internships or co-ops that are part of your curriculum

M-1 Visa (Vocational Students):
- For vocational or technical (non-academic) programs
- More limited work options than F-1
- Practical training available after completion

Key considerations for African students:
- Demonstrate strong ties to your home country (intent to return — this is the most common reason for visa denial)
- Show sufficient financial resources for the entire program
- Apply early — visa interview wait times at African embassies can be very long
- SEVIS (Student Exchange Visitor Information System) fee must be paid before the visa interview
- Many US universities offer scholarships specifically for African students

After graduation, OPT and STEM OPT provide a bridge to potentially transition to an H-1B work visa or other employment-based immigration pathway.`,
    steps: [
      'Research and apply to SEVP-certified US schools',
      'Receive admission and Form I-20 (Certificate of Eligibility) from the school',
      'Pay the SEVIS I-901 fee ($350 for F-1, $220 for M-1)',
      'Complete Form DS-160 (Online Nonimmigrant Visa Application)',
      'Pay the visa application fee ($185)',
      'Schedule and attend your visa interview at the US Embassy/Consulate',
      'If approved, receive your visa and plan your travel (arrive no more than 30 days before program start)',
      'Check in with your school\'s international student office upon arrival',
      'Maintain your status: full-time enrollment, report address changes, follow work authorization rules',
    ],
    requiredDocuments: [
      'Valid passport (at least 6 months validity beyond intended stay)',
      'Form I-20 from your school (signed by you and designated school official)',
      'SEVIS I-901 fee payment receipt',
      'DS-160 confirmation page',
      'Visa application fee payment receipt',
      'Passport-style photo (2x2 inches)',
      'Proof of financial support (bank statements, scholarship letters, sponsor affidavits)',
      'Academic transcripts and diplomas (with English translations)',
      'Standardized test scores (TOEFL/IELTS, SAT/GRE/GMAT as applicable)',
      'Acceptance letter from the US school',
      'Evidence of ties to home country',
    ],
    estimatedTimeline: '3–6 months (from application to arrival)',
    estimatedCost: '$535+ (SEVIS + visa fee, not including tuition)',
  },
];

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/seedImmigration.js <email> <password>');
    process.exit(1);
  }

  console.log('Signing in...');
  await signInWithEmailAndPassword(auth, email, password);
  console.log('Authenticated ✓\n');

  // Check if guides already exist
  const existingGuides = await getDocs(query(collection(db, 'immigrationGuides'), where('hostCountry', '==', 'US')));
  if (existingGuides.size > 0) {
    console.log(`⚠  Found ${existingGuides.size} existing US immigration guides. Skipping guide seeding.`);
  } else {
    console.log('Seeding immigration guides...');
    for (const guide of US_GUIDES) {
      const docRef = await addDoc(collection(db, 'immigrationGuides'), {
        ...guide,
        lastUpdated: Timestamp.now(),
      });
      console.log(`  ✓ ${guide.title} (${docRef.id})`);
    }
    console.log(`\nAdded ${US_GUIDES.length} immigration guides.\n`);
  }

  console.log('Done! 🎉');

  // Clean up Firebase connections to avoid libuv crash on Windows
  await signOut(auth);
  await terminate(db);
  await deleteApp(app);
  setTimeout(() => process.exit(0), 500);
}

main().catch(async (err) => {
  console.error('Error:', err.message);
  try {
    await terminate(db);
    await deleteApp(app);
  } catch { /* ignore cleanup errors */ }
  setTimeout(() => process.exit(1), 500);
});
