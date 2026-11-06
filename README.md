# TableFlow

TableFlow is a standalone English restaurant-ordering demo built with HTML, CSS, Tailwind CSS, and vanilla JavaScript. It has no application framework, backend, database server, or external runtime API. Vite is used only to run and build the static frontend.

Live site: https://yasmeenalqady.github.io/onlineorder/

## Run locally

```powershell
Set-Location frontend
npm ci
npm run dev
```

Open the local URL printed by Vite. To create a static production build, run `npm run build`; the deployable files are written to `frontend/dist`.

## Demo features

- Browse, search, and filter the sample menu.
- Add meals to a persistent cart and place sample orders.
- Create a demo customer account and view its order history and status.
- Sign in as an administrator to manage sample meals, categories, and orders.
- Data is stored in this browser's local storage; clearing site data resets the demo.

Demo administrator: `admin@example.test` / `TableFlow!2026`  
Demo customer: `customer@example.test` / `DemoUser!2026`

This is a front-end demonstration, not a production ordering or authentication system. Browser-local data is not shared across devices and can be changed by the browser user. Do not enter real passwords, customer details, or payment information.

## Project files

The source site is in `frontend/`: the HTML entry point, Tailwind/CSS styles, vanilla JavaScript pages, and sample images. The root `index.html`, `assets/`, and `menu-images/` are the built static files used by GitHub Pages. After changing the source, run `npm run build` in `frontend/` and copy the contents of `frontend/dist/` to the repository root before pushing to `main`.
