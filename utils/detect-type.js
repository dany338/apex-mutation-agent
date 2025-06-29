function detectApexClassType(content) {
  if (content.includes("Database.Batchable")) return "Batch";
  if (content.includes("AuraEnabled") || content.includes("@AuraEnabled"))
    return "Controller";
  if (content.includes("Trigger")) return "Trigger";
  if (content.includes("Schedulable")) return "Scheduled";
  return "Unknown";
}

module.exports = { detectApexClassType };
