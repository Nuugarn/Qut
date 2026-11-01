# QUT / BILL combined application

This is the new local repository authorized by the user. Keep the sibling Qut
and Bill repositories unchanged. Follow docs/SPEC.md, which supersedes the old
separate-app/localStorage constraints for this repository.

Publication update, 1 November 2026: the user requested this implementation in
Nuugarn/Qut. This checkout is based on that repository's main history. Use a
codex/* branch and a pull request; preserve GitHub Pages compatibility under
/Qut/. The current request authorizes committing and pushing this branch, not
merging main or deploying. The separate local Qut-Bill preview remains in place.

- Static HTML/CSS/JavaScript, no backend or build dependency.
- Preserve each editor's visual identity and independent document state.
- Session drafts only; no persistent customer/company overrides.
- Native browser printing, with readable multipage A4 output.
- Do not commit, push, create a remote, or deploy without explicit instruction.
- Test monetary calculations, browser editing/session behavior, and real PDF output.

## Active project goal
Read docs/PROJECT-GOAL.md for the header modes/customization goal and interview history. The user confirmed implementation; docs/SPEC.md section 9 is the approved specification. Earlier pending proposals in the interview history are superseded by the confirmed decisions.
