import { call, reset } from "./demo-data.js";

/* Qobban staff portal — the screens.

   Vanilla, no framework and no build step, like the rest of the stack.

   Shape: one sidebar, one router, one view node. Every screen is a function that
   fetches what it needs and returns nodes; none of them know about each other. That
   is the whole architecture, and it is enough for a portal this size — a framework
   here would be more code to learn than the portal contains.

   The browser never computes a total it then stores: every figure comes back from the
   data layer, so what staff see is what the server will save. */
(function () {
  "use strict";

  // ------------------------------------------------------------ words
  // Arabic first, English second. One table, so a string cannot exist in only one.
  var T = {
    // nav
    dashboard: ["الرئيسية", "Dashboard"], quotes: ["عروض الأسعار", "Quotes"],
    clients: ["العملاء", "Clients"], jobs: ["الوظائف", "Jobs"],
    calendar: ["التقويم", "Calendar"], invoices: ["الفواتير", "Invoices"],
    finance: ["المالية", "Finance"], expenses: ["المصاريف", "Expenses"],
    pricelist: ["الكتالوج", "Catalogue"], team: ["الفريق", "Team"],

    // actions
    newQuote: ["عرض جديد", "New quote"], newClient: ["عميل جديد", "New client"],
    newJob: ["وظيفة جديدة", "New job"], newInvoice: ["فاتورة جديدة", "New invoice"],
    addExpense: ["تسجيل مصروف", "Log expense"], save: ["حفظ", "Save"],
    cancel: ["إلغاء", "Cancel"], send: ["إرسال للعميل", "Send to customer"],
    search: ["بحث", "Search"], back: ["رجوع", "Back"], open: ["افتح", "Open"],
    start: ["ابدأ", "Start"], finish: ["أنهِ", "Finish"], record: ["سجّل دفعة", "Record payment"],
    whatsapp: ["واتساب", "WhatsApp"], call_: ["اتصال", "Call"],

    // fields
    name: ["الاسم", "Name"], phone: ["الهاتف", "Phone"], area: ["المنطقة", "Area"],
    company: ["الشركة", "Company"], vat: ["الرقم الضريبي", "VAT number"], cr: ["س.ت", "CR"],
    email: ["البريد", "Email"], note: ["ملاحظات", "Note"], person: ["فرد", "Person"],
    subject: ["الموضوع", "Subject"], client: ["العميل", "Client"], line: ["بند", "Line"],
    addLine: ["إضافة بند", "Add line"], qty: ["الكمية", "Qty"], rate: ["السعر", "Rate"],
    total: ["الإجمالي", "Total"], subtotal: ["المجموع الفرعي", "Subtotal"],
    discount: ["الخصم", "Discount"], delivery: ["التوصيل والتركيب", "Delivery & fitting"],
    vatLine: ["ضريبة القيمة المضافة", "VAT"], terms: ["الشروط", "Terms"],
    buildUp: ["مواد + عمالة (داخلي)", "Materials + labour (internal)"],
    material: ["تكلفة المواد", "Material cost"], hours: ["الساعات", "Hours"],
    labourRate: ["سعر الساعة", "Hourly rate"], margin: ["الهامش ٪", "Margin %"],
    modeBuild: ["مواد + عمالة", "Materials + labour"], modeUnit: ["سعر الوحدة", "Unit rate"],
    modeFixed: ["سعر مقطوع", "Fixed price"],
    special: ["تقريب الإجمالي إلى", "Round total to"], validity: ["الصلاحية بالأيام", "Valid for days"],
    reason: ["السبب", "Reason"], desc: ["الوصف", "Description"], unit: ["الوحدة", "Unit"],
    cost: ["التكلفة", "Cost"], category: ["الفئة", "Category"], owed: ["المستحق", "Owed"],
    internalNote: ["ملاحظة داخلية (لا تُطبع)", "Internal note (never printed)"],
    amount: ["المبلغ", "Amount"], date: ["التاريخ", "Date"], method: ["طريقة الدفع", "Method"],
    ref: ["المرجع", "Reference"], supplier: ["المورّد", "Supplier"], site: ["الموقع", "Site"],
    crew: ["الفريق", "Crew"], title: ["العنوان", "Title"], from: ["من", "From"], to: ["إلى", "To"],
    role: ["الدور", "Role"], due: ["تاريخ الاستحقاق", "Due"], issued: ["تاريخ الإصدار", "Issued"],
    paid: ["المدفوع", "Paid"], remaining: ["المتبقي", "Remaining"], value: ["القيمة", "Value"],

    // dashboard
    awaiting: ["عروض تنتظر ردًا", "Quotes awaiting a reply"],
    todayJobs: ["وظائف اليوم", "Jobs today"], weekJobs: ["وظائف هالأسبوع", "Jobs this week"],
    overdueInv: ["فواتير متأخرة", "Overdue invoices"],
    collected: ["محصّل هالشهر", "Collected this month"],
    spent: ["مصاريف هالشهر", "Spent this month"],
    netMonth: ["صافي هالشهر", "Net this month"],
    outstanding: ["مستحق على العملاء", "Owed by customers"],
    todaySchedule: ["جدول اليوم", "Today's schedule"],
    needsChase: ["يحتاج متابعة", "Needs chasing"],
    recentSpend: ["آخر المصاريف", "Recent expenses"],

    // states
    draft: ["مسودة", "Draft"], sent_: ["مُرسل", "Sent"], accepted: ["مقبول", "Accepted"],
    rejected: ["مرفوض", "Rejected"], cancelled: ["ملغي", "Cancelled"],
    scheduled: ["مجدول", "Scheduled"], progress: ["جارٍ العمل", "In progress"],
    done: ["منجز", "Done"], unpaid: ["غير مدفوعة", "Unpaid"], partial: ["مدفوعة جزئيًا", "Part paid"],
    paidSt: ["مدفوعة", "Paid"], overdue: ["متأخرة", "Overdue"],

    // empties + messages
    noQuotes: ["لا توجد عروض بعد", "No quotes yet"], noClients: ["لا يوجد عملاء بعد", "No clients yet"],
    noJobs: ["لا توجد وظائف", "No jobs"], noToday: ["ما في وظائف اليوم", "Nothing on today"],
    noInvoices: ["لا توجد فواتير", "No invoices"], noExpenses: ["لا توجد مصاريف", "No expenses"],
    allClear: ["كل شي تمام", "All clear"],
    saved: ["تم الحفظ", "Saved"], sentOk: ["تم الإرسال", "Sent"],
    revenue: ["المحصّل", "Collected"], costs: ["المصاريف", "Costs"], profit: ["الصافي", "Net"],
    sixMonths: ["آخر ٦ أشهر", "Last 6 months"],
    spendByCat: ["المصاريف حسب الفئة", "Spend by category"],
    owedByClient: ["المستحق حسب العميل", "Owed by customer"],
  };
  var lang = localStorage.getItem("qb-lang") === "en" ? 1 : 0;
  var t = function (k) { return (T[k] || [k, k])[lang]; };

  // ------------------------------------------------------------ icons
  // Inline, stroke-based, 24x24. Inline because eight icons are smaller than one
  // request for an icon font, and they inherit currentColor for free.
  var P = {
    home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    truck: "M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
    cal: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M8 2v4M16 2v4",
    receipt: "M4 2v20l2.5-1.5L9 22l3-1.5L15 22l2.5-1.5L20 22V2l-2.5 1.5L15 2l-3 1.5L9 2 6.5 3.5zM8 8h8M8 12h8M8 16h5",
    chart: "M3 3v18h18M7 15v3M12 9v9M17 5v13",
    wallet: "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5M16 12h2",
    grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
    badge: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 11l2 2 4-4",
    plus: "M12 5v14M5 12h14",
    search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3",
    alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2",
    menu: "M3 12h18M3 6h18M3 18h18",
    x: "M18 6 6 18M6 6l12 12",
    check: "M20 6 9 17l-5-5",
    coins: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M15 9a3 3 0 0 0-3-2c-1.7 0-3 .9-3 2.3 0 2.8 6 1.4 6 4.4 0 1.4-1.3 2.3-3 2.3a3 3 0 0 1-3-2M12 5v2M12 17v2",
    box: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
    tool: "M14.7 6.3a4 4 0 0 1 5 5l-10 10-5-5 10-10zM4 20l1.5-1.5",
    zap: "M13 2 3 14h8l-1 8 10-12h-8z",
    dots: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
    out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
    pin: "M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  };
  function ico(name, size) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("width", size || 19); s.setAttribute("height", size || 19);
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2"); s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", P[name] || P.dots);
    s.appendChild(p);
    return s;
  }

  // ------------------------------------------------------------ helpers
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var money = function (n) { return (Number(n) || 0).toFixed(3); };
  var bd = function (n) { return money(n) + " د.ب"; };

  var LOC = function () { return lang ? "en-GB" : "ar-BH"; };
  var dayName = function (d) { return new Date(d).toLocaleDateString(LOC(), { weekday: "long" }); };
  var shortDate = function (d) {
    return new Date(d).toLocaleDateString(LOC(), { day: "numeric", month: "short" });
  };
  var todayISO = function () {
    var d = new Date(); d.setHours(12, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  };
  // "3 days ago" without pulling in a date library for one sentence.
  function ago(stamp) {
    var days = Math.round((Date.now() - new Date(stamp)) / 864e5);
    if (days <= 0) return lang ? "today" : "اليوم";
    if (days === 1) return lang ? "yesterday" : "أمس";
    return lang ? days + " days" : "من " + days + " يوم";
  }

  function toast(msg, bad) {
    var box = $("#toast");
    box.textContent = msg;
    box.className = "toast" + (bad ? " toast--bad" : "");
    box.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { box.hidden = true; }, 3200);
  }

  // A status chip: always the word, with colour only as a second channel.
  function chip(status) {
    var word = { sent: "sent_", paid: "paidSt" }[status] || status;
    return el("span", { class: "st st-" + status }, [t(word)]);
  }

  // No network. The demo answers from demo-data.js in this browser, so there is
  // nothing to cold-start, nothing to 404 and nothing to hang. Same signature as the
  // fetch wrapper it replaces, so every call site stays identical to the real
  // portal's and this file remains diffable against it.
  async function api(method, path, body) {
    try {
      return await call(method, path, body || {});
    } catch (e) {
      throw new Error(e.message || "something went wrong");
    }
  }

  // ------------------------------------------------------------ session
  var me = null, meta = null, team = [], route = "dashboard";

  var NAV = [
    ["dashboard", "home"], ["quotes", "file"], ["jobs", "truck"], ["calendar", "cal"],
    ["invoices", "receipt"], ["expenses", "wallet"], ["finance", "chart"],
    ["clients", "users"], ["pricelist", "grid"], ["team", "badge"],
  ];

  async function boot() {
    me = await api("GET", "/api/me");
    meta = await api("GET", "/api/meta");
    team = (await api("GET", "/api/team")).team;
    buildShell();
    go("dashboard");
  }

  function buildShell() {
    var nav = $("#nav");
    nav.textContent = "";
    NAV.forEach(function (pair) {
      nav.appendChild(el("button", {
        type: "button", "data-route": pair[0],
        onclick: function () { go(pair[0]); closeSide(); },
      }, [ico(pair[1]), el("span", {}, [t(pair[0])])]));
    });

    var u = me.user;
    $("#avatar").textContent = (u.name_ar || u.name_en).trim().charAt(0);
    $("#uname").textContent = u.name_ar || u.name_en;
    $("#urole").textContent = lang ? "Owner" : "الإدارة";

    // This build runs on the public site with no database behind it. Say so plainly
    // and once, at the top — a screen that looks like a working system but forgets
    // what you typed is worse than one that admits it.
    var warn = $("#warn");
    warn.textContent = "";
    warn.appendChild(el("div", { class: "demo-bar" }, [ico("alert", 16), el("span", {}, [lang
      ? "DEMO — practice data in this browser only. Nothing here reaches a customer, "
        + "and the VAT number is a placeholder, so no quote may be sent for real."
      : "نسخة تجريبية — بيانات تدريب في هذا المتصفح فقط. لا شي يوصل لعميل، "
        + "والرقم الضريبي غير مُسجّل، فما يجوز إرسال أي عرض لعميل حقيقي."])]));
  }

  function openSide()  { $("#side").classList.add("open"); $("#scrim").hidden = false; }
  function closeSide() { $("#side").classList.remove("open"); $("#scrim").hidden = true; }
  $("#menu").addEventListener("click", openSide);
  $("#scrim").addEventListener("click", closeSide);

  $("#lang").addEventListener("click", function () {
    localStorage.setItem("qb-lang", lang ? "ar" : "en");
    location.reload();
  });

  var VIEWS = {};   // filled in below, after each view is defined

  function go(name) {
    route = name;
    Array.prototype.forEach.call(document.querySelectorAll("#nav button"), function (b) {
      if (b.dataset.route === name) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    $("#title").textContent = t(name);
    document.title = t(name) + " — " + (lang ? "Qobban staff" : "بوابة قبان");
    var fn = VIEWS[name] || VIEWS.dashboard;
    // Each view is async; a thrown error must land on the screen, not only in a
    // console nobody has open.
    Promise.resolve().then(fn).catch(function (e) {
      mount([el("p", { class: "empty big" }, [ico("alert", 20), e.message])]);
    });
  }

  var mount = function (nodes) {
    var v = $("#view");
    v.textContent = "";
    nodes.forEach(function (n) { if (n) v.appendChild(n); });
    v.scrollIntoView ? window.scrollTo(0, 0) : null;
  };

  // A page header with an optional primary action, used by nearly every screen.
  function head(titleText, action) {
    return el("div", { class: "toolbar" }, [
      el("h2", { style: "margin:0;font-size:1.2rem" }, [titleText]),
      action || null,
    ]);
  }

  function kpi(opts) {
    return el("button", { class: "kpi " + (opts.tone || ""), type: "button",
                          onclick: opts.go ? function () { go(opts.go); } : null }, [
      el("b", { class: "num" }, [String(opts.value)]),
      el("span", {}, [opts.label]),
      el("span", { class: "kpi-ico" }, [ico(opts.icon, 18)]),
    ]);
  }

  // ------------------------------------------------------------ dashboard
  async function viewDashboard() {
    var d = await api("GET", "/api/dashboard");
    var net = (Number(d.collected_month) - Number(d.spent_month)).toFixed(3);

    var counts = el("div", { class: "kpis" }, [
      kpi({ value: d.awaiting.length, label: t("awaiting"), icon: "file",
            tone: d.awaiting.length ? "hot" : "", go: "quotes" }),
      kpi({ value: d.today.length, label: t("todayJobs"), icon: "truck", go: "jobs" }),
      kpi({ value: d.week, label: t("weekJobs"), icon: "cal", go: "calendar" }),
      kpi({ value: d.overdue.length, label: t("overdueInv"), icon: "alert",
            tone: d.overdue.length ? "bad" : "good", go: "invoices" }),
    ]);

    var cash = el("div", { class: "kpis money" }, [
      kpi({ value: bd(d.collected_month), label: t("collected"), icon: "coins",
            tone: "good", go: "invoices" }),
      kpi({ value: bd(d.spent_month), label: t("spent"), icon: "wallet",
            tone: "warn", go: "expenses" }),
      kpi({ value: bd(net), label: t("netMonth"), icon: "chart",
            tone: Number(net) < 0 ? "bad" : "", go: "finance" }),
      kpi({ value: bd(d.outstanding), label: t("outstanding"), icon: "receipt",
            tone: Number(d.outstanding) > 0 ? "hot" : "good", go: "invoices" }),
    ]);

    // Today
    var today = d.today.length
      ? el("ul", { class: "tl" }, d.today.map(function (j) {
          return el("li", { onclick: function () { go("jobs"); } }, [
            el("div", { class: "tl-time" }, [el("b", {}, [j.start]), el("small", {}, [j.end])]),
            el("div", { class: "r-main" }, [
              el("b", {}, [j.title]),
              el("small", {}, [j.customer_name + (j.site ? " · " + j.site : "")]),
            ]),
            chip(j.status),
          ]);
        }))
      : el("p", { class: "empty" }, [ico("check", 18), t("noToday")]);

    // Quotes sitting unanswered, oldest first — the ones costing money by waiting.
    var chase = d.awaiting.length
      ? el("ul", { class: "rows" }, d.awaiting.slice(0, 6).map(function (q) {
          return el("li", { onclick: function () { editQuote(q.id); } }, [
            el("span", { class: "dot warn" }),
            el("div", { class: "r-main" }, [
              el("b", {}, [q.no + " · " + (q.customer_name || "")]),
              el("small", {}, [q.subject || ""]),
            ]),
            el("span", { class: "num", style: "font-weight:800" }, [money(q.total)]),
            el("span", { class: "age" }, [ago(q.created_at)]),
          ]);
        }))
      : el("p", { class: "empty" }, [ico("check", 18), t("allClear")]);

    var overdue = d.overdue.length
      ? el("ul", { class: "rows" }, d.overdue.map(function (i) {
          return el("li", { onclick: function () { go("invoices"); } }, [
            el("span", { class: "dot bad" }),
            el("div", { class: "r-main" }, [
              el("b", {}, [i.no + " · " + i.customer_name]),
              el("small", {}, [t("due") + " " + shortDate(i.due)]),
            ]),
            el("span", { class: "num", style: "font-weight:800" }, [money(i.due)]),
          ]);
        }))
      : el("p", { class: "empty" }, [ico("check", 18), t("allClear")]);

    mount([
      el("p", { class: "hello" }, [
        (lang ? "Hello " : "هلا ") + (me.user.name_ar || me.user.name_en) + " — "
        + dayName(todayISO()) + "، " + shortDate(todayISO()),
      ]),
      counts,
      cash,
      el("div", { class: "cols3" }, [
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("clock"), t("todaySchedule")]), today,
        ]),
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("file"), t("needsChase"),
            el("button", { class: "btn btn--sm btn--quiet push",
                           onclick: function () { editQuote(null); } }, [t("newQuote")])]),
          chase,
        ]),
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("alert"), t("overdueInv")]), overdue,
        ]),
      ]),
    ]);
  }

  // ------------------------------------------------------------ quotes list
  async function viewQuotes() {
    var d = await api("GET", "/api/quotes");
    var filter = viewQuotes.filter || "all";
    var counts = { all: d.quotes.length };
    ["draft", "sent", "accepted"].forEach(function (s) {
      counts[s] = d.quotes.filter(function (q) { return q.status === s; }).length;
    });
    var list = filter === "all" ? d.quotes
      : d.quotes.filter(function (q) { return q.status === filter; });

    var seg = el("div", { class: "seg" }, ["all", "draft", "sent", "accepted"].map(function (s) {
      var b = el("button", { type: "button", onclick: function () {
        viewQuotes.filter = s; viewQuotes();
      } }, [s === "all" ? (lang ? "All" : "الكل") : t(s === "sent" ? "sent_" : s),
            el("b", {}, [String(counts[s])])]);
      if (filter === s) b.setAttribute("aria-current", "true");
      return b;
    }));

    var body = list.length
      ? el("div", { class: "table-wrap" }, [el("table", { class: "tbl" }, [
          el("thead", {}, [el("tr", {}, [
            el("th", {}, ["#"]), el("th", {}, [t("client")]), el("th", {}, [t("subject")]),
            el("th", { class: "num" }, [t("total")]), el("th", {}, [t("date")]), el("th", {}, [""]),
          ])]),
          el("tbody", {}, list.map(function (q) {
            return el("tr", { tabindex: "0", onclick: function () { editQuote(q.id); } }, [
              el("td", {}, [el("b", {}, [q.no])]),
              el("td", {}, [q.customer_name || "—"]),
              el("td", {}, [q.subject || "—"]),
              el("td", { class: "num" }, [money(q.total)]),
              el("td", {}, [el("small", {}, [ago(q.created_at)])]),
              el("td", {}, [chip(q.status)]),
            ]);
          })),
        ])])
      : el("p", { class: "empty big" }, [t("noQuotes")]);

    mount([
      el("div", { class: "toolbar" }, [seg,
        el("button", { class: "btn btn--primary", onclick: function () { editQuote(null); } },
          [ico("plus", 17), t("newQuote")])]),
      body,
    ]);
  }

  // ------------------------------------------------------------ quote builder
  // ------------------------------------------------------------ quote builder
  async function editQuote(id) {
    var setup = await api("GET", "/api/quote-setup");
    var clients = (await api("GET", "/api/clients")).clients;
    var pl = (await api("GET", "/api/pricelist")).items;

    var q = id ? (await api("GET", "/api/quotes/" + id)).quote : null;
    var locked = q && q.status !== "draft";

    var state = {
      customer_id: q ? q.customer_id : (clients[0] || {}).id,
      subject: q ? q.subject || "" : "",
      delivery: q ? q.delivery : 0,
      discount_pct: 0,
      special_total: q ? q.special && q.total : 0,
      vat: q ? q.vat_on : true,
      valid_days: q ? q.valid_days : setup.company.quote_valid_days,
      note: q ? q.note || "" : "",
      internal_note: q ? q.internal_note || "" : "",
      terms: q ? q.terms.map(function (x) { return x.code; })
               : setup.terms.filter(function (x) { return x.on; }).map(function (x) { return x.code; }),
      lines: q ? q.lines.filter(function (l) { return l.description !== "التوصيل والتركيب"; })
                  .map(function (l) {
                    return { mode: l.mode, description: l.description, unit: l.unit,
                             qty: l.qty, rate: l.rate, total: l.total,
                             build: l.build || { material: 0, hours: 0,
                                                 labour_rate: setup.company.labour_rate,
                                                 margin_pct: setup.company.margin_pct } };
                  })
               : [newLine()],
    };

    function newLine() {
      return { mode: "unit_rate", description: "", unit: "piece", qty: 1, rate: 0, total: 0,
               build: { material: 0, hours: 0, labour_rate: setup.company.labour_rate,
                        margin_pct: setup.company.margin_pct } };
    }

    var totalsBox = el("div", { class: "totals" });

    // The server prices every keystroke's worth of change. Slower than doing the sums
    // here, and the only way the screen cannot disagree with what gets saved.
    var timer = null;
    function repriceSoon() {
      clearTimeout(timer);
      timer = setTimeout(reprice, 250);
    }
    async function reprice() {
      try {
        var p = await api("POST", "/api/quote-preview", payload());
        totalsBox.textContent = "";
        [[t("subtotal"), p.subtotal], [t("discount"), p.discount ? "−" + money(p.discount) : null],
         [t("vatLine"), p.vat ? money(p.vat) : null]].forEach(function (pair) {
          if (pair[1] === null) return;
          totalsBox.appendChild(el("div", {}, [el("span", {}, [pair[0]]),
            el("span", {}, [typeof pair[1] === "string" ? pair[1] : money(pair[1])])]));
        });
        totalsBox.appendChild(el("div", { class: "grand" },
          [el("span", {}, [t("total")]), el("span", {}, [money(p.total) + " BHD"])]));
        state.lines.forEach(function (l, i) {
          var n = document.getElementById("amt" + i);
          if (n && p.lines[i]) n.textContent = money(p.lines[i].total);
        });
      } catch (e) { /* an incomplete line is normal while typing */ }
    }

    function payload() {
      return {
        customer_id: state.customer_id, subject: state.subject, lang: lang ? "en" : "ar",
        vat: state.vat, delivery: state.delivery, discount_pct: state.discount_pct,
        special_total: state.special_total, valid_days: state.valid_days,
        note: state.note, internal_note: state.internal_note, terms: state.terms,
        lines: state.lines.map(function (l) {
          return { mode: l.mode, description: l.description, unit: l.unit, qty: l.qty,
                   rate: l.rate, total: l.total,
                   build: l.mode === "build_up" ? l.build : null };
        }),
      };
    }

    function lineNode(l, i) {
      var amt = el("span", { class: "line__amt", id: "amt" + i }, [money(0)]);
      var box = el("div", { class: "line" });

      var modeSel = el("select", { onchange: function () { l.mode = this.value; draw(); } },
        [["build_up", t("modeBuild")], ["unit_rate", t("modeUnit")], ["fixed", t("modeFixed")]]
          .map(function (o) {
            return el("option", { value: o[0], selected: l.mode === o[0] ? "selected" : null }, [o[1]]);
          }));

      // Picking from the price list fills the description, unit and rate in one go.
      var pick = el("select", { onchange: function () {
        var item = pl.filter(function (x) { return String(x.id) === this.value; }.bind(this))[0];
        if (!item) return;
        l.description = (lang ? item.name_en : item.name_ar) || item.name_en;
        l.unit = item.unit; l.rate = item.rate;
        if (l.mode === "build_up") l.build.material = item.rate;
        draw();
      } }, [el("option", { value: "" }, ["— " + t("pricelist") + " —"])].concat(
        pl.map(function (x) {
          return el("option", { value: x.id }, [(lang ? x.name_en : x.name_ar || x.name_en) + " · " + money(x.rate)]);
        })));

      box.appendChild(el("div", { class: "line__top" }, [modeSel, pick, amt,
        el("button", { class: "btn btn--danger btn--sm", type: "button", onclick: function () {
          if (state.lines.length > 1) { state.lines.splice(i, 1); draw(); }
        } }, ["×"])]));

      box.appendChild(el("label", { for: "d" + i }, [t("desc")]));
      box.appendChild(el("input", { id: "d" + i, value: l.description,
        oninput: function () { l.description = this.value; repriceSoon(); } }));

      if (l.mode === "fixed") {
        box.appendChild(el("label", { for: "t" + i }, [t("total")]));
        box.appendChild(el("input", { id: "t" + i, type: "number", step: "0.001", min: "0", value: l.total,
          oninput: function () { l.total = Number(this.value) || 0; repriceSoon(); } }));
      } else {
        var g = el("div", { class: "grid2" });
        g.appendChild(el("div", {}, [el("label", { for: "q" + i }, [t("qty")]),
          el("input", { id: "q" + i, type: "number", step: "0.001", min: "0", value: l.qty,
            oninput: function () { l.qty = Number(this.value) || 0; repriceSoon(); } })]));
        g.appendChild(el("div", {}, [el("label", { for: "u" + i }, [t("unit")]),
          el("input", { id: "u" + i, value: l.unit || "",
            oninput: function () { l.unit = this.value; } })]));
        if (l.mode === "unit_rate") {
          g.appendChild(el("div", {}, [el("label", { for: "r" + i }, [t("rate")]),
            el("input", { id: "r" + i, type: "number", step: "0.001", min: "0", value: l.rate,
              oninput: function () { l.rate = Number(this.value) || 0; repriceSoon(); } })]));
        }
        box.appendChild(g);
      }

      if (l.mode === "build_up") {
        var b = el("div", { class: "buildup" });
        b.appendChild(el("div", { class: "buildup__h" }, [t("buildUp")]));
        var bg = el("div", { class: "grid2" });
        [["material", t("material")], ["hours", t("hours")],
         ["labour_rate", t("labourRate")], ["margin_pct", t("margin")]].forEach(function (f) {
          bg.appendChild(el("div", {}, [
            el("label", { for: f[0] + i }, [f[1]]),
            el("input", { id: f[0] + i, type: "number", step: "0.001", min: "0", value: l.build[f[0]],
              oninput: function () { l.build[f[0]] = Number(this.value) || 0; repriceSoon(); } }),
          ]));
        });
        b.appendChild(bg);
        box.appendChild(b);
      }
      return box;
    }

    var linesBox = el("div", { class: "lines" });

    function draw() {
      linesBox.textContent = "";
      state.lines.forEach(function (l, i) { linesBox.appendChild(lineNode(l, i)); });
      repriceSoon();
    }

    var header = el("div", { class: "head" }, [
      el("h2", {}, [q ? q.no : t("newQuote")]),
      q ? el("span", { class: "pill pill--" + q.status }, [q.status]) : null,
      el("button", { class: "btn btn--quiet", onclick: viewQuotes }, [t("back")]),
    ]);

    var top = el("div", { class: "panel" }, [
      el("div", { class: "grid2" }, [
        el("div", {}, [el("label", { for: "cl" }, [t("client")]),
          el("select", { id: "cl", onchange: function () { state.customer_id = Number(this.value); } },
            clients.map(function (c) {
              return el("option", { value: c.id, selected: c.id === state.customer_id ? "selected" : null },
                [c.name + " · " + c.phone]);
            }))]),
        el("div", {}, [el("label", { for: "sb" }, [t("subject")]),
          el("input", { id: "sb", value: state.subject, oninput: function () { state.subject = this.value; } })]),
      ]),
    ]);

    var bottom = el("div", { class: "panel" }, [
      el("div", { class: "grid2" }, [
        el("div", {}, [el("label", { for: "dl" }, [t("delivery")]),
          el("input", { id: "dl", type: "number", step: "0.001", min: "0", value: state.delivery,
            oninput: function () { state.delivery = Number(this.value) || 0; repriceSoon(); } })]),
        el("div", {}, [el("label", { for: "dc" }, [t("discount") + " %"]),
          el("input", { id: "dc", type: "number", step: "0.01", min: "0", max: "100", value: state.discount_pct,
            oninput: function () { state.discount_pct = Number(this.value) || 0; repriceSoon(); } })]),
        el("div", {}, [el("label", { for: "sp" }, [t("special")]),
          el("input", { id: "sp", type: "number", step: "0.001", min: "0", value: state.special_total,
            oninput: function () { state.special_total = Number(this.value) || 0; repriceSoon(); } })]),
        el("div", {}, [el("label", { for: "vd" }, [t("validity")]),
          el("input", { id: "vd", type: "number", min: "1", value: state.valid_days,
            oninput: function () { state.valid_days = Number(this.value) || 14; } })]),
      ]),
      el("label", { class: "terms" }, [
        el("input", { type: "checkbox", checked: state.vat ? "checked" : null,
          onchange: function () { state.vat = this.checked; repriceSoon(); } }),
        " " + t("vatLine") + " 10%",
      ]),
      el("div", { class: "terms" }, setup.terms.map(function (x) {
        return el("label", {}, [
          el("input", { type: "checkbox", checked: state.terms.indexOf(x.code) >= 0 ? "checked" : null,
            onchange: function () {
              var at = state.terms.indexOf(x.code);
              if (this.checked && at < 0) state.terms.push(x.code);
              if (!this.checked && at >= 0) state.terms.splice(at, 1);
            } }),
          lang ? x.en : x.ar,
        ]);
      })),
      el("label", { for: "inote" }, [t("internalNote")]),
      el("textarea", { id: "inote", oninput: function () { state.internal_note = this.value; } }, [state.internal_note]),
      totalsBox,
    ]);

    var actions = el("div", { class: "head" }, [
      locked ? el("span", { class: "muted" }, [lang
        ? "Sent — saving will create a new version" : "تم الإرسال — الحفظ ينشئ نسخة جديدة"]) : null,
      el("button", { class: "btn btn--primary", onclick: async function () {
        this.disabled = true;
        try {
          var r = id ? await api("PUT", "/api/quotes/" + id, payload())
                     : await api("POST", "/api/quotes", payload());
          toast(t("saved") + " · " + money(r.total));
          // With no database, the quote may have been saved on an instance this
          // next request never reaches. Going back to the list avoids presenting
          // that as "not found" straight after a successful save.
          if (me && me.demo) viewQuotes(); else editQuote(r.id || id);
        } catch (e) { toast(e.message, true); this.disabled = false; }
      } }, [t("save")]),
      q && q.status === "draft" ? el("button", { class: "btn", onclick: async function () {
        try {
          var r = await api("POST", "/api/quotes/" + id + "/send", {});
          toast(t("sent") + " · " + r.no);
          editQuote(id);
        } catch (e) { toast(e.message, true); }
      } }, [t("send")]) : null,
      q && q.token ? el("button", { class: "btn btn--quiet", onclick: function () {
        var link = location.origin + "/q/" + q.token;
        navigator.clipboard.writeText(link).then(function () { toast(t("copied")); },
          function () { prompt(t("copy"), link); });
      } }, [t("copy")]) : null,
    ]);

    mount([header, top, el("div", { class: "panel" }, [
      el("div", { class: "head" }, [el("h3", {}, [t("line")]),
        el("button", { class: "btn btn--quiet btn--sm", onclick: function () {
          state.lines.push(newLine()); draw();
        } }, [t("addLine")])]),
      linesBox,
    ]), bottom, actions]);
    draw();
  }

  // ------------------------------------------------------------ clients
  async function viewClients() {
    var clients = (await api("GET", "/api/clients")).clients;
    var invs = (await api("GET", "/api/invoices")).invoices;
    var quotes = (await api("GET", "/api/quotes")).quotes;

    var find = "";
    var box = el("input", { placeholder: lang ? "Name, phone or company" : "اسم، هاتف أو شركة" });
    var tbody = el("tbody", {});

    // Each client's row carries what you actually want to know before you ring them:
    // what they owe and how many quotes are still in the air.
    function draw() {
      var q = find.trim().toLowerCase();
      var list = clients.filter(function (c) {
        return !q || (c.name + " " + c.phone + " " + (c.company_name || "")).toLowerCase().indexOf(q) >= 0;
      });
      tbody.textContent = "";
      if (!list.length) {
        tbody.appendChild(el("tr", {}, [el("td", { colspan: "6" },
          [el("p", { class: "empty" }, [t("noClients")])])]));
        return;
      }
      list.forEach(function (c) {
        var due = invs.filter(function (i) { return i.customer_id === c.id; })
                      .reduce(function (s, i) { return s + Number(i.due); }, 0);
        var open = quotes.filter(function (x) {
          return x.customer_name === c.name && x.status === "sent";
        }).length;
        tbody.appendChild(el("tr", { tabindex: "0", onclick: function () { clientDetail(c); } }, [
          el("td", {}, [el("b", {}, [c.name]),
            c.company_name ? el("small", {}, [c.company_name]) : null]),
          el("td", { class: "code" }, [c.phone]),
          el("td", {}, [c.area || "—"]),
          el("td", {}, [el("span", { class: "st st-" + (c.kind === "company" ? "sent" : "draft") },
            [c.kind === "company" ? t("company") : t("person")])]),
          el("td", {}, [open ? el("span", { class: "st st-sent" }, [String(open)]) : "—"]),
          el("td", { class: "num", style: due > 0 ? "font-weight:800;color:var(--bad)" : "" },
            [due > 0 ? money(due) : "—"]),
        ]));
      });
    }
    box.addEventListener("input", function () { find = box.value; draw(); });
    draw();

    mount([
      el("div", { class: "toolbar" }, [
        el("div", { class: "s-search" }, [ico("search", 18), box]),
        el("button", { class: "btn btn--primary", onclick: clientForm },
          [ico("plus", 17), t("newClient")]),
      ]),
      el("div", { class: "table-wrap" }, [el("table", { class: "tbl" }, [
        el("thead", {}, [el("tr", {}, [
          el("th", {}, [t("name")]), el("th", {}, [t("phone")]), el("th", {}, [t("area")]),
          el("th", {}, [lang ? "Type" : "النوع"]), el("th", {}, [t("quotes")]),
          el("th", { class: "num" }, [t("owed")]),
        ])]),
        tbody,
      ])]),
    ]);
  }

  async function clientDetail(c) {
    var invs = (await api("GET", "/api/invoices")).invoices
      .filter(function (i) { return i.customer_id === c.id; });
    var jobs = (await api("GET", "/api/jobs")).jobs
      .filter(function (j) { return j.customer_id === c.id; });
    var due = invs.reduce(function (s, i) { return s + Number(i.due); }, 0);

    mount([
      el("div", { class: "od-head" }, [
        el("div", {}, [
          el("h2", { class: "od-title" }, [c.name]),
          el("p", { style: "margin:2px 0 0;color:var(--muted)" },
            [(c.company_name || "") + (c.area ? " · " + c.area : "")]),
        ]),
        el("div", { class: "od-act" }, [
          el("a", { class: "btn btn--go", href: "https://wa.me/973" + c.phone,
                    target: "_blank", rel: "noopener" }, [t("whatsapp")]),
          el("a", { class: "btn btn--quiet", href: "tel:+973" + c.phone }, [t("call_")]),
          el("button", { class: "btn btn--quiet", onclick: function () { go("clients"); } },
            [t("back")]),
        ]),
      ]),
      el("div", { class: "cols" }, [
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("users"), t("client")]),
          el("dl", { class: "facts" }, [
            el("div", {}, [el("dt", {}, [t("phone")]), el("dd", { class: "code" }, [c.phone])]),
            el("div", {}, [el("dt", {}, [t("area")]), el("dd", {}, [c.area || "—"])]),
            el("div", {}, [el("dt", {}, [t("company")]), el("dd", {}, [c.company_name || "—"])]),
            el("div", {}, [el("dt", {}, [t("vat")]), el("dd", { class: "code" }, [c.vat_no || "—"])]),
            el("div", { class: "hl" + (due > 0 ? " bad" : " good") },
              [el("dt", {}, [t("owed")]), el("dd", { class: "num" }, [bd(due)])]),
          ]),
        ]),
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("truck"), t("jobs")]),
          jobs.length
            ? el("ul", { class: "rows" }, jobs.map(function (j) {
                return el("li", { onclick: function () { go("jobs"); } }, [
                  el("div", { class: "r-main" }, [
                    el("b", {}, [j.title]), el("small", {}, [shortDate(j.date)]),
                  ]),
                  chip(j.status),
                ]);
              }))
            : el("p", { class: "empty" }, [t("noJobs")]),
        ]),
      ]),
      el("section", { class: "panel" }, [
        el("h2", {}, [ico("receipt"), t("invoices")]),
        invs.length
          ? el("ul", { class: "rows" }, invs.map(function (i) {
              return el("li", { onclick: function () { invoiceDetail(i.id); } }, [
                el("div", { class: "r-main" }, [
                  el("b", {}, [i.no + " · " + (i.subject || "")]),
                  el("small", {}, [t("due") + " " + shortDate(i.due)]),
                ]),
                el("span", { class: "num", style: "font-weight:800" }, [money(i.due)]),
                chip(i.state),
              ]);
            }))
          : el("p", { class: "empty" }, [t("noInvoices")]),
      ]),
    ]);
  }

  async function clientForm() {
    var f = {};
    var fld = function (key, label, attrs) {
      f[key] = el("input", attrs || {});
      return el("label", {}, [label, f[key]]);
    };
    var kind = el("select", {}, [
      el("option", { value: "person" }, [t("person")]),
      el("option", { value: "company" }, [t("company")]),
    ]);

    mount([
      el("div", { class: "od-head" }, [
        el("h2", { class: "od-title" }, [t("newClient")]),
        el("button", { class: "btn btn--quiet", onclick: function () { go("clients"); } },
          [t("back")]),
      ]),
      el("section", { class: "panel" }, [
        el("div", { class: "f-row" }, [
          fld("name", t("name")),
          fld("phone", t("phone"), { inputmode: "tel", placeholder: "3xxx xxxx" }),
          el("label", {}, [lang ? "Type" : "النوع", kind]),
          fld("area", t("area")),
        ]),
        el("div", { class: "f-row" }, [
          fld("company_name", t("company")),
          fld("vat_no", t("vat"), { inputmode: "numeric" }),
          fld("cr_no", t("cr")),
          fld("email", t("email"), { type: "email" }),
        ]),
        el("button", { class: "btn btn--primary", style: "margin-top:14px",
          onclick: async function () {
            try {
              await api("POST", "/api/clients", {
                name: f.name.value, phone: f.phone.value, kind: kind.value,
                area: f.area.value, company_name: f.company_name.value,
                vat_no: f.vat_no.value, cr_no: f.cr_no.value, email: f.email.value,
              });
              toast(t("saved"));
              go("clients");
            } catch (e) { toast(e.message, true); }
          } }, [t("save")]),
      ]),
    ]);
  }

  // ------------------------------------------------------------ price list
  async function viewPriceList() {
    var items = (await api("GET", "/api/pricelist")).items;
    var find = "";
    var box = el("input", { placeholder: lang ? "Name or code" : "اسم أو كود" });
    var host = el("div", { style: "display:grid;gap:16px" });

    function draw() {
      var q = find.trim().toLowerCase();
      var list = items.filter(function (i) {
        return !q || (i.code + " " + i.name_ar + " " + i.name_en).toLowerCase().indexOf(q) >= 0;
      });
      var byCat = {};
      list.forEach(function (i) { (byCat[i.category] = byCat[i.category] || []).push(i); });

      host.textContent = "";
      if (!list.length) { host.appendChild(el("p", { class: "empty big" }, ["—"])); return; }

      Object.keys(byCat).forEach(function (cat) {
        host.appendChild(el("section", { class: "panel" }, [
          el("h2", {}, [cat, el("small", {}, [String(byCat[cat].length)])]),
          el("div", { class: "table-wrap" }, [el("table", { class: "tbl compact" }, [
            el("thead", {}, [el("tr", {}, [
              el("th", {}, [t("desc")]), el("th", {}, [lang ? "Code" : "الكود"]),
              el("th", {}, [t("unit")]), el("th", { class: "num" }, [t("cost")]),
              el("th", { class: "num" }, [t("rate")]), el("th", { class: "num" }, [t("margin")]),
            ])]),
            el("tbody", {}, byCat[cat].map(function (i) {
              var marg = i.rate > 0 ? Math.round((1 - i.cost / i.rate) * 100) : 0;
              return el("tr", { style: "cursor:default" }, [
                el("td", {}, [el("b", {}, [lang ? i.name_en : i.name_ar])]),
                el("td", { class: "code" }, [i.code]),
                el("td", {}, [i.unit]),
                el("td", { class: "num", style: "color:var(--muted)" }, [money(i.cost)]),
                el("td", { class: "num", style: "font-weight:800" }, [money(i.rate)]),
                el("td", { class: "num" }, [el("span", {
                  class: "st " + (marg < 15 ? "st-unpaid" : marg < 25 ? "st-partial" : "st-paid"),
                }, [marg + "%"])]),
              ]);
            })),
          ])]),
        ]));
      });
    }
    box.addEventListener("input", function () { find = box.value; draw(); });
    draw();

    mount([
      el("div", { class: "toolbar" }, [
        el("div", { class: "s-search" }, [ico("search", 18), box]),
        el("span", { class: "age" }, [items.length + (lang ? " items" : " بند")]),
      ]),
      host,
    ]);
  }

  // ------------------------------------------------------------ jobs
  var memberName = function (id) {
    var m = team.filter(function (x) { return x.id === id; })[0];
    return m ? (lang ? m.name_en : m.name_ar) : "#" + id;
  };

  async function viewJobs() {
    var jobs = (await api("GET", "/api/jobs")).jobs;
    var today = todayISO();
    var filter = viewJobs.filter || "open";

    var sets = {
      today: jobs.filter(function (j) { return j.date === today && j.status !== "cancelled"; }),
      open: jobs.filter(function (j) { return j.status === "scheduled" || j.status === "progress"; }),
      done: jobs.filter(function (j) { return j.status === "done"; }),
      all: jobs,
    };
    var list = (sets[filter] || sets.open).slice().sort(function (a, b) {
      return a.date.localeCompare(b.date) || a.start.localeCompare(b.start);
    });

    var seg = el("div", { class: "seg" }, [
      ["today", lang ? "Today" : "اليوم"], ["open", lang ? "Open" : "مفتوحة"],
      ["done", t("done")], ["all", lang ? "All" : "الكل"],
    ].map(function (pair) {
      var b = el("button", { type: "button", onclick: function () {
        viewJobs.filter = pair[0]; viewJobs();
      } }, [pair[1], el("b", {}, [String(sets[pair[0]].length)])]);
      if (filter === pair[0]) b.setAttribute("aria-current", "true");
      return b;
    }));

    // Advancing a job is one button whose label is the next step, not a dropdown of
    // every state. There is only ever one sensible next move, so offering four is
    // four things to read instead of one to press.
    function advance(j) {
      var next = j.status === "scheduled" ? "progress" : j.status === "progress" ? "done" : null;
      if (!next) return null;
      return el("button", {
        class: "btn btn--sm " + (next === "done" ? "btn--go" : "btn--primary"),
        onclick: async function (ev) {
          ev.stopPropagation();
          await api("PUT", "/api/jobs/" + j.id, { status: next });
          toast(t("saved"));
          viewJobs();
        },
      }, [ico(next === "done" ? "check" : "clock", 16), t(next === "done" ? "finish" : "start")]);
    }

    var cards = list.length
      ? el("div", { class: "jobs" }, list.map(function (j) {
          var ticked = j.checklist.filter(function (c) { return c.done; }).length;
          return el("article", { class: "job" }, [
            el("header", {}, [
              el("div", { class: "job-time" }, [
                el("b", {}, [j.start]), el("small", {}, [shortDate(j.date)]),
              ]),
              el("div", { class: "r-main" }, [
                el("h3", {}, [j.title]),
                el("small", {}, [j.no + " · " + j.customer_name]),
              ]),
              chip(j.status),
            ]),
            el("div", { class: "job-facts" }, [
              j.site ? el("span", {}, [ico("pin", 15), j.site]) : null,
              el("span", {}, [ico("clock", 15), j.start + " – " + j.end]),
              el("span", {}, [ico("coins", 15), bd(j.value)]),
            ]),
            j.crew.length ? el("div", { class: "crew" }, j.crew.map(function (id) {
              return el("span", { class: "person" }, [ico("users", 14), memberName(id)]);
            })) : null,
            j.checklist.length ? el("details", { class: "checklist" }, [
              el("summary", {}, [(lang ? "Checklist" : "قائمة المهام")
                + " — " + ticked + "/" + j.checklist.length]),
              el("div", {}, j.checklist.map(function (c, i) {
                var box = el("input", { type: "checkbox", onchange: async function () {
                  j.checklist[i].done = box.checked;
                  await api("PUT", "/api/jobs/" + j.id, { checklist: j.checklist });
                } });
                box.checked = c.done;
                return el("label", {}, [box, el("span", {}, [c.t])]);
              })),
            ]) : null,
            el("footer", {}, [
              el("button", { class: "btn btn--sm btn--quiet", onclick: function () {
                expenseFor(j);
              } }, [ico("wallet", 16), t("addExpense")]),
              el("span", { class: "push" }), advance(j),
            ]),
          ]);
        }))
      : el("p", { class: "empty big" }, [t("noJobs")]);

    mount([
      el("div", { class: "toolbar" }, [seg,
        el("button", { class: "btn btn--primary", onclick: jobForm },
          [ico("plus", 17), t("newJob")])]),
      cards,
    ]);
  }

  async function jobForm() {
    var clients = (await api("GET", "/api/clients")).clients;
    var picked = [];

    var f = {};
    var fld = function (key, label, attrs) {
      f[key] = el("input", attrs || {});
      return el("label", {}, [label, f[key]]);
    };

    var sel = el("select", {}, clients.map(function (c) {
      return el("option", { value: c.id }, [c.name + " · " + c.phone]);
    }));

    var crewBox = el("div", { class: "crew" }, team.map(function (m) {
      var b = el("button", { class: "person", type: "button", "aria-pressed": "false",
        onclick: function () {
          var at = picked.indexOf(m.id);
          if (at < 0) { picked.push(m.id); b.setAttribute("aria-pressed", "true");
                        b.style.background = "var(--accent)"; }
          else { picked.splice(at, 1); b.setAttribute("aria-pressed", "false");
                 b.style.background = ""; }
        } }, [lang ? m.name_en : m.name_ar]);
      return b;
    }));

    mount([
      el("div", { class: "od-head" }, [
        el("h2", { class: "od-title" }, [t("newJob")]),
        el("button", { class: "btn btn--quiet", onclick: function () { go("jobs"); } },
          [t("back")]),
      ]),
      el("section", { class: "panel" }, [
        el("div", { class: "f-row" }, [
          el("label", {}, [t("client"), sel]),
          fld("title", t("title"), { placeholder: lang ? "e.g. Railing, 12 m" : "مثلاً: درابزين ١٢ م" }),
          fld("site", t("site"), { placeholder: lang ? "Area, building" : "المنطقة، المبنى" }),
        ]),
        el("div", { class: "f-row" }, [
          fld("date", t("date"), { type: "date", value: todayISO() }),
          fld("start", t("from"), { type: "time", value: "08:00" }),
          fld("end", t("to"), { type: "time", value: "12:00" }),
          fld("value", t("value"), { type: "number", step: "0.001", min: "0", value: "0" }),
        ]),
        el("p", { style: "margin:14px 0 6px;font-weight:800" }, [t("crew")]),
        crewBox,
        el("div", { style: "margin-top:18px;display:flex;gap:10px" }, [
          el("button", { class: "btn btn--primary", onclick: async function () {
            try {
              await api("POST", "/api/jobs", {
                customer_id: sel.value, title: f.title.value, site: f.site.value,
                date: f.date.value, start: f.start.value, end: f.end.value,
                value: f.value.value, crew: picked,
                checklist: lang ? ["Measure", "Fabricate", "Install", "Hand over"]
                                : ["القياس", "التصنيع", "التركيب", "التسليم"],
              });
              toast(t("saved"));
              go("jobs");
            } catch (e) { toast(e.message, true); }
          } }, [t("save")]),
        ]),
      ]),
    ]);
  }

  // ------------------------------------------------------------ calendar
  var calCursor = null;   // first of the displayed month

  async function viewCalendar() {
    var jobs = (await api("GET", "/api/jobs")).jobs;
    if (!calCursor) { calCursor = new Date(); calCursor.setDate(1); calCursor.setHours(12, 0, 0, 0); }

    var y = calCursor.getFullYear(), m = calCursor.getMonth();
    var first = new Date(y, m, 1);
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    // Bahrain's week starts on Saturday, so Saturday is column 0.
    var lead = (first.getDay() + 1) % 7;

    var byDate = {};
    jobs.forEach(function (j) { (byDate[j.date] = byDate[j.date] || []).push(j); });

    var dows = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
    var dowsEn = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    var cells = (lang ? dowsEn : dows).map(function (d) {
      return el("div", { class: "cal-dow" }, [d]);
    });

    for (var i = 0; i < lead; i++) cells.push(el("div", { class: "cal-cell pad" }, []));

    for (var dnum = 1; dnum <= daysInMonth; dnum++) {
      var key = new Date(y, m, dnum, 12).toISOString().slice(0, 10);
      var list = byDate[key] || [];
      var kids = [el("b", {}, [String(dnum)])];
      list.slice(0, 3).forEach(function (j) {
        kids.push(el("div", { class: "ev st-" + j.status, title: j.title },
                    [j.start + " " + j.title]));
      });
      if (list.length > 3) kids.push(el("div", { class: "more" }, ["+" + (list.length - 3)]));
      cells.push(el("div", {
        class: "cal-cell" + (key === todayISO() ? " today" : ""),
        onclick: function () { viewJobs.filter = "all"; go("jobs"); },
      }, kids));
    }

    var step = function (by) {
      return function () { calCursor.setMonth(calCursor.getMonth() + by); viewCalendar(); };
    };

    mount([
      el("div", { class: "cal-head" }, [
        el("button", { class: "icon-btn", onclick: step(-1), "aria-label": "previous" }, [ico("x", 0)]),
        el("h2", {}, [calCursor.toLocaleDateString(LOC(), { month: "long", year: "numeric" })]),
        el("button", { class: "icon-btn", onclick: step(1), "aria-label": "next" }, [ico("x", 0)]),
        el("button", { class: "btn btn--sm btn--quiet", onclick: function () {
          calCursor = null; viewCalendar();
        } }, [lang ? "Today" : "اليوم"]),
        el("p", { class: "legend" }, [
          el("span", {}, [el("i", { class: "sw st-scheduled" }), " ", t("scheduled")]),
          el("span", {}, [el("i", { class: "sw st-progress" }), " ", t("progress")]),
          el("span", {}, [el("i", { class: "sw st-done" }), " ", t("done")]),
        ]),
      ]),
      el("div", { class: "cal" }, cells),
    ]);
  }

  // ------------------------------------------------------------ invoices
  async function viewInvoices() {
    var invs = (await api("GET", "/api/invoices")).invoices;
    var filter = viewInvoices.filter || "open";
    var sets = {
      open: invs.filter(function (i) { return i.state !== "paid"; }),
      overdue: invs.filter(function (i) { return i.state === "overdue"; }),
      paid: invs.filter(function (i) { return i.state === "paid"; }),
      all: invs,
    };
    var list = sets[filter] || sets.open;
    var owed = list.reduce(function (s, i) { return s + Number(i.due); }, 0);

    var seg = el("div", { class: "seg" }, [
      ["open", lang ? "Open" : "مفتوحة"], ["overdue", t("overdue")],
      ["paid", t("paidSt")], ["all", lang ? "All" : "الكل"],
    ].map(function (pair) {
      var b = el("button", { type: "button", onclick: function () {
        viewInvoices.filter = pair[0]; viewInvoices();
      } }, [pair[1], el("b", {}, [String(sets[pair[0]].length)])]);
      if (filter === pair[0]) b.setAttribute("aria-current", "true");
      return b;
    }));

    var body = list.length
      ? el("div", { class: "table-wrap" }, [el("table", { class: "tbl" }, [
          el("thead", {}, [el("tr", {}, [
            el("th", {}, ["#"]), el("th", {}, [t("client")]), el("th", {}, [t("subject")]),
            el("th", { class: "num" }, [t("total")]), el("th", { class: "num" }, [t("paid")]),
            el("th", { class: "num" }, [t("remaining")]), el("th", {}, [t("due")]), el("th", {}, [""]),
          ])]),
          el("tbody", {}, list.map(function (i) {
            return el("tr", { tabindex: "0", onclick: function () { invoiceDetail(i.id); } }, [
              el("td", {}, [el("b", {}, [i.no])]),
              el("td", {}, [i.customer_name]),
              el("td", {}, [i.subject || "—"]),
              el("td", { class: "num" }, [money(i.total)]),
              el("td", { class: "num" }, [money(i.paid)]),
              el("td", { class: "num", style: Number(i.due) > 0 ? "font-weight:800" : "" },
                [money(i.due)]),
              el("td", {}, [el("small", {}, [shortDate(i.due)])]),
              el("td", {}, [chip(i.state)]),
            ]);
          })),
          el("tfoot", {}, [el("tr", {}, [
            el("td", { colspan: "5" }, [t("outstanding")]),
            el("td", { class: "num" }, [money(owed)]),
            el("td", { colspan: "2" }, [""]),
          ])]),
        ])])
      : el("p", { class: "empty big" }, [t("noInvoices")]);

    mount([
      el("div", { class: "toolbar" }, [seg,
        el("button", { class: "btn btn--primary", onclick: invoiceForm },
          [ico("plus", 17), t("newInvoice")])]),
      body,
    ]);
  }

  async function invoiceDetail(id) {
    var invs = (await api("GET", "/api/invoices")).invoices;
    var inv = invs.filter(function (x) { return x.id === id; })[0];
    if (!inv) return go("invoices");

    var amount = el("input", { class: "amount-in", type: "number", step: "0.001", min: "0",
                               value: money(inv.due), inputmode: "decimal" });
    var method = el("select", {}, meta.pay_methods.map(function (p) {
      return el("option", { value: p.code }, [lang ? p.en : p.ar]);
    }));
    var when = el("input", { type: "date", value: todayISO() });
    var ref = el("input", { placeholder: lang ? "Cheque / transfer no." : "رقم الشيك أو التحويل" });

    var payPanel = Number(inv.due) > 0 ? el("section", { class: "panel" }, [
      el("h2", {}, [ico("coins"), t("record")]),
      el("div", { class: "f-row" }, [
        el("label", {}, [t("amount"), amount]),
        el("label", {}, [t("method"), method]),
        el("label", {}, [t("date"), when]),
        el("label", {}, [t("ref"), ref]),
      ]),
      el("button", { class: "btn btn--go", style: "margin-top:14px",
        onclick: async function () {
          try {
            await api("POST", "/api/invoices/" + inv.id + "/payment", {
              amount: amount.value, method: method.value, date: when.value, ref: ref.value,
            });
            toast(t("saved"));
            invoiceDetail(inv.id);
          } catch (e) { toast(e.message, true); }
        } }, [ico("check", 17), t("record")]),
    ]) : null;

    mount([
      el("div", { class: "od-head" }, [
        el("div", {}, [
          el("h2", { class: "od-title" }, [inv.no, chip(inv.state)]),
          el("p", { style: "margin:2px 0 0;color:var(--muted)" }, [inv.customer_name]),
        ]),
        el("button", { class: "btn btn--quiet", onclick: function () { go("invoices"); } },
          [t("back")]),
      ]),
      el("div", { class: "cols" }, [
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("receipt"), t("total")]),
          el("dl", { class: "facts" }, [
            el("div", {}, [el("dt", {}, [t("subject")]), el("dd", {}, [inv.subject || "—"])]),
            el("div", {}, [el("dt", {}, [t("issued")]), el("dd", {}, [shortDate(inv.issued)])]),
            el("div", {}, [el("dt", {}, [t("due")]), el("dd", {}, [shortDate(inv.due)])]),
            el("div", {}, [el("dt", {}, [t("subtotal")]), el("dd", { class: "num" }, [money(inv.subtotal)])]),
            el("div", {}, [el("dt", {}, [t("vatLine")]), el("dd", { class: "num" }, [money(inv.vat)])]),
            el("div", { class: "hl" }, [el("dt", {}, [t("total")]), el("dd", { class: "num" }, [bd(inv.total)])]),
            el("div", { class: "hl good" }, [el("dt", {}, [t("paid")]), el("dd", { class: "num" }, [bd(inv.paid)])]),
            el("div", { class: "hl" + (Number(inv.due) > 0 ? " bad" : " good") },
              [el("dt", {}, [t("remaining")]), el("dd", { class: "num" }, [bd(inv.due)])]),
          ]),
        ]),
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("coins"), lang ? "Payments" : "الدفعات"]),
          inv.payments.length
            ? el("ul", { class: "rows" }, inv.payments.map(function (p) {
                var m = meta.pay_methods.filter(function (x) { return x.code === p.method; })[0];
                return el("li", { style: "cursor:default" }, [
                  el("span", { class: "dot ok" }),
                  el("div", { class: "r-main" }, [
                    el("b", {}, [(m ? (lang ? m.en : m.ar) : p.method) + (p.ref ? " · " + p.ref : "")]),
                    el("small", {}, [shortDate(p.date)]),
                  ]),
                  el("span", { class: "num", style: "font-weight:800" }, [money(p.amount)]),
                ]);
              }))
            : el("p", { class: "empty" }, [lang ? "Nothing paid yet" : "ما في دفعات بعد"]),
        ]),
      ]),
      payPanel,
    ]);
  }

  async function invoiceForm() {
    var clients = (await api("GET", "/api/clients")).clients;
    var sel = el("select", {}, clients.map(function (c) {
      return el("option", { value: c.id }, [c.name + " · " + c.phone]);
    }));
    var subject = el("input", { placeholder: lang ? "What is this for?" : "عن أي شي؟" });
    var net = el("input", { class: "amount-in", type: "number", step: "0.001", min: "0",
                            value: "0", inputmode: "decimal" });
    var vatOn = el("input", { type: "checkbox" }); vatOn.checked = true;
    var issued = el("input", { type: "date", value: todayISO() });
    var dueIn = el("input", { type: "number", min: "0", value: "30" });
    var preview = el("p", { class: "num", style: "font-weight:800;font-size:1.2rem" }, ["0.000"]);

    // The VAT and the total are shown before saving, because an invoice total that
    // first appears after you commit is a total nobody checked.
    function redraw() {
      var n = Math.round((Number(net.value) || 0) * 1000);
      var v = vatOn.checked ? Math.round(n * 0.1) : 0;
      preview.textContent = bd((n + v) / 1000) + (v ? "  (" + (lang ? "VAT " : "ضريبة ")
        + money(v / 1000) + ")" : "");
    }
    net.addEventListener("input", redraw);
    vatOn.addEventListener("change", redraw);
    redraw();

    mount([
      el("div", { class: "od-head" }, [
        el("h2", { class: "od-title" }, [t("newInvoice")]),
        el("button", { class: "btn btn--quiet", onclick: function () { go("invoices"); } },
          [t("back")]),
      ]),
      el("section", { class: "panel" }, [
        el("div", { class: "f-row" }, [
          el("label", {}, [t("client"), sel]),
          el("label", {}, [t("subject"), subject]),
        ]),
        el("div", { class: "f-row" }, [
          el("label", {}, [t("subtotal"), net]),
          el("label", {}, [t("issued"), issued]),
          el("label", {}, [(lang ? "Payable in days" : "الاستحقاق بالأيام"), dueIn]),
        ]),
        el("label", { style: "display:flex;gap:10px;align-items:center;margin-top:12px;font-weight:800" },
          [vatOn, el("span", {}, [lang ? "Add 10% VAT" : "إضافة ضريبة القيمة المضافة ١٠٪"])]),
        el("div", { style: "margin-top:12px" }, [preview]),
        el("button", { class: "btn btn--primary", style: "margin-top:14px",
          onclick: async function () {
            try {
              var d = new Date(issued.value || todayISO());
              d.setDate(d.getDate() + (Number(dueIn.value) || 30));
              await api("POST", "/api/invoices", {
                customer_id: sel.value, subject: subject.value, subtotal: net.value,
                vat: vatOn.checked, issued: issued.value,
                due: d.toISOString().slice(0, 10),
              });
              toast(t("saved"));
              go("invoices");
            } catch (e) { toast(e.message, true); }
          } }, [t("save")]),
      ]),
    ]);
  }

  // ------------------------------------------------------------ expenses
  // Logged standing in a workshop on a phone: category by tapping a big tile, amount
  // in one large field, everything else optional. Four taps from open to saved.
  function expenseFor(job) { viewExpenses(job || null); }

  async function viewExpenses(job) {
    var list = (await api("GET", "/api/expenses")).expenses;
    var jobs = (await api("GET", "/api/jobs")).jobs;
    var chosen = { cat: null };

    var amount = el("input", { class: "amount-in", type: "number", step: "0.001", min: "0",
                               placeholder: "0.000", inputmode: "decimal" });
    var note = el("input", { placeholder: lang ? "What was it?" : "على شنو؟" });
    var supplier = el("input", { placeholder: lang ? "Supplier (optional)" : "المورّد (اختياري)" });
    var when = el("input", { type: "date", value: todayISO() });
    var jobSel = el("select", {}, [el("option", { value: "" }, [lang ? "— no job —" : "— بدون وظيفة —"])]
      .concat(jobs.map(function (j) {
        return el("option", { value: j.id }, [j.no + " · " + j.title]);
      })));
    if (job) jobSel.value = String(job.id);

    var tiles = el("div", { class: "quick-grid" }, meta.expense_cats.map(function (c) {
      var b = el("button", { class: "quick-cat", type: "button", "aria-pressed": "false",
        onclick: function () {
          chosen.cat = c.code;
          Array.prototype.forEach.call(tiles.children, function (x) {
            x.setAttribute("aria-pressed", x === b ? "true" : "false");
          });
        } }, [ico(c.icon, 26), el("span", {}, [lang ? c.en : c.ar])]);
      return b;
    }));

    var total = list.reduce(function (s, e) { return s + Number(e.amount); }, 0);
    var catName = function (code) {
      var c = meta.expense_cats.filter(function (x) { return x.code === code; })[0];
      return c ? (lang ? c.en : c.ar) : code;
    };

    mount([
      el("section", { class: "panel" }, [
        el("h2", {}, [ico("wallet"), t("addExpense"),
          el("small", { class: "push" }, [lang ? "tap a category, type the amount, save"
                                               : "اختر الفئة، اكتب المبلغ، احفظ"])]),
        tiles,
        el("div", { class: "f-row", style: "margin-top:14px" }, [
          el("label", {}, [t("amount"), amount]),
          el("label", {}, [t("date"), when]),
        ]),
        el("div", { class: "f-row" }, [
          el("label", {}, [t("note"), note]),
          el("label", {}, [t("supplier"), supplier]),
          el("label", {}, [lang ? "Job" : "الوظيفة", jobSel]),
        ]),
        el("button", { class: "btn btn--primary btn--block", style: "margin-top:14px",
          onclick: async function () {
            try {
              await api("POST", "/api/expenses", {
                cat: chosen.cat, amount: amount.value, note: note.value,
                supplier: supplier.value, date: when.value, job_id: jobSel.value || null,
              });
              toast(t("saved"));
              viewExpenses();
            } catch (e) { toast(e.message, true); }
          } }, [ico("check", 18), t("save")]),
      ]),

      el("section", { class: "panel" }, [
        el("h2", {}, [ico("receipt"), t("expenses"),
          el("span", { class: "push num", style: "font-weight:800" }, [bd(total)])]),
        list.length
          ? el("div", { class: "table-wrap" }, [el("table", { class: "tbl compact" }, [
              el("thead", {}, [el("tr", {}, [
                el("th", {}, [t("date")]), el("th", {}, [t("category")]), el("th", {}, [t("note")]),
                el("th", {}, [t("supplier")]), el("th", { class: "num" }, [t("amount")]),
              ])]),
              el("tbody", {}, list.map(function (e) {
                return el("tr", { style: "cursor:default" }, [
                  el("td", {}, [shortDate(e.date)]),
                  el("td", {}, [el("span", { class: "st st-draft" }, [catName(e.cat)])]),
                  el("td", {}, [e.note || "—"]),
                  el("td", {}, [e.supplier || "—"]),
                  el("td", { class: "num" }, [money(e.amount)]),
                ]);
              })),
            ])])
          : el("p", { class: "empty" }, [t("noExpenses")]),
      ]),
    ]);
  }

  // ------------------------------------------------------------ finance
  async function viewFinance() {
    var f = await api("GET", "/api/finance");
    var peak = Math.max.apply(null, f.months.map(function (m) {
      return Math.max(Number(m.revenue), Number(m.cost));
    }).concat([1]));

    var bars = el("div", { class: "bars" }, f.months.map(function (m) {
      var h = function (v) { return Math.max(2, Math.round(Number(v) / peak * 190)) + "px"; };
      return el("div", { class: "bar-col" }, [
        el("div", { class: "bar-stack" }, [
          el("i", { class: "bar rev", style: "height:" + h(m.revenue),
                    title: t("revenue") + " " + money(m.revenue) }),
          el("i", { class: "bar cost", style: "height:" + h(m.cost),
                    title: t("costs") + " " + money(m.cost) }),
        ]),
        el("b", {}, [money(m.profit)]),
        el("small", {}, [m.label]),
      ]);
    }));

    var catPeak = Math.max.apply(null, f.byCat.map(function (c) { return Number(c.total); }).concat([1]));
    var cats = f.byCat.length
      ? el("ul", { class: "hbars" }, f.byCat.map(function (c) {
          return el("li", {}, [
            el("span", {}, [lang ? c.en : c.ar]),
            el("span", { class: "hbar" }, [
              el("i", { style: "width:" + Math.round(Number(c.total) / catPeak * 100) + "%" }),
            ]),
            el("b", {}, [money(c.total)]),
          ]);
        }))
      : el("p", { class: "empty" }, [t("noExpenses")]);

    var owing = f.byClient.length
      ? el("ul", { class: "rows" }, f.byClient.map(function (c) {
          return el("li", { onclick: function () { go("invoices"); } }, [
            el("span", { class: "dot bad" }),
            el("div", { class: "r-main" }, [el("b", {}, [c.name])]),
            el("span", { class: "num", style: "font-weight:800" }, [money(c.due)]),
          ]);
        }))
      : el("p", { class: "empty" }, [ico("check", 18), t("allClear")]);

    var last = f.months[f.months.length - 1];

    mount([
      el("div", { class: "kpis money" }, [
        kpi({ value: bd(last.revenue), label: t("collected"), icon: "coins", tone: "good" }),
        kpi({ value: bd(last.cost), label: t("costs"), icon: "wallet", tone: "warn" }),
        kpi({ value: bd(last.profit), label: t("profit"), icon: "chart",
              tone: Number(last.profit) < 0 ? "bad" : "" }),
        kpi({ value: bd(f.outstanding), label: t("outstanding"), icon: "receipt",
              tone: Number(f.outstanding) > 0 ? "hot" : "good", go: "invoices" }),
      ]),
      el("section", { class: "panel" }, [
        el("h2", {}, [ico("chart"), t("sixMonths"),
          el("small", {}, [lang ? "collected, not invoiced" : "المحصّل فعلاً، لا المفوتر"])]),
        bars,
        el("p", { class: "legend", style: "margin-inline-start:0" }, [
          el("span", {}, [el("i", { class: "sw rev" }), " ", t("revenue")]),
          el("span", {}, [el("i", { class: "sw cost" }), " ", t("costs")]),
        ]),
      ]),
      el("div", { class: "cols" }, [
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("wallet"), t("spendByCat")]), cats,
        ]),
        el("section", { class: "panel" }, [
          el("h2", {}, [ico("receipt"), t("owedByClient")]), owing,
        ]),
      ]),
    ]);
  }

  // ------------------------------------------------------------ team
  async function viewTeam() {
    mount([
      el("div", { class: "jobs" }, team.map(function (m) {
        return el("article", { class: "job" }, [
          el("header", {}, [
            el("div", { class: "avatar", style: "width:46px;height:46px" },
              [(lang ? m.name_en : m.name_ar).trim().charAt(0)]),
            el("div", { class: "r-main" }, [
              el("h3", {}, [lang ? m.name_en : m.name_ar]),
              el("small", { class: "code" }, [m.phone]),
            ]),
            el("span", { class: "st st-" + (m.role === "owner" ? "accepted" : "sent") },
              [lang ? m.role_en : m.role_ar]),
          ]),
          el("div", { class: "job-facts" }, [
            el("a", { class: "btn btn--sm btn--go", href: "https://wa.me/973" + m.phone,
                      target: "_blank", rel: "noopener" }, [t("whatsapp")]),
            el("a", { class: "btn btn--sm btn--quiet", href: "tel:+973" + m.phone }, [t("call_")]),
          ]),
        ]);
      })),
      el("p", { class: "empty" }, [lang
        ? "PINs and permissions arrive with the real database — this list is for assigning work."
        : "الأرقام السرية والصلاحيات تجي مع قاعدة البيانات الحقيقية — هالقائمة للتوزيع فقط."]),
    ]);
  }

  // ------------------------------------------------------------ views map
  VIEWS.dashboard = viewDashboard;
  VIEWS.quotes = viewQuotes;
  VIEWS.jobs = viewJobs;
  VIEWS.calendar = viewCalendar;
  VIEWS.invoices = viewInvoices;
  VIEWS.expenses = function () { return viewExpenses(null); };
  VIEWS.finance = viewFinance;
  VIEWS.clients = viewClients;
  VIEWS.pricelist = viewPriceList;
  VIEWS.team = viewTeam;

  boot().catch(function (e) {
    document.getElementById("view").textContent = e.message;
  });
})();
