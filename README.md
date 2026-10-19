# Taksh Vadaliya — portfolio

A static, responsive portfolio for AI application engineering roles. The visual system pairs a warm, editorial canvas with dark engineering panels, fine grid lines, and a lime signal color. Its job is to make Taksh's role, strongest work, evidence, and contact path clear before asking visitors to explore.

## Pages

- `index.html` — role, selected projects, engineering approach, experience, toolkit, and contact.
- `projects/body-aware-shopping-compatibility.html` — a standalone case study for the Colab computer-vision prototype. It separates the long-term shopping idea from the notebook's actual scope and limitations.
- `404.html` — branded not-found page.
- `sitemap.xml` and `robots.txt` — search-engine discovery.

The site has no build step, framework, analytics, or external font dependency. Project art is CSS and inline markup; the body-profile mask image is the supplied notebook visualization. The résumé at `assets/taksh-vadaliya-resume.pdf` is a one-page, role-focused version aligned with the site.

## Local checks

```bash
node test/smoke.test.js
```

The smoke test uses only Node's built-in assertion library. It checks key copy, sections, metadata, project status labels, the case-study page and its reference image, the sitemap, the 404 page, and the linked résumé PDF. Before publishing, inspect the site at desktop and phone widths and click the product, repository, Colab, résumé, and contact links.

## Editing notes

- Keep the first screen focused on the role and one clear next step.
- Distinguish live products from prototypes and work in progress.
- Treat project numbers, measurements, and performance claims as evidence-backed facts; remove them if they are no longer current.
- Keep the shopping compatibility page explicit that body dimensions are image-derived estimates and that catalog matching is not implemented.
