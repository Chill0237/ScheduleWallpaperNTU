// content.js
// 檢查是否已經注入過，避免重複執行
if (typeof window.hasScheduleScraperRun === 'undefined') {
    window.hasScheduleScraperRun = true;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "scrape_schedule") {
            const courses = [];
            
            // 1. 抓取所有的 "列" (.tr)
            const rows = document.querySelectorAll('.tr');
            
            rows.forEach((row, rowIndex) => {
                // 跳過第一列 (標題列)
                if (rowIndex === 0) return;

                const cells = row.querySelectorAll('.td');
                // 確保這一行結構正確
                if (cells.length < 2) return;

                // 2. 抓取節次 (位於 cells[0] 裡面的 span.font-medium)
                const periodNode = cells[0].querySelector('.font-medium');
                const periodText = periodNode ? periodNode.innerText.trim() : ""; 

                // 3. 遍歷週一到週六 (index 1 ~ 6)
                for (let dayIndex = 1; dayIndex < cells.length; dayIndex++) {
                    const cell = cells[dayIndex];
                    if (!cell) continue;

                    const courseLink = cell.querySelector('a'); // 抓連結當作課名
                    
                    if (courseLink) {
                        const courseName = courseLink.innerText.trim();
                        
                        // 抓取教室 (HTML結構：第一個 p 是教室，第二個 p 是老師)
                        const ps = cell.querySelectorAll('p');
                        let room = "";
                        let professor = "";

                        if (ps.length > 0) room = ps[0].innerText.trim();
                        if (ps.length > 1) professor = ps[1].innerText.trim();

                        courses.push({
                            day_index: dayIndex, // 1=Mon
                            period: periodText,  // 0, 1... A, B
                            name: courseName,
                            room: room,
                            professor: professor
                        });
                    }
                }
            });

            console.log("解析完成，課程數:", courses.length);
            sendResponse({ status: "success", data: courses });
        }
        // 必須回傳 true 以支援異步通訊
        return true;
    });
}