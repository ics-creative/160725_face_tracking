(function () {
  // DOM
  var wrapper = document.getElementById("wrapper");
  var inner = document.getElementById("inner");

  // 画像が表示されるcanvas
  var imageCanvas = document.getElementById("image");
  var imageContext = image.getContext("2d");

  // 顔のワイヤーフレームが表示されるcanvas
  var wireframe = document.getElementById("wireframe");
  var wireframeContext = wireframe.getContext("2d");

  // input file
  var inputFile = document.getElementById("inputFile");

  // ログ表示用
  var log = document.getElementById("log");

  // clmtrackr
  var ctrack;

  // 描画用RequestAnimationFrame
  var drawRequest;

  // 処理開始
  start();

  /**
   * 処理開始
   */
  function start() {
    // clmtrackrをインスタンス化
    ctrack = new clm.tracker();

    // 初期読み込み用の画像のURL
    var imgPath = "images/umi_kappa.jpg";

    // 画像の読み込み
    // JavaScript Load Imageライブラリを使用
    // https://github.com/blueimp/JavaScript-Load-Image
    loadImage(imgPath, function (img) {
      drowLog("顔検出中...");
      // 読み込んだ画像をcanvasへ描画
      drawImage(img);

      // 画像ファイルの読み込み
      inputFile.addEventListener("change", fileChangeHandler);
    });
  }

  /**
   * 繰り返し処理
   */
  function loop() {
    // requestAnimationFrame
    drawRequest = requestAnimationFrame(loop);

    // canvasの描画をクリア
    wireframeContext.clearRect(0, 0, wireframe.width, wireframe.height);

    // 座標が取得できたかどうか
    if (ctrack.getCurrentPosition()) {
      // ワイヤーフレームをcanvasへ描画
      ctrack.draw(wireframe);
    }
  }

  /**
   * 画像ファイルを選択
   * @param event
   */
  function fileChangeHandler(event) {
    // 繰り返し処理停止
    cancelAnimationFrame(drawRequest);

    // Remove Event
    document.removeEventListener("clmtrackrLost", clmtrackrLostHandler);
    document.removeEventListener("clmtrackrConverged", clmtrackrConvergedHandler);

    // clmtrackr停止
    ctrack.stop();

    // canvasの描画をクリア
    imageContext.clearRect(0, 0, image.width, image.height);
    wireframeContext.clearRect(0, 0, wireframe.width, wireframe.height);

    // 選択した画像ファイルを取得
    var file = event.target.files[0];

    // 画像ファイルのメタデータを取得
    loadImage.parseMetaData(file, function (data) {
      var options = {
        canvas: true
      };

      // 画像ファイルにExifが設定されていればパラメーターとして設定
      // スマホで画像が回転してしまう挙動の対策
      if (data.exif) {
        options.orientation = data.exif.get("Orientation");
      }

      // 画像の読み込み
      loadImage(
        file,
        function (img) {
          drowLog("画像読み込み成功");

          setTimeout(function () {
            drowLog("顔検出中...");

            // canvasへ描画
            drawImage(img);
          }, 1000);
        }, options);
    });
  }

  /**
   * canvasへ画像を描画
   * @param img
   */
  function drawImage(img) {
    // 画像ファイルのサイズを取得
    var imgW = img.width;
    var imgH = img.height;
    // windowの横幅を取得
    var windowW = inner.clientWidth;
    // windowの横幅と画像の横幅の比率を算出
    var imgRate = windowW / imgW;

    // canvasのサイズを設定
    var imageCanvasWidth = imageCanvas.width = wireframe.width = windowW;
    var imageCanvasHeight = imageCanvas.height = wireframe.height = imgH * imgRate;

    // 画像をcanvasへ描画
    imageContext.drawImage(img, 0, 0, imageCanvasWidth, imageCanvasHeight);

    // 繰り返し処理開始
    loop();

    // 顔を検出できたときのEvent
    document.addEventListener("clmtrackrConverged", clmtrackrConvergedHandler);
    // 顔を検出できなかったときのEvent
    document.addEventListener("clmtrackrLost", clmtrackrLostHandler);
    // 顔検出処理をリセット
    ctrack.reset();
    // 顔のモデルデータを設定
    ctrack.init(pModel);
    // 顔の検出を開始
    ctrack.start(imageCanvas);
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

    // 繰り返し処理停止
    cancelAnimationFrame(drawRequest);
  }

  /**
   * ログを表示
   * @param str
   */
  function drowLog(str) {
    log.innerHTML = str;
  }

})();