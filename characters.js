/* 图片名保持原样；添加角色时复制一个对象即可。图片均从 assets/ 读取。 */
window.CHARACTERS = [
 {id:'leaf',name:'小叶子',subtitle:'把春天，折进下一站。',mood:'林间来信',color:'#56856a',tint:'#eaf1e8',quote:'“下一站，也会有很好的风景吧。”',story:'列车掠过树影，阳光在裙摆上轻轻停靠。小叶子把每一次出发都当作散步：不急着到达，也不舍得错过窗外的一片绿。她的收藏里没有远方的坐标，只有一路捡来的晴天。',tags:['春日漫游','窗边座位','温柔观察者'],details:{'喜欢的事':'收集叶片与沿途风景','随身物件':'夹着车票的手账','相遇地点':'开往春天的慢车'},images:[['TT Image 2.5_1789747697011_0.png','开往春天的列车'],['ResizedImage_2026-09-13_18-35-38_6311[1].jpg','小叶子 · 角色设定'],['1787012499172.png','树影里的春日散步']]},
 {id:'huanye',name:'幻叶',subtitle:'今天，也要尽兴出发。',mood:'青柠频率',color:'#607221',tint:'#f0f3dc',quote:'“绕一点路，说不定能遇见惊喜。”',story:'幻叶总能找到地图外的小路。亮色外套、轻快脚步，还有随时准备出发的好奇心，是她最鲜明的标记。比起计划完整的一天，她更喜欢一个突然冒出来的好主意。',tags:['青柠色','行动派','城市探险'],details:{'喜欢的事':'探索街角的小店','随身物件':'装满灵感的口袋','相遇地点':'午后的十字路口'},images:[['ResizedImage_2026-09-13_18-35-38_1786[4].jpg','幻叶 · 青柠日常']]},
 {id:'duoduo',name:'朵朵',subtitle:'云朵有自己的步调。',mood:'晴空频道',color:'#397dab',tint:'#e7f2fb',quote:'“慢一点，云还没有走远。”',story:'朵朵喜欢把天空想象成一片可以散步的海。蓝白相间的日常里，藏着她小小的冒险：追一朵云、听一阵风，再把这些细碎的快乐认真收好。',tags:['天空蓝','软萌日常','云端漫步'],details:{'喜欢的事':'给云朵起名字','随身物件':'蓝色小饰物','相遇地点':'晴空下的长椅'},images:[['ResizedImage_2026-09-13_18-35-38_9860[2].jpg','朵朵 · 蓝色心情'],['1787457721723.png','朵朵 · 表情与瞬间']]},
 {id:'white',name:'小白',subtitle:'把心事，轻轻靠近。',mood:'奶白絮语',color:'#877087',tint:'#f2edf3',quote:'“陪你待一会儿，就很好。”',story:'小白不擅长热闹的开场，却总能让安静变得柔软。她喜欢毛绒玩具，也喜欢和小黑挨在一起看窗外。那些不必开口的片刻，是她最珍惜的默契。',tags:['猫耳','柔软陪伴','安静时光'],details:{'喜欢的事':'抱着玩偶发呆','亲近的伙伴':'小黑','相遇地点':'有软垫的窗台'},images:[['ResizedImage_2026-09-13_18-35-38_1043[3].jpg','小白与小黑 · 依偎'],['GPT Image 2_1784562073882_0.png','奶白色的午后']]},
 {id:'black',name:'小黑',subtitle:'你的身边，就是好天气。',mood:'夜色拥抱',color:'#725d79',tint:'#eeebf3',quote:'“不用说话，我在听。”',story:'小黑把关心藏在很小的动作里。靠近一点，替伙伴留一个位置，或在困倦的时候安静陪伴。她和小白像一对相互依靠的标点，让普通的一天有了温柔的停顿。',tags:['猫耳','默契搭档','陪伴感'],details:{'喜欢的事':'与小白分享午后','亲近的伙伴':'小白','相遇地点':'温暖的窗边'},images:[['ResizedImage_2026-09-13_18-35-38_1043[3].jpg','小黑与小白 · 依偎']]},
 {id:'nagi',name:'汐音',subtitle:'海风替我说，你好。',mood:'海风手札 · 暂定名',color:'#496b93',tint:'#e9eef5',quote:'“听，风已经先出发了。”',story:'轻扬的衣角像一面小小的帆。汐音把平常的街道走成通往海边的路，脚步里有明朗的节拍。她相信，只要愿意抬头，每一天都能看见新的蓝色。',tags:['水手服','海风','轻快步调'],details:{'喜欢的事':'沿着海岸散步','随身物件':'喜欢的帽子','名称说明':'本站暂定名'},images:[['1786975241394.png','汐音 · 海风起时']]},
 {id:'snow',name:'雪澪',subtitle:'让世界，暂时轻一点。',mood:'初雪信笺 · 暂定名',color:'#627dc0',tint:'#edf0fb',quote:'“这份小小的安静，分给你。”',story:'雪澪像一页还没有写满的信纸，干净、轻盈，带着淡淡的蓝。她会认真留意那些微小的声音：翻页、落雪，还有朋友轻声说出的愿望。',tags:['银白发色','冰蓝','安静陪伴'],details:{'喜欢的事':'在安静处读信','印象颜色':'透明的冰蓝色','名称说明':'本站暂定名'},images:[['1784728692027.png','雪澪 · 初雪档案']]}
];

// 2.0 创作设定：相关人物、交互回想与多语言台词。
const characterExtras = {
 leaf: {related:['huanye'],themeTags:['spring-walk','quiet-time'],memory:['树影','春天'],wish:'愿下一站的阳光，刚好照进你的窗。',quotes:{'ja-JP':'次の駅にも、きっと素敵な景色があるね。','en-US':'There will be a lovely view at the next stop, too.'}},
 huanye: {related:['leaf','nagi'],themeTags:['spring-walk','adventure'],memory:['小路','好奇心'],wish:'今天留一点空白，给不期而遇的惊喜。',quotes:{'ja-JP':'少し遠回りしたら、素敵な発見があるかも。','en-US':'Take a small detour. You might find a surprise.'}},
 duoduo: {related:['snow'],themeTags:['blue-sky','quiet-time'],memory:['天空','云'],wish:'愿你抬头时，总能找到喜欢的那一朵云。',quotes:{'ja-JP':'ゆっくりでいいよ。雲はまだ遠くに行っていない。','en-US':'Take your time. The clouds have not drifted far.'}},
 white: {related:['black'],themeTags:['companionship','quiet-time'],memory:['毛绒玩具','窗外'],wish:'不必急着说什么，安静也能被好好听见。',quotes:{'ja-JP':'少しだけ、そばにいられたら嬉しい。','en-US':'Just sitting beside you for a while is enough.'}},
 black: {related:['white'],themeTags:['companionship','quiet-time'],memory:['靠近','陪伴'],wish:'把疲惫放下，身边的那个位置一直留给你。',quotes:{'ja-JP':'話さなくてもいい。ちゃんと聞いているよ。','en-US':'You do not have to speak. I am listening.'}},
 nagi: {related:['huanye','duoduo'],themeTags:['blue-sky','adventure'],memory:['海边','蓝色'],wish:'愿风带你去想去的地方，也带你平安回来。',quotes:{'ja-JP':'聞いて。風はもう出発している。','en-US':'Listen. The wind has already set off.'}},
 snow: {related:['duoduo'],themeTags:['blue-sky','quiet-time'],memory:['信纸','落雪'],wish:'给今天留一页空白，写下只属于你的心事。',quotes:{'ja-JP':'この小さな静けさを、あなたに分けてあげる。','en-US':'Let me share this little moment of quiet with you.'}}
};
window.CHARACTERS.forEach(c=>Object.assign(c,characterExtras[c.id]||{}));
window.THEMES=[{id:'spring-walk',name:'春日漫游',color:'#56856a'},{id:'blue-sky',name:'蓝色心情',color:'#397dab'},{id:'companionship',name:'柔软陪伴',color:'#877087'},{id:'quiet-time',name:'安静时光',color:'#496b93'},{id:'adventure',name:'轻快冒险',color:'#607221'}];
