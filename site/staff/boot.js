/* Loads before app.js so a failure in app.js becomes visible instead of silent.
   A page whose script never ran looks exactly like one that is ignoring you, which
   is what made this impossible to diagnose from the other end of a chat. */
(function () {
  "use strict";

  var BUILD = "v8";

  function say(message, bad) {
    var box = document.getElementById("bootMsg");
    if (!box) {
      box = document.createElement("p");
      box.id = "bootMsg";
      box.className = "muted";
      (document.getElementById("view") || document.body).appendChild(box);
    }
    box.textContent = message;
    box.style.color = bad ? "#ff6b6b" : "";
  }

  window.addEventListener("error", function (e) {
    var what = e && e.message ? e.message : "script error";
    // A <script> that failed to download fires an error on the element, with no message.
    if (e && e.target && e.target.tagName === "SCRIPT") {
      what = "لم يُحمَّل الملف " + String(e.target.src || "").split("/").pop();
    }
    say("خطأ: " + what, true);
  }, true);

  window.addEventListener("unhandledrejection", function (e) {
    say("خطأ: " + ((e.reason && e.reason.message) || "unhandled rejection"), true);
  });

  // Stamp the build into the header, so one glance says whether this browser has the
  // current files or a cached older set.
  document.addEventListener("DOMContentLoaded", function () {
    var who = document.getElementById("who");
    if (who && !who.textContent) who.textContent = "build " + BUILD;

    // app.js replaces #bootMsg. If it is still sitting there, say so plainly.
    setTimeout(function () {
      var still = document.getElementById("bootMsg");
      if (still && still.textContent.indexOf("جارٍ التحميل") === 0) {
        say("لم يُحمَّل التطبيق (" + BUILD + "). حدّث الصفحة بـ Ctrl+Shift+R، "
            + "أو افتحها في نافذة خاصة.", true);
      }
    }, 3000);
  });
})();
