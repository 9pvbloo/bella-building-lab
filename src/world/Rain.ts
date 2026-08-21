import * as THREE from 'three'


export type RainViewport = {
  width: number
  aspect: number
}


export type RainUpdateOptions = {
  elapsed: number
  delta: number
  camera: THREE.PerspectiveCamera
  viewport: RainViewport
  prefersReducedMotion: boolean
  isDocumentVisible: boolean
}


export type RainDebugState = {
  profile: RainProfile
  particleCount: number
  farCount: number
  midCount: number
  nearCount: number
}


type RainProfile =
  | 'desktop'
  | 'tablet'
  | 'phone'


type RainBandId =
  | 'far'
  | 'mid'
  | 'near'


type RainBandDefinition = {
  id: RainBandId
  capacity: number
  desktopCount: number
  tabletCount: number
  phoneCount: number
  depthNear: number
  depthFar: number
  lengthMin: number
  lengthMax: number
  speedMin: number
  speedMax: number
  thicknessMin: number
  thicknessMax: number
  opacityMin: number
  opacityMax: number
  colorA: THREE.Color
  colorB: THREE.Color
}


type RainBand = {
  definition: RainBandDefinition
  geometry: THREE.InstancedBufferGeometry
  material: THREE.ShaderMaterial
  mesh: THREE.Mesh<
    THREE.InstancedBufferGeometry,
    THREE.ShaderMaterial
  >
}


const RAIN_VOLUME_WIDTH =
  46


const RAIN_VOLUME_HEIGHT =
  36


const RAIN_VOLUME_HALF_HEIGHT =
  RAIN_VOLUME_HEIGHT *
  0.5


const RAIN_VOLUME_DEPTH =
  36


const RAIN_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aOffset;
  attribute vec3 aColor;
  attribute float aLength;
  attribute float aSpeed;
  attribute float aThickness;
  attribute float aOpacity;

  uniform float uElapsed;
  uniform float uWind;
  uniform float uVolumeHeight;
  uniform float uVolumeHalfHeight;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    float localY = mod(
      aOffset.y - uElapsed * aSpeed,
      uVolumeHeight
    ) - uVolumeHalfHeight;

    vec4 viewPosition = modelViewMatrix * vec4(
      aOffset.x,
      localY,
      aOffset.z,
      1.0
    );

    vec2 fallDirection = normalize(vec2(uWind, -1.0));
    vec2 perpendicular = vec2(-fallDirection.y, fallDirection.x);

    viewPosition.xy +=
      fallDirection * position.y * aLength +
      perpendicular * position.x * aThickness;

    vUv = uv;
    vColor = aColor;
    vOpacity = aOpacity;

    gl_Position = projectionMatrix * viewPosition;
  }
`


const RAIN_FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    float widthFade = 1.0 -
      smoothstep(0.24, 0.5, abs(vUv.x - 0.5));

    float tailFade = smoothstep(0.0, 0.16, vUv.y);
    float headFade = 1.0 - smoothstep(0.8, 1.0, vUv.y);

    gl_FragColor = vec4(
      vColor,
      widthFade * tailFade * headFade * vOpacity
    );
  }
`


const RAIN_BANDS: readonly RainBandDefinition[] = [
  {
    id: 'far',
    capacity: 1000,
    desktopCount: 1000,
    tabletCount: 650,
    phoneCount: 350,
    depthNear: 17,
    depthFar: RAIN_VOLUME_DEPTH -
      4,
    lengthMin: 0.1,
    lengthMax: 0.24,
    speedMin: 3.8,
    speedMax: 5.4,
    thicknessMin: 0.01,
    thicknessMax: 0.016,
    opacityMin: 0.11,
    opacityMax: 0.22,
    colorA: new THREE.Color('#c5deec'),
    colorB: new THREE.Color('#e3f2fb'),
  },
  {
    id: 'mid',
    capacity: 650,
    desktopCount: 650,
    tabletCount: 420,
    phoneCount: 240,
    depthNear: 6.5,
    depthFar: 17,
    lengthMin: 0.2,
    lengthMax: 0.44,
    speedMin: 5.4,
    speedMax: 7.8,
    thicknessMin: 0.014,
    thicknessMax: 0.022,
    opacityMin: 0.24,
    opacityMax: 0.43,
    colorA: new THREE.Color('#d2e9f4'),
    colorB: new THREE.Color('#f1f9ff'),
  },
  {
    id: 'near',
    capacity: 350,
    desktopCount: 350,
    tabletCount: 230,
    phoneCount: 130,
    depthNear: 1.5,
    depthFar: 7.5,
    lengthMin: 0.34,
    lengthMax: 0.72,
    speedMin: 7.8,
    speedMax: 10.8,
    thicknessMin: 0.017,
    thicknessMax: 0.027,
    opacityMin: 0.42,
    opacityMax: 0.68,
    colorA: new THREE.Color('#d7ebf5'),
    colorB: new THREE.Color('#ffffff'),
  },
]


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


/**
 * Owns Bella's visibly cinematic nocturnal rain. Three instanced bands retain
 * depth variation in one shared, gently camera-following world volume.
 */
export class Rain {

  private readonly group =
    new THREE.Group()

  private readonly bands:
    RainBand[]

  private readonly cameraDirection =
    new THREE.Vector3()

  private hasAnchoredToCamera =
    false

  private profile: RainProfile =
    'desktop'

  private farCount =
    0

  private midCount =
    0

  private nearCount =
    0


  constructor(
    scene: THREE.Scene,
  ) {

    this.group.name =
      'BellaCinematicRain'


    // Rain belongs to the foreground atmosphere, visibly crossing the distant
    // moon and Hero wordmark while thin layered streaks preserve legibility.
    this.group.renderOrder =
      4


    this.bands =
      RAIN_BANDS.map(
        (
          definition,
          index,
        ) => this.createBand(
          definition,
          20260840 +
            index *
            101,
        ),
      )


    this.bands.forEach(
      (
        band,
      ) => {

        this.group.add(
          band.mesh,
        )
      },
    )


    this.applyProfile(
      this.profile,
    )


    scene.add(
      this.group,
    )
  }


  update(
    {
      elapsed,
      delta,
      camera,
      viewport,
      prefersReducedMotion,
      isDocumentVisible,
    }: RainUpdateOptions,
  ): void {

    if (
      !isDocumentVisible
    ) {
      return
    }


    if (
      prefersReducedMotion
    ) {

      this.group.visible =
        false


      return
    }


    this.group.visible =
      true


    this.applyProfile(
      this.resolveProfile(
        viewport,
      ),
    )


    if (
      !this.hasAnchoredToCamera
    ) {

      this.group.position.copy(
        camera.position,
      )


      this.hasAnchoredToCamera =
        true
    } else {

      // Deliberate lag retains a spatial reading and visible parallax while
      // the broad volume keeps every authored camera inside the rain field.
      this.group.position.lerp(
        camera.position,
        1 -
          Math.exp(
            -0.9 *
            delta,
          ),
      )
    }


    camera.getWorldDirection(
      this.cameraDirection,
    )


    this.group.rotation.y =
      Math.atan2(
        this.cameraDirection.x,
        this.cameraDirection.z,
      ) +
      Math.PI


    // A microscopic fixed lateral drift avoids mathematical perfection while
    // keeping the visible fall within one degree of vertical.
    const wind =
      0.012


    this.bands.forEach(
      (
        band,
      ) => {

        band.material.uniforms.uElapsed.value =
          elapsed


        band.material.uniforms.uWind.value =
          wind
      },
    )
  }


  dispose(): void {

    this.group.removeFromParent()


    this.bands.forEach(
      (
        band,
      ) => {

        band.geometry.dispose()


        band.material.dispose()
      },
    )
  }


  get debugState(): Readonly<RainDebugState> {

    return {
      profile:
        this.profile,
      particleCount:
        this.farCount +
        this.midCount +
        this.nearCount,
      farCount:
        this.farCount,
      midCount:
        this.midCount,
      nearCount:
        this.nearCount,
    }
  }


  private createBand(
    definition: RainBandDefinition,
    seed: number,
  ): RainBand {

    const random =
      seededRandom(
        seed,
      )


    const baseGeometry =
      new THREE.PlaneGeometry(
        1,
        1,
      )


    const geometry =
      new THREE.InstancedBufferGeometry()


    geometry.setIndex(
      baseGeometry.getIndex(),
    )


    geometry.setAttribute(
      'position',
      baseGeometry.getAttribute(
        'position',
      ),
    )


    geometry.setAttribute(
      'uv',
      baseGeometry.getAttribute(
        'uv',
      ),
    )


    const offsets =
      new Float32Array(
        definition.capacity *
        3,
      )


    const colors =
      new Float32Array(
        definition.capacity *
        3,
      )


    const lengths =
      new Float32Array(
        definition.capacity,
      )


    const speeds =
      new Float32Array(
        definition.capacity,
      )


    const thicknesses =
      new Float32Array(
        definition.capacity,
      )


    const opacities =
      new Float32Array(
        definition.capacity,
      )


    const color =
      new THREE.Color()


    for (
      let index =
        0;
      index <
      definition.capacity;
      index +=
        1
    ) {

      const positionIndex =
        index *
        3


      const horizontalSpread =
        definition.id ===
        'near'
          ? 0.72
          : definition.id ===
              'mid'
            ? 0.88
            : 1


      offsets[
        positionIndex
      ] =
        THREE.MathUtils.lerp(
          -RAIN_VOLUME_WIDTH *
            0.5 *
            horizontalSpread,
          RAIN_VOLUME_WIDTH *
            0.5 *
            horizontalSpread,
          random(),
        )


      offsets[
        positionIndex +
        1
      ] =
        random() *
        RAIN_VOLUME_HEIGHT


      offsets[
        positionIndex +
        2
      ] =
        -THREE.MathUtils.lerp(
          definition.depthNear,
          definition.depthFar,
          random(),
        )


      lengths[
        index
      ] =
        THREE.MathUtils.lerp(
          definition.lengthMin,
          definition.lengthMax,
          random(),
        )


      speeds[
        index
      ] =
        THREE.MathUtils.lerp(
          definition.speedMin,
          definition.speedMax,
          random(),
        )


      thicknesses[
        index
      ] =
        THREE.MathUtils.lerp(
          definition.thicknessMin,
          definition.thicknessMax,
          random(),
        )


      opacities[
        index
      ] =
        THREE.MathUtils.lerp(
          definition.opacityMin,
          definition.opacityMax,
          random(),
        )


      color.lerpColors(
        definition.colorA,
        definition.colorB,
        random(),
      )


      colors[
        positionIndex
      ] =
        color.r


      colors[
        positionIndex +
        1
      ] =
        color.g


      colors[
        positionIndex +
        2
      ] =
        color.b
    }


    geometry.setAttribute(
      'aOffset',
      new THREE.InstancedBufferAttribute(
        offsets,
        3,
      ),
    )


    geometry.setAttribute(
      'aColor',
      new THREE.InstancedBufferAttribute(
        colors,
        3,
      ),
    )


    geometry.setAttribute(
      'aLength',
      new THREE.InstancedBufferAttribute(
        lengths,
        1,
      ),
    )


    geometry.setAttribute(
      'aSpeed',
      new THREE.InstancedBufferAttribute(
        speeds,
        1,
      ),
    )


    geometry.setAttribute(
      'aThickness',
      new THREE.InstancedBufferAttribute(
        thicknesses,
        1,
      ),
    )


    geometry.setAttribute(
      'aOpacity',
      new THREE.InstancedBufferAttribute(
        opacities,
        1,
      ),
    )


    geometry.instanceCount =
      definition.capacity


    const material =
      new THREE.ShaderMaterial({
        vertexShader:
          RAIN_VERTEX_SHADER,
        fragmentShader:
          RAIN_FRAGMENT_SHADER,
        uniforms: {
          uElapsed: {
            value: 0,
          },
          uWind: {
            value: -0.36,
          },
          uVolumeHeight: {
            value: RAIN_VOLUME_HEIGHT,
          },
          uVolumeHalfHeight: {
            value: RAIN_VOLUME_HALF_HEIGHT,
          },
        },
        transparent:
          true,
        depthTest:
          true,
        depthWrite:
          false,
        side:
          THREE.DoubleSide,
        fog:
          false,
        toneMapped:
          false,
      })


    const mesh =
      new THREE.Mesh(
        geometry,
        material,
      )


    mesh.name =
      `BellaRain${
        definition.id[0]
          .toUpperCase() +
        definition.id.slice(
          1,
        )
      }`


    mesh.frustumCulled =
      false


    return {
      definition,
      geometry,
      material,
      mesh,
    }
  }


  private resolveProfile(
    {
      width,
      aspect,
    }: RainViewport,
  ): RainProfile {

    if (
      width <=
      700 &&
      aspect <
      1.1
    ) {
      return 'phone'
    }


    if (
      width <=
      1100 &&
      aspect <=
      1.55
    ) {
      return 'tablet'
    }


    return 'desktop'
  }


  private applyProfile(
    profile: RainProfile,
  ): void {

    if (
      profile ===
      this.profile &&
      this.farCount >
      0
    ) {
      return
    }


    this.profile =
      profile


    this.bands.forEach(
      (
        band,
      ) => {

        const count =
          profile ===
          'phone'
            ? band.definition.phoneCount
            : profile ===
                'tablet'
              ? band.definition.tabletCount
              : band.definition.desktopCount


        band.geometry.instanceCount =
          count


        switch (
          band.definition.id
        ) {
          case 'far':
            this.farCount =
              count
            break
          case 'mid':
            this.midCount =
              count
            break
          case 'near':
            this.nearCount =
              count
            break
        }
      },
    )
  }
}
