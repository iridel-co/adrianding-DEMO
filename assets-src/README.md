# assets-src

Source originals as supplied by the client. Nothing here is served — the site
uses the optimized copies in `public/images/`. Keep originals here so any
logo or photo can be re-exported later without asking the client again.

| Folder                      | What                                                                           | Served copy                                  |
| --------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| `logos/clients/<category>/` | Client company logos, one file per company, grouped like the client's own list | `public/images/logos/co-<slug>.*`            |
| `logos/credentials/`        | Certification / accreditation marks                                            | `public/images/logos/*-logo.*`               |
| `testimonials/`             | Testimonial headshots, `first-last.png`                                        | `public/images/testimonials/first-last.webp` |

Adding a new file: drop it in the right folder with a lowercase-hyphen name,
export an optimized copy to `public/images/`, and wire it in `src/lib/`.
