if (typeof window.hasScheduleScraperRun === 'undefined') {
    window.hasScheduleScraperRun = true;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "scrape_schedule") {
            const rows = document.querySelectorAll('.tr');
            
            if (rows.length === 0) {
                sendResponse({ status: "error", code: "NO_TABLE_FOUND" });
                return true;
            }

            const courses = [];
            
            rows.forEach((row, rowIndex) => {
                if (rowIndex === 0) return; 

                const cells = row.querySelectorAll('.td');
                if (cells.length < 2) return;

                const periodNode = cells[0].querySelector('.font-medium');
                const periodText = periodNode ? periodNode.innerText.trim() : ""; 

                for (let dayIndex = 1; dayIndex < cells.length; dayIndex++) {
                    const cell = cells[dayIndex];
                    if (!cell) continue;

                    const courseLink = cell.querySelector('a');
                    
                    if (courseLink) {
                        const courseName = courseLink.innerText.trim();
                        const ps = cell.querySelectorAll('p');
                        let room = "";
                        let professor = "";

                        if (ps.length > 0) room = ps[0].innerText.trim();
                        if (ps.length > 1) professor = ps[1].innerText.trim();

                        courses.push({
                            day_index: dayIndex,
                            period: periodText,
                            name: courseName,
                            room: room,
                            professor: professor
                        });
                    }
                }
            });

            sendResponse({ status: "success", data: courses });
        }
        return true; 
    });
}