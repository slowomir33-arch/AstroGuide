---
name: astro-calc
description: >
  Comprehensive astrological calculation engine. Use this skill whenever the user provides
  a birth date, birth time, and birth place and wants any form of astrological analysis:
  natal chart, harmonic analysis, synastry, transits, sidereal/vedic chart, dignity tables,
  element/modality balance, aspect patterns, nakshatra placement, or any esoteric profile.
  Also trigger when the user says "calculate my chart", "natal chart", "birth chart",
  "harmonic astrology", "vedic chart", "jyotish", "sidereal chart", "tropicalny horoskop",
  "syderyczny horoskop", "harmoniki", "nakszatry", "aspekty natalne", or asks about
  planetary positions for a given date. This skill handles ALL astronomical and astrological
  computations — from raw ephemeris lookup through final interpretation-ready data structures.
  It does NOT require any external API or internet access — all calculations are done locally
  with bundled Swiss Ephemeris data via the pyswisseph library.
---

# Astro-Calc: Astrological Calculation Engine

## Overview

This skill enables any AI agent to produce professional-grade astrological calculations
from minimal input (date, time, place of birth). It outputs structured JSON that can
feed dashboards, reports, or further analysis.

## Required Input

The minimum input is:
- **Date of birth** (YYYY-MM-DD)
- **Time of birth** (HH:MM, 24h format, local time)
- **Place of birth** (city name OR latitude/longitude)

Optional:
- **Timezone** (if not provided, inferred from coordinates)
- **House system** (default: Placidus; options: Koch, Equal, Whole Sign, Campanus, Porphyry)
- **Ayanamsa** (default: Lahiri; options: Raman, Krishnamurti, Fagan-Bradley, True Chitrapaksha)

## Setup

Before running calculations, install the required library:

```bash
pip install pyswisseph --break-system-packages
```

Then run the calculation engine:

```bash
python /path/to/skill/scripts/natal_calc.py \
  --date "1983-02-19" \
  --time "10:53" \
  --lat 50.2864 \
  --lon 19.1048 \
  --tz "Europe/Warsaw" \
  [--house-system placidus] \
  [--ayanamsa lahiri] \
  [--harmonics 1,3,5,7,9,11,13,17,19] \
  [--output json|markdown|both]
```

If the user provides a city name instead of coordinates, use the geocoding helper:

```bash
python /path/to/skill/scripts/natal_calc.py \
  --date "1983-02-19" \
  --time "10:53" \
  --city "Sosnowiec, Poland" \
  [--output both]
```

The script includes a built-in city database for 500+ major cities. For unknown cities,
it will print an error asking for manual lat/lon input.

## Output Structure

The script outputs a JSON object with these sections:

```
{
  "input": { date, time, lat, lon, tz, house_system, ayanamsa },
  "tropical": {
    "planets": { Sun: { lon, lat, speed, sign, degree, minute, second, house, dignity }, ... },
    "angles": { Asc, MC, Dsc, IC },
    "houses": [ { cusp, sign, degree }, ... ],
    "aspects": [ { planet1, planet2, type, angle, orb, strength, nature }, ... ],
    "patterns": [ { type: "T-Square"|"Grand Trine"|..., planets, description }, ... ],
    "elements": { fire, earth, air, water },
    "modalities": { cardinal, fixed, mutable },
    "polarities": { positive, negative },
    "chart_shape": "Bundle|Bowl|Bucket|Locomotive|Splay|Splash|Seesaw",
    "chart_ruler": { planet, sign, house, dignity },
    "stelliums": [ { sign, house, planets }, ... ]
  },
  "sidereal": {
    "ayanamsa_value": 23.59,
    "planets": { ... same structure as tropical ... },
    "nakshatras": { Sun: { nakshatra, pada, ruler, deity, nature, degree_in_nakshatra }, ... },
    "elements": { ... },
    "dignity_comparison": { planet: { tropical_dignity, sidereal_dignity, delta }, ... }
  },
  "harmonics": {
    "H1": { positions: {...}, aspects: [...], strength: N },
    "H3": { ... },
    ...
    "strength_ranking": [ { harmonic, strength, keyword }, ... ],
    "clusters": {
      "individuality": { harmonics: [11,13,17], avg_strength },
      "spirituality": { harmonics: [7,9,19], avg_strength },
      "creativity": { harmonics: [5,15,20], avg_strength },
      "tension": { harmonics: [2,4,8,16], avg_strength },
      "flow": { harmonics: [3,6,19], avg_strength }
    }
  },
  "metadata": { calculated_at, engine_version, ephemeris }
}
```

## Calculation Pipeline

The script executes these steps in order:

### Step 1: Input Validation & Geocoding
- Parse date/time, validate ranges
- Convert city name → lat/lon (if needed) using built-in database
- Determine timezone offset for birth moment (handles DST)
- Convert local time → UTC (Julian Day Number)

### Step 2: Tropical Planetary Positions
- Calculate positions for: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn,
  Uranus, Neptune, Pluto, North Node, Chiron, Lilith (Mean)
- For each body: ecliptic longitude, latitude, daily speed, retrograde status
- Convert longitude → sign, degree, minute, second

### Step 3: House Cusps & Angles
- Calculate house cusps using selected system (default Placidus)
- Extract Ascendant, MC, Descendant, IC
- Assign each planet to its house

### Step 4: Aspects
- Check all planet pairs for aspects:
  - Major: conjunction (0°), opposition (180°), trine (120°), square (90°), sextile (60°)
  - Minor: semi-sextile (30°), quincunx (150°), semi-square (45°), sesquiquadrate (135°)
  - Creative: quintile (72°), bi-quintile (144°)
  - Harmonic: septile (51.43°), novile (40°)
- Apply orbs: luminaries get wider orbs, outer planets get tighter
- Calculate strength = weight × (1 - deviation/orb)
- Classify nature: harmonious, tense, creative, fated

### Step 5: Pattern Detection
- T-Square: 2 planets in opposition, both square a 3rd
- Grand Trine: 3 planets each 120° apart
- Grand Cross: 4 planets at 90° intervals
- Yod (Finger of God): 2 planets sextile, both quincunx a 3rd
- Kite: Grand Trine + 1 planet opposing the apex
- Stellium: 3+ planets within 8° or in same sign
- Mystic Rectangle: 2 oppositions + 2 trines + 2 sextiles

### Step 6: Dignities
- Essential: Domicile, Exaltation, Detriment, Fall, Peregrine
- Include both traditional and modern rulers
- Score: Domicile +5, Exaltation +4, Detriment -3, Fall -4, Peregrine 0

### Step 7: Element/Modality/Polarity Balance
- Weighted by planet type:
  - Luminaries (Sun, Moon): weight 3
  - Personal (Mercury, Venus, Mars): weight 2
  - Social (Jupiter, Saturn): weight 1.5
  - Transpersonal (Uranus, Neptune, Pluto): weight 1
- Ascendant and MC add weight 1.5 each

### Step 8: Chart Shape
- Analyze planetary distribution around the wheel
- Classify into Jones patterns (Bundle, Bowl, etc.)

### Step 9: Sidereal Conversion
- Subtract ayanamsa from all tropical positions
- Ayanamsa calculated for exact birth moment (precession rate ~50.3"/year)
- Recalculate signs, dignities, elements for sidereal positions
- Aspects remain IDENTICAL (geometry unchanged)

### Step 10: Nakshatra Placement
- Divide sidereal zodiac into 27 nakshatras (13°20' each)
- Each nakshatra has 4 padas (quarters of 3°20')
- For each planet: nakshatra name, pada, ruling planet, deity, shakti (power)

### Step 11: Harmonic Charts
- For each requested harmonic H:
  - Multiply all natal longitudes by H, mod 360
  - Find aspects in harmonic chart (tighter orbs: ×0.5)
  - Calculate harmonic strength = Σ(aspect weights) / normalizer
- Rank harmonics by strength
- Group into thematic clusters

### Step 12: Output
- Assemble full JSON structure
- If markdown requested, also generate human-readable report
- Write to stdout or file

## Interpretation Guidelines

After obtaining calculation results, the agent should follow these principles:

### Multi-System Integration
- NEVER analyze systems in isolation
- Every claim should be supported by 2+ data points
- Address contradictions explicitly (e.g., tropical Pisces vs sidereal Aquarius)

### Aspect Hierarchy
1. Conjunctions with orb < 1° (most powerful)
2. Luminaries aspecting angles
3. Aspects involving chart ruler
4. Tight aspects (orb < 2°) between personal planets
5. Outer planet aspects (generational, less personal)

### Harmonic Interpretation Scale
- 5.0+ = EXTREME (dominant life theme, top 1-2%)
- 4.0-4.9 = Very High (major influence)
- 3.0-3.9 = High (significant)
- 2.0-2.9 = Moderate (present)
- <2.0 = Low (background)

### Key Harmonic Meanings
| H | Keyword | Core Meaning |
|---|---------|--------------|
| 1 | Identity | Who I am (natal chart) |
| 3 | Talent | Innate gifts, ease |
| 5 | Creativity | Unique creative expression |
| 7 | Fate | Destiny, irrational attraction |
| 9 | Initiation | Spiritual passages |
| 11 | Individualism | "I do my own thing" |
| 13 | Outsider | "Alien in an alien world" |
| 17 | Alt-Perception | "How could it be different" |
| 19 | Cosmic Flow | "Reality offers no resistance" |

### Dignity Priority
- Venus in Pisces (exaltation) is more significant than Venus in Taurus (domicile)
  for creative/spiritual profiles
- Detriment ≠ weakness; it means the planet must work harder
- Compare tropical vs sidereal dignities — agreements are strongest indicators

### Nakshatra Priority
- Janma Nakshatra (Moon's nakshatra) is the most important in Vedic analysis
- Sun's nakshatra shows karmic purpose
- Ascendant's nakshatra shows approach to life

## Error Handling

If pyswisseph is unavailable, the script falls back to a simplified calculation mode:
- Uses analytic formulas for Sun and Moon (accuracy ~0.5°)
- Uses mean positions for outer planets (accuracy ~1-2°)
- Marks output with `"precision": "approximate"`
- Warns the user that results should be verified

## Reference Files

- `references/astro_tables.md` — Complete dignity tables, nakshatra data,
  aspect definitions, harmonic keywords, city database
- `scripts/natal_calc.py` — Main calculation engine

## Usage Examples

### Basic natal chart
```bash
python scripts/natal_calc.py --date 1983-02-19 --time 10:53 --city "Sosnowiec, Poland"
```

### Full analysis with all harmonics
```bash
python scripts/natal_calc.py --date 1983-02-19 --time 10:53 --lat 50.2864 --lon 19.1048 \
  --tz "Europe/Warsaw" --harmonics 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20 \
  --output both
```

### Sidereal only with Raman ayanamsa
```bash
python scripts/natal_calc.py --date 1990-06-15 --time 14:30 --city "Mumbai, India" \
  --ayanamsa raman --output json
```

### Quick check of planetary positions for a date
```bash
python scripts/natal_calc.py --date 2026-04-07 --time 12:00 --lat 50.26 --lon 19.10 \
  --no-houses --output markdown
```
