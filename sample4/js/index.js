(function () {
  // DOM
  var wrapper = document.getElementById("wrapper");
  var inner = document.getElementById("inner");

  // 顔のワイヤーフレームが表示されるcanvasタグ
  var wireframe = document.getElementById("wireframe");
  var wireframeContext = wireframe.getContext("2d");

  // マスクを描画するcanvas
  var maskCanvas;

  // video
  var video = document.getElementById("video");

  // ログ表示用
  var log = document.getElementById("log");

  // マスク画像
  var maskUrl = "images/mask.jpg";
  // マスクの頂点データ
  var maskData = [[266.539778613571, 254.84378898872825], [266.3039097561577, 285.302233189556], [271.19357329466345, 316.3538789507933], [278.7139543521674, 345.15573844972926], [293.15712497356776, 368.9809024015706], [312.64193974141324, 389.09850232246515], [322.13343587641253, 398.3663601209212], [336.9858985066435, 401.49456958745145], [356.87519225850986, 398.5376499254816], [382.97232156668036, 391.79752653535775], [421.61286401088506, 373.50434543677886], [448.74322775690695, 344.0259953810623], [464.77440099078314, 310.71915538180275], [468.2775933241595, 272.2241198406615], [466.74514645738424, 247.20492682906303], [415.26964981149064, 225.8370550250565], [390.13712322351404, 222], [361.92175039938184, 220.2582273389706], [342.2734356138508, 232.04834635926073], [267.7624903928149, 236.00873885152805], [280.88607721372824, 229], [303.9033677258633, 228], [316.6965360192193, 234.20369314639848], [281.57998031880885, 254.77971856631495], [298.953459306752, 246.21641370334032], [315.75345517431316, 254.4516165242651], [296.6631361379687, 258.36486568494297], [301.63327656416925, 252.0239926097512], [398.27491865673994, 249.8954346966754], [380.22403819342355, 243.83584281695727], [357.98660716766716, 253.53119540181672], [378.25469629277825, 255.99515336941278], [382.6139465907322, 249.6433274231842], [328, 253], [314.73794539936216, 301.757722929817], [309.85213116736014, 314.6797549304112], [313.1507370768973, 321.4994076914073], [325.20473159190635, 327.87953636258146], [350.1231795924951, 324.5425216268138], [358.3783946629097, 316.6717252774034], [352.7986254362873, 299.5519517987678], [326, 282], [314.75674487301336, 318.32005216616164], [343.0322275619273, 319.2819917007706], [307.87514392633693, 346.0346979532304], [316.68926117981914, 342.91320569661593], [321.7320399187087, 341.45780089974846], [327.8558316510405, 343.56649844038935], [336.18423231506125, 341.74737597014604], [351.00603891713007, 342.2560527375472], [367.88222498993025, 344.3660717427479], [357.305053617142, 354.4583428810625], [343.5761668856892, 358.8848818975423], [328.82001419900075, 359.1051832365163], [320.36190636746045, 358.71759346010083], [312.61714975606304, 353.5625007817836], [318.4988566294063, 348.1744254793423], [328.6406599928464, 349.73460503451736], [350.2480353796336, 349.6831133201238], [349.5754234743516, 349.5362145583936], [329.32557946752445, 349.67345155068153], [318.2253756678819, 347.9222277142419], [324.4964277572599, 315.63122813643895], [288.26630901657126, 248.99890899333045], [309.3536455351319, 248.83485523505226], [307.7075352919804, 256.40978560947974], [288.62032608071166, 258.5736833679789], [390.2498028902113, 244.8663932568382], [368.1047796233772, 247.18427292360775], [368.62079313091925, 255.76448975973483], [390.7655312307384, 254.4464699123733]];
  // マスクを描画するクラス
  var fd;

  // Stats
  var stats;

  // clmtrackr
  var ctrack;

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

    // MediaStream APIでWebカメラへアクセス
    navigator.getUserMedia({
        video: true,
        audio: true
      },
      function (mediaStream) {
        // videoのメタデータの取得が成功
        video.addEventListener("loadedmetadata", function (event) {
          drowLog("顔検出中...");
          // videoのサイズを取得
          var videoW = video.clientWidth;
          var videoH = video.clientHeight;

          // マスク用のcanvasを生成
          maskCanvas = document.createElement("canvas");
          maskCanvas.setAttribute("id", "mask");

          // サイズを設定
          video.width = wireframe.width = maskCanvas.width = videoW;
          video.height = wireframe.height = maskCanvas.height = videoH;

          // マスク用canvasを配置
          document.getElementById("drawArea").appendChild(maskCanvas);

          setTimeout(function () {
            // clmtrackrをインスタンス化
            ctrack = new clm.tracker();
            // 顔のモデルデータを設定
            ctrack.init(pModel);

            // マスクを描画するクラスをインスタンス化
            fd = new faceDeformer();
            // マスクを描画するcanvasを指定
            fd.init(maskCanvas);

            // マスク用画像の読み込み
            var img = document.createElement("img");
            img.onload = function () {
              // マスクの設定
              fd.load(img, maskData, pModel);
            };
            img.src = maskUrl;

            // 繰り返し処理開始
            loop();

            // 顔を検出できたときのEvent
            document.addEventListener("clmtrackrConverged", clmtrackrConvergedHandler);
            // 顔を検出できなかったときのEvent
            document.addEventListener("clmtrackrLost", clmtrackrLostHandler);
            // 顔の検出を開始
            ctrack.start(video);
          }, 1000);
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
    // Stats計測開始
    stats.begin();

    // canvasの描画をクリア
    wireframeContext.clearRect(0, 0, wireframe.width, wireframe.height);

    // 座標が取得できたかどうか
    if (ctrack.getCurrentPosition()) {
      // ワイヤーフレームを描画
      ctrack.draw(wireframe);
    }

    // マスクを適応する範囲が決まってきたかどうか
    var pn = ctrack.getConvergence();
    if (pn < 0.4) {
      requestAnimationFrame(drawMaskLoop);
    } else {
      requestAnimationFrame(loop);
    }

    // Stats計測終了
    stats.end();
  }

  /**
   * マスク描画用の繰り返し処理
   */
  function drawMaskLoop() {
    // requestAnimationFrame
    requestAnimationFrame(drawMaskLoop);

    // canvasの描画をクリア
    wireframeContext.clearRect(0, 0, wireframe.width, wireframe.height);

    // 座標を取得
    var positions = ctrack.getCurrentPosition();
    if (positions) {
      // マスクを描画
      fd.draw(positions);
    }
  }

  /**
   * 顔検出失敗
   */
  function clmtrackrLostHandler() {
    // Remove Event
    document.removeEventListener("clmtrackrLost", clmtrackrLostHandler);
    document.removeEventListener("clmtrackrConverged", clmtrackrConvergedHandler);

    drowLog("顔検出失敗");
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