# Chrome Built-in AI — Cheat Sheet

One-page reference for the four Chrome AI APIs used in this workshop.

## Feature detection

Every API exposes a global on `self`. Always feature-detect first.

```js
if ("Summarizer"       in self) { /* ... */ }
if ("Translator"       in self) { /* ... */ }
if ("LanguageDetector" in self) { /* ... */ }
if ("LanguageModel"    in self) { /* ... */ }   // Prompt API
```

## Availability

Returns `"unavailable" | "downloadable" | "downloading" | "available"`.

```js
await Summarizer.availability();
await Translator.availability({ sourceLanguage: "de", targetLanguage: "en" });
await LanguageDetector.availability();
await LanguageModel.availability();
```

## Create with download monitor

```js
const s = await Summarizer.create({
  type: "tldr",
  length: "short",
  format: "plain-text",
  monitor: m => m.addEventListener("downloadprogress", e => console.log(e.loaded * 100))
});
```

## The four core operations

```js
// Summarize
const summary = await s.summarize(text);          // one-shot
for await (const chunk of s.summarizeStreaming(text)) { /* delta */ }

// Detect language (BCP-47 tags with confidence)
const detector = await LanguageDetector.create();
const [best] = await detector.detect(text);
best.detectedLanguage;                             // e.g. "de"
best.confidence;                                   // 0..1

// Translate (English-pivot — de↔fr goes through en)
const t = await Translator.create({ sourceLanguage: "de", targetLanguage: "en" });
const en = await t.translate(germanText);

// Prompt with structured output (JSON Schema)
const model = await LanguageModel.create({
  initialPrompts: [{ role: "system", content: "You are a JSON classifier." }]
});
const raw = await model.prompt(text, {
  responseConstraint: {
    type: "object",
    required: ["sentiment"],
    properties: { sentiment: { enum: ["positive", "neutral", "negative"] } }
  }
});
const { sentiment } = JSON.parse(raw);
```

## Session hygiene

```js
model.contextUsage;                    // current tokens used
model.contextWindow;                   // total capacity
await model.measureContextUsage(text); // pre-check a candidate prompt
model.destroy();                       // release when done
```

## AbortController

Every long-running call takes a `signal`. Wire it to a Cancel button.

```js
const ctrl = new AbortController();
const stream = model.promptStreaming(text, { signal: ctrl.signal });
// later: ctrl.abort();
```

## Streaming pattern

```js
for await (const chunk of s.summarizeStreaming(text)) {
  // chunk is a delta, not cumulative
  oModel.setProperty("/text", oModel.getProperty("/text") + chunk);
}
```

## Gotchas

- **Desktop only** — no Android, no iOS, no non-Plus Chromebooks
- **English-pivot Translator** — `de↔fr` returns `"unavailable"`; go via English
- **Corporate policy** `GenAILocalFoundationalModelSettings=1` disables everything — use a personal profile
- **First run** may download models (~4 GB). Wire the `monitor` callback for UX
- **User gesture** is required to trigger a download — call `create()` from a button press, not `onInit()`
- **Not available in Web Workers** — call from the main thread
- **Streaming chunks are deltas**, not cumulative — older tutorials showing `"H", "He", "Hel"` are outdated

## Debug pages

- `chrome://on-device-internals` → Model Status + Event Log + interactive Tools panel
- `chrome://components` → "Optimization Guide On Device Model" → Check for update
