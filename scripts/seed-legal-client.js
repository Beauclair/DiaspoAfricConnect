/**
 * Seed legalGuides collection using Firebase client SDK with email/password auth.
 * Seeds ALL practice areas with coverage for all host countries (US, CA, UK, FR, DE).
 * Total: 33 guides (8 immigration + 5 each for deportation-defense, family-law,
 * criminal-defense, personal-injury, housing).
 *
 * Usage:
 *   node scripts/seed-legal-client.js <email> <password>
 *
 * Pass --force to delete existing guides and re-seed with the full set.
 */
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, Timestamp } = require('firebase/firestore');

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

const sampleGuides = [
  // ── Immigration (8 guides) ──
  {
    title: 'Family-Based Green Card: Complete Guide',
    legalCategory: 'immigration', category: 'greencard', hostCountry: 'US',
    summary: 'Step-by-step process for obtaining a green card through family sponsorship.',
    content: 'A family-based green card allows US citizens and lawful permanent residents to sponsor certain family members for permanent residence.',
    steps: ['Determine eligibility', 'File Form I-130', 'Wait for approval', 'File Form I-485', 'Biometrics', 'Interview', 'Decision'],
    requiredDocuments: ['Form I-130', 'Form I-485', 'Birth certificates', 'Passport photos', 'Affidavit of Support'],
    estimatedTimeline: '6-24 months', estimatedCost: '$1,225 (I-130) + $1,440 (I-485) = ~$2,665+',
    sources: [
      { label: 'USCIS — Family-Based Green Cards', url: 'https://www.uscis.gov/family/family-of-us-citizens' },
      { label: 'USCIS — Form I-130', url: 'https://www.uscis.gov/i-130' },
      { label: 'USCIS — Form I-485', url: 'https://www.uscis.gov/i-485' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'H-1B Work Visa: What You Need to Know',
    legalCategory: 'immigration', category: 'visa', hostCountry: 'US',
    summary: 'Guide to the H-1B specialty occupation visa.',
    content: 'The H-1B visa allows US employers to temporarily employ foreign workers in specialty occupations.',
    steps: ['Find sponsor employer', 'Register for lottery', 'File LCA', 'File I-129', 'Visa interview', 'Enter US'],
    requiredDocuments: ['Form I-129', 'LCA', 'Educational credentials', 'Resume', 'Employer letter', 'Passport'],
    estimatedTimeline: '3-6 months', estimatedCost: '$2,500-$5,000',
    sources: [
      { label: 'USCIS — H-1B Specialty Occupations', url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations' },
      { label: 'DOL — Labor Condition Application', url: 'https://www.dol.gov/agencies/eta/foreign-labor/wages/lca' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Path to US Citizenship: Naturalization',
    legalCategory: 'immigration', category: 'citizenship', hostCountry: 'US',
    summary: 'Complete guide to becoming a US citizen through naturalization.',
    content: 'Naturalization is the process by which a foreign citizen becomes a US citizen.',
    steps: ['Confirm eligibility', 'File N-400', 'Biometrics', 'Interview', 'English/civics tests', 'Decision', 'Oath of Allegiance'],
    requiredDocuments: ['Form N-400', 'Green card', 'Passport photos', 'Tax returns'],
    estimatedTimeline: '8-14 months', estimatedCost: '$710-$760 (filing fee)',
    sources: [
      { label: 'USCIS — Naturalization', url: 'https://www.uscis.gov/citizenship/learn-about-citizenship/citizenship-and-naturalization' },
      { label: 'USCIS — Form N-400', url: 'https://www.uscis.gov/n-400' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Asylum in the US: Protection for Persecuted Individuals',
    legalCategory: 'immigration', category: 'asylum', hostCountry: 'US',
    summary: 'Understanding the asylum process for individuals fleeing persecution.',
    content: 'Asylum allows individuals who meet the definition of a refugee to remain in the United States.',
    steps: ['File within one year', 'File I-589', 'Biometrics', 'Interview/hearing', 'Evidence', 'Decision', 'Green card after 1 year'],
    requiredDocuments: ['Form I-589', 'Passport', 'Identity documents', 'Evidence of persecution'],
    estimatedTimeline: '6 months - 4+ years', estimatedCost: 'Free',
    sources: [
      { label: 'USCIS — Asylum', url: 'https://www.uscis.gov/humanitarian/refugees-and-asylum/asylum' },
      { label: 'USCIS — Form I-589', url: 'https://www.uscis.gov/i-589' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Express Entry: Permanent Residence in Canada',
    legalCategory: 'immigration', category: 'permanent-residence', hostCountry: 'CA',
    summary: 'How to apply for Canadian permanent residence through Express Entry.',
    content: 'Express Entry is Canada\'s primary system for managing PR applications from skilled workers.',
    steps: ['Check eligibility', 'Language test', 'ECA', 'Create profile', 'CRS score', 'Submit if invited', 'Medical/police', 'COPR'],
    requiredDocuments: ['Language test', 'ECA', 'Passport', 'Work experience proof', 'Proof of funds'],
    estimatedTimeline: '6-12 months', estimatedCost: 'CAD $1,365 (PR processing) + additional costs',
    sources: [
      { label: 'IRCC — Express Entry', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html' },
      { label: 'IRCC — Comprehensive Ranking System', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'UK Skilled Worker Visa: Complete Guide',
    legalCategory: 'immigration', category: 'work-permit', hostCountry: 'UK',
    summary: 'How to obtain a Skilled Worker visa to work in the UK.',
    content: 'The Skilled Worker visa allows you to work in the UK with an approved employer.',
    steps: ['Get job offer with sponsor', 'Get CoS', 'Prove English', 'Apply online', 'Biometrics', 'Visa centre', 'BRP'],
    requiredDocuments: ['CoS', 'Passport', 'English proof', 'Bank statements', 'Criminal record cert'],
    estimatedTimeline: '3-8 weeks', estimatedCost: '£719-£1,639 + £1,035/year IHS',
    sources: [
      { label: 'UK Gov — Skilled Worker Visa', url: 'https://www.gov.uk/skilled-worker-visa' },
      { label: 'UK Gov — Immigration Health Surcharge', url: 'https://www.gov.uk/healthcare-immigration-application' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Titre de Séjour: Residence Permit in France',
    legalCategory: 'immigration', category: 'carte-de-sejour', hostCountry: 'FR',
    summary: 'Guide to obtaining a titre de séjour (residence permit) in France.',
    content: 'A titre de séjour is required for non-EU nationals staying in France for more than 3 months.',
    steps: ['Enter on long-stay visa', 'Validate with OFII', 'Gather documents', 'Book préfecture', 'Submit', 'Interview/medical', 'Collect card'],
    requiredDocuments: ['Passport with visa', 'OFII attestation', 'Proof of address', 'Photos', 'Employment contract'],
    estimatedTimeline: '2-6 months', estimatedCost: '€225-€269',
    sources: [
      { label: 'Service-Public.fr — Carte de séjour', url: 'https://www.service-public.fr/particuliers/vosdroits/N110' },
      { label: 'OFII — Accueil des étrangers', url: 'https://www.ofii.fr' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'EU Blue Card: Working in Germany',
    legalCategory: 'immigration', category: 'aufenthaltstitel', hostCountry: 'DE',
    summary: 'How to obtain an EU Blue Card for qualified employment in Germany.',
    content: 'The EU Blue Card is for highly qualified non-EU nationals with a degree and qualifying job offer.',
    steps: ['Get recognized degree', 'Secure job offer', 'Apply for visa', 'Register address', 'Apply at Ausländerbehörde', 'Documents/biometrics', 'Receive card'],
    requiredDocuments: ['Degree', 'Employment contract', 'Passport', 'Photos', 'Proof of address', 'Health insurance'],
    estimatedTimeline: '4-12 weeks', estimatedCost: '€100-€140',
    sources: [
      { label: 'BAMF — EU Blue Card', url: 'https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwijkandererAufenthalt/Arbeit/BlaueKarteEU/blaue-karte-eu-node.html' },
      { label: 'Make it in Germany — Blue Card', url: 'https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card' },
    ],
    lastUpdated: Timestamp.now(),
  },
  // ── Deportation Defense (5 guides) ──
  {
    title: 'Fighting a Removal Order in the US',
    legalCategory: 'deportation-defense', category: 'removal-defense', hostCountry: 'US',
    summary: 'Know your rights and defense options when facing deportation or removal proceedings.',
    content: 'Receiving a Notice to Appear (NTA) does not mean you will automatically be deported. Relief options include cancellation of removal, asylum, and CAT protection. An experienced attorney can identify the best strategy.',
    steps: ['Contact attorney immediately', 'Gather all immigration documents', 'Attend master calendar hearing', 'Identify available relief', 'Prepare evidence', 'Attend merits hearing', 'Appeal to BIA if denied'],
    requiredDocuments: ['Notice to Appear', 'Immigration documents', 'Evidence of US ties', 'Tax returns', 'Community letters', 'Country condition reports'],
    estimatedTimeline: '6 months - 3+ years', estimatedCost: '$5,000-$15,000',
    sources: [
      { label: 'DOJ — EOIR Immigration Courts', url: 'https://www.justice.gov/eoir' },
      { label: 'USCIS — Removal Proceedings', url: 'https://www.uscis.gov/laws-and-policy/other-resources/questions-and-answers/questions-and-answers-removal-proceedings' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Deportation Defence in the UK: Your Rights',
    legalCategory: 'deportation-defense', category: 'removal-appeal', hostCountry: 'UK',
    summary: 'Understanding your rights when facing deportation from the UK, including appeals and legal aid.',
    content: 'If the Home Office issues a deportation order, you may appeal to the First-tier Tribunal. Grounds include human rights claims under Article 8 (right to family life). Legal aid may be available for asylum and human rights appeals.',
    steps: ['Seek legal advice immediately', 'Lodge appeal within 14 days', 'Apply for legal aid', 'Gather evidence of UK ties', 'Attend tribunal hearing', 'Consider Upper Tribunal appeal'],
    requiredDocuments: ['Home Office decision letter', 'BRP or passport', 'Evidence of family life', 'Support letters', 'Country condition evidence', 'Legal aid forms'],
    estimatedTimeline: '3-18 months', estimatedCost: '£0 (legal aid) - £10,000+',
    sources: [
      { label: 'UK Gov — Deportation', url: 'https://www.gov.uk/government/publications/deportation' },
      { label: 'HM Courts — Immigration and Asylum Tribunal', url: 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-immigration-and-asylum' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Removal Defence in Canada: Know Your Rights',
    legalCategory: 'deportation-defense', category: 'removal-hearing', hostCountry: 'CA',
    summary: 'Your rights when facing a removal order in Canada, including IRB hearings and available remedies.',
    content: 'A removal order does not mean immediate deportation. You may be eligible for a PRRA, H&C consideration, or a stay of removal through the Federal Court. Legal aid is available in most provinces.',
    steps: ['Contact immigration lawyer or Legal Aid', 'Attend all IRB hearings', 'Determine if IAD appeal is possible', 'Apply for PRRA if you face danger', 'Consider H&C application', 'Seek stay of removal if imminent', 'Gather evidence of establishment'],
    requiredDocuments: ['Removal order', 'Immigration documents', 'Evidence of establishment in Canada', 'Country condition reports', 'Support letters', 'Medical reports', 'Legal aid forms'],
    estimatedTimeline: '3 months - 2+ years', estimatedCost: '$0 (legal aid) - CAD $10,000+',
    sources: [
      { label: 'IRB — Immigration Division', url: 'https://irb.gc.ca/en/immigration-division/Pages/index.aspx' },
      { label: 'IRCC — Pre-Removal Risk Assessment', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/claim-protection-inside-canada/after-application/refusal/pre-removal-risk-assessment.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Contester une OQTF en France : Vos Droits',
    legalCategory: 'deportation-defense', category: 'oqtf-recours', hostCountry: 'FR',
    summary: 'Comment contester une OQTF et connaître vos droits face à une mesure d\'éloignement.',
    content: 'Une OQTF peut être contestée devant le tribunal administratif. Les délais sont courts (48h sans délai, 30 jours avec délai). L\'aide juridictionnelle est disponible. Des liens familiaux ou des risques au retour sont des motifs de contestation.',
    steps: ['Contactez un avocat spécialisé immédiatement', 'Déposez un recours au tribunal administratif', 'Demandez l\'aide juridictionnelle', 'Rassemblez preuves de liens avec la France', 'Préparez preuves des risques au retour', 'Assistez à l\'audience', 'Évaluez l\'appel si rejeté'],
    requiredDocuments: ['Décision d\'OQTF', 'Passeport', 'Justificatifs de résidence', 'Preuves de liens familiaux', 'Attestations scolaires des enfants', 'Bulletins de salaire', 'Certificats médicaux'],
    estimatedTimeline: '2 semaines - 12 mois', estimatedCost: '€0 (aide juridictionnelle) - €3,000+',
    sources: [
      { label: 'Service-Public.fr — OQTF', url: 'https://www.service-public.fr/particuliers/vosdroits/F18362' },
      { label: 'Légifrance — CESEDA art. L611-1', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042776356' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Abschiebungsschutz in Deutschland: Ihre Rechte',
    legalCategory: 'deportation-defense', category: 'duldung', hostCountry: 'DE',
    summary: 'Rechte und Schutzmöglichkeiten bei drohender Abschiebung, einschließlich Duldung und Abschiebungsverbote.',
    content: 'Eine Duldung kann erteilt werden, wenn die Abschiebung rechtlich oder tatsächlich unmöglich ist. Abschiebungsverbote nach § 60 AufenthG schützen bei Gefahr für Leib und Leben. Nach langjähriger Duldung ist eine Aufenthaltserlaubnis nach § 25a/25b AufenthG möglich.',
    steps: ['Fachanwalt oder Beratungsstelle kontaktieren', 'Duldung beantragen', 'Abschiebungsverbot prüfen', 'Integrationsbeweise sammeln', 'Widerspruch beim Verwaltungsgericht einlegen', 'Eilantrag stellen wenn nötig', 'Aufenthaltserlaubnis nach § 25a/25b prüfen'],
    requiredDocuments: ['Abschiebungsandrohung', 'Reisepass', 'Duldungsbescheinigung', 'Meldebescheinigung', 'Integrationsnachweise', 'Ärztliche Atteste', 'Länderinformationen'],
    estimatedTimeline: '1-24 Monate', estimatedCost: '€0 (Prozesskostenhilfe) - €5,000+',
    sources: [
      { label: 'BAMF — Aufenthaltsrecht', url: 'https://www.bamf.de/DE/Themen/MigrationAufenthalt/migrationaufenthalt-node.html' },
      { label: 'Gesetze im Internet — § 60 AufenthG', url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__60.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  // ── Family Law (5 guides) ──
  {
    title: 'Divorce in the US: A Guide for Immigrants',
    legalCategory: 'family-law', category: 'divorce', hostCountry: 'US',
    summary: 'Navigating divorce as an immigrant, including custody, support, and immigration status impacts.',
    content: 'Divorce generally does not cause you to lose your permanent residence if you already have a 10-year green card. If you have a conditional green card, file an I-751 waiver. Survivors of domestic violence may qualify for VAWA protections.',
    steps: ['Consult family law attorney', 'Determine residency requirements', 'File divorce petition', 'Address custody and property', 'File I-751 waiver if needed', 'Attend mediation', 'Obtain divorce decree'],
    requiredDocuments: ['Marriage certificate', 'ID/green card', 'Financial disclosures', 'Property documents', 'Children birth certificates', 'DV evidence if applicable'],
    estimatedTimeline: '3-18 months', estimatedCost: '$1,500-$10,000+',
    sources: [
      { label: 'USCIS — Form I-751 Waiver', url: 'https://www.uscis.gov/i-751' },
      { label: 'USCIS — VAWA', url: 'https://www.uscis.gov/humanitarian/battered-spouse-children-and-parents' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Divorce et Garde d\'Enfants en France',
    legalCategory: 'family-law', category: 'custody', hostCountry: 'FR',
    summary: 'Guide pour le divorce et la garde d\'enfants en France en tant que ressortissant étranger.',
    content: 'En France, le divorce peut être par consentement mutuel ou contentieux. La garde est généralement partagée. Les décisions françaises peuvent ne pas être reconnues dans votre pays d\'origine.',
    steps: ['Consulter un avocat', 'Choisir le type de divorce', 'Déposer la requête', 'Audience de conciliation', 'Négocier garde et pension', 'Obtenir le jugement', 'Mettre à jour titre de séjour'],
    requiredDocuments: ['Acte de mariage', 'Livret de famille', 'Pièce d\'identité', 'Justificatif de domicile', 'Bulletins de salaire', 'Avis d\'imposition'],
    estimatedTimeline: '2-12 mois', estimatedCost: '€1,500-€5,000+',
    sources: [
      { label: 'Service-Public.fr — Divorce', url: 'https://www.service-public.fr/particuliers/vosdroits/N159' },
      { label: 'Service-Public.fr — Autorité parentale', url: 'https://www.service-public.fr/particuliers/vosdroits/N18775' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Family Law for Immigrants in Canada: Divorce and Custody',
    legalCategory: 'family-law', category: 'divorce-custody', hostCountry: 'CA',
    summary: 'Navigating divorce, custody, and support in Canada as an immigrant, including sponsorship breakdown.',
    content: 'Family law is provincial in Canada. A divorce does not revoke your PR status if already granted. Sponsored spouses who separate may retain PR. Courts prioritize the best interests of the child for custody decisions.',
    steps: ['Consult family lawyer', 'Check residency requirements', 'File for divorce', 'Address custody and support', 'Consult immigration lawyer if sponsored', 'Attend mediation if required', 'Obtain divorce order'],
    requiredDocuments: ['Marriage certificate', 'PR card or immigration documents', 'Financial disclosure', 'Children birth certificates', 'Parenting plan', 'Property documents', 'Sponsorship breakdown declaration'],
    estimatedTimeline: '4-18 months', estimatedCost: 'CAD $2,000-$15,000+',
    sources: [
      { label: 'Justice Canada — Family Law', url: 'https://www.justice.gc.ca/eng/fl-df/index.html' },
      { label: 'IRCC — Sponsorship Breakdown', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Divorce and Custody for Immigrants in the UK',
    legalCategory: 'family-law', category: 'divorce-uk', hostCountry: 'UK',
    summary: 'Guide to divorce, child arrangements, and financial settlements in England and Wales for immigrants.',
    content: 'No-fault divorce is now available in England and Wales. A divorce may affect spouse visa holders. Domestic violence provisions allow staying if the relationship breaks down. Legal aid is available for domestic abuse cases.',
    steps: ['Seek advice from family solicitor', 'Apply for divorce online (gov.uk)', 'Address child arrangements', 'Negotiate financial settlement', 'Consult immigration solicitor if on spouse visa', 'Apply for legal aid if domestic abuse', 'Obtain final order'],
    requiredDocuments: ['Marriage certificate', 'Passport and BRP', 'Form E financial disclosure', 'Children birth certificates', 'DV evidence if applicable', 'Tenancy/mortgage documents', 'Bank statements'],
    estimatedTimeline: '6-18 months', estimatedCost: '£593 + £1,000-£10,000+',
    sources: [
      { label: 'UK Gov — Get a Divorce', url: 'https://www.gov.uk/divorce' },
      { label: 'UK Gov — Child Arrangements', url: 'https://www.gov.uk/looking-after-children-divorce' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Scheidung und Sorgerecht in Deutschland für Ausländer',
    legalCategory: 'family-law', category: 'scheidung', hostCountry: 'DE',
    summary: 'Scheidung, Sorgerecht und Unterhalt in Deutschland für ausländische Staatsangehörige.',
    content: 'Ein Trennungsjahr ist erforderlich. Der Aufenthaltsstatus kann betroffen sein — eigenständiges Aufenthaltsrecht nach 3 Jahren Ehe oder bei Härtefall. Sorgerecht wird grundsätzlich gemeinsam ausgeübt. Verfahrenskostenhilfe ist verfügbar.',
    steps: ['Fachanwalt für Familienrecht konsultieren', 'Trennungsjahr einhalten', 'Verfahrenskostenhilfe beantragen', 'Scheidungsantrag einreichen', 'Sorgerecht und Unterhalt klären', 'Aufenthaltsstatus prüfen', 'Scheidungstermin wahrnehmen'],
    requiredDocuments: ['Heiratsurkunde', 'Aufenthaltstitel/Reisepass', 'Meldebescheinigung', 'Einkommensnachweise', 'Geburtsurkunden der Kinder', 'Vermögensaufstellung', 'DV-Nachweise wenn zutreffend'],
    estimatedTimeline: '12-24 Monate', estimatedCost: '€0 (Verfahrenskostenhilfe) - €5,000+',
    sources: [
      { label: 'BMJV — Familienrecht', url: 'https://www.bmj.de/DE/themen/familie_und_partnerschaft/familienrecht/familienrecht_node.html' },
      { label: 'Gesetze im Internet — § 31 AufenthG', url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__31.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  // ── Criminal Defense (5 guides) ──
  {
    title: 'DUI/DWI Defense: What Immigrants Need to Know',
    legalCategory: 'criminal-defense', category: 'dui', hostCountry: 'US',
    summary: 'Understanding DUI charges and their immigration consequences for non-citizens.',
    content: 'A simple first-offense DUI is generally not deportable, but aggravating factors can trigger removal. For those with pending immigration applications, a DUI conviction can affect renewals and naturalization. Hire a "crimmigration" attorney.',
    steps: ['Exercise right to remain silent', 'Contact criminal defense attorney', 'Attend all court hearings', 'Discuss plea options carefully', 'Complete DUI programs', 'Notify immigration attorney', 'Keep all case records'],
    requiredDocuments: ['Arrest report', 'Bail documents', 'Immigration documents', 'Driver\'s licence', 'Chemical test results', 'Court notices', 'Character references'],
    estimatedTimeline: '2-12 months', estimatedCost: '$3,000-$15,000',
    sources: [
      { label: 'USCIS — Effect of Criminal Convictions', url: 'https://www.uscis.gov/policy-manual/volume-12-part-f-chapter-5' },
      { label: 'NHTSA — Impaired Driving', url: 'https://www.nhtsa.gov/risky-driving/drunk-driving' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Strafverteidigung in Deutschland: Rechte für Ausländer',
    legalCategory: 'criminal-defense', category: 'assault-defense', hostCountry: 'DE',
    summary: 'Ihre Rechte bei Strafanschuldigungen in Deutschland als ausländischer Staatsangehöriger.',
    content: 'Sie haben die gleichen Verteidigungsrechte wie deutsche Staatsbürger. Eine Verurteilung kann jedoch Folgen für Ihren Aufenthaltstitel haben. Bei Freiheitsstrafen über 3 Jahre droht Ausweisung.',
    steps: ['Schweigen Sie gegenüber der Polizei', 'Verlangen Sie einen Anwalt und Dolmetscher', 'Fachanwalt beauftragen', 'Aufenthaltsstatus besprechen', 'Gerichtstermine wahrnehmen', 'Verteidigungsstrategie entwickeln', 'Ausländerbehörde informieren'],
    requiredDocuments: ['Anklageschrift', 'Aufenthaltstitel/Reisepass', 'Meldebescheinigung', 'Arbeitsvertrag', 'Polizeiliche Unterlagen', 'Charakterreferenzen', 'Integrationsnachweise'],
    estimatedTimeline: '2-18 Monate', estimatedCost: '€2,000-€15,000+',
    sources: [
      { label: 'BMJV — Strafrecht', url: 'https://www.bmj.de/DE/themen/strafrecht/strafrecht_node.html' },
      { label: 'Gesetze im Internet — § 53 AufenthG', url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__53.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Criminal Charges in Canada: A Guide for Immigrants',
    legalCategory: 'criminal-defense', category: 'criminal-charges', hostCountry: 'CA',
    summary: 'Criminal charges and their immigration consequences for non-citizens in Canada.',
    content: 'A conviction for a serious offence can make you inadmissible under IRPA, leading to removal even with PR. Serious criminality (10+ year max sentence or 6+ month actual sentence) removes IAD appeal rights. Seek a lawyer who understands immigration consequences.',
    steps: ['Exercise right to silence', 'Contact criminal defence lawyer', 'Apply for legal aid', 'Discuss immigration consequences', 'Attend all court appearances', 'Consult immigration lawyer if convicted', 'Keep all court documents'],
    requiredDocuments: ['Charge documents', 'Release conditions', 'Immigration documents', 'Criminal record check', 'Employment records', 'Character references', 'Legal aid application'],
    estimatedTimeline: '2-18 months', estimatedCost: '$0 (legal aid) - CAD $15,000+',
    sources: [
      { label: 'Justice Canada — Criminal Law', url: 'https://www.justice.gc.ca/eng/cj-jp/index.html' },
      { label: 'IRCC — Criminal Inadmissibility', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/inadmissibility/overcome-criminal-convictions.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Criminal Defence for Immigrants in the UK',
    legalCategory: 'criminal-defense', category: 'criminal-defence-uk', hostCountry: 'UK',
    summary: 'Criminal charges and immigration consequences in England and Wales, including automatic deportation rules.',
    content: 'Foreign nationals sentenced to 12+ months face automatic deportation under the UK Borders Act 2007. Even shorter sentences can trigger deportation. Legal aid is available at police stations and courts. A caution or guilty plea can affect future immigration applications.',
    steps: ['Request duty solicitor at police station', 'Request interpreter if needed', 'Do not discuss immigration status with police', 'Apply for legal aid', 'Discuss immigration consequences of plea', 'Attend all hearings', 'Seek immigration advice if convicted'],
    requiredDocuments: ['Charge sheet', 'Bail conditions', 'BRP or passport', 'Visa documents', 'Employment records', 'Character references', 'Legal aid form'],
    estimatedTimeline: '1-18 months', estimatedCost: '£0 (legal aid) - £10,000+',
    sources: [
      { label: 'UK Gov — UK Borders Act 2007', url: 'https://www.legislation.gov.uk/ukpga/2007/30/section/32' },
      { label: 'UK Gov — Legal Aid', url: 'https://www.gov.uk/legal-aid' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Défense Pénale en France pour les Étrangers',
    legalCategory: 'criminal-defense', category: 'defense-penale', hostCountry: 'FR',
    summary: 'Vos droits face à des poursuites pénales en France et les conséquences sur votre titre de séjour.',
    content: 'Vous avez droit à un avocat dès la garde à vue et à un interprète. Une condamnation peut entraîner le refus de renouvellement du titre de séjour, une OQTF, ou une ITF. L\'aide juridictionnelle est disponible pour tous, même en situation irrégulière.',
    steps: ['Demandez un avocat et un interprète en garde à vue', 'Ne déclarez rien sur votre statut migratoire', 'Demandez l\'aide juridictionnelle', 'Discutez des conséquences sur le titre de séjour', 'Assistez à toutes les audiences', 'Évaluez les conséquences si condamné', 'Faites appel dans les 10 jours si nécessaire'],
    requiredDocuments: ['PV de garde à vue', 'Titre de séjour/passeport', 'Justificatif de domicile', 'Bulletins de salaire', 'Attestations de bonne conduite', 'Casier judiciaire', 'Dossier aide juridictionnelle'],
    estimatedTimeline: '1-18 mois', estimatedCost: '€0 (aide juridictionnelle) - €10,000+',
    sources: [
      { label: 'Service-Public.fr — Garde à vue', url: 'https://www.service-public.fr/particuliers/vosdroits/F14837' },
      { label: 'Légifrance — Code de procédure pénale', url: 'https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006071154/' },
    ],
    lastUpdated: Timestamp.now(),
  },
  // ── Personal Injury (5 guides) ──
  {
    title: 'Car Accident Claims: A Guide for Immigrants in the US',
    legalCategory: 'personal-injury', category: 'car-accident', hostCountry: 'US',
    summary: 'How to pursue compensation after a car accident, regardless of immigration status.',
    content: 'You have the right to seek compensation regardless of immigration status. An experienced personal injury attorney works on contingency (no upfront cost) and handles insurance negotiations.',
    steps: ['Call 911 and seek medical attention', 'Document the scene', 'Exchange info with other driver', 'File police report', 'Contact personal injury attorney', 'Follow treatment plans', 'Attorney negotiates settlement or sues'],
    requiredDocuments: ['Police report', 'Medical records/bills', 'Accident photos', 'Insurance info', 'Proof of lost income', 'Witness statements', 'Repair estimates'],
    estimatedTimeline: '3-18 months', estimatedCost: 'Free (contingency fee)',
    sources: [
      { label: 'NHTSA — Traffic Safety', url: 'https://www.nhtsa.gov/road-safety' },
      { label: 'ABA — Personal Injury', url: 'https://www.americanbar.org/groups/public_education/resources/law_issues_for_consumers/injury/' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Workplace Injury Claims in Canada',
    legalCategory: 'personal-injury', category: 'workplace-injury', hostCountry: 'CA',
    summary: 'Understanding your rights after a workplace injury in Canada, including WSIB claims.',
    content: 'All workers in Canada are protected regardless of immigration status. Workers\' compensation covers medical treatment, wage replacement, and rehabilitation. If your employer refuses to report the injury, seek legal help.',
    steps: ['Report injury to employer', 'Seek medical attention', 'File WSIB claim (Form 6)', 'Keep all records', 'Follow treatment plan', 'Contact lawyer if denied', 'Return to work when cleared'],
    requiredDocuments: ['Worker incident report', 'Medical reports', 'Employer accident report', 'Pay stubs', 'Injury photos', 'Witness statements', 'SIN and immigration documents'],
    estimatedTimeline: '1-12 months', estimatedCost: 'Free (workers comp) or contingency',
    sources: [
      { label: 'WSIB Ontario', url: 'https://www.wsib.ca/en' },
      { label: 'CCOHS — Workers\' Rights', url: 'https://www.ccohs.ca/oshanswers/legisl/rights.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Personal Injury Claims in the UK: A Guide for Immigrants',
    legalCategory: 'personal-injury', category: 'personal-injury-uk', hostCountry: 'UK',
    summary: 'How to pursue a personal injury claim in the UK, including no-win-no-fee solicitors.',
    content: 'You can claim compensation regardless of immigration status. The UK has no-win-no-fee (Conditional Fee Agreements). Employers must ensure workplace safety. You have 3 years from injury to start a claim.',
    steps: ['Seek medical attention and document injuries', 'Report the incident', 'Gather evidence (photos, witnesses, CCTV)', 'Contact personal injury solicitor', 'Solicitor sends letter of claim', 'Attend medical examination', 'Negotiate settlement or go to court'],
    requiredDocuments: ['Medical records', 'Accident report', 'Injury photos', 'Witness details', 'Payslips for lost earnings', 'Expense receipts', 'Other party insurance details'],
    estimatedTimeline: '6-18 months', estimatedCost: '£0 (no win, no fee)',
    sources: [
      { label: 'UK Gov — Make a Court Claim for Money', url: 'https://www.gov.uk/make-court-claim-for-money' },
      { label: 'HSE — Health and Safety at Work Act', url: 'https://www.hse.gov.uk/legislation/hswa.htm' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Accident et Préjudice Corporel en France : Vos Droits',
    legalCategory: 'personal-injury', category: 'prejudice-corporel', hostCountry: 'FR',
    summary: 'Comment obtenir une indemnisation après un accident en France, accidents de la route ou du travail.',
    content: 'Droit à indemnisation intégrale quelle que soit votre nationalité. La loi Badinter protège les victimes d\'accidents de la route. Pour les accidents du travail, la Sécurité sociale couvre les frais. Les avocats peuvent travailler en honoraires de résultat.',
    steps: ['Faites constater vos blessures', 'Déclarez l\'accident', 'Conservez tous justificatifs', 'Consultez un avocat spécialisé', 'Engagez la procédure d\'indemnisation', 'Assistez à l\'expertise médicale', 'Négociez ou portez l\'affaire au tribunal'],
    requiredDocuments: ['Certificat médical initial', 'PV de police/rapport d\'accident', 'Arrêts de travail', 'Factures médicales', 'Photos des blessures', 'Témoignages', 'Attestation d\'assurance'],
    estimatedTimeline: '6-24 mois', estimatedCost: '€0 (honoraires de résultat)',
    sources: [
      { label: 'Légifrance — Loi Badinter', url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000693454/' },
      { label: 'Ameli.fr — Accident du travail', url: 'https://www.ameli.fr/assure/droits-demarches/maladie-accident-hospitalisation/accident/accident-travail' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Personenschäden in Deutschland: Rechte für Ausländer nach Unfällen',
    legalCategory: 'personal-injury', category: 'personenschaden', hostCountry: 'DE',
    summary: 'Ihre Rechte nach einem Unfall in Deutschland, einschließlich Schadensersatz und Schmerzensgeld.',
    content: 'Alle Unfallopfer haben Anspruch auf Schadensersatz und Schmerzensgeld, unabhängig von der Staatsangehörigkeit. Bei Verkehrsunfällen haftet die Kfz-Haftpflichtversicherung. Bei Arbeitsunfällen greift die Berufsgenossenschaft.',
    steps: ['Rettungsdienst rufen (112)', 'Unfall melden', 'Beweise sichern', 'Zum D-Arzt bei Arbeitsunfällen', 'Fachanwalt beauftragen', 'Schadensersatz fordern', 'Ggf. Klage erheben'],
    requiredDocuments: ['Unfallbericht', 'Ärztliche Befunde', 'Fotos', 'Gehaltsabrechnungen', 'Versicherungsdaten', 'Zeugenaussagen', 'Aufenthaltstitel'],
    estimatedTimeline: '3-24 Monate', estimatedCost: '€0 (Prozesskostenhilfe) - €5,000+',
    sources: [
      { label: 'DGUV — Berufsgenossenschaft', url: 'https://www.dguv.de/en/index.jsp' },
      { label: 'ADAC — Verkehrsunfall', url: 'https://www.adac.de/verkehr/recht/verkehrsunfall/' },
    ],
    lastUpdated: Timestamp.now(),
  },
  // ── Housing (5 guides) ──
  {
    title: 'Eviction Defense: Know Your Tenant Rights in the US',
    legalCategory: 'housing', category: 'eviction-defense', hostCountry: 'US',
    summary: 'Understanding your rights as a tenant facing eviction, regardless of immigration status.',
    content: 'All tenants have protections against illegal eviction. A landlord cannot change locks or shut off utilities without a court order. Defenses include habitability issues, retaliation, and discrimination under the Fair Housing Act.',
    steps: ['Read eviction notice carefully', 'Do not move out immediately', 'Contact legal aid', 'Gather evidence (lease, receipts, photos)', 'Attend court hearing', 'Present defenses', 'Explore appeal options if needed'],
    requiredDocuments: ['Lease agreement', 'Eviction notice', 'Rent receipts', 'Property condition photos', 'Landlord communications', 'Code enforcement records', 'Income documents'],
    estimatedTimeline: '2 weeks - 3 months', estimatedCost: '$0 (legal aid) - $3,000+',
    sources: [
      { label: 'HUD — Tenant Rights', url: 'https://www.hud.gov/topics/rental_assistance/tenantrights' },
      { label: 'DOJ — Fair Housing Act', url: 'https://www.justice.gov/crt/fair-housing-act-1' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Tenant Rights and Housing Disputes in the UK',
    legalCategory: 'housing', category: 'tenant-rights', hostCountry: 'UK',
    summary: 'A guide for UK tenants facing housing issues including disrepair, eviction, and deposit disputes.',
    content: 'UK tenants have strong protections. Landlords must follow strict eviction procedures with court orders. Section 21 no-fault evictions are being phased out. Free advice is available from Shelter and Citizens Advice.',
    steps: ['Document the issue', 'Report to landlord in writing', 'Contact council environmental health', 'Seek advice from Shelter/Citizens Advice', 'Check eviction notice validity', 'Apply to council if facing homelessness', 'Attend court hearing with legal aid'],
    requiredDocuments: ['Tenancy agreement', 'Eviction notice', 'Deposit protection cert', 'Disrepair photos/videos', 'Landlord correspondence', 'Gas safety cert', 'Immigration documents'],
    estimatedTimeline: '2 weeks - 6 months', estimatedCost: '£0 (legal aid) - £5,000+',
    sources: [
      { label: 'Shelter England', url: 'https://england.shelter.org.uk/housing_advice' },
      { label: 'UK Gov — Private Renting', url: 'https://www.gov.uk/private-renting' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Tenant Rights in Canada: A Guide for Immigrants',
    legalCategory: 'housing', category: 'tenant-rights-ca', hostCountry: 'CA',
    summary: 'Your tenant rights in Canada, including protections against unfair eviction and housing discrimination.',
    content: 'All tenants are protected regardless of immigration status. Each province has its own tenancy laws and tribunal. Landlords cannot evict without proper notice and a tribunal order. Discrimination based on race or immigration status is illegal.',
    steps: ['Know your provincial tenancy laws', 'Keep lease and rent receipts', 'Check eviction notice validity', 'Contact provincial tenant board', 'Seek help from community legal clinic', 'Attend tribunal hearing', 'File human rights complaint if discriminated'],
    requiredDocuments: ['Lease agreement', 'Eviction notice', 'Rent receipts', 'Property condition photos', 'Landlord communications', 'Income documents', 'Immigration documents'],
    estimatedTimeline: '2 weeks - 6 months', estimatedCost: '$0 (legal clinics) - CAD $2,000+',
    sources: [
      { label: 'Ontario LTB', url: 'https://tribunalsontario.ca/ltb/' },
      { label: 'Justice Canada — Tenant Rights', url: 'https://www.justice.gc.ca/eng/fl-df/index.html' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Droits des Locataires en France : Guide pour les Étrangers',
    legalCategory: 'housing', category: 'droits-locataires', hostCountry: 'FR',
    summary: 'Vos droits en tant que locataire en France, protections contre l\'expulsion et logements insalubres.',
    content: 'Protection forte grâce à la loi de 1989. Le bailleur doit donner 6 mois de préavis. La trêve hivernale interdit toute expulsion du 1er novembre au 31 mars. L\'ADIL offre des conseils gratuits. L\'aide juridictionnelle est disponible.',
    steps: ['Conservez bail et quittances', 'Vérifiez la validité du congé du bailleur', 'Contactez l\'ADIL', 'Signalez l\'insalubrité à la mairie', 'Envoyez mise en demeure au propriétaire', 'Saisissez la commission de conciliation', 'Portez l\'affaire au tribunal si nécessaire'],
    requiredDocuments: ['Bail de location', 'Quittances de loyer', 'État des lieux', 'Photos des problèmes', 'Correspondances', 'Congé du bailleur', 'Pièce d\'identité'],
    estimatedTimeline: '2 semaines - 12 mois', estimatedCost: '€0 (ADIL/aide juridictionnelle) - €3,000+',
    sources: [
      { label: 'Service-Public.fr — Logement', url: 'https://www.service-public.fr/particuliers/vosdroits/N19808' },
      { label: 'ADIL — Information logement', url: 'https://www.anil.org/lanil-et-les-adil/' },
    ],
    lastUpdated: Timestamp.now(),
  },
  {
    title: 'Mietrecht in Deutschland: Rechte für ausländische Mieter',
    legalCategory: 'housing', category: 'mietrecht', hostCountry: 'DE',
    summary: 'Ihre Rechte als Mieter in Deutschland, Kündigungsschutz, Mietpreisbremse und Mängelbeseitigung.',
    content: 'Starker Mieterschutz unabhängig von der Staatsangehörigkeit. Kündigungsfrist mindestens 3 Monate. Mietpreisbremse in vielen Städten. Recht auf Mängelbeseitigung. Mietervereine bieten günstige Rechtsberatung. Antidiskriminierungsstelle hilft bei Diskriminierung.',
    steps: ['Mietvertrag prüfen', 'Mängel schriftlich melden', 'Frist zur Beseitigung setzen', 'Kündigung auf Gültigkeit prüfen', 'Widerspruch bei Härte einlegen', 'Mieterverein kontaktieren', 'Ggf. vor Amtsgericht klagen'],
    requiredDocuments: ['Mietvertrag', 'Kündigungsschreiben', 'Mietquittungen', 'Mängel-Fotos', 'Schriftverkehr', 'Übergabeprotokoll', 'Einkommensnachweise'],
    estimatedTimeline: '2 Wochen - 12 Monate', estimatedCost: '€0 (Prozesskostenhilfe) - €3,000+',
    sources: [
      { label: 'BMJ — Mietrecht', url: 'https://www.bmj.de/DE/themen/bauen_wohnen/mietrecht/mietrecht_node.html' },
      { label: 'Deutscher Mieterbund', url: 'https://www.mieterbund.de/' },
    ],
    lastUpdated: Timestamp.now(),
  },
];

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const force = process.argv.includes('--force');

  if (!email || !password) {
    console.error('Usage: node scripts/seed-legal-client.js <email> <password> [--force]');
    process.exit(1);
  }

  console.log('Signing in...');
  await signInWithEmailAndPassword(auth, email, password);
  console.log('Authenticated as', auth.currentUser.email);

  // 1. Seed legalGuides
  const snap = await getDocs(collection(db, 'legalGuides'));
  console.log('Current legalGuides count:', snap.size);

  if (force && snap.size > 0) {
    console.log('--force: deleting existing guides...');
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'legalGuides', d.id));
      process.stdout.write('x');
    }
    console.log('\nDeleted', snap.size, 'existing guides.');
  }

  const shouldSeed = force || snap.size === 0;
  if (shouldSeed) {
    console.log('Seeding', sampleGuides.length, 'legal guides across all practice areas...');
    for (const guide of sampleGuides) {
      await addDoc(collection(db, 'legalGuides'), guide);
      process.stdout.write('.');
    }
    console.log('\nSeeded', sampleGuides.length, 'legal guides.');
  } else {
    console.log('legalGuides already populated. Use --force to re-seed with all practice areas.');
  }

  console.log('Done!');
  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message || e); process.exit(1); });
