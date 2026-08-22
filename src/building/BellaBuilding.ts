import * as THREE from 'three'

function createSeededRandom(
  seed: number,
): () => number {

  let value =
    seed >>>
    0


  return (): number => {

    value +=
      0x6d2b79f5


    let mixed =
      value


    mixed =
      Math.imul(
        mixed ^
        mixed >>>
          15,
        mixed |
          1,
      )


    mixed ^=
      mixed +
      Math.imul(
        mixed ^
        mixed >>>
          7,
        mixed |
          61,
      )


    return (
      (
        mixed ^
        mixed >>>
          14
      ) >>>
      0
    ) /
      4294967296
  }
}


/**
 * A single restrained, repeatable concrete source shared by the facade
 * materials. It deliberately favours soft tonal drift and a small bump over
 * obvious stains or surface noise, so the facade remains maintained at night.
 */
function createConcreteTexture():
  THREE.CanvasTexture {

  const size =
    512


  const canvas =
    document.createElement(
      'canvas',
    )


  canvas.width =
    size


  canvas.height =
    size


  const context =
    canvas.getContext(
      '2d',
    )


  if (!context) {
    throw new Error(
      'No se pudo crear la textura de concreto Bella',
    )
  }


  const random =
    createSeededRandom(
      4303,
    )


  const image =
    context.createImageData(
      size,
      size,
    )


  for (
    let pixel =
      0;
    pixel <
    image.data.length;
    pixel +=
      4
  ) {

    const grain =
      Math.round(
        222 +
        (
          random() -
          0.5
        ) *
          12,
      )


    image.data[pixel] =
      grain


    image.data[
      pixel +
      1
    ] =
      grain +
      2


    image.data[
      pixel +
      2
    ] =
      grain +
      3


    image.data[
      pixel +
      3
    ] =
      255
  }


  context.putImageData(
    image,
    0,
    0,
  )


  // Sparse, low-alpha vertical variation suggests maintained concrete that
  // has lived through highland weather without turning into visible grime.
  for (
    let index =
      0;
    index <
    18;
    index +=
      1
  ) {

    const x =
      random() *
      size


    const width =
      THREE.MathUtils.lerp(
        8,
        34,
        random(),
      )


    const gradient =
      context.createLinearGradient(
        x,
        0,
        x +
          width,
        size,
      )


    gradient.addColorStop(
      0,
      'rgba(67, 82, 86, 0)',
    )


    gradient.addColorStop(
      0.5,
      'rgba(67, 82, 86, 0.028)',
    )


    gradient.addColorStop(
      1,
      'rgba(67, 82, 86, 0)',
    )


    context.fillStyle =
      gradient


    context.fillRect(
      x -
        width,
      0,
      width *
        3,
      size,
    )
  }


  const texture =
    new THREE.CanvasTexture(
      canvas,
    )


  texture.colorSpace =
    THREE.SRGBColorSpace


  texture.wrapS =
    THREE.RepeatWrapping


  texture.wrapT =
    THREE.RepeatWrapping


  texture.repeat.set(
    3.4,
    5.6,
  )


  texture.minFilter =
    THREE.LinearMipmapLinearFilter


  texture.magFilter =
    THREE.LinearFilter


  texture.generateMipmaps =
    true


  return texture
}


export class BellaBuilding extends THREE.Group {

  private readonly showBuildingSigns = false

  private readonly concreteTexture =
    createConcreteTexture()

  private readonly concreteRoughnessTexture =
    this.createConcreteRoughnessTexture()

  // ==================================================
  // MATERIALES BASE
  // ==================================================

  private readonly concreteMat =
    new THREE.MeshStandardMaterial({
      color: '#8da3a8',
      map: this.concreteTexture,
      bumpMap: this.concreteTexture,
      roughnessMap: this.concreteRoughnessTexture,
      bumpScale: 0.018,
      roughness: 0.82,
      metalness: 0.02,
    })


  private readonly concreteLightMat =
    new THREE.MeshStandardMaterial({
      // A quiet ice concrete, held a step below pure white so the structural
      // members still read as mass rather than a bright graphic overlay.
      color: '#cbd9d9',
      map: this.concreteTexture,
      bumpMap: this.concreteTexture,
      roughnessMap: this.concreteRoughnessTexture,
      bumpScale: 0.014,
      roughness: 0.74,
      metalness: 0.02,
    })


  private readonly concreteDarkMat =
    new THREE.MeshStandardMaterial({
      color: '#263946',
      map: this.concreteTexture,
      bumpMap: this.concreteTexture,
      roughnessMap: this.concreteRoughnessTexture,
      bumpScale: 0.012,
      roughness: 0.84,
      metalness: 0.01,
    })


  private readonly crownShadowMat =
    new THREE.MeshStandardMaterial({
      color: '#101d2a',
      map: this.concreteTexture,
      bumpMap: this.concreteTexture,
      roughnessMap: this.concreteRoughnessTexture,
      bumpScale: 0.01,
      roughness: 0.88,
      metalness: 0.01,
    })


  private readonly roofDeckMat =
    new THREE.MeshStandardMaterial({
      // A locally cooler roof membrane distinguishes the occupied upper plane
      // from the dark side mass in elevated architectural views.
      color: '#58767c',
      map: this.concreteTexture,
      bumpMap: this.concreteTexture,
      roughnessMap: this.concreteRoughnessTexture,
      bumpScale: 0.009,
      roughness: 0.76,
      metalness: 0.02,
    })


  private readonly frameMat =
    new THREE.MeshStandardMaterial({
      color: '#bfd2d4',
      roughness: 0.48,
      metalness: 0.16,
    })


  private readonly darkMetalMat =
    new THREE.MeshStandardMaterial({
      color: '#0d1922',
      roughness: 0.56,
      metalness: 0.22,
    })


  private readonly entranceBlueMat =
    new THREE.MeshStandardMaterial({
      color: '#23536e',
      roughness: 0.46,
      metalness: 0.14,

      emissive: '#123b52',
      emissiveIntensity: 0.052,
    })


  private readonly wetPearlConcreteMat =
    new THREE.MeshStandardMaterial({
      color: '#c9d9d8',
      map: this.concreteTexture,
      bumpMap: this.concreteTexture,
      roughnessMap: this.concreteRoughnessTexture,
      bumpScale: 0.012,
      roughness: 0.62,
      metalness: 0.02,
    })


  private readonly wetConcreteMat =
    new THREE.MeshStandardMaterial({
      color: '#779097',
      map: this.concreteTexture,
      bumpMap: this.concreteTexture,
      roughnessMap: this.concreteRoughnessTexture,
      bumpScale: 0.014,
      roughness: 0.58,
      metalness: 0.02,
    })


  private readonly wetNavyConcreteMat =
    new THREE.MeshStandardMaterial({
      color: '#203a49',
      map: this.concreteTexture,
      bumpMap: this.concreteTexture,
      roughnessMap: this.concreteRoughnessTexture,
      bumpScale: 0.012,
      roughness: 0.54,
      metalness: 0.02,
    })


  private readonly wetEntranceBlueMat =
    new THREE.MeshStandardMaterial({
      color: '#23536e',
      roughness: 0.34,
      metalness: 0.16,
      emissive: '#123b52',
      emissiveIntensity: 0.052,
    })


  // ==================================================
  // CRISTALES
  // ==================================================

  private readonly glassBlueMat =
    new THREE.MeshStandardMaterial({
      color: '#18506f',
      roughness: 0.31,
      metalness: 0.32,

      emissive: '#0c3047',
      emissiveIntensity: 0.055,
    })


  private readonly glassDeepMat =
    new THREE.MeshStandardMaterial({
      color: '#0a1d2c',
      roughness: 0.40,
      metalness: 0.24,

      emissive: '#05111a',
      emissiveIntensity: 0.012,
    })


  private readonly glassColdMat =
    new THREE.MeshStandardMaterial({
      color: '#28647e',
      roughness: 0.27,
      metalness: 0.34,

      emissive: '#144359',
      emissiveIntensity: 0.074,
    })


  private readonly glassSoftMat =
    new THREE.MeshStandardMaterial({
      color: '#235066',
      roughness: 0.36,
      metalness: 0.22,

      emissive: '#103243',
      emissiveIntensity: 0.036,
    })


  private readonly warmGlassMat =
    new THREE.MeshStandardMaterial({
      color: '#765c45',
      roughness: 0.4,
      metalness: 0.03,

      emissive: '#ffd2a0',
      emissiveIntensity: 0.56,
    })


  private readonly warmWindowMat =
    new THREE.MeshStandardMaterial({
      color: '#634b39',
      roughness: 0.44,
      metalness: 0.02,

      emissive: '#e6b27e',
      emissiveIntensity: 0.23,
    })


  constructor() {

    super()

    this.name =
      'BellaDurmienteBuilding'


    this.buildMainVolume()

    this.buildArchitecturalMass()

    this.buildRearMassExtension()

    this.buildUpperFacade()

    this.buildLowerFacade()

    this.buildEntrance()

    this.buildSigns()

    this.buildRoof()

    this.buildGroundFloor()

    this.buildDepthDetails()

    this.buildLighting()
  }


  private createConcreteRoughnessTexture():
    THREE.CanvasTexture {

    const texture =
      this.concreteTexture.clone()


    texture.colorSpace =
      THREE.NoColorSpace


    texture.needsUpdate =
      true


    return texture
  }


  // ==================================================
  // CUERPO PRINCIPAL
  // ==================================================

  private buildMainVolume(): void {

    /*
       El cuerpo ahora tiene un poco más de profundidad.

       Esto es importante porque cuando la cámara gira
       algunos grados ya no debe sentirse como una lámina.
    */

    this.addBox(
      6.8,
      13.5,
      1.3,
      0,
      6.75,
      -0.15,
      this.concreteMat,
    )


    // Laterales oscuros

    this.addBox(
      0.22,
      13.0,
      1.82,
      -3.32,
      6.65,
      -0.12,
      this.concreteDarkMat,
    )


    this.addBox(
      0.22,
      13.0,
      1.82,
      3.32,
      6.65,
      -0.12,
      this.concreteDarkMat,
    )


    // Base

    this.addBox(
      7.15,
      0.56,
      1.95,
      0,
      0.28,
      -0.02,
      this.concreteDarkMat,
    )


    // Cornisa superior

    this.addBox(
      7.12,
      0.3,
      1.86,
      0,
      13.46,
      -0.08,
      this.concreteLightMat,
    )
  }


  // ==================================================
  // MASA ARQUITECTÓNICA V5
  // ==================================================

  private buildArchitecturalMass(): void {

    /*
       Bella remains a known front-facing hotel, but the facade now resolves
       into a sequence of returns and a recessed body. The deep elements are
       intentionally unadorned: they are visible from authored side views
       without pretending to document an unknown rear elevation.
    */

    // Recessed central body behind the familiar facade plane.
    this.addBox(
      5.72,
      12.34,
      2.34,
      0.12,
      7.02,
      -0.78,
      this.concreteDarkMat,
    )


    // Tall side returns give the oblique room and gallery cameras a real
    // front → return → deep-body progression.
    this.addBox(
      0.52,
      12.78,
      3.16,
      -3.08,
      6.57,
      -0.74,
      this.concreteDarkMat,
    )


    this.addBox(
      0.56,
      12.78,
      3.16,
      3.08,
      6.57,
      -0.74,
      this.concreteDarkMat,
    )


    // An upper inset avoids a single extruded slab and keeps the crown's
    // shadowed recess legible below the parapet.
    this.addBox(
      5.28,
      7.84,
      1.34,
      0.16,
      9.18,
      -1.83,
      this.concreteMat,
    )


    this.addBox(
      5.88,
      0.34,
      2.64,
      0.08,
      12.86,
      -0.78,
      this.crownShadowMat,
    )


    // The lower architectural skirt grounds the portal and makes its warm
    // threshold feel carved into substantial construction.
    this.addBox(
      5.74,
      2.86,
      1.72,
      0.26,
      1.58,
      -0.93,
      this.concreteDarkMat,
    )
  }


  // ==================================================
  // CUERPO POSTERIOR / PROFUNDIDAD
  // ==================================================

  private buildRearMassExtension(): void {

    /*
       The existing facade remains the documented public face. This is a
       deliberately quiet continuation behind it: its job is to give the
       authored oblique cameras a believable hotel volume, not to invent an
       unknown rear elevation.
    */

    // A recessed, continuous body carries the familiar front volume back
    // almost five metres. Keeping it narrower than the facade leaves the
    // existing dark side returns as the silhouette that viewers recognise.
    this.addBox(
      5.42,
      12.38,
      4.64,
      0.04,
      6.42,
      -2.86,
      this.concreteDarkMat,
    )


    // Material shifts at the two side returns keep the enlarged body legible
    // in gallery angles while remaining blank, structural planes.
    this.addBox(
      0.08,
      11.72,
      4.18,
      -2.71,
      6.24,
      -3.02,
      this.concreteMat,
    )


    this.addBox(
      0.08,
      11.72,
      4.18,
      2.79,
      6.24,
      -3.02,
      this.concreteMat,
    )


    // The roof plane follows the extended body, so elevated views resolve as
    // a single building rather than a thin facade with a separate block.
    this.addBox(
      5.76,
      0.24,
      4.24,
      0.04,
      13.37,
      -3.06,
      this.crownShadowMat,
    )


    // The old solid parapet plate read as a large black lid in Huancayo's
    // elevated view. A proper perimeter keeps the same exterior silhouette
    // while revealing a real, recessed roof terrace inside it.
    this.addBox(
      5.08,
      0.08,
      3.58,
      0.04,
      13.47,
      -3.08,
      this.roofDeckMat,
      false,
    )


    // Rear and front parapets frame the terrace without pretending to model
    // an unknown rear facade.
    this.addBox(
      5.52,
      0.42,
      0.18,
      0.04,
      13.67,
      -5.0,
      this.concreteDarkMat,
    )


    this.addBox(
      5.52,
      0.34,
      0.16,
      0.04,
      13.63,
      -1.17,
      this.concreteDarkMat,
    )


    // The side walls make the depth legible in the high right-hand camera.
    this.addBox(
      0.18,
      0.42,
      4.0,
      -2.64,
      13.67,
      -3.08,
      this.concreteMat,
    )


    this.addBox(
      0.18,
      0.42,
      4.0,
      2.72,
      13.67,
      -3.08,
      this.concreteMat,
    )


    // One recessed service/lightwell bay breaks the terrace into an
    // intentional roof plan instead of decorative rooftop clutter.
    this.addBox(
      1.56,
      0.045,
      1.1,
      -1.04,
      13.51,
      -3.54,
      this.crownShadowMat,
      false,
    )


    this.addBox(
      1.76,
      0.12,
      0.1,
      -1.04,
      13.57,
      -4.12,
      this.concreteMat,
    )


    this.addBox(
      1.76,
      0.12,
      0.1,
      -1.04,
      13.57,
      -2.96,
      this.concreteMat,
    )


    this.addBox(
      0.1,
      0.12,
      1.2,
      -1.92,
      13.57,
      -3.54,
      this.concreteMat,
    )


    this.addBox(
      0.1,
      0.12,
      1.2,
      -0.16,
      13.57,
      -3.54,
      this.concreteMat,
    )


    // The real building's roof has a small service core. This continuation
    // sits behind the visible crown and makes high viewpoints feel occupied
    // without competing with the front composition.
    this.addBox(
      2.36,
      1.18,
      3.18,
      1.06,
      14.08,
      -2.52,
      this.concreteMat,
    )


    // A slim cap establishes a designed top termination and stops the core
    // from reading as another unarticulated black box in the top view.
    this.addBox(
      2.56,
      0.14,
      3.36,
      1.06,
      14.74,
      -2.52,
      this.crownShadowMat,
    )


    this.addBox(
      1.84,
      0.07,
      2.62,
      1.06,
      14.83,
      -2.52,
      this.roofDeckMat,
      false,
    )
  }


  // ==================================================
  // FACHADA ALTA
  // ==================================================

  private buildUpperFacade(): void {

    const frontZ =
      0.64


    // Dark returns sit over the primary mass. The glass then recesses into
    // them while structural members finish proud, giving the facade three
    // distinct planes under the moving moon light.
    this.addBox(
      1.04,
      8.96,
      0.08,
      -2.25,
      8.63,
      0.545,
      this.concreteDarkMat,
    )


    this.addBox(
      2.3,
      8.98,
      0.08,
      0.03,
      8.61,
      0.545,
      this.concreteDarkMat,
    )


    // ==================================================
    // PAÑO IZQUIERDO
    // ==================================================

    this.addBox(
      0.88,
      8.75,
      0.09,
      -2.25,
      8.63,
      frontZ,
      this.glassDeepMat,
      false,
    )


    this.addWindowGrid(
      -2.25,
      8.63,
      frontZ + 0.08,
      0.88,
      8.75,
      1,
      7,
    )


    // ==================================================
    // PAÑO CENTRAL
    // ==================================================

    this.addBox(
      2.14,
      8.78,
      0.09,
      0.03,
      8.61,
      frontZ + 0.01,
      this.glassBlueMat,
      false,
    )


    this.addWindowGrid(
      0.03,
      8.61,
      frontZ + 0.09,
      2.14,
      8.78,
      3,
      7,
    )


    // --------------------------------------------------
    // Variación de algunas ventanas
    //
    // Rompe la uniformidad azul.
    // --------------------------------------------------

    this.addWindowOverlay(
      -0.68,
      10.55,
      this.glassColdMat,
    )


    this.addWindowOverlay(
      0.72,
      8.05,
      this.glassDeepMat,
    )


    this.addWindowOverlay(
      -0.02,
      6.82,
      this.glassSoftMat,
    )


    /*
       Una sola ventana cálida arriba.

       Muy tenue.
       No queremos un edificio lleno de luces.
    */

    this.addWindowOverlay(
      0.70,
      11.75,
      this.warmWindowMat,
    )


    // ==================================================
    // MÓDULO DERECHO
    // ==================================================

    const rightX =
      2.12


    this.addBox(
      1.74,
      6.62,
      0.08,
      rightX,
      9.25,
      0.545,
      this.concreteDarkMat,
    )


    this.addBox(
      1.58,
      1.58,
      0.09,
      rightX,
      11.68,
      frontZ,
      this.glassColdMat,
      false,
    )


    this.addBox(
      1.58,
      1.58,
      0.09,
      rightX,
      9.25,
      frontZ,
      this.glassBlueMat,
      false,
    )


    this.addBox(
      1.58,
      1.58,
      0.09,
      rightX,
      6.82,
      frontZ,
      this.glassDeepMat,
      false,
    )


    this.addWindowGrid(
      rightX,
      11.68,
      frontZ + 0.08,
      1.58,
      1.58,
      2,
      1,
    )


    this.addWindowGrid(
      rightX,
      9.25,
      frontZ + 0.08,
      1.58,
      1.58,
      2,
      1,
    )


    this.addWindowGrid(
      rightX,
      6.82,
      frontZ + 0.08,
      1.58,
      1.58,
      2,
      1,
    )


    // ==================================================
    // PILARES
    // ==================================================

    const verticals =
      [
        -2.82,
        -1.68,
        -1.0,
        1.27,
        2.98,
      ]


    verticals.forEach(
      (
        x,
        index,
      ) => {

        this.addBox(
          index === 0 ||
          index === 4
            ? 0.34
            : 0.27,

          index === 4
            ? 9.0
            : 9.4,

          0.16,

          x,

          8.5,

          frontZ + 0.055,

          this.concreteLightMat,
        )

      },
    )


    // ==================================================
    // BANDAS DERECHAS
    // ==================================================

    this.addBox(
      1.86,
      0.4,
      0.2,
      rightX,
      10.46,
      frontZ + 0.055,
      this.concreteLightMat,
    )


    this.addBox(
      1.86,
      0.4,
      0.2,
      rightX,
      8.03,
      frontZ + 0.055,
      this.concreteLightMat,
    )


    // Línea inferior de torre

    this.addBox(
      5.95,
      0.35,
      0.2,
      0.06,
      4.98,
      frontZ + 0.055,
      this.concreteLightMat,
    )


    // The old projecting window boxes have intentionally been removed.
    // Their arbitrary depth made the glazing read as floating blocks instead
    // of a calm, continuous hotel curtain wall.
  }


  // ==================================================
  // PISO INTERMEDIO
  // ==================================================

  private buildLowerFacade(): void {

    const frontZ =
      0.64


    // This continuous return connects the five glazed bays back to the main
    // concrete volume, preserving a narrow shadow line around the full band.
    this.addBox(
      6.18,
      1.76,
      0.08,
      0,
      4.0,
      0.545,
      this.concreteDarkMat,
    )


    const positions =
      [
        -2.15,
        -1.08,
        0,
        1.08,
        2.15,
      ]


    const materials =
      [
        this.glassDeepMat,
        this.glassSoftMat,
        this.glassColdMat,
        this.glassBlueMat,
        this.glassDeepMat,
      ]


    positions.forEach(
      (
        x,
        index,
      ) => {

        this.addBox(
          0.96,
          1.48,
          0.085,
          x,
          4.0,
          frontZ,
          materials[index],
          false,
        )

      },
    )


    // Mullions

    const frames =
      [
        -1.61,
        -0.54,
        0.54,
        1.61,
      ]


    frames.forEach(
      (
        x,
      ) => {

        this.addBox(
          0.12,
          1.64,
          0.14,
          x,
          4.0,
          frontZ + 0.055,
          this.frameMat,
          false,
        )

      },
    )


    this.addBox(
      6.05,
      0.28,
      0.16,
      0,
      4.82,
      frontZ + 0.05,
      this.frameMat,
      false,
    )
  }


  // ==================================================
  // ENTRADA V4
  // ==================================================

  private buildEntrance(): void {

    const entrance =
      new THREE.Group()


    entrance.name =
      'BellaMainEntrance'


    const facadeZ =
      0.94


    // ==================================================
    // HUECO DE RECEPCIÓN
    //
    // The dark shell begins in the facade mass, while the glazed door remains
    // set inside it. This preserves a readable dark-to-warm threshold rather
    // than treating the reception as a luminous plane on the wall.
    // ==================================================

    this.addBoxTo(
      entrance,
      1.64,
      2.4,
      0.34,
      0.75,
      1.36,
      facadeZ,
      this.darkMetalMat,
    )


    this.addBoxTo(
      entrance,
      1.2,
      1.84,
      0.055,
      0.75,
      1.32,
      facadeZ + 0.205,
      this.warmGlassMat,
      false,
    )


    // Door division and transom retain legible reception material inside the
    // warm field. They are deliberately non-shadow-casting fine details.
    this.addBoxTo(
      entrance,
      0.06,
      1.74,
      0.08,
      0.75,
      1.32,
      facadeZ + 0.24,
      this.frameMat,
      false,
    )


    this.addBoxTo(
      entrance,
      1.24,
      0.06,
      0.08,
      0.75,
      2.2,
      facadeZ + 0.24,
      this.frameMat,
      false,
    )


    this.addBoxTo(
      entrance,
      1.38,
      0.09,
      0.48,
      0.75,
      0.43,
      facadeZ + 0.17,
      this.darkMetalMat,
    )


    // ==================================================
    // PORTAL ARQUITECTÓNICO
    // ==================================================

    this.addBoxTo(
      entrance,
      0.28,
      3.12,
      0.44,
      -0.2,
      1.68,
      facadeZ + 0.28,
      this.entranceBlueMat,
    )


    this.addBoxTo(
      entrance,
      0.28,
      3.12,
      0.44,
      1.7,
      1.68,
      facadeZ + 0.28,
      this.entranceBlueMat,
    )


    // Inserciones verticales luminosas

    const warmStrip =
      this.createWarmStripMaterial()


    this.addBoxTo(
      entrance,
      0.04,
      2.38,
      0.04,
      -0.04,
      1.63,
      facadeZ + 0.525,
      warmStrip,
      false,
    )


    this.addBoxTo(
      entrance,
      0.04,
      2.38,
      0.04,
      1.54,
      1.63,
      facadeZ + 0.525,
      warmStrip,
      false,
    )


    // ==================================================
    // CABEZAL DEL PORTAL
    // ==================================================

    this.addBoxTo(
      entrance,
      2.18,
      0.28,
      0.46,
      0.75,
      3.13,
      facadeZ + 0.28,
      this.entranceBlueMat,
    )


    // ==================================================
    // MARQUESINA
    // ==================================================

    const canopy =
      this.addBoxTo(
        entrance,
      2.76,
      0.2,
      1.38,
      0.75,
      2.76,
      facadeZ + 0.68,
        this.wetEntranceBlueMat,
      )


    canopy.rotation.x =
      THREE.MathUtils.degToRad(
        -3,
      )


    // Underside and its narrow practical keep the canopy from becoming a
    // floating blue slab. The practical is visible only from the threshold.

    this.addBoxTo(
      entrance,
      2.44,
      0.055,
      1.16,
      0.75,
      2.63,
      facadeZ + 0.69,
      this.darkMetalMat,
      false,
    )

    this.addBoxTo(
      entrance,
      1.5,
      0.035,
      0.08,
      0.75,
      2.59,
      facadeZ + 1.05,
      warmStrip,
      false,
    )


    // ==================================================
    // PLATAFORMA
    // ==================================================

    this.addBoxTo(
      entrance,
      3.0,
      0.15,
      1.48,
      0.75,
      0.08,
      facadeZ + 0.51,
      this.wetPearlConcreteMat,
    )


    this.addBoxTo(
      entrance,
      2.6,
      0.12,
      1.04,
      0.75,
      0.215,
      facadeZ + 0.78,
      this.wetConcreteMat,
    )


    // Two restrained risers meet the new courtyard path. They make the warm
    // door a real threshold while remaining small enough for the Hero refuge.
    this.addBoxTo(
      entrance,
      3.28,
      0.1,
      0.52,
      0.75,
      0.05,
      2.3,
      this.wetNavyConcreteMat,
    )


    this.addBoxTo(
      entrance,
      3.02,
      0.08,
      0.34,
      0.75,
      0.11,
      2.0,
      this.wetConcreteMat,
    )


    this.add(
      entrance,
    )
  }


  // ==================================================
  // LETREROS
  // ==================================================

  private buildSigns(): void {

    if (!this.showBuildingSigns) {
      return
    }

    const hospedajeMaterial =
      this.createSignMaterial(
        'HOSPEDAJE',
        'BELLA DURMIENTE',
        '#062b59',
        '#f4faff',
      )


    this.addBox(
      2.8,
      0.7,
      0.18,
      -0.82,
      2.91,
      1.01,
      hospedajeMaterial,
      false,
    )


    const bellaMaterial =
      this.createSignMaterial(
        'Bella Durmiente',
        'HOSPEDAJE',
        '#062d5e',
        '#eef8ff',
      )


    this.addBox(
      1.78,
      1.04,
      0.2,
      2.08,
      5.35,
      1.05,
      bellaMaterial,
      false,
    )


    // Tótem lateral vertical

    const verticalMaterial =
      this.createVerticalSignMaterial()


    this.addBox(
      0.4,
      4.25,
      0.22,
      -3.03,
      10.18,
      1.0,
      verticalMaterial,
      false,
    )
  }


  // ==================================================
  // AZOTEA / SILUETA
  // ==================================================

  private buildRoof(): void {

    // V5 crown: a deeper, almost-black navy cap creates a distinct nocturnal
    // overhang and shadow pocket without borrowing a foreign roof language.
    this.addBox(
      7.42,
      0.22,
      3.08,
      0,
      13.34,
      -0.46,
      this.crownShadowMat,
    )


    this.addBox(
      7.18,
      0.38,
      2.9,
      0.02,
      13.63,
      -0.5,
      this.concreteDarkMat,
    )


    this.addBox(
      6.66,
      0.17,
      2.7,
      0.08,
      13.45,
      -0.43,
      this.crownShadowMat,
    )

    // A slim dark underlap gives the cornice a real separation from the mass
    // below without changing the established roof silhouette.
    this.addBox(
      6.08,
      0.1,
      1.9,
      0.16,
      13.52,
      -0.06,
      this.concreteDarkMat,
    )


    // Remate general

    this.addBox(
      5.95,
      0.2,
      1.88,
      0.22,
      13.72,
      -0.05,
      this.concreteLightMat,
    )


    // Volumen principal superior

    this.addBox(
      2.45,
      1.32,
      1.55,
      1.18,
      14.2,
      -0.10,
      this.concreteMat,
    )


    // Volumen secundario

    this.addBox(
      1.05,
      0.72,
      1.34,
      -0.52,
      13.96,
      -0.15,
      this.concreteDarkMat,
    )


    // Cara frontal del volumen superior

    this.addBox(
      1.78,
      0.68,
      0.08,
      1.18,
      14.2,
      0.70,
      this.glassDeepMat,
      false,
    )


    // Pequeño remate vertical

    this.addBox(
      0.18,
      1.18,
      0.18,
      2.3,
      14.12,
      0.08,
      this.concreteLightMat,
      false,
    )
  }


  // ==================================================
  // PLANTA BAJA
  // ==================================================

  private buildGroundFloor(): void {

    // Portón izquierdo

    this.addBox(
      1.52,
      2.34,
      0.08,
      -1.96,
      1.31,
      0.55,
      this.concreteDarkMat,
    )

    this.addBox(
      1.38,
      2.2,
      0.09,
      -1.96,
      1.31,
      0.65,
      this.entranceBlueMat,
      false,
    )


    for (
      let i =
        -2;
      i <= 2;
      i += 1
    ) {

      this.addBox(
        1.18,
        0.035,
        0.03,
        -1.96,
        1.31 +
          i * 0.34,
        0.745,
        this.frameMat,
        false,
      )
    }


    // Sector derecho

    this.addBox(
      1.4,
      1.8,
      0.08,
      2.45,
      1.3,
      0.55,
      this.concreteDarkMat,
    )

    this.addBox(
      1.25,
      1.66,
      0.085,
      2.45,
      1.3,
      0.65,
      this.glassDeepMat,
      false,
    )


    this.addBox(
      0.11,
      1.82,
      0.12,
      1.74,
      1.35,
      0.72,
      this.frameMat,
      false,
    )


    this.addBox(
      0.11,
      1.82,
      0.12,
      3.05,
      1.35,
      0.72,
      this.frameMat,
      false,
    )
  }


  // ==================================================
  // PROFUNDIDAD EXTRA
  // ==================================================

  private buildDepthDetails(): void {

    /*
       Pequeños retornos laterales.

       Desde el frente casi no molestan,
       pero cuando la cámara gira hacen mucha diferencia.
    */

    this.addBox(
      0.55,
      8.9,
      0.72,
      -2.92,
      8.6,
      0.27,
      this.concreteDarkMat,
    )


    this.addBox(
      0.52,
      8.6,
      0.72,
      3.0,
      8.45,
      0.27,
      this.concreteDarkMat,
    )


    // Profundidad de los separadores principales

    this.addBox(
      0.24,
      8.9,
      0.43,
      -1.0,
      8.55,
      0.64,
      this.concreteLightMat,
    )


    this.addBox(
      0.24,
      8.9,
      0.43,
      1.27,
      8.55,
      0.64,
      this.concreteLightMat,
    )


    // Two hairline reveals keep the existing lower facade intact while
    // breaking the large plane into photographed architectural layers.
    this.addBox(
      6.02,
      0.07,
      0.1,
      0.04,
      5.02,
      0.735,
      this.darkMetalMat,
      false,
    )


    this.addBox(
      5.92,
      0.06,
      0.1,
      0.06,
      3.06,
      0.735,
      this.darkMetalMat,
      false,
    )
  }


  // ==================================================
  // LUCES LOCALES
  // ==================================================

  private buildLighting(): void {

    // A contained practical reinforces the recessed glazing. The world-level
    // reception light remains the broader cue; this one is intentionally too
    // short-ranged to wash the lower facade.

    const receptionLight =
      new THREE.PointLight(
        '#ffe1b8',
        2.9,
        4.8,
        2,
      )


    receptionLight.position.set(
      0.75,
      1.52,
      1.4,
    )


    receptionLight.castShadow =
      false


    this.add(
      receptionLight,
    )

  }


  // ==================================================
  // OVERLAY DE VENTANA
  // ==================================================

  private addWindowOverlay(
    x: number,
    y: number,
    material: THREE.Material,
  ): void {

    this.addBox(
      0.64,
      1.02,
      0.035,
      x,
      y,
      0.705,
      material,
      false,
    )
  }


  // ==================================================
  // GRID
  // ==================================================

  private addWindowGrid(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    columns: number,
    rows: number,
  ): void {

    const columnWidth =
      width /
      columns


    const rowHeight =
      height /
      rows


    for (
      let i =
        1;
      i <
        columns;
      i += 1
    ) {

      const gx =
        x -
        width / 2 +
        columnWidth *
          i


      this.addBox(
        0.035,
        height,
        0.025,
        gx,
        y,
        z,
        this.frameMat,
        false,
      )
    }


    for (
      let i =
        1;
      i <
        rows;
      i += 1
    ) {

      const gy =
        y -
        height / 2 +
        rowHeight *
          i


      this.addBox(
        width,
        0.035,
        0.025,
        x,
        gy,
        z,
        this.frameMat,
        false,
      )
    }
  }


  // ==================================================
  // MATERIAL LUMINOSO CÁLIDO
  // ==================================================

  private createWarmStripMaterial():
    THREE.MeshStandardMaterial {

    return new THREE.MeshStandardMaterial({
      color:
        '#d7bb91',

      emissive:
        '#ffd9a5',

      emissiveIntensity:
        0.86,

      roughness:
        0.42,

      metalness:
        0.02,
    })
  }


  // ==================================================
  // SIGN PRINCIPAL
  // ==================================================

  private createSignMaterial(
    title: string,
    subtitle: string,
    background: string,
    foreground: string,
  ): THREE.MeshStandardMaterial {

    const canvas =
      document.createElement(
        'canvas',
      )


    canvas.width =
      1024


    canvas.height =
      320


    const context =
      canvas.getContext(
        '2d',
      )


    if (!context) {
      throw new Error(
        'No se pudo crear CanvasTexture',
      )
    }


    context.fillStyle =
      background


    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    )


    context.strokeStyle =
      'rgba(218,239,252,.48)'


    context.lineWidth =
      8


    context.strokeRect(
      12,
      12,
      canvas.width -
        24,
      canvas.height -
        24,
    )


    context.textAlign =
      'center'


    context.textBaseline =
      'middle'


    context.fillStyle =
      foreground


    context.font =
      title.length >
      12
        ? '600 98px Georgia'
        : '800 124px Arial'


    context.fillText(
      title,
      canvas.width /
        2,
      canvas.height *
        0.43,
    )


    context.fillStyle =
      'rgba(225,242,252,.78)'


    context.font =
      '600 34px Arial'


    context.fillText(
      subtitle,
      canvas.width /
        2,
      canvas.height *
        0.76,
    )


    const texture =
      new THREE.CanvasTexture(
        canvas,
      )


    texture.colorSpace =
      THREE.SRGBColorSpace


    return new THREE.MeshStandardMaterial({
      map:
        texture,

      emissiveMap:
        texture,

      emissive:
        '#347fae',

      emissiveIntensity:
        0.48,

      roughness:
        0.48,

      metalness:
        0.04,
    })
  }


  // ==================================================
  // TÓTEM VERTICAL
  // ==================================================

  private createVerticalSignMaterial():
    THREE.MeshStandardMaterial {

    const canvas =
      document.createElement(
        'canvas',
      )


    canvas.width =
      256


    canvas.height =
      1024


    const context =
      canvas.getContext(
        '2d',
      )


    if (!context) {
      throw new Error(
        'No se pudo crear el letrero vertical',
      )
    }


    context.fillStyle =
      '#052d5b'


    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    )


    context.save()


    context.translate(
      canvas.width /
        2,
      canvas.height /
        2,
    )


    context.rotate(
      -Math.PI /
        2,
    )


    context.textAlign =
      'center'


    context.textBaseline =
      'middle'


    context.fillStyle =
      '#edf8ff'


    context.font =
      '800 72px Arial'


    context.fillText(
      'HOSPEDAJE',
      0,
      0,
    )


    context.restore()


    const texture =
      new THREE.CanvasTexture(
        canvas,
      )


    texture.colorSpace =
      THREE.SRGBColorSpace


    return new THREE.MeshStandardMaterial({
      map:
        texture,

      emissiveMap:
        texture,

      emissive:
        '#277aac',

      emissiveIntensity:
        0.42,

      roughness:
        0.5,
    })
  }

  // ==================================================
  // HELPERS
  // ==================================================

  private addBox(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    shadows: boolean = true,
  ): THREE.Mesh {

    const mesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth,
        ),
        material,
      )


    mesh.position.set(
      x,
      y,
      z,
    )


    mesh.castShadow =
      shadows


    mesh.receiveShadow =
      shadows


    this.add(
      mesh,
    )


    return mesh
  }


  private addBoxTo(
    parent: THREE.Object3D,
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    shadows: boolean = true,
  ): THREE.Mesh {

    const mesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth,
        ),
        material,
      )


    mesh.position.set(
      x,
      y,
      z,
    )


    mesh.castShadow =
      shadows


    mesh.receiveShadow =
      shadows


    parent.add(
      mesh,
    )


    return mesh
  }
}
