// =========================================================================
// Admission Hub Bangladesh - Public University Circulars & Calendar Engine
// =========================================================================

const CATEGORY_LABELS = {
  general: 'সাধারণ ও স্বায়ত্তশাসিত বিশ্ববিদ্যালয়',
  engineering: 'প্রকৌশল ও প্রযুক্তি (Engineering)',
  medical: 'মেডিকেল ও ডেন্টাল',
  cluster: 'গুচ্ছ ভর্তি সিস্টেম (Cluster)',
  science_tech: 'বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়',
  specialized: 'বিশেষায়িত পাবলিক বিশ্ববিদ্যালয়'
};

const INITIAL_CIRCULARS = [
  {
    id: 'du-2026',
    code: 'DU',
    name: 'ঢাকা বিশ্ববিদ্যালয় (ঢাবি)',
    englishName: 'University of Dhaka',
    category: 'general',
    status: 'open',
    units: 'ক (বিজ্ঞান), খ (কলা), গ (ব্যবসায়), চ (চারুকলা) ইউনিট',
    applyStart: '2026-11-01',
    applyDeadline: '2026-11-25',
    examDate: '2026-12-18',
    minSscGpa: 3.5,
    minHscGpa: 3.5,
    minTotalGpa: 8.0,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '১,০৫০ টাকা',
    seats: '৭,১২৮ টি',
    website: 'https://admission.eis.du.ac.bd',
    CircularPdf: 'https://admission.eis.du.ac.bd',
    summary: 'ঢাকা বিশ্ববিদ্যালয়ের ২০২৬-২৭ শিক্ষাবর্ষের আন্ডারগ্র্যাজুয়েট প্রোগ্রামের ভর্তি আবেদন চলছে। অনলাইনে আবেদন ও ফি জমা দেওয়া যাবে ২৫ নভেম্বর পর্যন্ত।'
  },
  {
    id: 'buet-2026',
    code: 'BUET',
    name: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (বুয়েট)',
    englishName: 'Bangladesh University of Engineering and Technology',
    category: 'engineering',
    status: 'open',
    units: 'ক গ্রুপ (প্রকৌশল ও ইউআরপি), খ গ্রুপ (স্থাপত্য)',
    applyStart: '2026-11-02',
    applyDeadline: '2026-11-20',
    examDate: '2026-12-12',
    minSscGpa: 4.0,
    minHscGpa: 5.0,
    minTotalGpa: 9.0,
    allowedGroups: ['science'],
    fee: '১,০০০ - ১,২০০ টাকা',
    seats: '১,৩০৯ টি',
    website: 'https://www.buet.ac.bd/web/#/ugAdmission',
    CircularPdf: 'https://www.buet.ac.bd',
    summary: 'বুয়েট ভর্তি পরীক্ষা দুই ধাপে (প্রাক-নির্বাচনী ও চূড়ান্ত) অনুষ্ঠিত হবে। পদার্থ, রসায়ন ও উচ্চতর গণিতে জিপিএ ৫.০০ থাকা আবশ্যক।'
  },
  {
    id: 'medical-2026',
    code: 'MBC',
    name: 'সরকারি ও বেসরকারি মেডিকেল কলেজ (DGME)',
    englishName: 'MBBS & BDS Admission Bangladesh',
    category: 'medical',
    status: 'open',
    units: 'এমবিবিএস (MBBS) ও বিডিএস (BDS)',
    applyStart: '2026-10-28',
    applyDeadline: '2026-11-18',
    examDate: '2026-12-05',
    minSscGpa: 4.0,
    minHscGpa: 4.0,
    minTotalGpa: 9.0,
    allowedGroups: ['science'],
    fee: '১,০০০ টাকা',
    seats: '৫,৩৮০ টি (সরকারি)',
    website: 'http://dgme.teletalk.com.bd',
    CircularPdf: 'https://dgme.portal.gov.bd',
    summary: 'সকল সরকারি ও বেসরকারি মেডিকেল কলেজে এমবিবিএস ভর্তি পরীক্ষার আবেদন চলছে। জীববিজ্ঞানে ন্যূনতম জিপিএ ৪.০০ থাকতে হবে।'
  },
  {
    id: 'gst-2026',
    code: 'GST',
    name: 'জিএসটি গুচ্ছভুক্ত ২৪ বিশ্ববিদ্যালয়',
    englishName: 'GST Cluster System (24 Public Universities)',
    category: 'cluster',
    status: 'open',
    units: 'A (বিজ্ঞান), B (মানবিক), C (বাণিজ্য) ইউনিট',
    applyStart: '2026-11-03',
    applyDeadline: '2026-11-28',
    examDate: '2026-12-26',
    minSscGpa: 3.0,
    minHscGpa: 3.0,
    minTotalGpa: 7.0,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '১,৫০০ টাকা',
    seats: '২১,০০০+ টি',
    website: 'https://gstadmission.ac.bd',
    CircularPdf: 'https://gstadmission.ac.bd',
    summary: '২৪টি সাধারণ এবং বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের গুচ্ছ ভর্তি পরীক্ষার অনলাইন আবেদন শুরু হয়েছে। একটি পরীক্ষার মাধ্যমেই ২৪টি বিশ্ববিদ্যালয়ে ভর্তির সুযোগ।'
  },
  {
    id: 'ru-2026',
    code: 'RU',
    name: 'রাজশাহী বিশ্ববিদ্যালয় (রাবি)',
    englishName: 'University of Rajshahi',
    category: 'general',
    status: 'open',
    units: 'A (মানবিক), B (বাণিজ্য), C (বিজ্ঞান) ইউনিট',
    applyStart: '2026-11-04',
    applyDeadline: '2026-11-22',
    examDate: '2026-12-15',
    minSscGpa: 3.0,
    minHscGpa: 3.0,
    minTotalGpa: 7.5,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '১,১০০ টাকা',
    seats: '৪,৪৩৮ টি',
    website: 'https://admission.ru.ac.bd',
    CircularPdf: 'https://admission.ru.ac.bd',
    summary: 'রাজশাহী বিশ্ববিদ্যালয়ের প্রাথমিক ও চূড়ান্ত আবেদন প্রক্রিয়া শুরু হয়েছে। বহুনির্বাচনী (MCQ) পদ্ধতিতে পরীক্ষা অনুষ্ঠিত হবে।'
  },
  {
    id: 'ju-2026',
    code: 'JU',
    name: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয় (জাবি)',
    englishName: 'Jahangirnagar University',
    category: 'general',
    status: 'open',
    units: 'A, B, C, C1, D, E ও IBA-JU ইউনিট',
    applyStart: '2026-11-02',
    applyDeadline: '2026-11-24',
    examDate: '2026-12-20',
    minSscGpa: 3.5,
    minHscGpa: 3.5,
    minTotalGpa: 8.0,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '৯০০ টাকা',
    seats: '১,৮৪৪ টি',
    website: 'https://juniv-admission.org',
    CircularPdf: 'https://juniv-admission.org',
    summary: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের ২০২৬-২৭ শিক্ষাবর্ষের স্নাতক (সম্মান) প্রথম বর্ষের ভর্তি বিজ্ঞপ্তি প্রকাশিত হয়েছে।'
  },
  {
    id: 'cu-2026',
    code: 'CU',
    name: 'চট্টগ্রাম বিশ্ববিদ্যালয় (চবি)',
    englishName: 'University of Chittagong',
    category: 'general',
    status: 'upcoming',
    units: 'A, B, B1, C, D, D1 ইউনিট',
    applyStart: '2026-11-10',
    applyDeadline: '2026-11-30',
    examDate: '2026-12-28',
    minSscGpa: 3.25,
    minHscGpa: 3.25,
    minTotalGpa: 7.5,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '১,০০০ টাকা',
    seats: '৪,৯২৬ টি',
    website: 'https://admission.cu.ac.bd',
    CircularPdf: 'https://admission.cu.ac.bd',
    summary: 'চট্টগ্রাম বিশ্ববিদ্যালয়ের ভর্তি আবেদন আগামী ১০ নভেম্বর থেকে শুরু হবে। ঢাকা, রাজশাহী ও চট্টগ্রাম কেন্দ্রে পরীক্ষা অনুষ্ঠিত হবে।'
  },
  {
    id: 'ckruet-2026',
    code: 'CKRUET',
    name: 'প্রকৌশল গুচ্ছ (চুয়েট, কুয়েট ও রুয়েট)',
    englishName: 'CUET, KUET & RUET Admission',
    category: 'engineering',
    status: 'upcoming',
    units: 'ক গ্রুপ (ইঞ্জিনিয়ারিং), খ গ্রুপ (আর্কিটেকচার)',
    applyStart: '2026-11-12',
    applyDeadline: '2026-12-02',
    examDate: '2026-12-23',
    minSscGpa: 4.0,
    minHscGpa: 4.5,
    minTotalGpa: 8.5,
    allowedGroups: ['science'],
    fee: '১,২০০ টাকা',
    seats: '৩,২৩১ টি',
    website: 'https://admissionckruet.ac.bd',
    CircularPdf: 'https://admissionckruet.ac.bd',
    summary: 'চট্টগ্রাম, খুলনা ও রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়ের সমন্বিত ভর্তি পরীক্ষার বিজ্ঞপ্তি প্রকাশিত হয়েছে।'
  },
  {
    id: 'agri-2026',
    code: 'AGRI',
    name: 'কৃষি গুচ্ছ (৯টি পাবলিক কৃষি বিশ্ববিদ্যালয়)',
    englishName: 'Agricultural Cluster System (BAU, SAU, BSMRAU...)',
    category: 'cluster',
    status: 'upcoming',
    units: 'কৃষি বিজ্ঞান ও ভেটেরিনারি একক ইউনিট',
    applyStart: '2026-11-15',
    applyDeadline: '2026-12-08',
    examDate: '2026-12-30',
    minSscGpa: 4.0,
    minHscGpa: 4.0,
    minTotalGpa: 8.5,
    allowedGroups: ['science'],
    fee: '১,২০০ টাকা',
    seats: '৩,৭১৮ টি',
    website: 'https://acas.edu.bd',
    CircularPdf: 'https://acas.edu.bd',
    summary: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (বাকৃবি), শেরেবাংলা কৃষি বিশ্ববিদ্যালয় (শেকৃবি) সহ ৯টি কৃষি বিশ্ববিদ্যালয়ের গুচ্ছ ভর্তি সার্কুলার।'
  },
  {
    id: 'bup-2026',
    code: 'BUP',
    name: 'বাংলাদেশ ইউনিভার্সিটি অব প্রফেশনালস (বিইউপি)',
    englishName: 'Bangladesh University of Professionals',
    category: 'specialized',
    status: 'open',
    units: 'FST, FASS, FBS, FSSS ফ্যাকাল্টি',
    applyStart: '2026-10-20',
    applyDeadline: '2026-11-14',
    examDate: '2026-11-27',
    minSscGpa: 4.0,
    minHscGpa: 4.0,
    minTotalGpa: 8.5,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '১,০৫০ টাকা',
    seats: '১,২০০+ টি',
    website: 'https://admission.bup.edu.bd',
    CircularPdf: 'https://admission.bup.edu.bd',
    summary: 'বিইউপি ২০২৬-২৭ শিক্ষাবর্ষের ভর্তি আবেদন চলমান রয়েছে। লিখিত ও মৌখিক পরীক্ষার মাধ্যমে শিক্ষার্থী নির্বাচন করা হবে।'
  },
  {
    id: 'mist-2026',
    code: 'MIST',
    name: 'মিলিটারি ইনস্টিটিউট অব সায়েন্স অ্যান্ড টেকনোলজি',
    englishName: 'Military Institute of Science and Technology',
    category: 'engineering',
    status: 'open',
    units: 'A ইউনিট (ইঞ্জিনিয়ারিং), B ইউনিট (আর্কিটেকচার)',
    applyStart: '2026-10-25',
    applyDeadline: '2026-11-16',
    examDate: '2026-11-29',
    minSscGpa: 4.0,
    minHscGpa: 4.5,
    minTotalGpa: 8.5,
    allowedGroups: ['science'],
    fee: '১,০০০ টাকা',
    seats: '৫৯৫ টি',
    website: 'https://mist.ac.bd/admission',
    CircularPdf: 'https://mist.ac.bd',
    summary: 'এমআইএসটি (MIST) ভর্তি পরীক্ষায় কোনো এমসিকিউ নেই, সম্পূর্ণ লিখিত পরীক্ষায় মেধাতালিকা প্রণীত হবে।'
  },
  {
    id: 'sust-2026',
    code: 'SUST',
    name: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (শাবিপ্রবি)',
    englishName: 'Shahjalal University of Science and Technology',
    category: 'science_tech',
    status: 'open',
    units: 'A (বিজ্ঞান) ও B (মানবিক ও বাণিজ্য) ইউনিট (GST অন্তর্ভুক্ত)',
    applyStart: '2026-11-03',
    applyDeadline: '2026-11-28',
    examDate: '2026-12-26',
    minSscGpa: 3.5,
    minHscGpa: 3.5,
    minTotalGpa: 7.5,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '১,৫০০ টাকা',
    seats: '১,৬৬৬ টি',
    website: 'https://admission.sust.edu.bd',
    CircularPdf: 'https://admission.sust.edu.bd',
    summary: 'শাবিপ্রবি গুচ্ছ (GST) পদ্ধতির মাধ্যমে শিক্ষার্থী ভর্তি নিচ্ছে। বিস্তারিত শর্তাবলি অফিশিয়াল পোর্টালে পাওয়া যাবে।'
  }
];

// Additional Public Universities for the Live Directory
const PUBLIC_UNI_DIRECTORY = [
  { code: 'DU', name: 'ঢাকা বিশ্ববিদ্যালয়', url: 'https://admission.eis.du.ac.bd', cat: 'সাধারণ' },
  { code: 'BUET', name: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়', url: 'https://www.buet.ac.bd', cat: 'প্রকৌশল' },
  { code: 'RU', name: 'রাজশাহী বিশ্ববিদ্যালয়', url: 'https://admission.ru.ac.bd', cat: 'সাধারণ' },
  { code: 'CU', name: 'চট্টগ্রাম বিশ্ববিদ্যালয়', url: 'https://admission.cu.ac.bd', cat: 'সাধারণ' },
  { code: 'JU', name: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়', url: 'https://juniv-admission.org', cat: 'সাধারণ' },
  { code: 'GST', name: 'গুচ্ছ ২৪ বিশ্ববিদ্যালয় পোর্টাল', url: 'https://gstadmission.ac.bd', cat: 'গুচ্ছ' },
  { code: 'DGME', name: 'মেডিকেল ও ডেন্টাল (DGME)', url: 'http://dgme.teletalk.com.bd', cat: 'মেডিকেল' },
  { code: 'AGRI', name: 'কৃষি গুচ্ছ (৯টি বিশ্ববিদ্যালয়)', url: 'https://acas.edu.bd', cat: 'কৃষি গুচ্ছ' },
  { code: 'CKRUET', name: 'চুয়েট, কুয়েট ও রুয়েট গুচ্ছ', url: 'https://admissionckruet.ac.bd', cat: 'প্রকৌশল' },
  { code: 'BUP', name: 'বাংলাদেশ ইউনিভার্সিটি অব প্রফেশনালস', url: 'https://admission.bup.edu.bd', cat: 'বিশেষায়িত' },
  { code: 'MIST', name: 'এমআইএসটি (MIST)', url: 'https://mist.ac.bd', cat: 'প্রকৌশল' },
  { code: 'SUST', name: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', url: 'https://sust.edu', cat: 'বিজ্ঞান ও প্রযুক্তি' },
  { code: 'JnU', name: 'জগন্নাথ বিশ্ববিদ্যালয় (জবি)', url: 'https://jnu.ac.bd', cat: 'সাধারণ' },
  { code: 'KU', name: 'খুলনা বিশ্ববিদ্যালয় (খুবি)', url: 'https://ku.ac.bd', cat: 'সাধারণ' },
  { code: 'IU', name: 'ইসলামী বিশ্ববিদ্যালয় (ইবি)', url: 'https://iu.ac.bd', cat: 'সাধারণ' },
  { code: 'CoU', name: 'কুমিল্লা বিশ্ববিদ্যালয় (কুবি)', url: 'https://cou.ac.bd', cat: 'সাধারণ' },
  { code: 'BAU', name: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (বাকৃবি)', url: 'https://bau.edu.bd', cat: 'কৃষি' },
  { code: 'BUTEX', name: 'বাংলাদেশ টেক্সটাইল বিশ্ববিদ্যালয় (বুটেক্স)', url: 'https://butex.edu.bd', cat: 'প্রকৌশল' },
  { code: 'BMU', name: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান মেরিটাইম ইউনিভার্সিটি', url: 'https://bsmrmu.edu.bd', cat: 'বিশেষায়িত' },
  { code: 'AAUB', name: 'অ্যাভিয়েশন অ্যান্ড অ্যারোস্পেস বিশ্ববিদ্যালয়', url: 'https://bsmraau.edu.bd', cat: 'বিশেষায়িত' }
];

// Simulated Live Circular Pool for "Test New Circular Alert"
const SIMULATED_NEW_CIRCULARS = [
  {
    id: 'butex-2026',
    code: 'BUTEX',
    name: 'বাংলাদেশ টেক্সটাইল বিশ্ববিদ্যালয় (বুটেক্স)',
    englishName: 'Bangladesh University of Textiles',
    category: 'engineering',
    status: 'open',
    units: 'টেক্সটাইল ইঞ্জিনিয়ারিং একক ইউনিট',
    applyStart: '2026-11-04',
    applyDeadline: '2026-11-26',
    examDate: '2026-12-19',
    minSscGpa: 4.5,
    minHscGpa: 4.5,
    minTotalGpa: 9.0,
    allowedGroups: ['science'],
    fee: '১,০০০ টাকা',
    seats: '৬০০ টি',
    website: 'https://www.butex.edu.bd',
    CircularPdf: 'https://www.butex.edu.bd',
    summary: 'এইমাত্র প্রকাশিত! বাংলাদেশ টেক্সটাইল বিশ্ববিদ্যালয় (বুটেক্স)-এর ২০২৬-২৭ শিক্ষাবর্ষের বিএসসি ইন টেক্সটাইল ইঞ্জিনিয়ারিং ভর্তি বিজ্ঞপ্তি প্রকাশিত হয়েছে।'
  },
  {
    id: 'jnu-2026',
    code: 'JnU',
    name: 'জগন্নাথ বিশ্ববিদ্যালয় (জবি)',
    englishName: 'Jagannath University Dhaka',
    category: 'general',
    status: 'open',
    units: 'A (বিজ্ঞান), B (কলা), C (বাণিজ্য), D (সামাজিক বিজ্ঞান) ইউনিট',
    applyStart: '2026-11-05',
    applyDeadline: '2026-11-27',
    examDate: '2026-12-21',
    minSscGpa: 3.5,
    minHscGpa: 3.5,
    minTotalGpa: 8.0,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '৯৫০ টাকা',
    seats: '২,৭৬৫ টি',
    website: 'https://admission.jnu.ac.bd',
    CircularPdf: 'https://jnu.ac.bd',
    summary: 'এইমাত্র প্রকাশিত! জগন্নাথ বিশ্ববিদ্যালয়ের স্বতন্ত্র ভর্তি পরীক্ষার সার্কুলার প্রকাশিত হয়েছে এবং স্বয়ংক্রিয়ভাবে আপনার ক্যালেন্ডারে যুক্ত হয়েছে।'
  },
  {
    id: 'bsmrmu-2026',
    code: 'BMU',
    name: 'মেরিটাইম ইউনিভার্সিটি বাংলাদেশ (BMU)',
    englishName: 'Maritime University Bangladesh',
    category: 'specialized',
    status: 'open',
    units: 'FEOS, FME, FMGP, FSA ফ্যাকাল্টি',
    applyStart: '2026-11-04',
    applyDeadline: '2026-11-23',
    examDate: '2026-12-14',
    minSscGpa: 4.0,
    minHscGpa: 4.0,
    minTotalGpa: 8.0,
    allowedGroups: ['science', 'arts', 'commerce'],
    fee: '৮০০ টাকা',
    seats: '২০০ টি',
    website: 'https://apply.bsmrmu.edu.bd',
    CircularPdf: 'https://bsmrmu.edu.bd',
    summary: 'মেরিটাইম ইউনিভার্সিটির আন্ডারগ্র্যাজুয়েট ভর্তি বিজ্ঞপ্তি প্রকাশিত হয়েছে। আবেদনের শেষ তারিখ ২৩ নভেম্বর ২০২৬।'
  }
];

// State Management
let circulars = [];
let savedIds = JSON.parse(localStorage.getItem('admissionHub_saved') || '[]');
let notifications = JSON.parse(localStorage.getItem('admissionHub_notifs') || 'null');
let activeCategory = 'all';
let activeStatus = 'all';
let activeSort = 'deadline';
let searchQuery = '';
let showOnlySaved = false;

// Calendar State (Default November 2026)
let calYear = 2026;
let calMonth = 10; // 0-indexed: 10 = November
let selectedCalDate = null;
let timelineFilter = 'all';
let simulatedIndex = 0;

// Bangla Digits & Date Formatter
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function toBanglaNum(num) {
  return String(num).replace(/\d/g, d => BN_DIGITS[d]);
}

function formatBanglaDate(dateStr) {
  if (!dateStr) return 'শীঘ্রই জানানো হবে';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${toBanglaNum(d)} ${BN_MONTHS[m - 1]} ${toBanglaNum(y)}`;
}

function getDaysRemaining(deadlineStr) {
  const now = new Date('2026-11-04T12:00:00');
  const target = new Date(deadlineStr + 'T23:59:59');
  const diff = target - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

// Sound Effect for Live Notification (Web Audio API)
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Ignore audio context restriction if no user gesture yet
  }
}

// Initialize Data
function initApp() {
  const storedCirculars = localStorage.getItem('admissionHub_circulars_v1');
  if (storedCirculars) {
    circulars = JSON.parse(storedCirculars);
  } else {
    circulars = [...INITIAL_CIRCULARS];
    localStorage.setItem('admissionHub_circulars_v1', JSON.stringify(circulars));
  }

  if (!notifications) {
    notifications = [
      {
        id: 'n1',
        uniId: 'du-2026',
        title: 'ঢাকা বিশ্ববিদ্যালয় (DU) ভর্তি বিজ্ঞপ্তি প্রকাশিত!',
        desc: 'আবেদনের শেষ তারিখ ২৫ নভেম্বর এবং ভর্তি পরীক্ষা ১৮ ডিসেম্বর ক্যালেন্ডারে যুক্ত করা হয়েছে।',
        time: '১০ মিনিট আগে',
        unread: true
      },
      {
        id: 'n2',
        uniId: 'buet-2026',
        title: 'বুয়েট (BUET) ভর্তি আবেদন শুরু হয়েছে',
        desc: 'প্রাক-নির্বাচনী ও চূড়ান্ত পরীক্ষার তারিখ ক্যালেন্ডারে স্বয়ংক্রিয়ভাবে সিঙ্ক হয়েছে।',
        time: '১ ঘণ্টা আগে',
        unread: true
      },
      {
        id: 'n3',
        uniId: 'gst-2026',
        title: 'গুচ্ছ ২৪ বিশ্ববিদ্যালয়ের (GST) সার্কুলার আপডেট',
        desc: 'আবেদন চলবে ২৮ নভেম্বর পর্যন্ত। আপনার জিপিএ দিয়ে যোগ্যতা যাচাই করুন।',
        time: '৩ ঘণ্টা আগে',
        unread: true
      }
    ];
    localStorage.setItem('admissionHub_notifs', JSON.stringify(notifications));
  }

  // Theme Setup
  const savedTheme = localStorage.getItem('admissionHub_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeIcon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  renderAll();
  setupEventListeners();
}

function renderAll() {
  updateStats();
  renderCirculars();
  renderNotifications();
  renderCalendar();
  renderTimeline();
  renderDirectory();
  updateSavedBadge();
}

function updateStats() {
  const openCount = circulars.filter(c => c.status === 'open').length;
  const upcomingCount = circulars.filter(c => c.status === 'upcoming').length;
  const totalEvents = circulars.length * 2; // Deadline + Exam for each circular

  document.getElementById('statOpenCount').textContent = toBanglaNum(openCount);
  document.getElementById('statUpcomingCount').textContent = toBanglaNum(upcomingCount);
  document.getElementById('statExamCount').textContent = toBanglaNum(totalEvents);
}

function updateSavedBadge() {
  document.getElementById('savedCountBadge').textContent = toBanglaNum(savedIds.length);
  const btn = document.getElementById('savedFilterBtn');
  if (showOnlySaved) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
}

// Render Circular Cards
function renderCirculars() {
  const grid = document.getElementById('circularsGrid');
  const emptyState = document.getElementById('emptyState');

  let filtered = circulars.filter(item => {
    if (showOnlySaved && !savedIds.includes(item.id)) return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeStatus !== 'all' && item.status !== activeStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchEng = (item.englishName || '').toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      const matchUnits = item.units.toLowerCase().includes(q);
      if (!matchName && !matchEng && !matchCode && !matchUnits) return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (activeSort === 'deadline') {
      return new Date(a.applyDeadline) - new Date(b.applyDeadline);
    } else if (activeSort === 'exam') {
      return new Date(a.examDate) - new Date(b.examDate);
    }
    return 0;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  grid.innerHTML = filtered.map(c => {
    const daysLeft = getDaysRemaining(c.applyDeadline);
    const isSaved = savedIds.includes(c.id);

    let statusText = '🟢 আবেদন চলছে';
    let statusClass = 'status-open';
    if (c.status === 'upcoming') {
      statusText = '🟡 আসন্ন সার্কুলার';
      statusClass = 'status-upcoming';
    } else if (c.status === 'closed' || daysLeft < 0) {
      statusText = '🔴 আবেদন শেষ';
      statusClass = 'status-closed';
    }

    const countdownLabel = daysLeft >= 0
      ? `⏳ আবেদনের বাকি মাত্র ${toBanglaNum(daysLeft)} দিন`
      : `আবেদনের সময় শেষ হয়েছে`;

    return `
      <article class="circular-card">
        <div>
          <div class="card-top">
            <div class="uni-badge-group">
              <div class="uni-short-avatar">${c.code}</div>
              <div class="uni-title-wrap">
                <h3>${c.name}</h3>
                <span class="uni-category-label">${CATEGORY_LABELS[c.category] || 'পাবলিক বিশ্ববিদ্যালয়'}</span>
              </div>
            </div>
            <div class="card-top-right">
              <span class="status-badge ${statusClass}">${statusText}</span>
              <button class="bookmark-btn ${isSaved ? 'saved' : ''}" onclick="toggleBookmark('${c.id}')" title="সংরক্ষণ করুন">
                ${isSaved ? '★' : '☆'}
              </button>
            </div>
          </div>

          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 14px;">
            ${c.summary}
          </p>

          <div class="card-meta-grid">
            <div class="meta-item">
              <span>আবেদনের শেষ তারিখ</span>
              <strong>📅 ${formatBanglaDate(c.applyDeadline)}</strong>
            </div>
            <div class="meta-item">
              <span>ভর্তি পরীক্ষার তারিখ</span>
              <strong>🎯 ${formatBanglaDate(c.examDate)}</strong>
            </div>
            <div class="meta-item">
              <span>ন্যূনতম মোট জিপিএ</span>
              <strong>⭐ জিপিএ ${toBanglaNum(c.minTotalGpa.toFixed(2))}</strong>
            </div>
            <div class="meta-item">
              <span>আবেদন ফি ও আসন</span>
              <strong>💳 ${c.fee} (${c.seats || 'N/A'})</strong>
            </div>
          </div>

          <div class="countdown-banner">
            <span class="countdown-timer">${countdownLabel}</span>
            <span style="font-size: 0.76rem; color: var(--text-secondary);">✔ ক্যালেন্ডারে যুক্ত</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-primary" onclick="openCircularModal('${c.id}')">
            📄 বিস্তারিত ও সার্কুলার
          </button>
          <button class="btn-outline" onclick="addToGoogleCalendar('${c.id}')" title="Google Calendar-এ যুক্ত করুন">
            📅 ক্যালেন্ডারে নিন
          </button>
          <a href="${c.website}" target="_blank" rel="noopener" class="btn-outline" title="অফিশিয়াল ওয়েবসাইটে যান">
            🔗 পোর্টাল
          </a>
        </div>
      </article>
    `;
  }).join('');
}

// Bookmark Toggle
window.toggleBookmark = function(id) {
  if (savedIds.includes(id)) {
    savedIds = savedIds.filter(i => i !== id);
    showToast('🔖 সংরক্ষিত তালিকা থেকে সরানো হয়েছে।');
  } else {
    savedIds.push(id);
    showToast('⭐ সার্কুলারটি আপনার পছন্দের তালিকায় সংরক্ষিত হয়েছে!');
  }
  localStorage.setItem('admissionHub_saved', JSON.stringify(savedIds));
  updateSavedBadge();
  renderCirculars();
};

// Detailed Circular Modal
window.openCircularModal = function(id) {
  const c = circulars.find(item => item.id === id);
  if (!c) return;

  const backdrop = document.getElementById('circularModalBackdrop');
  const content = document.getElementById('circularModalContent');

  content.innerHTML = `
    <div class="modal-header">
      <div class="uni-badge-group">
        <div class="uni-short-avatar">${c.code}</div>
        <div>
          <h3>${c.name}</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary);">${c.englishName || ''}</p>
        </div>
      </div>
      <button class="close-modal-btn" onclick="closeCircularModal()">✕</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:14px;">
      <p style="color:var(--text-secondary);">${c.summary}</p>

      <div class="card-meta-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        <div class="meta-item">
          <span>ইউনিট সমূহ</span>
          <strong>${c.units}</strong>
        </div>
        <div class="meta-item">
          <span>আবেদন শুরুর তারিখ</span>
          <strong>${formatBanglaDate(c.applyStart)}</strong>
        </div>
        <div class="meta-item">
          <span>আবেদনের শেষ তারিখ</span>
          <strong style="color:var(--warning);">${formatBanglaDate(c.applyDeadline)}</strong>
        </div>
        <div class="meta-item">
          <span>ভর্তি পরীক্ষার তারিখ</span>
          <strong style="color:var(--accent-primary);">${formatBanglaDate(c.examDate)}</strong>
        </div>
        <div class="meta-item">
          <span>এসএসসি ও এইচএসসি ন্যূনতম জিপিএ</span>
          <strong>SSC: ${toBanglaNum(c.minSscGpa)} | HSC: ${toBanglaNum(c.minHscGpa)} (মোট: ${toBanglaNum(c.minTotalGpa)})</strong>
        </div>
        <div class="meta-item">
          <span>আবেদন ফি ও মোট আসন</span>
          <strong>${c.fee} • আসন: ${c.seats || 'উল্লেখ নেই'}</strong>
        </div>
      </div>

      <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); padding:14px; border-radius:12px;">
        <h4 style="margin-bottom:6px; font-size:0.95rem;">🔔 স্বয়ংক্রিয় ক্যালেন্ডার ও রিমাইন্ডার স্ট্যাটাস</h4>
        <p style="font-size:0.85rem; color:var(--text-secondary);">
          এই সার্কুলারটির আবেদনের ডেডলাইন (<strong>${formatBanglaDate(c.applyDeadline)}</strong>) এবং ভর্তি পরীক্ষার তারিখ (<strong>${formatBanglaDate(c.examDate)}</strong>) স্বয়ংক্রিয়ভাবে ওয়েবসাইটের ভর্তি ক্যালেন্ডারে যুক্ত করা হয়েছে।
        </p>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-outline" onclick="downloadSingleIcs('${c.id}')">📥 .ics ক্যালেন্ডার ফাইল</button>
      <button class="btn-outline" onclick="addToGoogleCalendar('${c.id}')">📅 Google Calendar-এ যুক্ত করুন</button>
      <a href="${c.website}" target="_blank" rel="noopener" class="btn-primary">🌐 অফিশিয়াল পোর্টালে আবেদন করুন</a>
    </div>
  `;

  backdrop.classList.add('show');
};

window.closeCircularModal = function() {
  document.getElementById('circularModalBackdrop').classList.remove('show');
};

// Google Calendar Direct Integration
window.addToGoogleCalendar = function(id) {
  const c = circulars.find(item => item.id === id);
  if (!c) return;

  const startDate = c.examDate.replace(/-/g, '');
  const title = encodeURIComponent(`ভর্তি পরীক্ষা: ${c.name} (${c.code})`);
  const details = encodeURIComponent(
    `${c.name} ভর্তি পরীক্ষা।\nইউনিট: ${c.units}\nআবেদনের শেষ তারিখ: ${c.applyDeadline}\nঅফিশিয়াল ওয়েবসাইট: ${c.website}`
  );
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${startDate}&details=${details}`;
  window.open(url, '_blank', 'noopener');
};

// Download .ICS file for Apple/Outlook/Phone Calendar
window.downloadSingleIcs = function(id) {
  const c = circulars.find(item => item.id === id);
  if (!c) return;
  generateAndDownloadIcs([c], `${c.code}-Admission-Calendar.ics`);
};

function generateAndDownloadIcs(list, filename) {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Admission Hub Bangladesh//BN\n';
  list.forEach(c => {
    const dlDate = c.applyDeadline.replace(/-/g, '');
    const exDate = c.examDate.replace(/-/g, '');

    // Deadline Event
    ics += 'BEGIN:VEVENT\n';
    ics += `SUMMARY:আবেদনের শেষ দিন: ${c.name} (${c.code})\n`;
    ics += `DTSTART;VALUE=DATE:${dlDate}\n`;
    ics += `DTEND;VALUE=DATE:${dlDate}\n`;
    ics += `DESCRIPTION:অফিশিয়াল পোর্টাল: ${c.website}\n`;
    ics += 'END:VEVENT\n';

    // Exam Event
    ics += 'BEGIN:VEVENT\n';
    ics += `SUMMARY:ভর্তি পরীক্ষা: ${c.name} (${c.code})\n`;
    ics += `DTSTART;VALUE=DATE:${exDate}\n`;
    ics += `DTEND;VALUE=DATE:${exDate}\n`;
    ics += `DESCRIPTION:ইউনিট: ${c.units} | ওয়েবসাইট: ${c.website}\n`;
    ics += 'END:VEVENT\n';
  });
  ics += 'END:VCALENDAR';

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  showToast('📥 ক্যালেন্ডার (.ics) ফাইল ডাউনলোড হয়েছে!');
}

// =========================================================================
// Interactive Calendar & Auto Event Sync
// =========================================================================
function getAllCalendarEvents() {
  const events = [];
  circulars.forEach(c => {
    if (c.applyStart) {
      events.push({
        id: `${c.id}-start`,
        uniId: c.id,
        code: c.code,
        uniName: c.name,
        date: c.applyStart,
        type: 'start',
        title: `${c.code} আবেদন শুরু`
      });
    }
    if (c.applyDeadline) {
      events.push({
        id: `${c.id}-deadline`,
        uniId: c.id,
        code: c.code,
        uniName: c.name,
        date: c.applyDeadline,
        type: 'deadline',
        title: `${c.code} আবেদনের শেষ দিন`
      });
    }
    if (c.examDate) {
      events.push({
        id: `${c.id}-exam`,
        uniId: c.id,
        code: c.code,
        uniName: c.name,
        date: c.examDate,
        type: 'exam',
        title: `${c.code} ভর্তি পরীক্ষা`
      });
    }
  });
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderCalendar() {
  const titleEl = document.getElementById('calendarMonthTitle');
  const gridEl = document.getElementById('calendarDaysGrid');

  titleEl.textContent = `${BN_MONTHS[calMonth]} ${toBanglaNum(calYear)}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const allEvents = getAllCalendarEvents();

  let html = '';
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(calMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const fullDate = `${calYear}-${mStr}-${dStr}`;

    const dayEvents = allEvents.filter(e => e.date === fullDate);
    const isToday = fullDate === '2026-11-04';
    const isSelected = selectedCalDate === fullDate;

    const pillsHtml = dayEvents.slice(0, 3).map(ev =>
      `<span class="cal-pill ${ev.type}" title="${ev.uniName}: ${ev.title}">${ev.title}</span>`
    ).join('');

    html += `
      <div class="cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" onclick="selectCalendarDate('${fullDate}')">
        <span class="cal-day-num">${toBanglaNum(day)}</span>
        <div class="cal-event-dots">${pillsHtml}</div>
      </div>
    `;
  }

  gridEl.innerHTML = html;
}

window.selectCalendarDate = function(dateStr) {
  if (selectedCalDate === dateStr) {
    selectedCalDate = null;
    document.getElementById('timelineTitle').textContent = '📌 সকল আসন্ন ক্যালেন্ডার ইভেন্ট';
  } else {
    selectedCalDate = dateStr;
    document.getElementById('timelineTitle').textContent = `📌 ${formatBanglaDate(dateStr)} তারিখের ইভেন্ট`;
  }
  renderCalendar();
  renderTimeline();
};

function renderTimeline() {
  const listEl = document.getElementById('calendarTimelineList');
  let events = getAllCalendarEvents();

  if (selectedCalDate) {
    events = events.filter(e => e.date === selectedCalDate);
  } else if (timelineFilter !== 'all') {
    events = events.filter(e => e.type === timelineFilter);
  }

  if (events.length === 0) {
    listEl.innerHTML = `<p style="color:var(--text-secondary); text-align:center; padding:24px;">এই তারিখে কোনো ইভেন্ট নেই। সব ইভেন্ট দেখতে আবার তারিখটিতে ক্লিক করুন।</p>`;
    return;
  }

  listEl.innerHTML = events.map(ev => {
    let badgeText = 'আবেদন শুরু';
    if (ev.type === 'deadline') badgeText = '⏳ আবেদনের শেষ দিন';
    if (ev.type === 'exam') badgeText = '🎯 ভর্তি পরীক্ষা';

    return `
      <div class="timeline-item type-${ev.type}">
        <div class="timeline-info">
          <h4>${ev.uniName} (${ev.code})</h4>
          <p>${badgeText} • <strong>${formatBanglaDate(ev.date)}</strong></p>
        </div>
        <button class="btn-outline" style="padding:6px 10px; font-size:0.78rem;" onclick="openCircularModal('${ev.uniId}')">
          দেখুন
        </button>
      </div>
    `;
  }).join('');
}

// =========================================================================
// Notification & Auto-Circular Detection System
// =========================================================================
function renderNotifications() {
  const listEl = document.getElementById('notifList');
  const badgeEl = document.getElementById('unreadNotifBadge');

  const unreadCount = notifications.filter(n => n.unread).length;
  badgeEl.textContent = toBanglaNum(unreadCount);
  badgeEl.style.display = unreadCount > 0 ? 'flex' : 'none';

  listEl.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="handleNotifClick('${n.id}', '${n.uniId}')">
      <div class="notif-item-icon">🔔</div>
      <div class="notif-item-body">
        <h5>${n.title}</h5>
        <p>${n.desc}</p>
        <span class="notif-item-time">${n.time}</span>
      </div>
    </div>
  `).join('');
}

window.handleNotifClick = function(notifId, uniId) {
  notifications = notifications.map(n => n.id === notifId ? { ...n, unread: false } : n);
  localStorage.setItem('admissionHub_notifs', JSON.stringify(notifications));
  renderNotifications();
  document.getElementById('notifDropdown').classList.remove('show');
  if (uniId) openCircularModal(uniId);
};

function publishNewCircularAndNotify(newCircular) {
  // Avoid duplicate ID
  const exists = circulars.some(c => c.id === newCircular.id);
  if (!exists) {
    circulars.unshift(newCircular);
    localStorage.setItem('admissionHub_circulars_v1', JSON.stringify(circulars));
  }

  const newNotif = {
    id: 'notif-' + Date.now(),
    uniId: newCircular.id,
    title: `নতুন সার্কুলার: ${newCircular.name} (${newCircular.code})`,
    desc: `আবেদনের শেষ তারিখ ${formatBanglaDate(newCircular.applyDeadline)} এবং ভর্তি পরীক্ষা ${formatBanglaDate(newCircular.examDate)} স্বয়ংক্রিয়ভাবে ক্যালেন্ডারে যুক্ত হয়েছে!`,
    time: 'এইমাত্র প্রকাশিত',
    unread: true
  };

  notifications.unshift(newNotif);
  localStorage.setItem('admissionHub_notifs', JSON.stringify(notifications));

  playNotificationSound();
  renderAll();

  showToast(`🔔 নতুন সার্কুলার প্রকাশিত! ${newCircular.name} (${newCircular.code}) ক্যালেন্ডারে যুক্ত হয়েছে।`);

  // Also trigger Native Browser Notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`🎓 নতুন ভর্তি বিজ্ঞপ্তি: ${newCircular.name}`, {
      body: `আবেদনের শেষ তারিখ: ${formatBanglaDate(newCircular.applyDeadline)} | পরীক্ষা: ${formatBanglaDate(newCircular.examDate)}`
    });
  }
}

function triggerSimulatedCircular() {
  const template = SIMULATED_NEW_CIRCULARS[simulatedIndex % SIMULATED_NEW_CIRCULARS.length];
  simulatedIndex++;

  const item = {
    ...template,
    id: template.id + '-' + Date.now()
  };

  publishNewCircularAndNotify(item);
}

// =========================================================================
// University Directory Rendering
// =========================================================================
function renderDirectory() {
  const grid = document.getElementById('universityDirectoryGrid');
  grid.innerHTML = PUBLIC_UNI_DIRECTORY.map(u => `
    <div class="dir-card">
      <div class="dir-card-header">
        <div class="uni-short-avatar" style="width:42px; height:42px; font-size:0.82rem;">${u.code}</div>
        <div>
          <h4 style="font-size:0.96rem;">${u.name}</h4>
          <span class="dir-status"><span class="live-dot" style="width:7px; height:7px;"></span> অটো-মনিটরিং সক্রিয় (${u.cat})</span>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
        <span style="font-size:0.75rem; color:var(--text-secondary);">${u.url.replace('https://', '').replace('http://', '')}</span>
        <a href="${u.url}" target="_blank" rel="noopener" class="btn-outline" style="padding:5px 10px; font-size:0.78rem;">ভিজিট ↗</a>
      </div>
    </div>
  `).join('');
}

// Toast Helper
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="font-size:1.3rem;">🔔</span>
    <div style="font-size:0.9rem; font-weight:500;">${message}</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4500);
}

// =========================================================================
// Event Listeners Setup
// =========================================================================
function setupEventListeners() {
  // Search Input
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    renderCirculars();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearBtn.style.display = 'none';
    renderCirculars();
  });

  // Category Tabs
  document.querySelectorAll('#categoryTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#categoryTabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderCirculars();
    });
  });

  // Status & Sort Filters
  document.getElementById('statusFilter').addEventListener('change', e => {
    activeStatus = e.target.value;
    renderCirculars();
  });

  document.getElementById('sortFilter').addEventListener('change', e => {
    activeSort = e.target.value;
    renderCirculars();
  });

  // Reset Filters
  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    activeCategory = 'all';
    activeStatus = 'all';
    searchQuery = '';
    showOnlySaved = false;
    searchInput.value = '';
    document.getElementById('statusFilter').value = 'all';
    document.querySelectorAll('#categoryTabs .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('#categoryTabs .tab-btn[data-category="all"]').classList.add('active');
    updateSavedBadge();
    renderCirculars();
  });

  // Saved Filter Toggle
  document.getElementById('savedFilterBtn').addEventListener('click', () => {
    showOnlySaved = !showOnlySaved;
    updateSavedBadge();
    renderCirculars();
    document.getElementById('circulars-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Notification Bell Dropdown
  const notifBtn = document.getElementById('notifBellBtn');
  const notifDropdown = document.getElementById('notifDropdown');
  notifBtn.addEventListener('click', e => {
    e.stopPropagation();
    notifDropdown.classList.toggle('show');
  });

  document.addEventListener('click', e => {
    if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
      notifDropdown.classList.remove('show');
    }
  });

  document.getElementById('markAllReadBtn').addEventListener('click', () => {
    notifications = notifications.map(n => ({ ...n, unread: false }));
    localStorage.setItem('admissionHub_notifs', JSON.stringify(notifications));
    renderNotifications();
  });

  // Enable Browser Push Notifications
  const requestBrowserNotif = async () => {
    if (!('Notification' in window)) {
      showToast('আপনার ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই, তবে ইন-অ্যাপ অ্যালার্ট চালু আছে!');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      showToast('✅ ব্রাউজার পুশ ও অটো-নোটিফিকেশন সফলভাবে চালু হয়েছে!');
      triggerSimulatedCircular();
    } else {
      showToast('🔔 ইন-অ্যাপ লাইভ নোটিফিকেশন ও ক্যালেন্ডার অটো-সিঙ্ক চালু করা হয়েছে!');
      triggerSimulatedCircular();
    }
  };

  document.getElementById('enablePushBtn').addEventListener('click', requestBrowserNotif);
  document.getElementById('subscribeAlertHeroBtn').addEventListener('click', requestBrowserNotif);

  // Simulate New Circular Buttons
  document.getElementById('simulateNewCircularBtn').addEventListener('click', triggerSimulatedCircular);
  document.getElementById('testLiveWebhookBtn').addEventListener('click', triggerSimulatedCircular);

  // Sync Now Button
  document.getElementById('syncNowBtn').addEventListener('click', () => {
    const icon = document.getElementById('syncIcon');
    const txt = document.getElementById('syncBtnText');
    icon.classList.add('spinning');
    txt.textContent = 'চেক করা হচ্ছে...';

    setTimeout(() => {
      icon.classList.remove('spinning');
      txt.textContent = 'সার্কুলার সিঙ্ক করুন';
      document.getElementById('lastCheckedTime').textContent = 'এইমাত্র (সকল পোর্টাল আপ-টু-ডেট)';
      triggerSimulatedCircular();
    }, 1200);
  });

  // Theme Toggle
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('admissionHub_theme', next);
    document.getElementById('themeIcon').textContent = next === 'dark' ? '☀️' : '🌙';
  });

  // Calendar Month Navigation
  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) {
      calMonth = 11;
      calYear--;
    }
    selectedCalDate = null;
    renderCalendar();
    renderTimeline();
  });

  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) {
      calMonth = 0;
      calYear++;
    }
    selectedCalDate = null;
    renderCalendar();
    renderTimeline();
  });

  // Timeline Filter Pills
  document.querySelectorAll('.timeline-filter-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timeline-filter-pills .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCalDate = null;
      timelineFilter = btn.getAttribute('data-evtype');
      renderCalendar();
      renderTimeline();
    });
  });

  // Export All Calendar (.ics)
  document.getElementById('exportAllIcsBtn').addEventListener('click', () => {
    generateAndDownloadIcs(circulars, 'Bangladesh-Public-University-Admission-Calendar.ics');
  });

  // GPA Eligibility Calculator
  document.getElementById('gpaCalcForm').addEventListener('submit', e => {
    e.preventDefault();
    const group = document.getElementById('studentGroup').value;
    const ssc = parseFloat(document.getElementById('sscGpa').value) || 0;
    const hsc = parseFloat(document.getElementById('hscGpa').value) || 0;
    const total = ssc + hsc;

    const eligible = circulars.filter(c =>
      c.allowedGroups.includes(group) &&
      ssc >= c.minSscGpa &&
      hsc >= c.minHscGpa &&
      total >= c.minTotalGpa
    );

    const box = document.getElementById('gpaResultsBox');
    if (eligible.length === 0) {
      box.innerHTML = `
        <div class="calc-placeholder">
          <span>⚠️</span>
          <p>আপনার প্রদত্ত জিপিএ (মোট ${toBanglaNum(total.toFixed(2))}) অনুযায়ী বর্তমান তালিকায় কোনো বিশ্ববিদ্যালয়ের ন্যূনতম শর্ত পূরণ হয়নি।</p>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <h4 style="margin-bottom:12px; color:var(--accent-primary);">
        🎉 অভিনন্দন! আপনার মোট জিপিএ ${toBanglaNum(total.toFixed(2))} দিয়ে আপনি ${toBanglaNum(eligible.length)}টি পাবলিক বিশ্ববিদ্যালয়ে আবেদন করতে পারবেন:
      </h4>
      ${eligible.map(c => `
        <div class="eligible-item">
          <div>
            <strong>${c.name} (${c.code})</strong>
            <p style="font-size:0.78rem; color:var(--text-secondary);">ন্যূনতম প্রয়োজন: ${toBanglaNum(c.minTotalGpa)} • ডেডলাইন: ${formatBanglaDate(c.applyDeadline)}</p>
          </div>
          <button class="btn-outline" style="padding:6px 10px; font-size:0.8rem;" onclick="openCircularModal('${c.id}')">সার্কুলার</button>
        </div>
      `).join('')}
    `;
  });

  // Add Custom Circular Modal
  const addBackdrop = document.getElementById('addCircularModalBackdrop');
  document.getElementById('addCustomCircularBtn').addEventListener('click', () => {
    document.getElementById('newApplyStart').value = '2026-11-05';
    document.getElementById('newApplyDeadline').value = '2026-11-29';
    document.getElementById('newExamDate').value = '2026-12-22';
    addBackdrop.classList.add('show');
  });

  const closeAdd = () => addBackdrop.classList.remove('show');
  document.getElementById('closeAddModalBtn').addEventListener('click', closeAdd);
  document.getElementById('cancelAddModalBtn').addEventListener('click', closeAdd);

  document.getElementById('addCircularForm').addEventListener('submit', e => {
    e.preventDefault();
    const customCircular = {
      id: 'custom-' + Date.now(),
      code: document.getElementById('newUniCode').value.trim().toUpperCase(),
      name: document.getElementById('newUniName').value.trim(),
      englishName: 'Public University Bangladesh',
      category: document.getElementById('newUniCategory').value,
      status: 'open',
      units: document.getElementById('newUniUnits').value.trim(),
      applyStart: document.getElementById('newApplyStart').value,
      applyDeadline: document.getElementById('newApplyDeadline').value,
      examDate: document.getElementById('newExamDate').value,
      minSscGpa: 3.5,
      minHscGpa: 3.5,
      minTotalGpa: parseFloat(document.getElementById('newMinTotalGpa').value) || 8.0,
      allowedGroups: ['science', 'arts', 'commerce'],
      fee: document.getElementById('newAppFee').value.trim(),
      seats: 'বিজ্ঞপ্তি দেখুন',
      website: document.getElementById('newWebsiteUrl').value.trim(),
      CircularPdf: document.getElementById('newWebsiteUrl').value.trim(),
      summary: `${document.getElementById('newUniName').value.trim()}-এর ভর্তি বিজ্ঞপ্তি যুক্ত করা হয়েছে এবং ক্যালেন্ডারে স্বয়ংক্রিয়ভাবে সিঙ্ক হয়েছে।`
    };

    closeAdd();
    publishNewCircularAndNotify(customCircular);
    e.target.reset();
  });
}

document.addEventListener('DOMContentLoaded', initApp);
