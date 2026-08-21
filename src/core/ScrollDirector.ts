export type ScrollDirection =
  | 'up'
  | 'down'
  | 'idle'


export type ScrollState = {
  exactProgress: number
  activeChapterIndex: number
  direction: ScrollDirection
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


/**
 * Converts native page scroll into the exact chapter state that owns UI and
 * interaction decisions. Visual smoothing remains the responsibility of the
 * caller so it can never become the source of truth.
 */
export class ScrollDirector {

  private readonly chapters:
    readonly HTMLElement[]

  private previousScrollY: number

  private currentState: ScrollState = {
    exactProgress: 0,
    activeChapterIndex: 0,
    direction: 'idle',
  }


  constructor(
    chapters: readonly HTMLElement[],
  ) {

    if (
      chapters.length ===
      0
    ) {

      throw new Error(
        'ScrollDirector requires at least one chapter',
      )
    }


    this.chapters =
      chapters


    this.previousScrollY =
      window.scrollY


    this.update()
  }


  get exactProgress(): number {

    return this.currentState.exactProgress
  }


  get activeChapterIndex(): number {

    return this.currentState.activeChapterIndex
  }


  get direction(): ScrollDirection {

    return this.currentState.direction
  }


  get state(): Readonly<ScrollState> {

    return this.currentState
  }


  /**
   * Returns the native scroll position where a chapter owns the viewport
   * completely: its center and the viewport center coincide. Navigation uses
   * this same geometry so it cannot land between authored chapter states.
   */
  public getChapterRestingScrollY(
    chapterIndex: number,
  ): number {

    const lastIndex =
      this.chapters.length -
      1

    const index =
      Math.round(
        clamp(
          chapterIndex,
          0,
          lastIndex,
        ),
      )


    // Hero is intentionally authored at the document origin.
    if (
      index ===
      0
    ) {
      return 0
    }


    const chapter =
      this.chapters[
        index
      ]

    const requestedScrollY =
      this.getChapterCenter(
        chapter,
      ) -
      window.innerHeight *
        0.5


    const maxScrollY =
      Math.max(
        0,
        document.documentElement.scrollHeight -
          window.innerHeight,
      )


    return clamp(
      requestedScrollY,
      0,
      maxScrollY,
    )
  }


  /**
   * Reconstruct exact progress from the current native scroll position.
   * The viewport-center and chapter-center interpolation intentionally
   * matches the pilot runtime's existing algorithm.
   */
  update(): Readonly<ScrollState> {

    const scrollY =
      window.scrollY


    const direction: ScrollDirection =
      scrollY >
      this.previousScrollY
        ? 'down'
        : scrollY <
            this.previousScrollY
          ? 'up'
          : 'idle'


    this.previousScrollY =
      scrollY


    const viewportCenter =
      scrollY +
      window.innerHeight *
        0.5


    const first =
      this.chapters[
        0
      ]


    const firstCenter =
      this.getChapterCenter(
        first,
      )


    if (
      viewportCenter <=
      firstCenter
    ) {

      return this.setState(
        0,
        0,
        direction,
      )
    }


    for (
      let i =
        0;
      i <
        this.chapters.length -
          1;
      i += 1
    ) {

      const current =
        this.chapters[
          i
        ]


      const next =
        this.chapters[
          i +
          1
        ]


      const currentCenter =
        this.getChapterCenter(
          current,
        )


      const nextCenter =
        this.getChapterCenter(
          next,
        )


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


        return this.setState(
          i +
            normalized,

          normalized <
          0.5
            ? i
            : i +
              1,

          direction,
        )
      }
    }


    const lastIndex =
      this.chapters.length -
      1


    return this.setState(
      lastIndex,
      lastIndex,
      direction,
    )
  }


  private setState(
    exactProgress: number,
    activeChapterIndex: number,
    direction: ScrollDirection,
  ): Readonly<ScrollState> {

    this.currentState = {
      exactProgress,
      activeChapterIndex,
      direction,
    }


    return this.currentState
  }


  private getChapterCenter(
    chapter: HTMLElement,
  ): number {

    return chapter.offsetTop +
      chapter.offsetHeight *
        0.5
  }
}
