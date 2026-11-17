# BE YOUR OWN — studio portfolio

An interactive 3D portfolio for **BE YOUR OWN**, the Brand, Digital & Growth studio in Banur, Punjab.

## The experience

1. **Iris gate.** A procedural camera aperture (WebGL shader) sits over the site while the work loads. The ring shows load progress and the Own Method pillars. Clicking enter opens the blades onto the hall.
2. **The hall.** A pinned WebGL corridor with slatted walls, a reflective floor and status lights. Eight featured projects hang as screens showing the real sites. Scrolling walks the camera from screen to screen. Each screen lights the hall in its own colour and lifts into the ceiling as you pass beneath it. Click a screen, or its tab, to open the case study.
3. **What we do.** The four pillars (Define, Express, Build, Grow), pinned and stepped by scroll, with a matching project image for each.
4. **Archive.** All 18 engagements with sector filters and a preview that follows the cursor.
5. **In their words.** Client testimonials on an auto-advancing carousel.
6. **Contact.** Studio facts, contact actions and socials.

The **Motion off** toggle (bottom left) switches to a static version with no 3D or smooth scrolling. Visitors whose system asks for reduced motion get it automatically. You can also force it with `?still`.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | Markup and the inline wordmark |
| `assets/site.css` | All styles (brand tokens at the top) |
| `assets/data.js` | Case studies, pillars and testimonials (copy from beyourown.in) |
| `assets/app.js` | Scroll choreography (GSAP + ScrollTrigger + Lenis), gate, archive, carousel, case overlay |
| `assets/hall.js` | The three.js hall and the iris shader |
| `assets/work/` | Project images (WebP). `<slug>.webp` is the main image, `-sm` the thumbnail, `-1`/`-2` gallery shots |

## Editing

- **Add or change a project:** edit `assets/data.js`. Set `featured: true` to hang it in the hall, and add images named after its `slug` to `assets/work/`.
- **Brand colours and type:** the `:root` block at the top of `assets/site.css`.

## Run it

It's a static site with no build step. Serve the folder, since browsers block ES modules from `file://`:

```bash
python3 -m http.server 8000
```

Libraries load from jsDelivr: three.js 0.160.0, GSAP 3.12.5 with ScrollTrigger, and Lenis 1.1.13. Fonts are Bricolage Grotesque, Geist and Geist Mono from Google Fonts.
