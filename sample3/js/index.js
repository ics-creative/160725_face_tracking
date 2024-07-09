// DOM
const inner = document.getElementById("inner");

/**
 * 顔のワイヤーフレームが表示されるcanvas
 * @type {HTMLCanvasElement}
 */
const wireframe = document.getElementById("wireframe");
const wireframeContext = wireframe.getContext("2d");

/** @type HTMLVideoElement */
const video = document.getElementById("video");

/**
 * ログ表示用
 * @type {HTMLDivElement}
 */
const log = document.getElementById("log");

// Stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// clmtrackr
let ctrack;

// 処理開始
start();

/**
 * 処理開始
 */
async function start() {
    drawLog("Webカメラ読込中...");

    // clmtrackrをインスタンス化
    ctrack = new clm.tracker();

    // MediaStream APIでWebカメラへアクセス
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
    });
    // videoのメタデータの取得が成功
    video.addEventListener("loadedmetadata", (event) => {
        // videoのサイズを取得
        const videoW = video.clientWidth;
        const videoH = video.clientHeight;
        // windowの横幅を取得
        const windowW = inner.clientWidth;
        // windowの横幅と動画の横幅の比率を算出
        const videoRate = windowW / videoW;

        // サイズを設定
        video.width = wireframe.width = windowW;
        video.height = wireframe.height = videoH * videoRate;

        // 繰り返し処理開始
        loop();

        drawLog("顔検出中...");

        // 顔を検出できたときのEvent
        document.addEventListener("clmtrackrConverged", clmtrackrConvergedHandler);
        // 顔を検出できなかったときのEvent
        document.addEventListener("clmtrackrLost", clmtrackrLostHandler);
        // 顔のモデルデータを設定
        ctrack.init(pModel);
        // 顔の検出を開始
        ctrack.start(video);

        loop();
    });


    // videoでWebカメラの映像を表示
    video.srcObject = stream;
}

/**
 * 繰り返し処理
 */
function loop() {
    requestAnimationFrame(loop);

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
