import * as THREE from 'three'


type AtmosphereLayerKind =
  | 'separationMist'
  | 'lowFog'
  | 'lateralHaze'


type AtmosphereLayer = {
  sprite: THREE.Sprite
  baseX: number
  baseY: number
  phase: number
  speed: number
  amplitudeX: number
  amplitudeY: number
  baseOpacity: number
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


/**
 * Owns Bella's atmospheric depth systems: global scene fog, separation mist,
 * low fog, lateral haze, and the existing localized architectural glows.
 */
export class Atmosphere {

  private layerCount =
    0

  private readonly layers:
    Record<
      AtmosphereLayerKind,
      AtmosphereLayer[]
    > = {
      separationMist: [],
      lowFog: [],
      lateralHaze: [],
    }

  private readonly entranceGlowMaterial:
    THREE.SpriteMaterial

  private readonly entranceGlow:
    THREE.Sprite

  private readonly coldGlowMaterial:
    THREE.SpriteMaterial


  constructor(
    scene: THREE.Scene,
  ) {

    // Global fog: broad depth separation across the full persistent world.
    scene.fog =
      new THREE.FogExp2(
        0x122433,
        0.0095,
      )


    const coolFogTexture =
      createSoftTexture(
        'rgba(237,247,250,.26)',
        'rgba(157,187,199,.12)',
      )


    const blueFogTexture =
      createSoftTexture(
        'rgba(187,218,232,.18)',
        'rgba(77,118,145,.09)',
      )


    // Separation mist: between mountain layers and around the hotel silhouette.
    this.addLayer(
      scene,
      'separationMist',
      -8,
      2.2,
      -35,
      26,
      6,
      0.12,
      0.025,
      1.1,
      0.08,
      coolFogTexture,
    )


    this.addLayer(
      scene,
      'separationMist',
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


    this.addLayer(
      scene,
      'separationMist',
      -4.8,
      8.2,
      -3.4,
      13,
      11,
      0.14,
      0.075,
      0.55,
      0.18,
      coolFogTexture,
    )


    this.addLayer(
      scene,
      'separationMist',
      5.4,
      10.2,
      -2.8,
      15,
      12,
      0.12,
      0.06,
      0.42,
      0.2,
      blueFogTexture,
    )


    // Lateral haze: restrained frame depth without new visual objects.
    this.addLayer(
      scene,
      'lateralHaze',
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


    this.addLayer(
      scene,
      'lateralHaze',
      6.0,
      5.9,
      0.7,
      11,
      8,
      0.08,
      0.082,
      0.55,
      0.17,
      coolFogTexture,
    )


    // Low fog: grounds the hotel base while leaving the entrance readable.
    this.addLayer(
      scene,
      'lowFog',
      -2.8,
      1.15,
      2.0,
      10,
      3.2,
      0.10,
      0.11,
      0.8,
      0.07,
      coolFogTexture,
    )


    this.addLayer(
      scene,
      'lowFog',
      3.8,
      1.0,
      1.7,
      11,
      3.0,
      0.09,
      0.085,
      0.7,
      0.06,
      blueFogTexture,
    )


    const warmGlowTexture =
      createSoftTexture(
        'rgba(255,228,184,.8)',
        'rgba(236,176,111,.17)',
      )


    this.entranceGlowMaterial =
      new THREE.SpriteMaterial({
        map:
          warmGlowTexture,

        transparent:
          true,

        opacity:
          0.22,

        depthWrite:
          false,

        blending:
          THREE.AdditiveBlending,
      })


    this.entranceGlow =
      new THREE.Sprite(
        this.entranceGlowMaterial,
      )


    this.entranceGlow.name =
      'BellaEntranceGlow'


    this.entranceGlow.position.set(
      0.8,
      1.65,
      1.75,
    )


    this.entranceGlow.scale.set(
      4.2,
      3.5,
      1,
    )


    scene.add(
      this.entranceGlow,
    )


    const coldGlowTexture =
      createSoftTexture(
        'rgba(239,249,255,.38)',
        'rgba(143,187,211,.10)',
      )


    this.coldGlowMaterial =
      new THREE.SpriteMaterial({
        map:
          coldGlowTexture,

        transparent:
          true,

        opacity:
          0.085,

        depthWrite:
          false,

        blending:
          THREE.AdditiveBlending,
      })


    const facadeGlow =
      new THREE.Sprite(
        this.coldGlowMaterial,
      )


    facadeGlow.name =
      'BellaFacadeGlow'


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
  }


  update(
    elapsed: number,
    progress: number,
    prefersReducedMotion: boolean,
  ): void {

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


    Object.values(
      this.layers,
    ).forEach(
      (
        layers,
      ) => {

        layers.forEach(
          (
            layer,
          ) => {

            if (
              prefersReducedMotion
            ) {

              layer.sprite.position.set(
                layer.baseX,
                layer.baseY,
                layer.sprite.position.z,
              )
            } else {

              layer.sprite.position.x =
                layer.baseX +
                Math.sin(
                  elapsed *
                  layer.speed +
                  layer.phase,
                ) *
                layer.amplitudeX


              layer.sprite.position.y =
                layer.baseY +
                Math.cos(
                  elapsed *
                  layer.speed *
                  0.7 +
                  layer.phase,
                ) *
                layer.amplitudeY
            }


            const material =
              layer.sprite
                .material as
                THREE.SpriteMaterial


            material.opacity =
              layer.baseOpacity *
              distanceBoost
          },
        )
      },
    )


    // Existing localized warmth remains the human visual anchor.
    this.entranceGlowMaterial.opacity =
      0.22 +
      Math.sin(
        elapsed *
        1.15,
      ) *
      0.018


    this.entranceGlow.scale.set(
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


    this.coldGlowMaterial.opacity =
      0.085 +
      Math.sin(
        elapsed *
        0.32,
      ) *
      0.008
  }


  private addLayer(
    scene: THREE.Scene,
    kind: AtmosphereLayerKind,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    opacity: number,
    speed: number,
    amplitudeX: number,
    amplitudeY: number,
    texture: THREE.Texture,
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


    sprite.name =
      `Bella${
        kind[0]
          .toUpperCase() +
        kind.slice(
          1,
        )
      }`


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


    this.layers[
      kind
    ].push({
      sprite,
      baseX:
        x,
      baseY:
        y,
      phase:
        this.layerCount *
        1.73,
      speed,
      amplitudeX,
      amplitudeY,
      baseOpacity:
        opacity,
    })


    this.layerCount +=
      1
  }
}
