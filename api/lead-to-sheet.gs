/**
 * Google Apps Script — lead destination for POST /api/lead.
 *
 * Appends every website lead to a spreadsheet and emails the manager.
 * This is not part of the deployed site; it runs inside Google. Paste it into
 * the Apps Script editor attached to the sheet.
 *
 * SETUP (about ten minutes, once)
 *  1. Create a Google Sheet. Name the first tab "Leads".
 *  2. Extensions → Apps Script. Delete the placeholder, paste this file.
 *  3. Set NOTIFY and SECRET below. SECRET is any long random string.
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
var TAB    = 'Leads';

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

  var sheet = SpreadsheetApp.getActive().getSheetByName(TAB);
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);

  sheet.appendRow(COLUMNS.map(function (c) {
    return c === 'Status' ? '' : (lead[c] || '');
  }));

  notify(lead);
  return json({ ok: true });
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

  var rejected = doPost({ parameter: { key: 'wrong' }, postData: { contents: '{}' } });
  if (JSON.parse(rejected.getContent()).ok !== false) throw new Error('bad key was accepted');

  Logger.log('ok — row appended, bad key rejected');
}
