document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined") {
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // トップ FV アニメーション（fv-animation.js）
  if (typeof window.initFvAnimation === "function" && document.getElementById("fv")) {
    window.initFvAnimation();
  }
});
