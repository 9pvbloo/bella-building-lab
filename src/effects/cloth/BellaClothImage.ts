import type { BellaClothPreset } from './BellaClothPreset'


export interface BellaClothImageOptions {
  container: HTMLElement
  image: HTMLImageElement
  preset: BellaClothPreset
  sdfEdgeEnabled?: boolean
  perimeterIdleEnabled?: boolean
  contactShadowEnabled?: boolean
  edgeInfluenceEnabled?: boolean
}


type ClothConfig = BellaClothPreset


interface ClothPointer {
  isInside: boolean
  hasPosition: boolean
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  pressure: number
  lastEventTime: number
}


interface GpuResources {
  program: WebGLProgram
  positionBuffer: WebGLBuffer
  normalBuffer: WebGLBuffer
  indexBuffer: WebGLBuffer
  texture: WebGLTexture
  positionLocation: number
  normalLocation: number
  resolutionLocation: WebGLUniformLocation
  textureWindowLocation: WebGLUniformLocation
  lightLocation: WebGLUniformLocation
  sheenLocation: WebGLUniformLocation
  shadowLocation: WebGLUniformLocation
  edgeTensionLocation: WebGLUniformLocation
  edgeMotionLocation: WebGLUniformLocation
  frameSizeLocation: WebGLUniformLocation
  renderSizeLocation: WebGLUniformLocation
  frameOriginLocation: WebGLUniformLocation
  sdfEdgeEnabledLocation: WebGLUniformLocation
  cornerRadiusLocation: WebGLUniformLocation
  contactShadow: ContactShadowGpuResources | null
}


interface ContactShadowGpuResources {
  program: WebGLProgram
  edgeTensionLocation: WebGLUniformLocation
  edgeMotionLocation: WebGLUniformLocation
  frameSizeLocation: WebGLUniformLocation
  renderSizeLocation: WebGLUniformLocation
  frameOriginLocation: WebGLUniformLocation
  cornerRadiusLocation: WebGLUniformLocation
  baseOffsetLocation: WebGLUniformLocation
  liftOffsetLocation: WebGLUniformLocation
  expansionLocation: WebGLUniformLocation
  liftExpansionLocation: WebGLUniformLocation
  opacityLocation: WebGLUniformLocation
  softnessLocation: WebGLUniformLocation
  liftSoftnessLocation: WebGLUniformLocation
  opacityFalloffLocation: WebGLUniformLocation
}


const shader = (
  lines: string[],
): string => lines.join('\n')


const ROUNDED_FRAME_DISTANCE = shader([
  'float roundedFrameDistance(vec2 localPosition, vec2 frameSize, float radius) {',
  '  vec2 center = frameSize * 0.5;',
  '  vec2 innerExtent = max(center - vec2(radius), vec2(0.0));',
  '  vec2 cornerVector = abs(localPosition - center) - innerExtent;',
  '  return length(max(cornerVector, 0.0)) + min(max(cornerVector.x, cornerVector.y), 0.0) - radius;',
  '}',
])


const CONTACT_SHADOW = {
  baseOffsetX: 0.35,
  baseOffsetY: 2.35,
  liftOffsetX: 0.18,
  liftOffsetY: 1.45,
  expansion: 1.25,
  liftExpansion: 0.8,
  opacity: 0.145,
  softness: 3.2,
  liftSoftness: 3.1,
  opacityFalloff: 0.24,
} as const


const EDGE_INFLUENCE_CENTER = 0.18
const EDGE_INFLUENCE_RANGE = 1 - EDGE_INFLUENCE_CENTER


const VERTEX_SHADER = shader([
  '#version 300 es',
  'precision highp float;',
  'layout(location = 0) in vec3 aPosition;',
  'layout(location = 1) in vec3 aNormal;',
  'uniform float uEdgeTension;',
  'uniform float uEdgeMotion;',
  'uniform vec2 uFrameSize;',
  'uniform vec2 uRenderSize;',
  'uniform vec2 uFrameOrigin;',
  'out vec2 vUv;',
  'out vec2 vLocalPosition;',
  'out vec3 vNormal;',
  'out float vHeight;',
  'out float vPerimeter;',
  'void main() {',
  '  vUv = aPosition.xy;',
  '  vLocalPosition = aPosition.xy * uFrameSize;',
  '  vNormal = aNormal;',
  '  vHeight = aPosition.z;',
  '  vec2 centered = aPosition.xy - 0.5;',
  '  float perspective = clamp(1.0 - aPosition.z * 0.00105, 0.988, 1.012);',
  '  float looseEdge = smoothstep(0.02, 0.2, aPosition.y);',
  '  float foldPull = (0.024 + min(abs(aPosition.z) * 0.0016, 0.025)) * looseEdge;',
  '  float sideDistance = min(aPosition.x, 1.0 - aPosition.x);',
  '  float sideEdge = 1.0 - smoothstep(0.0, 0.16, sideDistance);',
  '  float bottomEdge = smoothstep(0.64, 1.0, aPosition.y);',
  '  float perimeter = max(sideEdge * (0.45 + aPosition.y * 0.55), bottomEdge * 0.82);',
  '  float edgeBend = perimeter * min(abs(aPosition.z) * 0.0015, 0.02) * uEdgeMotion;',
  '  vec2 contour = vec2(sign(centered.x) * sideEdge * edgeBend * (0.48 + uEdgeTension * 0.32), bottomEdge * edgeBend * 0.72);',
  '  float heightFlow = clamp(aPosition.z / 18.0, -0.75, 0.75) * looseEdge;',
  '  vec2 weaveFlow = vec2(heightFlow * 0.006, -heightFlow * 0.004);',
  '  vec2 position = centered * perspective + vec2(aNormal.x, -aNormal.y) * foldPull + contour + weaveFlow;',
  '  vPerimeter = perimeter;',
  '  vec2 deformation = position - centered;',
  '  vec2 canvasPosition = (aPosition.xy + deformation) * uFrameSize + uFrameOrigin;',
  '  vec2 clipPosition = vec2(canvasPosition.x / uRenderSize.x * 2.0 - 1.0, 1.0 - canvasPosition.y / uRenderSize.y * 2.0);',
  '  gl_Position = vec4(clipPosition, -aPosition.z / 820.0, 1.0);',
  '}',
])


const CONTACT_SHADOW_VERTEX_SHADER = shader([
  '#version 300 es',
  'precision highp float;',
  'layout(location = 0) in vec3 aPosition;',
  'layout(location = 1) in vec3 aNormal;',
  'uniform float uEdgeTension;',
  'uniform float uEdgeMotion;',
  'uniform vec2 uFrameSize;',
  'uniform vec2 uRenderSize;',
  'uniform vec2 uFrameOrigin;',
  'uniform vec2 uShadowBaseOffset;',
  'uniform vec2 uShadowLiftOffset;',
  'uniform float uShadowExpansion;',
  'uniform float uShadowLiftExpansion;',
  'out vec2 vLocalPosition;',
  'out float vLift;',
  'void main() {',
  '  vLocalPosition = aPosition.xy * uFrameSize;',
  '  vLift = clamp(abs(aPosition.z) / 16.0, 0.0, 1.0);',
  '  vec2 centered = aPosition.xy - 0.5;',
  '  float perspective = clamp(1.0 - aPosition.z * 0.00105, 0.988, 1.012);',
  '  float looseEdge = smoothstep(0.02, 0.2, aPosition.y);',
  '  float foldPull = (0.024 + min(abs(aPosition.z) * 0.0016, 0.025)) * looseEdge;',
  '  float sideDistance = min(aPosition.x, 1.0 - aPosition.x);',
  '  float sideEdge = 1.0 - smoothstep(0.0, 0.16, sideDistance);',
  '  float bottomEdge = smoothstep(0.64, 1.0, aPosition.y);',
  '  float perimeter = max(sideEdge * (0.45 + aPosition.y * 0.55), bottomEdge * 0.82);',
  '  float edgeBend = perimeter * min(abs(aPosition.z) * 0.0015, 0.02) * uEdgeMotion;',
  '  vec2 contour = vec2(sign(centered.x) * sideEdge * edgeBend * (0.48 + uEdgeTension * 0.32), bottomEdge * edgeBend * 0.72);',
  '  float heightFlow = clamp(aPosition.z / 18.0, -0.75, 0.75) * looseEdge;',
  '  vec2 weaveFlow = vec2(heightFlow * 0.006, -heightFlow * 0.004);',
  '  vec2 clothPosition = centered * perspective + vec2(aNormal.x, -aNormal.y) * foldPull + contour + weaveFlow;',
  '  float expansion = uShadowExpansion + vLift * uShadowLiftExpansion;',
  '  vec2 shadowOffset = uShadowBaseOffset + vLift * uShadowLiftOffset;',
  '  vec2 shadowPosition = clothPosition + vec2(centered.x * expansion / max(uFrameSize.x, 1.0), centered.y * expansion / max(uFrameSize.y, 1.0)) + shadowOffset / max(uFrameSize, vec2(1.0));',
  '  vec2 canvasPosition = (shadowPosition + 0.5) * uFrameSize + uFrameOrigin;',
  '  vec2 clipPosition = vec2(canvasPosition.x / uRenderSize.x * 2.0 - 1.0, 1.0 - canvasPosition.y / uRenderSize.y * 2.0);',
  '  gl_Position = vec4(clipPosition, 0.0, 1.0);',
  '}',
])


const CONTACT_SHADOW_FRAGMENT_SHADER = shader([
  '#version 300 es',
  'precision highp float;',
  'in vec2 vLocalPosition;',
  'in float vLift;',
  'uniform vec2 uFrameSize;',
  'uniform float uCornerRadius;',
  'uniform float uShadowOpacity;',
  'uniform float uShadowSoftness;',
  'uniform float uShadowLiftSoftness;',
  'uniform float uShadowOpacityFalloff;',
  'out vec4 outColor;',
  ROUNDED_FRAME_DISTANCE,
  'void main() {',
  '  float edgeDistance = roundedFrameDistance(vLocalPosition, uFrameSize, uCornerRadius);',
  '  float antialiasWidth = max(fwidth(edgeDistance), 0.75);',
  '  float softness = uShadowSoftness + vLift * uShadowLiftSoftness;',
  '  float alpha = smoothstep(softness + antialiasWidth, -antialiasWidth, edgeDistance);',
  '  float opacity = uShadowOpacity * (1.0 - vLift * uShadowOpacityFalloff);',
  '  outColor = vec4(vec3(0.055, 0.082, 0.118), alpha * opacity);',
  '}',
])


const FRAGMENT_SHADER = shader([
  '#version 300 es',
  'precision highp float;',
  'in vec2 vUv;',
  'in vec2 vLocalPosition;',
  'in vec3 vNormal;',
  'in float vHeight;',
  'in float vPerimeter;',
  'uniform sampler2D uImage;',
  'uniform vec2 uTextureWindow;',
  'uniform float uLight;',
  'uniform float uSheen;',
  'uniform float uShadow;',
  'uniform float uEdgeTension;',
  'uniform float uEdgeMotion;',
  'uniform vec2 uFrameSize;',
  'uniform float uSdfEdgeEnabled;',
  'uniform float uCornerRadius;',
  'out vec4 outColor;',
  ROUNDED_FRAME_DISTANCE,
  'void main() {',
  '  vec3 normal = normalize(vNormal);',
  '  vec2 imageUv = (vUv - 0.5) * uTextureWindow + 0.5;',
  '  float looseEdge = smoothstep(0.02, 0.2, vUv.y);',
  '  float foldShift = (0.01 + min(abs(vHeight) * 0.0012, 0.018)) * looseEdge;',
  '  imageUv += vec2(normal.x, -normal.y) * foldShift;',
  '  imageUv = clamp(imageUv, vec2(0.001), vec2(0.999));',
  '  vec3 photo = texture(uImage, imageUv).rgb;',
  '  vec3 lightDirection = normalize(vec3(-0.28, -0.42, 0.86));',
  '  float flatDiffuse = 0.72 + 0.28 * max(lightDirection.z, 0.0);',
  '  float foldDiffuse = 0.72 + 0.28 * max(dot(normal, lightDirection), 0.0);',
  '  float foldShadow = 1.0 - uShadow * (1.0 - normal.z) * 0.52;',
  '  float shading = mix(1.0, (foldDiffuse / flatDiffuse) * foldShadow, uLight);',
  '  vec3 halfVector = normalize(lightDirection + vec3(0.0, 0.0, 1.0));',
  '  float flatSheen = pow(max(halfVector.z, 0.0), 32.0);',
  '  float foldSheen = pow(max(dot(normal, halfVector), 0.0), 32.0);',
  '  float sheen = max(foldSheen - flatSheen, 0.0) / max(1.0 - flatSheen, 0.001);',
  '  vec3 lit = photo * shading + mix(vec3(1.0), photo, 0.55) * sheen * uSheen;',
  '  float edgeShadow = vPerimeter * (1.0 - normal.z) * uEdgeTension * 0.3;',
  '  float edgeSheen = smoothstep(0.68, 1.0, vPerimeter) * max(normal.x * normal.x + normal.y * normal.y, 0.0) * uEdgeMotion;',
  '  lit = lit * (1.0 - edgeShadow) + mix(vec3(1.0), photo, 0.7) * edgeSheen * 0.05;',
  '  float alpha = 1.0;',
  '  if (uSdfEdgeEnabled > 0.5) {',
  '    float edgeDistance = roundedFrameDistance(vLocalPosition, uFrameSize, uCornerRadius);',
  '    float antialiasWidth = max(fwidth(edgeDistance), 0.75);',
  '    float interiorDistance = max(-edgeDistance, 0.0);',
  '    float hemWidth = max(0.85, antialiasWidth * 1.15);',
  '    float hem = 1.0 - smoothstep(hemWidth, hemWidth * 2.1, interiorDistance);',
  '    float foldFacing = 1.0 - normal.z;',
  '    vec3 hemLight = mix(vec3(1.0), photo, 0.72);',
  '    alpha = smoothstep(antialiasWidth, -antialiasWidth, edgeDistance);',
  '    lit += hemLight * hem * (0.018 + foldFacing * 0.045);',
  '  }',
  '  outColor = vec4(clamp(lit, 0.0, 1.0), alpha);',
  '}',
])


/**
 * Direct-image WebGL2 cloth renderer ported from Bella's approved gallery.
 * The original HTML image stays behind the canvas for fallback and teardown.
 */
export class BellaClothImage {
  private readonly container: HTMLElement
  private readonly image: HTMLImageElement
  private readonly canvas: HTMLCanvasElement
  private readonly sdfEdgeEnabled: boolean
  private readonly perimeterIdleEnabled: boolean
  private readonly contactShadowEnabled: boolean
  private readonly edgeInfluenceEnabled: boolean
  private config: ClothConfig
  private gl: WebGL2RenderingContext | null = null
  private gpu: GpuResources | null = null
  private heights = new Float32Array()
  private velocities = new Float32Array()
  private positions = new Float32Array()
  private normals = new Float32Array()
  private indices = new Uint16Array()
  private nodeColumns = 0
  private indexCount = 0
  private frameId = 0
  private previousTime = 0
  private frameWidth = 0
  private frameHeight = 0
  private renderWidth = 0
  private renderHeight = 0
  private sdfBleed = 0
  private wantsToRun = false
  private isVisible = false
  private isInitialized = false
  private pointer: ClothPointer = {
    isInside: false,
    hasPosition: false,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    speed: 0,
    pressure: 0,
    lastEventTime: 0,
  }
  private readonly resizeObserver: ResizeObserver
  private readonly intersectionObserver: IntersectionObserver

  public constructor({
    container,
    image,
    preset,
    sdfEdgeEnabled = false,
    perimeterIdleEnabled = false,
    contactShadowEnabled = false,
    edgeInfluenceEnabled = false,
  }: BellaClothImageOptions) {
    this.container = container
    this.image = image
    this.config = { ...preset }
    this.sdfEdgeEnabled = sdfEdgeEnabled
    this.perimeterIdleEnabled = perimeterIdleEnabled
    this.contactShadowEnabled = contactShadowEnabled
    this.edgeInfluenceEnabled = edgeInfluenceEnabled
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'bella-cloth-image-canvas'

    if (this.sdfEdgeEnabled) {
      this.canvas.classList.add('bella-cloth-image-canvas--sdf-edge')
    }

    this.canvas.setAttribute('aria-hidden', 'true')
    this.canvas.style.position = 'absolute'
    this.canvas.style.display = 'block'
    this.canvas.style.pointerEvents = 'none'
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries.find((candidate) => candidate.target === this.image)

      if (entry !== undefined) {
        this.resize(entry.contentRect.width, entry.contentRect.height)
      }
    })
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries.some((entry) => entry.isIntersecting)
        this.syncRenderLoop()
      },
      { threshold: 0.08 },
    )
  }

  public async init(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    await this.ensureImageReady()

    const gl = this.canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      depth: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    })

    if (gl === null) {
      throw new Error('WebGL2 is not available for Bella Cloth.')
    }

    this.gl = gl
    this.gpu = this.createGpuResources(gl)
    this.buildMesh()
    this.uploadTexture()
    this.container.append(this.canvas)
    this.resizeObserver.observe(this.image)
    this.intersectionObserver.observe(this.container)
    this.container.addEventListener('pointermove', this.handlePointerMove, { passive: true })
    this.container.addEventListener('pointerleave', this.handlePointerLeave, { passive: true })
    document.addEventListener('visibilitychange', this.handleDocumentVisibility)
    this.isInitialized = true
    this.container.classList.add('is-bella-cloth-ready')

    if (this.sdfEdgeEnabled) {
      this.container.classList.add('is-bella-cloth-sdf-edge')
    }

    this.resize()
  }

  public start(): void {
    this.wantsToRun = true
    this.syncRenderLoop()
  }

  public stop(): void {
    this.wantsToRun = false
    this.stopRenderLoop()
  }

  public resize(
    observedWidth?: number,
    observedHeight?: number,
  ): void {
    if (!this.isInitialized || this.gl === null) {
      return
    }

    const width = Math.max(1, Math.round(observedWidth ?? this.image.clientWidth))
    const height = Math.max(1, Math.round(observedHeight ?? this.image.clientHeight))
    const dpr = Math.min(window.devicePixelRatio || 1, this.config.maxDpr)
    const bleed = this.getSdfBleed()
    const renderWidth = width + bleed * 2
    const renderHeight = height + bleed * 2
    const canvasWidth = Math.round(renderWidth * dpr)
    const canvasHeight = Math.round(renderHeight * dpr)

    this.frameWidth = width
    this.frameHeight = height
    this.renderWidth = renderWidth
    this.renderHeight = renderHeight
    this.sdfBleed = bleed

    if (this.canvas.width !== canvasWidth || this.canvas.height !== canvasHeight) {
      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight
      this.gl.viewport(0, 0, canvasWidth, canvasHeight)
    }

    this.updateNormals()
    this.updateTextureWindow()
    this.render()
  }

  public setOptions(
    options: Partial<BellaClothPreset>,
  ): void {
    const needsNewMesh =
      options.meshResolution !== undefined &&
      options.meshResolution !== this.config.meshResolution

    this.config = { ...this.config, ...options }

    if (needsNewMesh && this.isInitialized) {
      this.buildMesh()
    }

    this.resize()
  }

  public destroy(): void {
    this.stop()
    this.resizeObserver.disconnect()
    this.intersectionObserver.disconnect()
    this.container.removeEventListener('pointermove', this.handlePointerMove)
    this.container.removeEventListener('pointerleave', this.handlePointerLeave)
    document.removeEventListener('visibilitychange', this.handleDocumentVisibility)
    this.canvas.remove()
    this.container.classList.remove('is-bella-cloth-ready')
    this.container.classList.remove('is-bella-cloth-sdf-edge')

    if (this.gl !== null && this.gpu !== null) {
      this.gl.deleteProgram(this.gpu.program)

      if (this.gpu.contactShadow !== null) {
        this.gl.deleteProgram(this.gpu.contactShadow.program)
      }

      this.gl.deleteBuffer(this.gpu.positionBuffer)
      this.gl.deleteBuffer(this.gpu.normalBuffer)
      this.gl.deleteBuffer(this.gpu.indexBuffer)
      this.gl.deleteTexture(this.gpu.texture)
    }

    this.gpu = null
    this.gl = null
    this.isInitialized = false
  }

  private readonly handleDocumentVisibility = (): void => {
    this.syncRenderLoop()
  }

  private readonly handlePointerMove = (
    event: PointerEvent,
  ): void => {
    if (!this.isInitialized || event.pointerType === 'touch') {
      return
    }

    const bounds = this.container.getBoundingClientRect()
    const localX = event.clientX - bounds.left
    const localY = event.clientY - bounds.top

    if (
      localX < 0 ||
      localY < 0 ||
      localX > bounds.width ||
      localY > bounds.height
    ) {
      return
    }

    const now = performance.now()
    const pointer = this.pointer

    if (!pointer.hasPosition) {
      pointer.x = localX
      pointer.y = localY
      pointer.hasPosition = true
      pointer.pressure = 0.78
    } else {
      const elapsed = Math.max((now - pointer.lastEventTime) / 1000, 1 / 120)
      const distance = Math.hypot(localX - pointer.targetX, localY - pointer.targetY)
      const speed = Math.min(distance / elapsed, 1800)

      pointer.speed = Math.max(pointer.speed * 0.38, speed)
      pointer.pressure = Math.min(
        1,
        Math.max(
          pointer.pressure,
          distance / Math.max(this.config.brushSize * 0.32, 1),
        ),
      )
    }

    pointer.targetX = localX
    pointer.targetY = localY
    pointer.lastEventTime = now
    pointer.isInside = true
  }

  private readonly handlePointerLeave = (): void => {
    this.pointer.isInside = false
    this.pointer.pressure = Math.min(this.pointer.pressure, 0.32)
  }

  private getEdgeInfluence(
    horizontal: number,
    vertical: number,
  ): number {
    if (!this.edgeInfluenceEnabled) {
      return 1
    }

    const sideDistance = Math.min(horizontal, 1 - horizontal)
    const sideProgress = Math.max(0, Math.min(1, (sideDistance - 0.045) / 0.42))
    const sideInfluence = 1 - sideProgress * sideProgress * (3 - sideProgress * 2)
    const bottomProgress = Math.max(0, Math.min(1, (vertical - 0.46) / 0.54))
    const bottomInfluence = bottomProgress * bottomProgress * (3 - bottomProgress * 2)
    const activePerimeter = Math.max(sideInfluence, bottomInfluence)
    const lowerCornerBoost = sideInfluence * bottomInfluence * 0.08

    return Math.min(
      1,
      EDGE_INFLUENCE_CENTER +
        EDGE_INFLUENCE_RANGE * Math.pow(activePerimeter, 0.92) +
        lowerCornerBoost,
    )
  }

  private getPointerInfluence(
    horizontal: number,
    vertical: number,
  ): number {
    const edgeInfluence = this.getEdgeInfluence(horizontal, vertical)

    return 0.4 + 0.6 * Math.max(
      0,
      Math.min(
        1,
        (edgeInfluence - EDGE_INFLUENCE_CENTER) / EDGE_INFLUENCE_RANGE,
      ),
    )
  }

  private applyPointerResponse(
    delta: number,
  ): void {
    const pointer = this.pointer

    if (!pointer.isInside || !pointer.hasPosition) {
      return
    }

    const follow = 1 - Math.exp(-delta * 17)
    const previousX = pointer.x
    const previousY = pointer.y

    pointer.x += (pointer.targetX - pointer.x) * follow
    pointer.y += (pointer.targetY - pointer.y) * follow

    const trail = Math.hypot(pointer.x - previousX, pointer.y - previousY)
    const radius = Math.max(1, this.config.brushSize)
    const motion = Math.min(trail / Math.max(radius * 0.28, 1), 1)
    const response = Math.max(pointer.pressure, motion)

    pointer.pressure *= Math.exp(-delta * 3.4)
    pointer.speed *= Math.exp(-delta * 7.2)

    if (response < 0.01) {
      return
    }

    const speedBoost = Math.min(pointer.speed / 1300, 1)
    const impulse = this.config.brushStrength * response * (17 + speedBoost * 12)
    const resolution = this.config.meshResolution
    const width = Math.max(this.frameWidth, 1)
    const height = Math.max(this.frameHeight, 1)

    for (let y = 1; y <= resolution; y += 1) {
      const meshY = (y / resolution) * height
      const vertical = y / resolution

      for (let x = 0; x <= resolution; x += 1) {
        const meshX = (x / resolution) * width
        const distance = Math.hypot(meshX - pointer.x, meshY - pointer.y)

        if (distance >= radius) {
          continue
        }

        const normalizedDistance = distance / radius
        const localPressure = Math.exp(-normalizedDistance * normalizedDistance * 6.5)
        const secondaryFold = Math.exp(
          -(normalizedDistance - 0.68) * (normalizedDistance - 0.68) / 0.022,
        )
        const pointerInfluence = this.getPointerInfluence(x / resolution, vertical)
        const index = y * this.nodeColumns + x

        this.velocities[index] = Math.max(
          Math.min(
            this.velocities[index] +
              impulse * pointerInfluence * (localPressure - secondaryFold * 0.28),
            210,
          ),
          -210,
        )
      }
    }
  }

  private async ensureImageReady(): Promise<void> {
    if (this.image.complete) {
      if (this.image.naturalWidth === 0) {
        throw new Error('Gallery image failed to load.')
      }

      await this.image.decode().catch(() => undefined)
      return
    }

    await new Promise<void>((resolve, reject) => {
      this.image.addEventListener('load', () => resolve(), { once: true })
      this.image.addEventListener(
        'error',
        () => reject(new Error('Gallery image failed to load.')),
        { once: true },
      )
    })
  }

  private createGpuResources(
    gl: WebGL2RenderingContext,
  ): GpuResources {
    const program = this.createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)
    const contactShadow =
      this.contactShadowEnabled && this.sdfEdgeEnabled
        ? this.createContactShadowGpuResources(gl)
        : null
    const positionBuffer = this.requireGpuValue(gl.createBuffer(), 'position buffer')
    const normalBuffer = this.requireGpuValue(gl.createBuffer(), 'normal buffer')
    const indexBuffer = this.requireGpuValue(gl.createBuffer(), 'index buffer')
    const texture = this.requireGpuValue(gl.createTexture(), 'image texture')
    const positionLocation = gl.getAttribLocation(program, 'aPosition')
    const normalLocation = gl.getAttribLocation(program, 'aNormal')

    if (positionLocation < 0 || normalLocation < 0) {
      throw new Error('Bella Cloth could not bind mesh attributes.')
    }

    return {
      program,
      positionBuffer,
      normalBuffer,
      indexBuffer,
      texture,
      positionLocation,
      normalLocation,
      resolutionLocation: this.requireUniform(gl, program, 'uImage'),
      textureWindowLocation: this.requireUniform(gl, program, 'uTextureWindow'),
      lightLocation: this.requireUniform(gl, program, 'uLight'),
      sheenLocation: this.requireUniform(gl, program, 'uSheen'),
      shadowLocation: this.requireUniform(gl, program, 'uShadow'),
      edgeTensionLocation: this.requireUniform(gl, program, 'uEdgeTension'),
      edgeMotionLocation: this.requireUniform(gl, program, 'uEdgeMotion'),
      frameSizeLocation: this.requireUniform(gl, program, 'uFrameSize'),
      renderSizeLocation: this.requireUniform(gl, program, 'uRenderSize'),
      frameOriginLocation: this.requireUniform(gl, program, 'uFrameOrigin'),
      sdfEdgeEnabledLocation: this.requireUniform(gl, program, 'uSdfEdgeEnabled'),
      cornerRadiusLocation: this.requireUniform(gl, program, 'uCornerRadius'),
      contactShadow,
    }
  }

  private createContactShadowGpuResources(
    gl: WebGL2RenderingContext,
  ): ContactShadowGpuResources {
    const program = this.createProgram(
      gl,
      CONTACT_SHADOW_VERTEX_SHADER,
      CONTACT_SHADOW_FRAGMENT_SHADER,
    )

    return {
      program,
      edgeTensionLocation: this.requireUniform(gl, program, 'uEdgeTension'),
      edgeMotionLocation: this.requireUniform(gl, program, 'uEdgeMotion'),
      frameSizeLocation: this.requireUniform(gl, program, 'uFrameSize'),
      renderSizeLocation: this.requireUniform(gl, program, 'uRenderSize'),
      frameOriginLocation: this.requireUniform(gl, program, 'uFrameOrigin'),
      cornerRadiusLocation: this.requireUniform(gl, program, 'uCornerRadius'),
      baseOffsetLocation: this.requireUniform(gl, program, 'uShadowBaseOffset'),
      liftOffsetLocation: this.requireUniform(gl, program, 'uShadowLiftOffset'),
      expansionLocation: this.requireUniform(gl, program, 'uShadowExpansion'),
      liftExpansionLocation: this.requireUniform(gl, program, 'uShadowLiftExpansion'),
      opacityLocation: this.requireUniform(gl, program, 'uShadowOpacity'),
      softnessLocation: this.requireUniform(gl, program, 'uShadowSoftness'),
      liftSoftnessLocation: this.requireUniform(gl, program, 'uShadowLiftSoftness'),
      opacityFalloffLocation: this.requireUniform(gl, program, 'uShadowOpacityFalloff'),
    }
  }

  private createProgram(
    gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string,
  ): WebGLProgram {
    const vertex = this.compileShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragment = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
    const program = this.requireGpuValue(gl.createProgram(), 'shader program')

    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) ?? 'Unknown program error.'
      gl.deleteProgram(program)
      throw new Error('Bella Cloth shader link failed: ' + message)
    }

    return program
  }

  private compileShader(
    gl: WebGL2RenderingContext,
    type: number,
    source: string,
  ): WebGLShader {
    const shaderObject = this.requireGpuValue(gl.createShader(type), 'shader')

    gl.shaderSource(shaderObject, source)
    gl.compileShader(shaderObject)

    if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shaderObject) ?? 'Unknown shader error.'
      gl.deleteShader(shaderObject)
      throw new Error('Bella Cloth shader compilation failed: ' + message)
    }

    return shaderObject
  }

  private requireGpuValue<T>(
    value: T | null,
    name: string,
  ): T {
    if (value === null) {
      throw new Error('Bella Cloth could not create ' + name + '.')
    }

    return value
  }

  private requireUniform(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    name: string,
  ): WebGLUniformLocation {
    const location = gl.getUniformLocation(program, name)

    if (location === null) {
      throw new Error('Bella Cloth uniform ' + name + ' is unavailable.')
    }

    return location
  }

  private buildMesh(): void {
    const gl = this.gl
    const gpu = this.gpu

    if (gl === null || gpu === null) {
      return
    }

    const resolution = Math.max(8, Math.round(this.config.meshResolution))
    this.config.meshResolution = resolution
    this.nodeColumns = resolution + 1
    const nodeCount = this.nodeColumns * this.nodeColumns

    this.heights = new Float32Array(nodeCount)
    this.velocities = new Float32Array(nodeCount)
    this.positions = new Float32Array(nodeCount * 3)
    this.normals = new Float32Array(nodeCount * 3)
    this.indices = new Uint16Array(resolution * resolution * 6)

    for (let y = 0; y <= resolution; y += 1) {
      for (let x = 0; x <= resolution; x += 1) {
        const nodeIndex = y * this.nodeColumns + x
        const positionIndex = nodeIndex * 3

        this.positions[positionIndex] = x / resolution
        this.positions[positionIndex + 1] = y / resolution
        this.positions[positionIndex + 2] = 0
        this.normals[positionIndex + 2] = 1
      }
    }

    let indexOffset = 0

    for (let y = 0; y < resolution; y += 1) {
      for (let x = 0; x < resolution; x += 1) {
        const topLeft = y * this.nodeColumns + x
        const topRight = topLeft + 1
        const bottomLeft = topLeft + this.nodeColumns
        const bottomRight = bottomLeft + 1

        this.indices.set(
          [topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight],
          indexOffset,
        )
        indexOffset += 6
      }
    }

    this.indexCount = this.indices.length
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.normalBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
  }

  private uploadTexture(): void {
    if (this.gl === null || this.gpu === null) {
      return
    }

    const { gl, gpu } = this

    gl.bindTexture(gl.TEXTURE_2D, gpu.texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.SRGB8_ALPHA8,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.image,
    )
    gl.generateMipmap(gl.TEXTURE_2D)

    const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic') as {
      TEXTURE_MAX_ANISOTROPY_EXT: number
      MAX_TEXTURE_MAX_ANISOTROPY_EXT: number
    } | null

    if (anisotropy !== null) {
      const maximum = Number(
        gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT),
      )

      gl.texParameterf(
        gl.TEXTURE_2D,
        anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
        Math.min(4, maximum),
      )
    }
  }

  private updateTextureWindow(): void {
    const width = this.frameWidth
    const height = this.frameHeight

    if (width === 0 || height === 0 || this.image.naturalHeight === 0) {
      return
    }

    const imageAspect = this.image.naturalWidth / this.image.naturalHeight
    const containerAspect = width / height
    const textureWindow = imageAspect > containerAspect
      ? [containerAspect / imageAspect, 1]
      : [1, imageAspect / containerAspect]

    this.canvas.style.setProperty('--bella-cloth-cover-x', String(textureWindow[0]))
    this.canvas.style.setProperty('--bella-cloth-cover-y', String(textureWindow[1]))
  }

  private getSdfBleed(): number {
    if (!this.sdfEdgeEnabled) {
      return 0
    }

    if (window.innerWidth < 640) {
      return 12
    }

    if (window.innerWidth < 900) {
      return 18
    }

    return 24
  }

  private updateNormals(): void {
    const resolution = this.config.meshResolution
    const width = Math.max(this.frameWidth, 1)
    const height = Math.max(this.frameHeight, 1)
    const xStep = width / resolution
    const yStep = height / resolution

    for (let y = 0; y <= resolution; y += 1) {
      for (let x = 0; x <= resolution; x += 1) {
        const index = y * this.nodeColumns + x
        const left = this.heights[y * this.nodeColumns + Math.max(0, x - 1)]
        const right = this.heights[y * this.nodeColumns + Math.min(resolution, x + 1)]
        const top = this.heights[Math.max(0, y - 1) * this.nodeColumns + x]
        const bottom = this.heights[Math.min(resolution, y + 1) * this.nodeColumns + x]
        const normalX = -(right - left) / (2 * xStep)
        const normalY = -(bottom - top) / (2 * yStep)
        const normalLength = Math.hypot(normalX, normalY, 1)
        const vectorIndex = index * 3

        this.positions[vectorIndex + 2] = this.heights[index]
        this.normals[vectorIndex] = normalX / normalLength
        this.normals[vectorIndex + 1] = normalY / normalLength
        this.normals[vectorIndex + 2] = 1 / normalLength
      }
    }
  }

  private syncRenderLoop(): void {
    const canRender =
      this.wantsToRun &&
      this.isVisible &&
      !document.hidden &&
      this.isInitialized

    if (canRender && this.frameId === 0) {
      this.previousTime = performance.now()
      this.frameId = requestAnimationFrame(this.animate)
    } else if (!canRender) {
      this.stopRenderLoop()
    }
  }

  private stopRenderLoop(): void {
    if (this.frameId === 0) {
      return
    }

    cancelAnimationFrame(this.frameId)
    this.frameId = 0
  }

  private readonly animate = (
    now: number,
  ): void => {
    this.frameId = 0
    const delta = Math.min((now - this.previousTime) / 1000, 1 / 30)

    this.previousTime = now
    this.stepSimulation(delta, now / 1000)
    this.render()
    this.syncRenderLoop()
  }

  private stepSimulation(
    delta: number,
    elapsed: number,
  ): void {
    const resolution = this.config.meshResolution
    const phase = elapsed * this.config.speed * Math.PI * 2
    const velocityDecay = Math.pow(this.config.damping, delta * 60)

    this.applyPointerResponse(delta)

    for (let y = 0; y <= resolution; y += 1) {
      for (let x = 0; x <= resolution; x += 1) {
        const index = y * this.nodeColumns + x

        if (y === 0) {
          this.heights[index] = 0
          this.velocities[index] = 0
          continue
        }

        const left = this.heights[y * this.nodeColumns + Math.max(0, x - 1)]
        const right = this.heights[y * this.nodeColumns + Math.min(resolution, x + 1)]
        const top = this.heights[Math.max(0, y - 1) * this.nodeColumns + x]
        const bottom = this.heights[Math.min(resolution, y + 1) * this.nodeColumns + x]
        const laplacian = left + right + top + bottom - this.heights[index] * 4
        const horizontal = x / resolution
        const vertical = y / resolution
        const freeEdge = Math.pow(vertical, 1.22)
        const sideTension = 0.9 + Math.sin(horizontal * Math.PI) * 0.1
        const sideEdge = Math.pow(1 - Math.sin(horizontal * Math.PI), 1.7)
        const bottomProgress = Math.max(0, Math.min(1, (vertical - 0.55) / 0.45))
        const bottomEdge = bottomProgress * bottomProgress * (3 - bottomProgress * 2)
        const perimeter = Math.max(sideEdge * (0.4 + vertical * 0.6), bottomEdge)
        const edgeInfluence = this.getEdgeInfluence(horizontal, vertical)
        const windPattern =
          Math.sin(phase + horizontal * 5.4 + vertical * 2.2) * 0.72 +
          Math.sin(phase * 0.57 - horizontal * 8.1 + vertical * 4.6) * 0.28
        const idlePattern =
          Math.sin(phase * 0.78 + horizontal * 4.2 - vertical * 5.4) * 0.62 +
          Math.sin(phase * 1.36 - horizontal * 7.6 + vertical * 2.6) * 0.25 +
          Math.cos(phase * 0.44 + horizontal * 2.2 + vertical * 8) * 0.13
        const idleEnvelope = 0.22 + freeEdge * 0.78
        const perimeterField =
          Math.sin(phase * 0.63 + horizontal * 4.7 - vertical * 7.3) * 0.56 +
          Math.sin(phase * 1.07 - horizontal * 8.6 + vertical * 3.9) * 0.29 +
          Math.cos(phase * 0.39 + horizontal * 1.9 + vertical * 11.1) * 0.15
        const perimeterIdle = this.perimeterIdleEnabled
          ? this.config.amplitude * 0.42 * perimeter * perimeterField * edgeInfluence
          : 0
        const edgePattern = Math.sin(
          phase * 1.18 + horizontal * 9.4 - vertical * 5.1,
        )
        const edgeDrape = this.config.drape * (
          sideEdge * (0.075 + vertical * 0.115) + bottomEdge * 0.1
        )
        const target = freeEdge * (
          this.config.drape * 0.28 * sideTension +
          edgeDrape +
          this.config.idleStrength *
            this.config.amplitude *
            idlePattern *
            idleEnvelope *
            sideTension *
            edgeInfluence +
          this.config.wind *
            this.config.amplitude *
            windPattern *
            (0.42 + freeEdge * 0.58) *
            edgeInfluence +
          perimeterIdle +
          this.config.edgeMotion *
            this.config.amplitude *
            edgePattern *
            perimeter *
            0.34 *
            edgeInfluence
        )
        const acceleration =
          laplacian * 30 +
          (target - this.heights[index]) *
            (4.3 + perimeter * this.config.edgeTension * 8)

        this.velocities[index] =
          (this.velocities[index] + acceleration * delta) *
          velocityDecay
        this.heights[index] += this.velocities[index] * delta
      }
    }

    this.updateNormals()
  }

  private render(): void {
    const gl = this.gl
    const gpu = this.gpu

    if (
      gl === null ||
      gpu === null ||
      this.canvas.width === 0 ||
      this.canvas.height === 0
    ) {
      return
    }

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    )
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.positionBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions)
    gl.enableVertexAttribArray(gpu.positionLocation)
    gl.vertexAttribPointer(gpu.positionLocation, 3, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.normalBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.normals)
    gl.enableVertexAttribArray(gpu.normalLocation)
    gl.vertexAttribPointer(gpu.normalLocation, 3, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu.indexBuffer)

    if (gpu.contactShadow !== null) {
      this.renderContactShadow(gl, gpu.contactShadow)
    }

    this.renderCloth(gl, gpu)
  }

  private renderContactShadow(
    gl: WebGL2RenderingContext,
    shadowResources: ContactShadowGpuResources,
  ): void {
    gl.useProgram(shadowResources.program)
    gl.uniform1f(shadowResources.edgeTensionLocation, this.config.edgeTension)
    gl.uniform1f(shadowResources.edgeMotionLocation, this.config.edgeMotion)
    gl.uniform2f(shadowResources.frameSizeLocation, this.frameWidth, this.frameHeight)
    gl.uniform2f(shadowResources.renderSizeLocation, this.renderWidth, this.renderHeight)
    gl.uniform2f(shadowResources.frameOriginLocation, this.sdfBleed, this.sdfBleed)
    gl.uniform1f(
      shadowResources.cornerRadiusLocation,
      Math.min(30, this.frameWidth * 0.5, this.frameHeight * 0.5),
    )
    gl.uniform2f(
      shadowResources.baseOffsetLocation,
      CONTACT_SHADOW.baseOffsetX,
      CONTACT_SHADOW.baseOffsetY,
    )
    gl.uniform2f(
      shadowResources.liftOffsetLocation,
      CONTACT_SHADOW.liftOffsetX,
      CONTACT_SHADOW.liftOffsetY,
    )
    gl.uniform1f(shadowResources.expansionLocation, CONTACT_SHADOW.expansion)
    gl.uniform1f(shadowResources.liftExpansionLocation, CONTACT_SHADOW.liftExpansion)
    gl.uniform1f(shadowResources.opacityLocation, CONTACT_SHADOW.opacity)
    gl.uniform1f(shadowResources.softnessLocation, CONTACT_SHADOW.softness)
    gl.uniform1f(shadowResources.liftSoftnessLocation, CONTACT_SHADOW.liftSoftness)
    gl.uniform1f(shadowResources.opacityFalloffLocation, CONTACT_SHADOW.opacityFalloff)
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0)
  }

  private renderCloth(
    gl: WebGL2RenderingContext,
    gpu: GpuResources,
  ): void {
    gl.useProgram(gpu.program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, gpu.texture)
    gl.uniform1i(gpu.resolutionLocation, 0)
    gl.uniform2f(
      gpu.textureWindowLocation,
      Number(this.canvas.style.getPropertyValue('--bella-cloth-cover-x') || 1),
      Number(this.canvas.style.getPropertyValue('--bella-cloth-cover-y') || 1),
    )
    gl.uniform1f(gpu.lightLocation, this.config.light)
    gl.uniform1f(gpu.sheenLocation, this.config.sheen)
    gl.uniform1f(gpu.shadowLocation, this.config.shadow)
    gl.uniform1f(gpu.edgeTensionLocation, this.config.edgeTension)
    gl.uniform1f(gpu.edgeMotionLocation, this.config.edgeMotion)
    gl.uniform2f(gpu.frameSizeLocation, this.frameWidth, this.frameHeight)
    gl.uniform2f(gpu.renderSizeLocation, this.renderWidth, this.renderHeight)
    gl.uniform2f(gpu.frameOriginLocation, this.sdfBleed, this.sdfBleed)
    gl.uniform1f(gpu.sdfEdgeEnabledLocation, this.sdfEdgeEnabled ? 1 : 0)
    gl.uniform1f(
      gpu.cornerRadiusLocation,
      Math.min(30, this.frameWidth * 0.5, this.frameHeight * 0.5),
    )
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0)
  }
}
