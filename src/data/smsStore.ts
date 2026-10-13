// ============================================================
// SalinO-Crop — SMS Auto-generation Store
// Manages auto-generated SMS history by issue type
// Stored in localStorage — no real messages sent
// ============================================================

export type SmsStatus = 'pending' | 'sent' | 'failed';
export type SmsIssueType = 'high_salinity' | 'moderate_salinity' | 'low_risk' | 'soil_test_reminder' | 'crop_advisory' | 'weather_alert' | 'general';

export interface SmsMessage {
  id: string;
  issueType: SmsIssueType;
  riskLevel: 'high' | 'moderate' | 'low';
  generatedAt: string;
  sentAt?: string;
  phone: string;
  recipientName: string;
  fieldLocation: string;
  messageText: string;
  messageBn: string;
  status: SmsStatus;
  source: 'auto' | 'manual';
  season: string;
  cropName?: string;
}

const LS_SMS_KEY = 'salinoCrop_smsHistory_v1';
const LS_PHONE_KEY = 'salinoCrop_userPhone_v1';

export function loadSmsHistory(): SmsMessage[] {
  try {
    const raw = localStorage.getItem(LS_SMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveSmsHistory(messages: SmsMessage[]) {
  try { localStorage.setItem(LS_SMS_KEY, JSON.stringify(messages)); }
  catch { /* storage full */ }
}

export function getUserPhone(): string {
  return localStorage.getItem(LS_PHONE_KEY) || '';
}

export function saveUserPhone(phone: string) {
  localStorage.setItem(LS_PHONE_KEY, phone);
}

// ─── Auto-generate SMS based on issue type ───────────────────
export function autoGenerateSms(
  params: {
    issueType: SmsIssueType;
    riskLevel: 'high' | 'moderate' | 'low';
    recipientName: string;
    fieldLocation: string;
    phone: string;
    season: string;
    cropName?: string;
    soilEC?: number;
  }
): SmsMessage {
  const { issueType, riskLevel, recipientName, fieldLocation, phone, season, cropName, soilEC } = params;
  const now = new Date().toISOString();
  const id = `sms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const templates: Record<SmsIssueType, { en: string; bn: string }> = {
    high_salinity: {
      en: `[SalinO-Crop ALERT] Dear ${recipientName}, HIGH salinity risk detected at ${fieldLocation} for ${season} season${soilEC ? ` (EC: ${soilEC} dS/m)` : ''}. Use BRRI dhan 47 or salt-tolerant varieties. Conduct soil EC test before planting. Contact your local DAE extension officer. [Demo — no real data sent]`,
      bn: `[SalinO-Crop সতর্কতা] প্রিয় ${recipientName}, ${fieldLocation}-এ ${season} মৌসুমে উচ্চ লবণাক্ততার ঝুঁকি শনাক্ত হয়েছে। BRRI ধান ৪৭ বা লবণ-সহনশীল জাত ব্যবহার করুন। রোপণের আগে মাটি পরীক্ষা করুন। [ডেমো]`,
    },
    moderate_salinity: {
      en: `[SalinO-Crop] Dear ${recipientName}, moderate salinity risk at ${fieldLocation} for ${season}. Consider mustard (BARI Sarisha-14) or sunflower. Keep soil EC below 5 dS/m. Maintain good drainage. Contact DAE if EC rises. [Demo]`,
      bn: `[SalinO-Crop] প্রিয় ${recipientName}, ${fieldLocation}-এ মাঝারি লবণাক্ততার ঝুঁকি। সরিষা বা সূর্যমুখী বিবেচনা করুন। মাটির EC ৫ dS/m-এর নিচে রাখুন। [ডেমো]`,
    },
    low_risk: {
      en: `[SalinO-Crop] Dear ${recipientName}, lower salinity risk at ${fieldLocation} this ${season}. Standard crops suitable. Continue monitoring after tidal/cyclone events. Annual soil testing recommended. [Demo]`,
      bn: `[SalinO-Crop] প্রিয় ${recipientName}, ${fieldLocation}-এ কম লবণাক্ততার ঝুঁকি। স্বাভাবিক ফসল চাষ করুন। বার্ষিক মাটি পরীক্ষা করুন। [ডেমো]`,
    },
    soil_test_reminder: {
      en: `[SalinO-Crop REMINDER] Dear ${recipientName}, soil EC test due for ${fieldLocation} before ${season} planting. Visit nearest DAE office or BRRI lab. Early testing = better crop decisions. [Demo]`,
      bn: `[SalinO-Crop রিমাইন্ডার] প্রিয় ${recipientName}, ${season} রোপণের আগে ${fieldLocation}-এ মাটির EC পরীক্ষা করুন। নিকটস্থ DAE অফিস বা BRRI ল্যাব পরিদর্শন করুন। [ডেমো]`,
    },
    crop_advisory: {
      en: `[SalinO-Crop] Dear ${recipientName}, crop advisory for ${fieldLocation}: ${cropName || 'BRRI dhan 47'} recommended for ${season}. Check water availability and soil conditions before planting. [Demo]`,
      bn: `[SalinO-Crop] প্রিয় ${recipientName}, ${fieldLocation}-এর জন্য ফসল পরামর্শ: ${season} মৌসুমে ${cropName || 'BRRI ধান ৪৭'} সুপারিশ করা হচ্ছে। রোপণের আগে পানি ও মাটির অবস্থা পরীক্ষা করুন। [ডেমো]`,
    },
    weather_alert: {
      en: `[SalinO-Crop WEATHER] Dear ${recipientName}, seasonal rainfall declining at ${fieldLocation}. This may increase soil salinity concentration. Monitor EC levels and delay planting if needed. [Demo]`,
      bn: `[SalinO-Crop আবহাওয়া] প্রিয় ${recipientName}, ${fieldLocation}-এ মৌসুমী বৃষ্টিপাত কমছে। এটি মাটির লবণাক্ততা বাড়াতে পারে। EC স্তর পর্যবেক্ষণ করুন। [ডেমো]`,
    },
    general: {
      en: `[SalinO-Crop] Dear ${recipientName}, salinity update for ${fieldLocation} — ${season} season. Stay updated on risk levels via SalinO-Crop. Contact local agricultural extension office for guidance. [Demo]`,
      bn: `[SalinO-Crop] প্রিয় ${recipientName}, ${fieldLocation}-এর ${season} মৌসুমের লবণাক্ততা আপডেট। SalinO-Crop-এর মাধ্যমে ঝুঁকির মাত্রা সম্পর্কে আপডেট থাকুন। [ডেমো]`,
    },
  };

  const tpl = templates[issueType];

  return {
    id,
    issueType,
    riskLevel,
    generatedAt: now,
    phone,
    recipientName,
    fieldLocation,
    messageText: tpl.en,
    messageBn: tpl.bn,
    status: 'pending',
    source: 'auto',
    season,
    cropName,
  };
}

// ─── Issue label display ──────────────────────────────────────
export const ISSUE_LABELS: Record<SmsIssueType, { label: string; labelBn: string; icon: string; color: string }> = {
  high_salinity:    { label: 'High Salinity Alert',     labelBn: 'উচ্চ লবণাক্ততা সতর্কতা',    icon: '🔴', color: '#dc2626' },
  moderate_salinity:{ label: 'Moderate Salinity',       labelBn: 'মাঝারি লবণাক্ততা',           icon: '🟡', color: '#d97706' },
  low_risk:         { label: 'Low Risk Update',         labelBn: 'কম ঝুঁকি আপডেট',             icon: '🟢', color: '#16a34a' },
  soil_test_reminder:{ label: 'Soil Test Reminder',    labelBn: 'মাটি পরীক্ষার রিমাইন্ডার',   icon: '🧪', color: '#0d9488' },
  crop_advisory:    { label: 'Crop Advisory',           labelBn: 'ফসল পরামর্শ',                icon: '🌾', color: '#1a5c38' },
  weather_alert:    { label: 'Weather Alert',           labelBn: 'আবহাওয়া সতর্কতা',           icon: '⛅', color: '#7c3aed' },
  general:          { label: 'General Update',          labelBn: 'সাধারণ আপডেট',              icon: '📨', color: '#374151' },
};
