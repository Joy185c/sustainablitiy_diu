// ============================================================
// SalinO-Crop Mock Data Repository
// All data is labelled as DEMONSTRATION DATA unless specified.
// Replace with real API calls when live data is configured.
// ============================================================

export type RiskLevel = 'low' | 'moderate' | 'high';
export type DataStatus = 'measured' | 'satellite_derived' | 'model_estimate' | 'demonstration' | 'unavailable' | 'requires_verification';

// --- Field / Location ---
export interface Field {
  id: string;
  name: string;
  union: string;
  upazila: string;
  district: string;
  lat: number;
  lng: number;
  area: number;
  area_unit: 'bigha' | 'hectare' | 'acre';
  risk: RiskLevel;
  data_status: DataStatus;
  flagged: boolean;
  needs_soil_test: boolean;
  last_obs_date: string;
  soil_ec?: number;
  ec_unit?: string;
  satellite_indicator?: string;
  satellite_source?: string;
  next_step: string;
  why_flagged?: string;
}

export const FIELDS: Field[] = [
  {
    id: 'F001', name: 'Paddy Field — Kaliganj North', union: 'Nalta', upazila: 'Kaliganj', district: 'Satkhira',
    lat: 22.423, lng: 89.124, area: 2.5, area_unit: 'bigha', risk: 'high', data_status: 'demonstration',
    flagged: true, needs_soil_test: true, last_obs_date: '2025-09-20',
    satellite_indicator: 'NDVI depression + elevated spectral salinity proxy', satellite_source: 'Sentinel-2 (20 m SWIR) — Demo',
    next_step: 'Conduct soil EC measurement at 0–15 cm depth. Consult extension worker.',
    why_flagged: 'Satellite spectral proxy and historical flooding pattern suggest elevated salinity risk. No measured EC available.',
  },
  {
    id: 'F002', name: 'Shrimp-to-Crop Conversion — Shyamnagar', union: 'Burigoalini', upazila: 'Shyamnagar', district: 'Satkhira',
    lat: 21.875, lng: 89.035, area: 1.8, area_unit: 'bigha', risk: 'high', data_status: 'demonstration',
    flagged: true, needs_soil_test: true, last_obs_date: '2025-09-15',
    satellite_indicator: 'Persistent tidal inundation signature', satellite_source: 'Sentinel-1 SAR (10 m) — Demo',
    next_step: 'Prioritise soil washing and leaching before planting. Soil test recommended.',
    why_flagged: 'Location in former shrimp gher area with history of prolonged seawater exposure.',
  },
  {
    id: 'F003', name: 'Vegetable Plot — Assasuni Upazila', union: 'Shyamnagar Union', upazila: 'Assasuni', district: 'Satkhira',
    lat: 22.511, lng: 89.141, area: 0.75, area_unit: 'bigha', risk: 'moderate', data_status: 'demonstration',
    flagged: true, needs_soil_test: false, last_obs_date: '2025-10-01',
    satellite_indicator: 'Moderate vegetation stress — NDVI 0.42', satellite_source: 'Sentinel-2 — Demo',
    next_step: 'Monitor seasonal rainfall. Consider salinity-tolerant vegetable varieties.',
    why_flagged: 'Moderate spectral stress indicator and proximity to saline water channel.',
  },
  {
    id: 'F004', name: 'Aman Rice — Tala Upazila', union: 'Tala Sadar', upazila: 'Tala', district: 'Satkhira',
    lat: 22.677, lng: 89.253, area: 3.2, area_unit: 'bigha', risk: 'low', data_status: 'demonstration',
    flagged: false, needs_soil_test: false, last_obs_date: '2025-10-05',
    satellite_indicator: 'Healthy NDVI — 0.61, low salinity proxy', satellite_source: 'Sentinel-2 — Demo',
    next_step: 'Continue current Aman cultivation. Monitor after cyclone season.',
    why_flagged: undefined,
  },
  {
    id: 'F005', name: 'Sunflower Trial — Debhata', union: 'Debhata Sadar', upazila: 'Debhata', district: 'Satkhira',
    lat: 22.570, lng: 89.020, area: 1.1, area_unit: 'bigha', risk: 'moderate', data_status: 'demonstration',
    flagged: true, needs_soil_test: true, last_obs_date: '2025-09-28',
    satellite_indicator: 'Moderate NDVI — 0.48', satellite_source: 'Sentinel-2 — Demo',
    next_step: 'Soil EC test recommended before Rabi season. BRRI advisory consultation.',
    why_flagged: 'Moderate risk zone — sunflower trial area with uncertain EC history.',
  },
  {
    id: 'F006', name: 'Mustard Field — Kalaroa', union: 'Kalaroa Sadar', upazila: 'Kalaroa', district: 'Satkhira',
    lat: 22.786, lng: 89.202, area: 2.0, area_unit: 'bigha', risk: 'low', data_status: 'demonstration',
    flagged: false, needs_soil_test: false, last_obs_date: '2025-10-02',
    satellite_indicator: 'Healthy NDVI — 0.58', satellite_source: 'Sentinel-2 — Demo',
    next_step: 'Suitable for Rabi mustard. Continue standard practices.',
    why_flagged: undefined,
  },
  {
    id: 'F007', name: 'Waterlogged Zone — Satkhira Sadar', union: 'Satkhira Sadar', upazila: 'Satkhira Sadar', district: 'Satkhira',
    lat: 22.715, lng: 89.070, area: 4.5, area_unit: 'bigha', risk: 'high', data_status: 'demonstration',
    flagged: true, needs_soil_test: true, last_obs_date: '2025-09-18',
    satellite_indicator: 'Severe inundation — SAR water fraction 0.82', satellite_source: 'Sentinel-1 SAR — Demo',
    next_step: 'Drainage improvement needed. Delay planting. Consult BARC for waterlogging-tolerant varieties.',
    why_flagged: 'High waterlogging fraction detected via SAR. Combined waterlogging and salinity risk.',
  },
];

// --- Climate / Environmental Data (Sample dataset — NASA POWER API format) ---
export interface ClimatePoint {
  month: string;
  rainfall_mm: number;
  temp_max_c: number;
  temp_min_c: number;
  humidity_pct: number;
  wind_kmh: number;
}

export const CLIMATE_DATA_2024_2025: ClimatePoint[] = [
  { month: 'Nov 24', rainfall_mm: 18, temp_max_c: 29.2, temp_min_c: 17.8, humidity_pct: 72, wind_kmh: 8.4 },
  { month: 'Dec 24', rainfall_mm: 6,  temp_max_c: 26.1, temp_min_c: 13.2, humidity_pct: 68, wind_kmh: 7.1 },
  { month: 'Jan 25', rainfall_mm: 9,  temp_max_c: 25.4, temp_min_c: 11.8, humidity_pct: 70, wind_kmh: 6.8 },
  { month: 'Feb 25', rainfall_mm: 22, temp_max_c: 28.3, temp_min_c: 15.1, humidity_pct: 71, wind_kmh: 7.5 },
  { month: 'Mar 25', rainfall_mm: 45, temp_max_c: 32.6, temp_min_c: 19.4, humidity_pct: 74, wind_kmh: 9.2 },
  { month: 'Apr 25', rainfall_mm: 78, temp_max_c: 35.1, temp_min_c: 23.6, humidity_pct: 78, wind_kmh: 10.1 },
  { month: 'May 25', rainfall_mm: 142,temp_max_c: 34.8, temp_min_c: 25.1, humidity_pct: 83, wind_kmh: 12.3 },
  { month: 'Jun 25', rainfall_mm: 268,temp_max_c: 32.2, temp_min_c: 25.4, humidity_pct: 89, wind_kmh: 14.7 },
  { month: 'Jul 25', rainfall_mm: 312,temp_max_c: 31.1, temp_min_c: 25.8, humidity_pct: 91, wind_kmh: 13.2 },
  { month: 'Aug 25', rainfall_mm: 295,temp_max_c: 31.4, temp_min_c: 25.6, humidity_pct: 90, wind_kmh: 12.8 },
  { month: 'Sep 25', rainfall_mm: 198,temp_max_c: 31.8, temp_min_c: 24.9, humidity_pct: 87, wind_kmh: 11.4 },
  { month: 'Oct 25', rainfall_mm: 89, temp_max_c: 30.5, temp_min_c: 22.3, humidity_pct: 80, wind_kmh: 9.8 },
];

// Salinity risk trend (illustrative demonstration)
export interface RiskTrendPoint {
  month: string;
  risk_index: number; // 0–10 scale, illustrative
  avg_ec_proxy?: number;
}

export const RISK_TREND_DATA: RiskTrendPoint[] = [
  { month: 'Nov 24', risk_index: 3.2, avg_ec_proxy: 2.1 },
  { month: 'Dec 24', risk_index: 2.8, avg_ec_proxy: 1.9 },
  { month: 'Jan 25', risk_index: 2.5, avg_ec_proxy: 1.7 },
  { month: 'Feb 25', risk_index: 2.9, avg_ec_proxy: 2.0 },
  { month: 'Mar 25', risk_index: 4.1, avg_ec_proxy: 3.2 },
  { month: 'Apr 25', risk_index: 5.3, avg_ec_proxy: 4.1 },
  { month: 'May 25', risk_index: 6.2, avg_ec_proxy: 4.8 },
  { month: 'Jun 25', risk_index: 4.8, avg_ec_proxy: 3.6 },
  { month: 'Jul 25', risk_index: 3.9, avg_ec_proxy: 2.8 },
  { month: 'Aug 25', risk_index: 3.5, avg_ec_proxy: 2.4 },
  { month: 'Sep 25', risk_index: 4.2, avg_ec_proxy: 3.1 },
  { month: 'Oct 25', risk_index: 5.1, avg_ec_proxy: 4.0 },
];

// --- Crop Rules Engine ---
export interface CropRule {
  id: string;
  crop_name: string;
  crop_name_bn: string;
  variety?: string;
  applicable_seasons: string[];
  max_salinity_ec_ds_m: number; // dS/m — salinity tolerance threshold
  salinity_tolerance_label: string;
  salinity_tolerance_ref: string;
  water_requirement: 'low' | 'moderate' | 'high';
  water_req_label: string;
  min_water_availability: 'limited' | 'moderate' | 'adequate';
  priority_fit: ('lower_cost' | 'risk_reduction' | 'potential_return')[];
  input_level: 'low' | 'moderate' | 'high';
  expected_yield_range: string;
  local_relevance: string;
  source: string;
  verification_status: 'locally_verified' | 'reference_based' | 'illustrative';
  notes: string;
}

export const CROP_RULES: CropRule[] = [
  {
    id: 'CR001', crop_name: 'BRRI dhan 47 (Salinity-tolerant Aman Rice)', crop_name_bn: 'বিআরআরআই ধান ৪৭ (লবণ-সহনশীল আমন ধান)',
    variety: 'BRRI dhan 47', applicable_seasons: ['kharif'],
    max_salinity_ec_ds_m: 8.0, salinity_tolerance_label: 'Moderate–High (up to 8 dS/m)',
    salinity_tolerance_ref: 'Bangladesh Rice Research Institute (BRRI), 2022 — BRRI dhan 47 tolerates up to 8 dS/m at seedling stage',
    water_requirement: 'high', water_req_label: 'High (monsoon rain-fed)', min_water_availability: 'adequate',
    priority_fit: ['risk_reduction', 'lower_cost'],
    input_level: 'moderate', expected_yield_range: '3.5–4.5 t/ha (irrigated); 2.5–3.5 t/ha (rain-fed)',
    local_relevance: 'Widely cultivated in coastal Satkhira and Khulna. BRRI-recommended for saline-affected Aman season.',
    source: 'BRRI, BARC Crop Zoning Map 2023', verification_status: 'locally_verified',
    notes: 'Best for moderate-to-high salinity fields. Plant after first monsoon rains to flush surface salts.',
  },
  {
    id: 'CR002', crop_name: 'BRRI dhan 40 (Saline-tolerant Boro Rice)', crop_name_bn: 'বিআরআরআই ধান ৪০ (লবণ-সহনশীল বোরো ধান)',
    variety: 'BRRI dhan 40', applicable_seasons: ['rabi'],
    max_salinity_ec_ds_m: 6.0, salinity_tolerance_label: 'Moderate (up to 6 dS/m)',
    salinity_tolerance_ref: 'BRRI Crop Management Guide, 2021',
    water_requirement: 'high', water_req_label: 'High (requires irrigation)', min_water_availability: 'adequate',
    priority_fit: ['risk_reduction'],
    input_level: 'high', expected_yield_range: '4.5–5.5 t/ha (irrigated)',
    local_relevance: 'Suitable for Rabi season where fresh-water irrigation is available.',
    source: 'BRRI', verification_status: 'locally_verified',
    notes: 'Requires fresh-water irrigation — avoid if only saline groundwater available. Higher input cost.',
  },
  {
    id: 'CR003', crop_name: 'Sunflower (BARI Surjamukhi-2)', crop_name_bn: 'সূর্যমুখী (বারি সূর্যমুখী-২)',
    variety: 'BARI Surjamukhi-2', applicable_seasons: ['rabi', 'pre_kharif'],
    max_salinity_ec_ds_m: 5.0, salinity_tolerance_label: 'Moderate (up to 5 dS/m)',
    salinity_tolerance_ref: 'Bangladesh Agricultural Research Institute (BARI), Oilseed Research Centre',
    water_requirement: 'moderate', water_req_label: 'Moderate',  min_water_availability: 'moderate',
    priority_fit: ['potential_return', 'lower_cost'],
    input_level: 'moderate', expected_yield_range: '1.8–2.5 t/ha',
    local_relevance: 'Growing adoption in coastal Bangladesh. Generates cooking-oil-grade seeds. Good margins.',
    source: 'BARI, DAE Extension Bulletins', verification_status: 'reference_based',
    notes: 'Suitable for well-drained soils. Avoid waterlogged fields. Short growing period (~90 days).',
  },
  {
    id: 'CR004', crop_name: 'Sweet Potato (BARI Mishti Alu-8)', crop_name_bn: 'মিষ্টি আলু (বারি মিষ্টি আলু-৮)',
    variety: 'BARI Mishti Alu-8', applicable_seasons: ['rabi'],
    max_salinity_ec_ds_m: 4.5, salinity_tolerance_label: 'Moderate (up to 4.5 dS/m)',
    salinity_tolerance_ref: 'BARI Root Crop Research Centre',
    water_requirement: 'low', water_req_label: 'Low–Moderate', min_water_availability: 'limited',
    priority_fit: ['lower_cost', 'potential_return'],
    input_level: 'low', expected_yield_range: '12–18 t/ha (fresh weight)',
    local_relevance: 'Low-input crop with good market in Satkhira. Tolerates brief dry spells.',
    source: 'BARI', verification_status: 'reference_based',
    notes: 'Good for fields with moderate salinity and limited irrigation. High caloric yield per unit cost.',
  },
  {
    id: 'CR005', crop_name: 'Red Amaranth / Lal Shak', crop_name_bn: 'লাল শাক',
    variety: 'Local varieties', applicable_seasons: ['rabi', 'pre_kharif'],
    max_salinity_ec_ds_m: 3.5, salinity_tolerance_label: 'Low–Moderate (up to 3.5 dS/m)',
    salinity_tolerance_ref: 'DAE Extension, Bangladesh (illustrative)',
    water_requirement: 'low', water_req_label: 'Low', min_water_availability: 'limited',
    priority_fit: ['lower_cost'],
    input_level: 'low', expected_yield_range: '4–8 t/ha',
    local_relevance: 'Fast-growing leafy vegetable. Good for home gardens and small plots. Short cycle ~30 days.',
    source: 'DAE Bangladesh', verification_status: 'illustrative',
    notes: 'Most suitable for lower-salinity fields. Quick cash crop between main seasons.',
  },
  {
    id: 'CR006', crop_name: 'Mustard (BARI Sarisha-14)', crop_name_bn: 'সরিষা (বারি সরিষা-১৪)',
    variety: 'BARI Sarisha-14', applicable_seasons: ['rabi'],
    max_salinity_ec_ds_m: 4.0, salinity_tolerance_label: 'Moderate (up to 4 dS/m)',
    salinity_tolerance_ref: 'BARI Oilseed Research, 2020',
    water_requirement: 'low', water_req_label: 'Low', min_water_availability: 'limited',
    priority_fit: ['lower_cost', 'potential_return'],
    input_level: 'low', expected_yield_range: '1.2–1.8 t/ha',
    local_relevance: 'Traditional Rabi crop in Satkhira. Low water requirement. Cooking oil value chain.',
    source: 'BARI, BARC', verification_status: 'reference_based',
    notes: 'Well-suited to Rabi season with residual soil moisture. Avoid if EC > 4 dS/m.',
  },
  {
    id: 'CR007', crop_name: 'Mangrove-Associated Aquaculture (Integrated)', crop_name_bn: 'ম্যানগ্রোভ-সংযুক্ত জলজ চাষ',
    variety: 'Integrated farming', applicable_seasons: ['kharif', 'rabi', 'pre_kharif'],
    max_salinity_ec_ds_m: 20.0, salinity_tolerance_label: 'High tolerance (brackish water system)',
    salinity_tolerance_ref: 'WorldFish Center, CGIAR, 2022',
    water_requirement: 'high', water_req_label: 'Requires brackish water access', min_water_availability: 'adequate',
    priority_fit: ['potential_return', 'risk_reduction'],
    input_level: 'moderate', expected_yield_range: 'Variable — system dependent',
    local_relevance: 'Where land is highly saline and unsuitable for crops, integrated mangrove-aquaculture can sustain livelihoods.',
    source: 'WorldFish / CGIAR / BRRI', verification_status: 'illustrative',
    notes: 'Not a crop in the traditional sense. Suitable for heavily saline fields where crop conversion is not yet feasible.',
  },
];

// --- Advisory Templates ---
export interface AdvisoryTemplate {
  risk: RiskLevel;
  season: string;
  crop?: string;
  text_en: string;
  text_bn: string;
  sms_bn: string;
  voice_bn: string;
  confidence: string;
  limitations: string;
}

export const ADVISORY_TEMPLATES: AdvisoryTemplate[] = [
  {
    risk: 'high', season: 'kharif', crop: 'BRRI dhan 47',
    text_en: `⚠ HIGH SALINITY RISK ADVISORY — Satkhira District\n\nCurrent environmental indicators suggest elevated salinity risk in your area for the Kharif (Jun–Oct) season.\n\n📋 RECOMMENDED ACTIONS:\n• Use BRRI dhan 47 — a salinity-tolerant Aman rice variety recommended by BRRI for coastal areas.\n• Conduct soil EC test before transplanting seedlings. Ideal: below 8 dS/m at transplanting.\n• Apply initial irrigation with fresh water to leach surface salts if possible.\n• Delay transplanting until after first heavy monsoon rains to benefit from natural leaching.\n• Prepare raised seedbeds if waterlogging risk is also present.\n• Consult your local agricultural extension officer for field-specific advice.\n\n🔬 DATA NOTICE: This advisory is based on illustrative demonstration data and satellite-derived spectral indicators. Conduct a soil EC test for field-specific guidance.\n\n📞 Contact: Bangladesh Agricultural Development Corporation (BADC) helpline or local DAE extension office.`,
    text_bn: `⚠ উচ্চ লবণাক্ততা ঝুঁকির পরামর্শ — সাতক্ষীরা জেলা\n\nবর্তমান পরিবেশগত সূচকগুলি খরিফ (জুন–অক্টোবর) মৌসুমে আপনার এলাকায় উচ্চ লবণাক্ততার ঝুঁকি নির্দেশ করছে।\n\n📋 প্রস্তাবিত পদক্ষেপ:\n• বিআরআরআই ধান ৪৭ ব্যবহার করুন — উপকূলীয় এলাকার জন্য বিআরআরআই সুপারিশকৃত লবণ-সহনশীল আমন ধানের জাত।\n• চারা রোপণের আগে মাটির EC পরীক্ষা করুন। আদর্শ: রোপণের সময় ৮ dS/m-এর নিচে।\n• সম্ভব হলে মিষ্টি পানি দিয়ে সেচ দিয়ে উপরিভাগের লবণ ধুয়ে নিন।\n• প্রাকৃতিক ধৌতকরণের সুবিধা নিতে প্রথম ভারী বর্ষার বৃষ্টির পরে রোপণ করুন।\n• জলাবদ্ধতার ঝুঁকিও থাকলে উঁচু বীজতলা তৈরি করুন।\n• মাঠ-নির্দিষ্ট পরামর্শের জন্য স্থানীয় কৃষি সম্প্রসারণ কর্মকর্তার সাথে যোগাযোগ করুন।\n\n🔬 ডেটার নোটিশ: এই পরামর্শ চিত্রিত ডেমো ডেটা এবং স্যাটেলাইট-ব্যুৎপন্ন বর্ণালী সূচকের উপর ভিত্তি করে। মাঠ-নির্দিষ্ট নির্দেশনার জন্য মাটির EC পরীক্ষা করুন।`,
    sms_bn: `[SalinO-Crop ডেমো] সাতক্ষীরা — উচ্চ লবণাক্ততা ঝুঁকি। বিআরআরআই ধান ৪৭ ব্যবহার করুন। রোপণের আগে মাটি পরীক্ষা করুন। বিস্তারিত জানতে সম্প্রসারণ কর্মকর্তার সাথে যোগাযোগ করুন।`,
    voice_bn: `প্রিয় কৃষক, SalinO-Crop প্ল্যাটফর্ম থেকে আপনার জন্য গুরুত্বপূর্ণ পরামর্শ। আপনার এলাকায় এই খরিফ মৌসুমে উচ্চ লবণাক্ততার ঝুঁকি রয়েছে। বাংলাদেশ ধান গবেষণা ইনস্টিটিউট সুপারিশকৃত বিআরআরআই ধান ৪৭ জাতটি ব্যবহার করুন, যা লবণাক্ত মাটিতে ভালো ফলন দেয়। রোপণের আগে অবশ্যই মাটির EC পরীক্ষা করুন এবং স্থানীয় কৃষি সম্প্রসারণ কর্মকর্তার পরামর্শ নিন। এই বার্তাটি ডেমো উদ্দেশ্যে তৈরি করা হয়েছে।`,
    confidence: 'Low-Medium — Illustrative demo data. No field EC measurement available.',
    limitations: 'Based on satellite-derived indicators and regional defaults. Actual risk may differ. Soil EC measurement required for field-specific guidance.',
  },
  {
    risk: 'moderate', season: 'rabi', crop: 'Mustard / Sunflower',
    text_en: `ℹ MODERATE SALINITY RISK ADVISORY — Satkhira District\n\nEnvironmental indicators suggest moderate salinity risk for the Rabi (Nov–Feb) season.\n\n📋 RECOMMENDED ACTIONS:\n• Consider mustard (BARI Sarisha-14) or sunflower (BARI Surjamukhi-2) for Rabi season.\n• These oilseed crops tolerate moderate salinity (up to 4–5 dS/m) and have low water requirements.\n• Conduct a soil EC test. If EC is below 4 dS/m, mustard is viable. If 4–5 dS/m, sunflower may be more suitable.\n• Ensure adequate soil moisture at planting. Supplement with minimal irrigation if needed.\n• Maintain field drainage to prevent salt accumulation.\n\n🔬 DATA NOTICE: Demonstration data. Verify with local soil test.\n\n📞 Contact local DAE office for seed procurement and extension support.`,
    text_bn: `ℹ মাঝারি লবণাক্ততা ঝুঁকির পরামর্শ — সাতক্ষীরা জেলা\n\nপরিবেশগত সূচকগুলি রবি (নভেম্বর–ফেব্রুয়ারি) মৌসুমে মাঝারি লবণাক্ততার ঝুঁকি নির্দেশ করছে।\n\n📋 প্রস্তাবিত পদক্ষেপ:\n• রবি মৌসুমের জন্য সরিষা (বারি সরিষা-১৪) বা সূর্যমুখী (বারি সূর্যমুখী-২) বিবেচনা করুন।\n• এই তেলবীজ ফসলগুলি মাঝারি লবণাক্ততা (৪–৫ dS/m পর্যন্ত) সহ্য করে এবং কম পানি প্রয়োজন।\n• মাটির EC পরীক্ষা করুন। যদি EC ৪ dS/m-এর নিচে হয়, সরিষা উপযুক্ত। ৪–৫ dS/m হলে সূর্যমুখী বেশি উপযুক্ত হতে পারে।\n• রোপণের সময় পর্যাপ্ত মাটির আর্দ্রতা নিশ্চিত করুন। প্রয়োজনে ন্যূনতম সেচ দিন।\n• লবণ জমা রোধে মাঠের নিষ্কাশন বজায় রাখুন।\n\n🔬 ডেটার নোটিশ: ডেমো ডেটা। স্থানীয় মাটি পরীক্ষায় যাচাই করুন।`,
    sms_bn: `[SalinO-Crop ডেমো] সাতক্ষীরা — মাঝারি লবণাক্ততা। রবি মৌসুমে সরিষা বা সূর্যমুখী চাষের চিন্তা করুন। মাটি পরীক্ষা করুন (EC ৪-৫ dS/m)। DAE অফিসে যোগাযোগ করুন।`,
    voice_bn: `প্রিয় কৃষক, SalinO-Crop প্ল্যাটফর্ম থেকে আপনার জন্য পরামর্শ। আপনার এলাকায় মাঝারি লবণাক্ততার ঝুঁকি রয়েছে। এই রবি মৌসুমে বারি সরিষা-১৪ বা বারি সূর্যমুখী-২ জাতটি বিবেচনা করতে পারেন। এই ফসলগুলি মাঝারি লবণাক্তে ভালো ফলন দেয় এবং কম পানি দরকার। মাটির EC পরীক্ষা করুন এবং স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। এটি একটি ডেমো বার্তা।`,
    confidence: 'Low-Medium — Illustrative demo data. Soil EC test recommended.',
    limitations: 'Moderate risk assessment based on satellite spectral indicators. Actual EC may vary.',
  },
  {
    risk: 'low', season: 'rabi', crop: 'Mustard / Sweet Potato',
    text_en: `✅ LOWER SALINITY RISK — Satkhira District\n\nEnvironmental indicators suggest lower salinity risk in your area for Rabi season.\n\n📋 RECOMMENDED ACTIONS:\n• Your field conditions appear suitable for standard Rabi crops including mustard, vegetables, or sweet potato.\n• Continue monitoring environmental conditions, particularly after any cyclone or tidal events.\n• Conduct routine soil EC testing annually to detect gradual salinity changes.\n• Explore higher-value Rabi crops such as oilseeds or vegetables to improve income.\n\n🔬 DATA NOTICE: Demonstration data. Lower risk does not mean zero risk. Annual soil testing recommended.\n\n📞 Contact local DAE office for guidance on seed varieties and crop management.`,
    text_bn: `✅ কম লবণাক্ততার ঝুঁকি — সাতক্ষীরা জেলা\n\nপরিবেশগত সূচকগুলি রবি মৌসুমে আপনার এলাকায় কম লবণাক্ততার ঝুঁকি নির্দেশ করছে।\n\n📋 প্রস্তাবিত পদক্ষেপ:\n• আপনার মাঠের পরিস্থিতি সরিষা, সবজি বা মিষ্টি আলু সহ মানক রবি ফসলের জন্য উপযুক্ত বলে মনে হচ্ছে।\n• বিশেষ করে যেকোনো ঘূর্ণিঝড় বা জোয়ারের ঘটনার পরে পরিবেশগত পরিস্থিতি পর্যবেক্ষণ করতে থাকুন।\n• ধীরে ধীরে লবণাক্ততার পরিবর্তন সনাক্ত করতে বার্ষিক মাটির EC পরীক্ষা করুন।\n• আয় বাড়াতে তেলবীজ বা সবজির মতো উচ্চ-মূল্যের রবি ফসল অন্বেষণ করুন।\n\n🔬 ডেটার নোটিশ: ডেমো ডেটা। কম ঝুঁকির মানে শূন্য ঝুঁকি নয়। বার্ষিক মাটি পরীক্ষার পরামর্শ দেওয়া হয়।`,
    sms_bn: `[SalinO-Crop ডেমো] সাতক্ষীরা — কম লবণাক্ততার ঝুঁকি। সরিষা, সবজি বা মিষ্টি আলু চাষ উপযুক্ত। বার্ষিক মাটি পরীক্ষা করুন।`,
    voice_bn: `প্রিয় কৃষক, SalinO-Crop প্ল্যাটফর্ম থেকে সুখবর। আপনার এলাকায় এই মৌসুমে লবণাক্ততার ঝুঁকি কম। আপনার মাঠে সরিষা, সবজি বা মিষ্টি আলু চাষ করা যাবে। তবুও প্রতি বছর মাটি পরীক্ষা করুন এবং যেকোনো ঘূর্ণিঝড়ের পরে পরিস্থিতি পর্যবেক্ষণ করুন। স্থানীয় কৃষি অফিসে যোগাযোগ করুন। এটি একটি ডেমো বার্তা।`,
    confidence: 'Low — Illustrative demo data. Annual soil testing still recommended.',
    limitations: 'Lower risk based on satellite indicators only. Monitor after tidal or cyclone events.',
  },
];

// --- Dashboard summary data ---
export const DASHBOARD_SUMMARY = {
  risk_level: 'moderate' as RiskLevel,
  risk_label: 'Moderate Indicated Risk',
  risk_value: '5.1 / 10',
  risk_source: 'Demonstration data — satellite spectral proxy + regional model',
  latest_obs_date: '2025-10-05',
  latest_obs_source: 'Sentinel-2 L2A (Demo)',
  rainfall_7day_mm: 89,
  rainfall_trend: 'declining' as const,
  fields_flagged: 4,
  fields_total: FIELDS.length,
};

// --- Recent advisories for dashboard ---
export const RECENT_ADVISORIES = [
  { id: 'A001', date: '2025-10-10', type: 'Risk Alert', summary: 'Elevated salinity indicators detected in Kaliganj North following post-monsoon tidal inundation.', risk: 'high' as RiskLevel, lang: 'en' },
  { id: 'A002', date: '2025-10-08', type: 'Crop Guidance', summary: 'Rabi season planning: Mustard and sunflower recommended for moderate-salinity zones in Assasuni.', risk: 'moderate' as RiskLevel, lang: 'en' },
  { id: 'A003', date: '2025-10-05', type: 'Soil Testing', summary: 'Soil EC verification recommended for 4 flagged locations before winter planting begins.', risk: 'moderate' as RiskLevel, lang: 'en' },
];
