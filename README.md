# beyourown — studio portfolio

An interactive 3D portfolio for **beyourown**, a strategy, design and technology studio in Punjab, India.

A sculpture of 729 cubes sits behind the page and re-forms for each project as you scroll:

| Section | Shape | Idea |
| --- | --- | --- |
| Intro | Cube lattice | Scattered parts assembled into one structure |
| AbroCare | Stacked plates | One operations system, many layers |
| Liiaroma | Ring with a moving band | The commerce loop, discovery to purchase |
| LMS | Funnel | Many leads in, conversions out |
| AIS | Campus blocks | Buildings around a courtyard |
| SVIET | Hub and four nodes | A connected institutional ecosystem |
| Contact | Sphere | Everything resolves into one form |

Move the mouse to push the cubes apart, drag empty space to turn the sculpture, and hover a project in the work list to preview its shape.

## Run it

It is a single static file with no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Libraries load from jsDelivr: three.js 0.160.0 and Lenis 1.1.13. Fonts come from Google Fonts.

## Editing content

Project case studies live in the `PROJECTS` array near the top of the first `<script>` block. Each entry sets its name, tags, URL, text, the four modules built, the takeaway, the accent colour (`tint`) and the 3D shape (`shape`).
