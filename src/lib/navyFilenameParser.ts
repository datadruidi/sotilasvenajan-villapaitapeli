/**
 * Parse navy image filenames to derive vessel class and optional vessel name.
 *
 * NAMING RULE (use this for all navy image filenames):
 *
 * 1. Underscore (_) is the ONLY separator between CLASS and VESSEL NAME.
 *
 * 2. Class-only (same name in Alusluokat and Alusten nimet):
 *    - Use a SPACE before the picture number: "ivan gren 01.jpg", "kilo 01.jpg"
 *    - Or no number: "lada.jpg"
 *    - Result: one segment after stripping number → class only → shown as e.g. "Ivan Gren" in both modules.
 *
 * 3. Class + vessel name (Alusluokat = class, Alusten nimet = vessel):
 *    - Use UNDERSCORE between class and vessel: "kilo_dimitrov_02.jpg", "buyan-m_grad sviyazhsk.jpg"
 *    - Trailing _01 / _02 is picture index and is stripped.
 *    - Result: class = first segment, vessel = rest → e.g. "Kilo" / "Dimitrov".
 *
 * Examples:
 *   ivan gren 01.jpg     → "Ivan Gren" in both
 *   kilo 01.jpg         → "Kilo" in both
 *   kilo_dimitrov_02.jpg → "Kilo" in Alusluokat, "Dimitrov" in Alusten nimet
 *   buyan-m_grad sviyazhsk.jpg → "Buyan-M" / "Grad Sviyazhsk"
 *   nanuchka_geyzer.jpg → "Nanuchka" / "Geyzer"
 */

export interface ParsedNavyFilename {
  /** Display form for quiz (e.g. "Admiral Gorshkov") */
  classDisplay: string
  /** Vessel name when present (e.g. "Dimitrov"); undefined = class-only image */
  vesselName?: string
}

function capitalizeFirst(s: string): string {
  if (s.length === 0) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/**
 * Format a class key for display. Handles spaces and underscores (e.g. "ivan gren" or "buyan-m").
 */
function formatClassDisplay(key: string): string {
  const trimmed = key.trim()
  if (trimmed.length === 0) return trimmed
  return trimmed
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.split('-').map(capitalizeFirst).join('-'))
    .join(' ')
}

/** Display overrides for vessel names (normalized key → display string). */
const VESSEL_DISPLAY_OVERRIDES: Record<string, string> = {
  'orekhovo-zuyev': 'Orekhovo-Zuyevo',
}

/**
 * Format vessel name for display (capitalize each word and each part after hyphen).
 */
export function formatVesselNameDisplay(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length === 0) return trimmed
  const override = VESSEL_DISPLAY_OVERRIDES[trimmed.toLowerCase()]
  if (override) return override
  return trimmed
    .split(/\s+/)
    .map((word) => word.split('-').map(capitalizeFirst).join('-'))
    .join(' ')
}

/**
 * Parse an asset path and return class display name and optional vessel name.
 * Uses the naming rule: strip trailing space+number or _number, then split by underscore only.
 */
export function parseNavyFilename(assetPath: string): ParsedNavyFilename | null {
  const basename = assetPath.split(/[/\\]/).pop() ?? ''
  const base = basename.replace(/\.(jpg|jpeg|png|webp)$/i, '').trim()
  if (base.length === 0) return null

  // Strip trailing picture index: " 01", "_02", etc.
  const withoutNumber = base.replace(/\s+\d+$|_\d+$/, '').trim()
  if (withoutNumber.length === 0) return null

  // Underscore is the only separator between class and vessel name.
  const parts = withoutNumber.split('_').map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return null

  if (parts.length === 1) {
    // Class only (e.g. "ivan gren", "kilo", "admiral gorshkov 01" → already stripped to "admiral gorshkov")
    return { classDisplay: formatClassDisplay(parts[0]) }
  }

  // Class + vessel name (e.g. kilo_dimitrov, buyan-m_grad sviyazhsk)
  const classDisplay = formatClassDisplay(parts[0])
  const vesselNameRaw = parts.slice(1).join(' ').trim()
  if (vesselNameRaw.length === 0) return { classDisplay }

  return {
    classDisplay,
    vesselName: formatVesselNameDisplay(vesselNameRaw),
  }
}
