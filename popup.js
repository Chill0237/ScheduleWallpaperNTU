/**
 * ============================================================
 * 0. 確保網址正確與登入狀態
 * ============================================================
 */

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
 * 1. 全域變數與設定
 * ============================================================
 */
let classCache = []; 

// Config 的 Key 必須跟 HTML ID 完全一致
const config = {
    // 外觀顏色
    bgColor: "#fdfbf7",
    textColor: "#2c3e50",

    // 表格範圍
    startDay: 1,
    endDay: 5,
    startNum: 1,
    endNum: 10,

    // 顯示控制
    showClassName: true,
    showWeekTitle: true,
    showClassroom: true,
    showTime: true,

    // 字體大小
    classNameSize: 24,
    weekTitleSize: 35,
    classroomSize: 20,
    timeSize: 35,

    // 版面留白設定
    paddingX: 40,
    paddingTop: 250,
    paddingBottom: 100,
    textAlign: 0
};

// 全域變數：存儲單科客製化設定
// key: 課程原名, value: { alias, bgColor, textColor }
window.courseSettings = {}; 

// 主題色票庫
const themes = {
    pastel: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"],
    cool:   ["#caf0f8", "#ade8f4", "#90e0ef", "#48cae4", "#00b4d8", "#0096c7", "#0077b6", "#023e8a"],
    dark:   ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#6d6875", "#b5838d", "#e5989b"],
    morandi:["#7A7265", "#A6A59E", "#B09F85", "#D3C4BE", "#E2D3C1", "#8F9E9D", "#778691", "#686A6C"]
};

const controlGroup = document.querySelector('.control-group');
const statusDiv = document.getElementById('status');

/**
 * ============================================================
 * 2. 事件監聽處理
 * ============================================================
 */

// 2-1. 通用輸入處理
function handleInput(e) {
    const target = e.target;
    const key = target.id;

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
        drawWallpaper(classCache);
    }
}

// 綁定全域輸入事件 (事件委派)
if (controlGroup) {
    controlGroup.addEventListener('input', handleInput);
    controlGroup.addEventListener('change', handleInput);
}

// 2-2. Checkbox 與 Slider 連動 (Disable 功能)
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
        slider.disabled = !checkbox.checked;
        checkbox.addEventListener('change', (e) => {
            slider.disabled = !e.target.checked;
        });
    }
});

// 2-3. Tab 分頁切換
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// 2-4. 下載圖片
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
 * 3. 核心邏輯：資料抓取 & 處理
 * ============================================================
 */
function fetchCourseData() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) { reject("找不到目前的頁籤"); return; }
            const activeTab = tabs[0];
            
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    reject(`注入腳本失敗: ${chrome.runtime.lastError.message}`);
                    return;
                }
                chrome.tabs.sendMessage(activeTab.id, { action: "scrape_schedule" }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject("連線失敗，請確認在正確的課程網頁面");
                        return;
                    }
                    if (response && response.data) resolve(response.data);
                    else resolve([]);
                });
            });
        });
    });
}

/**
 * Helper: 取得排序後的不重複課名列表 (依照時間排序)
 */
function getSortedUniqueNames(courses) {
    if (!courses) return [];
    const pMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, 
        "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
        "A": 11, "B": 12, "C": 13, "D": 14
    };
    const courseMinTime = {};

    courses.forEach(c => {
        const pVal = pMap[c.period] !== undefined ? pMap[c.period] : 99;
        if (!courseMinTime[c.name]) {
            courseMinTime[c.name] = { day: c.day_index, period: pVal };
        } else {
            const current = courseMinTime[c.name];
            if (c.day_index < current.day || (c.day_index === current.day && pVal < current.period)) {
                courseMinTime[c.name] = { day: c.day_index, period: pVal };
            }
        }
    });

    return Object.keys(courseMinTime).sort((a, b) => {
        const timeA = courseMinTime[a];
        const timeB = courseMinTime[b];
        if (timeA.day !== timeB.day) return timeA.day - timeB.day;
        return timeA.period - timeB.period;
    });
}

/**
 * ============================================================
 * 4. UI 渲染：課程列表與主題
 * ============================================================
 */
function renderCourseList(courses) {
    const container = document.getElementById('course-list-container');
    container.innerHTML = ''; 

    if (!courses || courses.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">請先抓取課表資料</div>';
        return;
    }

    const uniqueNames = getSortedUniqueNames(courses);
    const defaultPalette = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"];

    uniqueNames.forEach((name, index) => {
        if (!window.courseSettings[name]) {
            window.courseSettings[name] = {
                alias: "", 
                bgColor: defaultPalette[index % defaultPalette.length],
                textColor: "#333333"
            };
        }
        const settings = window.courseSettings[name];

        const item = document.createElement('div');
        item.className = 'course-item';
        item.innerHTML = `
            <div class="course-info">
                <span class="course-original-name">${name}</span>
                <input type="text" class="input-alias" placeholder="自訂顯示名稱" value="${settings.alias}">
            </div>
            <div class="circle-color-wrapper" title="背景顏色" style="margin-right:5px;">
                <input type="color" class="circle-color-input bg-color-picker" value="${settings.bgColor}">
            </div>
            <div class="circle-color-wrapper" title="文字顏色" style="border: 1px solid #ccc;">
                <input type="color" class="circle-color-input text-color-picker" value="${settings.textColor}">
            </div>
        `;

        item.querySelector('.input-alias').addEventListener('input', (e) => {
            window.courseSettings[name].alias = e.target.value;
            drawWallpaper(classCache);
        });
        item.querySelector('.bg-color-picker').addEventListener('input', (e) => {
            window.courseSettings[name].bgColor = e.target.value;
            drawWallpaper(classCache);
        });
        item.querySelector('.text-color-picker').addEventListener('input', (e) => {
            window.courseSettings[name].textColor = e.target.value;
            drawWallpaper(classCache);
        });

        container.appendChild(item);
    });
}

// 全域函式 (供下拉選單呼叫)
window.applyTheme = function(themeName) {
    if (!classCache || classCache.length === 0) {
        alert("請先抓取課表！");
        return;
    }
    const palette = themes[themeName];
    const uniqueNames = getSortedUniqueNames(classCache);

    uniqueNames.forEach((name, index) => {
        if (window.courseSettings[name]) {
            window.courseSettings[name].bgColor = palette[index % palette.length];
            if (themeName === 'dark' || themeName === 'morandi') {
                window.courseSettings[name].textColor = "#ffffff";
            } else {
                window.courseSettings[name].textColor = "#333333";
            }
        }
    });
    renderCourseList(classCache);
    drawWallpaper(classCache);
};

/**
 * ============================================================
 * 5. 繪圖邏輯
 * ============================================================
 */
function drawWallpaper(courses) {
    if (!courses) courses = [];
    const canvas = document.getElementById('wallpaperCanvas');
    const ctx = canvas.getContext('2d');
    
    // 資料
    const timeLabels = [
        "07:10-08:00", "08:10-09:00", "09:10-10:00", "10:20-11:10", "11:20-12:10", "12:20-13:10", 
        "13:20-14:10", "14:20-15:10", "15:30-16:20", "16:30-17:20", "17:30-18:20", "18:25-19:15", 
        "19:20-20:10", "20:15-21:05", "21:10-22:00"
    ];
    const periodMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
        "A": 11, "B": 12, "C": 13, "D": 14
    };
    const defaultColors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"];

    // 參數計算
    const W = 1080, H = 2400;
    const titleAreaHeight = config.showWeekTitle ? (config.weekTitleSize + 30) : 0;
    const headerH = config.paddingTop + titleAreaHeight;    
    const footerH = config.paddingBottom; 
    
    let timelineWidth = 0;
    if (config.showTime) {
        ctx.font = `bold ${config.timeSize}px sans-serif`;
        const textMetric = ctx.measureText("00:00"); 
        timelineWidth = textMetric.width + 30; 
    }
    const paddingLeft = config.paddingX + timelineWidth; 
    const paddingRight = config.paddingX;

    // 清空
    ctx.fillStyle = config.bgColor; 
    ctx.fillRect(0, 0, W, H);

    // 格子大小
    const totalDays = config.endDay - config.startDay + 1;
    const safeDays = totalDays > 0 ? totalDays : 1;
    const colWidth = (W - paddingLeft - paddingRight) / safeDays;
    
    const totalPeriods = config.endNum - config.startNum + 1;
    const safePeriods = totalPeriods > 0 ? totalPeriods : 10;
    const rowHeight = (H - headerH - footerH) / safePeriods;

    // 1. 繪製上方星期
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    ctx.font = `bold ${config.weekTitleSize}px sans-serif`;
    ctx.fillStyle = config.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom"; 

    for (let i = 0; i < safeDays; i++) {
        const idx = (config.startDay - 1) + i; 
        if (idx < dayNames.length && config.showWeekTitle) {
            const x = paddingLeft + i * colWidth + colWidth / 2;
            ctx.fillText(dayNames[idx], x, headerH - 15);
        }
    }

    // 2. 繪製左側時間
    if (config.showTime) {
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const centerAxisX = paddingLeft - (timelineWidth / 2);
        for (let i = 0; i < safePeriods; i++) {
            const pIdx = config.startNum + i;
            const y = headerH + i * rowHeight;
            if (timeLabels[pIdx]) {
                const [startT, endT] = timeLabels[pIdx].split('-');
                ctx.font = `bold ${config.timeSize}px sans-serif`; 
                ctx.fillStyle = config.textColor;
                const yOffset = config.timeSize * 0.6;
                ctx.fillText(startT, centerAxisX, y + rowHeight / 2 - yOffset);
                ctx.fillText(endT, centerAxisX, y + rowHeight / 2 + yOffset);
            }
            // 分隔線
            ctx.strokeStyle = "rgba(0,0,0,0.05)";
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(W - paddingRight, y);
            ctx.stroke();
        }
    }

    // Helper: 換行
    const getLines = (text, maxWidth) => {
        if (!text) return [];
        const words = text.split('');
        const lines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const width = ctx.measureText(currentLine + words[i]).width;
            if (width < maxWidth) currentLine += words[i];
            else { lines.push(currentLine); currentLine = words[i]; }
        }
        lines.push(currentLine);
        return lines;
    };

    // 3. 繪製課程
    courses.forEach(course => {
        if (course.day_index < config.startDay || course.day_index > config.endDay) return;
        const pIdx = periodMap[course.period];
        if (pIdx === undefined || pIdx < config.startNum || pIdx > config.endNum) return;

        const colIdx = course.day_index - config.startDay; 
        const rowIdx = pIdx - config.startNum;
        const x = paddingLeft + colIdx * colWidth + 5; 
        const y = headerH + rowIdx * rowHeight + 5;
        const w = colWidth - 10;
        const h = rowHeight - 10;
        
        const settings = (window.courseSettings && window.courseSettings[course.name]) || {
            alias: "",
            bgColor: defaultColors[course.name.length % defaultColors.length],
            textColor: "#333333"
        };

        // 背景
        ctx.fillStyle = settings.bgColor;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.fill();
        ctx.clip(); 

        // 對齊計算
        const paddingInside = 10;
        let textX;
        if (config.textAlign === 1) { ctx.textAlign = "center"; textX = x + w / 2; }
        else if (config.textAlign === 2) { ctx.textAlign = "right"; textX = x + w - paddingInside; }
        else { ctx.textAlign = "left"; textX = x + paddingInside; }

        ctx.textBaseline = "top";
        ctx.fillStyle = settings.textColor;

        let currentY = y + paddingInside;
        const displayName = (settings.alias && settings.alias.trim() !== "") ? settings.alias : course.name;

        if (config.showClassName) {
            ctx.font = `bold ${config.classNameSize}px sans-serif`;
            getLines(displayName, w - paddingInside * 2).forEach(line => {
                ctx.fillText(line, textX, currentY);
                currentY += config.classNameSize * 1.3;
            });
            currentY += config.classNameSize * 0.2;
        }

        if (config.showClassroom) {
            ctx.font = `${config.classroomSize}px sans-serif`;
            ctx.globalAlpha = 0.9;
            ctx.fillText(course.room, textX, currentY);
            ctx.globalAlpha = 1.0;
        }
        ctx.restore(); 
    });
}

/**
 * ============================================================
 * 6. 初始化流程 (Initialization)
 * ============================================================
 */
function updateControlValue(id, value) {
    config[id] = value;
    const element = document.getElementById(id);
    if (element) element.value = value.toString();
}

function autoAdjustSettings() {
    if (!classCache || classCache.length === 0) return;

    const hasSaturday = classCache.some(c => c.day_index === 6);
    if (hasSaturday) updateControlValue('endDay', 6);

    const pMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "A": 11, "B": 12, "C": 13, "D": 14
    };
    let minP = 14, maxP = 0, hasValidData = false;
    classCache.forEach(course => {
        const val = pMap[course.period];
        if (val !== undefined) {
            if (val < minP) minP = val;
            if (val > maxP) maxP = val;
            hasValidData = true;
        }
    });
    if (hasValidData) {
        updateControlValue('startNum', minP);
        updateControlValue('endNum', maxP);
    }
}

async function init() {
    try {
        statusDiv.innerText = "正在讀取課表...";
        const data = await fetchCourseData();
        classCache = data; 
        statusDiv.innerText = `抓取成功！共 ${classCache.length} 堂課`;

        renderCourseList(classCache);
        autoAdjustSettings();
        drawWallpaper(classCache);
        
        // 綁定下拉選單
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', function() {
                const selectedTheme = this.value;
                if (selectedTheme && typeof applyTheme === 'function') {
                    applyTheme(selectedTheme);
                }
                this.value = ""; // 重置，允許重複點擊同個選項
            });
        }

    } catch (err) {
        console.error(err);
        statusDiv.innerText = "讀取失敗，請確認網頁狀態";
        drawWallpaper([]);
    }
}

// 啟動！
document.addEventListener('DOMContentLoaded', init);