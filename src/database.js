/**
 * 数据库操作模块
 * 
 * 封装对外部数据库 API 的调用，提供统一的数据库操作接口
 * 
 * @module database
 * @version 1.0.0
 */

'use strict';

// 导入配置
const { dbConfig } = require('./config');

// API 配置
const API_BASE = dbConfig.apiUrl;
const TOKEN = dbConfig.token;

/**
 * 发送 API 请求
 * 
 * @async
 * @param {string} endpoint - API 端点
 * @param {Object} options - 请求选项
 * @param {string} [options.method='GET'] - HTTP 方法
 * @param {Object} [options.body] - 请求体
 * @param {Object} [options.headers] - 额外请求头
 * @param {Object} [options.fetchOptions] - fetch 额外选项
 * @returns {Promise<Object>} API 响应数据
 * @throws {Error} API 请求失败时抛出错误
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : undefined;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            body,
            ...options.fetchOptions
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API请求失败 [${method}] ${endpoint}:`, error);
        throw error;
    }
}

/**
 * 构建查询参数字符串
 * 
 * @param {Object} params - 查询参数
 * @returns {string} URL 查询参数字符串
 */
function buildQueryString(params) {
    const queryParams = new URLSearchParams();

    // 已知参数
    const knownParams = ['columns', 'orderBy', 'orderDir', 'limit', 'offset'];
    
    if (params.columns) queryParams.append('columns', params.columns);
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params.orderDir) queryParams.append('orderDir', params.orderDir);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    // 添加筛选条件
    for (const [key, value] of Object.entries(params)) {
        if (!knownParams.includes(key)) {
            queryParams.append(key, value);
        }
    }

    const queryString = queryParams.toString();
    return queryString ? '?' + queryString : '';
}

/**
 * 查询数据
 * 
 * @async
 * @param {string} table - 表名
 * @param {Object} [params={}] - 查询参数
 * @param {string} [params.columns] - 返回的列
 * @param {string} [params.orderBy] - 排序字段
 * @param {string} [params.orderDir] - 排序方向 (ASC/DESC)
 * @param {number} [params.limit] - 返回记录数限制
 * @param {number} [params.offset] - 偏移量
 * @returns {Promise<Object>} 查询结果 { success, data, pagination? }
 * 
 * @example
 * // 查询所有用户
 * const result = await db.query('user');
 * 
 * // 按条件查询
 * const result = await db.query('articles', { 
 *   author_id: 1, 
 *   limit: 10, 
 *   orderBy: 'create_date',
 *   orderDir: 'DESC'
 * });
 */
async function query(table, params = {}) {
    try {
        const queryString = buildQueryString(params);
        const endpoint = `/data/${table}${queryString}`;
        return await request(endpoint);
    } catch (error) {
        console.error(`查询表 ${table} 失败:`, error);
        return { success: false, error: error.message, data: [] };
    }
}

/**
 * 插入数据
 * 
 * @async
 * @param {string} table - 表名
 * @param {Object} columns - 要插入的列和值
 * @returns {Promise<Object>} 插入结果
 * 
 * @example
 * await db.insert('user', {
 *   username: 'test',
 *   password: 'hashed_password',
 *   nickname: '测试用户'
 * });
 */
async function insert(table, columns) {
    return await request(`/data/${table}/insert`, {
        method: 'POST',
        body: { columns }
    });
}

/**
 * 更新数据
 * 
 * @async
 * @param {string} table - 表名
 * @param {Object} data - 要更新的数据
 * @param {Object} where - 更新条件
 * @returns {Promise<Object>} 更新结果
 * 
 * @example
 * await db.update('user', 
 *   { nickname: '新昵称' }, 
 *   { id: 1 }
 * );
 */
async function update(table, data, where) {
    return await request(`/data/${table}/update`, {
        method: 'PUT',
        body: { data, where }
    });
}

/**
 * 删除数据
 * 
 * @async
 * @param {string} table - 表名
 * @param {Object} where - 删除条件
 * @returns {Promise<Object>} 删除结果
 * 
 * @example
 * await db.remove('user', { id: 1 });
 */
async function remove(table, where) {
    const queryParams = new URLSearchParams(where);
    return await request(`/data/${table}?${queryParams}`, {
        method: 'DELETE'
    });
}

/**
 * 创建表
 * 
 * @async
 * @param {string} tableName - 表名
 * @param {Array<Object>} columns - 列定义
 * @returns {Promise<Object>} 创建结果
 * 
 * @example
 * await db.createTable('new_table', [
 *   { name: 'id', type: 'INTEGER', primary_key: true, auto_increment: true },
 *   { name: 'name', type: 'TEXT' }
 * ]);
 */
async function createTable(tableName, columns) {
    try {
        // 先检查表是否存在
        const existingTables = await request('/tables');
        if (existingTables.success && existingTables.data && existingTables.data.includes(tableName)) {
            return { success: true, message: `表 ${tableName} 已存在` };
        }

        return await request('/tables', {
            method: 'POST',
            body: { name: tableName, columns }
        });
    } catch (error) {
        // 如果是表已存在的错误，忽略
        if (error.message && error.message.includes('already exists')) {
            return { success: true, message: `表 ${tableName} 已存在` };
        }
        throw error;
    }
}

/**
 * 创建表（如果不存在）- 内部使用
 * 
 * @async
 * @param {string} tableName - 表名
 * @param {Array<Object>} columns - 列定义
 * @returns {Promise<Object>} 创建结果
 */
async function createTableIfNotExists(tableName, columns) {
    return await createTable(tableName, columns);
}

/**
 * 删除表
 * 
 * @async
 * @param {string} tableName - 表名
 * @returns {Promise<Object>} 删除结果
 */
async function dropTable(tableName) {
    return await request(`/tables/${tableName}`, {
        method: 'DELETE'
    });
}

/**
 * 获取表结构
 * 
 * @async
 * @param {string} tableName - 表名
 * @returns {Promise<Object>} 表结构信息
 */
async function getTableSchema(tableName) {
    return await request(`/tables/${tableName}`);
}

/**
 * 批量插入
 * 
 * @async
 * @param {string} table - 表名
 * @param {Array<Object>} rows - 要插入的行数组
 * @returns {Promise<Object>} 插入结果
 * 
 * @example
 * await db.insertBatch('user', [
 *   { username: 'user1', password: 'hash1' },
 *   { username: 'user2', password: 'hash2' }
 * ]);
 */
async function insertBatch(table, rows) {
    return await request(`/data/${table}/insert-batch`, {
        method: 'POST',
        body: { rows }
    });
}

/**
 * 搜索数据 - 使用模糊搜索
 * 
 * @async
 * @param {string} table - 表名
 * @param {string} searchField - 搜索字段名
 * @param {string} keyword - 搜索关键词
 * @param {string} [mode='contains'] - 搜索模式: contains, prefix, suffix, exact
 * @param {Object} [additionalParams={}] - 其他查询参数
 * @returns {Promise<Object>} 搜索结果
 * 
 * @example
 * // 模糊搜索标题
 * const results = await db.search('articles', 'title', 'JavaScript');
 * 
 * // 前缀搜索
 * const results = await db.search('articles', 'title', 'Python', 'prefix');
 */
async function search(table, searchField, keyword, mode = 'contains', additionalParams = {}) {
    const likeParam = `${mode === 'contains' ? '' : mode + ':'}${keyword}`;
    const params = {
        [`like_${searchField}`]: likeParam,
        ...additionalParams
    };
    return await query(table, params);
}

/**
 * 统计表中记录数
 * 
 * @async
 * @param {string} table - 表名
 * @param {Object} [where={}] - 筛选条件
 * @returns {Promise<number>} 记录数
 */
async function count(table, where = {}) {
    try {
        const result = await query(table, where);
        return result.success && result.data ? result.data.length : 0;
    } catch (error) {
        console.error(`统计表 ${table} 失败:`, error);
        return 0;
    }
}

/**
 * 检查记录是否存在
 * 
 * @async
 * @param {string} table - 表名
 * @param {Object} where - 筛选条件
 * @returns {Promise<boolean>} 是否存在
 */
async function exists(table, where) {
    try {
        const result = await query(table, where);
        return result.success && result.data && result.data.length > 0;
    } catch (error) {
        return false;
    }
}

// 导出模块
module.exports = {
    request,
    query,
    insert,
    update,
    remove,
    createTable,
    createTableIfNotExists,
    dropTable,
    getTableSchema,
    insertBatch,
    search,
    count,
    exists
};
