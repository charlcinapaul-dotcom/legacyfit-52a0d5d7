
## Milestone Audio Narration During the Walk

### What's happening now
The `ActiveWalkScreen` shows a "Walking With [Queen]" banner that updates as the walker reaches each mile marker. The banner shows the queen's quote but there is no audio — the story is purely visual.

### What needs to be built

When the walker reaches a new mile marker (i.e. the "current stop" changes), the app will automatically read aloud the queen's full story from `ROUTE_STOPS[stop].desc` using the browser's built-in **Web Speech API** (`window.speechSynthesis`). This requires no API key, no backend, and works on all modern mobile browsers.

---

### Behaviour spec

| Event | Audio action |
|---|---|
| Walk starts (0.0 mi) | Read the Sojourner Truth story (stop 01) |
| Walker crosses a new mile marker | Stop current narration → read new queen's story |
| Walk is paused | Pause the speech |
| Walk is resumed | Resume the speech |
| Walk ends (Finish) | Cancel all speech |
| Tab/app goes to background | Speech continues (browser-native) |

A small audio indicator (animated sound wave icon + "Now Narrating" label) will appear in the queen banner while speech is playing, so the user can see what's happening. A mute/unmute toggle button will also be provided in the controls bar.

---

### Technical approach

**Use Web Speech API** (`window.speechSynthesis`) — no API key or backend needed. This is the correct choice for a free-tier, no-auth feature.

The narration text for each stop comes directly from `ROUTE_STOPS[i].desc` in `src/data/queens.ts`, which already contains the full story for each queen (e.g. _"Born into bondage, she escaped on foot and never stopped moving..."_).

**New hook: `src/hooks/useQueenNarration.ts`**
- Accepts `currentStopIndex: number`, `paused: boolean`, `muted: boolean`
- Uses a `useEffect` that fires when `currentStopIndex` changes → cancels any current utterance → creates a new `SpeechSynthesisUtterance` with the stop's `desc` text → calls `speechSynthesis.speak()`
- Pausing/resuming is handled via `speechSynthesis.pause()` / `speechSynthesis.resume()` in a separate `useEffect` watching `paused`
- Returns `{ isSpeaking, muted, toggleMute }` 

**Changes to `ActiveWalkScreen.tsx`**
1. Accept and call the new `useQueenNarration` hook (or receive its state as props from `FreeWalkApp`)
2. Show a subtle animated "Now Narrating" badge inside the queen banner when `isSpeaking` is true
3. Add a mute/unmute button (speaker icon) next to the Pause/Finish controls

---

### Files changed
- `src/hooks/useQueenNarration.ts` — new hook
- `src/components/free-walk/ActiveWalkScreen.tsx` — wire up narration, add mute toggle + "Now Narrating" indicator
- `src/components/free-walk/FreeWalkApp.tsx` — pass `currentStopIndex` and cancel speech on finish/exit

### No backend changes needed
Web Speech API is entirely client-side.
