import * as THREE from 'three'


export type BellaCourtyardViewport = {
  width: number
  aspect: number
}


export type BellaCourtyardDebugState = {
  profile: CourtyardProfile
  treeCount: number
  treeBranchCount: number
  treeFoliageCount: number
  shrubCount: number
  ornamentalBushCount: number
  agaveLeafCount: number
  grassCount: number
  rockCount: number
}


type CourtyardProfile =
  | 'desktop'
  | 'tablet'
  | 'phone'


type TreeDefinition = {
  x: number
  z: number
  height: number
  width: number
  lean: number
}


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


function createWetRoughnessTexture():
  THREE.CanvasTexture {

  const size =
    256


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
      'No se pudo crear textura de humedad Bella',
    )
  }


  const random =
    createSeededRandom(
      20261004,
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

    const roughness =
      Math.round(
        162 +
        random() *
          46,
      )


    image.data[pixel] =
      roughness

    image.data[
      pixel +
      1
    ] =
      roughness

    image.data[
      pixel +
      2
    ] =
      roughness

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


  for (
    let patch =
      0;
    patch <
    18;
    patch +=
      1
  ) {

    context.fillStyle =
      'rgba(106, 106, 106, 0.16)'


    context.beginPath()


    context.ellipse(
      random() *
        size,
      random() *
        size,
      10 +
        random() *
          28,
      4 +
        random() *
          12,
      random() *
        Math.PI,
      0,
      Math.PI *
        2,
    )


    context.fill()
  }


  const texture =
    new THREE.CanvasTexture(
      canvas,
    )


  texture.colorSpace =
    THREE.NoColorSpace


  texture.wrapS =
    THREE.RepeatWrapping


  texture.wrapT =
    THREE.RepeatWrapping


  texture.repeat.set(
    3.6,
    2.4,
  )


  texture.minFilter =
    THREE.LinearMipmapLinearFilter


  texture.magFilter =
    THREE.LinearFilter


  texture.generateMipmaps =
    true


  return texture
}


function createFoliageClusterGeometry():
  THREE.IcosahedronGeometry {

  const geometry =
    new THREE.IcosahedronGeometry(
      1,
      2,
    )


  const positions =
    geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute


  for (
    let index =
      0;
    index <
    positions.count;
    index +=
      1
  ) {

    const x =
      positions.getX(
        index,
      )

    const y =
      positions.getY(
        index,
      )

    const z =
      positions.getZ(
        index,
      )

    const azimuth =
      Math.atan2(
        z,
        x,
      )


    const offset =
      1 +
      Math.sin(
        azimuth *
          3.2 +
        y *
          2.1,
      ) *
        0.115 +
      Math.cos(
        azimuth *
          5.1 -
        y *
          1.7,
      ) *
        0.07

    const upperTaper =
      1 -
      Math.max(
        y,
        0,
      ) *
        0.06


    positions.setXYZ(
      index,
      x *
        offset *
        upperTaper,
      y *
        (
          0.98 +
          Math.sin(
            azimuth *
              2.2,
          ) *
            0.035
        ),
      z *
        offset *
        upperTaper,
    )
  }


  positions.needsUpdate =
    true


  geometry.computeVertexNormals()


  return geometry
}


/**
 * Owns the quiet arrival landscape immediately around Bella. All variation is
 * deterministic and static: shared geometry keeps the exterior believable
 * without turning the persistent world into a second animated system.
 */
export class BellaCourtyard {

  readonly group =
    new THREE.Group()

  private readonly instanceObject =
    new THREE.Object3D()

  private readonly wetRoughnessTexture =
    createWetRoughnessTexture()

  private readonly pavingMaterial =
    new THREE.MeshStandardMaterial({
      color: '#172934',
      roughnessMap: this.wetRoughnessTexture,
      roughness: 0.76,
      metalness: 0.08,
    })

  private readonly edgeStoneMaterial =
    new THREE.MeshStandardMaterial({
      color: '#3a4d53',
      roughnessMap: this.wetRoughnessTexture,
      roughness: 0.78,
      metalness: 0.02,
    })

  private readonly planterMaterial =
    new THREE.MeshStandardMaterial({
      color: '#1a3032',
      roughnessMap: this.wetRoughnessTexture,
      roughness: 0.82,
      metalness: 0.03,
    })

  private readonly shrubMaterial =
    new THREE.MeshStandardMaterial({
      color: '#294f3b',
      emissive: '#163326',
      emissiveIntensity: 0.17,
      roughness: 0.94,
      metalness: 0,
      vertexColors: true,
    })

  private readonly ornamentalBushMaterial =
    new THREE.MeshStandardMaterial({
      color: '#315c43',
      emissive: '#193628',
      emissiveIntensity: 0.14,
      roughness: 0.88,
      metalness: 0,
      vertexColors: true,
      flatShading: true,
    })

  private readonly grassMaterial =
    new THREE.MeshStandardMaterial({
      color: '#32664b',
      emissive: '#1c402e',
      emissiveIntensity: 0.16,
      roughness: 0.92,
      metalness: 0,
      vertexColors: true,
      side: THREE.DoubleSide,
    })

  private readonly agaveMaterial =
    new THREE.MeshStandardMaterial({
      color: '#35614a',
      emissive: '#1d3d2e',
      emissiveIntensity: 0.12,
      roughness: 0.84,
      metalness: 0,
      vertexColors: true,
      side: THREE.DoubleSide,
    })

  private readonly groundCoverMaterial =
    new THREE.MeshStandardMaterial({
      color: '#244632',
      roughness: 0.96,
      metalness: 0,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      vertexColors: true,
      side: THREE.DoubleSide,
    })

  private readonly treeFoliageMaterial =
    new THREE.MeshStandardMaterial({
      color: '#2a563f',
      emissive: '#193827',
      emissiveIntensity: 0.21,
      roughness: 0.86,
      metalness: 0,
      vertexColors: true,
      flatShading: true,
    })

  private readonly trunkMaterial =
    new THREE.MeshStandardMaterial({
      color: '#293329',
      emissive: '#141b15',
      emissiveIntensity: 0.06,
      roughness: 0.82,
      metalness: 0.02,
      flatShading: true,
    })

  private readonly rockMaterial =
    new THREE.MeshStandardMaterial({
      color: '#3a4b4d',
      roughness: 0.95,
      metalness: 0.01,
      flatShading: true,
      vertexColors: true,
    })

  private readonly gardenLanternMetalMaterial =
    new THREE.MeshStandardMaterial({
      color: '#1a2427',
      roughness: 0.58,
      metalness: 0.3,
    })

  private readonly gardenLanternGlowMaterial =
    new THREE.MeshStandardMaterial({
      color: '#ead4a8',
      emissive: '#ffe4bb',
      emissiveIntensity: 1.05,
      roughness: 0.58,
      metalness: 0.03,
    })

  private shrubs!: THREE.InstancedMesh<
    THREE.DodecahedronGeometry,
    THREE.MeshStandardMaterial
  >

  private ornamentalBushes!: THREE.InstancedMesh<
    THREE.IcosahedronGeometry,
    THREE.MeshStandardMaterial
  >

  private agaveLeaves!: THREE.InstancedMesh<
    THREE.ConeGeometry,
    THREE.MeshStandardMaterial
  >

  private groundCover!: THREE.InstancedMesh<
    THREE.CircleGeometry,
    THREE.MeshStandardMaterial
  >

  private grasses!: THREE.InstancedMesh<
    THREE.ConeGeometry,
    THREE.MeshStandardMaterial
  >

  private rocks!: THREE.InstancedMesh<
    THREE.DodecahedronGeometry,
    THREE.MeshStandardMaterial
  >

  private treeTrunks!: THREE.InstancedMesh<
    THREE.CylinderGeometry,
    THREE.MeshStandardMaterial
  >

  private treeBranches!: THREE.InstancedMesh<
    THREE.CylinderGeometry,
    THREE.MeshStandardMaterial
  >

  private treeFoliage!: THREE.InstancedMesh<
    THREE.IcosahedronGeometry,
    THREE.MeshStandardMaterial
  >

  private treeTerminalFoliage!: THREE.InstancedMesh<
    THREE.IcosahedronGeometry,
    THREE.MeshStandardMaterial
  >

  private readonly treeDefinitions: readonly TreeDefinition[] = [
    {
      x: -6.65,
      z: -0.85,
      height: 5.45,
      width: 1.82,
      lean: -0.14,
    },
    {
      x: 6.3,
      z: -1.45,
      height: 4.6,
      width: 1.52,
      lean: 0.12,
    },
    {
      x: -4.75,
      z: 3.95,
      height: 3.35,
      width: 1.1,
      lean: -0.08,
    },
  ]

  private profile: CourtyardProfile =
    'desktop'

  private shrubCount =
    0

  private grassCount =
    0

  private ornamentalBushCount =
    0

  private agaveLeafCount =
    0


  constructor(
    scene: THREE.Scene,
  ) {

    this.group.name =
      'BellaCourtyard'


    this.buildArrivalSurface()

    this.buildPlantersAndWalls()

    this.buildGardenPractical()

    this.buildTreeAccentPractical()

    this.buildTrees()

    this.buildShrubs()

    this.buildOrnamentalBushes()

    this.buildAgaves()

    this.buildGrasses()

    this.buildGroundCover()

    this.buildRocks()

    this.applyProfile(
      this.profile,
    )

    scene.add(
      this.group,
    )
  }


  updateViewport(
    viewport: BellaCourtyardViewport,
  ): void {

    const profile =
      this.resolveProfile(
        viewport,
      )


    this.applyProfile(
      profile,
    )
  }


  get debugState(): Readonly<BellaCourtyardDebugState> {

    return {
      profile: this.profile,
      treeCount: this.treeDefinitions.length,
      treeBranchCount: this.treeBranches.count,
      treeFoliageCount:
        this.treeFoliage.count +
        this.treeTerminalFoliage.count,
      shrubCount: this.shrubCount,
      ornamentalBushCount: this.ornamentalBushCount,
      agaveLeafCount: this.agaveLeafCount,
      grassCount: this.grassCount,
      rockCount: this.rocks.count,
    }
  }


  private buildArrivalSurface(): void {

    // A deliberately matte, low profile terrace grounds the hotel without
    // becoming a mirror or a plaza. Its broken paving rhythm points toward
    // the reception but remains calm from elevated chapter views.
    this.addBox(
      'BellaCourtyardTerrace',
      15.8,
      0.16,
      8.2,
      0,
      -0.02,
      1.85,
      this.pavingMaterial,
      true,
    )


    const pavers = [
      [0.7, 2.1, 3.2, 2.85, -0.045],
      [0.42, 4.55, 3.24, 2.3, 0.035],
      [-3.62, 3.6, 2.6, 1.72, 0.08],
      [4.18, 3.8, 3.0, 1.96, -0.055],
    ] as const


    pavers.forEach(
      (
        [x, z, width, depth, rotation],
        index,
      ) => {

        const paver =
          this.addBox(
            `BellaCourtyardPaver${index + 1}`,
            width,
            0.035,
            depth,
            x,
            0.08,
            z,
            this.edgeStoneMaterial,
            false,
          )


        paver.rotation.y =
          rotation
      },
    )
  }


  private buildPlantersAndWalls(): void {

    const planters = [
      [-5.55, 0.32, 0.9, 3.55, 0.52, 1.34],
      [4.94, 0.3, 1.12, 3.35, 0.48, 1.2],
      [-4.22, 0.28, 4.35, 2.34, 0.42, 1.04],
      [5.14, 0.26, 3.32, 2.15, 0.38, 1.12],
    ] as const


    planters.forEach(
      (
        [x, y, z, width, height, depth],
        index,
      ) => {

        this.addBox(
          `BellaCourtyardPlanter${index + 1}`,
          width,
          height,
          depth,
          x,
          y,
          z,
          this.planterMaterial,
          true,
        )
      },
    )


    const walls = [
      [-7.05, 0.34, 2.1, 0.38, 0.7, 5.65],
      [6.86, 0.31, 2.85, 0.34, 0.62, 4.25],
      [-1.15, 0.19, 5.45, 4.25, 0.26, 0.3],
    ] as const


    walls.forEach(
      (
        [x, y, z, width, height, depth],
        index,
      ) => {

        this.addBox(
          `BellaCourtyardWall${index + 1}`,
          width,
          height,
          depth,
          x,
          y,
          z,
          this.edgeStoneMaterial,
          true,
        )
      },
    )
  }


  private buildGardenPractical(): void {

    // One low, visible practical gives the arrival planting a human warmth.
    // It is intentionally short-range so moonlight still owns the world.
    const lantern =
      new THREE.Group()


    lantern.name =
      'BellaCourtyardGardenLantern'


    lantern.position.set(
      4.28,
      0.12,
      3.26,
    )


    const stem =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.042,
          0.06,
          0.72,
          8,
        ),
        this.gardenLanternMetalMaterial,
      )


    stem.position.y =
      0.36


    const cap =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.15,
          0.11,
          0.075,
          10,
        ),
        this.gardenLanternMetalMaterial,
      )


    cap.position.y =
      0.71


    const emitter =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.075,
          10,
          8,
        ),
        this.gardenLanternGlowMaterial,
      )


    emitter.position.y =
      0.65


    const light =
      new THREE.PointLight(
        '#ffe2b6',
        0.68,
        4.8,
        2,
      )


    light.position.y =
      0.64

    light.castShadow =
      false


    lantern.add(
      stem,
      cap,
      emitter,
      light,
    )


    this.group.add(
      lantern,
    )
  }


  private buildTreeAccentPractical(): void {

    // A single low uplight puts a warm, human-scale island beneath the left
    // ornamental tree. It is visibly housed and intentionally too short-range
    // to compete with the entrance or moon.
    const uplight =
      new THREE.Group()


    uplight.name =
      'BellaCourtyardTreeUplight'


    uplight.position.set(
      -5.22,
      0.08,
      0.46,
    )


    const housing =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.11,
          0.08,
          0.12,
          8,
        ),
        this.gardenLanternMetalMaterial,
      )


    housing.position.y =
      0.06


    const emitter =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.045,
          8,
          6,
        ),
        this.gardenLanternGlowMaterial,
      )


    emitter.position.y =
      0.13


    const light =
      new THREE.PointLight(
        '#ffd9aa',
        0.34,
        3.1,
        2,
      )


    light.position.y =
      0.2


    light.castShadow =
      false


    uplight.add(
      housing,
      emitter,
      light,
    )


    this.group.add(
      uplight,
    )
  }


  private buildTrees(): void {

    const trunkGeometry =
      new THREE.CylinderGeometry(
        0.16,
        0.25,
        1,
        7,
      )


    const branchGeometry =
      new THREE.CylinderGeometry(
        0.045,
        0.11,
        1,
        6,
      )


    const foliageGeometry =
      createFoliageClusterGeometry()


    this.treeTrunks =
      new THREE.InstancedMesh(
        trunkGeometry,
        this.trunkMaterial,
        this.treeDefinitions.length,
      )


    this.treeBranches =
      new THREE.InstancedMesh(
        branchGeometry,
        this.trunkMaterial,
        this.treeDefinitions.length *
          7,
      )


    this.treeFoliage =
      new THREE.InstancedMesh(
        foliageGeometry,
        this.treeFoliageMaterial,
        this.treeDefinitions.length *
          9,
      )


    this.treeTerminalFoliage =
      new THREE.InstancedMesh(
        foliageGeometry,
        this.treeFoliageMaterial,
        this.treeDefinitions.length *
          7,
      )


    const foliageColors = [
      new THREE.Color('#29543e'),
      new THREE.Color('#356247'),
      new THREE.Color('#224a36'),
      new THREE.Color('#416c4e'),
    ]


    let branchIndex =
      0

    let foliageIndex =
      0

    let terminalFoliageIndex =
      0


    this.treeDefinitions.forEach(
      (
        tree,
        treeIndex,
      ) => {

        this.setInstance(
          this.treeTrunks,
          treeIndex,
          tree.x,
          tree.height *
            0.5,
          tree.z,
          1,
          tree.height,
          1,
          tree.lean,
        )


        const branchHeights = [
          0.38,
          0.49,
          0.58,
          0.67,
          0.74,
          0.8,
          0.86,
        ]

        const branchLengths = [
          0.66,
          0.88,
          0.98,
          0.76,
          0.92,
          0.62,
          0.48,
        ]

        branchHeights.forEach(
          (
            branchHeight,
            branch,
          ) => {

          const angle =
            tree.lean +
            branch *
              0.91 +
            treeIndex *
              0.37

          const branchLength =
            tree.width *
            branchLengths[
              branch
            ]


          this.setInstance(
            this.treeBranches,
            branchIndex,
            tree.x +
              Math.cos(
                angle,
              ) *
                branchLength *
                0.46,
            tree.height *
              branchHeight,
            tree.z +
              Math.sin(
                angle,
              ) *
                branchLength *
                0.46,
            0.48,
            branchLength,
            0.48,
            angle,
            -0.72 +
              (
                branch %
                  3
              ) *
                0.12,
          )


          const terminalHeight =
            Math.min(
              branchHeight +
                0.09,
              0.95,
            )


          const terminalSize =
            tree.width *
            (
              0.17 +
              (
                branch %
                  2
              ) *
                0.025
            )


          this.setInstance(
            this.treeTerminalFoliage,
            terminalFoliageIndex,
            tree.x +
              Math.cos(
                angle,
              ) *
                branchLength *
                0.78,
            tree.height *
              terminalHeight,
            tree.z +
              Math.sin(
                angle,
              ) *
                branchLength *
                0.78,
            terminalSize,
            terminalSize *
              0.68,
            terminalSize *
              0.88,
            angle +
              0.28,
          )


          this.treeTerminalFoliage.setColorAt(
            terminalFoliageIndex,
            foliageColors[
              (
                treeIndex +
                branch +
                1
              ) %
                foliageColors.length
            ],
          )


          terminalFoliageIndex +=
            1


          branchIndex +=
            1
          },
        )


        const crownPads = [
          {
            angle: -2.16,
            radius: 0.34,
            height: 0.49,
            width: 0.29,
            vertical: 0.21,
            depth: 0.72,
          },
          {
            angle: -1.12,
            radius: 0.68,
            height: 0.57,
            width: 0.35,
            vertical: 0.27,
            depth: 0.8,
          },
          {
            angle: -0.26,
            radius: 0.91,
            height: 0.64,
            width: 0.39,
            vertical: 0.3,
            depth: 0.86,
          },
          {
            angle: 0.7,
            radius: 0.56,
            height: 0.7,
            width: 0.33,
            vertical: 0.25,
            depth: 0.74,
          },
          {
            angle: 1.56,
            radius: 0.9,
            height: 0.75,
            width: 0.38,
            vertical: 0.29,
            depth: 0.82,
          },
          {
            angle: 2.44,
            radius: 0.58,
            height: 0.81,
            width: 0.34,
            vertical: 0.25,
            depth: 0.76,
          },
          {
            angle: -0.76,
            radius: 0.42,
            height: 0.86,
            width: 0.33,
            vertical: 0.24,
            depth: 0.76,
          },
          {
            angle: 0.42,
            radius: 0.3,
            height: 0.9,
            width: 0.3,
            vertical: 0.22,
            depth: 0.71,
          },
          {
            angle: 1.82,
            radius: 0.12,
            height: 0.95,
            width: 0.25,
            vertical: 0.18,
            depth: 0.68,
          },
        ] as const


        crownPads.forEach(
          (
            crownPad,
            cluster,
          ) => {

          const angle =
            tree.lean +
            crownPad.angle +
            treeIndex *
              0.31

          const radius =
            tree.width *
            crownPad.radius

          const y =
            tree.height *
            crownPad.height

          const width =
            tree.width *
            crownPad.width


          this.setInstance(
            this.treeFoliage,
            foliageIndex,
            tree.x +
              Math.cos(
                angle,
              ) *
                radius,
            y,
            tree.z +
              Math.sin(
                angle,
              ) *
                radius,
            width,
            tree.width *
              crownPad.vertical,
            width *
              crownPad.depth,
            angle,
          )


          this.treeFoliage.setColorAt(
            foliageIndex,
            foliageColors[
              (
                treeIndex +
                cluster
              ) %
                foliageColors.length
            ],
          )


          foliageIndex +=
            1
          },
        )
      },
    )


    this.treeTrunks.instanceMatrix.needsUpdate =
      true

    this.treeBranches.instanceMatrix.needsUpdate =
      true

    this.treeFoliage.instanceMatrix.needsUpdate =
      true

    this.treeTerminalFoliage.instanceMatrix.needsUpdate =
      true

    this.treeFoliage.instanceColor!.needsUpdate =
      true

    this.treeTerminalFoliage.instanceColor!.needsUpdate =
      true


    this.treeTrunks.name =
      'BellaCourtyardTreeTrunks'

    this.treeBranches.name =
      'BellaCourtyardTreeBranches'

    this.treeFoliage.name =
      'BellaCourtyardTreeCanopies'

    this.treeTerminalFoliage.name =
      'BellaCourtyardTreeTerminalFoliage'


    this.treeTrunks.castShadow =
      true

    this.treeBranches.castShadow =
      true

    this.treeFoliage.castShadow =
      false

    this.treeTerminalFoliage.castShadow =
      false

    this.treeTrunks.receiveShadow =
      true

    this.treeFoliage.receiveShadow =
      true


    this.group.add(
      this.treeTrunks,
      this.treeBranches,
      this.treeFoliage,
      this.treeTerminalFoliage,
    )
  }


  private buildShrubs(): void {

    const capacity =
      62

    const geometry =
      new THREE.DodecahedronGeometry(
        1,
        1,
      )


    this.shrubs =
      new THREE.InstancedMesh(
        geometry,
        this.shrubMaterial,
        capacity,
      )


    const random =
      createSeededRandom(
        20261001,
      )

    const beds = [
      [-5.55, 0.9, 2.95, 0.74],
      [4.95, 1.12, 2.7, 0.72],
      [-4.22, 4.35, 1.85, 0.58],
      [5.15, 3.32, 1.7, 0.58],
    ] as const

    const colors = [
      new THREE.Color('#2c5940'),
      new THREE.Color('#3a6b4b'),
      new THREE.Color('#1e4732'),
      new THREE.Color('#4b7856'),
    ]


    for (
      let index =
        0;
      index <
      capacity;
      index +=
        1
    ) {

      const bed =
        beds[
          index %
            beds.length
        ]

      const scale =
        THREE.MathUtils.lerp(
          0.22,
          0.48,
          random(),
        )


      this.setInstance(
        this.shrubs,
        index,
        bed[0] +
          THREE.MathUtils.lerp(
            -bed[2] *
              0.5,
            bed[2] *
              0.5,
            random(),
          ),
        0.42 +
          scale *
            0.34,
        bed[1] +
          THREE.MathUtils.lerp(
            -bed[3] *
              0.5,
            bed[3] *
              0.5,
            random(),
          ),
        scale *
          1.4,
        scale,
        scale *
          1.18,
        random() *
          Math.PI,
      )


      this.shrubs.setColorAt(
        index,
        colors[
          index %
            colors.length
        ],
      )
    }


    this.shrubs.instanceMatrix.needsUpdate =
      true

    this.shrubs.instanceColor!.needsUpdate =
      true

    this.shrubs.name =
      'BellaCourtyardShrubs'

    this.shrubs.receiveShadow =
      true

    this.group.add(
      this.shrubs,
    )
  }


  private buildOrnamentalBushes(): void {

    const capacity =
      28


    this.ornamentalBushes =
      new THREE.InstancedMesh(
        new THREE.IcosahedronGeometry(
          1,
          1,
        ),
        this.ornamentalBushMaterial,
        capacity,
      )


    const random =
      createSeededRandom(
        20261005,
      )


    const islands = [
      [-5.42, 1.05, 2.82, 0.82],
      [4.82, 1.16, 2.42, 0.74],
      [-4.04, 4.44, 1.52, 0.52],
      [5.3, 3.45, 1.38, 0.46],
    ] as const


    const colors = [
      new THREE.Color('#28533c'),
      new THREE.Color('#3c704e'),
      new THREE.Color('#1d4733'),
    ]


    for (
      let index =
        0;
      index <
      capacity;
      index +=
        1
    ) {

      const island =
        islands[
          index %
            islands.length
        ]


      const scale =
        THREE.MathUtils.lerp(
          0.24,
          0.56,
          random(),
        )


      this.setInstance(
        this.ornamentalBushes,
        index,
        island[0] +
          THREE.MathUtils.lerp(
            -island[2] *
              0.5,
            island[2] *
              0.5,
            random(),
          ),
        0.34 +
          scale *
            0.5,
        island[1] +
          THREE.MathUtils.lerp(
            -island[3] *
              0.5,
            island[3] *
              0.5,
            random(),
          ),
        scale *
          1.5,
        scale *
          0.86,
        scale *
          1.18,
        random() *
          Math.PI,
      )


      this.ornamentalBushes.setColorAt(
        index,
        colors[
          index %
            colors.length
        ],
      )
    }


    this.ornamentalBushes.instanceMatrix.needsUpdate =
      true

    this.ornamentalBushes.instanceColor!.needsUpdate =
      true

    this.ornamentalBushes.name =
      'BellaCourtyardOrnamentalBushes'

    this.ornamentalBushes.castShadow =
      false

    this.ornamentalBushes.receiveShadow =
      true

    this.group.add(
      this.ornamentalBushes,
    )
  }


  private buildAgaves(): void {

    const leavesPerPlant =
      7

    const plants = [
      [-6.15, 1.44, 0.64],
      [-5.02, 0.72, 0.48],
      [-4.5, 4.18, 0.42],
      [4.25, 1.46, 0.54],
      [5.48, 0.8, 0.46],
      [4.78, 3.6, 0.38],
      [5.72, 3.18, 0.34],
    ] as const


    this.agaveLeaves =
      new THREE.InstancedMesh(
        new THREE.ConeGeometry(
          0.045,
          1,
          4,
          1,
        ),
        this.agaveMaterial,
        plants.length *
          leavesPerPlant,
      )


    const colors = [
      new THREE.Color('#315c41'),
      new THREE.Color('#477655'),
      new THREE.Color('#244d37'),
    ]


    let leafIndex =
      0


    plants.forEach(
      (
        [x, z, scale],
        plantIndex,
      ) => {

      for (
        let leaf =
          0;
        leaf <
        leavesPerPlant;
        leaf +=
          1
      ) {

        const angle =
          leaf /
            leavesPerPlant *
            Math.PI *
            2 +
          plantIndex *
            0.31

        const height =
          scale *
          (
            0.72 +
            (
              leaf %
                3
            ) *
              0.12
          )


        this.setInstance(
          this.agaveLeaves,
          leafIndex,
          x +
            Math.cos(
              angle,
            ) *
              scale *
              0.16,
          0.3 +
            height *
              0.42,
          z +
            Math.sin(
              angle,
            ) *
              scale *
              0.16,
          scale *
            0.66,
          height,
          scale *
            0.66,
          angle,
          -0.82 +
            (
              leaf %
                2
            ) *
              0.12,
        )


        this.agaveLeaves.setColorAt(
          leafIndex,
          colors[
            (
              plantIndex +
              leaf
            ) %
              colors.length
          ],
        )


        leafIndex +=
          1
      }
    },
    )


    this.agaveLeaves.instanceMatrix.needsUpdate =
      true

    this.agaveLeaves.instanceColor!.needsUpdate =
      true

    this.agaveLeaves.name =
      'BellaCourtyardAgaveLeaves'

    this.agaveLeaves.castShadow =
      false

    this.group.add(
      this.agaveLeaves,
    )
  }


  private buildGrasses(): void {

    const capacity =
      144

    const geometry =
      new THREE.ConeGeometry(
        0.055,
        1,
        4,
        1,
      )


    this.grasses =
      new THREE.InstancedMesh(
        geometry,
        this.grassMaterial,
        capacity,
      )


    const random =
      createSeededRandom(
        20261002,
      )

    const edges = [
      [-5.35, 0.36, 3.3, 0.96],
      [4.84, 0.55, 3.05, 0.9],
      [-4.1, 4.76, 2.2, 0.62],
      [5.1, 3.84, 2.05, 0.64],
    ] as const

    const colors = [
      new THREE.Color('#2e6646'),
      new THREE.Color('#44805a'),
      new THREE.Color('#1f5137'),
    ]


    for (
      let index =
        0;
      index <
      capacity;
      index +=
        1
    ) {

      const edge =
        edges[
          index %
            edges.length
        ]

      const height =
        THREE.MathUtils.lerp(
          0.38,
          0.92,
          random(),
        )


      this.setInstance(
        this.grasses,
        index,
        edge[0] +
          THREE.MathUtils.lerp(
            -edge[2] *
              0.5,
            edge[2] *
              0.5,
            random(),
          ),
        0.38 +
          height *
            0.5,
        edge[1] +
          THREE.MathUtils.lerp(
            -edge[3] *
              0.5,
            edge[3] *
              0.5,
            random(),
          ),
        1,
        height,
        1,
        random() *
          Math.PI,
        THREE.MathUtils.lerp(
          -0.2,
          0.2,
          random(),
        ),
      )


      this.grasses.setColorAt(
        index,
        colors[
          index %
            colors.length
        ],
      )
    }


    this.grasses.instanceMatrix.needsUpdate =
      true

    this.grasses.instanceColor!.needsUpdate =
      true

    this.grasses.name =
      'BellaCourtyardGrasses'

    this.group.add(
      this.grasses,
    )
  }


  private buildGroundCover(): void {

    const patches = [
      [-5.72, 1.42, 0.62, 0.34],
      [-4.62, 0.64, 0.54, 0.28],
      [-4.12, 4.78, 0.48, 0.22],
      [4.34, 1.58, 0.58, 0.3],
      [5.64, 0.72, 0.46, 0.24],
      [5.02, 3.72, 0.42, 0.22],
      [-6.52, 0.34, 0.38, 0.2],
      [6.06, 2.56, 0.42, 0.22],
      [-3.62, 4.92, 0.36, 0.18],
      [4.5, 4.16, 0.34, 0.18],
      [-5.05, 2.1, 0.4, 0.2],
      [5.5, 2.4, 0.38, 0.2],
    ] as const


    this.groundCover =
      new THREE.InstancedMesh(
        new THREE.CircleGeometry(
          1,
          9,
        ),
        this.groundCoverMaterial,
        patches.length,
      )


    patches.forEach(
      (
        [x, z, width, depth],
        index,
      ) => {

      this.setInstance(
        this.groundCover,
        index,
        x,
        0.103,
        z,
        width,
        depth,
        1,
        index *
          0.73,
        0,
        -Math.PI /
          2,
      )


      this.groundCover.setColorAt(
        index,
        index %
          3 ===
          0
          ? new THREE.Color('#315b40')
          : new THREE.Color('#1f402d'),
      )
    },
    )


    this.groundCover.instanceMatrix.needsUpdate =
      true

    this.groundCover.instanceColor!.needsUpdate =
      true

    this.groundCover.name =
      'BellaCourtyardGroundCover'

    this.group.add(
      this.groundCover,
    )
  }


  private buildRocks(): void {

    const positions = [
      [-6.08, 2.44, 0.52],
      [-5.46, 2.68, 0.34],
      [-4.64, 3.64, 0.42],
      [-6.44, 1.18, 0.26],
      [-5.08, 0.46, 0.22],
      [-3.84, 4.28, 0.24],
      [5.76, 1.9, 0.48],
      [4.3, 3.98, 0.32],
      [5.72, 4.15, 0.38],
      [4.08, 0.62, 0.26],
      [5.14, 0.42, 0.22],
      [6.22, 2.78, 0.24],
      [-3.02, 5.08, 0.28],
      [3.28, 5.1, 0.26],
      [-7.12, 4.22, 0.38],
      [6.82, 4.56, 0.34],
      [-6.84, 3.26, 0.2],
      [5.96, 3.5, 0.2],
    ] as const

    const geometry =
      new THREE.DodecahedronGeometry(
        1,
        0,
      )


    this.rocks =
      new THREE.InstancedMesh(
        geometry,
        this.rockMaterial,
        positions.length,
      )


    const random =
      createSeededRandom(
        20261003,
      )


    positions.forEach(
      (
        [x, z, scale],
        index,
      ) => {

        this.setInstance(
          this.rocks,
          index,
          x,
          0.18 +
            scale *
              0.35,
          z,
          scale *
            1.28,
          scale *
            0.74,
          scale,
          random() *
            Math.PI,
          THREE.MathUtils.lerp(
            -0.2,
            0.2,
            random(),
          ),
        )


        this.rocks.setColorAt(
          index,
          new THREE.Color().lerpColors(
            new THREE.Color('#162a33'),
            new THREE.Color('#4b5b57'),
            random(),
          ),
        )
      },
    )


    this.rocks.instanceMatrix.needsUpdate =
      true

    this.rocks.instanceColor!.needsUpdate =
      true

    this.rocks.name =
      'BellaCourtyardRocks'

    this.rocks.castShadow =
      true

    this.rocks.receiveShadow =
      true

    this.group.add(
      this.rocks,
    )
  }


  private addBox(
    name: string,
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    shadows: boolean,
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


    mesh.name =
      name

    mesh.position.set(
      x,
      y,
      z,
    )

    mesh.castShadow =
      shadows

    mesh.receiveShadow =
      shadows

    this.group.add(
      mesh,
    )


    return mesh
  }


  private setInstance(
    mesh: THREE.InstancedMesh,
    index: number,
    x: number,
    y: number,
    z: number,
    scaleX: number,
    scaleY: number,
    scaleZ: number,
    rotationY: number,
    rotationZ: number =
      0,
    rotationX: number =
      0,
  ): void {

    this.instanceObject.position.set(
      x,
      y,
      z,
    )

    this.instanceObject.rotation.set(
      rotationX,
      rotationY,
      rotationZ,
    )

    this.instanceObject.scale.set(
      scaleX,
      scaleY,
      scaleZ,
    )

    this.instanceObject.updateMatrix()

    mesh.setMatrixAt(
      index,
      this.instanceObject.matrix,
    )
  }


  private resolveProfile(
    {
      width,
      aspect,
    }: BellaCourtyardViewport,
  ): CourtyardProfile {

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
    profile: CourtyardProfile,
  ): void {

    if (
      profile ===
      this.profile &&
      this.shrubCount >
        0
    ) {
      return
    }


    this.profile =
      profile

    this.shrubCount =
      profile ===
      'phone'
        ? 24
        : profile ===
            'tablet'
          ? 42
          : this.shrubs.count

    this.grassCount =
      profile ===
      'phone'
        ? 64
        : profile ===
            'tablet'
          ? 102
          : this.grasses.count

    this.ornamentalBushCount =
      profile ===
      'phone'
        ? 10
        : profile ===
            'tablet'
          ? 19
          : this.ornamentalBushes.count

    this.agaveLeafCount =
      profile ===
      'phone'
        ? 28
        : profile ===
            'tablet'
          ? 42
          : this.agaveLeaves.count


    this.shrubs.count =
      this.shrubCount

    this.grasses.count =
      this.grassCount

    this.ornamentalBushes.count =
      this.ornamentalBushCount

    this.agaveLeaves.count =
      this.agaveLeafCount

    this.groundCover.count =
      profile ===
      'phone'
        ? 6
        : profile ===
            'tablet'
          ? 9
          : this.groundCover.count

    this.rocks.count =
      profile ===
      'phone'
        ? 12
        : profile ===
            'tablet'
          ? 16
          : this.rocks.count
  }
}
