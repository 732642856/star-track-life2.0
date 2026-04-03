/**
 * 星轨人生 v2.0 - 核心应用逻辑
 * 解决问题: 1)内容差异化 2)Markdown排版 3)角色保存
 */

// ==================== 全局状态 ====================
let currentStep = 1;
let selectedChart = null;
let userInputs = {};
let eightAttributes = {};
let selectedEra = null;
let selectedSubPattern = null;  // 驱动力标签（野心者/执念者等8种）
let selectedSubPatternIdx = -1; // 驱动力索引（0-7，语言无关的存储key）
let selectedKeIdx = 0;          // 时辰刻（0-7，初刻→末刻，独立于驱动力）
let currentCharacterBio = '';
let savedCharacters = [];

// ==================== i18n 翻译辅助函数 ====================
/**
 * _getStarNameI18n(zhName)
 * 将中文星名转为当前语言的星名（用于显示）
 * 存储始终用中文key，显示时翻译
 */
function _getStarNameI18n(zhName) {
    if (!zhName) return zhName;
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'zh') return zhName;
    // 繁体映射
    var TW_STARS = {
        '紫微':'紫微','天机':'天機','太阳':'太陽','武曲':'武曲','天同':'天同','廉贞':'廉貞',
        '天府':'天府','太阴':'太陰','贪狼':'貪狼','巨门':'巨門','天相':'天相','天梁':'天梁',
        '七杀':'七殺','破军':'破軍'
    };
    // 英文映射（来自 MAIN_STARS_I18N，此处内联常用部分）
    var EN_STARS = {
        '紫微':'Zi Wei','天机':'Tian Ji','太阳':'Tai Yang','武曲':'Wu Qu','天同':'Tian Tong',
        '廉贞':'Lian Zhen','天府':'Tian Fu','太阴':'Tai Yin','贪狼':'Tan Lang','巨门':'Ju Men',
        '天相':'Tian Xiang','天梁':'Tian Liang','七杀':'Qi Sha','破军':'Po Jun'
    };
    if (lang === 'zh-TW') return TW_STARS[zhName] || zhName;
    if (lang === 'en') return EN_STARS[zhName] || zhName;
    return zhName;
}

/**
 * _getPatternTypeI18n(zhType)
 * 将格局类型（杀破狼/紫府廉武相/机月同梁/巨日）翻译为当前语言
 */
function _getPatternTypeI18n(zhType) {
    if (!zhType) return zhType;
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    var TW = { '杀破狼':'殺破狼','紫府廉武相':'紫府廉武相','机月同梁':'機月同梁','巨日':'巨日' };
    var EN = {
        '杀破狼':'Sha-Po-Lang (The Trailblazers)',
        '紫府廉武相':'Zi-Fu-Lian-Wu-Xiang (The Architects)',
        '机月同梁':'Ji-Yue-Tong-Liang (The Guardians)',
        '巨日':'Ju-Ri (The Visionaries)'
    };
    if (lang === 'zh-TW') return TW[zhType] || zhType;
    if (lang === 'en') return EN[zhType] || zhType;
    return zhType;
}

/**
 * _getDriveLabelI18n(zhLabel)
 * 将驱动力中文标签转为当前语言标签
 * 优先用 getDynamic().drive8 的精确翻译
 */
function _getDriveLabelI18n(zhLabel) {
    if (!zhLabel) return zhLabel;
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'zh') return zhLabel;
    // 中文label → 索引 → 当前语言label
    var ZH_LABELS = ['野心者','执念者','谋局者','享乐者','守护者','破局者','漂泊者','隐忍者'];
    var idx = ZH_LABELS.indexOf(zhLabel);
    if (idx === -1) {
        // 繁体也可能作为输入
        var TW_LABELS = ['野心者','執念者','謀局者','享樂者','守護者','破局者','漂泊者','隱忍者'];
        idx = TW_LABELS.indexOf(zhLabel);
    }
    if (idx === -1) return zhLabel; // 找不到索引，原样返回
    if (typeof getDynamic === 'function') {
        var d = getDynamic();
        if (d && d.drive8 && d.drive8[idx]) return d.drive8[idx].label;
    }
    return zhLabel;
}

/**
 * _getDriveLabelByIdx(idx)
 * 通过数字索引直接获取当前语言的驱动力标签（存储时保存idx更稳健）
 */
function _getDriveLabelByIdx(idx) {
    if (idx < 0 || idx > 7) return '';
    if (typeof getDynamic === 'function') {
        var d = getDynamic();
        if (d && d.drive8 && d.drive8[idx]) return d.drive8[idx].label;
    }
    var ZH_LABELS = ['野心者','执念者','谋局者','享乐者','守护者','破局者','漂泊者','隐忍者'];
    return ZH_LABELS[idx] || '';
}

/**
 * _getPatternNameI18n(stars, lang)
 * 将格局名（如"七杀独坐"）翻译：把中文星名替换为对应语言星名
 */
function _getPatternNameI18n(zhName) {
    if (!zhName) return zhName;
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'zh') return zhName;
    var STAR_PAIRS = [
        ['七杀','破军'],['七杀','贪狼'],['破军','贪狼'],
        ['紫微','天府'],['紫微','天相'],['紫微','贪狼'],['紫微','七杀'],['紫微','破军'],
        ['廉贞','天府'],['廉贞','天相'],['廉贞','贪狼'],['廉贞','七杀'],['廉贞','破军'],
        ['武曲','天府'],['武曲','天相'],['武曲','贪狼'],['武曲','七杀'],['武曲','破军'],
        ['天机','太阴'],['天机','天梁'],['天机','巨门'],
        ['天同','太阴'],['天同','天梁'],['天同','巨门'],
        ['太阳','太阴'],['太阳','天梁'],['太阳','巨门'],['太阳','天府'],
        ['紫微'],['天机'],['太阳'],['武曲'],['天同'],['廉贞'],
        ['天府'],['太阴'],['贪狼'],['巨门'],['天相'],['天梁'],['七杀'],['破军']
    ];
    var TW_SUFFIX = { '独坐':'獨坐','同宫':'同宮','命格':'命格','格局':'格局' };
    var EN_SUFFIX = { '独坐':' (Solo)','同宫':' (Paired)','命格':' Chart','格局':' Pattern' };
    var result = zhName;
    // 替换星名
    var STAR_LIST = ['紫微','天机','太阳','武曲','天同','廉贞','天府','太阴','贪狼','巨门','天相','天梁','七杀','破军'];
    for (var i = 0; i < STAR_LIST.length; i++) {
        if (result.indexOf(STAR_LIST[i]) !== -1) {
            result = result.split(STAR_LIST[i]).join(_getStarNameI18n(STAR_LIST[i]));
        }
    }
    // 替换后缀
    var suffixes = lang === 'zh-TW' ? TW_SUFFIX : EN_SUFFIX;
    for (var k in suffixes) {
        result = result.split(k).join(suffixes[k]);
    }
    return result;
}

// ==================== 对比按钮测试函数 ====================
function testButtonClick() {
    console.log('!!! 对比按钮点击事件已触发 !!!');
    console.trace('按钮点击堆栈追踪');
}

// ==================== 全局 Toast 提示 ====================
function showToast(msg, type) {
    var bg = (type === 'success') ? 'rgba(39,174,96,0.92)' : 'rgba(220,50,50,0.92)';
    var icon = (type === 'success') ? '' : '';
    var t = document.createElement('div');
    t.textContent = icon + msg;
    t.style.cssText = [
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%,-50%) scale(0.8)',
        'background:' + bg,
        'color:#fff',
        'padding:14px 28px',
        'border-radius:14px',
        'font-size:16px',
        'z-index:99999',
        'pointer-events:none',
        'box-shadow:0 6px 30px rgba(0,0,0,0.35)',
        'transition:transform 0.18s ease,opacity 0.18s ease',
        'max-width:80vw',
        'text-align:center',
        'line-height:1.5'
    ].join(';');
    document.body.appendChild(t);
    // 弹入
    requestAnimationFrame(function() {
        t.style.transform = 'translate(-50%,-50%) scale(1)';
    });
    // 弹出
    setTimeout(function() {
        t.style.opacity = '0';
        t.style.transform = 'translate(-50%,-50%) scale(0.8)';
        setTimeout(function() { if (t.parentNode) t.remove(); }, 200);
    }, type === 'success' ? 2000 : 2500);
}

// ==================== 8种人物驱动力 ====================
// 每个选项是小传差异化的核心触发器，选哪个决定角色叙事方向
// 数据从 i18n-ui.js UI_DYNAMIC 取，支持三语言动态切换
function _getDrive8() {
    if (typeof getDynamic === 'function') {
        return getDynamic().drive8.map(function(d, i) {
            return Object.assign({ keIdx: i }, d);
        });
    }
    // 降级：返回简体中文硬编码（仅在 i18n 未加载时生效）
    return [
        { label: '野心者', keIdx: 0, desc: '想要更多，永不满足，代价是很难真正停下来', coreConflict: '得到了还想要 vs 已经够了还不知道', wound: '曾经一无所有，或曾被人看不起', starHint: '七杀/破军/贪狼命格最常见' },
        { label: '执念者', keIdx: 1, desc: '有一件事/一个人放不下，整个人生都在绕着它转', coreConflict: '放不下那个执念 vs 执念正在吞噬自己', wound: '曾经失去过某样东西，从此无法真正接受"失去"', starHint: '化忌入夫妻宫/命宫的格局，巨门/廉贞命格' },
        { label: '谋局者', keIdx: 2, desc: '凡事都在布局，极少暴露真实意图，连身边人也未必读得懂', coreConflict: '算计一切 vs 算计了所有人却算计不了孤独', wound: '曾经因为"天真"而被伤害，从此再不轻易信任', starHint: '天机/紫微命格，权忌叠加格局' },
        { label: '享乐者', keIdx: 3, desc: '活在当下，本能地回避痛苦，不太愿意为明天透支今天', coreConflict: '活在当下是智慧 vs 逃避是另一种懦弱', wound: '某段经历让他学会：未来是假的，只有现在是真的', starHint: '天同/贪狼/太阴命格，化禄入命宫' },
        { label: '守护者', keIdx: 4, desc: '为某人或某件事活着，习惯把自己放在最后', coreConflict: '守护了所有人 vs 谁来守护我', wound: '曾经没有守护好某个重要的人，从此以守护赎罪', starHint: '天府/太阳/天梁命格，夫妻宫/子女宫有重要星' },
        { label: '破局者', keIdx: 5, desc: '天生看不惯既有秩序，不打破什么就浑身难受', coreConflict: '不破不立 vs 打破了之后空留一地碎片', wound: '曾被一个不公平的规则深深伤害，立誓要推翻它', starHint: '破军/七杀命格，忌权叠加' },
        { label: '漂泊者', keIdx: 6, desc: '找不到真正意义上的根，永远在路上，停下来反而迷茫', coreConflict: '渴望归属 vs 真正定下来时又觉得窒息', wound: '从小就没有一个真正意义上的"家"', starHint: '天机/贪狼迁移宫强旺，命宫有空宫/化忌' },
        { label: '隐忍者', keIdx: 7, desc: '能扛，扛到极限才会爆发，平时看起来比任何人都稳', coreConflict: '忍耐是力量 vs 忍耐也是在慢慢消灭自己', wound: '曾经爆发过，结果失去了太多，从此学会了压抑', starHint: '天相/太阴/武曲命格，化忌入福德宫' },
    ];
}
// 运行时驱动力数组（由 _getDrive8() 生成，语言切换时需刷新）
var DRIVE_8_TYPES = _getDrive8();

// ==================== 144盘数据库 ====================
const CHART_DATABASE = {
    // 杀破狼系列 (36盘)
    '杀破狼': {
        patterns: [
            { name: '七杀独坐', stars: ['七杀'], desc: '勇猛无比，将星特质最明显' },
            { name: '破军独坐', stars: ['破军'], desc: '破坏开创，变动中求发展' },
            { name: '贪狼独坐', stars: ['贪狼'], desc: '多才多艺，欲望强烈，桃花旺' },
            { name: '七杀破军', stars: ['七杀', '破军'], desc: '开创力最强，冲动冒险' },
            { name: '七杀贪狼', stars: ['七杀', '贪狼'], desc: '勇猛加欲望，冒险求财' },
            { name: '破军贪狼', stars: ['破军', '贪狼'], desc: '变动加欲望，创新求变' }
        ],
        traits: {
            positive: ['勇敢果断', '开创力强', '冒险精神', '威望高', '执行力强'],
            negative: ['冲动', '急躁', '缺乏耐心', '好胜心强', '不服输'],
            psychology: '追求突破和变革，内心渴望征服和掌控',
            positiveEN: ['Brave & decisive', 'Creative power', 'Risk-taker', 'High prestige', 'Strong execution'],
            negativeEN: ['Impulsive', 'Impatient', 'No patience', 'Competitive', 'Won\'t accept loss'],
            psychologyEN: 'Seeks breakthrough and transformation; craves conquest and control'
        }
    },
    // 紫府廉武相系列 (36盘)
    '紫府廉武相': {
        patterns: [
            { name: '紫微独坐', stars: ['紫微'], desc: '孤君，凡事亲力亲为' },
            { name: '天府独坐', stars: ['天府'], desc: '稳重保守，善于守成' },
            { name: '廉贞独坐', stars: ['廉贞'], desc: '复杂好胜，次桃花' },
            { name: '武曲独坐', stars: ['武曲'], desc: '财星，果断刚毅' },
            { name: '天相独坐', stars: ['天相'], desc: '印星，谨慎服务' },
            { name: '紫微天府', stars: ['紫微', '天府'], desc: '帝星加财库，权力财富并存' },
            { name: '紫微贪狼', stars: ['紫微', '贪狼'], desc: '帝星加桃花，欲望强烈' },
            { name: '紫微天相', stars: ['紫微', '天相'], desc: '帝星加印星，谨慎领导' },
            { name: '武曲天府', stars: ['武曲', '天府'], desc: '财库双星，富贵双全' },
            { name: '廉贞贪狼', stars: ['廉贞', '贪狼'], desc: '桃花极旺，多才多艺' }
        ],
        traits: {
            positive: ['稳重', '有领导力', '务实', '有计划', '执行力强'],
            negative: ['过于保守', '控制欲强', '不够灵活', '压力大'],
            psychology: '追求稳定和掌控，内心渴望成就和认可',
            positiveEN: ['Steady', 'Strong leadership', 'Pragmatic', 'Strategic', 'Reliable execution'],
            negativeEN: ['Overly cautious', 'Controlling', 'Inflexible', 'High pressure'],
            psychologyEN: 'Seeks stability and mastery; craves achievement and recognition'
        }
    },
    // 机月同梁系列 (36盘)
    '机月同梁': {
        patterns: [
            { name: '天机独坐', stars: ['天机'], desc: '聪明机智，谋士之相' },
            { name: '太阴独坐', stars: ['太阴'], desc: '温柔内敛，母性特质' },
            { name: '天同独坐', stars: ['天同'], desc: '福气深厚，温和享乐' },
            { name: '天梁独坐', stars: ['天梁'], desc: '清高正直，长辈风范' },
            { name: '天机太阴', stars: ['天机', '太阴'], desc: '聪明细腻，适合幕后' },
            { name: '天同天梁', stars: ['天同', '天梁'], desc: '仁慈福气，有长辈缘' }
        ],
        traits: {
            positive: ['温和', '善良', '有同情心', '人缘好', '适应力强'],
            negative: ['优柔寡断', '过于敏感', '缺乏主见', '容易妥协'],
            psychology: '追求和谐和安稳，内心渴望被理解和接纳',
            positiveEN: ['Gentle', 'Kind-hearted', 'Empathetic', 'Good with people', 'Adaptable'],
            negativeEN: ['Indecisive', 'Overly sensitive', 'Lacks assertiveness', 'Prone to compromise'],
            psychologyEN: 'Seeks harmony and calm; craves understanding and acceptance'
        }
    },
    // 巨日系列 (36盘)
    '巨日': {
        patterns: [
            { name: '巨门独坐', stars: ['巨门'], desc: '口才好，研究能力强' },
            { name: '太阳独坐', stars: ['太阳'], desc: '光明磊落，公众人物' },
            { name: '巨门太阳', stars: ['巨门', '太阳'], desc: '口才加光明，正义感最强' }
        ],
        traits: {
            positive: ['正义感强', '表达能力强', '有理想', '光明磊落'],
            negative: ['过于理想化', '容易争议', '固执己见'],
            psychology: '追求正义和表达，内心渴望改变世界',
            positiveEN: ['Strong sense of justice', 'Articulate', 'Idealistic', 'Open & upright'],
            negativeEN: ['Overly idealistic', 'Invites controversy', 'Stubborn'],
            psychologyEN: 'Seeks justice and expression; craves to change the world'
        }
    }
};

// 导出全局变量
window.CHART_DATABASE = CHART_DATABASE;

// ==================== 四化类型详细定义 ====================
const SIHUA_TYPES = {
    '化禄型': {
        desc: '天赋优势型，天生感到轻松愉悦',
        mingEffect: '天赋优势明显，做事轻松自然',
        fudeEffect: '精神富足，内心满足',
        fuqiEffect: '感情丰富，浪漫主义',
        traits: ['天赋优势', '轻松愉悦', '多情善感', '情感满足']
    },
    '化权型': {
        desc: '掌控欲强型，有强烈的掌控欲望',
        mingEffect: '主导性强，掌控欲明显',
        fudeEffect: '精神掌控，完美主义',
        fuqiEffect: '占有欲强，控制欲强',
        traits: ['掌控欲', '主导性', '防御机制', '占有欲']
    },
    '化科型': {
        desc: '名誉驱动型，极度在乎面子体面',
        mingEffect: '注重形象，理性克制',
        fudeEffect: '精神追求，理想主义',
        fuqiEffect: '理性择偶，精神恋爱',
        traits: ['声誉管理', '理性克制', '理想化', '面子体面']
    },
    '化忌型': {
        desc: '执念深重型，有深层的灵魂伤疤',
        mingEffect: '执念深重，难以放手',
        fudeEffect: '精神创伤，内心纠结',
        fuqiEffect: '感情执念，婚姻创伤',
        traits: ['灵魂伤疤', '执念', '不安全感', '强迫症']
    },
    '禄权叠加型': {
        desc: '财富权力双驱动，欲望强烈',
        mingEffect: '天赋加掌控，能力强',
        fudeEffect: '精神富足且强势',
        fuqiEffect: '感情丰富且占有欲强',
        traits: ['天赋+掌控', '财富权力', '欲望强烈']
    },
    '权忌冲突型': {
        desc: '掌控与执念冲突，内心纠结',
        mingEffect: '掌控欲与执念的矛盾',
        fudeEffect: '完美主义与创伤的冲突',
        fuqiEffect: '占有欲与恐惧的矛盾',
        traits: ['掌控vs执念', '内心冲突', '矛盾性格']
    },
    '科忌矛盾型': {
        desc: '面子与执念矛盾，情感复杂',
        mingEffect: '理性与执念的矛盾',
        fudeEffect: '理想与创伤的冲突',
        fuqiEffect: '精神恋爱与执念的矛盾',
        traits: ['面子vs执念', '理性冲突', '情感复杂']
    },
    '禄忌纠缠型': {
        desc: '享受与执念纠缠，情感波动',
        mingEffect: '天赋与执念的纠缠',
        fudeEffect: '满足与创伤的交织',
        fuqiEffect: '浪漫与执念的纠缠',
        traits: ['享受vs执念', '情感波动', '纠缠不清']
    }
};

// 导出全局变量
window.SIHUA_TYPES = SIHUA_TYPES;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    showStep(1);
    initEraCards();
    initOptionCards();
    loadSavedCharacters();
});

// ==================== 步骤控制 ====================
function showStep(step) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    
    document.getElementById('step-' + step).classList.add('active');
    document.querySelector('.step[data-step="' + step + '"]').classList.add('active');
    
    currentStep = step;

    // 切换步骤时统一滚到该步骤顶部
    if (step === 3 || step === 4 || step === 5) {
        requestAnimationFrame(function() {
            var el = document.getElementById('step-' + step);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
}

function nextStep() {
    if (currentStep < 5) showStep(currentStep + 1);
}

function prevStep() {
    if (currentStep > 1) showStep(currentStep - 1);
}

function resetForm() {
    userInputs = {};
    eightAttributes = {};
    selectedEra = null;
    selectedChart = null;
    selectedSubPattern = null;
    selectedKeIdx = 0;
    document.getElementById('character-name').value = '';
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.era-card').forEach(c => c.classList.remove('selected'));
    showStep(1);
}

// ==================== 步骤1: 时代选择 ====================
function initEraCards() {
    document.querySelectorAll('.era-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.era-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedEra = card.dataset.era;
        });
    });
}

function confirmEra() {
    if (!selectedEra) {
        showToast(tUI('toastSelectEra'));
        return;
    }
    userInputs.era = selectedEra;
    showStep(2);
}

// ==================== 步骤2: 基础信息 ====================
function initOptionCards() {
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            const field = card.dataset.field;
            const value = card.dataset.value;
            
            document.querySelectorAll(`.option-card[data-field="${field}"]`).forEach(c => {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
            userInputs[field] = value;
        });
    });
}

function confirmBasicInfo() {
    var name = document.getElementById('character-name').value.trim();

    // --- inline 提示工具函数 ---
    function showFieldError(elId, msg) {
        var errEl = document.getElementById(elId);
        var inputEl = document.getElementById('character-name');
        if (errEl) {
            errEl.textContent = '⚠️ ' + msg;
            errEl.style.display = 'inline-block';
            setTimeout(function() { errEl.style.display = 'none'; }, 4000);
        }
        // 滚动到提示处
        var target = errEl || inputEl;
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showToast(msg) {
        var t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(220,50,50,0.92);color:#fff;padding:14px 28px;border-radius:12px;font-size:16px;z-index:9999;pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,0.3)';
        document.body.appendChild(t);
        setTimeout(function() { t.remove(); }, 2500);
    }

    if (!name) {
        showFieldError('name-error', tUI('toastFillName'));
        var inp = document.getElementById('character-name');
        if (inp) {
            inp.focus();
            inp.style.borderColor = '#e74c3c';
            inp.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.25)';
            setTimeout(function() {
                inp.style.borderColor = '';
                inp.style.boxShadow = '';
            }, 3000);
        }
        return;
    }
    if (!userInputs.gender) {
        showToast(tUI('toastSelectGender'));
        var genderEl = document.querySelector('[data-field="gender"]');
        if (genderEl) genderEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (!userInputs.age) {
        showToast(tUI('toastSelectAge'));
        var ageEl = document.querySelector('[data-field="age"]');
        if (ageEl) ageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (!userInputs.profession) {
        showToast(tUI('toastSelectProfession'));
        var profEl = document.querySelector('[data-field="profession"]');
        if (profEl) profEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (!userInputs.family) {
        showToast(tUI('toastSelectFamily'));
        var famEl = document.querySelector('[data-field="family"]');
        if (famEl) famEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (!userInputs.social) {
        showToast(tUI('toastSelectSocial'));
        var socEl = document.querySelector('[data-field="social"]');
        if (socEl) socEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (!userInputs.parents) {
        showToast(tUI('toastSelectParents'));
        var parEl = document.querySelector('[data-field="parents"]');
        if (parEl) parEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (!userInputs.siblings) {
        showToast(tUI('toastSelectSiblings'));
        var sibEl = document.querySelector('[data-field="siblings"]');
        if (sibEl) sibEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    userInputs.name = name;
    matchChart();
    showStep(3);
}

// ==================== 步骤3: 星盘匹配 ====================
function matchChart() {
    // 首次进入步骤3，keIdx默认0（后续用户选子类型时会更新）
    const chartData = generate144Chart({ ...userInputs, keIdx: userInputs.keIdx || 0 });
    
    // 保存到全局（使用统一代理结构）
    selectedChart = buildChartProxy(chartData);
    
    // 更新显示（i18n：始终用翻译函数，不直接输出中文key）
    var _lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    var _sep = _lang === 'en' ? ' / ' : '、';
    var _setEl = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    _setEl('main-pattern-name', _getPatternNameI18n(chartData.pattern.name));
    _setEl('main-pattern-desc', chartData.pattern.desc);
    _setEl('main-star', (chartData.pattern.stars || []).map(_getStarNameI18n).join(_sep));
    _setEl('pattern-type', _getPatternTypeI18n(chartData.patternType));
    _setEl('era', ((typeof getDynamic === 'function' && getDynamic().eraMap) ? getDynamic().eraMap[userInputs.era] : null) || ({ancient:'古代', modern:'近代', contemporary:'现代'}[userInputs.era] || userInputs.era));
    _setEl('era-display', ((typeof getDynamic === 'function' && getDynamic().eraMap) ? getDynamic().eraMap[userInputs.era] : null) || ({ancient:'古代', modern:'近代', contemporary:'现代'}[userInputs.era] || userInputs.era));
    // 命盘匹配度：确定性计算，相同输入永远得到相同分数
    // 基础分90，根据格局类型+职业+性别微调（总在87-99之间）
    var _scoreHash = function(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
        return Math.abs(h);
    };
    var _scoreKey = (chartData.patternType || '') + (userInputs.profession || userInputs.career || '') + (userInputs.gender || '');
    var _matchScore = 87 + (_scoreHash(_scoreKey) % 13);
    _setEl('match-score', _matchScore + '%');
    
    // 生成8种人格类型选项（每项=一个时辰刻坐标）
    generate8PersonalityTypes(chartData);
}

function generate8PersonalityTypes(chartData) {
    const grid = document.getElementById('sub-patterns-grid');
    if (!grid) return;
    
    // 始终使用8种驱动力，personalityTypes字段为备选
    const personalityTypes = (chartData.personalityTypes && chartData.personalityTypes.length > 0)
        ? chartData.personalityTypes
        : DRIVE_8_TYPES;

    // ── ★ 命盘算法驱动：计算8种驱动力的命盘亲和度向量 ──────────────────
    // 通过 ChartBridge.calcDriveAffinityVector（三方四正+四化+夹宫+大限）
    let affinityVector = null;          // 8元素数组，0-100
    let topDriveIdx    = 0;             // 亲和度最高的驱动力下标
    let topDriveIdx2   = 1;             // 第二高

    try {
        const fc = chartData._fullChart || (chartData._creativeParams && chartData._fullChart);
        const fullChart = fc || (chartData._fullChart);
        if (
            window.ChartBridge &&
            typeof window.ChartBridge.calcDriveAffinityVector === 'function' &&
            fullChart && fullChart.palaces
        ) {
            const mingIdx = fullChart.mingPalace && fullChart.mingPalace.index !== undefined
                            ? fullChart.mingPalace.index : 0;
            affinityVector = window.ChartBridge.calcDriveAffinityVector(fullChart, mingIdx);
            // 找最高&第二高亲和度下标
            if (affinityVector) {
                const sorted = affinityVector
                    .map((v, i) => ({ v, i }))
                    .sort((a, b) => b.v - a.v);
                topDriveIdx  = sorted[0] ? sorted[0].i : 0;
                topDriveIdx2 = sorted[1] ? sorted[1].i : 1;
            }
        }
    } catch (e) {
        console.warn('[generate8PersonalityTypes] 亲和度计算出错（非致命）:', e);
    }

    // ── 渲染驱动力卡片（命盘亲和度标注） ────────────────────────────────
    // 简体中文8种标签（固定顺序，用于内部逻辑 key，不受语言切换影响）
    var _ZH_DRIVE_LABELS = ['野心者','执念者','谋局者','享乐者','守护者','破局者','漂泊者','隐忍者'];
    const _dyn = (typeof getDynamic === 'function') ? getDynamic() : {};
    grid.innerHTML = personalityTypes.map((type, i) => {
        const label         = (typeof type === 'object') ? type.label : type;
        // zhLabel：简体中文标签（用于 relationMap / _resolveSihuaType 等内部匹配，不受语言影响）
        const zhLabel       = _ZH_DRIVE_LABELS[i] || label;
        const keIdx         = (typeof type === 'object') ? (type.keIdx !== undefined ? type.keIdx : i) : i;
        const desc          = (typeof type === 'object' && type.desc) ? type.desc : label;
        const coreConflict  = (typeof type === 'object' && type.coreConflict) ? type.coreConflict : '';
        const wound         = (typeof type === 'object' && type.wound) ? type.wound : '';
        const starHint      = (typeof type === 'object' && type.starHint) ? type.starHint : '';

        // 命盘亲和度标签
        const affScore  = affinityVector ? affinityVector[i] : null;
        const isTop1    = affinityVector && i === topDriveIdx;
        const isTop2    = affinityVector && i === topDriveIdx2;
        const isSelected = i === 0;

        // 亲和度角标（三语言）
        let affinityBadge = '';
        if (isTop1) {
            affinityBadge = `<div class="drive-affinity-badge top1" style="position:absolute;top:6px;right:6px;background:linear-gradient(135deg,#8B0000,#B8860B);color:#fff;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:700;letter-spacing:0.03em;box-shadow:0 2px 8px rgba(139,0,0,0.35);">${_dyn.badgeTop1 || '✦ 命盘首选'}</div>`;
        } else if (isTop2) {
            affinityBadge = `<div class="drive-affinity-badge top2" style="position:absolute;top:6px;right:6px;background:linear-gradient(135deg,#B8860B,#d4a830);color:#fff;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;letter-spacing:0.03em;opacity:0.9;">${_dyn.badgeTop2 || '◈ 次选'}</div>`;
        } else if (affScore !== null) {
            affinityBadge = `<div class="drive-affinity-badge" style="position:absolute;top:6px;right:6px;color:#999;font-size:9px;padding:1px 5px;border-radius:20px;border:1px solid rgba(150,150,150,0.25);">${affScore}%</div>`;
        }

        // 亲和度进度条（底部）
        const progressBar = affScore !== null
            ? `<div style="margin-top:6px;height:3px;border-radius:3px;background:rgba(139,0,0,0.08);overflow:hidden;"><div style="height:100%;width:${affScore}%;background:${isTop1 ? 'linear-gradient(90deg,#8B0000,#B8860B)' : isTop2 ? 'rgba(184,134,11,0.6)' : 'rgba(150,150,150,0.3)'};border-radius:3px;transition:width 0.6s ease;"></div></div>`
            : '';

        return `
            <div class="star-card ${isSelected ? 'selected' : ''}" data-personality="${zhLabel}" data-display-label="${label}" data-ke-idx="${keIdx}"
                 style="position:relative;${isTop1 ? 'border-color:rgba(139,0,0,0.45);box-shadow:0 0 0 2px rgba(139,0,0,0.12);' : ''}">
                ${affinityBadge}
                <div class="star-name">${label}</div>
                <div class="star-desc">${desc}</div>
                ${coreConflict ? `<div class="star-conflict" style="font-size:11px;color:#e74c3c;margin-top:4px;line-height:1.4;opacity:0.9;">${coreConflict}</div>` : ''}
                ${wound ? `<div class="star-wound" style="font-size:10px;color:#999;margin-top:3px;line-height:1.3;font-style:italic;">${typeof tDyn === 'function' ? (tDyn('woundLabel') || '伤') : '伤'}：${wound}</div>` : ''}
                ${progressBar}
            </div>
        `;
    }).join('');
    
    // 绑定点击事件：选中即锁定keIdx，重新精确排盘
    grid.querySelectorAll('.star-card').forEach(card => {
        card.addEventListener('click', () => {
            grid.querySelectorAll('.star-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedSubPattern = card.dataset.personality;
            // 同时保存数字索引（语言无关key，用于i18n存储）
            selectedSubPatternIdx = parseInt(card.dataset.driveIdx || card.dataset.keIdx || '0');
            
            // 把keIdx存入userInputs，锁定时辰刻 → 精确到1152分之一的命盘
            const keIdx = parseInt(card.dataset.keIdx || '0');
            userInputs.keIdx = keIdx;
            
            // 用keIdx重新排出精确命盘，更新selectedChart
            const refined = generate144Chart({ ...userInputs, keIdx });
            selectedChart = buildChartProxy(refined);
        });
    });
    
    // 默认选第0个（selectedSubPattern 始终存简体标签，用于内部逻辑）
    selectedSubPattern = _ZH_DRIVE_LABELS[0] || ((typeof personalityTypes[0] === 'object') ? personalityTypes[0].label : (personalityTypes[0] || ''));
    userInputs.keIdx = 0;
}

/** 把排盘结果包装为selectedChart格式（兼容旧UI字段） */
function buildChartProxy(chartData) {
    return {
        ...chartData,
        name: chartData.pattern.name,
        stars: chartData.pattern.stars,
        desc: chartData.pattern.desc,
        type: chartData.patternType,
        chartId: chartData.chartUid || chartData.chartId,
        _fullChart: chartData,
    };
}

function generateSubPatterns() {
    // 这个函数已被generate8PersonalityTypes替代
    matchChart();
}

function confirmSubPattern() {
    initEightAttributes();
    showStep(4);
}

// ==================== 辅助函数：获取兜底选项 ====================
function getFallbackOptions(attrId) {
    const lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    
    // 三语言兜底选项
    const FALLBACK_OPTIONS = {
        zh: {
            appearance: ['威严霸气', '温和儒雅', '锐利干练', '柔和亲和', '独特个性', '普通平凡'],
            speech: ['简洁有力', '温和委婉', '热情洋溢', '沉稳冷静', '幽默风趣', '寡言少语'],
            behavior: ['雷厉风行', '深思熟虑', '随性而为', '谨慎小心', '有条不紊', '自由散漫'],
            emotion: ['外露直白', '内敛含蓄', '丰富多变', '稳定平和', '理性克制', '感性冲动'],
            social: ['主动热情', '被动等待', '理性交往', '感性相交', '圆滑世故', '直率真诚'],
            crisis: ['冷静分析', '果断行动', '寻求帮助', '逃避回避', '慌乱无措', '坚定抵抗'],
            learning: ['快速学习', '稳步积累', '依赖经验', '善于应变', '固执己见', '灵活调整'],
            growth: ['追求成功', '追求自由', '追求安稳', '追求真理', '追求情感', '追求平衡']
        },
        'zh-TW': {
            appearance: ['威嚴霸氣', '溫和儒雅', '銳利幹練', '柔和親和', '獨特個性', '普通平凡'],
            speech: ['簡潔有力', '溫和委婉', '熱情洋溢', '沉穩冷靜', '幽默風趣', '寡言少語'],
            behavior: ['雷厲風行', '深思熟慮', '隨性而為', '謹慎小心', '有條不紊', '自由散漫'],
            emotion: ['外露直白', '內斂含蓄', '豐富多變', '穩定平和', '理性克制', '感性衝動'],
            social: ['主動熱情', '被動等待', '理性交往', '感性相交', '圓滑世故', '直率真誠'],
            crisis: ['冷靜分析', '果斷行動', '尋求幫助', '逃避回避', '慌亂無措', '堅定抵抗'],
            learning: ['快速學習', '穩步積累', '依賴經驗', '善於應變', '固執己見', '靈活調整'],
            growth: ['追求成功', '追求自由', '追求安穩', '追求真理', '追求情感', '追求平衡']
        },
        en: {
            appearance: ['Commanding', 'Gentle & Refined', 'Sharp & Capable', 'Warm & Approachable', 'Distinctive', 'Ordinary'],
            speech: ['Direct & Concise', 'Tactful & Soft', 'Enthusiastic', 'Calm & Measured', 'Humorous', 'Reserved'],
            behavior: ['Decisive', 'Thoughtful', 'Spontaneous', 'Cautious', 'Methodical', 'Unstructured'],
            emotion: ['Openly Expressive', 'Reserved', 'Changeable', 'Stable', 'Rationally Controlled', 'Impulsive'],
            social: ['Proactive', 'Passive', 'Rational', 'Emotionally Guided', 'Diplomatic', 'Frank'],
            crisis: ['Calm Analysis', 'Swift Action', 'Seeks Help', 'Avoidance', 'Panics', 'Firm Resistance'],
            learning: ['Fast Learner', 'Steady Accumulator', 'Experience-reliant', 'Adaptable', 'Stubborn', 'Flexible'],
            growth: ['Achievement', 'Freedom', 'Stability', 'Truth', 'Connection', 'Balance']
        }
    };
    
    const langOptions = FALLBACK_OPTIONS[lang] || FALLBACK_OPTIONS.zh;
    return langOptions[attrId] || langOptions.appearance;
}

// ==================== 步骤4: 8属性细化 ====================
function initEightAttributes() {
    const container = document.getElementById('step-4-content');
    
    // 从 i18n 动态数据层取8属性（三语言）
    const dyn = (typeof getDynamic === 'function') ? getDynamic() : null;
    
    // 基础属性定义（从动态数据获取）
    const attributeDefs = (dyn && dyn.attr) ? dyn.attr.map(attr => ({
        id: attr.id,
        name: attr.name
    })) : [
        { id: 'appearance', name: '外貌特征' },
        { id: 'speech',     name: '说话方式' },
        { id: 'behavior',   name: '行为习惯' },
        { id: 'emotion',    name: '情感表达' },
        { id: 'social',     name: '社交风格' },
        { id: 'crisis',     name: '应对危机' },
        { id: 'learning',   name: '学习适应' },
        { id: 'growth',     name: '成长方向' },
    ];
    
    // ── ★ 紫微斗数丰富动态词库：根据命盘生成丰富选项 ────────────────────────────
    let dynamicOptions = {};
    try {
        if (selectedChart) {
            // 提取命盘数据
            const chartData = {
                mainStar: selectedChart.mainStar || '紫微',
                sihuaType: selectedChart.sihuaType || '化禄型',
                patternType: selectedChart.patternType || '杀破狼',
                era: selectedEra || 'contemporary'
            };
            
            // 优先使用丰富词库系统
            let allVocab = {};
            if (window.RichZiweiWordLibrary && typeof window.RichZiweiWordLibrary.generateAllDimensionsVocabulary === 'function') {
                allVocab = window.RichZiweiWordLibrary.generateAllDimensionsVocabulary(chartData);
                console.log('[initEightAttributes] 丰富词库已生成（包含数千词汇）:', allVocab);
                
                // 显示统计信息
                const stats = window.RichZiweiWordLibrary.getStats();
                console.log('[initEightAttributes] 词库统计:', stats);
            }
            // 降级到原始词库
            else if (window.ZiweiWordLibrary && typeof window.ZiweiWordLibrary.generateAllDimensionsVocabulary === 'function') {
                allVocab = window.ZiweiWordLibrary.generateAllDimensionsVocabulary(chartData);
                console.log('[initEightAttributes] 动态词库已生成:', allVocab);
            }
            // 降级到增强词库
            else if (window.WritingLibraryEnhancer && typeof window.WritingLibraryEnhancer.getCombinedVocabulary === 'function') {
                const dimensions = ['appearance', 'speech', 'behavior', 'emotion', 'social', 'crisis', 'learning', 'growth'];
                dimensions.forEach(dimension => {
                    const words = window.WritingLibraryEnhancer.getCombinedVocabulary(chartData, dimension, 8);
                    allVocab[dimension] = words;
                });
                console.log('[initEightAttributes] 增强词库已生成:', allVocab);
            }
            
            // 转换格式
            attributeDefs.forEach(attr => {
                if (allVocab[attr.id] && allVocab[attr.id].length > 0) {
                    dynamicOptions[attr.id] = allVocab[attr.id];
                }
            });
        }
    } catch (e) {
        console.warn('[initEightAttributes] 词库生成出错:', e);
    }
    
    // ── 构建 Step 4 选项列表 ────────────────────────────────
    // 核心原则：Step 4 用户选词 → 四字短词（FALLBACK_OPTIONS），有区分度易选择
    //             Step 5 输出用 → RichZiweiWordLibrary（50条长词+三层修饰，专业输出）
    // 优先级：FALLBACK_OPTIONS（四字短词）> i18n数据 > 硬编码兜底
    const attributes = attributeDefs.map(attr => {
        const currentLang = (typeof CURRENT_LANG !== 'undefined') ? CURRENT_LANG : 'zh';

        // 1. 简体中文/繁体/英文：统一用 FALLBACK_OPTIONS 四字词（6条，区分度好）
        const fallbackOpts = getFallbackOptions(attr.id);
        if (fallbackOpts && fallbackOpts.length > 0) {
            return {
                id: attr.id,
                name: attr.name,
                options: fallbackOpts.slice(0, 6)
            };
        }

        // 2. i18n 数据兜底
        if (dyn && dyn.attr) {
            const dynAttr = dyn.attr.find(a => a.id === attr.id);
            if (dynAttr && dynAttr.options && dynAttr.options.length > 0) {
                return {
                    id: attr.id,
                    name: attr.name,
                    options: dynAttr.options.slice(0, 6)
                };
            }
        }

        // 3. 硬编码（最后防线）
        return {
            id: attr.id,
            name: attr.name,
            options: []
        };
    });

    // ── ★ 命盘算法驱动：获取8属性命盘推荐 ────────────────────────────
    let attrRec = null;
    try {
        const fullChart = selectedChart && (selectedChart._fullChart || selectedChart._creativeParams && selectedChart);
        const fc = selectedChart && selectedChart._fullChart;
        if (
            fc && fc.palaces &&
            window.ChartBridge &&
            typeof window.ChartBridge.calcAttributeRecommendations === 'function'
        ) {
            const mingIdx = fc.mingPalace && fc.mingPalace.index !== undefined ? fc.mingPalace.index : 0;
            attrRec = window.ChartBridge.calcAttributeRecommendations(
                fc, mingIdx, selectedChart.patternType || ''
            );
        }
    } catch (e) {
        console.warn('[initEightAttributes] 命盘推荐计算出错（非致命）:', e);
    }
    
    container.innerHTML = attributes.map(attr => {
        const rec = attrRec && attrRec[attr.id];
        const _dyn2 = (typeof getDynamic === 'function') ? getDynamic() : {};
        const badgeSrc = (_dyn2.badgeSource && typeof _dyn2.badgeSource === 'function') ? _dyn2.badgeSource(rec && rec.source) : ((rec && rec.source || 'Chart') + ': ');
        const badgeAttrLabel = _dyn2.badgeAttr || 'Chart Tendency';
        return `
        <div class="attribute-group">
            <div class="attribute-label">
                ${attr.name}
                ${rec ? `<span style="font-size:10px;color:#B8860B;font-weight:400;margin-left:6px;opacity:0.85;">✦ ${badgeSrc}${rec.recommend}</span>` : ''}
            </div>
            <div class="attribute-options">
                ${attr.options.map(opt => {
                    const isRecommended = rec && rec.recommend === opt;
                    const recStyle = isRecommended
                        ? 'border-color:rgba(139,0,0,0.5);box-shadow:0 0 0 2px rgba(139,0,0,0.1);position:relative;'
                        : '';
                    const recBadge = isRecommended
                        ? `<span style="position:absolute;top:-7px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#8B0000,#B8860B);color:#fff;font-size:8px;padding:1px 5px;border-radius:10px;white-space:nowrap;font-weight:600;pointer-events:none;">${badgeAttrLabel}</span>`
                        : '';
                    return `
                    <div class="attribute-option" data-attr="${attr.id}" data-value="${opt}"
                         title="${isRecommended && rec ? rec.reason : ''}"
                         style="${recStyle}">
                        ${recBadge}
                        ${opt}
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }).join('');
    
    container.querySelectorAll('.attribute-option').forEach(option => {
        option.addEventListener('click', () => {
            const attrId = option.dataset.attr;
            const value = option.dataset.value;
            const group = option.closest('.attribute-group');
            
            group.querySelectorAll('.attribute-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            eightAttributes[attrId] = value;
        });
    });
}

// ==================== 步骤5: 生成人物小传 ====================
function generateFinalBio() {
    try {
        if (!selectedChart) {
            showToast(tUI('toastFinishChartMatch'));
            showStep(3);
            return;
        }
        if (!selectedSubPattern) {
            showToast(tUI('toastSelectSihua'));
            showStep(3);
            return;
        }

        // 8属性软处理：漏选的用主星推导，不拦截，只轻提示
        var missingAttrs = ['appearance','speech','behavior','emotion','social','crisis','learning','growth']
            .filter(function(id) { return !eightAttributes[id]; });
        if (missingAttrs.length > 0 && missingAttrs.length < 8) {
            var _toastAttrs = tUI('toastAttrsPartial');
            showToast(typeof _toastAttrs === 'function' ? _toastAttrs(missingAttrs.length) : ('💡 ' + missingAttrs.length + ' 项未选择，对应内容将以模糊风格呈现'));
        }

        // ── 先跳到步骤5，显示loading动效 ──
        showStep(5);
        var resultDiv = document.getElementById('result-content');
        resultDiv.innerHTML = _buildLoadingHTML();

        // ── 双 rAF + setTimeout 确保loading先完整渲染到屏幕，再执行生成 ──
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                setTimeout(function() {
                    try {
                        var bio = generateZiweiCharacterBio(userInputs, selectedChart, eightAttributes, selectedSubPattern);
                        currentCharacterBio = bio;
                        resultDiv.innerHTML = renderMarkdown(bio);
                    } catch (err) {
                        resultDiv.innerHTML = '';
                        var _toastErr = tUI('toastGenerateError');
                        showToast(typeof _toastErr === 'function' ? _toastErr(err.message) : ('生成出错，请重试（' + err.message + '）'));
                    }
                }, 300);
            });
        });

    } catch (error) {
        console.error('生成人物小传时出错:', error);
        var _toastErr2 = tUI('toastGenerateError');
        showToast(typeof _toastErr2 === 'function' ? _toastErr2(error.message) : ('生成出错，请重试（' + error.message + '）'));
    }
}

function _buildLoadingHTML() {
    return '<div id="bio-loading" style="' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'padding:60px 20px;gap:20px;">' +

        // 星盘旋转图
        '<div style="position:relative;width:80px;height:80px;">' +
            '<div style="position:absolute;inset:0;border-radius:50%;border:3px solid rgba(139,0,0,0.12);"></div>' +
            '<div style="position:absolute;inset:0;border-radius:50%;border:3px solid transparent;' +
                'border-top-color:#8B0000;animation:bioSpinOuter 1.1s linear infinite;"></div>' +
            '<div style="position:absolute;inset:12px;border-radius:50%;border:2px solid transparent;' +
                'border-bottom-color:#B8860B;animation:bioSpinInner 0.8s linear infinite reverse;"></div>' +
            '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
                'font-size:26px;">✦</div>' +
        '</div>' +

        // 文字动效
        '<div id="bio-loading-text" style="' +
            'font-size:15px;color:#8B0000;font-weight:500;letter-spacing:0.05em;' +
            'animation:bioTextPulse 1.4s ease-in-out infinite;">' +
            (typeof tUI === 'function' ? tUI('loading') : '推算命盘星曜中…') +
        '</div>' +

        '<style>' +
            '@keyframes bioSpinOuter{to{transform:rotate(360deg)}}' +
            '@keyframes bioSpinInner{to{transform:rotate(360deg)}}' +
            '@keyframes bioTextPulse{0%,100%{opacity:0.5}50%{opacity:1}}' +
        '</style>' +
    '</div>';
}

// ==================== Markdown渲染器 ====================
function renderMarkdown(markdown) {
    if (!markdown) return '';
    var lines = markdown.split('\n');
    var html = '';
    var i = 0;

    while (i < lines.length) {
        var line = lines[i];

        // 标题
        if (/^### (.+)/.test(line)) {
            html += '<h3>' + line.replace(/^### /, '') + '</h3>';
            i++; continue;
        }

        // blockquote（命格标签行）
        if (/^> (.*)/.test(line)) {
            var bqContent = line.replace(/^> /, '');
            html += '<blockquote><p>' + renderInline(bqContent) + '</p></blockquote>';
            i++; continue;
        }
        if (/^## (.+)/.test(line)) {
            html += '<h2>' + line.replace(/^## /, '') + '</h2>';
            i++; continue;
        }
        if (/^# (.+)/.test(line)) {
            html += '<h1>' + line.replace(/^# /, '') + '</h1>';
            i++; continue;
        }

        // 分割线
        if (/^---$/.test(line.trim())) {
            html += '<hr>';
            i++; continue;
        }

        // 表格（连续 | 开头的行）
        if (/^\|/.test(line)) {
            var tableLines = [];
            while (i < lines.length && /^\|/.test(lines[i])) {
                tableLines.push(lines[i]);
                i++;
            }
            // 过滤掉分隔行 |---|---|
            var dataRows = tableLines.filter(function(l) { return !/^\|[-| :]+\|$/.test(l.trim()); });
            html += '<table class="bio-table">';
            dataRows.forEach(function(row, idx) {
                var cells = row.split('|').filter(function(c, ci) { return ci > 0 && ci < row.split('|').length - 1; });
                var tag = idx === 0 ? 'th' : 'td';
                html += '<tr>' + cells.map(function(c) {
                    return '<' + tag + '>' + renderInline(c.trim()) + '</' + tag + '>';
                }).join('') + '</tr>';
            });
            html += '</table>';
            continue;
        }

        // 无序列表
        if (/^- (.+)/.test(line)) {
            html += '<ul>';
            while (i < lines.length && /^- (.+)/.test(lines[i])) {
                html += '<li>' + renderInline(lines[i].replace(/^- /, '')) + '</li>';
                i++;
            }
            html += '</ul>';
            continue;
        }

        // 有序列表
        if (/^\d+\. (.+)/.test(line)) {
            html += '<ol>';
            while (i < lines.length && /^\d+\. (.+)/.test(lines[i])) {
                html += '<li>' + renderInline(lines[i].replace(/^\d+\. /, '')) + '</li>';
                i++;
            }
            html += '</ol>';
            continue;
        }

        // 空行
        if (line.trim() === '') {
            i++; continue;
        }

        // 普通段落
        html += '<p>' + renderInline(line) + '</p>';
        i++;
    }

    return html;
}

function renderInline(text) {
    // 粗体
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 斜体
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // 行内代码
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    return text;
}

// ==================== 桥接新排盘引擎 ====================

/**
 * generate144Chart：调用排盘引擎生成精准命盘
 * ─────────────────────────────────────────────────
 * 优先级：
 *   1. ChartBridge.generateEnrichedChart() —— 骨架→肉通道（完整飞星/大限）
 *   2. FineChartEngine.generateChart()     —— 基础排盘
 *   3. 旧版 CHART_DATABASE 回退（不应触发）
 */
function generate144Chart(inputs) {
  const keIdx = typeof inputs.keIdx === 'number' ? inputs.keIdx : 0;

  // ── 优先：ChartBridge 完整通道（真实飞星/大限/四化数据→编创参数）──
  if (typeof window.ChartBridge !== 'undefined' && typeof window.ChartBridge.generateEnrichedChart === 'function') {
    try {
      const enriched = window.ChartBridge.generateEnrichedChart(inputs, keIdx);
      if (enriched) {
        console.log('[generate144Chart] ✅ 使用 ChartBridge 完整通道，命宫主星:', enriched.pattern.stars);
        return enriched;
      }
    } catch (e) {
      console.warn('[generate144Chart] ChartBridge 出错，降级:', e);
    }
  }

  // ── 次选：FineChartEngine 基础排盘 ──
  if (window.FineChartEngine) {
    try {
      const engine = window.FineChartEngine;
      const result = engine.generateChart({
        birthYear:  inputs.birthYear  || new Date().getFullYear() - (parseInt(inputs.age) || 25),
        birthMonth: inputs.birthMonth || 6,
        birthDay:   inputs.birthDay   || 15,
        birthHour:  inputs.birthHour  || 12,
        gender:     inputs.gender     || '男',
        era:        inputs.era        || '当代都市',
      });

      // 从完整飞星结果中提取命宫主星
      const mingIdx   = result.mingPalace && result.mingPalace.index !== undefined ? result.mingPalace.index : 0;
      const mingPalace = result.palaces ? result.palaces[mingIdx] : {};
      const mainStars = (mingPalace && mingPalace.mainStars) || [];
      const patternName = mainStars.join('') || '命主格局';

      // 格局类型推断
      const STAR_TO_PAT = {
          '七杀':'杀破狼','破军':'杀破狼','贪狼':'杀破狼',
          '紫微':'紫府廉武相','天府':'紫府廉武相','廉贞':'紫府廉武相',
          '武曲':'紫府廉武相','天相':'紫府廉武相',
          '天机':'机月同梁','太阴':'机月同梁','天同':'机月同梁','天梁':'机月同梁',
          '太阳':'巨日','巨门':'巨日'
      };
      const patternType = STAR_TO_PAT[mainStars[0]] || '杀破狼';

      console.log('[generate144Chart] ✅ 使用 FineChartEngine 基础排盘，命宫主星:', mainStars);
      return {
        pattern:      { name: patternName, stars: mainStars, desc: '命盘格局独特' },
        patternType,
        shiChen:      result.mingPalace ? result.mingPalace.dizhi : '午',
        ke:           keIdx,
        chartId:      (result._meta && result._meta.generatedAt) || Date.now().toString(36),
        personalityTypes: DRIVE_8_TYPES,
        sihua:        result.fourTransformations || {},
        mingGong:     { stars: mainStars, desc: '' },
        fuqiGong:     { stars: (result.palaces && result.palaces[(mingIdx + 2) % 12]
                               ? result.palaces[(mingIdx + 2) % 12].mainStars : []) },
        _fullChart:   result,
      };
    } catch (e) {
      console.warn('[generate144Chart] FineChartEngine 出错，回退:', e);
    }
  }

  // ── 回退：使用旧版 CHART_DATABASE（降级兜底，不应正常触发）──
  console.warn('[generate144Chart] ⚠️ 所有引擎不可用，使用旧版 CHART_DATABASE');
  const typeKeys = Object.keys(CHART_DATABASE);
  const _h = function(s) { var h=0; for(var i=0;i<s.length;i++) h=Math.imul(31,h)+s.charCodeAt(i)|0; return Math.abs(h); };
  const idx = _h(inputs.name || inputs.era || 'default') % typeKeys.length;
  const typeKey = typeKeys[idx];
  const typeData = CHART_DATABASE[typeKey];
  const patterns = typeData.patterns;
  const patternIdx = (_h((inputs.gender||'') + (inputs.age||'') + keIdx) % patterns.length);
  const pattern = patterns[patternIdx];

  return {
    pattern,
    patternType: typeKey,
    shiChen: '午',
    ke: keIdx,
    chartId: `legacy-${idx}-${patternIdx}-k${keIdx}`,
    personalityTypes: DRIVE_8_TYPES,
    sihua: {},
    mingGong: { stars: pattern.stars, desc: pattern.desc },
    fuqiGong: { stars: [] },
    _fullChart: null,
  };
}

/**
 * generateZiweiCharacterBio：人物小传生成引擎调度
 * 优先走增强版（面相+词库+20问+爽点桥段+悬念手法），回退基础版
 */
function generateZiweiCharacterBio(inputs, chart, eightAttrs, subPattern) {
  // ── 优先：新版8模块 2400字+ 核心引擎（ziwei-bio-core.js → window._ziweiCoreGenerateBio）──
  if (typeof window._ziweiCoreGenerateBio === 'function') {
    try {
      var userData = {
        name:       inputs.name || '',
        gender:     inputs.gender || 'male',
        era:        inputs.era || 'contemporary',
        age:        inputs.age || 'youth',
        profession: inputs.career || inputs.profession || 'other',
        family:     inputs.family   || '',
        socialClass:inputs.social   || '',   // 注意：步骤2的"社会地位"叫social，8属性里的"社交风格"也叫social，这里用socialClass区分
        parents:    inputs.parents  || '',
        siblings:   inputs.siblings || '',
        // ⚡ 传递完整驱动力数据（含核心冲突/伤口/星曜提示）
        driveLabel: subPattern || '',
        driveData:  _getDriveData(subPattern)
      };
      // 解析四化类型：subPattern → 8种精细子类型（保留阳/阴差异）
      var sihuaType = _resolveSihuaType(subPattern, chart);
      // chart 整形：保证 stars/type/name/desc/mainStar 字段存在
      var chartObj = _normalizeChart(chart);
      return window._ziweiCoreGenerateBio(userData, chartObj, eightAttrs || {}, sihuaType);
    } catch (e) {
      console.warn('新版8模块引擎出错，回退增强版:', e);
    }
  }

  // ── 次选：增强版 ──
  var era = inputs.era || 'contemporary';
  var characterData = {
    name: inputs.name || '', gender: inputs.gender || 'male',
    age: inputs.age || 'youth', driveType: subPattern || '',
    eightAttributes: eightAttrs,
  };
  if (typeof generateEnhancedCharacterBio === 'function') {
    try {
      var bioObj = generateEnhancedCharacterBio(chart, era, characterData);
      if (bioObj && bioObj.fullBio) return bioObj.fullBio;
    } catch (e) {
      console.warn('增强版小传引擎出错，回退兜底:', e);
    }
  }

  // ── 兜底 ──
  var pr = inputs.gender === '男' ? '他' : '她';
  var nm = inputs.name || (pr === '他' ? '男主' : '女主');
  var stars = ((chart.pattern && chart.pattern.stars) || []).join('、') || '命主';
  return '【人物小传：' + nm + '】\n\n' + pr + '命盘主星为' + stars + '\n\n驱动力：' + (subPattern || '未选择');
}

// 将 subPattern（驱动力名称）映射到四化类型
// ⚡ 关键：8种驱动力各自有独立的"四化子类型"，不再压缩成4种
function _resolveSihuaType(subPattern, chart) {
  if (!subPattern) return '化禄型';
  // 直接是四化类型名
  if (/化禄|化权|化科|化忌/.test(subPattern)) {
    var m = subPattern.match(/化[禄权科忌]/);
    return m ? m[0] + '型' : '化禄型';
  }
  // 8种驱动力 → 精细四化子类型（阳/阴区分，保留差异化）
  var driveMap = {
    '野心者':   '掌控主导型（化权阳）',  // 化权·外显·扩张
    '执念者':   '执念深重型（化忌阳）',  // 化忌·外显·执着
    '谋局者':   '声誉理想型（化科阳）',  // 化科·外显·算计
    '享乐者':   '天赋优势型（化禄阳）',  // 化禄·外显·感受
    '守护者':   '天赋内秀型（化禄阴）',  // 化禄·内隐·给予
    '破局者':   '掌控内敛型（化权阴）',  // 化权·内隐·颠覆
    '漂泊者':   '执念内化型（化忌阴）',  // 化忌·内隐·游离
    '隐忍者':   '声誉内修型（化科阴）',  // 化科·内隐·承压
  };
  if (driveMap[subPattern]) return driveMap[subPattern];
  // 兼容旧版4类名称
  var legacyMap = {
    '天才型':'化禄型', '流浪者':'化权型', '救赎者':'化科型',
    '复仇者':'化忌型',
    '天赋优势型':'化禄型', '掌控主导型':'化权型',
    '声誉理想型':'化科型', '执念深重型':'化忌型',
    '天赋内秀型':'化禄型', '掌控内敛型':'化权型',
    '声誉内修型':'化科型', '执念内化型':'化忌型'
  };
  for (var key in legacyMap) {
    if (subPattern.indexOf(key) !== -1) return legacyMap[key];
  }
  return '化禄型';
}

// 根据驱动力名称取完整驱动力对象（含核心冲突/伤口/星曜提示）
function _getDriveData(subPattern) {
  if (!subPattern) return null;
  // 先在 DRIVE_8_TYPES 里查
  for (var i = 0; i < DRIVE_8_TYPES.length; i++) {
    if (DRIVE_8_TYPES[i].label === subPattern) return DRIVE_8_TYPES[i];
  }
  // 再在 PERSONALITY_8_TYPES（ziwei-bio-core.js）里查
  if (window.PERSONALITY_8_TYPES && window.PERSONALITY_8_TYPES[subPattern]) {
    return window.PERSONALITY_8_TYPES[subPattern];
  }
  return null;
}

// 整形 chart 对象，保证字段统一
function _normalizeChart(chart) {
  if (!chart) return {stars:['紫微'], type:'杀破狼', name:'紫微独坐', desc:'', mainStar:'紫微'};
  var pattern = chart.pattern || {};
  var stars   = pattern.stars || chart.stars || (chart.mainStar ? [chart.mainStar] : ['紫微']);
  var type    = chart.patternType || chart.type || (pattern.name ? _guessPatternType(stars) : '杀破狼');
  // ── 保留所有 ChartBridge 扩展字段（_creativeParams / _fullChart / _palaces 等）──
  // 这些字段是骨架→肉通道的核心数据，不能在整形时丢弃
  var normalized = {
    stars:    stars,
    type:     type,
    name:     pattern.name  || chart.name  || stars[0] + '格局',
    desc:     pattern.desc  || chart.desc  || '',
    mainStar: stars[0],
    // 透传命宫宫位结构（_getPalaceStars 在 ziwei-bio-core 中会用到 mingIdx）
    mingIdx:  chart.mingIdx !== undefined ? chart.mingIdx : undefined,
    mainStars: chart.mainStars || undefined,
    fourTrans: chart.fourTrans || undefined,
  };
  // 透传所有下划线开头的扩展字段（_creativeParams / _fullChart / _palaces / _sihuaProfile 等）
  var keys = Object.keys(chart);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k.charAt(0) === '_') {
      normalized[k] = chart[k];
    }
  }
  return normalized;
}

function _guessPatternType(stars) {
  var killStars = ['七杀','破军','贪狼'];
  var purpleStars = ['紫微','天府','廉贞','武曲','天相'];
  var moonStars = ['天机','太阴','天同','天梁'];
  var sunStars = ['太阳','巨门'];
  for (var i = 0; i < stars.length; i++) {
    if (killStars.indexOf(stars[i]) !== -1) return '杀破狼';
    if (purpleStars.indexOf(stars[i]) !== -1) return '紫府廉武相';
    if (moonStars.indexOf(stars[i]) !== -1) return '机月同梁';
    if (sunStars.indexOf(stars[i]) !== -1) return '巨日';
  }
  return '杀破狼';
}

// ==================== 角色保存系统 ====================
function saveCharacter() {
    if (savedCharacters.length >= 10) {
        showToast(tUI('toastSavedFull'));
        return;
    }
    
    const name = userInputs.name || '未命名角色';
    const timestamp = new Date().toLocaleString('zh-CN');
    
    // driveIndex：驱动力数字索引（0-7），语言无关，是真正的存储key
    // sihua：当时语言的标签（用于bio内容兼容，但显示时不直接用）
    const driveIdx = selectedSubPatternIdx >= 0 ? selectedSubPatternIdx : (() => {
        var ZH = ['野心者','执念者','谋局者','享乐者','守护者','破局者','漂泊者','隐忍者'];
        var idx = ZH.indexOf(selectedSubPattern);
        return idx >= 0 ? idx : 0;
    })();

    const character = {
        id: Date.now(),
        name: name,
        timestamp: timestamp,
        inputs: { ...userInputs },
        chart: { ...selectedChart },
        attributes: { ...eightAttributes },
        sihua: selectedSubPattern,
        driveIndex: driveIdx,          // ← 语言无关key
        bio: currentCharacterBio
    };
    
    savedCharacters.push(character);
    localStorage.setItem('starTrackCharacters', JSON.stringify(savedCharacters));
    
    var _toastSaved = tUI('toastSavedSuccess');
    showToast(typeof _toastSaved === 'function' ? _toastSaved(name, savedCharacters.length) : ('「' + name + '」已保存 (' + savedCharacters.length + '/10)'), 'success');
    displaySavedCharacters();
}

function copyCharacterBio() {
    if (!currentCharacterBio) {
        showToast(tUI('toastNoBio'));
        return;
    }
    
    // 转换为纯文本格式
    const plainText = currentCharacterBio
        .replace(/\*\*(.*?)\*\*/g, '$1')  // 移除粗体标记
        .replace(/^# (.*?)$/gm, '$1\n' + '='.repeat(50))  // 标题
        .replace(/^## (.*?)$/gm, '\n$1\n' + '-'.repeat(30))  // 二级标题
        .replace(/^### (.*?)$/gm, '\n$1')  // 三级标题
        .replace(/^---$/gm, '\n' + '='.repeat(50) + '\n');  // 分割线
    
    navigator.clipboard.writeText(plainText).then(() => {
        showToast(tUI('toastCopied'), 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast(tUI('toastCopyFail'));
    });
}

function loadSavedCharacters() {
    const saved = localStorage.getItem('starTrackCharacters');
    if (saved) {
        savedCharacters = JSON.parse(saved);
        if (savedCharacters.length > 0) {
            displaySavedCharacters();
        }
    }
}

function displaySavedCharacters() {
    const section = document.getElementById('saved-characters-section');
    const list = document.getElementById('saved-characters-list');
    const compareBtn = document.getElementById('compare-btn-section');
    
    if (savedCharacters.length === 0) {
        section.style.display = 'none';
        compareBtn.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    console.log('保存角色数量:', savedCharacters.length, '至少2个才能显示对比按钮');
    var shouldShow = savedCharacters.length >= 2;
    console.log('对比按钮是否显示:', shouldShow);
    compareBtn.style.display = shouldShow ? 'block' : 'none';
    
    list.innerHTML = savedCharacters.map(char => {
        // i18n：格局名翻译（存的是中文，显示时按当前语言翻译）
        var chartNameDisplay = _getPatternNameI18n(char.chart ? char.chart.name : '');
        // i18n：驱动力标签翻译（优先用driveIndex，否则用sihua中文label反查）
        var driveDisplay = (char.driveIndex !== undefined)
            ? _getDriveLabelByIdx(char.driveIndex)
            : _getDriveLabelI18n(char.sihua || '');
        return `
        <div class="saved-character-item">
            <input type="checkbox" class="compare-checkbox" data-id="${char.id}" style="margin-right: 10px;">
            <div class="character-info">
                <div class="character-name-display">${char.name}</div>
                <div class="character-meta">${chartNameDisplay} · ${driveDisplay} · ${char.timestamp}</div>
            </div>
            <div class="character-actions">
                <button class="btn btn-small" onclick="loadCharacter(${char.id})">${tUI('btnView')}</button>
                <button class="btn btn-small btn-outline" onclick="deleteCharacter(${char.id})">${tUI('btnDelete')}</button>
            </div>
        </div>
    `;
    }).join('');
}

function loadCharacter(id) {
    const char = savedCharacters.find(c => c.id === id);
    if (!char) return;
    
    userInputs = { ...char.inputs };
    selectedChart = { ...char.chart };
    eightAttributes = { ...char.attributes };
    selectedSubPattern = char.sihua;
    currentCharacterBio = char.bio;
    
    document.getElementById('result-content').innerHTML = renderMarkdown(char.bio);
    showStep(5);
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

function deleteCharacter(id) {
    // iOS WKWebView 会屏蔽 confirm()，改用 Toast + 内联二次确认
    var char = savedCharacters.find(function(c) { return c.id === id; });
    var name = char ? char.name : '该角色';

    // 若已有待确认提示，直接执行删除
    if (window._pendingDeleteId === id) {
        window._pendingDeleteId = null;
        savedCharacters = savedCharacters.filter(function(c) { return c.id !== id; });
        localStorage.setItem('starTrackCharacters', JSON.stringify(savedCharacters));
        displaySavedCharacters();
        if (savedCharacters.length === 0) {
            document.getElementById('saved-characters-section').style.display = 'none';
        }
        var _toastDel = tUI('toastDeleted');
        showToast(typeof _toastDel === 'function' ? _toastDel(name) : ('「' + name + '」已删除'), 'success');
        return;
    }

    // 第一次点击：标记待确认，提示用户再点一次
    window._pendingDeleteId = id;
    var _toastDelConf = tUI('toastDeleteConfirm');
    showToast(typeof _toastDelConf === 'function' ? _toastDelConf(name) : ('再次点击「删除」确认删除「' + name + '」'));
    // 3秒后清除待确认状态
    setTimeout(function() {
        if (window._pendingDeleteId === id) window._pendingDeleteId = null;
    }, 3000);
}

function showCompare() {
    console.log('=== showCompare 函数被调用 ===');
    console.log('当前时间:', new Date().toISOString());
    
    // 检查是否有保存的角色
    console.log('保存的角色数量:', savedCharacters.length);
    console.log('保存的角色:', savedCharacters);
    
    const checkboxes = document.querySelectorAll('.compare-checkbox:checked');
    console.log('找到的已选中复选框数量:', checkboxes.length);
    console.log('所有复选框:', document.querySelectorAll('.compare-checkbox'));
    
    // 遍历复选框，检查每个的状态和数据
    document.querySelectorAll('.compare-checkbox').forEach((cb, i) => {
        console.log(`复选框${i}: checked=${cb.checked}, data-id=${cb.dataset.id}`);
    });
    
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    console.log('选中的角色ID:', selectedIds);
    
    if (selectedIds.length < 2) {
        console.log('❌ 需要至少2个角色，当前:', selectedIds.length);
        showToast(tUI('toastMinCompare'));
        return;
    }
    
    if (selectedIds.length > 3) {
        console.log('❌ 最多3个角色，当前:', selectedIds.length);
        showToast(tUI('toastMaxCompare'));
        return;
    }
    
    const selectedChars = selectedIds.map(id => savedCharacters.find(c => c.id === id));
    
    const compareContent = document.getElementById('compare-content');
    compareContent.innerHTML = generateComparison(selectedChars);
    
    var section = document.getElementById('compare-section');
    section.style.display = 'flex';
    // 全屏：锁定 body 滚动
    document.body.style.overflow = 'hidden';
}

function generateComparison(chars) {
    const _dyn = (typeof getDynamic === 'function') ? getDynamic() : {};
    var eraMap = (_dyn.eraMap) ? _dyn.eraMap : {ancient:'古代', modern:'近代', contemporary:'现代'};
    var ageMap = (_dyn.ageMap) ? _dyn.ageMap : {youth:'青年', middle:'中年', senior:'老年'};

    // ── 顶部摘要条 ──
    var summaryItems = chars.map(function(char) {
        var sihua = char.sihua || '';
        // i18n：比较视图也要翻译驱动力标签
        var driveLabel = (char.driveIndex !== undefined && typeof _getDriveLabelByIdx === 'function')
            ? _getDriveLabelByIdx(char.driveIndex)
            : (typeof _getDriveLabelI18n === 'function' ? _getDriveLabelI18n(sihua) : sihua);
        var era   = eraMap[char.inputs.era] || '';
        // i18n：性别标签翻译
        var gender = char.inputs.gender === 'female' 
            ? (tUI('genderFemale') || '女') 
            : (tUI('genderMale') || '男');
        var age   = ageMap[char.inputs.age] || '';
        return '<div class="cmp-summary-item">' +
            '<span class="cmp-summary-name">' + (char.name || '角色') + '</span>' +
            '<span class="cmp-summary-meta">' + era + ' · ' + gender + ' · ' + age + ' · ' + driveLabel + '</span>' +
        '</div>';
    }).join('');

    // ── 戏剧关系分析 ──
    var _unknown = '–';
    // sihuaList 和 relationMap 使用中文key，需要翻译显示，但关系映射查找仍用中文key
    var sihuaKeyList = chars.map(function(c) { return c.sihua || _unknown; });
    var genderList = chars.map(function(c) { return c.inputs.gender === 'female' ? tUI('genderFemale') : tUI('genderMale'); });
    var ageList  = chars.map(function(c) { return ageMap[c.inputs.age] || c.inputs.age || _unknown; });
    var eraList  = chars.map(function(c) { return eraMap[c.inputs.era] || c.inputs.era || _unknown; });
    var nameList = chars.map(function(c) { return c.name || (tUI('cmpCharLabel') || 'Char'); });

    var relationMap = _dyn.relationMap || {};
    var sihuaKey = sihuaKeyList[0] + '_' + sihuaKeyList[1];
    var relationDesc = relationMap[sihuaKey] || (_dyn.relationDefault || '这几种类型并置，核心戏剧张力来自各自动机的碰撞——目标交叉时冲突自然产生，合作也带着裂缝。');

    var contextNote = '';
    if (eraList.some(function(e){ return e !== eraList[0]; })) {
        contextNote = (_dyn.contextCrossEra && typeof _dyn.contextCrossEra === 'function')
            ? _dyn.contextCrossEra(eraList)
            : eraList.join(' / ');
    } else if (ageList.some(function(a){ return a !== ageList[0]; })) {
        var nameAgeStr = nameList.map(function(n,i){ return n + ageList[i]; }).join('、');
        contextNote = (_dyn.contextCrossAge && typeof _dyn.contextCrossAge === 'function')
            ? _dyn.contextCrossAge(nameAgeStr)
            : nameAgeStr;
    } else if (genderList.some(function(g){ return g !== genderList[0]; })) {
        contextNote = (_dyn.contextCrossGender && typeof _dyn.contextCrossGender === 'function')
            ? _dyn.contextCrossGender(eraList[0])
            : eraList[0];
    } else {
        contextNote = (_dyn.contextSame && typeof _dyn.contextSame === 'function')
            ? _dyn.contextSame(eraList[0], ageList[0])
            : eraList[0] + ' ' + ageList[0];
    }

    // ── 相性评分 HTML（2人/3人均显示，两两配对）──
    var compatHtml = '';
    if (chars.length >= 2) {
        var pairs = [];
        for (var pi = 0; pi < chars.length; pi++) {
            for (var pj = pi + 1; pj < chars.length; pj++) {
                pairs.push([chars[pi], chars[pj]]);
            }
        }
        var pairHtmls = pairs.map(function(pair) {
            var nameA = pair[0].inputs.name || (tUI('cmpCharLabel') || 'Character ' + (chars.indexOf(pair[0]) + 1));
            var nameB = pair[1].inputs.name || (tUI('cmpCharLabel') || 'Character ' + (chars.indexOf(pair[1]) + 1));
            return '<div class="cmp-compat-pair">' +
                '<div class="cmp-compat-pair-title">' + nameA + ' × ' + nameB + '</div>' +
                _calcCompat(pair[0], pair[1]) +
            '</div>';
        }).join('');
        compatHtml = '<div class="cmp-compat">' + pairHtmls + '</div>';
    }

    // ── 三列完整小传（只显示小传本身，相性评分移出列外）──
    var colsHtml = chars.map(function(char) {
        var meta = [eraMap[char.inputs.era]||'', char.inputs.gender==='female' ? tUI('genderFemale') : tUI('genderMale'), ageMap[char.inputs.age]||'', char.chart.name||''].filter(Boolean).join(' · ');
        return '<div class="cmp-bio-col">' +
            '<div class="cmp-bio-col-header">' +
                '<p class="cmp-bio-name">' + (char.name || (tUI('cmpCharLabel') || 'Char')) + '</p>' +
                '<p class="cmp-bio-meta">' + meta + '</p>' +
            '</div>' +
            '<div class="cmp-bio-col-body">' +
                renderMarkdown(char.bio) +
            '</div>' +
        '</div>';
    }).join('');

    var interpersonalHtml = _buildInterpersonalCompareHTML(chars);

    return (
        '<div class="cmp-summary-bar">' + summaryItems + '</div>' +
        // 折叠面板：默认折叠，点击展开
        '<div class="cmp-analysis-toggle" onclick="this.classList.toggle(\'open\')">' +
            '<span class="cmp-toggle-label">▶ ' + (_dyn.cmpToggleLabel || tUI('cmpToggleLabel') || 'Compatibility & Drama') + '</span>' +
            '<span class="cmp-toggle-hint">(' + (_dyn.cmpToggleHint || tUI('cmpToggleHint') || 'click to expand') + ')</span>' +
        '</div>' +
        '<div class="cmp-analysis cmp-analysis-collapsible">' +
            compatHtml +
            '<p><strong>' + (_dyn.cmpSectionRelation || tUI('cmpSectionRelation') || 'Transformation Type') + '：</strong>' + sihuaKeyList.join(' vs ') + '　<strong>' + (_dyn.cmpSectionDrama || tUI('cmpSectionDrama') || 'Dramatic Dynamic') + '：</strong>' + relationDesc + '</p>' +
            '<p><strong>' + (_dyn.cmpSectionContext || tUI('cmpSectionContext') || 'Context') + '：</strong>' + contextNote + '</p>' +
            interpersonalHtml +
        '</div>' +
        '<div class="cmp-bio-columns">' + colsHtml + '</div>'
    );
}

/**
 * 飞星人际关系对比分析 HTML
 * 基于每个角色的 _creativeParams.interpersonalProfile
 * 融合《人际合盘占星全书》核心理论：
 *  - 夫妻宫 = 对方是你投影的阴影
 *  - 化忌飞入人际宫 = 关系中的执念所在（凯龙星伤口概念）
 */
function _buildInterpersonalCompareHTML(chars) {
    if (!chars || chars.length < 2) return '';

    const _dyn = (typeof getDynamic === 'function') ? getDynamic() : {};
    var rows = [];
    chars.forEach(function(char) {
        var cp = char.chart && char.chart._creativeParams;
        if (!cp) return;
        var ip = cp.interpersonalProfile;
        var name = char.name || (tUI('cmpCharLabel') || 'Char');

        var items = [];

        if (ip && ip.fuqiProjection) {
            items.push('<li><strong>' + (_dyn.interpersonalFuqi || 'Romantic Projection') + '：</strong>' + ip.fuqiProjection + '</li>');
        }
        if (ip && ip.jiaoYouStyle) {
            items.push('<li><strong>' + (_dyn.interpersonalJiaoyou || 'Social Drive') + '：</strong>' + ip.jiaoYouStyle + '</li>');
        }
        if (ip && ip.mingFlyImpact) {
            items.push('<li><strong>' + (_dyn.interpersonalFly || 'Fixation Star') + '：</strong>' + ip.mingFlyImpact + '</li>');
        }
        if (cp.attachmentType) {
            items.push('<li><strong>' + (_dyn.interpersonalAttach || 'Attachment Style') + '：</strong>' + cp.attachmentType + '</li>');
        }

        if (items.length > 0) {
            var relMapLabel = (_dyn.interpersonalRelMap && typeof _dyn.interpersonalRelMap === 'function')
                ? _dyn.interpersonalRelMap(name) : (name + ' · Profile');
            rows.push(
                '<div style="margin-bottom:14px;">' +
                '<p style="font-weight:700;font-size:14px;color:#8B0000;margin:0 0 6px;">' + relMapLabel + '</p>' +
                '<ul style="list-style:none;padding:0;margin:0;font-size:13px;line-height:1.8;color:#444;">' +
                items.join('') +
                '</ul></div>'
            );
        }
    });

    if (rows.length === 0) return '';

    // 双角色"交叉投影"分析（心理占星合盘核心：A的夫妻宫星 vs B的命宫星是否呼应）
    var crossNote = '';
    if (chars.length === 2) {
        var cpA = chars[0].chart && chars[0].chart._creativeParams;
        var cpB = chars[1].chart && chars[1].chart._creativeParams;
        if (cpA && cpB) {
            var ipA = cpA.interpersonalProfile;
            var ipB = cpB.interpersonalProfile;
            var nameA = chars[0].name || 'A';
            var nameB = chars[1].name || 'B';

            // 检测夫妻宫互投影：如果A的夫妻宫主星 = B的命宫主星，或B的夫妻宫主星 = A的命宫主星
            var fuqiA = ipA && ipA.fuqiStar;
            var fuqiB = ipB && ipB.fuqiStar;
            var mingA = cpA.mingMainStar;
            var mingB = cpB.mingMainStar;

            if (fuqiA && fuqiA === mingB) {
                var resText = (_dyn.interpersonalResonance && typeof _dyn.interpersonalResonance === 'function')
                    ? _dyn.interpersonalResonance(nameA, fuqiA, nameB)
                    : ('<strong>Chart Resonance:</strong> ' + nameA + '\'s Spouse Palace star (' + fuqiA + ') = ' + nameB + '\'s Life Palace star.');
                crossNote += '<p style="background:#fff8e7;border-left:3px solid #f39c12;padding:8px 12px;margin:8px 0;font-size:13px;">' + resText + '</p>';
            }
            if (fuqiB && fuqiB === mingA) {
                var resText2 = (_dyn.interpersonalResonance && typeof _dyn.interpersonalResonance === 'function')
                    ? _dyn.interpersonalResonance(nameB, fuqiB, nameA)
                    : ('<strong>Chart Resonance:</strong> ' + nameB + '\'s Spouse Palace star (' + fuqiB + ') = ' + nameA + '\'s Life Palace star.');
                crossNote += '<p style="background:#fff8e7;border-left:3px solid #f39c12;padding:8px 12px;margin:8px 0;font-size:13px;">' + resText2 + '</p>';
            }

            // 检测化忌互入（凯龙星伤口理论：你的伤碰到了对方的伤）
            if (ipA && ipA.mingFlyImpact && ipB && ipB.mingFlyImpact) {
                var doubleWoundText = _dyn.interpersonalDoubleWound ||
                    '<strong>Double Wound:</strong> Both charts carry flying-star fixations — this relationship activates each other\'s deepest wounds.';
                crossNote += '<p style="background:#fef5f5;border-left:3px solid #e74c3c;padding:8px 12px;margin:8px 0;font-size:13px;">' + doubleWoundText + '</p>';
            }
        }
    }

    var interpersonalTitleText = _dyn.interpersonalTitle || '🌐 Flying-Star Relationship Map';
    return '<div style="margin-top:14px;padding:14px;background:#fdf9f2;border-radius:10px;">' +
        '<p style="font-weight:700;font-size:15px;color:#333;margin:0 0 12px;">' + interpersonalTitleText + '</p>' +
        rows.join('') +
        crossNote +
        '</div>';
}

// ── 相性计算 ──
function _calcCompat(charA, charB) {
    const _dyn = (typeof getDynamic === 'function') ? getDynamic() : {};
    var sihuaA = charA.sihua || '';
    var sihuaB = charB.sihua || '';
    var eraA   = charA.inputs.era || '';
    var eraB   = charB.inputs.era || '';
    var genA   = charA.inputs.gender || '';
    var genB   = charB.inputs.gender || '';
    var ageA   = charA.inputs.age || '';
    var ageB   = charB.inputs.age || '';

    // 基础分：60
    var score = 60;
    var reasons = [];

    // 四化匹配（从i18n动态层取，支持三语言）
    var sihuaScoreMap = _dyn.sihuaScoreMap || {};
    var sihuaKey = sihuaA + '_' + sihuaB;
    var sihuaResult = sihuaScoreMap[sihuaKey];
    if (sihuaResult) {
        score += sihuaResult[0];
        reasons.push(sihuaResult[1]);
    } else {
        // 无对应配对表项，不加减分，不加冗余文字，由对比面板的「戏剧关系」栏说明
    }

    // 时代：同代+8，跨代-5（文案由对比面板 contextNote 承载，此处仅计分+加标签）
    if (eraA && eraB) {
        if (eraA === eraB) {
            score += 8;
            reasons.push((_dyn.compatEraScore && typeof _dyn.compatEraScore === 'function') ? _dyn.compatEraScore(true) : '时代背景：同框 +8');
        } else {
            score -= 5;
            reasons.push((_dyn.compatEraScore && typeof _dyn.compatEraScore === 'function') ? _dyn.compatEraScore(false) : '时代背景：跨时代 −5（需叙事支撑）');
        }
    }

    // 年龄：同段+5，相差一段0，相差两段-5
    var ageOrder = {youth:0, middle:1, senior:2};
    var ageDiff = Math.abs((ageOrder[ageA]||0) - (ageOrder[ageB]||0));
    if (ageDiff === 0)      { score += 5; reasons.push(_dyn.compatAgeNear || '年龄段：相近 +5'); }
    else if (ageDiff === 2) { score -= 5; reasons.push(_dyn.compatAgeFar  || '年龄段：代际错位 −5'); }

    // 性别异同
    if (genA !== genB) { score += 5; reasons.push(_dyn.compatGenderDiff || '性别：异性互补 +5'); }

    // 限制在0-100
    score = Math.max(0, Math.min(100, score));

    // 评语（从i18n取）
    const _cl = _dyn.compatLabels || { high:'Highly Compatible', good:'Good Dynamic', tension:'Charged Tension', conflict:'Conflict-Driven' };
    var label = score >= 85 ? _cl.high : score >= 70 ? _cl.good : score >= 50 ? _cl.tension : _cl.conflict;
    var labelColor = score >= 85 ? '#27ae60' : score >= 70 ? '#2980b9' : score >= 50 ? '#e67e22' : '#e74c3c';

    var barFill = '<div style="height:8px;border-radius:4px;background:linear-gradient(90deg,' + labelColor + ',rgba(184,134,11,0.3));' +
        'width:' + score + '%;transition:width 0.6s ease;"></div>';

    var compatTitleText = _dyn.compatTitle || tUI('compareTitle') || 'Compatibility';
    return '<div style="margin-bottom:2px;">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
            '<span style="font-size:13px;font-weight:600;color:#333;">' + compatTitleText + '</span>' +
            '<span style="font-size:22px;font-weight:700;color:' + labelColor + ';">' + score + '</span>' +
            '<span style="font-size:12px;color:' + labelColor + ';font-weight:600;padding:2px 8px;' +
                'background:' + labelColor + '22;border-radius:10px;">' + label + '</span>' +
        '</div>' +
        '<div style="background:#f0f0f0;border-radius:4px;overflow:hidden;margin-bottom:8px;">' + barFill + '</div>' +
        '<ul style="margin:0;padding-left:16px;list-style:disc;">' +
            reasons.map(function(r){ return '<li style="font-size:12px;color:#555;margin-bottom:3px;">' + r + '</li>'; }).join('') +
        '</ul>' +
    '</div>';
}

function closeCompare() {
    document.getElementById('compare-section').style.display = 'none';
    document.body.style.overflow = '';
}

// showBioCompare / closeBioCompare 已并入新版 generateComparison，保留空实现以防旧引用
function showBioCompare() {}
function closeBioCompare() {}

// ==================== 语言切换响应 ====================
/**
 * 由 index.html 的 switchLang() 在切换语言后调用。
 * 负责刷新 app 层中无法通过 data-i18n 属性覆盖的动态区域：
 *   - 已保存角色区域标题
 *   - 对比区域标题
 *   - 重新开始按钮文字
 *   - DRIVE_8_TYPES（驱动力数组，语言切换后重建）
 * 深度内容（命盘传记正文）需要重新生成，此处仅刷新固定文案。
 */
function onLangChange(lang) {
    // 刷新所有 data-i18n DOM
    if (typeof applyI18nToDOM === 'function') applyI18nToDOM();

    // 刷新驱动力数组（语言切换后重建，下次打开步骤3时生效）
    DRIVE_8_TYPES = _getDrive8();

    // 若步骤3当前可见，立即重渲染驱动力卡片 + era 显示 + 格局卡片
    if (currentStep === 3 && selectedChart) {
        generate8PersonalityTypes(selectedChart);
        // 刷新格局卡片（主星名/格局类型翻译）
        if (selectedChart) {
            var _cd = selectedChart;
            var _lang3 = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
            var _sep3 = _lang3 === 'en' ? ' / ' : '、';
            var _setEl3 = function(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
            var _pat3 = (_cd.pattern || {});
            _setEl3('main-pattern-name', _getPatternNameI18n(_pat3.name || _cd.name || ''));
            _setEl3('main-star', (_pat3.stars || _cd.stars || []).map(_getStarNameI18n).join(_sep3));
            _setEl3('pattern-type', _getPatternTypeI18n(_cd.patternType || _cd.type || ''));
        }
        var _dyn = (typeof getDynamic === 'function') ? getDynamic() : {};
        var _eraEl = document.getElementById('era');
        if (_eraEl && userInputs && userInputs.era && _dyn.eraMap) {
            _eraEl.textContent = _dyn.eraMap[userInputs.era] || userInputs.era;
        }
        var _eraDispEl = document.getElementById('era-display');
        if (_eraDispEl && userInputs && userInputs.era && _dyn.eraMap) {
            _eraDispEl.textContent = _dyn.eraMap[userInputs.era] || userInputs.era;
        }
    }

    // 若步骤4当前可见，立即重渲染8属性
    if (currentStep === 4) {
        initEightAttributes();
    }

    // 保存列表语言切换后重渲染（格局名/驱动力标签跟随语言）
    if (savedCharacters.length > 0) {
        displaySavedCharacters();
    }

    // 动态渲染的文字节点（不带 data-i18n，直接用 tUI 更新）
    const savedTitle = document.querySelector('#saved-characters-section .card-title');
    if (savedTitle && typeof tUI === 'function') savedTitle.textContent = tUI('savedTitle');

    const compareTitle = document.querySelector('#compare-section .cmp-top-title');
    if (compareTitle && typeof tUI === 'function') compareTitle.textContent = tUI('compareTitle');

    const compareClose = document.querySelector('#compare-section .cmp-close-btn');
    if (compareClose && typeof tUI === 'function') compareClose.textContent = tUI('btnCloseCompare');

    const compareTrigger = document.querySelector('#compare-btn-section button');
    if (compareTrigger && typeof tUI === 'function') compareTrigger.textContent = tUI('btnCompare');

    // ── 步骤5：语言切换后自动重新生成小传 ──
    // 小传内容是语言相关的叙述性文本，必须重新生成才能切换语言
    if (currentStep === 5 && selectedChart && selectedSubPattern) {
        // 已在步骤5 → 直接重新生成
        generateFinalBio();
    } else if (currentCharacterBio && selectedChart && selectedSubPattern) {
        // 不在步骤5但已生成过 → 标记为需要重生成
        // 下次用户进入步骤5时会看到旧语言内容，清空提示重生成
        var _resultDiv = document.getElementById('result-content');
        if (_resultDiv) {
            _resultDiv.innerHTML = '';
        }
        currentCharacterBio = '';
    }
}
