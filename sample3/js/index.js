(function () {
  // DOM
  var wrapper = document.getElementById("wrapper");
  var inner = document.getElementById("inner");

  // 顔のワイヤーフレームが表示されるcanvas
  var wireframe = document.getElementById("wireframe");
  var wireframeContext = wireframe.getContext("2d");

  // video
  var video = document.getElementById("video");

  // ログ表示用
  var log = document.getElementById("log");

  // Stats
  var stats;

  // clmtrackr
  var ctrack;

  // 描画用RequestAnimationFrame
  var drawRequest;

  //ベンダープリフィックスの有無を吸収
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  // 処理開始
  start();

  /**
   * 処理開始
   */
  function start() {
    // Stats
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    drowLog("Webカメラ読込中...");

    // clmtrackrをインスタンス化
    ctrack = new clm.tracker();

    // MediaStream APIでWebカメラへアクセス
    navigator.getUserMedia({
        video: true,
        audio: true
      },
      function (mediaStream) {
        // videoのメタデータの取得が成功
        video.addEventListener("loadedmetadata", function (event) {
          // videoのサイズを取得
          var videoW = video.clientWidth;
          var videoH = video.clientHeight;
          // windowの横幅を取得
          var windowW = inner.clientWidth;
          // windowの横幅と動画の横幅の比率を算出
          var videoRate = windowW / videoW;

          // サイズを設定
          video.width = wireframe.width = windowW;
          video.height = wireframe.height = videoH * videoRate;

          // 繰り返し処理開始
          loop();

          drowLog("顔検出中...");

          // 顔を検出できたときのEvent
          document.addEventListener("clmtrackrConverged", clmtrackrConvergedHandler);
          // 顔を検出できなかったときのEvent
          document.addEventListener("clmtrackrLost", clmtrackrLostHandler);
          // 顔のモデルデータを設定
          ctrack.init(pModel);
          // 顔の検出を開始
          ctrack.start(video);
        });

        // videoでWebカメラの映像を表示
        video.src = URL.createObjectURL(mediaStream);
      },
      function (error) {
        console.log("error", error);
      });
  }

  /**
   * 繰り返し処理
   */
  function loop() {
    // requestAnimationFrame
    drawRequest = requestAnimationFrame(loop);

    // Stats計測開始
    stats.begin();

    // canvasの描画をクリア
    wireframeContext.clearRect(0, 0, wireframe.width, wireframe.height);

    // 座標が取得できたかどうか
    if (ctrack.getCurrentPosition()) {
      // ワイヤーフレームを描画
      ctrack.draw(wireframe);
    }

    // Stats計測終了
    stats.end();
  }

  /**
   * 顔検出失敗
   */
  function clmtrackrLostHandler() {
    // Remove Event
    document.removeEventListener("clmtrackrLost", clmtrackrLostHandler);
    document.removeEventListener("clmtrackrConverged", clmtrackrConvergedHandler);

    drowLog("顔検出失敗");

    // 繰り返し処理停止
    cancelAnimationFrame(drawRequest);
    // 顔検出処理停止
    ctrack.stop();
  }

  /**
   * 顔検出成功
   */
  function clmtrackrConvergedHandler() {
    // Remove Event
    document.removeEventListener("clmtrackrLost", clmtrackrLostHandler);
    document.removeEventListener("clmtrackrConverged", clmtrackrConvergedHandler);

    drowLog("顔検出成功");
  }

  /**
   * ログを表示
   * @param str
   */
  function drowLog(str) {
    log.innerHTML = str;
  }

})();