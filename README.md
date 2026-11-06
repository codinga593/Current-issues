# Cash / Crisis

A six-scene Australian monetary-policy game with exact cash-rate inputs, random midterm outcomes, linked economic conditions, live graphs and policy scoring.

## Run

Open `index.html` in a browser, or serve this directory with any static HTTP server. No packages or build step are required.

## Deploy on Vercel

Import this Git repository into Vercel. Use framework preset **Other**, the repository root as Root Directory, no Build Command and `.` as Output Directory. `vercel.json` supplies this configuration.

## Files

- `index.html`: page structure
- `style.css`: responsive layout and animations
- `app.js`: scenes, decisions, graphs and saved progress
- `model.js`: economic response model and counterfactual policy scoring

Election outcomes are drawn once per campaign and saved locally. Scores compare your policy with holding rates through the same events. Fictional educational scenarios; the browser model is informed by published MARTIN responses and does not run the EViews solver.
