// Chrome Built-in AI shim.
//
// Every controller talks to this module — never to `LanguageModel`, `Summarizer`,
// `Translator`, or `LanguageDetector` directly. That gives us a single seam where
// we can:
//   - swap in the mock implementation via `?mock=1` for offline demos
//   - wire download-progress into the shared `ai` JSONModel
//   - fall back gracefully when a specific API isn't available
//
// The Chrome API globals (`LanguageModel`, `Summarizer`, `Translator`,
// `LanguageDetector`, `Writer`, `Rewriter`) are typed by @types/dom-chromium-ai.

import { mockAI } from "./ai.mock";

export type Availability = "unavailable" | "downloadable" | "downloading" | "available";

export interface LanguageDetection {
    detectedLanguage: string;
    confidence: number;
}

export interface TicketClassification {
    sentiment: "positive" | "neutral" | "negative";
    category: "billing" | "technical" | "account" | "shipping" | "other";
    priority: "low" | "medium" | "high";
}

const CLASSIFICATION_SCHEMA = {
    type: "object",
    required: ["sentiment", "category", "priority"],
    additionalProperties: false,
    properties: {
        sentiment: { enum: ["positive", "neutral", "negative"] },
        category:  { enum: ["billing", "technical", "account", "shipping", "other"] },
        priority:  { enum: ["low", "medium", "high"] }
    }
};

const CLASSIFIER_SYSTEM = `You are a support-ticket triage classifier. \
Read the ticket body and reply with a JSON object matching the schema. \
Rules:
- "priority": "high" for outages, security, regulatory (GDPR), billing disputes, or churn threats.
- "priority": "low" for compliments, feature requests, and thank-you notes.
- "sentiment" reflects the customer's emotional tone.
- "category" picks the closest bucket.`;

export interface AiHooks {
    onProgress?: (pct: number) => void;
    onStatus?: (api: string, s: Availability) => void;
}

class RealAI {
    private _summarizer: any = null;
    private _languageDetector: any = null;
    private _translators: Map<string, any> = new Map();
    private _languageModel: any = null;

    async status(): Promise<Record<string, Availability>> {
        const has = (name: string) => name in self;
        const call = async (name: string, fn: () => Promise<Availability>): Promise<Availability> =>
            has(name) ? (await fn().catch(() => "unavailable")) : "unavailable";

        return {
            summarizer:       await call("Summarizer",       () => (self as any).Summarizer.availability()),
            languageDetector: await call("LanguageDetector", () => (self as any).LanguageDetector.availability()),
            languageModel:    await call("LanguageModel",    () => (self as any).LanguageModel.availability()),
            translator:       await call("Translator",       () => (self as any).Translator.availability({
                sourceLanguage: "de",
                targetLanguage: "en"
            }))
        };
    }

    async summarize(text: string, hooks?: AiHooks): Promise<string> {
        if (!("Summarizer" in self)) throw new Error("Summarizer API not available");
        if (!this._summarizer) {
            this._summarizer = await (self as any).Summarizer.create({
                type: "tldr",
                length: "short",
                format: "plain-text",
                monitor: (m: any) => m.addEventListener("downloadprogress", (e: any) => hooks?.onProgress?.(e.loaded))
            });
        }
        return this._summarizer.summarize(text);
    }

    async detectLanguage(text: string, hooks?: AiHooks): Promise<LanguageDetection[]> {
        if (!("LanguageDetector" in self)) throw new Error("LanguageDetector API not available");
        if (!this._languageDetector) {
            this._languageDetector = await (self as any).LanguageDetector.create({
                monitor: (m: any) => m.addEventListener("downloadprogress", (e: any) => hooks?.onProgress?.(e.loaded))
            });
        }
        const results = await this._languageDetector.detect(text);
        return results.filter((r: any) => r.detectedLanguage !== "und" && r.confidence > 0.4);
    }

    async translate(text: string, sourceLanguage: string, targetLanguage: string, hooks?: AiHooks): Promise<string> {
        if (!("Translator" in self)) throw new Error("Translator API not available");
        if (sourceLanguage === targetLanguage) return text;
        const key = `${sourceLanguage}:${targetLanguage}`;
        let translator = this._translators.get(key);
        if (!translator) {
            translator = await (self as any).Translator.create({
                sourceLanguage,
                targetLanguage,
                monitor: (m: any) => m.addEventListener("downloadprogress", (e: any) => hooks?.onProgress?.(e.loaded))
            });
            this._translators.set(key, translator);
        }
        return translator.translate(text);
    }

    async classify(ticketBody: string, hooks?: AiHooks): Promise<TicketClassification> {
        if (!("LanguageModel" in self)) throw new Error("LanguageModel API not available");
        if (!this._languageModel) {
            this._languageModel = await (self as any).LanguageModel.create({
                initialPrompts: [{ role: "system", content: CLASSIFIER_SYSTEM }],
                expectedInputs: [{ type: "text", languages: ["en"] }],
                monitor: (m: any) => m.addEventListener("downloadprogress", (e: any) => hooks?.onProgress?.(e.loaded))
            });
        }
        const raw: string = await this._languageModel.prompt(ticketBody, {
            responseConstraint: CLASSIFICATION_SCHEMA
        });
        return JSON.parse(raw);
    }

    async draftReply(ticketBody: string, agentIntent: string, hooks?: AiHooks): Promise<string> {
        if ("Writer" in self) {
            const writer = await (self as any).Writer.create({
                tone: "formal",
                length: "medium",
                format: "plain-text",
                sharedContext: `Customer support reply. Original ticket: "${ticketBody}"`,
                monitor: (m: any) => m.addEventListener("downloadprogress", (e: any) => hooks?.onProgress?.(e.loaded))
            });
            return writer.write(agentIntent);
        }
        // Fallback: use the Prompt API when Writer isn't in this Chrome build (still OT as of July 2026)
        if ("LanguageModel" in self) {
            const session = await (self as any).LanguageModel.create({
                initialPrompts: [{
                    role: "system",
                    content: "You draft polite, professional customer-support replies. Reply text only, no preamble."
                }]
            });
            return session.prompt(`Ticket:\n${ticketBody}\n\nDraft a reply. Agent intent: ${agentIntent}`);
        }
        throw new Error("Neither Writer nor LanguageModel is available");
    }
}

const useMock = new URLSearchParams(location.search).has("mock");

export const ai = useMock ? mockAI : new RealAI();
