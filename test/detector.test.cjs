const { test } = require("node:test")
const assert = require("node:assert/strict")
const { detectSensitiveData } = require("../src/detector.js")

test("detects formatted and unformatted SSNs", () => {
  assert.deepEqual(detectSensitiveData("SSN 123-45-6789"), ["Social Security number"])
  assert.deepEqual(detectSensitiveData("SSN 123456789"), ["Social Security number"])
})

test("detects a labeled driver's license number", () => {
  assert.deepEqual(detectSensitiveData("Driver's license: A1234567"), ["driver's license number"])
})

test("detects common health information", () => {
  assert.deepEqual(detectSensitiveData("I was diagnosed with diabetes"), ["health-related information"])
})

test("returns all matching categories without retaining the prompt", () => {
  assert.deepEqual(
    detectSensitiveData("SSN 123-45-6789; diagnosed with asthma"),
    ["Social Security number", "health-related information"],
  )
})

test("does not flag invalid SSN patterns or ordinary prompts", () => {
  assert.deepEqual(detectSensitiveData("Call me at 555-00-1234 about the weather"), [])
})
