# Context Index

Task type → the files worth reading. Read these, not the folder. If none fit,
grep for the term. Rules: `.claude/rules/context-loading.md`.

| Task | Read |
|---|---|
| Continuing prior work | `AI/HANDOFF.md` (then only what it names) |
| Company positioning, "who is Qobban" | `00_PROJECT_OVERVIEW.md`, `01_COMPANY_PROFILE.md`, `04_POSITIONING.md` |
| Mission / values / brand strategy | `02_MISSION_VISION_VALUES.md`, `03_BRAND_STRATEGY.md`, `BRAND/Brand_Essence.md` |
| Writing customer-facing copy | `BRAND/Tone_of_Voice.md`, `BRAND/Messaging.md`, `11_GLOSSARY.md` |
| Visual / design work | `BRAND/Color_System.md`, `BRAND/Typography.md`, `BRAND/Logo_System.md`, `BRAND/Brand_Do_and_Dont.md` |
| Social media | `MARKETING/Content_Pillars.md`, `MARKETING/Caption_Guidelines.md`, `BRAND/Social_Media_System.md` |
| Marketing / campaigns / SEO | `MARKETING/Marketing_Strategy.md`, `MARKETING/Content_Strategy.md`, `MARKETING/SEO_Strategy.md` |
| Sales scripts and pipeline | `SALES/Sales_Process.md`, `SALES/CRM_Stages.md`, plus the specific script file |
| Objections / customer segments | `CUSTOMERS/Objections.md`, `CUSTOMERS/Pain_Points.md`, plus the one segment file |
| Pricing / quoting | `10_PRICING_PHILOSOPHY.md`, `08_BUSINESS_MODEL.md`, `SALES/Quotation_System.md` |
| A specific service offering | that one `SERVICES/*.md` + one sibling for structure |
| Client-facing process stage | that one `PROCESS/*.md` + `PROCESS/Client_Journey.md` |
| Internal ops / checklists | the specific `OPERATIONS/*.md` + `OPERATIONS/Roles_and_Responsibilities.md` |
| Website pages / IA | `WEBSITE/Website_Strategy.md`, `WEBSITE/Sitemap.md`, `WEBSITE/Content_Model.md`, plus the page file |
| Web app product spec | `WEB_APP/Product_Requirements_Document.md`, `WEB_APP/Functional_Requirements.md`, plus the module file |
| Web app technical | `WEB_APP/Technical_Architecture.md`, `WEB_APP/Recommended_Tech_Stack.md`, `WEB_APP/Database_Schema.md` |
| Market / competitor / materials research | the specific `RESEARCH/*.md` (+ `RESEARCH/Research_Gaps.md` for what's missing) |
| AI prompts and rules | `.claude/rules/*.md`, `AI/TASK_TEMPLATE.md` |

## Notes

- Most files are still `TBD` stubs. Grep before assuming a file has content.
- Folder `README.md` files are one-line indexes, not content — read one only when
  you don't know which file in that folder you need.
- Terms are defined once, in `11_GLOSSARY.md`.
- Add a row when a task type recurs; that is cheaper than rediscovering the files.
