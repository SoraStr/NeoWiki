/**
 * 认证中间件
 * 
 * 提供用户认证和权限验证功能
 * 
 * @module middleware/auth
 * @version 1.0.0
 */

'use strict';

const db = require('../database');

/**
 * 验证是否已登录
 * 
 * 检查请求会话中是否有有效的用户信息
 * 
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 * 
 * @example
 * router.post('/create', auth.requireAuth, async (req, res) => {
 *     // 只有登录用户才能访问
 * });
 */
async function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: '请先登录',
            error: '未授权'
        });
    }
    next();
}

/**
 * 验证是否为管理员
 * 
 * 检查当前用户是否具有管理员权限
 * 
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 * 
 * @example
 * router.delete('/:id', auth.requireAdmin, async (req, res) => {
 *     // 只有管理员才能访问
 * });
 */
async function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: '请先登录',
            error: '未授权'
        });
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '需要管理员权限',
            error: '权限不足'
        });
    }
    next();
}

/**
 * 验证用户状态
 * 
 * 检查用户账号是否被封禁，并更新会话信息
 * 
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
async function checkUserStatus(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: '请先登录',
            error: '未授权'
        });
    }

    const userId = req.session.user.id;
    const result = await db.query('user', { id: userId });

    if (!result.success || !result.data || result.data.length === 0) {
        req.session.destroy();
        return res.status(401).json({
            success: false,
            message: '用户不存在',
            error: '用户不存在'
        });
    }

    const user = result.data[0];
    if (user.status === 'banned') {
        req.session.destroy();
        return res.status(403).json({
            success: false,
            message: '您的账号已被封禁',
            error: '账号被封禁'
        });
    }

    // 更新会话中的用户信息
    req.session.user = user;
    next();
}

/**
 * 可选的认证中间件
 * 
 * 如果用户已登录，则在请求中添加用户信息；否则继续
 * 
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
function optionalAuth(req, res, next) {
    // 如果有会话用户，将其添加到请求中
    if (req.session && req.session.user) {
        req.user = req.session.user;
    }
    next();
}

// 导出中间件
module.exports = {
    requireAuth,
    requireAdmin,
    checkUserStatus,
    optionalAuth
};
