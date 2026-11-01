# Verification — 2026-10-31

## Qut repository import — 1 November 2026

- Checked in an isolated checkout based on Nuugarn/Qut main, without changing the existing local Qut/Bill or Qut-Bill preview.
- Destination checkout: npm test 16/16, test:browser 50/50, test:modes 66/66 passed. Existing PDF regression outputs were regenerated in ignored artifacts/.
- npm run test:pages passes with an actual /Qut/ mount: root redirects to /Qut/Qut/index.html, document switching reaches /Qut/Bill/index.html, local assets return no errors, and formatted amounts, words, mode/session restoration work beneath the repository prefix.
- git diff --cached --check passes. Text files use LF; no browser drafts or generated artifacts are staged.
- Publishing scope: codex/unified-documents branch and PR only; main and GitHub Pages are not changed by this import.

## Header modes and billing completeness — latest

### Table/header polish — 31 October 2026

- User approved all three follow-up suggestions: one BILL money column, a single Document layout menu, and optional amount-in-words.
- Unit suite: 16/16 passed, including Thai/English words, zero, satang, 430,000 and upper-limit amounts. Existing browser suite: 50/50 passed. Updated modes suite: 66/66 passed, including formatted amounts, no duplicate money column, word visibility/session persistence, blank-amount warning and invalid-amount blocking.
- Focus normalization initially interfered with clearing the input; selecting normalized text on focus fixes deletion/replacement, and the missing-amount regression passes.
- Isolated browser check uses the four installments totalling 430,000.00, verifies comma-formatted paste/edit/refresh, exact Thai and English words, PDF words on/off, and both mobile dropdown bounds. Test pages use their own browser session.
- Three additional PDFs in artifacts/polish show Thai words on/off and English words. Thai output was visually inspected via Poppler; extracting Thai text can lose combining marks, so text comparisons normalize those separately from visual inspection. Both 375px menu screenshots were inspected and fit within the viewport.
- shared/amount-words.js is dependency-free; BILL draft amounts are saved without grouping commas and legacy drafts remain readable.

- User confirmed the full interview summary and local implementation scope on 31 October 2026. See docs/SPEC.md section 9.
- npm test: 13/13 passed. npm run test:browser: 50/50 passed, no page errors; the previous print test now acknowledges the intentionally added completeness warning.
- npm run test:modes: 61/61 passed, no page errors. Coverage includes full default, simple/custom/full TH/EN titles, retaining hidden values, refresh and section switching, restoring all custom switches, revealing identity again, 375px viewport width, BILL contact/due-date persistence, edit/print-anyway paths, no identity warning in simple mode, missing item amount warning, and invalid amounts still blocking printing.
- QUT simple-mode arithmetic verified: 10,000 goods - 1,000 discount + 500 extra, plus VAT 665 = 10,165. Modes do not change the arithmetic.
- 12 actual short A4 PDFs cover both apps × all three modes × TH/EN. pypdf checks prove hidden customer/project/bank/terms text is absent in simple output and present in full/custom output. Outputs and extraction audit: ignored artifacts/modes/.
- Two additional partial-custom PDFs retain a visible customer while excluding disabled project and bank content; pypdf verified both outputs under artifacts/modes/partial/.
- Poppler rendered TH simple/full QUT/BILL samples and all four were visually inspected. Totals align to the right after hiding optional content. Existing browser suite also regenerated multipage QUT/BILL TH/EN PDFs.
- SHA-256 manifest: 10 original sibling files checked, zero changes. App code adds no runtime dependency.
- Native hardware/OS printing is not automated; button invocation and Chrome-rendered PDF output are checked separately. Test PDFs use synthetic data, not the user's live draft.

## Previous baseline — 2026-10-30

The user confirmed restoring BILL to its pre-combination interface and manual percentage/amount entry, while keeping tab drafts. The document selector now opens from the original header title; the separate nav strip and routine draft notices were removed.

## Executed

- npm test: **13/13 passed** (6 quotation money tests and 7 original BILL amount/date tests).
- node tests/browser.cjs with installed Chrome/Playwright: **49 checks passed**, zero JavaScript page errors.
- BILL calculation/input behavior comes from the original sibling. Later user-requested UI changes simplify the header, remove the dashboard/section numbers, and add green table grid styling. Session handling is isolated in Bill/session.js.
- Original-file SHA-256 manifest: **10 checked, zero changed** in the sibling Qut/Bill repositories.
- Browser coverage: menu at the original title; no extra nav strip or draft notices; click, outside-click, Enter and Escape; switching and refreshing independent drafts; original manual amounts unaffected by percentage edits; original company button; signatures and language saved.
- A synthetic draft using the previous combined version's schema was loaded: displayed amount, percentage, project and signer all retained without recalculation. Empty BILL drafts also restore correctly.
- QUT arithmetic, optional discounts, VAT, print-button validation and session behavior continue to pass.
- Original BILL print invocation and invalid-amount handling pass. No contract field, calculation-mode selectors, allocation warnings or added New Document button remain.
- Desktop 1440 × 1100 and viewport 375 × 812 checked. Additional targeted TH/EN mobile menu checks verify visible choices and no horizontal page overflow in either section.
- Targeted latest UI check: both headers measure 60px high, 12px/16px padding and 16px title font at 1108px width; QUT background rgb(26,60,94), BILL rgb(33,79,64). Logo/dashboard/numbered badges are absent. Green header/grid also rendered correctly in a short BILL PDF. Browser regression checks remain 49/49; unit checks remain 13/13.
- Print-header follow-up: enlarged the A4 installment-number column from 35px to 48px and prevented table-heading wrapping. Chrome print-media text ranges confirm all five visible TH/EN column headings occupy one line. Short and repeated-header PDFs regenerated; first and continuation pages visually inspected. The BILLING NOTE subtitle is removed.
- Six browser-rendered A4 test PDFs regenerated: QUT short TH (1 page), QUT EN/TH long (5 pages each), BILL short TH (1 page), BILL EN/TH long (4 pages each).
- PDF extraction confirms final items, values and notes with no section navigation in printed content. Restored BILL short and long output rendered using Poppler and reviewed visually. Pagination follows the original BILL CSS; long output can place signatures after the page containing totals, as in that baseline.
- Native OS print dialogs/hardware printing, other browsers and physical mobile devices were not tested. Invocation uses a print spy; layout uses actual Chrome PDF rendering.

## Reproduce

npm test needs Node only. For browser checks, use an existing Playwright module with PLAYWRIGHT_MODULE and optionally BROWSER_EXECUTABLE, then run npm run test:browser. Generated screenshots, PDF samples and browser-results.json are in ignored artifacts/.

QUT computes integer satang using shared/money.js. BILL uses its original strict amount parser and integer-satang sum; percentage is informational. Some shaped Thai combining glyphs do not extract perfectly with pypdf, so text extraction was checked separately from visual rendering.

Tab/session restoration can restore sessionStorage; closing a tab is not a secure-delete guarantee. No live customer documents, remote services, commits, pushes or deployment were used. Before-restoration copies of the combined BILL files are retained under ignored artifacts/before-bill-restore-*.
