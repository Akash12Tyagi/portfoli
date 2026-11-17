# Akash Tyagi — portfolio

The portfolio of Akash Tyagi, creative developer: real-time 3D, motion and the products behind them. Punjab, India.

## The experience

1. **Gate.** Twelve radial panes of real project frames surround a tuning dial with twelve disciplines around it. Moving the pointer tunes the dial: the orange dot snaps to the nearest word and its pane lights up. Click to tune in (with sound) or to enter (sound off). The panes fly outward on entry.
2. **The hall.** A pinned WebGL corridor with slatted walls, a mirror floor and status lights. Eight screens hang down the middle: a showreel, then Rosso, Corner Café, Lusso di Firenze, Onfinity, The Uniques, SkillCures and CricketLive. Scrolling walks the camera from screen to screen. The active screen cycles real frames of the project with a diagonal wipe, tints the corridor in its colours, and lifts into the ceiling as you pass. Click a screen or its tab to open the project, with links to the live site and the code.
3. **What I make.** Six disciplines, pinned and stepped by scroll. The media frame cycles through the matching projects.
4. **Index.** All eleven projects plus six studio projects for BE YOUR OWN, with filters and a preview that follows the cursor.
5. **Timeline.** Pinned. A dot travels the rail while the year rolls over.
6. **Contact.** The name, the facts, contact links, and buttons to replay the intro or turn motion off.

All sound is synthesised in the browser with Web Audio: an ambient bed, a tick as the dial tunes and between steps, and a whoosh between screens. It starts only after a click and can be muted from the bottom-left control.

**Motion off** (on the contact section, or `?still`) shows a static version with no 3D, smooth scrolling or pinning. Visitors whose system asks for reduced motion get it automatically.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | Markup |
| `assets/site.css` | All styles (tokens at the top) |
| `assets/data.js` | Projects, disciplines, timeline and studio work |
| `assets/app.js` | Gate, scroll choreography (GSAP ScrollTrigger + Lenis), index, timeline, project overlay |
| `assets/hall.js` | The three.js hall: corridor, screens, frame-wipe shader, camera rig |
| `assets/sound.js` | Procedural sound |
| `assets/p/` | Project frames at 1600×1000 (`<slug>-<n>.webp`), thumbnails (`-sm`) and 1024×640 textures in `gl/` |
| `assets/work/` | Studio project images |

Project frames were captured from local builds of each repository, or taken from screenshots already in the repositories.

## Editing

- **Add a project:** add an entry to `projects` in `assets/data.js` and put its frames in `assets/p/` and `assets/p/gl/`. Add its slug to `featured` to hang it in the hall.
- **Colours and type:** the `:root` block at the top of `assets/site.css`.

## Run it

It's a static site with no build step. Serve the folder, since browsers block ES modules from `file://`:

```bash
python3 -m http.server 8000
```

Libraries load from jsDelivr: three.js 0.160.0, GSAP 3.12.5 with ScrollTrigger, and Lenis 1.1.13. Fonts are Archivo, Geist and Geist Mono from Google Fonts.
