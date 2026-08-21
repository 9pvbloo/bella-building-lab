import * as THREE from 'three'
import './style.css'

import { BellaBuilding } from './building/BellaBuilding'
import {
  CameraDirector,
  type CameraViewport,
} from './camera/CameraDirector'
import { DebugPanel } from './core/DebugPanel'
import { RuntimePreferences } from './core/RuntimePreferences'
import { ScrollDirector } from './core/ScrollDirector'
import { BellaWordmark } from './typography/BellaWordmark'
import { Atmosphere } from './world/Atmosphere'
import { Moon } from './world/Moon'
import { NightSky } from './world/NightSky'


// ==================================================
// BELLA DURMIENTE
// CINEMATIC EXPERIENCE
//
// V4.2
//
// - Edificio Bella 3D
// - Scroll por capítulos
// - Cámara cinematográfica
// - Foreground parallax
// - Montañas andinas
// - Niebla
// - Estrellas
// - Luna protagonista siempre visible
// - Wordmark gigante BELLA DURMIENTE
// ==================================================


// ==================================================
// CANVAS
// ==================================================

const canvas =
  document.querySelector<HTMLCanvasElement>(
    '#bella-gl',
  )

if (!canvas) {
  throw new Error(
    'No se encontró #bella-gl',
  )
}


// ==================================================
// UTILIDADES
// ==================================================

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


function damp(
  current: number,
  target: number,
  rate: number,
  delta: number,
): number {

  return THREE.MathUtils.lerp(
    current,
    target,
    1 -
      Math.exp(
        -rate * delta,
      ),
  )
}


// ==================================================
// RANDOM FIJO
//
// Permite que estrellas y montañas sean siempre
// iguales después de recargar.
// ==================================================

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


// ==================================================
// ESCENA
// ==================================================

const scene =
  new THREE.Scene()


scene.background =
  new THREE.Color(
    '#020711',
  )


// ==================================================
// CÁMARA
// ==================================================

const camera =
  new THREE.PerspectiveCamera(
    35,

    window.innerWidth /
      window.innerHeight,

    0.1,

    150,
  )


const cameraViewport: CameraViewport = {
  width: window.innerWidth,
  height: window.innerHeight,
  aspect: camera.aspect,
}


/*
  La cámara se registra en la escena como parte del runtime persistente.
  Los elementos astronómicos se mantienen en espacio mundo.
*/

scene.add(
  camera,
)


// ==================================================
// RENDERER
// ==================================================

const renderer =
  new THREE.WebGLRenderer({
    canvas,

    antialias:
      true,

    alpha:
      false,

    powerPreference:
      'high-performance',
  })


renderer.setSize(
  window.innerWidth,
  window.innerHeight,
  false,
)


renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    1.8,
  ),
)


renderer.outputColorSpace =
  THREE.SRGBColorSpace


renderer.toneMapping =
  THREE.ACESFilmicToneMapping


renderer.toneMappingExposure =
  0.82


renderer.shadowMap.enabled =
  true


renderer.shadowMap.type =
  THREE.PCFSoftShadowMap


// ==================================================
// ILUMINACIÓN
// ==================================================


// --------------------------------------------------
// Ambiente nocturno
// --------------------------------------------------

const hemisphere =
  new THREE.HemisphereLight(
    '#355f7c',
    '#01040a',
    0.78,
  )


scene.add(
  hemisphere,
)


// --------------------------------------------------
// Luz lunar
// --------------------------------------------------

const moonLight =
  new THREE.DirectionalLight(
    '#b8dcf4',
    2.15,
  )


moonLight.position.set(
  -6,
  12,
  8,
)


moonLight.castShadow =
  true


moonLight.shadow.mapSize.set(
  2048,
  2048,
)


moonLight.shadow.camera.near =
  0.5


moonLight.shadow.camera.far =
  42


moonLight.shadow.camera.left =
  -14


moonLight.shadow.camera.right =
  14


moonLight.shadow.camera.top =
  18


moonLight.shadow.camera.bottom =
  -8


scene.add(
  moonLight,
)


// --------------------------------------------------
// Relleno azul
// --------------------------------------------------

const blueFill =
  new THREE.DirectionalLight(
    '#187bbb',
    0.94,
  )


blueFill.position.set(
  8,
  7,
  4,
)


scene.add(
  blueFill,
)


// --------------------------------------------------
// Luz cálida cerca de recepción
// --------------------------------------------------

const entranceLight =
  new THREE.PointLight(
    '#ffb36b',
    0.78,
    12,
    2,
  )


entranceLight.position.set(
  0.8,
  2.15,
  4.1,
)


scene.add(
  entranceLight,
)


// ==================================================
// CIELO NOCTURNO
// ==================================================

const nightSky =
  new NightSky(
    scene,
  )


// ==================================================
// LUNA · ESPACIO MUNDO
// ==================================================

const moon =
  new Moon(
    scene,
  )

// ==================================================
// MONTAÑAS
// ==================================================

type MountainLayer = {

  mesh:
    THREE.Mesh

  baseX:
    number

  baseY:
    number

  parallax:
    number
}


// --------------------------------------------------
// Geometría procedural
// --------------------------------------------------

function createMountainGeometry(
  width: number,
  height: number,
  seed: number,
  detail: number,
): THREE.BufferGeometry {

  const random =
    seededRandom(
      seed,
    )


  const segments =
    detail


  const vertices:
    number[] = []


  const indices:
    number[] = []


  const ridge:
    number[] = []


  const halfWidth =
    width /
    2


  for (
    let i =
      0;
    i <=
      segments;
    i += 1
  ) {

    const normalized =
      i /
      segments


    const major =
      Math.sin(
        normalized *
        Math.PI *
        3.4 +
        seed *
        0.01,
      ) *
      0.15


    const secondary =
      Math.sin(
        normalized *
        Math.PI *
        8.7 +
        seed *
        0.05,
      ) *
      0.065


    const noise =
      (
        random() -
        0.5
      ) *
      0.075


    const current =
      clamp(
        0.48 +
        major +
        secondary +
        noise,

        0.24,

        0.78,
      )


    ridge.push(
      current,
    )
  }


  for (
    let i =
      0;
    i <=
      segments;
    i += 1
  ) {

    const x =
      THREE.MathUtils.lerp(
        -halfWidth,
        halfWidth,
        i /
          segments,
      )


    const y =
      ridge[
        i
      ] *
      height


    // Cresta

    vertices.push(
      x,
      y,
      0,
    )


    // Base

    vertices.push(
      x,
      -height *
        0.45,
      0,
    )
  }


  for (
    let i =
      0;
    i <
      segments;
    i += 1
  ) {

    const a =
      i *
      2


    const b =
      a +
      1


    const c =
      a +
      2


    const d =
      a +
      3


    indices.push(
      a,
      b,
      c,

      c,
      b,
      d,
    )
  }


  const geometry =
    new THREE.BufferGeometry()


  geometry.setAttribute(
    'position',

    new THREE.Float32BufferAttribute(
      vertices,
      3,
    ),
  )


  geometry.setIndex(
    indices,
  )


  geometry.computeVertexNormals()


  return geometry
}


// ==================================================
// MONTAÑA LEJANA
// ==================================================

const mountainFar =
  new THREE.Mesh(

    createMountainGeometry(
      72,
      15,
      91,
      48,
    ),

    new THREE.MeshBasicMaterial({
      color:
        '#122538',

      transparent:
        true,

      opacity:
        0.72,

      side:
        THREE.DoubleSide,

      depthWrite:
        false,

      fog:
        true,
    }),

  )


mountainFar.position.set(
  1,
  -1.5,
  -42,
)


scene.add(
  mountainFar,
)


// ==================================================
// MONTAÑA INTERMEDIA
// ==================================================

const mountainMid =
  new THREE.Mesh(

    createMountainGeometry(
      62,
      12,
      173,
      52,
    ),

    new THREE.MeshBasicMaterial({
      color:
        '#0b1927',

      transparent:
        true,

      opacity:
        0.88,

      side:
        THREE.DoubleSide,

      depthWrite:
        false,

      fog:
        true,
    }),

  )


mountainMid.position.set(
  -2.5,
  -2.4,
  -28,
)


scene.add(
  mountainMid,
)


// ==================================================
// MONTAÑA CERCANA
// ==================================================

const mountainNear =
  new THREE.Mesh(

    createMountainGeometry(
      54,
      9.5,
      285,
      46,
    ),

    new THREE.MeshBasicMaterial({
      color:
        '#07111b',

      transparent:
        true,

      opacity:
        0.95,

      side:
        THREE.DoubleSide,

      depthWrite:
        false,

      fog:
        true,
    }),

  )


mountainNear.position.set(
  1.5,
  -3.2,
  -19,
)


scene.add(
  mountainNear,
)


// ==================================================
// REGISTRO DE PARALLAX DE MONTAÑAS
// ==================================================

const mountainLayers:
  MountainLayer[] = [

  {
    mesh:
      mountainFar,

    baseX:
      1,

    baseY:
      -1.5,

    parallax:
      0.22,
  },


  {
    mesh:
      mountainMid,

    baseX:
      -2.5,

    baseY:
      -2.4,

    parallax:
      0.48,
  },


  {
    mesh:
      mountainNear,

    baseX:
      1.5,

    baseY:
      -3.2,

    parallax:
      0.85,
  },

]


// ==================================================
// EDIFICIO BELLA DURMIENTE
// ==================================================

const building =
  new BellaBuilding()


building.position.set(
  0,
  0,
  0,
)


scene.add(
  building,
)


// ==================================================
// WORDMARK V2
// ==================================================

const bellaWordmark =
  new BellaWordmark(
    renderer,
  )


scene.add(
  bellaWordmark.group,
)


// ==================================================
// SUELO
// ==================================================

const floor =
  new THREE.Mesh(

    new THREE.PlaneGeometry(
      70,
      70,
    ),

    new THREE.MeshStandardMaterial({
      color:
        '#040b12',

      roughness:
        0.86,

      metalness:
        0.07,
    }),

  )


floor.rotation.x =
  -Math.PI /
  2


floor.receiveShadow =
  true


scene.add(
  floor,
)


// ==================================================
// ATMÓSFERA
// ==================================================

const atmosphere =
  new Atmosphere(
    scene,
  )

// ==================================================
// CHAPTERS HTML
// ==================================================

const chapters =
  Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-bella-cam]',
    ),
  )


if (
  chapters.length ===
  0
) {

  throw new Error(
    'No se encontraron capítulos [data-bella-cam]',
  )
}


const cameraDirector =
  new CameraDirector(
    chapters,
  )


// ==================================================
// RUNTIME STATE
//
// exactProgress remains the native-scroll source of truth.
// smoothProgress is declared below and only drives visual interpolation.
// ==================================================

const scrollDirector =
  new ScrollDirector(
    chapters,
  )


const runtimePreferences =
  new RuntimePreferences()


let exactProgress =
  scrollDirector.exactProgress


// ==================================================
// SCRIM GLOBAL
//
// A single fixed layer protects DOM readability without allowing any section
// boundary to pass across the persistent Three.js world.
// ==================================================

type WorldScrimState = {
  leftOpacity: number
  middleOpacity: number
  rightOpacity: number
  middleStop: number
  rightStop: number
  focalX: number
  focalY: number
  focalWidth: number
  focalHeight: number
  focalCoreOpacity: number
  focalSoftOpacity: number
}


const worldScrim =
  document.querySelector<HTMLElement>(
    '.bella-world-scrim',
  )


const worldScrimStates:
  WorldScrimState[] = [

  {
    leftOpacity: 0.88,
    middleOpacity: 0.60,
    rightOpacity: 0.16,
    middleStop: 34,
    rightStop: 65,
    focalX: 22,
    focalY: 50,
    focalWidth: 82,
    focalHeight: 68,
    focalCoreOpacity: 0,
    focalSoftOpacity: 0,
  },


  {
    leftOpacity: 0.36,
    middleOpacity: 0.14,
    rightOpacity: 0.02,
    middleStop: 46,
    rightStop: 78,
    focalX: 22,
    focalY: 50,
    focalWidth: 80,
    focalHeight: 62,
    focalCoreOpacity: 0.58,
    focalSoftOpacity: 0.20,
  },


  {
    leftOpacity: 0.20,
    middleOpacity: 0.08,
    rightOpacity: 0.02,
    middleStop: 38,
    rightStop: 74,
    focalX: 54,
    focalY: 48,
    focalWidth: 100,
    focalHeight: 76,
    focalCoreOpacity: 0.42,
    focalSoftOpacity: 0.23,
  },


  {
    leftOpacity: 0.24,
    middleOpacity: 0.08,
    rightOpacity: 0.02,
    middleStop: 45,
    rightStop: 78,
    focalX: 50,
    focalY: 50,
    focalWidth: 96,
    focalHeight: 76,
    focalCoreOpacity: 0.30,
    focalSoftOpacity: 0.12,
  },


  {
    leftOpacity: 0.30,
    middleOpacity: 0.12,
    rightOpacity: 0.03,
    middleStop: 44,
    rightStop: 77,
    focalX: 32,
    focalY: 50,
    focalWidth: 92,
    focalHeight: 72,
    focalCoreOpacity: 0.46,
    focalSoftOpacity: 0.18,
  },


  {
    leftOpacity: 0.22,
    middleOpacity: 0.08,
    rightOpacity: 0.02,
    middleStop: 42,
    rightStop: 76,
    focalX: 48,
    focalY: 47,
    focalWidth: 102,
    focalHeight: 78,
    focalCoreOpacity: 0.30,
    focalSoftOpacity: 0.13,
  },


  {
    leftOpacity: 0.16,
    middleOpacity: 0.055,
    rightOpacity: 0.01,
    middleStop: 40,
    rightStop: 76,
    focalX: 54,
    focalY: 48,
    focalWidth: 108,
    focalHeight: 82,
    focalCoreOpacity: 0.20,
    focalSoftOpacity: 0.08,
  },


  {
    leftOpacity: 0.42,
    middleOpacity: 0.16,
    rightOpacity: 0.03,
    middleStop: 42,
    rightStop: 74,
    focalX: 38,
    focalY: 56,
    focalWidth: 88,
    focalHeight: 68,
    focalCoreOpacity: 0.32,
    focalSoftOpacity: 0.15,
  },

]


function updateWorldScrim(
  progress: number,
): void {

  if (
    !worldScrim
  ) {
    return
  }


  const maxIndex =
    worldScrimStates.length -
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
    clampedProgress -
    startIndex


  const eased =
    localProgress *
    localProgress *
    (
      3 -
      2 *
      localProgress
    )


  const start =
    worldScrimStates[
      startIndex
    ]


  const end =
    worldScrimStates[
      endIndex
    ]


  const interpolate = (
    key: keyof WorldScrimState,
  ): number =>
    THREE.MathUtils.lerp(
      start[
        key
      ],
      end[
        key
      ],
      eased,
    )


  const setValue = (
    property: string,
    value: number,
    unit: string =
      '',
  ): void => {

    worldScrim.style.setProperty(
      property,
      `${
        value.toFixed(
          3,
        )
      }${unit}`,
    )
  }


  setValue(
    '--bella-scrim-left',
    interpolate(
      'leftOpacity',
    ),
  )


  setValue(
    '--bella-scrim-middle',
    interpolate(
      'middleOpacity',
    ),
  )


  setValue(
    '--bella-scrim-right',
    interpolate(
      'rightOpacity',
    ),
  )


  setValue(
    '--bella-scrim-middle-stop',
    interpolate(
      'middleStop',
    ),
    '%',
  )


  setValue(
    '--bella-scrim-right-stop',
    interpolate(
      'rightStop',
    ),
    '%',
  )


  setValue(
    '--bella-scrim-focal-x',
    interpolate(
      'focalX',
    ),
    '%',
  )


  setValue(
    '--bella-scrim-focal-y',
    interpolate(
      'focalY',
    ),
    '%',
  )


  setValue(
    '--bella-scrim-focal-width',
    interpolate(
      'focalWidth',
    ),
    '%',
  )


  setValue(
    '--bella-scrim-focal-height',
    interpolate(
      'focalHeight',
    ),
    '%',
  )


  setValue(
    '--bella-scrim-focal-core',
    interpolate(
      'focalCoreOpacity',
    ),
  )


  setValue(
    '--bella-scrim-focal-soft',
    interpolate(
      'focalSoftOpacity',
    ),
  )
}


// ==================================================
// FOREGROUND
// ==================================================

const foreground =
  document.querySelector<HTMLElement>(
    '#bellaForeground',
  )


const fgBranch =
  document.querySelector<HTMLElement>(
    '[data-fg-role="branch"]',
  )


const fgGarden =
  document.querySelector<HTMLElement>(
    '[data-fg-role="garden"]',
  )


const fgTree =
  document.querySelector<HTMLElement>(
    '[data-fg-role="tree"]',
  )


const heroCopy =
  document.querySelector<HTMLElement>(
    '.bella-hero-copy',
  )


const experienceCopy =
  document.querySelector<HTMLElement>(
    '.bella-experience-copy',
  )


let currentActiveChapter =
  -1


let foregroundRetireTimer:
  number | undefined


// ==================================================
// ACTIVE CHAPTER
// ==================================================

function updateActiveChapter(
  activeIndex: number,
): void {

  if (
    activeIndex ===
    currentActiveChapter
  ) {
    return
  }


  currentActiveChapter =
    activeIndex


  chapters.forEach(
    (
      chapter,
      index,
    ) => {

      chapter.classList.toggle(
        'is-active',
        index ===
          activeIndex,
      )

    },
  )


  if (
    !foreground
  ) {
    return
  }


  // --------------------------------------------------
  // Hero y experiencia mantienen el foreground preparado. La visibilidad de
  // Hero → Experiencia se resuelve con progreso visual en el loop de render.
  // --------------------------------------------------

  if (
    activeIndex <=
    1
  ) {

    if (
      foregroundRetireTimer !==
      undefined
    ) {

      window.clearTimeout(
        foregroundRetireTimer,
      )


      foregroundRetireTimer =
        undefined
    }


    foreground.classList.remove(
      'is-retiring',
    )


    requestAnimationFrame(
      () => {

        foreground.classList.add(
          'is-active',
        )

      },
    )


    return
  }


  // --------------------------------------------------
  // Retirar foreground
  // --------------------------------------------------

  if (
    foreground.classList.contains(
      'is-active',
    )
  ) {

    foreground.classList.remove(
      'is-active',
    )


    foreground.classList.add(
      'is-retiring',
    )


    foregroundRetireTimer =
      window.setTimeout(
        () => {

          foreground.classList.remove(
            'is-retiring',
          )


          foregroundRetireTimer =
            undefined

        },
        850,
      )
  }
}


// ==================================================
// CÁMARA
// ==================================================

let smoothProgress =
  0


const currentTarget =
  new THREE.Vector3()


const heroPointerTarget =
  new THREE.Vector2()


const heroPointerVisual =
  new THREE.Vector2()


const heroPointerQuery =
  window.matchMedia(
    '(any-hover: hover) and (any-pointer: fine)',
  )


function resetHeroPointer():
  void {

  heroPointerTarget.set(
    0,
    0,
  )
}


window.addEventListener(
  'pointermove',
  (
    event,
  ) => {

    if (
      runtimePreferences.prefersReducedMotion ||
      !heroPointerQuery.matches
    ) {
      return
    }


    heroPointerTarget.set(
      clamp(
        event.clientX /
          window.innerWidth *
          2 -
          1,
        -1,
        1,
      ),
      clamp(
        event.clientY /
          window.innerHeight *
          2 -
          1,
        -1,
        1,
      ),
    )
  },
  {
    passive: true,
  },
)


window.addEventListener(
  'blur',
  resetHeroPointer,
)


heroPointerQuery.addEventListener(
  'change',
  resetHeroPointer,
)


function updateCamera(
  progress: number,
  activeChapterIndex: number,
  delta: number,
): void {

  const frame =
    cameraDirector.update({
      smoothProgress: progress,
      activeChapterIndex,
      viewport: cameraViewport,
    })


  camera.position.copy(
    frame.position,
  )


  currentTarget.copy(
    frame.target,
  )


  const heroPointerInfluence =
    runtimePreferences.prefersReducedMotion
      ? 0
      : heroPointerQuery.matches
        ? 1 -
          THREE.MathUtils.smoothstep(
            progress,
            0.04,
            0.48,
          )
        : 0


  heroPointerVisual.x =
    damp(
      heroPointerVisual.x,
      heroPointerTarget.x,
      7.5,
      delta,
    )


  heroPointerVisual.y =
    damp(
      heroPointerVisual.y,
      heroPointerTarget.y,
      7.5,
      delta,
    )


  const pointerX =
    heroPointerVisual.x *
    heroPointerInfluence


  const pointerY =
    heroPointerVisual.y *
    heroPointerInfluence


  // A restrained Hero-only camera drift preserves authored shot ownership.
  camera.position.x +=
    pointerX *
    0.32


  camera.position.y -=
    pointerY *
    0.16


  currentTarget.x +=
    pointerX *
    0.09


  currentTarget.y -=
    pointerY *
    0.045


  camera.lookAt(
    currentTarget,
  )


  camera.fov =
    frame.fov


  camera.updateProjectionMatrix()
}


// ==================================================
// PARALLAX FOREGROUND
// ==================================================

function updateForegroundParallax(
  progress: number,
): void {

  const setReveal = (
    element: HTMLElement | null,
    start: number,
    end: number,
  ): void => {

    if (
      !element
    ) {
      return
    }


    element.style.setProperty(
      '--fg-hero-reveal',
      THREE.MathUtils.smoothstep(
        progress,
        start,
        end,
      ).toFixed(
        3,
      ),
    )
  }


  foreground?.classList.toggle(
    'is-hero-revealing',
    progress <
      0.999,
  )


  // The poster-like Hero stays clean at rest. Existing foreground layers
  // begin once the user has left it, then arrive in their Experience state.
  setReveal(
    fgBranch,
    0.28,
    0.70,
  )


  setReveal(
    fgGarden,
    0.38,
    0.82,
  )


  setReveal(
    fgTree,
    0.48,
    0.92,
  )

  const local =
    clamp(
      (
        progress -
        0.45
      ) /
      1.1,

      0,

      1,
    )


  // --------------------------------------------------
  // Rama
  // --------------------------------------------------

  if (
    fgBranch
  ) {

    fgBranch.style.setProperty(
      '--fg-x',

      `${
        THREE.MathUtils.lerp(
          -12,
          10,
          local,
        )
      }px`,
    )


    fgBranch.style.setProperty(
      '--fg-y',

      `${
        THREE.MathUtils.lerp(
          -8,
          14,
          local,
        )
      }px`,
    )
  }


  // --------------------------------------------------
  // Jardín
  // --------------------------------------------------

  if (
    fgGarden
  ) {

    fgGarden.style.setProperty(
      '--fg-x',

      `${
        THREE.MathUtils.lerp(
          -10,
          18,
          local,
        )
      }px`,
    )


    fgGarden.style.setProperty(
      '--fg-y',

      `${
        THREE.MathUtils.lerp(
          26,
          -24,
          local,
        )
      }px`,
    )
  }


  // --------------------------------------------------
  // Árbol
  // --------------------------------------------------

  if (
    fgTree
  ) {

    fgTree.style.setProperty(
      '--fg-x',

      `${
        THREE.MathUtils.lerp(
          16,
          -14,
          local,
        )
      }px`,
    )


    fgTree.style.setProperty(
      '--fg-y',

      `${
        THREE.MathUtils.lerp(
          11,
          -18,
          local,
        )
      }px`,
    )
  }
}


// ==================================================
// HERO / EXPERIENCIA COPY CHOREOGRAPHY
// ==================================================

function updateIntroCopyChoreography(
  progress: number,
): void {

  const heroVisibility =
    1 -
    THREE.MathUtils.smoothstep(
      progress,
      0.08,
      0.42,
    )


  const experienceVisibility =
    THREE.MathUtils.smoothstep(
      progress,
      0.84,
      0.99,
    )


  const setCopyState = (
    element: HTMLElement | null,
    visibility: number,
    startY: number,
  ): void => {

    if (
      !element
    ) {
      return
    }


    element.style.setProperty(
      '--bella-copy-opacity',
      visibility.toFixed(
        3,
      ),
    )


    element.style.setProperty(
      '--bella-copy-y',
      `${
        THREE.MathUtils.lerp(
          startY,
          0,
          visibility,
        )
      }px`,
    )
  }


  // Both directions come from the same continuous visual progress. Hero copy
  // clears first; Experience becomes readable after the title is ghosted.
  setCopyState(
    heroCopy,
    heroVisibility,
    -18,
  )


  setCopyState(
    experienceCopy,
    experienceVisibility,
    20,
  )
}


// ==================================================
// FONDO · MONTAÑAS + LUNA
// ==================================================

function updateBackgroundParallax(
  progress: number,
  elapsed: number,
  prefersReducedMotion: boolean,
): void {

  const normalized =
    clamp(
      progress /
      6,

      0,

      1,
    )


  // --------------------------------------------------
  // Montañas
  // --------------------------------------------------

  mountainLayers.forEach(
    (
      layer,
      index,
    ) => {

      const horizontal =
        (
          normalized -
          0.5
        ) *
        layer.parallax *
        1.8


      const breathing =
        Math.sin(
          elapsed *
          (
            0.025 +
            index *
            0.008
          ) +
          index,
        ) *
        0.05 *
        layer.parallax


      layer.mesh.position.x =
        layer.baseX +
        horizontal +
        breathing


      layer.mesh.position.y =
        layer.baseY +
        normalized *
        layer.parallax *
        0.16

    },
  )


  // ==================================================
  // LUNA · ESPACIO MUNDO
  // ==================================================

  moon.update({
    progress,
    elapsed,
    camera,
    prefersReducedMotion,
  })


}


// ==================================================
// ATMÓSFERA
// ==================================================

function updateAtmosphere(
  elapsed: number,
  progress: number,
): void {

  atmosphere.update(
    elapsed,
    progress,
    runtimePreferences.prefersReducedMotion,
  )
}

// ==================================================
// PROGRESS BAR
// ==================================================

const progressBar =
  document.querySelector<HTMLElement>(
    '#bellaProgress',
  )


function updateProgressBar():
  void {

  if (
    !progressBar
  ) {
    return
  }


  const maxScroll =
    document.documentElement
      .scrollHeight -
    window.innerHeight


  const progress =
    maxScroll >
    0
      ? window.scrollY /
        maxScroll
      : 0


  progressBar.style.width =
    `${
      clamp(
        progress,
        0,
        1,
      ) *
      100
    }%`
}


function syncExactScrollState():
  void {

  const scrollState =
    scrollDirector.update()


  exactProgress =
    scrollState.exactProgress


  updateActiveChapter(
    scrollState.activeChapterIndex,
  )


  updateProgressBar()
}


// ==================================================
// SCROLL
// ==================================================

function handleScroll():
  void {

  syncExactScrollState()
}


window.addEventListener(
  'scroll',

  handleScroll,

  {
    passive:
      true,
  },
)


handleScroll()


// ==================================================
// ANIMATION LOOP
// ==================================================

const debugPanel =
  DebugPanel.isEnabled()
    ? new DebugPanel()
    : undefined


let animationFrameId:
  number | undefined


let lastFrameTime:
  number | undefined


let elapsed =
  0


let latestFrameTime =
  0


function scheduleAnimation():
  void {

  if (
    !runtimePreferences.isDocumentVisible ||
    animationFrameId !==
      undefined
  ) {
    return
  }


  animationFrameId =
    requestAnimationFrame(
      animate,
    )
}


function animate(
  frameTime: number,
):
  void {

  animationFrameId =
    undefined


  if (
    !runtimePreferences.isDocumentVisible
  ) {
    return
  }


  const rawDelta =
    lastFrameTime ===
      undefined
      ? 0
      : (
          frameTime -
          lastFrameTime
        ) /
        1000

  const delta =
    Math.min(
      Math.max(
        rawDelta,
        0,
      ),
      0.05,
    )


  lastFrameTime =
    frameTime


  latestFrameTime =
    rawDelta *
    1000


  elapsed +=
    rawDelta


  smoothProgress =
    damp(
      smoothProgress,

      exactProgress,

      4.6,

      delta,
    )


  updateWorldScrim(
    smoothProgress,
  )


  // --------------------------------------------------
  // Cámara
  // --------------------------------------------------

  updateCamera(
    smoothProgress,
    scrollDirector.activeChapterIndex,
    delta,
  )


  // --------------------------------------------------
  // Foreground
  // --------------------------------------------------

  updateForegroundParallax(
    smoothProgress,
  )


  updateIntroCopyChoreography(
    smoothProgress,
  )


  // --------------------------------------------------
  // Montañas / luna
  // --------------------------------------------------

  updateBackgroundParallax(
    smoothProgress,
    elapsed,
    runtimePreferences.prefersReducedMotion,
  )


  // --------------------------------------------------
  // BELLA DURMIENTE gigante
  // --------------------------------------------------

  bellaWordmark.update({
    progress:
      smoothProgress,
    exactProgress,
    elapsed,
    prefersReducedMotion:
      runtimePreferences.prefersReducedMotion,
  })


  // --------------------------------------------------
  // Niebla
  // --------------------------------------------------

  updateAtmosphere(
    elapsed,
    smoothProgress,
  )


  // --------------------------------------------------
  // Cielo nocturno
  // --------------------------------------------------

  nightSky.update({
    elapsed,
    camera,
    prefersReducedMotion:
      runtimePreferences.prefersReducedMotion,
    isDocumentVisible:
      runtimePreferences.isDocumentVisible,
  })


  // --------------------------------------------------
  // Luces
  // --------------------------------------------------

  blueFill.intensity =
    0.91 +
    Math.sin(
      elapsed *
      0.35,
    ) *
      0.045


  entranceLight.intensity =
    0.78 +
    Math.sin(
      elapsed *
      1.1,
    ) *
      0.04


  moonLight.intensity =
    2.13 +
    Math.sin(
      elapsed *
      0.18,
    ) *
      0.045


  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  renderer.render(
    scene,
    camera,
  )


  const rendererInfo =
    renderer.info


  const programCount =
    (
      rendererInfo as unknown as {
        programs?: unknown[]
      }
    ).programs?.length ??
    0


  debugPanel?.update({
    exactProgress,
    smoothProgress,
    activeChapterIndex:
      scrollDirector.activeChapterIndex,
    scrollDirection:
      scrollDirector.direction,
    cameraPosition:
      camera.position,
    cameraTarget:
      currentTarget,
    fov:
      camera.fov,
    frameTime:
      latestFrameTime,
    fps:
      latestFrameTime >
      0
        ? 1000 /
          latestFrameTime
        : 0,
    renderCalls:
      rendererInfo.render.calls,
    triangles:
      rendererInfo.render.triangles,
    textures:
      rendererInfo.memory.textures,
    programs:
      programCount,
    nightSky:
      nightSky.debugState,
  })


  scheduleAnimation()
}


let wasDocumentVisible =
  runtimePreferences.isDocumentVisible


runtimePreferences.subscribe(
  (
    runtimeState,
  ) => {

    if (
      runtimeState.isDocumentVisible ===
      wasDocumentVisible
    ) {
      return
    }


    wasDocumentVisible =
      runtimeState.isDocumentVisible


    if (
      !runtimeState.isDocumentVisible
    ) {

      if (
        animationFrameId !==
        undefined
      ) {

        cancelAnimationFrame(
          animationFrameId,
        )


        animationFrameId =
          undefined
      }


      lastFrameTime =
        undefined


      return
    }


    // Rebuild scroll state before visual interpolation resumes.
    syncExactScrollState()


    // Hidden-tab time must not become an animation delta.
    lastFrameTime =
      undefined


    scheduleAnimation()
  },
)


animate(
  performance.now(),
)


// ==================================================
// RESIZE
// ==================================================

function resize():
  void {

  const width =
    document.documentElement
      .clientWidth


  const height =
    document.documentElement
      .clientHeight


  camera.aspect =
    width /
    height


  cameraViewport.width =
    width


  cameraViewport.height =
    height


  cameraViewport.aspect =
    camera.aspect


  camera.updateProjectionMatrix()


  renderer.setSize(
    width,
    height,
    false,
  )


  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      1.8,
    ),
  )


  bellaWordmark.resize(
    cameraViewport,
  )
}


window.addEventListener(
  'resize',
  () => {

    resize()

    syncExactScrollState()

  },
)


resize()
