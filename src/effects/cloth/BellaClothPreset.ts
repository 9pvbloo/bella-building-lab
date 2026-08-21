export interface BellaClothPreset {
  wind: number
  idleStrength: number
  speed: number
  amplitude: number
  drape: number
  brushStrength: number
  brushSize: number
  damping: number
  light: number
  sheen: number
  shadow: number
  edgeTension: number
  edgeMotion: number
  meshResolution: number
  maxDpr: number
}


/**
 * Approved Bella cloth settings, ported unchanged from the original gallery.
 */
export const BELLA_CLOTH_PRESET: Readonly<BellaClothPreset> = {
  wind: 0.55,
  idleStrength: 0.9,
  speed: 0.54,
  amplitude: 12.6,
  drape: 12.3,
  brushStrength: 1.96,
  brushSize: 144,
  damping: 0.926,
  light: 0.28,
  sheen: 0.055,
  shadow: 0.16,
  edgeTension: 0,
  edgeMotion: 0,
  meshResolution: 64,
  maxDpr: 1.5,
}
