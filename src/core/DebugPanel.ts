export type DebugPanelSnapshot = {
  exactProgress: number
  smoothProgress: number
  activeChapterIndex: number
  scrollDirection: string
  cameraPosition: {
    x: number
    y: number
    z: number
  }
  cameraTarget: {
    x: number
    y: number
    z: number
  }
  fov: number
  frameTime: number
  fps: number
  renderCalls: number
  triangles: number
  textures: number
  programs: number
  nightSky: {
    visibleStarCount: number
    activeShootingStarCount: number
    pendingShootingStarCount: number
    secondsUntilNextShootingStarEvent: number
  }
  rain: {
    profile: string
    particleCount: number
    farCount: number
    midCount: number
    nearCount: number
  }
}


/**
 * Intentionally dependency-free diagnostics for local visual tuning.
 * It is instantiated only in Vite development when ?debug=1 is present.
 */
export class DebugPanel {

  static isEnabled(): boolean {

    return import.meta.env.DEV &&
      new URLSearchParams(
        window.location.search,
      ).get('debug') ===
        '1'
  }


  private readonly element =
    document.createElement(
      'pre',
    )


  constructor() {

    this.element.setAttribute(
      'aria-hidden',
      'true',
    )


    Object.assign(
      this.element.style,
      {
        position: 'fixed',
        top: '12px',
        right: '12px',
        zIndex: '100',
        margin: '0',
        padding: '10px 12px',
        color: '#dff3ff',
        background: 'rgba(2, 8, 20, 0.82)',
        border: '1px solid rgba(170, 220, 255, 0.28)',
        borderRadius: '4px',
        font: '12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace',
        pointerEvents: 'none',
        whiteSpace: 'pre',
      },
    )


    document.body.append(
      this.element,
    )
  }


  update(
    snapshot: DebugPanelSnapshot,
  ): void {

    const format = (
      value: number,
      precision: number =
        2,
    ): string =>
      value.toFixed(
        precision,
      )


    this.element.textContent = [
      `exact ${format(snapshot.exactProgress, 3)}`,
      `smooth ${format(snapshot.smoothProgress, 3)}`,
      `chapter ${snapshot.activeChapterIndex}`,
      `scroll ${snapshot.scrollDirection}`,
      `camera ${format(snapshot.cameraPosition.x)}, ${format(snapshot.cameraPosition.y)}, ${format(snapshot.cameraPosition.z)}`,
      `target ${format(snapshot.cameraTarget.x)}, ${format(snapshot.cameraTarget.y)}, ${format(snapshot.cameraTarget.z)}`,
      `fov ${format(snapshot.fov)}`,
      `frame ${format(snapshot.frameTime, 1)}ms · ${format(snapshot.fps, 1)}fps`,
      `calls ${snapshot.renderCalls} · tris ${snapshot.triangles}`,
      `textures ${snapshot.textures} · programs ${snapshot.programs}`,
      `sky ${snapshot.nightSky.visibleStarCount} stars · shooting ${snapshot.nightSky.activeShootingStarCount}/4 · queue ${snapshot.nightSky.pendingShootingStarCount} · next ${format(snapshot.nightSky.secondsUntilNextShootingStarEvent, 1)}s`,
      `rain ${snapshot.rain.profile} · ${snapshot.rain.particleCount} streaks · ${snapshot.rain.farCount}/${snapshot.rain.midCount}/${snapshot.rain.nearCount}`,
    ].join(
      '\n',
    )
  }
}
