// const targetUrl = "https://course.ntu.edu.tw/result/final/table";

// // check in correct website, or redirect
// document.getElementById('btn-redirect').addEventListener('click', () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         const currentTabId = tabs[0].id;
//         chrome.tabs.update(currentTabId, { url: targetUrl });
        
//         window.close();
//     });
// });

// function clickLoginButton() {
//     const loginBtn = document.querySelector('a[href="/login"]');
//     loginBtn.click();
//     return true;
// }
// // check login status
// document.getElementById('btn-login').addEventListener('click', () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         chrome.scripting.executeScript({
//             target: { tabId: tabs[0].id },
//             func: clickLoginButton,
//             }, (results) => {
//             if (chrome.runtime.lastError) {
//                 console.error(chrome.runtime.lastError);
//                 return;
//             }}
//         );
//     });
//     window.close();
// });

// function checkLoginStatus() {
//     return !!document.querySelector(".tr");
// }

// const wrongWebsite = document.getElementById('wrong-website');
// const notLoggedIn = document.getElementById('not-logged-in');
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const currentUrl = tabs[0].url;
//     const targetUrl = "course.ntu.edu.tw/result/final/table";

//     if (!currentUrl.includes(targetUrl)) wrongWebsite.classList.remove('hidden');
//     else {
//         wrongWebsite.classList.add('hidden');
        
//         chrome.scripting.executeScript({
//             target: { tabId: tabs[0].id },
//             func: checkLoginStatus,
//             }, (results) => {
//             if (chrome.runtime.lastError) {
//                 console.error(chrome.runtime.lastError);
//                 return;
//             }

//             const foundTable = results[0].result;

//             if (results[0].result) notLoggedIn.classList.add('hidden');
//             else notLoggedIn.classList.remove('hidden');
//         });
//     }
// });

/**
 * ============================================================
 * 1. 全域變數與設定 (Global Variables & Config)
 * ============================================================
 */
let classCache = []; // 預設為空陣列，避免 undefined 報錯

// Config 的 Key 必須跟 HTML ID 完全一致 (camelCase)
const config = {
    // 外觀顏色
    bgColor: "#fdfbf7",
    textColor: "#2c3e50",

    // 表格範圍
    startDay: 1,
    endDay: 5,
    startNum: 1,
    endNum: 10,

    // 顯示控制 (Checkbox)
    showClassName: true,
    showWeekTitle: true,
    showClassroom: true,
    showTime: true,

    // 字體大小 (Slider)
    classNameSize: 24,
    weekTitleSize: 35,
    classroomSize: 20,
    timeSize: 35,

    // 版面留白設定 (單位: px)
    paddingX: 40,      // 左右留白
    paddingTop: 250,   // 上方留白 (Header)
    paddingBottom: 100, // 下方留白 (Footer)
    textAlign: 0
};

const controlGroup = document.querySelector('.control-group');
const statusDiv = document.getElementById('status');

/**
 * ============================================================
 * 2. 事件監聽處理 (Event Handlers)
 * ============================================================
 */

// 2-1. 通用輸入處理 (Input & Select & Checkbox)
function handleInput(e) {
    const target = e.target;
    const key = target.id;

    // 防呆：確保此 ID 存在於 config 中
    if (key && key in config) {
        let value;

        if (target.type === 'checkbox') {
            value = target.checked;
        } else if (target.type === 'number' || target.type === 'range' || target.tagName === 'SELECT') {
            value = Number(target.value);
        } else {
            value = target.value;
        }

        config[key] = value;
        console.log(`[Config Update] ${key} =>`, value);
        
        // 設定改變時，立刻重繪
        drawWallpaper(classCache);
    }
}

controlGroup.addEventListener('input', handleInput);
controlGroup.addEventListener('change', handleInput);


// 2-2. Checkbox 與 Slider 的連動邏輯 (Disable 功能)
const controlPairs = [
    { toggleId: 'showClassName', sliderId: 'classNameSize' },
    { toggleId: 'showWeekTitle', sliderId: 'weekTitleSize' },
    { toggleId: 'showClassroom', sliderId: 'classroomSize' },
    { toggleId: 'showTime', sliderId: 'timeSize' }
];

controlPairs.forEach(pair => {
    const checkbox = document.getElementById(pair.toggleId);
    const slider = document.getElementById(pair.sliderId);

    if (checkbox && slider) {
        // 初始化狀態
        slider.disabled = !checkbox.checked;

        // 監聽變更
        checkbox.addEventListener('change', (e) => {
            slider.disabled = !e.target.checked;
        });
    }
});


// 2-3. 下載圖片功能
const formatDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
};

document.getElementById('btn-download').addEventListener('click', () => {
    const canvas = document.getElementById('wallpaperCanvas');
    const link = document.createElement('a');
    link.download = `wallpaper_${formatDate(new Date())}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    statusDiv.innerText = "下載完成！";
});

/**
 * ============================================================
 * 3. 核心邏輯：資料抓取 (Data Fetching)
 * ============================================================
 */
function fetchCourseData() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                reject("找不到目前的頁籤");
                return;
            }

            const activeTab = tabs[0];
            
            // 注入 Content Script (確保 content.js 有載入)
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    reject(`注入腳本失敗: ${chrome.runtime.lastError.message}`);
                    return;
                }

                // 發送訊息抓取資料
                chrome.tabs.sendMessage(activeTab.id, { action: "scrape_schedule" }, (response) => {
                    if (chrome.runtime.lastError) {
                        // 通常是因為頁面還沒載入完，或不是目標網頁
                        reject("連線失敗，請確認在正確的課程網頁面");
                        return;
                    }

                    if (response && response.data) {
                        resolve(response.data);
                    } else {
                        resolve([]); // 沒抓到資料，回傳空陣列
                    }
                });
            });
        });
    });
}

/**
 * ============================================================
 * 4. 繪圖邏輯 (Drawing Logic)
 * ============================================================
 */
function drawWallpaper(courses) {
    if (!courses) courses = [];

    const canvas = document.getElementById('wallpaperCanvas');
    const ctx = canvas.getContext('2d');
    
    // --- 1. 時間資料與版面參數 ---
    const timeLabels = [
        "07:10-08:00", "08:10-09:00", "09:10-10:00", 
        "10:20-11:10", "11:20-12:10", "12:20-13:10", 
        "13:20-14:10", "14:20-15:10", "15:30-16:20", 
        "16:30-17:20", "17:30-18:20", "18:25-19:15", 
        "19:20-20:10", "20:15-21:05", "21:10-22:00"
    ];

    const W = 1080;
    const H = 2400;

    const titleAreaHeight = config.showWeekTitle ? (config.weekTitleSize + 30) : 0;
    const headerH = config.paddingTop + titleAreaHeight;    
    const footerH = config.paddingBottom; 
    
    // 🔥 關鍵修改：動態計算時間軸寬度
    let timelineWidth = 0;
    if (config.showTime) {
        // 先設定好字體，才能量得準
        ctx.font = `bold ${config.timeSize}px sans-serif`;
        // 量一下最寬的時間字串 (例如 "00:00")
        const textMetric = ctx.measureText("00:00"); 
        // 寬度 = 文字寬度 + 左右緩衝 (例如各 15px，共 30px)
        timelineWidth = textMetric.width + 30; 
    }

    const basePadding = config.paddingX;
    
    // 最終計算出的 Padding
    const paddingLeft = basePadding + timelineWidth; 
    const paddingRight = basePadding;
    // 清空背景
    ctx.fillStyle = config.bgColor; 
    ctx.fillRect(0, 0, W, H);

    // 計算欄位寬度
    const totalDays = config.endDay - config.startDay + 1;
    const safeDays = totalDays > 0 ? totalDays : 1;
    const colWidth = (W - paddingLeft - paddingRight) / safeDays;

    // --- 2. 繪製上方星期標題 ---
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    ctx.font = `bold ${config.weekTitleSize}px sans-serif`;
    ctx.fillStyle = config.textColor;
    
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom"; 

    for (let i = 0; i < safeDays; i++) {
        const currentDayIndex = (config.startDay - 1) + i; 
        if (currentDayIndex < dayNames.length) {
            const name = dayNames[currentDayIndex];
            const x = paddingLeft + i * colWidth + colWidth / 2;
            
            if (config.showWeekTitle) {
                // 貼齊 Header 底線，往上留 15px 間隙
                ctx.fillText(name, x, headerH - 15);
            }
        }
    }

    // --- 3. 繪製左側時間 ---
    const totalPeriods = config.endNum - config.startNum + 1;
    const safePeriods = totalPeriods > 0 ? totalPeriods : 10;
    const rowHeight = (H - headerH - footerH) / safePeriods;

    if (config.showTime) {
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";
        
        // 🔥 時間軸定位：固定貼在表格左側 (65px 是經驗值)
        const centerAxisX = paddingLeft - (timelineWidth / 2);

        for (let i = 0; i < safePeriods; i++) {
            const pIdx = config.startNum + i;
            const y = headerH + i * rowHeight;
            const centerY = y + rowHeight / 2;
            
            if (timeLabels[pIdx]) {
                const [startT, endT] = timeLabels[pIdx].split('-');
                
                ctx.font = `bold ${config.timeSize}px sans-serif`; 
                ctx.fillStyle = config.textColor;

                const yOffset = config.timeSize * 0.6;

                // 繪製開始與結束時間
                ctx.fillText(startT, centerAxisX, centerY - yOffset);
                ctx.fillText(endT, centerAxisX, centerY + yOffset);
            }

            // 畫虛線分隔
            ctx.strokeStyle = "rgba(0,0,0,0.05)";
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(W - paddingRight, y);
            ctx.stroke();
        }
    }

    // --- 4. 繪製課程 ---
    const periodMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, 
        "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
        "A": 11, "B": 12, "C": 13, "D": 14
    };
    
    const defaultColors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"];

    // ⚡️ Helper: 自動換行計算函式 (不用改)
    const getLines = (text, maxWidth) => {
        if (!text) return [];
        const words = text.split('');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + word).width;
            if (width < maxWidth) {
                currentLine += word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    courses.forEach(course => {
        // 範圍檢查
        if (course.day_index < config.startDay || course.day_index > config.endDay) return;
        const pIdx = periodMap[course.period];
        if (pIdx === undefined || pIdx < config.startNum || pIdx > config.endNum) return;

        // 計算座標
        const colIdx = course.day_index - config.startDay; 
        const rowIdx = pIdx - config.startNum;
        const x = paddingLeft + colIdx * colWidth + 5; 
        const y = headerH + rowIdx * rowHeight + 5;
        const w = colWidth - 10;
        const h = rowHeight - 10;
        
        // 1. 取得單科客製化設定
        const settings = (window.courseSettings && window.courseSettings[course.name]) || {
            alias: "",
            bgColor: defaultColors[course.name.length % defaultColors.length],
            textColor: "#333333"
        };

        // 畫背景方塊
        ctx.fillStyle = settings.bgColor;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.fill();
        ctx.clip(); 

        // 🔥 2. 計算對齊座標 (Alignment Calculation)
        const paddingInside = 10;
        let textX;

        // 根據 slider 值 (0, 1, 2) 設定對齊模式
        // 0: Left, 1: Center, 2: Right
        const alignMode = config.textAlign; 

        if (alignMode === 1) { // 置中
            ctx.textAlign = "center";
            textX = x + w / 2; // 格子中心點
        } else if (alignMode === 2) { // 靠右
            ctx.textAlign = "right";
            textX = x + w - paddingInside; // 格子右邊界扣掉 padding
        } else { // 靠左 (預設)
            ctx.textAlign = "left";
            textX = x + paddingInside; // 格子左邊界加上 padding
        }

        ctx.textBaseline = "top";
        ctx.fillStyle = settings.textColor;

        // 3. 準備繪製內容 (回復為由上而下排列)
        let currentY = y + paddingInside; // 固定從上方開始畫
        const displayNameText = (settings.alias && settings.alias.trim() !== "") ? settings.alias : course.name;
        
        const nameLineHeight = config.classNameSize * 1.3;
        const gap = config.classNameSize * 0.2;

        // A. 畫課名
        if (config.showClassName) {
            ctx.font = `bold ${config.classNameSize}px sans-serif`;
            
            // 計算換行 (寬度限制要扣掉左右 padding)
            const lines = getLines(displayNameText, w - (paddingInside * 2));
            
            lines.forEach(line => {
                ctx.fillText(line, textX, currentY); // 使用算好的 textX
                currentY += nameLineHeight;
            });
            currentY += gap;
        }

        // B. 畫教室
        if (config.showClassroom) {
            ctx.font = `${config.classroomSize}px sans-serif`;
            ctx.globalAlpha = 0.9;
            ctx.fillText(course.room, textX, currentY); // 使用算好的 textX
            ctx.globalAlpha = 1.0;
        }
        
        ctx.restore(); 
    });
}

/**
 * ============================================================
 * 5. 初始化流程 (Initialization)
 * ============================================================
 */
/**
 * 自動判斷：星期幾範圍 + 節次範圍
 */
function autoAdjustSettings() {
    // 1. 防呆：沒資料就不用算了
    if (!classCache || classCache.length === 0) return;

    // --- A. 判斷星期 (原本的邏輯) ---
    const hasSaturday = classCache.some(c => c.day_index === 6);
    if (hasSaturday) {
        console.log("偵測到星期六，自動設為 6");
        updateControlValue('endDay', 6); // 呼叫下方輔助函式更新 UI
    }

    // --- B. 判斷節次 (新功能) ---
    
    // 定義節次權重 map (方便比大小)
    const pMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, 
        "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
        "A": 11, "B": 12, "C": 13, "D": 14
    };

    let minP = 14; // 預設最大值 (往下找小)
    let maxP = 0;  // 預設最小值 (往上找大)
    let hasValidData = false;

    classCache.forEach(course => {
        const val = pMap[course.period];
        // 確保這堂課的節次是有效的 (例如不是 "undefined")
        if (val !== undefined) {
            if (val < minP) minP = val;
            if (val > maxP) maxP = val;
            hasValidData = true;
        }
    });

    if (hasValidData) {
        console.log(`自動偵測節次範圍: ${minP} ~ ${maxP}`);
        
        // 更新起始節次
        updateControlValue('startNum', minP);
        
        // 更新結束節次
        updateControlValue('endNum', maxP);
    }
}

/**
 * ⚡️ 輔助函式：同時更新 Config 和 HTML UI
 * @param {string} id - HTML 元素的 ID (必須跟 config key 一樣)
 * @param {number} value - 要設定的值
 */
function updateControlValue(id, value) {
    // 1. 更新全域 Config
    config[id] = value;

    // 2. 更新 HTML 選單
    const element = document.getElementById(id);
    if (element) {
        element.value = value.toString(); // Select 的 value 需為字串
        
        // 🔥 這裡不需要 dispatchEvent，因為我們是在 init() 裡
        // init() 最後會統一呼叫一次 drawWallpaper()，不用觸發多次重繪
    }
}

async function init() {
    try {
        statusDiv.innerText = "正在讀取課表...";
        
        // 1. 抓資料
        const data = await fetchCourseData();
        classCache = data; 
        statusDiv.innerText = `抓取成功！共 ${classCache.length} 堂課`;

        // 2. 🔥 自動調整設定 (星期 + 節次)
        autoAdjustSettings();

        // 3. 最後才畫圖
        drawWallpaper(classCache);

    } catch (err) {
        console.error(err);
        statusDiv.innerText = "讀取失敗，請確認網頁狀態";
        // 就算失敗，也可以畫一個空課表給使用者看
        drawWallpaper([]);
    }
}

// 啟動！
document.addEventListener('DOMContentLoaded', init);