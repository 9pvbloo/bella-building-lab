import type { RuntimePreferences } from './RuntimePreferences'
import type {
  ScrollDirection,
  ScrollDirector,
} from './ScrollDirector'


const NAVIGATION_DIRECTION_THRESHOLD = 12
const NAVIGATION_TOP_THRESHOLD = 4


/**
 * Keeps editorial navigation tied to the exact native-scroll chapter state.
 * Camera smoothing intentionally has no role in this UI.
 */
export class SectionNavigation {

  private readonly links: HTMLAnchorElement[]
  private readonly navigation: HTMLElement | null
  private readonly runtimePreferences: RuntimePreferences
  private readonly scrollDirector: ScrollDirector
  private lastScrollY = window.scrollY
  private pendingDirection: ScrollDirection = 'idle'
  private accumulatedDirectionDelta = 0


  constructor(
    runtimePreferences: RuntimePreferences,
    scrollDirector: ScrollDirector,
  ) {

    this.runtimePreferences = runtimePreferences
    this.scrollDirector = scrollDirector
    this.navigation = document.querySelector<HTMLElement>(
      '.bella-top-nav',
    )
    this.links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        '[data-bella-section-link]',
      ),
    )

    this.links.forEach(
      (
        link,
      ) => {

        link.addEventListener(
          'click',
          this.handleLinkClick,
        )
      },
    )


    this.navigation?.addEventListener(
      'focusin',
      this.handleNavigationFocus,
    )
  }


  public update(
    activeChapterIndex: number,
  ): void {

    this.links.forEach(
      (
        link,
      ) => {

        const isActive =
          Number(
            link.dataset.bellaSectionIndex,
          ) ===
          activeChapterIndex


        link.classList.toggle(
          'is-active',
          isActive,
        )


        if (
          isActive
        ) {

          link.setAttribute(
            'aria-current',
            'location',
          )

          return
        }


        link.removeAttribute(
          'aria-current',
        )
      },
    )
  }


  /**
   * Reuses ScrollDirector's native direction state, but waits for meaningful
   * accumulated movement so touchpads cannot make the header flicker.
   */
  public updateVisibility(
    direction: ScrollDirection,
    scrollY: number,
  ): void {

    if (
      this.navigation ===
      null
    ) {
      return
    }


    if (
      scrollY <=
      NAVIGATION_TOP_THRESHOLD
    ) {
      this.pendingDirection = 'idle'
      this.accumulatedDirectionDelta = 0
      this.lastScrollY = scrollY
      this.setNavigationVisible(
        true,
      )
      return
    }


    const delta =
      Math.abs(
        scrollY -
          this.lastScrollY,
      )


    this.lastScrollY = scrollY


    if (
      direction ===
      'idle' ||
      delta ===
        0
    ) {
      return
    }


    if (
      direction !==
      this.pendingDirection
    ) {
      this.pendingDirection = direction
      this.accumulatedDirectionDelta = delta
    } else {
      this.accumulatedDirectionDelta += delta
    }


    if (
      this.accumulatedDirectionDelta <
      NAVIGATION_DIRECTION_THRESHOLD
    ) {
      return
    }


    this.setNavigationVisible(
      direction ===
        'up',
    )

    this.accumulatedDirectionDelta = 0
  }


  private readonly handleLinkClick = (
    event: MouseEvent,
  ): void => {

    const link =
      event.currentTarget


    if (
      !(
        link instanceof
        HTMLAnchorElement
      )
    ) {
      return
    }


    const href =
      link.getAttribute(
        'href',
      )


    if (
      href ===
      null ||
      !href.startsWith(
        '#',
      )
    ) {
      return
    }


    const target =
      document.querySelector<HTMLElement>(
        href,
      )


    if (
      target ===
      null
    ) {
      return
    }


    event.preventDefault()


    const chapterIndex =
      Number(
        link.dataset.bellaSectionIndex,
      )


    if (
      !Number.isInteger(
        chapterIndex,
      )
    ) {
      return
    }


    // pushState preserves useful deep links without triggering the browser's
    // default anchor jump, which would fight the cinematic resting target.
    if (
      window.location.hash !==
      href
    ) {
      history.pushState(
        null,
        '',
        href,
      )
    }


    window.scrollTo({
      top:
        this.scrollDirector.getChapterRestingScrollY(
          chapterIndex,
        ),

      behavior:
        this.runtimePreferences.prefersReducedMotion
          ? 'auto'
          : 'smooth',
    })
  }


  private readonly handleNavigationFocus = (): void => {

    this.accumulatedDirectionDelta = 0
    this.setNavigationVisible(
      true,
    )
  }


  private setNavigationVisible(
    isVisible: boolean,
  ): void {

    this.navigation?.classList.toggle(
      'is-scroll-hidden',
      !isVisible,
    )
  }
}
