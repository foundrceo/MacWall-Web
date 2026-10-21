# security

if you find a security issue in macwall.app or in this repo, email **support@macwall.app** with the subject `Security report: MacWall`. please don't open a public issue for it.

include the steps to reproduce and what you think the impact is. I'll reply as soon as I can, and I'd appreciate a reasonable window to fix it before you disclose anything publicly.

more on how the site handles security: https://macwall.app/legal/security

## secrets in this repo

nothing secret should ever be committed. real values go in `.env` (ignored) and `.env.example` only lists the names. CI runs gitleaks over the full git history on every push and pull request. you can run the same check locally with `gitleaks git --redact` (`brew install gitleaks`).

the allowlist in `.gitleaks.toml` covers the public analytics ingestion token, the license key alphabet, and one sample key used in the email preview.
