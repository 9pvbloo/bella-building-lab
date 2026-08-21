import * as THREE from 'three'


type MoonAnchor = {
  position: THREE.Vector3
  diameter: number
}


export type MoonUpdateOptions = {
  progress: number
  elapsed: number
  camera: THREE.PerspectiveCamera
  prefersReducedMotion: boolean
}


const clamp = (
  value: number,
  min: number,
  max: number,
): number => {

  return Math.min(
    Math.max(
      value,
      min,
    ),
    max,
  )
}


function smoothstep(
  value: number,
): number {

  return value *
    value *
    (
      3 -
      2 *
        value
    )
}


function seededRandom(
  seed: number,
): () => number {

  let value =
    seed %
    2147483647


  if (
    value <=
    0
  ) {

    value +=
      2147483646
  }


  return () => {

    value =
      value *
      16807 %
      2147483647


    return (
      value -
      1
    ) /
      2147483646
  }
}


function createMoonTexture():
  THREE.CanvasTexture {

  const size =
    2048


  const center =
    size *
    0.5


  const radius =
    size *
    0.442


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
      'No se pudo crear la textura lunar V2',
    )
  }


  context.clearRect(
    0,
    0,
    size,
    size,
  )


  // The disc is clipped first so transparent canvas pixels never reveal a
  // rectangular plane edge. A slight offset in the base light gives the moon
  // a calm astronomical volume without introducing a colored light source.
  context.save()

  context.beginPath()

  context.arc(
    center,
    center,
    radius,
    0,
    Math.PI *
      2,
  )

  context.clip()


  const base =
    context.createRadialGradient(
      center -
        radius *
          0.26,
      center -
        radius *
          0.3,
      radius *
        0.08,
      center,
      center,
      radius,
    )


  base.addColorStop(
    0,
    '#ffffff',
  )


  base.addColorStop(
    0.42,
    '#f0f3f1',
  )


  base.addColorStop(
    0.76,
    '#d9dfdd',
  )


  base.addColorStop(
    1,
    '#adb9b6',
  )


  context.fillStyle =
    base


  context.fillRect(
    0,
    0,
    size,
    size,
  )


  const drawSoftEllipse = (
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    color: string,
    alpha: number,
  ): void => {

    context.save()

    context.translate(
      x,
      y,
    )

    context.rotate(
      rotation,
    )

    context.scale(
      radiusX,
      radiusY,
    )


    const gradient =
      context.createRadialGradient(
        -0.2,
        -0.18,
        0.05,
        0,
        0,
        1,
      )


    gradient.addColorStop(
      0,
      color.replace(
        'ALPHA',
        `${alpha}`,
      ),
    )


    gradient.addColorStop(
      0.58,
      color.replace(
        'ALPHA',
        `${alpha * 0.68}`,
      ),
    )


    gradient.addColorStop(
      1,
      color.replace(
        'ALPHA',
        '0',
      ),
    )


    context.fillStyle =
      gradient


    context.beginPath()

    context.arc(
      0,
      0,
      1,
      0,
      Math.PI *
        2,
    )

    context.fill()

    context.restore()
  }


  // Broad maria establish the recognisable neutral lunar geography first.
  // They stay grey-green rather than blue so Bella's cold palette comes from
  // the world, not an artificially tinted moon.
  const maria = [
    [-0.27, -0.12, 0.34, 0.2, -0.18, 0.18],
    [0.18, -0.23, 0.23, 0.14, 0.2, 0.14],
    [0.25, 0.08, 0.29, 0.17, -0.46, 0.16],
    [-0.06, 0.2, 0.24, 0.15, 0.42, 0.13],
    [-0.39, 0.24, 0.14, 0.11, -0.55, 0.11],
    [0.48, -0.08, 0.11, 0.1, 0.12, 0.1],
  ] as const


  maria.forEach(
    (
      [x, y, radiusX, radiusY, rotation, alpha],
    ) => {

      drawSoftEllipse(
        center +
          x *
            radius,
        center +
          y *
            radius,
        radiusX *
          radius,
        radiusY *
          radius,
        rotation,
        'rgba(83, 96, 98, ALPHA)',
        alpha,
      )
    },
  )


  const random =
    seededRandom(
      20260820,
    )


  // Faint highland modulation prevents the bright regions from feeling like
  // a flat radial gradient at close view.
  for (
    let index =
      0;
    index <
    165;
    index +=
      1
  ) {

    const angle =
      random() *
      Math.PI *
        2


    const distance =
      Math.sqrt(
        random(),
      ) *
      radius *
      0.9


    const radiusX =
      THREE.MathUtils.lerp(
        radius *
          0.018,
        radius *
          0.09,
        random(),
      )


    drawSoftEllipse(
      center +
        Math.cos(
          angle,
        ) *
          distance,
      center +
        Math.sin(
          angle,
        ) *
          distance,
      radiusX,
      radiusX *
        THREE.MathUtils.lerp(
          0.55,
          1.35,
          random(),
        ),
      random() *
        Math.PI,
      random() >
      0.46
        ? 'rgba(255, 255, 252, ALPHA)'
        : 'rgba(82, 95, 98, ALPHA)',
      THREE.MathUtils.lerp(
        0.012,
        0.038,
        random(),
      ),
    )
  }


  const drawCrater = (
    x: number,
    y: number,
    craterRadius: number,
    strength: number,
  ): void => {

    const shadow =
      context.createRadialGradient(
        x -
          craterRadius *
            0.18,
        y +
          craterRadius *
            0.16,
        craterRadius *
          0.05,
        x,
        y,
        craterRadius,
      )


    shadow.addColorStop(
      0,
      `rgba(57, 69, 72, ${strength * 0.72})`,
    )


    shadow.addColorStop(
      0.48,
      `rgba(72, 84, 86, ${strength * 0.4})`,
    )


    shadow.addColorStop(
      1,
      'rgba(89, 102, 104, 0)',
    )


    context.fillStyle =
      shadow


    context.beginPath()

    context.arc(
      x,
      y,
      craterRadius,
      0,
      Math.PI *
        2,
    )

    context.fill()


    context.beginPath()

    context.arc(
      x,
      y,
      craterRadius *
        0.82,
      Math.PI *
        1.08,
      Math.PI *
        1.84,
    )

    context.strokeStyle =
      `rgba(255, 255, 249, ${strength * 0.56})`


    context.lineWidth =
      Math.max(
        1,
        craterRadius *
          0.12,
      )


    context.stroke()
  }


  const craterSystems = [
    [-0.34, -0.38, 0.086, 0.25],
    [0.12, -0.45, 0.065, 0.22],
    [0.39, -0.13, 0.078, 0.25],
    [-0.03, 0.1, 0.066, 0.2],
    [0.26, 0.35, 0.07, 0.2],
    [-0.48, 0.18, 0.06, 0.18],
  ] as const


  craterSystems.forEach(
    (
      [x, y, craterRadius, strength],
    ) => {

      const systemX =
        center +
        x *
          radius


      const systemY =
        center +
        y *
          radius


      const systemRadius =
        craterRadius *
        radius


      drawCrater(
        systemX,
        systemY,
        systemRadius,
        strength,
      )


      // Subtle crater rays are intentionally short and low-contrast: surface
      // detail, never a fantasy burst around the lunar disc.
      context.save()

      context.lineCap =
        'round'


      for (
        let ray =
          0;
        ray <
        7;
        ray +=
          1
      ) {

        const angle =
          random() *
          Math.PI *
            2


        const rayLength =
          systemRadius *
          THREE.MathUtils.lerp(
            1.3,
            2.9,
            random(),
          )


        const gradient =
          context.createLinearGradient(
            systemX,
            systemY,
            systemX +
              Math.cos(
                angle,
              ) *
                rayLength,
            systemY +
              Math.sin(
                angle,
              ) *
                rayLength,
          )


        gradient.addColorStop(
          0,
          `rgba(255, 255, 250, ${strength * 0.14})`,
        )


        gradient.addColorStop(
          1,
          'rgba(255, 255, 250, 0)',
        )


        context.strokeStyle =
          gradient


        context.lineWidth =
          Math.max(
            1,
            systemRadius *
              0.11,
          )


        context.beginPath()

        context.moveTo(
          systemX,
          systemY,
        )


        context.lineTo(
          systemX +
            Math.cos(
              angle,
            ) *
              rayLength,
          systemY +
            Math.sin(
              angle,
            ) *
              rayLength,
        )


        context.stroke()
      }


      context.restore()
    },
  )


  for (
    let index =
      0;
    index <
    235;
    index +=
      1
  ) {

    const angle =
      random() *
      Math.PI *
        2


    const distance =
      Math.sqrt(
        random(),
      ) *
      radius *
      0.9


    drawCrater(
      center +
        Math.cos(
          angle,
        ) *
          distance,
      center +
        Math.sin(
          angle,
        ) *
          distance,
      THREE.MathUtils.lerp(
        radius *
          0.006,
        radius *
          0.028,
        random(),
      ),
      THREE.MathUtils.lerp(
        0.035,
        0.12,
        random(),
      ),
    )
  }


  // Fine tooth reads as surface variation once the moon occupies a large part
  // of the frame, while remaining invisible as individual dots at distance.
  context.fillStyle =
    'rgba(65, 77, 79, 0.07)'


  for (
    let index =
      0;
    index <
    1800;
    index +=
      1
  ) {

    const angle =
      random() *
      Math.PI *
        2


    const distance =
      Math.sqrt(
        random(),
      ) *
      radius *
      0.94


    context.fillRect(
      center +
        Math.cos(
          angle,
        ) *
          distance,
      center +
        Math.sin(
          angle,
        ) *
          distance,
      THREE.MathUtils.lerp(
        0.7,
        2.2,
        random(),
      ),
      THREE.MathUtils.lerp(
        0.7,
        2.2,
        random(),
      ),
    )
  }


  const limb =
    context.createRadialGradient(
      center,
      center,
      radius *
        0.62,
      center,
      center,
      radius,
    )


  limb.addColorStop(
    0,
    'rgba(40, 51, 54, 0)',
  )


  limb.addColorStop(
    0.76,
    'rgba(40, 52, 55, 0.02)',
  )


  limb.addColorStop(
    1,
    'rgba(36, 47, 50, 0.24)',
  )


  context.fillStyle =
    limb


  context.fillRect(
    0,
    0,
    size,
    size,
  )


  context.restore()


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


  return texture
}


function createHaloTexture():
  THREE.CanvasTexture {

  const size =
    1024


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
      'No se pudo crear el halo lunar V2',
    )
  }


  const gradient =
    context.createRadialGradient(
      size *
        0.5,
      size *
        0.5,
      size *
        0.06,
      size *
        0.5,
      size *
        0.5,
      size *
        0.5,
    )


  gradient.addColorStop(
    0,
    'rgba(255, 255, 252, 0)',
  )


  gradient.addColorStop(
    0.15,
    'rgba(238, 245, 244, 0.25)',
  )


  gradient.addColorStop(
    0.35,
    'rgba(210, 223, 223, 0.13)',
  )


  gradient.addColorStop(
    0.62,
    'rgba(181, 201, 203, 0.045)',
  )


  gradient.addColorStop(
    1,
    'rgba(150, 176, 179, 0)',
  )


  context.fillStyle =
    gradient


  context.fillRect(
    0,
    0,
    size,
    size,
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


  return texture
}


/**
 * World-space moon with one deep, stable desktop celestial position. Mobile
 * anchors remain authored until the dedicated mobile-camera phase. The object
 * never joins the camera hierarchy and smooth progress only drives visuals.
 */
export class Moon {

  private readonly group =
    new THREE.Group()

  private readonly discMaterial:
    THREE.MeshBasicMaterial

  private readonly haloMaterial:
    THREE.MeshBasicMaterial

  private readonly disc:
    THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>

  private readonly halo:
    THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>

  private readonly desktopAnchors:
    readonly MoonAnchor[] = [
      {
        position:
          new THREE.Vector3(
            22,
            26,
            -55,
          ),
        diameter:
          16.5,
      },
      {
        position:
          new THREE.Vector3(
            22,
            26,
            -55,
          ),
        diameter:
          16.5,
      },
      {
        position:
          new THREE.Vector3(
            22,
            26,
            -55,
          ),
        diameter:
          16.5,
      },
      {
        position:
          new THREE.Vector3(
            22,
            26,
            -55,
          ),
        diameter:
          16.5,
      },
      {
        position:
          new THREE.Vector3(
            22,
            26,
            -55,
          ),
        diameter:
          16.5,
      },
      {
        position:
          new THREE.Vector3(
            22,
            26,
            -55,
          ),
        diameter:
          16.5,
      },
      {
        position:
          new THREE.Vector3(
            22,
            26,
            -55,
          ),
        diameter:
          16.5,
      },
    ]

  // The current camera choreography predates authored mobile cameras. These
  // moon-only anchors keep a visible, partially occluded moon in the narrow
  // front-facing composition without changing a camera state or attachment.
  private readonly tabletAnchors:
    readonly MoonAnchor[] = [
      {
        position:
          new THREE.Vector3(
            7.2,
            20,
            -34,
          ),
        diameter:
          8.5,
      },
      {
        position:
          new THREE.Vector3(
            7,
            19.5,
            -31,
          ),
        diameter:
          8.5,
      },
      {
        position:
          new THREE.Vector3(
            9,
            19,
            -29,
          ),
        diameter:
          8.7,
      },
      {
        position:
          new THREE.Vector3(
            8.5,
            19,
            -31,
          ),
        diameter:
          8.2,
      },
      {
        position:
          new THREE.Vector3(
            8,
            19.5,
            -31,
          ),
        diameter:
          8.3,
      },
      {
        position:
          new THREE.Vector3(
            7.7,
            20,
            -32,
          ),
        diameter:
          8,
      },
      {
        position:
          new THREE.Vector3(
            7.2,
            19.5,
            -32,
          ),
        diameter:
          8.3,
      },
    ]

  private readonly phoneAnchors:
    readonly MoonAnchor[] = [
      {
        position:
          new THREE.Vector3(
            4.5,
            20,
            -20,
          ),
        diameter:
          5,
      },
      {
        position:
          new THREE.Vector3(
            8.1,
            19.4,
            -30,
          ),
        diameter:
          8.7,
      },
      {
        position:
          new THREE.Vector3(
            8.7,
            19,
            -26,
          ),
        diameter:
          8.7,
      },
      {
        position:
          new THREE.Vector3(
            8.4,
            19,
            -31,
          ),
        diameter:
          8,
      },
      {
        position:
          new THREE.Vector3(
            8.2,
            19.5,
            -31,
          ),
        diameter:
          8.1,
      },
      {
        position:
          new THREE.Vector3(
            8,
            20,
            -32,
          ),
        diameter:
          7.8,
      },
      {
        position:
          new THREE.Vector3(
            8,
            19.5,
            -32,
          ),
        diameter:
          8.1,
      },
    ]

  private readonly startPosition =
    new THREE.Vector3()

  private readonly endPosition =
    new THREE.Vector3()


  constructor(
    scene: THREE.Scene,
  ) {

    const geometry =
      new THREE.PlaneGeometry(
        1,
        1,
      )


    this.discMaterial =
      new THREE.MeshBasicMaterial({
        map:
          createMoonTexture(),
        transparent:
          true,
        opacity:
          0.985,
        depthTest:
          true,
        depthWrite:
          false,
        fog:
          false,
        toneMapped:
          false,
        alphaTest:
          0.005,
        side:
          THREE.DoubleSide,
      })


    this.haloMaterial =
      new THREE.MeshBasicMaterial({
        map:
          createHaloTexture(),
        transparent:
          true,
        opacity:
          0.46,
        depthTest:
          true,
        depthWrite:
          false,
        fog:
          false,
        toneMapped:
          false,
        blending:
          THREE.AdditiveBlending,
        side:
          THREE.DoubleSide,
      })


    this.halo =
      new THREE.Mesh(
        geometry,
        this.haloMaterial,
      )


    this.halo.name =
      'BellaMoonHalo'


    // A minute local offset keeps the additive halo behind the disc for
    // transparent sorting without giving it a screen-space render order.
    this.halo.position.z =
      -0.035


    this.disc =
      new THREE.Mesh(
        geometry,
        this.discMaterial,
      )


    this.disc.name =
      'BellaMoonDisc'


    this.group.name =
      'BellaMoonWorld'


    this.group.add(
      this.halo,
      this.disc,
    )


    scene.add(
      this.group,
    )
  }


  update(
    {
      progress,
      elapsed,
      camera,
      prefersReducedMotion,
    }: MoonUpdateOptions,
  ): void {

    const maxIndex =
      this.desktopAnchors.length -
      1


    const clampedProgress =
      clamp(
        progress,
        0,
        maxIndex,
      )


    const startIndex =
      Math.floor(
        clampedProgress,
      )


    const endIndex =
      Math.min(
        startIndex +
          1,
        maxIndex,
      )


    const localProgress =
      smoothstep(
        clampedProgress -
          startIndex,
      )


    const start =
      this.desktopAnchors[
        startIndex
      ]


    const end =
      this.desktopAnchors[
        endIndex
      ]


    this.resolveResponsivePosition(
      startIndex,
      camera.aspect,
      this.startPosition,
    )


    this.resolveResponsivePosition(
      endIndex,
      camera.aspect,
      this.endPosition,
    )


    this.group.position.lerpVectors(
      this.startPosition,
      this.endPosition,
      localProgress,
    )


    // The planes billboard toward the actively moving camera, while their
    // group remains a scene child at the interpolated world coordinate.
    this.group.quaternion.copy(
      camera.quaternion,
    )


    const diameter =
      THREE.MathUtils.lerp(
        start.diameter,
        end.diameter,
        localProgress,
      )


    this.disc.scale.setScalar(
      diameter,
    )


    const haloScale =
      diameter *
      (
        prefersReducedMotion
          ? 3.45
          : 3.45 +
            Math.sin(
              elapsed *
                0.07,
            ) *
            0.025
      )


    this.halo.scale.setScalar(
      haloScale,
    )


    this.discMaterial.opacity =
      prefersReducedMotion
        ? 0.985
        : 0.985 +
          Math.sin(
            elapsed *
              0.08,
          ) *
          0.006


    this.haloMaterial.opacity =
      prefersReducedMotion
        ? 0.46
        : 0.46 +
          Math.sin(
            elapsed *
              0.065,
          ) *
          0.012
  }


  private resolveResponsivePosition(
    index: number,
    aspect: number,
    target: THREE.Vector3,
  ): void {

    if (
      aspect >=
      0.95
    ) {

      target.copy(
        this.desktopAnchors[
          index
        ].position,
      )


      return
    }


    if (
      aspect >=
      0.75
    ) {

      target.lerpVectors(
        this.tabletAnchors[
          index
        ].position,
        this.desktopAnchors[
          index
        ].position,
        smoothstep(
          clamp(
            (
              aspect -
              0.75
            ) /
              0.2,
            0,
            1,
          ),
        ),
      )


      return
    }


    target.lerpVectors(
      this.phoneAnchors[
        index
      ].position,
      this.tabletAnchors[
        index
      ].position,
      smoothstep(
        clamp(
          (
            aspect -
            0.462
          ) /
            0.288,
          0,
          1,
        ),
      ),
    )
  }
}
