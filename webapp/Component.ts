import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";

/**
 * @namespace workshop.ticket
 */
export default class Component extends UIComponent {
    public static metadata = {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"]
    };

    public init(): void {
        super.init();

        // Device model for responsive behaviour
        const oDeviceModel = new JSONModel(Device);
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.setModel(oDeviceModel, "device");

        // AI status model — mirrors the state exposed by ai.ts
        const oAiModel = new JSONModel({
            summarizer: "unknown",
            translator: "unknown",
            languageDetector: "unknown",
            languageModel: "unknown",
            downloadPct: 0,
            busy: false,
            mock: new URLSearchParams(location.search).has("mock")
        });
        this.setModel(oAiModel, "ai");

        // Kick off routing after models are attached
        this.getRouter().initialize();
    }
}
