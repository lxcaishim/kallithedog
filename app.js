(function () {
  /** Paste your Solana mint (contract address) here — DexScreener + Pump link + copy use this. */
  var TOKEN_CA = "";

  var X_URL = "https://x.com/kallionsol";

  function trimCa(ca) {
    return (ca || "").trim();
  }

  function shortenCa(ca) {
    if (!ca || ca.length < 14) return ca;
    return ca.slice(0, 4) + "…" + ca.slice(-4);
  }

  function dexEmbedUrl(ca) {
    var encoded = encodeURIComponent(ca);
    return (
      "https://dexscreener.com/solana/" +
      encoded +
      "?embed=1&theme=dark&trades=0"
    );
  }

  function pumpUrl(ca) {
    return "https://pump.fun/coin/" + encodeURIComponent(ca);
  }

  function setPumpAnchors(ca) {
    var urls = ca ? pumpUrl(ca) : "https://pump.fun";
    var ids = ["pump-link", "buy-link", "footer-pump-link"];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (!el) continue;
      el.href = urls;
    }
  }

  function initChart(ca) {
    var iframe = document.getElementById("dexscreener-embed");
    var placeholder = document.getElementById("chart-placeholder");
    if (!iframe || !placeholder) return;

    if (!ca) {
      iframe.removeAttribute("src");
      iframe.setAttribute("hidden", "");
      placeholder.removeAttribute("hidden");
      return;
    }

    placeholder.setAttribute("hidden", "");
    iframe.removeAttribute("hidden");
    iframe.src = dexEmbedUrl(ca);
  }

  function initXLink() {
    if (!X_URL) return;
    ["link-x", "footer-link-x"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = X_URL;
    });
  }

  function initCaHeroLabel(ca) {
    var btn = document.getElementById("copy-ca-hero");
    if (!btn) return;
    btn.textContent = ca ? "CA: " + shortenCa(ca) : "CA: TBD";
  }

  function feedbackTarget(el) {
    if (!el) return null;
    var span = el.querySelector(".btn-text");
    return span || el;
  }

  function tbdCopyText(feedbackEl) {
    if (!feedbackEl) return "";
    var fromAttr = (feedbackEl.getAttribute("data-tbd-copy") || "").trim();
    if (fromAttr) return fromAttr;
    return (
      "Kalli mint (CA) is not live on this page yet — check X for updates: " +
      X_URL
    );
  }

  function copyContract(ca, feedbackEl, okText, failText) {
    var target = feedbackTarget(feedbackEl);
    if (!ca) {
      var toCopy = tbdCopyText(feedbackEl);
      navigator.clipboard.writeText(toCopy).then(
        function () {
          if (target) {
            var p = target.textContent;
            target.textContent = okText || "Copied!";
            setTimeout(function () {
              target.textContent = p;
            }, 1500);
          }
        },
        function () {
          if (target) {
            var p = target.textContent;
            target.textContent = failText || "Couldn't copy";
            setTimeout(function () {
              target.textContent = p;
            }, 1500);
          }
        }
      );
      return;
    }
    navigator.clipboard.writeText(ca).then(
      function () {
        if (target) {
          var p = target.textContent;
          target.textContent = okText || "Copied";
          setTimeout(function () {
            target.textContent = p;
          }, 1500);
        }
      },
      function () {
        if (target) {
          var p = target.textContent;
          target.textContent = failText || "Failed";
          setTimeout(function () {
            target.textContent = p;
          }, 1500);
        }
      }
    );
  }

  function initCopyButtons(ca) {
    var heroBtn = document.getElementById("copy-ca-hero");
    if (heroBtn) {
      heroBtn.addEventListener("click", function () {
        copyContract(ca, heroBtn, "Copied!", "Failed");
      });
    }
  }

  var FLOWER_COUNTS_KEY = "kalli-flower-counts";

  function getFlowerCounts() {
    try {
      return JSON.parse(localStorage.getItem(FLOWER_COUNTS_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function setFlowerCounts(obj) {
    try {
      localStorage.setItem(FLOWER_COUNTS_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function formatFlowerCount(n) {
    if (n >= 1000000) {
      var m = n / 1000000;
      return (m % 1 === 0 ? m : m.toFixed(1)) + "m";
    }
    if (n >= 10000) {
      var k = n / 1000;
      return (k % 1 === 0 ? k : k.toFixed(1)) + "k";
    }
    if (n >= 1000) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return String(n);
  }

  function initGalleryFlowerLikes() {
    var counts = getFlowerCounts();
    document.querySelectorAll("[data-like-count]").forEach(function (el) {
      var id = el.getAttribute("data-like-count");
      if (!id) return;
      el.textContent = formatFlowerCount(counts[id] || 0);
    });

    document.querySelectorAll(".gallery-like-btn").forEach(function (btn) {
      var id = btn.getAttribute("data-like-id");
      if (!id) return;
      btn.addEventListener("click", function () {
        counts = getFlowerCounts();
        counts[id] = (counts[id] || 0) + 1;
        setFlowerCounts(counts);
        var out = document.querySelector('[data-like-count="' + id + '"]');
        if (out) out.textContent = formatFlowerCount(counts[id]);
        btn.classList.remove("gallery-like-pop");
        void btn.offsetWidth;
        btn.classList.add("gallery-like-pop");
      });
    });
  }

  function initStickyHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    function update() {
      el.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function run() {
    var ca = trimCa(TOKEN_CA);
    initXLink();
    initCaHeroLabel(ca);
    initChart(ca);
    setPumpAnchors(ca);
    initCopyButtons(ca);
    initStickyHeader();
    initGalleryFlowerLikes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
