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

let classCache;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;

    const status = document.getElementById('status');
    status.innerText = "正在連線到網頁...";
    const activeTab = tabs[0];
    const tabId = activeTab.id;

    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
    }, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            status.innerText = "錯誤：無法執行腳本";
            return;
        }
        
        status.innerText = "正在讀取課表...";
        chrome.tabs.sendMessage(tabId, { action: "scrape_schedule" }, (response) => {
            if (chrome.runtime.lastError) {
                status.innerText = "連線失敗，請重新整理網頁";
                return;
            }
            if (response && response.data) {
                status.innerText = `抓到 ${response.data.length} 堂課，繪製中...`;
                drawWallpaper(response.data);
                classCache = response.data;
            } else {
                status.innerText = "未抓取到資料";
            }
        });
    });
});

console.log(classCache);

const formatDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const min = pad(date.getMinutes());
    const sec = pad(date.getSeconds());
    return `${year}-${month}-${day}_${hour}-${min}-${sec}`;
}

const config = { bgColor: "#fdfbf7", textColor: "#2c3e50" };

const controlGroup = document.querySelector('.control-group');

controlGroup.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') {
        
        const targetId = e.target.id;
        const newValue = e.target.value;

        if (targetId === 'input-bg-color') {
            config.bgColor = newValue;
        } else if (targetId === 'input-text-color') {
            config.textColor = newValue;
        }

        drawWallpaper(classCache);
    }
});

document.getElementById('btn-download').addEventListener('click', () => {
    const link = document.createElement('a');
    let currentTime = new Date();
    link.download = 'wallpaper_' + formatDate(currentTime) + '.png';
    link.href = document.getElementById('wallpaperCanvas').toDataURL('image/png');
    link.click();
    document.getElementById('status').innerText = "下載完成！";
})

function drawWallpaper(courses) {
    const canvas = document.getElementById('wallpaperCanvas');
    const ctx = canvas.getContext('2d');
    const W = 1080;
    const H = 2400;
    const paddingX = 40;   
    const headerH = 250;   
    const footerH = 100;   
    
    ctx.fillStyle = config.bgColor; 
    ctx.fillRect(0, 0, W, H);

    const days = 5; 
    const colWidth = (W - paddingX * 2) / days;
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    ctx.font = "bold 35px sans-serif";
    ctx.fillStyle = "#7f8c8d";
    dayNames.forEach((name, i) => {
        const x = paddingX + i * colWidth + colWidth / 2;
        ctx.fillText(name, x, 150);
    });

    const periodMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, 
        "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
        "A": 11, "B": 12, "C": 13, "D": 14
    };
    const rowHeight = (H - headerH - footerH) / 15;
    const colors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"];

    courses.forEach(course => {
        if (course.day_index > 5 || periodMap[course.period] === undefined) return;

        const colIdx = course.day_index - 1; 
        const rowIdx = periodMap[course.period];
        const x = paddingX + colIdx * colWidth + 5; 
        const y = headerH + rowIdx * rowHeight + 5;
        const w = colWidth - 10;
        const h = rowHeight - 10;
        const colorIdx = course.name.length % colors.length;
        
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = "#444";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "left";
        
        let displayName = course.name;
        if (displayName.length > 7) displayName = displayName.substring(0, 6) + "..";
        ctx.fillText(displayName, x + 10, y + 35);

        ctx.font = "20px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText(course.room, x + 10, y + 65);
    });
    document.getElementById('status').innerText = "";
}

// 監聽下拉選單改變
const selectRatio = document.getElementById('select-ratio');
if(selectRatio) {
    selectRatio.addEventListener('change', (e) => {
        const ratio = e.target.value; // "16:9" or "20:9"
        
        console.log("切換比例為:", ratio);
        
        // 這裡寫切換畫布大小的邏輯 (W, H)
        // updateCanvasSize(ratio); 
        // drawWallpaper();
    });
}

// 1. 定義所有的對應關係 (Mapping)
// 這樣以後如果要加新的，只要在這邊加一行就好，不用改邏輯
const controlPairs = [
    { toggleId: 'show-class-name', sliderId: 'class-name-size' },
    { toggleId: 'show-week-title', sliderId: 'week-title-size' },
    { toggleId: 'show-classroom',  sliderId: 'classroom-size' },
    { toggleId: 'show-time',       sliderId: 'time-size' }
];

// 2. 使用 forEach 自動綁定
controlPairs.forEach(pair => {
    const checkbox = document.getElementById(pair.toggleId);
    const slider = document.getElementById(pair.sliderId);

    // 防呆：確認兩個元件都真的存在
    if (checkbox && slider) {
        
        // A. 初始化狀態 (Initialization)
        // 這一行很重要！避免一打開擴充功能時，明明沒勾選，拉桿卻是可以用的
        slider.disabled = !checkbox.checked;

        // B. 綁定監聽器 (Event Listener)
        checkbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            
            // 核心邏輯：沒勾選 -> 禁用 (disabled = true)
            slider.disabled = !isChecked;

            // --- 這裡順便更新你的全域 Config ---
            // 假設你的 config key 命名規則跟 ID 有關，或者你需要手動判斷
            // 這裡示範簡單的邏輯：
            // config[pair.toggleId] = isChecked; 
            // drawWallpaper(); // 記得重繪！
        });
    } else {
        console.warn(`找不到元件: ${pair.toggleId} 或 ${pair.sliderId}`);
    }
});