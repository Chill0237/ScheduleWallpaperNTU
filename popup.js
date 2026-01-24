/**
 * 1. 全域變數與設定
 */
const DEFAULT_CONFIG = {
    bgColor: "#fdfbf7", textColor: "#2c3e50",
    startDay: 1, endDay: 5, startNum: 1, endNum: 10,
    showClassName: true, showWeekTitle: true, showClassroom: true, showTime: true,
    classNameSize: 24, weekTitleSize: 35, classroomSize: 20, timeSize: 35,
    textOffsetY: 50, borderRadius: 12,
    paddingX: 40, paddingTop: 250, paddingBottom: 100, textAlign: 0
};

let config = { ...DEFAULT_CONFIG };
let classCache = [];    
let manualCourses = []; 
let currentTheme = 'pastel'; 
let currentPalette = [];
window.courseSettings = {}; 

/**
 * 15 色主題庫
 */
const themes = {
    pastel: { global: { bg: "#fdfbf7", text: "#4a4a4a" }, courses: [{ bg: "#FFB3BA", text: "#5c3a3a" }, { bg: "#FFDFBA", text: "#5c4d3a" }, { bg: "#FFFFBA", text: "#57593a" }, { bg: "#BAFFC9", text: "#3a5c3d" }, { bg: "#BAE1FF", text: "#3a465c" }, { bg: "#E6B3FF", text: "#463a5c" }, { bg: "#FFC3A0", text: "#5c3a3a" }, { bg: "#D5AAFF", text: "#463a5c" }, { bg: "#B5EAD7", text: "#3a555c" }, { bg: "#C7CEEA", text: "#3a465c" }, { bg: "#FF9AA2", text: "#5c3a3a" }, { bg: "#FFDAC1", text: "#5c4d3a" }, { bg: "#E2F0CB", text: "#3a5c3d" }, { bg: "#A0E7E5", text: "#3a555c" }, { bg: "#F49AC2", text: "#5c3a58" }] },
    cool: { global: { bg: "#f0f9ff", text: "#003554" }, courses: [{ bg: "#0077B6", text: "#ffffff" }, { bg: "#00B4D8", text: "#ffffff" }, { bg: "#90E0EF", text: "#03045e" }, { bg: "#023E8A", text: "#ffffff" }, { bg: "#48CAE4", text: "#023e8a" }, { bg: "#0096C7", text: "#ffffff" }, { bg: "#5E60CE", text: "#ffffff" }, { bg: "#6930C3", text: "#ffffff" }, { bg: "#5390D9", text: "#ffffff" }, { bg: "#4EA8DE", text: "#ffffff" }, { bg: "#56CFE1", text: "#003554" }, { bg: "#64DFDF", text: "#003554" }, { bg: "#72EFDD", text: "#003554" }, { bg: "#480CA8", text: "#ffffff" }, { bg: "#219EBC", text: "#ffffff" }] },
    dark: { global: { bg: "#212529", text: "#f8f9fa" }, courses: [{ bg: "#264653", text: "#ffffff" }, { bg: "#2A9D8F", text: "#ffffff" }, { bg: "#E76F51", text: "#ffffff" }, { bg: "#F4A261", text: "#264653" }, { bg: "#1D3557", text: "#ffffff" }, { bg: "#457B9D", text: "#ffffff" }, { bg: "#E63946", text: "#ffffff" }, { bg: "#6D6875", text: "#ffffff" }, { bg: "#B5838D", text: "#ffffff" }, { bg: "#355070", text: "#ffffff" }, { bg: "#6D597A", text: "#ffffff" }, { bg: "#B56576", text: "#ffffff" }, { bg: "#E56B6F", text: "#ffffff" }, { bg: "#0F4C5C", text: "#ffffff" }, { bg: "#2B2D42", text: "#ffffff" }] },
    morandi: { global: { bg: "#ebeae6", text: "#4b4b4b" }, courses: [{ bg: "#7A7265", text: "#ffffff" }, { bg: "#A6A59E", text: "#ffffff" }, { bg: "#B09F85", text: "#ffffff" }, { bg: "#D3C4BE", text: "#5c4d48" }, { bg: "#E2D3C1", text: "#5c544d" }, { bg: "#8F9E9D", text: "#ffffff" }, { bg: "#778691", text: "#ffffff" }, { bg: "#686A6C", text: "#ffffff" }, { bg: "#9A8C98", text: "#ffffff" }, { bg: "#C9ADA7", text: "#5c4d48" }, { bg: "#4A4E69", text: "#ffffff" }, { bg: "#22223B", text: "#ffffff" }, { bg: "#A5A58D", text: "#ffffff" }, { bg: "#6B705C", text: "#ffffff" }, { bg: "#CB997E", text: "#ffffff" }] },
    nature: { global: { bg: "#f1f8e9", text: "#33691e" }, courses: [{ bg: "#606C38", text: "#ffffff" }, { bg: "#283618", text: "#ffffff" }, { bg: "#FEFAE0", text: "#283618" }, { bg: "#DDA15E", text: "#ffffff" }, { bg: "#BC6C25", text: "#ffffff" }, { bg: "#588157", text: "#ffffff" }, { bg: "#3A5A40", text: "#ffffff" }, { bg: "#A3B18A", text: "#283618" }, { bg: "#DAD7CD", text: "#3a5a40" }, { bg: "#8DA399", text: "#ffffff" }, { bg: "#4F772D", text: "#ffffff" }, { bg: "#90A955", text: "#ffffff" }, { bg: "#31572C", text: "#ffffff" }, { bg: "#132A13", text: "#ffffff" }, { bg: "#4F5D75", text: "#ffffff" }] },
    retro: { global: { bg: "#f4f1de", text: "#3d405b" }, courses: [{ bg: "#E07A5F", text: "#ffffff" }, { bg: "#3D405B", text: "#ffffff" }, { bg: "#81B29A", text: "#ffffff" }, { bg: "#F2CC8F", text: "#3d405b" }, { bg: "#D4A373", text: "#ffffff" }, { bg: "#E5989B", text: "#ffffff" }, { bg: "#B5838D", text: "#ffffff" }, { bg: "#6D6875", text: "#ffffff" }, { bg: "#D62828", text: "#ffffff" }, { bg: "#F77F00", text: "#ffffff" }, { bg: "#FCBF49", text: "#3d405b" }, { bg: "#EAE2B7", text: "#3d405b" }, { bg: "#003049", text: "#ffffff" }, { bg: "#588157", text: "#ffffff" }, { bg: "#A8DADC", text: "#1d3557" }] },
    neon: { global: { bg: "#0d0d0d", text: "#ffffff" }, courses: [{ bg: "#F72585", text: "#ffffff" }, { bg: "#7209B7", text: "#ffffff" }, { bg: "#3A0CA3", text: "#ffffff" }, { bg: "#4361EE", text: "#ffffff" }, { bg: "#4CC9F0", text: "#000000" }, { bg: "#FF00FF", text: "#ffffff" }, { bg: "#00FFFF", text: "#000000" }, { bg: "#00FF00", text: "#000000" }, { bg: "#FFFF00", text: "#000000" }, { bg: "#FF0000", text: "#ffffff" }, { bg: "#9D4EDD", text: "#ffffff" }, { bg: "#FF9E00", text: "#000000" }, { bg: "#00BBF9", text: "#ffffff" }, { bg: "#F15BB5", text: "#000000" }, { bg: "#9B5DE5", text: "#ffffff" }] },
    coffee: { global: { bg: "#f5ebe0", text: "#4a403a" }, courses: [{ bg: "#D6CCC2", text: "#4a403a" }, { bg: "#E3D5CA", text: "#4a403a" }, { bg: "#D5BDAF", text: "#4a403a" }, { bg: "#B08968", text: "#ffffff" }, { bg: "#7F5539", text: "#ffffff" }, { bg: "#9C6644", text: "#ffffff" }, { bg: "#BB8588", text: "#ffffff" }, { bg: "#D8E2DC", text: "#4a403a" }, { bg: "#FFE8D6", text: "#4a403a" }, { bg: "#606C38", text: "#ffffff" }, { bg: "#283618", text: "#ffffff" }, { bg: "#FEFAE0", text: "#4a403a" }, { bg: "#DDA15E", text: "#ffffff" }, { bg: "#BC6C25", text: "#ffffff" }, { bg: "#A47148", text: "#ffffff" }] }
};

const statusDiv = document.getElementById('status');

/**
 * 2. 事件監聽
 */
function handleInput(e) {
    const target = e.target;
    const key = target.id;
    if (key && key in config) {
        let value = target.type === 'checkbox' ? target.checked : 
                   (target.type === 'number' || target.type === 'range' || target.tagName === 'SELECT') ? Number(target.value) : target.value;
        config[key] = value;
        drawWallpaper(getAllCourses());
    }
}

const controlGroups = document.querySelectorAll('.control-group');
controlGroups.forEach(group => {
    group.addEventListener('input', handleInput);
    group.addEventListener('change', handleInput);
});

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
        checkbox.addEventListener('change', (e) => { slider.disabled = !e.target.checked; });
    }
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

document.getElementById('btn-download').addEventListener('click', () => {
    const canvas = document.getElementById('wallpaperCanvas');
    const link = document.createElement('a');
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
    const timeStr = `${date.getHours().toString().padStart(2,'0')}-${date.getMinutes().toString().padStart(2,'0')}-${date.getSeconds().toString().padStart(2,'0')}`;
    link.download = `NTU_Wallpaper_${dateStr}_${timeStr}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    statusDiv.innerText = "下載完成！";
});

document.getElementById('btn-reset').addEventListener('click', async () => {
    if (!confirm("確定要重置所有設定嗎？\n這將清除所有自訂顏色、課名修改、手動課程與快取資料。")) return;

    statusDiv.innerText = "正在重置...";
    config = { ...DEFAULT_CONFIG };
    window.courseSettings = {};
    classCache = [];
    manualCourses = [];
    currentTheme = 'pastel';

    await chrome.storage.local.clear();
    syncUIWithConfig();
    renderManualCourseList();
    document.getElementById('course-list-container').innerHTML = '<div style="text-align:center; color:#999; padding:20px;">尚未抓取資料</div>';
    
    const newData = await fetchCourseData();
    const warningBar = document.getElementById('warning-bar');

    if (Array.isArray(newData)) {
        classCache = newData;
        statusDiv.innerText = `重置成功！目前共 ${classCache.length} 堂課`;
        if(warningBar) warningBar.classList.add('hidden');
        autoAdjustSettings(); 
        applyTheme(currentTheme);
    } else {
        statusDiv.innerText = "重置完成 (目前無法抓取資料)";
        if(warningBar) warningBar.classList.remove('hidden');
        drawWallpaper([]);
    }
});

document.getElementById('btn-add-manual').addEventListener('click', () => {
    const newCourse = {
        id: Date.now(),
        name: "新課程",
        room: "",
        day_index: 1, 
        period: "1"   
    };
    manualCourses.push(newCourse);
    
    autoAdjustSettings(); 
    
    const uniqueNames = getSortedUniqueNames(getAllCourses());
    if (uniqueNames.length > 15) {
        alert(`警告：目前已有 ${uniqueNames.length} 堂不同課程。\n主題調色盤僅有 15 種顏色，將會出現重複顏色！`);
    }

    reapplyTheme(); 
    renderManualCourseList();
    
    const details = document.querySelector('.manual-details');
    if (details) details.open = true;
});

/**
 * 3. 資料處理
 */
function saveSettings() {
    chrome.storage.local.set({ 
        config, 
        courseSettings: window.courseSettings, 
        classCache,
        manualCourses,
        currentTheme,
        currentPalette 
    });
}

async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['config', 'courseSettings', 'classCache', 'manualCourses', 'currentTheme', 'currentPalette'], (result) => {
            if (result.config) Object.assign(config, result.config);
            if (result.courseSettings) window.courseSettings = result.courseSettings;
            if (result.classCache) classCache = result.classCache;
            if (result.manualCourses) manualCourses = result.manualCourses;
            if (result.currentTheme) currentTheme = result.currentTheme;
            if (result.currentPalette) currentPalette = result.currentPalette;
            resolve();
        });
    });
}

function getAllCourses() {
    return [...classCache, ...manualCourses];
}

function syncUIWithConfig() {
    for (const key in config) {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') element.checked = config[key];
            else element.value = config[key];
        }
    }
    const bgInput = document.getElementById('bgColor');
    const textInput = document.getElementById('textColor');
    if (bgInput) bgInput.value = config.bgColor;
    if (textInput) textInput.value = config.textColor;

    controlPairs.forEach(pair => {
        const checkbox = document.getElementById(pair.toggleId);
        const slider = document.getElementById(pair.sliderId);
        if (checkbox && slider) slider.disabled = !checkbox.checked;
    });
}

function fetchCourseData() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) { reject("找不到目前的頁籤"); return; }
            const activeTab = tabs[0];
            
            const targetPattern = /course\.ntu\.edu\.tw\/result\/.*\/table/;

            if (!activeTab.url || !targetPattern.test(activeTab.url)) {
                console.log("非目標網站，跳過抓取");
                resolve(null);
                return;
            }
            
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            }, () => {
                if (chrome.runtime.lastError) { 
                    console.warn("注入失敗 (可能是權限不足):", chrome.runtime.lastError);
                    resolve(null); 
                    return; 
                }
                chrome.tabs.sendMessage(activeTab.id, { action: "scrape_schedule" }, (response) => {
                    if (chrome.runtime.lastError) { resolve(null); return; }
                    if (response && response.data) resolve(response.data);
                    else resolve([]);
                });
            });
        });
    });
}

function shuffleArray(array) {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getSortedUniqueNames(courses) {
    if (!courses) return [];
    const pMap = { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "A": 11, "B": 12, "C": 13, "D": 14 };
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

function renderManualCourseList() {
    const container = document.getElementById('manual-course-list');
    container.innerHTML = '';

    if (manualCourses.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#999; font-size:12px; padding:10px;">點擊上方按鈕新增課程</div>';
        return;
    }

    const periods = ["0","1","2","3","4","5","6","7","8","9","10","A","B","C","D"];
    const dayMap = {1:"一", 2:"二", 3:"三", 4:"四", 5:"五", 6:"六"};

    manualCourses.forEach((course, index) => {
        const div = document.createElement('div');
        div.className = 'manual-item';
        
        let dayOptions = '';
        for(let d=1; d<=6; d++) {
            dayOptions += `<option value="${d}" ${course.day_index == d ? 'selected' : ''}>${dayMap[d]}</option>`;
        }

        let periodOptions = '';
        periods.forEach(p => {
            periodOptions += `<option value="${p}" ${course.period == p ? 'selected' : ''}>${p}</option>`;
        });

        div.innerHTML = `
            <input type="text" class="input-alias manual-name" value="${course.name}" placeholder="課名" style="flex:2; min-width:0;">
            <input type="text" class="input-alias manual-room" value="${course.room || ''}" placeholder="教室" style="flex:1; min-width:0;">
            <select class="modern-select manual-day" style="width:50px; padding:2px 4px;">${dayOptions}</select>
            <select class="modern-select manual-period" style="width:50px; padding:2px 4px;">${periodOptions}</select>
            <button class="btn-mini btn-mini-del" data-id="${course.id}">×</button>
        `;

        const updateAll = () => {
            course.name = div.querySelector('.manual-name').value;
            course.room = div.querySelector('.manual-room').value;
            course.day_index = parseInt(div.querySelector('.manual-day').value);
            course.period = div.querySelector('.manual-period').value;
            
            autoAdjustSettings();
            reapplyTheme(); 
        };

        const nameInput = div.querySelector('.manual-name');
        nameInput.addEventListener('input', updateAll); 

        div.querySelector('.manual-room').addEventListener('input', updateAll);
        div.querySelector('.manual-day').addEventListener('input', updateAll);
        div.querySelector('.manual-period').addEventListener('input', updateAll);

        div.querySelector('.btn-mini-del').addEventListener('click', () => {
            manualCourses.splice(index, 1);
            autoAdjustSettings();
            reapplyTheme();
            renderManualCourseList(); 
        });

        container.appendChild(div);
    });
}

function renderCourseList(courses) {
    const container = document.getElementById('course-list-container');
    container.innerHTML = ''; 

    if (!courses || courses.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">尚未抓取資料</div>';
        return;
    }

    const uniqueNames = getSortedUniqueNames(courses);
    
    if (!currentPalette || currentPalette.length === 0) {
        const themeData = themes[currentTheme] || themes.pastel;
        currentPalette = shuffleArray(themeData.courses);
    }

    uniqueNames.forEach((name, index) => {
        if (!window.courseSettings[name]) {
            const colorPair = currentPalette[index % currentPalette.length];
            window.courseSettings[name] = {
                alias: "", roomAlias: "", 
                bgColor: colorPair.bg,
                textColor: colorPair.text
            };
        }
        const settings = window.courseSettings[name];

        const item = document.createElement('div');
        item.className = 'course-item';
        
        item.innerHTML = `
            <div class="course-info">
                <span class="course-original-name">${name}</span>
                <div style="display:flex; gap:8px;">
                    <input type="text" class="input-alias" placeholder="自訂課名" value="${settings.alias}" style="flex:1;">
                    <input type="text" class="input-alias input-room-alias" placeholder="自訂教室" value="${settings.roomAlias || ''}" style="flex:1;">
                </div>
            </div>
            <div class="circle-color-wrapper" title="背景顏色" style="margin-right:5px;">
                <input type="color" class="circle-color-input bg-color-picker" value="${settings.bgColor}">
            </div>
            <div class="circle-color-wrapper" title="文字顏色" style="border:1px solid #ccc;">
                <input type="color" class="circle-color-input text-color-picker" value="${settings.textColor}">
            </div>
        `;

        item.querySelector('.input-alias').addEventListener('input', (e) => {
            window.courseSettings[name].alias = e.target.value;
            drawWallpaper(getAllCourses()); 
        });
        item.querySelector('.input-room-alias').addEventListener('input', (e) => {
            window.courseSettings[name].roomAlias = e.target.value;
            drawWallpaper(getAllCourses()); 
        });
        item.querySelector('.bg-color-picker').addEventListener('input', (e) => {
            window.courseSettings[name].bgColor = e.target.value;
            drawWallpaper(getAllCourses()); 
        });
        item.querySelector('.text-color-picker').addEventListener('input', (e) => {
            window.courseSettings[name].textColor = e.target.value;
            drawWallpaper(getAllCourses()); 
        });

        container.appendChild(item);
    });
}

function reapplyTheme() {
    const allCourses = getAllCourses();
    const uniqueNames = getSortedUniqueNames(allCourses); 

    const themeData = themes[currentTheme];
    
    if (themeData.global) {
        config.bgColor = themeData.global.bg;
        config.textColor = themeData.global.text;
        
        const bgInput = document.getElementById('bgColor');
        const textInput = document.getElementById('textColor');
        if (bgInput) bgInput.value = config.bgColor;
        if (textInput) textInput.value = config.textColor;
    }

    if (!currentPalette || currentPalette.length === 0) {
        currentPalette = shuffleArray(themeData.courses);
    }

    uniqueNames.forEach((name, index) => {
        const colorPair = currentPalette[index % currentPalette.length];
        
        if (!window.courseSettings[name]) {
             window.courseSettings[name] = { alias: "", roomAlias: "" };
        }
        window.courseSettings[name].bgColor = colorPair.bg;
        window.courseSettings[name].textColor = colorPair.text;
    });
    
    saveSettings(); 
    renderCourseList(allCourses);
    drawWallpaper(allCourses);
}

window.applyTheme = function(themeName) {
    const allCourses = getAllCourses();
    if (!allCourses || allCourses.length === 0) {
        alert("請先抓取課表或新增自訂課程！");
        return;
    }
    currentTheme = themeName; 
    
    const themeData = themes[themeName];
    currentPalette = shuffleArray(themeData.courses);
    
    reapplyTheme();           
};

/**
 * 5. 繪圖邏輯
 */
function drawWallpaper(courses) {
    if (!courses) courses = [];
    const canvas = document.getElementById('wallpaperCanvas');
    const ctx = canvas.getContext('2d');
    
    const timeLabels = ["07:10-08:00", "08:10-09:00", "09:10-10:00", "10:20-11:10", "11:20-12:10", "12:20-13:10", "13:20-14:10", "14:20-15:10", "15:30-16:20", "16:30-17:20", "17:30-18:20", "18:25-19:15", "19:20-20:10", "20:15-21:05", "21:10-22:00"];
    const periodMap = { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "A": 11, "B": 12, "C": 13, "D": 14 };
    const defaultColors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"];

    const W = 1080, H = 2400;
    const titleAreaHeight = config.showWeekTitle ? (config.weekTitleSize + 30) : 0;
    const headerH = config.paddingTop + titleAreaHeight;    
    const footerH = config.paddingBottom; 
    
    let timelineWidth = 0;
    if (config.showTime) {
        ctx.font = `bold ${config.timeSize}px sans-serif`;
        timelineWidth = ctx.measureText("00:00").width + 30; 
    }
    const paddingLeft = config.paddingX + timelineWidth; 
    const paddingRight = config.paddingX;

    ctx.fillStyle = config.bgColor; 
    ctx.fillRect(0, 0, W, H);

    const totalDays = config.endDay - config.startDay + 1;
    const safeDays = totalDays > 0 ? totalDays : 1;
    const colWidth = (W - paddingLeft - paddingRight) / safeDays;
    
    const totalPeriods = config.endNum - config.startNum + 1;
    const safePeriods = totalPeriods > 0 ? totalPeriods : 10;
    const rowHeight = (H - headerH - footerH) / safePeriods;

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    ctx.font = `bold ${config.weekTitleSize}px sans-serif`;
    ctx.fillStyle = config.textColor;
    ctx.textAlign = "center"; ctx.textBaseline = "bottom"; 
    for (let i = 0; i < safeDays; i++) {
        const idx = (config.startDay - 1) + i; 
        if (idx < dayNames.length && config.showWeekTitle) {
            const x = paddingLeft + i * colWidth + colWidth / 2;
            ctx.fillText(dayNames[idx], x, headerH - 15);
        }
    }

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
            ctx.strokeStyle = "rgba(0,0,0,0.05)";
            ctx.beginPath(); ctx.moveTo(paddingLeft, y); ctx.lineTo(W - paddingRight, y); ctx.stroke();
        }
    }
    
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
            alias: "", roomAlias: "",
            bgColor: defaultColors[course.name.length % defaultColors.length],
            textColor: "#333333"
        };

        ctx.fillStyle = settings.bgColor;
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, config.borderRadius);
        else ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.clip(); 

        const paddingInside = 10;
        let textX;
        if (config.textAlign === 1) { ctx.textAlign = "center"; textX = x + w / 2; }
        else if (config.textAlign === 2) { ctx.textAlign = "right"; textX = x + w - paddingInside; }
        else { ctx.textAlign = "left"; textX = x + paddingInside; }

        ctx.textBaseline = "top";
        ctx.fillStyle = settings.textColor;

        let contentHeight = 0;
        let nameLines = [];
        const nameFont = `bold ${config.classNameSize}px sans-serif`;
        const roomFont = `${config.classroomSize}px sans-serif`;
        const nameLineHeight = config.classNameSize * 1.3;
        const gap = config.classNameSize * 0.2;

        const displayName = (settings.alias && settings.alias.trim() !== "") ? settings.alias : course.name;
        const displayRoom = (settings.roomAlias && settings.roomAlias.trim() !== "") ? settings.roomAlias : course.room;

        if (config.showClassName) {
            ctx.font = nameFont;
            nameLines = getLines(displayName, w - paddingInside * 2);
            contentHeight += nameLines.length * nameLineHeight;
        }
        if (config.showClassroom) {
            if (config.showClassName) contentHeight += gap;
            contentHeight += config.classroomSize; 
        }

        const availableSpace = Math.max(0, h - (paddingInside * 2) - contentHeight);
        const offsetY = availableSpace * (config.textOffsetY / 100);
        let currentY = y + paddingInside + offsetY;
        
        if (config.showClassName) {
            ctx.font = nameFont;
            nameLines.forEach(line => {
                ctx.fillText(line, textX, currentY);
                currentY += nameLineHeight;
            });
        }

        if (config.showClassroom) {
            if (config.showClassName) currentY += gap;
            ctx.font = roomFont;
            ctx.globalAlpha = 0.9;
            ctx.fillText(displayRoom, textX, currentY);
            ctx.globalAlpha = 1.0;
        }
        ctx.restore(); 
    });
    
    saveSettings();
}

/**
 * 6. 初始化
 */
function updateControlValue(id, value) {
    config[id] = value;
    const element = document.getElementById(id);
    if (element) element.value = value.toString();
}

function autoAdjustSettings() {
    const allCourses = getAllCourses();
    if (!allCourses || allCourses.length === 0) return;
    
    if (allCourses.some(c => c.day_index === 6)) updateControlValue('endDay', 6);

    const pMap = { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "A": 11, "B": 12, "C": 13, "D": 14 };
    let minP = 14, maxP = 0, hasValidData = false;
    allCourses.forEach(course => {
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
        statusDiv.innerText = "讀取設定中...";
        await loadSettings();
        syncUIWithConfig();

        renderManualCourseList();

        if (getAllCourses().length > 0) {
            statusDiv.innerText = "已載入上次的紀錄";
            renderCourseList(getAllCourses());
            drawWallpaper(getAllCourses());
        } else {
             drawWallpaper([]);
        }

        const newData = await fetchCourseData();
        const warningBar = document.getElementById('warning-bar');

        if (Array.isArray(newData)) {
            classCache = newData;
            statusDiv.innerText = `抓取成功！共 ${classCache.length} 堂課`;
            if(warningBar) warningBar.classList.add('hidden');
            autoAdjustSettings(); 
            applyTheme(currentTheme);
        } else {
            if(warningBar) warningBar.classList.remove('hidden');
            if (classCache.length > 0) statusDiv.innerText = "顯示上次的紀錄";
            else statusDiv.innerText = "無資料，請前往課程網頁面";
        }
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', function() {
                const selectedTheme = this.value;
                if (selectedTheme && typeof applyTheme === 'function') applyTheme(selectedTheme);
                this.value = ""; 
            });
        }
        
        const closeBtn = document.getElementById('btn-close-warning');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const warningBar = document.getElementById('warning-bar');
                if (warningBar) warningBar.classList.add('hidden');
            });
        }

    } catch (err) {
        console.error(err);
        statusDiv.innerText = "系統錯誤";
    }
}

document.addEventListener('DOMContentLoaded', init);