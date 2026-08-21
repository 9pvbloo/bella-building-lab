import type { RuntimePreferences } from '../../core/RuntimePreferences'
import { BellaClothImage } from './BellaClothImage'
import {
  BELLA_CLOTH_PRESET,
  type BellaClothPreset,
} from './BellaClothPreset'


const ROOM_CLOTH_SELECTOR = '[data-bella-cloth="room"]'


/**
 * Phase 8A mounts exactly one faithful Bella Cloth instance in Habitaciones.
 * It intentionally owns no room layout or content.
 */
export function mountRoomsClothProof(
  runtimePreferences: RuntimePreferences,
): void {

  const container = document.querySelector<HTMLElement>(
    ROOM_CLOTH_SELECTOR,
  )

  const image = container?.querySelector<HTMLImageElement>(
    'img',
  )

  if (!container || !image) {
    return
  }

  let cloth: BellaClothImage | undefined
  let resizeFrame = 0

  const destroy = (): void => {

    if (resizeFrame !== 0) {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = 0
    }

    cloth?.destroy()
    cloth = undefined
  }

  const getResponsivePreset = (): BellaClothPreset => {

    const preset = { ...BELLA_CLOTH_PRESET }

    if (window.innerWidth < 640) {
      return {
        ...preset,
        wind: 0.49,
        idleStrength: 0.8,
        speed: 0.52,
        amplitude: 11.2,
        drape: 11.2,
        brushStrength: 1.8,
        brushSize: 132,
        meshResolution: 28,
        maxDpr: 1,
      }
    }

    if (window.innerWidth < 900) {
      return {
        ...preset,
        wind: 0.52,
        idleStrength: 0.85,
        speed: 0.53,
        amplitude: 11.9,
        brushStrength: 1.84,
        brushSize: 136,
        meshResolution: 44,
        maxDpr: 1.25,
      }
    }

    return preset
  }

  const mount = async (): Promise<void> => {

    if (cloth || runtimePreferences.prefersReducedMotion || window.innerWidth < 320) {
      return
    }

    const instance = new BellaClothImage({
      container,
      image,
      preset: getResponsivePreset(),
      sdfEdgeEnabled: true,
      perimeterIdleEnabled: true,
      contactShadowEnabled: true,
      edgeInfluenceEnabled: true,
    })

    cloth = instance

    try {
      await instance.init()

      if (
        cloth !== instance ||
        runtimePreferences.prefersReducedMotion
      ) {
        instance.destroy()
        return
      }

      container.classList.remove('is-bella-cloth-fallback')
      instance.start()
    } catch (error) {
      instance.destroy()

      if (cloth === instance) {
        cloth = undefined
      }

      container.classList.add('is-bella-cloth-fallback')
      console.warn(
        'Bella Cloth image unavailable; showing the room photo fallback.',
        error,
      )
    }
  }

  const sync = (): void => {

    if (runtimePreferences.prefersReducedMotion || window.innerWidth < 320) {
      destroy()
      return
    }

    if (cloth) {
      cloth.setOptions(getResponsivePreset())
      return
    }

    void mount()
  }

  const scheduleSync = (): void => {

    if (resizeFrame !== 0) {
      return
    }

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0
      sync()
    })
  }

  runtimePreferences.subscribe(sync)
  window.addEventListener('resize', scheduleSync, { passive: true })
  window.addEventListener('pagehide', destroy, { once: true })

  sync()
}
