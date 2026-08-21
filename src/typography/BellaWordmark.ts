import * as THREE from 'three'


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


const FINAL_OPACITY = 0.94


const REST_POSITION_X = 2.20


const REST_POSITION_Y = 2.75


const RETIRED_POSITION_Y = 2.25


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
 * glyph planes keep its optical spacing, reveal, and retirement independent
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
        glyphHeight: 2.12,
        tracking: 0.20,
        y: 2.59,
        startIndex: 0,
        renderer,
      })


    this.durmienteLine =
      this.createLine({
        text: 'DURMIENTE',
        glyphHeight: 2.34,
        tracking: 0.14,
        y: -0.01,
        startIndex: 5,
        renderer,
      })


    // Keep the supporting line clear of the Hero's upper-left editorial copy.
    this.bellaLine.group.position.x =
      0.90


    this.group.add(
      this.bellaLine.group,
      this.durmienteLine.group,
    )


    /*
      Hotel ≈ z 0
      Wordmark = z 4.35
      Camera Hero ≈ z 17

      The lower middle layout keeps both lines inside the Hero frame, clear of
      the editorial copy, while retaining the established facade depth.
    */
    this.group.position.set(
      REST_POSITION_X,
      REST_POSITION_Y,
      4.35,
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


    const retirement =
      smoothstep(
        THREE.MathUtils.clamp(
          wordmarkProgress /
          0.92,
          0,
          1,
        ),
      )


    const scrollVisibility =
      1 -
      smoothstep(
        (
          retirement -
          0.48
        ) /
        0.52,
      )


    // The full composition retires as one quiet world element.
    this.group.position.y =
      THREE.MathUtils.lerp(
        REST_POSITION_Y,
        RETIRED_POSITION_Y,
        retirement,
      )


    this.group.position.z =
      THREE.MathUtils.lerp(
        4.35,
        4.74,
        retirement,
      )


    this.group.rotation.set(
      0,
      0,
      0,
    )


    // A very small vertical opening supports retirement without a split.
    this.bellaLine.group.position.y =
      this.bellaLine.baseY +
      0.08 *
      retirement


    this.durmienteLine.group.position.y =
      this.durmienteLine.baseY -
      0.08 *
      retirement


    const introElapsed =
      elapsed -
      this.introStartedAt


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


    this.group.visible =
      scrollVisibility >
      0.01
  }


  resize(
    aspect: number,
  ): void {

    const scale =
      Math.min(
        0.74,
        Math.max(
          0.15,
          aspect *
          0.34,
        ),
      )


    const narrowness =
      smoothstep(
        (
          0.80 -
          aspect
        ) /
        0.30,
      )


    this.group.position.x =
      THREE.MathUtils.lerp(
        REST_POSITION_X,
        1.55,
        narrowness,
      )


    this.group.scale.setScalar(
      scale,
    )
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
