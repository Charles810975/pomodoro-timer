// 所有功能函数
function showReport() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    // 获取默认日期范围（最近30天）
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);

    const stats = PomodoroStats.getDateRangeStats(
        currentUser.id, 
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
    );
    const totalStats = PomodoroStats.getTotalStats(currentUser.id);

    const reportModal = `
        <div class="modal fade" id="reportModal" tabindex="-1" role="dialog" aria-labelledby="reportModalLabel" aria-modal="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="reportModalLabel">专注统计</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
                    </div>
                    <div class="modal-body">
                        <!-- 日期范围选择 -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text">日期范围</span>
                                    <input type="date" class="form-control" id="startDate" 
                                            value="${startDate.toISOString().split('T')[0]}">
                                    <input type="date" class="form-control" id="endDate" 
                                            value="${endDate.toISOString().split('T')[0]}">
                                    <button class="btn btn-primary" onclick="updateDateRange()">更新</button>
                                </div>
                            </div>
                        </div>

                        <!-- 总计统计 -->
                        <div class="card mb-4">
                            <div class="card-body">
                                <h6 class="card-title">总计数据</h6>
                                <div class="row text-center">
                                    <div class="col-md-3">
                                        <div class="h3 mb-0">${totalStats.pomodoro}</div>
                                        <small class="text-muted">总专注次数</small>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="h3 mb-0">${Math.round(totalStats.totalMinutes / 60)}</div>
                                        <small class="text-muted">总专注小时</small>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="h3 mb-0">${totalStats.shortBreak + totalStats.longBreak}</div>
                                        <small class="text-muted">总休息次数</small>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="h3 mb-0">${Math.round(totalStats.pomodoro / (Object.keys(stats).length || 1))}</div>
                                        <small class="text-muted">平均每日专注</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 图表 -->
                        <div class="row">
                            <div class="col-md-8 mb-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-title">专注趋势</h6>
                                        <canvas id="trendChart"></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-title">时间分配</h6>
                                        <canvas id="pieChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 详细数据表格 -->
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title">详细数据</h6>
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>日期</th>
                                                <th>专注次数</th>
                                                <th>专注时长</th>
                                                <th>短休息</th>
                                                <th>长休息</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${Object.entries(stats).reverse().map(([date, day]) => `
                                                <tr>
                                                    <td>${formatDate(date)}</td>
                                                    <td>${day.pomodoro || 0}</td>
                                                    <td>${day.totalMinutes || 0}分钟</td>
                                                    <td>${day.shortBreak || 0}</td>
                                                    <td>${day.longBreak || 0}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', reportModal);
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
    
    // 初始化图表
    initCharts(stats);
    
    document.getElementById('reportModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function showSettings() {
    const customTimes = TimeSettings.getCustomTimes();
    const settingsModal = `
        <div class="modal fade" id="settingsModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">设置</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">专注时长 (分钟)</label>
                            <input type="number" class="form-control" id="pomodoroTime" 
                                    value="${Math.floor(customTimes.pomodoro / 60)}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">短休息时长 (分钟)</label>
                            <input type="number" class="form-control" id="shortBreakTime" 
                                    value="${Math.floor(customTimes.shortBreak / 60)}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">长休息时长 (分钟)</label>
                            <input type="number" class="form-control" id="longBreakTime" 
                                    value="${Math.floor(customTimes.longBreak / 60)}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveSettings()">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', settingsModal);
    const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
    modal.show();
    
    document.getElementById('settingsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function showLogin() {
    const loginModal = `
        <div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="loginModalLabel" aria-modal="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="loginModalLabel">账户</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
                    </div>
                    <div class="modal-body">
                        <!-- 切换按钮 -->
                        <ul class="nav nav-pills mb-3 justify-content-center" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" data-bs-toggle="pill" data-bs-target="#login-tab">登录</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="pill" data-bs-target="#register-tab">注册</button>
                            </li>
                        </ul>
                        
                        <!-- 表单内容 -->
                        <div class="tab-content">
                            <!-- 登录表单 -->
                            <div class="tab-pane fade show active" id="login-tab">
                                <form id="loginForm" onsubmit="handleLogin(event)">
                                    <div class="mb-3">
                                        <label class="form-label">邮箱</label>
                                        <input type="email" class="form-control" name="email" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">密码</label>
                                        <input type="password" class="form-control" name="password" required>
                                    </div>
                                    <div class="alert alert-danger d-none" id="loginError"></div>
                                    <button type="submit" class="btn btn-primary w-100">登录</button>
                                </form>
                            </div>
                            
                            <!-- 注册表单 -->
                            <div class="tab-pane fade" id="register-tab">
                                <form id="registerForm" onsubmit="handleRegister(event)">
                                    <div class="mb-3">
                                        <label class="form-label">用户名</label>
                                        <input type="text" class="form-control" name="username" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">邮箱</label>
                                        <input type="email" class="form-control" name="email" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">密码</label>
                                        <input type="password" class="form-control" name="password" required>
                                    </div>
                                    <div class="alert alert-danger d-none" id="registerError"></div>
                                    <button type="submit" class="btn btn-primary w-100">注册</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 移除可能存在的旧模态框
    const oldModal = document.getElementById('loginModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', loginModal);
    const modal = new bootstrap.Modal(document.getElementById('loginModal'), {
        keyboard: true,
        backdrop: true,
        focus: true
    });
    
    modal.show();
    
    // 模态框关闭时的处理
    document.getElementById('loginModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
        // 恢复焦点到触发按钮
        document.getElementById('loginBtn')?.focus();
    });
}

function saveSettings() {
    const newPomodoro = parseInt(document.getElementById('pomodoroTime').value);
    const newShortBreak = parseInt(document.getElementById('shortBreakTime').value);
    const newLongBreak = parseInt(document.getElementById('longBreakTime').value);
    
    const customTimes = {
        pomodoro: newPomodoro * 60,
        shortBreak: newShortBreak * 60,
        longBreak: newLongBreak * 60
    };
    
    // 保存自定义时间
    TimeSettings.saveCustomTimes(customTimes);
    
    // 更新当前计时器
    timeLeft = customTimes[currentMode];
    updateDisplay();
    
    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    modal.hide();
}

const timerDisplay = document.querySelector('.timer-display');
const startBtn = document.querySelector('.start-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const timerContainer = document.querySelector('.timer-container');

const TIMES = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

// 自定义时间管理
const TimeSettings = {
    // 获取自定义时间设置
    getCustomTimes() {
        const saved = localStorage.getItem('customTimes');
        return saved ? JSON.parse(saved) : { ...TIMES };
    },

    // 保存自定义时间设置
    saveCustomTimes(times) {
        localStorage.setItem('customTimes', JSON.stringify(times));
    }
};

let currentMode = 'pomodoro';
let timeLeft = TIMES[currentMode];
let timerId = null;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

let pauseStartTime = null;

function toggleTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        startBtn.textContent = '开始';
        // 记录暂停开始时间
        pauseStartTime = Date.now();
    } else {
        // 如果之前有暂停，调整总暂停时间
        if (pauseStartTime) {
            const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
            // 可以选择是否要补偿暂停时间
            // timeLeft += pauseDuration;
            pauseStartTime = null;
        }

        timerId = setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(timerId);
                handleTimerComplete();
            }
            updateDisplay();
        }, 1000);
        startBtn.textContent = '暂停';
    }
}

function switchMode(mode) {
    if (mode === currentMode) return;
    
    // 清除当前计时器
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        startBtn.textContent = '开始';
    }
    
    currentMode = mode;
    const customTimes = TimeSettings.getCustomTimes();
    timeLeft = customTimes[mode];
    
    // 更新按钮状态
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // 更新显示
    updateDisplay();
    
    // 更新背景颜色
    const colors = {
        pomodoro: '#c45353',
        shortBreak: '#38858a',
        longBreak: '#397097'
    };
    timerContainer.style.backgroundColor = colors[mode];
}

startBtn.addEventListener('click', toggleTimer);
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

// 报告按钮功能
document.querySelector('.report-link').addEventListener('click', function(e) {
    e.preventDefault();
    showReport();
});

// 设置按钮功能
document.querySelector('.settings-link').addEventListener('click', function(e) {
    e.preventDefault();
    showSettings();
});

// 登录按钮功能
document.querySelector('.user-menu').addEventListener('click', function() {
    showLogin();
});

// 然后是事件监听代码
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 加载完成');
    initializeLoginButton();
    
    // 初始化时间设置
    const customTimes = TimeSettings.getCustomTimes();
    timeLeft = customTimes[currentMode];
    updateDisplay();

    // 自习室链接的事件监听
    document.querySelector('.room-link').addEventListener('click', function(e) {
        e.preventDefault();
        showRoomModal();
    });

    // 许愿墙链接的事件监听
    document.querySelector('.wish-wall-link').addEventListener('click', function(e) {
        e.preventDefault();
        showWishWall();
    });
});

// 将登录按钮的初始化逻辑独立出来
function initializeLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    // 移除所有现有的事件监听器
    const newLoginBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

    // 检查登录状态并添加适当的事件监听器
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // 已登录状态
        updateUserUI(currentUser);
    } else {
        // 未登录状态 - 只添加一次点击事件
        newLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogin();
        });
    }
}

// 用户数据管理的工具函数
const UserManager = {
    // 获取所有用户
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    },
    
    // 保存用户
    saveUser(user) {
        const users = this.getUsers();
        users.push({
            ...user,
            id: Date.now(),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(users));
    },
    
    // 验证用户登录
    validateUser(email, password) {
        const users = this.getUsers();
        return users.find(user => user.email === email && user.password === password);
    },
    
    // 检查邮箱是否已注册
    isEmailTaken(email) {
        const users = this.getUsers();
        return users.some(user => user.email === email);
    }
};

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const user = UserManager.validateUser(email, password);
        if (user) {
            // 保存登录状态
            localStorage.setItem('currentUser', JSON.stringify(user));
            // 更新UI
            updateUserUI(user);
            // 正确关闭模态框
            closeLoginModal();
            // 显示成功消息
            alert('登录成功！');
        } else {
            errorDiv.textContent = '邮箱或密码错误';
            errorDiv.classList.remove('d-none');
        }
    } catch (error) {
        errorDiv.textContent = '登录失败，请重试';
        errorDiv.classList.remove('d-none');
    }
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('registerError');

    try {
        // 检查邮箱是否已被注册
        if (UserManager.isEmailTaken(email)) {
            errorDiv.textContent = '邮箱已被注册';
            errorDiv.classList.remove('d-none');
            return;
        }
        
        // 创建新用户
        const user = { username, email, password };
        UserManager.saveUser(user);
        
        // 显示成功消息
        alert('注册成功！');
        
        // 清除当前用户状态
        localStorage.removeItem('currentUser');
        
        // 关闭模态框
        closeLoginModal();
        
        // 刷新页面
        window.location.reload();
        
    } catch (error) {
        errorDiv.textContent = '注册失败，请重试';
        errorDiv.classList.remove('d-none');
    }
}

// 更新UI显示用户信息
function updateUserUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) {
        console.error('找不到登录按钮元素');
        return;
    }

    // 更新按钮内容
    loginBtn.innerHTML = `
        <svg class="navbar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
        ${user.username}
    `;

    // 移除旧的事件监听器并添加退出登录事件
    const newLoginBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

    // 只添加一次退出登录事件
    newLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('currentUser');
            window.location.reload();
        }
    });
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        updateUserUI(currentUser);
    }
});

// 修改关闭模态框的处理方式
function closeLoginModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (modal) {
        modal.dispose(); // 完全销毁模态框
        document.getElementById('loginModal')?.remove();
    }
}

// 专注数据管理
const PomodoroStats = {
    saveSession(userId, type, actualMinutes) {
        const stats = this.getUserStats(userId);
        const today = new Date().toISOString().split('T')[0];
        
        if (!stats[today]) {
            stats[today] = {
                pomodoro: 0,
                shortBreak: 0,
                longBreak: 0,
                totalMinutes: 0
            };
        }
        
        stats[today][type]++;
        stats[today].totalMinutes += actualMinutes;
        
        localStorage.setItem(`stats_${userId}`, JSON.stringify(stats));
    },
    
    getUserStats(userId) {
        return JSON.parse(localStorage.getItem(`stats_${userId}`) || '{}');
    },
    
    getWeeklyStats(userId) {
        const stats = this.getUserStats(userId);
        const dates = Object.keys(stats).sort().slice(-7);
        return dates.map(date => ({
            date,
            ...stats[date]
        }));
    },

    // 获取指定日期范围的统计
    getDateRangeStats(userId, startDate, endDate) {
        const stats = this.getUserStats(userId);
        const range = {};
        
        let current = new Date(startDate);
        while (current <= new Date(endDate)) {
            const dateStr = current.toISOString().split('T')[0];
            range[dateStr] = stats[dateStr] || {
                pomodoro: 0,
                shortBreak: 0,
                longBreak: 0,
                totalMinutes: 0
            };
            current.setDate(current.getDate() + 1);
        }
        
        return range;
    },

    // 获取总计数据
    getTotalStats(userId) {
        const stats = this.getUserStats(userId);
        return Object.values(stats).reduce((total, day) => ({
            pomodoro: total.pomodoro + (day.pomodoro || 0),
            shortBreak: total.shortBreak + (day.shortBreak || 0),
            longBreak: total.longBreak + (day.longBreak || 0),
            totalMinutes: total.totalMinutes + (day.totalMinutes || 0)
        }), { pomodoro: 0, shortBreak: 0, longBreak: 0, totalMinutes: 0 });
    }
};

// 日期格式化函数
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 修改计时器完成时的处理
function handleTimerComplete() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const customTimes = TimeSettings.getCustomTimes();
    
    // 根据不同模式记录统计数据
    if (currentUser) {
        if (currentMode === 'pomodoro') {
            // 计算实际完成时间（分钟）
            const actualMinutes = Math.floor((customTimes[currentMode] - timeLeft) / 60);
            
            // 记录专注数据
            PomodoroStats.saveSession(currentUser.id, currentMode, actualMinutes);
            
            // 更新自习室计时（只统计专注时间）
            if (currentUser.room) {
                const roomStats = JSON.parse(localStorage.getItem('roomStats') || '{}');
                const room = currentUser.room;
                if (!roomStats[room]) {
                    roomStats[room] = {};
                }
                if (!roomStats[room][currentUser.username]) {
                    roomStats[room][currentUser.username] = 0;
                }
                roomStats[room][currentUser.username] += actualMinutes;
                localStorage.setItem('roomStats', JSON.stringify(roomStats));
            }
        } else {
            // 记录休息数据（不计入时长）
            PomodoroStats.saveSession(currentUser.id, currentMode, 0);
        }
    }

    // 播放提示音
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play();

    // 直接切换到下一个模式
    if (currentMode === 'pomodoro') {
        // 每4个番茄钟后进入长休息
        const todayStats = currentUser ? 
            PomodoroStats.getUserStats(currentUser.id)[new Date().toISOString().split('T')[0]] : 
            null;
        const pomodoroCount = todayStats?.pomodoro || 0;
        
        if (pomodoroCount % 4 === 0) {
            switchMode('longBreak');
        } else {
            switchMode('shortBreak');
        }
    } else {
        switchMode('pomodoro');
    }
    
    // 重置计时器并自动开始
    timeLeft = customTimes[currentMode];
    updateDisplay();
    
    // 自动开始下一个周期
    if (!timerId) {
        toggleTimer();
    }
}

// 修改更新日期范围的函数
function updateDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (startDate && endDate && currentUser) {
        // 获取新的日期范围数据
        const stats = PomodoroStats.getDateRangeStats(currentUser.id, startDate, endDate);
        const totalStats = calculateTotalStats(stats);

        // 更新总计数据
        updateTotalStats(totalStats);
        // 更新图表
        updateCharts(stats);
        // 更新表格数据
        updateStatsTable(stats);
    }
}

// 计算总计数据的函数
function calculateTotalStats(stats) {
    return Object.values(stats).reduce((total, day) => ({
        pomodoro: total.pomodoro + (day.pomodoro || 0),
        shortBreak: total.shortBreak + (day.shortBreak || 0),
        longBreak: total.longBreak + (day.longBreak || 0),
        totalMinutes: total.totalMinutes + (day.totalMinutes || 0)
    }), { pomodoro: 0, shortBreak: 0, longBreak: 0, totalMinutes: 0 });
}

// 更新总计数据的函数
function updateTotalStats(totalStats) {
    const statsContainer = document.querySelector('.card:first-of-type .row');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="col-md-3">
                <div class="h3 mb-0">${totalStats.pomodoro}</div>
                <small class="text-muted">总专注次数</small>
            </div>
            <div class="col-md-3">
                <div class="h3 mb-0">${Math.round(totalStats.totalMinutes / 60)}</div>
                <small class="text-muted">总专注小时</small>
            </div>
            <div class="col-md-3">
                <div class="h3 mb-0">${totalStats.shortBreak + totalStats.longBreak}</div>
                <small class="text-muted">总休息次数</small>
            </div>
            <div class="col-md-3">
                <div class="h3 mb-0">${Math.round(totalStats.pomodoro / (Object.keys(stats).length || 1))}</div>
                <small class="text-muted">平均每日专注</small>
            </div>
        `;
    }
}

// 修改更新图表的函数
function updateCharts(stats) {
    // 更新趋势图
    const trendChart = Chart.getChart('trendChart');
    if (trendChart) {
        const dates = Object.keys(stats);
        const pomodoroData = dates.map(date => stats[date].pomodoro || 0);
        
        trendChart.data.labels = dates.map(date => formatDate(date));
        trendChart.data.datasets[0].data = pomodoroData;
        trendChart.update();
    }

    // 更新饼图
    const pieChart = Chart.getChart('pieChart');
    if (pieChart) {
        const totalMinutes = Object.values(stats).reduce((sum, day) => sum + (day.totalMinutes || 0), 0);
        const totalBreakMinutes = Object.values(stats).reduce((sum, day) => 
            sum + (day.shortBreak * 5 || 0) + (day.longBreak * 15 || 0), 0);

        pieChart.data.datasets[0].data = [totalMinutes, totalBreakMinutes];
        pieChart.update();
    }
}

// 修改更新表格的函数
function updateStatsTable(stats) {
    const tbody = document.querySelector('#reportModal table tbody');
    if (tbody) {
        tbody.innerHTML = Object.entries(stats).reverse().map(([date, day]) => `
            <tr>
                <td>${formatDate(date)}</td>
                <td>${day.pomodoro || 0}</td>
                <td>${day.totalMinutes || 0}分钟</td>
                <td>${day.shortBreak || 0}</td>
                <td>${day.longBreak || 0}</td>
            </tr>
        `).join('');
    }
}

// 修改初始化图表的函数
function initCharts(stats) {
    // 销毁能存在的旧图表
    const oldTrendChart = Chart.getChart('trendChart');
    if (oldTrendChart) {
        oldTrendChart.destroy();
    }
    const oldPieChart = Chart.getChart('pieChart');
    if (oldPieChart) {
        oldPieChart.destroy();
    }

    // 创建趋势图
    const dates = Object.keys(stats);
    const pomodoroData = dates.map(date => stats[date].pomodoro || 0);
    
    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: dates.map(date => formatDate(date)),
            datasets: [{
                label: '专注次数',
                data: pomodoroData,
                borderColor: '#ba4949',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // 创建饼图
    const totalMinutes = Object.values(stats).reduce((sum, day) => sum + (day.totalMinutes || 0), 0);
    const totalBreakMinutes = Object.values(stats).reduce((sum, day) => 
        sum + (day.shortBreak * 5 || 0) + (day.longBreak * 15 || 0), 0);

    new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: {
            labels: ['专注时间', '休息时间'],
            datasets: [{
                data: [totalMinutes, totalBreakMinutes],
                backgroundColor: ['#ba4949', '#38858a']
            }]
        },
        options: {
            responsive: true
        }
    });
}

function toggleRoomView() {
    // 创建自习室模态框
    const roomModal = `
        <div class="modal fade" id="roomModal" tabindex="-1" role="dialog" aria-labelledby="roomModalLabel" aria-modal="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="roomModalLabel">自习室</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
                    </div>
                    <div class="modal-body">
                        <div id="roomControls"></div>
                        <div id="roomList" class="mt-4"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 移除可能存在的旧模态框
    const oldModal = document.getElementById('roomModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', roomModal);
    
    // 检查用户登录状态并更新控制按钮
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    updateRoomControls(currentUser);
    // 更新自习室列表
    updateRoomList();
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('roomModal'));
    modal.show();
    
    // 模态框关闭时的处理
    document.getElementById('roomModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// 显示自习室模态框的函数
function showRoomModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const roomModal = `
        <div class="modal fade" id="roomModal" tabindex="-1" role="dialog" aria-labelledby="roomModalLabel" aria-modal="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content" style="background: url('assets/1.png') no-repeat center center; background-size: cover;">
                    <div class="modal-header bg-light bg-opacity-75">
                        <h5 class="modal-title" id="roomModalLabel">自习室</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
                    </div>
                    <div class="modal-body" style="background: rgba(255, 255, 255, 0.9); border-radius: 0 0 0.3rem 0.3rem;">
                        <div id="roomControls"></div>
                        <div id="roomList" class="mt-4"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 移除可能存在的旧模态框
    const oldModal = document.getElementById('roomModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', roomModal);
    
    // 检查用户登录状态并更新控制按钮
    updateRoomControls(currentUser);
    // 更新自习室列表
    updateRoomList();
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('roomModal'));
    modal.show();
    
    // 模态框关闭时的处理
    document.getElementById('roomModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// 更新自习室控制按钮
function updateRoomControls(currentUser) {
    const roomControls = document.getElementById('roomControls');
    if (!roomControls) return;

    if (!currentUser) {
        roomControls.innerHTML = '<div class="alert alert-warning">请先登录</div>';
        return;
    }

    roomControls.innerHTML = currentUser.room ? 
        `<button class="btn btn-danger" onclick="leaveRoom()">退出自习室</button>` :
        `<div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="joinRoom()">加入自习室</button>
            <button class="btn btn-success" onclick="createRoom()">新建自习室</button>
        </div>`;
}

// 加入自习室
function joinRoom() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const roomName = prompt('请输入要加入的自习室名称:');
    if (!roomName) return;

    const roomStats = JSON.parse(localStorage.getItem('roomStats') || '{}');
    if (!roomStats[roomName]) {
        alert('该自习室不存在');
        return;
    }

    // 更新用户状态
    currentUser.room = roomName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // 更新自习室统计
    if (!roomStats[roomName][currentUser.username]) {
        roomStats[roomName][currentUser.username] = 0;
    }
    localStorage.setItem('roomStats', JSON.stringify(roomStats));

    // 更新界面
    updateRoomControls(currentUser);
    updateRoomList();
    alert('成功加入自习室！');
}

// 创建自习室
function createRoom() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const roomName = prompt('请输入新自习室名称:');
    if (!roomName) return;

    const roomStats = JSON.parse(localStorage.getItem('roomStats') || '{}');
    if (roomStats[roomName]) {
        alert('该自习室已存在');
        return;
    }

    // 创建新自习室
    roomStats[roomName] = {
        [currentUser.username]: 0
    };
    localStorage.setItem('roomStats', JSON.stringify(roomStats));

    // 更新用户状态
    currentUser.room = roomName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // 更新界面
    updateRoomControls(currentUser);
    updateRoomList();
    alert('成功创建并加入自习室！');
}

// 退出自习室
function leaveRoom() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.room) {
        alert('您当前不在任何自习室中');
        return;
    }

    const roomStats = JSON.parse(localStorage.getItem('roomStats') || '{}');
    const roomName = currentUser.room;

    // 从自习室中移除用户
    if (roomStats[roomName]) {
        delete roomStats[roomName][currentUser.username];
    }
    localStorage.setItem('roomStats', JSON.stringify(roomStats));

    // 更新用户状态
    delete currentUser.room;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // 更新界面
    updateRoomControls(currentUser);
    updateRoomList();
    alert('已退出自习室！');
}

// 更新自习室列表
function updateRoomList() {
    const roomList = document.getElementById('roomList');
    if (!roomList) return;

    const roomStats = JSON.parse(localStorage.getItem('roomStats') || '{}');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    let html = '<h3>自习室列表</h3><ul class="list-group">';
    
    for (const [roomName, users] of Object.entries(roomStats)) {
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${roomName}
                <span class="badge bg-primary rounded-pill">${Object.keys(users).length}人</span>
            </li>
        `;
    }
    html += '</ul>';

    // 如果用户在某个自习室中，显示排名
    if (currentUser?.room && roomStats[currentUser.room]) {
        const roomUsers = Object.entries(roomStats[currentUser.room])
            .sort(([,a], [,b]) => b - a);

        html += `
            <h3 class="mt-4">${currentUser.room} 排名</h3>
            <ul class="list-group">
                ${roomUsers.map(([username, minutes]) => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${username}
                        <span class="badge bg-success rounded-pill">${minutes}分钟</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    roomList.innerHTML = html;
}

function showWishWall() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const wishWallModal = `
        <div class="modal fade" id="wishWallModal" tabindex="-1" role="dialog" aria-labelledby="wishWallModalLabel" aria-modal="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content" style="background: url('assets/2.png') no-repeat center center; background-size: cover;">
                    <div class="modal-header bg-light bg-opacity-75">
                        <h5 class="modal-title" id="wishWallModalLabel">许愿墙</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
                    </div>
                    <div class="modal-body" style="background: rgba(255, 255, 255, 0.9); border-radius: 0 0 0.3rem 0.3rem;">
                        <div class="d-flex justify-content-center gap-3 mb-4">
                            <button class="btn btn-primary" onclick="makeWish()">我要许愿</button>
                            <button class="btn btn-success" onclick="fulfillWish()">我要还愿</button>
                        </div>
                        <div id="wishContainer" class="position-relative" style="height: 400px; overflow: hidden;">
                            <!-- 弹幕会在这里显示 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 移除可能存在的旧模态框
    const oldModal = document.getElementById('wishWallModal');
    if (oldModal) {
        oldModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', wishWallModal);
    const modal = new bootstrap.Modal(document.getElementById('wishWallModal'));
    modal.show();

    // 模态框关闭时的处理
    document.getElementById('wishWallModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });

    // 加载并显示现有的弹幕
    loadAndShowBullets();
}

function makeWish() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const wish = prompt('请输入你的愿望:');
    if (wish) {
        const wishData = {
            type: 'wish',
            username: currentUser.username,
            content: wish,
            timestamp: Date.now()
        };
        saveBullet(wishData);
        createBullet(wishData);
    }
}

function fulfillWish() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const fulfill = prompt('请输入你的还愿:');
    if (fulfill) {
        const fulfillData = {
            type: 'fulfill',
            username: currentUser.username,
            content: fulfill,
            timestamp: Date.now()
        };
        saveBullet(fulfillData);
        createBullet(fulfillData);
    }
}

function createBullet(data) {
    const bullet = document.createElement('div');
    bullet.className = `wish-bullet ${data.type}`;
    bullet.textContent = `${data.username} ${data.type === 'wish' ? '许愿' : '还愿'}: ${data.content}`;
    bullet.style.top = `${Math.random() * 80}%`;
    
    const container = document.getElementById('wishContainer');
    if (container) {
        container.appendChild(bullet);
        
        // 当动画结束后移除弹幕
        bullet.addEventListener('animationend', () => {
            bullet.remove();
        });
    }
}

function saveBullet(data) {
    const bullets = JSON.parse(localStorage.getItem('wishBullets') || '[]');
    bullets.push(data);
    localStorage.setItem('wishBullets', JSON.stringify(bullets));
}

function loadAndShowBullets() {
    const bullets = JSON.parse(localStorage.getItem('wishBullets') || '[]');
    const container = document.getElementById('wishContainer');
    
    if (container && bullets.length > 0) {
        // 循环显示弹幕
        let index = 0;
        const showNextBullet = () => {
            createBullet(bullets[index]);
            index = (index + 1) % bullets.length;
            setTimeout(showNextBullet, 2000); // 每2秒显示一条新弹幕
        };
        showNextBullet();
    }
}