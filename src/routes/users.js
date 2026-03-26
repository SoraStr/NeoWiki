/**
 * 用户管理 API 路由
 * 
 * 提供用户注册、登录、资料管理、权限管理等功能
 * 
 * @module routes/users
 * @version 1.0.0
 */

'use strict';

const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// ============================================
// 辅助函数
// ============================================

/**
 * 获取用户的所有标签
 * 
 * @async
 * @param {number} userId - 用户 ID
 * @returns {Promise<Array>} 标签数组
 */
async function getUserTags(userId) {
    try {
        const result = await db.query('user_tag', { user_id: userId });
        if (!result.success || !result.data || result.data.length === 0) {
            return [];
        }

        const tags = [];
        for (const relation of result.data) {
            const tagResult = await db.query('user_tag_definition', { id: relation.tag_id });
            if (tagResult.success && tagResult.data && tagResult.data.length > 0) {
                tags.push({
                    ID: tagResult.data[0].id,
                    name: tagResult.data[0].name,
                    description: tagResult.data[0].description,
                    color: tagResult.data[0].color
                });
            }
        }
        return tags;
    } catch (error) {
        console.error('获取用户标签失败:', error);
        return [];
    }
}

/**
 * 更新用户的标签授权
 * 
 * @async
 * @param {number} userId - 用户 ID
 * @param {Array<number>} tagIds - 标签 ID 数组
 * @returns {Promise<boolean>} 是否成功
 */
async function updateUserTags(userId, tagIds) {
    try {
        // 先删除用户原有的标签关联
        await db.remove('user_tag', { user_id: userId });

        // 添加新的标签关联
        for (const tagId of tagIds) {
            await db.insert('user_tag', {
                user_id: userId,
                tag_id: tagId
            });
        }
        return true;
    } catch (error) {
        console.error('更新用户标签失败:', error);
        return false;
    }
}

// ============================================
// 认证相关
// ============================================

/**
 * POST /api/users/register
 * 用户注册
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password, nickname } = req.body;

        // 输入验证
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                success: false,
                message: '用户名长度应在3-20个字符之间'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '密码长度不能少于6位'
            });
        }

        // 检查用户名是否已存在
        const existingUsers = await db.query('user', { username });
        if (existingUsers.success && existingUsers.data && existingUsers.data.length > 0) {
            return res.status(400).json({
                success: false,
                message: '用户名已存在'
            });
        }

        // 加密密码并创建用户
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.insert('user', {
            username,
            password: hashedPassword,
            nickname: nickname || username,
            description: '',
            role: 'user',
            status: 'active',
            tag: '',
            create_date: new Date().toISOString()
        });

        res.json({
            success: true,
            message: '注册成功',
            data: { username }
        });
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({
            success: false,
            message: '注册失败',
            error: error.message
        });
    }
});

/**
 * POST /api/users/login
 * 用户登录
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        // 查询用户
        const result = await db.query('user', { username });
        if (!result.success || !result.data || result.data.length === 0) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        const user = result.data[0];

        // 检查用户状态
        if (user.status === 'banned') {
            return res.status(403).json({
                success: false,
                message: '您的账号已被封禁'
            });
        }

        // 验证密码
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 获取用户标签
        const tags = await getUserTags(user.id);

        // 保存会话
        req.session.user = {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            role: user.role,
            status: user.status,
            description: user.description,
            tag: user.tag,
            tags: tags
        };

        res.json({
            success: true,
            message: '登录成功',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                    role: user.role,
                    description: user.description,
                    tag: user.tag,
                    tags: tags
                }
            }
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({
            success: false,
            message: '登录失败',
            error: error.message
        });
    }
});

/**
 * POST /api/users/logout
 * 用户登出
 */
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({
        success: true,
        message: '登出成功'
    });
});

// ============================================
// 用户资料相关
// ============================================

/**
 * GET /api/users/me
 * 获取当前登录用户信息
 */
router.get('/me', auth.requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const result = await db.query('user', { id: userId });

        if (!result.success || !result.data || result.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const user = result.data[0];
        const tags = await getUserTags(userId);

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                role: user.role,
                description: user.description,
                tag: user.tag,
                create_date: user.create_date,
                tags: tags
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户信息失败',
            error: error.message
        });
    }
});

/**
 * PUT /api/users/me
 * 更新当前用户信息
 */
router.put('/me', auth.requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { nickname, description, tag } = req.body;

        const updateData = {};
        if (nickname !== undefined) updateData.nickname = nickname;
        if (description !== undefined) updateData.description = description;
        if (tag !== undefined) updateData.tag = tag;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有需要更新的字段'
            });
        }

        await db.update('user', updateData, { id: userId });

        // 更新会话
        req.session.user = { ...req.session.user, ...updateData };

        res.json({
            success: true,
            message: '更新成功',
            data: updateData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新失败',
            error: error.message
        });
    }
});

/**
 * PUT /api/users/me/password
 * 修改密码
 */
router.put('/me/password', auth.requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '旧密码和新密码不能为空'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: '新密码长度不能少于6位'
            });
        }

        // 验证旧密码
        const result = await db.query('user', { id: userId });
        if (!result.success || !result.data || result.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const user = result.data[0];
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: '旧密码错误'
            });
        }

        // 更新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update('user', { password: hashedPassword }, { id: userId });

        res.json({
            success: true,
            message: '密码修改成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '修改密码失败',
            error: error.message
        });
    }
});

// ============================================
// 用户查看相关
// ============================================

/**
 * GET /api/users/:id
 * 获取指定用户信息（公开）
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('user', { id });

        if (!result.success || !result.data || result.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        const user = result.data[0];
        const tags = await getUserTags(user.id);

        res.json({
            success: true,
            data: {
                id: user.id,
                nickname: user.nickname,
                description: user.description,
                tag: user.tag,
                create_date: user.create_date,
                role: user.role,
                tags: tags
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户信息失败',
            error: error.message
        });
    }
});

/**
 * GET /api/users
 * 获取所有用户列表（仅管理员）
 */
router.get('/', auth.requireAdmin, async (req, res) => {
    try {
        const result = await db.query('user', {
            orderBy: 'id',
            orderDir: 'DESC'
        });

        const users = [];
        for (const user of result.data) {
            const tags = await getUserTags(user.id);
            users.push({
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                description: user.description,
                role: user.role,
                status: user.status,
                tag: user.tag,
                create_date: user.create_date,
                tags: tags
            });
        }

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户列表失败',
            error: error.message
        });
    }
});

// ============================================
// 管理员操作
// ============================================

/**
 * PUT /api/users/:id/role
 * 修改用户权限（仅管理员）
 */
router.put('/:id/role', auth.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: '无效的角色'
            });
        }

        await db.update('user', { role }, { id });

        res.json({
            success: true,
            message: '权限修改成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '修改权限失败',
            error: error.message
        });
    }
});

/**
 * PUT /api/users/:id/status
 * 封禁/解封用户（仅管理员）
 */
router.put('/:id/status', auth.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'banned'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的状态'
            });
        }

        await db.update('user', { status }, { id });

        res.json({
            success: true,
            message: status === 'banned' ? '用户已封禁' : '用户已解封'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '操作失败',
            error: error.message
        });
    }
});

/**
 * DELETE /api/users/:id
 * 删除用户（仅管理员）
 */
router.delete('/:id', auth.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // 不能删除自己
        if (parseInt(id) === req.session.user.id) {
            return res.status(400).json({
                success: false,
                message: '不能删除自己的账号'
            });
        }

        // 删除用户标签关联
        await db.remove('user_tag', { user_id: id });
        await db.remove('user', { id });

        res.json({
            success: true,
            message: '用户已删除'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除用户失败',
            error: error.message
        });
    }
});

// ============================================
// 用户标签相关
// ============================================

/**
 * GET /api/users/:id/tags
 * 获取用户已授权的标签
 */
router.get('/:id/tags', async (req, res) => {
    try {
        const { id } = req.params;
        const tags = await getUserTags(parseInt(id));
        res.json({
            success: true,
            data: tags
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户标签失败',
            error: error.message
        });
    }
});

/**
 * PUT /api/users/:id/tags
 * 授权用户标签（仅管理员）
 */
router.put('/:id/tags', auth.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { tagIds } = req.body;

        if (!Array.isArray(tagIds)) {
            return res.status(400).json({
                success: false,
                message: '标签ID列表格式错误'
            });
        }

        await updateUserTags(parseInt(id), tagIds);

        res.json({
            success: true,
            message: '用户标签授权成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '授权用户标签失败',
            error: error.message
        });
    }
});

module.exports = router;
