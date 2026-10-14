(() => {
  const detector = globalThis.BrowserGuardDetector
  let dialog
  let continueAction
  let pendingText
  let bypassText

  function getComposer() {
    const composer = document.querySelector("#prompt-textarea") ||
      document.querySelector('[contenteditable="true"]') ||
      document.querySelector("textarea")
    return composer && composer.getClientRects().length ? composer : null
  }

  function getText(composer) {
    return "value" in composer ? composer.value : composer.innerText || composer.textContent || ""
  }

  function getSendButton(composer) {
    const form = composer.closest("form")
    return form?.querySelector('button[data-testid="send-button"], button[aria-label*="Send" i]') ||
      document.querySelector('button[data-testid="send-button"], button[aria-label*="Send" i]')
  }

  function makeDialog() {
    const element = document.createElement("dialog")
    element.setAttribute("aria-labelledby", "browser-guard-title")
    element.innerHTML = `
      <h2 id="browser-guard-title">Sensitive information detected</h2>
      <p class="browser-guard-message"></p>
      <p>Your prompt stays on this device for this check. Review it before sharing.</p>
      <div class="browser-guard-actions">
        <button type="button" data-action="cancel">Go back</button>
        <button type="button" data-action="continue">Continue anyway</button>
      </div>
    `
    const style = document.createElement("style")
    style.textContent = `
      dialog.browser-guard-dialog { border: 0; border-radius: 12px; box-shadow: 0 12px 48px #0006; color: #202123; font: 16px/1.5 system-ui, sans-serif; max-width: 440px; padding: 24px; width: calc(100% - 48px); z-index: 2147483647; }
      dialog.browser-guard-dialog::backdrop { background: #0008; }
      dialog.browser-guard-dialog h2 { font-size: 20px; margin: 0 0 12px; }
      dialog.browser-guard-dialog p { margin: 0 0 12px; }
      dialog.browser-guard-dialog .browser-guard-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
      dialog.browser-guard-dialog button { border: 1px solid #999; border-radius: 6px; cursor: pointer; font: inherit; padding: 8px 12px; }
      dialog.browser-guard-dialog [data-action="continue"] { background: #202123; border-color: #202123; color: white; }
    `
    element.className = "browser-guard-dialog"
    element.addEventListener("click", event => {
      const action = event.target.closest("button")?.dataset.action
      if (action === "cancel") {
        continueAction = null
        pendingText = null
        element.close()
      } else if (action === "continue") {
        const actionToRun = continueAction
        const checkedText = pendingText
        continueAction = null
        pendingText = null
        element.close()
        bypassText = checkedText
        actionToRun?.()
        setTimeout(() => { bypassText = null }, 2000)
      }
    })
    document.documentElement.append(style, element)
    return element
  }

  function warnIfSensitive(event, composer, action) {
    if (!composer) return
    const text = getText(composer)
    if (bypassText === text) return
    const findings = detector.detectSensitiveData(text)
    if (!findings.length) return

    event.preventDefault()
    event.stopImmediatePropagation()
    if (dialog?.open) return
    if (!dialog) dialog = makeDialog()
    dialog.querySelector(".browser-guard-message").textContent =
      `This prompt may contain: ${findings.join(", ")}.`
    continueAction = action
    pendingText = text
    dialog.showModal()
    dialog.querySelector('[data-action="cancel"]').focus()
  }

  document.addEventListener("click", event => {
    const button = event.target.closest?.('button[data-testid="send-button"], button[aria-label*="Send" i]')
    if (!button) return
    const composer = getComposer()
    warnIfSensitive(event, composer, () => button.click())
  }, true)

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return
    const composer = event.target.closest?.('#prompt-textarea, [contenteditable="true"], textarea')
    if (!composer) return
    warnIfSensitive(event, composer, () => {
      const button = getSendButton(composer)
      if (button) button.click()
      else composer.closest("form")?.requestSubmit()
    })
  }, true)

  document.addEventListener("submit", event => {
    const form = event.target
    const composer = form.querySelector("#prompt-textarea, [contenteditable='true'], textarea")
    if (!composer) return
    const button = event.submitter || getSendButton(composer)
    warnIfSensitive(event, composer, () => {
      if (button) button.click()
      else form.requestSubmit()
    })
  }, true)
})()
