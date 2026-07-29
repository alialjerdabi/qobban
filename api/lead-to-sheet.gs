/**
 * Google Apps Script — lead destination for POST /api/lead.
 *
 * Appends every website lead to a spreadsheet and emails the manager.
 * This is not part of the deployed site; it runs inside Google. Paste it into
 * the Apps Script editor attached to the sheet.
 *
 * SETUP (about ten minutes, once)
 *  1. Create a Google Sheet. The tab name does not matter — the script uses
 *     a tab called "Leads" if one exists, otherwise the first tab.
 *  2. Extensions → Apps Script. Delete the placeholder, paste this file.
 *  3. Set NOTIFY and SECRET below. SECRET is any long random string.
 *     Set SHEET_ID too if this script is standalone rather than opened
 *     from the sheet. Then run test_ (not doPost) to check it writes.
 *  4. Deploy → New deployment → type "Web app".
 *       Execute as: Me.   Who has access: Anyone.
 *     ("Anyone" is required — Vercel posts without a Google login. SECRET is
 *      what actually guards the endpoint.)
 *  5. Copy the /exec URL. In Vercel → Settings → Environment Variables set:
 *       LEAD_WEBHOOK_URL = https://script.google.com/macros/s/AKfy.../exec?key=YOUR_SECRET
 *     The key goes in the query string, not a header: Apps Script does not
 *     pass the Authorization header through to doPost, so LEAD_WEBHOOK_KEY
 *     cannot be used here. Leave that variable unset.
 *  6. Redeploy the site, submit a real quote, confirm the row and the email.
 *
 * Re-deploying after an edit: Deploy → Manage deployments → edit → New version.
 * The /exec URL stays the same.
 */

var NOTIFY = 'CHANGE_ME@example.com';   // who gets the alert
var SECRET = 'CHANGE_ME';               // must match ?key= in LEAD_WEBHOOK_URL
var TAB    = 'Leads';               // falls back to the first tab if absent

/* The spreadsheet to write to, taken from its URL:
   docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
   Leave blank only if this script was opened from the sheet itself via
   Extensions → Apps Script. A standalone project has no sheet attached. */
var SHEET_ID = '';

/* Order of the sheet columns. Status is ours, never written by the site —
   it stays blank so it can be filled in by hand, or ignored entirely. */
var COLUMNS = ['receivedAt', 'name', 'phone', 'email', 'service', 'property',
               'area', 'dimensions', 'timeline', 'notes', 'message', 'source',
               'Status'];

function doPost(e) {
  if (!e || !e.parameter || e.parameter.key !== SECRET) {
    return json({ ok: false, error: 'unauthorised' });
  }

  var lead;
  try {
    lead = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_json' });
  }

  var sheet = target_();
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);

  sheet.appendRow(COLUMNS.map(function (c) {
    return c === 'Status' ? '' : (lead[c] || '');
  }));

  notify(lead);
  return json({ ok: true });
}

/** The tab to write to. Falls back to the first tab because getSheetByName
    is case-sensitive, and a lead is too valuable to drop over spelling. */
function target_() {
  var book = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActive();
  if (!book) {
    throw new Error('No spreadsheet. Set SHEET_ID to the id in your sheet URL ' +
                    '(docs.google.com/spreadsheets/d/THIS_PART/edit), or open ' +
                    'this script from the sheet via Extensions → Apps Script.');
  }
  return book.getSheetByName(TAB) || book.getSheets()[0];
}

function notify(lead) {
  if (NOTIFY === 'CHANGE_ME@example.com') return;

  var body = COLUMNS.filter(function (c) { return c !== 'Status' && lead[c]; })
    .map(function (c) { return c + ': ' + lead[c]; })
    .join('\n');

  MailApp.sendEmail({
    to: NOTIFY,
    subject: 'New lead — ' + (lead.service || 'enquiry') + ' — ' +
             (lead.name || 'no name'),
    body: body + '\n\nReply on WhatsApp: https://wa.me/' +
          String(lead.phone || '').replace(/[^\d]/g, ''),
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Run this from the Apps Script editor (select test_, press Run) to confirm
   the sheet write and the email before pointing the live site at it. */
function test_() {
  var sheet = target_();
  var before = sheet.getLastRow();

  var res = doPost({
    parameter: { key: SECRET },
    postData: {
      contents: JSON.stringify({
        receivedAt: new Date().toISOString(),
        name: 'Test Client', phone: '+973 3333 3333', email: 'test@example.com',
        service: 'Gate', property: 'Villa / residential', area: 'Riffa',
        dimensions: '4.2 m x 2.1 m', timeline: 'Within 1 month',
        notes: 'Automation needed', source: 'website',
      }),
    },
  });
  if (JSON.parse(res.getContent()).ok !== true) throw new Error('doPost rejected a valid lead');

  /* The email is not proof: it is sent after the write. Check the sheet. */
  var after = sheet.getLastRow();
  if (after <= before) {
    throw new Error('No row was written to "' + sheet.getName() + '".');
  }

  var rejected = doPost({ parameter: { key: 'wrong' }, postData: { contents: '{}' } });
  if (JSON.parse(rejected.getContent()).ok !== false) throw new Error('bad key was accepted');

  Logger.log('ok — wrote row ' + after + ' to "' + sheet.getName() + '" in "' +
             sheet.getParent().getName() + '", bad key rejected');
}
