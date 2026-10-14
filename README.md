# Browser Guard

Browser Guard is a Chrome extension that helps prevent sensitive information from being shared with public AI tools. Its first version targets ChatGPT and warns before a prompt containing likely sensitive information is submitted.

## MVP scope

- Chrome extension using Manifest V3
- Public ChatGPT (`chatgpt.com`)
- On-device detection of likely U.S. Social Security numbers, driver's license numbers, and health-related information
- A warning lets the user cancel or continue submitting the prompt
- Prompt text is not sent to Browser Guard servers

Detection is best-effort: it may miss sensitive information or flag harmless text. Health-related information can be difficult to identify reliably, so the initial rules should be treated as a starting point rather than a guarantee.

## Proposed architecture

```mermaid
flowchart LR
    U[User] -->|writes prompt| DOM[ChatGPT page]
    DOM -->|submit attempt and prompt text| CS[Content script]
    CS --> DET[Local sensitive-data detector]
    DET -->|no likely match| SUBMIT[Allow submission]
    DET -->|likely match| WARN[Warning UI]
    WARN -->|cancel| STOP[Keep prompt on page]
    WARN -->|continue| SUBMIT
    SUBMIT --> AI[ChatGPT]

    subgraph Extension[Chrome extension - on device]
        CS
        DET
        WARN
    end
```

The content script observes prompt submissions on ChatGPT, runs local checks, and either allows submission or presents a warning. No prompt text needs to leave the browser for detection.

## Development

The repository is currently documentation-only. Extension implementation and local development instructions will be added with the first code change.
