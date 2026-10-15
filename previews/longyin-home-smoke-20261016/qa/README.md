# PC and simulated-mobile preview QA

## Scope and authorization

The project owner authorized one independent workflow, `.github/workflows/mobile-design-preview.yml`, on 2026-10-16 Asia/Shanghai, solely for prototype PC/mobile testing and necessary setup debugging. It reads `previews/` and writes ephemeral CI results. It has `contents: read`, no deploy/management/business permissions, and does not change `static.yml`, formal deliveries, task state or OpenCart data. This authorization does not extend to any other workflow.

## Implementation

- Reuses the previously submitted `mobile-check.cjs` runner.
- Runs on GitHub-hosted Ubuntu with Node 22, Playwright 1.62.1 and Playwright-installed Chromium.
- Checks out exactly `github.sha`, records it in the artifact, and starts Python HTTP server bound to `127.0.0.1:4173` on that runner.
- Compares served HTML SHA256 with the checked-out `index.html`; no dependency on GitHub Pages cache/deployment.
- Only paths under `previews/` are test targets. Changed draft directories are selected on push; manual dispatch can select a draft. Workflow-only/setup commits default to the existing Longyin draft.
- Uses desktop 1440×1000, plus simulated mobile 375×667, 390×844 and 412×915 CSS pixels. Mobile enables touch and mobile viewport mode at scale factor 1.
- External browser requests are blocked. Only the isolated runner HTTP origin is allowed; real storefront/API actions cannot be triggered by the tests.
- Stores result JSON, Markdown summary, top/full-page/cart-drawer/bottom screenshots, commit identity, target list, installation/browser/server logs as 14-day Actions artifacts, including failed runs. No result commits or deploy loop.

## Checks

Generic checks: exact CSS viewport, horizontal overflow, asset loading, preserved image proportions or cover/contain rendering, square nav icon boxes. Longyin adapter: product/price boundaries, text clipping, search response, coupon state, favourites, simulated cart count, drawer open/close and viewport bounds, category navigation, fixed-bottom nav position and purchase-row visibility at the bottom of scrolling. A 44×44 CSS-pixel mobile tap area is a diagnostic threshold; a failure records a design issue, not an authorization to change an approved baseline.

First actual GitHub-hosted Chromium execution completed on 2026-10-16 01:58 Asia/Shanghai: https://github.com/y5000/tabakojp-design-bridge/actions/runs/38781685736 . Source commit: `2fe05ec03c6a8c2d8414b3db19b5b7f5e8057ec8`. Chromium 151.0.7922.34 actually rendered all four sizes. Desktop passed 21/21 checks. Each simulated mobile size passed 20/22 checks; price text exceeded its container and coupon/favourite hit areas were below the diagnostic 44×44 threshold. The Actions run correctly reported failure for these design findings while browser installation, HTTP server, interaction execution, screenshots and artifact upload all succeeded. The prototype HTML was not changed by this setup task.

The runner now waits for transient toasts/touch highlighting to settle before bottom/drawer evidence capture; this affects capture timing only. The inert `.example` file is the source template for the authorized workflow. Actual execution reports are Actions artifacts, not inferred from source review.

## Remaining limits

These are simulated Chromium mobile contexts, not physical iPhones or Safari. Physical device safe area, pixel comparison against the AI design master, and real backend/account/payment/order/inventory behavior remain not_tested. Screenshots support visual inspection; DOM/geometry checks alone do not prove pixel fidelity.

## Work environment finding (historical)

Cloud Browser exposed no viewport/device setter. Local Playwright existed but its bundled browser was absent. Its browser download returned an invalid archive. Official Google Chrome downloaded successfully, but actual startup was blocked by the Work sandbox with `socket() failed: Operation not permitted (1)`. No more local browser launch attempts are needed. These findings do not imply that any mobile viewport was tested.
