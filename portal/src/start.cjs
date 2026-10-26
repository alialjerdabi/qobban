// Entry for the host's runner, which require()s the entry file; the app itself is ESM.
import("./server.js").then((m) => m.start()).catch((e) => { console.error(e); process.exit(1); });
