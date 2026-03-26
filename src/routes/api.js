/**
 * 通用 API 路由
 * 
 * 提供标签管理、站点设置、图片上传等通用功能
 * 
 * @module routes/api
 * @version 1.0.0
 */

'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const db = require('../database');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// 导入配置
const { uploadConfig } = require('../config');

// ============================================
// Multer 配置
// ============================================

/**
 * 磁盘存储配置
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

/**
 * Multer 上传中间件
 */
const upload = multer({
    storage: storage,
    limits: { fileSize: uploadConfig.maxFileSize }
});

// 确保上传目录存在
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ============================================
// 辅助函数
// ============================================

/**
 * 获取完整 URL 的基础地址
 * 
 * @param {Object} req - Express 请求对象
 * @returns {string} 基础 URL
 */
const getBaseUrl = (req) => {
    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:3001';
    return `${protocol}://${host}`;
};

// ============================================
// 标签管理 API
// ============================================

/**
 * GET /api/article-tags
 * 获取所有词条标签
 */
router.get('/article-tags', async (req, res) => {
    try {
        const result = await db.query('tag', {
            orderBy: 'ID',
            orderDir: 'ASC'
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取标签失败',
            error: error.message
        });
    }
});

/**
 * POST /api/article-tags
 * 创建词条标签（需要管理员权限）
 */
router.post('/article-tags', async (req, res) => {
    try {
        const { name, description, color } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: '标签名称不能为空'
            });
        }
        const result = await db.insert('tag', {
            name,
            description: description || '',
            color: color || '#808080'
        });
        res.json({
            success: true,
            message: '标签创建成功',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '创建标签失败',
            error: error.message
        });
    }
});

/**
 * DELETE /api/article-tags/:id
 * 删除词条标签（需要管理员权限）
 */
router.delete('/article-tags/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // 先删除关联
        await db.remove('article_tag', { tag_id: id });
        // 删除标签
        const result = await db.remove('tag', { ID: id });
        res.json({
            success: true,
            message: '标签删除成功',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除标签失败',
            error: error.message
        });
    }
});

// ============================================
// 用户标签 API
// ============================================

/**
 * GET /api/user-tags
 * 获取用户标签列表
 */
router.get('/user-tags', async (req, res) => {
    try {
        const result = await db.query('user_tag_definition', {
            orderBy: 'ID',
            orderDir: 'ASC'
        });
        res.json(result);
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});

/**
 * POST /api/user-tags
 * 创建用户标签（需要管理员权限）
 */
router.post('/user-tags', auth.requireAdmin, async (req, res) => {
    try {
        const { name, description, color } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: '标签名称不能为空'
            });
        }
        const result = await db.insert('user_tag_definition', {
            name,
            description: description || '',
            color: color || '#808080'
        });
        res.json({
            success: true,
            message: '用户标签创建成功',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '创建用户标签失败',
            error: error.message
        });
    }
});

/**
 * DELETE /api/user-tags/:id
 * 删除用户标签（需要管理员权限）
 */
router.delete('/user-tags/:id', auth.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // 先删除关联
        await db.remove('user_tag', { tag_id: id });
        // 删除标签定义
        const result = await db.remove('user_tag_definition', { ID: id });
        res.json({
            success: true,
            message: '用户标签删除成功',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除用户标签失败',
            error: error.message
        });
    }
});

// ============================================
// 站点设置 API
// ============================================

/**
 * GET /api/settings
 * 获取所有站点设置
 */
router.get('/settings', async (req, res) => {
    try {
        const result = await db.query('site_settings');
        const settings = {};
        if (result.success && result.data) {
            result.data.forEach(row => {
                settings[row.key] = row.value;
            });
        }
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.json({
            success: true,
            data: {}
        });
    }
});

/**
 * GET /api/settings/:key
 * 获取单个站点设置
 */
router.get('/settings/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const result = await db.query('site_settings', { key });
        if (result.success && result.data && result.data.length > 0) {
            res.json({
                success: true,
                data: result.data[0].value
            });
        } else {
            res.json({
                success: true,
                data: null
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取设置失败',
            error: error.message
        });
    }
});

/**
 * PUT /api/settings/:key
 * 更新站点设置（需要管理员权限）
 */
router.put('/settings/:key', auth.requireAdmin, async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        // 检查是否存在
        const existing = await db.query('site_settings', { key });
        if (existing.success && existing.data && existing.data.length > 0) {
            await db.update('site_settings', { value }, { key });
        } else {
            await db.insert('site_settings', { key, value });
        }

        res.json({
            success: true,
            message: '设置更新成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新设置失败',
            error: error.message
        });
    }
});

// ============================================
// 统计 API
// ============================================

/**
 * GET /api/stats
 * 获取统计数据
 */
router.get('/stats', async (req, res) => {
    try {
        const articlesResult = await db.query('articles');
        const usersResult = await db.query('user');

        res.json({
            success: true,
            data: {
                articleCount: articlesResult.data?.length || 0,
                userCount: usersResult.data?.length || 0,
                activeUserCount: usersResult.data?.filter(u => u.status === 'active').length || 0
            }
        });
    } catch (error) {
        res.json({
            success: true,
            data: {
                articleCount: 0,
                userCount: 0,
                activeUserCount: 0
            }
        });
    }
});

// ============================================
// 图片管理 API
// ============================================

/**
 * POST /api/images/upload
 * 上传图片（需要登录）
 */
router.post('/images/upload', upload.single('image'), auth.requireAuth, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请选择要上传的图片'
            });
        }

        const image = req.file;
        const userId = req.session.user.id;
        const baseUrl = getBaseUrl(req);

        // 验证文件类型
        if (!uploadConfig.allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({
                success: false,
                message: `仅支持 ${uploadConfig.allowedTypes.join('、')} 格式的图片`
            });
        }

        // 验证文件大小
        if (image.size > uploadConfig.maxFileSize) {
            return res.status(400).json({
                success: false,
                message: `图片大小不能超过 ${uploadConfig.maxFileSize / 1024 / 1024}MB`
            });
        }

        // 生成文件名和 URL
        const filename = image.filename;
        const relativeUrl = `/uploads/${filename}`;
        const fullUrl = `${baseUrl}${relativeUrl}`;

        // 保存到数据库
        const result = await db.insert('wiki_images', {
            filename: filename,
            original_name: image.originalname,
            url: fullUrl,
            size: image.size,
            mime_type: image.mimetype,
            uploader_id: userId,
            create_date: new Date().toISOString()
        });

        res.json({
            success: true,
            message: '图片上传成功',
            data: {
                id: result.data?.id || result.data?.ID,
                url: fullUrl,
                filename: filename,
                originalName: image.originalname,
                size: image.size
            }
        });
    } catch (error) {
        console.error('图片上传失败:', error);
        res.status(500).json({
            success: false,
            message: '图片上传失败',
            error: error.message
        });
    }
});

/**
 * GET /api/images
 * 获取用户的图片列表
 */
router.get('/images', auth.requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const baseUrl = getBaseUrl(req);

        const result = await db.query('wiki_images', {
            uploader_id: userId,
            orderBy: 'id',
            orderDir: 'DESC',
            limit: limit,
            offset: offset
        });

        // 确保 URL 是完整的
        const images = (result.data || []).map(img => {
            if (img.url && !img.url.startsWith('http')) {
                img.url = `${baseUrl}${img.url}`;
            }
            return img;
        });

        res.json({
            success: true,
            data: images,
            pagination: {
                limit,
                offset,
                total: images.length
            }
        });
    } catch (error) {
        console.error('获取图片列表失败:', error);
        res.json({
            success: true,
            data: [],
            pagination: { limit: 20, offset: 0, total: 0 }
        });
    }
});

/**
 * GET /api/images/all
 * 获取所有图片（管理员）
 */
router.get('/images/all', auth.requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const baseUrl = getBaseUrl(req);

        const result = await db.query('wiki_images', {
            orderBy: 'id',
            orderDir: 'DESC',
            limit: limit,
            offset: offset
        });

        // 确保 URL 是完整的
        const images = (result.data || []).map(img => {
            if (img.url && !img.url.startsWith('http')) {
                img.url = `${baseUrl}${img.url}`;
            }
            return img;
        });

        res.json({
            success: true,
            data: images,
            pagination: {
                limit,
                offset,
                total: images.length
            }
        });
    } catch (error) {
        res.json({
            success: true,
            data: []
        });
    }
});

/**
 * DELETE /api/images/:id
 * 删除图片
 */
router.delete('/images/:id', auth.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.id;
        const userRole = req.session.user.role;

        // 获取图片信息
        const imgResult = await db.query('wiki_images', { ID: id });
        if (!imgResult.success || !imgResult.data || imgResult.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '图片不存在'
            });
        }

        const image = imgResult.data[0];

        // 检查权限（只能删除自己的图片，除非是管理员）
        if (image.uploader_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '无权删除此图片'
            });
        }

        // 删除文件
        const filepath = path.join(UPLOAD_DIR, image.filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        // 删除数据库记录
        await db.remove('wiki_images', { ID: id });

        res.json({
            success: true,
            message: '图片删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除图片失败',
            error: error.message
        });
    }
});

module.exports = router;
