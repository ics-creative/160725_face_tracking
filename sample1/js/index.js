// DOM
const inner = document.getElementById("inner");

// 画像が表示されるcanvas
const imageCanvas = document.getElementById("image");
const imageContext = image.getContext("2d");

// 顔のワイヤーフレームが表示されるcanvas
const wireframe = document.getElementById("wireframe");
const wireframeContext = wireframe.getContext("2d");

// input file
const inputFile = document.getElementById("inputFile");

// ログ表示用
const log = document.getElementById("log");

// clmtrackr
let ctrack;

// 描画用RequestAnimationFrame
let drawRequest;

// 処理開始
start();

/**
 * 処理開始
 */
async function start() {
  // clmtrackrをインスタンス化
  ctrack = new clm.tracker();

  // 初期読み込み用の画像のURL

  const imgPath = "images/seminar_02.jpg";
  const img = new Image();
  img.src = imgPath;
  await img.decode();

  drawLog("顔検出中...");
  // 読み込んだ画像をcanvasへ描画
  drawImage(img);

  // 画像ファイルの読み込み
  inputFile.addEventListener("change", fileChangeHandler);
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
async function fileChangeHandler(event) {
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
  const file = event.target.files[0];

  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  drawLog("画像読み込み成功");

  setTimeout(function () {
    drawLog("顔検出中...");

    // canvasへ描画
    drawImage(img);
  }, 1000);

}

/**
 * canvasへ画像を描画
 * @param img {HTMLImageElement}
 */
function drawImage(img) {
  // 画像ファイルのサイズを取得
  const imgW = img.width;
  const imgH = img.height;
  // windowの横幅を取得
  const windowW = inner.clientWidth;
  // windowの横幅と画像の横幅の比率を算出
  const imgRate = windowW / imgW;

  // canvasのサイズを設定
  const imageCanvasWidth = imageCanvas.width = wireframe.width = windowW;
  const imageCanvasHeight = imageCanvas.height = wireframe.height = imgH * imgRate;

  // 画像をcanvasへ描画
  imageContext.drawImage(img, 0, 0, imageCanvasWidth, imageCanvasHeight);

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

  // 繰り返し処理開始
  loop();
}

/**
 * 顔検出失敗
 */
function clmtrackrLostHandler() {
  drawLog("顔検出失敗");
}

/**
 * 顔検出成功
 */
function clmtrackrConvergedHandler() {
  drawLog("顔検出成功");
}


/**
 * ログを表示
 * @param str {String}
 */
function drawLog(str) {
  log.textContent = str;
}
