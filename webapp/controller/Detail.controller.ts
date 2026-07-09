import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import type Route from "sap/ui/core/routing/Route";

/**
 * Object Page — a single ticket.
 *
 * starter: shows the raw message body. AI actions come next.
 *
 * @namespace workshop.ticket.controller
 */
export default class Detail extends Controller {

    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        (oRouter.getRoute("detail") as Route).attachPatternMatched(this._onRouteMatched, this);
    }

    private _onRouteMatched(oEvent: any): void {
        const key = decodeURIComponent(oEvent.getParameter("arguments").key);
        this.getView()?.bindElement({
            path: `/Tickets(ID=${key},IsActiveEntity=true)`,
            parameters: { $select: "ID,subject,body,customer,submitted" }
        });
    }

    public onBack(): void {
        window.history.length > 1
            ? window.history.back()
            : (this.getOwnerComponent() as UIComponent).getRouter().navTo("list", {}, true);
    }
}
