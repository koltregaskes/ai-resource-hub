import fs from 'node:fs';
const posts = [
{
slug:'choosing-an-ai-coding-tool',title:'Choosing an AI coding tool starts with where you review the change',description:'Compare editor, terminal and GitHub coding assistants with a small repository task and a practical review process.',
text:`Our frozen AIRH catalogue contains 268 language models after its suffix-based variant filter. That gives you a list of models, but it cannot tell you which coding application will fit your working day.

A coding tool decides how you supply files, approve commands and inspect changes. The underlying model contributes to the answer, but the application determines much of the work around that answer. Someone maintaining a small website inside an editor has different needs from someone leaving a repository task to run while they attend a meeting. Buying the same model name does not make those experiences interchangeable.

This guide compares ways of working rather than declaring a winner. We read the linked product documentation on 14 November 2026. We have not run a comparative coding test, measured completion rates or checked every subscription entitlement. The catalogue figures below describe our records, not the set of models offered by any particular coding tool.

## The catalogue counts models, while the purchase buys an application

[[TABLE]]

The table shows why a model directory is an awkward shopping list for coding software. Even the active, priced selection says nothing about editor integration, command approval or the quality of a proposed patch. A model can appear in our catalogue without being offered by the application you want. The application's own model selector and current documentation settle that question.

Start with the place where you already read changes. If you spend your day inside an editor, a tool that presents modifications beside the files may reduce the effort of following its work. If your work centres on shell commands and repository scripts, a terminal assistant may feel more natural. If colleagues discuss changes through GitHub issues and pull requests, a service that works in that setting deserves a look.

These are starting points for a trial, not fixed categories. Products increasingly offer several interfaces. The important question is which interface you will actually use, with your repository, your permissions and your review habits. A feature listed on a marketing page is less useful than a change you can understand before accepting it.

## The editor keeps the proposed change beside the code

[Cursor's documentation](https://cursor.com/docs), read on 14 November 2026, describes code understanding, planning, changes and review. That makes an editor-centred workflow a sensible candidate for someone who wants to move between reading a file and discussing a modification without continually changing applications. It does not establish that Cursor produces better code than another product.

For a first exercise, choose an ordinary bug with a visible symptom. Perhaps a search field loses its value when you open a result and return. Write down the current behaviour and the desired behaviour before opening the assistant. Include the command that runs the project and the existing check that matters. A vague request to improve the website makes it harder to judge whether the tool followed instructions.

Ask for an explanation of the likely cause before authorising the edit. The explanation should identify relevant files and a plausible path from the bug to the proposed repair. It need not be long. If the assistant cannot connect its suggested change to the symptom, adding more generated code is unlikely to make review easier.

Then read the diff, meaning the view of added and removed lines. Pay attention to unrelated files as well as the intended repair. A small bug that produces a dependency upgrade, formatting across the repository and a rewritten configuration has become a larger job. You can ask the assistant to reduce that scope before accepting anything.

## Terminal access makes existing project commands part of the conversation

[Claude Code's overview](https://code.claude.com/docs/en/overview), read on 14 November 2026, describes a tool that reads code, edits files and runs commands, with terminal and other interfaces. For a repository with useful build and test scripts, that is a reason to trial it against the commands you already trust. It is not a reason to grant unrestricted access immediately.

The terminal can be intimidating when you are learning, and a friendly explanation does not change what a command does. Before approving a command, you should be able to tell whether it reads files, changes files, installs software or contacts a service. When that distinction is unclear, ask for an explanation and a narrower command. A tool that fits your experience should help you understand the work it proposes.

Existing tests provide a useful boundary. Ask the assistant to reproduce the bug with the project's own test runner, make the smallest relevant repair, and run the same check afterwards. A passing result supports a specific statement about that check. It does not establish that the application is free of defects or that the test actually covers the reported symptom.

Some tasks are easier to judge by running the application. A repaired keyboard shortcut needs trying with the keyboard. A changed form needs an invalid input as well as a valid one. The assistant's final message should distinguish what it executed from what it merely inspected. That distinction is useful regardless of which product you choose.

## GitHub work needs a handover a colleague can review

[GitHub's Copilot documentation](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github), read on 14 November 2026, describes repository questions, planned changes and review on GitHub. Availability depends on the plan and organisation policy. A repository-centred service is worth considering when the natural unit of work is an issue followed by a pull request.

The issue needs enough context to stand alone. State the failing behaviour, the intended result and any files or areas that should stay out of scope. Include reproduction steps that another person can follow. The assistant should not have to infer a private conversation that never reached the repository. Clear handovers also help human colleagues, so the writing is useful even if the tool disappoints.

Review the resulting pull request as you would a colleague's first attempt. Read the description, inspect the changed lines and compare the checks with the original request. If a screenshot or running example would resolve uncertainty, request it. A confident summary and a green badge can coexist with a misunderstanding of the task.

For private repositories, the organisation's rules may decide the shortlist before personal preference does. The permitted service, account type and repository access matter. This guide has not audited vendor contracts or your employer's policy. The person responsible for that repository should confirm what may be connected before a trial uses its code.

## A modest repair exposes more than a polished demonstration

Use one bounded task to compare the workflows you are considering. Save the starting revision, use separate branches and keep the written request unchanged. Record where you had to intervene: finding files, explaining the project, correcting an assumption or reducing the patch. These observations tell you where the application helped and where it created work.

The useful outcome is a repair you can explain and maintain. Count a result as unfinished if you cannot run it or understand its important changes. That is not a claim that one product is incapable. It means this attempt did not yet satisfy the job you set. A follow-up request can resolve it, and the extra work belongs in your notes.

Subscription prices and usage allowances need checking at the point of purchase. API token prices in our model catalogue are not subscription quotes. A bundled plan can include limits, different models or separate charges for particular features. Before committing, find the usage screen and confirm what your trial consumed. The bill and the review experience belong in the same decision.

Choose the tool whose changes you can follow in the setting where you work. Keep the trial branch and its notes as a useful reference for the next renewal. If another product later looks promising, you already have a concrete task to revisit instead of relying on somebody else's demonstration.`
},
{
slug:'ai-small-business-admin-first-workflow',title:'AI for small-business admin works best on a job you can check',description:'A practical first workflow for drafting customer replies from approved business information, with clear boundaries and a reviewable pilot.',
text:`Sixty-five models in our frozen AIRH snapshot are active and have positive input and output prices. That is a selection from our catalogue, not sixty-five ready-made systems for handling your business administration.

For a small business, the useful starting point is a recurring nuisance you can describe. Perhaps customers keep asking the same question about an appointment. Perhaps a person spends the end of each day turning rough notes into a tidy internal summary. An AI assistant may help with the draft, but the surrounding process determines whether somebody can check it and whether an error reaches a customer.

This guide develops one example: preparing replies to routine customer enquiries from an approved information sheet. The business, messages and workflow are illustrative. We have not measured time savings, customer satisfaction or error rates. The model counts come from the frozen snapshot, and the worked selection below explains why they cannot substitute for choosing an application.

## The priced list leaves the business process undecided

[[TABLE]]

Our price selection requires active status and positive prices for both input and output tokens. It is useful when comparing those recorded rates. It does not count business subscriptions, confirm access to your email or show which supplier offers the right agreement for your organisation. A familiar office application and a separate chat service can also use different account arrangements even when their marketing sounds similar.

The first decision is therefore the task and its boundary. In the example, the assistant prepares a suggested reply. A named person reads it and sends it through the existing channel. Refund decisions, changes to a booking and promises about availability stay with the business. This boundary gives the pilot a result somebody can inspect before it affects a customer.

An automatic reply may eventually be appropriate for a narrow category, but a useful draft is already a complete pilot outcome. There is no need to connect a mailbox simply to find out whether the writing helps. A copied, cleared example and an approved information sheet can answer that initial question with fewer moving parts.

## One information sheet gives the draft somewhere to look

The sheet should contain the facts a person would use: opening times, the public contact route, the service being discussed and any approved wording for common questions. Each item needs an owner who can correct it. If staff currently disagree about the answer, an assistant cannot resolve the business decision by producing a fluent sentence.

For an appointment-based business, a useful sheet might explain how customers request a change and who confirms it. It should avoid implying that a request itself changes the booking. That distinction belongs in both the facts and the drafting instruction. Otherwise a polite reply can accidentally sound like a confirmation that nobody has authorised.

The prompt can be plain: draft a reply using only the approved sheet; identify information missing from the enquiry; leave decisions requiring confirmation for the reviewer. It is worth naming the output as a draft inside the internal process, rather than relying on staff to remember that every apparently finished message still needs attention.

The reviewer needs the original enquiry beside the draft. A short reply may omit the very question the customer asked. A longer one may introduce a promise that sounds reasonable but is absent from the sheet. Comparing both texts with the approved facts is more useful than deciding whether the tone feels professional.

## Missing facts should become a question for the owner

Consider a customer asking whether a particular service is available outside normal hours. If the sheet says nothing about exceptions, the draft should not invent a policy. It can suggest wording that asks for details or directs the question to the person responsible. The useful behaviour is making the gap visible before the message is sent.

Write down what counts as an unacceptable draft before trying the examples. In this workflow, that could include inventing a price, confirming an unapproved booking or disclosing information from another enquiry. These are proposed rules for the example, not measured faults in any named model. The business owner must decide which errors matter in their actual work.

Ambiguous enquiries deserve a place in the pilot. A message may contain an old date, refer to a previous conversation or ask several questions at once. A draft that recognises uncertainty can be more useful than a complete-looking answer. Staff should be allowed to discard the draft without having to repair it merely to demonstrate that the pilot was successful.

There also needs to be a route for complaints and unusual requests. The assistant can identify that the example falls outside its instructions and prepare an internal note. The existing person who handles that category remains responsible. A pilot becomes harder to judge when it quietly expands from routine replies into decisions nobody intended to delegate.

## The account and the document permissions affect the choice

[Microsoft's Copilot help centre](https://support.microsoft.com/en-gb/microsoft-365-copilot/), read on 14 November 2026, provides product-specific guidance for its office applications. It is a useful route for checking what your particular Microsoft product supports. It does not establish that every Copilot-labelled account has the same business controls or access to the same files.

Before using real customer information, the business should identify the exact product and account, what information it permits there and who can access the result. That is an operational decision for the business, not something a model comparison can certify. An initial exercise with invented names and cleared enquiries can proceed while the responsible person checks those requirements.

Connecting documents creates another question: which version will the assistant read? A carefully written sheet on one person's laptop is little help if the connected folder contains an older version with different hours. The approved document needs a clear location and an owner. When it changes, the pilot notes should identify which version supplied each set of drafts.

For a business already using office software, trying the approved features there may be easier than adopting a separate system. For another business, copying a few cleared enquiries into an approved chat application may be sufficient. Convenience is worth considering, but it should be assessed against the actual review process and the information involved.

## Useful savings survive the checking stage

The pilot record can be simple. Keep the cleared enquiry, the draft, the final reply and a short reason for any correction. Note the time spent preparing the input and checking the output as well as the drafting time. This is a suggested way to observe your own work; we are not assigning a wage or claiming a return on investment.

After trying the workflow, read the corrections together. Repeated changes to greetings are a different problem from repeated invented promises. The former may suggest a better style instruction. The latter may mean the task needs a narrower boundary or a different tool. Combining both as a single quality score would conceal the distinction the owner needs.

Staff feedback matters here. If the suggested reply saves typing but makes the reviewer search through several documents, the work may simply have moved. If the draft gives a useful starting point while the original enquiry stays easy to inspect, the pilot may be worth continuing. Those conclusions should come from the recorded examples, not from the assistant's description of its own usefulness.

The next decision can remain small: continue drafting this category, change its instructions or stop. Keep the existing customer channel and the named sender clear throughout. A modest process that somebody understands is a better basis for the next experiment than a complicated automation whose mistakes nobody knows how to find.`
},
{
slug:'local-ai-models-laptop-first-run',title:'Running local AI on a laptop means checking the file, memory and connection',description:'Compare Ollama and LM Studio for a first local-model exercise, with practical checks for memory, offline behaviour and a useful result.',
text:`Nine of the 268 language models remaining after filtering our frozen AIRH catalogue have no recorded pricing source. That missing field does not tell you whether a model is free, downloadable or suitable for your laptop.

Local AI means running the model on your own machine for the task in question. You still need software, a compatible model file and enough working memory. A hosted model with a generous context limit does not become a laptop model because its name appears in the same directory. The download, licence and runtime need checking separately.

For a first exercise, use a short piece of non-sensitive text and ask for a summary you can compare with the original. That gives you something useful to inspect without beginning with the hardest document on your drive. This guide compares two routes from their documentation, read on 14 November 2026. We have not installed them for this article or measured laptop performance.

## Missing price provenance says nothing about a downloadable model

[[TABLE]]

The table groups the filtered catalogue by its recorded pricing source. These labels describe our records. They are not a licence classification, a count of locally runnable models or an inventory of free software. We have deliberately avoided deriving a local-model shortlist from those fields, because they do not answer the relevant question.

A candidate for local use needs a model file supported by the chosen application and a licence that permits your intended use. The model publisher's information should identify both. A download page maintained by somebody else may provide a convenient conversion, but it also introduces another party whose files and description you need to understand. The familiar model name alone is insufficient.

The laptop's available memory matters as well as its advertised total. Your operating system and other applications already use some of it. A model file's download size does not describe the whole running process. The context held during a conversation and the software doing the calculation also need memory. That is why a universal claim that a particular laptop size runs a particular model would be misleading here.

## LM Studio offers a visible route into a local conversation

[LM Studio's offline documentation](https://lmstudio.ai/docs/app/offline), read on 14 November 2026, says downloaded models, document chat and a local server can work without an internet connection. Discovering and downloading models require connectivity. That distinction is useful for planning a first session: get the required files before trying the offline part.

For someone who prefers a graphical application, the practical advantage is being able to see the selected model and the conversation together. Before asking a question, check which file is loaded. Similar names may describe different sizes or conversions. Save that exact identifier in your notes so that a later attempt does not silently compare a different file.

Begin with a short request. Ask for a summary of the supplied text and then compare each claim with the original. The first goal is a working local conversation whose output you can inspect. A long wait or an unhelpful answer is useful evidence about that setup, even when the model loaded successfully.

The documentation's statement about local operation applies to the described functions. Extra integrations or remote services need their own check. A local application can still be used as one part of a wider connected workflow. For a simple first exercise, leaving those additions out makes it easier to understand where the text goes.

## Ollama exposes where the model is running

[Ollama's local FAQ](https://docs.ollama.com/faq), read on 14 November 2026, describes the command ollama ps for inspecting loaded models. Its Processor column distinguishes a model loaded on the graphics processor, on the main processor or across both. That is a useful diagnostic when a download succeeds but the conversation is slower than expected.

The graphics processor is often called the GPU. Its dedicated memory, where present, is separate from ordinary system memory. Some machines use a shared arrangement instead, so two laptops with the same headline memory capacity need not behave alike. The application and hardware documentation should settle what your machine supports before you plan around acceleration.

[Ollama's hardware support page](https://docs.ollama.com/gpu), read on 14 November 2026, lists supported graphics hardware and driver requirements. Check the current entry for the actual device rather than assuming the laptop's brand is enough. This guide does not recommend a driver change or certify any particular machine as compatible.

Once the model is loaded, the same short summary exercise can reveal whether the setup is usable. Keep the original text and prompt unchanged when comparing applications. Record the file used and what the runtime reports. If the two applications load different conversions, describe the result as a comparison of those setups, rather than attributing the difference solely to the interface.

## A large context setting can change the memory problem

Context is the text the model can hold in view for a request, including instructions and relevant conversation. A model publisher may advertise a large maximum, while the application uses a smaller setting. Ollama's FAQ documents ways of changing the context setting. The existence of a setting does not establish that your laptop can use the largest value comfortably.

For the first exercise, a short document keeps this variable manageable. If the task later requires more text, increase the amount deliberately and observe whether the application still behaves acceptably. A successful short summary establishes a narrow result. It does not prove that a folder of long reports will fit or that the model will retrieve every important detail.

Document chat may also use retrieval: the application finds selected passages and supplies them to the model. That is different from placing the whole document in view at once. A question about an omitted passage can fail for reasons beyond the model's writing ability. When a result is wrong, check what material the application actually supplied where that information is available.

Quantisation is another term you will meet on download pages. It refers to representing model values with reduced numerical precision, often to reduce storage and memory requirements. Different conversions can trade resource use against output behaviour. Rather than treating a smaller download as automatically equivalent, keep the conversion name with the result and assess it on the task you intend to repeat.

## Offline use needs an offline attempt

After downloading the software and model, try the same cleared task with connectivity disabled if offline operation is a requirement. A successful request then supports a statement about that particular setup and task. It is stronger evidence than a local-looking window while the computer remains connected, though it is not a complete security audit.

The result also needs to remain useful. Read the summary against the original and mark omissions or invented details. If you spend longer repairing it than writing your own note, the setup has not yet earned a place in that workflow. A different model or narrower task may help, but that is a new attempt to evaluate rather than a guaranteed remedy.

For laptop use, observe ordinary practicalities during the trial: responsiveness while other work is open, heat, fan noise and whether you need mains power. These observations are specific to the machine and workload. We provide no battery-life or speed estimate here because none was measured for this guide.

Keep the working model identifier, application version, prompt and a cleared example together. That small record makes a later update easier to assess. You can return to the same task and see what changed instead of relying on memory of how impressive the first answer felt. Local control becomes useful when you can reproduce a result you understand.`
}
];
const snapshot=JSON.parse(fs.readFileSync('src/data/insights/2026-11-14.json','utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const link=s=>escape(s).replace(/\[([^\]]+)\]\((https:[^)]+)\)/g,'<a href="$2">$1</a>');
const tables=[
[['Selection','Records'],['Language-model entries',snapshot.coverage.llmEntries],['After suffix-based variant filtering',snapshot.coverage.afterVariantRemoval],['With release date and positive context window',snapshot.coverage.withReleaseDateAndContext]],
[['Separate selection from filtered catalogue','Records'],['After suffix-based variant filtering',snapshot.coverage.afterVariantRemoval],['Active with positive input and output prices',snapshot.priceSpread.all.length]],
[['Recorded pricing source','Records'],...Object.entries(snapshot.coverage.pricingSourceCounts)]
];
for(const [i,p] of posts.entries()){
const rows=tables[i];
const table='<div class="overflow-x-auto"><table><caption>Frozen AIRH catalogue, 14 November 2026. Selections are defined on the transparency page.</caption><thead><tr>'+rows[0].map(x=>`<th scope="col">${x}</th>`).join('')+'</tr></thead><tbody>'+rows.slice(1).map(r=>'<tr>'+r.map((x,j)=>j===0?`<th scope="row">${x}</th>`:`<td>${x}</td>`).join('')+'</tr>').join('')+'</tbody></table></div>';
const content=p.text.split('\n\n').map(s=>s==='[[TABLE]]'?table:s.startsWith('## ')?`<h2>${escape(s.slice(3))}</h2>`:`<p>${link(s)}</p>`).join('\n');
fs.writeFileSync(`src/pages/blog/${p.slug}.astro`,`---\nimport InsightArticle from '../../layouts/InsightArticle.astro';\n---\n<InsightArticle title=${JSON.stringify(p.title)} description=${JSON.stringify(p.description)} date="2026-11-14" type="Explainer" readTime="7 min" snapshot="2026-11-14" standfirst="${escape(p.description)}">\n${content}\n<p>Counts, selection rules, source dates and limitations: <a href="/transparency/#writer2-practical-tools">transparency receipt</a>.</p>\n</InsightArticle>\n`);
console.log(p.slug,p.text.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').split(/\s+/).length);
}
fs.writeFileSync('src/data/writer2-posts.ts','export const writer2Posts = '+JSON.stringify(posts.map(({text,...p})=>({...p,date:'2026-11-14',type:'Explainer',readTime:'7 min'})),null,2)+';\n');
