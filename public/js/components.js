/**
 * VocaloWiki 页面组件
 * 用于渲染可复用的页面组件（导航栏、页脚等）
 */

/**
 * 渲染导航栏
 * @param {Object} options - 配置选项
 * @param {string} options.activePage - 当前激活的页面 ('home', 'search', 'user', 'admin', 'article', 'editor', 'settings', 'login', 'register')
 * @param {boolean} options.showUserInfo - 是否显示用户信息
 * @param {Object} options.user - 用户信息对象
 */
function renderNavbar(options = {}) {
    const {
        activePage = '',
        showUserInfo = false,
        user = null,
        showEditorBtn = false,
        showLoginBtn = true,
        showRegisterBtn = true
    } = options;

    const navUser = document.getElementById('nav-user');
    const navAdmin = document.getElementById('nav-admin');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userInfo = document.getElementById('user-info');
    const editBtn = document.getElementById('edit-btn');
    const createBtn = document.getElementById('create-btn');
    const usernameDisplay = document.getElementById('username-display');

    // 设置导航链接高亮
    if (navUser) {
        navUser.style.display = 'none';
    }
    if (navAdmin) {
        navAdmin.style.display = 'none';
    }
    if (loginBtn) {
        loginBtn.style.display = showLoginBtn && !showUserInfo ? 'inline-flex' : 'none';
    }
    if (registerBtn) {
        registerBtn.style.display = showRegisterBtn && !showUserInfo ? 'inline-flex' : 'none';
    }
    if (userInfo) {
        userInfo.style.display = showUserInfo ? 'flex' : 'none';
    }
    if (editBtn) {
        editBtn.style.display = showEditorBtn ? 'inline-flex' : 'none';
    }
    if (createBtn) {
        createBtn.style.display = showUserInfo ? 'inline-flex' : 'none';
    }

    // 显示用户信息
    if (showUserInfo && user && usernameDisplay) {
        usernameDisplay.textContent = user.nickname || user.username;
    }

    // 根据用户角色显示管理后台入口
    if (showUserInfo && user && user.role === 'admin' && navAdmin) {
        navAdmin.style.display = 'block';
    }

    // 更新当前页面高亮
    updateActiveNavLink(activePage);
}

/**
 * 更新导航链接的激活状态
 * @param {string} activePage - 当前页面标识
 */
function updateActiveNavLink(activePage) {
    // 移除所有激活状态
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.color = '';
    });
    
    // 设置当前页面高亮
    const activeLink = document.querySelector(`.nav-links a[href*="${activePage}"]`);
    if (activeLink) {
        activeLink.style.color = 'var(--vocaloid-primary)';
    }
}

/**
 * 渲染标准页面导航栏
 * @param {Object} options - 配置选项
 */
function renderStandardNavbar(options = {}) {
    const {
        activePage = '',
        user = null,
        wikiName = window.WikiSettings?.wikiName || '百科',
        showEditorBtn = false
    } = options;

    const navbar = document.getElementById('navbar-container');
    if (!navbar) return;

    const isLoggedIn = !!user;
    
    navbar.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <a href="index.html" class="logo">${getLogoHtml(wikiName)}</a>
                <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div class="nav-links" id="nav-links">
                    <a href="home.html">探索</a>
                    <a href="search.html">搜索</a>
                    <a href="user.html" id="nav-user" style="display:none;">个人中心</a>
                    <a href="admin.html" id="nav-admin" style="display:none;">管理后台</a>
                </div>
                <div class="nav-user">
                    <button class="btn btn-icon theme-toggle-btn" data-theme="light" onclick="ThemeManager.setTheme('light')" title="浅色模式">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    </button>
                    <button class="btn btn-icon theme-toggle-btn active" data-theme="dark" onclick="ThemeManager.setTheme('dark')" title="深色模式">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
                    <a href="editor.html" class="btn btn-primary btn-sm" id="edit-btn" style="display:${showEditorBtn ? 'inline-flex' : 'none'};border-radius:20px;">✏️ 创建词条</a>
                    <a href="login.html" class="btn btn-outline" id="login-btn" style="display:${isLoggedIn ? 'none' : 'inline-flex'};">登录</a>
                    <a href="register.html" class="btn btn-primary" id="register-btn" style="display:${isLoggedIn ? 'none' : 'inline-flex'};">注册</a>
                    <div id="user-info" style="display:${isLoggedIn ? 'flex' : 'none'};">
                        <span id="username-display">${escapeHtml(user?.nickname || user?.username || '')}</span>
                        <a href="settings.html" class="btn btn-outline btn-sm">设置</a>
                        <button class="btn btn-secondary btn-sm" onclick="logout()">登出</button>
                    </div>
                </div>
            </div>
        </nav>
    `;

    // 根据用户角色显示管理后台入口
    if (isLoggedIn && user?.role === 'admin') {
        const navAdmin = document.getElementById('nav-admin');
        if (navAdmin) navAdmin.style.display = 'block';
    }

    updateActiveNavLink(activePage);
}

/**
 * 渲染落地页导航栏（完整版）
 * @param {Object} options - 配置选项
 */
function renderLandingNavbar(options = {}) {
    const {
        activePage = '',
        user = null,
        wikiName = window.WikiSettings?.wikiName || '百科'
    } = options;

    const navbar = document.getElementById('navbar-container');
    if (!navbar) return;

    const isLoggedIn = !!user;
    
    navbar.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <a href="index.html" class="logo">${getLogoHtml(wikiName)}</a>
                <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div class="nav-links" id="nav-links">
                    <a href="home.html">探索</a>
                    <a href="search.html">搜索</a>
                    <a href="user.html" id="nav-user" style="display:none;">个人中心</a>
                    <a href="admin.html" id="nav-admin" style="display:none;">管理后台</a>
                </div>
                <div class="nav-user">
                    <button class="btn btn-icon theme-toggle-btn" data-theme="light" onclick="ThemeManager.setTheme('light')" title="浅色模式">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    </button>
                    <button class="btn btn-icon theme-toggle-btn active" data-theme="dark" onclick="ThemeManager.setTheme('dark')" title="深色模式">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
                    <a href="login.html" class="btn btn-outline" id="login-btn" style="display:${isLoggedIn ? 'none' : 'inline-flex'};">登录</a>
                    <a href="register.html" class="btn btn-primary" id="register-btn" style="display:${isLoggedIn ? 'none' : 'inline-flex'};">注册</a>
                    <div id="user-info" style="display:${isLoggedIn ? 'flex' : 'none'};">
                        <span id="username-display">${escapeHtml(user?.nickname || user?.username || '')}</span>
                        <a href="settings.html" class="btn btn-outline btn-sm">设置</a>
                        <button class="btn btn-secondary btn-sm" onclick="logout()">登出</button>
                    </div>
                </div>
            </div>
        </nav>
    `;

    // 根据用户角色显示管理后台入口
    if (isLoggedIn && user?.role === 'admin') {
        const navAdmin = document.getElementById('nav-admin');
        if (navAdmin) navAdmin.style.display = 'block';
    }

    updateActiveNavLink(activePage);
}

/**
 * 获取Logo HTML
 * @param {string} wikiName - 百科名称
 * @returns {string} Logo HTML
 */
function getLogoHtml(wikiName) {
    const logoData = window.WikiSettings?.logoData;
    
    if (logoData) {
        if (logoData.type === 'image' && logoData.value) {
            return `<img src="${escapeHtml(logoData.value)}" alt="logo" class="logo-image" style="width:32px;height:32px;object-fit:contain;"> <span class="logo-text">${escapeHtml(wikiName)}</span>`;
        } else if (logoData.type === 'emoji') {
            return `<span class="logo-emoji">${logoData.value || '🎵'}</span> <span class="logo-text">${escapeHtml(wikiName)}</span>`;
        }
    }
    
    // 默认：使用emoji
    return `<span class="logo-emoji">🎵</span> <span class="logo-text">${escapeHtml(wikiName)}</span>`;
}

/**
 * 渲染编辑器页面导航栏
 * @param {Object} options - 配置选项
 */
function renderEditorNavbar(options = {}) {
    const { user = null } = options;
    const wikiName = window.WikiSettings?.wikiName || '百科';
    const navbar = document.getElementById('navbar-container');
    if (navbar) {
        navbar.innerHTML = `
            <nav class="wiki-navbar">
                <a href="home.html" class="logo">
                    ${getLogoHtml(wikiName)}
                </a>
                <div class="nav-user">
                    <button class="btn btn-icon theme-toggle-btn" data-theme="light" onclick="ThemeManager.setTheme('light')" title="浅色模式" style="padding:6px 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    </button>
                    <button class="btn btn-icon theme-toggle-btn active" data-theme="dark" onclick="ThemeManager.setTheme('dark')" title="深色模式" style="padding:6px 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
                    ${user ? `
                        <span class="user-name" id="username-display">${escapeHtml(user.nickname || user.username)}</span>
                        <a href="settings.html" class="btn-outline">设置</a>
                        <button class="btn-secondary" onclick="logout()">登出</button>
                    ` : `
                        <a href="login.html" class="btn-outline">登录</a>
                    `}
                </div>
            </nav>
        `;
    }
}

/**
 * 渲染页脚
 * @param {Object} options - 配置选项
 */
function renderFooter(options = {}) {
    const { wikiName = 'VocaloWiki', showAdmin = false } = options;
    
    const footer = document.getElementById('footer-container');
    if (footer) {
        footer.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <p>&copy; 2026 <span id="footer-wiki-name">${escapeHtml(wikiName)}</span></p>
                </div>
            </footer>
        `;
    }
}

/**
 * 渲染登录/注册页面导航栏（简化版）
 * @param {Object} options - 配置选项
 */
function renderAuthNavbar(options = {}) {
    const navbar = document.getElementById('navbar-container');
    if (navbar) {
        navbar.innerHTML = `
            <nav class="navbar" style="position:relative;z-index:10;">
                <div class="container">
                    <a href="home.html" class="logo">${getLogoHtml(options.wikiName || window.WikiSettings?.wikiName || '百科')}</a>
                    <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <div class="nav-links" id="nav-links">
                        <a href="home.html">首页</a>
                        <a href="search.html">搜索词条</a>
                    </div>
                    <div class="nav-user">
                        <button class="btn btn-icon theme-toggle-btn" data-theme="light" onclick="ThemeManager.setTheme('light')" title="浅色模式">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        </button>
                        <button class="btn btn-icon theme-toggle-btn active" data-theme="dark" onclick="ThemeManager.setTheme('dark')" title="深色模式">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }
}

/**
 * 渲染背景装饰（用于登录/注册页）
 */
function renderAuthBackground() {
    const container = document.getElementById('auth-background');
    if (container) {
        container.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;z-index:0;">
                <div style="position:absolute;top:10%;left:10%;width:300px;height:300px;background:radial-gradient(circle,rgba(255,107,157,0.15),transparent 70%);border-radius:50%;filter:blur(60px);"></div>
                <div style="position:absolute;bottom:20%;right:15%;width:400px;height:400px;background:radial-gradient(circle,rgba(123,104,238,0.15),transparent 70%);border-radius:50%;filter:blur(80px);"></div>
                <div style="position:absolute;top:40%;right:30%;width:250px;height:250px;background:radial-gradient(circle,rgba(0,206,209,0.1),transparent 70%);border-radius:50%;filter:blur(50px);"></div>
            </div>
        `;
    }
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 初始化页面组件
 * 根据页面类型自动渲染对应的导航栏和页脚
 */
function initPageComponents(pageType, options = {}) {
    // 根据页面类型渲染组件
    switch (pageType) {
        case 'landing':
            renderLandingNavbar(options);
            renderFooter(options);
            break;
        case 'auth':
            renderAuthBackground();
            renderAuthNavbar(options);
            break;
        case 'editor':
            renderEditorNavbar(options);
            break;
        case 'standard':
        default:
            renderStandardNavbar(options);
            renderFooter(options);
            break;
    }
}

// 导出组件函数
window.VocaloComponents = {
    renderNavbar,
    renderStandardNavbar,
    renderLandingNavbar,
    renderEditorNavbar,
    renderAuthNavbar,
    renderFooter,
    renderAuthBackground,
    initPageComponents,
    updateActiveNavLink
};
