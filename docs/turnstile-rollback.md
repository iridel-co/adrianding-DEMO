# Turnstile diagnosis and rollback

Recorded on 2026-10-29. These temporary changes were committed directly to
`main` in two repositories. Use new revert commits; do not reset or force-push
shared history.

## Commit ledger

| Repository | Commit    | Change                                                                                                                                                                |
| ---------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal     | `27fc6b8` | Add the environment-controlled Turnstile bypass.                                                                                                                      |
| Portal     | `8769969` | Hard-code verification off regardless of environment values.                                                                                                          |
| Web        | `7684689` | Add the environment-controlled bypass to both public forms.                                                                                                           |
| Web        | `3a33e94` | Set `TURNSTILE_ENABLED=false` for build and runtime in `vercel.json`. This pre-existing remote commit is included because it also needs attention during restoration. |
| Web        | `f5e02d4` | Hard-code verification off and adapt configuration tests/browser fixtures.                                                                                            |

The documentation-only commit that adds this ledger can remain after rollback.
Pre-diagnosis baselines are Portal `c94a1f9` and Web `f11340c`; preserve later
unrelated work when reverting.

## Restore verification while keeping the environment switch

1. Confirm that the public site key and matching Portal secret are configured,
   with the website hostnames and both verification actions allowed. Set
   `TURNSTILE_ENABLED=true` in both Vercel projects' applicable environments.
2. In the Web repository, restore the environment switch and remove the checked-in
   Vercel override together:

   ```sh
   git revert --no-commit f5e02d4 3a33e94
   git commit -m "chore: restore website Turnstile verification"
   git push origin main
   ```

3. Wait for the Web deployment and verify that both forms obtain verification
   tokens before enforcing verification in Portal.
4. In the Portal repository:

   ```sh
   git revert --no-commit 8769969
   git commit -m "chore: restore portal Turnstile verification"
   git push origin main
   ```

5. Wait for the Portal deployment, then submit both forms and check acceptance,
   saved records and email job results. Deployment variables alone cannot
   re-enable the currently hard-coded bypass.

## Remove all diagnostic code changes instead

As an alternative to the steps above, revert all diagnostic commits newest first
in each repository. Do not run both rollback options. Deploy Web before Portal.

Web:

```sh
git revert --no-commit f5e02d4 3a33e94 7684689
git commit -m "revert: remove temporary website Turnstile diagnosis"
git push origin main
```

Portal:

```sh
git revert --no-commit 8769969 27fc6b8
git commit -m "revert: remove temporary portal Turnstile diagnosis"
git push origin main
```

Inspect and resolve conflicts if later work touches these files. These reversions
change code/configuration and do not delete saved inquiries or registrations.

## Validation and remaining limits

Portal typecheck and 75 focused tests passed. Web formatting, lint, typecheck,
19 tooling tests, production build and OG checks passed using Webpack with an
explicit public CMS URL. Chromium/WebKit passed 136 cases, including both forms
submitting without loading Cloudflare while the old environment flag was true.
Ten verification-mode cases are intentionally skipped while verification is
hard-coded off. Nineteen Firefox cases are blocked by a local profile-launch
failure, so the full local handoff gate is not green.

The existing GitHub workflow also needs `PORTAL_API_URL` for its standalone build.
No hosted root cause or successful live submission has been confirmed. While the
bypass is deployed, the forms have no Turnstile bot protection; other intake,
origin, consent, honeypot, email and payment-account checks remain.
