import * as THREE from 'three'


export type BellaCourtyardViewport = {
  width: number
  aspect: number
}


export type BellaCourtyardDebugState = {
  profile: CourtyardProfile
  treeCount: number
  shrubCount: number
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

  private readonly pavingMaterial =
    new THREE.MeshStandardMaterial({
      color: '#10191d',
      roughness: 0.86,
      metalness: 0.1,
    })

  private readonly edgeStoneMaterial =
    new THREE.MeshStandardMaterial({
      color: '#263238',
      roughness: 0.92,
      metalness: 0.02,
    })

  private readonly planterMaterial =
    new THREE.MeshStandardMaterial({
      color: '#142126',
      roughness: 0.9,
      metalness: 0.03,
    })

  private readonly shrubMaterial =
    new THREE.MeshStandardMaterial({
      color: '#203f3c',
      emissive: '#172b2b',
      emissiveIntensity: 0.11,
      roughness: 0.94,
      metalness: 0,
      vertexColors: true,
    })

  private readonly grassMaterial =
    new THREE.MeshStandardMaterial({
      color: '#28524c',
      emissive: '#1b3734',
      emissiveIntensity: 0.1,
      roughness: 0.92,
      metalness: 0,
      vertexColors: true,
      side: THREE.DoubleSide,
    })

  private readonly treeFoliageMaterial =
    new THREE.MeshStandardMaterial({
      color: '#1c3a38',
      emissive: '#294342',
      emissiveIntensity: 0.16,
      roughness: 0.93,
      metalness: 0,
      vertexColors: true,
      flatShading: true,
    })

  private readonly trunkMaterial =
    new THREE.MeshStandardMaterial({
      color: '#252b2c',
      emissive: '#11191a',
      emissiveIntensity: 0.06,
      roughness: 0.89,
      metalness: 0.02,
      flatShading: true,
    })

  private readonly rockMaterial =
    new THREE.MeshStandardMaterial({
      color: '#2a3337',
      roughness: 0.95,
      metalness: 0.01,
      flatShading: true,
      vertexColors: true,
    })

  private readonly gardenLanternMetalMaterial =
    new THREE.MeshStandardMaterial({
      color: '#1a2427',
      roughness: 0.72,
      metalness: 0.26,
    })

  private readonly gardenLanternGlowMaterial =
    new THREE.MeshStandardMaterial({
      color: '#d9b98c',
      emissive: '#ffd3a0',
      emissiveIntensity: 0.8,
      roughness: 0.58,
      metalness: 0.03,
    })

  private shrubs!: THREE.InstancedMesh<
    THREE.DodecahedronGeometry,
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


  constructor(
    scene: THREE.Scene,
  ) {

    this.group.name =
      'BellaCourtyard'


    this.buildArrivalSurface()

    this.buildPlantersAndWalls()

    this.buildGardenPractical()

    this.buildTrees()

    this.buildShrubs()

    this.buildGrasses()

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
      shrubCount: this.shrubCount,
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
        '#ffd2a0',
        0.48,
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


  private buildTrees(): void {

    const trunkGeometry =
      new THREE.CylinderGeometry(
        0.18,
        0.25,
        1,
        6,
      )


    const branchGeometry =
      new THREE.CylinderGeometry(
        0.07,
        0.1,
        1,
        5,
      )


    const foliageGeometry =
      new THREE.IcosahedronGeometry(
        1,
        1,
      )


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
          3,
      )


    this.treeFoliage =
      new THREE.InstancedMesh(
        foliageGeometry,
        this.treeFoliageMaterial,
        this.treeDefinitions.length *
          4,
      )


    const foliageColors = [
      new THREE.Color('#31504b'),
      new THREE.Color('#41605a'),
      new THREE.Color('#1d3735'),
      new THREE.Color('#4a625b'),
    ]


    let branchIndex =
      0

    let foliageIndex =
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


        for (
          let branch =
            0;
          branch <
          3;
          branch +=
            1
        ) {

          const branchHeight =
            tree.height *
            (
              0.48 +
              branch *
                0.13
            )

          const angle =
            tree.lean +
            branch *
              2.1


          this.setInstance(
            this.treeBranches,
            branchIndex,
            tree.x +
              Math.cos(
                angle,
              ) *
                tree.width *
                0.24,
            branchHeight,
            tree.z +
              Math.sin(
                angle,
              ) *
                tree.width *
                0.24,
            0.72,
            tree.width *
              0.92,
            0.72,
            angle,
            -0.78,
          )


          branchIndex +=
            1
        }


        for (
          let cluster =
            0;
          cluster <
          4;
          cluster +=
            1
        ) {

          const angle =
            tree.lean +
            cluster *
              1.72

          const radius =
            cluster ===
            3
              ? 0.06
              : tree.width *
                0.38

          const y =
            tree.height *
            (
              0.56 +
              cluster *
                0.095
            )

          const width =
            tree.width *
            (
              cluster ===
              3
                ? 0.68
                : 0.8
            )


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
              0.62,
            width,
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
        }
      },
    )


    this.treeTrunks.instanceMatrix.needsUpdate =
      true

    this.treeBranches.instanceMatrix.needsUpdate =
      true

    this.treeFoliage.instanceMatrix.needsUpdate =
      true

    this.treeFoliage.instanceColor!.needsUpdate =
      true


    this.treeTrunks.name =
      'BellaCourtyardTreeTrunks'

    this.treeBranches.name =
      'BellaCourtyardTreeBranches'

    this.treeFoliage.name =
      'BellaCourtyardTreeCanopies'


    this.treeTrunks.castShadow =
      true

    this.treeBranches.castShadow =
      true

    this.treeFoliage.castShadow =
      true

    this.treeTrunks.receiveShadow =
      true

    this.treeFoliage.receiveShadow =
      true


    this.group.add(
      this.treeTrunks,
      this.treeBranches,
      this.treeFoliage,
    )
  }


  private buildShrubs(): void {

    const capacity =
      38

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
      new THREE.Color('#31504a'),
      new THREE.Color('#3c5952'),
      new THREE.Color('#243f3c'),
      new THREE.Color('#486259'),
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


  private buildGrasses(): void {

    const capacity =
      78

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
      new THREE.Color('#315b51'),
      new THREE.Color('#426a5d'),
      new THREE.Color('#264740'),
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


  private buildRocks(): void {

    const positions = [
      [-6.08, 2.44, 0.52],
      [-5.46, 2.68, 0.34],
      [-4.64, 3.64, 0.42],
      [5.76, 1.9, 0.48],
      [4.3, 3.98, 0.32],
      [5.72, 4.15, 0.38],
      [-3.02, 5.08, 0.28],
      [3.28, 5.1, 0.26],
      [-7.12, 4.22, 0.38],
      [6.82, 4.56, 0.34],
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
            new THREE.Color('#101d25'),
            new THREE.Color('#3a4547'),
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
  ): void {

    this.instanceObject.position.set(
      x,
      y,
      z,
    )

    this.instanceObject.rotation.set(
      0,
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
        ? 20
        : profile ===
            'tablet'
          ? 30
          : this.shrubs.count

    this.grassCount =
      profile ===
      'phone'
        ? 38
        : profile ===
            'tablet'
          ? 58
          : this.grasses.count


    this.shrubs.count =
      this.shrubCount

    this.grasses.count =
      this.grassCount
  }
}
