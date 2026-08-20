export type RuntimePreferencesState = {
  prefersReducedMotion: boolean
  isDocumentVisible: boolean
}


type RuntimePreferencesListener = (
  state: Readonly<RuntimePreferencesState>,
) => void


/**
 * A small shared source for browser runtime signals that future visual systems
 * can consume without owning document-level event listeners themselves.
 */
export class RuntimePreferences {

  private readonly reducedMotionQuery =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

  private readonly listeners =
    new Set<RuntimePreferencesListener>()

  private currentState: RuntimePreferencesState = {
    prefersReducedMotion:
      this.reducedMotionQuery.matches,

    isDocumentVisible:
      document.visibilityState ===
      'visible',
  }


  constructor() {

    this.reducedMotionQuery.addEventListener(
      'change',
      this.handleReducedMotionChange,
    )


    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    )
  }


  get prefersReducedMotion(): boolean {

    return this.currentState.prefersReducedMotion
  }


  get isDocumentVisible(): boolean {

    return this.currentState.isDocumentVisible
  }


  get state(): Readonly<RuntimePreferencesState> {

    return this.currentState
  }


  subscribe(
    listener: RuntimePreferencesListener,
  ): () => void {

    this.listeners.add(
      listener,
    )


    return () => {

      this.listeners.delete(
        listener,
      )
    }
  }


  dispose(): void {

    this.reducedMotionQuery.removeEventListener(
      'change',
      this.handleReducedMotionChange,
    )


    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    )


    this.listeners.clear()
  }


  private handleReducedMotionChange = (
    event: MediaQueryListEvent,
  ): void => {

    this.update({
      prefersReducedMotion:
        event.matches,
    })
  }


  private handleVisibilityChange = (): void => {

    this.update({
      isDocumentVisible:
        document.visibilityState ===
        'visible',
    })
  }


  private update(
    partialState: Partial<RuntimePreferencesState>,
  ): void {

    this.currentState = {
      ...this.currentState,
      ...partialState,
    }


    this.listeners.forEach(
      (
        listener,
      ) => {

        listener(
          this.currentState,
        )
      },
    )
  }
}
