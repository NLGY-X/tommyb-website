# Tommy B

Website for Tommy B, hard trance DJ and producer from Oxford: https://tommybmusic.co.uk

Next.js 16 server with SQLite (`node:sqlite`). Tommy edits gigs, music, bio, links and the press kit at `/admin`.

```bash
npm install
ADMIN_PASSWORD=anything npm run dev
npm test
```

Running, deploying (Docker on the VPS behind Caddy), env vars and how everything fits together: see [HANDOVER.md](HANDOVER.md).
