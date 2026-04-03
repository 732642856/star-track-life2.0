/**
 * 紫微斗数人物小传核心引擎 v2.0
 * 整合 ziwei-core-combined.js 的独有数据库 + 新版8模块生成函数
 * 复用现有 ziwei-psychology.js 中的：PSYCHOLOGY_TERMS / SIHUA_PSYCHOLOGY_MAPPING /
 *   PALACE_PSYCHOLOGY_MAPPING / CP_PREFERENCE_RULES / GAN_FLYING_PSYCHOLOGY /
 *   SAN_FANG_SI_ZHENG_PSYCHOLOGY / JIA_JU_PSYCHOLOGY / AN_HE_PSYCHOLOGY
 *
 * v2.0 新增：
 *   - 多语言属性值翻译层（解决繁体/英文选项key在中文叙事函数中无法匹配的bug）
 *   - 面相学外貌体系（萧湘识人相法 × 紫微14主星，参考 face_reading.md）
 *   - 编剧理论强化（韩国编剧"事为人宜"底层逻辑，参考《救狗子》韩国编剧思维自学资料包）
 *   - 写作词库措辞精准化（参考写作词库12号/人物描写、05号/心理描写）
 *   - 轻量级简繁转换（_sc2tw），解决叙事函数输出简体混入繁体小传的问题
 */

// ==================== 轻量级简繁转换工具 ====================
/**
 * _sc2tw(str)：将简体中文字符串转为繁体（叙事文本专用词表，覆盖小传高频词汇）
 * 适用场景：叙事函数输出的叙述性中文文本，在zh-TW模式下需要转成繁体
 * 不适用：星曜名称（这些在i18n-stars.js中已单独处理）
 */
var _SC2TW_MAP = [
    ['说话','說話'],['说得','說得'],['说了','說了'],['说出','說出'],['说到','說到'],['说清','說清'],
    ['说什么','說什麼'],['说实话','說實話'],['说不','說不'],['说给','說給'],['说起','說起'],
    ['语言','語言'],['语气','語氣'],['语速','語速'],['语录','語錄'],
    ['习惯','習慣'],['习惯性','習慣性'],
    ['处变不惊','處變不驚'],['处理','處理'],['处境','處境'],['处于','處於'],
    ['决定','決定'],['觉得','覺得'],['发现','發現'],['发现了','發現了'],
    ['发展','發展'],['发挥','發揮'],['发光','發光'],
    ['关系','關係'],['关键','關鍵'],['关注','關注'],['关联','關聯'],
    ['时刻','時刻'],['时候','時候'],['时间','時間'],['时代','時代'],
    ['拥有','擁有'],['对方','對方'],['对抗','對抗'],['对立','對立'],
    ['情绪','情緒'],['情感','情感'],['情深义重','情深義重'],
    ['紧张','緊張'],['紧绷','緊繃'],
    ['亲密','親密'],['亲近','親近'],
    ['现实','現實'],['现在','現在'],['现有','現有'],
    ['认识','認識'],['认知','認知'],['认为','認為'],['认真','認真'],
    ['设定','設定'],['建立','建立'],
    ['总是','總是'],['总能','總能'],
    ['记忆','記憶'],['记得','記得'],
    ['达到','達到'],['动力','動力'],['动作','動作'],
    ['结构','結構'],['结果','結果'],
    ['选择','選擇'],['选项','選項'],
    ['规则','規則'],['规律','規律'],
    ['独特','獨特'],['独立','獨立'],
    ['态度','態度'],['气质','氣質'],['气场','氣場'],
    ['表达','表達'],['表现','表現'],
    ['稳定','穩定'],['稳重','穩重'],
    ['转折','轉折'],['变化','變化'],
    ['问题','問題'],['问题','問題'],
    ['经历','經歷'],['经验','經驗'],
    ['积累','積累'],['积极','積極'],
    ['沟通','溝通'],
    ['联系','聯繫'],['连接','連接'],
    ['逻辑','邏輯'],['逻辑感','邏輯感'],
    ['倾向','傾向'],['倾听','傾聽'],
    ['敏感','敏感'],
    ['层次','層次'],['层面','層面'],
    ['节奏','節奏'],['节点','節點'],
    ['掌控','掌控'],
    ['执念','執念'],['执著','執著'],['执行','執行'],
    ['牺牲','犧牲'],
    ['竞争','競爭'],
    ['责任','責任'],
    ['维护','維護'],['维持','維持'],
    ['驱动','驅動'],['驱动力','驅動力'],
    ['动机','動機'],
    ['沟通','溝通'],
    ['创伤','創傷'],['创造','創造'],['创作','創作'],
    ['迷茫','迷茫'],
    ['脆弱','脆弱'],['坚韧','堅韌'],['坚持','堅持'],['坚定','堅定'],
    ['努力','努力'],
    ['丰富','豐富'],
    ['细腻','細膩'],['细节','細節'],
    ['当下','當下'],['当然','當然'],['当机立断','當機立斷'],
    ['看见','看見'],['看清','看清'],
    ['表面','表面'],['内心','內心'],['内在','內在'],
    ['成长','成長'],['成功','成功'],['成就','成就'],
    ['感受','感受'],['感动','感動'],['感情','感情'],
    ['压力','壓力'],['压制','壓制'],['压抑','壓抑'],
    ['需要','需要'],['需求','需求'],
    ['深层','深層'],['深度','深度'],
    ['行动','行動'],['行为','行為'],
    ['个性','個性'],['个体','個體'],
    ['直觉','直覺'],['直接','直接'],
    ['防御','防禦'],['防护','防護'],
    ['边界','邊界'],
    ['线索','線索'],
    ['冲突','衝突'],['冲动','衝動'],
    ['真实','真實'],['真正','真正'],
    ['愤怒','憤怒'],['愤慨','憤慨'],
    ['恐惧','恐懼'],
    ['悲哀','悲哀'],['悲伤','悲傷'],
    ['喜悦','喜悅'],
    ['孤独','孤獨'],
    ['热情','熱情'],['热爱','熱愛'],
    ['冷静','冷靜'],['冷漠','冷漠'],
    ['温柔','溫柔'],['温暖','溫暖'],['温和','溫和'],
    ['力量','力量'],
    ['价值','價值'],['价值观','價值觀'],
    ['人生','人生'],['人物','人物'],['人格','人格'],
    ['角色','角色'],
    ['故事','故事'],
    ['剧情','劇情'],['剧本','劇本'],['编剧','編劇'],
    ['场合','場合'],['场景','場景'],
    ['才华','才華'],['才能','才能'],
    ['命盘','命盤'],['命宫','命宮'],
    ['四化','四化'],
    ['大限','大限'],
    ['流年','流年'],
    ['格局','格局'],
    ['伤口','傷口'],['创痛','創痛'],
    ['弧光','弧光'],['弧线','弧線'],
    ['底色','底色'],['底层','底層'],
    ['双重','雙重'],
    ['当代','當代'],
    ['时辰','時辰'],
    ['干支','干支'],
    ['来自','來自'],
    ['面对','面對'],
    ['了解','了解'],
    ['找到','找到'],
    ['给予','給予'],
    ['带来','帶來'],
    ['建构','建構'],
    ['向往','嚮往'],
    ['突破','突破'],
    ['超越','超越'],
    ['诚实','誠實'],['诚信','誠信'],
    ['简单','簡單'],['简洁','簡潔'],
    ['复杂','複雜'],['复原','復原'],
    ['固执','固執'],
    ['灵活','靈活'],['灵感','靈感'],
    ['守护','守護'],
    ['反叛','反叛'],
    ['承担','承擔'],['承受','承受'],
    ['意识','意識'],
    ['探索','探索'],
    ['坦诚','坦誠'],
    ['妥协','妥協'],
    ['矛盾','矛盾'],
    ['主导','主導'],
    ['隐藏','隱藏'],['隐性','隱性'],
    ['对话','對話'],
    ['互动','互動'],
    ['联结','聯結'],
    ['满足','滿足'],
    ['危机','危機'],
    ['伤痛','傷痛'],
    ['叙事','敘事'],
    ['写作','寫作'],
    ['释放','釋放'],
    ['痛苦','痛苦'],
    ['释然','釋然'],
    ['理解','理解'],
    ['接受','接受'],
    ['守则','守則'],
    ['法则','法則'],
    ['枷锁','枷鎖'],
    ['坚强','堅強'],
    ['承诺','承諾'],
    ['态度','態度'],
    ['欢乐','歡樂'],['欢迎','歡迎'],
    ['热闹','熱鬧'],
    ['动荡','動盪'],
    ['乱世','亂世'],
    ['轻松','輕鬆'],
    ['优势','優勢'],['优雅','優雅'],
    ['独处','獨處'],
    ['陌生','陌生'],
    ['困境','困境'],
    ['危险','危險'],
    ['变动','變動'],
    ['变形','變形'],
    ['转化','轉化'],
    ['蜕变','蛻變'],
    ['开创','開創'],['开放','開放'],
    ['分享','分享'],
    ['透明','透明'],
    ['包容','包容'],
    ['宽容','寬容'],
    ['体贴','體貼'],
    ['付出','付出'],
    ['受伤','受傷'],
    ['伤害','傷害'],
    ['破碎','破碎'],
    ['重建','重建'],
    ['复苏','復甦'],
    ['向上','向上'],
    ['尊重','尊重'],
    ['欲望','欲望'],
    ['本能','本能'],
    ['自我','自我'],
    ['认同','認同'],
    ['存在','存在'],
    ['意义','意義'],
    ['判断','判斷'],
    ['抉择','抉擇'],
    ['策略','策略'],
    ['计划','計劃'],
    ['目标','目標'],
    ['方向','方向'],
    ['挑战','挑戰'],
    ['克服','克服'],
    ['突围','突圍'],
    ['迎接','迎接'],
    ['应对','應對'],
    ['生存','生存'],
    ['适应','適應'],
    ['平静','平靜'],
    ['沉默','沉默'],
    ['孤立','孤立'],
    ['封闭','封閉'],
    ['开启','開啟'],
    ['打破','打破'],
    ['突破','突破'],
    ['释放','釋放'],
    ['融合','融合'],
    ['整合','整合'],
    ['平衡','平衡'],
    ['统一','統一'],
    ['归属','歸屬'],
    ['回归','回歸'],
    ['家园','家園'],
    ['安全感','安全感'],
    ['归属感','歸屬感'],
    ['存在感','存在感'],
    ['认同感','認同感'],
    ['价值感','價值感'],
    ['成就感','成就感'],
    ['幸福感','幸福感']
];

/**
 * 将简体中文叙事文本转换为繁体（用于zh-TW模式下的叙事函数输出）
 * @param {string} str - 简体中文叙事字符串
 * @returns {string} 繁体中文字符串
 */
function _sc2tw(str) {
    if (!str || typeof str !== 'string') return str;
    var result = str;
    for (var i = 0; i < _SC2TW_MAP.length; i++) {
        var pair = _SC2TW_MAP[i];
        // 全词替换，避免部分字符匹配
        result = result.split(pair[0]).join(pair[1]);
    }
    return result;
}

// ==================== 多语言属性值翻译层 ====================
// 解决核心bug：用户在英文/繁体UI下选了"Reserved"/"寡言少語"，
// 传入叙事函数时需统一转为简体中文key，才能在map中匹配到正确描述。
var ATTR_LABEL_TO_ZH = {
    // speech / 说话方式
    'Direct & Concise':   '简洁有力',
    'Tactful & Soft':     '温和委婉',
    'Enthusiastic':       '热情洋溢',
    'Calm & Measured':    '沉稳冷静',
    'Humorous':           '幽默风趣',
    'Reserved':           '寡言少语',
    // 繁体同音字映射
    '簡潔有力':           '简洁有力',
    '溫和委婉':           '温和委婉',
    '熱情洋溢':           '热情洋溢',
    '沉穩冷靜':           '沉稳冷静',
    '幽默風趣':           '幽默风趣',
    '寡言少語':           '寡言少语',
    // behavior / 行为习惯
    'Decisive':           '雷厉风行',
    'Thoughtful':         '深思熟虑',
    'Spontaneous':        '随性而为',
    'Cautious':           '谨慎小心',
    'Methodical':         '有条不紊',
    'Free-spirited':      '自由散漫',
    '雷厲風行':           '雷厉风行',
    '深思熟慮':           '深思熟虑',
    '隨性而為':           '随性而为',
    '謹慎小心':           '谨慎小心',
    '有條不紊':           '有条不紊',
    '自由散漫':           '自由散漫',
    // emotion / 情感表达
    'Openly Expressive':  '外露直白',
    'Changeable':         '丰富多变',
    'Stable':             '稳定平和',
    'Rationally Controlled': '理性克制',
    'Impulsive':          '感性冲动',
    '外露直白':           '外露直白',
    '內斂含蓄':           '内敛含蓄',
    '豐富多變':           '丰富多变',
    '穩定平和':           '稳定平和',
    '理性克制':           '理性克制',
    '感性衝動':           '感性冲动',
    '内敛含蓄':           '内敛含蓄',
    // social / 社交风格
    'Proactive':          '主动热情',
    'Passive':            '被动等待',
    'Rational':           '理性交往',
    'Emotionally Guided': '感性相交',
    'Diplomatic':         '圆滑世故',
    'Frank & Honest':     '直率真诚',
    '主動熱情':           '主动热情',
    '被動等待':           '被动等待',
    '理性交往':           '理性交往',
    '感性相交':           '感性相交',
    '圓滑世故':           '圆滑世故',
    '直率真誠':           '直率真诚',
    // crisis / 应对危机
    'Calm Analysis':      '冷静分析',
    'Swift Action':       '果断行动',
    'Seeks Help':         '寻求帮助',
    'Avoidance':          '逃避回避',
    'Panic':              '慌乱无措',
    'Firm Resistance':    '坚定抵抗',
    '冷靜分析':           '冷静分析',
    '果斷行動':           '果断行动',
    '尋求幫助':           '寻求帮助',
    '逃避回避':           '逃避回避',
    '慌亂無措':           '慌乱无措',
    '堅定抵抗':           '坚定抵抗',
    // learning / 学习适应
    'Fast Learner':       '快速学习',
    'Steady Accumulator': '稳步积累',
    'Experience-reliant': '依赖经验',
    'Highly Adaptive':    '善于应变',
    'Stubborn':           '固执己见',
    'Flexible':           '灵活调整',
    '快速學習':           '快速学习',
    '穩步積累':           '稳步积累',
    '依賴經驗':           '依赖经验',
    '善於應變':           '善于应变',
    '固執己見':           '固执己见',
    '靈活調整':           '灵活调整',
    // growth / 成长方向
    'Achievement':        '追求成功',
    'Freedom':            '追求自由',
    'Stability':          '追求安稳',
    'Truth':              '追求真理',
    'Connection':         '追求情感',
    'Balance':            '追求平衡',
    '追求安穩':           '追求安稳',
    '追求真理':           '追求真理',
    '追求情感':           '追求情感',
    '追求平衡':           '追求平衡',
    // appearance / 外貌特征
    'Commanding':         '威严霸气',
    'Gentle & Refined':   '温和儒雅',
    'Sharp & Capable':    '锐利干练',
    'Warm & Approachable':'柔和亲和',
    'Distinctive':        '独特个性',
    'Unassuming':         '普通平凡',
    '威嚴霸氣':           '威严霸气',
    '溫和儒雅':           '温和儒雅',
    '銳利幹練':           '锐利干练',
    '柔和親和':           '柔和亲和',
    '獨特個性':           '独特个性',
    '普通平凡':           '普通平凡'
};

/**
 * 将属性值（可能是英文/繁体）统一转换为简体中文key
 * 供所有叙事函数（_narrateSpeech/_narrateBehavior等）在函数入口处调用
 */
function _normalizeAttrVal(val) {
    if (!val) return val;
    return ATTR_LABEL_TO_ZH[val] || val;
}

// ==================== 面相学外貌体系 ====================
// 参考来源：萧湘识人相法 × 紫微斗数角色设计技能面相学模块 (face_reading.md)
// 原则："相由心生"——命盘决定性格，性格影响面相
var STAR_FACE_TRAITS = {
    '紫微': {
        face: '额宽饱满、目光如炬，天庭高耸，有不怒自威的天然气场',
        build: '身材匀称或偏高大，站姿挺拔，举止从容',
        vibe: '高贵典雅，气场强大，不声不响也能成为焦点',
        detail: '嘴角微微上扬，下巴方圆饱满，说话时眼神直视对方，绝不轻易低头'
    },
    '天机': {
        face: '额高而宽，眼神灵动，嘴角带着若有若无的微笑',
        build: '身材偏瘦或中等，动作灵活，手势较多',
        vibe: '温文尔雅，聪敏机警，亲和力强但总让人觉得他在算什么',
        detail: '说话时喜欢快速眨眼，有一种思维在高速运转的感觉，手指细长'
    },
    '太阳': {
        face: '额头明亮开阔，眼神热情奔放，嘴角上扬，笑容有感染力',
        build: '身材健壮，站姿挺拔，动作幅度大，充满活力',
        vibe: '阳光开朗，热情洋溢，正气凛然，走进哪里都像带着光',
        detail: '声音洪亮，语速快，说话时全身投入，目光会主动去找每一个人'
    },
    '武曲': {
        face: '眉形粗直，目光锐利专注，鼻梁高挺，嘴唇薄而紧抿',
        build: '身材健壮，肌肉结实，站姿稳重，举止利落干脆',
        vibe: '刚毅果断，务实稳重，不多言，但每句话都有分量',
        detail: '手指有力，关节明显，说话时惜字如金，眼神直接，不绕弯子'
    },
    '天同': {
        face: '额头圆润有光泽，眼神柔和温暖，嘴角常带微笑',
        build: '身材偏圆润，举止悠闲，动作不急不躁',
        vibe: '温和善良，福气满满，走进哪里都让人放松',
        detail: '说话声音柔和，语速慢，喜欢点头，让人感觉被倾听和接纳'
    },
    '廉贞': {
        face: '五官精致但带着些许复杂，眼神深邃，难以完全看透',
        build: '身材偏瘦，动作优雅但略显紧绷，有一种神经质的精准感',
        vibe: '复杂多变，神秘莫测，有艺术气质，美丽而带着隐隐的危险感',
        detail: '嘴唇形状不对称，笑起来有时让人摸不清是真心还是算计'
    },
    '天府': {
        face: '额宽而饱满，眼神温和稳重，面容圆润有肉',
        build: '身材偏丰满，显得富态稳重，举止不慌不忙',
        vibe: '稳重保守，包容力强，有长者风范，让人有安全感',
        detail: '声音低沉温和，语速慢，面带微笑，习惯性地让人感觉"有这个人在，没事"'
    },
    '太阴': {
        face: '面容温柔细腻，眼神含蓄柔和，像月光一样不刺眼但明亮',
        build: '身材柔美，举止优雅，每个动作都有一种无意间的美感',
        vibe: '温柔细腻，安静内敛，有一种沉默的力量，美得不动声色',
        detail: '说话轻声细语，但每句话都经过思考，眼神中有一种难以言说的深度'
    },
    '贪狼': {
        face: '五官立体有魅力，眼神妩媚，笑起来极具吸引力',
        build: '身材匀称，体态轻盈，举止优雅，自带表演欲',
        vibe: '魅力四射，多才多艺，走进哪里都是焦点，有一种让人移不开眼的本事',
        detail: '笑声好听，说话声音有磁性，喜欢把头微微侧向一边，与人交谈时全程保持眼神接触'
    },
    '巨门': {
        face: '额头高而宽，眼神锐利，嘴唇薄而有力，说话时嘴型清晰',
        build: '身材适中，举止直接，动作目的性强，不做多余的事',
        vibe: '口才出众，洞察人心，直言不讳，说话像手术刀，精准而犀利',
        detail: '习惯性地在说话前停顿一下，仿佛在确认措辞；眼神里有一种"我知道你在想什么"的意味'
    },
    '天相': {
        face: '五官端正，面容平和有威信，眉眼间有一种公正的气质',
        build: '身材适中，举止得体，注重礼仪，给人感觉是"规矩的人"',
        vibe: '稳重正直，贵人运强，公正持平，是那种让人觉得"他说的有道理"的人',
        detail: '说话声调平稳，不高不低，目光直视，不回避，也不咄咄逼人'
    },
    '天梁': {
        face: '眉间有纹，面容有沧桑感，但眼神清澈，有一种见过风浪的稳重',
        build: '身材适中或偏高，举止有权威感，走路稳重，不急不躁',
        vibe: '清高正直，长辈风范，有原则有底线，让人不自觉地想向他倾诉',
        detail: '说话慢而有力，句句有分量，喜欢用"你听我说"开头，天然有导师气质'
    },
    '七杀': {
        face: '额头高而宽，眉毛粗浓上扬，眼神锐利，目光如刀，有威慑力',
        build: '身材健壮，肌肉感强，站姿如松，举止利落，充满爆发力',
        vibe: '刚毅果决，不怒自威，不说话时给人压迫感，笑起来又有一种独特的魅力',
        detail: '习惯性收紧下颌，握拳再松开是他的无意识动作；眼神很少回避，直视是他表达认真的方式'
    },
    '破军': {
        face: '五官带着破格感，某个地方总有点"不按套路"的美，比如眼尾微勾',
        build: '身材适中但有力量感，举止大胆不拘，常给人"下一秒会做什么"的不确定感',
        vibe: '破旧立新，颠覆常规，行为常出人意料，甚至和自己的昨天也不一样',
        detail: '走路节奏不规则，有时快有时慢；说话喜欢用反问，不按通常的逻辑走'
    }
};
window.STAR_FACE_TRAITS = STAR_FACE_TRAITS;

/**
 * 生成面相外貌描述（中文）
 * 融合14主星面相 + 用户选择的外貌特征标签 + 性别语境
 * 参考：萧湘识人相法全集（骨相面相之部）
 */
function _generateAppearanceDesc(mainStar, appearanceTag, genderCN, lang) {
    lang = lang || (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    var pronoun = genderCN === '女' ? '她' : '他';
    var faceData = STAR_FACE_TRAITS[mainStar] || {};

    // 外貌标签翻译表
    var appearanceTagEN = {
        '威严霸气': 'Commanding', '温和儒雅': 'Gentle & Refined', '锐利干练': 'Sharp & Capable',
        '柔和亲和': 'Warm & Approachable', '独特个性': 'Distinctive', '低调朴素': 'Unassuming',
        'Commanding': 'Commanding', 'Gentle & Refined': 'Gentle & Refined', 'Sharp & Capable': 'Sharp & Capable',
        'Warm & Approachable': 'Warm & Approachable', 'Distinctive': 'Distinctive', 'Unassuming': 'Unassuming'
    };

    if (lang === 'en') {
        // 英文版外貌：简洁描述
        var tagEN = appearanceTagEN[appearanceTag] || appearanceTag || 'Distinctive';
        var faceEN = {
            '紫微': 'Commanding presence — broad forehead, steady gaze, natural authority',
            '天机': 'Quick, bright-eyed, perpetually thinking — their face gives the sense of a mind in motion',
            '太阳': 'Open and warm-faced, the kind of person whose smile pulls you in from across the room',
            '武曲': 'Sharp-edged, resolute features; the face of someone who finishes what they start',
            '天同': 'Soft, rounded, comfortable — the face you want to see when things go wrong',
            '廉贞': 'Beautifully complicated — precise features with something unresolved behind the eyes',
            '天府': 'Calm and full-faced, the steady anchor in any room',
            '太阴': 'Quietly luminous — gentle features, an inner light that doesn\'t announce itself',
            '贪狼': 'Magnetic and expressive — the kind of face that holds a room without trying',
            '巨门': 'Sharp-tongued face to match — precise mouth, eyes that see too much',
            '天相': 'Even, fair-featured, carries authority without aggression',
            '天梁': 'Weathered wisdom in the face — lines that suggest things survived and understood',
            '七杀': 'Hard-edged, intense — a face that people instinctively step back from before stepping toward',
            '破军': 'Unconventional — something about the features doesn\'t follow the expected pattern'
        };
        return (faceEN[mainStar] || tagEN) + '. Overall impression: ' + tagEN + '.';
    }

    // 中文/繁体版外貌（主体描述相同，繁体转换由前端处理）
    var tagZH = _normalizeAttrVal(appearanceTag) || '';
    if (!faceData.face) {
        return tagZH ? (tagZH + '的气质，自有一套独特的存在感') : '外貌平实，不张扬，却总有细节让人多看一眼';
    }

    var lines = [];
    if (faceData.face)   lines.push(faceData.face);
    if (faceData.build)  lines.push(faceData.build);
    if (faceData.vibe)   lines.push(faceData.vibe);
    if (tagZH && faceData.detail) {
        lines.push(faceData.detail);
    }
    return lines.join('。') + '。';
}

// ── 命盘印证/张力标签三语言工具函数 ──────────────────────────────────
/**
 * 返回当前语言下"命盘印证：" 前缀
 * 用于 _chartXxxNote() 等函数中替代硬编码的中文前缀
 */
function _noteConfirm(palaceName) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') return '*Chart Confirmation: ' + (palaceName || '') + ' ';
    if (lang === 'zh-TW') return '*命盤印證：' + (palaceName || '') + '';
    return '*命盘印证：' + (palaceName || '') + '';
}
function _noteTension(palaceName) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') return '*Chart Tension: ' + (palaceName || '') + ' ';
    if (lang === 'zh-TW') return '*命盤張力：' + (palaceName || '') + '';
    return '*命盘张力：' + (palaceName || '') + '';
}
function _noteChart(palaceName) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') return '*Chart Note: ' + (palaceName || '');
    if (lang === 'zh-TW') return '*命盤注：' + (palaceName || '');
    return '*命盘注：' + (palaceName || '');
}

// ==================== 时辰能量库 ====================
var SHI_CHEN_ENERGY = {
    '子': { element: '水', yinYang: '阴', peak: '深夜',   trait: '深沉内敛、直觉敏锐、善于谋略' },
    '丑': { element: '土', yinYang: '阴', peak: '凌晨',   trait: '稳如泰山、耐力持久、积蓄力量' },
    '寅': { element: '木', yinYang: '阳', peak: '黎明',   trait: '生机勃勃、开创进取、充满希望' },
    '卯': { element: '木', yinYang: '阴', peak: '日出',   trait: '温润如玉、善解人意、柔中带刚' },
    '辰': { element: '土', yinYang: '阳', peak: '上午',   trait: '厚重稳健、包容万象、有威严' },
    '巳': { element: '火', yinYang: '阴', peak: '正午前', trait: '热情内敛、智慧深沉、善于表达' },
    '午': { element: '火', yinYang: '阳', peak: '正午',   trait: '光明磊落、热情奔放、有领导力' },
    '未': { element: '土', yinYang: '阴', peak: '下午',   trait: '温厚敦实、包容理解、有耐心' },
    '申': { element: '金', yinYang: '阳', peak: '傍晚前', trait: '锋芒毕露、锐意进取、执行力强' },
    '酉': { element: '金', yinYang: '阴', peak: '日落',   trait: '精致细腻、完美主义、有品位' },
    '戌': { element: '土', yinYang: '阳', peak: '夜晚',   trait: '忠诚可靠、有责任感、守护型' },
    '亥': { element: '水', yinYang: '阴', peak: '深夜',   trait: '智慧深邃、有灵性、直觉强' }
};
window.SHI_CHEN_ENERGY = SHI_CHEN_ENERGY;

// ==================== 八刻能量强度 ====================
var KE_INTENSITY = {
    '初刻': { level: 1, influence: '潜质型', trait: '特质隐藏，需要环境激发' },
    '一刻': { level: 2, influence: '渐显型', trait: '特质初现，需要时间成长' },
    '二刻': { level: 3, influence: '明朗型', trait: '特征明显，个性鲜明' },
    '三刻': { level: 4, influence: '强显型', trait: '特质强烈，优缺点都明显' },
    '正刻': { level: 5, influence: '巅峰型', trait: '能量最强，影响力大' },
    '正一刻': { level: 4, influence: '转折型', trait: '能量转折，特征复杂' },
    '正二刻': { level: 3, influence: '收敛型', trait: '能量收敛，内敛深沉' },
    '末刻': { level: 2, influence: '归藏型', trait: '能量归藏，大智若愚' }
};
window.KE_INTENSITY = KE_INTENSITY;

// ==================== 8种人格驱动类型 ====================
var PERSONALITY_8_TYPES = {
    '天赋优势型（化禄阳）': {
        sihua: '化禄', gender: '阳',
        desc: '天生有某种优势，轻松自然就做得比别人好',
        visibleTrait: '轻松、自信、有魅力、多才多艺',
        hiddenNeed: '害怕失去优势，对"不擅长"有焦虑',
        lifePattern: '顺风顺水时光芒四射，逆境时容易逃避',
        example: '像天生会表演的演员，天生有商业头脑的商人'
    },
    '掌控主导型（化权阳）': {
        sihua: '化权', gender: '阳',
        desc: '强烈的主导欲，凡事都要掌控在手中',
        visibleTrait: '强势、果断、有领导力、执行力强',
        hiddenNeed: '用掌控掩饰不安全感，害怕失控',
        lifePattern: '成功时一呼百应，失败时孤独压抑',
        example: '像雷厉风行的将军，不怒自威的管理者'
    },
    '声誉理想型（化科阳）': {
        sihua: '化科', gender: '阳',
        desc: '极度在意他人看法，用理想形象示人',
        visibleTrait: '理性、克制、有原则、注重形象',
        hiddenNeed: '压抑真实情感，活在他人期待中',
        lifePattern: '功成名就时内心空虚，需要学会真实',
        example: '像完美的学者、无懈可击的君子'
    },
    '执念深重型（化忌阳）': {
        sihua: '化忌', gender: '阳',
        desc: '有某种执念或伤口，成为人生的驱动力',
        visibleTrait: '深刻、执著、有韧性、不轻易放弃',
        hiddenNeed: '执念是养分也是枷锁，需要转化',
        lifePattern: '苦难中成长，执念成就也折磨',
        example: '像复仇的英雄、为爱执著的痴情人'
    },
    '天赋内秀型（化禄阴）': {
        sihua: '化禄', gender: '阴',
        desc: '天赋内敛，外表平静内心丰富',
        visibleTrait: '温和、内敛、有内涵、低调优雅',
        hiddenNeed: '害怕被忽视，需要被真正理解',
        lifePattern: '默默耕耘后绽放，大器晚成',
        example: '像低调的天才、不张扬的艺术家'
    },
    '掌控内敛型（化权阴）': {
        sihua: '化权', gender: '阴',
        desc: '内在有强烈掌控欲，外表温和',
        visibleTrait: '外柔内刚、有城府、善于谋略',
        hiddenNeed: '温和是策略，掌控是本质',
        lifePattern: '韬光养晦后发力，以柔克刚',
        example: '像深沉的政治家、腹黑的谋士'
    },
    '声誉内修型（化科阴）': {
        sihua: '化科', gender: '阴',
        desc: '追求精神层面的完美和清高',
        visibleTrait: '清高、自律、有精神追求、内心丰富',
        hiddenNeed: '难以接受现实的粗糙，需要落地',
        lifePattern: '精神世界的贵族，现实的隐士',
        example: '像清高的隐士、精神导师'
    },
    '执念内化型（化忌阴）': {
        sihua: '化忌', gender: '阴',
        desc: '执念深藏内心，化创伤为深度',
        visibleTrait: '深沉、敏感、有洞察力、理解他人',
        hiddenNeed: '与过去和解，化执念为智慧',
        lifePattern: '在黑暗中寻找光明，伤痕成勋章',
        example: '像治愈他人的心理师、历劫重生的智者'
    }
};
window.PERSONALITY_8_TYPES = PERSONALITY_8_TYPES;

// ==================== 8类型驱动力 - 英文版 ====================
var PERSONALITY_8_TYPES_EN = {
    '天赋优势型（化禄阳）': {
        sihua: '化禄', gender: '阳',
        desc: 'Natural talent — things come easily that others struggle with. The gift is real. The danger is invisible: losing what feels effortless feels like losing yourself.',
        visibleTrait: 'Ease, confidence, magnetic, multitalented',
        hiddenNeed: 'Terror of losing the advantage; anxiety about being ordinary',
        lifePattern: 'Radiant in fair winds; tends to vanish when things get hard',
        example: 'Like the natural performer, the born entrepreneur'
    },
    '掌控主导型（化权阳）': {
        sihua: '化权', gender: '阳',
        desc: 'Need to control — everything must be in hand. The strength is visible and undeniable. What is hidden is what the control guards against: a terror of powerlessness.',
        visibleTrait: 'Strong-willed, decisive, commanding, formidable execution',
        hiddenNeed: 'Mastery masks insecurity; fear of losing control',
        lifePattern: 'Brilliant when winning; isolated and depressed when losing',
        example: 'Like the ruthless general, the imperious manager'
    },
    '声誉理想型（化科阳）': {
        sihua: '化科', gender: '阳',
        desc: 'Bound to the image of perfection — what others see matters more than what is real. The principles are rigid. The cost is all the real parts that do not fit.',
        visibleTrait: 'Rational, measured, principled, image-conscious',
        hiddenNeed: 'Suppresses true feeling; lives in others expectations',
        lifePattern: 'Empty despite success; needs to learn what authenticity is',
        example: 'Like the flawless scholar, the impeccable gentleman'
    },
    '执念深重型（化忌阳）': {
        sihua: '化忌', gender: '阳',
        desc: 'Possessed by something — old wound, old hunger, old vow. The obsession drives; it also crushes. The path forward requires understanding: what is this grip on you, and what is it protecting?',
        visibleTrait: 'Profound, relentless, resilient, unyielding',
        hiddenNeed: 'Obsession is fuel and also a cage; requires transformation',
        lifePattern: 'Grows through adversity; the obsession both makes and breaks',
        example: 'Like the avenging hero, the lover who never lets go'
    },
    '天赋内秀型（化禄阴）': {
        sihua: '化禄', gender: '阴',
        desc: 'Talent runs deep and quiet — the surface is calm, but inside is a world of richness. The gift is there. The pain is being mistaken for less than you are.',
        visibleTrait: 'Gentle, reserved, cultured, elegantly unassuming',
        hiddenNeed: 'Fear of being overlooked; craves real understanding',
        lifePattern: 'Quiet work; then sudden blooming; late but authentic',
        example: 'Like the unknown genius, the unheralded artist'
    },
    '掌控内敛型（化权阴）': {
        sihua: '化权', gender: '阴',
        desc: 'Control runs deep, but expressed gently — the softness is the strategy; the grip is the substance. Others see only the surface calm, unaware of the calculation beneath.',
        visibleTrait: 'Outwardly soft, inwardly steely, strategic, deep reserves',
        hiddenNeed: 'Gentleness is tactic; control is the truth',
        lifePattern: 'Restraint, then emergence; flexibility as superior strength',
        example: 'Like the brooding strategist, the beautiful schemer'
    },
    '声誉内修型（化科阴）': {
        sihua: '化科', gender: '阴',
        desc: 'Chasing the perfect inner life — the pursuit is genuine, but reality is cruder than the vision. The work is bringing the ideals down into the world.',
        visibleTrait: 'Principled, self-disciplined, spiritually seeking, richly inner',
        hiddenNeed: 'Struggles with reality roughness; needs to land',
        lifePattern: 'Inner aristocrat, outer hermit; integration is the task',
        example: 'Like the refined recluse, the spiritual guide'
    },
    '执念内化型（化忌阴）': {
        sihua: '化忌', gender: '阴',
        desc: 'Wounds held in secret — kept inside, they become depth. The pain is real. The wisdom that emerges from truly knowing that pain — this is the gift.',
        visibleTrait: 'Deep, sensitive, perceptive, understanding toward others',
        hiddenNeed: 'Needs to reconcile with the past; transform wound to wisdom',
        lifePattern: 'Finds light in darkness; scars become medals',
        example: 'Like the healer of souls, the wise one who has survived'
    }
};
window.PERSONALITY_8_TYPES_EN = PERSONALITY_8_TYPES_EN;

// ── 根据语言返回驱动力类型（工具函数） ──
function _getPersonalityType(typeLabel) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        return PERSONALITY_8_TYPES_EN[typeLabel] || PERSONALITY_8_TYPES[typeLabel] || {};
    }
    return PERSONALITY_8_TYPES[typeLabel] || {};
}

// ==================== 主星深度描述库（14星全覆盖） ====================
var STAR_DETAILED_DESCRIPTIONS = {
    '七杀': {
        personality: '刚毅果决、雷厉风行、不怒自威、铁面无私。行事如疾风骤雨，决策如雷霆万钧。不喜拖泥带水，崇尚快刀斩乱麻。内心藏着一团烈火，外表却冷如寒冰。',
        psychology: '潜意识中渴望掌控一切，对失控有深层恐惧。用强势和果断来掩饰内心的脆弱，用征服来证明自己的价值。每一次成功的征服，都在填补童年时期的不安全感。',
        relationship: '在感情中容易陷入"征服-被征服"的模式。渴望被理解，却不善于表达。需要一个既能独立自主，又能在关键时刻示弱的伴侣。',
        growth: '学会在强硬中保留柔软，在果断中留有余地。理解真正的强大不是征服他人，而是掌控自己。',
        wound: '童年可能经历过被迫服从的创伤，从此立誓不再被人控制。或曾目睹软弱带来的灾难，决心让自己变得强大。',
        shadow: '过度强势可能导致孤独，因为无人敢接近。对失败的恐惧可能让决策过于冒险，陷入"不成功便成仁"的极端思维。'
    },
    '破军': {
        personality: '破旧立新、颠覆常规、开拓先锋、不甘平庸。眼中的世界不是"是什么"，而是"可以是什么"。破坏力与创造力并存，每一次打破都是为了更好的重建。',
        psychology: '内心深处对现状有强烈的不满，总在寻找变革的机会。不是在变革中，就是在准备变革的路上。对稳定和重复有本能的排斥。',
        relationship: '容易被与众不同的人吸引，讨厌千篇一律的伴侣。在亲密关系中需要新鲜感和刺激，容易因为平淡而感到窒息。',
        growth: '学会在变革中保留有价值的传统，在创新中尊重他人的感受。理解破坏容易，建设更难，需要耐心和智慧。',
        wound: '可能经历过重大的人生变革（家庭变故、学校转学、环境迁移），从此对"变化"有了特殊的理解。',
        shadow: '过度追求变革可能让生活失去根基，陷入不断打破重建的循环。可能因为缺乏耐心而错过深度关系的建立。'
    },
    '贪狼': {
        personality: '多才多艺、八面玲珑、魅力四射、享乐主义。天生懂得如何让人开心，有让人移不开眼的本事。对生活充满热情，对美好事物有强烈的追求。',
        psychology: '内心深处渴望被关注、被喜爱。通过才艺和魅力来获得认可，通过社交来填补内心的空虚。害怕孤独，害怕被遗忘。',
        relationship: '在感情中容易成为焦点，但也容易陷入多重关系。需要学会专注和忠诚，理解真正的亲密关系需要时间的沉淀。',
        growth: '学会在追求快乐中保持清醒，在社交中保持真诚。理解内在价值比外在认可更重要，深度的少数关系比浅度的多数关系更有意义。',
        wound: '童年可能缺乏足够的关注，或是在比较中长大，从此对"被喜爱"有强烈的需求。',
        shadow: '过度追求享乐可能让人生失去方向，沉溺于即时的快乐而忽略长期的价值。'
    },
    '紫微': {
        personality: '气宇轩昂、胸怀大志、领袖气质、自尊自强。天生有让人信服的气场，不用刻意表现就能获得尊重。做任何事都有"要做就做最好"的信念。',
        psychology: '潜意识中需要被仰视、被尊重。对平庸有本能的恐惧，对失败有强烈的不安。用成就和地位来证明自己的价值，用完美表现来维持自尊。',
        relationship: '容易被同样优秀的人吸引，但相处中容易出现"谁说了算"的权力斗争。需要学会放下身段，理解真正的强者可以示弱。',
        growth: '学会接受自己的不完美，理解自尊建立在真实的自我之上，而非外在的成就。',
        wound: '童年可能生活在高期望的环境中，从小就被灌输"必须优秀"的观念。或经历过被轻视的创伤，从此立誓要站在顶峰。',
        shadow: '过度追求完美可能让人际关系变得紧张。对失败的恐惧可能让决策过于保守，不敢冒险。'
    },
    '天府': {
        personality: '稳重可靠、运筹帷幄、守成有道、包容大度。善于将混乱变得有序，将危机转为机遇。有让人安心的本事，是团队的稳定器。',
        psychology: '内心深处渴望安全感和确定性。通过掌控和规划来获得安心，通过积累和守成来抵御未知的风险。对失去有强烈的恐惧。',
        relationship: '需要同样稳重可靠的伴侣，能共同建立稳定的生活。在关系中扮演保护者和供养者的角色，有时可能过于保守和谨慎。',
        growth: '学会在稳定中保持灵活性，在守成中保留创新的空间。理解真正的安全感来自内心的强大，而非外在的掌控。',
        wound: '童年可能经历过物质或情感的匮乏，从此对"拥有"有强烈的执念。或目睹过失去带来的痛苦，决心建立稳固的堡垒。',
        shadow: '过度追求稳定可能错失变革的机会，让生活陷入固步自封。'
    },
    '天机': {
        personality: '思维敏捷、谋略过人、洞察先机、运筹帷幄。眼中的世界是一盘棋，永远比别人多想三步。善于在复杂中找到简单，在混乱中发现规律。',
        psychology: '内心世界永不停歇，思维像一台高速运转的机器。通过思考来应对不安，通过策划来掌控未来。对未知有既害怕又好奇的矛盾心理。',
        relationship: '需要能跟上自己思维节奏的伴侣，能进行深度对话。在关系中可能过于理性，需要学会用情感而非逻辑来处理亲密关系。',
        growth: '学会将思维转化为行动，将计划转化为成果。理解有时候"足够好"比"完美计划"更重要。',
        wound: '童年可能通过观察和思考来应对环境的复杂性，学会通过预见风险来保护自己。',
        shadow: '过度思考可能让行动瘫痪，陷入"分析瘫痪"的状态。可能因为总是预见风险而变得焦虑。'
    },
    '太阳': {
        personality: '光明磊落、热情开朗、正义凛然、感染力强。像一个小太阳，走到哪里都能照亮周围的人。有强烈的理想主义情怀，相信正义终将战胜邪恶。',
        psychology: '内心深处需要被看见、被认可。通过发光发热来证明自己的价值，通过帮助他人来获得存在感。害怕被忽视，害怕失去影响力。',
        relationship: '容易被同样阳光的人吸引，或被需要帮助的人吸引。在关系中可能过于付出，需要学会接受他人的帮助和关爱。',
        growth: '学会在接受与付出之间保持平衡，在发光的同时也允许自己休息。',
        wound: '童年可能被迫扮演"乖孩子"或"小大人"的角色，承担了过多的期待和责任。',
        shadow: '过度付出可能让身心俱疲，陷入"燃烧自己照亮他人"的模式。'
    },
    '太阴': {
        personality: '温婉柔和、细腻敏感、诗意盎然、母性光辉。像一缕月光，温柔地照进他人的心里。有强烈的审美能力和艺术天分，对美有独特的理解。',
        psychology: '内心世界丰富而细腻，对情感有深度的感知能力。通过艺术和美好来应对世界的复杂，通过温柔来保护自己。害怕冲突，害怕粗糙。',
        relationship: '需要能理解和呵护自己的伴侣，能欣赏自己的细腻和敏感。在关系中容易受伤，需要学会保护自己的边界。',
        growth: '学会在柔软中保持力量，在温和中坚持原则。理解温柔不是软弱，而是一种更强大的力量。',
        wound: '童年可能在敏感的环境中长大，学会通过察言观色来保护自己。或经历过粗暴的对待，从此对温柔有强烈的渴望。',
        shadow: '过度敏感可能让生活充满不必要的痛苦，过度包容可能让边界模糊。'
    },
    '武曲': {
        personality: '刚毅果断、务实重财、行动力强、独立自主。不说废话，只看结果。对金钱和实际利益有清醒的判断，是团队中最可靠的执行者。',
        psychology: '内心追求实际成果，对空谈和幻想有天然的排斥。通过成就和积累来建立安全感，害怕一无所有。',
        relationship: '需要同样务实、有能力的伴侣，共同建设实际的生活。在感情中可能显得冷漠，实则是用行动而非语言来表达爱。',
        growth: '学会在务实中保留浪漫，在行动中照顾他人的情感需求。理解情感不能只用效率来衡量。',
        wound: '可能经历过匮乏或被迫独立，从此形成"靠自己"的人生哲学。',
        shadow: '过度务实可能让关系失去温度，让他人感到被忽视。'
    },
    '天同': {
        personality: '温和善良、与世无争、福气深厚、享受生活。天生有一种让人放松的气场，走进哪个团体都能带来和谐。对物质要求不高，更在意内心的平静。',
        psychology: '内心深处追求平静和和谐，对冲突有本能的回避。通过和谐关系来获得安全感，通过助人来体现价值。',
        relationship: '需要同样温和、能陪伴的伴侣，一起享受生活的小美好。在关系中往往是付出方，需要学会表达自己的需求。',
        growth: '学会在和谐中保持自我，在温和中坚持立场。理解有时候冲突是成长的必经之路。',
        wound: '可能在一个压抑冲突的家庭环境中成长，学会了用顺从来换取和平。',
        shadow: '过度回避冲突可能导致问题积累，最终在平静下暗流涌动。'
    },
    '廉贞': {
        personality: '复杂好胜、魅力十足、争强好胜、感情多变。像一把双刃剑，美丽而危险。拥有让人着迷的魅力，也有让人敬而远之的锋芒。',
        psychology: '内心充满矛盾：既渴望被爱，又害怕被束缚；既追求成功，又迷恋放纵。通过竞争和征服来证明自己的魅力。',
        relationship: '感情世界复杂多变，容易在多段关系中纠缠。需要找到一个既能理解其复杂性，又能给予稳定的伴侣。',
        growth: '学会在复杂中寻找简单，在矛盾中找到统一。理解真正的魅力来自内心的和谐，而非外在的张力。',
        wound: '可能经历过情感的背叛或伤害，从此用复杂的外表来保护内心的脆弱。',
        shadow: '情感上的复杂性可能伤害他人，也可能让自己在纠缠中迷失方向。'
    },
    '天相': {
        personality: '稳重正直、贵人运强、公正持平、善于协调。天生是和平的使者，能在各方之间找到平衡点。有强烈的公义感，不允许不公平的事情发生。',
        psychology: '内心追求公正和和谐，对不平等有强烈的敏感。通过帮助他人和协调关系来获得满足感。',
        relationship: '需要同样正直、有品德的伴侣，共同维护双方的尊严。在关系中扮演协调者和守护者的角色。',
        growth: '学会在公正中保持弹性，理解世界不是非黑即白的。在帮助他人的同时，也要照顾自己的需求。',
        wound: '可能经历过不公平的对待，从此对正义有强烈的执念。',
        shadow: '过度追求公正可能让自己陷入不必要的冲突，成为"管太多"的人。'
    },
    '天梁': {
        personality: '清高正直、长辈风范、有原则有底线、守护正义。有一种天然的权威感，让人不自觉地想要倾诉和寻求建议。对年轻人有强烈的保护欲。',
        psychology: '内心有强烈的使命感，相信自己有责任守护他人和传承智慧。对失序和不公有强烈的反应。',
        relationship: '容易成为伴侣的精神支柱，但也可能因此形成不平等的关系。需要一个既能尊重其权威，又能给予平等回应的伴侣。',
        growth: '学会在守护中放手，理解每个人都有自己的成长路径。在给予建议的同时，也要倾听他人的声音。',
        wound: '可能经历过重要长辈的缺失，从此承担起了不属于自己年龄的责任。',
        shadow: '过度的清高可能让人感到距离，过强的保护欲可能让他人感到窒息。'
    },
    '巨门': {
        personality: '口才出众、研究精神、洞察人心、直言不讳。说话像手术刀，精准而犀利。对事物有超强的分析能力，能一眼看穿问题的本质。',
        psychology: '内心对真相有强烈的追求，无法接受谎言和粉饰。通过言语和分析来建立安全感，通过揭示真相来证明自己的价值。',
        relationship: '需要能进行深度对话、不隐瞒的伴侣。在关系中可能因直言而伤人，需要学会在真诚和体贴之间找到平衡。',
        growth: '学会在揭示真相的同时，考虑他人的感受。理解有时候温柔的谎言比残酷的真相更有力量。',
        wound: '可能经历过被欺骗或信息封锁的创伤，从此对真相有强烈的渴望。',
        shadow: '过于直言可能在无意间伤害他人，过度的怀疑可能让关系充满猜忌。'
    }
};
window.STAR_DETAILED_DESCRIPTIONS = STAR_DETAILED_DESCRIPTIONS;

// ==================== 主星深度描述库 - 英文版 ====================
var STAR_DETAILED_DESCRIPTIONS_EN = {
    '七杀': {
        personality: 'Resolute, swift, and commanding — the force that moves before others have finished thinking. Actions arrive like sudden rain; decisions fall like thunder. No patience for delay. Beneath a surface of ice burns a furnace that never goes cold.',
        psychology: 'At the core is a drive to dominate — and a deep fear of powerlessness. The strength and the decisiveness are real. But they also serve as armour over an old wound: the terror of being at someone else\'s mercy.',
        relationship: 'Drawn to partners who can stand their ground. Craves understanding, but struggles to ask for it. Needs someone who knows when to hold firm and when, just occasionally, to let the armour come off.',
        growth: 'The real power isn\'t defeating others. It\'s governing yourself. When the fire is turned inward — not as punishment, but as discipline — something formidable becomes something lasting.',
        wound: 'Somewhere in the early years there was a moment of forced submission. That memory hardened into a vow: never again. Or they watched what softness cost someone they loved, and decided the world required a different kind of strength.',
        shadow: 'The relentlessness can empty a room. The fear of failure, unexamined, turns into decisions that gamble everything — a kind of dare to the universe.'
    },
    '破军': {
        personality: 'Pioneer, iconoclast, the one who shows up to dismantle the comfortable and see what survives. The world isn\'t what it is — it\'s what it could be. Destruction and creation live in the same hand.',
        psychology: 'A restlessness that never fully quiets. Not because something is wrong, but because something is always calling to be made different. Routine isn\'t comfort; it\'s a slow suffocation.',
        relationship: 'Attracted to the unconventional. Bored by the predictable. Intimacy requires novelty and honest intensity — without these, the instinct to move on stirs early.',
        growth: 'Breaking is fast. Building takes patience. The work is learning which structures deserve to be preserved — and discovering that some rebellions are just fear in disguise.',
        wound: 'A significant rupture in early life — a move, a loss, a family fracture — became the lens through which change was understood. Not threat, exactly. But always a signal: nothing lasts as it is.',
        shadow: 'Without roots, renovation becomes a compulsion. The connections and projects that take years to deepen are the ones most likely to be abandoned just before they flower.'
    },
    '贪狼': {
        personality: 'Magnetic, multi-talented, unapologetically alive. A natural performer who doesn\'t need to try to hold the room — the room reorganises itself. Life is for tasting, and they intend to taste it fully.',
        psychology: 'The sociability runs deep, but so does a hunger to be truly seen — not just liked. The charm is real. But underneath it is a child who needed more applause than they got, and learned to generate their own.',
        relationship: 'A gravitational pull that can become complicated quickly. Loyalty is possible — but focus requires practice. Needs a partner who can match the aliveness without feeding the appetite for endless novelty.',
        growth: 'Inner value is not the same as outer acclaim. The most important audience is the one that stays when the performance is over. A few deep connections are worth more than a hundred admiring ones.',
        wound: 'Not enough attention, or too much comparison. The lesson absorbed early was: charm is currency. It works. It also keeps people at a certain distance.',
        shadow: 'Pleasure as escape. When the world becomes too heavy, sensation becomes sedation — and the deeper questions go unanswered.'
    },
    '紫微': {
        personality: 'Dignified, visionary, self-possessed. Commands respect without demanding it — the room adjusts when they enter. Whatever they take on, they take on at the highest level. Mediocrity is not a neutral state; it\'s an affront.',
        psychology: 'Achievement is currency, and the exchange rate is self-worth. To be ordinary is to be erased. The excellence is genuine — but beneath it is a vigilance: if I stop being exceptional, what remains?',
        relationship: 'Drawn to equals. Struggles in relationships where the question of who leads is never settled. The work is learning that real strength doesn\'t require constant proof — and that showing vulnerability to the right person is not the same as losing.',
        growth: 'Greatness rooted in the self rather than the resumé. When self-respect becomes unconditional — not a reward for performance — the weight lifts considerably.',
        wound: 'High expectations, applied young. The message, spoken or not: you must be extraordinary. Or perhaps a moment of being dismissed — and a decision, then and there, never to be dismissed again.',
        shadow: 'Perfectionism as a hedge against failure. The caution that prevents risk, the precision that keeps others at arm\'s length, the distance that loneliness calls dignity.'
    },
    '天府': {
        personality: 'Steady, reliable, the person in the room who turns disorder into system. Crises don\'t destabilise — they invite organisation. A stabilising presence; the team\'s anchor.',
        psychology: 'Security is the master value. Through planning, accumulation, and careful management, the unpredictable is held at bay. Beneath the composure: a vigilance against loss that never fully sleeps.',
        relationship: 'Needs a partner who is equally grounded. Provides protection and stability; expects the same. Can be conservative to a fault — sometimes the careful maintenance of safety keeps genuine aliveness out.',
        growth: 'True security is an inner condition, not a perimeter maintained by resources and control. Flexibility inside stability. Room to evolve inside the structure.',
        wound: 'Some early experience of scarcity — material or emotional — left a mark: own things, accumulate them, don\'t let them go. Or they witnessed what ruin looked like and decided: not me.',
        shadow: 'The fortress that was built for protection becomes a cage. Stability hardens into stagnation. The cost of never losing is never fully living.'
    },
    '天机': {
        personality: 'Quick, strategic, always three moves ahead. The world is a puzzle — and an endlessly interesting one. Good at finding simplicity inside complexity, pattern inside noise.',
        psychology: 'The mind doesn\'t rest. Thinking is how safety is maintained — through analysis, contingency, anticipation. The unknown is both threatening and irresistible. The anxiety and the curiosity are the same impulse, differently dressed.',
        relationship: 'Needs intellectual resonance; without it, intimacy feels performative. Can be too rational in the spaces where emotion is what\'s actually called for. The practice is letting feeling lead, sometimes, instead of analysis.',
        growth: 'A plan is not the same as a life. At some point the preparation has to end and the doing begin. Good enough, right now, beats the perfect plan that arrives too late.',
        wound: 'Early environment required constant reading of the room — survival by anticipation. Thinking ahead was how they stayed safe. The habit persisted long after the danger did.',
        shadow: 'Analysis paralysis. The perpetual search for more information before acting. The anxiety that arrives disguised as preparation, and stays for years.'
    },
    '太阳': {
        personality: 'Open, passionate, lit from within. Radiates warmth the way a window radiates sunlight — without deciding to. Idealistic in the best sense: genuinely believes the world can be made better, and acts accordingly.',
        psychology: 'Needs to be seen, and to matter. The generosity is real — and also self-sustaining: doing good generates the visibility that sustains the inner life. The fear is irrelevance. The shadow of the bright is the dark that follows when the light goes out.',
        relationship: 'Drawn to the luminous and to the needy in equal measure. Tends to give more than they receive and to call it love. The work is learning to be helped, not just to help.',
        growth: 'Rest is not failure. Receiving is not weakness. The sun, too, needs to set.',
        wound: 'The responsible one, the capable one, the one who held it together. Asked to shine before they were ready. Or praised only when performing, which taught: worth is output.',
        shadow: 'Burnout wearing the mask of virtue. Self-sacrifice that meets the giver\'s need as much as the recipient\'s.'
    },
    '太阴': {
        personality: 'Gentle, perceptive, quietly luminous. Moves through the world the way moonlight moves — without announcing itself. Aesthetic sensibility runs deep. Sensitivity is not fragility; it is a form of precision.',
        psychology: 'The inner world is rich and detailed. Emotion is experienced with full resolution. Art and beauty are not decorative — they are how the world is made bearable and meaningful. Conflict is genuinely aversive; it disturbs something fundamental.',
        relationship: 'Needs to be seen with care, not just observed. Requires a partner who can be gentle without condescension. Gives deeply, sometimes without noticing the cost. Boundaries take practice.',
        growth: 'Softness is not the opposite of strength. The same sensitivity that can overwhelm is also what makes genuine connection possible. It needs protection, not elimination.',
        wound: 'A world that moved too fast, or too roughly, or that did not register the subtleties that were so vivid inside. Or an early encounter with harshness that made tenderness a private thing.',
        shadow: 'Suffering without purpose — feeling things too acutely with no container. Accommodation that continues past the point where the self has disappeared into the relationship.'
    },
    '武曲': {
        personality: 'Decisive, efficient, action-oriented. No appetite for decoration. Cuts directly to what matters, moves, delivers. The most dependable person in the room when something actually needs to happen.',
        psychology: 'Results are the proof of value. What can\'t be measured, counted, or achieved is held at arm\'s length. Beneath the drive for material security: a fear of having nothing — not just financially, but in terms of standing.',
        relationship: 'Expresses care through action, not words. May be experienced as cold by people who need the words. Needs a partner with competence and practical groundedness — someone who builds, not just appreciates.',
        growth: 'Efficiency is a tool, not a personality. The parts of life that resist measurement — depth, warmth, the long silences of trust — require a different mode. Learning to let them in.',
        wound: 'Forced early self-reliance. The lesson: you are on your own, so get capable. Others were either absent or unreliable; independence became both survival strategy and identity.',
        shadow: 'The transaction logic applied to human connection. Relationships assessed for ROI. The cost: intimacy that stays permanently at a certain useful distance.'
    },
    '天同': {
        personality: 'Warm, unhurried, quietly content. A gift for making spaces feel peaceful — people unwind in their company without quite knowing why. Wants little that isn\'t already present. The internal barometer points toward ease.',
        psychology: 'Harmony is the core value — not just externally, but inside. Conflict is not just unpleasant; it disrupts something fundamental. Connection and helpfulness generate a sense of rightness that other things don\'t quite replicate.',
        relationship: 'Seeks companionship for the small pleasures. Gives abundantly and sometimes forgets to account for their own needs. The work is naming what they need before it becomes a wound.',
        growth: 'Peace is not the same as avoidance. Some friction is the price of real growth — and some conflicts, faced early, prevent larger fractures later.',
        wound: 'A family environment that kept conflict invisible. Learned that the way to keep connection is to accommodate, agree, make it smooth. It worked. It also meant certain things were never said.',
        shadow: 'The unspoken accumulates. The pressure builds beneath the pleasant surface until something gives. Conflict-avoidance as a long-term debt against the self.'
    },
    '廉贞': {
        personality: 'Magnetic, intense, multi-layered. Beautiful and a little dangerous — not maliciously, just in the way that things with real power are. A complicated fascination that holds attention.',
        psychology: 'Contradiction is the inner weather: craving connection and fearing capture simultaneously; wanting success and drawn to excess. The magnetism is the outer expression of an unresolved inner tension.',
        relationship: 'Emotional complexity makes intimacy both compelling and difficult. Needs a partner who can hold both the light and the shadow without trying to fix either.',
        growth: 'The tension isn\'t the problem — it\'s the material. When the contradictions are understood rather than suppressed, they become the source of a particular kind of depth that few people possess.',
        wound: 'Betrayal, or the expectation of it. Learned to present complexity as armour against the vulnerability of being known too fully.',
        shadow: 'The entanglement continues past the point where it serves anyone. The intensity that was once vital becomes a loop that drains instead of feeds.'
    },
    '天相': {
        personality: 'Fair, steady, a born mediator. Finds balance points that others can\'t locate. A strong sense of what\'s just — and a genuine discomfort when things are otherwise. Held in high regard by both sides of most disputes.',
        psychology: 'Equilibrium is the organising principle. Injustice registers as a kind of pain. Satisfaction comes from being the person who held the line, kept the structure, made sure everyone got their due.',
        relationship: 'Needs a partner with integrity — someone whose values can be respected. Takes the protector and provider role without being asked. The risk: the guardianship extends further than the other person wanted.',
        growth: 'The world is neither all just nor all unjust. Rigidity about fairness can become a form of control. The flexibility to hold grey alongside black and white is a form of maturity.',
        wound: 'Some experience of being treated unfairly — personally or by proxy — became a mandate. This will not happen again. Not to me. Not to anyone I can reach.',
        shadow: 'Over-intervention. The compulsion to fix what isn\'t being asked to be fixed, to balance scales that others are willing to live with uneven.'
    },
    '天梁': {
        personality: 'Principled, authoritative, the one the room naturally turns to for guidance. A quality of having been somewhere and seen things — even, sometimes, in the young. Protective instincts run deep.',
        psychology: 'A strong sense of mission: to guard, to transmit, to ensure things are done rightly. Disorder and injustice activate a response that is immediate and serious.',
        relationship: 'Becomes the anchor in relationships — the one others lean on. This is satisfying but also isolating. Needs a partner who can offer equality, not just dependence.',
        growth: 'Guidance is most powerful when it allows the other person to find their own way. Holding on too tightly to the role of protector prevents the people being protected from growing.',
        wound: 'An important elder was absent — or present in the wrong way. Stepped into a role of responsibility that didn\'t fit the age, and never quite put it down.',
        shadow: 'The altitude creates distance. The protective impulse becomes controlling. The wisdom, unasked for, becomes a burden on those it was meant to serve.'
    },
    '巨门': {
        personality: 'Sharp, articulate, incisive. Words are precision instruments. Sees through surfaces to the mechanism underneath. Says the thing others are carefully not saying.',
        psychology: 'Truth is the organising value. Deception — even gentle, social deception — is almost physically uncomfortable. The analysis and the language are not just intellectual habits; they are how the world is made safe and legible.',
        relationship: 'Needs a partner who can receive honesty without treating it as aggression, and who won\'t hide things. Candour in close relationships can wound without intending to. The balance between honesty and care takes time to find.',
        growth: 'Some truths are better timed. And some things that feel like honesty are actually a form of control — keeping the other person in the light so they can\'t get too close in the dark.',
        wound: 'Deceived, or kept in the dark, by someone it mattered to trust. The response was a vow: to see everything, say everything, be seen through by no one.',
        shadow: 'Skepticism that tips into suspicion. The tongue that draws blood when it meant to illuminate. The right answer, delivered at the wrong moment, in the wrong way.'
    }
};
window.STAR_DETAILED_DESCRIPTIONS_EN = STAR_DETAILED_DESCRIPTIONS_EN;

// ── 根据语言返回主星描述（工具函数） ──
function _getStarDescriptions(mainStar) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        return STAR_DETAILED_DESCRIPTIONS_EN[mainStar] || STAR_DETAILED_DESCRIPTIONS[mainStar] || {};
    }
    return STAR_DETAILED_DESCRIPTIONS[mainStar] || {};
}

// ==================== 四化心理深度描述库 ====================
var SIHUA_DEEP_DESCRIPTIONS = {
    '化禄型': {
        psychology: '天赋如流水，自然流淌。做事如呼吸，无需费力。在某个领域天生就有优势，仿佛前世就曾习得。这种天赋带来的是轻松和愉悦，但也可能带来依赖和惰性。',
        manifestation: '不需要刻意练习就能做好的事、不费力就能获得的东西、天生就有感觉的领域。但也容易因此缺乏动力，不去开发其他潜能。',
        challenge: '不要让天赋成为舒适圈，不要让轻松成为逃避努力的借口。学会用天赋作为基础，继续深耕和提升。',
        growth: '在发挥天赋的同时，培养其他能力。理解天赋是起点，不是终点。用天赋来服务更大的目标，而非仅仅享受轻松。'
    },
    '化权型': {
        psychology: '掌控是安全感的来源，失去掌控是最大的恐惧。通过制定规则、做出决策、影响他人来获得确定感。每件事都必须在自己的掌控范围内，否则就会焦虑。',
        manifestation: '喜欢做决定、不喜欢被安排、凡事都要过问、难以放手。这种特质让执行能力强，但也可能让他人感到压力。',
        challenge: '学会信任他人，学会放手，学会接受不可控的现实。理解真正的掌控不是控制一切，而是掌控自己的反应。',
        growth: '培养对他人的信任，培养应对不确定性的能力。学会在失控中找到新的秩序，在放手后建立新的连接。'
    },
    '化科型': {
        psychology: '面子是第二生命，声誉是最重要的资产。极度在意他人的看法，用完美表现来维护形象。理性克制情感，用逻辑和规则来管理自己。',
        manifestation: '注重仪表和言辞、避免冲突和尴尬、用理性而非情感做决策、在公众场合保持克制。但也可能因此压抑真实的自我。',
        challenge: '学会展示真实的自己，学会接受不完美。理解真正的声誉建立在真实性之上，而非完美表现。',
        growth: '培养自我接纳的能力，学会在适当时候卸下完美面具。理解面子是工具，不是目的。真实比完美更有力量。'
    },
    '化忌型': {
        psychology: '执念如附骨之疽，挥之不去。某个未完成的愿望、未解的遗憾、未愈的伤口，成为了人生的驱动力。痛苦是养分，执念是燃料。',
        manifestation: '反复思考过去、纠结某个问题、难以释怀的遗憾、执著的追求。这种特质带来深度和坚持，但也可能带来痛苦。',
        challenge: '学会放手，学会与过去和解，学会转化痛苦为成长的力量。理解执念可以成为动力，也可能成为枷锁。',
        growth: '面对过去的创伤，转化执念为动力，学会放下。理解人生的意义不在于执著于某个结果，而在于过程中的成长。'
    }
};

// English version of SIHUA_DEEP_DESCRIPTIONS
var SIHUA_DEEP_DESCRIPTIONS_EN = {
    '化禄型': {
        psychology: 'Natural talent flows like water, effortless as breathing. Innate advantages in certain areas feel like skills mastered in a past life. This gift brings ease and joy, but may also bring dependency and inertia.',
        manifestation: 'Things done well without deliberate practice, gains achieved without effort, fields where intuition naturally guides. But this can lead to lacking motivation to develop other potentials.',
        challenge: 'Don\'t let talent become a comfort zone, don\'t let ease become an excuse to avoid effort. Learn to use talent as a foundation for deeper cultivation and growth.',
        growth: 'While exercising your gift, cultivate other abilities. Understand that talent is a starting point, not a destination. Use your gift to serve larger goals, not merely to enjoy the ease.'
    },
    '化权型': {
        psychology: 'Control is the source of security; losing control is the greatest fear. Gaining certainty by making rules, decisions, and influencing others. Everything must be within control, or anxiety follows.',
        manifestation: 'Loves making decisions, dislikes being arranged, must have a say in everything, hard to let go. This trait makes for strong execution, but may pressure others.',
        challenge: 'Learn to trust others, learn to let go, learn to accept uncontrollable reality. Understand that true control is not controlling everything, but controlling your own reactions.',
        growth: 'Cultivate trust in others, develop the ability to handle uncertainty. Learn to find new order in chaos, build new connections after letting go.'
    },
    '化科型': {
        psychology: 'Face is a second life; reputation is the most important asset. Deeply concerned about others\' opinions, maintaining image through perfect performance. Reason restrains emotion, managing oneself with logic and rules.',
        manifestation: 'Attentive to appearance and speech, avoiding conflict and awkwardness, making decisions with reason rather than emotion, maintaining restraint in public. But this may suppress the true self.',
        challenge: 'Learn to show your true self, learn to accept imperfection. Understand that true reputation is built on authenticity, not perfect performance.',
        growth: 'Cultivate self-acceptance, learn to remove the perfect mask when appropriate. Understand that face is a tool, not an end. Authenticity has more power than perfection.'
    },
    '化忌型': {
        psychology: 'Obsession clings like a shadow that won\'t fade. An unfulfilled wish, an unresolved regret, an unhealed wound becomes life\'s driving force. Pain is nourishment; obsession is fuel.',
        manifestation: 'Repeatedly thinking about the past, fixating on certain issues, regrets that won\'t let go, persistent pursuits. This trait brings depth and persistence, but may also bring pain.',
        challenge: 'Learn to let go, learn to make peace with the past, learn to transform pain into power for growth. Understand that obsession can be motivation or a shackle.',
        growth: 'Face past wounds, transform obsession into motivation, learn to let go. Understand that life\'s meaning lies not in fixating on a result, but in growth through the process.'
    }
};
window.SIHUA_DEEP_DESCRIPTIONS = SIHUA_DEEP_DESCRIPTIONS;
window.SIHUA_DEEP_DESCRIPTIONS_EN = SIHUA_DEEP_DESCRIPTIONS_EN;

// ==================== 时代伤痕深度描述库（三维：时代×格局×主星）====================
var ERA_WOUNDS = {
    'ancient': {
        '杀破狼':   '少年目睹家族被仇家灭门，鲜血染红了祖宅的门槛。从此明白，在这个弱肉强食的世界，只有足够强大才能保护所爱之人。',
        '紫府廉武相': '父亲因政治斗争被陷害入狱，全家一夜之间从云端跌入泥泞。曾经的朋友避之不及，曾经的仆人落井下石。立誓要重新夺回家族的荣耀。',
        '机月同梁': '母亲在难产中去世，父亲另娶后，后母的冷眼和刻薄让童年充满阴影。学会了察言观色，学会了隐藏真实想法，学会了在不被爱中活下来。',
        '巨日':     '因直言进谏得罪了权贵，被流放到边疆苦寒之地。途中目睹了官场的黑暗，人性的冷漠，理想被现实碾压成粉末。却仍然相信，正义终将得到伸张。'
    },
    'modern': {
        '杀破狼':   '军阀混战时，家园在炮火中化为灰烬。亲眼看到父亲为了保护家人倒在枪口下，母亲含泪将唯一的口粮塞进自己嘴里后咽气。从此明白，活下去就是最大的复仇。',
        '紫府廉武相': '家族的票号在金融风暴中破产，祖宅被抵押，仆人散去。曾经衣食无忧的少爷小姐，一夜之间沦为无人问津的落魄者。从此立誓要重建家业。',
        '机月同梁': '战乱中与家人失散，流落异乡。在陌生人的施舍中长大，学会了对每个人都说谢谢，学会了对每个机会都珍惜。内心深处，永远在寻找回家的路。',
        '巨日':     '因理想参加革命，目睹战友在眼前牺牲。在生与死的边缘，理解了什么是真正值得用生命去换的东西。从此，用笔作为武器，继续战斗。'
    },
    'contemporary': {
        '杀破狼':   '创业失败，负债累累。曾经的朋友纷纷避让，债权人上门逼债。在绝望的夜晚，差点走上天台，但最终选择咬牙重新开始。',
        '紫府廉武相': '中年失业，房贷车贷孩子的学费压得喘不过气。曾经的高管变成了送外卖的骑手，但仍然保持着体面，相信这只是人生的低谷而非终点。',
        '机月同梁': '从小在父母的高期望下长大，每一次考试失利都换来叹息和失望。渐渐学会了压抑真实的自己，活成了别人眼中的"优秀"。',
        '巨日':     '因为坚持原则得罪了领导，事业发展受阻。看着不如自己的人步步高升，内心充满不甘。但仍然相信，是金子总会发光。'
    }
};

// ── 主星×时代 精细化伤痕（覆盖ERA_WOUNDS里的格局描述，让同格局不同主星有不同伤痕）──
var STAR_ERA_WOUNDS = {
    '紫微': {
        ancient:     '在宫廷权争中，曾经信任的盟友背刺，一夜之间从权贵之位跌落，才明白真正的尊严只能靠自己守护。',
        modern:      '家道中落，失去了从小赋予他身份感的一切——头衔、地位、随从。唯有内心那股「我命由我」的执念撑着他在乱世中重建。',
        contemporary:'在大公司做到高管，却在一次权力博弈中被架空出局。从此懂得，靠别人的庇护而来的位置，随时可以被收走。'
    },
    '天机': {
        ancient:     '曾为主公献上奇策，却因功高震主被猜忌，一生谋略无处施展，那种才华被压制的憋屈，成了最深的心理烙印。',
        modern:      '战时情报员出身，见过太多算计与背叛。对人性的洞察太深，反而失去了无防备信任他人的能力。',
        contemporary:'从小被当作解决问题的工具——家里有麻烦找他，朋友有难题找他。习惯了被需要，却不知道自己真正想要什么。'
    },
    '太阳': {
        ancient:     '仗义执言触怒权贵，被贬谪远戍。那次打击让他明白，光明磊落并不总能换来公平，但他仍然选择做光明的人。',
        modern:      '曾经相信革命能改变世界，却亲眼目睹理想在现实中一点点被磨损。那些牺牲的战友，是他心中永久未能放下的重量。',
        contemporary:'努力成为家里的「太阳」，撑起父母的期望、兄弟的依赖。发光太久的代价，是熄灭时没有人注意到他早已精疲力竭。'
    },
    '武曲': {
        ancient:     '战场上奋勇杀敌，却因一场误判被押入大牢。那种「我明明没错」的愤慨，成了此后强硬处世的底层驱动。',
        modern:      '乱世中白手起家，没有后台没有靠山，只有双手。每一分钱都是用尊严和汗水换来的，所以对一切软弱有着本能的不容忍。',
        contemporary:'工厂倒闭那年，父亲一夜间成了失业工人。他从那时起就明白，世界不会因为你努力过就手下留情，只有攥紧钱才有安全感。'
    },
    '天同': {
        ancient:     '亲历了战乱与流离，见过太多生离死别。内心深处的平和，是用历尽苦难后的放下换来的，而不是天生的乐天。',
        modern:      '在战乱年代，一家人颠沛流离，他学会了在最差的处境里找到一点可以高兴的事。那种「随遇而安」是生存本能，也是一道盔甲。',
        contemporary:'从小在家庭冲突中扮演和事佬，把大人之间的紧张气氛用笑声化解。代价是再大的委屈也要压在心里，表面永远和颜悦色。'
    },
    '廉贞': {
        ancient:     '宫廷中靠着魅力与手腕得以立足，却因此惹来了嫉妒与算计。那次险些葬送一切的陷害，让他明白「被觊觎」本身就是一种危险。',
        modern:      '用美貌和情感换取生存的岁月里，分不清哪段感情是真心，哪段只是交换。那种对真实情感的渴望与不信任，一直延续到后来。',
        contemporary:'被出轨或背叛过，但对外从不提。把脆弱藏在风情和自信之下，越是受伤越要表现得游刃有余，越是缺爱越要显得不在意。'
    },
    '天府': {
        ancient:     '家族鼎盛时，他负责管理财务与人事。那次因轻信族人造成的巨额亏损，成了他毕生谨慎守业的起点。',
        modern:      '兵荒马乱中守着一点家底辗转迁徙。见过太多人因为冲动损失一切，从此奉行「稳中求存」，把保住现有视为最大的智慧。',
        contemporary:'父母离婚后，家里的经济一落千丈。他很早就懂得攒钱、懂得不买不必要的东西，因为曾经的「一切说没就没」让他对不确定性有深深的恐惧。'
    },
    '太阴': {
        ancient:     '曾经深爱的人被迫嫁给了权贵，自己只能在月下独饮，把那种刻骨的遗憾化为才华倾泻而出。从此，所有的柔情都只给得了真心之人。',
        modern:      '乱世中的爱情总是来不及好好说再见。那个在战乱中失散的人，成了他心里永远未完成的句子，往后所有的感情都有一层无从解释的惆怅。',
        contemporary:'曾经经历过情感的背叛或伤害，从此用复杂的外表来保护内心的脆弱。温柔只给真正值得的人，而「值得」这道门槛，不知不觉越设越高。'
    },
    '贪狼': {
        ancient:     '因多才多艺而被权贵宠幸，也因此在政治漩涡里险些灭顶。那次经历让他明白，才华可以是武器，也可以是靶子，关键在于谁在欣赏你。',
        modern:      '在舞台上光彩照人，幕后却承受着常人看不见的代价——被利用、被消耗、被抛弃。璀璨的表面下，藏着对「被真正看见」的深度渴望。',
        contemporary:'从小因为兴趣太多被父母批评「不务正业」，长期生活在「你哪样都行，哪样都不精」的否定里。那种「我有很多面，但没有一面被认可」的感受，成了他最深的隐痛。'
    },
    '巨门': {
        ancient:     '仗义执言触怒当道，被扣上「妖言惑众」的帽子。那次入狱让他明白，真相并不总是受欢迎的，但沉默比说错话更令他窒息。',
        modern:      '曾经用文字揭露黑暗，却因此遭到迫害，入狱或被流亡。那种「我说了真话却换来惩罚」的经历，在他心里留下了深深的不平。',
        contemporary:'从小就因说话直率得罪人，被老师批评，被父母管制，被同学孤立。那种「我不过是说了实话」的委屈，让他对人际规则充满疑惑和愤懑。'
    },
    '天相': {
        ancient:     '在两派争斗中被迫选边，最终站错了队，导致家族蒙难。那次经历让他明白，「公正」是一种奢望，但「不站队」比站错队代价更小。',
        modern:      '战时充当调解人，两边都不信任，两边都随时可能出卖他。那种在夹缝中讨好所有人的疲惫，成了他后来对冲突的本能恐惧。',
        contemporary:'家中的和事佬，从小习惯压抑自己的立场来维持家庭平和。代价是内心充满了「我到底想要什么」的迷惘，以及「我说的话算不算数」的低自我价值感。'
    },
    '天梁': {
        ancient:     '目睹清廉的父亲被贪官陷害，满腔正义无处申诉。那种「我明知道是不对的，却无能为力」的绝望，成了他日后愤世嫉俗与济世情怀并存的根源。',
        modern:      '在乱世中扮演医者或救人者，见过太多死亡，救了太多人，唯独救不了自己。那种承载了太多他人痛苦的心，偶尔也会在无人处垮下来。',
        contemporary:'从小就被当作「懂事的孩子」，习惯了照顾别人的情绪，压抑自己的需求。长大后成了谁都来诉苦的对象，内心却从未有人真正照顾过。'
    },
    '七杀': {
        ancient:     '沙场上见过太多兄弟倒下，杀戮带来的不只是胜利，还有夜里回荡不去的鬼哭狼嚎。强硬的外表，是用来盖住那些无法消化的恐惧和悲痛的。',
        modern:      '在最危险的时代独自扛下了太多——上有老下有小，处处是战场。那种长期的高压与无处倾诉，让他把情感的阀门锁死，变成了一个「只要撑着就好」的人。',
        contemporary:'从小就要在家里竞争，要证明自己有价值，要成为「那个厉害的那个」。成功后才发现，内心深处一直在为了证明给父亲看而奔跑，而父亲可能从未真正在意过结果。'
    },
    '破军': {
        ancient:     '曾经的变法或革新以失败告终，同道被株连，他侥幸出走。那种「我们明明是对的，却还是输了」的愤懑，成了驱动他日后不断打破一切的燃料。',
        modern:      '经历了一次彻底的「归零」——战争、政治运动或家族颠覆。一切熟悉的东西都没了，只剩下一个人重新开始的选择。那次彻底的破灭，反而成为他最轻盈的自由起点。',
        contemporary:'换过很多工作、很多城市、很多人，不是因为不负责任，而是因为内心有个声音不断说「这还不是我想要的」。那种对自我的不确定和对世界的不满足，是一把双刃剑。'
    }
};
window.ERA_WOUNDS = ERA_WOUNDS;
window.STAR_ERA_WOUNDS = STAR_ERA_WOUNDS;

// ==================== 辅助函数 ====================

function _getProfessionLabel(prof) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        var labelsEN = {political:'Politics', business:'Business', cultural:'Education & Culture', military:'Military & Law Enforcement', technical:'Technology', other:'Other'};
        return labelsEN[prof] || 'Other';
    }
    if (lang === 'zh-TW') {
        var labelsTW = {political:'政界', business:'商界', cultural:'文教', military:'軍警', technical:'技術', other:'其他'};
        return labelsTW[prof] || '其他';
    }
    var labels = {political:'政界', business:'商界', cultural:'文教', military:'军警', technical:'技术', other:'其他'};
    return labels[prof] || '其他';
}

function _getStarPersonality(star) {
    var p = STAR_DETAILED_DESCRIPTIONS[star];
    if (p) return p.personality.split('。')[0];
    var fallback = {
        '紫微':'尊贵威严、领导力强', '天机':'聪明机智、善于策划', '太阳':'光明磊落、热情大方',
        '武曲':'刚毅果断、务实重财', '天同':'温和善良、福气深厚', '廉贞':'复杂好胜、魅力十足',
        '天府':'稳重保守、善于守成', '太阴':'温柔细腻、艺术气质', '贪狼':'多才多艺、桃花旺盛',
        '巨门':'口才出众、研究精神', '天相':'稳重正直、贵人运强', '天梁':'清高正直、长辈风范',
        '七杀':'勇猛果断、将星特质', '破军':'开创变革、先锋精神'
    };
    return fallback[star] || '独特个性';
}

function _getStarSpiritualNeed(star) {
    var needs = {
        '紫微':'追求尊贵和认可，内心需要被仰视', '天机':'追求智慧和思考，内心永不停歇',
        '太阳':'追求表达和光明，内心需要被看见', '武曲':'追求实际成果，内心需要成就感',
        '天同':'追求平静和和谐，内心需要安全感', '廉贞':'追求复杂和刺激，内心需要激情',
        '天府':'追求稳定和富足，内心需要保障',   '太阴':'追求浪漫和美好，内心需要呵护',
        '贪狼':'追求刺激和满足，内心需要新鲜感', '巨门':'追求真相和表达，内心需要理解',
        '天相':'追求公正和和谐，内心需要平衡',   '天梁':'追求清高和理想，内心需要尊重',
        '七杀':'追求独立和强大，内心需要掌控',   '破军':'追求变革和突破，内心需要自由'
    };
    return needs[star] || '追求自我实现';
}

function _getStarPartnerNeed(star) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        var needsEN = {
            '紫微':'Needs a partner who can look up to, respect',
            '天机':'Needs someone smart, good at communication',
            '太阳':'Needs someone sunny, cooperative',
            '武曲':'Needs someone practical, competent',
            '天同':'Needs someone gentle, who can accompany',
            '廉贞':'Needs someone who understands their complexity',
            '天府':'Needs someone steady, responsible',
            '太阴':'Needs someone tender, nurturing',
            '贪狼':'Needs someone interesting, refined',
            '巨门':'Needs someone who communicates, holds nothing back',
            '天相':'Needs someone upright, virtuous',
            '天梁':'Needs someone who respects, who can grow',
            '七杀':'Needs someone independent, responsible',
            '破军':'Needs someone tolerant, adaptable'
        };
        return needsEN[star] || 'Needs a partner who understands';
    } else {
        var needs = {
            '紫微':'需要能仰视、尊重的伴侣',         '天机':'需要聪明、能沟通的伴侣',
            '太阳':'需要阳光、能配合的伴侣',         '武曲':'需要务实、有能力的伴侣',
            '天同':'需要温和、能陪伴的伴侣',         '廉贞':'需要理解其复杂性的伴侣',
            '天府':'需要稳重、有担当的伴侣',         '太阴':'需要温柔、能呵护的伴侣',
            '贪狼':'需要有趣、有品位的伴侣',         '巨门':'需要能沟通、不隐瞒的伴侣',
            '天相':'需要正直、有品德的伴侣',         '天梁':'需要尊重、能成长的伴侣',
            '七杀':'需要独立、有担当的伴侣',         '破军':'需要包容、能变化的伴侣'
        };
        return needs[star] || '需要能理解的伴侣';
    }
}

function _getDefenseMechanism(sihua) {
    var m = {
        '化禄':'通过轻松愉悦来化解压力',   '化禄型':'通过轻松愉悦来化解压力',
        '化权':'通过掌控来获得安全感',     '化权型':'通过掌控来获得安全感',
        '化科':'通过理性管理来维护形象',   '化科型':'通过理性管理来维护形象',
        '化忌':'通过执念来对抗不安全感',   '化忌型':'通过执念来对抗不安全感'
    };
    return m[sihua] || '通过特定方式获得心理平衡';
}

function _getSihuaCognitiveFlaw(sihua) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        var fEN = {
            '化禄':'relying on natural talent', '化禄型':'relying on natural talent',
            '化权':'maintaining control at all costs', '化权型':'maintaining control at all costs',
            '化科':'managing image through rationality', '化科型':'managing image through rationality',
            '化忌':'living inside an unresolved fixation', '化忌型':'living inside an unresolved fixation'
        };
        return fEN[sihua] || 'a particular survival pattern';
    }
    if (lang === 'zh-TW') {
        var fTW = {
            '化祿':'依賴天賦', '化祿型':'依賴天賦',
            '化禄':'依賴天賦', '化禄型':'依賴天賦',
            '化權':'通過掌控', '化权型':'通過掌控',
            '化科':'通過理性管理維持形象', '化科型':'通過理性管理維持形象',
            '化忌':'通過執念', '化忌型':'通過執念'
        };
        return fTW[sihua] || '特定方式';
    }
    var f = {
        '化禄':'依赖天赋', '化禄型':'依赖天赋',
        '化权':'通过掌控', '化权型':'通过掌控',
        '化科':'通过理性管理维持形象', '化科型':'通过理性管理维持形象',
        '化忌':'通过执念', '化忌型':'通过执念'
    };
    return f[sihua] || '特定方式';
}

function _getSihuaPositive(sihua) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        var pEN = {
            '化禄型':'Natural talent flows effortlessly — no extra effort needed',
            '化禄':  'Natural talent flows effortlessly — no extra effort needed',
            '化权型':'Strong leadership, execution, responsibility',
            '化权':  'Strong leadership, execution, responsibility',
            '化科型':'Image-conscious, rational, perfectionist',
            '化科':  'Image-conscious, rational, perfectionist',
            '化忌型':'Deep insight, persistence, intense focus',
            '化忌':  'Deep insight, persistence, intense focus',
            '禄权叠加型':'Talent plus control — high capacity and efficiency',
            '权忌冲突型':'Growth through contradiction, profound thinking',
            '科忌矛盾型':'Idealism meets reality, deep insight',
            '禄忌纠缠型':'Exploring through entanglement, emotional richness'
        };
        return pEN[sihua] || 'Unique psychological traits';
    }
    var p = {
        '化禄型':'天赋自然流露，无需刻意努力就能做到',
        '化禄':  '天赋自然流露，无需刻意努力就能做到',
        '化权型':'主导能力强，执行力强，有责任感',
        '化权':  '主导能力强，执行力强，有责任感',
        '化科型':'注重形象，理性思考，追求完美',
        '化科':  '注重形象，理性思考，追求完美',
        '化忌型':'深刻洞察，坚持不懈，执著追求',
        '化忌':  '深刻洞察，坚持不懈，执著追求',
        '禄权叠加型':'天赋加掌控，能力强，效率高',
        '权忌冲突型':'在矛盾中成长，思想深刻',
        '科忌矛盾型':'理想与现实碰撞，思想深刻',
        '禄忌纠缠型':'在纠缠中探索，情感丰富'
    };
    return p[sihua] || '独特的心理特质';
}

function _getSihuaNegative(sihua) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        var nEN = {
            '化禄型':'Over-reliance on talent, lacks sustained drive',
            '化禄':  'Over-reliance on talent, lacks sustained drive',
            '化权型':'Excessive control, difficulty letting go',
            '化权':  'Excessive control, difficulty letting go',
            '化科型':'Over-concerned with others\' opinions, suppresses real feelings',
            '化科':  'Over-concerned with others\' opinions, suppresses real feelings',
            '化忌型':'Deep fixation, hard to let go of the past',
            '化忌':  'Deep fixation, hard to let go of the past',
            '禄权叠加型':'Excessive desire, prone to overreach',
            '权忌冲突型':'Inner conflict, hard to choose',
            '科忌矛盾型':'Reason vs. fixation, inner exhaustion',
            '禄忌纠缠型':'Emotional volatility, hard to stabilise'
        };
        return nEN[sihua] || 'Traits that need balance';
    }
    var n = {
        '化禄型':'过度依赖天赋，缺乏持续动力',
        '化禄':  '过度依赖天赋，缺乏持续动力',
        '化权型':'控制欲过强，难以放手',
        '化权':  '控制欲过强，难以放手',
        '化科型':'过度在意他人眼光，压抑真实情感',
        '化科':  '过度在意他人眼光，压抑真实情感',
        '化忌型':'执念深重，难以释怀过去',
        '化忌':  '执念深重，难以释怀过去',
        '禄权叠加型':'欲望过强，容易膨胀',
        '权忌冲突型':'内心纠结，难以取舍',
        '科忌矛盾型':'理性与执念冲突，内耗严重',
        '禄忌纠缠型':'情感波动大，难以稳定'
    };
    return n[sihua] || '需要平衡的特质';
}

function _getSihuaPrinciple(sihua) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        var prEN = {
            '化禄型':'The most natural, effortless part of the personality — innate strength',
            '化禄':  'The most natural, effortless part of the personality — innate strength',
            '化权型':'The part that gains security through control',
            '化权':  'The part that gains security through control',
            '化科型':'The part that maintains self through rational management',
            '化科':  'The part that maintains self through rational management',
            '化忌型':'The deepest wound in the personality — and the opportunity for growth',
            '化忌':  'The deepest wound in the personality — and the opportunity for growth',
            '禄权叠加型':'Talent and control combined — needs balanced expression',
            '权忌冲突型':'Control vs. fixation conflict — needs resolution',
            '科忌矛盾型':'Reason vs. fixation tension — needs integration',
            '禄忌纠缠型':'Pleasure vs. fixation entanglement — needs liberation'
        };
        return prEN[sihua] || 'Unique psychological mechanism';
    }
    var pr = {
        '化禄型':'这是人格中最自然、最轻松的部分，天生优势',
        '化禄':  '这是人格中最自然、最轻松的部分，天生优势',
        '化权型':'这是人格中通过掌控获得安全感的部分',
        '化权':  '这是人格中通过掌控获得安全感的部分',
        '化科型':'这是人格中通过理性管理维护自我的部分',
        '化科':  '这是人格中通过理性管理维护自我的部分',
        '化忌型':'这是人格中最深层的伤痕，也是成长的契机所在',
        '化忌':  '这是人格中最深层的伤痕，也是成长的契机所在',
        '禄权叠加型':'天赋与掌控的结合，需要平衡发挥',
        '权忌冲突型':'掌控与执念的冲突，需要化解',
        '科忌矛盾型':'理性与执念的矛盾，需要整合',
        '禄忌纠缠型':'享受与执念的纠缠，需要解脱'
    };
    return pr[sihua] || '独特的心理机制';
}

function _getDramaticRole(patternType) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        var rEN = {
            '杀破狼':   'Catalyst or arch-rival — pushes the story forward, generates conflict',
            '紫府廉武相':'Mentor or antagonist — provides wisdom or forms opposition',
            '机月同梁': 'Guardian or mirror character — offers support or creates contrast',
            '巨日':     'Idealist or public figure — embodies a value the story is testing'
        };
        return rEN[patternType] || 'A key character who shapes the story\'s direction';
    }
    if (lang === 'zh-TW') {
        var rTW = {
            '杀破狼':   '催化劑或死敵——推動劇情發展，製造衝突',
            '紫府廉武相':'導師或對手——提供智慧或形成對抗',
            '机月同梁': '守護者或鏡像人物——給予支持或形成對比',
            '巨日':     '理想主義者或公衆人物——代表某種價值觀'
        };
        return rTW[patternType] || '關鍵角色';
    }
    var r = {
        '杀破狼':   '催化剂或死敌——推动剧情发展，制造冲突',
        '紫府廉武相':'导师或对手——提供智慧或形成对抗',
        '机月同梁': '守护者或镜像人物——给予支持或形成对比',
        '巨日':     '理想主义者或公众人物——代表某种价值观'
    };
    return r[patternType] || '关键角色';
}

function _generateAppearanceByStar(star, attribute) {
    var appearances = {
        '紫微':'面容方正威严，天庭饱满，眼神坚定，气质尊贵',
        '天机':'面容清秀，眉目清朗，眼神灵动，身形修长',
        '太阳':'面容饱满红润，眼神明亮，笑容灿烂，气质阳光',
        '武曲':'面容刚毅，线条分明，眼神坚定，身形魁梧',
        '天同':'面容圆润和善，笑容可掬，给人亲切之感',
        '廉贞':'面容俊美，眼神勾人，自带魅力，身形匀称',
        '天府':'面容方正稳重，气质可靠，身形端正',
        '太阴':'面容柔和温婉，气质优雅，身形柔美',
        '贪狼':'面容俊美，眼神迷人，自带艺术气质',
        '巨门':'面容严肃，眼神锐利，动作干脆利落',
        '天相':'面容端正正直，气质稳重，手掌厚实',
        '天梁':'面容慈祥清高，身形修长，有长辈风范',
        '七杀':'面容刚毅锐利，眼神威严，身形魁梧',
        '破军':'面容独特，气质不凡，动作敏捷有力'
    };
    var base = appearances[star] || '面容端正，气质不凡';
    return attribute ? attribute + '。' + base : base;
}

function _generateSignatureByStar(star) {
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    if (lang === 'en') {
        var sEN = {
            '紫微': 'Habitually straightens sleeves — a micro-gesture of self-composure',
            '天机': 'Turns objects in hand while thinking; fingers rarely still',
            '太阳': 'Laughter carries across a room; tends to touch people\'s shoulders',
            '武曲': 'Walks with purpose; footsteps audible; no small talk',
            '天同': 'Always has a gentle smile; speaks softly, never in a rush',
            '廉贞': 'A glance that lands with more intention than seems accidental',
            '天府': 'Sits upright, never slouches; rarely without a bag or folder in hand',
            '太阴': 'Speaks quietly; eyes drop when uncertain; instinctively adjusts to others',
            '贪狼': 'The smile arrives before the words do; can\'t hide enthusiasm for new things',
            '巨门': 'Speaks quickly; mind clearly running ahead of speech; often pushes glasses up',
            '天相': 'Measured, courteous phrasing; defaults to polite register with everyone',
            '天梁': 'Unhurried delivery; tends to give advice unprompted, but never without care',
            '七杀': 'Walks fast, head up, gaze straight; gets to the point immediately',
            '破军': 'Direct to the point of bluntness; instinctively challenges the obvious way'
        };
        return sEN[star] || 'A distinctive personal habit that gives them away';
    }
    if (lang === 'zh-TW') {
        var sTW = {
            '紫微': '習慣性地整理衣袖，確保一絲不苟',
            '天机': '思考時習慣轉動手中物品',
            '太阳': '笑聲爽朗，感染力強，喜歡拍人肩膀',
            '武曲': '走路帶風，腳步聲重，從不廢話',
            '天同': '總是帶著溫和的笑容，說話輕聲細語',
            '廉贞': '眼神魅惑，有意無意吸引他人注意',
            '天府': '坐姿端正，從不懶散，喜歡用公文包',
            '太阴': '說話輕柔，容易害羞，喜歡低頭',
            '贪狼': '總是帶著迷人的微笑，喜歡展示才藝',
            '巨门': '說話語速快，思維敏捷，習慣推眼鏡',
            '天相': '說話溫和有分寸，喜歡用敬語',
            '天梁': '說話慢條斯理，喜歡給建議',
            '七杀': '走路帶風，氣勢逼人，說話簡短有力',
            '破军': '說話直來直去，不留情面，喜歡打破常規'
        };
        return sTW[star] || '有獨特的個人習慣';
    }
    var s = {
        '紫微':'习惯性地整理衣袖，确保一丝不苟',
        '天机':'思考时习惯转动手中物品',
        '太阳':'笑声爽朗，感染力强，喜欢拍人肩膀',
        '武曲':'走路带风，脚步声重，从不废话',
        '天同':'总是带着温和的笑容，说话轻声细语',
        '廉贞':'眼神魅惑，有意无意吸引他人注意',
        '天府':'坐姿端正，从不懒散，喜欢用公文包',
        '太阴':'说话轻柔，容易害羞，喜欢低头',
        '贪狼':'总是带着迷人的微笑，喜欢展示才艺',
        '巨门':'说话语速快，思维敏捷，习惯推眼镜',
        '天相':'说话温和有分寸，喜欢用敬语',
        '天梁':'说话慢条斯理，喜欢给建议',
        '七杀':'走路带风，气势逼人，说话简短有力',
        '破军':'说话直来直去，不留情面，喜欢打破常规'
    };
    return s[star] || '有独特的个人习惯';
}

// ==================== 流年流时工具（差异化随机种子）====================
/**
 * 获取当前时间的干支信息，作为随机种子影响生成内容
 * 天干：甲乙丙丁戊己庚辛壬癸（10个）
 * 地支/时辰：子丑寅卯辰巳午未申酉戌亥（12个）
 */
function _getCurrentTimeGanzhi() {
    var now = new Date();
    var tian = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    var di   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    // 流年天干：以2024甲辰年为基准，offset
    var yearGan  = tian[(now.getFullYear() - 2024 + 40) % 10];
    var yearZhi  = di[(now.getFullYear()  - 2024 + 16) % 12];
    // 流月地支：1月=寅
    var monthZhi = di[(now.getMonth() + 2) % 12];
    // 流日地支：以日期数字 mod 12
    var dayZhi   = di[now.getDate() % 12];
    // 流时：每2小时一个时辰
    var hourIdx  = Math.floor(((now.getHours() + 1) % 24) / 2);
    var shiZhi   = di[hourIdx];
    var shiTrait = (SHI_CHEN_ENERGY[shiZhi] || {}).trait || '气机平稳';
    // 用年+月+日+时做一个0-55的整数种子，确保同一时辰内结果稳定
    var seed = ((now.getFullYear() % 10) * 1000 + now.getMonth() * 100 + now.getDate() * 3 + hourIdx) % 56;
    return { yearGan, yearZhi, monthZhi, dayZhi, shiZhi, shiTrait, seed };
}

// ── 流时×主星：「此刻状态」描述（让同一角色不同时辰生成的描述也不同）──
var SHI_STAR_STATE = {
    '紫微': ['此刻的统御欲尤为旺盛，说话带着不容置疑的重量','此刻反而沉默，在沉默中积蓄下一步的力量','此刻对细节异常挑剔，任何松懈都让他感到不安','此刻显得格外疏离，仿佛把所有人都隔在玻璃后面'],
    '天机': ['此刻脑子里同时跑着三条思路，表面却波澜不惊','此刻情绪比平时更难捉摸，内心正在重新盘算什么','此刻手指不自觉地轻敲桌面，那是他在推演某个计划','此刻罕见地放松，让周围人误以为他什么都不在乎'],
    '太阳': ['此刻光芒格外盛，走进哪里哪里就热闹起来','此刻内心有轻微的疲惫，但仍本能地对人微笑','此刻正义感突然被点燃，有话不吐不快','此刻需要一个人待着，但又怕沉默让别人担心'],
    '武曲': ['此刻行动力极强，计划一旦定下就立刻执行','此刻格外话少，所有精力都集中在手头的事','此刻对拖延的人有明显的不耐烦','此刻内心有一股无处发泄的劲儿，需要找个出口'],
    '天同': ['此刻比任何时候都像一个孩子，容易被小事逗乐','此刻慵懒的满足感溢出来，不想被任何事打扰','此刻内心有一丝说不清的惆怅，但不知道从哪里来','此刻对身边人特别温柔，像在用温度驱散什么'],
    '廉贞': ['此刻魅力值达到峰值，无意间吸引着所有目光','此刻内心的欲望和克制在角力，表面却异常平静','此刻情绪比平时更复杂，一句话就能点燃也能熄灭','此刻需要被看见，却又拒绝承认这种需求'],
    '天府': ['此刻安全感最强，像一座山，不会轻易被撼动','此刻正在默默盘算，把每一分资源都放到最合适的位置','此刻对不稳定的因素特别警觉，比平时更谨慎','此刻有一种难得的慷慨，愿意分享平时绝不轻易给出的东西'],
    '太阴': ['此刻情感最细腻，能感受到别人感受不到的细微变化','此刻像月亮一样，只把柔光留给信任的人','此刻内心有一股莫名的感伤，如果有音乐会更明显','此刻对美的感知被放大了，任何粗糙都显得刺眼'],
    '贪狼': ['此刻的欲望感最强，对新鲜事物有强烈的占有冲动','此刻魅力以最自然的方式流淌，不费力就让人着迷','此刻有点坐不住，需要刺激，需要变化，需要故事','此刻罕见地内敛，把所有的热情藏进了微笑里'],
    '巨门': ['此刻说话最犀利，每一句都直指核心，不留情面','此刻正在消化某个信息，表面安静内里思绪万千','此刻对谎言和表演异常敏感，一眼就能看穿','此刻有很多话想说，但正在决定哪些值得说'],
    '天相': ['此刻是最好的倾听者，让人有一种被完全接住的感觉','此刻在维持着某种微妙的平衡，任何偏移都会被察觉','此刻需要一个明确的立场，夹在中间比任何时候都累','此刻公正感最强，对任何不公平都想说点什么'],
    '天梁': ['此刻的清醒让周围所有人的小算盘都无所遁形','此刻在以一种不动声色的方式保护着什么','此刻理想主义被现实磨损得格外明显，需要重新点火','此刻像一个阅尽世事的老灵魂，沉默里藏着很多话'],
    '七杀': ['此刻战意最强，任何阻碍都是需要突破的靶子','此刻内心的孤独感浮出水面，但绝对不会示人','此刻决策力达到峰值，没有犹豫，没有退路','此刻有一种「已经输无可输」的豁然，反而是最危险的状态'],
    '破军': ['此刻对现状的不满最强烈，改变的冲动随时要爆发','此刻把自己拆散又重新组装，谁也不知道会拼出什么','此刻的破坏力和创造力同时在线，是危险也是机会','此刻正站在一个选择的节点上，一步决定之后的全部']
};

// ==================== 主星×四化 交叉数据库（差异化核心）====================

// ── 防御机制：主星×四化（56种，告别4种重复）──
var STAR_SIHUA_DEFENSE = {
    '紫微': { '化禄型':'用天生的尊贵感和掌控力让自己显得无懈可击，以「我本就如此」的姿态化解外部质疑', '化权型':'通过绝对的主导权建立安全边界，失控比失败更令他恐惧', '化科型':'用完美的形象和理性的外表包裹内心的骄傲，绝不在人前暴露软肋', '化忌型':'将执念藏进尊严里，用「绝不低头」对抗内心深处的不安全感' },
    '天机': { '化禄型':'用智慧和机变制造出「一切都在掌控之中」的感觉，让危机在别人发现前就被化解', '化权型':'通过谋划和预判来掌控局面，觉得只要算得足够准就不会受伤', '化科型':'用知识和逻辑构筑理性的城墙，把情感的风险降到最低', '化忌型':'把焦虑转化成不停的推演，越担心就越想多算一步，停不下来' },
    '太阳': { '化禄型':'用光明和热情感染周围，让所有人都开心就是最好的防御', '化权型':'通过成为注目焦点来压制内心的不安，只要还在发光就没有恐惧', '化科型':'用正义感和公众形象包裹自己，让别人难以攻击「一个好人」', '化忌型':'把内心的愤懑和不平转化成更强的光，用燃烧来对抗被忽视的恐惧' },
    '武曲': { '化禄型':'用实际成果和财富积累证明自己的价值，让能力成为最坚固的盔甲', '化权型':'通过绝对的执行力和果断告诉世界「我不需要任何人」', '化科型':'把所有情感放进工作，用务实的成绩管理别人对自己的期待', '化忌型':'用更拼命的努力来压住「我还不够好」的声音，累到没时间恐惧' },
    '天同': { '化禄型':'用温和和随遇而安化解一切冲突，让自己永远活在宽松的心理状态里', '化权型':'用「我不在乎」的姿态保护内心真正在意的东西，佯装洒脱', '化科型':'用照顾别人的方式回避被人照顾——被需要比被关注更让他有安全感', '化忌型':'把压抑的委屈用轻描淡写掩盖，对外永远是那个好相处的人' },
    '廉贞': { '化禄型':'用魅力和吸引力让自己始终处于被需要的位置，有人围绕就有安全感', '化权型':'通过复杂的情感控制和欲望管理来主导关系，绝不让自己处于被动', '化科型':'把内心的炙热用精致的包装呈现，让人看见光芒却摸不到温度', '化忌型':'用情感执念对抗内心的空洞，爱得越深越怕失去，失去了就用恨填补' },
    '天府': { '化禄型':'用财富和资源的积累给自己搭建一个足够厚的防护层，让外界很难真正触碰', '化权型':'通过守住一切现有的东西来获得安全感，放弃比失去更难接受', '化科型':'用体面和规矩建立秩序，只要一切井然有序内心就不会乱', '化忌型':'把内心对失去的恐惧转化成对细节的极度掌控，每一分钱每一段关系都要算清楚' },
    '太阴': { '化禄型':'用温柔和体贴包裹自己，在被需要和被爱中找到存在的意义', '化权型':'表面柔顺内心强韧，用情感影响力代替正面对抗来实现主导', '化科型':'把情感深藏在审美和精致背后，只展示美好的部分，把脆弱藏起来', '化忌型':'在关系里反复确认「你还爱我吗」，执念像月光一样无处不在又无法握住' },
    '贪狼': { '化禄型':'用才华和魅力构建出让人目不暇接的表演，让别人没有机会看到内心的空洞', '化权型':'通过不断追求新的刺激和占有来证明自己的存在感，停下来就会陷入虚无', '化科型':'用多元的表达和社交形象管理外界对自己的定义，永远呈现最好的那一面', '化忌型':'对某个渴望执念极深，得不到就越想要，用欲望填满内心真正的孤独' },
    '巨门': { '化禄型':'用口才和沟通力化解一切，让真相成为最好的防身武器', '化权型':'通过「我比你更了解真相」建立认知优势，让别人无法反驳就是最安全的位置', '化科型':'用知识和理性论证来保护自己不被情绪左右，越理性越安全', '化忌型':'把话憋在心里反而是最大的内耗，越不说越执念，越执念越难放下' },
    '天相': { '化禄型':'用「服务者」的身份让所有人都满意，只要没有人不高兴自己就安全', '化权型':'通过维持公正和秩序来获得不可替代的价值，没人能攻击一个「公平的人」', '化科型':'用得体的形象和周全的应对让自己始终处于被尊重的位置', '化忌型':'把内心的立场和情绪统统藏进「以大局为重」里，直到有一天再也压不住' },
    '天梁': { '化禄型':'用清高和理想主义构筑道德高地，让自己永远站在一个难以被攻击的位置', '化权型':'通过扮演保护者和教导者来主导关系，帮助别人让自己感到不可或缺', '化科型':'用学识和阅历建立权威感，只要我见过的比你多，你就无法让我恐惧', '化忌型':'把内心的愤世嫉俗藏在清高背后，用「我不在乎」掩盖「我明明很在乎」' },
    '七杀': { '化禄型':'用不断的行动和胜利证明自己不需要任何依赖，强大就是最好的防御', '化权型':'通过绝对的独立和果断消灭一切被控制的可能，宁可孤独也不被束缚', '化科型':'把所有情感放进战略里，用理性消化一切，不让自己软下来', '化忌型':'把内心最深的恐惧和孤独转化成更猛的冲劲，用战斗代替感受' },
    '破军': { '化禄型':'用不断的变化和开创让自己永远在移动，停下来才是最大的风险', '化权型':'通过率先打破来掌握主动，宁可我破坏它，也不让它限制我', '化科型':'把内心的混乱用风格化和个性化包装成「我就是这样」，拒绝被定义', '化忌型':'把内心对「一切都会失去」的恐惧转化成彻底的虚无主义，既然守不住不如先放弃' }
};

// ── 防御机制英文版：主星×四化（56种）──
var STAR_SIHUA_DEFENSE_EN = {
    '紫微': { '化禄型':'Uses innate dignity and control to appear invulnerable, deflecting doubt with "this is simply who I am"', '化权型':'Establishes safe boundaries through absolute dominance — losing control is more terrifying than failure', '化科型':'Wraps inner pride in perfect image and rational appearance, never exposing weakness before others', '化忌型':'Hides obsession inside dignity, fighting deep insecurity with "I will never bow"' },
    '天机': { '化禄型':'Creates a sense that "everything is under control" through wit and adaptability, resolving crises before others notice', '化权型':'Controls situations through planning and prediction — calculating precisely enough to avoid harm', '化科型':'Builds rational walls with knowledge and logic, minimizing emotional risk', '化忌型':'Transforms anxiety into endless projection — the more worried, the more steps calculated, unable to stop' },
    '太阳': { '化禄型':'Infects surroundings with light and warmth — making everyone happy is the best defense', '化权型':'Suppresses inner unease by becoming the center of attention — as long as still shining, there is no fear', '化科型':'Wraps self in righteousness and public image, making it hard to attack "a good person"', '化忌型':'Transforms inner anger and grievance into even stronger light, burning to combat the fear of being ignored' },
    '武曲': { '化禄型':'Proves worth through actual results and wealth — capability becomes the strongest armor', '化权型':'Declares to the world through absolute execution and decisiveness: "I need no one"', '化科型':'Channels all emotion into work, managing others\' expectations with pragmatic achievements', '化忌型':'Suppresses the voice "I\'m still not good enough" with even harder work, too exhausted to feel fear' },
    '天同': { '化禄型':'Dissolves all conflict with gentleness and going with the flow, keeping a relaxed psychological state', '化权型':'Protects what truly matters with an "I don\'t care" attitude, pretending detachment', '化科型':'Avoids being cared for by caring for others — being needed gives more security than being noticed', '化忌型':'Covers suppressed grievances with understatement, forever appearing easy to get along with' },
    '廉贞': { '化禄型':'Keeps self always needed through charm and attraction — people around means security', '化权型':'Dominates relationships through complex emotional control and desire management, never passive', '化科型':'Presents inner fire in exquisite packaging — showing brilliance without revealing temperature', '化忌型':'Fights inner emptiness with emotional obsession — the deeper the love, the deeper the fear of loss, using hate to fill absence' },
    '天府': { '化禄型':'Builds a thick protective layer through wealth and resource accumulation, hard for others to truly touch', '化权型':'Gains security by holding onto everything — letting go is harder than losing', '化科型':'Establishes order through propriety and rules — as long as everything is orderly, the heart won\'t be chaotic', '化忌型':'Transforms fear of loss into extreme control over details — every penny, every relationship must be accounted for' },
    '太阴': { '化禄型':'Wraps self in gentleness and consideration, finding meaning in being needed and loved', '化权型':'Supple on the surface, tough within — using emotional influence instead of direct confrontation to lead', '化科型':'Hides emotions deep behind aesthetics and refinement, showing only the beautiful, hiding the fragile', '化忌型':'Constantly confirms "do you still love me" in relationships — obsession pervasive as moonlight, impossible to grasp' },
    '贪狼': { '化禄型':'Constructs a dazzling performance with talent and charm, giving others no chance to see inner emptiness', '化权型':'Proves existence through constant pursuit of new stimulation and possession — stopping means falling into void', '化科型':'Manages others\' definitions through diverse expression and social image, always presenting the best version', '化忌型':'Deeply obsessed with a particular desire — what cannot be obtained is wanted more, using desire to fill true loneliness' },
    '巨门': { '化禄型':'Resolves everything with eloquence and communication — truth becomes the best defense weapon', '化权型':'Builds cognitive advantage through "I understand the truth better than you" — unassailable is the safest position', '化科型':'Protects self from emotion with knowledge and rational argument — the more rational, the safer', '化忌型':'Holding words inside creates the greatest internal drain — the more unspoken, the more obsessive, the harder to let go' },
    '天相': { '化禄型':'Uses "servant" identity to satisfy everyone — as long as no one is unhappy, self is safe', '化权型':'Gains irreplaceable value through maintaining fairness and order — no one can attack "a fair person"', '化科型':'Maintains a respected position through proper image and thoughtful responses', '化忌型':'Hides all inner positions and emotions inside "for the greater good" until one day it can no longer be suppressed' },
    '天梁': { '化禄型':'Constructs moral high ground with aloofness and idealism, standing in a position hard to attack', '化权型':'Dominates relationships by playing protector and teacher — helping others makes one feel indispensable', '化科型':'Builds authority through knowledge and experience — "what I\'ve seen exceeds what you know" eliminates fear', '化忌型':'Hides inner cynicism behind aloofness, using "I don\'t care" to mask "I actually care deeply"' },
    '七杀': { '化禄型':'Proves no need for dependence through constant action and victory — strength is the best defense', '化权型':'Eliminates all possibility of being controlled through absolute independence and decisiveness — rather lonely than bound', '化科型':'Puts all emotion into strategy, digesting everything with reason, not allowing self to soften', '化忌型':'Transforms deepest fear and loneliness into fiercer drive — fighting replaces feeling' },
    '破军': { '化禄型':'Keeps forever in motion through constant change and initiation — stopping is the greatest risk', '化权型':'Seizes initiative by breaking first — better I destroy it than let it limit me', '化科型':'Packages inner chaos in stylized individuality as "this is simply who I am", refusing definition', '化忌型':'Transforms fear "everything will be lost" into thorough nihilism — if it cannot be kept, might as well abandon first' }
};

// ── 转折事件：主星×四化（56种，告别写死的「某个关键事件」）──
var STAR_SIHUA_TURNING = {
    '紫微': { '化禄型':'曾经最倚重的人在他最需要时转身离去，那一刻他才发现，靠地位赢来的忠诚根本不算忠诚', '化权型':'一次被完全架空的经历——所有的权力在一夜之间被抽走，让他第一次正视「掌控」只是幻觉', '化科型':'在大庭广众之下被人当众质疑，那种难堪不是来自失败，而是来自形象的瞬间崩塌', '化忌型':'苦苦执念的目标在触手可及时突然消失，那一刻他才明白，执念本身就是最大的枷锁' },
    '天机': { '化禄型':'算无遗策的他第一次遭遇一个完全看不懂的人，所有逻辑在对方面前失效', '化权型':'一个他亲手设计的计划成功了，却让不该受伤的人付出了代价，那是他第一次质疑自己的谋略', '化科型':'一次因为「理性分析」而错过的真实情感，让他意识到有些东西不能被计算', '化忌型':'追了很久的答案找到了，却发现问题本身是错的——那种空洞感比找不到答案更可怕' },
    '太阳': { '化禄型':'发现自己的光明和慷慨被人利用，不是心寒，而是第一次意识到真诚也需要有边界', '化权型':'一次为正义出头却换来惨败，让他第一次理解到「对的」不等于「赢得了的」', '化科型':'最需要被看见的时刻，周围一片沉默——那种孤独比被批评还难受', '化忌型':'心里的那把火第一次被真正浇灭，发现愤怒燃尽之后，剩下的只是疲惫' },
    '武曲': { '化禄型':'第一次因为努力换来了什么，却发现内心并没有更踏实，那种空洞感让他不得不往更深处看', '化权型':'一次拒绝妥协的决策让他赢了，但也让他彻底孤立了，那才是他真正要学的代价', '化科型':'在最务实的关头做出了一次情感决定，发现那个决定居然是对的——这打破了他所有的世界观', '化忌型':'拼命抓住的东西最终还是失去了，那种「我付出了这么多却还是没有守住」的痛，是一次重生前的彻底崩塌' },
    '天同': { '化禄型':'长期的随遇而安让他错过了一件真正重要的事，第一次意识到「不在乎」是有代价的', '化权型':'被最信任的人的「为你好」所伤，才明白无论多温柔，边界终究需要自己守', '化科型':'第一次真正说出了内心真实的需求，没有讨好没有退让，结果是被接住了——那改变了他对「表达」的全部认知', '化忌型':'某段关系的结束不是因为争吵，而是因为太多没说出口的话慢慢堆成了距离，那种无声的失去是最重的' },
    '廉贞': { '化禄型':'第一次在一段关系里不用表演，被人真实地看见，那种没有面具的感觉既解放又恐慌', '化权型':'在感情里第一次真正失去了掌控，那种无力感让他怒火中烧，也让他第一次审视「控制」背后的恐惧', '化科型':'某个精心维护的形象在意想不到的一刻彻底崩塌，才发现内心真正在意的从来不是别人的眼光', '化忌型':'一段执念燃烧殆尽的时刻——不是因为放下了，而是因为彻底燃尽了，那种灰烬感让他第一次直视自己' },
    '天府': { '化禄型':'某个他积累了多年的东西在一夜之间失去，才发现安全感不能只靠积累，因为所有的积累都有被清零的一天', '化权型':'一次主动放手的经历——守了太久，累了，也终于明白「握紧」从来不等于「拥有」', '化科型':'破天荒地做了一件「不稳妥」的选择，结果比任何精心规划都好，那打碎了他关于「控制」的全部信仰', '化忌型':'内心的匮乏感第一次被人清晰地说出来，那种被看穿的颤栗，是他开始自我审视的起点' },
    '太阴': { '化禄型':'第一次拒绝了一个需要帮助的人，内心的内疚让他意识到，「温柔」如果不设边界，早晚会流干', '化权型':'用柔软的方式操控了一段关系的结局，在目的达到的瞬间感到了深深的厌倦，那是她第一次不认识自己', '化科型':'某个精心藏好的情绪在最不该的时候决堤了，把所有人都吓到了，也把自己吓到了', '化忌型':'一段让她无法释怀的感情，反复回旋不是因为爱，而是因为还没理解那段关系对自己意味着什么' },
    '贪狼': { '化禄型':'第一次长时间地专注在一件事上，发现深度带来的满足感是广度永远替代不了的', '化权型':'一次因为贪多嚼不烂导致全盘崩溃的经历，让他意识到「把握住一样」比「什么都想要」更有力量', '化科型':'那个「最出彩的版本」在一个他根本不在乎的人面前失效了，让他第一次怀疑自己究竟在为谁表演', '化忌型':'某个欲望得到了，却发现空洞感比之前更深了——那是他第一次正视，自己真正缺少的是什么' },
    '巨门': { '化禄型':'说了一句真话，却因为时机和方式让所有人都受伤了——第一次明白，真相和伤害之间只差一个「怎么说」', '化权型':'被人用他的逻辑击败，那种被自己擅长的武器反将一军的滋味，让他第一次正视自己的盲点', '化科型':'一次沉默——他选择了不说，结果比任何发言都改变了更多，那才是他真正理解「语言力量」的时刻', '化忌型':'沉默憋出来的话在最不该爆发的地方爆发了，那场失控之后的沉寂，让他开始真正思考表达与执念的关系' },
    '天相': { '化禄型':'长期当所有人的稳定器之后，第一次真正垮掉，那一刻他发现，他是所有人的依靠，却从来没有人是他的', '化权型':'一次主动站队的经历——终于表明了立场，结果比夹在中间更痛，却也更像自己了', '化科型':'在一个需要他强硬的时刻，他做到了——那次之后，他对自己的了解彻底改写', '化忌型':'压了太久的情绪在某一刻倾泻而出，所有人都惊讶，他自己更惊讶——才知道体面下面藏了多少' },
    '天梁': { '化禄型':'长期保护别人的他第一次需要被保护，接受这份脆弱比他想象的难得多也珍贵得多', '化权型':'试图拯救一个不想被拯救的人——那次失败让他第一次理解，有些人的成长必须由自己完成', '化科型':'被比自己资历浅的人指出了一个真实的盲点，傲慢在那一刻松动了，那是他开始真正学习的起点', '化忌型':'某个他坚持了多年的信念第一次被真实撼动，那种动摇不是崩塌，而是一扇通往更深处的门' },
    '七杀': { '化禄型':'第一次在不打任何仗的情况下赢了——用的是耐心，那感觉比任何一次冲锋都陌生，也更让他震动', '化权型':'孤军奋战的他第一次真正需要别人，那种开口求助的艰难，改变了他对「强大」的全部定义', '化科型':'在一场需要感受力的较量里输掉了，才发现刀光剑影解决不了所有问题', '化忌型':'某场仗打赢了，但赢的方式让他无法对镜自视，那是他第一次为「怎么赢」而不是「赢没赢」感到羞耻' },
    '破军': { '化禄型':'第一次选择守住了什么，没有打破，没有离开，那种罕见的坚持比任何一次出走都更彻底地改变了他', '化权型':'发现了自己打破的东西里，有一样是他其实不该破坏的——那种无法弥补的后悔，是他成长的代价', '化科型':'某次「我只是与众不同」的自我解释在一面真实的镜子面前失效，他不得不正视打破背后的真实动机', '化忌型':'破坏殆尽之后，发现废墟里有一样东西他没能毁掉，那东西就是他自己——那是他第一次看清自己的本质' }
};

// ── Turning Points: English Version (14 stars × 4 sihua types = 56 entries) ──
var STAR_SIHUA_TURNING_EN = {
    '紫微': { '化禄型':'The person he relied on most turned away in his moment of need—only then did he realize that loyalty won through status is no loyalty at all.', '化权型':'A complete stripping of power—all authority vanished overnight, forcing him to confront that "control" was merely an illusion.', '化科型':'Publicly challenged before everyone, the humiliation came not from failure, but from the instant collapse of his carefully crafted image.', '化忌型':'The target of his obsession vanished just as it came within reach—in that moment, he understood that obsession itself was the heaviest chain.' },
    '天机': { '化禄型':'For the first time, the strategist encountered someone completely unreadable—all his logic failed before this person.', '化权型':'A plan he designed succeeded, but hurt someone who shouldn\'t have paid the price—his first doubt about his own scheming.', '化科型':'A genuine emotion missed because of "rational analysis"—he realized some things cannot be calculated.', '化忌型':'The answer he pursued for so long was found, only to discover the question itself was wrong—that emptiness was worse than never finding it.' },
    '太阳': { '化禄型':'Discovering his light and generosity were exploited, not with coldness, but with the first realization that sincerity too needs boundaries.', '化权型':'Standing up for justice led to crushing defeat—he first understood that being "right" doesn\'t mean "winning."', '化科型':'In his moment of greatest need to be seen, silence surrounded him—that loneliness hurt more than criticism.', '化忌型':'The fire in his heart was truly extinguished for the first time—discovering that after anger burns out, only exhaustion remains.' },
    '武曲': { '化禄型':'For the first time, effort brought results, yet his heart felt no more grounded—that hollowness forced him to look deeper.', '化权型':'A refusal to compromise brought victory, but also complete isolation—that was the true price he had to learn.', '化科型':'Making an emotional decision at the most practical moment, discovering it was right—shattering his entire worldview.', '化忌型':'What he desperately held onto was ultimately lost—the pain of "I gave so much yet still couldn\'t protect it" was a total collapse before rebirth.' },
    '天同': { '化禄型':'Years of going with the flow made him miss something truly important—first realizing that "not caring" has a cost.', '化权型':'Hurt by "for your own good" from someone he trusted most—he learned that no matter how gentle, boundaries must be self-guarded.', '化科型':'For the first time, he voiced his true needs without pleasing or retreating, and was accepted—that changed everything he knew about "expression."', '化忌型':'A relationship ended not from conflict, but from too many unspoken words piling into distance—that silent loss was the heaviest.' },
    '廉贞': { '化禄型':'For the first time in a relationship, no performance needed—truly seen, the feeling of being maskless was both liberating and terrifying.', '化权型':'Truly losing control in love for the first time, that powerlessness made him furious—and made him first examine the fear behind "control."', '化科型':'A carefully maintained image collapsed at an unexpected moment—only then discovering what he truly cared about was never others\' judgment.', '化忌型':'The moment an obsession burned to ash—not from letting go, but from burning completely—that ashen feeling forced him to finally face himself.' },
    '天府': { '化禄型':'Something accumulated for years was lost overnight—realizing security can\'t rely on accumulation, because all accumulation can be zeroed.', '化权型':'An experience of actively letting go—guarded too long, tired, finally understanding "holding tight" never equals "owning."', '化科型':'Unprecedentedly made an "unstable" choice, with better results than any careful planning—shattering his entire faith in "control."', '化忌型':'Inner scarcity was clearly named by someone for the first time—that trembling of being seen through was his starting point for self-examination.' },
    '太阴': { '化禄型':'Refusing someone in need for the first time, the guilt made her realize—if "gentleness" has no boundaries, it will eventually drain dry.', '化权型':'Softly manipulating a relationship\'s end, the moment of success brought deep weariness—she didn\'t recognize herself for the first time.', '化科型':'A carefully hidden emotion burst at the worst possible moment, frightening everyone—including herself.', '化忌型':'A relationship she couldn\'t let go of, cycling not from love, but from not yet understanding what it meant to her.' },
    '贪狼': { '化禄型':'Focusing deeply on one thing for the first time, discovering the fulfillment from depth can never be replaced by breadth.', '化权型':'A collapse from taking on too much—realizing "holding onto one thing" has more power than "wanting everything."', '化科型':'The "most brilliant version" failed before someone he didn\'t care about—first doubting who he was really performing for.', '化忌型':'A desire was obtained, yet the emptiness ran deeper than before—first facing what he truly lacked.' },
    '巨门': { '化禄型':'Speaking one truth, but the timing and manner wounded everyone—first understanding that between truth and harm lies only "how to say it."', '化权型':'Defeated by his own logic, the taste of being outmaneuvered by his own weapon forced him to first confront his blind spots.', '化科型':'Choosing silence—the result changed more than any speech could. That was when he truly understood the power of language.', '化忌型':'Words held too long in silence exploded in the worst possible place—the stillness after that loss of control made him truly reflect on expression and obsession.' },
    '天相': { '化禄型':'After being everyone\'s stabilizer for so long, he finally broke down—discovering he was everyone\'s support, yet no one was his.', '化权型':'Finally taking a side—the pain of declaring a position was worse than being caught in the middle, yet he was more himself.', '化科型':'In a moment requiring strength, he delivered—after that, his self-understanding was completely rewritten.', '化忌型':'Emotions held too long poured out in one moment, surprising everyone—especially himself. Only then did he know how much was hidden beneath composure.' },
    '天梁': { '化禄型':'The one who always protected others first needed protection—accepting this vulnerability was far harder and more precious than he imagined.', '化权型':'Trying to save someone who didn\'t want saving—that failure taught him some people\'s growth must be completed by themselves.', '化科型':'A real blind spot pointed out by someone less experienced—his arrogance loosened in that moment, the true starting point of learning.', '化忌型':'A belief held for years was truly shaken for the first time—that trembling wasn\'t collapse, but a door to something deeper.' },
    '七杀': { '化禄型':'Winning without fighting for the first time—using patience, the feeling was stranger and more profound than any charge.', '化权型':'Fighting alone, finally needing others—the difficulty of asking for help redefined everything he knew about "strength."', '化科型':'Losing a contest requiring emotional intelligence—only then discovering that swordplay can\'t solve every problem.', '化忌型':'A battle won, but the way he won made him unable to face the mirror—first feeling shame for "how" rather than "whether" he won.' },
    '破军': { '化禄型':'Choosing to hold on for once, not breaking, not leaving—that rare persistence changed him more thoroughly than any departure.', '化权型':'Discovering among the things he destroyed, one shouldn\'t have been destroyed—that irreparable regret was the price of his growth.', '化科型':'The "I\'m just different" self-explanation failed before a real mirror—forcing him to face the true motives behind destruction.', '化忌型':'After destroying everything, finding one thing in the ruins he couldn\'t demolish—himself. That was when he first saw his own essence.' }
};

// ── 剧作功能：主星×四化（56种，告别4格局4种）──
var STAR_SIHUA_DRAMATIC = {
    '紫微': { '化禄型':'天生的磁场中心，让所有人不由自主地围绕他运转，是剧情里「秩序的来源」', '化权型':'权力意志最强烈的角色，制造「谁来主导」的核心张力，是剧中真正的棋手', '化科型':'维护某种体面和秩序的存在，他的崩溃往往是整个结构瓦解的信号', '化忌型':'执念是他的标签，他的固执推动剧情，他的转变是整个故事的情感高峰' },
    '天机': { '化禄型':'幕后真正的操盘手，信息不对称是他的武器，真相在他手里分批释放', '化权型':'把谋略用到了主导人心的地步，是最危险的「智识型控制者」', '化科型':'理性的观察者，见证者，记录者，用洞察力照亮所有人的盲区', '化忌型':'被自己的算计所困，越想控制越失控，是悲剧机制的完美载体' },
    '太阳': { '化禄型':'情感的发动机，用热情带动整个故事世界的温度，照亮其他角色的路', '化权型':'正义与权力的化身，推动集体行动，但他的冲劲也可能成为破坏力', '化科型':'公众的良心，代表某种价值观与道德准则，他的信念是剧情的精神脊梁', '化忌型':'燃烧的理想主义者，他的愤怒是推进剧情最有张力的动力' },
    '武曲': { '化禄型':'务实的行动者，用结果说话，是故事里「事情真正是怎么发生的」的解释者', '化权型':'铁腕执行者，推进剧情的物理力量，他的出现意味着局势将被强行改变', '化科型':'冷静的财富管理者，为故事提供资源与底气，是现实逻辑的锚定者', '化忌型':'偏执的求胜者，用不肯输的执念拉着所有人一起承担代价' },
    '天同': { '化禄型':'故事的缓冲带，有他在的地方节奏慢下来，是高密度剧情里最需要的喘息空间', '化权型':'温柔却有边界的守护者，他的「不」比任何人的拒绝都更让人意外', '化科型':'情感的润滑剂，用贴心和照顾编织人物关系，他的离开才让人发现他有多重要', '化忌型':'压抑的情感爆发点，他的崩溃是整部作品最具冲击力的情节之一' },
    '廉贞': { '化禄型':'欲望与魅力的化身，为剧情带来不可预测的人性张力与危险气息', '化权型':'用情感控制权力的操盘手，情欲和野心在他身上同时燃烧', '化科型':'把复杂藏进精致里的谜题，观众一直在猜他的真实意图', '化忌型':'最深情也最危险的执念型角色，爱与毁灭都是他的驱动力' },
    '天府': { '化禄型':'故事世界的稳定基石，为所有角色提供依托，是「安全感」的具象化', '化权型':'守成中的权力博弈者，捍卫既得利益，是变革派最难绕开的阻碍', '化科型':'有规有矩的价值体系守护者，他的原则是剧情道德冲突的标尺', '化忌型':'内心匮乏的囤积者，对失去的恐惧才是他所有行为的真实驱动' },
    '太阴': { '化禄型':'情感世界的调色板，用细腻感染整个故事基调，是剧情温度的来源', '化权型':'柔中带刚的情感战略家，以最温柔的方式达成最深远的目的', '化科型':'把一切藏进美丽里的情感哑谜，她的内心是全剧最难解开的谜', '化忌型':'情感执念最深重的角色，她的痛苦是全剧最打动人的悲剧底色' },
    '贪狼': { '化禄型':'故事里最有趣的人，用多面性和魅力让所有人想靠近，也无法捉摸', '化权型':'用欲望推动剧情的原动力，他想要得越多，故事就走得越远', '化科型':'最善于管理形象的角色，在表演与真实之间制造最有张力的内心戏', '化忌型':'被某个执念彻底绑架的欲望化身，他追的东西最终追走了他自己' },
    '巨门': { '化禄型':'真相的揭示者，用口才点破所有人不愿面对的东西，推动关键剧情转折', '化权型':'话语权争夺战的核心，他说的和没说的都在改变局势', '化科型':'信息的掌握者和分配者，在沉默与发言之间精确控制叙事节奏', '化忌型':'被沉默积压的语言最终以最具破坏力的方式爆发，改变所有人的处境' },
    '天相': { '化禄型':'故事里「公正」的化身，为失衡的世界提供心理重量，是道德秩序的守护者', '化权型':'在夹缝里寻找立场的角色，他什么时候表明态度，就是什么时候决定剧情走向', '化科型':'幕后权力的印章，谁得到他的支持谁就得到合法性，他的选择比他的行动更关键', '化忌型':'长期压抑的正义终于开口，那一刻是整个故事最震撼人心的爆发' },
    '天梁': { '化禄型':'故事里的精神父母，用格局和清醒保护年轻一代，是集体的精神底色', '化权型':'用「我来保护你」建立话语权的角色，他的救援往往是双刃剑', '化科型':'道德高地的坚守者，在所有人妥协时他还站在原地，是叙事的良心', '化忌型':'内心愤世嫉俗却仍未彻底放弃的理想主义者，他的矛盾是全剧最真实的人性写照' },
    '七杀': { '化禄型':'故事里最有战斗力的开路者，用行动破除一个又一个「不可能」', '化权型':'绝对意志的化身，他的独立与不妥协让剧情无法滑向平庸', '化科型':'冷静的战略执行者，用精确的行动推进故事的关键节点', '化忌型':'孤独与强大并存的悲剧英雄，他打赢了所有仗，却无法打赢内心的那场' },
    '破军': { '化禄型':'剧情的天然发动机，有他在就有变化，是故事推进最不需要借口的原动力', '化权型':'最彻底的打破者，他的出现意味着现有秩序将被颠覆，是革命的代名词', '化科型':'用个性化方式诠释「破坏是为了创造」的角色，让所有的混乱都指向意义', '化忌型':'无法停止自我毁灭的角色，他破坏一切包括自己，是全剧最深刻的悲剧源头' }
};

// ── 对手风格：主星×格局（更细腻的差异化）──
var STAR_RIVAL_STYLE = {
    '紫微':  { '杀破狼':'用尊严对抗暴力，让对手发现权威比武力更难撼动', '紫府廉武相':'用权谋对抗权谋，棋局之上棋局，看谁走得更远', '机月同梁':'用地位碾压迂回，让谋略无处可使', '巨日':'用格局俯视公论，让情绪性的对手显得渺小' },
    '天机':  { '杀破狼':'让冲动者冲进自己设好的局里，以静制动', '紫府廉武相':'用信息不对称瓦解权力体系，后发制人', '机月同梁':'以谋略点穿温和后的算计，两个聪明人相遇是最有张力的博弈', '巨日':'在对方最意气风发时布下后手，用耐心等待时机' },
    '太阳':  { '杀破狼':'正面刚，用热情和正义感感召旁观者转变立场', '紫府廉武相':'用公开的方式揭穿私下的权谋，阳谋对阴谋', '机月同梁':'用直接打破迂回，让绕弯子的对手暴露真实意图', '巨日':'两个太阳对抗，比的是谁的信念更有感召力' },
    '武曲':  { '杀破狼':'用实际结果硬碰硬，谁的行动力更强谁赢', '紫府廉武相':'用经济实力瓦解权力基础，断粮是最彻底的战略', '机月同梁':'让讲情面的对手意识到，「情」在利益面前最不可靠', '巨日':'用沉默和结果打脸所有的豪言壮语' },
    '天同':  { '杀破狼':'用柔克刚，让攻击者无处发力，像打棉花', '紫府廉武相':'用「我不参与」的姿态让权谋者找不到把柄', '机月同梁':'两个温和者的博弈最终是谁先耗尽对方的耐心', '巨日':'用包容消解对方的激情，让他的火焰慢慢熄灭' },
    '廉贞':  { '杀破狼':'用情感杠杆撬动对手，让暴力者发现自己有软肋', '紫府廉武相':'在对方的权谋体系里植入情感变量，让理性失效', '机月同梁':'用魅力打破对方的算计，让感性成为最强的武器', '巨日':'用复杂对抗简单，让正义感在人性面前显得幼稚' },
    '天府':  { '杀破狼':'用稳固的根基让冲击者消耗在坚硬的壁垒上', '紫府廉武相':'用资源积累形成的护城河让对手无法接近核心', '机月同梁':'用守成者的耐心耗尽变动者的热情', '巨日':'用体制力量中和公论，让声音大的人发现改变结构比说话难得多' },
    '太阴':  { '杀破狼':'用情感渗透让硬汉发现自己的铠甲里有裂缝', '紫府廉武相':'在权力结构的情感层面布局，让对手措手不及', '机月同梁':'两个情感型角色的博弈，谁对谁的内心更了解谁更有优势', '巨日':'用细腻消解豪情，让慷慨陈词的对手发现自己被击中了' },
    '贪狼':  { '杀破狼':'用多变对抗冲劲，让对手永远不知道下一步在哪里', '紫府廉武相':'在权谋之外开辟情感战场，让严肃的对手失去节奏', '机月同梁':'用欲望引诱算计者露出贪婪，然后在他最不防备时出手', '巨日':'用娱乐感化解对方的正义感，把严肃的竞争变成一场他不擅长的游戏' },
    '巨门':  { '杀破狼':'用语言精准刺破对手最坚硬的那层，让他无言以对', '紫府廉武相':'用信息战揭穿权力游戏背后的真相，让所有人看清棋局', '机月同梁':'用真相打破温情脉脉，让一直绕弯子的人不得不正面回答', '巨日':'两个善于表达的人相遇，比的是谁的话更接近真相' },
    '天相':  { '杀破狼':'用「我保持中立」的姿态让冲动者找不到攻击借口', '紫府廉武相':'在权力博弈中掌握话语权的合法性，谁得到我的背书谁有正统', '机月同梁':'用公正感消解迂回，让算计者感到良心压力', '巨日':'用制度力量中和情绪，让激烈的对手在规则面前冷静下来' },
    '天梁':  { '杀破狼':'用道德压制暴力，让对手发现用力攻击一个「好人」的代价', '紫府廉武相':'用历史和格局让权谋者意识到，眼前的算计在时间面前都是徒劳', '机月同梁':'两个清醒者之间的博弈，是两种不同的「看透」在较量深度', '巨日':'用智慧托底情怀，让激情型的对手意识到自己还差很多火候' },
    '七杀':  { '杀破狼':'以最直接的战力对决，绝无花招，就是谁更能扛', '紫府廉武相':'用不按规则出牌打乱权谋者的节奏，让精密的布局失效', '机月同梁':'用绝对的行动力碾压迂回，让走弯路的对手来不及反应', '巨日':'用沉默和强度打破对方的发言权，让喊得最响的人意识到行动才是真的' },
    '破军':  { '杀破狼':'最激烈的同类对决——谁打破谁，谁就占据主动', '紫府廉武相':'用打破体制的方式让守护者慌乱，让最稳固的结构出现裂缝', '机月同梁':'用彻底的变动逼出保守者的极限反应，让对手暴露出平时藏起来的部分', '巨日':'用无可救药的行动感打破语言权，让说得好的对手哑口无言' }
};

// ── 对手风格英文版：主星×格局（56种）──
var STAR_RIVAL_STYLE_EN = {
    '紫微':  { '杀破狼':'Counters violence with dignity, making opponents realize authority is harder to shake than force', '紫府廉武相':'Uses strategy against strategy, a game within a game — who goes further', '机月同梁':'Overwhelms circuitous tactics with status, leaving strategy nowhere to operate', '巨日':'Looks down on public opinion from high ground, making emotional opponents seem small' },
    '天机':  { '杀破狼':'Lets the impulsive walk into traps he\'s set, using stillness to control motion', '紫府廉武相':'Dismantles power systems with information asymmetry, striking after', '机月同梁':'Uses strategy to pierce the calculation behind gentleness — two smart people meeting is the most tense game', '巨日':'Lays backup plans when opponent is most triumphant, waiting with patience' },
    '太阳':  { '杀破狼':'Confronts directly, using passion and righteousness to shift bystanders\' allegiance', '紫府廉武相':'Exposes private plots through public means — open strategy against conspiracy', '机月同梁':'Breaks circuitousness with directness, forcing the indirect opponent to reveal true intentions', '巨日':'Two suns clash — whose conviction has more power to inspire' },
    '武曲':  { '杀破狼':'Clashes directly with practical results — whoever has stronger action wins', '紫府廉武相':'Uses economic power to dismantle power foundations — cutting supply is the most thorough strategy', '机月同梁':'Makes sentiment-focused opponents realize "emotion" is least reliable before interest', '巨日':'Silences all bold claims with silence and results' },
    '天同':  { '杀破狼':'Uses softness to overcome hardness, leaving attackers nowhere to apply force — like hitting cotton', '紫府廉武相':'Takes a "I don\'t participate" stance, giving plotters nothing to grab', '机月同梁':'Two gentle people\'s game — whoever exhausts the other\'s patience first', '巨日':'Dissolves opponent\'s passion with acceptance, letting their flame slowly die' },
    '廉贞':  { '杀破狼':'Uses emotional leverage to move opponents, making the violent discover their own weakness', '紫府廉武相':'Implants emotional variables into the opponent\'s power system, making rationality fail', '机月同梁':'Breaks opponent\'s calculation with charm, making emotion the strongest weapon', '巨日':'Uses complexity against simplicity, making righteousness seem naive before human nature' },
    '天府':  { '杀破狼':'Lets attackers exhaust themselves on solid fortifications', '紫府廉武相':'Uses moats formed by resource accumulation to keep opponents from the core', '机月同梁':'Uses the patience of the established to exhaust the passion of changers', '巨日':'Neutralizes public opinion with institutional power, making the loud realize changing structure is harder than speaking' },
    '太阴':  { '杀破狼':'Uses emotional infiltration to let the tough discover cracks in their armor', '紫府廉武相':'Lays plans at the emotional level of power structures, catching opponents off guard', '机月同梁':'Two emotional types\' game — whoever understands the other\'s heart better has the advantage', '巨日':'Uses subtlety to dissolve grand passion, letting the eloquent opponent realize they\'ve been struck' },
    '贪狼':  { '杀破狼':'Uses variability against impulse, keeping opponents never knowing the next move', '紫府廉武相':'Opens emotional battlefield outside power games, throwing serious opponents off rhythm', '机月同梁':'Uses desire to tempt the calculating into showing greed, then strikes when least expected', '巨日':'Uses entertainment sense to dissolve opponent\'s righteousness, turning serious competition into a game they don\'t excel at' },
    '巨门':  { '杀破狼':'Uses language to precisely pierce the opponent\'s hardest layer, leaving them speechless', '紫府廉武相':'Uses information warfare to expose the truth behind power games, letting everyone see the board', '机月同梁':'Uses truth to break through gentle pretense, forcing the indirect to answer directly', '巨日':'Two eloquent people meet — whose words are closer to truth' },
    '天相':  { '杀破狼':'Uses "I remain neutral" stance, giving the impulsive no excuse to attack', '紫府廉武相':'Holds legitimacy of discourse power in power games — whoever gets my endorsement has authority', '机月同梁':'Uses sense of fairness to dissolve evasion, putting conscience pressure on calculators', '巨日':'Uses institutional power to neutralize emotion, calming intense opponents with rules' },
    '天梁':  { '杀破狼':'Uses morality to suppress violence, letting opponents discover the cost of attacking a "good person"', '紫府廉武相':'Uses history and perspective to let plotters realize present calculations are futile before time', '机月同梁':'Two clear-minded people\'s game — two different "insights" competing in depth', '巨日':'Uses wisdom to ground passion, letting intense opponents realize they still lack maturity' },
    '七杀':  { '杀破狼':'Most direct combat strength showdown — no tricks, whoever endures more wins', '紫府廉武相':'Disrupts plotters\' rhythm by not playing by rules, making precise layouts fail', '机月同梁':'Overwhelms circuitousness with absolute action, leaving indirect opponents no time to react', '巨日':'Breaks opponent\'s discourse power with silence and intensity, making the loudest realize action is what\'s real' },
    '破军':  { '杀破狼':'Most intense same-type clash — whoever breaks whom holds the initiative', '紫府廉武相':'Uses system-breaking to panic guardians, creating cracks in the most solid structures', '机月同梁':'Uses thorough change to force conservatives\' extreme reactions, exposing what they usually hide', '巨日':'Uses irredeemable action sense to break language power, silencing eloquent opponents' }
};

// ==================== 宫位星曜辅助查询 ====================

/**
 * 从chart对象中取得指定宫位（以命宫为0的偏移量）的14主星列表
 * 偏移对应：0=命宫,1=兄弟宫,2=夫妻宫,3=子女宫,4=财帛宫,5=疾厄宫,
 *           6=迁移宫,7=交友宫,8=官禄宫,9=田宅宫,10=福德宫,11=父母宫
 */
function _getPalaceStars(chart, offset) {
    // 兼容两种来源：
    // 1. 直接是引擎fullChart（mingIdx在mingPalace.index）
    // 2. bridge包装后（mingIdx可能在_fullChart.mingPalace.index 或 chart.mingIdx）
    var src = chart;
    if (chart && chart._fullChart) src = chart._fullChart;
    var mingIdx = (src && src.mingPalace && src.mingPalace.index !== undefined)
        ? src.mingPalace.index
        : (chart && chart.mingIdx);
    if (!src || !src.mainStars || mingIdx === undefined) return [];
    var targetIdx = (mingIdx + offset + 12) % 12;
    return Object.entries(src.mainStars)
        .filter(function(e){ return e[1] === targetIdx; })
        .map(function(e){ return e[0]; });
}

/**
 * 判断某宫位是否有四化（化禄/权/科/忌）落入
 */
function _getPalaceSihua(chart, offset) {
    if (!chart || !chart.fourTrans || chart.mingIdx === undefined) return [];
    var targetIdx = (chart.mingIdx + offset + 12) % 12;
    return Object.entries(chart.fourTrans)
        .filter(function(e){ return e[1] && e[1].palaceIdx === targetIdx; })
        .map(function(e){ return e[0]; });
}

/**
 * 根据宫位星曜+四化，生成该宫的命盘注脚（嵌入叙事里，让读者感受到命盘是真实推理过的）
 */
function _palaceNote(stars, sihua, palaceName) {
    var hasJi   = sihua.indexOf('化忌') >= 0;
    var hasLu   = sihua.indexOf('化禄') >= 0;
    var hasQuan = sihua.indexOf('化权') >= 0;
    var hasKe   = sihua.indexOf('化科') >= 0;
    // 各主星对该宫位的能量解读
    var starMeaning = {
        田宅宫: {
            '紫微':'田宅宫紫微——祖业厚实，家门有贵气，物质根基稳固',
            '天机':'田宅宫天机——家庭格局变动频繁，居所随缘聚散',
            '太阳':'田宅宫太阳——家宅开阔明亮，但阳光过盛反而缺少私密庇护',
            '武曲':'田宅宫武曲——田产可自力积累，靠手腕和实干置业',
            '天同':'田宅宫天同——家宅安逸平和，祖业薄但生活舒适',
            '廉贞':'田宅宫廉贞——家宅风波暗藏，情欲或权争渗入家庭空间',
            '天府':'田宅宫天府——祖业厚实，田产丰饶，守成有力',
            '太阴':'田宅宫太阴——家宅阴柔细腻，财富偏向积累而非显赫',
            '贪狼':'田宅宫贪狼——家宅聚散无常，得而复失是常态',
            '巨门':'田宅宫巨门——家宅多口舌是非，田产难聚',
            '天相':'田宅宫天相——家宅有规矩有秩序，田产可维持',
            '天梁':'田宅宫天梁——祖业有庇荫色彩，但负重也随之而来',
            '七杀':'田宅宫七杀——家宅冲突激烈，田产易破不易守',
            '破军':'田宅宫破军——祖业破败后重建，居所动荡是命中注定的起点'
        },
        父母宫: {
            '紫微':'父母宫紫微——父母有地位或权威，亲子间有尊重也有距离',
            '天机':'父母宫天机——父母聪慧灵动，但缘分聚散，早年分离可能性高',
            '太阳':'父母宫太阳——父亲形象强大，被看见与被认可的渴望从此而来',
            '武曲':'父母宫武曲——父母务实刚硬，情感表达少但行动有力',
            '天同':'父母宫天同——亲子关系温和，但父母对孩子缺乏足够的引导力',
            '廉贞':'父母宫廉贞——亲子关系中有情感的纠缠与张力',
            '天府':'父母宫天府——父母厚重稳健，家庭给予了基本的安全感',
            '太阴':'父母宫太阴——母亲影响更深，情感细腻复杂',
            '贪狼':'父母宫贪狼——亲子关系充满变化，父母可能各有自己的世界',
            '巨门':'父母宫巨门——亲子沟通多摩擦，话说不到一处去',
            '天相':'父母宫天相——父母有原则，亲子关系讲规矩',
            '天梁':'父母宫天梁——父母有庇护力，但也带来压力和责任感的传递',
            '七杀':'父母宫七杀——亲子冲突明显，父母关系里有强势或对立',
            '破军':'父母宫破军——父母关系激烈动荡，家庭结构有重大变故'
        },
        兄弟宫: {
            '紫微':'兄弟宫紫微——手足中有强势或出众之人，关系有尊卑感',
            '天机':'兄弟宫天机——手足聪慧各异，关系灵动但不稳定',
            '太阳':'兄弟宫太阳——手足光明，但竞争意识强',
            '武曲':'兄弟宫武曲——手足务实，彼此间有实际帮扶但情感表达少',
            '天同':'兄弟宫天同——手足关系平和温暖，不争不抢',
            '廉贞':'兄弟宫廉贞——手足间有暗藏的竞争或情感复杂性',
            '天府':'兄弟宫天府——手足稳重，关系可靠可依赖',
            '太阴':'兄弟宫太阴——手足关系细腻，情感连接深但也敏感',
            '贪狼':'兄弟宫贪狼——手足各有魅力和欲望，关系聚散难定',
            '巨门':'兄弟宫巨门——手足间口舌是非多，误会易生',
            '天相':'兄弟宫天相——手足关系有规矩，可互相扶持',
            '天梁':'兄弟宫天梁——有长兄（姐）如父（母）的色彩，手足间责任感重',
            '七杀':'兄弟宫七杀——手足竞争激烈，关系中有对抗能量',
            '破军':'兄弟宫破军——手足缘分薄，关系破裂或分散是常态'
        },
        官禄宫: {
            '紫微':'官禄宫紫微——天生适合站在权力或管理位置，事业有贵气撑腰',
            '天机':'官禄宫天机——适合谋略性工作，幕后推动比台前主导更顺',
            '太阳':'官禄宫太阳——事业开阔，适合公众性强的领域，但容易过度消耗',
            '武曲':'官禄宫武曲——事业靠实力和行动积累，金融财务类领域有利',
            '天同':'官禄宫天同——不追求高位，但可在稳定服务性岗位上持续发展',
            '廉贞':'官禄宫廉贞——事业需要人际魅力推动，权力与欲望在职场中纠缠',
            '天府':'官禄宫天府——稳定守成的事业格局，守业能力强于开创',
            '太阴':'官禄宫太阴——事业有细腻和内敛的特质，财务或幕后性质更适合',
            '贪狼':'官禄宫贪狼——事业多元，欲望驱动，但容易因贪多嚼不烂而失焦',
            '巨门':'官禄宫巨门——靠口才和信息力推动事业，传播、咨询、谈判类有利',
            '天相':'官禄宫天相——适合辅佐性职位，在规则和权威之间找到自己的功能',
            '天梁':'官禄宫天梁——适合教育、医疗、法律等有庇护与责任感的职业',
            '七杀':'官禄宫七杀——事业冲劲强，适合独当一面，但路途多风波',
            '破军':'官禄宫破军——事业路上必有一次或多次大破大立，转行改行是常态'
        },
        迁移宫: {
            '紫微':'迁移宫紫微——在外有贵人，出行得助，异地发展有格局',
            '天机':'迁移宫天机——在外机遇多变，走得越远机会越多',
            '太阳':'迁移宫太阳——外出光芒四射，社会形象明亮，适合闯荡',
            '武曲':'迁移宫武曲——在外靠实力立足，白手起家的能量强',
            '天同':'迁移宫天同——在外随遇而安，人际关系和谐',
            '廉贞':'迁移宫廉贞——在外易有情感或人际纠纷',
            '天府':'迁移宫天府——在外稳健，能在异地建立稳固根基',
            '太阴':'迁移宫太阴——在外低调，适合在幕后或间接方式发展',
            '贪狼':'迁移宫贪狼——在外人缘好，机会与诱惑并存',
            '巨门':'迁移宫巨门——在外口舌是非多，需防言语惹祸',
            '天相':'迁移宫天相——在外有人脉支撑，能借他人之力发展',
            '天梁':'迁移宫天梁——在外有贵人庇护，但也承担他人的包袱',
            '七杀':'迁移宫七杀——在外冲劲十足，适合挑战型环境',
            '破军':'迁移宫破军——在外波折多，但逢破必立，流动是宿命'
        }
    };
    var notes = [];
    var palaceStarMap = starMeaning[palaceName] || {};
    stars.forEach(function(s){
        if(palaceStarMap[s]) notes.push(palaceStarMap[s]);
    });
    // 四化补充
    if (hasJi)   notes.push('化忌飞入' + palaceName + '，此宫暗藏压力，缘分或资源有阻碍');
    if (hasLu)   notes.push('化禄照耀' + palaceName + '，此宫顺畅丰厚，缘分或资源较足');
    if (hasQuan) notes.push('化权入' + palaceName + '，此宫有强势掌控的能量在运转');
    if (hasKe)   notes.push('化科入' + palaceName + '，此宫有名声或文化层面的加持');
    // 空宫（无主星无四化）
    if (notes.length === 0) notes.push(palaceName + '星曜稀疏，此宫缘分平淡，不厚不薄，随缘而定');
    return notes.join('。');
}

// ==================== 叙事化辅助函数（所有用户输入字段→真实融入小传）====================

/**
 * 家庭背景叙事化（接入田宅宫星曜）
 * family: wealthy(富裕) / middle(中等) / poor(贫困) / decline(没落)
 * 田宅宫 = 命宫偏移+9
 */
function _narrateFamily(family, era, mainStar, chart) {
    var eraLabel = {ancient:'古代',modern:'近代',contemporary:'现代'}[era] || '现代';
    // ── 田宅宫（偏移+9）星曜推理 ──
    var tianzhaiStars  = _getPalaceStars(chart, 9);
    var tianzhaiSihua  = _getPalaceSihua(chart, 9);
    var palaceNote     = _palaceNote(tianzhaiStars, tianzhaiSihua, '田宅宫');
    var starTone = {
        '紫微':'这份家世成为他日后对「尊贵与秩序」执念的起点',
        '天机':'这样的家境催生了他以智谋换取优势的生存本能',
        '太阳':'这段出身让他的理想主义有了最初的土壤',
        '武曲':'家境铸就了他对金钱和实际成果的本能敏感',
        '天同':'这样的家庭氛围，是他随遇而安性格的最初温床',
        '廉贞':'原生家庭是他情感复杂性的第一个练习场',
        '天府':'家境对他的积累意识和安全感需求有直接的塑造',
        '太阴':'成长环境里的情感质地，几乎决定了他一生的审美底色',
        '贪狼':'家庭带给他对「更多」的最初渴望',
        '巨门':'原生家庭里的信息与言语模式，塑造了他的沟通本能',
        '天相':'家庭赋予他对公正与秩序最早的感知',
        '天梁':'出身奠定了他护人与被护的命运底色',
        '七杀':'家庭是他第一个需要证明自己的战场',
        '破军':'家庭是他日后打破一切的第一个参照系'
    };
    var tone = starTone[mainStar] || '这段家世在他身上留下了深刻的印记';
    var map = {
        wealthy: eraLabel === '古代'   ? '出身钟鸣鼎食之家，幼时锦衣玉食，对「理所当然的优越」有根深蒂固的认知。' + tone + '。'
                : eraLabel === '近代'   ? '家族曾是一方富贾，幼年的优渥生活在乱世中成了最脆弱的泡沫，那种「拥有—失去」的记忆伴随一生。' + tone + '。'
                : '成长于物质条件充裕的中产偏上家庭，从未真正体验过匮乏，但也因此对「真实的失去」缺乏免疫力。' + tone + '。',
        middle: eraLabel === '古代'   ? '出身耕读之家，不富不贫，家里的规矩比财富更值钱——那种「自力更生的体面」在他血液里流动至今。' + tone + '。'
                : eraLabel === '近代'   ? '普通市民家庭出身，乱世中父母竭力维持着一份平淡的安稳。那种「用普通对抗动荡」的姿态，深刻影响了他的价值取向。' + tone + '。'
                : '中等收入家庭，不愁温饱但也从未宽裕，父母的辛劳是他最早看到的「生活本质」。' + tone + '。',
        poor:   eraLabel === '古代'   ? '幼时家境贫寒，吃过苦、受过冷眼，但也因此磨出了一副对权贵虚伪有本能洞察的眼睛。' + tone + '。'
                : eraLabel === '近代'   ? '贫困家庭出身，童年记忆里充满了物质的拮据与尊严的维护之间的张力——那种「穷但不能丢脸」的价值观刻入骨髓。' + tone + '。'
                : '经济拮据的家庭环境，让他很早就明白「钱」和「稳定」不是理所当然的。匮乏感作为底色，影响了他对安全感的终生追求。' + tone + '。',
        decline: eraLabel === '古代'  ? '家族曾显赫一时，如今门庭日落。他既有大户人家的见识与骄傲，又背负着「重振门楣」的无形枷锁。' + tone + '。'
                : eraLabel === '近代'   ? '没落世家出身——爷爷辈的荣耀变成了父亲的包袱，再变成他的起点。那种「我们曾经不同」的自我认知，是驱动力，也是阻碍。' + tone + '。'
                : '家道中落的背景给了他一种独特的处境：既有精英家庭的文化底色，又有平民奋斗者的实际处境。那种「上不上下不下」的撕裂感，塑造了他的复杂性。' + tone + '。'
    };
    var baseText = map[family] || '';
    var _enSkip = typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en';
    return _enSkip ? baseText : (baseText + '\n\n*命盘印证：' + palaceNote + '。*');
}

/**
 * 社会阶层叙事化（接入官禄宫星曜）
 * social（即socialClass）: upper / middle / lower
 * 官禄宫偏移+8
 */
function _narrateSocialClass(socialClass, profession, mainStar, chart) {
    var profLabel = {political:'政界',business:'商界',cultural:'文教界',military:'军警系统',technical:'技术领域',other:'各行各业'}[profession] || '所在领域';
    var guanluStars = _getPalaceStars(chart, 8);
    var guanluSihua = _getPalaceSihua(chart, 8);
    var guanluNote  = _palaceNote(guanluStars, guanluSihua, '官禄宫');
    var map = {
        upper:  '在' + profLabel + '中处于上层地位，习惯了被仰视和被服务的视角——这带来了眼界，也带来了对「低处」的某种隔阂。他的社会资本是真实存在的资产，也是一道把他与大多数人隔开的玻璃。',
        middle: '在' + profLabel + '中属于中坚阶层，不是权力核心也不是边缘人，这个位置让他既能看到规则是怎么运转的，又保留着被规则影响的真实感受。一种实用主义的清醒，是他的生存哲学。',
        lower:  '在' + profLabel + '中处于弱势位置，对「不被看见」有切肤的体会——但这也给了他一个旁观者的视角，看得到系统的裂缝，也发展出了底层人特有的韧性与变通。'
    };
    var baseText = map[socialClass] || '';
    var _enSkip2 = typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en';
    return _enSkip2 ? baseText : (baseText + '\n\n*命盘印证：' + guanluNote + '。*');
}

/**
 * 父母关系叙事化（接入父母宫星曜）
 * parents: harmonious / strained / broken / loss
 * 父母宫偏移+11
 */
function _narrateParents(parents, mainStar, chart) {
    var fumumStars = _getPalaceStars(chart, 11);
    var fumumSihua = _getPalaceSihua(chart, 11);
    var fumumNote  = _palaceNote(fumumStars, fumumSihua, '父母宫');
    var starNeed = {
        '紫微':'对权威的认同与超越',   '天机':'信任感的建立与怀疑',
        '太阳':'被看见与被认可的渴望', '武曲':'独立与依靠的张力',
        '天同':'安全感的构建底层',     '廉贞':'情感模式的最初蓝图',
        '天府':'秩序感与积累意识的来源','太阴':'情感表达方式的原始模板',
        '贪狼':'被关注与被喜爱的渴望', '巨门':'表达与沉默的第一个战场',
        '天相':'公正感的最初校准',     '天梁':'责任与照顾的原始设定',
        '七杀':'证明自我价值的第一动机','破军':'打破与重建冲动的最初根源'
    };
    var need = starNeed[mainStar] || '内心深处的安全感底层';
    var map = {
        harmonious: '父母关系和睦，家庭氛围温暖而稳定。这份底色给了他面对世界的基本安全感——但也可能让他对「现实的粗糙」准备不足。' + need + '，在一个没有大裂缝的原生家庭里得到了相对完整的浇灌。',
        strained:   '父母关系长期紧张，家里的气氛像一根绷紧的弦。他从小就是家庭情绪的感应器，练就了察言观色的本能。' + need + '，在这种环境里遭遇了最早的挑战，也因此发展出了别人没有的某种敏感或防御。',
        broken:     '父母关系破裂（离婚或长期分离），他在「不完整」的家庭结构里学会了自我安慰和独立支撑。' + need + '，在缺少稳定参照的成长环境里，被迫发展出了一套自己的逻辑。',
        loss:       '早年失去了父母一方或双方（离世/长期缺席），那种「本该在而不在」的空洞，成了他内心最深处的底色。' + need + '，在缺失中被强行成熟，这份沉甸甸的经历让他比同龄人更早见过某些真相。'
    };
    var baseText = map[parents] || '';
    var _enSkip3 = typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en';
    return _enSkip3 ? baseText : (baseText + '\n\n*命盘印证：' + fumumNote + '。*');
}

/**
 * 兄弟关系叙事化（接入兄弟宫星曜）
 * siblings: close / conflict / support / alone
 * 兄弟宫偏移+1
 */
function _narrateSiblings(siblings, mainStar, chart) {
    var xiongdiStars = _getPalaceStars(chart, 1);
    var xiongdiSihua = _getPalaceSihua(chart, 1);
    var xiongdiNote  = _palaceNote(xiongdiStars, xiongdiSihua, '兄弟宫');
    var map = {
        close:    '与兄弟姐妹关系亲密，手足之间的羁绊在他的情感地图里占据重要位置。这份横向的情感纽带，给了他一种「我有人」的底气，也是他面对世界时最真实的后盾。',
        conflict: '与兄弟姐妹之间存在长期的竞争或矛盾，那种「在最亲近的地方被对立」的体验，塑造了他对关系中权力与依赖的独特敏感。比起陌生人，他更懂得如何与「熟悉的威胁」周旋。',
        support:  '虽与兄弟姐妹不算亲密，但在关键时刻彼此支撑。这种「不说话但你还在」的手足情谊，给了他一种不依赖频繁互动的安全感，也影响了他在深层关系里的相处模式。',
        alone:    '独生子女或实际上的独立成长，从小没有横向的手足参照——他既享受了独子的专注与资源，也在无人可比较的孤独里，过早地把自己当成了一个完整的单位。'
    };
    var baseText = map[siblings] || '';
    var _enSkip4 = typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en';
    return _enSkip4 ? baseText : (baseText + '\n\n*命盘印证：' + xiongdiNote + '。*');
}

/**
 * 职业×时代 叙事化（接入官禄宫星曜）
 */
function _narrateProfession(profession, era, mainStar, chart) {
    var eraLabel = {ancient:'古代',modern:'近代',contemporary:'现代'}[era] || '现代';
    var profMap = {
        political: {
            ancient:     '身处权力体制内，每一步都是在博弈与制衡的棋盘上落子。仕途即命途，升迁与被弃之间的距离不过一场政治风向的转向。',
            modern:      '乱世中的政治参与从来不只是理想，更是生死抉择。站在什么位置、支持什么力量，影响的不只是前途，更是身家性命。',
            contemporary:'在官僚体系中浮沉，需要在规则与现实之间找到生存缝隙。体制内的逻辑有时与他内心的逻辑平行，从不相交。'
        },
        business: {
            ancient:     '商贾身份在这个时代意味着有钱却无势——财富在手，但在文人士大夫面前仍矮了一截。他的野心不止于此。',
            modern:      '乱世中的商业需要的不只是眼光，更是在各方势力之间保持平衡的手腕。他的财富是用胆识和妥协换来的。',
            contemporary:'市场经济的逻辑清晰而冷酷：没有什么「理所当然」，今天的成功是明天继续博弈的资本。他在这个游戏里找到了自己的节奏。'
        },
        cultural: {
            ancient:     '文人的笔是剑，也是最脆弱的盾。在这个以文取仕的时代，思想的传播与压制始终并行。他用文字构建了一个外人很难进入的内心世界。',
            modern:      '在思想激荡的年代，文化人既是启蒙者，也是最先被时代消耗的那批人。他手中的笔承载着比个人命运更重的东西。',
            contemporary:'在内容变成流量的时代，坚持表达的「意义」本身就是一种选择。他在娱乐化浪潮里寻找自己真正想说的话。'
        },
        military: {
            ancient:     '手握刀剑的人，在这个时代是最靠近权力核心的那批人，也是最先暴露在死亡面前的人。荣耀与危险从来是连体的。',
            modern:      '战场上活下来的人，对「活着」的理解都不同于普通人。他见过的东西，不是所有人都有资格见。那些经历的重量，在他身上看得出来。',
            contemporary:'在和平年代，军警的存在感以另一种方式呈现——不是枪炮，而是纪律、服从与那种刻进骨髓的责任感。他的处事方式带着一种普通人没有的确定性。'
        },
        technical: {
            ancient:     '工匠、医者或术数之人，在等级森严的社会里处于特殊的位置——有用，但不贵。他的价值被需要，他的地位却不被认可。这种错位，成了他观察世界的独特视角。',
            modern:      '技术在乱世中的价值是实用的，不是精神的。他的一技之长在某些时候救了命，在某些时候却是被利用的理由。',
            contemporary:'在这个知识变现的时代，技术人掌握着真正重要的事情如何运转的秘密。但「懂」和「被尊重」并不总是同一回事，这是他需要接受的现实。'
        },
        other: {
            ancient:     '在社会的缝隙中寻找自己的位置，不入主流，但也因此拥有了主流人看不到的视角。',
            modern:      '乱世中身份模糊的人反而有时能活得更灵活，不被任何一方完全定义，也不被任何一方完全信任。',
            contemporary:'游走在各种身份之间，他对「你是做什么的」这个问题始终有一点说不清楚的抗拒——因为他知道，一个标签框不住他真正的面貌。'
        }
    };
    var p = profMap[profession] || profMap.other;
    var baseText = p[era] || p.contemporary || '';
    // ── 官禄宫（偏移+8）星曜推理注入 ──
    var guanluStars = _getPalaceStars(chart, 8);
    var guanluSihua = _getPalaceSihua(chart, 8);
    if (guanluStars.length > 0 || guanluSihua.length > 0) {
        var guanluNote = _palaceNote(guanluStars, guanluSihua, '官禄宫');
        var _enSkipProf = typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en';
        return _enSkipProf ? baseText : (baseText + '\n\n*命盘印证：' + guanluNote + '。*');
    }
    return baseText;
}

/**
 * 年龄段×时代×格局 叙事化（不只贴标签，而是描述人生处境）
 */
function _narrateAge(age, era, patternType, genderCN) {
    var pronoun = genderCN === '女' ? '她' : '他';
    var eraLabel = {ancient:'古代',modern:'近代',contemporary:'现代'}[era] || '现代';
    // ── 英文年龄段×时代叙事 ──────────────────────────────────────
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') {
        var pronounEN = (genderCN === '女') ? 'she' : 'he';
        var herHisEN = (genderCN === '女') ? 'her' : 'his';
        var ageMapEN = {
            youth: {
                ancient:     'Young and full of fire. In an era when talent and audacity could still carve a path, youth is both capital and a reason for elders to underestimate. Success or failure often turns on a few years of key choices.',
                modern:      'Coming of age in a time of upheaval — the curriculum isn\'t textbooks, it\'s history in real time. ' + (pronounEN.charAt(0).toUpperCase()+pronounEN.slice(1)) + ' carries unmuted enthusiasm for the world, and a heavier weight than this age should bear.',
                contemporary:'In the twenties and thirties, facing a world of real opportunity and deep uncertainty. The ceiling of credentials and class has become tangible. The task: finding an answer between "what I want" and "what\'s within reach."'
            },
            middle: {
                ancient:     'Middle-aged — which in this era means forged. ' + (pronounEN.charAt(0).toUpperCase()+pronounEN.slice(1)) + ' knows the rules of power, has capacity for human complexity. The drive of youth has settled into something harder to contend with.',
                modern:      'Midlife after living through the most turbulent part of this era. Has seen more than ' + pronounEN + ' says; what\'s been lost defines ' + herHisEN + ' identity more than what\'s been kept. At this age, every choice carries irreversible weight.',
                contemporary:'Thirty to fifty — the hardest phase to balance: career, family, ageing parents, self. Each one real weight. No longer believes in having it all; hasn\'t given up on finding a sustainable path through.'
            },
            senior: {
                ancient:     'Age in this era means authority. Every word carries the gravity of time; what ' + pronounEN + ' sees ahead is where others haven\'t arrived yet — that\'s power, and a particular kind of solitude.',
                modern:      'Having lived through most of a turbulent century, ' + herHisEN + ' life is itself a piece of history. Those who survived are each a book no one else can finish reading.',
                contemporary:'Past fifty, ' + pronounEN + ' begins to know more clearly what truly matters — at the cost of knowing more clearly that some things can no longer be reached. That co-existence of maturity and regret is the truest tone of this stage.'
            }
        };
        var agEN = ageMapEN[age] || ageMapEN.youth;
        return agEN[era] || agEN.contemporary || '';
    }
    // ── 中文词典 ──────────────────────────────────────────────────
    var ageMap = {
        youth: {
            ancient:     pronoun + '正当年少，血气方刚。在一个凭才华和胆气尚能搏出一条路的年代，' + pronoun + '的年轻既是资本，也是容易被长辈看轻的理由。成与败，往往就在这几年的关键选择里。',
            modern:      '青年时代与乱世撞上——这一代人的成长课程不是课本，是时局。' + pronoun + '对这个世界有未被磨损的热情，也承担着比这个年纪本该承担更多的重量。',
            contemporary:pronoun + '正值二十到三十岁的当口，面对的是一个充满机会也充满不确定的时代。学历与阶层的天花板开始变得真实，' + pronoun + '需要在「想要什么」和「能得到什么」之间找到自己的答案。'
        },
        middle: {
            ancient:     '人到中年，在这个时代已是经过千锤百炼的人。' + pronoun + '对权力的游戏规则了然于心，对人性的复杂也有足够的容量——年少的冲劲已经沉淀成某种更难对付的东西。',
            modern:      '中年经历了这个时代最激荡的部分。' + pronoun + '见过的比说出口的多，失去的比拥有的更能定义' + pronoun + '是谁。在这个年纪，每一个选择都带着不可逆的重量。',
            contemporary:'三十到五十岁，是这个时代最难平衡的阶段：事业、家庭、父母、自我，每一项都是实实在在的重量。' + pronoun + '不再相信「两全其美」，但还没放弃在各种压力中找到一条自己的路。'
        },
        senior: {
            ancient:     '年岁已长，在这个时代意味着资历即权威。' + pronoun + '的每一句话都带着时间给的分量，' + pronoun + '看到的结局是别人还没走到的地方——这是力量，也是寂寞。',
            modern:      '经历了这个动荡世纪的大半，' + pronoun + '的人生本身就是一部历史。那些活下来的人，每一个都是一本别人读不完的书。',
            contemporary:'五十岁往上，' + pronoun + '开始更清楚地知道什么是真正重要的——代价是也更清楚地知道有些事情再也来不及了。那种成熟与遗憾并存的底色，是' + pronoun + '这个年纪最真实的东西。'
        }
    };
    var ag = ageMap[age] || ageMap.youth;
    return ag[era] || ag.contemporary || '';
}

/**
 * ══════════════════════════════════════════════════════════════════
 *  多元词库融合增强层  v2.0
 *
 *  资料来源（按学术诚信原则逐一标注）：
 *  [A] 《写作词库 基础版·12号词库：人物描写（520页）》
 *      提炼词目+词义，不复制例句，转化为叙事描述
 *  [B] 《人物设定创意宝库：积极特质词汇速查》安杰拉·阿克曼/贝卡·普利西
 *      引用框架：特质定义 → 相关行为 → 积极面/消极面 → 人物弧线触发点
 *  [C] 《人物设定创意宝库：消极特质词汇速查》安杰拉·阿克曼/贝卡·普利西
 *      引用框架：缺陷成因 → 行为态度 → 积极面（缺陷的工具性） → 弧线疗愈路径
 *  [D] Dramatica: A New Theory of Story / Melanie Anne Phillips & Chris Huntley
 *      引用概念：Grand Argument Story人物四维度（动机/方法论/评估/目的）
 *      → 应用于：quote（人物声音/内在逻辑）+ trigger（戏剧性转折触发条件）
 *  [E] 语言学语用学体系（话语分析 / 言语行为理论 / 合作原则）
 *      — Austin/Searle言语行为理论：陈述/指令/承诺/表达/宣告五类言语行为
 *      — Grice合作原则（质量/数量/关联/方式准则）
 *      → 应用于：speechAct（角色话语行为特征描述）
 *  [F] Maslow需求层次理论（需求驱动角色行为）
 *      → 应用于：coreNeed（角色深层需求）
 *  ══════════════════════════════════════════════════════════════════
 *  字段说明：
 *  term       — [A]词库核心词汇
 *  desc       — [A]词义一句话转化
 *  contrast   — [A]对比张力
 *  flaw       — [A][C]显性弱点
 *  positive   — [B]积极面（这个特质能为角色带来什么力量）
 *  shadow     — [B][C]阴影面（积极特质被推向极端时的变形）
 *  coreNeed   — [F]马斯洛需求层次：这个特质在满足/回避什么需求
 *  speechAct  — [E]语用学视角：这种人的话语行为模式
 *  trigger    — [D]Dramatica转折触发：什么情境会激活人物弧线
 *  quote      — [D]角色内在声音（典型独白方向）
 *  conflict   — [B][C]与哪类特质的人产生最强烈摩擦
 * ══════════════════════════════════════════════════════════════════
 */
var _VOC = {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ── 说话方式 ── [A]对话章节 + [E]言语行为理论 + [D]人物声音
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    speech: {
        '简洁有力': {
            term: '惜字如金',                                                   // [A]
            desc: '言语凝练如刀削，一句话里没有废字',
            contrast: '旁人犹在铺垫，他已说到核心',
            flaw: '偶尔显得失温，对方以为他不在乎',
            positive: '高效传递信息，不浪费对方时间；危机时刻第一个说出关键字',  // [B]
            shadow: '走向极端时变为冷漠、封闭，让人觉得被拒之门外',              // [B][C]
            coreNeed: '尊重与被尊重——用言语效率证明自己的价值密度',             // [F]
            speechAct: '偏好"陈述式"言语行为，极少使用冗余修饰，违反Grice数量准则的多余信息',  // [E]
            trigger: '被迫解释自己的沉默，或在需要情感连接的时刻不得不「多说几句」', // [D]
            quote: '「话说多了，意思就稀了。」',                                  // [D]
            conflict: '热情洋溢/啰唆的/需要言语确认感的人'                        // [B][C]
        },
        '温和委婉': {
            term: '低声细语',
            desc: '说话时声如春风，让人不设防',
            contrast: '从不当面顶撞，却总能把意思送达',
            flaw: '对方有时猜不准他是真心还是客套',
            positive: '天然的冲突化解者，在紧张场合给人安全感',                  // [B]
            shadow: '走向极端时成为讨好型人格，真实意图被层层包裹',              // [C]
            coreNeed: '爱与归属——用温和维系关系的和谐，回避对抗带来的疏离',      // [F]
            speechAct: '大量使用间接言语行为（Indirect Speech Acts）：用问句表达请求，用陈述表达批评', // [E]
            trigger: '被迫在「说实话」和「维护关系」之间做选择',                  // [D]
            quote: '「直接说太伤人了——我只是换了个说法而已。」',
            conflict: '简洁有力/直率真诚/喜欢对话中获得即时反馈的人'
        },
        '热情洋溢': {
            term: '侃侃而谈',
            desc: '话匣子一开，整个空间都活了',
            contrast: '感染力真实，热情是能量场，不是表演',
            flaw: '说得太满，留给对方的呼吸空间不够',
            positive: '激励他人，活跃气氛；最容易让陌生人感到被欢迎',           // [B]
            shadow: '极端时成为「滔滔不绝」，对话变成独白，忽略了对方的回应',    // [C]
            coreNeed: '自我实现——通过表达与连接验证自己的存在价值',              // [F]
            speechAct: '高频使用"表达式"言语行为，倾向于分享感受而非交换信息',  // [E]
            trigger: '遇到真正沉默型的人，发现对方并不需要自己的热情',           // [D]
            quote: '「人生苦短，不开心的话就少说几句嘛！」',
            conflict: '沉默寡言/内敛含蓄/需要安静思考的人'
        },
        '沉稳冷静': {
            term: '不动声色',
            desc: '话语里滤掉了情绪，只剩事实',
            contrast: '越是高压，他越平静——这种平静本身就有震慑力',
            flaw: '别人有时不确定他是稳还是麻木',
            positive: '高压场合的镇定剂，能用中立语气说出最难开口的话',         // [B]
            shadow: '极端时演变成「冷漠的/不理性」，情感回应缺失，关系冻结',    // [C]
            coreNeed: '安全感——情绪稳定是他维护内心秩序的方式',                 // [F]
            speechAct: '严格遵循Grice质量准则，只说确定的事，大量使用陈述式言语行为', // [E]
            trigger: '遭遇无法用冷静化解的情感失控——对方哭了，或对他发怒',       // [D]
            quote: '「感情归感情，事情归事情。」',
            conflict: '感性冲动/热情洋溢/需要情感回应来确认关系的人'
        },
        '幽默风趣': {
            term: '妙语连珠',
            desc: '开口总有转折，让人意外又觉得对',
            contrast: '笑话背后藏着刀，但刀出来前你已经笑了',
            flaw: '有人感激这种轻盈，有人怀疑这是一种防御和回避',
            positive: '化解紧张，拉近距离；最高级的幽默里藏着真实的洞察力',     // [B]
            shadow: '走向极端时成为「调情的/轻浮的」，用笑话挡掉所有严肃的话',   // [C]
            coreNeed: '尊重——用智识的机锋证明自己的聪明值得被欣赏',             // [F]
            speechAct: '违反合作原则「方式准则」的大师：用隐喻、讽刺、双关制造会话含义', // [E]
            trigger: '面对真正无法笑着处理的事：亲密关系的破裂，或他人的哀恸',   // [D]
            quote: '「笑着说，不代表不认真；认真的时候，我也可以让你笑。」',
            conflict: '沉默寡言/直率真诚/极度严肃认真的人'
        },
        '寡言少语': {
            term: '沉默寡言',
            desc: '一次对话里他说的不多，但每一句都有分量',
            contrast: '沉默不是冷漠，是他过滤了九成想法后留下来的那一成',
            flaw: '旁人常常误读他，他不解释，也不觉得有必要',
            positive: '说出来的话可信度高，沉默有时比语言更有说服力',           // [B]
            shadow: '极端时成为「孤僻的/回避的」，拒绝必要的沟通，关系因沉默而枯萎', // [C]
            coreNeed: '隐私与自主——言语是他给出的礼物，不是义务',               // [F]
            speechAct: '系统性违反Grice数量准则，大量信息省略，依赖对方的语境补全', // [E]
            trigger: '被迫进入「必须多说才能被理解」的情境',                     // [D]
            quote: '「有些事说了没用，不说反而更清楚。」',
            conflict: '热情洋溢/爱管闲事的/需要语言确认的人'
        }
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ── 行为习惯 ── [A]性格章节 + [B][C]积极/消极特质宝库 + [D]Dramatica方法论维度
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    behavior: {
        '雷厉风行': {
            term: '刚毅果决',
            desc: '决定了就走，脚步不带犹豫',
            contrast: '别人还在权衡，他已经走到第三步',
            flaw: '节奏太快，有时把同伴甩在了后面',
            positive: '高压场合的执行力引擎，行动力让事情发生',                  // [B]：积极特质"果断的"
            shadow: '极端时变为「鲁莽的/冲动的」，跳过了应有的权衡',             // [C]：消极特质"鲁莽的"
            coreNeed: '成就与掌控——行动是他确认自我价值和环境控制感的方式',      // [F]
            trigger: '必须等待、无法行动的处境，或他的决定造成了无法弥补的后果',  // [D]
            quote: '「想清楚了再动，不如边动边想。」',
            conflict: '深思熟虑/谨慎小心/凡事需要共识的人'
        },
        '深思熟虑': {
            term: '深谋远虑',
            desc: '行动前先把可能性在心里排列一遍',
            contrast: '外人以为他迟缓，其实是在等那个确定的信号',
            flaw: '偶尔把准备做成了拖延',
            positive: '战略性思维，极少犯可预见的错误',                          // [B]："谨慎的/讲究策略的"
            shadow: '极端时变为「犹豫不决的/固执己见的」',                        // [C]
            coreNeed: '安全与尊重——充分准备是他规避失败羞耻感的方式',            // [F]
            trigger: '必须在信息不足的情况下当机立断',                            // [D]
            quote: '「我需要把每一步想清楚，因为走错一步代价太大了。」',
            conflict: '雷厉风行/随性而为/不按套路出牌的人'
        },
        '随性而为': {
            term: '率性而为',
            desc: '感觉对了就动，不按剧本走',
            contrast: '他的路线从不可预测，但总能走出来',
            flaw: '事后复盘有时连他自己都说不清为什么那步那样走',
            positive: '直觉往往比分析快，能抓住稍纵即逝的机会',                  // [B]："爱冒险的/无拘无束的"
            shadow: '极端时变为「不负责任的/反复无常的」，让身边的人无法依靠',   // [C]
            coreNeed: '自由——不被计划绑架是他活力的源泉',                        // [F]
            trigger: '需要为别人负责、无法随心所欲的时刻到来',                    // [D]
            quote: '「计划赶不上变化——我情愿变化赶上我。」',
            conflict: '有条不紊/深思熟虑/需要稳定预期的人'
        },
        '谨慎小心': {
            term: '谨小慎微',
            desc: '每一步都确认过地面再落脚',
            contrast: '别人羡慕他少出错，却不知他为此花了多少精力',
            flaw: '该快出手时容易慢了半拍',
            positive: '极少犯可预见的错误，是团队中的风险管理者',                // [B]："谨慎的/警觉的"
            shadow: '极端时变为「懦弱的/戒备的/回避的」，把所有未知都当成威胁',   // [C]
            coreNeed: '安全感——小心是他给自己建立的防护网',                      // [F]
            trigger: '有人打破了他精心建立的安全边界，或他不得不冒险',            // [D]
            quote: '「宁可多想三遍，也不要少想那一遍。」',
            conflict: '雷厉风行/随性而为/把谨慎解读成懦弱的人'
        },
        '有条不紊': {
            term: '井井有条',
            desc: '外部再乱，他那边总是整齐的',
            contrast: '给他混乱，他还给你秩序',
            flaw: '遇到真正分类不了的情况，他会比旁人更难受',
            positive: '执行力的保障，系统化带来可重复的成功',                    // [B]："有条理的/一丝不苟的"
            shadow: '极端时变为「不知变通的/完美主义的」，用秩序控制世界，拒绝意外', // [C]
            coreNeed: '安全感与成就——秩序是他对抗混沌世界的武器',               // [F]
            trigger: '遭遇不可控的混乱，秩序系统彻底失效',                        // [D]
            quote: '「把东西放对地方，世界就不会乱。」',
            conflict: '自由散漫/随性而为/把条理解读成控制欲的人'
        },
        '自由散漫': {
            term: '无拘无束',
            desc: '不受规矩拘束，也不让规矩束缚旁人',
            contrast: '看起来没有计划，其实有一套旁人看不见的逻辑',
            flaw: '这套逻辑偶尔连他自己也找不到',
            positive: '创造力和灵感的来源，不被框架限制的思维',                  // [B]："爱玩的/率性而为的"
            shadow: '极端时变为「不负责任的/懒惰的」，自由成为逃避的借口',        // [C]
            coreNeed: '自由与身份认同——规则对他意味着个性的压制',               // [F]
            trigger: '必须为团队利益牺牲个人自由的时刻',                          // [D]
            quote: '「条条框框是为没想法的人准备的。」',
            conflict: '有条不紊/谨慎小心/需要可预期行为的人'
        }
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ── 情感表达 ── [A]心理章节 + [B][C]特质宝库 + [D]情感弧线
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    emotion: {
        '外露直白': {
            term: '喜形于色',
            desc: '脸是他最诚实的表达，装不住',
            contrast: '感受来了就走到脸上，直接而不虚伪',
            flaw: '被看穿的那一刻也会失去主动权',
            positive: '真实感是他最强的吸引力，旁人知道他是什么颜色',            // [B]："充满感激的/幸福的"
            shadow: '极端时变为「过于情绪化的/过于敏感的」，情绪感染变成情绪绑架', // [C]
            coreNeed: '被理解——真实表达是他验证被接受的方式',                   // [F]
            trigger: '发现表露情感带来了惩罚，或被利用',                          // [D]
            quote: '「我什么都写在脸上，藏不住——但我也不想藏。」',
            conflict: '内敛含蓄/理性克制/在公共场合需要克制情绪的人'
        },
        '内敛含蓄': {
            term: '深藏不露',
            desc: '情绪是沉在水底的，看不见但是有',
            contrast: '越是动情，越显得平静',
            flaw: '身边的人很难知道他是否真的受伤了',
            positive: '情感深度让关系一旦建立就异常牢固',                        // [B]："在乎隐私的/沉思的"
            shadow: '极端时变为「沉默寡言的/孤僻的」，情感彻底封锁，关系无法推进', // [C]
            coreNeed: '隐私与安全——只有确认安全才打开内心',                     // [F]
            trigger: '遭遇真正的情感冲击，无法再维持平静外表',                    // [D]
            quote: '「不是不感动——只是感动的时候不需要让你看见。」',
            conflict: '外露直白/感性冲动/需要对方明确情感信号的人'
        },
        '丰富多变': {
            term: '情感充沛',
            desc: '内心像一个频宽很大的频道，什么都能播',
            contrast: '悲喜来去速度都快，旁人跟不上也不奇怪',
            flaw: '有时深度让人不知所措',
            positive: '共情力极强，是天然的倾听者和故事创作者',                  // [B]："共情力强的/多愁善感的"
            shadow: '极端时变为「喜怒无常的/过于情绪化的」，身边人走钢丝般应对', // [C]
            coreNeed: '爱与归属——情感丰富是他与世界连接的方式',                 // [F]
            trigger: '第一次体验到情感带来的毁灭性后果',                          // [D]
            quote: '「我就是这样，感受到了就感受到了，关不掉的。」',
            conflict: '稳定平和/理性克制/需要情绪稳定的合作者'
        },
        '稳定平和': {
            term: '心如止水',
            desc: '外界的风吹不起什么浪',
            contrast: '别人失控的时刻，他是那个定海的人',
            flaw: '有时被误认为冷漠',
            positive: '高情绪强度环境里的稳定锚点',                              // [B]："镇静的/遵守纪律的"
            shadow: '极端时变为「冷漠的/漫不经心的」，对他人苦痛缺乏回应',        // [C]
            coreNeed: '安全与尊重——平静是他维护尊严和自主的铠甲',               // [F]
            trigger: '遭遇真正的情感失控事件——爱人的离去，或他自己的恐惧涌现',  // [D]
            quote: '「不是没感觉——是感觉来了，我不让它替我做主。」',
            conflict: '感性冲动/丰富多变/需要对方明显情感表达的人'
        },
        '理性克制': {
            term: '泰然自若',
            desc: '情绪出现了，先让理性到场，再决定要不要表达',
            contrast: '他管理情感的能力令人敬佩，直到某天管不住',
            flaw: '压制久了，迟早有一次汹涌的反弹',
            positive: '能在危机时做出最清醒的判断',                              // [B]："善于分析的/客观的"
            shadow: '极端时变为「冷漠的/回避的」，用理性逃避真正的情感责任',      // [C]
            coreNeed: '尊重与安全——理性是他证明自己有能力掌控生活的方式',        // [F]
            trigger: '遇到理性完全无法解决的情感问题，比如爱',                    // [D]
            quote: '「情绪是数据，不是命令。」',
            conflict: '感性冲动/外露直白/认为克制=压抑的人'
        },
        '感性冲动': {
            term: '情动于衷',
            desc: '感受绕过大脑，直接变成行动',
            contrast: '最真实的那一刻往往也是最冒险的那一刻',
            flaw: '事后要花很长时间处理那个决定的后果',
            positive: '真实感人，能在他人最需要时做出最即时的回应',              // [B]："激情的/充满爱意的"
            shadow: '极端时变为「冲动的/难以自控的」，情感决策覆盖了必要的判断', // [C]
            coreNeed: '爱与归属——全情投入是他给予和接受爱的方式',               // [F]
            trigger: '一次情绪驱动的决定带来了无法挽回的后果',                    // [D]
            quote: '「头脑说不行，心已经出发了。」',
            conflict: '理性克制/稳定平和/认为冲动不理智的人'
        }
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ── 社交风格 ── [A]性格章节 + [B][C]特质宝库互动属性 + [D]人际冲突维度
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    social: {
        '主动热情': {
            term: '亲和力十足',
            desc: '走进任何场合都能找到共同话题，让人觉得被看见',
            contrast: '这份热情是真实的，不是表演',
            flaw: '能量消耗快，独处是补给，不是逃避',
            positive: '社交场合的催化剂，激励他人开口，让陌生人感到被欢迎',     // [B]："好客的/外向的/热心助人的"
            shadow: '极端时变为「黏人的/干涉的」，边界感模糊，让内向者不舒服', // [C]
            coreNeed: '爱与归属——连接是他充电的方式，也是他确认自我价值的方式', // [F]
            trigger: '付出热情却遭到冷漠甚至拒绝，第一次质疑热情是否是负担',    // [D]
            quote: '「这个世界上没有陌生人，只有还没聊上的朋友。」',
            conflict: '被动等待/寡言少语/需要个人空间的内向者'
        },
        '被动等待': {
            term: '静水深流',
            desc: '不主动，但靠近了会是真实的',
            contrast: '等待是筛选，不是拒绝',
            flaw: '外人容易误读成冷漠或傲慢',
            positive: '关系一旦建立，深度和稳定性超过大多数人',                  // [B]："内向的/在乎隐私的"
            shadow: '极端时变为「孤僻的/反社会的」，拒绝所有主动连接',           // [C]
            coreNeed: '隐私与安全——主动意味着暴露脆弱，等待是保持主动权的方式', // [F]
            trigger: '遇到真正想靠近但主动不敢的人，或因等待错失了重要机会',     // [D]
            quote: '「来了我就在，不来我也是在的。」',
            conflict: '主动热情/爱管闲事的/把沉默解读成不感兴趣的人'
        },
        '理性交往': {
            term: '恰如其分',
            desc: '每段关系都有他给定的分寸，不多也不少',
            contrast: '不是算计，是效率——真正的连接令他振奋，消耗性的社交令他疲惫',
            flaw: '过于清醒有时让人觉得进不去',
            positive: '高质量关系的营造者，每段关系都有明确的价值',              // [B]："善于分析的/客观的"
            shadow: '极端时变为「冷漠的/算计的」，关系被功利化',                  // [C]
            coreNeed: '尊重——他的时间和精力都有成本，筛选是尊重自己的方式',     // [F]
            trigger: '遭遇真正无私付出却什么都不要求的人，理性框架第一次失效',   // [D]
            quote: '「我不是不愿意深交——我只是需要确认值不值得。」',
            conflict: '感性相交/主动热情/把理性当冷漠的人'
        },
        '感性相交': {
            term: '一见如故',
            desc: '靠的是感觉而不是分析，能不能处好第一面就知道了',
            contrast: '后来的相处都是在验证那个最初的感受',
            flaw: '第一感觉偶尔也会出错，但他不容易承认',
            positive: '建立关系迅速，直觉往往精准，能感受到他人真实的状态',     // [B]："共情力强的/充满爱意的"
            shadow: '极端时变为「轻信的/感情用事的」，直觉错了也认',             // [C]
            coreNeed: '爱与归属——感觉对了就是对了，他相信缘分',                 // [F]
            trigger: '信任的直觉第一次被背叛',                                   // [D]
            quote: '「有些人见面就认识，说不清楚为什么，就是认识。」',
            conflict: '理性交往/深思熟虑/需要时间建立信任的人'
        },
        '圆滑世故': {
            term: '八面玲珑',
            desc: '不同的场合换不同的面孔，这是他在社会规则里磨练出的生存技艺',
            contrast: '懂得呈现什么，不代表没有真实的那一面',
            flaw: '他自己有时也说不清哪个是最真实的自己',
            positive: '社会情商极高，能在复杂人际关系中游刃有余',                // [B]："老练世故的/有说服力的"
            shadow: '极端时变为「狡诈的/伪善的/善于操控的」',                    // [C]
            coreNeed: '安全与尊重——灵活适应是他在复杂世界中生存的智慧',         // [F]
            trigger: '遭遇一个真正不需要策略、只需要真实的人',                   // [D]
            quote: '「场合不同，呈现不同——这不叫虚伪，叫读懂场景。」',
            conflict: '直率真诚/天真无邪/把圆滑等同于不诚实的人'
        },
        '直率真诚': {
            term: '直言不讳',
            desc: '说什么是什么，不在人前人后用两套标准',
            contrast: '这让人觉得安全，偶尔也让他在复杂的场合付出代价',
            flaw: '他接受这个代价，因为他做不到两面',
            positive: '是关系中最可信赖的那个人，说出来的话不需要解码',          // [B]："诚实的/有道德的"
            shadow: '极端时变为「得罪人的/无礼的」，直接变成伤人的武器',          // [C]
            coreNeed: '身份认同——真实是他的道德底线，虚伪是他无法接受的代价',  // [F]
            trigger: '第一次说了真话，却让他最在乎的人受到了伤害',               // [D]
            quote: '「我宁愿说实话让你难受，也不愿说假话让你高兴。」',
            conflict: '圆滑世故/温和委婉/认为有些话就是不该说的人'
        }
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ── 应对危机 ── [A]性格章节 + [B][C]特质宝库 + [D]高压转折时刻
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    crisis: {
        '冷静分析': {
            term: '处乱不惊',
            desc: '别人慌的时候，他反而找到了节奏',
            contrast: '不是没有感受，而是感受不会比局势先到场',
            flaw: '这种冷静有时让旁人误以为他不在乎',
            positive: '危机时刻最珍贵的资产，帮助团队找到出路',                  // [B]："镇静的/善于分析的"
            shadow: '极端时变为「冷漠的/漫不经心的」，对情感危机缺乏回应',       // [C]
            coreNeed: '安全与掌控——冷静是他在混乱中保持自我的方式',             // [F]
            trigger: '遭遇情绪上的危机，理性处理失效',                           // [D]
            quote: '「慌有什么用，先把眼前的事做了再说。」',
            conflict: '慌乱无措/感性冲动/需要共情回应的人'
        },
        '果断行动': {
            term: '当机立断',
            desc: '危机面前没有犹豫的成本，他清楚这一点',
            contrast: '行动本身就是他最好的答案',
            flaw: '有时把「来不及想」当成了「不需要想」',
            positive: '执行力在混乱中确立秩序，是他人可以跟随的领导力',          // [B]："果断的/积极主动的"
            shadow: '极端时变为「鲁莽的/冲动的」，跳过了必要的评估',             // [C]
            coreNeed: '成就与掌控——行动是他对抗不确定性的武器',                 // [F]
            trigger: '一次果断行动造成了灾难性后果，他第一次质疑「行动即答案」', // [D]
            quote: '「我宁愿走错了再调整，也不愿站在原地等答案。」',
            conflict: '冷静分析/深思熟虑/认为行动前必须想清楚的人'
        },
        '寻求帮助': {
            term: '知己知彼',
            desc: '清楚自己的边界在哪里，不强撑',
            contrast: '开口求助需要比独自扛着更多的勇气',
            flaw: '难的是知道该找谁，而不是该不该找',
            positive: '自我认知清晰，懂得合理利用资源，团队合作中的润滑剂',      // [B]："协作的/热心助人的"
            shadow: '极端时变为「黏人的/向人诉苦乞怜的/依赖的」',               // [C]
            coreNeed: '爱与归属——求助是他信任和连接他人的方式',                 // [F]
            trigger: '求助后被拒绝，或因求助反而暴露了自己的弱点',               // [D]
            quote: '「一个人扛不是英雄主义，是不必要的消耗。」',
            conflict: '坚定抵抗/独立的/认为示弱等于失败的人'
        },
        '逃避回避': {
            term: '暂避锋芒',
            desc: '不是怯懦，是保存实力',
            contrast: '有时候暂时不在场是为了之后能真正在场',
            flaw: '这个模式习惯化了，就真的成了逃避',
            positive: '懂得战略性撤退，给自己充电再战',                          // [B]："谨慎的"的防御性应用
            shadow: '极端时变为「懦弱的/回避的/胆怯的」，问题从未被解决',         // [C]
            coreNeed: '安全感——远离危险源是他最原始的自我保护策略',              // [F]
            trigger: '逃避导致了更大的危机，无路可退',                            // [D]
            quote: '「留得青山在，不怕没柴烧。」',
            conflict: '坚定抵抗/果断行动/认为回避=懦弱的人'
        },
        '慌乱无措': {
            term: '六神无主',
            desc: '感觉脚下的地突然消失了，手脚都不知道该往哪放',
            contrast: '不是没能力，是那个时刻被压垮了',
            flaw: '他需要一个人或者一件确定的事把他拉回来',
            positive: '慌乱本身说明他在乎，真实的情绪反应往往比伪装的冷静更可信', // [B][C]缺陷的积极面
            shadow: '极端时变为「紧张的/自寻烦恼的」，焦虑传染给身边的人',       // [C]
            coreNeed: '安全感与爱——需要一个稳定的锚定点',                       // [F]
            trigger: '遭遇超过承受能力的压力后，终于崩溃，而崩溃带来了解脱',     // [D]
            quote: '「我真的不知道该怎么办了……你能帮我吗？」',
            conflict: '冷静分析/处乱不惊/对情绪失控零容忍的人'
        },
        '坚定抵抗': {
            term: '坚韧不屈',
            desc: '被压到越紧，越不后退',
            contrast: '极限状态才是他最真实的底色',
            flaw: '坚持和硬撑之间那条线，他有时候看不见',
            positive: '最强的逆境应对者，压力让他更聚焦而非崩溃',                // [B]："坚持不懈的/勇敢的"
            shadow: '极端时变为「固执的/不合作的/骄傲自大的」，拒绝一切帮助',   // [C]
            coreNeed: '尊重与成就——不屈服是他维护自我价值感的方式',             // [F]
            trigger: '第一次在众人面前倒下，发现倒下并不意味着失去尊严',         // [D]
            quote: '「再难也不是放弃的理由，我还没到极限。」',
            conflict: '逃避回避/寻求帮助/认为及时止损是智慧的人'
        }
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ── 学习适应 ── [A]性格章节 + [B]成就属性 + [D]认知弧线
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    learning: {
        '快速学习': {
            term: '触类旁通',
            desc: '接触新事物时能迅速找到核心脉络，先建框架再填内容',
            contrast: '同样的时间，他能摸到的地方比别人深一层',
            flaw: '广度有余，精度偶尔打折',
            positive: '跨领域连接能力强，新环境适应快',                          // [B]："好奇的/适应力强的/聪颖的"
            shadow: '极端时变为「浅尝辄止的」，广博但无一精通，难以深耕',         // [C]
            coreNeed: '自我实现——探索未知是他获得成就感的主要通道',              // [F]
            trigger: '遭遇真正需要深耕细作的事，快速框架失效',                   // [D]
            quote: '「先知道架构，细节以后补——整体先对，局部才有意义。」',
            conflict: '稳步积累/依赖经验/认为学什么都要钻透的人'
        },
        '稳步积累': {
            term: '厚积薄发',
            desc: '每一步都踩实了再走，地基比别人牢',
            contrast: '功底深的地方，他说的比任何人都有分量',
            flaw: '慢工出细活，在快节奏的场合有时跟不上',
            positive: '深度专家，经得起时间考验，最终超越了表面看起来更快的人',  // [B]："勤奋的/一丝不苟的/专注的"
            shadow: '极端时变为「固执的/不知变通的」，拒绝跳过熟悉的步骤',       // [C]
            coreNeed: '成就与安全——扎实的基础是他自信的来源，也是他对抗不确定性的方式', // [F]
            trigger: '遭遇需要临时跳过积累、即时应变的危机',                      // [D]
            quote: '「慢即是快——今天走稳了，后面少走弯路。」',
            conflict: '快速学习/善于应变/对细节不耐烦的人'
        },
        '依赖经验': {
            term: '老马识途',
            desc: '一次真实的经历顶得上十本书',
            contrast: '判断力是从案例里长出来的，不是理论给的',
            flaw: '没走过的路，他偶尔会比别人更没把握',
            positive: '实战智慧，面对真实问题时的判断力无可替代',                // [B]："睿智的/老练世故的"
            shadow: '极端时变为「迷信经验的/固执己见的」，过去的成功阻碍了新的可能', // [C]
            coreNeed: '安全与尊重——经验是他在陌生领域找到方向的地图',           // [F]
            trigger: '遭遇一个全新的问题，所有经验都不适用',                      // [D]
            quote: '「书上的是别人的路，走过了的才是自己的。」',
            conflict: '快速学习/理论导向的/认为经验会形成偏见的人'
        },
        '善于应变': {
            term: '随机应变',
            desc: '每一个新情境都激活一次快速的读取-调整-行动循环',
            contrast: '陌生环境让他更灵活，而不是更焦虑',
            flaw: '系统性不足，知识偶尔是碎片化的',
            positive: '复杂多变的环境中的生存专家',                              // [B]："适应力强的/足智多谋的"
            shadow: '极端时变为「反复无常的/古怪不可靠的」，让别人无法预期',     // [C]
            coreNeed: '自由与成就——每次成功适应都是对自己能力的证明',           // [F]
            trigger: '遭遇需要深度积累、无法靠应变解决的问题',                    // [D]
            quote: '「规则是死的，情况是活的——哪个管用用哪个。」',
            conflict: '稳步积累/有条不紊/需要稳定流程的人'
        },
        '固执己见': {
            term: '一意孤行',
            desc: '新信息首先要通过他内部的筛选才能被纳入',
            contrast: '这保护他不被轻易动摇，有时也屏蔽了真正有用的东西',
            flaw: '他的立场一旦确立，旁人很难改变',
            positive: '立场稳定，不随波逐流，有时坚持才是正确的',                // [B]："专注的/自洽的"的极端
            shadow: '极端时变为「不知变通的/对抗型的」，把固执当原则',            // [C]
            coreNeed: '尊重与身份认同——立场是他自我的延伸，修改=自我否定',       // [F]
            trigger: '最信任的人证明他的固执带来了伤害',                          // [D]
            quote: '「不是不听你的——是我想清楚了，这个才对。」',
            conflict: '灵活调整/善于应变/认为固执就是停止成长的人'
        },
        '灵活调整': {
            term: '从善如流',
            desc: '结论从来不是固定的，随着新信息不断修正',
            contrast: '这种开放性是真正的智识成熟',
            flaw: '需要一个稳定的核心，否则容易被各种理论带着跑',
            positive: '持续学习者，每次修正都是成长',                            // [B]："适应力强的/好学的"
            shadow: '极端时变为「意志薄弱的/优柔寡断的」，立场随风倒',           // [C]
            coreNeed: '自我实现——开放性让他始终在进化',                          // [F]
            trigger: '核心价值观被迫修正，而不只是策略调整',                      // [D]
            quote: '「我今天的想法和昨天不一样——因为我今天知道了更多。」',
            conflict: '固执己见/依赖经验/认为频繁改变立场是软弱的人'
        }
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ── 成长方向 ── [A]综合 + [B]成就/身份属性 + [D]人物弧线目标维度
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    growth: {
        '追求成功': {
            term: '志在必得',
            desc: '向上是他最自然的方向，不需要人鼓励',
            contrast: '真正让他成熟的那一刻，往往是他开始问「成功是为了什么」的时候',
            flaw: '成功的标准如果一直是别人设的，他的内耗就不会停',
            positive: '驱动力强大，是带动周围人的引擎',                          // [B]："雄心壮志的/干劲十足的"
            shadow: '极端时变为「工作狂的/炫耀的/贪婪的」，成功成为证明自我的毒药', // [C]
            coreNeed: '尊重与自我实现——成就是他向世界证明自己价值的语言',        // [F]
            trigger: '功成名就之后，第一次感到空洞，问「然后呢」',                // [D]
            quote: '「我不是为了赢——是因为站着不动太难受。」',
            conflict: '追求安稳/追求情感/认为成功执念是焦虑表现的人'
        },
        '追求自由': {
            term: '随心所欲',
            desc: '不是任性，而是一种不愿被框住的本能',
            contrast: '越是被限制，越能感受到他对自由的渴望有多真实',
            flaw: '在需要妥协的关系里，这份执念有时会成为裂缝',
            positive: '创造力和独立性来源，不被规范束缚的视角',                  // [B]："独立的/无拘无束的/率性而为的"
            shadow: '极端时变为「反叛的/不负责任的/自我放纵的」',                // [C]
            coreNeed: '自由与身份认同——自主是他核心价值观，失去自由等于失去自我', // [F]
            trigger: '发现自由与爱/责任无法同时拥有，必须选择',                   // [D]
            quote: '「我不是不愿意承担责任——我只是要以我自己的方式。」',
            conflict: '追求安稳/规规矩矩的/认为自由是不成熟的人'
        },
        '追求安稳': {
            term: '安土重迁',
            desc: '他需要的不是最高点，而是一个真正能扎根的地方',
            contrast: '「足够好」对他来说不是退而求其次，是真正的安心',
            flaw: '在别人看来是保守，在他看来是清醒',
            positive: '稳定的情感锚点，值得信赖的长期伙伴',                      // [B]："传统的/负责任的"
            shadow: '极端时变为「保守的/抗拒改变的」，让成长机会从指缝溜走',     // [C]
            coreNeed: '安全感——稳定是他对抗生命不确定性的答案',                 // [F]
            trigger: '原以为稳固的一切突然崩塌，不得不重新出发',                  // [D]
            quote: '「不是不愿意冒险——是我知道我要的是什么，不需要用冒险证明。」',
            conflict: '追求成功/追求自由/认为守成就是停滞的人'
        },
        '追求真理': {
            term: '追根溯源',
            desc: '对说不通的解释，他不会因为省事就接受',
            contrast: '他的世界观是经过反复质疑和验证才建立起来的，不容易被动摇',
            flaw: '有时候他对「真相」的执着比真相本身更让旁人难以跟上',
            positive: '洞察力深刻，是人群里最不容易被骗的那个',                  // [B]："洞察力强的/好奇的/充满哲思的"
            shadow: '极端时变为「固执己见的/狂热的」，把「自己的真理」变成不可挑战的圣旨', // [C]
            coreNeed: '尊重与自我实现——真理是他唯一愿意臣服的东西',             // [F]
            trigger: '发现了一个他无法反驳却不愿接受的真相',                      // [D]
            quote: '「我不需要你同意，但你得告诉我，哪里说得不对。」',
            conflict: '追求安稳/顺从的/认为探究本质太累太折腾的人'
        },
        '追求情感': {
            term: '情深义重',
            desc: '被真正理解，是他认为活着最重要的事之一',
            contrast: '爱与被爱对他来说不是锦上添花，是底色',
            flaw: '关系里的重量他全盘接受，包括那些令他受伤的部分',
            positive: '深度关系的创造者，是身边人最可靠的情感依托',              // [B]："充满爱意的/抚育他人的/善良的"
            shadow: '极端时变为「黏人的/占有欲强的/过于依赖的」',                // [C]
            coreNeed: '爱与归属——深度连接是他存在意义的核心',                   // [F]
            trigger: '深爱的人离开了，或他发现「被理解」其实是一种幻觉',          // [D]
            quote: '「我不害怕付出，我只怕付出了却没有人收到。」',
            conflict: '追求成功/理性交往/认为情感应该适度的人'
        },
        '追求平衡': {
            term: '举重若轻',
            desc: '在各种张力之间找重心，不靠妥协，靠整合',
            contrast: '逼他做选择的那些时刻，反而是他真正成熟的节点',
            flaw: '平衡的代价是他永远不能全力押注某一边',
            positive: '复杂处境下的整合者，看见多方视角',                        // [B]："客观的/明智的/考虑周到的"
            shadow: '极端时变为「优柔寡断的/讨好型的」，平衡成为回避选择的借口', // [C]
            coreNeed: '安全与尊重——和谐的整体是他追求的完美状态',               // [F]
            trigger: '被迫在两个都无法放弃的价值观之间做出唯一选择',              // [D]
            quote: '「不是站中间就是没立场——是我真的看见了两边都有的道理。」',
            conflict: '追求真理/志在必得/非黑即白思维方式的人'
        }
    }
};

/**
 * 词库词汇注入：为指定叙事属性取到精选词汇，用于丰富描述
 * @param {string} category - 属性类别（speech/behavior/emotion/social/crisis/learning/growth）
 * @param {string} val      - 属性值（如'简洁有力'）
 * @returns {object|null}   - 词库词汇对象 {term, desc, contrast, flaw}
 */
function _getVocEntry(category, val) {
    if (!_VOC[category] || !val) return null;
    return _VOC[category][val] || null;
}

/**
 * 8属性叙事化（不只是贴关键词，而是展开成角色行为模式描述）
 */
function _narrateSpeech(speech, mainStar, chart) {
    // ── 多语言属性值标准化：繁体/英文选项→简体中文key ──────────────
    speech = _normalizeAttrVal(speech);
    // ── 英文词典 ──────────────────────────────────────────────────
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') {
        var starQualityEN = {
            '紫微': 'Words carry natural authority — ',
            '天机': 'Every sentence is pre-calculated three times — ',
            '太阳': 'Speech radiates an open, contagious warmth — ',
            '武曲': 'No wasted words — ',
            '天同': 'Tone puts people at ease — ',
            '廉贞': 'Every line carries multiple layers — ',
            '天府': 'Measured and deliberate in expression — ',
            '太阴': 'Soft-spoken and careful — ',
            '贪狼': 'A natural magnetism in the voice — ',
            '巨门': 'Direct and precise — ',
            '天相': 'Calibrated to the occasion — ',
            '天梁': 'Unhurried, never rushed — ',
            '七杀': 'Economy of words — ',
            '破军': 'Speaks against the grain — '
        };
        var prefixEN = starQualityEN[mainStar] || '';
        var mapEN = {
            '简洁有力': prefixEN + 'says in three words what others need thirty. Verbosity signals muddled thinking. The briefer the better.',
            '温和委婉': prefixEN + 'never says "no" outright — always leaves the other person a way out. Sometimes that\'s genuine care; sometimes it\'s a way of avoiding confrontation.',
            '热情洋溢': prefixEN + 'speaks with full-body investment — eyes, pace, gesture all in. The enthusiasm is real, but it sometimes makes words land harder than intended.',
            '沉稳冷静': prefixEN + 'rarely lets emotion escape through words, even under pressure. The restraint can be genuine steadiness — or a way of keeping others from knowing when they\'re rattled.',
            '幽默风趣': prefixEN + 'handles a lot of serious things through humour. It\'s a gift, and a defence: when people are laughing, it\'s harder to find the real sore spot.',
            '寡言少语': prefixEN + 'opens their mouth only when there\'s something to say. Silence is a comfortable state, not an awkward one — though others often misread it.'
        };
        return mapEN[speech] || (prefixEN + (speech || 'Has a distinctive way of engaging with the world through language.'));
    }
    // ── 中文词典 ──────────────────────────────────────────────────
    var starQuality = {
        '紫微':'他的话天然带有一种不容质疑的重量，',
        '天机':'他说话之前已经在脑子里过了三遍，',
        '太阳':'他讲话时有一种开放式的感染力，',
        '武曲':'他不说废话，',
        '天同':'他的语气让人放松，',
        '廉贞':'他的每一句话都有多个层次，',
        '天府':'他措辞稳重，',
        '太阴':'他说话轻柔，',
        '贪狼':'他说话带着天然的吸引力，',
        '巨门':'他的语言直接而精准，',
        '天相':'他讲话有分寸，',
        '天梁':'他说话慢，',
        '七杀':'他言简意赅，',
        '破军':'他说话不按套路，'
    };
    var prefix = starQuality[mainStar] || '';
    var map = {
        '简洁有力': (function(){
            var v = _getVocEntry('speech','简洁有力');
            return prefix + (v
                ? v.term + '——' + v.desc + '。' + v.contrast + '。长篇大论在他那里是思维不清晰的表现，能三个字说清楚的，绝不说四个字。' + v.flaw + '。'
                : '习惯用最少的字表达最多的意思。长篇大论在他那里是思维不清晰的表现，能用三个字说清楚的事，他绝不说四个字。');
        })(),
        '温和委婉': (function(){
            var v = _getVocEntry('speech','温和委婉');
            return prefix + (v
                ? v.term + '——' + v.desc + '。从不直接说「不」，而是用一种让对方感觉还有余地的方式表达拒绝。' + v.contrast + '。' + v.flaw + '。'
                : '从不直接说「不」，而是用一种让对方感觉还有余地的方式表达拒绝。这种委婉背后，有时是体贴，有时是不想面对冲突的回避。');
        })(),
        '热情洋溢': (function(){
            var v = _getVocEntry('speech','热情洋溢');
            return prefix + (v
                ? v.term + '——' + v.desc + '。说话时眼神、语速、肢体语言一起上，整个人都是投入的。' + v.flaw + '。'
                : '说话时整个人都是投入的——眼神、语速、肢体语言一起上。这种热情是真实的，但也让他有时说出去的话比本意更用力。');
        })(),
        '沉稳冷静': (function(){
            var v = _getVocEntry('speech','沉稳冷静');
            return prefix + (v
                ? v.term + '——' + v.desc + '。即使情绪激动，嘴上也很少走漏风声。' + v.contrast + '。' + v.flaw + '。'
                : '即使在情绪激动的情况下，嘴上也很少走漏风声。这种克制有时是真正的稳定，有时是他不让别人知道他也会慌。');
        })(),
        '幽默风趣': (function(){
            var v = _getVocEntry('speech','幽默风趣');
            return prefix + (v
                ? v.term + '——' + v.desc + '。用幽默处理严肃的事，这既是天赋，也是防御：' + v.contrast + '。' + v.flaw + '。'
                : '用幽默处理很多严肃的事——这既是一种天赋，也是一种防御：让人发笑的时候，最难被戳到真正痛的地方。');
        })(),
        '寡言少语': (function(){
            var v = _getVocEntry('speech','寡言少语');
            return prefix + (v
                ? v.term + '——' + v.desc + '。开口都是因为有话要说。' + v.contrast + '。' + v.flaw + '。'
                : '开口的时候都是因为有话要说。沉默对他来说不是尴尬，而是一种舒适的状态。但这也容易让人误解他的真实想法。');
        })()
    };
    var base = map[speech] || (prefix + (speech || '话语是他与世界互动的主要介面之一，自有一套独特的表达逻辑'));
    // ── 命盘印证层：命宫（偏移+0）星曜+四化 ──
    var note = _chartSpeechNote(speech, chart, mainStar);
    return note ? (base + '\n\n' + note) : base;
}

/**
 * 语言方式←命宫：命宫主星与语言风格的印证/张力
 */
function _chartSpeechNote(speech, chart, mainStar) {
    if (!speech || !chart) return '';
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') return '';
    var mingStars  = _getPalaceStars(chart, 0);
    var mingSihua  = _getPalaceSihua(chart, 0);
    var hasJi      = mingSihua.indexOf('化忌') >= 0;
    var hasLu      = mingSihua.indexOf('化禄') >= 0;
    var hasQuan    = mingSihua.indexOf('化权') >= 0;
    var hasKe      = mingSihua.indexOf('化科') >= 0;

    // 星与选项"共鸣"判断
    var resonantPairs = {
        '简洁有力': ['武曲','七杀','破军'],
        '温和委婉': ['太阴','天同','天相'],
        '热情洋溢': ['太阳','贪狼','廉贞'],
        '沉稳冷静': ['天府','天梁','紫微'],
        '幽默风趣': ['贪狼','天机','破军'],
        '寡言少语': ['武曲','七杀','天府']
    };
    var conflictPairs = {
        '简洁有力': ['太阴','天同','天相'],
        '温和委婉': ['武曲','七杀','太阳'],
        '热情洋溢': ['天府','天梁','太阴'],
        '沉稳冷静': ['贪狼','破军','廉贞'],
        '幽默风趣': ['天梁','武曲','天府'],
        '寡言少语': ['太阳','贪狼','巨门']
    };
    var resonant = (resonantPairs[speech] || []).filter(function(s){ return mingStars.indexOf(s) >= 0; });
    var conflict  = (conflictPairs[speech]  || []).filter(function(s){ return mingStars.indexOf(s) >= 0; });

    var sihuaTag = hasJi ? '化忌' : (hasQuan ? '化权' : (hasLu ? '化禄' : (hasKe ? '化科' : '')));

    if (resonant.length > 0 && (hasLu || hasQuan)) {
        return '*命盘印证：命宫' + resonant[0] + (sihuaTag ? sihuaTag : '') + '——这种语言风格不只是习惯，是被星盘刻进去的底色。*';
    }
    if (resonant.length > 0) {
        return '*命盘印证：命宫' + resonant[0] + '坐镇，说话方式与星性高度契合，是真正从骨子里透出来的表达。*';
    }
    if (conflict.length > 0 && hasJi) {
        return '*命盘张力：命宫' + conflict[0] + '化忌——本星性与这种语言风格天然对立，这个反差正是角色最有戏剧张力的地方：他选择了一种与命盘底色截然相反的表达方式。*';
    }
    if (conflict.length > 0) {
        return '*命盘张力：命宫' + conflict[0] + '的底色与此语言风格形成内在张力——说出去的话和心里想的往往不是同一件事。*';
    }
    if (hasJi) {
        return '*命盘注：命宫化忌，语言在某些时刻容易成为执念的出口——最用力的那句话往往也是最脆弱的那句话。*';
    }
    if (hasQuan) {
        return '*命盘注：命宫化权，语言天然带有主导色彩，即使表面温和，话语背后也有掌控场域的潜意识。*';
    }
    return '';
}

function _narrateBehavior(behavior, mainStar, chart) {
    // ── 多语言属性值标准化 ──
    behavior = _normalizeAttrVal(behavior);
    // ── 英文词典 ──────────────────────────────────────────────────
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') {
        var behaviorStarDefaultEN = {
            '紫微': 'Operates by an internal rulebook; outside rhythms rarely dictate the pace.',
            '天机': 'Always thinks before acting — strong sense of planning, though sometimes too much time gets spent in "preparation" mode.',
            '太阳': 'Open and expansive in action; prefers to make the first move rather than wait.',
            '武曲': 'Direct executor — no detours, exceptional follow-through.',
            '天同': 'Steady and unhurried; favours comfortable rhythms over urgency.',
            '廉贞': 'Strategic; rarely reveals true intent; every move is a cost-benefit calculation.',
            '天府': 'Cautious and conservative; always keeps a way out.',
            '太阴': 'Keeps process private; shows only results.',
            '贪狼': 'Behavioural pattern shifts constantly — today\'s version may feel like a different person from yesterday\'s.',
            '巨门': 'Says what will be done, then does it — no circling.',
            '天相': 'Knows how to find personal space within the rules.',
            '天梁': 'Slow and thorough; accuracy over speed.',
            '七杀': 'Decisive; not afraid to offend; acts without hesitation when the moment arrives.',
            '破军': 'Moves in ways that surprise others — and sometimes even themselves.'
        };
        var mapEN = {
            '雷厉风行': 'Decides and moves immediately — no second-guessing, no grace period for the other side. A clear advantage under pressure, though the gap between "acting" and "acting when ready" is sometimes skipped.',
            '深思熟虑': 'Before acting, runs through every scenario internally. Others see hesitation; what\'s actually happening is waiting for an inner signal of certainty. Once committed, rarely wrong.',
            '随性而为': 'Action follows instinct — feels right, therefore moves. Creates freedom, but occasionally produces "why exactly did I do that just now?" moments.',
            '谨慎小心': 'Systematically checks risks and confirms exits before deciding. Rarely makes foreseeable errors — at the cost of sometimes being half a beat slow when speed matters.',
            '有条不紊': 'Runs an internal sorting system regardless of external chaos. That order grounds the people around them; encounters with genuinely unclassifiable situations are uncomfortable.',
            '自由散漫': 'Behaviour looks patternless from outside — but is actually following a logic others can\'t see. The price of not being bound by habit: sometimes uncertain of the next step.'
        };
        return mapEN[behavior] || (behaviorStarDefaultEN[mainStar] || 'Behavioural pattern is adaptable and hard to pin to a single label.');
    }
    // ── 中文词典 ──────────────────────────────────────────────────
    var map = {
        '雷厉风行': (function(){
            var v = _getVocEntry('behavior','雷厉风行');
            return v
                ? v.term + '——' + v.desc + '。决策之后立刻行动，不给自己反悔的机会。' + v.contrast + '。这种节奏在高压环境下是优势。' + v.flaw + '。'
                : '决策之后立刻行动，不给自己反悔的机会，也不给对方反应的时间。这种节奏在高压环境下是优势，但有时也会在「行动」和「准备好了再行动」之间少了一个缓冲。';
        })(),
        '深思熟虑': (function(){
            var v = _getVocEntry('behavior','深思熟虑');
            return v
                ? v.term + '——' + v.desc + '。' + v.contrast + '。一旦出手，基本不会走错。' + v.flaw + '。'
                : '在行动之前会花大量时间在脑子里演练各种可能。别人以为他在犹豫，但其实他在等一个内心确定的信号。一旦出手，基本不会走错。';
        })(),
        '随性而为': (function(){
            var v = _getVocEntry('behavior','随性而为');
            return v
                ? v.term + '——' + v.desc + '。他的行动接近本能反应，感觉对了就动。' + v.contrast + '。' + v.flaw + '。'
                : '他的行动模式接近本能反应——感觉对了就动，不太依赖事先计划。这带来了自由感，但也意味着他的路上偶尔会出现「刚才那步为什么要那么做」的困惑。';
        })(),
        '谨慎小心': (function(){
            var v = _getVocEntry('behavior','谨慎小心');
            return v
                ? v.term + '——' + v.desc + '。习惯性地检查风险，确认退路，再做决定。' + v.contrast + '。' + v.flaw + '。'
                : '习惯性地检查风险，确认退路，再做决定。这种谨慎让他极少犯可以预见的错误，但有时也让他在该出手的时刻慢了半拍。';
        })(),
        '有条不紊': (function(){
            var v = _getVocEntry('behavior','有条不紊');
            return v
                ? v.term + '——' + v.desc + '。无论外部多混乱，他自己总有一套排序系统在运行。' + v.contrast + '。' + v.flaw + '。'
                : '无论外部多混乱，他自己总是有一套排序系统在运行。这种秩序感给他周围的人带来稳定，也让他在面对「无法分类的事」时会比较不舒服。';
        })(),
        '自由散漫': (function(){
            var v = _getVocEntry('behavior','自由散漫');
            return v
                ? v.term + '——' + v.desc + '。' + v.contrast + '。' + v.flaw + '。'
                : '他的行为模式对外看起来没有规律，但其实他只是遵循着一套别人看不到的逻辑。不束缚于习惯的代价，是有时候他自己也不确定下一步在哪里。';
        })()
    };
    var behaviorStarDefault = {
        '紫微':'行事自有章法，不轻易被外部节奏带着跑，每个动作背后都有自己的逻辑',
        '天机':'行动之前必先思考，计划感强，但也因此有时会在「准备」和「行动」之间消耗太多时间',
        '太阳':'行事开放，动作幅度大，偏向主动出击而非被动等待',
        '武曲':'行动直接，不绕弯子，执行力是他最明显的特质之一',
        '天同':'行为模式温和而稳定，不激进，讲究一种舒适的节奏',
        '廉贞':'行事有策略，不轻易暴露真实意图，每一步都在评估得失',
        '天府':'行事稳健，轻易不冒险，习惯性地为自己留好退路',
        '太阴':'行动偏向低调，不喜欢在人前展示过程，只呈现结果',
        '贪狼':'行为模式多变，今天的他和昨天的他可能让人感觉是不同的人',
        '巨门':'行事直接，说到做到，不喜欢迂回',
        '天相':'行为有分寸，懂得在规则内找到自己的空间',
        '天梁':'行事沉稳，慢工出细活，不追求速度，追求确定',
        '七杀':'行动果决，不怕得罪人，该出手时绝不犹豫',
        '破军':'行为模式常出人意料，走的路和别人不一样，甚至和自己的上一段路也不一样'
    };
    var base = map[behavior] || (behaviorStarDefault[mainStar] || '行为模式灵活多变，难以用单一标签定义');
    // ── 命盘印证层：官禄宫（偏移+8）星曜+四化 ──
    var note = _chartBehaviorNote(behavior, chart, mainStar);
    return note ? (base + '\n\n' + note) : base;
}

/**
 * 行为模式←官禄宫：官禄宫主星与行为风格的印证/张力
 */
function _chartBehaviorNote(behavior, chart, mainStar) {
    if (!behavior || !chart) return '';
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') return '';
    var guanluStars = _getPalaceStars(chart, 8);
    var guanluSihua = _getPalaceSihua(chart, 8);
    var hasJi    = guanluSihua.indexOf('化忌') >= 0;
    var hasLu    = guanluSihua.indexOf('化禄') >= 0;
    var hasQuan  = guanluSihua.indexOf('化权') >= 0;
    var hasKe    = guanluSihua.indexOf('化科') >= 0;

    var actionStars = {
        '雷厉风行':  ['七杀','太阳','武曲','破军'],
        '深思熟虑':  ['天机','紫微','廉贞','天府'],
        '随性而为':  ['贪狼','破军','天同'],
        '谨慎小心':  ['天府','天梁','太阴','天机'],
        '有条不紊':  ['紫微','天相','天梁','天府'],
        '自由散漫':  ['破军','贪狼','天机']
    };
    var tensionStars = {
        '雷厉风行':  ['天梁','天府','太阴'],
        '深思熟虑':  ['七杀','太阳','破军'],
        '随性而为':  ['天府','天梁','紫微'],
        '谨慎小心':  ['七杀','太阳','破军'],
        '有条不紊':  ['破军','贪狼','天机'],
        '自由散漫':  ['紫微','天府','天梁']
    };

    var matched  = (actionStars[behavior]  || []).filter(function(s){ return guanluStars.indexOf(s) >= 0; });
    var tensioned = (tensionStars[behavior] || []).filter(function(s){ return guanluStars.indexOf(s) >= 0; });

    if (matched.length > 0 && hasQuan) {
        return '*命盘印证：官禄宫' + matched[0] + '化权——行事风格与事业能量高度共鸣，在压力场域中这种行为模式反而是最强的武器。*';
    }
    if (matched.length > 0 && hasLu) {
        return '*命盘印证：官禄宫' + matched[0] + '化禄——行动模式与事业运势契合，轻松推进是这条路上的常态。*';
    }
    if (matched.length > 0) {
        return '*命盘印证：官禄宫' + matched[0] + '坐镇，与此行为模式同频共振——这不只是性格，也是他在事业轨道上最自然的姿态。*';
    }
    if (tensioned.length > 0 && hasJi) {
        return '*命盘张力：官禄宫' + tensioned[0] + '化忌——他选择的行事风格与事业宫的底层能量形成对抗，每一次行动都可能比别人多付出一倍的内耗。这个张力是角色最值得书写的弧光。*';
    }
    if (tensioned.length > 0) {
        return '*命盘张力：官禄宫' + tensioned[0] + '的本性与此行为模式暗中拉锯——表面看起来的行动力背后，有一层命盘层面的阻力在悄悄消耗。*';
    }
    if (hasJi) {
        return '*命盘注：官禄宫化忌，行动容易在关键节点遭遇阻力或变数——他的每一次"出手"背后都有更多不为人知的代价。*';
    }
    if (hasQuan) {
        return '*命盘注：官禄宫化权，行为模式中天然带有主导与掌控的底色，即使外表随性，内在都在无意识地主导局面。*';
    }
    return '';
}

function _narrateEmotion(emotion, mainStar, genderCN, chart) {
    // ── 多语言属性值标准化 ──
    emotion = _normalizeAttrVal(emotion);
    var pronoun = genderCN === '女' ? '她' : '他';
    // ── 英文词典 ──────────────────────────────────────────────────
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') {
        var pronounEN = (genderCN === '女') ? 'she' : 'he';
        var herHis = (genderCN === '女') ? 'her' : 'his';
        var starBaseEN = {
            '紫微': 'An ingrained pride means vulnerability is rarely shown to outsiders. ',
            '天机': 'Emotion is typically intercepted and processed by reason before it surfaces. ',
            '太阳': 'Feelings are outward-flowing — shared freely with the world. ',
            '武曲': 'Emotion is channelled into action; feeling and doing are not separate. ',
            '天同': 'Emotional baseline is stable — rarely swings between extremes. ',
            '廉贞': herHis.charAt(0).toUpperCase() + herHis.slice(1) + ' inner emotional world is far more complex than the surface suggests. ',
            '天府': 'Emotions run deep and slow — like water under a still surface. ',
            '太阴': 'Inner life is so finely tuned it sometimes feels like a weight even to ' + pronounEN + '. ',
            '贪狼': 'Emotional sensitivity is sharp — picks up on undercurrents others miss. ',
            '巨门': 'Feelings often seek an outlet through words. ',
            '天相': 'Tends to tend others\' emotions more than express ' + herHis + ' own. ',
            '天梁': 'More attuned to the feelings of others than to ' + herHis + ' own. ',
            '七杀': 'Emotion pressed down beneath an outer hardness — present but not visible. ',
            '破军': 'Feelings come in waves — unstable, tidal, not easily contained. '
        };
        var baseEN = starBaseEN[mainStar] || '';
        var mapEN = {
            '外露直白': baseEN + 'Feelings hit the face almost immediately — not much is hidden. That transparency reads as authentic; in moments that need restraint, it can also make ' + pronounEN + ' easy to read.',
            '内敛含蓄': baseEN + 'Most of the emotional life stays internal. Rarely shares, rarely needs external confirmation. The depth is real — others just can\'t easily reach it.',
            '丰富多变': baseEN + 'Wide emotional range — can move from intensity to stillness within a single day. That richness fuels creativity; people around ' + pronounEN + ' sometimes struggle to keep up.',
            '稳定平和': baseEN + 'Maintains equidistance from most emotions — not swept away by joy, not brought down by sorrow. Genuine steadiness, not suppression — though it can occasionally read as indifference.',
            '理性克制': baseEN + 'Strong impulse to manage feelings — treats emotion as something to be handled, not experienced. The system works well until something exceeds its capacity and breaks through.',
            '感性冲动': baseEN + 'Feeling bypasses thought and goes straight to action. A single moment of being moved can trigger choices whose consequences take a long time to live with. That\'s ' + herHis + ' heat — and ' + herHis + ' risk.'
        };
        return mapEN[emotion] || (emotion || 'A distinctive emotional style — composed on the outside, layered within.');
    }
    // ── 中文词典 ──────────────────────────────────────────────────
    var starBase = {
        '紫微':'骨子里的骄傲让他很少在外人面前展示软弱，',
        '天机':'情感在他那里经常被理性第一时间拦截，',
        '太阳':'情感对他来说是向外流动的，',
        '武曲':'情感在他的世界里是行动的一部分，',
        '天同':'他的情感状态比较稳定，很少大起大落，',
        '廉贞':'他的情感世界比外表看起来复杂得多，',
        '天府':'他的情感流动是缓慢而深水的，',
        '太阴':'他的情感世界细腻到有时连他自己都觉得负担，',
        '贪狼':'他对情感的感知非常灵敏，',
        '巨门':'他的情感常常通过言语寻找出口，',
        '天相':'他处理情感的方式偏向照顾他人多于表达自我，',
        '天梁':'他对他人情感的感知比对自身情感的感知更敏锐，',
        '七杀':'他的情感在外表的强硬之下压着，',
        '破军':'他的情感是不稳定的，浪潮式的，'
    };
    var base = starBase[mainStar] || '';
    var map = {
        '外露直白': (function(){
            var v = _getVocEntry('emotion','外露直白');
            return base + (v
                ? v.term + '——' + v.desc + '。' + v.contrast + '，在需要克制的场合也让' + pronoun + '容易被看穿。' + v.flaw + '。'
                : '感受到什么几乎立刻就写在脸上，不太会藏。这种透明让人觉得真实，但也让' + pronoun + '在某些需要克制的场合显得容易被看穿。');
        })(),
        '内敛含蓄': (function(){
            var v = _getVocEntry('emotion','内敛含蓄');
            return base + (v
                ? v.term + '——' + v.desc + '。不会主动分享，也不需要别人的情感回应来确认自己的感受。' + v.flaw + '。'
                : '情绪的大部分都发生在内部，不会主动分享，也不需要别人的情感回应来确认自己的感受。深沟是真实的，但旁人很难探到底。');
        })(),
        '丰富多变': (function(){
            var v = _getVocEntry('emotion','丰富多变');
            return base + (v
                ? v.term + '——' + v.desc + '。从热烈到冷静的切换可以在一天之内发生多次。' + v.flaw + '，让身边的人有时难以跟上节奏。'
                : '情感世界的幅度很大，从热烈到冷静的切换可以在一天之内发生多次。这种丰富是创造力的来源，但也让身边的人有时难以跟上' + pronoun + '的节奏。');
        })(),
        '稳定平和': (function(){
            var v = _getVocEntry('emotion','稳定平和');
            return base + (v
                ? v.term + '——' + v.desc + '，不被喜悦淹没，也不被悲伤击倒。' + v.contrast + '。' + v.flaw + '。'
                : '对大多数情绪都保持一种等距的态度——不被喜悦淹没，也不被悲伤击倒。这种平和是真正的稳定，不是压抑，但也让' + pronoun + '偶尔显得对事情缺乏热情。');
        })(),
        '理性克制': (function(){
            var v = _getVocEntry('emotion','理性克制');
            return base + (v
                ? v.term + '——' + v.desc + '。情感是需要被驾驭的东西，而不是被体验的东西——这是' + pronoun + '的信条。' + v.flaw + '。'
                : '对情感有强烈的管理冲动——觉得情绪是需要被驾驭的东西，而不是被体验的东西。这套机制很有效，直到某个超出处理能力的情感冲破防线。');
        })(),
        '感性冲动': (function(){
            var v = _getVocEntry('emotion','感性冲动');
            return base + (v
                ? v.term + '——' + v.desc + '。情感在' + pronoun + '这里不走大脑，直接进行动。' + v.contrast + '。' + v.flaw + '。'
                : '情感在' + pronoun + '这里不走大脑直接进行动，有时候一个触动点就能让' + pronoun + '做出事后要花很长时间处理后果的选择。这是' + pronoun + '的热烈，也是' + pronoun + '需要面对的风险。');
        })()
    };
    var result = map[emotion] || emotion || '情感表达方式独特，内外有别';
    // ── 命盘印证层：福德宫（偏移+10）星曜+四化 ──
    var note = _chartEmotionNote(emotion, chart, mainStar, pronoun);
    return note ? (result + '\n\n' + note) : result;
}

/**
 * 情绪表达←福德宫：福德宫主星与情绪模式的印证/张力
 */
function _chartEmotionNote(emotion, chart, mainStar, pronoun) {
    if (!emotion || !chart) return '';
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') return '';
    var fudeStars = _getPalaceStars(chart, 10);
    var fudeSihua = _getPalaceSihua(chart, 10);
    var hasJi    = fudeSihua.indexOf('化忌') >= 0;
    var hasLu    = fudeSihua.indexOf('化禄') >= 0;
    var hasQuan  = fudeSihua.indexOf('化权') >= 0;
    var hasKe    = fudeSihua.indexOf('化科') >= 0;

    var resonantMap = {
        '外露直白': ['太阳','贪狼','巨门','廉贞'],
        '内敛含蓄': ['太阴','天府','武曲','紫微'],
        '丰富多变': ['贪狼','破军','廉贞','天机'],
        '稳定平和': ['天同','天梁','天相','天府'],
        '理性克制': ['天机','紫微','武曲','天梁'],
        '感性冲动': ['太阳','贪狼','廉贞','破军']
    };
    var conflictMap = {
        '外露直白': ['太阴','天府','武曲','七杀'],
        '内敛含蓄': ['太阳','贪狼','巨门'],
        '丰富多变': ['天府','天梁','天同'],
        '稳定平和': ['贪狼','破军','廉贞'],
        '理性克制': ['贪狼','破军','廉贞','太阴'],
        '感性冲动': ['武曲','天机','天府','紫微']
    };

    var resonant  = (resonantMap[emotion]  || []).filter(function(s){ return fudeStars.indexOf(s) >= 0; });
    var conflict  = (conflictMap[emotion]  || []).filter(function(s){ return fudeStars.indexOf(s) >= 0; });

    if (resonant.length > 0 && hasLu) {
        return '*命盘印证：福德宫' + resonant[0] + '化禄——潜意识层是松弛滋养的，这种情绪底色让' + (pronoun||'他') + '的情感表达有一种自然流畅的质感。*';
    }
    if (resonant.length > 0 && hasQuan) {
        return '*命盘印证：福德宫' + resonant[0] + '化权——内心世界有强烈的主导感，情绪模式与本星能量完全契合，是发自内核的真实状态。*';
    }
    if (resonant.length > 0) {
        return '*命盘印证：福德宫' + resonant[0] + '——内在精神层与此情绪风格高度共鸣，' + (pronoun||'他') + '的情感表达方式不只是习惯，是命盘层面的天性。*';
    }
    if (conflict.length > 0 && hasJi) {
        return '*命盘张力：福德宫' + conflict[0] + '化忌——潜意识层与表面情绪模式形成深层撕裂。' + (pronoun||'他') + '展现出的情绪背后，有一个完全不同的内心世界在悄悄反向运作。这是最有深度的角色张力之一。*';
    }
    if (conflict.length > 0) {
        return '*命盘张力：福德宫' + conflict[0] + '与此情绪模式暗中对抗——表面呈现的情绪状态，可能是一层精心维持的保护壳，内里是另一番风景。*';
    }
    if (hasJi) {
        return '*命盘注：福德宫化忌，精神层面有持续的内耗倾向，情绪稳定对' + (pronoun||'他') + '来说是需要主动维护的事，不是自然发生的。*';
    }
    if (hasLu) {
        return '*命盘注：福德宫化禄，精神层有天然的滋养泉源，即使遭遇风浪，内在有一块地方是安静的。*';
    }
    return '';
}

function _narrateSocial(social, mainStar, chart) {
    // ── 多语言属性值标准化 ──
    social = _normalizeAttrVal(social);
    // ── 英文词典 ──────────────────────────────────────────────────
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') {
        var socialStarDefaultEN = {
            '紫微': 'A small but carefully selected circle — natural distance that requires no effort to maintain.',
            '天机': 'Connection requires intellectual resonance. Without it, solitude is preferred.',
            '太阳': 'Natural social gravity, but few truly close relationships — not everyone can keep up.',
            '武曲': 'Social interactions are functional. No time wasted, but genuine investment for those who earn it.',
            '天同': 'The kind of presence that puts people at ease — no pressure, no demands. Connections build slowly but hold.',
            '廉贞': 'Never fully open in social settings — every relationship has a defined boundary.',
            '天府': 'Steady social pace — not intense, but reliable. Value increases with time.',
            '太阴': 'Quiet in crowds, but noticing everything.',
            '贪狼': 'Naturally magnetic — able to connect with almost anyone; deep friendships are rarer.',
            '巨门': 'Straight-talking, no circling, neither seeking approval nor pushing away.',
            '天相': 'The social glue in a group — mediates, holds things together, often last to tend to own needs.',
            '天梁': 'Relationships built on trust, which requires time — all deep connections are slow-grown.',
            '七杀': 'A kind of social solitude — people present, but inner core rarely truly understood.',
            '破军': 'Social patterns are non-linear — sometimes wide open, suddenly closed. Hard to predict.'
        };
        var mapEN = {
            '主动热情': 'Can find common ground in any room — not performance, genuine curiosity about people. That warmth is a field of gravity, but also expensive; solitude is needed to recharge.',
            '被动等待': 'Doesn\'t initiate relationships, but responds genuinely when approached. Not coldness — it\'s how quality is filtered. Doesn\'t need everyone; needs the right ones.',
            '理性交往': 'Interactions carry an inner sense of purpose — not calculation, but efficiency. Purposeless socialising is draining; real connection restores energy.',
            '感性相交': 'Builds relationships on feeling, not analysis. Whether a connection will work is usually felt in the first meeting. Everything after is confirmation.',
            '圆滑世故': 'Knows which face to show to whom — not insincerity, but a social art developed within the rules of the world. The cost: sometimes unsure which version is most real.',
            '直率真诚': 'Says what is meant. People feel safe with that. Occasionally pays a price in complex social situations. Accepts it — can\'t operate on two different logics in private and public.'
        };
        return mapEN[social] || (socialStarDefaultEN[mainStar] || 'Has a distinctive social rhythm that doesn\'t follow the crowd.');
    }
    // ── 中文词典 ──────────────────────────────────────────────────
    var map = {
        '主动热情': (function(){
            var v = _getVocEntry('social','主动热情');
            return v
                ? v.term + '——' + v.desc + '。' + v.contrast + '。' + v.flaw + '。'
                : '他是那种走进任何地方都能找到共同话题的人——不是刻意表演，而是真的对人好奇。这种热情是磁场，但也消耗能量，他需要有独处来充电。';
        })(),
        '被动等待': (function(){
            var v = _getVocEntry('social','被动等待');
            return v
                ? v.term + '——' + v.desc + '。他不主动建立关系，但当别人靠近时会是真实的回应者。' + v.contrast + '。' + v.flaw + '。'
                : '他不主动建立关系，但当别人靠近时会是真实的回应者。这种「等待」不是冷漠，而是他筛选关系的方式——他不需要所有人，只需要值得的那一些。';
        })(),
        '理性交往': (function(){
            var v = _getVocEntry('social','理性交往');
            return v
                ? v.term + '——' + v.desc + '。' + v.contrast + '。' + v.flaw + '。'
                : '他与人的互动有一种内在的目的感——不是算计，而是效率。无意义的社交让他疲惫，真正的连接让他恢复能量。';
        })(),
        '感性相交': (function(){
            var v = _getVocEntry('social','感性相交');
            return v
                ? v.term + '——' + v.desc + '。' + v.contrast + '。' + v.flaw + '。'
                : '他建立关系靠的是感觉，而不是分析。一段关系好不好，他在第一次见面就能感知到，后来的时间只是在验证那个最初的感受。';
        })(),
        '圆滑世故': (function(){
            var v = _getVocEntry('social','圆滑世故');
            return v
                ? v.term + '——' + v.desc + '。' + v.contrast + '。' + v.flaw + '。'
                : '他知道在不同的人面前应该呈现自己的哪个侧面——这不是虚伪，而是他在社会规则里找到的生存艺术。代价是，他有时不确定自己最真实的一面是什么。';
        })(),
        '直率真诚': (function(){
            var v = _getVocEntry('social','直率真诚');
            return v
                ? v.term + '——' + v.desc + '。' + v.contrast + '。' + v.flaw + '。'
                : '他说什么就是什么，这让人觉得安全，但在复杂的社会场合也偶尔让他付出代价。他接受这个代价，因为他无法做到在人前和人后是两套逻辑。';
        })()
    };
    var socialStarDefault = {
        '紫微':'他的圈子不大，但都是经过筛选的人，与人交往自带一种无需刻意的距离感',
        '天机':'他选择关系靠的是智识共鸣，找不到同频的人宁愿独处',
        '太阳':'天然的社交磁场，但真正亲近的人不多，因为不是所有人都能跟上他的能量',
        '武曲':'他的社交是功能性的，不喜欢浪费彼此时间，但对值得的人会真心投入',
        '天同':'他是那种让人放松的存在，不给压力，也不要求太多，关系建立得慢但稳',
        '廉贞':'他在社交场合从不完全敞开，每段关系都有他自己设定的分寸和界限',
        '天府':'他的社交模式是稳中求进，不热烈，但可靠，时间越长越有分量',
        '太阴':'他在人群中是安静的，但细腻的观察力让他其实什么都看见了',
        '贪狼':'他有一种天然的吸引力，能和各种类型的人建立连接，但真正深交的不多',
        '巨门':'他的社交风格直接，不绕圈子，说什么是什么，不讨好也不刻意疏远',
        '天相':'他是那种在群体里起黏合作用的人，善于协调，但有时会把自己的需求放在最后',
        '天梁':'他的社交建立在信任上，信任需要时间，所以他的深度关系都是慢慢养出来的',
        '七杀':'他的社交是孤独的——不是没有人，而是他的内核很难被大多数人真正理解',
        '破军':'他的社交是非线性的，有时极度开放，有时又突然闭合，让人难以捉摸'
    };
    var base = map[social] || (socialStarDefault[mainStar] || '社交方式有其独特的节奏，不随大流');
    // ── 命盘印证层：交友宫（偏移+7）星曜+四化 ──
    var note = _chartSocialNote(social, chart, mainStar);
    return note ? (base + '\n\n' + note) : base;
}

/**
 * 社交模式←交友宫：交友宫主星与社交风格的印证/张力
 */
function _chartSocialNote(social, chart, mainStar) {
    if (!social || !chart) return '';
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') return '';
    var jiaoStars = _getPalaceStars(chart, 7);
    var jiaoSihua = _getPalaceSihua(chart, 7);
    var hasJi    = jiaoSihua.indexOf('化忌') >= 0;
    var hasLu    = jiaoSihua.indexOf('化禄') >= 0;
    var hasQuan  = jiaoSihua.indexOf('化权') >= 0;
    var hasKe    = jiaoSihua.indexOf('化科') >= 0;

    var resonantMap = {
        '主动热情': ['太阳','贪狼','天同','廉贞'],
        '被动等待': ['太阴','武曲','天府','七杀'],
        '理性交往': ['天机','武曲','紫微','廉贞'],
        '感性相交': ['太阴','贪狼','天同','廉贞'],
        '圆滑世故': ['廉贞','天相','天机','贪狼'],
        '直率真诚': ['太阳','巨门','七杀','武曲']
    };
    var conflictMap = {
        '主动热情': ['太阴','武曲','七杀','天府'],
        '被动等待': ['太阳','贪狼','天同'],
        '理性交往': ['太阳','贪狼','天同'],
        '感性相交': ['武曲','天机','紫微'],
        '圆滑世故': ['巨门','七杀','太阳'],
        '直率真诚': ['廉贞','天机','天相']
    };

    var resonant = (resonantMap[social] || []).filter(function(s){ return jiaoStars.indexOf(s) >= 0; });
    var conflict = (conflictMap[social] || []).filter(function(s){ return jiaoStars.indexOf(s) >= 0; });

    if (resonant.length > 0 && hasLu) {
        return '*命盘印证：交友宫' + resonant[0] + '化禄——朋友关系对他来说天然滋养，这种社交模式让他在人际网络中如鱼得水。*';
    }
    if (resonant.length > 0 && hasQuan) {
        return '*命盘印证：交友宫' + resonant[0] + '化权——他在人际关系中天然处于主导位置，这种社交方式是他与生俱来的人际掌控力的体现。*';
    }
    if (resonant.length > 0) {
        return '*命盘印证：交友宫' + resonant[0] + '——人际宫位与此社交模式同频，他的交友方式是命盘给出的最自然的答案。*';
    }
    if (conflict.length > 0 && hasJi) {
        return '*命盘张力：交友宫' + conflict[0] + '化忌——与人的连接在命盘层面有消耗性。他选择的社交方式是在这个底层阻力下强行建立的——每一段关系背后都有他不为人知的付出。*';
    }
    if (conflict.length > 0) {
        return '*命盘张力：交友宫' + conflict[0] + '与此社交风格暗中角力——他展现给外界的人际方式，和命盘里交友宫的底层能量之间，存在一道需要持续跨越的鸿沟。*';
    }
    if (hasJi) {
        return '*命盘注：交友宫化忌，与人的关系容易有消耗或变数，他在人际场中的付出往往多于收获，但也因此更懂得真正关系的分量。*';
    }
    if (hasLu) {
        return '*命盘注：交友宫化禄，朋友宫滋养，人际关系是他人生中的加分项，身边总有真心相交的人。*';
    }
    return '';
}

function _narrateCrisis(crisis, mainStar, sihuaType, chart) {
    // ── 多语言属性值标准化 ──
    crisis = _normalizeAttrVal(crisis);
    // ── 英文词典 ──────────────────────────────────────────────────
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') {
        var sihuaColorEN = {
            '化禄型': 'Innate intuition tends to activate at the critical moment — ',
            '化权型': 'Pressure actually triggers the control instinct — ',
            '化科型': 'First instinct in a crisis is to manage optics — ',
            '化忌型': 'Fixation amplifies in crisis — ',
            '化禄': 'Innate intuition tends to activate at the critical moment — ',
            '化权': 'Pressure actually triggers the control instinct — ',
            '化科': 'First instinct in a crisis is to manage optics — ',
            '化忌': 'Fixation amplifies in crisis — '
        };
        var scEN = sihuaColorEN[sihuaType] || '';
        var mapEN = {
            '冷静分析': scEN + 'one of the few who keeps a clear head when everyone else is reactive. Not without feelings — but able to set them aside long enough to do what needs doing, then deal with the feelings later.',
            '果断行动': scEN + 'first instinct in a crisis is to move. Action is the most effective response to uncertainty — stopping to think actually increases anxiety.',
            '寻求帮助': scEN + 'knows that going it alone isn\'t courage, it\'s recklessness. Asking for help when it\'s most needed is a lesson learned through experience. The hard part isn\'t knowing to ask — it\'s knowing who.',
            '逃避回避': scEN + 'first response to a crisis beyond capacity is to absent oneself — not always cowardice; sometimes it\'s conserving energy to come back and face it. But if the pattern becomes habit, it becomes the real obstacle.',
            '慌乱无措': scEN + 'under genuine crisis, harder to find bearings than usual. The capability is there — but the moment the ground seems to disappear, direction is temporarily lost. Needs a person or anchor point to pull back.',
            '坚定抵抗': scEN + 'the harder the pressure, the less likely to yield. That tenacity at the limit is the truest core — but the line between holding firm and just grinding through needs watching.'
        };
        return mapEN[crisis] || (crisis || 'Responds to crisis with a distinctive and personal approach.');
    }
    // ── 中文词典 ──────────────────────────────────────────────────
    var sihuaColor = {
        '化禄型':'天赋直觉往往在危机关头发挥作用，',
        '化权型':'压力反而激活了掌控本能，',
        '化科型':'会本能地先管理「形象受损」的部分，',
        '化忌型':'执念会在危机中被放大，',
        '化禄':'天赋直觉往往在危机关头发挥作用，',
        '化权':'压力反而激活了掌控本能，',
        '化科':'会本能地先管理「形象受损」的部分，',
        '化忌':'执念会在危机中被放大，'
    };
    var sc = sihuaColor[sihuaType] || '';
    var map = {
        '冷静分析': (function(){
            var v = _getVocEntry('crisis','冷静分析');
            return sc + (v
                ? v.term + '——' + v.desc + '。不是没有感受，而是感受不会比局势先到场，能把感受暂时放到一边先做该做的事。' + v.flaw + '。'
                : '面对危机时，他是少数能在情绪激动的现场保持清醒的人。不是没有感受，而是他能把感受暂时「放到一边」先做该做的事，之后再处理情绪。');
        })(),
        '果断行动': (function(){
            var v = _getVocEntry('crisis','果断行动');
            return sc + (v
                ? v.term + '——' + v.desc + '。行动本身是他对不确定性最有效的回应，停下来想反而会让他更焦虑。' + v.flaw + '。'
                : '危机来临时，他的本能是立刻动起来。行动本身是他对不确定性的最有效回应——停下来想反而会让他更焦虑。');
        })(),
        '寻求帮助': (function(){
            var v = _getVocEntry('crisis','寻求帮助');
            return sc + (v
                ? v.term + '——' + v.desc + '。他知道一个人扛不是勇气，是莽撞。在最需要的时候开口求助是智慧。' + v.flaw + '。'
                : '他知道一个人扛不是勇气，是莽撞。在最需要的时候开口求助，是他在多次经历后学到的智慧。难的不是知道要求助，而是知道找谁。');
        })(),
        '逃避回避': (function(){
            var v = _getVocEntry('crisis','逃避回避');
            return sc + (v
                ? v.term + '——' + v.desc + '。面对超出承受范围的危机，让自己暂时不在场，' + v.contrast + '。' + v.flaw + '。'
                : '面对超出承受范围的危机，他的第一反应是让自己不在场——这不总是懦弱，有时是为了之后有力气回来面对。但这个模式如果习惯化，就会成为他真正的阻碍。');
        })(),
        '慌乱无措': (function(){
            var v = _getVocEntry('crisis','慌乱无措');
            return sc + (v
                ? v.term + '——' + v.desc + '。不是没有能力，是那种「感觉地面消失了」的瞬间让他暂时失去方向。' + v.flaw + '。'
                : '危机状态下的他比平时更难找到重心——不是没有能力，而是那种「感觉地面消失了」的瞬间会让他短暂失去方向。他需要一个人或一件事把他拉回来。');
        })(),
        '坚定抵抗': (function(){
            var v = _getVocEntry('crisis','坚定抵抗');
            return sc + (v
                ? v.term + '——' + v.desc + '。越是被压，越不后退，这是他最真实的底色。' + v.flaw + '。'
                : '越是被压，他越不后退。这种在极限状态下的坚持是他最真实的底色——但也需要警惕那条「坚持」和「硬撑」之间的线。');
        })()
    };
    var base = map[crisis] || crisis || '危机中展现出独特的应对方式';
    // ── 命盘印证层：疾厄宫（偏移+5）星曜+四化 ──
    var note = _chartCrisisNote(crisis, chart, mainStar, sihuaType);
    return note ? (base + '\n\n' + note) : base;
}

/**
 * 危机应对←疾厄宫：疾厄宫主星与危机模式的印证/张力
 */
function _chartCrisisNote(crisis, chart, mainStar, sihuaType) {
    if (!crisis || !chart) return '';
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') return '';
    var jiEStars = _getPalaceStars(chart, 5);
    var jiESihua = _getPalaceSihua(chart, 5);
    var hasJi    = jiESihua.indexOf('化忌') >= 0;
    var hasLu    = jiESihua.indexOf('化禄') >= 0;
    var hasQuan  = jiESihua.indexOf('化权') >= 0;
    var hasKe    = jiESihua.indexOf('化科') >= 0;

    var resonantMap = {
        '冷静分析': ['天机','紫微','天梁','武曲'],
        '果断行动': ['七杀','太阳','破军','武曲'],
        '寻求帮助': ['天相','天同','太阴','天梁'],
        '逃避回避': ['太阴','天同','天机'],
        '慌乱无措': ['贪狼','廉贞','破军'],
        '坚定抵抗': ['七杀','紫微','武曲','廉贞']
    };
    var conflictMap = {
        '冷静分析': ['贪狼','破军','廉贞'],
        '果断行动': ['天梁','天府','太阴'],
        '寻求帮助': ['武曲','七杀','紫微'],
        '逃避回避': ['七杀','太阳','紫微'],
        '慌乱无措': ['紫微','武曲','天梁'],
        '坚定抵抗': ['太阴','天同','天相']
    };

    var resonant = (resonantMap[crisis] || []).filter(function(s){ return jiEStars.indexOf(s) >= 0; });
    var conflict = (conflictMap[crisis] || []).filter(function(s){ return jiEStars.indexOf(s) >= 0; });

    if (resonant.length > 0 && hasJi) {
        return '*命盘深层：疾厄宫' + resonant[0] + '化忌——危机模式与疾厄宫能量共鸣，但化忌意味着这种应对方式本身也是他最深的消耗点。越是危机，越是内耗——这是角色最复杂的生命线。*';
    }
    if (resonant.length > 0 && hasQuan) {
        return '*命盘印证：疾厄宫' + resonant[0] + '化权——压力下的应对能量被强化，危机是他展现真实力量的场合，这个应对模式有命盘支撑。*';
    }
    if (resonant.length > 0) {
        return '*命盘印证：疾厄宫' + resonant[0] + '——身心承压模式与此应对方式契合，危机状态反而能激活他最真实的底层能量。*';
    }
    if (conflict.length > 0 && hasJi) {
        return '*命盘张力：疾厄宫' + conflict[0] + '化忌——身心层面有持续的脆弱点，他选择的危机应对方式是在这个底层损耗上硬撑出来的。每次危机都比别人多付代价。*';
    }
    if (conflict.length > 0) {
        return '*命盘张力：疾厄宫' + conflict[0] + '与此应对模式形成内在拉锯——表面上的危机姿态背后，有一个与此完全相反的身心底层反应在悄悄消耗他。*';
    }
    if (hasJi) {
        return '*命盘注：疾厄宫化忌，危机时身心层面的承压能力比表面看起来更脆弱——他在外人眼中展现的应对，很多时候是咬牙维持的。*';
    }
    if (hasQuan) {
        return '*命盘注：疾厄宫化权，压力与危机反而是他的激活剂——越是高压，这个宫位的能量越是被点燃，韧性超乎外人预期。*';
    }
    return '';
}

function _narrateLearning(learning, mainStar, chart) {
    // ── 多语言属性值标准化 ──
    learning = _normalizeAttrVal(learning);
    // ── 英文词典 ──────────────────────────────────────────────────
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') {
        var learningStarDefaultEN = {
            '紫微': 'Learns top-down — builds the big picture first, then fills in the details.',
            '天机': 'Learning is almost instinctive — it\'s how the world gets processed, not just a means to an end.',
            '太阳': 'Open-format learner — willing to enter many domains; breadth over depth.',
            '武曲': 'Learns only what\'s useful; practical mastery comes faster than theoretical understanding.',
            '天同': 'A comfortable learning pace — no self-coercion, but never stops.',
            '廉贞': 'Learns with purpose — acquiring knowledge for specific use at the right moment.',
            '天府': 'Systematic — prefers slower and more thorough over quick and shallow.',
            '太阴': 'Absorbs quietly — solo processing preferred over discussion.',
            '贪狼': 'Enthusiasm for new knowledge arrives fast; sustained attention requires external stimulus.',
            '巨门': 'Strong analytical drive — doesn\'t accept; dissects.',
            '天相': 'Learns primarily by observing others; distils experience from watching.',
            '天梁': 'Knowledge tends toward the classical and time-tested; values what has been verified by duration.',
            '七杀': 'Learns fastest in the field — quiet classroom settings tend to cause unfocused.',
            '破军': 'Learning path is entirely non-linear — most important insights tend to arrive in unexpected places.'
        };
        var mapEN = {
            '快速学习': 'Has an ability to find the core thread in new information quickly — not mastering every detail first, but building the framework and filling in. This efficiency enables fast entry into new domains, sometimes at the cost of depth.',
            '稳步积累': 'Learning is steady, careful, thorough — each step confirmed before moving. Results in an unusually solid foundation and rare depth in familiar territory. The cost: slow pace, not suited to environments that change rapidly.',
            '依赖经验': 'Learns by doing — theory carries limited weight, but one real experience is worth ten books. Judgement is built on a self-accumulated case library; harder to transfer to completely unfamiliar situations.',
            '善于应变': 'Learning is essentially real-time adaptation — each new context triggers a "read-adjust-act" loop. Highly flexible in unfamiliar environments, though sometimes lacks systematic structure; knowledge can be fragmented.',
            '固执己见': 'Strong protective instinct around an established cognitive framework — new information must pass through an internal filter first. Guards against being shifted by information overload, but can also screen out genuinely valuable perspectives.',
            '灵活调整': 'Cognitive system is dynamic — conclusions are never fixed, always being updated with new input. This openness is intellectual maturity; it requires a stable core, otherwise it\'s easy to be pulled in too many directions.'
        };
        return mapEN[learning] || (learningStarDefaultEN[mainStar] || 'Continuously refines and deepens understanding through practice and reflection.');
    }
    // ── 中文词典 ──────────────────────────────────────────────────
    var map = {
        '快速学习': (function(){
            var v = _getVocEntry('learning','快速学习');
            return v
                ? v.term + '——' + v.desc + '。先把框架建起来，再往里填内容，效率极高。' + v.contrast + '。' + v.flaw + '。'
                : '他有一种接触新信息后迅速找到核心脉络的能力——不是所有细节都要掌握，而是先把框架建起来，再往里填内容。这种效率让他能在短时间内进入新领域，但有时深度会是代价。';
        })(),
        '稳步积累': (function(){
            var v = _getVocEntry('learning','稳步积累');
            return v
                ? v.term + '——' + v.desc + '。每一步踩实了再往前，知识底座极为扎实。' + v.contrast + '。' + v.flaw + '。'
                : '他的学习是慢工出细活式的——每一步都要踩实了再往前。这种方式让他的知识底座极为扎实，也让他在熟悉的领域有一种别人没有的厚度。代价是节奏慢，不适合快速变化的场合。';
        })(),
        '依赖经验': (function(){
            var v = _getVocEntry('learning','依赖经验');
            return v
                ? v.term + '——' + v.desc + '。判断力建立在亲身积累的案例库上。' + v.contrast + '。' + v.flaw + '。'
                : '他的学习路径是「从做里面学」——理论对他意义有限，但一次真实的经历抵得上十本书。他的判断力建立在亲身积累的案例库上，有时难以迁移到从未经历过的情境。';
        })(),
        '善于应变': (function(){
            var v = _getVocEntry('learning','善于应变');
            return v
                ? v.term + '——' + v.desc + '。每个新情境都触发一次「读取-调整-行动」循环，陌生环境让他更灵活。' + v.flaw + '。'
                : '他的学习本质上是即时适应——每一个新情境都会触发一次快速的「读取-调整-行动」循环。这让他在陌生环境里极为灵活，但有时缺乏系统性，知识是碎片化的。';
        })(),
        '固执己见': (function(){
            var v = _getVocEntry('learning','固执己见');
            return v
                ? v.term + '——' + v.desc + '。新信息要通过他的内部筛选才能被纳入。' + v.contrast + '。' + v.flaw + '。'
                : '他对已经建立的认知体系有强烈的保护意识——新的信息首先要通过他内部的筛选，才能被纳入。这保护了他不被信息轰炸改变立场，但也让他有时忽略了真正有价值的新观点。';
        })(),
        '灵活调整': (function(){
            var v = _getVocEntry('learning','灵活调整');
            return v
                ? v.term + '——' + v.desc + '。结论从来不是固定的，随着新信息不断修正。' + v.contrast + '。' + v.flaw + '。'
                : '他的认知系统是动态的——结论从来不是固定的，而是随着新信息的到来在不断修正中。这种开放性是智识上的成熟，但也需要一个稳定的核心，不然容易被各种理论带着跑。';
        })()
    };
    var learningStarDefault = {
        '紫微':'他的学习路径是从顶层往下渗透——先建立整体认知，再往细节扎',
        '天机':'他对知识有近乎本能的热情，学习是他处理世界的方式，不是手段',
        '太阳':'他的学习是开放式的，愿意接触各种领域，广度超过深度',
        '武曲':'他只学有用的，对实际操作的掌握快于理论理解',
        '天同':'他学习的节奏是舒适的，不逼自己，但也不停下来',
        '廉贞':'他学习带有目的性，是为了在某个场合用出来',
        '天府':'他的学习是系统化的，宁愿慢一些，也要把基础打牢',
        '太阴':'他吸收信息的方式是安静的，更偏向独自消化而非在讨论中学习',
        '贪狼':'他对新鲜知识的热情来得快，但持续性需要靠外部刺激维持',
        '巨门':'他对知识有强烈的辨析欲，不是学到就信，而是学到就要拆解',
        '天相':'他的学习更多来自观察他人，从别人的经历里提炼经验',
        '天梁':'他的知识积累偏向古典和经验，重视经过时间检验的东西',
        '七杀':'他在实战中学得最快，安静的课堂反而让他无法集中',
        '破军':'他的学习路径完全非线性，经常在意想不到的地方获得最重要的领悟'
    };
    var base = map[learning] || (learningStarDefault[mainStar] || '在实践中不断调整和深化自己的认知体系');
    // ── 命盘印证层：父母宫（偏移+11）星曜+四化 ──
    var note = _chartLearningNote(learning, chart, mainStar);
    return note ? (base + '\n\n' + note) : base;
}

/**
 * 学习风格←父母宫：父母宫主星与认知学习风格的印证/张力
 */
function _chartLearningNote(learning, chart, mainStar) {
    if (!learning || !chart) return '';
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') return '';
    var fumuStars = _getPalaceStars(chart, 11);
    var fumuSihua = _getPalaceSihua(chart, 11);
    var hasJi    = fumuSihua.indexOf('化忌') >= 0;
    var hasLu    = fumuSihua.indexOf('化禄') >= 0;
    var hasQuan  = fumuSihua.indexOf('化权') >= 0;
    var hasKe    = fumuSihua.indexOf('化科') >= 0;

    var resonantMap = {
        '快速学习': ['天机','太阳','贪狼','破军'],
        '稳步积累': ['天府','天梁','紫微','太阴'],
        '依赖经验': ['武曲','七杀','天相','廉贞'],
        '善于应变': ['天机','破军','贪狼','天同'],
        '固执己见': ['紫微','武曲','天梁','七杀'],
        '灵活调整': ['天机','破军','太阳','贪狼']
    };
    var conflictMap = {
        '快速学习': ['天府','天梁','太阴'],
        '稳步积累': ['天机','破军','贪狼'],
        '依赖经验': ['天机','太阳','贪狼'],
        '善于应变': ['天府','天梁','紫微'],
        '固执己见': ['天机','破军','太阳'],
        '灵活调整': ['紫微','武曲','天梁']
    };

    var resonant = (resonantMap[learning] || []).filter(function(s){ return fumuStars.indexOf(s) >= 0; });
    var conflict = (conflictMap[learning] || []).filter(function(s){ return fumuStars.indexOf(s) >= 0; });

    if (resonant.length > 0 && hasKe) {
        return '*命盘印证：父母宫' + resonant[0] + '化科——认知宫化科，学习方式与文书智识能量高度契合，天然的学习型气场，这种求知姿态是被命盘加持的。*';
    }
    if (resonant.length > 0 && hasLu) {
        return '*命盘印证：父母宫' + resonant[0] + '化禄——知识积累对他来说天然顺遂，这种学习方式走起来比旁人省力，是命盘给出的认知红利。*';
    }
    if (resonant.length > 0) {
        return '*命盘印证：父母宫' + resonant[0] + '——认知宫星性与此学习模式共鸣，他的求知方式不是摸索出来的，而是写在星盘里的天性。*';
    }
    if (conflict.length > 0 && hasJi) {
        return '*命盘张力：父母宫' + conflict[0] + '化忌——认知宫有化忌，学习过程中容易在某些盲点上卡住，他选择的学习方式是对这个天然障碍的某种补偿或绕路。*';
    }
    if (conflict.length > 0) {
        return '*命盘张力：父母宫' + conflict[0] + '与此学习模式暗中拮抗——他的认知底层能量与选择的学习方式之间存在内在张力，学习对他来说不只是吸收，也是一场持续的内部协商。*';
    }
    if (hasJi) {
        return '*命盘注：父母宫化忌，学习与认知之路有隐性阻力，但也因此形成了更深的反思性——他的每一个认知结论背后，都有比别人多走的一段弯路。*';
    }
    if (hasKe) {
        return '*命盘注：父母宫化科，认知学习是他人生中的天然亮点，文书智识类事务运势顺畅，学习这件事对他来说更像是享受而非负担。*';
    }
    return '';
}

function _narrateGrowth(growth, mainStar, sihuaType, chart) {
    // ── 多语言属性值标准化 ──
    growth = _normalizeAttrVal(growth);
    // ── 英文词典 ──────────────────────────────────────────────────
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') {
        var sihuaFinalEN = {
            '化禄型': 'letting natural talent genuinely serve something larger — ',
            '化权型': 'learning to find balance between control and release — ',
            '化科型': 'moving from "being seen" to "truly seeing oneself" — ',
            '化忌型': 'transforming fixation into a force that actually drives growth — ',
            '化禄': 'letting natural talent genuinely serve something larger — ',
            '化权': 'learning to find balance between control and release — ',
            '化科': 'moving from "being seen" to "truly seeing oneself" — ',
            '化忌': 'transforming fixation into a force that actually drives growth — '
        };
        var scEN = sihuaFinalEN[sihuaType] || '';
        var mapEN = {
            '追求成功': scEN + 'The growth direction is upward — constantly proving, constantly pushing the ceiling. But genuine maturity usually doesn\'t begin until the question "what is success even for?" gets asked.',
            '追求自由': scEN + 'The desire is for a state of inner freedom that holds regardless of external conditions. The growth path is gradually learning to find personal sovereignty in any circumstance.',
            '追求安稳': scEN + 'Doesn\'t need the highest point — needs a place to put down roots. Growth is learning to choose, between "good enough" and "could be better," the answer that brings genuine peace.',
            '追求真理': scEN + 'Won\'t accept an explanation that doesn\'t hold together, even as self-comfort. Growth is building — through ongoing questioning and verification — a worldview that actually survives scrutiny.',
            '追求情感': scEN + 'Deep connection is the primary growth driver — to be genuinely understood, to love and be loved. This isn\'t a bonus; it\'s the ground of being. Growth is learning to yearn for relationship and also bear all the weight it carries.',
            '追求平衡': scEN + 'Growth is finding a sustainable centre among competing tensions — not compromise, but a higher-order integration. What finally produces maturity is usually the moments that force a choice between two things that both matter.'
        };
        return mapEN[growth] || (growth || 'Seeks growth through continuous self-inquiry and evolving perspective.');
    }
    // ── 中文词典 ──────────────────────────────────────────────────
    var sihuaFinal = {
        '化禄型':'让天赋真正服务于更大的意义，',
        '化权型':'学会在掌控与放手之间找到平衡，',
        '化科型':'从「被人看见」到「真正看见自己」，',
        '化忌型':'将执念转化为真正驱动成长的力量，',
        '化禄':'让天赋真正服务于更大的意义，',
        '化权':'学会在掌控与放手之间找到平衡，',
        '化科':'从「被人看见」到「真正看见自己」，',
        '化忌':'将执念转化为真正驱动成长的力量，'
    };
    var sc = sihuaFinal[sihuaType] || '';
    var map = {
        '追求成功': (function(){
            var v = _getVocEntry('growth','追求成功');
            return sc + (v
                ? v.term + '——' + v.desc + '。他的成长方向是向上的，不断证明自己，不断突破上限。' + v.contrast + '。' + v.flaw + '。'
                : '他的成长方向是「向上」的——不断证明自己，不断突破上限。但真正的成熟往往在他开始问「成功是为了什么」的时候才开始。');
        })(),
        '追求自由': (function(){
            var v = _getVocEntry('growth','追求自由');
            return sc + (v
                ? v.term + '——' + v.desc + '。他向往无论外部条件如何，都能保持内心自由的状态。' + v.contrast + '。' + v.flaw + '。'
                : '他向往的是一种无论外部条件如何，都能保持内心自由的状态。他的成长路径是逐渐学会在任何处境里都找到自己的主权。');
        })(),
        '追求安稳': (function(){
            var v = _getVocEntry('growth','追求安稳');
            return sc + (v
                ? v.term + '——' + v.desc + '。他需要的不是最高点，而是一个能扎根的地方。' + v.contrast + '。' + v.flaw + '。'
                : '他需要的不是最高点，而是一个能扎根的地方。他的成长是学会在「足够好」和「还可以更好」之间，选择那个真正让他安心的答案。');
        })(),
        '追求真理': (function(){
            var v = _getVocEntry('growth','追求真理');
            return sc + (v
                ? v.term + '——' + v.desc + '。不会为了安慰自己而接受一个说不通的解释。' + v.contrast + '。' + v.flaw + '。'
                : '他不会为了安慰自己而接受一个说不通的解释。他的成长路径是通过不断质疑和求证，建立一套真正经得起检验的世界观。');
        })(),
        '追求情感': (function(){
            var v = _getVocEntry('growth','追求情感');
            return sc + (v
                ? v.term + '——' + v.desc + '。被真正理解，真正爱与被爱，是他活着的底色。' + v.contrast + '。' + v.flaw + '。'
                : '深度的连接是他最重要的成长动力——被真正理解、真正爱与被爱，这对他来说不是锦上添花，而是活着的底色。他的成长是学会既向往又能承受关系带来的全部重量。');
        })(),
        '追求平衡': (function(){
            var v = _getVocEntry('growth','追求平衡');
            return sc + (v
                ? v.term + '——' + v.desc + '。在各种张力之间找重心，不靠妥协，靠整合。' + v.contrast + '。' + v.flaw + '。'
                : '他的成长是在各种张力之间找到一个可持续的重心——不是妥协，而是一种更高层次的整合。最终让他成熟的，往往是那些逼他在两种重要的东西之间做选择的时刻。');
        })()
    };
    var base = map[growth] || growth || '在不断地探索与自我对话中寻找成长的方向';
    // ── 命盘印证层：官禄宫（偏移+8）+ 命宫（偏移+0）双宫联合判断 ──
    var note = _chartGrowthNote(growth, chart, mainStar, sihuaType);
    return note ? (base + '\n\n' + note) : base;
}

/**
 * 成长方向←官禄宫+命宫：双宫联合印证成长轨迹与四化驱动
 */
function _chartGrowthNote(growth, chart, mainStar, sihuaType) {
    if (!growth || !chart) return '';
    if (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG === 'en') return '';
    var mingStars   = _getPalaceStars(chart, 0);
    var guanluStars = _getPalaceStars(chart, 8);
    var mingSihua   = _getPalaceSihua(chart, 0);
    var guanluSihua = _getPalaceSihua(chart, 8);

    var hasJi    = mingSihua.indexOf('化忌') >= 0 || guanluSihua.indexOf('化忌') >= 0;
    var hasLu    = mingSihua.indexOf('化禄') >= 0 || guanluSihua.indexOf('化禄') >= 0;
    var hasQuan  = mingSihua.indexOf('化权') >= 0 || guanluSihua.indexOf('化权') >= 0;
    var hasKe    = mingSihua.indexOf('化科') >= 0 || guanluSihua.indexOf('化科') >= 0;

    // 成长方向←命宫主星天性映射
    var growthToStars = {
        '追求成功': ['紫微','太阳','七杀','武曲','天梁'],
        '追求自由': ['破军','贪狼','天同','天机'],
        '追求安稳': ['天府','天同','太阴','天相'],
        '追求真理': ['天机','巨门','天梁','紫微'],
        '追求情感': ['太阴','廉贞','贪狼','天相'],
        '追求平衡': ['天相','天同','天梁','太阴']
    };
    var tensionStars = {
        '追求成功': ['天同','太阴','天相','贪狼'],
        '追求自由': ['紫微','天府','武曲'],
        '追求安稳': ['破军','七杀','太阳'],
        '追求真理': ['贪狼','廉贞','破军'],
        '追求情感': ['武曲','七杀','天机'],
        '追求平衡': ['七杀','破军','武曲']
    };

    var allStars = mingStars.concat(guanluStars);
    var resonant = (growthToStars[growth] || []).filter(function(s){ return allStars.indexOf(s) >= 0; });
    var tension  = (tensionStars[growth]  || []).filter(function(s){ return allStars.indexOf(s) >= 0; });

    var sihuaDesc = {
        '化禄型':'化禄滋养这条成长路，天赋与资源都在助力',
        '化权型':'化权强化了成长意志，这个方向对他而言有近乎执念的驱动力',
        '化科型':'化科让成长方向更明确，他清楚自己在向哪里走',
        '化忌型':'化忌让成长之路充满阻力——但正是那些阻力，塑造了他最深的底色',
        '化禄':'化禄滋养这条成长路，天赋与资源都在助力',
        '化权':'化权强化了成长意志，这个方向对他而言有近乎执念的驱动力',
        '化科':'化科让成长方向更明确，他清楚自己在向哪里走',
        '化忌':'化忌让成长之路充满阻力——但正是那些阻力，塑造了他最深的底色'
    };
    var sihuaStr = sihuaDesc[sihuaType] || '';

    if (resonant.length > 0 && hasQuan) {
        return '*命盘印证：命宫/官禄宫' + resonant[0] + '化权，' + sihuaStr + '——成长目标与命盘能量完全共振，这条路他走起来自带一种"我就该走这条路"的确定感。*';
    }
    if (resonant.length > 0 && hasLu) {
        return '*命盘印证：命宫/官禄宫' + resonant[0] + '化禄，' + sihuaStr + '——成长方向被命盘祝福，这个目标对他来说不只是追求，是天赋所向。*';
    }
    if (resonant.length > 0) {
        return '*命盘印证：命宫/官禄宫' + resonant[0] + '——成长方向与星盘底层能量高度契合，' + sihuaStr + '。他的人生弧光是被命盘预写好的。*';
    }
    if (tension.length > 0 && hasJi) {
        return '*命盘张力：命宫/官禄宫' + tension[0] + '化忌——成长目标与星盘底层能量形成深度张力。他想要的和命盘给的不在同一条线上，这个断层是他人生中最根本的戏剧结构。*';
    }
    if (tension.length > 0) {
        return '*命盘张力：命宫/官禄宫' + tension[0] + '——成长方向与星性底色之间有一道需要持续跨越的内在落差，他的每一步成长都是在对抗命盘的某种惯性。*';
    }
    if (hasJi) {
        return '*命盘注：命宫或官禄宫化忌——成长之路有执念的加持，也有执念的代价。他的成长目标背后，往往藏着一个未被解决的匮乏感。*';
    }
    if (hasQuan) {
        return '*命盘注：命宫或官禄宫化权——成长方向被强化的意志力加持，他不容易被外部改变方向，一旦认定便极难回头。*';
    }
    return '';
}

function _getSihuaAbbr(sihua) {
    return (sihua || '').replace('型', '');
}

function _getSihuaKeyword(sihua) {
    var k = {
        '化禄':'轻松愉悦', '化禄型':'轻松愉悦',
        '化权':'强势掌控', '化权型':'强势掌控',
        '化科':'理性管理', '化科型':'理性管理',
        '化忌':'执念驱动', '化忌型':'执念驱动'
    };
    return k[sihua] || '独特方式';
}

// ==================== 空间交互模块（差异化版） ====================
function _generateSpatialInteraction(chart, sihua) {
    var mainStar   = (chart.stars && chart.stars[0]) || chart.mainStar || '紫微';
    var patternType = chart.type || '杀破狼';
    var abbr       = _getSihuaAbbr(sihua);   // '化禄' / '化权' / '化科' / '化忌'
    var keyword    = _getSihuaKeyword(sihua);

    // ── 6.1 宫干飞星：根据四化类型，飞入目标宫不同，心理意义不同 ──
    var FLY_TARGET = {
        '化禄型':'财帛宫', '化禄':'财帛宫',
        '化权型':'官禄宫', '化权':'官禄宫',
        '化科型':'父母宫', '化科':'父母宫',
        '化忌型':'疾厄宫', '化忌':'疾厄宫'
    };
    var FLY_MEANING = {
        '化禄型':'天赋自然转化为资源积累，轻松吸引财气与机遇',
        '化禄' :'天赋自然转化为资源积累，轻松吸引财气与机遇',
        '化权型':'个人意志渗透到事业决策，掌控权力与话语权',
        '化权' :'个人意志渗透到事业决策，掌控权力与话语权',
        '化科型':'对声誉与形象高度在意，通过外部认可建立安全感',
        '化科' :'对声誉与形象高度在意，通过外部认可建立安全感',
        '化忌型':'执念与伤痕集中在身心，内耗源头在于无法放下',
        '化忌' :'执念与伤痕集中在身心，内耗源头在于无法放下'
    };
    var FLY_DRIVE = {
        '化禄型':'驱动力来自「享受流动」——不努力也有收获，容易产生「我理应被善待」的潜意识',
        '化禄' :'驱动力来自「享受流动」——不努力也有收获，容易产生「我理应被善待」的潜意识',
        '化权型':'驱动力来自「掌控感」——失控比失败更可怕，宁可错误地主导也不愿被动承受',
        '化权' :'驱动力来自「掌控感」——失控比失败更可怕，宁可错误地主导也不愿被动承受',
        '化科型':'驱动力来自「被看见」——外界的肯定是自我价值的镜子，缺少认可就会动摇',
        '化科' :'驱动力来自「被看见」——外界的肯定是自我价值的镜子，缺少认可就会动摇',
        '化忌型':'驱动力来自「弥补匮乏」——执念背后是深层恐惧，越想抓住越容易失去',
        '化忌' :'驱动力来自「弥补匮乏」——执念背后是深层恐惧，越想抓住越容易失去'
    };
    var flyTarget  = FLY_TARGET[sihua]  || '财帛宫';
    var flyMeaning = FLY_MEANING[sihua] || '能量通过' + keyword + '的方式向外传递';
    var flyDrive   = FLY_DRIVE[sihua]   || '通过' + keyword + '的方式实现人生目标';

    // ── 6.2 三方四正：根据格局类型，四宫联动主题不同 ──
    var SAN_FANG = {
        '杀破狼':{
            theme:'命宫（冲劲）× 财帛宫（冒险资本）× 官禄宫（变局事业）× 迁移宫（走出去）',
            read :'这四宫共同指向「破局」——在稳定中必然孕育破坏，在破坏中必然孕育新生。内心最深的安全感来自「我能重新开始」，而非守住现有的一切',
            risk :'四宫能量过旺时容易冲动决策、半途而废；需要刻意建立「完成一件事」的心理机制'
        },
        '紫府廉武相':{
            theme:'命宫（统驭力）× 财帛宫（厚积财富）× 官禄宫（权位追求）× 迁移宫（外在形象）',
            read :'四宫共同指向「建制」——每一步都在为更大的权力版图布局，外在表现越稳重，内心野心越深藏。真正的安全感来自「我拥有不可撼动的地位」',
            risk :'过度追求稳固可能导致对变化的抗拒，错失转型窗口'
        },
        '机月同梁':{
            theme:'命宫（灵活应变）× 财帛宫（细水长流）× 官禄宫（服务辅佐）× 迁移宫（适应环境）',
            read :'四宫共同指向「融入」——最大的力量不是对抗，而是像水一样渗入缝隙。真正的安全感来自「我被需要、我属于这里」',
            risk :'容易因为害怕冲突而妥协过度，导致自我边界模糊'
        },
        '巨日':{
            theme:'命宫（表达欲）× 财帛宫（理想投入）× 官禄宫（公众价值）× 迁移宫（传播影响）',
            read :'四宫共同指向「发光」——内驱力是被更多人看见、被历史记住。真正的安全感来自「我说出了真相，我留下了痕迹」',
            risk :'过度暴露自我可能换来消耗，需要建立「选择性表达」的智慧'
        }
    };
    var sf = SAN_FANG[patternType] || SAN_FANG['杀破狼'];

    // ── 6.3 夹局：根据主星，邻宫影响截然不同 ──
    var JIA_JU = {
        '紫微':{ left:'天机（谋略）', right:'天府（稳重）', read:'统帅之星被谋士与守成之星护卫，领导力有智识加持，决策偏向深谋远虑但有时失于果断' },
        '天机':{ left:'紫微（权威）', right:'太阴（情感）', read:'策略之星夹在权威与情感之间，既要向上汇报又要安抚人心，长期在「理性计划」与「情绪照顾」间消耗' },
        '太阳':{ left:'天机（算计）', right:'武曲（强硬）', read:'光明之星被精算与强硬夹住，表面豪爽义气，内心实则有精密盘算，能量释放时往往比外表更具冲击力' },
        '武曲':{ left:'太阳（扩张）', right:'天同（享乐）', read:'钢铁意志被扩张欲与享乐感包围，驱动力极强却时常被安逸诱惑拖拽，人生节奏往往呈「猛冲-停滞-再猛冲」的波形' },
        '天同':{ left:'武曲（刚毅）', right:'廉贞（欲望）', read:'温和福星夹在刚烈与欲望之间，表面平和实则内心有更多渴望未被表达，「不争」有时是主动选择，有时是压抑' },
        '廉贞':{ left:'天同（惰性）', right:'天府（保守）', read:'复杂情欲之星被惰性与保守夹住，热情受到双重压制，容易形成「表面克制、内心汹涌」的心理张力' },
        '天府':{ left:'廉贞（欲望）', right:'太阴（柔情）', read:'守成之星被欲望与柔情护卫，财富积累有情感温度，经营风格稳中带暖，最忌被情感判断干扰理性决策' },
        '太阴':{ left:'天府（稳固）', right:'贪狼（欲望）', read:'感性之星夹在稳重与欲望之间，表面温婉内里有野心，对美好事物的渴望比外表显现的深得多' },
        '贪狼':{ left:'太阴（柔美）', right:'巨门（黑暗）', read:'欲望之星夹在温柔与暗能量之间，魅力天成却容易与是非相伴，桃花旺的同时口舌风险也高' },
        '巨门':{ left:'贪狼（桃花）', right:'天相（印信）', read:'口才之星夹在桃花与权威背书之间，语言力量极强，既能成事也能惹祸，关键在于说话时机的选择' },
        '天相':{ left:'巨门（直言）', right:'天梁（论断）', read:'印绶之星夹在两个都善于「下结论」的星中间，处事极为谨慎，喜欢在争议双方之间维持平衡，但有时显得优柔寡断' },
        '天梁':{ left:'天相（公正）', right:'七杀（破坏）', read:'清高之星夹在公正与破坏之间，理想主义与现实冲击并存，经常扮演「救场者」角色，代价是长期透支自己' },
        '七杀':{ left:'天梁（保守）', right:'破军（激进）', read:'将星夹在守旧与激进之间，战略判断时常摇摆，要么过度保守错失先机，要么鲁莽出击代价惨重，需要建立「出手前的停顿机制」' },
        '破军':{ left:'七杀（强势）', right:'紫微（权威）', read:'开创之星夹在强势与权威之间，变革能量受到双重钳制，越是受压越反弹，与权威的冲突往往是成长的起点也是代价' }
    };
    var jj = JIA_JU[mainStar] || { left:'相邻星曜', right:'对向星曜', read:'环境中的多方力量对角色形成复杂的被动塑造，需要觉察隐性压力的来源' };

    // ── 6.4 暗合：根据主星宫位，暗合宫不同 ──
    var AN_HE = {
        '紫微':{ palace:'财帛宫', read:'命宫（紫微）与财帛宫暗合——尊贵与财富天然相连，但这个连接常常「看不见」：财富不来自努力，来自地位；维护地位才是变相积累财富的底层逻辑' },
        '天机':{ palace:'官禄宫', read:'命宫（天机）与官禄宫暗合——谋略能力与事业成就之间有隐秘的因果：在幕后出谋划策比在台前主导更能发挥本命优势，功成而不居名是最高效的路径' },
        '太阳':{ palace:'迁移宫', read:'命宫（太阳）与迁移宫暗合——光芒在陌生环境中反而更亮，离开熟悉圈子才能真正发光。异乡、跨界、陌生场域是这个角色最容易遇见机遇的地方' },
        '武曲':{ palace:'财帛宫', read:'命宫（武曲）与财帛宫暗合——武曲本是财星，与财帛宫的暗合让财富磁场加倍，但「暗合」意味着这种财运需要付出实际行动才会显现，不劳而获不在此命格中' },
        '天同':{ palace:'福德宫', read:'命宫（天同）与福德宫暗合——物质需求与精神享受高度重叠，内心真正的安全感来自「不紧绷」的状态。越能放松，越能吸引好运，这是天同格的最大暗器' },
        '廉贞':{ palace:'官禄宫', read:'命宫（廉贞）与官禄宫暗合——情欲与权力之间有隐秘的连接，事业运往往通过人际魅力推动，关键贵人常常是被「吸引」来的，而非主动争取来的' },
        '天府':{ palace:'田宅宫', read:'命宫（天府）与田宅宫暗合——守成能力与固定资产天然绑定，房产、传承、家族资源是这个角色最稳固的依托，家庭基盘越稳，外部发展越顺' },
        '太阴':{ palace:'夫妻宫', read:'命宫（太阴）与夫妻宫暗合——情感世界与自我认知深度交织，伴侣的状态直接影响自我价值感。亲密关系是最重要的能量来源，也是最大的软肋' },
        '贪狼':{ palace:'迁移宫', read:'命宫（贪狼）与迁移宫暗合——桃花与际遇都藏在「出走」里，在固定圈子里贪狼的能量容易内耗，走出去才能真正激活多才多艺的特质' },
        '巨门':{ palace:'父母宫', read:'命宫（巨门）与父母宫暗合——说话方式与原生家庭有深层连接，口才的锋芒或压抑往往源自早年表达是否被接受。疗愈亲子关系，是释放语言力量的暗线' },
        '天相':{ palace:'官禄宫', read:'命宫（天相）与官禄宫暗合——公正与权威的结合让这个角色天生适合担任「背书者」，真正的影响力往往在幕后，通过为他人「加盖印章」而积累自己的地位' },
        '天梁':{ palace:'夫妻宫', read:'命宫（天梁）与夫妻宫暗合——清高理想主义与亲密关系之间有奇特的张力：越是在感情中遭遇「救助或被救助」的情节，越能触动内心真正的自我认知' },
        '七杀':{ palace:'田宅宫', read:'命宫（七杀）与田宅宫暗合——不安分的将星与「家」之间有隐秘的羁绊，离家越远、闯荡越猛，内心对稳定根基的渴望反而越深，家庭是最终的停泊港' },
        '破军':{ palace:'迁移宫', read:'命宫（破军）与迁移宫暗合——开创能量只有在「离开」中才能完全释放，守着不变的环境会让破军郁闷、自毁，不断进入新场域才是最顺势的活法' }
    };
    var ah = AN_HE[mainStar] || { palace:'福德宫', read:'命宫与精神世界之间存在不可见的能量通道，内心状态直接决定外部机遇的质量' };

    var result = '';
    result += '## 6.1 宫干飞星心理学\n\n';
    result += '**核心概念：** 命宫宫干飞' + abbr + '入' + flyTarget + '\n\n';
    result += '**心理意义：** ' + flyMeaning + '\n\n';
    result += '**深层驱动：** ' + flyDrive + '\n\n';

    result += '## 6.2 三方四正心理学\n\n';
    result += '**格局主题：** ' + sf.theme + '\n\n';
    result += '**整体解读：** ' + sf.read + '\n\n';
    result += '**潜在风险：** ' + sf.risk + '\n\n';

    result += '## 6.3 夹局影响心理学\n\n';
    result += '**命宫被夹：** 左邻' + jj.left + '，右邻' + jj.right + '\n\n';
    result += '**深层影响：** ' + jj.read + '\n\n';

    result += '## 6.4 暗合影响心理学\n\n';
    result += '**暗合宫位：** 命宫（' + mainStar + '）× ' + ah.palace + '\n\n';
    result += '**暗中连接：** ' + ah.read + '\n\n';

    return result;
}

// ==================== 灵魂伤痕（三维差异化：主星×时代×格局）====================
function _generateSoulWound(era, patternType, mainStar) {
    var eraKey = {ancient:'ancient', modern:'modern', contemporary:'contemporary'}[era] || 'contemporary';
    var lang = (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');

    // 英文版伤痕数据
    var STAR_ERA_WOUNDS_EN = {
        '紫微': {
            ancient:     'Betrayed by a trusted ally in court politics, fell from power overnight — learned that true dignity can only be self-guarded.',
            modern:      'Family fortune collapsed, lost everything that gave identity — titles, status, servants. Only the conviction "I determine my fate" sustained the rebuilding.',
            contemporary:'Rose to executive level, then was sidelined in a power play. Learned that positions granted by others can be revoked at any time.'
        },
        '天机': {
            ancient:     'Offered brilliant strategies, then suspected of overshadowing the ruler — talent suppressed, that frustration became a permanent mark.',
            modern:      'Wartime intelligence work, saw too much calculation and betrayal. The insight into human nature became a barrier to trust.',
            contemporary:'Always the problem-solver — family troubles, friends\' difficulties. Habitually needed, yet uncertain what they truly want for themselves.'
        },
        '太阳': {
            ancient:     'Spoke truth to power and was exiled. Learned that integrity doesn\'t always bring fairness — but chose to remain luminous.',
            modern:      'Believed revolution could change the world, watched ideals erode. Sacrificed comrades remain a permanent weight.',
            contemporary:'Became the family\'s "sun" — meeting parents\' expectations, siblings\' dependence. The cost of shining so long: no one noticed when the flame burned out.'
        },
        '武曲': {
            ancient:     'Fought bravely on the battlefield, then was imprisoned over a misjudgment. The "I was right" fury became the foundation of a hardened approach to life.',
            modern:      'Self-made in chaos, no backing, only hands. Every coin earned through dignity and sweat — instinctively intolerant of any weakness.',
            contemporary:'Watched father become unemployed overnight when the factory closed. Learned that the world doesn\'t reward effort — only money in hand brings security.'
        },
        '天同': {
            ancient:     'Witnessed war and displacement, saw too many farewells. Inner peace was earned through letting go after suffering — not natural optimism.',
            modern:      'Displaced in wartime, learned to find small joys in the worst circumstances. "Going with the flow" became survival instinct and armor.',
            contemporary:'Played peacemaker in family conflicts, diffusing tension with laughter. The cost: every grievance buried, the surface always pleasant.'
        },
        '廉贞': {
            ancient:     'Survived court through charm and cunning, but attracted jealousy. A near-fatal setup taught that "being desired" is itself a danger.',
            modern:      'Years of trading beauty and emotion for survival — couldn\'t distinguish real love from exchange. That longing and distrust persist.',
            contemporary:'Cheated or betrayed, but never mentioned it publicly. Hides fragility beneath allure and confidence — the more wounded, the more effortless the performance.'
        },
        '天府': {
            ancient:     'Managed family finances and personnel during prosperity. A massive loss from misplaced trust became the origin of lifelong caution.',
            modern:      'Migrated through chaos, guarding what remained. Having seen impulsive people lose everything, adopted "steady survival" as highest wisdom.',
            contemporary:'After parents\' divorce, the family finances collapsed. Learned early to save, to buy only necessities — because "everything can vanish" created a deep fear of uncertainty.'
        },
        '太阴': {
            ancient:     'The one truly loved was forced to marry a noble. Could only drink alone under moonlight, channeling that regret into art. Since then, tenderness only for the truly worthy.',
            modern:      'Love in wartime never got a proper goodbye. The one lost in the chaos became a permanent unfinished sentence — all later loves carry unexplained melancholy.',
            contemporary:'Once emotionally betrayed, now protects fragility with a complex exterior. Gentleness only for those truly worthy — and "worthy" became an ever-higher bar.'
        },
        '贪狼': {
            ancient:     'Favored by the powerful for many talents, nearly destroyed in political whirlpools. Learned that talent can be weapon or target — depends on who\'s admiring.',
            modern:      'Brilliant on stage, bearing invisible costs backstage — used, drained, discarded. Beneath the glamour, a deep hunger "to be truly seen."',
            contemporary:'Criticized since childhood for "too many interests, no focus." Living in the否定 of "good at everything, excellent at nothing" — no facet truly recognized.'
        },
        '巨门': {
            ancient:     'Spoke truth to power, was charged with "spreading sedition." Imprisonment taught that truth isn\'t always welcome — but silence suffocates more than misspeaking.',
            modern:      'Used words to expose darkness, was persecuted for it — imprisoned or exiled. "I told the truth and was punished" left a deep injustice.',
            contemporary:'Isolated since childhood for speaking too directly — criticized by teachers, controlled by parents, shunned by classmates. "I only told the truth" grievance breeds confusion and anger at social rules.'
        },
        '天相': {
            ancient:     'Forced to choose sides in factional struggle, chose wrong, family suffered. Learned "fairness" is a luxury — but "not choosing" costs less than choosing wrong.',
            modern:      'Peacemaker in wartime, trusted by neither side,随时可能被出卖. That exhaustion of pleasing everyone from a crack became instinctive fear of conflict.',
            contemporary:'Family peacemaker, habitually suppressing own position to maintain harmony. The cost: inner confusion about "what do I actually want" and low self-worth from "do my words count?"'
        },
        '天梁': {
            ancient:     'Watched upright father framed by corrupt officials,无处申诉. The "I know it\'s wrong but can do nothing" despair became the root of both cynicism and saving impulse.',
            modern:      'Healer or rescuer in chaos, saw too much death, saved too many — except oneself. A heart that carried others\' pain occasionally collapses when no one\'s watching.',
            contemporary:'The "sensible one" since childhood, habitually caring for others\' emotions, suppressing own needs. Became the one everyone complains to — yet no one has truly cared for that heart.'
        },
        '七杀': {
            ancient:     'Saw too many brothers fall on the battlefield. Killing brought not just victory, but nocturnal echoes of grief. The hard exterior covers undigested fear and sorrow.',
            modern:      'Shouldered too much alone in the most dangerous times — elderly parents, young children, battlefields everywhere. Long-term pressure with nowhere to vent locked the emotional valve — became someone who "just needs to hold on."',
            contemporary:'Had to compete at home from childhood, prove worth, become "the impressive one." After succeeding, realized the deepest drive was proving to a father who might never have truly cared about the result.'
        },
        '破军': {
            ancient:     'A reform or revolution failed, allies persecuted, escaped by chance. "We were right and still lost" became fuel for endless breaking.',
            modern:      'Experienced complete "reset" — war, political movement, family collapse. Everything familiar gone, only the choice to start over remained. That total destruction became the lightest starting point.',
            contemporary:'Changed many jobs, cities, people — not from irresponsibility, but an inner voice saying "this still isn\'t what I want." Uncertainty about self and dissatisfaction with the world is a double-edged sword.'
        }
    };

    // 优先：主星×时代（最精细，每颗主星独立描述）
    var starEraDataZH = (STAR_ERA_WOUNDS[mainStar] || {})[eraKey];
    var starEraDataEN = (STAR_ERA_WOUNDS_EN[mainStar] || {})[eraKey];
    // 降级：格局×时代（同格局的通用伤痕）
    var patternEraData = (ERA_WOUNDS[eraKey] || {})[patternType];
    
    var eraWound;
    if (lang === 'en') {
        eraWound = starEraDataEN || (lang === 'en' ? 'A life-changing event that transformed them through pain' : '经历过改变人生的重大事件，在伤痛中蜕变成型');
    } else {
        eraWound = starEraDataZH || patternEraData || '经历过改变人生的重大事件，在伤痛中蜕变成型';
    }

    // 补充主星层面的心理伤痕
    var starDetails = _getStarDescriptions(mainStar) || {};
    var starWound = starDetails.wound || '';

    if (lang === 'en') {
        return '**Era Wound:** ' + eraWound + '\n\n**Star Wound:** ' + starWound + '\n\n';
    }
    return '**时代伤痕：** ' + eraWound + '\n\n**星曜伤痕：** ' + starWound + '\n\n';
}

// ==================== 整合叙述模块（原版优势整合，多模块融合叙述）====================

/**
 * 根据主星、四化类型、格局类型确定人物弧光模式
 * @returns {string} - AUTHORITY | CONFLICT | INDEPENDENT | HARMONY | ARTISTIC | CALCULATING
 */
function _determineArcPattern(mainStar, sihuaType, patternType) {
    // 主星到弧光模式的映射
    var starToArcPattern = {
        // 帝王星系：权威型
        '紫微': 'AUTHORITY', '天府': 'AUTHORITY', '太阳': 'AUTHORITY',
        // 杀破狼：冲突型
        '七杀': 'CONFLICT', '破军': 'CONFLICT', '贪狼': 'CONFLICT', '廉贞': 'CONFLICT',
        // 机月同梁：独立型/和谐型
        '天机': 'INDEPENDENT', '太阴': 'ARTISTIC', '天同': 'HARMONY', '天梁': 'AUTHORITY',
        // 其他
        '巨门': 'CONFLICT', '天相': 'HARMONY', '武曲': 'CALCULATING'
    };
    
    // 四化类型对弧光的微调
    var sihuaModifier = {
        '化禄型': 0,   // 不变
        '化权型': 1,   // 倾向权威
        '化科型': 2,   // 倾向和谐
        '化忌型': 3    // 倾向冲突
    };
    
    // 格局类型对弧光的影响
    var patternBias = {
        '紫府廉武相': 'AUTHORITY',
        '杀破狼': 'CONFLICT',
        '机月同梁': 'HARMONY',
        '巨日': 'CONFLICT'
    };
    
    // 优先使用主星映射
    var pattern = starToArcPattern[mainStar] || 'HARMONY';
    
    // 如果格局类型与主星映射不一致，给予一定权重调整
    if (patternType && patternBias[patternType]) {
        // 50%概率使用格局类型
        if (Math.random() > 0.5) {
            pattern = patternBias[patternType];
        }
    }
    
    return pattern;
}

/**
 * 整合叙述：Want vs Need + 人物矛盾点（核心冲突模块）
 * 将欲望、需求、矛盾点融合为一段连贯叙述
 */
function _generateCoreConflictNarrative(patternType, mainStar, sihuaType, pronoun, lang) {
    lang = lang || (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    var arcPattern = _determineArcPattern(mainStar, sihuaType, patternType);
    
    var narratives = {
        AUTHORITY: {
            zh: `${pronoun}渴望掌控一切，却害怕失控。表面强势果断，内心却害怕被看穿脆弱。${pronoun}用高标准要求所有人，却在看到别人跌倒时第一个伸出援手——这种矛盾是${pronoun}最深的挣扎。${pronoun}真正需要学会的是信任与放手。`,
            'zh-TW': `${pronoun}渴望掌控一切，卻害怕失控。表面強勢果斷，內心卻害怕被看穿脆弱。${pronoun}用高標準要求所有人，卻在看到別人跌倒時第一個伸出援手——這種矛盾是${pronoun}最深的掙扎。${pronoun}真正需要學會的是信任與放手。`,
            en: `${pronoun} craves control yet fears losing it. Outwardly decisive and strong, inwardly terrified of being seen as vulnerable. ${pronoun} holds everyone to exacting standards, yet is the first to help when someone falls—this contradiction is ${pronoun}s deepest struggle. What ${pronoun} truly needs to learn is trust and letting go.`
        },
        CONFLICT: {
            zh: `${pronoun}追求刺激和自由，却比谁都渴望一个稳定的港湾。表面上狂放不羁，宣称不需要任何人，却在关键时刻冲在最前面保护别人。${pronoun}的矛盾在于：害怕束缚，却给自己定下了最严苛的规则——绝不让身边的人受伤。`,
            'zh-TW': `${pronoun}追求刺激和自由，卻比誰都渴望一個穩定的港灣。表面上狂放不羈，宣稱不需要任何人，卻在關鍵時刻衝在最前面保護別人。${pronoun}的矛盾在於：害怕束縛，卻給自己定下了最嚴苛的規則——絕不讓身邊的人受傷。`,
            en: `${pronoun} chases thrills and freedom, yet yearns for a stable harbor more than anyone. Outwardly wild, claiming to need no one, yet always first to protect others in crisis. ${pronoun}s contradiction: fearing束缚 yet imposing the strictest rule on ${pronoun}self—never let anyone around ${pronoun} get hurt.`
        },
        INDEPENDENT: {
            zh: `${pronoun}把自己活成孤岛，却比谁都渴望被理解。${pronoun}极力避免与人建立连接，所有作品和言行都在向世界发出"懂我吗"的信号，但真正靠近时，${pronoun}又本能地后退。${pronoun}用独立来防御世界，内心深处却留着一个"如果"的空间。`,
            'zh-TW': `${pronoun}把自己活成孤島，卻比誰都渴望被理解。${pronoun}極力避免與人建立連接，所有作品和言行都在向世界發出「懂我嗎」的信號，但真正靠近時，${pronoun}又本能地後退。${pronoun}用獨立來防禦世界，內心深處卻留著一個「如果」的空間。`,
            en: `${pronoun} lives like an island, yet yearns to be understood more than anyone. ${pronoun} avoids connection, every work and word asking "do you understand me?"—yet when someone truly approaches, ${pronoun} instinctively pulls back. ${pronoun} uses independence as defense, yet deep inside keeps a space for "what if."`
        },
        HARMONY: {
            zh: `${pronoun}极力讨好所有人，内心深处却觉得自己是"冒牌货"。每个人都觉得${pronoun}人很好，但那个"好"字背后藏着太多委屈。${pronoun}总是"没关系""都行""听你的"，深夜却反复咀嚼那些没说出口的"我想要"。`,
            'zh-TW': `${pronoun}極力討好所有人，內心深處卻覺得自己是「冒牌貨」。每個人都覺得${pronoun}人很好，但那個「好」字背後藏著太多委屈。${pronoun}總是「沒關係」「都行」「聽你的」，深夜卻反覆咀嚼那些沒說出口的「我想要」。`,
            en: `${pronoun} tries to please everyone, yet feels like an impostor deep down. Everyone thinks ${pronoun} is "nice," but behind that word hides too much grievance. ${pronoun} always says "it's fine," "whatever works," "up to you"—yet late at night replays all the unspoken "I want"s.`
        },
        ARTISTIC: {
            zh: `${pronoun}情感丰富得像大海，却在面对真实的人时变得笨拙沉默。${pronoun}渴望自由表达，却害怕被误解。作品大胆热烈，但每次发布后都紧张地等待反馈——不是期待赞美，而是害怕被说"想太多了"。`,
            'zh-TW': `${pronoun}情感豐富得像大海，卻在面對真實的人時變得笨拙沉默。${pronoun}渴望自由表達，卻害怕被誤解。作品大膽熱烈，但每次發布後都緊張地等待反饋——不是期待讚美，而是害怕被說「想太多了」。`,
            en: `${pronoun} feels with the depth of an ocean, yet grows clumsy and silent with real people. ${pronoun} craves free expression yet fears being misunderstood. Work bold and passionate, yet after each release nervously awaits response—not hoping for praise, but dreading being told "${pronoun} thinks too much."`
        },
        CALCULATING: {
            zh: `${pronoun}用算计保护自己，内心深处却渴望真诚。${pronoun}说"没有人值得信任"，深夜却反复问自己：如果真的有一个人，我敢不敢放下算计？${pronoun}追求利益最大化，某些原则问题上却寸步不让。`,
            'zh-TW': `${pronoun}用算計保護自己，內心深處卻渴望真誠。${pronoun}說「沒有人值得信任」，深夜卻反覆問自己：如果真的有一個人，我敢不敢放下算計？${pronoun}追求利益最大化，某些原則問題上卻寸步不讓。`,
            en: `${pronoun} protects ${pronoun}self through calculation, yet craves sincerity deep inside. ${pronoun} says "no one is worth trusting," yet late at night asks: if there really were someone, would I dare to stop calculating? ${pronoun} maximizes gain, yet on certain principles never yields an inch.`
        }
    };
    
    return (narratives[arcPattern] && narratives[arcPattern][lang]) || narratives['CONFLICT'][lang];
}

/**
 * 整合叙述：标志性细节（4条列表，直接可用）
 * 增加随机性，避免每次生成都一样
 */
function _generateSignatureNarrative(mainStar, patternType, lang) {
    lang = lang || (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');
    var arcPattern = _determineArcPattern(mainStar, '', patternType);
    
    // 每种模式有多组可选的标志性细节
    var allSignatures = {
        AUTHORITY: {
            zh: [
                ['做决定前习惯性敲击桌面', '永远提前15分钟到达', '笔记本用三色标注等级', '睡前必检查一遍工作'],
                ['说话时直视对方眼睛', '从不打断别人发言', '办公桌永远整洁', '会议中必做详细记录'],
                ['随身带着钢笔和怀表', '站立时双手背在身后', '对时间有着近乎偏执的把控', '手机从不离手']
            ],
            'zh-TW': [
                ['做決定前習慣性敲擊桌面', '永遠提前15分鐘到達', '筆記本用三色標註等級', '睡前必檢查一遍工作'],
                ['說話時直視對方眼睛', '從不打斷別人發言', '辦公桌永遠整潔', '會議中必做詳細記錄']
            ],
            en: [
                ['Taps desk rhythmically before decisions', 'Always 15 minutes early', 'Three-color notebook priority system', 'Reviews work before sleep'],
                ['Maintains direct eye contact', 'Never interrupts others', 'Desk always pristine', 'Takes detailed meeting notes']
            ]
        },
        CONFLICT: {
            zh: [
                ['愤怒时会捏碎纸杯', '手机永远静音', '颈链挂着铜币护身符', '说话前轻笑一声'],
                ['走路带风从不让路', '深夜独自训练', '对别人的恭维嗤之以鼻', '桌上有明显的磨损痕迹'],
                ['从不系领带第一颗扣', '说话时身体微微前倾', '眼神总是带着审视', '休息时喜欢盯着窗外']
            ],
            'zh-TW': [
                ['憤怒時會捏碎紙杯', '手機永遠靜音', '頸鏈掛著銅幣護身符', '說話前輕笑一聲']
            ],
            en: [
                ['Crushes paper cups when angry', 'Phone always silent', 'Wears copper coin talisman', 'Light laugh before speaking'],
                ['Never yields when walking', 'Trains alone at night', 'Scoffs at flattery', 'Desk shows heavy use']
            ]
        },
        INDEPENDENT: {
            zh: [
                ['走路总戴着耳机', '随身带着旧书', '只用文字不用语音', '每天同一咖啡馆同一位置'],
                ['习惯坐在角落', '从不参加集体活动', '手机壁纸是黑色', '房间里有未完成的手工'],
                ['说话语速很快', '眼睛很少与人对视', '包里永远有一支画笔', '午休时独自散步']
            ],
            'zh-TW': [
                ['走路總戴著耳機', '隨身帶著舊書', '只用文字不用語音', '每天同一咖啡館同一位置']
            ],
            en: [
                ['Always wears headphones walking', 'Carries an old book', 'Text only, no voice', 'Same café, same spot, daily'],
                ['Always sits in corners', 'Never joins group activities', 'Black phone wallpaper', 'Unfinished crafts in room']
            ]
        },
        HARMONY: {
            zh: [
                ['对谁都用礼貌用语', '包里永远备着糖果', '说话前先笑', '记住每个人的细节'],
                ['从不当面拒绝别人', '总是最后一个离开', '习惯性地整理别人的东西', '对每个人都记得说谢谢'],
                ['说话声音永远不大', '被问到意见时总会犹豫', '手机里存满了提醒', '走路习惯走人群边缘']
            ],
            'zh-TW': [
                ['對誰都用禮貌用語', '包裡永遠備著糖果', '說話前先笑', '記住每個人的細節']
            ],
            en: [
                ['Polite language with everyone', 'Always carries candy', 'Smiles before speaking', 'Remembers everyone\'s details'],
                ['Never refuses directly', 'Last to leave always', 'Tidies others\' things habitually', 'Thanks everyone for everything']
            ]
        },
        ARTISTIC: {
            zh: [
                ['随身带速写本', '手腕戴着彩色手环', '看到美就拍照', '说话爱用比喻'],
                ['房间墙上贴满灵感', '走路时总在看天', '对颜色有着独特敏感', '从不按常理回答问题'],
                ['习惯性地抚摸随身物件', '眼睛总是追随着光影', '说话时手在空中比划', '休息时在哼着小调']
            ],
            'zh-TW': [
                ['隨身帶速寫本', '手腕戴著彩色手環', '看到美就拍照', '說話愛用比喻']
            ],
            en: [
                ['Carries sketchbook everywhere', 'Colorful bracelets on wrist', 'Photographs beauty anywhere', 'Speaks in metaphors'],
                ['Walls covered in inspiration', 'Always looking at the sky', 'Unique color sensitivity', 'Answers questions unconventionally']
            ]
        },
        CALCULATING: {
            zh: [
                ['见面先环视周围', '不轻易透露自己信息', '笔记本记录别人弱点', '喝东西前先观察对方'],
                ['从不第一个表态', '手机永远放在视线内', '说话总是留有余地', '对数字异常敏感'],
                ['习惯性地核实每个人的话', '办公室里有大白板', '从不留下书面把柄', '每句话都有多层含义']
            ],
            'zh-TW': [
                ['見面先環視周圍', '不輕易透露自己信息', '筆記本記錄別人弱點', '喝東西前先觀察對方']
            ],
            en: [
                ['Scans room on arrival', 'Reveals nothing about self', 'Notebook of others\' weaknesses', 'Observes before drinking'],
                ['Never expresses first', 'Phone always in sight', 'Leaves room in statements', 'Unusually sensitive to numbers']
            ]
        }
    };
    
    // 获取对应语言的签名组
    var signatures = allSignatures[arcPattern] || allSignatures.HARMONY;
    var langSigs = signatures[lang] || signatures['zh'];
    
    // 随机选择一组
    var selectedSigs = langSigs[Math.floor(Math.random() * langSigs.length)];
    
    return selectedSigs.map(function(item) { return '- ' + item; }).join('\n');
}

/**
 * 整合叙述：人物弧光（增强版，起点→转折→终点完整叙述）
 */
function _generateArcNarrative(mainStar, sihuaType, patternType, pronoun, lang) {
    return _generateEnhancedArc(mainStar, sihuaType, patternType, pronoun, lang);
}

/**
 * 生成增强版人物弧光叙述
 * 起点 → 转折 → 终点 完整叙述
 */
function _generateEnhancedArc(mainStar, sihuaType, patternType, pronoun, lang) {
    lang = lang || 'zh';
    pronoun = pronoun || '他';
    
    // 获取弧光模式
    var arcPattern = _determineArcPattern(mainStar, sihuaType, patternType);
    
    // 弧光叙述模板
    var arcTemplates = {
        AUTHORITY: {
            zh: {
                start: pronoun + '从小就被寄予厚望，家族的光环既是荣耀也是枷锁。',
                turning: '一场突如其来的变故让' + pronoun + '明白，真正的权威不是来自位置，而是来自担当。',
                end: pronoun + '最终学会了在强者的外壳下保留一颗柔软的心，成为一个既能让追随者安心依靠、又能与挚爱平等对话的人。'
            },
            'zh-TW': {
                start: pronoun + '從小就被寄予厚望，家族的光環既是榮耀也是枷鎖。',
                turning: '一場突如其來的變故讓' + pronoun + '明白，真正的權威不是來自位置，而是來自擔當。',
                end: pronoun + '最終學會了在強者的外殼下保留一顆柔軟的心，成為一個既能讓追隨者安心依靠、又能與摯愛平等對話的人。'
            },
            en: {
                start: pronoun + ' was burdened with great expectations from childhood—family legacy was both honor and shackle.',
                turning: 'A sudden upheaval taught ' + pronoun + ' that true authority comes not from position but from responsibility.',
                end: pronoun + ' ultimately learned to keep a soft heart beneath a strong shell, becoming someone followers can rely on while relating to loved ones as equals.'
            }
        },
        CONFLICT: {
            zh: {
                start: pronoun + '的起点充满动荡，命运仿佛在试探' + pronoun + '的极限。',
                turning: '一场危机让' + pronoun + '意识到，不断破坏和重建并非唯一的生存方式。',
                end: pronoun + '最终找到了一种动态平衡：在变革中保持定力，在冲突中学会守护。'
            },
            'zh-TW': {
                start: pronoun + '的起點充滿動盪，命運彷彿在試探' + pronoun + '的極限。',
                turning: '一場危機讓' + pronoun + '意識到，不斷破壞和重建並非唯一的生存方式。',
                end: pronoun + '最終找到了一種動態平衡：在變革中保持定力，在衝突中學會守護。'
            },
            en: {
                start: pronoun + ' began in turbulence, fate testing ' + pronoun + 's limits.',
                turning: 'A crisis made ' + pronoun + ' realize that endless destruction and rebuilding is not the only way to survive.',
                end: pronoun + ' ultimately found dynamic balance: maintaining composure amid change, learning to protect amid conflict.'
            }
        },
        INDEPENDENT: {
            zh: {
                start: pronoun + '很早就学会了独自面对世界，把情感需求藏在最深的地方。',
                turning: '一次意外让' + pronoun + '不得不依赖他人，这让' + pronoun + '第一次正视自己内心的渴望。',
                end: pronoun + '最终学会了在保持独立的同时，接受他人的温暖——孤岛与大陆之间，原来可以有桥梁。'
            },
            'zh-TW': {
                start: pronoun + '很早就學會了獨自面對世界，把情感需求藏在最深的地方。',
                turning: '一次意外讓' + pronoun + '不得不依賴他人，這讓' + pronoun + '第一次正視自己內心的渴望。',
                end: pronoun + '最終學會了在保持獨立的同時，接受他人的溫暖——孤島與大陸之間，原來可以有橋樑。'
            },
            en: {
                start: pronoun + ' learned early to face the world alone, hiding emotional needs in the deepest places.',
                turning: 'An unexpected event forced ' + pronoun + ' to rely on others, facing inner desires for the first time.',
                end: pronoun + ' ultimately learned to accept others\' warmth while maintaining independence—between island and continent, bridges can exist.'
            }
        },
        HARMONY: {
            zh: {
                start: pronoun + '从小就是那个"好孩子"，习惯了把别人的需求放在自己前面。',
                turning: '一次抉择让' + pronoun + '发现，讨好所有人意味着背叛自己。',
                end: pronoun + '最终学会了在保持善良的同时说出自己的"我想要"——真正的和谐，是各方都能被看见。'
            },
            'zh-TW': {
                start: pronoun + '從小就是那個「好孩子」，習慣了把別人的需求放在自己前面。',
                turning: '一次抉擇讓' + pronoun + '發現，討好所有人意味著背叛自己。',
                end: pronoun + '最終學會了在保持善良的同時說出自己的「我想要」——真正的和諧，是各方都能被看見。'
            },
            en: {
                start: pronoun + ' was always the "good child," accustomed to putting others\' needs before ' + pronoun + 's own.',
                turning: 'A choice made ' + pronoun + ' realize that pleasing everyone means betraying oneself.',
                end: pronoun + ' ultimately learned to say "I want" while staying kind—true harmony means everyone is seen.'
            }
        },
        ARTISTIC: {
            zh: {
                start: pronoun + '的内心世界远比外在丰富，常常沉浸在自己的想象中。',
                turning: '一次挫折让' + pronoun + '发现，艺术不仅是逃避，更是连接。',
                end: pronoun + '最终学会了用自己的方式与世界对话——敏感不再是负担，而是独特的馈赠。'
            },
            'zh-TW': {
                start: pronoun + '的內心世界遠比外在豐富，常常沉浸在自己的想像中。',
                turning: '一次挫折讓' + pronoun + '發現，藝術不僅是逃避，更是連接。',
                end: pronoun + '最終學會了用自己的方式與世界對話——敏感不再是負擔，而是獨特的饋贈。'
            },
            en: {
                start: pronoun + ' had a far richer inner world than outer, often immersed in imagination.',
                turning: 'A setback made ' + pronoun + ' discover that art is not escape, but connection.',
                end: pronoun + ' ultimately learned to dialogue with the world in ' + pronoun + 's own way—sensitivity is no longer burden, but unique gift.'
            }
        },
        CALCULATING: {
            zh: {
                start: pronoun + '从小就在算计中生存，习惯了未雨绸缪、步步为营。',
                turning: '一场意外让' + pronoun + '发现，最精密的计划也会被情感打乱。',
                end: pronoun + '最终学会了在理性与情感之间找到平衡——算计可以有，但不能算尽人心。'
            },
            'zh-TW': {
                start: pronoun + '從小就在算計中生存，習慣了未雨綢繆、步步為營。',
                turning: '一場意外讓' + pronoun + '發現，最精密的計畫也會被情感打亂。',
                end: pronoun + '最終學會了在理性與情感之間找到平衡——算計可以有，但不能算盡人心。'
            },
            en: {
                start: pronoun + ' survived by calculation from childhood, accustomed to planning ahead.',
                turning: 'An accident made ' + pronoun + ' discover that the most precise plans can be disrupted by emotion.',
                end: pronoun + ' ultimately learned balance between reason and emotion—calculation is fine, but one cannot calculate the human heart away.'
            }
        }
    };
    
    // 获取对应语言的模板
    var templates = arcTemplates[arcPattern] || arcTemplates.HARMONY;
    var t = templates[lang] || templates['zh'];
    
    // 组合成完整弧光
    return '**起点：** ' + t.start + '\n\n**转折：** ' + t.turning + '\n\n**终点：** ' + t.end;
}

// 导出整合叙述函数
if (typeof window !== 'undefined') {
    window._generateCoreConflictNarrative = _generateCoreConflictNarrative;
    window._generateSignatureNarrative = _generateSignatureNarrative;
    window._generateArcNarrative = _generateArcNarrative;
}

// ==================== 核心生成函数：8模块 2400字+ ====================
/**
 * generateZiweiCharacterBio
 * @param {object} userData   - { name, gender, era, age, profession, family, socialClass, parents, siblings }
 * @param {object} chart      - { stars:[], type:'杀破狼', name:'七杀独坐', desc:'...', mainStar }
 * @param {object} attributes - 8维度属性 { appearance, speech, behavior, emotion, social, crisis, learning, growth }
 * @param {string} sihuaType  - '化禄型' / '化权型' / '化科型' / '化忌型'
 */
function generateZiweiCharacterBio(userData, chart, attributes, sihuaType) {
    if (!userData) userData = {};
    if (!chart)    chart    = {};
    if (!attributes) attributes = {};
    if (!sihuaType) sihuaType = '化禄型';

    // ── 三语言标签字典（所有硬编码字符串从此处取）──
    // 首先从window对象获取当前语言，如果不存在则使用默认值
    var _lang = (typeof window !== 'undefined' && window.CURRENT_LANG) || 
                (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG) || 
                'zh';
    
    // DEBUG: 输出语言信息（生产环境注释掉）
    if (typeof console !== 'undefined' && console.log) {
        console.log('[ziwei-bio-core] Language debug:');
        console.log('  window.CURRENT_LANG:', typeof window !== 'undefined' ? window.CURRENT_LANG : 'window undefined');
        console.log('  CURRENT_LANG:', typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'undefined');
        console.log('  _lang determined:', _lang);
    }
    
    // 标点符号：中文/繁体用全角冒号，英文用冒号空格
    var _col  = _lang === 'en' ? ': '  : '：';   // 行内冒号
    var _bold_field = function(label) {           // 字段组合：**Label：** 或 **Label:** 
        return _lang === 'en' ? ('**' + label + ':** ') : ('**' + label + '：** ');
    };
    var _T = {
        zh: {
            bioHeader: '人物小传',
            s1: '一、基本信息', s2: '二、性格特点', s3: '三、背景故事',
            s4: '四、人物关系', s5: '五、在故事中的作用',
            sQuotes: '角色语录', sOpenings: '故事开端建议',
            quotesNote: '以下语录凝练自命盘特质，可直接用于剧本台词',
            openingPlan: '方案',
            fName:_lang === 'en' ? 'Name' : (_lang === 'zh-TW' ? '姓名' : '姓名'),
            fAge:_lang === 'en' ? 'Age' : (_lang === 'zh-TW' ? '年齡' : '年龄'),
            fGender:_lang === 'en' ? 'Gender' : (_lang === 'zh-TW' ? '性別' : '性别'),
            fEra:_lang === 'en' ? 'Era' : (_lang === 'zh-TW' ? '時代' : '时代'),
            fProf:_lang === 'en' ? 'Identity' : (_lang === 'zh-TW' ? '身份' : '身份'),
            fAppear:_lang === 'en' ? 'Appearance' : (_lang === 'zh-TW' ? '外貌' : '外貌'),
            fSign:_lang === 'en' ? 'Signature Detail' : (_lang === 'zh-TW' ? '標誌性細節' : '标志性细节'),
            fLifeStage:_lang === 'en' ? 'Life Stage' : (_lang === 'zh-TW' ? '人生階段' : '人生阶段'),
            fStatus:_lang === 'en' ? 'Current Situation' : (_lang === 'zh-TW' ? '當前處境' : '当前处境'),
            fNow:_lang === 'en' ? 'Current State' : (_lang === 'zh-TW' ? '此刻狀態' : '此刻状态'),
            fNowDetail:_lang === 'en' ? 'Now' : (_lang === 'zh-TW' ? '此刻' : '此刻'),
            fChart:_lang === 'en' ? 'Chart Pattern' : (_lang === 'zh-TW' ? '命盤格局' : '命盘格局'),
            fDriveType:_lang === 'en' ? 'Character Type' : (_lang === 'zh-TW' ? '人物類型' : '人物类型'),
            fChartHint:_lang === 'en' ? 'Chart Type Hint' : (_lang === 'zh-TW' ? '命盤類型提示' : '命盘类型提示'),
            fPersonality:_lang === 'en' ? 'Personality' : (_lang === 'zh-TW' ? '主要性格' : '主要性格'),
            fBehavior:_lang === 'en' ? 'Behavior' : (_lang === 'zh-TW' ? '行為特徵' : '行为特征'),
            fSpeech:_lang === 'en' ? 'Speech Style' : (_lang === 'zh-TW' ? '語言特點' : '语言特点'),
            fEmotion:_lang === 'en' ? 'Emotional Expression' : (_lang === 'zh-TW' ? '情感表達' : '情感表达'),
            fDrive:_lang === 'en' ? 'Core Drive' : (_lang === 'zh-TW' ? '核心驅動' : '核心驱动'),
            fHiddenNeed:_lang === 'en' ? 'Hidden Need' : (_lang === 'zh-TW' ? '隱性需求' : '隐性需求'),
            fFlaw:_lang === 'en' ? 'Fatal Flaw' : (_lang === 'zh-TW' ? '致命弱點' : '致命弱点'),
            fCrisis:_lang === 'en' ? 'Crisis Response' : (_lang === 'zh-TW' ? '遇到危機' : '遇到危机'),
            fPositive:_lang === 'en' ? 'Positive Traits' : (_lang === 'zh-TW' ? '正向特質' : '正向特质'),
            fShadow:_lang === 'en' ? 'Shadow Side' : (_lang === 'zh-TW' ? '陰影面' : '阴影面'),
            fParadox:_lang === 'en' ? 'Paradox' : (_lang === 'zh-TW' ? '人物矛盾點' : '人物矛盾点'),
            fFamily:_lang === 'en' ? 'Family Background' : (_lang === 'zh-TW' ? '家庭背景' : '家庭背景'),
            fTrauma:_lang === 'en' ? 'Growth Trauma' : (_lang === 'zh-TW' ? '成長創傷' : '成长创伤'),
            fWound:_lang === 'en' ? 'Inner Tinge' : (_lang === 'zh-TW' ? '內心底色' : '内心底色'),
            fDaxian:_lang === 'en' ? 'Life Junctures' : (_lang === 'zh-TW' ? '人生節點（大限推演）' : '人生节点（大限推演）'),
            fKeState:_lang === 'en' ? 'Birth Hour Ke Impact' : (_lang === 'zh-TW' ? '出生時辰刻度影響' : '出生时辰刻度影响'),
            fRelation:_lang === 'en' ? 'Relationship Pattern' : (_lang === 'zh-TW' ? '親密關係模式' : '亲密关系模式'),
            fPartner:_lang === 'en' ? 'Ideal Partner' : (_lang === 'zh-TW' ? '理想伴侶' : '理想伴侣'),
            fProjection:_lang === 'en' ? 'Relationship Projection' : (_lang === 'zh-TW' ? '感情投影' : '感情投影'),
            fSocial:_lang === 'en' ? 'Social Style' : (_lang === 'zh-TW' ? '社交風格' : '社交风格'),
            fConflict:_lang === 'en' ? 'Relationship Conflict' : (_lang === 'zh-TW' ? '關係衝突' : '关系冲突'),
            fTension:_lang === 'en' ? 'Chart Tension' : (_lang === 'zh-TW' ? '三方四正張力' : '三方四正张力'),
            fFlyJi:'命宫飞星执念', fCurrentRel:'流年关系状态',
            fFunction:'功能定位', fPlot:'情节推动', fTheme:'主题表达',
            fRival:'与对手的张力', fLearning:'成长模式', fArc:'人物弧光',
            arcStart:'起点', arcConflict:'核心矛盾', arcTurn:'转折', arcEnd:'终点',
            genderM:'男', genderF:'女', genderSuffix:'性',
            pronounM:'他', pronounF:'她',
            era:{ancient:'古代', modern:'近代', contemporary:'现代'},
            age:{youth:'青年（18-30岁）', middle:'中年（30-50岁）', senior:'老年（50岁以上）'},
            tbd:'待定',
            attachLabel:'依恋类型',
            daxianEra:{ancient:'乱世', modern:'动荡年代', contemporary:'当代'},
            arcWith:'的内驱方式活着',
            arcLock:'是${p}深信不疑的生存法则，也是最大的枷锁',
        },
        'zh-TW': {
            bioHeader: '人物小傳',
            s1: '一、基本資訊', s2: '二、性格特點', s3: '三、背景故事',
            s4: '四、人物關係', s5: '五、在故事中的作用',
            sQuotes: '角色語錄', sOpenings: '故事開端建議',
            quotesNote: '以下語錄凝練自命盤特質，可直接用於劇本臺詞',
            openingPlan: '方案',
            fName:'姓名', fAge:'年齡', fGender:'性別', fEra:'時代', fProf:'身份', fAppear:'外貌',
            fSign:'標誌性細節', fLifeStage:'人生階段', fStatus:'當前處境', fNow:'此刻狀態',
            fNowDetail:'此刻', fChart:'命盤格局', fDriveType:'人物類型', fChartHint:'命盤類型提示',
            fPersonality:'主要性格', fBehavior:'行為特徵', fSpeech:'語言特點', fEmotion:'情感表達',
            fDrive:'核心驅動', fHiddenNeed:'隱性需求', fFlaw:'致命弱點', fCrisis:'遇到危機',
            fPositive:'正向特質', fShadow:'陰影面', fParadox:'人物矛盾點',
            fFamily:'家庭背景', fTrauma:'成長創傷', fWound:'內心底色', fDaxian:'人生節點（大限推演）',
            fKeState:'出生時辰刻度影響',
            fRelation:'親密關係模式', fPartner:'理想伴侶', fProjection:'感情投影',
            fSocial:'社交風格', fConflict:'關係衝突', fTension:'三方四正張力',
            fFlyJi:'命宮飛星執念', fCurrentRel:'流年關係狀態',
            fFunction:'功能定位', fPlot:'情節推動', fTheme:'主題表達',
            fRival:'與對手的張力', fLearning:'成長模式', fArc:'人物弧光',
            arcStart:'起點', arcConflict:'核心矛盾', arcTurn:'轉折', arcEnd:'終點',
            genderM:'男', genderF:'女', genderSuffix:'性',
            pronounM:'他', pronounF:'她',
            era:{ancient:'古代', modern:'近代', contemporary:'現代'},
            age:{youth:'青年（18-30歲）', middle:'中年（30-50歲）', senior:'老年（50歲以上）'},
            tbd:'待定',
            attachLabel:'依戀類型',
            daxianEra:{ancient:'亂世', modern:'動盪年代', contemporary:'當代'},
            arcWith:'的內驅方式活著',
            arcLock:'是${p}深信不疑的生存法則，也是最大的枷鎖',
        },
        en: {
            bioHeader: 'Character Bio',
            s1: 'I. Basic Profile', s2: 'II. Personality', s3: 'III. Background',
            s4: 'IV. Relationships', s5: 'V. Narrative Role',
            sQuotes: 'Character Voice', sOpenings: 'Story Opening Suggestions',
            quotesNote: 'The following lines distil this chart\'s core traits — ready for dialogue',
            openingPlan: 'Option',
            fName:'Name', fAge:'Age', fGender:'Gender', fEra:'Era', fProf:'Role', fAppear:'Appearance',
            fSign:'Signature Detail', fLifeStage:'Life Stage', fStatus:'Current Situation', fNow:'Present State',
            fNowDetail:'At this moment', fChart:'Chart Pattern', fDriveType:'Character Type', fChartHint:'Chart Type Hint',
            fPersonality:'Core Personality', fBehavior:'Behavioural Traits', fSpeech:'Communication Style', fEmotion:'Emotional Expression',
            fDrive:'Core Drive', fHiddenNeed:'Hidden Need', fFlaw:'Fatal Flaw', fCrisis:'Under Pressure',
            fPositive:'Strengths', fShadow:'Shadow Side', fParadox:'Internal Paradox',
            fFamily:'Family Background', fTrauma:'Formative Wound', fWound:'Inner Colour', fDaxian:'Life Milestones (Daxian)',
            fKeState:'Birth Hour Influence',
            fRelation:'Relationship Pattern', fPartner:'Ideal Partner', fProjection:'Romantic Projection',
            fSocial:'Social Style', fConflict:'Conflict Mode', fTension:'Three-Direction Tension',
            fFlyJi:'Flying-Star Fixation', fCurrentRel:'Current Year Relationship',
            fFunction:'Narrative Function', fPlot:'Plot Driver', fTheme:'Thematic Expression',
            fRival:'Tension with Antagonist', fLearning:'Growth Mode', fArc:'Character Arc',
            arcStart:'Starting Point', arcConflict:'Core Conflict', arcTurn:'Turning Point', arcEnd:'End State',
            genderM:'Male', genderF:'Female', genderSuffix:'',
            pronounM:'he', pronounF:'she',
            era:{ancient:'Ancient Era', modern:'Modern Era', contemporary:'Contemporary'},
            age:{youth:'Young Adult (18–30)', middle:'Middle-Aged (30–50)', senior:'Senior (50+)'},
            tbd:'TBD',
            attachLabel:'Attachment Style',
            daxianEra:{ancient:'in a dynastic upheaval', modern:'in a turbulent modern era', contemporary:'in today\'s overloaded world'},
            arcWith:'\'s inner drive shaping every choice',
            arcLock:'is the survival rule ${p} lives by — and the very cage that traps them',
        }
    };
    var T = _T[_lang] || _T['zh'];

    // ══════════════════════════════════════════════════════════════
    // 骨架→肉通道：提取 ChartBridge 生成的创作参数（_creativeParams）
    // 若存在则优先使用真实命盘数据，否则回退旧逻辑
    // ══════════════════════════════════════════════════════════════
    var cp = chart._creativeParams || null;  // ChartBridge 输出的编创参数

    // ── 驱动力数据（来自 app-v2.js 传入的完整 driveData 对象）──
    // driveData 含：label / desc / coreConflict / wound / starHint
    var driveData   = userData.driveData || null;
    var driveLabel  = userData.driveLabel || '';
    var driveCoreConflict = (driveData && driveData.coreConflict) || '';
    var driveWound        = (driveData && driveData.wound)        || '';
    var driveStarHint     = (driveData && driveData.starHint)     || '';
    // PERSONALITY_8_TYPES 里有更丰富的子类型描述（visibleTrait / hiddenNeed / lifePattern）
    var p8type = _getPersonalityType(sihuaType) || null;

    var name        = userData.name || (_lang === 'en' ? 'Character' : _lang === 'zh-TW' ? '角色' : '角色');
    var genderRaw   = userData.gender || 'male';
    var isFemale    = (genderRaw === 'female' || genderRaw === '女');
    var genderCN    = isFemale ? T.genderF : T.genderM;
    var pronoun     = isFemale ? T.pronounF : T.pronounM;
    var eraRaw      = userData.era || (cp && cp.era) || 'contemporary';
    var eraCN       = T.era[eraRaw] || eraRaw;
    var ageRaw      = userData.age || 'youth';
    var ageCN       = T.age[ageRaw] || ageRaw;
    var profRaw     = userData.profession || 'other';
    var profLabel   = _getProfessionLabel(profRaw);

    // ── 家庭背景字段（步骤2输入）──
    var familyRaw      = userData.family      || '';
    var socialClassRaw = userData.socialClass || '';
    var parentsRaw     = userData.parents     || '';
    var siblingsRaw    = userData.siblings    || '';

    // ── 主星：优先使用真实命宫主星（cp.mingMainStar），回退旧字段 ──
    var mainStar    = (cp && cp.mingMainStar) || (chart.stars && chart.stars[0]) || chart.mainStar || '紫微';
    // ── 福德宫主星（真实防御机制来源）──
    var fudeMainStar  = (cp && cp.fudeMainStar)  || mainStar;
    // ── 夫妻宫主星（真实依恋类型来源）──
    var fuqiMainStar  = (cp && cp.fuqiMainStar)  || mainStar;
    var patternType = (cp && cp.patternType) || chart.type  || '杀破狼';
    var patternName = chart.name  || patternType;
    var patternDesc = chart.desc  || '';

    // ── 四化类型：优先从真实命盘飞星提取 ──
    if (cp && cp.sihuaType) sihuaType = cp.sihuaType;

    // ── 流年流时：差异化随机种子 ──
    var gz = _getCurrentTimeGanzhi();
    var starStateList = SHI_STAR_STATE[mainStar] || ['此刻气机平稳，按照自己的节奏运转'];
    // 根据性别替换代词；古代/近代角色不显示当代干支时辰
    var curStateRaw   = starStateList[gz.seed % starStateList.length];
    var curState      = curStateRaw.replace(/他/g, pronoun).replace(/她/g, pronoun);

    // ── 叙事化处理所有用户输入字段 ──
    var narrateAge_text    = _narrateAge(ageRaw, eraRaw, patternType, genderCN);
    // ── 5个基础信息字段：全部接入命盘宫位星曜，做真正的紫微推理 ──
    var narrateProf_text    = _narrateProfession(profRaw, eraRaw, mainStar, chart);
    var narrateFamily_text  = familyRaw      ? _narrateFamily(familyRaw, eraRaw, mainStar, chart)           : '';
    var narrateSocCl_text   = socialClassRaw ? _narrateSocialClass(socialClassRaw, profRaw, mainStar, chart) : '';
    var narrateParents_text = parentsRaw     ? _narrateParents(parentsRaw, mainStar, chart)                  : '';
    var narrateSiblings_text= siblingsRaw    ? _narrateSiblings(siblingsRaw, mainStar, chart)                : '';

    // 8属性：有选则用精准叙事，未选则由主星性格推导模糊描述（软处理，不留空）
    var speech_text   = _narrateSpeech(attributes.speech || null, mainStar, chart);
    var behavior_text = _narrateBehavior(attributes.behavior || null, mainStar, chart);
    var emotion_text  = _narrateEmotion(attributes.emotion || null, mainStar, genderCN, chart);
    var social_text   = _narrateSocial(attributes.social || null, mainStar, chart);
    var crisis_text   = _narrateCrisis(attributes.crisis || null, mainStar, sihuaType, chart);
    var learning_text = _narrateLearning(attributes.learning || null, mainStar, chart);
    var growth_text   = _narrateGrowth(attributes.growth || null, mainStar, sihuaType, chart);

    // 从现有数据库取格局数据
    var patternData = (window.CHART_DATABASE && window.CHART_DATABASE[patternType]) || {
        traits: { 
            positive: ['勇敢', '果断', '开创'], 
            positiveEN: ['Brave', 'Decisive', 'Pioneering'],
            negative: ['冲动', '急躁'], 
            negativeEN: ['Impulsive', 'Hasty'],
            psychology: '追求突破' 
        }
    };
    var sihuaKey  = sihuaType.replace('型', '');
    var sihuaData = (window.SIHUA_TYPES && window.SIHUA_TYPES[sihuaType]) ||
                    (window.SIHUA_TYPES && window.SIHUA_TYPES[sihuaKey])  || {
        desc: _lang === 'en' ? 'Unique psychological traits' : '独特的心理特质', 
        mingEffect: _lang === 'en' ? 'Unique expression in Life Palace' : '在命宫有独特表现',
        fudeEffect: _lang === 'en' ? 'Rich inner world' : '内心世界丰富', 
        fuqiEffect: _lang === 'en' ? 'Unique relationship pattern' : '感情模式独特',
        traits: ['深刻', '独特']
    };
    var cpData = (window.CP_PREFERENCE_RULES && window.CP_PREFERENCE_RULES[patternType]) || {
        idealPartner: _lang === 'en' ? 'A partner who understands them' : '能理解自己的伴侣', 
        conflict: _lang === 'en' ? 'Tension with opposites' : '容易与性格极端相反的人产生张力',
        chemistry: _lang === 'en' ? 'Strong resonance with like-minded people' : '与志同道合的人有强烈共鸣', 
        growth: _lang === 'en' ? 'Needs to maintain self in relationships' : '需要学会在关系中保持自我'
    };

    var starDetails  = _getStarDescriptions(mainStar) || {
        personality: _getStarPersonality(mainStar), 
        psychology: _lang === 'en' ? 'A unique inner psychological world' : '内心有独特的心理世界',
        relationship: _lang === 'en' ? 'Unique relationship pattern' : '感情模式独特', 
        growth: _lang === 'en' ? 'Continuous growth through challenges' : '在挑战中持续成长',
        wound: _lang === 'en' ? 'Key events that shaped their character' : '经历过塑造性格的关键事件', 
        shadow: _lang === 'en' ? 'Shadows they need to face' : '有自己需要面对的阴影'
    };
    var sihuaDetailsZH = SIHUA_DEEP_DESCRIPTIONS[sihuaType] || SIHUA_DEEP_DESCRIPTIONS['化禄型'];
    var sihuaDetailsEN = SIHUA_DEEP_DESCRIPTIONS_EN[sihuaType] || SIHUA_DEEP_DESCRIPTIONS_EN['化禄型'];
    var sihuaDetails = _lang === 'en' ? sihuaDetailsEN : sihuaDetailsZH;

    var appearance    = _generateAppearanceDesc(mainStar, _normalizeAttrVal(attributes.appearance), genderCN, _lang);
    var signature     = _generateSignatureByStar(mainStar);
    var sihuaKeyFull  = sihuaType;

    // ── 防御机制：优先使用福德宫真实主星（弗洛伊德映射），回退主星×四化交叉表 ──
    var _fudeDefenseBaseZH = (STAR_SIHUA_DEFENSE[fudeMainStar] || {})[sihuaKeyFull]
                        || (STAR_SIHUA_DEFENSE[mainStar]     || {})[sihuaKeyFull]
                        || _getDefenseMechanism(sihuaType);
    var _fudeDefenseBaseEN = (STAR_SIHUA_DEFENSE_EN[fudeMainStar] || {})[sihuaKeyFull]
                        || (STAR_SIHUA_DEFENSE_EN[mainStar]     || {})[sihuaKeyFull]
                        || 'Has a unique self-protection pattern';
    var _fudeDefenseBase = _lang === 'en' ? _fudeDefenseBaseEN : _fudeDefenseBaseZH;
    // 如果 cp 有弗洛伊德精准描述，用它拼接；否则用交叉表结果
    var _fudeLabel = _lang === 'en' ? '[Fortune Palace · ' + fudeMainStar + '] '
                   : _lang === 'zh-TW' ? '【福德宮主星：' + fudeMainStar + '】'
                   : '【福德宫主星：' + fudeMainStar + '】';
    var crossDefense  = (cp && cp.defenseMechanism)
        ? (_fudeLabel + cp.defenseMechanism + '。\n\n' + _fudeDefenseBase)
        : _fudeDefenseBase;

    var crossTurningZH = ((STAR_SIHUA_TURNING[mainStar]  || {})[sihuaKeyFull]);
    var crossTurning = _lang === 'en' 
        ? ((STAR_SIHUA_TURNING_EN[mainStar] || {})[sihuaKeyFull] || 'A defining moment that breaks through the usual defence, forcing a reckoning.')
        : (crossTurningZH || '某个打破防御的关键事件迫使' + pronoun + '重新审视自己');
    var crossDramaticZH = ((STAR_SIHUA_DRAMATIC[mainStar] || {})[sihuaKeyFull]);
    var crossDramatic = _lang === 'en' ? _getDramaticRole(patternType) : (crossDramaticZH || _getDramaticRole(patternType));
    var crossRivalZH = ((STAR_RIVAL_STYLE[mainStar]    || {})[patternType]);
    var crossRivalEN = ((STAR_RIVAL_STYLE_EN[mainStar]  || {})[patternType]);
    var crossRival    = _lang === 'en' ? (crossRivalEN || 'Meets opposition in a uniquely characteristic way.') : (crossRivalZH || '以独特方式应对对手');

    var _traits = patternData.traits || {};
    var posArr = (_lang === 'en' ? (_traits.positiveEN || _traits.positive) : _traits.positive) || [];
    var negArr = (_lang === 'en' ? (_traits.negativeEN || _traits.negative) : _traits.negative) || [];
    var posTraits = posArr.slice(0, 3).join(_lang === 'en' ? ', ' : '、');
    var negTraits = negArr.slice(0, 2).join(_lang === 'en' ? ', ' : '、');

    // ===== 人物小传：标准5段式结构 =====
    var bio = '';

    // ── i18n：driveLabel 显示标签（app-v2.js 传入可能是中文或英文，需翻译）──
    // 先建立英文→中文的映射（因为用户可能在英文界面选择后切换语言）
    var _driveEN2ZH = {
        'Ambitious':'野心者', 'Obsessed':'执念者', 'Strategist':'谋局者',
        'Hedonist':'享乐者', 'Guardian':'守护者', 'Disruptor':'破局者',
        'Wanderer':'漂泊者', 'Endurer':'隐忍者',
        'Ambition-Driven':'野心者', 'Obsession-Driven':'执念者', 'Strategy-Driven':'谋局者',
        'Pleasure-Driven':'享乐者', 'Guardian':'守护者', 'Disruptor':'破局者',
        'Wanderer':'漂泊者', 'Endurance-Driven':'隐忍者'
    };
    // 如果传入的是英文，先转回简体中文
    var _baseLabel = _driveEN2ZH[driveLabel] || driveLabel;
    
    var driveLabelI18n = _baseLabel;
    
    // 根据目标语言翻译
    if (_lang === 'en') {
        var _driveZH2EN = {
            '野心者':'Ambition-Driven','执念者':'Obsession-Driven','谋局者':'Strategy-Driven',
            '享乐者':'Pleasure-Driven','守护者':'Guardian','破局者':'Disruptor',
            '漂泊者':'Wanderer','隐忍者':'Endurance-Driven'
        };
        driveLabelI18n = _driveZH2EN[_baseLabel] || _baseLabel;
    } else if (_lang === 'zh-TW') {
        var _driveZH2TW = {
            '野心者':'野心者','执念者':'執念者','谋局者':'謀局者',
            '享乐者':'享樂者','守护者':'守護者','破局者':'破局者',
            '漂泊者':'漂泊者','隐忍者':'隱忍者'
        };
        driveLabelI18n = _driveZH2TW[_baseLabel] || _baseLabel;
    }

    // 命盘标识行（供编剧溯源）— 按语言显示
    var chartTag;
    if (_lang === 'en') {
        var _starNameEN = (window.MAIN_STARS_I18N && window.MAIN_STARS_I18N[mainStar] && window.MAIN_STARS_I18N[mainStar].en) || mainStar;
        var _sihuaEN = { '化禄型':'Fortune type','化权型':'Power type','化科型':'Prestige type','化忌型':'Fixation type' }[sihuaType] || sihuaType;
        // patternName 翻译（英文模式下不能用中文名）
        var _PATTERN_NAME_EN = {
            '杀破狼':'Sha-Po-Lang', '紫府廉武相':'Zi-Fu-Lian-Wu-Xiang', '机月同梁':'Ji-Yue-Tong-Liang', '巨日':'Ju-Ri',
            '七杀独坐':'Qi Sha (Solo)', '破军独坐':'Po Jun (Solo)', '贪狼独坐':'Tan Lang (Solo)',
            '紫微独坐':'Zi Wei (Solo)', '天府独坐':'Tian Fu (Solo)', '廉贞独坐':'Lian Zhen (Solo)',
            '武曲独坐':'Wu Qu (Solo)', '天同独坐':'Tian Tong (Solo)', '天机独坐':'Tian Ji (Solo)',
            '太阳独坐':'Tai Yang (Solo)', '太阴独坐':'Tai Yin (Solo)', '巨门独坐':'Ju Men (Solo)',
            '天相独坐':'Tian Xiang (Solo)', '天梁独坐':'Tian Liang (Solo)',
            '天同命格':'Tian Tong Chart', '紫微命格':'Zi Wei Chart', '天机命格':'Tian Ji Chart',
            '太阳命格':'Tai Yang Chart', '武曲命格':'Wu Qu Chart', '廉贞命格':'Lian Zhen Chart',
            '天府命格':'Tian Fu Chart', '太阴命格':'Tai Yin Chart', '贪狼命格':'Tan Lang Chart',
            '巨门命格':'Ju Men Chart', '天相命格':'Tian Xiang Chart', '天梁命格':'Tian Liang Chart',
            '七杀命格':'Qi Sha Chart', '破军命格':'Po Jun Chart'
        };
        var _patNameEN = _PATTERN_NAME_EN[patternName] || (typeof _getPatternNameI18n === 'function' ? _getPatternNameI18n(patternName) : patternName);
        chartTag = (cp && cp.mingMainStar) ? ('Ming: ' + _starNameEN + ' · ' + _sihuaEN + ' · ' + _patNameEN) : (_starNameEN + ' · ' + _sihuaEN + ' · ' + _patNameEN);
    } else if (_lang === 'zh-TW') {
        chartTag = (cp && cp.mingMainStar) ? ('命宮' + cp.mingMainStar + '·' + sihuaType + '·' + patternName) : (mainStar + '命·' + sihuaType + '·' + patternName);
    } else {
        chartTag = (cp && cp.mingMainStar) ? (cp.mingMainStar + '命 ' + sihuaType + ' · ' + patternName) : (mainStar + '命 ' + sihuaType + ' · ' + patternName);
    }

    // 喜剧认知盲点
    var blindSpotTextZH = (cp && cp.blindSpot)
        || (window.ChartBridge && window.ChartBridge.STAR_BLIND_SPOT && window.ChartBridge.STAR_BLIND_SPOT[mainStar])
        || '';
    var blindSpotTextEN = (window.ChartBridge && window.ChartBridge.STAR_BLIND_SPOT_EN && window.ChartBridge.STAR_BLIND_SPOT_EN[mainStar])
        || 'Has unique blind spots';
    var blindSpotText = _lang === 'en' ? blindSpotTextEN : blindSpotTextZH;

    // 关键词
    var kw1 = mainStar;
    var kw2 = sihuaType.replace('型', '');
    var kw3 = blindSpotText ? blindSpotText.split('，')[0].slice(0, 10) : patternType;

    // ─────────────────────────────────────────────
    // 【人物小传：${name}】
    // ─────────────────────────────────────────────
    // 英文标题用方括号格式，中文用【】
    if (_lang === 'en') {
        bio += `[${T.bioHeader}: ${name}]\n`;
    } else {
        bio += `【${T.bioHeader}：${name}】\n`;
    }
    bio += `> ${chartTag}\n\n`;
    bio += `---\n\n`;

    // ── 一、基本信息 ──
    // 字段冒号：英文用半角": "，中文/繁体用全角"："
    var _c = _lang === 'en' ? ': ' : '：';
    bio += `## ${T.s1}\n\n`;
    bio += `- **${T.fName}${_c}** ${name}\n`;
    bio += `- **${T.fAge}${_c}** ${ageCN}\n`;
    bio += `- **${T.fGender}${_c}** ${genderCN}${T.genderSuffix}\n`;
    bio += `- **${T.fEra}${_c}** ${eraCN}\n`;
    bio += `- **${T.fProf}${_c}** ${profLabel || T.tbd}\n`;
    bio += `- **${T.fAppear}${_c}** ${appearance}\n`;
    bio += `- **${T.fSign}${_c}** ${signature}\n`;
    // 人生阶段（英文模式下叙事函数可能返回中文，跳过）
    if (narrateAge_text && _lang !== 'en') bio += `- **${T.fLifeStage}${_c}** ${narrateAge_text}\n`;
    if (_lang === 'en') {
        var _ageEN = {youth:'Coming of age in a time of upheaval — the curriculum isn\'t textbooks, it\'s history in real time. He carries unmuted enthusiasm for the world, and a heavier weight than this age should bear.',
            middle:'Standing at the mid-point — enough experience to know what matters, not yet enough distance to stop caring.',
            senior:'A life\'s worth of choices now visible in the face. The urgency has changed shape: not what to achieve, but what to leave.'};
        var _ageEnLabel = _ageEN[ageRaw] ? _ageEN[ageRaw].replace(/\bHe\b/g, pronoun === 'she' ? 'She' : 'He') : '';
        if (_ageEnLabel) bio += `- **${T.fLifeStage}${_c}** ${_ageEnLabel}\n`;
    }
    // 职业处境（英文模式下中文叙事函数跳过，用简化描述）
    if (narrateProf_text && _lang !== 'en') bio += `- **${T.fStatus}${_c}** ${narrateProf_text}\n`;
    if (_lang === 'en') {
        var _profStatusEN = {
            political:'The political world that once felt like a calling is increasingly felt as a system — one that requires playing a part.',
            business:'Built something worth having. The question now is whether the cost was worth it — and whether the next chapter will be.',
            cultural:'Words, images, ideas — the tools are familiar. The gap between what one makes and what one means remains the work.',
            military:'Trained to act when others freeze. The clarity that comes with clear orders is both gift and limitation.',
            technical:'Solves problems others don\'t see. The harder problem — of what to build toward — stays unsolved.',
            other:'In the middle of something they didn\'t fully choose. Making it work anyway.'
        };
        if (_profStatusEN[profRaw]) bio += `- **${T.fStatus}${_c}** ${_profStatusEN[profRaw]}\n`;
    }
    // 此刻时间状态（流年流月流日流时）
    // curState 来自 SHI_STAR_STATE，是中文；英文模式用简化版
    if (_lang === 'en') {
        var _nowEN = {
            '紫微':'At this moment: holding the shape others have given — and quietly deciding which parts are actually worth keeping.',
            '天机':'At this moment: the mind is ahead of the situation, mapping what hasn\'t happened yet.',
            '太阳':'At this moment: the warmth is real. So is the cost of being everyone\'s light source.',
            '武曲':'At this moment: focused, moving, solving. Emotion filed away for later.',
            '天同':'At this moment: the stillness is chosen, not given. This is what rest looks like when you\'ve earned it.',
            '廉贞':'At this moment: the surface is composed. What\'s underneath hasn\'t finished moving.',
            '天府':'At this moment: steady. Watching. The kind of calm that comes from having seen this before.',
            '太阴':'At this moment: absorbing more than showing. The translation happens later, in private.',
            '贪狼':'At this moment: drawn toward something new. The old pull returning, different shape.',
            '巨门':'At this moment: thinking through what was said. And what wasn\'t. And what that means.',
            '天相':'At this moment: the listener in the room. More aware of the balance than anyone knows.',
            '天梁':'At this moment: standing a little apart from the situation, watching for the part others are missing.',
            '七杀':'At this moment: moving. Something behind the eyes that didn\'t exist this morning.',
            '破军':'At this moment: the old version is no longer available. The new one hasn\'t settled yet.'
        };
        bio += `- **${T.fNow}${_c}** ${_nowEN[mainStar] || 'At this moment: present, reading the room, deciding.'}\n`;
    } else if (eraRaw === 'contemporary') {
        bio += `- **${T.fNowDetail}（${gz.yearGan}${gz.yearZhi}年·${gz.monthZhi}月·${gz.dayZhi}日·${gz.shiZhi}时）${_c}** ${curState}\n`;
    } else {
        bio += `- **${T.fNow}${_c}** ${curState}\n`;
    }
    // 命盘格局（编剧溯源）
    bio += `- **${T.fChart}${_c}** \`${chartTag}\`\n`;
    // 驱动力类型（用i18n版标签）
    if (driveLabelI18n) {
        var _driveDesc = (driveData && driveData.desc) ? driveData.desc.split('，')[0].split(',')[0] : '';
        if (_lang === 'en') {
            bio += `- **${T.fDriveType}${_c}** ${driveLabelI18n}${_driveDesc ? ' (' + _driveDesc + ')' : ''}\n`;
        } else {
            bio += `- **${T.fDriveType}${_c}** ${driveLabelI18n}${_driveDesc ? '（' + _driveDesc + '）' : ''}\n`;
        }
    }
    // 驱动力的星曜提示（编剧/策划参考）
    if (driveStarHint) {
        bio += `- **${T.fChartHint}${_c}** ${driveStarHint}\n`;
    }
    bio += `\n---\n\n`;

    // ── 二、性格特点 ──
    bio += `## ${T.s2}\n\n`;
    // 主要性格（来自主星×四化交叉）
    bio += `- **${T.fPersonality}${_c}** ${starDetails.personality}\n`;
    // 行为特征（中文叙事函数在英文模式下不输出）
    if (_lang !== 'en') bio += `- **${T.fBehavior}${_c}** ${behavior_text}\n`;
    // 语言特点
    if (_lang !== 'en') bio += `- **${T.fSpeech}${_c}** ${speech_text}\n`;
    // 情感表达
    if (_lang !== 'en') bio += `- **${T.fEmotion}${_c}** ${emotion_text}\n`;
    // 英文版：把behavior/speech/emotion合并为一段星曜描述
    if (_lang === 'en' && starDetails.generalTendencies) {
        bio += `- **${T.fBehavior}${_c}** ${starDetails.generalTendencies}\n`;
    }
    // 核心驱动（四化 × 驱动力）— 用i18n版标签
    var driveDescFull = (p8type && p8type.desc) || (driveData && driveData.desc) || sihuaData.desc || sihuaDetails.psychology.slice(0, 50);
    bio += `- **${T.fDrive} (${driveLabelI18n || sihuaType})${_c}** ${driveDescFull}\n`;
    // 隐性需求（驱动力的 hiddenNeed / lifePattern）
    if (p8type && p8type.hiddenNeed) {
        bio += `- **${T.fHiddenNeed}${_c}** ${p8type.hiddenNeed}\n`;
    }
    // 致命弱点（认知盲点）
    if (blindSpotText) {
        bio += `- **${T.fFlaw}${_c}** ${blindSpotText}\n`;
    }
    // 危机应对（英文模式下中文叙事函数跳过）
    if (_lang !== 'en') bio += `- **${T.fCrisis}${_c}** ${crisis_text}\n`;
    else if (starDetails.mentalTendencies) bio += `- **${T.fCrisis}${_c}** ${starDetails.mentalTendencies}\n`;
    // 正向特质
    bio += `- **${T.fPositive}${_c}** ${posTraits}\n`;
    // 阴影面
    var shadowSep = _lang === 'en' ? '; ' : '；';
    bio += `- **${T.fShadow}${_c}** ${negTraits}${starDetails.shadow ? shadowSep + starDetails.shadow : ''}\n\n`;
    // 人物矛盾点
    var _posTrait0 = posArr[0] || posTraits;
    var _negTrait0 = negArr[0] || negTraits;
    var _paradoxFallback = _lang === 'en'
        ? ('Appears ' + _posTrait0 + ', yet beneath: ' + _negTrait0)
        : ('表面' + _posTrait0 + '，内心却' + _negTrait0);
    var paradoxZH = driveCoreConflict
        || ((window.STAR_SIHUA_TURNING && window.STAR_SIHUA_TURNING[mainStar] || {})[sihuaKeyFull]);
    var paradoxEN = (window.STAR_SIHUA_TURNING_EN && window.STAR_SIHUA_TURNING_EN[mainStar] || {})[sihuaKeyFull];
    var paradox = _lang === 'en' 
        ? (paradoxEN || _paradoxFallback)
        : (paradoxZH || _paradoxFallback);
    bio += `- **${T.fParadox}${_c}** ${paradox}\n\n`;
    
    // ══════════════════════════════════════════════════════════════
    // 整合叙述：核心冲突（Want vs Need + 矛盾点融合）
    // ══════════════════════════════════════════════════════════════
    var coreConflict = _generateCoreConflictNarrative(patternType, mainStar, sihuaType, pronoun, _lang);
    bio += `${coreConflict}\n\n`;
    
    // ══════════════════════════════════════════════════════════════
    // 整合叙述：标志性细节
    // ══════════════════════════════════════════════════════════════
    var signatureNarrative = _generateSignatureNarrative(mainStar, patternType, _lang);
    bio += `${signatureNarrative}\n\n`;
    
    bio += `---\n\n`;

    // ── 三、背景故事 ──
    bio += `## ${T.s3}\n\n`;
    // 原生家庭（英文模式下叙事函数全部是中文，用星曜伤口替代）
    if (_lang === 'en') {
        // 英文版家庭背景：用主星wound+格局时代伤痕英文版
        var _familyEN = {
            wealthy: 'Grew up in comfort that felt permanent — until it wasn\'t. The loss of that certainty became the defining wound.',
            middle: 'A household that worked for what it had. Stability as aspiration, not guarantee. That shaped how far ahead the planning runs.',
            poor: 'Scarcity was the first teacher. Everything built since carries the memory of what it felt like to have nothing to fall back on.',
            decline: 'Born into a name that used to mean something. The gap between what was expected and what was available is where the character formed.'
        };
        var _fBg = _familyEN[familyRaw] || (starDetails.wound ? starDetails.wound.split('.')[0] + '.' : 'A background that left its mark in ways that took years to trace.');
        bio += `- **${T.fFamily}${_c}** ${_fBg}\n`;
    } else if (narrateFamily_text || narrateParents_text || narrateSiblings_text || narrateSocCl_text) {
        bio += `- **${T.fFamily}${_c}** `;
        var familyParts = [];
        if (narrateFamily_text)    familyParts.push(narrateFamily_text);
        if (narrateParents_text)   familyParts.push(narrateParents_text);
        if (narrateSiblings_text)  familyParts.push(narrateSiblings_text);
        if (narrateSocCl_text)     familyParts.push(narrateSocCl_text);
        bio += familyParts.join('；') + '\n';
    } else {
        bio += `- **${T.fFamily}${_c}** ${(patternData.traits.positive || []).slice(0,1).join('')}格局出身，${T.daxianEra[eraRaw] || eraCN}环境塑造\n`;
    }
    // 成长创伤
    var soulWoundRaw = _generateSoulWound(eraRaw, patternType, mainStar);
    var soulWoundLines = soulWoundRaw.replace(/\*\*/g,'').split('\n').filter(function(l){ return l.trim().length > 10; });
    var traumaText = driveWound || (soulWoundLines.length > 0 ? soulWoundLines[0].replace(/^[-•]\s*/, '').trim() : '');
    if (traumaText) {
        bio += `- **${T.fTrauma}${_c}** ${traumaText}\n`;
    }
    // 内心底色（Inner Colour）
    bio += `- **${T.fWound}${_c}** ${starDetails.wound}\n`;
    // 大限推演人生节点（英文模式下大限文字是中文，跳过或简化）
    if (cp && cp.daxianNarrative && _lang !== 'en') {
        var daxianLines = cp.daxianNarrative.split('\n')
            .map(function(l){ return l.replace(/\*\*/g,'').trim(); })
            .filter(function(l){ return l.length > 5; })
            .slice(0, 4);
        bio += `- **${T.fDaxian}${_c}**\n`;
        daxianLines.forEach(function(l){ bio += `  - ${l}\n`; });
    }
    if (_lang === 'en') {
        // 英文版大限：简化为年龄段弧光描述
        bio += `- **${T.fDaxian}${_c}** Each decade shifts the terrain. The chart suggests early life shaped by ` + (patternType === '杀破狼' ? 'disruption' : patternType === '紫府廉武相' ? 'expectation' : patternType === '机月同梁' ? 'obligation' : 'uncertainty') + `, mid-life defined by the consequences of the core drive, and later life asking whether the strategy still works.\n`;
    }
    // 时辰刻度精细状态（英文模式下跳过中文）
    if (cp && cp.keState && _lang !== 'en') {
        bio += `- **${T.fKeState}${_c}** ${cp.keState}\n`;
    }
    bio += `\n---\n\n`;

    // ── 四、人物关系（"事为人宜"原则：关系由事件定义，非标签贴附）──
    // 韩式编剧理论：事为人宜——每段关系必须有一件定义性事件，
    // 通过具体情节节点揭示关系本质，而不是用性格标签贴附角色。
    bio += `## ${T.s4}\n\n`;

    // ── 4.1 "事为人宜"：亲密关系定义性事件 ──
    // 原则：不直接输出"他是内敛型"，而是设计一个能揭示此特质的事件
    // ── 仅中文/繁体用事件叙事（英文用英文版）──
    var _relEventMapZH = {
        '追求情感': pronoun + '在某段重要关系里，有一次没有说出口的告别——那个沉默定义了' + pronoun + '在感情中的底色',
        '追求成功': pronoun + '和某个人关系的转折，来自一次要在「留下来」和「往前走」之间做选择的时刻',
        '追求自由': '让' + pronoun + '感受到真正亲密的，是那个第一次没有评判' + pronoun + '选择的人',
        '追求安稳': pronoun + '对一段关系是否值得深入的判断，来自对方在某次混乱时刻的反应',
        '追求真理': pronoun + '与某人关系的转折点，是一次被真正说服——不是被安慰，而是被逻辑说服',
        '追求平衡': pronoun + '在某段关系里做过一次让自己后悔很久的妥协，那次妥协重新定义了' + pronoun + '对「边界」的理解'
    };
    var _relEventMapTW = {
        '追求情感': pronoun + '在某段重要關係裡，有一次沒有說出口的告別——那個沉默定義了' + pronoun + '在感情中的底色',
        '追求成功': pronoun + '和某個人關係的轉折，來自一次要在「留下來」和「往前走」之間做選擇的時刻',
        '追求自由': '讓' + pronoun + '感受到真正親密的，是那個第一次沒有評判' + pronoun + '選擇的人',
        '追求安稳': pronoun + '對一段關係是否值得深入的判斷，來自對方在某次混亂時刻的反應',
        '追求真理': pronoun + '與某人關係的轉折點，是一次被真正說服——不是被安慰，而是被邏輯說服',
        '追求平衡': pronoun + '在某段關係裡做過一次讓自己後悔很久的妥協，那次妥協重新定義了' + pronoun + '對「邊界」的理解'
    };
    var _relEventMapEN = {
        '追求情感': pronoun + ' once didn\'t say goodbye when it mattered — that silence still defines how ' + pronoun + ' loves',
        '追求成功': 'The turning point in one key relationship was a moment that forced a choice between staying and moving forward',
        '追求自由': 'The person who first accepted ' + pronoun + '\'s choices without judgment is the one who got closest',
        '追求安稳': pronoun + '\'s read on whether a relationship is worth deepening comes from watching the other person handle chaos',
        '追求真理': 'The turning point was being genuinely convinced — not comforted, but logically persuaded — by someone for the first time',
        '追求平衡': pronoun + ' once made a compromise that took years to stop regretting, and that moment redefined what "boundary" means for ' + pronoun
    };
    var _growthKey = attributes.growth || (userData.growth) || '';
    _growthKey = _normalizeAttrVal(_growthKey);
    var _relEventMap = _lang === 'en' ? _relEventMapEN : (_lang === 'zh-TW' ? _relEventMapTW : _relEventMapZH);
    var relDefEvent = _relEventMap[_growthKey] || '';

    // 亲密关系模式（夫妻宫）+ 事为人宜事件
    bio += `- **${T.fRelation}${_c}** ${starDetails.relationship}`;
    if (cp && cp.attachmentType) bio += (_lang === 'en' ? ' (' + T.attachLabel + ': ' + cp.attachmentType + ')' : '（' + T.attachLabel + '：' + cp.attachmentType + '）');
    if (relDefEvent && _lang !== 'en') bio += `\n  - *编剧提示（事为人宜）：${relDefEvent}*`;
    if (relDefEvent && _lang === 'en') bio += `\n  - *${relDefEvent}*`;
    bio += `\n`;

    // 理想伴侣
    bio += `- **${T.fPartner}${_c}** ${_getStarPartnerNeed(fuqiMainStar || mainStar)}\n`;
    // 感情投影（夫妻宫飞星）
    if (cp && cp.interpersonalProfile && cp.interpersonalProfile.fuqiProjection) {
        bio += `- **${T.fProjection}${_c}** ${cp.interpersonalProfile.fuqiProjection.slice(0, 80)}\n`;
    }
    // 社交风格（英文模式下 social_text 可能是中文，用星曜关系描述替代）
    if (_lang !== 'en') {
        bio += `- **${T.fSocial}${_c}** ${social_text}`;
        if (cp && cp.interpersonalProfile && cp.interpersonalProfile.jiaoYouStyle) {
            bio += `；${cp.interpersonalProfile.jiaoYouStyle.slice(0, 60)}`;
        }
        bio += `\n`;
    } else {
        bio += `- **${T.fSocial}${_c}** ${starDetails.relationship ? starDetails.relationship.split('.')[0] + '.' : 'Navigates groups with a characteristic pattern.'}\n`;
    }

    // ── 4.2 冲突模式（事为人宜：冲突由具体对立事件触发，非泛化标签）──
    var _conflictEventMapZH = {
        '简洁有力':  pronoun + '的矛盾往往从「一句话说得太直」开始',
        '温和委婉':  pronoun + '的矛盾往往从「那句该说的话没说出口」开始',
        '热情洋溢':  pronoun + '的矛盾往往从「以为对方也想要那份热情」开始',
        '沉稳冷静':  pronoun + '的矛盾往往从「对方认为' + pronoun + '不在乎」的误解开始',
        '幽默风趣':  pronoun + '的矛盾往往从「用幽默挡掉了本该认真对待的事」开始',
        '寡言少语':  pronoun + '的矛盾往往从「沉默被解读成了拒绝」开始'
    };
    var _conflictEventMapTW = {
        '简洁有力':  pronoun + '的矛盾往往從「一句話說得太直」開始',
        '温和委婉':  pronoun + '的矛盾往往從「那句該說的話沒說出口」開始',
        '热情洋溢':  pronoun + '的矛盾往往從「以為對方也想要那份熱情」開始',
        '沉稳冷静':  pronoun + '的矛盾往往從「對方認為' + pronoun + '不在乎」的誤解開始',
        '幽默风趣':  pronoun + '的矛盾往往從「用幽默擋掉了本該認真對待的事」開始',
        '寡言少语':  pronoun + '的矛盾往往從「沉默被解讀成了拒絕」開始'
    };
    var _conflictEventMapEN = {
        '简洁有力':  'Conflicts usually start with one sentence landing harder than intended',
        '温和委婉':  'Conflicts usually start with something that needed to be said — that wasn\'t',
        '热情洋溢':  'Conflicts usually start when the other person doesn\'t match the energy offered',
        '沉稳冷静':  'Conflicts usually start when stillness gets misread as not caring',
        '幽默风趣':  'Conflicts usually start when humour was used where seriousness was needed',
        '寡言少语':  'Conflicts usually start when silence is read as rejection'
    };
    var _speechKey = attributes.speech || (userData.speech) || '';
    _speechKey = _normalizeAttrVal(_speechKey);
    var _conflictEventMap = _lang === 'en' ? _conflictEventMapEN : (_lang === 'zh-TW' ? _conflictEventMapTW : _conflictEventMapZH);
    var conflictEvent = _conflictEventMap[_speechKey]
        ? (_lang === 'en' ? cpData.conflict + ' (' + _conflictEventMap[_speechKey] + ')' : cpData.conflict + '（' + _conflictEventMap[_speechKey] + '）')
        : cpData.conflict;
    bio += `- **${T.fConflict}${_c}** ${conflictEvent}\n`;

    // 贵人运（三方四正内在张力）
    if (cp && cp.internalTension) {
        bio += `- **${T.fTension}${_c}** ${cp.internalTension.slice(0, 80)}\n`;
    }
    // 飞星执念
    if (cp && cp.interpersonalProfile && cp.interpersonalProfile.mingFlyImpact) {
        bio += `- **${T.fFlyJi}${_c}** ${cp.interpersonalProfile.mingFlyImpact.slice(0, 70)}\n`;
    }
    // 流年当下关系状态（英文模式下 gz.shiTrait 是中文，用简洁英文）
    if (_lang === 'en') {
        bio += `- **${T.fCurrentRel} (${gz.yearGan}${gz.yearZhi}·${gz.monthZhi})${_c}** Relationships in this period carry the energy of ` + (_PATTERN_NAME_EN[patternType] || patternType) + ` — worth noticing who shows up now.\n\n`;
    } else {
        bio += `- **${T.fCurrentRel}（${gz.yearGan}${gz.yearZhi}年·${gz.monthZhi}月）${_c}** ${gz.shiTrait}\n\n`;
    }
    bio += `---\n\n`;

    // ── 五、在故事中的作用 ──
    bio += `## ${T.s5}\n\n`;
    // 剧作功能
    bio += `- **${T.fFunction}${_c}** ${crossDramatic}\n`;
    // 情节推动（转折事件）
    bio += `- **${T.fPlot}${_c}** ${crossTurning}\n`;
    // 主题表达（生命主题）
    if (cp && cp.lifeTheme) {
        bio += `- **${T.fTheme}${_c}** ${cp.lifeTheme}\n`;
    } else {
        var _growthText = sihuaDetails.growth || '';
        // 英文模式下不截断，保持完整句子
        if (_lang === 'en') {
            bio += `- **${T.fTheme}${_c}** ${_growthText}\n`;
        } else {
            bio += `- **${T.fTheme}${_c}** ${_growthText.slice(0, 60)}\n`;
        }
    }
    // 对对手
    bio += `- **${T.fRival}${_c}** ${crossRival}\n`;
    // 学习与成长模式（英文模式下中文叙事函数跳过）
    if (_lang !== 'en') bio += `- **${T.fLearning}${_c}** ${learning_text}\n`;
    else bio += `- **${T.fLearning}${_c}** Learns by doing, not by theory. The biggest lessons come when the situation demands a change in approach.\n`;
    
    // ══════════════════════════════════════════════════════════════
    // 人物弧光：增强版弧光叙述（起点→转折→终点完整叙述）
    // ══════════════════════════════════════════════════════════════
    bio += `\n**${T.fArc}**\n\n`;
    var arcNarrative = _generateArcNarrative(mainStar, sihuaType, patternType, pronoun, _lang);
    bio += `${arcNarrative}\n\n`;
    bio += `---\n\n`;

    // ── 角色语录（3句，可直接用于台词）──
    bio += `## ${T.sQuotes}\n\n`;
    bio += `*${T.quotesNote}*\n\n`;
    var quotes = _generateCharacterQuotes(mainStar, sihuaType, patternType, pronoun, eraRaw, name, _lang);
    quotes.forEach(function(q, qi) {
        bio += `> **${qi+1}.** ${q}\n`;
    });
    bio += '\n---\n\n';

    // ── 故事开端建议（3个，供编剧选用）──
    bio += `## ${T.sOpenings}\n\n`;
    var openings = _generateStoryOpenings(mainStar, sihuaType, eraRaw, patternType, name, pronoun, eraCN, _lang);
    openings.forEach(function(o, i) { bio += `**${T.openingPlan}${i+1}：** ${o}\n\n`; });

    // ── 全局代词统一（最终兜底）──
    if (pronoun === '她') {
        bio = bio.replace(/他/g, '她');
    }

    // ── 英文模式：全角冒号 → 半角冒号（统一排版）──
    if (_lang === 'en') {
        // "：** " → ":** " (bold field separator)
        bio = bio.replace(/：\*\*/g, ':**');
        // 剩余全角冒号 → 冒号空格
        bio = bio.replace(/：/g, ': ');
        // 编剧提示标签（中文残留）
        bio = bio.replace(/\*编剧提示（事为人宜）：/g, '*Story note (scene-driven): ');
        bio = bio.replace(/\*命盘印证：/g, '*Chart resonance: ');
        bio = bio.replace(/\*命盘张力：/g, '*Chart tension: ');
        bio = bio.replace(/\*命盘注：/g, '*Chart note: ');
    }
    // ── 繁体模式：简繁转换（叙事文本）+ 简体标签残留清理 ──
    if (_lang === 'zh-TW') {
        bio = _sc2tw(bio);
        bio = bio.replace(/\*编剧提示（事为人宜）：/g, '*編劇提示（事為人宜）：');
        bio = bio.replace(/\*命盘印证：/g, '*命盤印證：');
        bio = bio.replace(/\*命盘张力：/g, '*命盤張力：');
        bio = bio.replace(/\*命盘注：/g, '*命盤注：');
        // 中文标点：「」保留，调整书名号等
        bio = bio.replace(/《/g, '《').replace(/》/g, '》');
    }

    return bio;
}

// ==================== 故事开端生成器 ====================
/**
 * 基于主星×四化×时代生成3个故事开端建议
 * 参考《喜剧这回事》的"喜剧前提"理论：好的开端要预设主角的认知盲点
 */
function _generateStoryOpenings(mainStar, sihuaType, era, patternType, name, pronoun, eraCN, lang) {
    lang = lang || (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');

    // ── 英文版故事开端 ──
    if (lang === 'en') {
        var eraDescEN = { ancient:'In an age of dynastic collapse,', modern:'In the upheaval of the modern era,', contemporary:'In today\'s overloaded world,' }[era] || eraCN + ',';
        var starOpeningsEN = {
            '紫微': [
                `${eraDescEN} ${name} finally reaches the position ${pronoun} has craved — but no one told ${pronoun} the throne is a trap.`,
                `${name} has always believed ${pronoun} was born to lead. Then one day, ${pronoun} discovers everyone around ${pronoun} has been lying.`,
                `Everyone obeys ${name}. Except one person — and that person becomes ${pronoun}'s only real friend.`
            ],
            '天机': [
                `${name} has calculated every move to the final step. The one thing ${pronoun} didn't account for: someone who doesn't play by the board.`,
                `${eraDescEN} ${name} believes ${pronoun} has found the key to changing fate — not knowing the "key" is someone else's lock.`,
                `${name} loves studying people. ${pronoun} is certain ${pronoun} sees through everyone — except the face in the mirror.`
            ],
            '太阳': [
                `${name} has spent a life lighting others up. ${eraDescEN} ${pronoun} realises for the first time: ${pronoun} has no idea who ${pronoun} is.`,
                `${pronoun} believed that enough warmth could change anything. That belief shatters the first time ${name} truly fails.`,
                `Everyone loves ${name}. No one really knows ${pronoun} — a truth that takes ${pronoun} half a lifetime to understand.`
            ],
            '武曲': [
                `${name} has always believed there's no problem money can't solve — just not enough money. ${eraDescEN} ${pronoun} meets the exception.`,
                `${pronoun} proved everything through action. Then ${pronoun} realises: some things are better proved to yourself than to others.`,
                `${name}'s logic: just do it — why talk? ${eraDescEN} that logic breaks down for the first time.`
            ],
            '天同': [
                `${name} has always believed: keep everyone happy and nothing is insurmountable — until ${pronoun} finds someone weaponising that belief.`,
                `${eraDescEN} ${name} has weathered everything with gentleness. Then one day ${pronoun} can't hold on — and doesn't know who to call.`,
                `${pronoun} always says "it's fine." The last time ${name} says it, ${pronoun} finally cries.`
            ],
            '廉贞': [
                `${name} has walked the tightrope between desire and rules a whole life. ${eraDescEN} the rope snaps.`,
                `${pronoun} keeps telling ${pronoun}self: I'm just playing this game, I can stop whenever — until ${pronoun} can't.`,
                `${name} does one thing against ${pronoun}'s own principles. ${pronoun} expects no one to find out. But ${pronoun} knows.`
            ],
            '天府': [
                `${name} holds onto everything ${pronoun} values. ${eraDescEN} ${pronoun} succeeds — but loses something else entirely.`,
                `${pronoun} has always trusted that stability is the highest wisdom — then the person who changes ${pronoun}'s life arrives at the most stable moment.`,
                `${name} lets go for the first time. And discovers ${pronoun} no longer knows how to live without holding on.`
            ],
            '太阴': [
                `${eraDescEN} no one knows the ocean inside ${name}. ${pronoun} wasn't going to tell anyone — until someone asked.`,
                `${pronoun} writes everything down. The unfinished entry becomes the most important clue in ${pronoun}'s life.`,
                `${name} thinks ${pronoun} is just sensitive. ${eraDescEN} ${pronoun} realises it isn't sensitivity — it's something ${pronoun} has been running from.`
            ],
            '贪狼': [
                `${name} wants everything. ${eraDescEN} ${pronoun} wants one thing for the first time — and this time, ${pronoun} can't have it.`,
                `Everyone is drawn to ${name}. But ${pronoun} knows: ${pronoun} plays a role for everyone. Who is ${pronoun} for ${pronoun}self?`,
                `${pronoun}'s life has always been "the next thing" — until ${pronoun} meets someone who doesn't leave, and has no idea what to do.`
            ],
            '巨门': [
                `${name} speaks one truth that changes everyone's fate — including ${pronoun}'s own. ${eraDescEN} does ${pronoun} regret it?`,
                `${pronoun} has always told the truth — until ${pronoun} meets someone who needs it more than anyone, and can't say it.`,
                `${name}'s tongue has never spared anyone. ${eraDescEN} someone finally leaves ${pronoun} speechless.`
            ],
            '天相': [
                `${name} has followed the rules a whole life. ${eraDescEN} the rules betray ${pronoun}.`,
                `${pronoun} has spent years mediating everyone else's conflicts — and never noticed ${pronoun} was long overdue one of ${pronoun}'s own.`,
                `${name} has helped everyone. ${eraDescEN} the one person ${pronoun} never got around to helping was ${pronoun}self.`
            ],
            '天梁': [
                `${name} has guided others a whole life. ${eraDescEN} someone comes to guide ${pronoun} — and ${pronoun} doesn't know how to accept it.`,
                `${pronoun} believed ${pronoun} had seen through fate. ${eraDescEN} ${pronoun} finds another game — and ${pronoun} is in it.`,
                `${name} has given countless people life advice. The hardest to follow is the one ${pronoun} gave ${pronoun}self.`
            ],
            '七杀': [
                `${name} has never lost. ${eraDescEN} ${pronoun} loses — and doesn't know how to get up from this.`,
                `${pronoun} has always thought loneliness was the price — worth paying. Then one day ${pronoun} finds ${pronoun} doesn't want to pay anymore.`,
                `${eraDescEN} ${name} meets someone who isn't afraid of ${pronoun}. ${pronoun} doesn't know what weapon to use.`
            ],
            '破军': [
                `${name} has broken everything worth breaking. ${eraDescEN} ${pronoun} looks at the ruins and wants, for the first time, to build something.`,
                `${pronoun} always believed destruction was courage. After that day, ${pronoun} begins to wonder: was ${pronoun} just running?`,
                `${eraDescEN} someone asks ${name}: what do you actually want? ${pronoun} can't answer for the first time.`
            ]
        };
        var sihuaAdditionEN = {
            '化禄型': '(Opening with a tailwind — but the tailwind hides the real test.)',
            '化权型': '(Opening in control — but the need for control is the biggest thing beyond control.)',
            '化科型': '(Opening perfectly — but there is a price beneath the perfect surface.)',
            '化忌型': '(Opening with a fixation already in place — that fixation drives the whole story.)'
        };
        var starOpsEN = starOpeningsEN[mainStar] || [
            `${eraDescEN} a small crack appears in ${name}'s life. ${pronoun} doesn't realise it will never close.`,
            `${name} has always believed fate can be controlled — until ${pronoun} meets the one thing ${pronoun} cannot.`,
            `${pronoun} thought ${pronoun} knew exactly who ${pronoun} was. ${eraDescEN} someone makes ${pronoun} doubt that.`
        ];
        var additionEN = sihuaAdditionEN[sihuaType] || '';
        return starOpsEN.map(function(op, i) {
            return i === 0 ? op + (additionEN ? ' ' + additionEN : '') : op;
        });
    }

    // ── 繁体中文版（简转繁）──
    if (lang === 'zh-TW') {
        var eraDescTW = { ancient:'在朝代更替的亂世中', modern:'在時代激蕩的近代', contemporary:'在這個資訊過載的當下' }[era] || eraCN + '，';
        
        // 使用简体内容，然后简繁转换
        var starOpenings = {
            '紫微': [
                `${eraDescTW}，${name}終於登上了${pronoun}夢寐以求的位置——但沒人告訴${pronoun}，王座是個陷阱。`,
                `${name}一直以為自己天生就是領袖，直到那一天，${pronoun}發現${pronoun}管的人都在騙${pronoun}。`,
                `所有人都服從${name}，只有一個人不服——而那個人，後來成了${pronoun}唯一真正的朋友。`
            ],
            '天机': [
                `${name}把所有的棋都算到了最後一步，唯獨沒有算到——有人根本不按棋盤走。`,
                `${eraDescTW}，${name}以為${pronoun}找到了改變命運的方法，${pronoun}不知道的是，這個"方法"本身是別人的局。`,
                `${name}喜歡研究人，${pronoun}覺得自己已經看透了所有人——除了鏡子裡那個。`
            ],
            '太阳': [
                `${name}一生都在照亮別人，${eraDescTW}，${pronoun}第一次意識到：${pronoun}根本不知道自己是誰。`,
                `${pronoun}以為只要足夠熱情，就能改變任何事——這個信念在${name}第一次真正失敗時徹底碎了。`,
                `所有人都愛${name}，但沒有人真的了解${pronoun}——這是${pronoun}用了半輩子才明白的事。`
            ],
            '武曲': [
                `${name}一直相信：沒有錢解決不了的問題，有的話就是錢不夠多。${eraDescTW}，${pronoun}遇到了那個例外。`,
                `${pronoun}用行動證明了一切，但最後發現：有些事，證明給別人看，不如證明給自己看。`,
                `${name}的邏輯是：做到就行，為什麼要說？${eraDescTW}，這個邏輯第一次出了問題。`
            ],
            '天同': [
                `${name}一直覺得，只要讓大家都高興，就沒有過不去的坎——直到${pronoun}發現，有人利用了${pronoun}這個信念。`,
                `${eraDescTW}，${name}用溫柔撐過了所有難關，但有一天${pronoun}撐不住了，${pronoun}甚至不知道該找誰。`,
                `${pronoun}總說"沒事的"——最後一次說這句話的時候，${name}終於哭出來了。`
            ],
            '廉贞': [
                `${name}在慾望和規則之間走了一輩子鋼絲，${eraDescTW}，繩子斷了。`,
                `${pronoun}一直告訴自己：我只是在玩這個遊戲，我隨時可以停——直到${pronoun}停不下來。`,
                `${name}做了一件違背${pronoun}自己原則的事，${pronoun}本以為沒人知道——但${pronoun}自己知道。`
            ],
            '天府': [
                `${name}守住了${pronoun}所有想守住的東西，${eraDescTW}，${pronoun}守住了，但${pronoun}失去了別的什麼。`,
                `${pronoun}一直以為穩定是最好的——那個改變${pronoun}一生的人，出現在${pronoun}最不需要改變的時候。`,
                `${name}第一次讓自己"放手"，結果發現：${pronoun}已經不知道怎麼不守著什麼了。`
            ],
            '太阴': [
                `${eraDescTW}，沒有人知道${name}內心那片海。${pronoun}本來也不打算告訴任何人——直到那個人問了。`,
                `${pronoun}把所有的感受都寫下來，沒有寫完的那篇，成了${pronoun}一生最重要的線索。`,
                `${name}以為${pronoun}只是敏感，${eraDescTW}，${pronoun}發現那不是敏感，是${pronoun}一直在逃避某件事。`
            ],
            '贪狼': [
                `${name}什麼都想要，${eraDescTW}，${pronoun}終於第一次想要一樣東西——但這一次，${pronoun}得不到。`,
                `所有人都被${name}的魅力吸引，但${pronoun}自己知道：${pronoun}對所有人都是那個角色，對自己是誰？`,
                `${pronoun}的人生一直在"下一個"——直到${pronoun}遇見了不走的那個人，${pronoun}不知道該怎麼辦了。`
            ],
            '巨门': [
                `${name}說出了一句真話，改變了所有人的命運——包括${pronoun}自己的。${eraDescTW}，${pronoun}後悔了嗎？`,
                `${pronoun}一直在說真相，直到${pronoun}遇見了一個比${pronoun}更需要真相的人，${pronoun}說不出口了。`,
                `${name}的嘴從來不饒人，${eraDescTW}，有人第一次讓${pronoun}無話可說。`
            ],
            '天相': [
                `${name}守了規矩一輩子，${eraDescTW}，規矩出賣了${pronoun}。`,
                `${pronoun}一直在調停別人的衝突，${pronoun}沒有注意到：${pronoun}自己早就該有一場衝突了。`,
                `${name}幫了所有人，${eraDescTW}，唯一沒幫到的人是${pronoun}自己。`
            ],
            '天梁': [
                `${name}一生渡人，${eraDescTW}，有人來渡${pronoun}，${pronoun}不知道怎麼接受了。`,
                `${pronoun}以為自己已經看穿了命運，${eraDescTW}，${pronoun}發現還有一個局，${pronoun}在裡面。`,
                `${name}給過無數人人生建議——${pronoun}最難遵守的，是給自己的那一條。`
            ],
            '七杀': [
                `${name}從未輸過——${eraDescTW}，${pronoun}輸了，而且${pronoun}不知道怎麼從這裡站起來。`,
                `${pronoun}一直以為孤獨是代價，值得付出——直到那一天，${pronoun}發現${pronoun}不想再付了。`,
                `${eraDescTW}，${name}第一次遇到了一個不怕${pronoun}的人，${pronoun}不知道該用什麼武器。`
            ],
            '破军': [
                `${name}打碎了所有該打碎的東西，${eraDescTW}，${pronoun}看著廢墟，第一次想建點什麼。`,
                `${pronoun}一直以為破壞是勇氣，那次之後，${pronoun}開始懷疑：${pronoun}只是在逃跑。`,
                `${eraDescTW}，有人問${name}：你到底想要什麼？${pronoun}第一次答不上來。`
            ]
        };
        var sihuaAdditionTW = {
            '化禄型': '（開局順風——但順風背後，藏著真正的考驗。）',
            '化权型': '（開局握有控制權——但控制的需求本身，是最大的失控。）',
            '化科型': '（開局完美——但完美表面下，藏著代價。）',
            '化忌型': '（開局便已帶有某種執念——這個執念驅動整個故事。）'
        };
        var starOps = starOpenings[mainStar] || [
            `${eraDescTW}，${name}生活裡出現了一個小裂痕，${pronoun}沒想到它永遠不會癒合。`,
            `${name}一直相信命運可以被掌控——直到${pronoun}遇見了那個掌控不了的東西。`,
            `${pronoun}以為${pronoun}知道自己究竟是誰。${eraDescTW}，有人讓${pronoun}懷疑了。`
        ];
        var addition = sihuaAdditionTW[sihuaType] || '';
        return starOps.map(function(op, i) {
            return i === 0 ? op + (addition ? ' ' + addition : '') : op;
        });
    }

    // ── 简体中文版（默认）──
    var eraDesc = { ancient:'在朝代更替的乱世中', modern:'在时代激荡的近代', contemporary:'在这个信息过载的当下' }[era] || eraCN + '，';
    
    // 主星×喜剧开端（基于"非英雄"武器：主角相信一个假命题，推动故事发展）
    var starOpenings = {
        '紫微': [
            `${eraDesc}，${name}终于登上了${pronoun}梦寐以求的位置——但没人告诉${pronoun}，王座是个陷阱。`,
            `${name}一直以为自己天生就是领袖，直到那一天，${pronoun}发现${pronoun}管的人都在骗${pronoun}。`,
            `所有人都服从${name}，只有一个人不服——而那个人，后来成了${pronoun}唯一真正的朋友。`
        ],
        '天机': [
            `${name}把所有的棋都算到了最后一步，唯独没有算到——有人根本不按棋盘走。`,
            `${eraDesc}，${name}以为${pronoun}找到了改变命运的方法，${pronoun}不知道的是，这个"方法"本身是别人的局。`,
            `${name}喜欢研究人，${pronoun}觉得自己已经看透了所有人——除了镜子里那个。`
        ],
        '太阳': [
            `${name}一生都在照亮别人，${eraDesc}，${pronoun}第一次意识到：${pronoun}根本不知道自己是谁。`,
            `${pronoun}以为只要足够热情，就能改变任何事——这个信念在${name}第一次真正失败时彻底碎了。`,
            `所有人都爱${name}，但没有人真的了解${pronoun}——这是${pronoun}用了半辈子才明白的事。`
        ],
        '武曲': [
            `${name}一直相信：没有钱解决不了的问题，有的话就是钱不够多。${eraDesc}，${pronoun}遇到了那个例外。`,
            `${pronoun}用行动证明了一切，但最后发现：有些事，证明给别人看，不如证明给自己看。`,
            `${name}的逻辑是：做到就行，为什么要说？${eraDesc}，这个逻辑第一次出了问题。`
        ],
        '天同': [
            `${name}一直觉得，只要让大家都高兴，就没有过不去的坎——直到${pronoun}发现，有人利用了${pronoun}这个信念。`,
            `${eraDesc}，${name}用温柔撑过了所有难关，但有一天${pronoun}撑不住了，${pronoun}甚至不知道该找谁。`,
            `${pronoun}总说"没事的"——最后一次说这句话的时候，${name}终于哭出来了。`
        ],
        '廉贞': [
            `${name}在欲望和规则之间走了一辈子钢丝，${eraDesc}，绳子断了。`,
            `${pronoun}一直告诉自己：我只是在玩这个游戏，我随时可以停——直到${pronoun}停不下来。`,
            `${name}做了一件违背${pronoun}自己原则的事，${pronoun}本以为没人知道——但${pronoun}自己知道。`
        ],
        '天府': [
            `${name}守住了${pronoun}所有想守住的东西，${eraDesc}，${pronoun}守住了，但${pronoun}失去了别的什么。`,
            `${pronoun}一直以为稳定是最好的——那个改变${pronoun}一生的人，出现在${pronoun}最不需要改变的时候。`,
            `${name}第一次让自己"放手"，结果发现：${pronoun}已经不知道怎么不守着什么了。`
        ],
        '太阴': [
            `${eraDesc}，没有人知道${name}内心那片海。${pronoun}本来也不打算告诉任何人——直到那个人问了。`,
            `${pronoun}把所有的感受都写下来，没有写完的那篇，成了${pronoun}一生最重要的线索。`,
            `${name}以为${pronoun}只是敏感，${eraDesc}，${pronoun}发现那不是敏感，是${pronoun}一直在逃避某件事。`
        ],
        '贪狼': [
            `${name}什么都想要，${eraDesc}，${pronoun}终于第一次想要一样东西——但这一次，${pronoun}得不到。`,
            `所有人都被${name}的魅力吸引，但${pronoun}自己知道：${pronoun}对所有人都是那个角色，对自己是谁？`,
            `${pronoun}的人生一直在"下一个"——直到${pronoun}遇见了不走的那个人，${pronoun}不知道该怎么办了。`
        ],
        '巨门': [
            `${name}说出了一句真话，改变了所有人的命运——包括${pronoun}自己的。${eraDesc}，${pronoun}后悔了吗？`,
            `${pronoun}一直在说真相，直到${pronoun}遇见了一个比${pronoun}更需要真相的人，${pronoun}说不出口了。`,
            `${name}的嘴从来不饶人，${eraDesc}，有人第一次让${pronoun}无话可说。`
        ],
        '天相': [
            `${name}守了规矩一辈子，${eraDesc}，规矩出卖了${pronoun}。`,
            `${pronoun}一直在调停别人的冲突，${pronoun}没有注意到：${pronoun}自己早就该有一场冲突了。`,
            `${name}帮了所有人，${eraDesc}，唯一没帮到的人是${pronoun}自己。`
        ],
        '天梁': [
            `${name}一生渡人，${eraDesc}，有人来渡${pronoun}，${pronoun}不知道怎么接受了。`,
            `${pronoun}以为自己已经看穿了命运，${eraDesc}，${pronoun}发现还有一个局，${pronoun}在里面。`,
            `${name}给过无数人人生建议——${pronoun}最难遵守的，是给自己的那一条。`
        ],
        '七杀': [
            `${name}从未输过——${eraDesc}，${pronoun}输了，而且${pronoun}不知道怎么从这里站起来。`,
            `${pronoun}一直以为孤独是代价，值得付出——直到那一天，${pronoun}发现${pronoun}不想再付了。`,
            `${eraDesc}，${name}第一次遇到了一个不怕${pronoun}的人，${pronoun}不知道该用什么武器。`
        ],
        '破军': [
            `${name}打碎了所有该打碎的东西，${eraDesc}，${pronoun}看着废墟，第一次想建点什么。`,
            `${pronoun}一直以为破坏是勇气，那次之后，${pronoun}开始怀疑：${pronoun}只是在逃跑。`,
            `${eraDesc}，有人问${name}：你到底想要什么？${pronoun}第一次答不上来。`
        ]
    };

    // 四化的故事底色加成
    var sihuaAddition = {
        '化禄型': '（开局顺风，但顺风里藏着考题）',
        '化权型': '（开局掌控，但控制欲本身是最大的不可控）',
        '化科型': '（开局完美，但完美的表象下有代价）',
        '化忌型': '（开局就带着一个执念，这个执念推动整个故事）'
    };

    var starOps = starOpenings[mainStar] || [
        `${eraDesc}，${name}的生活在一件小事上出了裂缝，${pronoun}没想到，这条缝从此再没合上。`,
        `${name}一直相信命运是可以掌控的，直到${pronoun}遇见了那件${pronoun}无法掌控的事。`,
        `${pronoun}以为自己清楚地知道自己是谁——${eraDesc}，有人让${pronoun}对这件事产生了疑问。`
    ];

    var addition = sihuaAddition[sihuaType] || '';
    return starOps.map(function(op, i) {
        return i === 0 ? op + (addition ? '　' + addition : '') : op;
    });
}

// ==================== 角色语录生成器 ====================
/**
 * 基于主星×四化×格局生成3句专属台词
 * 每句对应不同侧面：内心独白 / 对他人的话 / 面对命运的态度
 */
function _generateCharacterQuotes(mainStar, sihuaType, patternType, pronoun, era, name, lang) {
    lang = lang || (typeof CURRENT_LANG !== 'undefined' ? CURRENT_LANG : 'zh');

    // ── 英文版语录 ──
    if (lang === 'en') {
        var innerEN = {
            '紫微': ["I'm not cold by nature — I just refuse to let anyone see me waver.", "Solitude is a choice I made. No one handed it to me.", "Being misunderstood? I stopped explaining that a long time ago."],
            '天机': ["People say I think too much. I just can't stop.", "The best game is one where your opponent never knows where they lost.", "I welcome change. What I don't welcome is being changed."],
            '太阳': ["Light isn't meant to illuminate yourself.", "I'm not afraid of being used up. I'm afraid of the day I stop caring.", "Passion isn't performance — but it does wear you out."],
            '武曲': ["Talking straight isn't coldness. It's efficiency.", "Accounts get settled eventually — money or feelings, same rule.", "Someone holding on doesn't need your sympathy. Just stay out of the way."],
            '天同': ["The joy is real. The avoidance is real. They're not contradictions.", "I see the trouble. I just choose to get through today first.", "Gentleness is sometimes a shield. Sometimes it's a blade."],
            '廉贞': ["The complicated things in me aren't my fault. That's just fate.", "Suppressing desire is more dangerous than living with it.", "I'm not a villain. I just won't pretend to be a saint."],
            '天府': ["Holding on to what I have steadies me more than gaining more.", "Stability isn't fear of change. It's knowing what's worth the risk.", "I'm not in a hurry. Time is on the side of the serious."],
            '太阴': ["The moon doesn't shine — but it remembers every night.", "Sensitivity isn't weakness. It's seeing what you missed.", "Some feelings, once spoken, disappear. So I keep quiet."],
            '贪狼': ["I want a lot of things. But there's only one I truly care about.", "Charm isn't calculated. But it is a weapon.", "Desire pushes me forward — and sometimes I wish I could stop and ask where I'm going."],
            '巨门': ["The wrong words are more dangerous than silence.", "I don't distrust everything. I just don't trust easily.", "Some truths hurt to say. Keeping them in hurts worse."],
            '天相': ["I've held up so many people. No one ever thought to ask what I need.", "Rules aren't the absence of freedom. They're the edges I give myself.", "Compliance isn't weakness. I'm just choosing not to make it an issue right now."],
            '天梁': ["I've seen too much. My angle on things is just different from yours.", "Helping people isn't habit — I just can't look away.", "Some obstacles can't be crossed for you. They have to be faced alone."],
            '七杀': ["I don't start fights I'm not sure about. But once I'm sure, I don't stop.", "More people fear me than understand me. That's the trade-off.", "The edge isn't temper. It's my method."],
            '破军': ["If the old won't break, the new can't enter. I just don't cling.", "Chaos is disaster for most people. For me it's material.", "The places I've passed through become rubble — not because of me, but because they were due for it."]
        };
        var sihuaRelEN = {
            '化禄型': ["Come with me. You won't lose out.", "What I give you is what I genuinely believe is good.", "I won't explain everything. But trust me."],
            '化权型': ["On this one, follow my lead. If it goes wrong, that's on me.", "I'm not trying to control you. This is just the right move.", "Keep up. Don't blame me if I don't wait."],
            '化科型': ["I care about your opinion. More than that, I care about whether you're actually okay.", "Sometimes clarity matters more than anything else.", "I don't want to disappoint you — but I'd rather that than let you misread me."],
            '化忌型': ["What you owe me — I don't necessarily need it back. But I remember.", "My inability to let this go isn't my problem. It's that it never had an ending.", "If things had gone differently then, we wouldn't be here now."]
        };
        var patternFateEN = {
            '杀破狼': ["Fate? If you can't carry it, crash through it.", "I'm not lucky. I'm just harder to stop.", "I've lost. But I haven't fallen. That's enough."],
            '紫府廉武相': ["Getting here wasn't fortune. It was every choice I made.", "Some things I'm not rushing. But I'm waiting.", "Calm doesn't mean unafraid. It means I know where I stand."],
            '机月同梁': ["I move with my mind, not with brute force.", "Change arrived. I'd already thought three steps ahead.", "I don't need to make a splash. I just need to keep my footing."],
            '巨日': ["The truth stings. But it's less deadly than a lie.", "I stand in the light because I refuse to hide.", "What can't be covered is better revealed on your own terms."]
        };
        var innerPool = innerEN[mainStar] || ["There are things I'm simply waiting for the right moment on.", "My path doesn't need everyone's approval.", "At this point in my life, I deleted 'afraid' a long time ago."];
        var relPool   = sihuaRelEN[sihuaType] || sihuaRelEN['化禄型'];
        var fatePool  = patternFateEN[patternType] || patternFateEN['杀破狼'];

        var seed = 0;
        if (name) { for (var i = 0; i < name.length; i++) seed += name.charCodeAt(i); }
        seed += (mainStar.charCodeAt(0) || 0);
        return [innerPool[seed % innerPool.length], relPool[(seed + 1) % relPool.length], fatePool[(seed + 2) % fatePool.length]];
    }

    // ── 繁体中文版语录 ──
    if (lang === 'zh-TW') {
        var innerTW = {
            '紫微': ['我不是天生高冷，只是不想讓任何人看見我猶豫的樣子。', '孤獨是我選的，不是別人給的。', '被誤解這件事，我早就不在乎解釋了。'],
            '天机': ['別人以為我想太多，其實我只是停不下來。', '最好的棋局是對方永遠不知道自己輸在哪裡。', '我喜歡變化，但不包括被改變。'],
            '太阳': ['光這東西，不是照亮自己用的。', '我不怕被消耗，怕的是有一天我什麼都不在乎了。', '熱情不是表演出來的，但確實容易讓人累。'],
            '武曲': ['我說話直不是不懂溫柔，只是浪費時間。', '賬總要算清楚的，不管是錢還是情。', '硬撐著的人，不需要你懂，只需要你別擋路。'],
            '天同': ['快樂是真的，逃避也是真的，兩件事不矛盾。', '我不是看不見麻煩，只是選擇先過今天。', '溫柔有時候是盾，有時候是刀。'],
            '廉贞': ['我身上那些複雜的東西，不是我的錯，是命。', '慾望這東西，壓著更危險。', '我不是壞人，只是不願假裝成好人。'],
            '天府': ['守住的東西，比得到的東西更讓我踏實。', '穩不是保守，是知道什麼值得豁出去。', '我不急，時間站在認真的人這邊。'],
            '太阴': ['月亮不發光，但它記得所有的夜晚。', '我細膩不是軟弱，是看見了你們沒看見的東西。', '有些感受講出來就沒了，所以我不說。'],
            '贪狼': ['我想要的東西太多，但我真正在乎的只有一件。', '魅力不是刻意的，但確實是武器。', '慾望推著我往前，偶爾我也想停下來問問自己去哪。'],
            '巨门': ['話這東西，說錯了比不說更麻煩。', '我不是懷疑一切，只是不輕易信任。', '有些真相，說出來傷人，不說憋死自己。'],
            '天相': ['我支撐了那麼多人，沒人問過我需要什麼。', '有規矩不是沒自由，是給自己一個邊界。', '溫順不等於好欺負，我只是暫時不計較。'],
            '天梁': ['我見過太多，所以看事情的角度跟你們不一樣。', '幫人不是習慣，是我沒辦法視而不見。', '有些坎，不是別人能替你過的。'],
            '七杀': ['我從來不打沒把握的仗，但打定了就不回頭。', '怕我的人多，懂我的人少，這就是代價。', '鋒芒不是脾氣，是我的方式。'],
            '破军': ['舊的不破，新的進不來，我只是不留戀。', '混亂對別人是災難，對我是素材。', '我走過的地方變成廢墟，不是我的錯，是那些地方該變了。']
        };
        var sihuaRelTW = {
            '化禄型': ['你跟著我，不會虧的。', '我給你的，是我真心覺得好的東西。', '有些事我不解釋，但你要相信我。'],
            '化权型': ['這件事你聽我的，出了事我負責。', '我不是要控制你，只是這樣做是對的。', '跟我走，走慢了別怪我不等。'],
            '化科型': ['我在乎你的看法，但更在乎你是否真的好。', '有些道理講清楚了，比什麼都重要。', '我不想讓你失望，但更不想讓你誤解。'],
            '化忌型': ['你欠我的，不一定是要你還，但我記得。', '放不下這件事不是我的問題，是這件事本身沒結局。', '如果當初不一樣，我們現在也會不一樣。']
        };
        var patternFateTW = {
            '杀破狼': ['命運這東西，扛不住就撞碎它。', '我不是命好，是命攔不住我。', '輸過，但沒倒過，這就夠了。'],
            '紫府廉武相': ['走到這一步，不是運氣，是我自己選的每一步。', '有些事我不著急，但我在等。', '穩不是因為不怕，是因為心裡有數。'],
            '机月同梁': ['我選擇用腦子走，不用蠻力撞。', '變化來了，我已經算好了三步之後。', '不求一鳴驚人，但求走得踏實。'],
            '巨日': ['真話難聽，但比假話要人命。', '我站在光裡，是因為不願意躲。', '遮不住的東西，不如主動亮出來。']
        };
        var innerPool   = innerTW[mainStar]     || ['有些事我只是在等一個時機。', '我的路，不需要所有人都懂。', '活到這份上，怕字早就刪了。'];
        var relPool     = sihuaRelTW[sihuaType]  || sihuaRelTW['化禄型'];
        var fatePool    = patternFateTW[patternType] || patternFateTW['杀破狼'];
        
        var seed = 0;
        if (name) { for (var i = 0; i < name.length; i++) seed += name.charCodeAt(i); }
        seed += (mainStar.charCodeAt(0) || 0);
        return [innerPool[seed % innerPool.length], relPool[(seed + 1) % relPool.length], fatePool[(seed + 2) % fatePool.length]];
    }

    // ── 简体中文版（原始）──
    var innerQuotes = {
        '紫微': ['我不是天生高冷，只是不想让任何人看见我犹豫的样子。', '孤独是我选的，不是别人给的。', '被误解这件事，我早就不在乎解释了。'],
        '天机': ['别人以为我想太多，其实我只是停不下来。', '最好的棋局是对方永远不知道自己输在哪里。', '我喜欢变化，但不包括被改变。'],
        '太阳': ['光这东西，不是照亮自己用的。', '我不怕被消耗，怕的是有一天我什么都不在乎了。', '热情不是表演出来的，但确实容易让人累。'],
        '武曲': ['我说话直不是不懂温柔，只是浪费时间。', '账总要算清楚的，不管是钱还是情。', '硬撑着的人，不需要你懂，只需要你别挡路。'],
        '天同': ['快乐是真的，逃避也是真的，两件事不矛盾。', '我不是看不见麻烦，只是选择先过今天。', '温柔有时候是盾，有时候是刀。'],
        '廉贞': ['我身上那些复杂的东西，不是我的错，是命。', '欲望这东西，压着更危险。', '我不是坏人，只是不愿假装成好人。'],
        '天府': ['守住的东西，比得到的东西更让我踏实。', '稳不是保守，是知道什么值得豁出去。', '我不急，时间站在认真的人这边。'],
        '太阴': ['月亮不发光，但它记得所有的夜晚。', '我细腻不是软弱，是看见了你们没看见的东西。', '有些感受讲出来就没了，所以我不说。'],
        '贪狼': ['我想要的东西太多，但我真正在乎的只有一件。', '魅力不是刻意的，但确实是武器。', '欲望推着我往前，偶尔我也想停下来问问自己去哪。'],
        '巨门': ['话这东西，说错了比不说更麻烦。', '我不是怀疑一切，只是不轻易信任。', '有些真相，说出来伤人，不说憋死自己。'],
        '天相': ['我支撑了那么多人，没人问过我需要什么。', '有规矩不是没自由，是给自己一个边界。', '温顺不等于好欺负，我只是暂时不计较。'],
        '天梁': ['我见过太多，所以看事情的角度跟你们不一样。', '帮人不是习惯，是我没办法视而不见。', '有些坎，不是别人能替你过的。'],
        '七杀': ['我从来不打没把握的仗，但打定了就不回头。', '怕我的人多，懂我的人少，这就是代价。', '锋芒不是脾气，是我的方式。'],
        '破军': ['旧的不破，新的进不来，我只是不留恋。', '混乱对别人是灾难，对我是素材。', '我走过的地方变成废墟，不是我的错，是那些地方该变了。']
    };

    // 四化·对他人的话（说给关系里的人听的）
    var sihuaRelQuotes = {
        '化禄型': ['你跟着我，不会亏的。', '我给你的，是我真心觉得好的东西。', '有些事我不解释，但你要相信我。'],
        '化权型': ['这件事你听我的，出了事我负责。', '我不是要控制你，只是这样做是对的。', '跟我走，走慢了别怪我不等。'],
        '化科型': ['我在乎你的看法，但更在乎你是否真的好。', '有些道理讲清楚了，比什么都重要。', '我不想让你失望，但更不想让你误解。'],
        '化忌型': ['你欠我的，不一定是要你还，但我记得。', '放不下这件事不是我的问题，是这件事本身没结局。', '如果当初不一样，我们现在也会不一样。']
    };

    // 格局·面对命运的态度
    var patternFateQuotes = {
        '杀破狼': ['命运这东西，扛不住就撞碎它。', '我不是命好，是命拦不住我。', '输过，但没倒过，这就够了。'],
        '紫府廉武相': ['走到这一步，不是运气，是我自己选的每一步。', '有些事我不着急，但我在等。', '稳不是因为不怕，是因为心里有数。'],
        '机月同梁': ['我选择用脑子走，不用蛮力撞。', '变化来了，我已经算好了三步之后。', '不求一鸣惊人，但求走得踏实。'],
        '巨日': ['真话难听，但比假话要人命。', '我站在光里，是因为不愿意躲。', '遮不住的东西，不如主动亮出来。']
    };

    var innerPool   = innerQuotes[mainStar]     || ['有些事我只是在等一个时机。', '我的路，不需要所有人都懂。', '活到这份上，怕字早就删了。'];
    var relPool     = sihuaRelQuotes[sihuaType]  || sihuaRelQuotes['化禄型'];
    var fatePool    = patternFateQuotes[patternType] || patternFateQuotes['杀破狼'];

    // 用名字+主星的 charCode 做种子，保证同一角色每次一样
    var seed = 0;
    if (name) { for (var i = 0; i < name.length; i++) seed += name.charCodeAt(i); }
    seed += (mainStar.charCodeAt(0) || 0);

    return [
        innerPool[seed % innerPool.length],
        relPool[(seed + 1) % relPool.length],
        fatePool[(seed + 2) % fatePool.length]
    ];
}

// 挂载为独立命名，避免与 app-v2.js 的桥接函数同名覆盖
window._ziweiCoreGenerateBio = generateZiweiCharacterBio;
