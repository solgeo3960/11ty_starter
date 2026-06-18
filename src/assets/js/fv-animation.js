/**
 * 川越 FV アニメーション
 *
 * Figma: 川越FV_260605共有 → ページ「Review」→ セクション「アニメーション指示」(node 68:621)
 *
 * タイミングの調整は FV_TIMING だけ触れば OK です（単位: 秒）。
 * イージングは FV_EASE を変更してください。
 *
 * @format
 */

(function () {
  "use strict";

  // ─────────────────────────────────────────
  // 調整用パラメータ（ここを編集）
  // ─────────────────────────────────────────
  var FV_TIMING = {
    // Scene 01（航空写真 → bg02 → タイトル）
    scene01: {
      delayBeforeBg02: 1.0, // 航空写真のみ表示してから bg02 へ
      bg02Duration: 2.0, // bg02（エリア名含む）のフェードイン
      delayBeforeTitle: 0.5, // タイトル表示前の待機
      titleDuration: 1.0, // タイトルのフェードイン
      holdAfterEnd: 2.0, // タイトル表示後の待機
      fadeOutDuration: 1.5, // Scene01 終了時のフェードアウト
    },

    scene02: {
      fadeInDuration: 2.0, // Scene02 フェードイン（スライドと同時開始）
    },

    // Scene 02 / 03（背景横スライド + 縦書きテキスト）
    slideScene: {
      bgDuration: 4.0, // 背景スライド全体の時間（PC）
      bgDurationSp: 8.0, // 背景スライド全体の時間（スマホ〜767px）
      textDuration: 4.0, // テキストのフェードイン時間
      // テキストが完了する背景の進捗（0〜1）。Figma 指示: 半分くらい
      textCompleteAtBgProgress: 0.5,
    },

    // Scene 04（パース → 光 + テキスト）
    scene04: {
      delayBeforePerspective: 1.0,
      perspectiveDuration: 4.0,
      // パース完了後の待機（光・テキストは個別に調整可）
      delayBeforeLight: 0.4,
      lightDuration: 0.8,
      delayBeforeText: 0.4,
      textDuration: 0.8,
    },

    // シーン切り替えのフェード（A→B など）
    sceneCrossfade: 0.6,
  };

  var FV_EASE = {
    fade: "none",
    slide: "none",
    rise: "none",
  };

  var FV_LOADER = {
    minDuration: 800, // ローダー最低表示時間（ms）
    maxWait: 30000, // 画像待ちタイムアウト（ms）
    hideDuration: 0.8, // ローダー退場（秒）
  };

  var FV_SP_MQ = "(max-width: 767px)";

  function isSpFv() {
    return window.matchMedia(FV_SP_MQ).matches;
  }

  function getSlideSceneTiming() {
    var base = FV_TIMING.slideScene;
    if (!isSpFv()) {
      return base;
    }
    return {
      bgDuration:
        base.bgDurationSp != null ? base.bgDurationSp : base.bgDuration,
      textDuration: base.textDuration,
      textCompleteAtBgProgress: base.textCompleteAtBgProgress,
    };
  }

  // ─────────────────────────────────────────
  // 画像プリロード → アニメーション開始
  // ─────────────────────────────────────────
  function bootstrapFv() {
    var fv = document.getElementById("fv");
    var loader = document.getElementById("fv-loader");

    if (!fv || typeof gsap === "undefined") {
      finishWithoutLoader(loader);
      return;
    }

    document.body.classList.add("is-fv-loading");
    if (loader) {
      gsap.set(loader, { autoAlpha: 1 });
    }

    var urls = collectFvImageUrls(fv);
    var startTime = Date.now();

    preloadImages(urls, updateLoaderProgress).then(function () {
      var elapsed = Date.now() - startTime;
      var remaining = Math.max(0, FV_LOADER.minDuration - elapsed);

      window.setTimeout(function () {
        hideLoader(loader).then(initFvAnimation);
      }, remaining);
    });
  }

  function finishWithoutLoader(loader) {
    document.body.classList.remove("is-fv-loading");
    if (loader) {
      loader.remove();
    }
    initFvAnimation();
  }

  function resolvePictureUrl(picture) {
    var sources = picture.querySelectorAll("source");
    var i;

    for (i = 0; i < sources.length; i++) {
      var media = sources[i].getAttribute("media");
      if (media && window.matchMedia(media).matches) {
        return sources[i].getAttribute("srcset");
      }
    }

    var img = picture.querySelector("img");
    return img ? img.getAttribute("src") : null;
  }

  function collectFvImageUrls(fv) {
    var urls = [];

    fv.querySelectorAll("picture").forEach(function (picture) {
      var url = resolvePictureUrl(picture);
      if (url) {
        urls.push(url);
      }
    });

    return urls.filter(function (url, index, list) {
      return list.indexOf(url) === index;
    });
  }

  function preloadImages(urls, onProgress) {
    return new Promise(function (resolve) {
      if (!urls.length) {
        if (onProgress) {
          onProgress(1);
        }
        resolve();
        return;
      }

      var loaded = 0;
      var total = urls.length;
      var settled = false;

      function done() {
        if (settled) {
          return;
        }
        settled = true;
        resolve();
      }

      var timeout = window.setTimeout(done, FV_LOADER.maxWait);

      function tick() {
        loaded++;
        if (onProgress) {
          onProgress(loaded / total);
        }
        if (loaded >= total) {
          window.clearTimeout(timeout);
          done();
        }
      }

      urls.forEach(function (url) {
        var img = new Image();
        img.onload = tick;
        img.onerror = tick;
        img.src = url;
      });
    });
  }

  function updateLoaderProgress(ratio) {
    var loader = document.getElementById("fv-loader");
    if (!loader) {
      return;
    }

    var pct = Math.min(100, Math.round(ratio * 100));
    var bar = loader.querySelector(".fv-loader__progress-bar");
    var progress = loader.querySelector(".fv-loader__progress");

    if (bar) {
      bar.style.width = pct + "%";
    }
    if (progress) {
      progress.setAttribute("aria-valuenow", String(pct));
    }
  }

  function hideLoader(loader) {
    return new Promise(function (resolve) {
      document.body.classList.remove("is-fv-loading");

      if (!loader) {
        resolve();
        return;
      }

      loader.setAttribute("aria-busy", "false");

      gsap.to(loader, {
        autoAlpha: 0,
        duration: FV_LOADER.hideDuration,
        ease: "power2.inOut",
        onComplete: function () {
          loader.remove();
          resolve();
        },
      });
    });
  }

  // ─────────────────────────────────────────
  // 初期化
  // ─────────────────────────────────────────
  function initFvAnimation() {
    var fv = document.getElementById("fv");
    if (!fv || typeof gsap === "undefined") {
      return;
    }

    var scenes = {
      a: fv.querySelector('[data-fv-scene="a"]'),
      b: fv.querySelector('[data-fv-scene="b"]'),
      c: fv.querySelector('[data-fv-scene="c"]'),
      d: fv.querySelector('[data-fv-scene="d"]'),
    };

    var layers = {
      bg02: fv.querySelector(".fv__layer--bg02"),
      title: fv.querySelector(".fv__layer--title"),
      slideB: fv.querySelector('[data-fv-scene="b"] [data-fv-slide-bg]'),
      slideC: fv.querySelector('[data-fv-scene="c"] [data-fv-slide-bg]'),
      wrapB: fv.querySelector('[data-fv-scene="b"] [data-fv-slide-wrap]'),
      wrapC: fv.querySelector('[data-fv-scene="c"] [data-fv-slide-wrap]'),
      txtB: fv.querySelector(".fv__layer--txt-b"),
      txtC: fv.querySelector(".fv__layer--txt-c"),
      perspective: fv.querySelector(".fv__layer--perspective"),
      light: fv.querySelector(".fv__layer--light"),
      txtD: fv.querySelector(".fv__layer--txt-d"),
    };

    resetSlidePosition(layers.slideB, layers.wrapB);
    resetSlidePosition(layers.slideC, layers.wrapC);
    gsap.set(layers.perspective, { y: isSpFv() ? 12 : 40 });
    gsap.set(layers.light, { autoAlpha: 0 });

    fv.classList.add("fv--ready");
    showScene(scenes.a);

    // レイアウト確定後にスライド距離を再計算（PC 成り行き高さ対応）
    window.requestAnimationFrame(function () {
      refreshFvLayout(layers);
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      if (fv.classList.contains("fv--complete")) {
        return;
      }
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        refreshFvLayout(layers);
      }, 100);
    });

    var tl = gsap.timeline({
      defaults: { ease: FV_EASE.fade },
      onComplete: function () {
        fv.classList.add("fv--complete");
      },
    });

    // ── Scene 01 ──────────────────────────
    tl.addLabel("scene01");
    tl.to({}, { duration: FV_TIMING.scene01.delayBeforeBg02 });

    tl.addLabel("scene01-bg02");
    tl.to(layers.bg02, {
      autoAlpha: 1,
      duration: FV_TIMING.scene01.bg02Duration,
    });

    tl.to({}, { duration: FV_TIMING.scene01.delayBeforeTitle });

    tl.addLabel("scene01-title");
    tl.to(layers.title, {
      autoAlpha: 1,
      duration: FV_TIMING.scene01.titleDuration,
    });

    tl.to({}, { duration: FV_TIMING.scene01.holdAfterEnd });

    tl.addLabel("scene01-fadeout");
    tl.to(scenes.a, {
      autoAlpha: 0,
      duration: FV_TIMING.scene01.fadeOutDuration,
      onComplete: function () {
        hideScene(scenes.a);
      },
    });

    // ── Scene 02 ──────────────────────────
    tl.addLabel("scene02");
    addSceneFadeIn(tl, scenes.b, FV_TIMING.scene02.fadeInDuration);
    // フェードインと同時に背景スライド開始
    addSlideScene(tl, layers.slideB, layers.txtB, layers.wrapB, "<");

    // ── Scene 03 ──────────────────────────
    tl.addLabel("scene03");
    addSceneCrossfade(tl, scenes.b, scenes.c, FV_TIMING.sceneCrossfade);
    // クロスフェードと同時に背景スライド開始
    addSlideScene(tl, layers.slideC, layers.txtC, layers.wrapC, "<");

    // ── Scene 04 ──────────────────────────
    tl.addLabel("scene04");
    addSceneCrossfade(tl, scenes.c, scenes.d, FV_TIMING.sceneCrossfade);
    tl.to({}, { duration: FV_TIMING.scene04.delayBeforePerspective });

    tl.addLabel("scene04-perspective");
    tl.to(layers.perspective, {
      autoAlpha: 1,
      y: 0,
      duration: FV_TIMING.scene04.perspectiveDuration,
      ease: FV_EASE.rise,
    });

    tl.addLabel("scene04-after-perspective");

    tl.addLabel("scene04-light");
    tl.to(
      layers.light,
      {
        autoAlpha: 1,
        duration: FV_TIMING.scene04.lightDuration,
      },
      "scene04-after-perspective+=" + FV_TIMING.scene04.delayBeforeLight,
    );

    tl.addLabel("scene04-text");
    tl.to(
      layers.txtD,
      {
        autoAlpha: 1,
        duration: FV_TIMING.scene04.textDuration,
      },
      "scene04-after-perspective+=" + FV_TIMING.scene04.delayBeforeText,
    );
  }

  // ─────────────────────────────────────────
  // タイムライン用ヘルパー
  // ─────────────────────────────────────────

  function refreshFvLayout(layers) {
    resetSlidePosition(layers.slideB, layers.wrapB);
    resetSlidePosition(layers.slideC, layers.wrapC);
  }

  function showScene(sceneEl) {
    if (!sceneEl) return;
    sceneEl.hidden = false;
    gsap.set(sceneEl, { autoAlpha: 1 });
  }

  function hideScene(sceneEl) {
    if (!sceneEl) return;
    sceneEl.hidden = true;
    gsap.set(sceneEl, { autoAlpha: 0 });
  }

  /** シーン A → B のようなクロスフェード */
  function addSceneCrossfade(tl, fromScene, toScene, duration) {
    showScene(toScene);
    gsap.set(toScene, { autoAlpha: 0 });

    tl.to(fromScene, {
      autoAlpha: 0,
      duration: duration,
      onComplete: function () {
        hideScene(fromScene);
      },
    });
    tl.to(toScene, { autoAlpha: 1, duration: duration }, "<");
  }

  /** 前シーンをフェードアウト済みのとき、次シーンだけフェードイン */
  function addSceneFadeIn(tl, toScene, duration) {
    showScene(toScene);
    gsap.set(toScene, { autoAlpha: 0 });
    tl.to(toScene, { autoAlpha: 1, duration: duration });
  }

  /**
   * 横スライド背景 + 縦書きテキスト
   * Figma 指示: 背景は左→右 / テキストはふわっと（背景半分で完了）
   *
   * @param {string} [position=">"] GSAP のタイムライン位置（Scene02/03 は "<" でフェードと同時）
   */
  function addSlideScene(tl, slideBg, textEl, wrapEl, position) {
    var t = getSlideSceneTiming();
    var distance = calcSlideDistance(slideBg, wrapEl);
    var startAt = position || ">";

    gsap.set(slideBg, { x: distance });
    gsap.set(textEl, { autoAlpha: 0 });

    tl.to(
      slideBg,
      {
        x: 0,
        duration: t.bgDuration,
        ease: FV_EASE.slide,
      },
      startAt,
    );

    // 背景が textCompleteAtBgProgress 進んだ時点でテキスト表示完了
    var textStart = t.bgDuration * t.textCompleteAtBgProgress - t.textDuration;
    if (textStart < 0) textStart = 0;

    tl.to(
      textEl,
      {
        autoAlpha: 1,
        duration: t.textDuration,
      },
      "<+=" + textStart,
    );
  }

  function calcSlideDistance(slideBg, wrapEl) {
    if (!slideBg || !wrapEl) return 0;
    return wrapEl.offsetWidth - slideBg.offsetWidth;
  }

  function resetSlidePosition(slideBg, wrapEl) {
    if (!slideBg) return;
    gsap.set(slideBg, { x: calcSlideDistance(slideBg, wrapEl) });
  }

  window.bootstrapFv = bootstrapFv;
  window.initFvAnimation = initFvAnimation;
})();
