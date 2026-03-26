/**
 * Wiki 百科网站 - 主题系统
 * 
 * 包含主题配置和主题管理功能
 * 支持多主题切换，包括深色、浅色、护眼、赛博朋克等多种风格
 * 
 * @module theme
 * @version 3.0.0
 */

// ============================================
// 主题配置
// ============================================

/**
 * 主题定义
 * 每个主题包含名称、描述、图标和 CSS 变量
 */
const THEMES = {
    // ============================================
    // 深色主题 - 默认的紫粉色风格
    // ============================================
    dark: {
        id: 'dark',
        name: '深色模式',
        description: '适合夜间阅读',
        icon: 'moon',
        isDark: true,
        colors: {
            primary: '#FF6B9D',
            secondary: '#7B68EE',
            accent: '#00CED1',
            gradient: 'linear-gradient(135deg, #FF6B9D, #7B68EE, #00CED1)',
            gradientSoft: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(123,104,238,0.2), rgba(0,206,209,0.2))',
            bgPrimary: '#0f0f23',
            bgSecondary: '#1a1a2e',
            bgTertiary: '#252547',
            cardBg: '#1e1e3f',
            cardHover: '#2a2a4a',
            textPrimary: '#ffffff',
            textSecondary: '#b8b8d1',
            textMuted: '#8888aa',
            border: '#3a3a5c',
            borderGlow: 'rgba(255, 107, 157, 0.3)',
            success: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
            shadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            shadowGlow: '0 0 30px rgba(255, 107, 157, 0.2)',
            shadowLg: '0 10px 40px rgba(0, 0, 0, 0.4)'
        }
    },

    // ============================================
    // 浅色主题 - 清爽白色风格
    // ============================================
    light: {
        id: 'light',
        name: '浅色模式',
        description: '适合白天阅读',
        icon: 'sun',
        isDark: false,
        colors: {
            primary: '#FF6B9D',
            secondary: '#7B68EE',
            accent: '#00CED1',
            gradient: 'linear-gradient(135deg, #FF6B9D, #7B68EE, #00CED1)',
            gradientSoft: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(123,104,238,0.15), rgba(0,206,209,0.15))',
            bgPrimary: '#f8fafc',
            bgSecondary: '#ffffff',
            bgTertiary: '#f1f5f9',
            cardBg: '#ffffff',
            cardHover: '#f8fafc',
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            textMuted: '#94a3b8',
            border: '#e2e8f0',
            borderGlow: 'rgba(255, 107, 157, 0.2)',
            success: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
            shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            shadowGlow: '0 4px 20px rgba(255, 107, 157, 0.15)',
            shadowLg: '0 10px 40px rgba(0, 0, 0, 0.1)'
        }
    },

    // ============================================
    // 护眼主题 - 暖色调米色
    // ============================================
    sepia: {
        id: 'sepia',
        name: '护眼模式',
        description: '暖色调，保护视力',
        icon: 'coffee',
        isDark: false,
        colors: {
            primary: '#c4a35a',
            secondary: '#8b6914',
            accent: '#5d8a3e',
            gradient: 'linear-gradient(135deg, #c4a35a, #8b6914, #5d8a3e)',
            gradientSoft: 'linear-gradient(135deg, rgba(196,163,90,0.2), rgba(139,105,20,0.2), rgba(93,138,62,0.2))',
            bgPrimary: '#f5f0e6',
            bgSecondary: '#faf8f3',
            bgTertiary: '#ebe5d9',
            cardBg: '#faf8f3',
            cardHover: '#f5f0e6',
            textPrimary: '#3d3229',
            textSecondary: '#5c4f40',
            textMuted: '#8a7d6d',
            border: '#d4c9b8',
            borderGlow: 'rgba(196, 163, 90, 0.3)',
            success: '#5d8a3e',
            warning: '#c4a35a',
            danger: '#a85d4d',
            shadow: '0 4px 20px rgba(61, 50, 41, 0.1)',
            shadowGlow: '0 4px 20px rgba(196, 163, 90, 0.15)',
            shadowLg: '0 10px 40px rgba(61, 50, 41, 0.12)'
        }
    },

    // ============================================
    // 赛博朋克主题 - 霓虹风格
    // ============================================
    cyberpunk: {
        id: 'cyberpunk',
        name: '赛博朋克',
        description: '霓虹色彩，科技感',
        icon: 'zap',
        isDark: true,
        colors: {
            primary: '#00ffff',
            secondary: '#ff00ff',
            accent: '#ffff00',
            gradient: 'linear-gradient(135deg, #00ffff, #ff00ff, #ffff00)',
            gradientSoft: 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(255,0,255,0.15), rgba(255,255,0,0.15))',
            bgPrimary: '#0a0a0f',
            bgSecondary: '#12121a',
            bgTertiary: '#1a1a25',
            cardBg: '#15151f',
            cardHover: '#1e1e2a',
            textPrimary: '#e0e0ff',
            textSecondary: '#9090b0',
            textMuted: '#606080',
            border: '#2a2a40',
            borderGlow: 'rgba(0, 255, 255, 0.4)',
            success: '#00ff88',
            warning: '#ffcc00',
            danger: '#ff3366',
            shadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            shadowGlow: '0 0 30px rgba(0, 255, 255, 0.25)',
            shadowLg: '0 10px 40px rgba(0, 0, 0, 0.6)'
        }
    },

    // ============================================
    // 森林主题 - 自然绿色风格
    // ============================================
    forest: {
        id: 'forest',
        name: '森林模式',
        description: '清新自然，舒适阅读',
        icon: 'leaf',
        isDark: false,
        colors: {
            primary: '#2d8659',
            secondary: '#1a5c3a',
            accent: '#8b5a2b',
            gradient: 'linear-gradient(135deg, #2d8659, #1a5c3a, #8b5a2b)',
            gradientSoft: 'linear-gradient(135deg, rgba(45,134,89,0.15), rgba(26,92,58,0.15), rgba(139,90,43,0.15))',
            bgPrimary: '#f0f7f2',
            bgSecondary: '#ffffff',
            bgTertiary: '#e5f0e8',
            cardBg: '#ffffff',
            cardHover: '#f0f7f2',
            textPrimary: '#1a2e1a',
            textSecondary: '#3d5c3d',
            textMuted: '#6b8e6b',
            border: '#c5dbc5',
            borderGlow: 'rgba(45, 134, 89, 0.25)',
            success: '#2d8659',
            warning: '#d4a84b',
            danger: '#c75d5d',
            shadow: '0 4px 20px rgba(26, 46, 26, 0.08)',
            shadowGlow: '0 4px 20px rgba(45, 134, 89, 0.12)',
            shadowLg: '0 10px 40px rgba(26, 46, 26, 0.1)'
        }
    },

    // ============================================
    // 海洋主题 - 清新蓝色风格
    // ============================================
    ocean: {
        id: 'ocean',
        name: '海洋模式',
        description: '清爽蓝色，宁静舒适',
        icon: 'droplet',
        isDark: false,
        colors: {
            primary: '#0066cc',
            secondary: '#004499',
            accent: '#00aa88',
            gradient: 'linear-gradient(135deg, #0066cc, #004499, #00aa88)',
            gradientSoft: 'linear-gradient(135deg, rgba(0,102,204,0.15), rgba(0,68,153,0.15), rgba(0,170,136,0.15))',
            bgPrimary: '#f0f7ff',
            bgSecondary: '#ffffff',
            bgTertiary: '#e5f0fa',
            cardBg: '#ffffff',
            cardHover: '#f0f7ff',
            textPrimary: '#1a2940',
            textSecondary: '#4a6080',
            textMuted: '#7a9ab8',
            border: '#c5d8f0',
            borderGlow: 'rgba(0, 102, 204, 0.25)',
            success: '#00aa88',
            warning: '#d4a84b',
            danger: '#c75d5d',
            shadow: '0 4px 20px rgba(26, 41, 64, 0.08)',
            shadowGlow: '0 4px 20px rgba(0, 102, 204, 0.12)',
            shadowLg: '0 10px 40px rgba(26, 41, 64, 0.1)'
        }
    },

    // ============================================
    // 日暮主题 - 温暖的橙红色调
    // ============================================
    sunset: {
        id: 'sunset',
        name: '日暮模式',
        description: '温暖橙红，夕阳余晖',
        icon: 'sunset',
        isDark: true,
        colors: {
            primary: '#ff7b54',
            secondary: '#ff5722',
            accent: '#ffc107',
            gradient: 'linear-gradient(135deg, #ff7b54, #ff5722, #ffc107)',
            gradientSoft: 'linear-gradient(135deg, rgba(255,123,84,0.15), rgba(255,87,34,0.15), rgba(255,193,7,0.15))',
            bgPrimary: '#1a1412',
            bgSecondary: '#241c18',
            bgTertiary: '#302420',
            cardBg: '#2a2018',
            cardHover: '#342820',
            textPrimary: '#fff5f0',
            textSecondary: '#d0c0b0',
            textMuted: '#8a7a6a',
            border: '#4a3a30',
            borderGlow: 'rgba(255, 123, 84, 0.35)',
            success: '#4caf50',
            warning: '#ffc107',
            danger: '#ff5722',
            shadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            shadowGlow: '0 0 30px rgba(255, 123, 84, 0.2)',
            shadowLg: '0 10px 40px rgba(0, 0, 0, 0.5)'
        }
    },

    // ============================================
    // 极客主题 - 极简深色风格
    // ============================================
    hacker: {
        id: 'hacker',
        name: '极客模式',
        description: '极简黑白，代码风格',
        icon: 'terminal',
        isDark: true,
        colors: {
            primary: '#00ff00',
            secondary: '#00cc00',
            accent: '#00ffff',
            gradient: 'linear-gradient(135deg, #00ff00, #00cc00, #00ffff)',
            gradientSoft: 'linear-gradient(135deg, rgba(0,255,0,0.1), rgba(0,204,0,0.1), rgba(0,255,255,0.1))',
            bgPrimary: '#0d0d0d',
            bgSecondary: '#141414',
            bgTertiary: '#1a1a1a',
            cardBg: '#0f0f0f',
            cardHover: '#181818',
            textPrimary: '#00ff00',
            textSecondary: '#00cc00',
            textMuted: '#008800',
            border: '#252525',
            borderGlow: 'rgba(0, 255, 0, 0.3)',
            success: '#00ff00',
            warning: '#ffff00',
            danger: '#ff0000',
            shadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            shadowGlow: '0 0 30px rgba(0, 255, 0, 0.15)',
            shadowLg: '0 10px 40px rgba(0, 0, 0, 0.9)'
        }
    }
};

// ============================================
// 主题管理器
// ============================================

/**
 * 主题管理器
 */
const ThemeManager = {
    STORAGE_KEY: 'wiki_theme',
    DEFAULT_THEME: 'dark',

    getTheme() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored || this.DEFAULT_THEME;
    },

    setTheme(themeId) {
        localStorage.setItem(this.STORAGE_KEY, themeId);
        this.applyTheme(themeId);
        this.updateToggleButtons(themeId);
        this.updateThemeCards(themeId);
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme: themeId } 
        }));
    },

    toggleTheme() {
        const current = this.getTheme();
        const themes = Object.keys(THEMES);
        const currentIndex = themes.indexOf(current);
        const nextIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[nextIndex];
        this.setTheme(newTheme);
        return newTheme;
    },

    applyTheme(themeId) {
        const theme = THEMES[themeId];
        if (!theme) {
            console.warn(`主题 ${themeId} 不存在，使用默认主题`);
            this.applyTheme(this.DEFAULT_THEME);
            return;
        }

        const root = document.documentElement;
        const c = theme.colors;

        root.style.setProperty('--primary-color', c.primary);
        root.style.setProperty('--primary-hover', this.adjustColor(c.primary, 15));
        root.style.setProperty('--secondary-color', c.secondary);
        root.style.setProperty('--accent-color', c.accent);
        root.style.setProperty('--vocaloid-primary', c.primary);
        root.style.setProperty('--vocaloid-secondary', c.secondary);
        root.style.setProperty('--vocaloid-accent', c.accent);
        root.style.setProperty('--vocaloid-gradient', c.gradient);
        root.style.setProperty('--vocaloid-gradient-soft', c.gradientSoft);
        
        root.style.setProperty('--bg-color', c.bgPrimary);
        root.style.setProperty('--bg-secondary', c.bgSecondary);
        root.style.setProperty('--bg-tertiary', c.bgTertiary);
        root.style.setProperty('--card-bg', c.cardBg);
        root.style.setProperty('--card-hover', c.cardHover);
        
        root.style.setProperty('--text-primary', c.textPrimary);
        root.style.setProperty('--text-secondary', c.textSecondary);
        root.style.setProperty('--text-muted', c.textMuted);
        
        root.style.setProperty('--border-color', c.border);
        root.style.setProperty('--border-glow', c.borderGlow);
        
        root.style.setProperty('--success-color', c.success);
        root.style.setProperty('--warning-color', c.warning);
        root.style.setProperty('--danger-color', c.danger);
        
        root.style.setProperty('--shadow', c.shadow);
        root.style.setProperty('--shadow-glow', c.shadowGlow);
        root.style.setProperty('--shadow-lg', c.shadowLg);

        root.setAttribute('data-theme', themeId);
        root.setAttribute('data-theme-mode', theme.isDark ? 'dark' : 'light');
    },

    adjustColor(color, percent) {
        if (color.startsWith('#')) {
            let r = parseInt(color.slice(1, 3), 16);
            let g = parseInt(color.slice(3, 5), 16);
            let b = parseInt(color.slice(5, 7), 16);
            
            r = Math.min(255, Math.max(0, r + Math.round(r * percent / 100)));
            g = Math.min(255, Math.max(0, g + Math.round(g * percent / 100)));
            b = Math.min(255, Math.max(0, b + Math.round(b * percent / 100)));
            
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return color;
    },

    updateToggleButtons(themeId) {
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            const isDark = btn.dataset.theme === 'dark';
            if ((isDark && themeId === 'dark') || (!isDark && themeId !== 'dark')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    updateThemeCards(themeId) {
        document.querySelectorAll('.theme-option input[name="theme"]').forEach(input => {
            if (input.value === themeId) {
                input.checked = true;
            }
        });
    },

    init() {
        const themeId = this.getTheme();
        this.applyTheme(themeId);
        this.updateToggleButtons(themeId);
        
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.STORAGE_KEY)) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(newTheme);
                }
            });
        }
    },

    getCurrentThemeObject() {
        return THEMES[this.getTheme()] || THEMES[this.DEFAULT_THEME];
    },

    getAvailableThemes() {
        return Object.values(THEMES);
    },

    resetToDefault() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.setTheme(this.DEFAULT_THEME);
    }
};

// ============================================
// 快捷函数
// ============================================

function toggleTheme() {
    return ThemeManager.toggleTheme();
}

function setTheme(theme) {
    ThemeManager.setTheme(theme);
}

function getCurrentTheme() {
    return ThemeManager.getTheme();
}

function getCurrentThemeObject() {
    return ThemeManager.getCurrentThemeObject();
}

function getAvailableThemes() {
    return ThemeManager.getAvailableThemes();
}

/**
 * 生成主题选择HTML
 * @param {string} currentTheme - 当前主题ID
 * @returns {string} HTML字符串
 */
function generateThemeSelectorHTML(currentTheme) {
    const themes = ThemeManager.getAvailableThemes();
    
    return themes.map(theme => {
        const isSelected = theme.id === currentTheme;
        const previewBg = theme.isDark ? '#1a1a2e' : '#ffffff';
        const previewBorder = theme.colors.border;
        
        return `
            <label class="theme-option ${isSelected ? 'selected' : ''}">
                <input type="radio" name="theme" value="${theme.id}" ${isSelected ? 'checked' : ''}>
                <div class="theme-card" data-theme-card="${theme.id}">
                    <div class="theme-preview" style="
                        background: ${previewBg};
                        border: 1px solid ${previewBorder};
                    ">
                        <div style="
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: ${theme.colors.gradient};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            ${getThemeIcon(theme.icon)}
                        </div>
                    </div>
                    <span class="theme-name">${theme.name}</span>
                    <span class="theme-desc">${theme.description}</span>
                    ${isSelected ? '<span class="theme-selected-badge">当前</span>' : ''}
                </div>
            </label>
        `;
    }).join('');
}

/**
 * 获取主题图标 SVG
 * @param {string} iconName - 图标名称
 * @returns {string} SVG 图标
 */
function getThemeIcon(iconName) {
    const icons = {
        moon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
        sun: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></svg>',
        coffee: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b6914" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>',
        zap: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
        leaf: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2d8659" stroke-width="2"><path d="M6.5 21.5C4 19 2 15 2 11c0-4.4 3.6-8 8-8 0 0 8 8 8 8s-8 8-8 8c0 4-2 8-5.5 10.5z"></path></svg>',
        droplet: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0066cc" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>',
        sunset: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff7b54" stroke-width="2"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line></svg>',
        terminal: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ff00" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>'
    };
    return icons[iconName] || icons.moon;
}

/**
 * 获取主题列表
 * @returns {Array} 主题数组
 */
function getThemeList() {
    return Object.values(THEMES);
}

/**
 * 根据ID获取主题
 * @param {string} themeId - 主题ID
 * @returns {Object|null} 主题对象
 */
function getThemeById(themeId) {
    return THEMES[themeId] || null;
}

/**
 * 获取默认主题
 * @returns {Object} 默认主题
 */
function getDefaultTheme() {
    return THEMES.dark;
}

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// 导出（用于Node.js环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { THEMES, ThemeManager, getThemeList, getThemeById, getDefaultTheme };
}
