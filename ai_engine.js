/**
 * AI 驱动引擎 (隐藏在前端的轻量级后端模拟层)
 * 负责构建符合 SillyTavern 格式的 Prompt，并与兼容 OpenAI 的 API 进行通信
 */

const AIEngine = {
    // 读取本地存储的配置
    config: {
        url: localStorage.getItem('ai_api_url') || '',
        key: localStorage.getItem('ai_api_key') || '',
        model: localStorage.getItem('ai_api_model') || ''
    },

    // 核心设定参数 (参考 SillyTavern 格式)
    prompts: {
        system: "【预设】\n你是一个基于文字的古风沙盒人生模拟器引擎。你需要根据玩家的动作，结合世界背景和人物状态，推演并续写一段生动、符合古代设定的事件经过。语言要富有古典韵味。\n注意：不要输出任何系统性解释语句（如“好的”、“为你推演如下”等），直接以剧情的形式输出结果，控制在100字左右。",
        userPersona: "【user设定】\n姓名：张三\n骨龄：18岁\n身份：平民\n状态：体质虚弱，学识初识笔墨。急需寻找机遇改变贫寒的命运。",
        lorebook: "【世界书】\n时代背景：大明景泰年间，天下大旱，流民四起。小镇闭塞但保留着古风习俗。\n重要人物与地点：\n- 私塾先生：曾赴京赶考，学识渊博但性格孤傲。\n- 老村长：德高望重，知晓诸多小镇秘辛。\n- 后山：常有猛兽和异动传闻，极其危险但可能藏有奇遇。"
    },

    // 保存配置
    saveConfig(url, key, model) {
        this.config.url = url;
        this.config.key = key;
        this.config.model = model;
        localStorage.setItem('ai_api_url', url);
        localStorage.setItem('ai_api_key', key);
        localStorage.setItem('ai_api_model', model);
    },

    // 获取可用模型列表
    async fetchModels(url, key) {
        let fetchUrl = url.trim();
        // 自动格式化 URL 适配不同的代理站
        if (fetchUrl.endsWith('/')) fetchUrl = fetchUrl.slice(0, -1);
        if (!fetchUrl.endsWith('/models') && !fetchUrl.endsWith('/v1')) {
            fetchUrl += '/v1';
        }
        if (!fetchUrl.endsWith('/models')) {
            fetchUrl += '/models';
        }

        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });

        if (!response.ok) throw new Error('API请求失败，请检查地址或密钥是否正确');
        const data = await response.json();
        if (!data.data || !Array.isArray(data.data)) throw new Error('返回的数据格式不正确');
        
        return data.data.map(m => m.id);
    },

    // 生成剧情推演
    async generate(actionText) {
        if (!this.config.url || !this.config.key || !this.config.model) {
            throw new Error('未配置API：请先在【设置】中配置并保存 API 后端参数');
        }

        // 组装格式：输入内容 + 预设 + user设定 + 世界书
        const combinedSystemContent = `${this.prompts.system}\n\n${this.prompts.userPersona}\n\n${this.prompts.lorebook}`;
        const userContent = `【输入内容】\n交互动作：${actionText}\n\n请推演接下来发生的事情：`;

        const messages = [
            { role: "system", content: combinedSystemContent },
            { role: "user", content: userContent }
        ];

        let fetchUrl = this.config.url.trim();
        if (fetchUrl.endsWith('/')) fetchUrl = fetchUrl.slice(0, -1);
        if (!fetchUrl.endsWith('/chat/completions')) {
            fetchUrl += fetchUrl.endsWith('/v1') ? '/chat/completions' : '/v1/chat/completions';
        }

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.key}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`模型生成失败: HTTP ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
};

window.AIEngine = AIEngine;
