# Source provenance

## Repository import — 1 November 2026

The user requested the completed local implementation in Nuugarn/Qut. This
checkout retains Qut's main history (base bad77687a4ef96da6e083eff5dcdd7fa2b443907)
and imports the Qut-Bill working copy on codex/unified-documents. Original sibling
working copies and the local preview remain untouched. Ignored artifacts and
browser-session drafts are not included. This import does not merge main or deploy.

Created locally on 2026-10-29 after the user confirmed the design and authorized local implementation only.

Original workspace: `C:\Users\User\OneDrive\文档\ChatGPT\BILL`.

- Qut: branch `codex/english-language`, HEAD `bad7768`; source `index.html` copied from current working tree.
- Bill: branch `codex/bill-local-quality`, HEAD `8d2010e`; `index.html`, `app.js`, `styles.css` copied from current working tree, including its uncommitted improvements.
- Original repositories and their complete histories remain in their original directories; this new repository does not claim to have imported their Git histories.
- `original-files.json` records SHA-256 hashes of original non-.git files before work, for end-of-task comparison.
- New local branch: `codex/unified-documents`. No commits, remote, pushes or deployments were requested or performed.

The confirmed SPEC supersedes older repository instructions requiring separate products and the earlier localStorage/no-persistence behaviors. No data is transferred from old localStorage or removed from the old apps.

## 2026-10-30 — restored original BILL behavior

After explicit user confirmation, Bill/app.js and Bill/styles.css were restored
byte-for-byte from the unchanged sibling Bill working copy. Bill/index.html uses
that same baseline with only document-picker integration, hidden draft notice,
stable signature IDs and the session script. Bill/session.js preserves tab drafts,
including displayed percentages/amounts saved by the prior combined version.
The original repositories remain unchanged.
