document.getElementById('btn-generate').addEventListener('click', () => {
    const status = document.getElementById('status');
    status.innerText = "正在連線到網頁...";

    // 1. 取得當前分頁
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const tabId = activeTab.id;

        // 2. 關鍵修正：先將 content.js 注入到該分頁
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }, () => {
            // 檢查注入是否成功 (例如是否在 chrome:// 頁面無法注入)
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                status.innerText = "錯誤：無法在當前頁面執行腳本";
                return;
            }

            // 3. 注入成功後，才發送訊息
            status.innerText = "正在讀取課表...";
            
            chrome.tabs.sendMessage(tabId, { action: "scrape_schedule" }, (response) => {
                // 處理連線可能還是失敗的情況 (極少見，但防呆)
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    status.innerText = "連線失敗，請重新整理網頁";
                    return;
                }

                if (response && response.data) {
                    status.innerText = `抓到 ${response.data.length} 堂課，繪製中...`;
                    drawWallpaper(response.data);
                } else {
                    status.innerText = "未抓取到資料，請確認位於課表頁面";
                }
            });
        });
    });
});

// --- 以下是繪圖邏輯 (與之前相同，保持不變) ---
function drawWallpaper(courses) {
    const canvas = document.getElementById('wallpaperCanvas');
    const ctx = canvas.getContext('2d');

    const W = 1080;
    const H = 1920;
    const paddingX = 40;   
    const headerH = 250;   
    const footerH = 100;   
    
    // 繪製背景
    ctx.fillStyle = "#fdfbf7"; 
    ctx.fillRect(0, 0, W, H);

    // 繪製標題
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 80px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("113-1 學期課表", W / 2, 150);

    // 繪製星期標題
    const days = 5; 
    const colWidth = (W - paddingX * 2) / days;
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    ctx.font = "bold 35px sans-serif";
    ctx.fillStyle = "#7f8c8d";
    
    dayNames.forEach((name, i) => {
        const x = paddingX + i * colWidth + colWidth / 2;
        ctx.fillText(name, x, 220);
    });

    // 節次對應表
    const periodMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, 
        "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
        "A": 11, "B": 12, "C": 13, "D": 14
    };
    const totalPeriods = 15; 
    const rowHeight = (H - headerH - footerH) / totalPeriods;

    // 顏色庫
    const colors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"];

    // 繪製課程
    courses.forEach(course => {
        // 過濾掉週六日或未定義節次
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
        // 這裡可以根據需要調整截斷長度
        if (displayName.length > 7) displayName = displayName.substring(0, 6) + "..";
        
        ctx.fillText(displayName, x + 10, y + 35);

        ctx.font = "20px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText(course.room, x + 10, y + 65);
    });

    // 下載
    const link = document.createElement('a');
    link.download = 'MySchedule.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    document.getElementById('status').innerText = "下載完成！";
}