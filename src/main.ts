import * as THREE from 'three'
import './style.css'

import { BellaBuilding } from './building/BellaBuilding'

// ==================================================
// BELLA DURMIENTE
// BUILDING SCROLL EXPERIENCE
// ==================================================

const app =
  document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('No se encontró #app')
}


// ==================================================
// ESCENA
// ==================================================

const scene =
  new THREE.Scene()

scene.background =
  new THREE.Color('#eaf6ff')


// ==================================================
// CÁMARA
// ==================================================

const camera =
  new THREE.PerspectiveCamera(
    35,
    window.innerWidth /
      window.innerHeight,
    0.1,
    100,
  )


// ==================================================
// RENDERER
// ==================================================

const renderer =
  new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  })

renderer.setSize(
  window.innerWidth,
  window.innerHeight,
)

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2,
  ),
)

renderer.shadowMap.enabled = true

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap

renderer.outputColorSpace =
  THREE.SRGBColorSpace

app.appendChild(
  renderer.domElement,
)


// ==================================================
// LUCES
// ==================================================

const hemisphereLight =
  new THREE.HemisphereLight(
    '#eaf6ff',
    '#071b3a',
    1.65,
  )

scene.add(
  hemisphereLight,
)


const mainLight =
  new THREE.DirectionalLight(
    '#ffffff',
    3.2,
  )

mainLight.position.set(
  -5,
  9,
  7,
)

mainLight.castShadow = true

mainLight.shadow.mapSize.set(
  2048,
  2048,
)

scene.add(
  mainLight,
)


const blueLight =
  new THREE.DirectionalLight(
    '#4daee8',
    1.15,
  )

blueLight.position.set(
  6,
  6,
  4,
)

scene.add(
  blueLight,
)


// ==================================================
// BELLA DURMIENTE
// ==================================================

const building =
  new BellaBuilding()

scene.add(
  building,
)


// ==================================================
// SUELO
// ==================================================

const floor =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      50,
      50,
    ),

    new THREE.MeshStandardMaterial({
      color: '#dceaf3',
      roughness: 0.95,
    }),
  )

floor.rotation.x =
  -Math.PI / 2

floor.position.y = 0

floor.receiveShadow = true

scene.add(
  floor,
)


// ==================================================
// ELEMENTOS HTML
// ==================================================

const storyOne =
  document.querySelector<HTMLElement>(
    '#storyOne',
  )

const storyTwo =
  document.querySelector<HTMLElement>(
    '#storyTwo',
  )


// ==================================================
// KEYFRAMES
// ==================================================

type BellaKeyframe = {
  t: number

  position:
    THREE.Vector3

  target:
    THREE.Vector3

  fov: number

  buildingRotation: number
}


const keyframes: BellaKeyframe[] = [

  // ----------------------------------------------
  // 0 %
  // Bella completa
  // ----------------------------------------------

  {
    t: 0,

    position:
      new THREE.Vector3(
        0,
        5.9,
        18.8,
      ),

    target:
      new THREE.Vector3(
        0,
        5.4,
        0,
      ),

    fov: 35,

    buildingRotation: 0,
  },


  // ----------------------------------------------
  // 15 %
  // Primer acercamiento
  // ----------------------------------------------

  {
    t: 0.15,

    position:
      new THREE.Vector3(
        -0.3,
        5.8,
        13.8,
      ),

    target:
      new THREE.Vector3(
        0,
        5.2,
        0,
      ),

    fov: 34,

    buildingRotation:
      THREE.MathUtils.degToRad(
        1.5,
      ),
  },


  // ----------------------------------------------
  // 28 %
  // Se ALEJA.
  // Dejamos espacio izquierda para historia 01.
  // ----------------------------------------------

  {
    t: 0.28,

    position:
      new THREE.Vector3(
        1.5,
        6.2,
        21.5,
      ),

    target:
      new THREE.Vector3(
        -1.45,
        5.1,
        0,
      ),

    fov: 34,

    buildingRotation:
      THREE.MathUtils.degToRad(
        -2.5,
      ),
  },


  // ----------------------------------------------
  // 40 %
  // Mantiene composición historia 01
  // ----------------------------------------------

  {
    t: 0.40,

    position:
      new THREE.Vector3(
        1.1,
        6.0,
        19.8,
      ),

    target:
      new THREE.Vector3(
        -1.3,
        5.0,
        0,
      ),

    fov: 34,

    buildingRotation:
      THREE.MathUtils.degToRad(
        -2,
      ),
  },


  // ----------------------------------------------
  // 53 %
  // Vuelve hacia Bella
  // ----------------------------------------------

  {
    t: 0.53,

    position:
      new THREE.Vector3(
        0.3,
        5.55,
        11.2,
      ),

    target:
      new THREE.Vector3(
        0.1,
        4.9,
        0,
      ),

    fov: 35,

    buildingRotation:
      THREE.MathUtils.degToRad(
        -1,
      ),
  },


  // ----------------------------------------------
  // 64 %
  // Pasa muy cerca
  // ----------------------------------------------

  {
    t: 0.64,

    position:
      new THREE.Vector3(
        -0.8,
        5.3,
        9.2,
      ),

    target:
      new THREE.Vector3(
        0.45,
        4.7,
        0,
      ),

    fov: 36,

    buildingRotation:
      THREE.MathUtils.degToRad(
        2,
      ),
  },


  // ----------------------------------------------
  // 75 %
  // Se ALEJA al otro lado.
  // Dejamos espacio derecha para historia 02.
  // ----------------------------------------------

  {
    t: 0.75,

    position:
      new THREE.Vector3(
        -1.8,
        6.1,
        21.8,
      ),

    target:
      new THREE.Vector3(
        1.5,
        5.0,
        0,
      ),

    fov: 34,

    buildingRotation:
      THREE.MathUtils.degToRad(
        2.5,
      ),
  },


  // ----------------------------------------------
  // 85 %
  // Mantiene historia 02
  // ----------------------------------------------

  {
    t: 0.85,

    position:
      new THREE.Vector3(
        -1.3,
        6,
        19.4,
      ),

    target:
      new THREE.Vector3(
        1.3,
        5,
        0,
      ),

    fov: 34,

    buildingRotation:
      THREE.MathUtils.degToRad(
        2,
      ),
  },


  // ----------------------------------------------
  // 100 %
  // Regresa al edificio
  // ----------------------------------------------

  {
    t: 1,

    position:
      new THREE.Vector3(
        0,
        5.8,
        17.8,
      ),

    target:
      new THREE.Vector3(
        0,
        5.2,
        0,
      ),

    fov: 35,

    buildingRotation: 0,
  },
]


// ==================================================
// INTERPOLACIÓN
// ==================================================

const cameraTarget =
  new THREE.Vector3()


function smoothStep(
  value: number,
): number {

  return (
    value *
    value *
    (
      3 -
      2 * value
    )
  )
}


function updateScene(
  progress: number,
) {

  let start =
    keyframes[0]

  let end =
    keyframes[
      keyframes.length - 1
    ]


  for (
    let i = 0;
    i < keyframes.length - 1;
    i += 1
  ) {

    if (
      progress >=
        keyframes[i].t &&
      progress <=
        keyframes[i + 1].t
    ) {

      start =
        keyframes[i]

      end =
        keyframes[i + 1]

      break
    }
  }


  const range =
    end.t -
    start.t


  const localProgress =
    range > 0
      ? (
          progress -
          start.t
        ) / range
      : 0


  const eased =
    smoothStep(
      THREE.MathUtils.clamp(
        localProgress,
        0,
        1,
      ),
    )


  // ----------------------------------------------
  // Cámara
  // ----------------------------------------------

  camera.position.lerpVectors(
    start.position,
    end.position,
    eased,
  )


  cameraTarget.lerpVectors(
    start.target,
    end.target,
    eased,
  )


  camera.lookAt(
    cameraTarget,
  )


  // ----------------------------------------------
  // FOV
  // ----------------------------------------------

  camera.fov =
    THREE.MathUtils.lerp(
      start.fov,
      end.fov,
      eased,
    )

  camera.updateProjectionMatrix()


  // ----------------------------------------------
  // Rotación edificio
  // ----------------------------------------------

  building.rotation.y =
    THREE.MathUtils.lerp(
      start.buildingRotation,
      end.buildingRotation,
      eased,
    )


  // ----------------------------------------------
  // Luz
  // ----------------------------------------------

  mainLight.position.x =
    THREE.MathUtils.lerp(
      -5,
      -2,
      progress,
    )


  blueLight.intensity =
    THREE.MathUtils.lerp(
      1.05,
      1.45,
      progress,
    )
}


// ==================================================
// STORY FADE
// ==================================================

function getStoryOpacity(
  progress: number,
  start: number,
  fadeInEnd: number,
  fadeOutStart: number,
  end: number,
): number {

  if (
    progress <= start ||
    progress >= end
  ) {
    return 0
  }


  if (
    progress <
    fadeInEnd
  ) {

    const value =
      (
        progress -
        start
      ) /
      (
        fadeInEnd -
        start
      )

    return smoothStep(
      THREE.MathUtils.clamp(
        value,
        0,
        1,
      ),
    )
  }


  if (
    progress <=
    fadeOutStart
  ) {
    return 1
  }


  const value =
    (
      progress -
      fadeOutStart
    ) /
    (
      end -
      fadeOutStart
    )


  return (
    1 -
    smoothStep(
      THREE.MathUtils.clamp(
        value,
        0,
        1,
      ),
    )
  )
}


function updateStory(
  progress: number,
) {

  // ----------------------------------------------
  // STORY 01
  // ----------------------------------------------

  const storyOneOpacity =
    getStoryOpacity(
      progress,
      0.22,
      0.28,
      0.39,
      0.46,
    )


  if (storyOne) {

    storyOne.style.opacity =
      storyOneOpacity.toFixed(3)


    storyOne.style.transform =
      `translate3d(
        0,
        ${
          THREE.MathUtils.lerp(
            30,
            0,
            storyOneOpacity,
          )
        }px,
        0
      )`
  }


  // ----------------------------------------------
  // STORY 02
  // ----------------------------------------------

  const storyTwoOpacity =
    getStoryOpacity(
      progress,
      0.70,
      0.76,
      0.85,
      0.92,
    )


  if (storyTwo) {

    storyTwo.style.opacity =
      storyTwoOpacity.toFixed(3)


    storyTwo.style.transform =
      `translate3d(
        0,
        ${
          THREE.MathUtils.lerp(
            30,
            0,
            storyTwoOpacity,
          )
        }px,
        0
      )`
  }
}


// ==================================================
// SCROLL
// ==================================================

let targetProgress = 0
let currentProgress = 0


function updateScrollProgress() {

  const maxScroll =
    document.documentElement.scrollHeight -
    window.innerHeight


  if (
    maxScroll <= 0
  ) {

    targetProgress = 0

    return
  }


  targetProgress =
    THREE.MathUtils.clamp(
      window.scrollY /
        maxScroll,
      0,
      1,
    )
}


window.addEventListener(
  'scroll',
  updateScrollProgress,
  {
    passive: true,
  },
)


updateScrollProgress()


// ==================================================
// LOOP
// ==================================================

function animate() {

  currentProgress +=
    (
      targetProgress -
      currentProgress
    ) *
    0.045


  updateScene(
    currentProgress,
  )


  updateStory(
    currentProgress,
  )


  renderer.render(
    scene,
    camera,
  )


  requestAnimationFrame(
    animate,
  )
}


animate()


// ==================================================
// RESPONSIVE
// ==================================================

window.addEventListener(
  'resize',
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight


    camera.updateProjectionMatrix()


    renderer.setSize(
      window.innerWidth,
      window.innerHeight,
    )


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2,
      ),
    )
  },
)