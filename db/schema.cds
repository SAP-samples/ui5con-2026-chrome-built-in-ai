namespace workshop;

using { managed, cuid } from '@sap/cds/common';

entity Tickets : cuid, managed {
    subject   : String(200);
    body      : LargeString;
    customer  : String(120);
    submitted : DateTime;
    // AI-derived fields (populated on the client by Chrome built-in AI)
    detectedLanguage : String(20);
    summary          : String(500);
    sentiment        : String(20);         // positive | neutral | negative
    category         : String(40);         // billing | technical | account | shipping | other
    priority         : String(10);         // low | medium | high
}
