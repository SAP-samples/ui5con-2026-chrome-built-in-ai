// Deterministic mock AI for `?mock=1` mode. Same interface as ai.ts's RealAI,
// canned to make the demo work when Chrome AI APIs aren't installed.

import type { Availability, LanguageDetection, TicketClassification, AiHooks } from "./ai";

function guessLang(text: string): string {
    const lc = text.toLowerCase();
    if (/[äöüß]|(bitte|guten|sehr|nicht|meine|ich)/.test(lc)) return "de";
    if (/[ñ¿¡]|(gracias|hola|buenos|no puedo|necesito)/.test(lc)) return "es";
    if (/(bonjour|merci|voulais|s'il|très|vous)/.test(lc)) return "fr";
    return "en";
}

function guessSentiment(text: string): TicketClassification["sentiment"] {
    const lc = text.toLowerCase();
    if (/(unacceptable|refund|angry|kündigen|enttäuschend|urgent|crash|bloqueando|inaccept)/.test(lc)) return "negative";
    if (/(thank|thanks|merci|gracias|love|impressive|great|geniale|bravo)/.test(lc)) return "positive";
    return "neutral";
}

function guessCategory(text: string): TicketClassification["category"] {
    const lc = text.toLowerCase();
    if (/(bill|invoice|rechnung|refund|charge)/.test(lc)) return "billing";
    if (/(login|password|contraseña|account|access|gdpr|dsgvo|datenschutz)/.test(lc)) return "account";
    if (/(order|ship|tracking|paquet)/.test(lc)) return "shipping";
    if (/(crash|bug|error|feature|dark mode|export)/.test(lc)) return "technical";
    return "other";
}

function guessPriority(text: string): TicketClassification["priority"] {
    const s = guessSentiment(text);
    const lc = text.toLowerCase();
    if (s === "positive") return "low";
    if (/(gdpr|dsgvo|refund|kündigen|urgent|crash|bloqueando|inaccept)/.test(lc)) return "high";
    if (s === "negative") return "medium";
    return "low";
}

async function fakeDelay<T>(v: T, ms = 400): Promise<T> {
    await new Promise((r) => setTimeout(r, ms));
    return v;
}

export const mockAI = {
    async status(): Promise<Record<string, Availability>> {
        return {
            summarizer: "available",
            languageDetector: "available",
            languageModel: "available",
            translator: "available"
        };
    },

    async summarize(text: string, _hooks?: AiHooks): Promise<string> {
        // First sentence, trimmed to ~140 chars — good enough for a mock
        const first = text.split(/[.!?]\s/)[0] || text;
        return fakeDelay(first.length > 140 ? first.slice(0, 137) + "…" : first);
    },

    async detectLanguage(text: string, _hooks?: AiHooks): Promise<LanguageDetection[]> {
        return fakeDelay([{ detectedLanguage: guessLang(text), confidence: 0.95 }]);
    },

    async translate(text: string, sourceLanguage: string, targetLanguage: string, _hooks?: AiHooks): Promise<string> {
        if (sourceLanguage === targetLanguage) return text;
        return fakeDelay(`[MOCK ${sourceLanguage}→${targetLanguage}] ${text}`);
    },

    async classify(text: string, _hooks?: AiHooks): Promise<TicketClassification> {
        return fakeDelay({
            sentiment: guessSentiment(text),
            category: guessCategory(text),
            priority: guessPriority(text)
        });
    },

    async draftReply(_ticketBody: string, agentIntent: string, _hooks?: AiHooks): Promise<string> {
        return fakeDelay(
            `Dear customer,\n\nThank you for reaching out. Regarding your request (${agentIntent}), ` +
            `we have reviewed the details and will follow up shortly with next steps.\n\nBest regards,\nSupport Team`,
            600
        );
    }
};
