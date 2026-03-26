/**
 * 百科设置加载器 - 公共函数
 * 所有页面调用 loadWikiSettings() 即可加载百科设置
 */

// 全局百科设置缓存
window.WikiSettings = {
    wikiName: '百科',
    wikiDescription: '',
    wikiLogo: '',
    logoData: { type: 'emoji', value: '🎵' }, // 默认logo
    wikiHomeTitle: '探索 VOCALOID 世界' // 默认首页标语
};

// 加载百科设置并更新页面元素
async function loadWikiSettings() {
    try {
        const result = await API.getSiteSettings();
        if (result.success && result.data) {
            const wikiName = result.data.wiki_name || '百科';
            const wikiDescription = result.data.wiki_description || '';
            
            // 保存到全局设置
            window.WikiSettings.wikiName = wikiName;
            window.WikiSettings.wikiDescription = wikiDescription;
            window.WikiSettings.wikiLogo = result.data.wiki_logo || '';
            
            // 解析logo设置
            if (result.data.wiki_logo) {
                try {
                    window.WikiSettings.logoData = JSON.parse(result.data.wiki_logo);
                } catch (e) {
                    window.WikiSettings.logoData = { type: 'emoji', value: result.data.wiki_logo };
                }
            } else {
                window.WikiSettings.logoData = { type: 'emoji', value: '🎵' };
            }
            
            // 解析首页标语设置
            const homeTitle = result.data.wiki_home_title || '探索 VOCALOID 世界';
            window.WikiSettings.wikiHomeTitle = homeTitle;
            
            // 更新页面标题
            document.title = wikiName;
            
            // 更新logo - 重新渲染整个logo结构以确保emoji同步
            const logo = document.querySelector('.logo');
            if (logo) {
                const logoData = window.WikiSettings.logoData;
                let logoContent;
                
                if (logoData?.type === 'image' && logoData.value) {
                    logoContent = `<img src="${escapeHtml(logoData.value)}" alt="logo" class="logo-image" style="width:32px;height:32px;object-fit:contain;"> <span class="logo-text">${escapeHtml(wikiName)}</span>`;
                } else {
                    logoContent = `<span class="logo-emoji">${logoData?.value || '🎵'}</span> <span class="logo-text">${escapeHtml(wikiName)}</span>`;
                }
                
                logo.innerHTML = logoContent;
            }
            
            // 更新hero标题
            const wikiTitle = document.getElementById('wiki-title');
            if (wikiTitle) {
                wikiTitle.textContent = wikiName;
            }
            
            // 更新hero描述
            const wikiDesc = document.getElementById('wiki-description');
            if (wikiDesc && wikiDescription) {
                wikiDesc.textContent = wikiDescription;
            }
            
            // 更新首页标语
            const homeTitleEl = document.getElementById('wiki-home-title');
            if (homeTitleEl) {
                homeTitleEl.textContent = homeTitle;
            }
            
            // 更新页脚
            const footerWikiName = document.getElementById('footer-wiki-name');
            if (footerWikiName) {
                footerWikiName.textContent = wikiName;
            }
            
            // 更新页脚完整文本
            const footerText = document.getElementById('footer-text');
            if (footerText) {
                footerText.innerHTML = `&copy; ${new Date().getFullYear()} <span id="footer-wiki-name">${wikiName}</span>`;
            }
        }
    } catch (error) {
        console.error('加载百科设置失败:', error);
    }
}
