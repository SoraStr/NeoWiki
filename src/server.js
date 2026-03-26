/**
 * Wiki 百科网站 - 主服务器入口
 * 
 * 基于 Express.js 的百科网站后端服务
 * 
 * @module server
 * @version 1.0.0
 */

'use strict';

// 加载环境变量
require('dotenv').config();

// 导入配置
const { 
    serverConfig, 
    uploadConfig, 
    tableDefinitions, 
    defaultTags 
} = require('./config');

// 导入依赖
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');

// 导入模块
const db = require('./database');
const authMiddleware = require('./middleware/auth');
const apiRouter = require('./routes/api');
const articleRouter = require('./routes/articles');
const userRouter = require('./routes/users');

// 创建 Express 应用
const app = express();
const PORT = serverConfig.port;

// ============================================
// 中间件配置
// ============================================

/**
 * CORS 配置
 */
app.use(cors({
    origin: serverConfig.corsOrigin,
    credentials: true
}));

/**
 * 请求体解析
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Session 配置
 */
app.use(session({
    secret: serverConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: serverConfig.sessionMaxAge,
        httpOnly: true,
        secure: serverConfig.forceHttps
    }
}));

// ============================================
// 静态文件服务
// ============================================

// 确保上传目录存在
const uploadDir = path.resolve(__dirname, '..', uploadConfig.uploadDir);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// Multer 文件上传配置
// ============================================

/**
 * 磁盘存储配置
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
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
    limits: {
        fileSize: uploadConfig.maxFileSize
    },
    fileFilter: (req, file, cb) => {
        if (uploadConfig.allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`仅支持 ${uploadConfig.allowedTypes.join('、')} 格式的图片`));
        }
    }
});

// 导出 upload 供路由使用
app.set('upload', upload);
app.set('uploadConfig', uploadConfig);

// ============================================
// API 路由
// ============================================

app.use('/api', apiRouter);
app.use('/api/articles', articleRouter);
app.use('/api/users', userRouter);

// 认证中间件
app.use('/api/protected', authMiddleware.requireAuth);

// ============================================
// 健康检查
// ============================================

/**
 * 健康检查端点
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'running',
        message: 'Wiki百科网站服务运行正常',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// 初始化相关接口
// ============================================

/**
 * 检查系统初始化状态
 */
app.get('/api/init-status', async (req, res) => {
    try {
        const result = await db.query('user');
        const isInitialized = result.success && result.data && result.data.length > 0;
        res.json({
            success: true,
            initialized: isInitialized,
            message: isInitialized ? '系统已初始化' : '系统需要初始化'
        });
    } catch (error) {
        res.json({
            success: true,
            initialized: false,
            message: '系统需要初始化'
        });
    }
});

/**
 * 初始化管理员账户
 */
app.post('/api/init-admin', async (req, res) => {
    try {
        const { username, password, wikiName, wikiDescription } = req.body;

        // 输入验证
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '密码长度不能少于6位'
            });
        }

        // 检查是否已有用户
        const existingUsers = await db.query('user');
        if (existingUsers.success && existingUsers.data && existingUsers.data.length > 0) {
            return res.status(400).json({
                success: false,
                message: '系统已初始化，不能重复创建管理员'
            });
        }

        // 创建管理员
        const hashedPassword = await bcrypt.hash(password, 10);

        const columns = {
            username: username,
            password: hashedPassword,
            nickname: username,
            description: '我是这个百科网站的管理员',
            role: 'admin',
            status: 'active',
            tag: '',
            create_date: new Date().toISOString()
        };

        await db.insert('user', columns);

        // 保存百科名称
        if (wikiName) {
            await db.insert('site_settings', { key: 'wiki_name', value: wikiName });
        }

        // 保存百科描述
        if (wikiDescription) {
            await db.insert('site_settings', { key: 'wiki_description', value: wikiDescription });
        }

        // 插入默认标签
        for (const tag of defaultTags) {
            try {
                await db.insert('tag', tag);
            } catch (e) {
                // 忽略重复标签错误
            }
        }

        res.json({
            success: true,
            message: '管理员账户创建成功',
            data: { username }
        });
    } catch (error) {
        console.error('初始化管理员失败:', error);
        res.status(500).json({
            success: false,
            message: '初始化失败: ' + error.message
        });
    }
});

// ============================================
// 数据库初始化
// ============================================

/**
 * 初始化所有数据库表
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
    console.log('开始初始化数据库...');

    const tableNames = Object.keys(tableDefinitions);

    for (const tableName of tableNames) {
        try {
            await db.createTableIfNotExists(tableName, tableDefinitions[tableName]);
            console.log(`  - 表 ${tableName} 就绪`);
        } catch (error) {
            console.error(`  - 表 ${tableName} 初始化失败:`, error.message);
        }
    }

    console.log('数据库初始化完成');
}

// ============================================
// 错误处理中间件
// ============================================

/**
 * 404 处理
 */
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: '请求的资源不存在'
    });
});

/**
 * 全局错误处理
 */
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);

    // Multer 错误处理
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `文件大小不能超过 ${uploadConfig.maxFileSize / 1024 / 1024}MB`
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // 其他错误
    res.status(500).json({
        success: false,
        message: process.env.SHOW_ERROR_DETAILS !== 'false' ? err.message : '服务器内部错误'
    });
});

// ============================================
// 启动服务器
// ============================================

/**
 * 启动应用
 */
async function startServer() {
    try {
        // 初始化数据库
        await initializeDatabase();

        // 启动监听
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════╗');
            console.log('║     Wiki 百科网站 - 服务已启动            ║');
            console.log('╠════════════════════════════════════════════╣');
            console.log(`║  本地地址: http://localhost:${PORT}            ║`);
            console.log(`║  API 接口: http://localhost:${PORT}/api       ║`);
            console.log(`║  健康检查: http://localhost:${PORT}/health    ║`);
            console.log('╚════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
}

// 启动服务器
startServer();

// 导出 app 供测试使用
module.exports = app;
