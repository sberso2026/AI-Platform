import type { IntentClassifier } from "@rtb/types";

export class KeywordIntentClassifier implements IntentClassifier {
  async classify(message: string): Promise<string> {
    const lower = message.toLowerCase();

    if (/engineering|design|structural|approve|certif/.test(lower)) return "engineering";
    if (/workflow|approval|review|process/.test(lower)) return "workflow";
    if (/document|knowledge|search|rag/.test(lower)) return "knowledge";
    if (/sensor|telemetry|twin|asset|fleet/.test(lower)) return "operations";
    if (/navigate|show|list|status|help/.test(lower)) return "navigation";
    if (/analyz|report|forecast|predict/.test(lower)) return "analysis";

    return "general";
  }
}
