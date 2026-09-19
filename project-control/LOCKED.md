# LOCKED production state

The production baseline is commit `5007cfc5e5b3e756400390a36127ed9105d28533`.

Locked without explicit approval:

- series banner;
- four book covers;
- Book 1 and Book 2 3D projections;
- book description and literary text;
- section order, typography, palette, and responsive geometry;
- audiobook placeholder.

Allowed in this change:

- replace only the obsolete local subscription form with the approved public Google Form CTA;
- preserve the subscription section's locked heading, copy, styling, dimensions, spacing, colors, and responsive footprint.

Checksums in `ASSETS_MANIFEST.md` are authoritative for locked runtime assets.

Approved exception for the 2026-09-19 analytics delta:

- add a compact consent-gated analytics strip when no preference is stored;
- add a factual Google Analytics disclosure and preference-control button on the privacy page;
- add non-visual local analytics runtime/CSP allowances and event measurement;
- do not change approved book/series visuals, literary copy, section order, typography, palette, or responsive geometry underneath the consent UI.
