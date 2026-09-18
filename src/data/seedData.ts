import { Timestamp } from 'firebase/firestore';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { Business, ImmigrationGuide, Lawyer } from '../types';

const sampleBusinesses: Omit<Business, 'id'>[] = [
  {
    name: 'Mama Africa Kitchen',
    description: 'Authentic West African cuisine featuring jollof rice, egusi soup, suya, and other traditional dishes. Family-owned since 2015.',
    category: 'restaurant',
    countryOfOrigin: 'Nigeria',
    hostCountry: 'US',
    address: '1234 Martin Luther King Jr Ave SE',
    city: 'Washington',
    state: 'DC',
    zipCode: '20020',
    coordinates: { latitude: 38.8587, longitude: -76.9927 },
    phone: '(202) 555-0101',
    website: 'https://mamaafrica.example.com',
    languagesSpoken: ['English', 'Yoruba', 'Igbo'],
    photos: ['https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.7,
    reviewCount: 23,
    isVerified: true,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Abyssinia Market',
    description: 'Ethiopian and Eritrean grocery store with injera, berbere spices, teff flour, and imported goods directly from East Africa.',
    category: 'grocery',
    countryOfOrigin: 'Ethiopia',
    hostCountry: 'US',
    address: '5678 Georgia Ave NW',
    city: 'Washington',
    state: 'DC',
    zipCode: '20011',
    coordinates: { latitude: 38.9572, longitude: -77.0236 },
    phone: '(202) 555-0202',
    languagesSpoken: ['English', 'Amharic', 'Tigrinya'],
    photos: ['https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.5,
    reviewCount: 15,
    isVerified: true,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Fatou Braiding Salon',
    description: 'Professional African hair braiding, cornrows, twists, locs, and weaving. Walk-ins welcome.',
    category: 'beauty',
    countryOfOrigin: 'Senegal',
    hostCountry: 'US',
    address: '910 Silver Spring Ave',
    city: 'Silver Spring',
    state: 'MD',
    zipCode: '20910',
    coordinates: { latitude: 38.9940, longitude: -77.0261 },
    phone: '(301) 555-0303',
    languagesSpoken: ['English', 'French', 'Wolof'],
    photos: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.8,
    reviewCount: 42,
    isVerified: true,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Ankara Fashion House',
    description: 'Custom African fashion, tailoring, and ready-to-wear designs featuring vibrant ankara prints and kente cloth.',
    category: 'fashion',
    countryOfOrigin: 'Ghana',
    hostCountry: 'US',
    address: '2020 University Blvd E',
    city: 'Hyattsville',
    state: 'MD',
    zipCode: '20783',
    coordinates: { latitude: 38.9545, longitude: -76.9429 },
    phone: '(301) 555-0404',
    languagesSpoken: ['English', 'Twi'],
    photos: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.6,
    reviewCount: 18,
    isVerified: false,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Ubuntu Tech Solutions',
    description: 'IT consulting, web development, and tech support for small businesses. Founded by Kenyan engineers.',
    category: 'services',
    countryOfOrigin: 'Kenya',
    hostCountry: 'US',
    address: '3030 Clarendon Blvd',
    city: 'Arlington',
    state: 'VA',
    zipCode: '22201',
    coordinates: { latitude: 38.8867, longitude: -77.0956 },
    phone: '(703) 555-0505',
    website: 'https://ubuntutech.example.com',
    languagesSpoken: ['English', 'Swahili'],
    photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.9,
    reviewCount: 11,
    isVerified: true,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Suya Spot Toronto',
    description: 'West African street food — suya, puff puff, meat pies, and fresh juices. A taste of Lagos in the heart of Toronto.',
    category: 'restaurant',
    countryOfOrigin: 'Nigeria',
    hostCountry: 'CA',
    address: '456 Bloor St W',
    city: 'Toronto',
    state: 'ON',
    zipCode: 'M5S 1X8',
    coordinates: { latitude: 43.6655, longitude: -79.4088 },
    phone: '(416) 555-0606',
    languagesSpoken: ['English', 'Yoruba'],
    photos: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.6,
    reviewCount: 19,
    isVerified: true,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Brixton Jollof House',
    description: 'Award-winning jollof rice, suya grills, and plantain dishes in the heart of Brixton. Catering available.',
    category: 'restaurant',
    countryOfOrigin: 'Ghana',
    hostCountry: 'UK',
    address: '78 Brixton Road',
    city: 'London',
    state: 'Greater London',
    zipCode: 'SW9 6BE',
    coordinates: { latitude: 51.4613, longitude: -0.1156 },
    phone: '+44 20 7555 0707',
    languagesSpoken: ['English', 'Twi', 'French'],
    photos: ['https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.7,
    reviewCount: 31,
    isVerified: true,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Chez Fatou',
    description: 'Cuisine sénégalaise authentique — thieboudienne, yassa poulet, mafé. Ambiance chaleureuse au coeur du 18e.',
    category: 'restaurant',
    countryOfOrigin: 'Senegal',
    hostCountry: 'FR',
    address: '12 Rue Doudeauville',
    city: 'Paris',
    state: 'Île-de-France',
    zipCode: '75018',
    coordinates: { latitude: 48.8886, longitude: 2.3520 },
    phone: '+33 1 55 55 08 08',
    languagesSpoken: ['French', 'Wolof', 'English'],
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.5,
    reviewCount: 27,
    isVerified: true,
    createdAt: Timestamp.now(),
  },
  {
    name: 'Afro-Berlin Market',
    description: 'Afrikanische Lebensmittel, Gewürze, und Kosmetik. Importierte Produkte aus West- und Ostafrika.',
    category: 'grocery',
    countryOfOrigin: 'Cameroon',
    hostCountry: 'DE',
    address: 'Müllerstraße 45',
    city: 'Berlin',
    state: 'Berlin',
    zipCode: '13349',
    coordinates: { latitude: 52.5480, longitude: 13.3590 },
    phone: '+49 30 555 0909',
    languagesSpoken: ['German', 'French', 'English'],
    photos: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'],
    ownerId: 'seed',
    averageRating: 4.4,
    reviewCount: 14,
    isVerified: true,
    createdAt: Timestamp.now(),
  },
];

const sampleGuides: Omit<ImmigrationGuide, 'id'>[] = [
  {
    title: 'Family-Based Green Card: Complete Guide',
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
    category: 'permanent-residence',
    hostCountry: 'CA',
    summary: 'How to apply for Canadian permanent residence through Express Entry, including CRS scores, draws, and the Federal Skilled Worker Program.',
    content: 'Express Entry is Canada\'s primary system for managing applications for permanent residence from skilled workers. It covers three programs: Federal Skilled Worker Program (FSWP), Federal Skilled Trades Program (FSTP), and Canadian Experience Class (CEC).\n\nCandidates create an online profile and are ranked using the Comprehensive Ranking System (CRS). The highest-ranked candidates receive Invitations to Apply (ITAs) in regular draws.',
    steps: [
      'Check eligibility for one of the three Express Entry programs',
      'Get language test results (IELTS or TEF)',
      'Get Educational Credential Assessment (ECA) for foreign degrees',
      'Create an Express Entry profile online',
      'Receive a CRS score and enter the pool of candidates',
      'If invited, submit a complete application within 60 days',
      'Complete medical exam and police clearance',
      'Receive Confirmation of Permanent Residence (COPR)',
    ],
    requiredDocuments: [
      'Language test results (IELTS/CELPIP or TEF/TCF)', 'Educational Credential Assessment (ECA)',
      'Passport', 'Work experience reference letters', 'Police clearance certificates',
      'Medical exam results (IMM 1017)', 'Proof of funds', 'Digital photo',
    ],
    estimatedTimeline: '6-12 months',
    estimatedCost: 'CAD $1,365-$2,500',
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'UK Skilled Worker Visa: Complete Guide',
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

const sampleLawyers: Omit<Lawyer, 'id'>[] = [
  {
    name: 'Adebayo Okonkwo',
    firm: 'Okonkwo Immigration Law',
    specializations: ['greencard', 'visa', 'family'],
    hostCountry: 'US',
    languagesSpoken: ['English', 'Yoruba', 'Igbo'],
    city: 'Washington',
    state: 'DC',
    phone: '(202) 555-1001',
    email: 'aokonkwo@example.com',
    website: 'https://okonkwolaw.example.com',
    averageRating: 4.8,
    reviewCount: 35,
    consultationFee: '$150/hour',
    createdAt: Timestamp.now(),
  },
  {
    name: 'Amina Diallo',
    firm: 'Diallo & Associates',
    specializations: ['asylum', 'citizenship', 'family'],
    hostCountry: 'US',
    languagesSpoken: ['English', 'French', 'Wolof'],
    city: 'Silver Spring',
    state: 'MD',
    phone: '(301) 555-2002',
    email: 'adiallo@example.com',
    averageRating: 4.9,
    reviewCount: 28,
    consultationFee: 'Free initial consultation',
    createdAt: Timestamp.now(),
  },
  {
    name: 'Samuel Mensah',
    firm: 'Mensah Legal Group',
    specializations: ['visa', 'work-permit', 'greencard'],
    hostCountry: 'US',
    languagesSpoken: ['English', 'Twi'],
    city: 'Arlington',
    state: 'VA',
    phone: '(703) 555-3003',
    email: 'smensah@example.com',
    website: 'https://mensahlegal.example.com',
    averageRating: 4.6,
    reviewCount: 19,
    consultationFee: '$200/hour',
    createdAt: Timestamp.now(),
  },
  {
    name: 'Fatima Hassan',
    firm: 'Hassan & Partners Immigration',
    specializations: ['asylum', 'visa', 'family'],
    hostCountry: 'US',
    languagesSpoken: ['English', 'Somali', 'Arabic'],
    city: 'Minneapolis',
    state: 'MN',
    phone: '(612) 555-4004',
    email: 'fhassan@example.com',
    averageRating: 4.7,
    reviewCount: 22,
    consultationFee: '$100/hour',
    createdAt: Timestamp.now(),
  },
  {
    name: 'Chidi Nwosu',
    firm: 'Nwosu Immigration Services',
    specializations: ['permanent-residence', 'work-permit', 'family'],
    hostCountry: 'CA',
    languagesSpoken: ['English', 'Igbo', 'French'],
    city: 'Toronto',
    state: 'ON',
    phone: '(416) 555-5005',
    email: 'cnwosu@example.com',
    averageRating: 4.7,
    reviewCount: 16,
    consultationFee: 'CAD $175/hour',
    createdAt: Timestamp.now(),
  },
  {
    name: 'Abena Asante',
    firm: 'Asante & Co Solicitors',
    specializations: ['indefinite-leave', 'work-permit', 'family'],
    hostCountry: 'UK',
    languagesSpoken: ['English', 'Twi'],
    city: 'London',
    state: 'Greater London',
    phone: '+44 20 7555 6006',
    email: 'aasante@example.com',
    website: 'https://asantesolicitors.example.com',
    averageRating: 4.8,
    reviewCount: 24,
    consultationFee: '\u00A3200/hour',
    createdAt: Timestamp.now(),
  },
  {
    name: 'Moussa Diop',
    firm: 'Cabinet Diop Avocats',
    specializations: ['carte-de-sejour', 'asylum', 'family'],
    hostCountry: 'FR',
    languagesSpoken: ['French', 'Wolof', 'English'],
    city: 'Paris',
    state: '\u00CEle-de-France',
    phone: '+33 1 55 55 7007',
    email: 'mdiop@example.com',
    averageRating: 4.6,
    reviewCount: 20,
    consultationFee: '\u20AC150/hour',
    createdAt: Timestamp.now(),
  },
  {
    name: 'Kwame Boateng',
    firm: 'Boateng Rechtsanwalt',
    specializations: ['aufenthaltstitel', 'work-permit', 'asylum'],
    hostCountry: 'DE',
    languagesSpoken: ['German', 'English', 'Twi'],
    city: 'Berlin',
    state: 'Berlin',
    phone: '+49 30 555 8008',
    email: 'kboateng@example.com',
    averageRating: 4.5,
    reviewCount: 12,
    consultationFee: '\u20AC120/hour',
    createdAt: Timestamp.now(),
  },
];

export async function seedDatabase() {
  const db = getDb();

  // Check if seed businesses already have photos — if so, seeding is complete
  const businessSnap = await getDocs(collection(db, 'businesses'));
  const seedDocs = businessSnap.docs.filter((d) => d.data().ownerId === 'seed');

  if (seedDocs.length > 0) {
    const hasPhotos = seedDocs.some((d) => {
      const photos = d.data().photos;
      return photos && photos.length > 0;
    });
    if (hasPhotos) {
      console.log('Database already seeded with photos, skipping...');
      return;
    }
    // Old seed data without photos — delete and re-seed
    console.log('Replacing old seed data with updated version (with photos)...');
    for (const d of seedDocs) {
      await deleteDoc(doc(db, 'businesses', d.id));
    }
  }

  // Skip if there are non-seed businesses but no seed businesses (user has real data)
  if (businessSnap.size > 0 && seedDocs.length === 0) {
    console.log('Database has user data, skipping seed...');
    return;
  }

  console.log('Seeding database...');

  for (const biz of sampleBusinesses) {
    await addDoc(collection(db, 'businesses'), biz);
  }
  console.log(`Seeded ${sampleBusinesses.length} businesses`);

  // Only seed guides and lawyers if they don't exist yet
  const guideSnap = await getDocs(collection(db, 'immigrationGuides'));
  if (guideSnap.size === 0) {
    for (const guide of sampleGuides) {
      await addDoc(collection(db, 'immigrationGuides'), guide);
    }
    console.log(`Seeded ${sampleGuides.length} immigration guides`);
  }

  const lawyerSnap = await getDocs(collection(db, 'lawyers'));
  if (lawyerSnap.size === 0) {
    for (const lawyer of sampleLawyers) {
      await addDoc(collection(db, 'lawyers'), lawyer);
    }
    console.log(`Seeded ${sampleLawyers.length} lawyers`);
  }

  console.log('Database seeding complete!');
}

export async function migrateExistingData() {
  const db = getDb();
  const collections = ['businesses', 'immigrationGuides', 'lawyers'];
  for (const col of collections) {
    const snapshot = await getDocs(collection(db, col));
    let migrated = 0;
    for (const d of snapshot.docs) {
      if (!d.data().hostCountry) {
        await updateDoc(doc(db, col, d.id), { hostCountry: 'US' });
        migrated++;
      }
    }
    if (migrated > 0) console.log(`Migrated ${migrated} ${col} documents to hostCountry: US`);
  }

  // Update seed businesses that have no photos with placeholder images
  const photoMap: Record<string, string[]> = {};
  for (const biz of sampleBusinesses) {
    if (biz.photos.length > 0) {
      photoMap[biz.name] = biz.photos;
    }
  }
  const bizSnap = await getDocs(collection(db, 'businesses'));
  let photoUpdates = 0;
  for (const d of bizSnap.docs) {
    const data = d.data();
    if ((!data.photos || data.photos.length === 0) && photoMap[data.name]) {
      await updateDoc(doc(db, 'businesses', d.id), { photos: photoMap[data.name] });
      photoUpdates++;
    }
  }
  if (photoUpdates > 0) console.log(`Updated ${photoUpdates} businesses with placeholder photos`);
}
