/* Qobban staff portal — the screens.
   Vanilla, no framework and no build step, like the rest of the stack.
   The browser never computes a total it then stores: every figure shown comes back
   from /api/quote-preview, so what staff see is what the server will save. */
(function () {
  "use strict";

  // ------------------------------------------------------------ words
  // Arabic first, English second. One table, so a string cannot exist in only one.
  var T = {
    quotes: ["عروض الأسعار", "Quotes"], clients: ["العملاء", "Clients"],
    pricelist: ["قائمة الأسعار", "Price list"], newQuote: ["عرض جديد", "New quote"],
    newClient: ["عميل جديد", "New client"], save: ["حفظ", "Save"], cancel: ["إلغاء", "Cancel"],
    send: ["إرسال للعميل", "Send to customer"], search: ["بحث", "Search"],
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
    noQuotes: ["لا توجد عروض بعد", "No quotes yet"], noClients: ["لا يوجد عملاء بعد", "No clients yet"],
    saved: ["تم الحفظ", "Saved"], sent: ["تم الإرسال", "Sent"], copy: ["نسخ الرابط", "Copy link"],
    copied: ["تم نسخ الرابط", "Link copied"], reason: ["السبب", "Reason"],
    internalNote: ["ملاحظة داخلية (لا تُطبع)", "Internal note (never printed)"],
    desc: ["الوصف", "Description"], back: ["رجوع", "Back"], unit: ["الوحدة", "Unit"],
    cost: ["التكلفة", "Cost"], category: ["الفئة", "Category"], owed: ["المستحق", "Owed"],
  };
  var lang = localStorage.getItem("qb-lang") === "en" ? 1 : 0;
  var t = function (k) { return (T[k] || [k, k])[lang]; };

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

  function toast(msg, bad) {
    var box = $("#toast");
    box.textContent = msg;
    box.className = "toast" + (bad ? " toast--bad" : "");
    box.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { box.hidden = true; }, 3200);
  }

  // On qobban.store the portal talks to a demo API under /api/portal, kept separate
  // from the public site's own /api/lead function.
  var API = "/api/portal";

  // "error 404" tells nobody anything. Say what went wrong and what to do about it.
  function failure(status) {
    if (status === 404 || status === 502 || status === 503) {
      return lang ? "Service not reachable. Reload the page (Ctrl+Shift+R)."
                  : "الخدمة غير متاحة. حدّث الصفحة (Ctrl+Shift+R).";
    }
    if (status >= 500) return lang ? "Server error. Try again." : "خطأ في الخادم. حاول مرة أخرى.";
    return lang ? "Something went wrong (" + status + ")." : "حدث خطأ (" + status + ").";
  }

  async function api(method, path, body) {
    var r;
    try {
      // Call sites keep the portal's own paths ("/api/quotes") so this file stays
      // diffable against portal/web/staff/staff.js. Swap the prefix here, once —
      // prefixing without stripping produced /api/portal/api/login, which 404s.
      r = await fetch(API + path.replace(/^\/api/, ""), {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      // No response at all: offline, or the server is not running.
      throw new Error(lang ? "Cannot reach the server. Check your connection."
                           : "تعذّر الوصول إلى الخادم. تحقّق من الاتصال.");
    }
    var data = await r.json().catch(function () { return {}; });
    // The server's own message when it sent one — it is written for a person.
    if (!r.ok) throw new Error(data.error || failure(r.status));
    return data;
  }

  // ------------------------------------------------------------ session
  var me = null;

  async function boot() {
    try {
      me = await api("GET", "/api/me");
      showApp();
    } catch (e) {
      $("#login").hidden = false;
    }
  }

  $("#loginForm").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var btn = $("#loginForm button");
    btn.disabled = true;
    $("#loginErr").textContent = "";
    try {
      await api("POST", "/api/login", { phone: $("#phone").value.trim(), pin: $("#pin").value });
      me = await api("GET", "/api/me");
      $("#login").hidden = true;
      showApp();
    } catch (e) {
      $("#loginErr").textContent = e.message;
      btn.disabled = false;
    }
  });

  function showApp() {
    $("#login").hidden = true;
    $("#app").hidden = false;
    $("#who").textContent = me.user.name_ar || me.user.name_en;
    // This build runs on the public site with no database behind it. Say so plainly,
    // because a screen that looks like a working system but forgets what you typed
    // is worse than one that admits it.
    if (me.demo) {
      var d = el("div", { class: "warn" }, [lang
        ? "DEMO — no database. Nothing you type is saved; it is cleared whenever the "
          + "server sleeps. Practice clients and practice prices only."
        : "نسخة تجريبية — بلا قاعدة بيانات. لا يُحفظ ما تُدخله، ويُمسح عند خمول الخادم. "
          + "عملاء وأسعار للتجربة فقط."]);
      $("#view").parentNode.insertBefore(d, $("#view"));
    }
    // A placeholder VAT number means nothing may go to a real customer yet.
    if (!me.company.vat_no || me.company.vat_no.indexOf("PLACEHOLDER") === 0) {
      var w = el("div", { class: "warn" }, [lang
        ? "VAT number not set — quotes are for practice only and must not be sent to a real customer."
        : "الرقم الضريبي غير مُسجّل — العروض للتجربة فقط ولا يجوز إرسالها لعميل حقيقي."]);
      $("#view").parentNode.insertBefore(w, $("#view"));
    }
    go("quotes");
  }

  $("#out").addEventListener("click", async function () {
    await api("POST", "/api/logout", {});
    location.reload();
  });
  $("#lang").addEventListener("click", function () {
    localStorage.setItem("qb-lang", lang ? "ar" : "en");
    location.reload();
  });

  $("#tabs").addEventListener("click", function (ev) {
    var b = ev.target.closest(".tab");
    if (b) go(b.dataset.view);
  });

  function go(view) {
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (b) {
      b.classList.toggle("is-on", b.dataset.view === view);
    });
    ({ quotes: viewQuotes, clients: viewClients, pricelist: viewPriceList }[view] || viewQuotes)();
  }

  var mount = function (nodes) {
    var v = $("#view");
    v.textContent = "";
    nodes.forEach(function (n) { v.appendChild(n); });
  };

  // ------------------------------------------------------------ quotes list
  async function viewQuotes() {
    var d = await api("GET", "/api/quotes");
    var rows = d.quotes.length
      ? el("div", { class: "rows" }, d.quotes.map(function (q) {
          return el("div", { class: "row", role: "button", tabindex: "0",
                             onclick: function () { editQuote(q.id); } }, [
            el("div", {}, [
              el("div", { class: "row__main" }, [q.no + " · " + (q.customer_name || "")]),
              el("div", { class: "row__sub" }, [q.subject || ""]),
            ]),
            el("div", { class: "row__right" }, [
              el("div", { class: "row__amt" }, [money(q.total)]),
              el("span", { class: "pill pill--" + q.status }, [q.status]),
            ]),
          ]);
        }))
      : el("div", { class: "empty" }, [t("noQuotes")]);

    mount([
      el("div", { class: "head" }, [
        el("h2", {}, [t("quotes")]),
        el("button", { class: "btn btn--primary", onclick: function () { editQuote(null); } }, [t("newQuote")]),
      ]),
      rows,
    ]);
  }

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
          editQuote(r.id || id);
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
        var link = location.origin + "/api/portal/q/" + q.token;
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
    var d = await api("GET", "/api/clients");
    var rows = d.clients.length
      ? el("div", { class: "rows" }, d.clients.map(function (c) {
          return el("div", { class: "row" }, [
            el("div", {}, [
              el("div", { class: "row__main" }, [c.name]),
              el("div", { class: "row__sub" }, [c.phone + (c.area ? " · " + c.area : "")]),
            ]),
            el("div", { class: "row__right muted" }, [c.company_name || ""]),
          ]);
        }))
      : el("div", { class: "empty" }, [t("noClients")]);

    mount([
      el("div", { class: "head" }, [
        el("h2", {}, [t("clients")]),
        el("button", { class: "btn btn--primary", onclick: clientForm }, [t("newClient")]),
      ]),
      rows,
    ]);
  }

  function clientForm() {
    var f = {};
    var field = function (key, label, attrs) {
      return el("div", {}, [el("label", { for: key }, [label]),
        el("input", Object.assign({ id: key, oninput: function () { f[key] = this.value; } }, attrs || {}))]);
    };
    mount([
      el("div", { class: "head" }, [el("h2", {}, [t("newClient")]),
        el("button", { class: "btn btn--quiet", onclick: viewClients }, [t("back")])]),
      el("div", { class: "panel" }, [
        el("div", { class: "grid2" }, [
          field("name", t("name"), { required: "required" }),
          field("phone", t("phone"), { inputmode: "numeric", required: "required" }),
          field("company_name", t("company")),
          field("area", t("area")),
          field("vat_no", t("vat")),
          field("cr_no", t("cr")),
          field("email", t("email"), { type: "email" }),
        ]),
        el("label", { for: "note" }, [t("note")]),
        el("textarea", { id: "note", oninput: function () { f.note = this.value; } }),
        el("div", { class: "head" }, [
          el("button", { class: "btn btn--primary", onclick: async function () {
            this.disabled = true;
            try {
              f.kind = f.company_name ? "company" : "person";
              await api("POST", "/api/clients", f);
              toast(t("saved"));
              viewClients();
            } catch (e) { toast(e.message, true); this.disabled = false; }
          } }, [t("save")]),
        ]),
      ]),
    ]);
  }

  // ------------------------------------------------------------ price list
  async function viewPriceList() {
    var d = await api("GET", "/api/pricelist");
    var byCat = {};
    d.items.forEach(function (i) { (byCat[i.category || "—"] = byCat[i.category || "—"] || []).push(i); });

    var blocks = Object.keys(byCat).map(function (cat) {
      return el("div", { class: "panel" }, [
        el("h3", {}, [cat]),
        el("div", { class: "rows" }, byCat[cat].map(function (i) {
          return el("div", { class: "row" }, [
            el("div", {}, [
              el("div", { class: "row__main" }, [lang ? i.name_en : (i.name_ar || i.name_en)]),
              el("div", { class: "row__sub" }, [i.code + " · " + i.unit]),
            ]),
            el("div", { class: "row__right" }, [
              el("div", { class: "row__amt" }, [money(i.rate)]),
              i.cost != null ? el("div", { class: "row__sub" }, [t("cost") + " " + money(i.cost)]) : null,
            ]),
          ]);
        })),
      ]);
    });

    mount([el("div", { class: "head" }, [el("h2", {}, [t("pricelist")]),
      el("span", { class: "muted" }, [d.items.length + ""])])].concat(blocks));
  }

  boot();
})();
