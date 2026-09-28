// Reuse the same full learning journey audit for both business-logic modules.
process.env.CSHARP_MODULE = "loops";
await import("./audit-csharp-conditions.mjs");
