document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined") {
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // トップ FV（画像プリロード → アニメーション開始）
  if (typeof window.bootstrapFv === "function" && document.getElementById("fv")) {
    window.bootstrapFv();
  } else if (typeof window.initFvAnimation === "function" && document.getElementById("fv")) {
    window.initFvAnimation();
  }
});
