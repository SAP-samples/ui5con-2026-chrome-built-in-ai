import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type Route from "sap/ui/core/routing/Route";
import { ai, type AiHooks } from "../model/ai";

/**
 * Object Page — a single ticket with translate / analyze / draft-reply actions.
 *
 * exercise-2: onAnalyze fills the summary + language for this
 * ticket. Translation and structured classification arrive in later exercises.
 *
 * @namespace workshop.ticket.controller
 */
export default class Detail extends Controller {

    private _detailModel = new JSONModel({
        showingTranslation: false,
        translatedBody: "",
        draftedReply: ""
    });

    public onInit(): void {
        this.getView()?.setModel(this._detailModel, "detail");
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        (oRouter.getRoute("detail") as Route).attachPatternMatched(this._onRouteMatched, this);
    }

    private _onRouteMatched(oEvent: any): void {
        const key = decodeURIComponent(oEvent.getParameter("arguments").key);
        this.getView()?.bindElement({
            path: `/Tickets(ID=${key},IsActiveEntity=true)`,
            parameters: {
                $select: "ID,subject,body,customer,submitted"
            }
        });
        this._detailModel.setData({ showingTranslation: false, translatedBody: "", draftedReply: "" });
    }

    public onBack(): void {
        window.history.length > 1
            ? window.history.back()
            : (this.getOwnerComponent() as UIComponent).getRouter().navTo("list", {}, true);
    }

    /**
     * Grab the shared `ai` JSONModel plus a tiny helper bundle:
     *   - setStage(key)    → puts a localized label into ai>/busyText
     *   - hooks.onProgress → wires model-download progress into ai>/progress
     * Together these drive the busy overlay + status text + progress bar.
     */
    private _aiUx(): { model: any; bundle: ResourceBundle; hooks: AiHooks; setStage: (k: string) => void } {
        const model = (this.getOwnerComponent() as UIComponent).getModel("ai") as any;
        const bundle = ((this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel)
            .getResourceBundle() as ResourceBundle;
        const hooks: AiHooks = {
            onProgress: (pct: number) => model.setProperty("/progress", pct)
        };
        const setStage = (key: string): void => model.setProperty("/busyText", bundle.getText(key) as string);
        return { model, bundle, hooks, setStage };
    }

    /**
     * Toggle between showing the original message body and its English
     * translation. First press: detect the source language, translate to
     * English, cache in the local `detail` model. Subsequent presses just
     * flip the visibility flag.
     */
    public async onToggleTranslation(): Promise<void> {
        if (this._detailModel.getProperty("/showingTranslation")) {
            this._detailModel.setProperty("/showingTranslation", false);
            return;
        }

        // If already translated once for this ticket, reuse it
        if (this._detailModel.getProperty("/translatedBody")) {
            this._detailModel.setProperty("/showingTranslation", true);
            return;
        }

        const oCtx = this.getView()?.getBindingContext();
        if (!oCtx) return;
        const body: string = oCtx.getProperty("body");
        const id: string = oCtx.getProperty("ID");
        const { model: oAiModel, hooks, setStage } = this._aiUx();

        oAiModel.setProperty("/busy", true);
        oAiModel.setProperty("/progress", 0);
        try {
            // Reuse a previously-detected language if we have one, else detect now
            let lang: string = oAiModel.getProperty("/results")[id]?.language;
            if (!lang || lang === "und") {
                setStage("ai.busy.detecting");
                const detected = await ai.detectLanguage(body, hooks);
                lang = detected[0]?.detectedLanguage ?? "en";
            }

            if (lang === "en") {
                MessageToast.show("Already in English");
                return;
            }

            setStage("ai.busy.translating");
            const translated = await ai.translate(body, lang, "en", hooks);
            this._detailModel.setProperty("/translatedBody", translated);
            this._detailModel.setProperty("/showingTranslation", true);
        } catch (err) {
            MessageToast.show(`Translation failed: ${(err as Error).message}`);
        } finally {
            oAiModel.setProperty("/busy", false);
            oAiModel.setProperty("/busyText", "");
            oAiModel.setProperty("/progress", 0);
        }
    }

    /**
     * Run Summarizer + LanguageDetector for this ticket, then translate to
     * English if needed, then classify with the Prompt API using a JSON
     * Schema (`responseConstraint`). Result goes into `ai>/results/<ID>`.
     */
    public async onAnalyze(): Promise<void> {
        const oCtx = this.getView()?.getBindingContext();
        if (!oCtx) return;
        const id: string = oCtx.getProperty("ID");
        const body: string = oCtx.getProperty("body");
        const { model: oAiModel, hooks, setStage } = this._aiUx();

        oAiModel.setProperty("/busy", true);
        oAiModel.setProperty("/progress", 0);
        try {
            setStage("ai.busy.summarizing");
            const [langs, summary] = await Promise.all([
                ai.detectLanguage(body, hooks),
                ai.summarize(body, hooks)
            ]);
            const language = langs[0]?.detectedLanguage ?? "und";

            let bodyEn = body;
            if (language !== "en" && language !== "und") {
                setStage("ai.busy.translating");
                bodyEn = await ai.translate(body, language, "en", hooks).catch(() => body);
            }
            setStage("ai.busy.classifying");
            const cls = await ai.classify(bodyEn, hooks).catch(() => null);

            const results = { ...oAiModel.getProperty("/results") };
            results[id] = {
                ...(results[id] ?? {}),
                language,
                summary,
                ...(cls ?? {})
            };
            oAiModel.setProperty("/results", results);
            MessageToast.show("Analyzed");
        } catch (err) {
            MessageToast.show(`Analyze failed: ${(err as Error).message}`);
        } finally {
            oAiModel.setProperty("/busy", false);
            oAiModel.setProperty("/busyText", "");
            oAiModel.setProperty("/progress", 0);
        }
    }

    /**
     * Draft a customer-support reply in the customer's language.
     *
     * Strategy:
     *   1. Ask the Writer API (still Origin Trial in Chrome 148 — needs the
     *      OT token embedded in index.html) for an English reply, prompted
     *      with the ticket body as sharedContext and a one-line agent intent.
     *   2. If the customer's language isn't English, translate the draft
     *      back to that language via the stable Translator API.
     *
     * The `ai.ts` shim falls back to the Prompt API when Writer is unavailable.
     */
    public async onDraftReply(): Promise<void> {
        const oCtx = this.getView()?.getBindingContext();
        if (!oCtx) return;
        const id: string = oCtx.getProperty("ID");
        const body: string = oCtx.getProperty("body");
        const { model: oAiModel, hooks, setStage } = this._aiUx();
        const language: string = oAiModel.getProperty("/results")[id]?.language ?? "en";

        oAiModel.setProperty("/busy", true);
        oAiModel.setProperty("/progress", 0);
        try {
            setStage("ai.busy.drafting");
            const draftEn = await ai.draftReply(
                body,
                "acknowledge the issue and outline the next steps",
                hooks
            );
            let draft = draftEn;
            if (language !== "en" && language !== "und") {
                setStage("ai.busy.translating");
                draft = await ai.translate(draftEn, "en", language, hooks).catch(() => draftEn);
            }
            this._detailModel.setProperty("/draftedReply", draft);
            MessageToast.show(`Reply drafted in ${language}`);
        } catch (err) {
            MessageToast.show(`Reply drafting failed: ${(err as Error).message}`);
        } finally {
            oAiModel.setProperty("/busy", false);
            oAiModel.setProperty("/busyText", "");
            oAiModel.setProperty("/progress", 0);
        }
    }

    // ── Formatters (same names as List.controller for consistency) ─────────
    public fmtLanguage(id: string, results: Record<string, any>): string {
        return results?.[id]?.language ?? "—";
    }
    public fmtSummaryOrHint(id: string, results: Record<string, any>): string {
        return results?.[id]?.summary ?? "Click Analyze to generate a summary.";
    }
    public fmtSentiment(id: string, results: Record<string, any>): string {
        return results?.[id]?.sentiment ?? "—";
    }
    public fmtSentimentState(id: string, results: Record<string, any>): string {
        const s = results?.[id]?.sentiment;
        return s === "positive" ? "Success" : s === "negative" ? "Error" : s === "neutral" ? "Information" : "None";
    }
    public fmtCategory(id: string, results: Record<string, any>): string {
        return results?.[id]?.category ?? "—";
    }
    public fmtPriority(id: string, results: Record<string, any>): string {
        return results?.[id]?.priority ?? "—";
    }
    public fmtPriorityState(id: string, results: Record<string, any>): string {
        const p = results?.[id]?.priority;
        return p === "high" ? "Error" : p === "medium" ? "Warning" : p === "low" ? "Success" : "None";
    }
}

