---
name: chrome-webmcp
description: Add Chrome WebMCP tools to Kol's websites so in-browser AI agents can use a site's search, filters or forms directly. Use when asked to make a site "agent-ready", add WebMCP, add toolname/tooldescription to a form, register a tool with document.modelContext, or review a WebMCP change. Covers the declarative form attributes, the imperative registerTool API and its hints, safety rules, progressive enhancement, testing with the flag on and off, and PR-only rollout.
---

# Chrome WebMCP for Kol's websites

WebMCP lets a web page offer "tools" to an AI agent running in the browser. Instead of the agent
guessing at buttons, the page says "here is a search tool, it takes a keyword". Chrome is testing it
as an origin trial, so the API can still change. Check the official pages before each new rollout.

Verified against the official docs on 4 November 2026 (UTC). Sources are listed at the end.

## When to use

- A site has a task an agent would plausibly do for a visitor: search, filter a table, look up a model,
  fill a contact or waitlist form.
- Kol asks for "agent-ready", "WebMCP", or a page that agents can operate.
- Reviewing a PR that adds `toolname`, `tooldescription` or `document.modelContext`.

Skip it for pages with nothing to do (plain articles) and for anything behind a login.

## Per-site tool strategy

1. List the two or three jobs a visitor comes for. One tool per job. Don't overlap tools.
2. Start with the read-only one (usually site search). It is safe and the most useful.
3. Prefer the declarative API (attributes on an existing `<form>`). Use the imperative API only when
   there is no form, or you need hints, or the tool must return structured results.
4. Register tools only while they make sense on the page. Static registration is the normal default.
5. Name tools so it is clear whether they act now (`search_site`) or start a process
   (`start_contact_request`). Keep names under 30 characters.
6. Descriptions say what the tool does and when to use it, in positive language. Under 500 characters.
   Parameter descriptions under 150 characters. Tool output under about 1,500 characters.
7. Accept raw user input (a keyword, a date as typed). Don't make the model do maths or reformat.
   Validate strictly in code, loosely in the schema, and return a clear error the model can act on.

Typical first tools across the estate:

| Site job | Tool | Kind |
|---|---|---|
| Site-wide search | `search_site` on the search form | read-only, declarative |
| Filter a model/price table | `filter_models` | read-only, imperative if no form |
| Newsletter, waitlist, contact | `start_signup` / `start_contact_request` | consequential, human clicks submit |

## Declarative API (HTML attributes)

Exact names from the Declarative API page:

- On `<form>`:
  - `toolname`: the tool name. Required.
  - `tooldescription`: what the tool does. Required. Removing either attribute unregisters the tool.
  - `toolautosubmit`: lets the agent's call submit the form. Without it the agent fills the fields and
    the person must click Submit. Only add it to read-only forms such as search.
- On each form control:
  - `toolparamdescription`: the description for that parameter. If missing, the browser uses the
    control's `<label>`, then `aria-description`.
  - The control's `name` becomes the parameter key. `required` makes it required. `<option>` values
    become the allowed values.
- On the submit event (`SubmitEvent`):
  - `agentInvoked`: true when an agent triggered the submit.
  - `respondWith(promise)`: hands a result back to the agent. Call `event.preventDefault()` first.
- Events on `document.modelContext`: `toolactivated` and `toolcancel` (each has `toolName`).
  Use `addEventListener`; `window.ontoolactivated` / `window.ontoolcancel` are not supported from
  Chrome 156.
- CSS: `:tool-form-active` on the form and `:tool-submit-active` on its submit button while an agent
  is using it.

Minimal search form:

```html
<form toolname="search_site"
      tooldescription="Searches the site for pages by keyword. Returns matching titles and links."
      toolautosubmit>
  <input type="search" name="query"
         toolparamdescription="Keyword or name to look for.">
</form>
<script>
  form.addEventListener('submit', (e) => {
    e.preventDefault();                 // keep normal behaviour for people
    if (!e.agentInvoked) return;
    e.respondWith(Promise.resolve(summariseResults(form.query.value)));
  });
</script>
```

There are no declarative hint attributes. The hints below exist only in the imperative API. Don't
invent attributes such as `toolreadonly`.

## Imperative API (JavaScript)

The object is `document.modelContext` (not `navigator`). Key calls:

- `document.modelContext.registerTool(tool, options)`.
  - `tool`: `name`, `description`, `inputSchema` (JSON Schema), `execute`, optional `annotations`.
  - `execute: async (args, { signal }) => result`.
  - `options`: `{ signal }` (abort it to unregister) and `{ exposedTo: [origins] }` for cross-origin
    use (secure origins only). There is no documented `unregisterTool`.
- `getTools()`, `executeTool()` and the `toolchange` event exist for agents and tooling.
- Cross-origin iframes need `allow="tools"`. The `tools` Permissions Policy defaults to `self`.

`annotations` (all default `false`):

- `readOnlyHint`: the tool only reads. Set it on search and lookup tools.
- `consequentialHint`: the tool has significant or irreversible effects. The browser may ask the
  person to confirm first.
- `untrustedContentHint`: the output contains content the site does not control (user reviews,
  scraped news, third-party text). Sanitise or clearly delimit that output.
- `debugging` (Chrome 156+): tool is for developer tooling only.

```js
if ('modelContext' in document) {
  const controller = new AbortController();
  document.modelContext.registerTool({
    name: 'filter_models',
    description: 'Filters the model table by provider. Returns matching model names and prices.',
    inputSchema: { type: 'object', properties: { provider: { type: 'string' } }, required: ['provider'] },
    annotations: { readOnlyHint: true },
    execute: async ({ provider }) => filterTable(provider),
  }, { signal: controller.signal });
}
```

## Safety rules

- Read-only first. Search and lookups can run without a click.
- Anything with a real-world effect (signups, contact, payments, posting, deleting) stays a human
  click: no `toolautosubmit` on those forms, and `consequentialHint: true` on imperative tools.
- Tag third-party or user-generated output with `untrustedContentHint: true`. Prompt injection cannot
  be fully prevented inside the model, so keep tool output short and factual.
- No secrets client-side. Tools run in the page, so never put API keys, tokens or private endpoints
  in tool code. Call the same public endpoints the page already uses.
- Keep `exposedTo` empty unless a trusted origin truly needs the tool.
- One shared code path: the tool must call the same functions as the UI, and update the UI so the
  person can see what the agent did. Return success only when the page state matches.
- WebMCP needs a secure context. The spec marks `document.modelContext` `[SecureContext]`, so it
  only works over HTTPS (or localhost during development).

## Progressive enhancement

- The site must behave exactly the same without WebMCP. Browsers ignore the unknown attributes.
- Guard script with `if ('modelContext' in document)` and `typeof e.respondWith === 'function'`.
- If you wrap an input in a new `<form>` to make it a tool, always `preventDefault()` on submit so
  Enter does not reload the page.
- Render each declarative tool once per page. Duplicate `toolname`s confuse agents.

## Testing

1. Build and grep the output, for example `grep -o '<form[^>]*toolname[^>]*>' dist/index.html`.
2. Flag off (normal Chrome, Edge, Firefox): the form looks and works as before, Enter does nothing
   new, no console errors.
3. Flag on: open `chrome://flags/#enable-webmcp-testing`, set it to Enabled, relaunch. Use the
   Model Context Tool Inspector extension or the DevTools Application panel to list tools, call the
   tool, and check the output and the UI update.
4. Don't start a dev server just for this on Kol's machines. Test the built files, or a branch
   preview, and ask before opening any port.
5. Real sites need the origin trial token (registration opened in Chrome 149) for visitors.

## Rollout

- PR only, one site and one tool per PR. Draft first. Never push to main, never merge, never deploy.
  Most sites publish from main, so merging is Kol's call.
- In the PR body: what tool was added, its kind (read-only or consequential), the docs URLs and date
  checked, and build evidence.
- Avoid files touched by open PRs where you can; check `gh pr list` first.

## Official sources (read 4 November 2026)

- https://developer.chrome.com/docs/ai/webmcp (overview, flag, origin trial)
- https://developer.chrome.com/docs/ai/webmcp/declarative-api (form attributes, events, CSS)
- https://developer.chrome.com/docs/ai/webmcp/imperative-api (registerTool, annotations)
- https://developer.chrome.com/docs/ai/webmcp/best-practices (naming, schemas, tool count)
- https://developer.chrome.com/docs/ai/webmcp/secure-tools (hints, exposure, character budgets)
- https://webmachinelearning.github.io/webmcp (spec draft, `[SecureContext]`, `ToolAnnotations`)
- https://github.com/GoogleChrome/modern-web-guidance (Chrome agent skills; links WebMCP features)
