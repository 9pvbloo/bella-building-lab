import * as THREE from 'three'
import {
  resolveCameraCompositionProfile,
  type CameraViewport,
} from '../camera/CameraDirector'


type GlyphTexture = {
  texture: THREE.CanvasTexture
  aspect: number
}


type Glyph = {
  mesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial
  >

  baseY: number
  delay: number
}


type WordLine = {
  group: THREE.Group
  baseY: number
}


export type BellaWordmarkUpdate = {
  progress: number
  exactProgress: number
  elapsed: number
  prefersReducedMotion: boolean
}


const FONT_WEIGHT = 600


const FONT_SIZE = 540


const GLYPH_PADDING = 54


const GLYPH_STAGGER = 0.07


const GLYPH_REVEAL_DURATION = 0.55


const HERO_INTRO_DURATION = 1.45


const HERO_INTRO_SCALE = 0.90


const HERO_INTRO_DEPTH_OFFSET = 2.2


const BELLA_LINE_WIDTH_SCALE = 1.36


const DURMIENTE_LINE_WIDTH_SCALE = 1.08


// Phone keeps the lockup oversized, but its longer supporting line needs a
// stronger optical reduction so every letter remains identifiable in portrait.
const PHONE_BELLA_LINE_WIDTH_SCALE = 0.84


const PHONE_DURMIENTE_LINE_WIDTH_SCALE = 0.58


const FINAL_OPACITY = 0.94


const THRESHOLD_OPACITY_MULTIPLIER = 0.86


const THRESHOLD_FADE_START_PROGRESS = 0.78


const THRESHOLD_FADE_END_PROGRESS = 1


const HERO_THRESHOLD_DEPTH = 11.5


const HERO_THRESHOLD_SCALE_COMPENSATION = 0.618


const HERO_THRESHOLD_POSITION_X = 0.81


const HERO_THRESHOLD_POSITION_Y = 2.61

const FONT_CANDIDATES = [
  '"Bodoni MT"',
  'Didot',
  'Baskerville',
  'Cambria',
  'Georgia',
  '"Times New Roman"',
  'serif',
] as const


const smoothstep = (
  value: number,
): number => {

  const clamped =
    THREE.MathUtils.clamp(
      value,
      0,
      1,
    )


  return clamped *
    clamped *
    (
      3 -
      2 *
      clamped
    )
}


/**
 * The Hero wordmark is a world-space typographic composition. Individual
 * glyph planes keep its optical spacing, reveal, and threshold traversal
 * without turning it into a viewport overlay.
 */
export class BellaWordmark {

  readonly group =
    new THREE.Group()


  private readonly glyphs:
    Glyph[] = []


  private readonly bellaLine:
    WordLine


  private readonly durmienteLine:
    WordLine


  private readonly glyphTextureCache =
    new Map<
      string,
      GlyphTexture
    >()


  private readonly fontFamily:
    string


  private introStartedAt:
    number | undefined


  private initialProgressFloor:
    number | undefined


  private layoutScale =
    1

  private layoutPositionX =
    HERO_THRESHOLD_POSITION_X

  private layoutPositionY =
    HERO_THRESHOLD_POSITION_Y

  private layoutDepth =
    HERO_THRESHOLD_DEPTH

  private heroIntroDepthOffset =
    HERO_INTRO_DEPTH_OFFSET


  constructor(
    renderer: THREE.WebGLRenderer,
  ) {

    this.fontFamily =
      this.resolveFontFamily()


    this.group.name =
      'BellaWordmarkV2'


    this.bellaLine =
      this.createLine({
        text: 'BELLA',
        glyphHeight: 4.25,
        tracking: 0.20,
        y: 2.59,
        startIndex: 0,
        renderer,
      })


    this.durmienteLine =
      this.createLine({
        text: 'DURMIENTE',
        glyphHeight: 2.48,
        tracking: 0.16,
        y: -0.01,
        startIndex: 5,
        renderer,
      })


    // Keep the supporting line clear of the Hero's upper-left editorial copy.
    this.bellaLine.group.position.x =
      0


    // Each line deliberately overshoots the Hero frame horizontally while
    // preserving its authored vertical proportions in world space.
    this.bellaLine.group.scale.x =
      BELLA_LINE_WIDTH_SCALE


    this.durmienteLine.group.scale.x =
      DURMIENTE_LINE_WIDTH_SCALE


    this.group.add(
      this.bellaLine.group,
      this.durmienteLine.group,
    )


    /*
      Hotel ≈ z 0
      Hero wordmark threshold = z 11.5
      Camera Hero ≈ z 23

      The centered lower-middle layout keeps the monumental two-line lockup
      clear of the editorial copy. Its smaller physical scale compensates for
      the forward threshold depth, preserving the approved Hero projection.
    */
    this.group.position.set(
      HERO_THRESHOLD_POSITION_X,
      HERO_THRESHOLD_POSITION_Y,
      HERO_THRESHOLD_DEPTH,
    )
  }


  update(
    {
      progress,
      exactProgress,
      elapsed,
      prefersReducedMotion,
    }: BellaWordmarkUpdate,
  ): void {

    if (
      this.introStartedAt ===
      undefined
    ) {

      this.introStartedAt =
        elapsed
    }


    if (
      this.initialProgressFloor ===
      undefined
    ) {

      this.initialProgressFloor =
        exactProgress
    }


    const initialProgress =
      this.initialProgressFloor


    const wordmarkProgress =
      Math.max(
        progress,
        initialProgress,
      )


    if (
      progress >=
      initialProgress -
      0.01 ||
      Math.abs(
        exactProgress -
        initialProgress,
      ) >
      0.01
    ) {

      this.initialProgressFloor =
        undefined
    }


    const thresholdFade =
      smoothstep(
        (
          wordmarkProgress -
          THRESHOLD_FADE_START_PROGRESS
        ) /
        (
          THRESHOLD_FADE_END_PROGRESS -
          THRESHOLD_FADE_START_PROGRESS
        ),
      )


    const introElapsed =
      elapsed -
      this.introStartedAt


    const heroIntro =
      prefersReducedMotion
        ? 1
        : smoothstep(
            introElapsed /
            HERO_INTRO_DURATION,
          )


    const scrollVisibility =
      THREE.MathUtils.lerp(
        1,
        THRESHOLD_OPACITY_MULTIPLIER,
        thresholdFade,
      )


    // The threshold never retreats behind Bella. Its page-load settling stays
    // separate; scroll retirement is caused by the camera crossing this plane.
    this.group.position.y =
      this.layoutPositionY


    this.group.position.z =
      this.layoutDepth -
      (
        1 -
        heroIntro
      ) *
      this.heroIntroDepthOffset


    this.group.rotation.set(
      0,
      0,
      0,
    )


    // Keep the two lines locked as one threshold during the crossing.
    this.bellaLine.group.position.y =
      this.bellaLine.baseY


    this.durmienteLine.group.position.y =
      this.durmienteLine.baseY


    // The whole Hero lockup settles forward once, without leaving world space.
    this.group.scale.setScalar(
      this.layoutScale *
      THREE.MathUtils.lerp(
        HERO_INTRO_SCALE,
        1,
        heroIntro,
      ),
    )


    this.glyphs.forEach(
      (
        glyph,
      ) => {

        const introVisibility =
          prefersReducedMotion
            ? 1
            : smoothstep(
                (
                  introElapsed -
                  glyph.delay
                ) /
                GLYPH_REVEAL_DURATION,
              )


        glyph.mesh.material.opacity =
          FINAL_OPACITY *
          introVisibility *
          scrollVisibility


        glyph.mesh.position.y =
          glyph.baseY +
          (
            1 -
            introVisibility
          ) *
          0.12


        const scale =
          THREE.MathUtils.lerp(
            0.992,
            1,
            introVisibility,
          )


        glyph.mesh.scale.setScalar(
          scale,
        )
      },
    )


  }


  resize(
    viewport: CameraViewport,
  ): void {

    const {
      aspect,
    } = viewport


    const profile =
      resolveCameraCompositionProfile(
        viewport,
      )

    const desktopScale =
      Math.min(
        1.10,
        Math.max(
          0.15,
          aspect *
          0.61,
        ),
      )


    if (
      profile ===
      'phone'
    ) {

      // Portrait phones intentionally retain an oversized, edge-cropped
      // two-line lockup. Only the camera crosses it; it is never a DOM title.
      this.layoutPositionX =
        1.3


      this.layoutPositionY =
        4.5


      this.layoutScale =
        0.28


      this.bellaLine.group.scale.x =
        PHONE_BELLA_LINE_WIDTH_SCALE


      this.bellaLine.group.position.x =
        -1


      this.durmienteLine.group.scale.x =
        PHONE_DURMIENTE_LINE_WIDTH_SCALE


      this.durmienteLine.group.position.x =
        -2


      this.heroIntroDepthOffset =
        1.25
    } else if (
      profile ===
      'tablet'
    ) {

      this.layoutPositionX =
        0.78


      this.layoutPositionY =
        4


      this.layoutScale =
        0.38


      this.bellaLine.group.scale.x =
        BELLA_LINE_WIDTH_SCALE


      this.bellaLine.group.position.x =
        0


      this.durmienteLine.group.scale.x =
        DURMIENTE_LINE_WIDTH_SCALE


      this.durmienteLine.group.position.x =
        0


      this.heroIntroDepthOffset =
        1.6
    } else {

      // Preserve the approved desktop projection exactly.
      this.layoutPositionX =
        HERO_THRESHOLD_POSITION_X


      this.layoutPositionY =
        HERO_THRESHOLD_POSITION_Y


      this.layoutScale =
        desktopScale *
        HERO_THRESHOLD_SCALE_COMPENSATION


      this.bellaLine.group.scale.x =
        BELLA_LINE_WIDTH_SCALE


      this.bellaLine.group.position.x =
        0


      this.durmienteLine.group.scale.x =
        DURMIENTE_LINE_WIDTH_SCALE


      this.durmienteLine.group.position.x =
        0


      this.heroIntroDepthOffset =
        HERO_INTRO_DEPTH_OFFSET
    }


    // All responsive profiles use the same world-space threshold plane.
    this.layoutDepth =
      HERO_THRESHOLD_DEPTH


    this.group.position.x =
      this.layoutPositionX
  }


  private createLine(
    {
      text,
      glyphHeight,
      tracking,
      y,
      startIndex,
      renderer,
    }: {
      text: string
      glyphHeight: number
      tracking: number
      y: number
      startIndex: number
      renderer: THREE.WebGLRenderer
    },
  ): WordLine {

    const group =
      new THREE.Group()


    const glyphTextures =
      Array.from(
        text,
        (
          character,
        ) =>
          this.getGlyphTexture(
            character,
            renderer,
          ),
      )


    const glyphWidths =
      glyphTextures.map(
        (
          glyphTexture,
        ) =>
          glyphTexture.aspect *
          glyphHeight,
      )


    const totalWidth =
      glyphWidths.reduce(
        (
          total,
          width,
        ) =>
          total +
          width,
        0,
      ) +
      tracking *
      (
        glyphWidths.length -
        1
      )


    let cursor =
      -totalWidth /
      2


    glyphTextures.forEach(
      (
        glyphTexture,
        index,
      ) => {

        const width =
          glyphWidths[
            index
          ]


        const material =
          new THREE.MeshBasicMaterial({
            map:
              glyphTexture.texture,
            transparent:
              true,
            opacity:
              0,
            depthTest:
              true,
            depthWrite:
              false,
            toneMapped:
              false,
          })


        const mesh =
          new THREE.Mesh(
            new THREE.PlaneGeometry(
              width,
              glyphHeight,
            ),
            material,
          )


        mesh.position.set(
          cursor +
            width /
            2,
          0,
          0,
        )


        group.add(
          mesh,
        )


        this.glyphs.push({
          mesh,
          baseY: 0,
          delay:
            (
              startIndex +
              index
            ) *
            GLYPH_STAGGER,
        })


        cursor +=
          width +
          tracking
      },
    )


    group.position.y =
      y


    return {
      group,
      baseY: y,
    }
  }


  private getGlyphTexture(
    character: string,
    renderer: THREE.WebGLRenderer,
  ): GlyphTexture {

    const cacheKey =
      `${
        this.fontFamily
      }-${
        FONT_WEIGHT
      }-${
        character
      }`


    const cached =
      this.glyphTextureCache.get(
        cacheKey,
      )


    if (
      cached
    ) {
      return cached
    }


    const canvas =
      document.createElement(
        'canvas',
      )


    const context =
      canvas.getContext(
        '2d',
      )


    if (
      !context
    ) {
      throw new Error(
        'No se pudo crear un glifo de Bella Wordmark',
      )
    }


    context.font =
      `${
        FONT_WEIGHT
      } ${
        FONT_SIZE
      }px ${
        this.fontFamily
      }`


    context.textBaseline =
      'alphabetic'


    const metrics =
      context.measureText(
        character,
      )


    const left =
      Math.max(
        0,
        metrics.actualBoundingBoxLeft,
      )


    const right =
      Math.max(
        metrics.width,
        metrics.actualBoundingBoxRight,
      )


    const ascent =
      Math.max(
        FONT_SIZE *
        0.72,
        metrics.actualBoundingBoxAscent,
      )


    const descent =
      Math.max(
        FONT_SIZE *
        0.08,
        metrics.actualBoundingBoxDescent,
      )


    const visibleWidth =
      Math.max(
        metrics.width,
        left +
        right,
      )


    const visibleHeight =
      ascent +
      descent


    canvas.width =
      Math.ceil(
        visibleWidth +
        GLYPH_PADDING *
        2,
      )


    canvas.height =
      Math.ceil(
        visibleHeight +
        GLYPH_PADDING *
        2,
      )


    context.font =
      `${
        FONT_WEIGHT
      } ${
        FONT_SIZE
      }px ${
        this.fontFamily
      }`


    context.textBaseline =
      'alphabetic'


    const gradient =
      context.createLinearGradient(
        0,
        0,
        0,
        canvas.height,
      )


    gradient.addColorStop(
      0,
      '#f5f8f8',
    )


    gradient.addColorStop(
      0.48,
      '#e5eaeb',
    )


    gradient.addColorStop(
      1,
      '#aeb9be',
    )


    context.fillStyle =
      gradient


    context.shadowColor =
      'rgba(5, 13, 22, 0.45)'


    context.shadowBlur =
      8


    context.fillText(
      character,
      GLYPH_PADDING +
        left,
      GLYPH_PADDING +
        ascent,
    )


    const texture =
      new THREE.CanvasTexture(
        canvas,
      )


    texture.colorSpace =
      THREE.SRGBColorSpace


    texture.minFilter =
      THREE.LinearMipmapLinearFilter


    texture.magFilter =
      THREE.LinearFilter


    texture.generateMipmaps =
      true


    texture.anisotropy =
      Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      )


    const glyphTexture = {
      texture,
      aspect:
        canvas.width /
        canvas.height,
    }


    this.glyphTextureCache.set(
      cacheKey,
      glyphTexture,
    )


    return glyphTexture
  }


  private resolveFontFamily(): string {

    const available =
      FONT_CANDIDATES.find(
        (
          candidate,
        ) =>
          document.fonts?.check(
            `${
              FONT_WEIGHT
            } 64px ${
              candidate
            }`,
          ) ??
          false,
      )


    const selected =
      available ??
      FONT_CANDIDATES[
        FONT_CANDIDATES.length -
        1
      ]


    return [
      selected,
      ...FONT_CANDIDATES.filter(
        (
          candidate,
        ) =>
          candidate !==
          selected,
      ),
    ].join(
      ', ',
    )
  }
}
