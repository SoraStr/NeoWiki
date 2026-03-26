/**
 * Wiki 百科网站 - API 请求模块
 * 
 * 封装所有与后端的 API 通信，提供统一的数据交互接口
 * 
 * @module API
 * @version 1.0.0
 */

'use strict';

/**
 * API 主对象
 * 提供所有 API 调用方法
 */
const API = {
    // API 地址，可通过环境变量或本地配置修改
    baseUrl: (window.API_BASE_URL) || '/api',

    // ============================================
    // 用户状态管理
    // ============================================

    /**
     * 获取当前登录用户
     * 
     * @returns {Object|null} 用户对象或 null
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('wiki_user');
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    },

    /**
     * 保存用户信息到本地存储
     * 
     * @param {Object} user - 用户对象
     */
    setCurrentUser(user) {
        localStorage.setItem('wiki_user', JSON.stringify(user));
    },

    /**
     * 清除本地存储的用户信息
     */
    clearCurrentUser() {
        localStorage.removeItem('wiki_user');
    },

    // ============================================
    // 通用请求方法
    // ============================================

    /**
     * 发送 API 请求
     * 
     * @async
     * @param {string} endpoint - API 端点
     * @param {Object} [options={}] - 请求选项
     * @param {string} [options.method='GET'] - HTTP 方法
     * @param {Object} [options.body] - 请求体
     * @param {Object} [options.headers] - 额外请求头
     * @returns {Promise<Object>} API 响应数据
     * @throws {Error} 请求失败时抛出错误
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const method = options.method || 'GET';
        const body = options.body ? JSON.stringify(options.body) : undefined;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body,
                credentials: 'include'
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API请求失败 [${method}] ${endpoint}:`, error);
            throw error;
        }
    },

    // ============================================
    // 认证相关
    // ============================================

    /**
     * 用户注册
     * 
     * @async
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @param {string} [nickname] - 昵称（可选）
     * @returns {Promise<Object>} 注册结果
     */
    async register(username, password, nickname) {
        const result = await this.request('/users/register', {
            method: 'POST',
            body: { username, password, nickname }
        });
        return result;
    },

    /**
     * 用户登录
     * 
     * @async
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<Object>} 登录结果，包含用户信息
     */
    async login(username, password) {
        const result = await this.request('/users/login', {
            method: 'POST',
            body: { username, password }
        });
        if (result.success && result.data && result.data.user) {
            this.setCurrentUser(result.data.user);
        }
        return result;
    },

    /**
     * 用户登出
     * 
     * @async
     * @returns {Promise<Object>} 登出结果
     */
    async logout() {
        const result = await this.request('/users/logout', {
            method: 'POST'
        });
        this.clearCurrentUser();
        return result;
    },

    /**
     * 获取当前用户信息
     * 
     * @async
     * @returns {Promise<Object>} 用户信息
     */
    async getMe() {
        return await this.request('/users/me');
    },

    /**
     * 更新当前用户信息
     * 
     * @async
     * @param {Object} data - 要更新的数据 { nickname?, description?, tag? }
     * @returns {Promise<Object>} 更新结果
     */
    async updateMe(data) {
        return await this.request('/users/me', {
            method: 'PUT',
            body: data
        });
    },

    /**
     * 修改密码
     * 
     * @async
     * @param {string} oldPassword - 旧密码
     * @param {string} newPassword - 新密码
     * @returns {Promise<Object>} 修改结果
     */
    async changePassword(oldPassword, newPassword) {
        return await this.request('/users/me/password', {
            method: 'PUT',
            body: { oldPassword, newPassword }
        });
    },

    // ============================================
    // 用户相关
    // ============================================

    /**
     * 获取指定用户信息
     * 
     * @async
     * @param {number} id - 用户 ID
     * @returns {Promise<Object>} 用户信息
     */
    async getUser(id) {
        return await this.request(`/users/${id}`);
    },

    /**
     * 获取所有用户列表（需要管理员权限）
     * 
     * @async
     * @returns {Promise<Object>} 用户列表
     */
    async getAllUsers() {
        return await this.request('/users');
    },

    /**
     * 修改用户角色（需要管理员权限）
     * 
     * @async
     * @param {number} id - 用户 ID
     * @param {string} role - 角色 (user/admin)
     * @returns {Promise<Object>} 修改结果
     */
    async updateUserRole(id, role) {
        return await this.request(`/users/${id}/role`, {
            method: 'PUT',
            body: { role }
        });
    },

    /**
     * 修改用户状态（需要管理员权限）
     * 
     * @async
     * @param {number} id - 用户 ID
     * @param {string} status - 状态 (active/banned)
     * @returns {Promise<Object>} 修改结果
     */
    async updateUserStatus(id, status) {
        return await this.request(`/users/${id}/status`, {
            method: 'PUT',
            body: { status }
        });
    },

    /**
     * 删除用户（需要管理员权限）
     * 
     * @async
     * @param {number} id - 用户 ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    },

    // ============================================
    // 词条相关
    // ============================================

    /**
     * 获取词条列表
     * 
     * @async
     * @param {Object} [params={}] - 查询参数
     * @param {number} [params.limit=20] - 每页数量
     * @param {number} [params.offset=0] - 偏移量
     * @param {string} [params.orderBy='ID'] - 排序字段
     * @param {string} [params.orderDir='DESC'] - 排序方向
     * @returns {Promise<Object>} 词条列表和分页信息
     */
    async getArticles(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await this.request(`/articles${query ? '?' + query : ''}`);
    },

    /**
     * 获取随机词条
     * 
     * @async
     * @param {number} [count=1] - 获取数量
     * @returns {Promise<Object>} 随机词条列表
     */
    async getRandomArticles(count = 1) {
        return await this.request(`/articles/random?count=${count}`);
    },

    /**
     * 搜索词条
     * 
     * @async
     * @param {string} keyword - 搜索关键词
     * @param {number} [limit=20] - 每页数量
     * @param {number} [offset=0] - 偏移量
     * @returns {Promise<Object>} 搜索结果
     */
    async searchArticles(keyword, limit = 20, offset = 0) {
        return await this.request(`/articles/search?q=${encodeURIComponent(keyword)}&limit=${limit}&offset=${offset}`);
    },

    /**
     * 获取词条详情
     * 
     * @async
     * @param {number} id - 词条 ID
     * @returns {Promise<Object>} 词条详情
     */
    async getArticle(id) {
        return await this.request(`/articles/${id}`);
    },

    /**
     * 创建词条
     * 
     * @async
     * @param {string} title - 标题
     * @param {string} content - Markdown 内容
     * @param {string} [sketch] - 摘要
     * @param {Array<number>} [tags=[]] - 标签 ID 数组
     * @param {string} [coverImage] - 封面图片 URL
     * @returns {Promise<Object>} 创建结果
     */
    async createArticle(title, content, sketch, tags = [], coverImage = '') {
        return await this.request('/articles', {
            method: 'POST',
            body: { title, content, sketch, tags, cover_image: coverImage }
        });
    },

    /**
     * 更新词条
     * 
     * @async
     * @param {number} id - 词条 ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    async updateArticle(id, data) {
        return await this.request(`/articles/${id}`, {
            method: 'PUT',
            body: data
        });
    },

    /**
     * 删除词条（需要管理员权限）
     * 
     * @async
     * @param {number} id - 词条 ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteArticle(id) {
        return await this.request(`/articles/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * 获取词条编辑历史
     * 
     * @async
     * @param {number} id - 词条 ID
     * @returns {Promise<Object>} 编辑历史列表
     */
    async getArticleHistory(id) {
        return await this.request(`/articles/${id}/history`);
    },

    /**
     * 回退词条到指定版本
     * 
     * @async
     * @param {number} id - 词条 ID
     * @param {number} editId - 编辑记录 ID
     * @returns {Promise<Object>} 回退结果
     */
    async rollbackArticle(id, editId) {
        return await this.request(`/articles/${id}/rollback`, {
            method: 'POST',
            body: { editId }
        });
    },

    // ============================================
    // 标签相关
    // ============================================

    /**
     * 按标签获取词条
     * 
     * @async
     * @param {number} tagId - 标签 ID
     * @param {number} [limit=20] - 每页数量
     * @param {number} [offset=0] - 偏移量
     * @returns {Promise<Object>} 词条列表
     */
    async getArticlesByTag(tagId, limit = 20, offset = 0) {
        return await this.request(`/articles/by-tag/${tagId}?limit=${limit}&offset=${offset}`);
    },

    /**
     * 获取所有词条标签
     * 
     * @async
     * @returns {Promise<Object>} 标签列表
     */
    async getArticleTags() {
        return await this.request('/article-tags');
    },

    /**
     * 创建词条标签（需要管理员权限）
     * 
     * @async
     * @param {string} name - 标签名称
     * @param {string} [description] - 标签描述
     * @param {string} [color] - 标签颜色
     * @returns {Promise<Object>} 创建结果
     */
    async createArticleTag(name, description, color) {
        return await this.request('/article-tags', {
            method: 'POST',
            body: { name, description, color }
        });
    },

    /**
     * 删除词条标签（需要管理员权限）
     * 
     * @async
     * @param {number} id - 标签 ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteArticleTag(id) {
        return await this.request(`/article-tags/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * 获取所有用户标签
     * 
     * @async
     * @returns {Promise<Object>} 用户标签列表
     */
    async getUserTags() {
        return await this.request('/user-tags');
    },

    /**
     * 创建用户标签（需要管理员权限）
     * 
     * @async
     * @param {string} name - 标签名称
     * @param {string} [description] - 标签描述
     * @param {string} [color] - 标签颜色
     * @returns {Promise<Object>} 创建结果
     */
    async createUserTag(name, description, color) {
        return await this.request('/user-tags', {
            method: 'POST',
            body: { name, description, color }
        });
    },

    /**
     * 删除用户标签（需要管理员权限）
     * 
     * @async
     * @param {number} id - 标签 ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteUserTag(id) {
        return await this.request(`/user-tags/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * 获取指定用户的标签
     * 
     * @async
     * @param {number} userId - 用户 ID
     * @returns {Promise<Object>} 用户标签列表
     */
    async getUserTagsById(userId) {
        return await this.request(`/users/${userId}/tags`);
    },

    /**
     * 授权用户标签（需要管理员权限）
     * 
     * @async
     * @param {number} userId - 用户 ID
     * @param {Array<number>} tagIds - 标签 ID 数组
     * @returns {Promise<Object>} 授权结果
     */
    async setUserTags(userId, tagIds) {
        return await this.request(`/users/${userId}/tags`, {
            method: 'PUT',
            body: { tagIds }
        });
    },

    // ============================================
    // 站点设置相关
    // ============================================

    /**
     * 获取所有站点设置
     * 
     * @async
     * @returns {Promise<Object>} 站点设置对象
     */
    async getSiteSettings() {
        return await this.request('/settings');
    },

    /**
     * 获取单个站点设置
     * 
     * @async
     * @param {string} key - 设置键名
     * @returns {Promise<Object>} 设置值
     */
    async getSiteSetting(key) {
        return await this.request(`/settings/${key}`);
    },

    /**
     * 更新站点设置（需要管理员权限）
     * 
     * @async
     * @param {string} key - 设置键名
     * @param {*} value - 设置值
     * @returns {Promise<Object>} 更新结果
     */
    async updateSiteSetting(key, value) {
        return await this.request(`/settings/${key}`, {
            method: 'PUT',
            body: { value }
        });
    },

    // ============================================
    // 统计相关
    // ============================================

    /**
     * 获取站点统计数据
     * 
     * @async
     * @returns {Promise<Object>} 统计数据 { articleCount, userCount, activeUserCount }
     */
    async getStats() {
        return await this.request('/stats');
    },

    // ============================================
    // 图片上传相关
    // ============================================

    /**
     * 上传图片
     * 
     * @async
     * @param {File} file - 图片文件
     * @returns {Promise<Object>} 上传结果，包含图片 URL
     */
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${this.baseUrl}/images/upload`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeader()
                },
                body: formData,
                credentials: 'include'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('图片上传失败:', error);
            throw error;
        }
    },

    /**
     * 获取当前用户的图片列表
     * 
     * @async
     * @param {number} [limit=20] - 每页数量
     * @param {number} [offset=0] - 偏移量
     * @returns {Promise<Object>} 图片列表
     */
    async getMyImages(limit = 20, offset = 0) {
        return await this.request(`/images?limit=${limit}&offset=${offset}`);
    },

    /**
     * 获取所有图片（需要管理员权限）
     * 
     * @async
     * @param {number} [limit=50] - 每页数量
     * @param {number} [offset=0] - 偏移量
     * @returns {Promise<Object>} 图片列表
     */
    async getAllImages(limit = 50, offset = 0) {
        return await this.request(`/images/all?limit=${limit}&offset=${offset}`);
    },

    /**
     * 删除图片
     * 
     * @async
     * @param {number} id - 图片 ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteImage(id) {
        return await this.request(`/images/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * 获取认证头
     * 
     * @returns {Object} 认证头对象
     */
    getAuthHeader() {
        const user = this.getCurrentUser();
        if (user && user.token) {
            return { 'Authorization': `Bearer ${user.token}` };
        }
        return {};
    }
};

// 导出 API 对象
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
