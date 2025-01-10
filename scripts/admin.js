// 初始化管理员账户
function initializeAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.find(u => u.email === '6657@qq.com')) {
        users.push({
            username: 'admin',
            email: '6657@qq.com',
            password: '12345',
            isAdmin: true
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// 加载所有数据
function loadAllData() {
    loadUsers();
    loadRooms();
    loadWishes();
}

// 加载用户数据
function loadUsers() {
    const usersList = document.getElementById('usersList');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    usersList.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                ${user.isAdmin ? 
                    '<span class="badge bg-primary">管理员</span>' :
                    `<button class="btn btn-sm btn-danger" onclick="deleteUser('${user.email}')">删除</button>`
                }
            </td>
        </tr>
    `).join('');
}

// 加载自习室数据
function loadRooms() {
    const roomsList = document.getElementById('roomsList');
    const roomStats = JSON.parse(localStorage.getItem('roomStats') || '{}');
    
    roomsList.innerHTML = Object.entries(roomStats).map(([room, users]) => `
        <tr>
            <td>${room}</td>
            <td>${Object.keys(users).length}</td>
            <td>
                <button class="btn btn-sm btn-info me-2" onclick="viewRoomUsers('${room}')">查看成员</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRoom('${room}')">删除</button>
            </td>
        </tr>
    `).join('');
}

// 加载许愿墙数据
function loadWishes() {
    const wishesList = document.getElementById('wishesList');
    const wishBullets = JSON.parse(localStorage.getItem('wishBullets') || '[]');
    
    wishesList.innerHTML = wishBullets.map((wish, index) => `
        <tr>
            <td>${wish.content}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteWish(${index})">删除</button>
            </td>
        </tr>
    `).join('');
}

// 删除愿望
function deleteWish(index) {
    if (!confirm('确定要删除这条发言吗？')) return;
    
    const wishBullets = JSON.parse(localStorage.getItem('wishBullets') || '[]');
    wishBullets.splice(index, 1);
    localStorage.setItem('wishBullets', JSON.stringify(wishBullets));
    loadWishes();
}

// 删除用户
function deleteUser(email) {
    if (!confirm('确定要删除该用户吗？')) return;   
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newUsers = users.filter(u => u.email !== email);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
}

// 删除自习室
function deleteRoom(roomName) {
    if (!confirm('确定要删除该自习室吗？')) return;
    
    const roomStats = JSON.parse(localStorage.getItem('roomStats') || '{}');
    delete roomStats[roomName];
    localStorage.setItem('roomStats', JSON.stringify(roomStats));
    loadRooms();
}

// 查看自习室成员
function viewRoomUsers(roomName) {
    const roomStats = JSON.parse(localStorage.getItem('roomStats') || '{}');
    const users = roomStats[roomName] || {};
    
    
    let userList = Object.keys(users).join('\n');
    
    alert(`${roomName}的成员：\n${userList || '暂无成员'}`);
}

        // 处理管理员登录
        function handleAdminLogin() {
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;

            if (!email || !password) {
                alert('请输入邮箱和密码');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const admin = users.find(u => u.email === email && u.password === password && u.isAdmin);

            if (!admin) {
                alert('管理员邮箱或密码错误');
                return;
            }

            // 保存管理员登录状态
            localStorage.setItem('currentUser', JSON.stringify(admin));
            
            // 显示管理面板
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            
            // 加载数据
            loadAllData();
        }

        // 退出登录
        function logout() {
            localStorage.removeItem('currentUser');
            window.location.reload();
        }



        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', () => {
            initializeAdmin();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser?.isAdmin) {
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                loadAllData();
            }
        });