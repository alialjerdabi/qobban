/* Loads before app.js so a failure in app.js becomes visible instead of silent.
   Three rounds of "nothing happens when I press login" came from a page that had no
   way to say what went wrong. Now it does. */
(function () {
  "use strict";

  var BUILD = "v7";

  function show(message) {
    var box = document.getElementById("loginErr");
    if (box) {
      box.style.color = "";
      box.textContent = message;
    }
    var btn = document.getElementById("loginBtn");
    if (btn) {
      btn.disabled = false;              // never leave a button that cannot be pressed
      btn.textContent = "دخول";
    }
  }

  // Anything thrown while loading or running the app lands here.
  window.addEventListener("error", function (e) {
    var what = e && e.message ? e.message : "script error";
    // A failed <script> fires an error event on the element, with no message.
    if (e && e.target && e.target.tagName === "SCRIPT") {
      what = "لم يُحمَّل الملف " + (e.target.src || "").split("/").pop();
    }
    show("خطأ: " + what);
  }, true);

  window.addEventListener("unhandledrejection", function (e) {
    show("خطأ: " + ((e.reason && e.reason.message) || "unhandled rejection"));
  });

  // Stamp the build on the page. When something looks wrong, this says in one glance
  // whether the browser is running the current files or a cached older set.
  document.addEventListener("DOMContentLoaded", function () {
    var tag = document.getElementById("buildTag");
    if (tag) tag.textContent = "build " + BUILD;

    // app.js enables the button. If it is still disabled a moment after load, the
    // script did not run — say so rather than leaving a dead control.
    setTimeout(function () {
      var btn = document.getElementById("loginBtn");
      if (btn && btn.disabled) {
        show("لم يُحمَّل التطبيق. حدّث الصفحة بـ Ctrl+Shift+R.");
      }
    }, 3000);
  });
})();
