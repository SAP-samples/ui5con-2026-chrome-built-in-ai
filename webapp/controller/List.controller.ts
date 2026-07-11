import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import Event from "sap/ui/base/Event";
import MessageToast from "sap/m/MessageToast";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import { ai, type AiHooks } from "../model/ai";

/**
 * List Report — the support inbox.
 *
 * exercise-2: onAnalyzeAll now iterates the visible tickets and
 * calls the Summarizer + LanguageDetector APIs. Results land in the shared
 * `ai>/results/<ID>` bag which the table cells bind to via formatters.
 *
 * @namespace workshop.ticket.controller
 */
export default class List extends Controller {

    public onInit(): void {
        void this._probeAiStatus();
    }

    private async _probeAiStatus(): Promise<void> {
        const oAiModel = (this.getOwnerComponent() as UIComponent).getModel("ai") as any;
        const status = await ai.status();
        oAiModel.setProperty("/summarizer", status.summarizer);
        oAiModel.setProperty("/translator", status.translator);
        oAiModel.setProperty("/languageDetector", status.languageDetector);
        oAiModel.setProperty("/languageModel", status.languageModel);
    }

    public onOpenDetail(oEvent: Event): void {
        const oItem = oEvent.getSource() as any;
        const oContext = oItem.getBindingContext();
        if (!oContext) return;
        const sKey = encodeURIComponent(oContext.getProperty("ID"));
        (this.getOwnerComponent() as UIComponent).getRouter().navTo("detail", { key: sKey });
    }

    public onRefresh(): void {
        const oBinding = (this.byId("ticketTable") as any).getBinding("items");
        oBinding?.refresh();
    }

    /**
     * Iterate the tickets currently in the table and run three AI operations:
     *   1. Summarizer + LanguageDetector (concurrently)
     *   2. If not English → Translator (source → en) to feed the classifier
     *   3. Prompt API with `responseConstraint` (JSON Schema) → {sentiment, category, priority}
     *
     * All results are cached in the shared `ai>/results/<ID>` bag.
     */
    public async onAnalyzeAll(): Promise<void> {
        const oAiModel = (this.getOwnerComponent() as UIComponent).getModel("ai") as any;
        const oTable = this.byId("ticketTable") as any;
        const aItems = oTable.getItems();
        const oBundle = ((this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel)
            .getResourceBundle() as ResourceBundle;

        // Only rows that still need analysis — used for the "n/total" progress label
        const pending = aItems.filter((oItem: any) => {
            const oCtx = oItem.getBindingContext();
            const id: string = oCtx?.getProperty("ID");
            const body: string = oCtx?.getProperty("body") || "";
            return body && !(oAiModel.getProperty("/results")[id]?.priority);
        });
        const total = pending.length;
        let done = 0;

        // Piped into every ai.* call so first-run model downloads move the ProgressIndicator
        const hooks: AiHooks = {
            onProgress: (pct: number) => oAiModel.setProperty("/progress", pct)
        };
        const setStage = (key: string): void => oAiModel.setProperty("/busyText",
            oBundle.getText(key, [String(done + 1), String(total)]) as string);

        oAiModel.setProperty("/busy", true);
        oAiModel.setProperty("/progress", 0);
        oAiModel.setProperty("/busyText", oBundle.getText("ai.busy.analyzing", ["0", String(total)]) as string);
        try {
            for (const oItem of aItems) {
                const oCtx = oItem.getBindingContext();
                if (!oCtx) continue;
                const id: string = oCtx.getProperty("ID");
                const body: string = oCtx.getProperty("body") || "";
                if (!body || (oAiModel.getProperty("/results")[id]?.priority)) continue;

                setStage("ai.busy.analyzing");
                const [langs, summary] = await Promise.all([
                    ai.detectLanguage(body, hooks).catch(() => [{ detectedLanguage: "und", confidence: 0 }]),
                    ai.summarize(body, hooks).catch((e: Error) => `(summary failed: ${e.message})`)
                ]);
                const language = langs[0]?.detectedLanguage ?? "und";
                this._setResult(oAiModel, id, { language, summary });

                // Translate to English if needed so the classifier sees consistent input
                let bodyEn = body;
                if (language !== "en" && language !== "und") {
                    oAiModel.setProperty("/busyText", oBundle.getText("ai.busy.translating") as string);
                    bodyEn = await ai.translate(body, language, "en", hooks).catch(() => body);
                }

                oAiModel.setProperty("/busyText", oBundle.getText("ai.busy.classifying") as string);
                const cls = await ai.classify(bodyEn, hooks).catch((e: Error) => {
                    // eslint-disable-next-line no-console
                    console.warn("classify failed", e);
                    return null;
                });
                if (cls) this._setResult(oAiModel, id, cls);

                done++;
            }
            MessageToast.show("Analysis complete");
        } finally {
            oAiModel.setProperty("/busy", false);
            oAiModel.setProperty("/busyText", "");
            oAiModel.setProperty("/progress", 0);
        }
    }

    private _setResult(oAiModel: any, id: string, patch: Record<string, unknown>): void {
        const results = { ...oAiModel.getProperty("/results") };
        results[id] = { ...(results[id] ?? {}), ...patch };
        oAiModel.setProperty("/results", results); // new object ref → binding refresh
    }

    // ── Formatters ────────────────────────────────────────────────────────
    public fmtLanguage(id: string, results: Record<string, any>): string {
        return results?.[id]?.language ?? "—";
    }
    public fmtSummary(id: string, results: Record<string, any>): string {
        return results?.[id]?.summary ?? "";
    }
    public fmtSentiment(id: string, results: Record<string, any>): string {
        return results?.[id]?.sentiment ?? "—";
    }
    public fmtSentimentState(id: string, results: Record<string, any>): string {
        const s = results?.[id]?.sentiment;
        return s === "positive" ? "Success" : s === "negative" ? "Error" : s === "neutral" ? "Information" : "None";
    }
    public fmtPriority(id: string, results: Record<string, any>): string {
        return results?.[id]?.priority ?? "—";
    }
    public fmtPriorityState(id: string, results: Record<string, any>): string {
        const p = results?.[id]?.priority;
        return p === "high" ? "Error" : p === "medium" ? "Warning" : p === "low" ? "Success" : "None";
    }
}
