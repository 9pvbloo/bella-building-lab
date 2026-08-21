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
}


export type CameraDirectorUpdate = {
  smoothProgress: number
  activeChapterIndex: number
  aspect: number
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


/**
 * Owns Bella's authored desktop camera ledger. Native scroll selects the
 * exact chapter elsewhere; only the already-smoothed visual progress is used
 * here to interpolate the persistent camera between its seven front-facing
 * compositions.
 */
export class CameraDirector {

  private readonly heroThresholdApproach: CameraShot = {
    id: 'hero-threshold-approach',
    label: 'Hero threshold approach',
    composition: 'Forward approach to the Hero wordmark threshold.',
    position: new THREE.Vector3(1.95, 4.15, 14.65),
    target: new THREE.Vector3(0.81, 3.55, 10.5),
    fov: 37.5,
  }

  private readonly experienceToRoomsDeparture: CameraShot = {
    id: 'experience-to-rooms-departure',
    label: 'Experience to rooms departure',
    composition: 'A front-facing lateral departure that begins the room discovery.',
    position: new THREE.Vector3(-3.6, 5.85, 9.8),
    target: new THREE.Vector3(-0.65, 5.8, 0),
    fov: 44,
  }

  private readonly servicesToGalleryReveal: CameraShot = {
    id: 'services-to-gallery-reveal',
    label: 'Services to gallery reveal',
    composition: 'A mid-distance cross-facade reveal that preserves the known front.',
    position: new THREE.Vector3(1.1, 8.65, 10.4),
    target: new THREE.Vector3(-0.8, 6.5, 0),
    fov: 46,
  }

  private readonly locationToReserveArrival: CameraShot = {
    id: 'location-to-reserve-arrival',
    label: 'Location to reserve arrival',
    composition: 'A measured descending approach that turns the return toward reception.',
    position: new THREE.Vector3(7.2, 7.4, 10.2),
    target: new THREE.Vector3(-0.4, 3.8, 0.6),
    fov: 47,
  }

  readonly shots:
    readonly CameraShot[] = [

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

  ]


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
    }
  }


  update(
    {
      smoothProgress,
      activeChapterIndex,
      aspect,
    }: CameraDirectorUpdate,
  ): Readonly<CameraFrame> {

    const lastIndex =
      this.shots.length -
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
      this.shots[startIndex]

    let end =
      this.shots[endIndex]


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
          this.shots[0]


        end =
          this.heroThresholdApproach


        eased =
          smoothstep(
            clampedProgress /
            thresholdApproachProgress,
          )
      } else {

        start =
          this.heroThresholdApproach


        end =
          this.shots[1]


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
          this.shots[1]


        end =
          this.experienceToRoomsDeparture


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
          this.experienceToRoomsDeparture


        end =
          this.shots[2]


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
          this.shots[3]


        end =
          this.servicesToGalleryReveal


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
          this.servicesToGalleryReveal


        end =
          this.shots[4]


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
          this.shots[5]


        end =
          this.locationToReserveArrival


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
          this.locationToReserveArrival


        end =
          this.shots[6]


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


    // A small front-facing lateral offset leaves room for the persistent moon
    // beside Bella's narrow mobile facade. It is a safeguard, not the authored
    // mobile shot system scheduled for Phase 6.
    const mobileSafety =
      smoothstep(
        (
          0.75 -
          aspect
        ) /
        0.3,
      )


    this.currentPosition.x +=
      2.5 *
      mobileSafety


    this.currentTarget.x +=
      1.25 *
      mobileSafety


    const desktopFov =
      THREE.MathUtils.lerp(
        start.fov,
        end.fov,
        eased,
      )


    // This is only a narrow-screen safety composition. Phase 6 will replace
    // it with full per-shot mobile positions and targets.
    this.frame.fov =
      aspect <
      0.75
        ? Math.max(
            desktopFov,
            50,
          )
        : aspect <
            0.95
          ? Math.max(
              desktopFov,
              42,
            )
          : desktopFov


    // This is exact chapter metadata only. It never feeds interpolation.
    this.frame.activeShot =
      this.shots[
        THREE.MathUtils.clamp(
          activeChapterIndex,
          0,
          lastIndex,
        )
      ]


    return this.frame
  }


  private assertPostExperienceThreshold(): void {

    if (
      !import.meta.env.DEV
    ) {
      return
    }


    const insideShots: readonly CameraShot[] = [
      this.shots[1],
      this.shots[2],
      this.shots[3],
      this.shots[4],
      this.shots[5],
      this.shots[6],
      this.experienceToRoomsDeparture,
      this.servicesToGalleryReveal,
      this.locationToReserveArrival,
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
            `CameraDirector post-Experiencia shot "${
              shot.id
            }" crosses the Hero wordmark threshold at z ${
              HERO_WORDMARK_THRESHOLD_Z
            }`,
          )
        }
      },
    )
  }
}
