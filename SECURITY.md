# security

if you find a security issue in macwall.app or this repo, please email **support@macwall.app** with subject `Security report: MacWall`.

include enough detail to reproduce the issue, and give us a reasonable window to look at it before public disclosure.

more about how we approach security: https://macwall.app/legal/security

before committing, run `gitleaks git --redact` (install with `brew install gitleaks`).
CI scans the complete Git history on pushes and pull requests. the allowlist is
limited to the public analytics ingestion token, the key generator alphabet, and
the email preview fixture. real environment files and local customer exports
must remain ignored; use `.env.example` to document variable names.
