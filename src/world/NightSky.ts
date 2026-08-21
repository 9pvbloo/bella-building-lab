import * as THREE from 'three'


export type NightSkyUpdateOptions = {
  elapsed: number
  camera: THREE.PerspectiveCamera
  prefersReducedMotion: boolean
  isDocumentVisible: boolean
}


export type NightSkyDebugState = {
  visibleStarCount: number
  activeShootingStarCount: number
  pendingShootingStarCount: number
  secondsUntilNextShootingStarEvent: number
}


type ShootingStar = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  material: THREE.ShaderMaterial
  start: THREE.Vector3
  end: THREE.Vector3
  position: THREE.Vector3
  direction: THREE.Vector3
  tailLength: number
  duration: number
  thickness: number
  baseOpacity: number
  scheduledAt: number | undefined
  startedAt: number | undefined
}


const DESKTOP_STAR_COUNT =
  144


const TABLET_STAR_COUNT =
  96


const PHONE_STAR_COUNT =
  72


const MAX_SHOOTING_STARS =
  4


const SHOOTING_STAR_EVENT_INTERVAL_MIN =
  4


const SHOOTING_STAR_EVENT_INTERVAL_MAX =
  6


const FIRST_SHOOTING_STAR_EVENT_DELAY_MIN =
  2.5


const FIRST_SHOOTING_STAR_EVENT_DELAY_MAX =
  5


const SHOOTING_STAR_STAGGER_MIN =
  0.15


const SHOOTING_STAR_STAGGER_MAX =
  0.7


const MOON_CLEARING_CENTER =
  new THREE.Vector2(
    30,
    34,
  )


const MOON_CLEARING_RADIUS_X =
  18


const MOON_CLEARING_RADIUS_Y =
  17


const STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aBrightness;
  attribute float aTwinklePhase;
  attribute float aTwinkleSpeed;
  attribute vec3 aColor;

  uniform float uElapsed;
  uniform float uTwinkleEnabled;

  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    float twinkle = 1.0 +
      sin(uElapsed * aTwinkleSpeed + aTwinklePhase) *
      0.11 *
      uTwinkleEnabled;

    vOpacity = aBrightness * twinkle;
    vColor = aColor;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);

    gl_PointSize = clamp(
      (0.85 + aBrightness * 0.8) * (145.0 / max(1.0, -viewPosition.z)),
      0.7,
      2.15
    );

    gl_Position = projectionMatrix * viewPosition;
  }
`


const STAR_FRAGMENT_SHADER = /* glsl */ `
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - 0.5);
    float pointAlpha = 1.0 - smoothstep(0.26, 0.5, distanceFromCenter);

    gl_FragColor = vec4(
      vColor,
      pointAlpha * vOpacity
    );
  }
`


const SHOOTING_STAR_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`


const SHOOTING_STAR_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    float crossFade = 1.0 -
      smoothstep(0.08, 0.5, abs(vUv.y - 0.5));

    float tailFade = pow(smoothstep(0.0, 0.88, vUv.x), 1.28);
    float headFade = 1.0 - smoothstep(0.92, 1.0, vUv.x);
    float headIntensity = mix(0.72, 1.0, smoothstep(0.62, 0.9, vUv.x));

    gl_FragColor = vec4(
      uColor,
      crossFade * tailFade * headFade * headIntensity * uOpacity
    );
  }
`


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


function smoothstep(
  value: number,
): number {

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


function isInsideMoonClearing(
  x: number,
  y: number,
): boolean {

  const normalizedX =
    (x -
      MOON_CLEARING_CENTER.x) /
    MOON_CLEARING_RADIUS_X


  const normalizedY =
    (y -
      MOON_CLEARING_CENTER.y) /
    MOON_CLEARING_RADIUS_Y


  return normalizedX *
    normalizedX +
    normalizedY *
      normalizedY <
    1
}


/**
 * Owns the distant celestial detail behind Bella's fixed world: one sparse
 * shader-driven field of stars and a bounded reusable shooting-star pool.
 */
export class NightSky {

  private readonly group =
    new THREE.Group()

  private readonly stars:
    THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>

  private readonly starGeometry:
    THREE.BufferGeometry

  private readonly starMaterial:
    THREE.ShaderMaterial

  private readonly shootingStarGeometry =
    new THREE.PlaneGeometry(
      1,
      1,
    )

  private readonly shootingStars:
    ShootingStar[] = []

  private readonly pendingShootingStarIndices =
    new Int8Array(
      MAX_SHOOTING_STARS,
    )

  private readonly pendingShootingStarLaunchTimes =
    new Float32Array(
      MAX_SHOOTING_STARS,
    )

  private readonly shootingStarRandom =
    seededRandom(
      20260905,
    )

  private readonly shootingStarIceWhite =
    new THREE.Color(
      '#f2fbff',
    )

  private readonly shootingStarBlueWhite =
    new THREE.Color(
      '#b9e1f8',
    )

  private readonly cameraRight =
    new THREE.Vector3()

  private readonly cameraUp =
    new THREE.Vector3()

  private nextShootingStarEventAt:
    number

  private pendingShootingStarCount =
    0

  private currentElapsed =
    0

  private currentStarDrawCount =
    DESKTOP_STAR_COUNT

  private shootingStarsSuppressed =
    false


  constructor(
    scene: THREE.Scene,
  ) {

    const random =
      seededRandom(
        20260904,
      )


    const positions =
      new Float32Array(
        DESKTOP_STAR_COUNT *
        3,
      )

    const brightness =
      new Float32Array(
        DESKTOP_STAR_COUNT,
      )

    const twinklePhases =
      new Float32Array(
        DESKTOP_STAR_COUNT,
      )

    const twinkleSpeeds =
      new Float32Array(
        DESKTOP_STAR_COUNT,
      )

    const colors =
      new Float32Array(
        DESKTOP_STAR_COUNT *
        3,
      )

    const iceWhite =
      new THREE.Color(
        '#edf7ff',
      )

    const coolWhite =
      new THREE.Color(
        '#cce5f4',
      )

    const starColor =
      new THREE.Color()


    for (
      let index =
        0;
      index <
      DESKTOP_STAR_COUNT;
      index +=
        1
    ) {

      const positionIndex =
        index *
        3

      this.resolveStarPosition(
        random,
        positions,
        positionIndex,
      )


      const distribution =
        random()


      brightness[
        index
      ] =
        distribution <
        0.72
          ? THREE.MathUtils.lerp(
              0.24,
              0.42,
              random(),
            )
          : distribution <
              0.94
            ? THREE.MathUtils.lerp(
                0.44,
                0.61,
                random(),
              )
            : THREE.MathUtils.lerp(
                0.62,
                0.76,
                random(),
              )


      twinklePhases[
        index
      ] =
        random() *
        Math.PI *
        2


      twinkleSpeeds[
        index
      ] =
        THREE.MathUtils.lerp(
          0.18,
          0.42,
          random(),
        )


      starColor.lerpColors(
        iceWhite,
        coolWhite,
        random() *
        0.34,
      )


      colors[
        positionIndex
      ] =
        starColor.r

      colors[
        positionIndex +
        1
      ] =
        starColor.g

      colors[
        positionIndex +
        2
      ] =
        starColor.b
    }


    this.starGeometry =
      new THREE.BufferGeometry()


    this.starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    )

    this.starGeometry.setAttribute(
      'aBrightness',
      new THREE.BufferAttribute(
        brightness,
        1,
      ),
    )

    this.starGeometry.setAttribute(
      'aTwinklePhase',
      new THREE.BufferAttribute(
        twinklePhases,
        1,
      ),
    )

    this.starGeometry.setAttribute(
      'aTwinkleSpeed',
      new THREE.BufferAttribute(
        twinkleSpeeds,
        1,
      ),
    )

    this.starGeometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(
        colors,
        3,
      ),
    )

    this.starGeometry.computeBoundingSphere()


    this.starMaterial =
      new THREE.ShaderMaterial({
        vertexShader:
          STAR_VERTEX_SHADER,
        fragmentShader:
          STAR_FRAGMENT_SHADER,
        uniforms: {
          uElapsed: {
            value: 0,
          },
          uTwinkleEnabled: {
            value: 1,
          },
        },
        transparent:
          true,
        depthTest:
          true,
        depthWrite:
          false,
        fog:
          false,
        toneMapped:
          false,
      })


    this.stars =
      new THREE.Points(
        this.starGeometry,
        this.starMaterial,
      )


    this.stars.name =
      'BellaNightSkyStars'

    this.stars.renderOrder =
      -10


    this.group.name =
      'BellaNightSky'

    this.group.add(
      this.stars,
    )


    for (
      let index =
        0;
      index <
      MAX_SHOOTING_STARS;
      index +=
        1
    ) {

      const material =
        this.createShootingStarMaterial()

      const mesh =
        new THREE.Mesh(
          this.shootingStarGeometry,
          material,
        )


      mesh.name =
        `BellaShootingStar${
          index +
          1
        }`

      mesh.visible =
        false

      mesh.frustumCulled =
        false

      mesh.renderOrder =
        -9


      this.shootingStars.push({
        mesh,
        material,
        start: new THREE.Vector3(),
        end: new THREE.Vector3(),
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        tailLength: 0,
        duration: 0,
        thickness: 0,
        baseOpacity: 0,
        scheduledAt: undefined,
        startedAt: undefined,
      })


      this.group.add(
        mesh,
      )
    }


    scene.add(
      this.group,
    )


    this.nextShootingStarEventAt =
      THREE.MathUtils.lerp(
        FIRST_SHOOTING_STAR_EVENT_DELAY_MIN,
        FIRST_SHOOTING_STAR_EVENT_DELAY_MAX,
        this.shootingStarRandom(),
      )
  }


  update(
    {
      elapsed,
      camera,
      prefersReducedMotion,
      isDocumentVisible,
    }: NightSkyUpdateOptions,
  ): void {

    if (
      !isDocumentVisible
    ) {
      return
    }


    this.currentElapsed =
      elapsed


    this.updateResponsiveDensity(
      camera.aspect,
    )


    this.starMaterial.uniforms.uElapsed.value =
      elapsed

    this.starMaterial.uniforms.uTwinkleEnabled.value =
      prefersReducedMotion
        ? 0
        : 1


    const shouldSuppressShootingStars =
      prefersReducedMotion ||
      camera.aspect <
        0.75


    if (
      shouldSuppressShootingStars
    ) {

      if (
        !this.shootingStarsSuppressed
      ) {

        this.stopAllShootingStars(
          elapsed,
        )
      }


      this.shootingStarsSuppressed =
        true


      return
    }


    this.shootingStarsSuppressed =
      false


    if (
      elapsed >=
      this.nextShootingStarEventAt
    ) {

      this.queueShootingStarEvent(
        elapsed,
      )
    }


    this.launchPendingShootingStars(
      elapsed,
    )

    this.updateShootingStars(
      elapsed,
      camera,
    )
  }


  dispose(): void {

    this.group.removeFromParent()

    this.starGeometry.dispose()

    this.starMaterial.dispose()

    this.shootingStarGeometry.dispose()

    this.shootingStars.forEach(
      (
        shootingStar,
      ) => {

        shootingStar.material.dispose()
      },
    )
  }


  get debugState(): Readonly<NightSkyDebugState> {

    let activeShootingStarCount =
      0


    this.shootingStars.forEach(
      (
        shootingStar,
      ) => {

        if (
          shootingStar.startedAt !==
          undefined
        ) {

          activeShootingStarCount +=
            1
        }
      },
    )


    return {
      visibleStarCount:
        this.currentStarDrawCount,
      activeShootingStarCount,
      pendingShootingStarCount:
        this.pendingShootingStarCount,
      secondsUntilNextShootingStarEvent:
        Math.max(
          0,
          this.nextShootingStarEventAt -
            this.currentElapsed,
        ),
    }
  }


  private resolveStarPosition(
    random: () => number,
    positions: Float32Array,
    index: number,
  ): void {

    for (
      let attempt =
        0;
      attempt <
      24;
      attempt +=
        1
    ) {

      const x =
        THREE.MathUtils.lerp(
          -64,
          64,
          random(),
        )

      const y =
        THREE.MathUtils.lerp(
          7,
          58,
          random(),
        )


      if (
        isInsideMoonClearing(
          x,
          y,
        )
      ) {
        continue
      }


      positions[
        index
      ] =
        x

      positions[
        index +
        1
      ] =
        y

      positions[
        index +
        2
      ] =
        THREE.MathUtils.lerp(
          -112,
          -78,
          random(),
        )


      return
    }


    // The deterministic fallback remains in the upper-left part of the sky,
    // well clear of the moon's visual corridor.
    positions[
      index
    ] =
      -42

    positions[
      index +
      1
    ] =
      18

    positions[
      index +
      2
    ] =
      -96
  }


  private updateResponsiveDensity(
    aspect: number,
  ): void {

    const nextStarDrawCount =
      aspect <
      0.75
        ? PHONE_STAR_COUNT
        : aspect <
            0.95
          ? TABLET_STAR_COUNT
          : DESKTOP_STAR_COUNT


    if (
      nextStarDrawCount ===
      this.currentStarDrawCount
    ) {
      return
    }


    this.currentStarDrawCount =
      nextStarDrawCount

    this.starGeometry.setDrawRange(
      0,
      nextStarDrawCount,
    )
  }


  private createShootingStarMaterial():
    THREE.ShaderMaterial {

    return new THREE.ShaderMaterial({
      vertexShader:
        SHOOTING_STAR_VERTEX_SHADER,
      fragmentShader:
        SHOOTING_STAR_FRAGMENT_SHADER,
      uniforms: {
        uColor: {
          value: new THREE.Color(
            '#d9f1ff',
          ),
        },
        uOpacity: {
          value: 0,
        },
      },
      transparent:
        true,
      depthTest:
        true,
      depthWrite:
        false,
      fog:
        false,
      toneMapped:
        false,
      side:
        THREE.DoubleSide,
    })
  }


  private queueShootingStarEvent(
    elapsed: number,
  ): void {

    const burstSize =
      2 +
      Math.floor(
        this.shootingStarRandom() *
        3,
      )

    let launchOffset =
      0


    for (
      let burstIndex =
        0;
      burstIndex <
      burstSize;
      burstIndex +=
        1
    ) {

      const shootingStarIndex =
        this.findAvailableShootingStarIndex()


      if (
        shootingStarIndex <
        0
      ) {
        break
      }


      const shootingStar =
        this.shootingStars[
          shootingStarIndex
        ]


      this.configureShootingStar(
        shootingStar,
      )


      const scheduledAt =
        elapsed +
        launchOffset


      shootingStar.scheduledAt =
        scheduledAt

      this.pendingShootingStarIndices[
        this.pendingShootingStarCount
      ] =
        shootingStarIndex

      this.pendingShootingStarLaunchTimes[
        this.pendingShootingStarCount
      ] =
        scheduledAt

      this.pendingShootingStarCount +=
        1


      launchOffset +=
        THREE.MathUtils.lerp(
          SHOOTING_STAR_STAGGER_MIN,
          SHOOTING_STAR_STAGGER_MAX,
          this.shootingStarRandom(),
        )
    }


    this.nextShootingStarEventAt =
      elapsed +
      THREE.MathUtils.lerp(
        SHOOTING_STAR_EVENT_INTERVAL_MIN,
        SHOOTING_STAR_EVENT_INTERVAL_MAX,
        this.shootingStarRandom(),
      )
  }


  private configureShootingStar(
    shootingStar: ShootingStar,
  ): void {

    for (
      let attempt =
        0;
      attempt <
      24;
      attempt +=
        1
    ) {

      const region =
        Math.floor(
          this.shootingStarRandom() *
          5,
        )

      let startX =
        0

      let startY =
        0


      switch (
        region
      ) {
        case 0:
          startX =
            THREE.MathUtils.lerp(
              -62,
              -36,
              this.shootingStarRandom(),
            )

          startY =
            THREE.MathUtils.lerp(
              9,
              22,
              this.shootingStarRandom(),
            )

          break

        case 1:
          startX =
            THREE.MathUtils.lerp(
              -36,
              -12,
              this.shootingStarRandom(),
            )

          startY =
            THREE.MathUtils.lerp(
              35,
              57,
              this.shootingStarRandom(),
            )

          break

        case 2:
          startX =
            THREE.MathUtils.lerp(
              -14,
              16,
              this.shootingStarRandom(),
            )

          startY =
            THREE.MathUtils.lerp(
              10,
              24,
              this.shootingStarRandom(),
            )

          break

        case 3:
          startX =
            THREE.MathUtils.lerp(
              42,
              66,
              this.shootingStarRandom(),
            )

          startY =
            THREE.MathUtils.lerp(
              35,
              58,
              this.shootingStarRandom(),
            )

          break

        default:
          startX =
            THREE.MathUtils.lerp(
              62,
              84,
              this.shootingStarRandom(),
            )

          startY =
            THREE.MathUtils.lerp(
              8,
              22,
              this.shootingStarRandom(),
            )
      }


      const startZ =
        THREE.MathUtils.lerp(
          -114,
          -80,
          this.shootingStarRandom(),
        )

      const trajectoryFamily =
        Math.floor(
          this.shootingStarRandom() *
          4,
        )

      let endX =
        startX

      let endY =
        startY


      switch (
        trajectoryFamily
      ) {
        case 0:
          endX +=
            THREE.MathUtils.lerp(
              10,
              20,
              this.shootingStarRandom(),
            )

          endY -=
            THREE.MathUtils.lerp(
              4,
              9,
              this.shootingStarRandom(),
            )

          break

        case 1:
          endX -=
            THREE.MathUtils.lerp(
              10,
              20,
              this.shootingStarRandom(),
            )

          endY -=
            THREE.MathUtils.lerp(
              4,
              9,
              this.shootingStarRandom(),
            )

          break

        case 2:
          endX +=
            (
              this.shootingStarRandom() <
              0.5
                ? -1
                : 1
            ) *
            THREE.MathUtils.lerp(
              15,
              24,
              this.shootingStarRandom(),
            )

          endY -=
            THREE.MathUtils.lerp(
              2,
              4.5,
              this.shootingStarRandom(),
            )

          break

        default:
          endX +=
            (
              this.shootingStarRandom() <
              0.5
                ? -1
                : 1
            ) *
            THREE.MathUtils.lerp(
              7,
              14,
              this.shootingStarRandom(),
            )

          endY -=
            THREE.MathUtils.lerp(
              9,
              15,
              this.shootingStarRandom(),
            )
      }


      const endZ =
        startZ +
        THREE.MathUtils.lerp(
          -4,
          4,
          this.shootingStarRandom(),
        )


      if (
        !this.isShootingStarPathClear(
          startX,
          startY,
          endX,
          endY,
        )
      ) {
        continue
      }


      shootingStar.start.set(
        startX,
        startY,
        startZ,
      )

      shootingStar.end.set(
        endX,
        endY,
        endZ,
      )


      this.configureShootingStarAppearance(
        shootingStar,
      )


      return
    }


    shootingStar.start.set(
      -54,
      47,
      -98,
    )

    shootingStar.end.set(
      -34,
      41,
      -96,
    )

    this.configureShootingStarAppearance(
      shootingStar,
    )
  }


  private configureShootingStarAppearance(
    shootingStar: ShootingStar,
  ): void {

    shootingStar.tailLength =
      THREE.MathUtils.lerp(
        3,
        6.2,
        this.shootingStarRandom(),
      )

    shootingStar.duration =
      THREE.MathUtils.lerp(
        0.65,
        1.25,
        this.shootingStarRandom(),
      )

    shootingStar.thickness =
      THREE.MathUtils.lerp(
        0.075,
        0.13,
        this.shootingStarRandom(),
      )


    const brightnessDistribution =
      this.shootingStarRandom()


    shootingStar.baseOpacity =
      brightnessDistribution <
      0.64
        ? THREE.MathUtils.lerp(
            0.42,
            0.56,
            this.shootingStarRandom(),
          )
        : brightnessDistribution <
            0.92
          ? THREE.MathUtils.lerp(
              0.58,
              0.74,
              this.shootingStarRandom(),
            )
          : THREE.MathUtils.lerp(
              0.76,
              0.9,
              this.shootingStarRandom(),
            )


    const color =
      shootingStar.material.uniforms.uColor.value as
      THREE.Color


    color.lerpColors(
      this.shootingStarIceWhite,
      this.shootingStarBlueWhite,
      this.shootingStarRandom() *
      0.4,
    )


    shootingStar.material.uniforms.uOpacity.value =
      0

    shootingStar.mesh.visible =
      false
  }


  private isShootingStarPathClear(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ): boolean {

    const midpointX =
      (startX +
        endX) *
        0.5

    const midpointY =
      (startY +
        endY) *
        0.5


    return !isInsideMoonClearing(
      startX,
      startY,
    ) &&
      !isInsideMoonClearing(
        midpointX,
        midpointY,
      ) &&
      !isInsideMoonClearing(
        endX,
        endY,
      )
  }


  private launchPendingShootingStars(
    elapsed: number,
  ): void {

    let nextPendingIndex =
      0


    for (
      let pendingIndex =
        0;
      pendingIndex <
      this.pendingShootingStarCount;
      pendingIndex +=
        1
    ) {

      const shootingStarIndex =
        this.pendingShootingStarIndices[
          pendingIndex
        ]

      const launchTime =
        this.pendingShootingStarLaunchTimes[
          pendingIndex
        ]

      const shootingStar =
        this.shootingStars[
          shootingStarIndex
        ]


      if (
        elapsed >=
        launchTime
      ) {

        shootingStar.scheduledAt =
          undefined

        shootingStar.startedAt =
          elapsed

        shootingStar.mesh.visible =
          true


        continue
      }


      this.pendingShootingStarIndices[
        nextPendingIndex
      ] =
        shootingStarIndex

      this.pendingShootingStarLaunchTimes[
        nextPendingIndex
      ] =
        launchTime

      nextPendingIndex +=
        1
    }


    this.pendingShootingStarCount =
      nextPendingIndex
  }


  private updateShootingStars(
    elapsed: number,
    camera: THREE.PerspectiveCamera,
  ): void {

    for (
      let index =
        0;
      index <
      this.shootingStars.length;
      index +=
        1
    ) {

      const shootingStar =
        this.shootingStars[
          index
        ]


      if (
        shootingStar.startedAt ===
        undefined
      ) {
        continue
      }


      this.updateShootingStar(
        shootingStar,
        elapsed,
        camera,
      )
    }
  }


  private updateShootingStar(
    shootingStar: ShootingStar,
    elapsed: number,
    camera: THREE.PerspectiveCamera,
  ): void {

    const startedAt =
      shootingStar.startedAt


    if (
      startedAt ===
      undefined
    ) {
      return
    }


    const progress =
      (elapsed -
        startedAt) /
      shootingStar.duration


    if (
      progress >=
      1
    ) {

      this.retireShootingStar(
        shootingStar,
      )


      return
    }


    shootingStar.position.lerpVectors(
      shootingStar.start,
      shootingStar.end,
      progress,
    )

    shootingStar.direction.subVectors(
      shootingStar.end,
      shootingStar.start,
    ).normalize()


    const fadeIn =
      smoothstep(
        progress /
        0.14,
      )

    const fadeOut =
      1 -
      smoothstep(
        (progress -
          0.68) /
        0.32,
      )


    shootingStar.material.uniforms.uOpacity.value =
      shootingStar.baseOpacity *
      fadeIn *
      fadeOut


    shootingStar.mesh.position.copy(
      shootingStar.position,
    ).addScaledVector(
      shootingStar.direction,
      -shootingStar.tailLength *
        0.5,
    )

    shootingStar.mesh.quaternion.copy(
      camera.quaternion,
    )

    this.cameraRight.set(
      1,
      0,
      0,
    ).applyQuaternion(
      camera.quaternion,
    )

    this.cameraUp.set(
      0,
      1,
      0,
    ).applyQuaternion(
      camera.quaternion,
    )

    shootingStar.mesh.rotateZ(
      Math.atan2(
        shootingStar.direction.dot(
          this.cameraUp,
        ),
        shootingStar.direction.dot(
          this.cameraRight,
        ),
      ),
    )

    shootingStar.mesh.scale.set(
      shootingStar.tailLength,
      shootingStar.thickness,
      1,
    )
  }


  private retireShootingStar(
    shootingStar: ShootingStar,
  ): void {

    shootingStar.mesh.visible =
      false

    shootingStar.startedAt =
      undefined

    shootingStar.material.uniforms.uOpacity.value =
      0
  }


  private stopAllShootingStars(
    elapsed: number,
  ): void {

    for (
      let index =
        0;
      index <
      this.shootingStars.length;
      index +=
        1
    ) {

      const shootingStar =
        this.shootingStars[
          index
        ]

      shootingStar.mesh.visible =
        false

      shootingStar.scheduledAt =
        undefined

      shootingStar.startedAt =
        undefined

      shootingStar.material.uniforms.uOpacity.value =
        0
    }


    this.pendingShootingStarCount =
      0

    this.nextShootingStarEventAt =
      elapsed +
      THREE.MathUtils.lerp(
        SHOOTING_STAR_EVENT_INTERVAL_MIN,
        SHOOTING_STAR_EVENT_INTERVAL_MAX,
        this.shootingStarRandom(),
      )
  }


  private findAvailableShootingStarIndex():
    number {

    for (
      let index =
        0;
      index <
      this.shootingStars.length;
      index +=
        1
    ) {

      const shootingStar =
        this.shootingStars[
          index
        ]


      if (
        shootingStar.scheduledAt ===
        undefined &&
        shootingStar.startedAt ===
        undefined
      ) {
        return index
      }
    }


    return -1
  }
}
