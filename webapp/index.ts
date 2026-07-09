import ComponentContainer from "sap/ui/core/ComponentContainer";

new ComponentContainer({
    name: "workshop.ticket",
    settings: {
        id: "workshop"
    },
    async: true,
    autoPrefixId: true
}).placeAt("content");
