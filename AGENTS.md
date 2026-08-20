# AGENTS.md — Bella Durmiente Cinematic Lab

## Project

Bella Durmiente is a cinematic boutique-hotel website experiment built with:

- Vite
- TypeScript
- Three.js
- semantic HTML
- CSS

The Three.js world persists behind a continuous scrolling HTML page.

This repository is an isolated visual lab. It will later be integrated into the real Flask-based Hospedaje Bella Durmiente website.

---

## Primary Goal

Build an original cinematic nighttime experience for Hospedaje Bella Durmiente in Huancayo, Peru.

Core visual identity:

- real Bella Durmiente hotel architecture
- Andean nighttime landscape
- large ice-white moon
- deep navy / blue-black atmosphere
- subtle cold architectural lighting
- warm reception entrance as human refuge
- mist, mountains and restrained vegetation
- editorial typography
- smooth scroll-driven cinematography

The experience may be technically inspired by principles studied from high-quality Three.js sites, but it must remain visually and technically original to Bella Durmiente.

Do not copy Kage source code, assets, typography, compositions, artwork or proprietary implementation.

---

## Core Architecture — MUST PRESERVE

The application must use:

- one persistent WebGL renderer
- one primary Three.js scene
- one primary camera
- native browser scrolling as the source of truth
- semantic HTML chapters layered over the persistent 3D world
- exact scroll state separated from smoothed visual state

Required state principle:

native scroll
→ exact progress
→ smoothed visual progress
→ camera / world interpolation

Exact progress controls:

- chapter ownership
- navigation
- accessibility
- interaction state
- asset prediction

Smoothed progress controls:

- camera
- atmosphere
- cinematic transitions
- wordmark movement
- visual interpolation

Never use smoothed state as the source of truth for UI or accessibility.

---

## Protected Existing Systems

Do not replace these systems unless a task explicitly asks for it:

### Persistent Canvas

Keep the fixed Three.js canvas behind the page.

### Native Scroll

Do not introduce scroll hijacking.

Do not replace native scrolling with wheel-delta storytelling.

Do not introduce GSAP ScrollTrigger or Lenis as a new source of truth unless explicitly approved.

### BellaBuilding

`src/building/BellaBuilding.ts` represents the real Bella Durmiente facade.

Preserve its general proportions and architecture.

Improve it incrementally.

Do NOT rebuild the hotel from scratch unless explicitly requested.

Do NOT invent a rear facade.

Do NOT rotate the building 180° or 360°.

The building should remain physically fixed in the final cinematic architecture. Camera movement should create viewpoint changes.

### Building Signs

Keep:

`showBuildingSigns = false`

Do not re-enable the current generated signs unless explicitly requested.

### Foreground Assets

Preserve the current foreground system and assets unless explicitly requested:

- bella-branch-left.webp
- bella-garden-left.webp
- bella-tree-right.webp

Their chapter ownership, staggered entrance and retirement concept are considered successful.

### White Moon

Bella uses a WHITE / ICE-WHITE moon.

Never make it red.

The final moon must eventually be world-space, not attached to the camera.

### Mountains

Andean mountains are part of Bella's identity.

Do not remove them in favor of a generic background.

### Warm Entrance

The hotel reception / entrance is the main warm visual anchor.

Cold navy / ice dominates the world.

Warm amber is localized around the entrance.

---

## Bella Visual Hierarchy

Primary visual relationship:

WHITE MOON
→ DARK HOTEL
→ WARM ENTRANCE

The scene should communicate:

- night
- silence
- refuge
- rest
- hospitality
- Huancayo / Andes

Avoid:

- cyberpunk
- neon overload
- futuristic hotel aesthetics
- SaaS-style cyan gradients
- fantasy architecture
- Japanese visual motifs
- excessive bloom
- glass cards everywhere
- random decorative objects

---

## BellaBuilding Materials

Geometry is already a usable base.

Prioritize improving:

- concrete surface variation
- normal detail
- roughness variation
- subtle rain streaking
- believable glass variation
- metal response
- architectural depth
- contact / grounding
- selective shadows

Concrete should remain dielectric:

- low metalness
- medium/high roughness
- restrained surface imperfections

Do not make Bella look ruined, dirty or abandoned.

Glass should remain mostly dark cobalt / blue-black.

Most windows should be dark.

Some may show cold reflections.

Very few may contain subtle warm interior light.

Do not make every window emissive blue.

---

## Lighting Rules

Every light must have a clear visual role.

Target lighting families:

1. restrained cold moon/key light
2. subtle ambient / hemisphere fill
3. optional weak opposite fill only if necessary
4. localized warm entrance practical

Entrance lighting should follow:

visible emitter
+
physical local light
+
restrained atmospheric glow

Do not illuminate several floors with the entrance light.

Do not add invisible blue lights simply to make the facade brighter unless there is a demonstrated compositional need.

The world must look good before bloom.

---

## Moon Rules

Final moon architecture:

- world-space
- PlaneGeometry or equivalent world-space element
- detailed neutral lunar albedo
- broad maria
- highlands
- crater systems
- subtle rays
- soft limb
- large restrained halo
- depth testing
- real occlusion by world geometry
- fog disabled on the lunar disc
- little or no physical moon movement

The moon itself should feel nearly static.

Atmosphere may move slowly in front of it.

Hero target diameter is approximately 24–30% of viewport height, subject to visual review.

Desktop composition should favor the upper-left region.

Mobile requires authored recomposition.

---

## Wordmark Rules

The current full-word CanvasTexture implementation is temporary.

Final wordmark should use individually measured glyph planes.

Target:

BELLA
DURMIENTE

Characteristics:

- monumental
- editorial
- ice-white / pearl gradient
- refined tracking
- world-space
- responsive frustum fitting
- restrained per-glyph intro
- restrained scroll retirement

Do not use wild rotations, exploding letters, elastic animation or excessive separation.

Do not choose the final brand font without visual comparison.

Typography must remain original to Bella.

---

## Chapter Ledger

The final continuous homepage is planned around seven chapters:

0. Hero
1. Experiencia
2. Habitaciones
3. Servicios
4. Galería
5. Huancayo / Ubicación
6. Final / Reserva

Each chapter must change actual composition, not only text.

The same persistent hotel, moon and world continue across the entire experience.

`/reservar` remains a separate functional booking flow.

The cinematic homepage sells the stay.

The reservation route executes the transaction.

---

## Camera Rules

The building stays fixed.

Camera movement creates the cinematic story.

Camera states include:

- position
- target
- FOV
- authored mobile counterpart

Do not use large rotations around unmodeled architecture.

Stay within believable front-facing viewpoints.

Use smooth curves for camera position and target where appropriate.

Do not sacrifice chapter endpoint composition for curve elegance.

Desktop and mobile compositions must be authored independently.

Mobile is NOT desktop cropped vertically.

---

## Atmosphere

Bella atmosphere consists of separate responsibilities:

### Global Fog

Depth separation across the world.

### Separation Mist

Placed behind the hotel to separate architecture from mountains.

### Low Fog

Grounds the base of the hotel.

### Lateral Haze

Supports frame composition without random clutter.

### Rain

Eventually:

- fine
- subtle
- low-opacity
- slight slant
- ambient drizzle, not storm
- quality-tier controlled
- disabled for reduced motion / low tier when necessary

No lightning.

No heavy storm effects.

---

## Global Scrim

Do not use moving section-local scrims whose boundaries can cross the fixed Three.js world.

The current chapter `::before` approach produced visible horizontal seams during scrolling.

Final architecture must use a single fixed global scrim whose:

- opacity
- focal area
- darkness
- gradient position

can interpolate by chapter.

No visible HTML boundaries may cut across the moon or world.

---

## Cloth

Cloth will be used for photography in:

- Habitaciones
- Galería

Only the PHOTO belongs to Cloth.

Titles, prices, capacity, descriptions and CTAs remain semantic DOM.

Target Cloth architecture:

- height-field wave simulation
- previous/current/next states
- restrained damping/stiffness
- soft pointer impulse
- reconstructed normals
- subtle diffuse/specular/sheen
- SDF alpha edge
- SDF rounded edge / hem
- separate soft shadow pass
- render bleed
- sleeping when energy settles
- paused when offscreen
- quality tiers
- static fallback
- reduced-motion fallback

Do not replace Cloth with a CSS wobble.

Do not run many simulations permanently.

Habitaciones target:
1–2 active cloth simulations.

Galería target:
2–3 maximum on powerful desktop, fewer elsewhere.

---

## DOM Visual Language

Three.js provides spectacle.

DOM provides clarity.

Use:

- strong spacing
- editorial serif display typography
- clean modern sans-serif UI
- restrained controls
- thin rules
- careful negative space
- semantic HTML
- real buttons and links

Avoid:

- glass cards everywhere
- heavy backdrop-filter usage
- neon borders
- excessive animated gradients
- UI competing with the 3D world

---

## Responsive Rules

Required QA compositions include at least:

- 1440 × 900
- 768 × 1024
- 390 × 844

Mobile must preserve:

- white moon
- hotel
- Andes
- warm entrance
- narrative order

Expensive secondary effects may be reduced.

Identity may not be removed.

---

## Reduced Motion

Respect:

`prefers-reduced-motion: reduce`

Reduced motion should disable or minimize:

- rain
- cloth simulation
- haze drift
- mist drift
- moon halo breathing
- pointer parallax
- glyph stagger
- large camera smoothing

The static composition must remain complete and beautiful.

---

## Performance

Target quality tiers:

### HIGH

- DPR around 1.75 max
- full restrained post
- high cloth resolution
- rain enabled
- high-quality shadows

### MEDIUM

- DPR around 1.35
- lighter post
- reduced cloth resolution
- reduced rain
- smaller shadows

### LOW

- DPR around 1.0
- minimal post
- static or simplified cloth
- rain off
- limited expensive atmosphere
- shadows reduced/off as needed

LOW must still look unmistakably like Bella.

Preserve identity before effects.

Prefer stable frame pacing over unstable peak FPS.

---

## Static Shadows

BellaBuilding should eventually remain physically static.

Once appropriate, static architecture shadows should be rendered and frozen instead of recalculated every frame.

Do not implement this prematurely before lighting/building geometry is stable.

---

## Loading

Progressive loading should prioritize:

1. world shell
2. Hero camera
3. hotel
4. moon
5. mountains
6. Hero wordmark

Then progressively load upcoming chapter assets.

Do not block the Hero on Gallery assets.

Prepare shaders before first visible use where practical.

---

## Fallback

WebGL failure must never produce a black unusable page.

The final site must support:

- cinematic static fallback/poster
- semantic DOM
- navigation
- booking CTAs

Three.js enhances the website.

It must not be required for business functionality.

---

## Runtime Structure

Move progressively toward modular ownership.

Preferred direction:

src/
- main.ts
- core/
- world/
- building/
- typography/
- cloth/
- post/

Do not create dozens of abstractions without need.

`main.ts` should eventually become a bootstrap/orchestrator rather than a monolithic world implementation.

---

## Refactor Rule

Separate refactoring from visual redesign.

When extracting an existing system into a module:

BEFORE visual output
≈
AFTER visual output

Only after preservation is verified should its visual behavior be redesigned in a separate task.

Do not combine:

- architecture refactor
- major visual redesign
- performance optimization
- new effects

in one uncontrolled change.

---

## Implementation Order

Follow this phase order unless explicitly instructed otherwise:

### Phase 0
Runtime Foundation / modular architecture.

Preserve current visual output.

### Phase 1
Atmospheric infrastructure and fixed global scrim.

### Phase 2
World-space Moon V2.

### Phase 3
BellaBuilding V4.3 materials / lighting / grounding.

### Phase 4
Glyph-based Wordmark V2.

### Phase 5
Desktop Camera Director / seven chapter ledger.

### Phase 6
Authored mobile cameras.

### Phase 7
Rain and atmospheric motion.

### Phase 8
Cloth core + Habitaciones.

### Phase 9
Servicios.

### Phase 10
Galería + Cloth pool.

### Phase 11
Huancayo / Contact.

### Phase 12
Navigation + final chapter.

### Phase 13
Postprocessing.

### Phase 14
Measured performance pass.

### Phase 15
Final QA and Flask migration.

---

## Scope Discipline

One major task should have one primary objective.

If asked to implement Moon V2:

DO modify moon-related architecture.

DO NOT simultaneously redesign:

- building
- wordmark
- rooms
- gallery
- camera story
- postprocessing

unless explicitly included in the task.

Always prefer the smallest coherent change that satisfies the specification.

---

## Existing Code

Before changing a system:

1. read the relevant implementation
2. understand dependencies
3. preserve successful behavior
4. change the minimum required
5. build
6. report what changed

Do not replace complete files merely "for simplicity" unless there is a demonstrated reason.

---

## Build Requirement

After every meaningful implementation phase run:

`npm run build`

The task is not complete unless the build succeeds.

Expected successful result:

`✓ built`

Do not say "it should build".

Actually run it.

---

## Visual Verification

A successful build is NOT visual approval.

Definition:

BUILD PASS != VISUAL PASS

For visual changes the workflow is:

code
→ build
→ browser
→ screenshot/video
→ compare against chapter intent
→ approve or revise

Do not claim visual perfection based only on code structure.

When visual judgment is needed, explicitly state what should be inspected.

---

## Development Debugging

A development-only debug overlay is encouraged.

Useful information:

- exact progress
- smooth progress
- direction
- active chapter
- camera position
- camera target
- FOV
- quality tier
- FPS / frame time
- render calls
- triangles
- textures
- shader programs

Useful toggles:

- fog
- atmosphere
- rain
- post
- shadows
- textures
- cloth
- wireframe

Debug UI must not ship as visible production UI.

---

## Git Discipline

Preserve stable checkpoints.

Do not commit automatically unless explicitly requested.

Each visually approved implementation phase should be suitable for its own commit.

Never overwrite unrelated user work.

---

## Final Design Rule

When choosing between:

"more like the reference"

and

"more like Bella Durmiente"

always choose Bella Durmiente.

Reference material teaches engineering and composition principles.

Bella owns the final identity.