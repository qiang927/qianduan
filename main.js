// 全局游戏与AI配置数据
window.GameData = {
    api: {
        url: 'https://api.openai.com/v1',
        key: '',
        model: '',
        availableModels: []
    },
    user: {
        prompt: '你出生在一个贫寒的农家，虽身体虚弱，但你渴望通过努力改变命运。请推演我下一年的遭遇。'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 收纳按钮展开/收起逻辑
    const toggleMenuBtn = document.getElementById('toggle-menu-btn');
    const rightMenu = document.querySelector('.right-menu');

    if (toggleMenuBtn && rightMenu) {
        toggleMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            rightMenu.classList.toggle('show');
            toggleMenuBtn.textContent = rightMenu.classList.contains('show') ? '收起' : '展开';
        });
    }

    document.addEventListener('click', (e) => {
        if (rightMenu && rightMenu.classList.contains('show')) {
            if (!rightMenu.contains(e.target) && e.target !== toggleMenuBtn) {
                rightMenu.classList.remove('show');
                toggleMenuBtn.textContent = '展开';
            }
        }
    });

    // 2. 弹窗系统核心逻辑
    const modalOverlay = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContentBody = document.getElementById('modal-content-body');
    const modalClose = document.getElementById('modal-close');

    function openModal(title, htmlContentFn, afterRenderFn) {
        modalTitle.textContent = title;
        modalContentBody.innerHTML = typeof htmlContentFn === 'function' ? htmlContentFn() : htmlContentFn;
        modalOverlay.classList.add('active');
        
        if (rightMenu && rightMenu.classList.contains('show')) {
            rightMenu.classList.remove('show');
            toggleMenuBtn.textContent = '展开';
        }

        if (typeof afterRenderFn === 'function') {
            afterRenderFn();
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // 3. 各个按钮的弹窗内容配置
    const modalConfigs = {
        '设置': {
            title: '【 系统设置 】',
            html: () => `
                <div class="accordion">
                    <!-- 折叠项 1：AI 引擎配置 -->
                    <div class="accordion-item expanded">
                        <div class="accordion-header">
                            <span>✧ AI 引擎配置</span>
                            <span class="acc-icon">▼</span>
                        </div>
                        <div class="accordion-content">
                            <div class="form-group">
                                <label>API 地址 (Base URL)</label>
                                <input type="text" id="setting-api-url" class="classical-input" value="${window.GameData.api.url}" placeholder="例如: https://api.openai.com/v1">
                            </div>
                            <div class="form-group">
                                <label>API 密钥 (API Key)</label>
                                <input type="password" id="setting-api-key" class="classical-input" value="${window.GameData.api.key}" placeholder="输入密钥 sk-...">
                            </div>
                            <div class="form-group" style="flex-direction: row; justify-content: space-between; align-items: center;">
                                <label style="margin-bottom:0;">AI 模型</label>
                                <button class="action-btn" id="btn-fetch-models">获取模型</button>
                            </div>
                            <div class="form-group">
                                <select id="setting-api-model" class="classical-select">
                                    ${window.GameData.api.model ? `<option value="${window.GameData.api.model}">${window.GameData.api.model}</option>` : '<option value="">(请先获取模型或手动输入)</option>'}
                                    ${window.GameData.api.availableModels.map(m => m !== window.GameData.api.model ? `<option value="${m}">${m}</option>` : '').join('')}
                                </select>
                            </div>
                            <!-- 允许用户手动输入模型覆盖下拉框 -->
                            <div class="form-group">
                                <label>或手动输入模型名:</label>
                                <input type="text" id="setting-api-model-manual" class="classical-input" value="${window.GameData.api.model}" placeholder="例如: gpt-3.5-turbo">
                            </div>
                            <button class="action-btn" id="btn-save-ai-settings" style="width:100%; margin-top:5px; padding:10px;">💾 封存引擎设置</button>
                        </div>
                    </div>

                    <!-- 折叠项 2：音画与系统体验 -->
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>✧ 音画与系统体验</span>
                            <span class="acc-icon">▼</span>
                        </div>
                        <div class="accordion-content">
                            <div class="list-layout">
                                <div class="list-item">
                                    <span>背景音乐</span>
                                    <button class="action-btn">开启</button>
                                </div>
                                <div class="list-item">
                                    <span>音效</span>
                                    <button class="action-btn">开启</button>
                                </div>
                                <div class="list-item">
                                    <span>文字速度</span>
                                    <span style="color:#8b7456;">适中</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            afterRender: () => {
                // 绑定折叠面板逻辑
                const headers = document.querySelectorAll('.accordion-header');
                headers.forEach(header => {
                    header.addEventListener('click', () => {
                        const item = header.parentElement;
                        // 切换当前点击的项
                        item.classList.toggle('expanded');
                    });
                });

                // 真实请求获取模型列表
                document.getElementById('btn-fetch-models').onclick = async () => {
                    const urlInput = document.getElementById('setting-api-url').value;
                    const keyInput = document.getElementById('setting-api-key').value;
                    if (!urlInput || !keyInput) {
                        showToast('请先输入完整的 API 地址与密钥');
                        return;
                    }

                    showToast('正在链接天地法则...');
                    const btn = document.getElementById('btn-fetch-models');
                    btn.disabled = true;
                    btn.textContent = '获取中...';

                    try {
                        let fetchUrl = urlInput.replace(/\/$/, '') + '/models';
                        // 如果用户输入了包含 /chat/completions 的路径，做个截断处理
                        if(fetchUrl.includes('/chat/completions')) {
                            fetchUrl = fetchUrl.replace('/chat/completions', '/models');
                        }

                        const response = await fetch(fetchUrl, {
                            method: 'GET',
                            headers: {
                                'Authorization': \`Bearer \${keyInput}\`
                            }
                        });

                        if (!response.ok) throw new Error('网络请求失败');
                        const data = await response.json();
                        
                        if (data && data.data && Array.isArray(data.data)) {
                            window.GameData.api.availableModels = data.data.map(m => m.id);
                            // 渲染至 select
                            const select = document.getElementById('setting-api-model');
                            select.innerHTML = window.GameData.api.availableModels.map(m => 
                                \`<option value="\${m}">\${m}</option>\`
                            ).join('');
                            showToast('模型已同步就绪');
                        } else {
                            throw new Error('返回数据格式不正确');
                        }
                    } catch (error) {
                        console.error('Fetch Models Error:', error);
                        showToast('获取失败，请检查地址或网络跨域设置');
                    } finally {
                        btn.disabled = false;
                        btn.textContent = '获取模型';
                    }
                };

                // 当 select 变动时，同步更新手动输入框
                const selectEl = document.getElementById('setting-api-model');
                const manualEl = document.getElementById('setting-api-model-manual');
                selectEl.addEventListener('change', () => {
                    manualEl.value = selectEl.value;
                });

                // 保存设置
                document.getElementById('btn-save-ai-settings').onclick = () => {
                    window.GameData.api.url = document.getElementById('setting-api-url').value;
                    window.GameData.api.key = document.getElementById('setting-api-key').value;
                    // 以 manual 的值为准，因为它允许用户自定义
                    window.GameData.api.model = document.getElementById('setting-api-model-manual').value || document.getElementById('setting-api-model').value;
                    showToast('设置已保存，天道流转已重置。');
                };
            }
        },
        '我': { 
            title: '【 个人志 / Prompt设定 】',
            html: () => `
                <div class="list-layout">
                    <div class="form-group">
                        <label>角色背景与性格设定 (传递给 AI)</label>
                        <textarea id="user-prompt" class="classical-textarea" rows="8" placeholder="在此书写你的人生起点...">${window.GameData.user.prompt}</textarea>
                    </div>
                    <button class="action-btn" id="btn-save-user" style="width:100%; padding:10px;">✍️ 确认命格</button>
                </div>
            `,
            afterRender: () => {
                document.getElementById('btn-save-user').onclick = () => {
                    window.GameData.user.prompt = document.getElementById('user-prompt').value;
                    showToast('命格已定，天机已录。');
                    closeModal();
                };
            }
        },
        '下一年': {
            title: '【 岁末交替 】',
            html: () => `
                <div class="text-center">
                    <p style="font-size:18px;font-weight:bold;margin-bottom:10px;">准备推演下一年</p>
                    <p style="margin-bottom:15px;color:#8b7456;font-size:13px;">将请求 AI 引擎，根据当前命格进行剧情推演...</p>
                    <div class="list-layout" style="text-align:left; font-size:12px; background:rgba(0,0,0,0.02); padding:10px; border-radius:4px; border:1px dashed #d3c1a8;">
                        <div><strong>接口:</strong> ${window.GameData.api.url || '未配置'}</div>
                        <div><strong>模型:</strong> ${window.GameData.api.model || '未配置'}</div>
                        <div><strong>设定:</strong> ${window.GameData.user.prompt.substring(0, 15)}...</div>
                    </div>
                    <button class="action-btn" id="btn-trigger-ai" style="margin-top:20px; width:100%; padding:12px; background:#c25b4e; font-size:15px;">🔮 拨动命运之轮</button>
                </div>
            `,
            afterRender: () => {
                document.getElementById('btn-trigger-ai').onclick = async () => {
                    if (!window.GameData.api.key || !window.GameData.api.url || !window.GameData.api.model) {
                        showToast('天道枯竭！请先在【设置】中配置完整的 URL、Key 与模型。');
                        return;
                    }
                    
                    showToast('命运之轮开始转动...');
                    closeModal();

                    const rightPanelContent = document.querySelector('.right-panel .panel-content');
                    if (rightPanelContent) {
                        rightPanelContent.innerHTML = `<p class="fade-text" style="text-align:center; margin-top:20px;">📜 天机推演中，请稍候...</p>`;
                    }

                    try {
                        let endpoint = window.GameData.api.url;
                        if(!endpoint.endsWith('/chat/completions')) {
                            endpoint = endpoint.replace(/\/$/, '') + '/chat/completions';
                        }

                        const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${window.GameData.api.key}\`
                            },
                            body: JSON.stringify({
                                model: window.GameData.api.model,
                                messages: [
                                    {
                                        role: 'system',
                                        content: '你是一个沙盒人生模拟器的文字剧情引擎。基于玩家当前的设定，请推演他接下来一年的遭遇。请使用古典、精炼、文学性的口吻，字数控制在150字以内。'
                                    },
                                    {
                                        role: 'user',
                                        content: window.GameData.user.prompt
                                    }
                                ]
                            })
                        });

                        if (!response.ok) {
                            const errData = await response.json().catch(()=>({}));
                            throw new Error(errData.error?.message || '请求被拒绝');
                        }

                        const result = await response.json();
                        const aiMessage = result.choices[0].message.content;

                        if (rightPanelContent) {
                            rightPanelContent.innerHTML = \`
                                <p style="font-weight:bold; color:#5c4a3d;">【 最新岁记 】</p>
                                <p>\${aiMessage.replace(/\\n/g, '<br>')}</p>
                                <p class="fade-text" style="margin-top:15px;">岁月流转，前方迷雾重重...</p>
                            \`;
                        }
                        showToast('推演完成！');

                    } catch (error) {
                        console.error('AI Request Error:', error);
                        showToast('推演失败：' + error.message);
                        if (rightPanelContent) {
                            rightPanelContent.innerHTML = \`<p class="fade-text" style="color:#c25b4e !important;">天道反噬，推演中止。（原因：\${error.message}）</p>\`;
                        }
                    }
                };
            }
        },
        '背包': {
            title: '【 我的行囊 】',
            html: () => `
                <div class="grid-layout">
                    ${Array(16).fill('<div class="grid-cell">空</div>').join('')}
                </div>
                <div style="margin-top:15px;text-align:center;font-size:12px;color:#8b7456;">容量: 0/16</div>
            `
        },
        '信件': {
            title: '【 飞鸽传书 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item"><span style="font-weight:bold;">娘亲的家书</span><span style="color:#c25b4e;font-size:12px;">未读</span></div>
                </div>
            `
        },
        '人际': {
            title: '【 人脉交游 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item"><span>私塾先生</span><span>好感: 10</span></div>
                </div>
            `
        },
        '地图': {
            title: '【 城镇地图 】',
            html: () => `
                <div class="grid-layout">
                    <div class="grid-cell" style="background:#eaddc7;color:#5c4a3d;">自家</div>
                    <div class="grid-cell">市集</div>
                    <div class="grid-cell">私塾</div>
                </div>
            `
        },
        '任务': {
            title: '【 当前目标 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item" style="border-left: 3px solid #c25b4e;">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">[主线] 逆天改命</span>
                        </div>
                    </div>
                </div>
            `
        },
        '微调': {
            title: '【 造物主微调 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item"><span>健康上限</span><button class="action-btn">+10</button></div>
                </div>
            `
        },
        '存档': {
            title: '【 记录人生 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">位面 壹</span>
                        </div>
                        <button class="action-btn">覆盖</button>
                    </div>
                </div>
            `
        },
        '读档': {
            title: '【 回溯时光 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">位面 壹</span>
                        </div>
                        <button class="action-btn">读取</button>
                    </div>
                </div>
            `
        },
        '重生': {
            title: '【 轮回转世 】',
            html: () => `
                <div class="text-center">
                    <p style="color:#c25b4e;margin:10px 0;">是否要放弃当前的人生，重新投胎？</p>
                    <button class="action-btn" style="background:#c25b4e;margin-top:10px;padding:8px 20px;">确认转世</button>
                </div>
            `
        },
        '日志': {
            title: '【 过往风霜 】',
            html: () => `
                <div class="list-layout">
                    <div style="font-size:13px;line-height:1.6;color:#4a3c31;">
                        <p>[系统] 游戏初始化完成。</p>
                    </div>
                </div>
            `
        }
    };

    // 4. 绑定所有按钮的点击事件
    const allButtons = document.querySelectorAll('.icon-btn, .main-btn, .long-btn');
    allButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnName = e.currentTarget.textContent.trim();
            const config = modalConfigs[btnName];
            if (config) {
                openModal(config.title, config.html, config.afterRender);
            } else {
                openModal('【 提示 】', `<div class="text-center">功能 [${btnName}] 尚未配置。</div>`);
            }
        });
    });

    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            const config = modalConfigs['我'];
            openModal(config.title, config.html, config.afterRender);
        });
    }

    // 5. 提示框(Toast)逻辑
    function showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'absolute',
            top: '45%', left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '15px',
            zIndex: '9999',
            pointerEvents: 'none',
            letterSpacing: '1px',
            animation: 'fadeInOut 2s ease-in-out forwards'
        });

        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) toast.remove();
        }, 2500);
    }

    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -40%); }
                15% { opacity: 1; transform: translate(-50%, -50%); }
                85% { opacity: 1; transform: translate(-50%, -50%); }
                100% { opacity: 0; transform: translate(-50%, -60%); }
            }
        `;
        document.head.appendChild(style);
    }
});