# Mobile QA environment draft — not enabled

## Current verification

2026-10-16 Asia/Shanghai, performed by Work:

- Cloud Browser capability inventory: empty; exposed APIs have no device or viewport setter.
- Local Playwright 1.62.1 is installed. Its bundled browser executable is absent.
- Playwright browser download returned a non-ZIP response; that route was stopped.
- Google official Chrome Debian package downloaded and extracted successfully. Chrome reported version 155.0.8059.79.
- Actual Playwright launch failed before opening a page: `FATAL:chrome/browser/process_singleton_posix.cc:297 socket() failed: Operation not permitted (1)`.
- This is a Work execution sandbox restriction. No bypass or security changes were attempted.
- All mobile page rendering, interactions and screenshots remain **not_tested**. Downloading a browser and syntax-checking scripts do not count as a successful browser test.

## Proposed one-time setup

Use an independent GitHub-hosted Actions job after successful `Publish design previews`. Run Playwright Chromium with real mobile viewport contexts at 375×667, 390×844 and 412×915 CSS pixels, device scale factor 1, mobile and touch enabled. It opens the deployed GitHub Pages HTTPS page, never localhost or the OpenCart storefront.

The workflow template is inert at this path. To activate, add it as a new `.github/workflows/mobile-design-preview.yml` file, with separate authorization for that workflow path. Existing deployment workflow and task/status files do not need changes.

`mobile-check.cjs` checks exact viewport, deployed/source HTML hash, horizontal overflow, loaded images, tap target dimensions, product column/price collisions, search, coupon, favourites, demo cart, drawer bounds/close, scroll and fixed-bottom navigation. It stores actual screenshots and JSON as a 14-day Actions artifact. The workflow does not commit results or modify pages, so it cannot create a commit/deploy loop. Changed design directories are selected automatically; manual first-run testing is also supported.

## Honest status and limits

- Runner implementation: draft, syntax checked only; runtime **not_tested**.
- Workflow: template only, **not enabled / not_tested**.
- First successful CI run must be inspected before treating the environment as usable.
- Browser screenshots support visual review; automated checks do not prove pixel-level visual fidelity.
- Physical iPhone Safari, real device safe area, backend, payments, inventory and account operations are outside these checks.
- A failed test reports `rework`; deployment mismatch/launch failure is `not_tested`. A test failure never authorizes marketplace development or changes formal task status.

No secrets, private endpoints, login data or customer data are used.
