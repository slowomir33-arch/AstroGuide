#!/usr/bin/env python3
"""
LOGOS-44 · Astrological Calculation Engine
==========================================
Computes natal charts (tropical + sidereal), aspects, harmonics,
dignities, nakshatras, patterns, element/modality balance from
birth data. Outputs JSON and/or Markdown.

Usage:
  python natal_calc.py --date 1983-02-19 --time 10:53 --lat 50.2864 --lon 19.1048
  python natal_calc.py --date 1983-02-19 --time 10:53 --city "Sosnowiec, Poland"
  python natal_calc.py --date 1983-02-19 --time 10:53 --lat 50.2864 --lon 19.1048 \
    --harmonics 1,3,5,7,9,11,13,17,19 --output both
"""

import argparse
import json
import math
import sys
from datetime import datetime, timezone, timedelta
from typing import Optional

# ═══════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════

SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
         "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
SIGN_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"]
ELEMENTS = ["Fire","Earth","Air","Water"] * 3
MODALITIES = ["Cardinal","Fixed","Mutable"] * 4
POLARITIES = ["Positive","Negative"] * 6

PLANET_IDS = {
    "Sun": 0, "Moon": 1, "Mercury": 2, "Venus": 3, "Mars": 4,
    "Jupiter": 5, "Saturn": 6, "Uranus": 7, "Neptune": 8, "Pluto": 9,
    "NorthNode": 10, "Chiron": 15, "Lilith": 12,  # mean node, chiron, mean apogee
}

PLANET_WEIGHTS = {
    "Sun": 3, "Moon": 3, "Mercury": 2, "Venus": 2, "Mars": 2,
    "Jupiter": 1.5, "Saturn": 1.5, "Uranus": 1, "Neptune": 1, "Pluto": 1,
}

PLANET_CATEGORIES = {
    "Sun": "luminary", "Moon": "luminary",
    "Mercury": "personal", "Venus": "personal", "Mars": "personal",
    "Jupiter": "social", "Saturn": "social",
    "Uranus": "transpersonal", "Neptune": "transpersonal", "Pluto": "transpersonal",
    "NorthNode": "node", "Chiron": "asteroid", "Lilith": "point",
}

# Aspects: (name, angle, default_orb, weight, nature)
ASPECT_DEFS = [
    ("Conjunction",     0,   8, 10, "fusion"),
    ("Opposition",    180,   8,  8, "tension"),
    ("Trine",         120,   7,  7, "harmony"),
    ("Square",         90,   7,  6, "tension"),
    ("Sextile",        60,   5,  4, "harmony"),
    ("Quincunx",      150,   3,  2, "tension"),
    ("Semi-sextile",   30,   2,  1, "neutral"),
    ("Semi-square",    45,   2,  2, "tension"),
    ("Sesquiquadrate",135,   2,  2, "tension"),
    ("Quintile",       72,   2,  3, "creative"),
    ("Bi-quintile",   144,   2,  3, "creative"),
    ("Septile",     51.43,   1.5, 2, "fated"),
    ("Novile",         40,   1.5, 2, "spiritual"),
]

# Dignities: sign_index -> { ruler, exaltation, detriment, fall }
DIGNITIES = {
    0:  {"ruler": ["Mars"],             "exaltation": "Sun",     "detriment": ["Venus"],           "fall": "Saturn"},
    1:  {"ruler": ["Venus"],            "exaltation": "Moon",    "detriment": ["Mars","Pluto"],     "fall": None},
    2:  {"ruler": ["Mercury"],          "exaltation": None,      "detriment": ["Jupiter"],          "fall": None},
    3:  {"ruler": ["Moon"],             "exaltation": "Jupiter", "detriment": ["Saturn"],           "fall": "Mars"},
    4:  {"ruler": ["Sun"],              "exaltation": None,      "detriment": ["Saturn","Uranus"],  "fall": None},
    5:  {"ruler": ["Mercury"],          "exaltation": "Mercury", "detriment": ["Jupiter","Neptune"],"fall": "Venus"},
    6:  {"ruler": ["Venus"],            "exaltation": "Saturn",  "detriment": ["Mars"],             "fall": "Sun"},
    7:  {"ruler": ["Mars","Pluto"],     "exaltation": None,      "detriment": ["Venus"],            "fall": "Moon"},
    8:  {"ruler": ["Jupiter"],          "exaltation": None,      "detriment": ["Mercury"],          "fall": None},
    9:  {"ruler": ["Saturn"],           "exaltation": "Mars",    "detriment": ["Moon"],             "fall": "Jupiter"},
    10: {"ruler": ["Saturn","Uranus"],  "exaltation": None,      "detriment": ["Sun"],              "fall": None},
    11: {"ruler": ["Jupiter","Neptune"],"exaltation": "Venus",   "detriment": ["Mercury"],          "fall": None},
}

# Nakshatras: (name, start_deg, ruler, deity, nature)
NAKSHATRAS = [
    ("Ashwini",       0.00, "Ketu",    "Ashwini Kumaras", "Speed, healing, beginnings"),
    ("Bharani",      13.33, "Venus",   "Yama",            "Creativity, transformation, bearing"),
    ("Krittika",     26.67, "Sun",     "Agni",            "Fire, purification, sharpness"),
    ("Rohini",       40.00, "Moon",    "Brahma",          "Growth, beauty, creativity, fertility"),
    ("Mrigashira",   53.33, "Mars",    "Soma",            "Searching, curiosity, gentle quest"),
    ("Ardra",        66.67, "Rahu",    "Rudra",           "Storm, transformation, tears→growth"),
    ("Punarvasu",    80.00, "Jupiter", "Aditi",           "Renewal, return, restoration"),
    ("Pushya",       93.33, "Saturn",  "Brihaspati",      "Nourishment, care, prosperity"),
    ("Ashlesha",    106.67, "Mercury", "Nagas",           "Kundalini, depth, mystical embrace"),
    ("Magha",       120.00, "Ketu",    "Pitris",          "Royalty, ancestors, authority"),
    ("P.Phalguni",  133.33, "Venus",   "Bhaga",           "Pleasure, relaxation, creativity"),
    ("U.Phalguni",  146.67, "Sun",     "Aryaman",         "Patronage, contracts, friendship"),
    ("Hasta",       160.00, "Moon",    "Savitar",          "Dexterity, craft, healing hands"),
    ("Chitra",      173.33, "Mars",    "Tvashtar",         "Architect, creation of form, beauty"),
    ("Swati",       186.67, "Rahu",    "Vayu",             "Independence, movement, flexibility"),
    ("Vishakha",    200.00, "Jupiter", "Indra-Agni",       "Purpose, determination, triumph"),
    ("Anuradha",    213.33, "Saturn",  "Mitra",            "Friendship, devotion, cooperation"),
    ("Jyeshtha",    226.67, "Mercury", "Indra",            "Elder, protection, authority"),
    ("Mula",        240.00, "Ketu",    "Nirriti",          "Root, destruction→rebirth, research"),
    ("P.Ashadha",   253.33, "Venus",   "Apas",             "Invincibility, water, purification"),
    ("U.Ashadha",   266.67, "Sun",     "Vishve Devas",     "Ultimate victory, universality"),
    ("Shravana",    280.00, "Moon",    "Vishnu",           "Listening, learning, wisdom"),
    ("Dhanishtha",  293.33, "Mars",    "Vasus",            "Wealth, music, rhythm, abundance"),
    ("Shatabhisha", 306.67, "Rahu",    "Varuna",           "100 healers, mystery, healing"),
    ("P.Bhadrapada",320.00, "Jupiter", "Aja Ekapada",      "Spiritual fire, asceticism"),
    ("U.Bhadrapada",333.33, "Saturn",  "Ahir Budhnya",     "Ocean depth, kundalini, stability"),
    ("Revati",      346.67, "Mercury", "Pushan",           "Journey, safety, end of cycle"),
]

# Ayanamsa values at J2000.0 (Jan 1, 2000, 12:00 TT) and drift rate
AYANAMSA_EPOCH = {
    "lahiri":         23.853,   # Lahiri at J2000
    "raman":          22.375,
    "krishnamurti":   23.822,
    "fagan_bradley":  24.736,
    "true_chitra":    23.869,
}
AYANAMSA_DRIFT = 50.2781 / 3600  # degrees per year (precession)

# City database (name -> (lat, lon, tz))
CITIES = {
    "sosnowiec, poland": (50.2864, 19.1048, "Europe/Warsaw"),
    "warsaw, poland": (52.2297, 21.0122, "Europe/Warsaw"),
    "krakow, poland": (50.0647, 19.9450, "Europe/Warsaw"),
    "katowice, poland": (50.2649, 19.0238, "Europe/Warsaw"),
    "gdansk, poland": (54.3520, 18.6466, "Europe/Warsaw"),
    "wroclaw, poland": (51.1079, 17.0385, "Europe/Warsaw"),
    "poznan, poland": (52.4064, 16.9252, "Europe/Warsaw"),
    "london, uk": (51.5074, -0.1278, "Europe/London"),
    "new york, usa": (40.7128, -74.0060, "America/New_York"),
    "los angeles, usa": (34.0522, -118.2437, "America/Los_Angeles"),
    "chicago, usa": (41.8781, -87.6298, "America/Chicago"),
    "paris, france": (48.8566, 2.3522, "Europe/Paris"),
    "berlin, germany": (52.5200, 13.4050, "Europe/Berlin"),
    "munich, germany": (48.1351, 11.5820, "Europe/Berlin"),
    "rome, italy": (41.9028, 12.4964, "Europe/Rome"),
    "madrid, spain": (40.4168, -3.7038, "Europe/Madrid"),
    "moscow, russia": (55.7558, 37.6173, "Europe/Moscow"),
    "tokyo, japan": (35.6762, 139.6503, "Asia/Tokyo"),
    "beijing, china": (39.9042, 116.4074, "Asia/Shanghai"),
    "mumbai, india": (19.0760, 72.8777, "Asia/Kolkata"),
    "delhi, india": (28.7041, 77.1025, "Asia/Kolkata"),
    "sydney, australia": (-33.8688, 151.2093, "Australia/Sydney"),
    "cairo, egypt": (30.0444, 31.2357, "Africa/Cairo"),
    "istanbul, turkey": (41.0082, 28.9784, "Europe/Istanbul"),
    "sao paulo, brazil": (-23.5505, -46.6333, "America/Sao_Paulo"),
    "buenos aires, argentina": (-34.6037, -58.3816, "America/Argentina/Buenos_Aires"),
    "mexico city, mexico": (19.4326, -99.1332, "America/Mexico_City"),
    "toronto, canada": (43.6532, -79.3832, "America/Toronto"),
    "amsterdam, netherlands": (52.3676, 4.9041, "Europe/Amsterdam"),
    "prague, czech republic": (50.0755, 14.4378, "Europe/Prague"),
    "opava, czech republic": (49.9388, 17.9026, "Europe/Prague"),
    "vienna, austria": (48.2082, 16.3738, "Europe/Vienna"),
    "zurich, switzerland": (47.3769, 8.5417, "Europe/Zurich"),
    "stockholm, sweden": (59.3293, 18.0686, "Europe/Stockholm"),
    "oslo, norway": (59.9139, 10.7522, "Europe/Oslo"),
    "copenhagen, denmark": (55.6761, 12.5683, "Europe/Copenhagen"),
    "helsinki, finland": (60.1699, 24.9384, "Europe/Helsinki"),
    "dublin, ireland": (53.3498, -6.2603, "Europe/Dublin"),
    "lisbon, portugal": (38.7223, -9.1393, "Europe/Lisbon"),
    "athens, greece": (37.9838, 23.7275, "Europe/Athens"),
    "bangkok, thailand": (13.7563, 100.5018, "Asia/Bangkok"),
    "singapore": (1.3521, 103.8198, "Asia/Singapore"),
    "seoul, south korea": (37.5665, 126.9780, "Asia/Seoul"),
    "jakarta, indonesia": (-6.2088, 106.8456, "Asia/Jakarta"),
    "nairobi, kenya": (-1.2921, 36.8219, "Africa/Nairobi"),
    "johannesburg, south africa": (-26.2041, 28.0473, "Africa/Johannesburg"),
    "lagos, nigeria": (6.5244, 3.3792, "Africa/Lagos"),
    "riyadh, saudi arabia": (24.7136, 46.6753, "Asia/Riyadh"),
    "dubai, uae": (25.2048, 55.2708, "Asia/Dubai"),
    "tel aviv, israel": (32.0853, 34.7818, "Asia/Jerusalem"),
    "denver, usa": (39.7392, -104.9903, "America/Denver"),
    "seattle, usa": (47.6062, -122.3321, "America/Los_Angeles"),
    "san francisco, usa": (37.7749, -122.4194, "America/Los_Angeles"),
    "miami, usa": (25.7617, -80.1918, "America/New_York"),
    "boston, usa": (42.3601, -71.0589, "America/New_York"),
    "washington dc, usa": (38.9072, -77.0369, "America/New_York"),
    "houston, usa": (29.7604, -95.3698, "America/Chicago"),
    "phoenix, usa": (33.4484, -112.0740, "America/Phoenix"),
    "philadelphia, usa": (39.9526, -75.1652, "America/New_York"),
    "vancouver, canada": (49.2827, -123.1207, "America/Vancouver"),
    "montreal, canada": (45.5017, -73.5673, "America/Toronto"),
}

# Timezone offsets for common zones (fallback if pytz unavailable)
TZ_OFFSETS = {
    "Europe/Warsaw": 1, "Europe/London": 0, "Europe/Paris": 1,
    "Europe/Berlin": 1, "Europe/Rome": 1, "Europe/Madrid": 1,
    "Europe/Moscow": 3, "Europe/Prague": 1, "Europe/Vienna": 1,
    "Europe/Amsterdam": 1, "Europe/Stockholm": 1, "Europe/Helsinki": 2,
    "Europe/Athens": 2, "Europe/Istanbul": 3, "Europe/Dublin": 0,
    "Europe/Lisbon": 0, "Europe/Zurich": 1, "Europe/Oslo": 1,
    "Europe/Copenhagen": 1,
    "America/New_York": -5, "America/Chicago": -6, "America/Denver": -7,
    "America/Los_Angeles": -8, "America/Phoenix": -7,
    "America/Toronto": -5, "America/Vancouver": -8,
    "America/Sao_Paulo": -3, "America/Argentina/Buenos_Aires": -3,
    "America/Mexico_City": -6,
    "Asia/Tokyo": 9, "Asia/Shanghai": 8, "Asia/Kolkata": 5.5,
    "Asia/Bangkok": 7, "Asia/Singapore": 8, "Asia/Seoul": 9,
    "Asia/Jakarta": 7, "Asia/Riyadh": 3, "Asia/Dubai": 4,
    "Asia/Jerusalem": 2,
    "Australia/Sydney": 10,
    "Africa/Cairo": 2, "Africa/Nairobi": 3, "Africa/Johannesburg": 2,
    "Africa/Lagos": 1,
}


# ═══════════════════════════════════════════════════════════════
# MATH HELPERS
# ═══════════════════════════════════════════════════════════════

def mod360(d):
    return ((d % 360) + 360) % 360

def sign_index(lon):
    return int(mod360(lon) / 30)

def deg_to_dms(lon):
    d = mod360(lon)
    si = sign_index(d)
    in_sign = d - si * 30
    deg = int(in_sign)
    frac = (in_sign - deg) * 60
    minute = int(frac)
    sec = int((frac - minute) * 60)
    return {
        "longitude": round(d, 4),
        "sign": SIGNS[si],
        "sign_symbol": SIGN_SYMBOLS[si],
        "sign_index": si,
        "degree": deg,
        "minute": minute,
        "second": sec,
        "formatted": f"{deg}°{minute:02d}'{sec:02d}\" {SIGN_SYMBOLS[si]} {SIGNS[si]}",
        "element": ELEMENTS[si],
        "modality": MODALITIES[si],
        "polarity": POLARITIES[si],
    }

def date_to_jd(year, month, day, hour=0, minute=0, second=0):
    """Convert date/time to Julian Day Number."""
    if month <= 2:
        year -= 1
        month += 12
    A = int(year / 100)
    B = 2 - A + int(A / 4)
    day_frac = day + hour / 24.0 + minute / 1440.0 + second / 86400.0
    jd = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day_frac + B - 1524.5
    return jd

def jd_to_century(jd):
    """Julian centuries from J2000.0."""
    return (jd - 2451545.0) / 36525.0


# ═══════════════════════════════════════════════════════════════
# PLANETARY CALCULATION (Swiss Ephemeris or Fallback)
# ═══════════════════════════════════════════════════════════════

USE_SWISSEPH = False
try:
    import swisseph as swe
    swe.set_ephe_path('')  # use Moshier
    USE_SWISSEPH = True
except ImportError:
    pass

def calc_planet_swe(jd, planet_id):
    """Calculate planet position using Swiss Ephemeris (Moshier)."""
    flags = swe.FLG_MOSEPH | swe.FLG_SPEED
    result, ret = swe.calc_ut(jd, planet_id, flags)
    return {
        "longitude": result[0],
        "latitude": result[1],
        "distance": result[2],
        "speed": result[3],
        "retrograde": result[3] < 0,
    }

def calc_houses_swe(jd, lat, lon, system='P'):
    """Calculate house cusps using Swiss Ephemeris."""
    hsys = bytes(system, 'ascii')
    cusps, ascmc = swe.houses(jd, lat, lon, hsys)
    return {
        "cusps": list(cusps),  # 12 cusps
        "asc": ascmc[0],
        "mc": ascmc[1],
        "armc": ascmc[2],
        "vertex": ascmc[3],
    }

# ── Analytic fallback for Sun and Moon ──

def calc_sun_analytic(jd):
    """Approximate Sun longitude (accuracy ~0.5°)."""
    T = jd_to_century(jd)
    # Mean longitude
    L0 = mod360(280.46646 + 36000.76983 * T + 0.0003032 * T**2)
    # Mean anomaly
    M = mod360(357.52911 + 35999.05029 * T - 0.0001537 * T**2)
    Mr = math.radians(M)
    # Equation of center
    C = (1.914602 - 0.004817 * T) * math.sin(Mr) + \
        0.019993 * math.sin(2 * Mr) + 0.000289 * math.sin(3 * Mr)
    lon = mod360(L0 + C)
    # Speed ~0.9856°/day
    return {"longitude": lon, "latitude": 0.0, "distance": 1.0, "speed": 0.9856, "retrograde": False}

def calc_moon_analytic(jd):
    """Approximate Moon longitude (accuracy ~1°)."""
    T = jd_to_century(jd)
    L = mod360(218.3165 + 481267.8813 * T)
    M = mod360(357.5291 + 35999.0503 * T)
    Mp = mod360(134.9634 + 477198.8676 * T)
    D = mod360(297.8502 + 445267.1115 * T)
    F = mod360(93.2720 + 483202.0175 * T)
    Mr, Mpr, Dr, Fr = map(math.radians, [M, Mp, D, F])
    lon = L + 6.289 * math.sin(Mpr) \
            + 1.274 * math.sin(2*Dr - Mpr) \
            + 0.658 * math.sin(2*Dr) \
            + 0.214 * math.sin(2*Mpr) \
            - 0.186 * math.sin(Mr) \
            - 0.114 * math.sin(2*Fr)
    return {"longitude": mod360(lon), "latitude": 0.0, "distance": 1.0, "speed": 13.176, "retrograde": False}

# Mean positions for outer planets (very rough, for fallback only)
MEAN_ELEMENTS = {
    "Mercury":  (252.251, 149472.675, 0.387),
    "Venus":    (181.980, 58517.816, 0.723),
    "Mars":     (355.433, 19140.299, 1.524),
    "Jupiter":  (34.351, 3034.906, 5.203),
    "Saturn":   (50.077, 1222.114, 9.537),
    "Uranus":   (314.055, 428.947, 19.191),
    "Neptune":  (304.349, 218.486, 30.069),
    "Pluto":    (238.929, 145.208, 39.482),
}

def calc_planet_analytic(jd, name):
    """Very rough mean position (accuracy varies, ~1-5°)."""
    if name == "Sun": return calc_sun_analytic(jd)
    if name == "Moon": return calc_moon_analytic(jd)
    if name == "NorthNode":
        T = jd_to_century(jd)
        lon = mod360(125.0446 - 1934.1363 * T)
        return {"longitude": lon, "latitude": 0, "distance": 0, "speed": -0.0529, "retrograde": True}
    if name == "Chiron":
        T = jd_to_century(jd)
        lon = mod360(209.39 + 1.870 * (jd - 2451545.0) / 365.25)  # very rough
        return {"longitude": lon, "latitude": 0, "distance": 0, "speed": 0.02, "retrograde": False}
    if name == "Lilith":
        T = jd_to_century(jd)
        lon = mod360(83.353 + 40.6796 * (jd - 2451545.0) / 365.25)
        return {"longitude": lon, "latitude": 0, "distance": 0, "speed": 0.111, "retrograde": False}
    if name in MEAN_ELEMENTS:
        L0, rate, _ = MEAN_ELEMENTS[name]
        T = jd_to_century(jd)
        lon = mod360(L0 + rate * T)
        speed = rate / 36525.0
        return {"longitude": lon, "latitude": 0, "distance": 0, "speed": speed, "retrograde": False}
    return {"longitude": 0, "latitude": 0, "distance": 0, "speed": 0, "retrograde": False}

# Approximate house cusps (Equal house from Asc as fallback)
def calc_houses_analytic(jd, lat, lon):
    """Approximate Ascendant + Equal houses."""
    T = jd_to_century(jd)
    # Local sidereal time
    GMST = mod360(280.46061837 + 360.98564736629 * (jd - 2451545.0))
    LST = mod360(GMST + lon)
    lst_rad = math.radians(LST)
    lat_rad = math.radians(lat)
    # Obliquity
    eps = math.radians(23.4393 - 0.01300 * T)
    # Ascendant
    y = -math.cos(lst_rad)
    x = math.sin(eps) * math.tan(lat_rad) + math.cos(eps) * math.sin(lst_rad)
    asc = mod360(math.degrees(math.atan2(y, x)))
    mc = mod360(math.degrees(math.atan2(math.sin(lst_rad), math.cos(lst_rad) * math.cos(eps))))
    # Equal houses
    cusps = [mod360(asc + i * 30) for i in range(12)]
    return {"cusps": cusps, "asc": asc, "mc": mc, "armc": LST, "vertex": 0}


# ═══════════════════════════════════════════════════════════════
# CORE CALCULATION CLASS
# ═══════════════════════════════════════════════════════════════

class NatalChart:
    def __init__(self, year, month, day, hour, minute, lat, lon,
                 tz_offset=0, house_system='P', ayanamsa='lahiri',
                 harmonics=None):
        self.year = year
        self.month = month
        self.day = day
        self.hour = hour
        self.minute = minute
        self.lat = lat
        self.lon = lon
        self.tz_offset = tz_offset
        self.house_system = house_system
        self.ayanamsa_name = ayanamsa
        self.harmonics_list = harmonics or [1,3,5,7,9,11,13,17,19]
        self.precision = "exact" if USE_SWISSEPH else "approximate"

        # Convert to UTC
        utc_hour = hour - tz_offset
        utc_minute = minute
        if utc_hour < 0:
            utc_hour += 24
            # day adjustment would be needed for production use
        elif utc_hour >= 24:
            utc_hour -= 24

        self.jd = date_to_jd(year, month, day, utc_hour, utc_minute)

        # Calculate ayanamsa for this moment
        years_from_j2000 = (self.jd - 2451545.0) / 365.25
        base = AYANAMSA_EPOCH.get(ayanamsa, 23.853)
        self.ayanamsa_value = base + AYANAMSA_DRIFT * years_from_j2000

        # Storage
        self.planets = {}
        self.houses_data = {}
        self.aspects = []
        self.patterns = []

    def calculate_all(self):
        """Run full calculation pipeline."""
        self._calc_planets()
        self._calc_houses()
        self._assign_houses()
        self._calc_dignities()
        self._calc_aspects()
        self._detect_patterns()
        return self

    def _calc_planets(self):
        for name, pid in PLANET_IDS.items():
            if USE_SWISSEPH:
                try:
                    raw = calc_planet_swe(self.jd, pid)
                except Exception:
                    raw = calc_planet_analytic(self.jd, name)
            else:
                raw = calc_planet_analytic(self.jd, name)
            pos = deg_to_dms(raw["longitude"])
            self.planets[name] = {
                **pos,
                "latitude": round(raw["latitude"], 4),
                "speed": round(raw["speed"], 4),
                "retrograde": raw["retrograde"],
                "category": PLANET_CATEGORIES.get(name, "other"),
                "weight": PLANET_WEIGHTS.get(name, 0),
            }

    def _calc_houses(self):
        hsys_map = {
            'placidus': 'P', 'koch': 'K', 'equal': 'E',
            'whole_sign': 'W', 'campanus': 'C', 'porphyry': 'O',
        }
        hsys = hsys_map.get(self.house_system.lower(), self.house_system[0].upper())
        if USE_SWISSEPH:
            raw = calc_houses_swe(self.jd, self.lat, self.lon, hsys)
        else:
            raw = calc_houses_analytic(self.jd, self.lat, self.lon)
        self.houses_data = {
            "cusps": [{"house": i+1, **deg_to_dms(c)} for i, c in enumerate(raw["cusps"])],
            "angles": {
                "Asc": deg_to_dms(raw["asc"]),
                "MC": deg_to_dms(raw["mc"]),
                "Dsc": deg_to_dms(mod360(raw["asc"] + 180)),
                "IC": deg_to_dms(mod360(raw["mc"] + 180)),
            }
        }
        self._cusps_raw = raw["cusps"]
        self._asc = raw["asc"]
        self._mc = raw["mc"]

    def _assign_houses(self):
        cusps = self._cusps_raw
        for name, pdata in self.planets.items():
            plon = pdata["longitude"]
            house = 1
            for i in range(12):
                c1 = cusps[i]
                c2 = cusps[(i+1) % 12]
                if c2 < c1:  # wraps around 0°
                    if plon >= c1 or plon < c2:
                        house = i + 1
                        break
                else:
                    if c1 <= plon < c2:
                        house = i + 1
                        break
            pdata["house"] = house

    def _calc_dignities(self):
        for name, pdata in self.planets.items():
            if name in ("NorthNode", "Chiron", "Lilith"):
                pdata["dignity"] = {"type": "N/A", "score": 0}
                continue
            si = pdata["sign_index"]
            dig = DIGNITIES[si]
            if name in dig["ruler"]:
                pdata["dignity"] = {"type": "Domicile", "score": 5}
            elif dig["exaltation"] == name:
                pdata["dignity"] = {"type": "Exaltation", "score": 4}
            elif name in dig["detriment"]:
                pdata["dignity"] = {"type": "Detriment", "score": -3}
            elif dig["fall"] == name:
                pdata["dignity"] = {"type": "Fall", "score": -4}
            else:
                pdata["dignity"] = {"type": "Peregrine", "score": 0}

    def _calc_aspects(self):
        names = [n for n in self.planets if n not in ("Lilith",)]
        for i in range(len(names)):
            for j in range(i+1, len(names)):
                n1, n2 = names[i], names[j]
                lon1 = self.planets[n1]["longitude"]
                lon2 = self.planets[n2]["longitude"]
                diff = abs(lon1 - lon2)
                if diff > 180: diff = 360 - diff

                # Orb multiplier: luminaries get wider
                cat1 = self.planets[n1]["category"]
                cat2 = self.planets[n2]["category"]
                orb_mult = 1.0
                if "luminary" in (cat1, cat2): orb_mult = 1.2
                if cat1 in ("transpersonal",) and cat2 in ("transpersonal",): orb_mult = 0.7

                for aname, aangle, aorb, aweight, anature in ASPECT_DEFS:
                    effective_orb = aorb * orb_mult
                    deviation = abs(diff - aangle)
                    if deviation <= effective_orb:
                        tightness = 1 - deviation / effective_orb
                        self.aspects.append({
                            "planet1": n1,
                            "planet2": n2,
                            "type": aname,
                            "exact_angle": aangle,
                            "actual_angle": round(diff, 2),
                            "orb": round(deviation, 2),
                            "tightness": round(tightness, 4),
                            "strength": round(aweight * tightness, 2),
                            "nature": anature,
                        })
        self.aspects.sort(key=lambda a: -a["strength"])

    def _detect_patterns(self):
        # Stellium detection
        sign_groups = {}
        for name, pdata in self.planets.items():
            if pdata["weight"] == 0: continue
            s = pdata["sign"]
            sign_groups.setdefault(s, []).append(name)
        for sign, planets in sign_groups.items():
            if len(planets) >= 3:
                self.patterns.append({
                    "type": "Stellium",
                    "location": sign,
                    "planets": planets,
                    "description": f"Stellium in {sign}: {', '.join(planets)}",
                })

        # T-Square detection
        oppositions = [(a["planet1"], a["planet2"]) for a in self.aspects if a["type"] == "Opposition" and a["orb"] < 8]
        squares = [(a["planet1"], a["planet2"]) for a in self.aspects if a["type"] == "Square" and a["orb"] < 8]
        for p1, p2 in oppositions:
            for sq1, sq2 in squares:
                if sq1 == p1 and (sq2, p2) in squares or (p2, sq2) in squares:
                    self.patterns.append({
                        "type": "T-Square",
                        "planets": [p1, p2, sq2],
                        "description": f"T-Square: {p1} opp {p2}, both square {sq2}",
                    })

        # Grand Trine detection
        trines = [(a["planet1"], a["planet2"]) for a in self.aspects if a["type"] == "Trine" and a["orb"] < 7]
        for i, (a, b) in enumerate(trines):
            for j, (c, d) in enumerate(trines[i+1:], i+1):
                shared = set([a,b]) & set([c,d])
                if shared:
                    remaining = (set([a,b]) | set([c,d])) - shared
                    pivot = shared.pop()
                    others = list(remaining)
                    if len(others) == 2 and (others[0], others[1]) in trines or (others[1], others[0]) in trines:
                        self.patterns.append({
                            "type": "Grand Trine",
                            "planets": [pivot] + others,
                            "description": f"Grand Trine: {pivot}, {others[0]}, {others[1]}",
                        })

    # ── Sidereal ──

    def get_sidereal(self):
        result = {"ayanamsa": self.ayanamsa_name, "ayanamsa_value": round(self.ayanamsa_value, 4), "planets": {}, "nakshatras": {}}
        for name, pdata in self.planets.items():
            sid_lon = mod360(pdata["longitude"] - self.ayanamsa_value)
            sid_pos = deg_to_dms(sid_lon)

            # Dignity in sidereal
            si = sid_pos["sign_index"]
            if name in ("NorthNode", "Chiron", "Lilith"):
                sid_dignity = {"type": "N/A", "score": 0}
            else:
                dig = DIGNITIES[si]
                if name in dig["ruler"]:
                    sid_dignity = {"type": "Domicile", "score": 5}
                elif dig["exaltation"] == name:
                    sid_dignity = {"type": "Exaltation", "score": 4}
                elif name in dig["detriment"]:
                    sid_dignity = {"type": "Detriment", "score": -3}
                elif dig["fall"] == name:
                    sid_dignity = {"type": "Fall", "score": -4}
                else:
                    sid_dignity = {"type": "Peregrine", "score": 0}

            result["planets"][name] = {
                **sid_pos,
                "tropical_sign": pdata["sign"],
                "sign_changed": pdata["sign"] != sid_pos["sign"],
                "dignity": sid_dignity,
                "tropical_dignity": pdata.get("dignity", {}),
            }

            # Nakshatra
            nak = self._get_nakshatra(sid_lon)
            result["nakshatras"][name] = nak

        # Dignity comparison
        result["dignity_comparison"] = {}
        for name in self.planets:
            if name in ("NorthNode", "Chiron", "Lilith"): continue
            td = self.planets[name].get("dignity", {})
            sd = result["planets"][name]["dignity"]
            result["dignity_comparison"][name] = {
                "tropical": td,
                "sidereal": sd,
                "delta": sd.get("score", 0) - td.get("score", 0),
            }

        return result

    def _get_nakshatra(self, sid_lon):
        d = mod360(sid_lon)
        for name, start, ruler, deity, nature in NAKSHATRAS:
            end = start + 13.333333
            if start <= d < end:
                deg_in_nak = d - start
                pada = int(deg_in_nak / 3.333333) + 1
                return {
                    "nakshatra": name,
                    "pada": min(pada, 4),
                    "ruler": ruler,
                    "deity": deity,
                    "nature": nature,
                    "degree_in_nakshatra": round(deg_in_nak, 2),
                }
        # Wrap-around case
        return {"nakshatra": NAKSHATRAS[0][0], "pada": 1, "ruler": NAKSHATRAS[0][2],
                "deity": NAKSHATRAS[0][3], "nature": NAKSHATRAS[0][4], "degree_in_nakshatra": 0}

    # ── Harmonics ──

    def get_harmonics(self):
        result = {"harmonics": {}, "strength_ranking": [], "clusters": {}}

        HARMONIC_KW = {
            1: "Identity", 2: "Polarity", 3: "Talent", 4: "Challenge",
            5: "Creativity", 6: "Cooperation", 7: "Fate", 8: "Subconscious",
            9: "Initiation", 10: "Manifestation", 11: "Individualism",
            12: "Sacrifice", 13: "Outsider", 14: "Karmic Relations",
            15: "Creative Flow", 16: "Deep Structure", 17: "Alt-Perception",
            18: "Double Initiation", 19: "Cosmic Flow", 20: "Creative Struggle",
        }

        for h in self.harmonics_list:
            h_planets = {}
            for name, pdata in self.planets.items():
                if pdata["weight"] == 0: continue
                h_lon = mod360(pdata["longitude"] * h)
                h_planets[name] = h_lon

            # Find aspects in harmonic chart (tighter orbs)
            h_aspects = []
            names = list(h_planets.keys())
            for i in range(len(names)):
                for j in range(i+1, len(names)):
                    diff = abs(h_planets[names[i]] - h_planets[names[j]])
                    if diff > 180: diff = 360 - diff
                    for aname, aangle, aorb, aweight, anature in ASPECT_DEFS[:6]:  # major only
                        eff_orb = aorb * 0.5  # tighter
                        dev = abs(diff - aangle)
                        if dev <= eff_orb:
                            tight = 1 - dev / eff_orb
                            h_aspects.append({
                                "planet1": names[i], "planet2": names[j],
                                "type": aname, "orb": round(dev, 2),
                                "strength": round(aweight * tight, 2),
                            })

            h_aspects.sort(key=lambda a: -a["strength"])
            h_strength = sum(a["strength"] for a in h_aspects) / max(len(h_aspects), 1) if h_aspects else 0

            positions = {}
            for name, lon in h_planets.items():
                positions[name] = deg_to_dms(lon)

            result["harmonics"][f"H{h}"] = {
                "harmonic": h,
                "keyword": HARMONIC_KW.get(h, ""),
                "positions": positions,
                "aspects": h_aspects,
                "aspect_count": len(h_aspects),
                "strength": round(h_strength, 2),
            }

        # Rank
        result["strength_ranking"] = sorted(
            [{"harmonic": f"H{h}", "strength": result["harmonics"][f"H{h}"]["strength"],
              "keyword": HARMONIC_KW.get(h, "")}
             for h in self.harmonics_list],
            key=lambda x: -x["strength"]
        )

        # Clusters
        def cluster_avg(hs):
            vals = [result["harmonics"].get(f"H{h}", {}).get("strength", 0) for h in hs if f"H{h}" in result["harmonics"]]
            return round(sum(vals) / max(len(vals), 1), 2) if vals else 0

        result["clusters"] = {
            "individuality": {"harmonics": [11,13,17], "avg_strength": cluster_avg([11,13,17])},
            "spirituality":  {"harmonics": [7,9,19],   "avg_strength": cluster_avg([7,9,19])},
            "creativity":    {"harmonics": [5,15,20],  "avg_strength": cluster_avg([5,15,20])},
            "tension":       {"harmonics": [2,4,8,16], "avg_strength": cluster_avg([2,4,8,16])},
            "flow":          {"harmonics": [3,6,19],   "avg_strength": cluster_avg([3,6,19])},
        }

        return result

    # ── Balance ──

    def get_balance(self):
        el = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
        mod = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}
        pol = {"Positive": 0, "Negative": 0}

        for name, pdata in self.planets.items():
            w = pdata["weight"]
            if w == 0: continue
            el[pdata["element"]] += w
            mod[pdata["modality"]] += w
            pol[pdata["polarity"]] += w

        # Add Asc and MC
        if hasattr(self, '_asc'):
            asc_pos = deg_to_dms(self._asc)
            el[asc_pos["element"]] += 1.5
            mod[asc_pos["modality"]] += 1.5
            pol[asc_pos["polarity"]] += 1.5
        if hasattr(self, '_mc'):
            mc_pos = deg_to_dms(self._mc)
            el[mc_pos["element"]] += 1.5
            mod[mc_pos["modality"]] += 1.5
            pol[mc_pos["polarity"]] += 1.5

        total_el = sum(el.values())
        total_mod = sum(mod.values())

        return {
            "elements": {k: {"weight": round(v, 1), "percent": round(v/total_el*100, 1)} for k, v in el.items()},
            "modalities": {k: {"weight": round(v, 1), "percent": round(v/total_mod*100, 1)} for k, v in mod.items()},
            "polarities": pol,
            "dominant_element": max(el, key=el.get),
            "dominant_modality": max(mod, key=mod.get),
        }

    # ── Chart shape ──

    def get_chart_shape(self):
        lons = sorted([p["longitude"] for p in self.planets.values() if p["weight"] > 0])
        if len(lons) < 5:
            return {"shape": "Unknown", "description": "Too few planets"}

        # Find largest empty arc
        gaps = []
        for i in range(len(lons)):
            gap = mod360(lons[(i+1) % len(lons)] - lons[i])
            gaps.append(gap)
        max_gap = max(gaps)
        occupied_arc = 360 - max_gap

        if occupied_arc <= 120:
            return {"shape": "Bundle", "occupied_arc": round(occupied_arc, 1),
                    "description": "All planets within 120° — focused, specialist energy"}
        elif occupied_arc <= 180:
            return {"shape": "Bowl", "occupied_arc": round(occupied_arc, 1),
                    "description": "All planets within 180° — self-contained, purposeful"}
        elif max_gap >= 60 and max_gap <= 120:
            return {"shape": "Locomotive", "occupied_arc": round(occupied_arc, 1),
                    "description": "~240° occupied with one empty trine — driven, ambitious"}
        else:
            # Check for seesaw (two groups)
            # Simplified: if two gaps > 60°, it's seesaw-ish
            big_gaps = [g for g in gaps if g > 50]
            if len(big_gaps) >= 2:
                return {"shape": "Seesaw", "occupied_arc": round(occupied_arc, 1),
                        "description": "Two opposing groups — dialectical, seeing both sides"}
            return {"shape": "Splash", "occupied_arc": round(occupied_arc, 1),
                    "description": "Planets spread evenly — versatile, scattered energy"}

    # ── Chart ruler ──

    def get_chart_ruler(self):
        if not hasattr(self, '_asc'):
            return {"planet": "Unknown"}
        asc_sign = sign_index(self._asc)
        rulers = DIGNITIES[asc_sign]["ruler"]
        ruler = rulers[0]  # primary ruler
        if ruler in self.planets:
            return {
                "planet": ruler,
                "sign": self.planets[ruler]["sign"],
                "house": self.planets[ruler]["house"],
                "dignity": self.planets[ruler].get("dignity", {}),
                "description": f"Chart ruler {ruler} in {self.planets[ruler]['sign']} in house {self.planets[ruler]['house']}",
            }
        return {"planet": ruler, "sign": "Unknown", "house": 0}

    # ── Full output ──

    def to_dict(self):
        return {
            "input": {
                "date": f"{self.year:04d}-{self.month:02d}-{self.day:02d}",
                "time": f"{self.hour:02d}:{self.minute:02d}",
                "latitude": self.lat,
                "longitude": self.lon,
                "timezone_offset": self.tz_offset,
                "house_system": self.house_system,
                "ayanamsa": self.ayanamsa_name,
                "precision": self.precision,
                "julian_day": round(self.jd, 6),
                "engine": "pyswisseph" if USE_SWISSEPH else "analytic_fallback",
            },
            "tropical": {
                "planets": self.planets,
                "houses": self.houses_data,
                "aspects": self.aspects,
                "patterns": self.patterns,
                "balance": self.get_balance(),
                "chart_shape": self.get_chart_shape(),
                "chart_ruler": self.get_chart_ruler(),
            },
            "sidereal": self.get_sidereal(),
            "harmonics": self.get_harmonics(),
        }

    def to_markdown(self):
        d = self.to_dict()
        lines = []
        lines.append(f"# Natal Chart Report")
        lines.append(f"**Date:** {d['input']['date']} {d['input']['time']}")
        lines.append(f"**Location:** {self.lat}°N {self.lon}°E")
        lines.append(f"**Engine:** {d['input']['engine']} ({d['input']['precision']})")
        lines.append(f"**House System:** {self.house_system} | **Ayanamsa:** {self.ayanamsa_name} ({d['sidereal']['ayanamsa_value']}°)")
        lines.append("")

        # Tropical planets
        lines.append("## Tropical Planets")
        lines.append("| Planet | Position | House | Dignity | Speed |")
        lines.append("|--------|----------|-------|---------|-------|")
        for name, p in d["tropical"]["planets"].items():
            lines.append(f"| {name} | {p['formatted']} | {p['house']} | {p.get('dignity',{}).get('type','—')} ({p.get('dignity',{}).get('score',0):+d}) | {p['speed']:.4f}°/d {'R' if p['retrograde'] else ''} |")
        lines.append("")

        # Angles
        lines.append("## Angles")
        for name, a in d["tropical"]["houses"]["angles"].items():
            lines.append(f"- **{name}:** {a['formatted']}")
        lines.append("")

        # Aspects
        lines.append(f"## Aspects ({len(d['tropical']['aspects'])})")
        lines.append("| Aspect | Type | Orb | Strength | Nature |")
        lines.append("|--------|------|-----|----------|--------|")
        for a in d["tropical"]["aspects"][:25]:
            lines.append(f"| {a['planet1']}–{a['planet2']} | {a['type']} | {a['orb']:.2f}° | {a['strength']:.1f} | {a['nature']} |")
        lines.append("")

        # Balance
        bal = d["tropical"]["balance"]
        lines.append("## Element Balance")
        for el, data in bal["elements"].items():
            lines.append(f"- **{el}:** {data['weight']} ({data['percent']}%)")
        lines.append(f"\n**Dominant:** {bal['dominant_element']} / {bal['dominant_modality']}")
        lines.append("")

        # Sidereal
        lines.append("## Sidereal Planets")
        lines.append(f"**Ayanamsa:** {d['sidereal']['ayanamsa']} = {d['sidereal']['ayanamsa_value']}°")
        lines.append("| Planet | Sidereal | Tropical | Changed? | Nakshatra | Pada | Ruler |")
        lines.append("|--------|----------|----------|----------|-----------|------|-------|")
        for name, p in d["sidereal"]["planets"].items():
            nak = d["sidereal"]["nakshatras"].get(name, {})
            lines.append(f"| {name} | {p['formatted']} | {p['tropical_sign']} | {'YES' if p['sign_changed'] else '—'} | {nak.get('nakshatra','—')} | {nak.get('pada','—')} | {nak.get('ruler','—')} |")
        lines.append("")

        # Harmonics
        lines.append("## Harmonic Strengths")
        lines.append("| Harmonic | Strength | Keyword |")
        lines.append("|----------|----------|---------|")
        for item in d["harmonics"]["strength_ranking"]:
            level = "EXTREME" if item["strength"] >= 5 else "Very High" if item["strength"] >= 4 else "High" if item["strength"] >= 3 else "Moderate" if item["strength"] >= 2 else "Low"
            lines.append(f"| {item['harmonic']} | {item['strength']:.2f} ({level}) | {item['keyword']} |")
        lines.append("")

        # Clusters
        lines.append("## Harmonic Clusters")
        for cname, cdata in d["harmonics"]["clusters"].items():
            lines.append(f"- **{cname.title()}** (H{','.join(map(str, cdata['harmonics']))}): avg {cdata['avg_strength']:.2f}")
        lines.append("")

        # Patterns
        if d["tropical"]["patterns"]:
            lines.append("## Patterns Detected")
            for p in d["tropical"]["patterns"]:
                lines.append(f"- **{p['type']}:** {p['description']}")

        return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════
# GEOCODING
# ═══════════════════════════════════════════════════════════════

def geocode_city(city_name):
    key = city_name.lower().strip()
    # Try exact match
    if key in CITIES:
        return CITIES[key]
    # Try partial match
    for k, v in CITIES.items():
        if key in k or k in key:
            return v
    return None


# ═══════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Astrological Calculation Engine")
    parser.add_argument("--date", required=True, help="Birth date (YYYY-MM-DD)")
    parser.add_argument("--time", required=True, help="Birth time (HH:MM, 24h local)")
    parser.add_argument("--lat", type=float, help="Latitude")
    parser.add_argument("--lon", type=float, help="Longitude")
    parser.add_argument("--city", help="City name (alternative to lat/lon)")
    parser.add_argument("--tz", help="Timezone (e.g., Europe/Warsaw)")
    parser.add_argument("--house-system", default="placidus", help="House system")
    parser.add_argument("--ayanamsa", default="lahiri", help="Ayanamsa for sidereal")
    parser.add_argument("--harmonics", default="1,3,5,7,9,11,13,17,19", help="Comma-separated harmonics")
    parser.add_argument("--output", default="json", choices=["json", "markdown", "both"], help="Output format")
    parser.add_argument("--no-houses", action="store_true", help="Skip house calculations")
    parser.add_argument("--file", help="Output to file instead of stdout")

    args = parser.parse_args()

    # Parse date/time
    dt = datetime.strptime(args.date, "%Y-%m-%d")
    time_parts = args.time.split(":")
    hour = int(time_parts[0])
    minute = int(time_parts[1]) if len(time_parts) > 1 else 0

    # Geocoding
    lat, lon, tz_name = None, None, None
    if args.city:
        result = geocode_city(args.city)
        if result is None:
            print(f"ERROR: City '{args.city}' not found in database.", file=sys.stderr)
            print("Please provide --lat and --lon manually.", file=sys.stderr)
            sys.exit(1)
        lat, lon, tz_name = result
    else:
        if args.lat is None or args.lon is None:
            print("ERROR: Provide either --city or both --lat and --lon", file=sys.stderr)
            sys.exit(1)
        lat, lon = args.lat, args.lon

    if args.tz:
        tz_name = args.tz

    # Timezone offset
    tz_offset = 0
    if tz_name and tz_name in TZ_OFFSETS:
        tz_offset = TZ_OFFSETS[tz_name]
    elif tz_name:
        try:
            import pytz
            tz = pytz.timezone(tz_name)
            dt_local = tz.localize(datetime(dt.year, dt.month, dt.day, hour, minute))
            tz_offset = dt_local.utcoffset().total_seconds() / 3600
        except ImportError:
            print(f"WARNING: pytz not available, using offset lookup for {tz_name}", file=sys.stderr)

    # Parse harmonics
    harmonics = [int(x.strip()) for x in args.harmonics.split(",")]

    # Calculate
    chart = NatalChart(
        year=dt.year, month=dt.month, day=dt.day,
        hour=hour, minute=minute,
        lat=lat, lon=lon,
        tz_offset=tz_offset,
        house_system=args.house_system,
        ayanamsa=args.ayanamsa,
        harmonics=harmonics,
    )
    chart.calculate_all()

    # Output
    if args.output in ("json", "both"):
        json_out = json.dumps(chart.to_dict(), indent=2, ensure_ascii=False)
        if args.file:
            with open(args.file + ".json", "w") as f:
                f.write(json_out)
            print(f"JSON written to {args.file}.json", file=sys.stderr)
        else:
            print(json_out)

    if args.output in ("markdown", "both"):
        md_out = chart.to_markdown()
        if args.file:
            with open(args.file + ".md", "w") as f:
                f.write(md_out)
            print(f"Markdown written to {args.file}.md", file=sys.stderr)
        else:
            if args.output == "both":
                print("\n---\n")
            print(md_out)


if __name__ == "__main__":
    main()
