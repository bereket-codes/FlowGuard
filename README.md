# FlowGuard

A paycheck allocator. Enter your income, choose how to split it, lock the plan in, then come back to a dashboard that shows every birr already assigned.

[![FlowGuard](https://bereket-codes.github.io/Flowguard.jpg)](https://bereket-codes.github.io/FlowGuard/)

**Live:** https://bereket-codes.github.io/FlowGuard/

## What it does

- **Three-step flow** — income, split, confirm.
- **Presets** — 50/30/20, 60/20/20, or a custom split you set yourself.
- **Remaining to allocate** — the plan can't be locked until the categories add up; the guard tells you what is left over.
- **Live recalculation** — change one category and the rest adjust as you type.
- **Dashboard** — after locking in, the plan is shown as a breakdown of what is assigned where.
- **Dark and light theme.**
- **No account, no backend** — the plan is saved in `localStorage`, so nothing leaves the browser.

## Tech

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies to install.

## How to run

```bash
git clone https://github.com/bereket-codes/FlowGuard.git
cd FlowGuard
```

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Files

```
index.html    markup and the three steps
script.js     allocation logic, guards, dashboard, theme, persistence
style.css     layout, theme tokens
```

## Known limitation

The plan lives in the browser. Clearing site data — or opening the app on another device — loses it. That is exactly why the next version adds real accounts.

## Roadmap

- Rebuild as a full-stack app: Next.js + TypeScript frontend, Express/Nest API, PostgreSQL, real authentication so a plan follows you across devices.
- Wrap the category updates in a database transaction so a split can never be saved half-applied.

## License

MIT — see [LICENSE](LICENSE).
