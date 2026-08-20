import * as THREE from 'three'

export class BellaBuilding extends THREE.Group {

  private readonly showBuildingSigns = false

  // ==================================================
  // MATERIALES BASE
  // ==================================================

  private readonly concreteMat =
    new THREE.MeshStandardMaterial({
      color: '#66737e',
      roughness: 0.88,
      metalness: 0.02,
    })


  private readonly concreteLightMat =
    new THREE.MeshStandardMaterial({
      color: '#a7b2ba',
      roughness: 0.82,
      metalness: 0.02,
    })


  private readonly concreteDarkMat =
    new THREE.MeshStandardMaterial({
      color: '#283641',
      roughness: 0.91,
      metalness: 0.01,
    })


  private readonly frameMat =
    new THREE.MeshStandardMaterial({
      color: '#6b7d8a',
      roughness: 0.7,
      metalness: 0.1,
    })


  private readonly darkMetalMat =
    new THREE.MeshStandardMaterial({
      color: '#07111c',
      roughness: 0.46,
      metalness: 0.3,
    })


  private readonly entranceBlueMat =
    new THREE.MeshStandardMaterial({
      color: '#07345e',
      roughness: 0.38,
      metalness: 0.16,

      emissive: '#062748',
      emissiveIntensity: 0.28,
    })


  // ==================================================
  // CRISTALES
  // ==================================================

  private readonly glassBlueMat =
    new THREE.MeshStandardMaterial({
      color: '#053263',
      roughness: 0.2,
      metalness: 0.2,

      emissive: '#05254a',
      emissiveIntensity: 0.34,
    })


  private readonly glassDeepMat =
    new THREE.MeshStandardMaterial({
      color: '#021a34',
      roughness: 0.25,
      metalness: 0.16,

      emissive: '#03182e',
      emissiveIntensity: 0.16,
    })


  private readonly glassColdMat =
    new THREE.MeshStandardMaterial({
      color: '#07518d',
      roughness: 0.18,
      metalness: 0.24,

      emissive: '#07406e',
      emissiveIntensity: 0.46,
    })


  private readonly glassSoftMat =
    new THREE.MeshStandardMaterial({
      color: '#123a5c',
      roughness: 0.24,
      metalness: 0.12,

      emissive: '#102d45',
      emissiveIntensity: 0.23,
    })


  private readonly warmGlassMat =
    new THREE.MeshStandardMaterial({
      color: '#60452f',
      roughness: 0.27,
      metalness: 0.03,

      emissive: '#ff9c4a',
      emissiveIntensity: 1.65,
    })


  private readonly warmWindowMat =
    new THREE.MeshStandardMaterial({
      color: '#654829',
      roughness: 0.3,
      metalness: 0.02,

      emissive: '#e98535',
      emissiveIntensity: 0.72,
    })


  constructor() {

    super()

    this.name =
      'BellaDurmienteBuilding'


    this.buildMainVolume()

    this.buildUpperFacade()

    this.buildLowerFacade()

    this.buildEntrance()

    this.buildSigns()

    this.buildRoof()

    this.buildGroundFloor()

    this.buildDepthDetails()

    this.buildLighting()
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
      1.72,
      0,
      6.75,
      -0.12,
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
  // FACHADA ALTA
  // ==================================================

  private buildUpperFacade(): void {

    const frontZ =
      0.83


    // ==================================================
    // PAÑO IZQUIERDO
    // ==================================================

    this.addBox(
      0.88,
      8.75,
      0.13,
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
      0.14,
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
      1.58,
      1.58,
      0.13,
      rightX,
      11.68,
      frontZ,
      this.glassColdMat,
      false,
    )


    this.addBox(
      1.58,
      1.58,
      0.13,
      rightX,
      9.25,
      frontZ,
      this.glassBlueMat,
      false,
    )


    this.addBox(
      1.58,
      1.58,
      0.13,
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

          0.2,

          x,

          8.5,

          frontZ + 0.025,

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
      frontZ + 0.04,
      this.concreteLightMat,
    )


    this.addBox(
      1.86,
      0.4,
      0.2,
      rightX,
      8.03,
      frontZ + 0.04,
      this.concreteLightMat,
    )


    // Línea inferior de torre

    this.addBox(
      5.95,
      0.35,
      0.2,
      0.06,
      4.98,
      frontZ + 0.04,
      this.concreteLightMat,
    )


    // ==================================================
    // VENTANAS ABIERTAS
    // ==================================================

    this.addAwningWindow(
      1.82,
      9.25,
      frontZ + 0.26,
    )


    this.addAwningWindow(
      2.46,
      6.82,
      frontZ + 0.26,
    )


    this.addAwningWindow(
      0.42,
      6.22,
      frontZ + 0.26,
    )
  }


  // ==================================================
  // PISO INTERMEDIO
  // ==================================================

  private buildLowerFacade(): void {

    const frontZ =
      0.86


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
          0.12,
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
          frontZ + 0.05,
          this.frameMat,
        )

      },
    )


    this.addBox(
      6.05,
      0.28,
      0.16,
      0,
      4.82,
      frontZ + 0.04,
      this.frameMat,
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


    /*
       El acceso ahora sobresale bastante más.

       Eso hace que desde ángulos pequeños
       realmente genere silueta, sombra y profundidad.
    */

    const facadeZ =
      1.02


    // ==================================================
    // HUECO DE RECEPCIÓN
    // ==================================================

    this.addBoxTo(
      entrance,
      1.52,
      2.28,
      0.25,
      0.75,
      1.34,
      facadeZ,
      this.darkMetalMat,
    )


    this.addBoxTo(
      entrance,
      0.94,
      1.8,
      0.08,
      0.75,
      1.34,
      facadeZ + 0.16,
      this.warmGlassMat,
      false,
    )


    // ==================================================
    // PORTAL ARQUITECTÓNICO
    //
    // Nuestro equivalente a ese gran elemento
    // que dirige la mirada en Kage.
    //
    // No es un torii.
    // Son dos pilastras hoteleras.
    // ==================================================

    this.addBoxTo(
      entrance,
      0.25,
      3.15,
      0.52,
      -0.18,
      1.68,
      facadeZ + 0.28,
      this.entranceBlueMat,
    )


    this.addBoxTo(
      entrance,
      0.25,
      3.15,
      0.52,
      1.68,
      1.68,
      facadeZ + 0.28,
      this.entranceBlueMat,
    )


    // Inserciones verticales luminosas

    const warmStrip =
      this.createWarmStripMaterial()


    this.addBoxTo(
      entrance,
      0.045,
      2.5,
      0.04,
      -0.04,
      1.63,
      facadeZ + 0.57,
      warmStrip,
      false,
    )


    this.addBoxTo(
      entrance,
      0.045,
      2.5,
      0.04,
      1.54,
      1.63,
      facadeZ + 0.57,
      warmStrip,
      false,
    )


    // ==================================================
    // CABEZAL DEL PORTAL
    // ==================================================

    this.addBoxTo(
      entrance,
      2.12,
      0.25,
      0.54,
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
        2.72,
        0.18,
        1.72,
        0.75,
        2.76,
        facadeZ + 0.79,
        this.entranceBlueMat,
      )


    canopy.rotation.x =
      THREE.MathUtils.degToRad(
        -3,
      )


    // Luz bajo marquesina

    this.addBoxTo(
      entrance,
      2.12,
      0.06,
      0.12,
      0.75,
      2.6,
      facadeZ + 1.59,
      warmStrip,
      false,
    )


    // ==================================================
    // PLATAFORMA
    // ==================================================

    this.addBoxTo(
      entrance,
      2.9,
      0.13,
      1.55,
      0.75,
      0.12,
      facadeZ + 0.72,
      this.concreteLightMat,
    )


    this.addBoxTo(
      entrance,
      2.48,
      0.10,
      1.12,
      0.75,
      0.23,
      facadeZ + 0.86,
      this.concreteMat,
    )


    // ==================================================
    // MINI TÓTEM AL COSTADO DE LA ENTRADA
    // ==================================================

    const miniSign =
      this.createMiniEntranceSign()


    this.addBoxTo(
      entrance,
      0.48,
      1.5,
      0.16,
      1.98,
      0.92,
      facadeZ + 0.75,
      miniSign,
      false,
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
    )
  }


  // ==================================================
  // PLANTA BAJA
  // ==================================================

  private buildGroundFloor(): void {

    // Portón izquierdo

    this.addBox(
      1.38,
      2.2,
      0.16,
      -1.96,
      1.31,
      0.88,
      this.entranceBlueMat,
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
        0.98,
        this.frameMat,
        false,
      )
    }


    // Sector derecho

    this.addBox(
      1.25,
      1.66,
      0.12,
      2.45,
      1.3,
      0.89,
      this.glassDeepMat,
      false,
    )


    this.addBox(
      0.11,
      1.82,
      0.12,
      1.74,
      1.35,
      0.96,
      this.frameMat,
    )


    this.addBox(
      0.11,
      1.82,
      0.12,
      3.05,
      1.35,
      0.96,
      this.frameMat,
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
  }


  // ==================================================
  // LUCES LOCALES
  // ==================================================

  private buildLighting(): void {

    // Luz interior de recepción

    const receptionLight =
      new THREE.PointLight(
        '#ffad68',
        6.3,
        7.5,
        2,
      )


    receptionLight.position.set(
      0.75,
      1.75,
      2.2,
    )


    receptionLight.castShadow =
      false


    this.add(
      receptionLight,
    )


    /*
       Luz fría de fachada MUCHO más suave.

       Antes podía generar un punto azul demasiado evidente.
    */

    const facadeLight =
      new THREE.PointLight(
        '#6cbce9',
        1.15,
        10,
        2,
      )


    facadeLight.position.set(
      -1.5,
      10.0,
      3.7,
    )


    this.add(
      facadeLight,
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
      0.94,
      material,
      false,
    )
  }


  // ==================================================
  // VENTANA ABATIBLE
  // ==================================================

  private addAwningWindow(
    x: number,
    y: number,
    z: number,
  ): void {

    const awning =
      this.addBox(
        0.52,
        0.28,
        0.5,
        x,
        y,
        z,
        this.glassColdMat,
        false,
      )


    awning.rotation.x =
      THREE.MathUtils.degToRad(
        -13,
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
        '#ffd6a3',

      emissive:
        '#ff9b45',

      emissiveIntensity:
        3.4,

      roughness:
        0.35,

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
  // MINI SIGN ENTRADA
  // ==================================================

  private createMiniEntranceSign():
    THREE.MeshStandardMaterial {

    const canvas =
      document.createElement(
        'canvas',
      )


    canvas.width =
      320


    canvas.height =
      720


    const context =
      canvas.getContext(
        '2d',
      )


    if (!context) {
      throw new Error(
        'No se pudo crear mini sign',
      )
    }


    context.fillStyle =
      '#041b35'


    context.fillRect(
      0,
      0,
      320,
      720,
    )


    context.strokeStyle =
      'rgba(190,225,245,.55)'


    context.lineWidth =
      8


    context.strokeRect(
      12,
      12,
      296,
      696,
    )


    context.fillStyle =
      '#eef8ff'


    context.textAlign =
      'center'


    context.font =
      '600 42px Georgia'


    context.fillText(
      'Bella',
      160,
      270,
    )


    context.font =
      '600 39px Georgia'


    context.fillText(
      'Durmiente',
      160,
      320,
    )


    context.fillStyle =
      '#9ed5f2'


    context.font =
      '700 22px Arial'


    context.fillText(
      'HOSPEDAJE',
      160,
      390,
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
        '#19567d',

      emissiveIntensity:
        0.38,

      roughness:
        0.45,
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