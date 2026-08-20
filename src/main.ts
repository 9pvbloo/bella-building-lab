import * as THREE from 'three'
import './style.css'

import { BellaBuilding } from './building/BellaBuilding'


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


scene.fog =
  new THREE.FogExp2(
    0x06101d,
    0.013,
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


/*
  IMPORTANTÍSIMO:

  La cámara ahora también forma parte de la escena.

  Esto permite colocar la luna como hija de la cámara
  y conseguir que SIEMPRE permanezca en el encuadre.
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
// ESTRELLAS
// ==================================================

function createStars():
  THREE.Points {

  const random =
    seededRandom(
      20260817,
    )


  const count =
    72


  const positions =
    new Float32Array(
      count *
      3,
    )


  for (
    let i =
      0;
    i <
      count;
    i += 1
  ) {

    const index =
      i *
      3


    positions[
      index
    ] =
      THREE.MathUtils.lerp(
        -45,
        45,
        random(),
      )


    positions[
      index +
      1
    ] =
      THREE.MathUtils.lerp(
        9,
        38,
        random(),
      )


    positions[
      index +
      2
    ] =
      THREE.MathUtils.lerp(
        -72,
        -45,
        random(),
      )

  }


  const geometry =
    new THREE.BufferGeometry()


  geometry.setAttribute(
    'position',

    new THREE.BufferAttribute(
      positions,
      3,
    ),
  )


  const material =
    new THREE.PointsMaterial({
      color:
        '#c8e7f8',

      size:
        0.055,

      transparent:
        true,

      opacity:
        0.44,

      sizeAttenuation:
        true,

      depthWrite:
        false,

      fog:
        false,
    })


  const stars =
    new THREE.Points(
      geometry,
      material,
    )


  stars.name =
    'BellaStars'


  return stars
}


const stars =
  createStars()


scene.add(
  stars,
)


// ==================================================
// LUNA · TEXTURA DEL DISCO
// ==================================================

function createMoonTexture():
  THREE.CanvasTexture {

  const moonCanvas =
    document.createElement(
      'canvas',
    )


  moonCanvas.width =
    1024


  moonCanvas.height =
    1024


  const context =
    moonCanvas.getContext(
      '2d',
    )


  if (!context) {

    throw new Error(
      'No se pudo crear textura lunar',
    )
  }


  context.clearRect(
    0,
    0,
    1024,
    1024,
  )


  // --------------------------------------------------
  // Halo interior
  // --------------------------------------------------

  const halo =
    context.createRadialGradient(
      512,
      512,
      120,

      512,
      512,
      485,
    )


  halo.addColorStop(
    0,
    'rgba(225,243,252,.25)',
  )


  halo.addColorStop(
    0.45,
    'rgba(140,196,228,.11)',
  )


  halo.addColorStop(
    1,
    'rgba(70,130,170,0)',
  )


  context.fillStyle =
    halo


  context.fillRect(
    0,
    0,
    1024,
    1024,
  )


  // --------------------------------------------------
  // Disco
  // --------------------------------------------------

  const disc =
    context.createRadialGradient(
      430,
      410,
      40,

      512,
      512,
      245,
    )


  disc.addColorStop(
    0,
    '#f6fbfc',
  )


  disc.addColorStop(
    0.48,
    '#d8e5e9',
  )


  disc.addColorStop(
    0.78,
    '#aebfc7',
  )


  disc.addColorStop(
    1,
    '#748b97',
  )


  context.beginPath()


  context.arc(
    512,
    512,
    232,
    0,
    Math.PI *
      2,
  )


  context.fillStyle =
    disc


  context.fill()


  // --------------------------------------------------
  // Detalle lunar
  // --------------------------------------------------

  const random =
    seededRandom(
      420,
    )


  for (
    let i =
      0;
    i <
      70;
    i += 1
  ) {

    const angle =
      random() *
      Math.PI *
      2


    const distance =
      Math.sqrt(
        random(),
      ) *
      195


    const x =
      512 +
      Math.cos(
        angle,
      ) *
      distance


    const y =
      512 +
      Math.sin(
        angle,
      ) *
      distance


    const radius =
      THREE.MathUtils.lerp(
        7,
        48,
        random(),
      )


    const crater =
      context.createRadialGradient(
        x -
          radius *
          0.2,

        y -
          radius *
          0.2,

        radius *
          0.1,

        x,
        y,

        radius,
      )


    crater.addColorStop(
      0,
      'rgba(72,93,103,.14)',
    )


    crater.addColorStop(
      0.55,
      'rgba(88,107,116,.07)',
    )


    crater.addColorStop(
      1,
      'rgba(80,100,110,0)',
    )


    context.fillStyle =
      crater


    context.beginPath()


    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI *
        2,
    )


    context.fill()
  }


  const texture =
    new THREE.CanvasTexture(
      moonCanvas,
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


// ==================================================
// LUNA · HALO GRANDE
// ==================================================

function createMoonHaloTexture():
  THREE.CanvasTexture {

  const haloCanvas =
    document.createElement(
      'canvas',
    )


  haloCanvas.width =
    512


  haloCanvas.height =
    512


  const context =
    haloCanvas.getContext(
      '2d',
    )


  if (!context) {

    throw new Error(
      'No se pudo crear halo lunar',
    )
  }


  const gradient =
    context.createRadialGradient(
      256,
      256,
      0,

      256,
      256,
      256,
    )


  gradient.addColorStop(
    0,
    'rgba(230,247,255,.75)',
  )


  gradient.addColorStop(
    0.14,
    'rgba(183,225,250,.42)',
  )


  gradient.addColorStop(
    0.32,
    'rgba(110,183,226,.18)',
  )


  gradient.addColorStop(
    0.58,
    'rgba(58,123,170,.075)',
  )


  gradient.addColorStop(
    1,
    'rgba(20,70,110,0)',
  )


  context.fillStyle =
    gradient


  context.fillRect(
    0,
    0,
    512,
    512,
  )


  const texture =
    new THREE.CanvasTexture(
      haloCanvas,
    )


  texture.colorSpace =
    THREE.SRGBColorSpace


  return texture
}


// ==================================================
// LUNA · RIG FIJO A CÁMARA
// ==================================================

const moonMaterial =
  new THREE.SpriteMaterial({
    map:
      createMoonTexture(),

    transparent:
      true,

    opacity:
      0.92,

    depthWrite:
      false,

    depthTest:
      true,

    fog:
      false,

    toneMapped:
      false,
  })


const moon =
  new THREE.Sprite(
    moonMaterial,
  )


const moonHaloMaterial =
  new THREE.SpriteMaterial({
    map:
      createMoonHaloTexture(),

    transparent:
      true,

    opacity:
      0.29,

    depthWrite:
      false,

    depthTest:
      true,

    blending:
      THREE.AdditiveBlending,

    fog:
      false,

    toneMapped:
      false,
  })


const moonHalo =
  new THREE.Sprite(
    moonHaloMaterial,
  )


const moonRig =
  new THREE.Group()


moonRig.name =
  'BellaMoonRig'


moonRig.add(
  moonHalo,
)


moonRig.add(
  moon,
)


camera.add(
  moonRig,
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
// WORDMARK GIGANTE
// ==================================================

function createWordTexture(
  text: string,
  fontSize: number,
  tracking: number,
): THREE.CanvasTexture {

  /*
    Resolución grande para que las letras
    se mantengan nítidas.
  */

  const wordCanvas =
    document.createElement(
      'canvas',
    )


  wordCanvas.width =
    4096


  wordCanvas.height =
    1024


  const context =
    wordCanvas.getContext(
      '2d',
    )


  if (!context) {

    throw new Error(
      'No se pudo crear Bella Wordmark',
    )
  }


  context.clearRect(
    0,
    0,
    wordCanvas.width,
    wordCanvas.height,
  )


  context.font =
    `900 ${fontSize}px Arial, Helvetica, sans-serif`


  context.textBaseline =
    'middle'


  context.textAlign =
    'left'


  const characters =
    Array.from(
      text,
    )


  const widths =
    characters.map(
      (
        character,
      ) =>
        context.measureText(
          character,
        ).width,
    )


  const totalWidth =
    widths.reduce(
      (
        accumulator,
        value,
      ) =>
        accumulator +
        value,
      0,
    ) +
    tracking *
      (
        characters.length -
        1
      )


  let cursor =
    (
      wordCanvas.width -
      totalWidth
    ) /
    2


  // --------------------------------------------------
  // Gradiente del wordmark
  // --------------------------------------------------

  const gradient =
    context.createLinearGradient(
      0,
      180,
      0,
      850,
    )


  gradient.addColorStop(
    0,
    '#f9fdff',
  )


  gradient.addColorStop(
    0.35,
    '#e9f4f8',
  )


  gradient.addColorStop(
    0.68,
    '#c5d9e1',
  )


  gradient.addColorStop(
    1,
    '#8ca2ad',
  )


  context.fillStyle =
    gradient


  context.shadowColor =
    'rgba(170,220,245,.15)'


  context.shadowBlur =
    24


  characters.forEach(
    (
      character,
      index,
    ) => {

      context.fillText(
        character,
        cursor,
        wordCanvas.height *
          0.52,
      )


      cursor +=
        widths[
          index
        ] +
        tracking

    },
  )


  const texture =
    new THREE.CanvasTexture(
      wordCanvas,
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

      renderer.capabilities
        .getMaxAnisotropy(),
    )


  return texture
}


// ==================================================
// CREAR PLANO DE PALABRA
// ==================================================

function createWordPlane(
  text: string,
  width: number,
  height: number,
  fontSize: number,
  tracking: number,
): THREE.Mesh<
  THREE.PlaneGeometry,
  THREE.MeshBasicMaterial
> {

  const material =
    new THREE.MeshBasicMaterial({
      map:
        createWordTexture(
          text,
          fontSize,
          tracking,
        ),

      transparent:
        true,

      opacity:
        0.96,

      depthWrite:
        false,

      depthTest:
        true,

      toneMapped:
        false,

      side:
        THREE.DoubleSide,
    })


  const mesh =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        height,
      ),

      material,
    )


  mesh.renderOrder =
    5


  return mesh
}


// ==================================================
// GRUPO BELLA DURMIENTE
// ==================================================

const bellaWordmark =
  new THREE.Group()


bellaWordmark.name =
  'BellaGiantWordmark'


const bellaWord =
  createWordPlane(
    'BELLA',

    15.8,

    4.0,

    680,

    68,
  )


const durmienteWord =
  createWordPlane(
    'DURMIENTE',

    18.4,

    3.15,

    520,

    24,
  )


bellaWord.position.set(
  0,
  2.0,
  0,
)


durmienteWord.position.set(
  0,
  -0.72,
  0,
)


bellaWordmark.add(
  bellaWord,
)


bellaWordmark.add(
  durmienteWord,
)


/*
   Hotel ≈ z 0
   Wordmark = z 4.35
   Cámara ≈ z 17

   Por tanto:
   texto delante del edificio.
*/

bellaWordmark.position.set(
  0,
  1.05,
  4.35,
)


scene.add(
  bellaWordmark,
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
// TEXTURA DE NIEBLA
// ==================================================

function createSoftTexture(
  innerColor: string,
  middleColor: string,
): THREE.CanvasTexture {

  const fogCanvas =
    document.createElement(
      'canvas',
    )


  fogCanvas.width =
    256


  fogCanvas.height =
    256


  const context =
    fogCanvas.getContext(
      '2d',
    )


  if (!context) {

    throw new Error(
      'No se pudo crear textura atmosférica',
    )
  }


  const gradient =
    context.createRadialGradient(
      128,
      128,
      0,

      128,
      128,
      128,
    )


  gradient.addColorStop(
    0,
    innerColor,
  )


  gradient.addColorStop(
    0.38,
    middleColor,
  )


  gradient.addColorStop(
    1,
    'rgba(0,0,0,0)',
  )


  context.fillStyle =
    gradient


  context.fillRect(
    0,
    0,
    256,
    256,
  )


  const texture =
    new THREE.CanvasTexture(
      fogCanvas,
    )


  texture.colorSpace =
    THREE.SRGBColorSpace


  return texture
}


// ==================================================
// NIEBLA
// ==================================================

type FogLayer = {

  sprite:
    THREE.Sprite

  baseX:
    number

  baseY:
    number

  speed:
    number

  amplitudeX:
    number

  amplitudeY:
    number

  baseOpacity:
    number
}


const fogLayers:
  FogLayer[] = []


const coolFogTexture =
  createSoftTexture(
    'rgba(112,170,205,.22)',
    'rgba(48,92,122,.10)',
  )


const blueFogTexture =
  createSoftTexture(
    'rgba(50,116,160,.18)',
    'rgba(20,61,92,.08)',
  )


function addFogLayer(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  opacity: number,
  speed: number,
  amplitudeX: number,
  amplitudeY: number,
  texture:
    THREE.Texture =
      coolFogTexture,
): void {

  const material =
    new THREE.SpriteMaterial({
      map:
        texture,

      color:
        '#ffffff',

      transparent:
        true,

      opacity,

      depthWrite:
        false,

      depthTest:
        true,

      blending:
        THREE.NormalBlending,
    })


  const sprite =
    new THREE.Sprite(
      material,
    )


  sprite.position.set(
    x,
    y,
    z,
  )


  sprite.scale.set(
    width,
    height,
    1,
  )


  scene.add(
    sprite,
  )


  fogLayers.push({
    sprite,

    baseX:
      x,

    baseY:
      y,

    speed,

    amplitudeX,

    amplitudeY,

    baseOpacity:
      opacity,
  })
}


// --------------------------------------------------
// Niebla entre montañas
// --------------------------------------------------

addFogLayer(
  -8,
  2.2,
  -35,
  26,
  6,
  0.12,
  0.025,
  1.1,
  0.08,
)


addFogLayer(
  10,
  1.4,
  -31,
  28,
  5,
  0.10,
  0.022,
  1.0,
  0.07,
  blueFogTexture,
)


// --------------------------------------------------
// Detrás del hotel
// --------------------------------------------------

addFogLayer(
  -4.8,
  8.2,
  -3.4,
  13,
  11,
  0.14,
  0.075,
  0.55,
  0.18,
)


addFogLayer(
  5.4,
  10.2,
  -2.8,
  15,
  12,
  0.11,
  0.06,
  0.42,
  0.2,
  blueFogTexture,
)


// --------------------------------------------------
// Laterales
// --------------------------------------------------

addFogLayer(
  -5.9,
  4.7,
  1.0,
  10,
  7,
  0.09,
  0.09,
  0.65,
  0.15,
  blueFogTexture,
)


addFogLayer(
  6.0,
  5.9,
  0.7,
  11,
  8,
  0.08,
  0.082,
  0.55,
  0.17,
)


// --------------------------------------------------
// Niebla baja
// --------------------------------------------------

addFogLayer(
  -2.8,
  1.15,
  2.0,
  10,
  3.2,
  0.11,
  0.11,
  0.8,
  0.07,
)


addFogLayer(
  3.8,
  1.0,
  1.7,
  11,
  3.0,
  0.10,
  0.085,
  0.7,
  0.06,
  blueFogTexture,
)


// ==================================================
// HALO ENTRADA
// ==================================================

const warmGlowTexture =
  createSoftTexture(
    'rgba(255,181,103,.95)',
    'rgba(255,119,52,.22)',
  )


const entranceGlowMaterial =
  new THREE.SpriteMaterial({
    map:
      warmGlowTexture,

    transparent:
      true,

    opacity:
      0.20,

    depthWrite:
      false,

    blending:
      THREE.AdditiveBlending,
  })


const entranceGlow =
  new THREE.Sprite(
    entranceGlowMaterial,
  )


entranceGlow.position.set(
  0.8,
  1.65,
  1.75,
)


entranceGlow.scale.set(
  4.2,
  3.5,
  1,
)


scene.add(
  entranceGlow,
)


// ==================================================
// HALO FRÍO FACHADA
// ==================================================

const coldGlowTexture =
  createSoftTexture(
    'rgba(94,184,235,.52)',
    'rgba(25,90,135,.12)',
  )


const coldGlowMaterial =
  new THREE.SpriteMaterial({
    map:
      coldGlowTexture,

    transparent:
      true,

    opacity:
      0.055,

    depthWrite:
      false,

    blending:
      THREE.AdditiveBlending,
  })


const facadeGlow =
  new THREE.Sprite(
    coldGlowMaterial,
  )


facadeGlow.position.set(
  0,
  8.3,
  1,
)


facadeGlow.scale.set(
  13,
  15,
  1,
)


scene.add(
  facadeGlow,
)


// ==================================================
// CÁMARAS POR CAPÍTULO
// ==================================================

type CameraState = {

  position:
    THREE.Vector3

  target:
    THREE.Vector3

  fov:
    number

  rotation:
    number
}


const cameraStates:
  CameraState[] = [

  // --------------------------------------------------
  // 00 · HERO
  // --------------------------------------------------

  {
    position:
      new THREE.Vector3(
        3.4,
        6.1,
        17.3,
      ),

    target:
      new THREE.Vector3(
        0.55,
        5.4,
        0,
      ),

    fov:
      34,

    rotation:
      THREE.MathUtils.degToRad(
        -1.5,
      ),
  },


  // --------------------------------------------------
  // 01 · EXPERIENCIA
  // --------------------------------------------------

  {
    position:
      new THREE.Vector3(
        5.2,
        6.7,
        21.5,
      ),

    target:
      new THREE.Vector3(
        0.7,
        5.1,
        0,
      ),

    fov:
      36,

    rotation:
      THREE.MathUtils.degToRad(
        -3,
      ),
  },


  // --------------------------------------------------
  // 02 · HABITACIONES
  // --------------------------------------------------

  {
    position:
      new THREE.Vector3(
        -3.2,
        7.1,
        23.5,
      ),

    target:
      new THREE.Vector3(
        0,
        5.3,
        0,
      ),

    fov:
      38,

    rotation:
      THREE.MathUtils.degToRad(
        2,
      ),
  },


  // --------------------------------------------------
  // 03 · FINAL
  // --------------------------------------------------

  {
    position:
      new THREE.Vector3(
        0,
        6.2,
        18.8,
      ),

    target:
      new THREE.Vector3(
        0,
        5.2,
        0,
      ),

    fov:
      35,

    rotation:
      0,
  },

]


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
  // Capítulo experiencia
  // --------------------------------------------------

  if (
    activeIndex ===
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
// PROGRESO SCROLL
// ==================================================

let targetChapterProgress =
  0


function calculateChapterProgress():
  void {

  const viewportCenter =
    window.scrollY +
    window.innerHeight *
      0.5


  const first =
    chapters[
      0
    ]


  const firstCenter =
    first.offsetTop +
    first.offsetHeight *
      0.5


  if (
    viewportCenter <=
    firstCenter
  ) {

    targetChapterProgress =
      0


    updateActiveChapter(
      0,
    )


    return
  }


  for (
    let i =
      0;
    i <
      chapters.length -
        1;
    i += 1
  ) {

    const current =
      chapters[
        i
      ]


    const next =
      chapters[
        i +
        1
      ]


    const currentCenter =
      current.offsetTop +
      current.offsetHeight *
        0.5


    const nextCenter =
      next.offsetTop +
      next.offsetHeight *
        0.5


    if (
      viewportCenter >=
        currentCenter &&
      viewportCenter <
        nextCenter
    ) {

      const distance =
        nextCenter -
        currentCenter


      const local =
        distance >
        0
          ? (
              viewportCenter -
              currentCenter
            ) /
            distance
          : 0


      const normalized =
        clamp(
          local,
          0,
          1,
        )


      targetChapterProgress =
        i +
        normalized


      const activeIndex =
        normalized <
          0.5
          ? i
          : i +
            1


      updateActiveChapter(
        activeIndex,
      )


      return
    }
  }


  targetChapterProgress =
    chapters.length -
    1


  updateActiveChapter(
    chapters.length -
      1,
  )
}


// ==================================================
// CÁMARA
// ==================================================

let smoothProgress =
  0


const currentPosition =
  new THREE.Vector3()


const currentTarget =
  new THREE.Vector3()


function updateCamera(
  progress: number,
): void {

  const maxIndex =
    cameraStates.length -
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
    cameraStates[
      startIndex
    ]


  const end =
    cameraStates[
      endIndex
    ]


  // --------------------------------------------------
  // Posición
  // --------------------------------------------------

  currentPosition.lerpVectors(
    start.position,
    end.position,
    eased,
  )


  camera.position.copy(
    currentPosition,
  )


  // --------------------------------------------------
  // Look target
  // --------------------------------------------------

  currentTarget.lerpVectors(
    start.target,
    end.target,
    eased,
  )


  camera.lookAt(
    currentTarget,
  )


  // --------------------------------------------------
  // FOV
  // --------------------------------------------------

  camera.fov =
    THREE.MathUtils.lerp(
      start.fov,
      end.fov,
      eased,
    )


  camera.updateProjectionMatrix()


  // --------------------------------------------------
  // Giro ligero edificio
  // --------------------------------------------------

  building.rotation.y =
    THREE.MathUtils.lerp(
      start.rotation,
      end.rotation,
      eased,
    )
}


// ==================================================
// PARALLAX FOREGROUND
// ==================================================

function updateForegroundParallax(
  progress: number,
): void {

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
// FONDO · MONTAÑAS + LUNA
// ==================================================

function updateBackgroundParallax(
  progress: number,
  elapsed: number,
): void {

  const normalized =
    clamp(
      progress /
      3,

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
  // LUNA
  //
  // Está ligada a la cámara, así que siempre
  // permanece dentro del encuadre.
  // ==================================================

  const moonDistance =
    50


  const halfHeight =
    Math.tan(
      THREE.MathUtils.degToRad(
        camera.fov *
        0.5,
      ),
    ) *
    moonDistance


  const halfWidth =
    halfHeight *
    camera.aspect


  /*
    Posición visual.

    Arriba a la izquierda,
    similar en jerarquía a Kage,
    pero con identidad azul Bella.
  */

  const moonX =
    -halfWidth *
    0.58


  const moonY =
    halfHeight *
    0.54


  moon.position.set(
    moonX +
      normalized *
      0.18,

    moonY +
      Math.sin(
        elapsed *
        0.035,
      ) *
      0.07,

    -moonDistance,
  )


  moonHalo.position.copy(
    moon.position,
  )


  // --------------------------------------------------
  // Tamaño luna
  // --------------------------------------------------

  const moonSize =
    halfHeight *
    1.08


  moon.scale.set(
    moonSize,
    moonSize,
    1,
  )


  // --------------------------------------------------
  // Halo grande
  // --------------------------------------------------

  moonHalo.scale.set(
    moonSize *
      1.85,

    moonSize *
      1.85,

    1,
  )


  // --------------------------------------------------
  // Respiración
  // --------------------------------------------------

  moonMaterial.opacity =
    0.91 +
    Math.sin(
      elapsed *
      0.09,
    ) *
      0.022


  moonHaloMaterial.opacity =
    0.29 +
    Math.sin(
      elapsed *
      0.075,
    ) *
      0.034


  // --------------------------------------------------
  // Estrellas
  // --------------------------------------------------

  stars.rotation.y =
    (
      normalized -
      0.5
    ) *
    0.006
}


// ==================================================
// WORDMARK ANIMATION
// ==================================================

function updateWordmark(
  progress: number,
): void {

  /*
    Wordmark pertenece al Hero.

    progress 0 = Hero
    progress 1 = Experiencia
  */

  const t =
    clamp(
      progress /
      0.92,

      0,

      1,
    )


  const eased =
    t *
    t *
    (
      3 -
      2 *
      t
    )


  // --------------------------------------------------
  // Movimiento hacia cámara
  // --------------------------------------------------

  bellaWordmark.position.z =
    THREE.MathUtils.lerp(
      4.35,
      6.35,
      eased,
    )


  bellaWordmark.position.y =
    THREE.MathUtils.lerp(
      1.05,
      -0.65,
      eased,
    )


  // --------------------------------------------------
  // Giro mínimo
  // --------------------------------------------------

  bellaWordmark.rotation.z =
    THREE.MathUtils.degToRad(
      THREE.MathUtils.lerp(
        0,
        -0.7,
        eased,
      ),
    )


  // --------------------------------------------------
  // Separación de palabras
  // --------------------------------------------------

  bellaWord.position.x =
    THREE.MathUtils.lerp(
      0,
      -0.42,
      eased,
    )


  durmienteWord.position.x =
    THREE.MathUtils.lerp(
      0,
      0.52,
      eased,
    )


  // --------------------------------------------------
  // Fade tardío
  // --------------------------------------------------

  const fadeStart =
    0.56


  const fade =
    clamp(
      (
        t -
        fadeStart
      ) /
      (
        1 -
        fadeStart
      ),

      0,

      1,
    )


  const fadeSmooth =
    fade *
    fade *
    (
      3 -
      2 *
      fade
    )


  const opacity =
    0.96 *
    (
      1 -
      fadeSmooth
    )


  bellaWord.material.opacity =
    opacity


  durmienteWord.material.opacity =
    opacity


  bellaWordmark.visible =
    opacity >
    0.01
}


// ==================================================
// ATMÓSFERA
// ==================================================

function updateAtmosphere(
  elapsed: number,
  progress: number,
): void {

  fogLayers.forEach(
    (
      layer,
      index,
    ) => {

      const phase =
        index *
        1.73


      layer.sprite.position.x =
        layer.baseX +
        Math.sin(
          elapsed *
          layer.speed +
          phase,
        ) *
        layer.amplitudeX


      layer.sprite.position.y =
        layer.baseY +
        Math.cos(
          elapsed *
          layer.speed *
          0.7 +
          phase,
        ) *
        layer.amplitudeY


      const distanceBoost =
        THREE.MathUtils.lerp(
          0.9,
          1.14,

          clamp(
            progress /
            2,

            0,

            1,
          ),
        )


      const material =
        layer.sprite
          .material as
          THREE.SpriteMaterial


      material.opacity =
        layer.baseOpacity *
        distanceBoost

    },
  )


  // --------------------------------------------------
  // Entrada cálida
  // --------------------------------------------------

  entranceGlowMaterial.opacity =
    0.20 +
    Math.sin(
      elapsed *
      1.15,
    ) *
      0.018


  entranceGlow.scale.set(
    4.15 +
      Math.sin(
        elapsed *
        0.78,
      ) *
        0.07,

    3.45 +
      Math.sin(
        elapsed *
        0.78,
      ) *
        0.06,

    1,
  )


  // --------------------------------------------------
  // Halo frío fachada
  // --------------------------------------------------

  coldGlowMaterial.opacity =
    0.055 +
    Math.sin(
      elapsed *
      0.32,
    ) *
      0.008
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


// ==================================================
// SCROLL
// ==================================================

function handleScroll():
  void {

  calculateChapterProgress()

  updateProgressBar()
}


window.addEventListener(
  'scroll',

  handleScroll,

  {
    passive:
      true,
  },
)


calculateChapterProgress()

updateProgressBar()


// ==================================================
// ANIMATION LOOP
// ==================================================

const clock =
  new THREE.Clock()


function animate():
  void {

  const delta =
    Math.min(
      clock.getDelta(),
      0.05,
    )


  smoothProgress =
    damp(
      smoothProgress,

      targetChapterProgress,

      4.6,

      delta,
    )


  const elapsed =
    clock.elapsedTime


  // --------------------------------------------------
  // Cámara
  // --------------------------------------------------

  updateCamera(
    smoothProgress,
  )


  // --------------------------------------------------
  // Foreground
  // --------------------------------------------------

  updateForegroundParallax(
    smoothProgress,
  )


  // --------------------------------------------------
  // Montañas / luna
  // --------------------------------------------------

  updateBackgroundParallax(
    smoothProgress,
    elapsed,
  )


  // --------------------------------------------------
  // BELLA DURMIENTE gigante
  // --------------------------------------------------

  updateWordmark(
    smoothProgress,
  )


  // --------------------------------------------------
  // Niebla
  // --------------------------------------------------

  updateAtmosphere(
    elapsed,
    smoothProgress,
  )


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


  requestAnimationFrame(
    animate,
  )
}


animate()


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


  // --------------------------------------------------
  // Responsive Wordmark
  // --------------------------------------------------

  const wordmarkScale =
    camera.aspect <
      0.8
      ? 0.40
      : camera.aspect <
          1.15
        ? 0.68
        : 1


  bellaWordmark.scale.setScalar(
    wordmarkScale,
  )
}


window.addEventListener(
  'resize',
  () => {

    resize()

    calculateChapterProgress()

  },
)


resize()