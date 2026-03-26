/**
 * Wiki 百科网站 - 配置文件
 * 
 * 集中管理所有配置项，支持从环境变量读取
 */

// 服务器配置
const serverConfig = {
    port: parseInt(process.env.PORT) || 3001,
    host: process.env.HOST || 'localhost',
    sessionSecret: process.env.SESSION_SECRET || 'wiki-encyclopedia-default-secret',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24小时
    corsOrigin: process.env.CORS_ORIGIN || true,
    forceHttps: process.env.FORCE_HTTPS === 'true'
};

// 数据库配置
const dbConfig = {
    apiUrl: process.env.DATABASE_API_URL || 'http://localhost:3000/api',
    token: process.env.DATABASE_TOKEN || ''
};

// 文件上传配置
const uploadConfig = {
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/gif,image/webp')
        .split(',')
        .map(t => t.trim()),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    uploadDir: process.env.UPLOAD_DIR || './public/uploads'
};

// 功能开关
const featureConfig = {
    allowRegistration: process.env.ALLOW_REGISTRATION !== 'false',
    allowGuestBrowse: process.env.ALLOW_GUEST_BROWSE !== 'false'
};

// 日志配置
const logConfig = {
    level: process.env.LOG_LEVEL || 'info',
    showErrorDetails: process.env.SHOW_ERROR_DETAILS !== 'false'
};

// 数据库表定义
const tableDefinitions = {
    articles: [
        { name: 'ID', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'title', type: 'TEXT' },
        { name: 'create_date', type: 'TEXT' },
        { name: 'update_date', type: 'TEXT' },
        { name: 'content', type: 'TEXT' },
        { name: 'sketch', type: 'TEXT' },
        { name: 'cover_image', type: 'TEXT' },
        { name: 'author_id', type: 'INTEGER' }
    ],
    'articles-edit': [
        { name: 'ID', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'article_id', type: 'INTEGER' },
        { name: 'edit_date', type: 'TEXT' },
        { name: 'content', type: 'TEXT' },
        { name: 'description', type: 'TEXT' },
        { name: 'editor_id', type: 'INTEGER' }
    ],
    user: [
        { name: 'id', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'username', type: 'TEXT', not_null: true },
        { name: 'password', type: 'TEXT', not_null: true },
        { name: 'nickname', type: 'TEXT' },
        { name: 'description', type: 'TEXT' },
        { name: 'role', type: 'TEXT', default: 'user' },
        { name: 'status', type: 'TEXT', default: 'active' },
        { name: 'tag', type: 'TEXT' },
        { name: 'create_date', type: 'TEXT' }
    ],
    tag: [
        { name: 'ID', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'name', type: 'TEXT' },
        { name: 'description', type: 'TEXT' },
        { name: 'color', type: 'TEXT' }
    ],
    site_settings: [
        { name: 'id', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'key', type: 'TEXT', not_null: true, unique: true },
        { name: 'value', type: 'TEXT' }
    ],
    article_tag: [
        { name: 'id', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'article_id', type: 'INTEGER' },
        { name: 'tag_id', type: 'INTEGER' }
    ],
    user_tag: [
        { name: 'id', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'user_id', type: 'INTEGER' },
        { name: 'tag_id', type: 'INTEGER' }
    ],
    user_tag_definition: [
        { name: 'id', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'name', type: 'TEXT' },
        { name: 'description', type: 'TEXT' },
        { name: 'color', type: 'TEXT' }
    ],
    wiki_images: [
        { name: 'id', type: 'INTEGER', primary_key: true, auto_increment: true },
        { name: 'filename', type: 'TEXT' },
        { name: 'original_name', type: 'TEXT' },
        { name: 'url', type: 'TEXT' },
        { name: 'size', type: 'INTEGER' },
        { name: 'mime_type', type: 'TEXT' },
        { name: 'uploader_id', type: 'INTEGER' },
        { name: 'create_date', type: 'TEXT' }
    ]
};

// 默认标签
const defaultTags = [
    { name: '贡献者', description: '为百科做出贡献的用户', color: '#4CAF50' },
    { name: '资深编辑', description: '经常参与词条编辑的用户', color: '#2196F3' },
    { name: '创始人', description: '百科网站的创始人', color: '#FF9800' }
];

module.exports = {
    serverConfig,
    dbConfig,
    uploadConfig,
    featureConfig,
    logConfig,
    tableDefinitions,
    defaultTags
};
