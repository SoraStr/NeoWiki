/**
 * 词条管理 API 路由
 * 
 * 提供词条的增删改查、搜索、历史版本管理等功能
 * 
 * @module routes/articles
 * @version 1.0.0
 */

'use strict';

const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// ============================================
// 辅助函数
// ============================================

/**
 * 获取词条的标签
 * 
 * @async
 * @param {number} articleId - 词条 ID
 * @returns {Promise<Array>} 标签数组
 */
async function getArticleTags(articleId) {
    try {
        const result = await db.query('article_tag', {
            article_id: articleId
        });

        if (!result.success || !result.data || result.data.length === 0) {
            return [];
        }

        const tags = [];
        for (const relation of result.data) {
            const tagResult = await db.query('tag', { ID: relation.tag_id });
            if (tagResult.success && tagResult.data && tagResult.data.length > 0) {
                tags.push({
                    ID: tagResult.data[0].ID,
                    name: tagResult.data[0].name,
                    description: tagResult.data[0].description,
                    color: tagResult.data[0].color
                });
            }
        }
        return tags;
    } catch (error) {
        console.error('获取词条标签失败:', error);
        return [];
    }
}

/**
 * 更新词条的标签
 * 
 * @async
 * @param {number} articleId - 词条 ID
 * @param {Array<number>} tagIds - 标签 ID 数组
 * @returns {Promise<boolean>} 是否成功
 */
async function updateArticleTags(articleId, tagIds) {
    try {
        // 先删除原有的标签关联
        await db.remove('article_tag', { article_id: articleId });

        // 添加新的标签关联
        for (const tagId of tagIds) {
            await db.insert('article_tag', {
                article_id: articleId,
                tag_id: tagId
            });
        }
        return true;
    } catch (error) {
        console.error('更新词条标签失败:', error);
        return false;
    }
}

// ============================================
// 路由定义
// ============================================

/**
 * GET /api/articles
 * 获取所有词条列表
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 20, offset = 0, orderBy = 'ID', orderDir = 'DESC' } = req.query;

        const result = await db.query('articles', {
            orderBy,
            orderDir,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // 为每个词条添加标签
        const articlesWithTags = [];
        for (const article of (result.data || [])) {
            const tags = await getArticleTags(article.ID);
            articlesWithTags.push({ ...article, tags });
        }

        res.json({
            success: true,
            data: articlesWithTags,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取词条列表失败',
            error: error.message
        });
    }
});

/**
 * GET /api/articles/random
 * 随机获取词条
 */
router.get('/random', async (req, res) => {
    try {
        const { count = 1 } = req.query;
        const result = await db.query('articles', {
            orderBy: 'RANDOM()',
            limit: parseInt(count)
        });

        const articlesWithTags = [];
        for (const article of (result.data || [])) {
            const tags = await getArticleTags(article.ID);
            articlesWithTags.push({ ...article, tags });
        }

        res.json({
            success: true,
            data: articlesWithTags
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取随机词条失败',
            error: error.message
        });
    }
});

/**
 * GET /api/articles/search
 * 搜索词条
 */
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 20, offset = 0 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: '搜索关键词不能为空'
            });
        }

        // 同时搜索 title、sketch 和 content 字段
        const [titleResult, sketchResult, contentResult] = await Promise.all([
            db.search('articles', 'title', q, 'contains', {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }),
            db.search('articles', 'sketch', q, 'contains', {
                limit: parseInt(limit),
                offset: 0
            }),
            db.search('articles', 'content', q, 'contains', {
                limit: parseInt(limit),
                offset: 0
            })
        ]);

        // 合并去重结果
        const allResults = new Map();

        if (titleResult.success && titleResult.data) {
            titleResult.data.forEach(item => allResults.set(item.ID, item));
        }

        if (sketchResult.success && sketchResult.data) {
            sketchResult.data.forEach(item => {
                if (!allResults.has(item.ID)) allResults.set(item.ID, item);
            });
        }

        if (contentResult.success && contentResult.data) {
            contentResult.data.forEach(item => {
                if (!allResults.has(item.ID)) allResults.set(item.ID, item);
            });
        }

        // 为每个词条添加标签
        const mergedData = Array.from(allResults.values());
        const articlesWithTags = [];
        for (const article of mergedData) {
            const tags = await getArticleTags(article.ID);
            articlesWithTags.push({ ...article, tags });
        }

        res.json({
            success: true,
            data: articlesWithTags,
            pagination: {
                total: mergedData.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '搜索词条失败',
            error: error.message
        });
    }
});

/**
 * GET /api/articles/by-tag/:tagId
 * 按标签搜索词条
 */
router.get('/by-tag/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const relationResult = await db.query('article_tag', {
            tag_id: parseInt(tagId)
        });

        if (!relationResult.success || !relationResult.data || relationResult.data.length === 0) {
            return res.json({
                success: true,
                data: [],
                pagination: { total: 0, limit: parseInt(limit), offset: parseInt(offset) }
            });
        }

        const articlesWithTags = [];
        for (const relation of relationResult.data) {
            const articleResult = await db.query('articles', { ID: relation.article_id });
            if (articleResult.success && articleResult.data && articleResult.data.length > 0) {
                const tags = await getArticleTags(relation.article_id);
                articlesWithTags.push({ ...articleResult.data[0], tags });
            }
        }

        res.json({
            success: true,
            data: articlesWithTags,
            pagination: {
                total: articlesWithTags.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '按标签搜索词条失败',
            error: error.message
        });
    }
});

/**
 * GET /api/articles/:id
 * 获取单个词条详情
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('articles', { ID: id });

        if (!result.success || !result.data || result.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '词条不存在'
            });
        }

        const article = result.data[0];
        const tags = await getArticleTags(article.ID);

        // 获取作者信息
        let author = null;
        if (article.author_id) {
            const authorResult = await db.query('user', { id: article.author_id });
            if (authorResult.success && authorResult.data && authorResult.data.length > 0) {
                author = {
                    id: authorResult.data[0].id,
                    nickname: authorResult.data[0].nickname,
                    tag: authorResult.data[0].tag
                };
            }
        }

        res.json({
            success: true,
            data: { ...article, tags, author }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取词条详情失败',
            error: error.message
        });
    }
});

/**
 * POST /api/articles
 * 创建词条（需要登录）
 */
router.post('/', auth.requireAuth, async (req, res) => {
    try {
        const { title, content, sketch, tags, cover_image } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: '词条标题不能为空'
            });
        }

        const now = new Date().toISOString();
        const userId = req.session.user.id;

        const result = await db.insert('articles', {
            title,
            content: content || '',
            sketch: sketch || content?.substring(0, 200) || '',
            cover_image: cover_image || '',
            author_id: userId,
            create_date: now,
            update_date: now
        });

        const articleId = result.data?.lastInsertRowid || 1;

        // 保存首次创建记录
        await db.insert('articles-edit', {
            article_id: articleId,
            edit_date: now,
            content: content || '',
            description: '创建词条',
            editor_id: userId
        });

        // 保存标签关联
        if (tags && Array.isArray(tags) && tags.length > 0) {
            await updateArticleTags(articleId, tags);
        }

        res.json({
            success: true,
            message: '词条创建成功',
            data: { id: articleId }
        });
    } catch (error) {
        console.error('创建词条失败:', error);
        res.status(500).json({
            success: false,
            message: '创建词条失败',
            error: error.message
        });
    }
});

/**
 * PUT /api/articles/:id
 * 更新词条（需要登录）
 */
router.put('/:id', auth.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, sketch, description, tags, cover_image } = req.body;

        // 检查词条是否存在
        const existingResult = await db.query('articles', { ID: id });
        if (!existingResult.success || !existingResult.data || existingResult.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '词条不存在'
            });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (sketch !== undefined) updateData.sketch = sketch;
        if (cover_image !== undefined) updateData.cover_image = cover_image;
        updateData.update_date = new Date().toISOString();

        await db.update('articles', updateData, { ID: id });

        // 保存编辑记录
        await db.insert('articles-edit', {
            article_id: id,
            edit_date: updateData.update_date,
            content: content || '',
            description: description || '更新词条',
            editor_id: req.session.user.id
        });

        // 更新标签关联
        if (tags !== undefined) {
            await updateArticleTags(id, tags || []);
        }

        res.json({
            success: true,
            message: '词条更新成功'
        });
    } catch (error) {
        console.error('更新词条失败:', error);
        res.status(500).json({
            success: false,
            message: '更新词条失败',
            error: error.message
        });
    }
});

/**
 * DELETE /api/articles/:id
 * 删除词条（仅管理员）
 */
router.delete('/:id', auth.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // 删除词条标签关联
        try {
            await db.remove('article_tag', { article_id: id });
        } catch (e) { /* 忽略错误 */ }

        // 删除相关的编辑记录
        try {
            await db.remove('articles-edit', { article_id: id });
        } catch (e) { /* 忽略错误 */ }

        // 删除词条
        await db.remove('articles', { ID: id });

        res.json({
            success: true,
            message: '词条已删除'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除词条失败',
            error: error.message
        });
    }
});

/**
 * GET /api/articles/:id/history
 * 获取词条编辑记录
 */
router.get('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query('articles-edit', {
            article_id: id,
            orderBy: 'edit_date',
            orderDir: 'DESC'
        });

        // 获取编辑者信息
        const history = [];
        for (const record of (result.data || [])) {
            let editor = null;
            if (record.editor_id) {
                const editorResult = await db.query('user', { id: record.editor_id });
                if (editorResult.success && editorResult.data && editorResult.data.length > 0) {
                    editor = {
                        id: editorResult.data[0].id,
                        nickname: editorResult.data[0].nickname
                    };
                }
            }
            history.push({ ...record, editor });
        }

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取编辑记录失败',
            error: error.message
        });
    }
});

/**
 * POST /api/articles/:id/rollback
 * 回退词条到指定版本（需要登录）
 */
router.post('/:id/rollback', auth.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { editId } = req.body;

        if (!editId) {
            return res.status(400).json({
                success: false,
                message: '编辑记录ID不能为空'
            });
        }

        const editResult = await db.query('articles-edit', { ID: editId });
        if (!editResult.success || !editResult.data || editResult.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '编辑记录不存在'
            });
        }

        const editRecord = editResult.data[0];
        const now = new Date().toISOString();

        // 更新词条内容
        await db.update('articles', {
            content: editRecord.content,
            update_date: now
        }, { ID: id });

        // 保存回退记录
        await db.insert('articles-edit', {
            article_id: id,
            edit_date: now,
            content: editRecord.content,
            description: `回退到 ${editRecord.edit_date} 的版本`,
            editor_id: req.session.user.id
        });

        res.json({
            success: true,
            message: '词条已回退成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '回退失败',
            error: error.message
        });
    }
});

/**
 * GET /api/articles/edit/:editId
 * 获取指定编辑记录详情
 */
router.get('/edit/:editId', async (req, res) => {
    try {
        const { editId } = req.params;

        const result = await db.query('articles-edit', { ID: editId });
        if (!result.success || !result.data || result.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: '编辑记录不存在'
            });
        }

        res.json({
            success: true,
            data: result.data[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取编辑记录失败',
            error: error.message
        });
    }
});

module.exports = router;
