/**
 * 川越 FV アニメーション
 *
 * Figma: 川越FV_260605共有 → ページ「Review」→ セクション「アニメーション指示」(node 68:621)
 *
 * タイミングの調整は FV_TIMING だけ触れば OK です（単位: 秒）。
 * イージングは FV_EASE を変更してください。
 */
(function () {
  "use strict";

  // ─────────────────────────────────────────
  // 調整用パラメータ（ここを編集）
  // ─────────────────────────────────────────
  var FV_TIMING = {
    // Scene 01（航空写真 → bg02 → タイトル）
    scene01: {
      delayBeforeBg02: 1.0,    // 航空写真のみ表示してから bg02 へ
      bg02Duration: 1.8,       // bg02（エリア名含む）のフェードイン
      delayBeforeTitle: 0,     // タイトル表示前の待機
      titleDuration: 1.8,      // タイトルのフェードイン
      holdAfterEnd: 2.0,       // Scene01 終了後の待機
    },

    // Scene 02 / 03（背景横スライド + 縦書きテキスト）
    slideScene: {
      bgDuration: 4.0,         // 背景スライド全体の時間
      textDuration: 0.8,       // テキストのフェードイン時間
      // テキストが完了する背景の進捗（0〜1）。Figma 指示: 半分くらい
      textCompleteAtBgProgress: 0.5,
    },

    // Scene 04（光 → パース → テキスト）
    scene04: {
      delayBeforePerspective: 1.0,
      perspectiveDuration: 0.8,
      delayBeforeText: 0.4,
      textDuration: 0.8,
    },

    // シーン切り替えのフェード（A→B など）
    sceneCrossfade: 0.6,
  };

  var FV_EASE = {
    fade: "power2.out",
    slide: "power1.inOut",
    rise: "power2.out",
  };

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
      txtD: fv.querySelector(".fv__layer--txt-d"),
    };

    resetSlidePosition(layers.slideB, layers.wrapB);
    resetSlidePosition(layers.slideC, layers.wrapC);
    gsap.set(layers.perspective, { y: 40 });

    fv.classList.add("fv--ready");
    showScene(scenes.a);

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

    // ── Scene 02 ──────────────────────────
    tl.addLabel("scene02");
    addSceneCrossfade(tl, scenes.a, scenes.b, FV_TIMING.sceneCrossfade);
    addSlideScene(tl, layers.slideB, layers.txtB, layers.wrapB);

    // ── Scene 03 ──────────────────────────
    tl.addLabel("scene03");
    addSceneCrossfade(tl, scenes.b, scenes.c, FV_TIMING.sceneCrossfade);
    addSlideScene(tl, layers.slideC, layers.txtC, layers.wrapC);

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

    tl.to({}, { duration: FV_TIMING.scene04.delayBeforeText });

    tl.addLabel("scene04-text");
    tl.to(layers.txtD, {
      autoAlpha: 1,
      duration: FV_TIMING.scene04.textDuration,
    });

    window.addEventListener("resize", function () {
      if (!fv.classList.contains("fv--complete")) {
        resetSlidePosition(layers.slideB, layers.wrapB);
        resetSlidePosition(layers.slideC, layers.wrapC);
      }
    });
  }

  // ─────────────────────────────────────────
  // タイムライン用ヘルパー
  // ─────────────────────────────────────────

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

  /**
   * 横スライド背景 + 縦書きテキスト
   * Figma 指示: 背景は左→右 / テキストはふわっと（背景半分で完了）
   */
  function addSlideScene(tl, slideBg, textEl, wrapEl) {
    var t = FV_TIMING.slideScene;
    var distance = calcSlideDistance(slideBg, wrapEl);

    gsap.set(slideBg, { x: distance });
    gsap.set(textEl, { autoAlpha: 0 });

    tl.to(slideBg, {
      x: 0,
      duration: t.bgDuration,
      ease: FV_EASE.slide,
    });

    // 背景が textCompleteAtBgProgress 進んだ時点でテキスト表示完了
    var textStart =
      t.bgDuration * t.textCompleteAtBgProgress - t.textDuration;
    if (textStart < 0) textStart = 0;

    tl.to(
      textEl,
      {
        autoAlpha: 1,
        duration: t.textDuration,
      },
      "<+=" + textStart
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

  window.initFvAnimation = initFvAnimation;
})();
