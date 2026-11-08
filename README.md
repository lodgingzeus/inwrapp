# inwrap

**Your Instagram year, unfiltered.** inwrap turns your Instagram data export into a tap-through story: your likes,
your DMs, your late nights, the people you talk to most, and what advertisers think you're into. At the end there's a
poster you can save and share.

It runs entirely in your browser. Your export is never uploaded anywhere.

## Privacy

This is the whole point, so here is exactly what happens:

- **Nothing leaves your device.** The zip is opened in a background worker inside the browser tab. There is no server,
  no account and no analytics.
- **Message text is never kept.** While parsing, each message is reduced to who sent it, when, any emoji and
  reactions, and whether it was a shared reel. The text itself is thrown away straight away.
- **Media is skipped.** Photos and videos inside the zip are never unpacked. Only the small JSON data files are read.
- **Close the tab and it's gone.** Your stats live only in memory. Nothing is written to storage.
- **Fonts are bundled** with the app, so even font loading makes no third-party requests.

## Get your export

1. In Instagram, open **Accounts Center → Your information and permissions → Download your information**.
2. Pick **JSON** as the format (not HTML) and **last year** as the date range. Media is optional, and leaving it out
   makes the file much smaller.
3. Meta emails you when it's ready. Download the `.zip` and drop it into inwrap. Don't unzip it.

## What's in the story

Each slide appears only if your export has the data for it.

| | |
|---|---|
| Likes | Your total, how often you liked something while awake, and the accounts you liked most |
| Messages | Sent vs received, your #1 person, your top five, and your longest daily streak with someone |
| Habits | The hour you message most, who replies fastest (and slowest), your most-used emoji, and reels you sent |
| Activity | Saves, stories watched and liked, comments, and videos and posts viewed |
| Connections | Followers, following and recent unfollows |
| Ads | How many advertisers have your data, and the interest categories Instagram has filed you under |
| Summary | A poster of your headline stats, saved as a 1080×1920 image |

Instagram keeps some history, like story views and watched videos, for a few weeks only. Those slides say which
window they cover, and any yearly figure is clearly marked as an estimate.

No export to hand? Hit **Try the demo** to see the story with made-up data.

## Controls

Tap the right side to go forward and the left side to go back, and hold to pause. On a keyboard, use ← and →, space
to pause, and Esc to close. The story respects your system's reduced-motion setting.

## Running it locally

You need Node 22 or newer.

```sh
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Typecheck and production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests (parser, stats, slide rules) |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint |

To check the parser against your own export without opening the browser:

```sh
REAL_EXPORT=/path/to/instagram-export.zip npm run check:export
```

It prints counts only, never names or message content, so the output is safe to paste into an issue.

## How it works

```
zip ──► Web Worker ──────────────────────────────────────► WrappedStats ──► story slides
        reads only the JSON entries it needs (Blob.slice),   (small, typed)
        parses them one at a time, computes the stats
```

- **`src/worker/`** has a small zip reader that seeks straight to the entries it needs, so photos and videos in the
  export add almost nothing to the work. It supports zip64, caps entry sizes and rejects encrypted zips.
- **`src/parse/`** turns the raw export files into compact records. It handles both of Meta's record formats, fixes
  the mojibake Meta's exports apply to non-ASCII text, and matches files by path pattern rather than by full path.
- **`src/stats/`** turns those records into `WrappedStats`, the only thing the UI ever sees.
- **`src/story/`** is the story player: progress bars, gestures, keyboard controls, and the slide registry, which
  leaves out any slide whose data is missing.
- **`src/slides/`** has one file per slide. GSAP runs the animation inside slides and Motion runs the transitions
  between them.

Built with React 19, Vite, TypeScript, Tailwind CSS 4, GSAP, Motion and html-to-image. The typefaces are Bricolage
Grotesque, Instrument Serif and JetBrains Mono.

## Contributing

Please never commit a real export, or real names, numbers or messages from one. `.gitignore` already blocks `*.zip`
and `data/`. Test fixtures under `src/**/__fixtures__/` are synthetic: fake names, fake messages.

## License

[MIT](LICENSE). You're free to use, change and share the code. The fonts keep their own open licences (SIL Open Font
License).

## Disclaimer

inwrap is an independent project. It is not affiliated with, endorsed by or connected to Instagram, Meta or Spotify.
