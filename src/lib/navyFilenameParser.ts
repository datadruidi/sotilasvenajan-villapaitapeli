/**
 * Parse navy image filenames to derive vessel class and optional vessel name.
 *
 * Rules:
 * - class_01.jpg, class_02.jpg → class only (trailing number = picture index). Shown in Alusluokat only.
 * - class_vesselname_01.jpg or class_vesselname.jpg → class + vessel name. Trailing number is picture index.
 *   Shown in Alusluokat (by class) and in Alusten nimet (by vessel name).
 */

export interface ParsedNavyFilename {
  /** Display form for quiz (e.g. "Admiral Gorshkov") */
  classDisplay: string
  /** Vessel name when present (e.g. "Aleksandr Obukhov"); undefined = class-only image */
  vesselName?: string
}

/**
 * Format a class key (e.g. admiral_gorshkov) for display (e.g. "Admiral Gorshkov").
 * Replaces underscores with space and capitalizes each word; keeps hyphens as-is but capitalizes after them.
 */
function formatClassDisplay(key: string): string {
  const trimmed = key.trim()
  if (trimmed.length === 0) return trimmed
  return trimmed
    .split('_')
    .map((word) => word.split('-').map(capitalizeFirst).join('-'))
    .join(' ')
}

function capitalizeFirst(s: string): string {
  if (s.length === 0) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/**
 * Format vessel name for display (capitalize each word).
 */
export function formatVesselNameDisplay(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length === 0) return trimmed
  return trimmed.split(/\s+/).map(capitalizeFirst).join(' ')
}

/**
 * Parse an asset path (e.g. /assets/vehicles/russia/navy/steregushchiy/steregushchiy_boikiy.jpg)
 * and return the class display name and optional vessel name.
 * - If the filename is like class_01.jpg (last part is a number), vessel name is undefined.
 * - If the filename is like class_vesselname_01.jpg or class_vesselname.jpg, vessel name is the middle part(s).
 */
export function parseNavyFilename(assetPath: string): ParsedNavyFilename | null {
  const basename = assetPath.split(/[/\\]/).pop() ?? ''
  const base = basename.replace(/\.(jpg|jpeg|png|webp)$/i, '').trim()
  if (base.length === 0) return null

  let parts = base.split('_')
  if (parts.length === 0) return null

  // Strip trailing numeric suffix (picture index, not part of the name)
  if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
    parts = parts.slice(0, -1)
  }

  if (parts.length === 0) return null

  const classDisplay = formatClassDisplay(parts[0])
  if (parts.length === 1) {
    return { classDisplay }
  }

  // Rest is vessel name (may contain spaces if filename had "part1 part2" in one segment)
  const vesselNameRaw = parts.slice(1).join(' ').trim()
  if (vesselNameRaw.length === 0) return { classDisplay }

  return {
    classDisplay,
    vesselName: formatVesselNameDisplay(vesselNameRaw),
  }
}
