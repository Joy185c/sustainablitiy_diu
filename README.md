# SalinO-Crop 🌾

**AI-Assisted Salinity Risk Intelligence and Climate-Resilient Crop Planning for Coastal Bangladesh**

Built for **Hack for Humanity — Hack to Protect the Environment** · Environmental Sustainability & Climate Resilience Track

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173
```

## 📋 Pages & Routes

| Route | Page |
|-------|------|
| `/` | Home Dashboard |
| `/risk-map` | Interactive Salinity Risk Map |
| `/climate` | Climate & Environmental Dashboard |
| `/crop-planner` | Crop Planning Assistant |
| `/farm-planner` | Farm Cost & Risk Comparison |
| `/advisory` | Bangla Advisory Centre |
| `/notifications` | SMS & Voice Advisory |
| `/extension` | Agricultural Extension Dashboard |
| `/methodology` | Data Sources & Methodology |
| `/about` | About & SDG Impact |

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Map**: Leaflet + react-leaflet (OpenStreetMap basemap)
- **Charts**: Recharts
- **i18n**: Custom React context (English + বাংলা)
- **Icons**: Lucide React
- **Fonts**: Inter (EN) + Hind Siliguri (BN) from Google Fonts

## ✅ Implemented Features

- Interactive salinity risk map with 7 demonstration field locations
- Crop planning assistant with transparent rules-based engine (7 BRRI/BARI-referenced crops)
- Farm cost & scenario comparison with 3 scenarios
- Bangla/English bilingual interface with full translation
- Bangla advisory generation (3 risk × season templates)
- SMS advisory with character count + copy
- Voice script generation with browser TTS preview (Web Speech API)
- Extension worker dashboard with search, filter, detail panel, CSV export
- Climate dashboard with rainfall, temperature, humidity, wind charts
- Full data methodology documentation
- All data labelled with status: Measured / Satellite-Derived / Demo / etc.

## ⚠ Data Disclaimer

All field data, satellite indicators, and environmental values in this MVP are **demonstration data**. No real field EC measurements or live API calls are used. See `/methodology` for full details.

## 🎯 SDGs Addressed

SDG 2 · SDG 6 · SDG 9 · SDG 10 · SDG 12 · SDG 13 · SDG 15

## 📍 Pilot Region

Satkhira District, Bangladesh · Future: Khulna, Bagerhat
