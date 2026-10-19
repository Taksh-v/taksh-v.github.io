# Portfolio smoke checks

Run from the repository root:

```bash
node test/smoke.test.js
```

The checks use Node's built-in assertion library, so no package install is needed. They verify the homepage's main navigation and sections, role positioning, project labels, accessibility affordances, metadata, the body-aware project page and image, the sitemap entry, and the branded 404 page.

These are static checks. Before publishing, also open the site at phone and desktop widths and click the product, repository, Colab, résumé, and contact links.
