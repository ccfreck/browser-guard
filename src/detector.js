;(function (root) {
  const ssnPattern = /\b(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/
  const licensePattern = /\b(?:driver'?s? license|driver license|DL number|license number)\s*(?:#|number|no\.?)?\s*[:#-]?\s*[A-Z0-9-]{5,20}\b/i
  const healthPattern = /\b(?:diagnos(?:is|ed)|prescription|medication|medical history|health condition|treatment|symptoms?|diabetes|asthma|cancer|HIV|pregnan(?:t|cy)|bipolar|depression|anxiety|epilepsy|heart disease)\b/i

  function detectSensitiveData(text) {
    const findings = []
    if (ssnPattern.test(text)) findings.push("Social Security number")
    if (licensePattern.test(text)) findings.push("driver's license number")
    if (healthPattern.test(text)) findings.push("health-related information")
    return findings
  }

  const detector = { detectSensitiveData }
  if (typeof module !== "undefined" && module.exports) module.exports = detector
  else root.BrowserGuardDetector = detector
})(globalThis)
