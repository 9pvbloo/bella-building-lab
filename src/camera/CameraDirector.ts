import * as THREE from 'three'


export type CameraShot = {
  id: string
  label: string
  composition: string
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
}


export type CameraFrame = {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
  activeShot: CameraShot
  profile: CameraCompositionProfile
}


export type CameraCompositionProfile =
  | 'desktop'
  | 'tablet'
  | 'phone'


export type CameraViewport = {
  width: number
  height: number
  aspect: number
}


export type CameraDirectorUpdate = {
  smoothProgress: number
  activeChapterIndex: number
  viewport: CameraViewport
}


const smoothstep = (
  value: number,
): number => {

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


// BellaWordmark is a direct scene child, unrotated on the XY plane at z 11.5.
// Post-Experiencia camera data stays on the hotel side with a deliberate margin.
const HERO_WORDMARK_THRESHOLD_Z =
  11.5


const POST_EXPERIENCE_MAX_Z =
  10.6


type CameraProfileLedger = {
  id: CameraCompositionProfile
  shots: readonly CameraShot[]
  heroThresholdApproach: CameraShot
  experienceToRoomsDeparture: CameraShot
  servicesToGalleryReveal: CameraShot
  locationToReserveArrival: CameraShot
}


/**
 * Selects a semantic authored composition family once per camera update. The
 * width guard keeps 768 × 1024 in the tablet family, while a phone rotated
 * into a broad landscape can remain close to the approved desktop framing.
 */
export function resolveCameraCompositionProfile(
  {
    width,
    aspect,
  }: CameraViewport,
): CameraCompositionProfile {

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


const cameraShot = (
  id: string,
  label: string,
  composition: string,
  position: readonly [number, number, number],
  target: readonly [number, number, number],
  fov: number,
): CameraShot => ({
  id,
  label,
  composition,
  position: new THREE.Vector3(...position),
  target: new THREE.Vector3(...target),
  fov,
})


const CAMERA_PROFILE_LEDGERS: Readonly<Record<
  CameraCompositionProfile,
  CameraProfileLedger
>> = {
  // This ledger is intentionally byte-for-byte equivalent in authored values
  // to the approved desktop journey from Phase 5.
  desktop: {
    id: 'desktop',
    shots: [

    {
      id: 'hero',
      label: 'Hero',
      composition: 'Low entrance-side poster framing with moon and wordmark.',
      position: new THREE.Vector3(1.25, 3.2, 23),
      target: new THREE.Vector3(0.3, 7, 0.2),
      fov: 35.5,
    },

    {
      id: 'experience',
      label: 'Experiencia',
      composition: 'Forward editorial dolly into Bella after the Hero poster.',
      position: new THREE.Vector3(3.25, 4.8, 9.35),
      target: new THREE.Vector3(0.25, 5.9, 0),
      fov: 43,
    },

    {
      id: 'rooms',
      label: 'Habitaciones',
      composition: 'A calm lateral product frame with breathing room for room cards.',
      position: new THREE.Vector3(-9.4, 6.8, 10.4),
      target: new THREE.Vector3(-1.35, 5.9, 0),
      fov: 46,
    },

    {
      id: 'services',
      label: 'Servicios',
      composition: 'A raised, calm medium-wide frame for dependable service information.',
      position: new THREE.Vector3(-7.2, 10.4, 10.2),
      target: new THREE.Vector3(-3.2, 7.3, 0),
      fov: 46,
    },

    {
      id: 'gallery',
      label: 'Galería',
      composition: 'A closer slight-side facade frame with sculptural depth for imagery.',
      position: new THREE.Vector3(8.8, 6.25, 9.8),
      target: new THREE.Vector3(0.3, 5.55, 0.25),
      fov: 45,
    },

    {
      id: 'location',
      label: 'Huancayo / Ubicación',
      composition: 'The widest elevated front-facing view, opening Bella into the Andes.',
      position: new THREE.Vector3(14.8, 22.5, 10.6),
      target: new THREE.Vector3(2.2, 5.5, -20),
      fov: 54,
    },

    {
      id: 'reserve',
      label: 'Final / Reserva',
      composition: 'A low, intimate return that anchors the final CTA at reception.',
      position: new THREE.Vector3(1.35, 2.45, 9.35),
      target: new THREE.Vector3(3.55, 1.75, 0.85),
      fov: 40,
    },

    ],
    heroThresholdApproach: cameraShot(
      'hero-threshold-approach',
      'Hero threshold approach',
      'Forward approach to the Hero wordmark threshold.',
      [1.95, 4.15, 14.65],
      [0.81, 3.55, 10.5],
      37.5,
    ),
    experienceToRoomsDeparture: cameraShot(
      'experience-to-rooms-departure',
      'Experience to rooms departure',
      'A front-facing lateral departure that begins the room discovery.',
      [-3.6, 5.85, 9.8],
      [-0.65, 5.8, 0],
      44,
    ),
    servicesToGalleryReveal: cameraShot(
      'services-to-gallery-reveal',
      'Services to gallery reveal',
      'A mid-distance cross-facade reveal that preserves the known front.',
      [1.1, 8.65, 10.4],
      [-0.8, 6.5, 0],
      46,
    ),
    locationToReserveArrival: cameraShot(
      'location-to-reserve-arrival',
      'Location to reserve arrival',
      'A measured descending approach that turns the return toward reception.',
      [7.2, 7.4, 10.2],
      [-0.4, 3.8, 0.6],
      47,
    ),
  },
  tablet: {
    id: 'tablet',
    shots: [
      cameraShot('hero', 'Hero', 'Tighter vertical Hero poster with a protected moon and threshold.', [1, 3.55, 21.6], [0.4, 7.25, 0.15], 41),
      cameraShot('experience', 'Experiencia', 'A deeper, readable architectural arrival after crossing the title.', [2.5, 4.9, 9.45], [0.25, 5.7, 0], 47),
      cameraShot('rooms', 'Habitaciones', 'A calm, modest lateral room-card frame with a protected center.', [-5.9, 6.85, 10], [-0.7, 5.8, 0], 50),
      cameraShot('services', 'Servicios', 'A raised front-facing frame that keeps the elevation signature.', [-4.2, 10.3, 10], [-1.8, 7.6, 0], 50),
      cameraShot('gallery', 'Galería', 'A controlled side reveal that stays on Bella’s known facade.', [6.2, 6.8, 9.85], [0.4, 5.5, 0], 50),
      cameraShot('location', 'Huancayo / Ubicación', 'An elevated, wider front view that opens Bella toward the Andes.', [11, 20, 10.5], [1.3, 5, -18], 60),
      cameraShot('reserve', 'Final / Reserva', 'A lower reception-focused return for the final CTA.', [1.2, 2.6, 9.2], [2.8, 1.8, 0.8], 44),
    ],
    heroThresholdApproach: cameraShot('hero-threshold-approach', 'Hero threshold approach', 'Tablet approach to the shared Hero wordmark plane.', [1.5, 4.1, 14.8], [0.7, 3.55, 10.5], 43),
    experienceToRoomsDeparture: cameraShot('experience-to-rooms-departure', 'Experience to rooms departure', 'Tablet departure from the architectural arrival.', [-2.7, 5.9, 9.7], [-0.45, 5.75, 0], 47),
    servicesToGalleryReveal: cameraShot('services-to-gallery-reveal', 'Services to gallery reveal', 'Tablet mid-distance cross-facade reveal.', [1, 8.5, 10.25], [-0.4, 6.5, 0], 50),
    locationToReserveArrival: cameraShot('location-to-reserve-arrival', 'Location to reserve arrival', 'Tablet descent toward the warm reception.', [5.5, 6.9, 10.1], [-0.25, 3.5, 0.6], 48),
  },
  phone: {
    id: 'phone',
    shots: [
      cameraShot('hero', 'Hero', 'A monumental portrait facade with a large cropped two-line threshold.', [1.1, 4.4, 20.5], [0.55, 7, 0.1], 49),
      cameraShot('experience', 'Experiencia', 'A deep, readable architectural arrival on the hotel side of the title.', [2, 5.5, 10.25], [0.3, 5.6, 0], 57),
      cameraShot('rooms', 'Habitaciones', 'A calm portrait-compatible room-card composition with protected negative space.', [-2.6, 6.5, 9.8], [-0.2, 5.3, 0], 54),
      cameraShot('services', 'Servicios', 'A controlled vertical crane-up for the service chapter.', [-2.9, 10.6, 9.9], [-1, 7.4, 0], 54),
      cameraShot('gallery', 'Galería', 'A modest sculptural perspective change on the known facade.', [3.7, 6.9, 9.65], [0.4, 5.3, 0], 53),
      cameraShot('location', 'Huancayo / Ubicación', 'A high, wider portrait opening that gives the Andes more sky.', [8.5, 23.5, 10.3], [1.2, 5, -25], 70),
      cameraShot('reserve', 'Final / Reserva', 'An intimate lower-facade return that centers the warm entrance.', [0.9, 2.4, 8.8], [2.1, 1.65, 0.9], 49),
    ],
    heroThresholdApproach: cameraShot('hero-threshold-approach', 'Hero threshold approach', 'Phone approach to the shared Hero wordmark plane.', [1.45, 4.65, 14.7], [0.65, 3.8, 10.4], 52),
    experienceToRoomsDeparture: cameraShot('experience-to-rooms-departure', 'Experience to rooms departure', 'Phone departure with lateral movement held in reserve.', [-1.6, 5.8, 9.55], [-0.2, 5.6, 0], 53),
    servicesToGalleryReveal: cameraShot('services-to-gallery-reveal', 'Services to gallery reveal', 'Phone cross-facade sculptural reveal.', [0.75, 8.8, 10.2], [-0.2, 6.3, 0], 54),
    locationToReserveArrival: cameraShot('location-to-reserve-arrival', 'Location to reserve arrival', 'Phone descent from the Andean opening toward reception.', [3.7, 6.5, 9.7], [-0.1, 3.25, 0.6], 51),
  },
}


/**
 * Owns Bella's authored desktop, tablet, and phone ledgers. Native scroll
 * selects exact chapter ownership elsewhere; visual smoothing only
 * interpolates the persistent camera within the selected semantic profile.
 */
export class CameraDirector {

  readonly shots =
    CAMERA_PROFILE_LEDGERS.desktop.shots


  private readonly currentPosition =
    new THREE.Vector3()

  private readonly currentTarget =
    new THREE.Vector3()

  private readonly frame: CameraFrame


  constructor(
    chapters: readonly HTMLElement[],
  ) {

    if (
      chapters.length !==
      this.shots.length
    ) {

      throw new Error(
        `CameraDirector requires ${this.shots.length} chapters; received ${chapters.length}`,
      )
    }


    chapters.forEach(
      (
        chapter,
        index,
      ) => {

        if (
          Number(
            chapter.dataset.bellaCam,
          ) !==
          index
        ) {

          throw new Error(
            `CameraDirector expected data-bella-cam="${index}"`,
          )
        }
      },
    )


      const initialShot =
      this.shots[0]


    this.assertPostExperienceThreshold()


    this.currentPosition.copy(
      initialShot.position,
    )


    this.currentTarget.copy(
      initialShot.target,
    )


    this.frame = {
      position: this.currentPosition,
      target: this.currentTarget,
      fov: initialShot.fov,
      activeShot: initialShot,
      profile: 'desktop',
    }
  }


  update(
    {
      smoothProgress,
      activeChapterIndex,
      viewport,
    }: CameraDirectorUpdate,
  ): Readonly<CameraFrame> {

    const profile =
      resolveCameraCompositionProfile(
        viewport,
      )


    const ledger =
      CAMERA_PROFILE_LEDGERS[
        profile
      ]

    const lastIndex =
      ledger.shots.length -
      1


    const clampedProgress =
      THREE.MathUtils.clamp(
        smoothProgress,
        0,
        lastIndex,
      )


    const startIndex =
      Math.floor(
        clampedProgress,
      )


    const endIndex =
      Math.min(
        startIndex +
        1,
        lastIndex,
      )


    let eased =
      smoothstep(
        clampedProgress -
          startIndex,
      )


    let start =
      ledger.shots[startIndex]

    let end =
      ledger.shots[endIndex]


    if (
      startIndex ===
      0 &&
      endIndex ===
      1
    ) {

      const thresholdApproachProgress =
        0.54


      if (
        clampedProgress <
        thresholdApproachProgress
      ) {

        start =
          ledger.shots[0]


        end =
          ledger.heroThresholdApproach


        eased =
          smoothstep(
            clampedProgress /
            thresholdApproachProgress,
          )
      } else {

        start =
          ledger.heroThresholdApproach


        end =
          ledger.shots[1]


        eased =
          smoothstep(
            (
              clampedProgress -
              thresholdApproachProgress
            ) /
            (
              1 -
              thresholdApproachProgress
            ),
          )
      }
    } else if (
      startIndex ===
      1 &&
      endIndex ===
      2
    ) {

      const departureProgress =
        0.48


      if (
        clampedProgress <
        startIndex +
          departureProgress
      ) {

        start =
          ledger.shots[1]


        end =
          ledger.experienceToRoomsDeparture


        eased =
          smoothstep(
            (
              clampedProgress -
              startIndex
            ) /
            departureProgress,
          )
      } else {

        start =
          ledger.experienceToRoomsDeparture


        end =
          ledger.shots[2]


        eased =
          smoothstep(
            (
              clampedProgress -
              startIndex -
              departureProgress
            ) /
            (
              1 -
              departureProgress
            ),
          )
      }
    } else if (
      startIndex ===
      3 &&
      endIndex ===
      4
    ) {

      const revealProgress =
        0.5


      if (
        clampedProgress <
        startIndex +
          revealProgress
      ) {

        start =
          ledger.shots[3]


        end =
          ledger.servicesToGalleryReveal


        eased =
          smoothstep(
            (
              clampedProgress -
              startIndex
            ) /
            revealProgress,
          )
      } else {

        start =
          ledger.servicesToGalleryReveal


        end =
          ledger.shots[4]


        eased =
          smoothstep(
            (
              clampedProgress -
              startIndex -
              revealProgress
            ) /
            (
              1 -
              revealProgress
            ),
          )
      }
    } else if (
      startIndex ===
      5 &&
      endIndex ===
      6
    ) {

      const arrivalProgress =
        0.58


      if (
        clampedProgress <
        startIndex +
          arrivalProgress
      ) {

        start =
          ledger.shots[5]


        end =
          ledger.locationToReserveArrival


        eased =
          smoothstep(
            (
              clampedProgress -
              startIndex
            ) /
            arrivalProgress,
          )
      } else {

        start =
          ledger.locationToReserveArrival


        end =
          ledger.shots[6]


        eased =
          smoothstep(
            (
              clampedProgress -
              startIndex -
              arrivalProgress
            ) /
            (
              1 -
              arrivalProgress
            ),
          )
      }
    }


    this.currentPosition.lerpVectors(
      start.position,
      end.position,
      eased,
    )


    this.currentTarget.lerpVectors(
      start.target,
      end.target,
      eased,
    )


    this.frame.fov =
      THREE.MathUtils.lerp(
        start.fov,
        end.fov,
        eased,
      )


    // This is exact chapter metadata only. It never feeds interpolation.
    this.frame.activeShot =
      ledger.shots[
        THREE.MathUtils.clamp(
          activeChapterIndex,
          0,
          lastIndex,
        )
      ]


    this.frame.profile =
      profile


    return this.frame
  }


  private assertPostExperienceThreshold(): void {

    if (
      !import.meta.env.DEV
    ) {
      return
    }


    Object.values(
      CAMERA_PROFILE_LEDGERS,
    ).forEach(
      (
        ledger,
      ) => {

        const preThresholdShots: readonly CameraShot[] = [
          ledger.shots[0],
          ledger.heroThresholdApproach,
        ]


        preThresholdShots.forEach(
          (
            shot,
          ) => {

            if (
              shot.position.z <=
              HERO_WORDMARK_THRESHOLD_Z
            ) {

              throw new Error(
                `CameraDirector ${ledger.id} pre-threshold shot "${
                  shot.id
                }" must remain in front of the Hero wordmark plane at z ${
                  HERO_WORDMARK_THRESHOLD_Z
                }`,
              )
            }
          },
        )


        const insideShots: readonly CameraShot[] = [
          ledger.shots[1],
          ledger.shots[2],
          ledger.shots[3],
          ledger.shots[4],
          ledger.shots[5],
          ledger.shots[6],
          ledger.experienceToRoomsDeparture,
          ledger.servicesToGalleryReveal,
          ledger.locationToReserveArrival,
        ]


        insideShots.forEach(
          (
            shot,
          ) => {

            if (
              shot.position.z >
              POST_EXPERIENCE_MAX_Z
            ) {

              throw new Error(
                `CameraDirector ${ledger.id} post-Experiencia shot "${
                  shot.id
                }" crosses the Hero wordmark threshold at z ${
                  HERO_WORDMARK_THRESHOLD_Z
                }`,
              )
            }
          },
        )
      },
    )
  }
}
