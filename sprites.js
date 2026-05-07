// ═══════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════
const canvas=document.getElementById('gc'),ctx=canvas.getContext('2d');
const wrap=document.getElementById('wrap');
function resize(){canvas.width=wrap.clientWidth;canvas.height=wrap.clientHeight}
resize();window.addEventListener('resize',resize);
const W=()=>canvas.width,H=()=>canvas.height;
const keys={},dpState={u:0,d:0,l:0,r:0};
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key!=='F5')e.preventDefault()});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
function dp(d,v){dpState[d]=v;document.getElementById('dp-'+d).classList.toggle('held',v===1)}

// ═══════════════════════════════════════════════════
// SPRITE HELPERS
// ═══════════════════════════════════════════════════
function mkSpr(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));return c}
function px(c,x,y,col){if(!col||col==='.'||col===' ')return;c.fillStyle=col;c.fillRect(x,y,1,1)}
function drawRows(c,rows,pal){rows.forEach((row,y)=>[...row].forEach((k,x)=>{if(pal[k])px(c,x,y,pal[k])}))}
function arc(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function ellip(c,x,y,rx,ry,col,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();c.restore()}

// ═══════════════════════════════════════════════════
// CHARACTER SPRITES (16x16)
// ═══════════════════════════════════════════════════
const SPR={};
SPR.hero=mkSpr(16,16,c=>{drawRows(c,['....HHHHHH.....','...HWWWWWwH....','..HWSSWWSwH....','..HWSrrWSwH....','..HWWWWWSWH....','...HHHgHHH.....','..BBBBGBBBB....','.BDDDDGDDDDB...','BDDDLGLDDDDB...','BDDDLGLDDDDB...','..BBBGGGBBB....','..BsB...BsB....','..BsB...BsB....', '.KssK...KssK...','..KK.....KK....','...............'],{W:'#f5ead0',S:'#c8a870',H:'#1a1a2e',B:'#2176ae',D:'#1450a3',G:'#c9a84c',K:'#0d1b2a',L:'#4fc3f7',s:'#8a6030',g:'#e8c96d',w:'#fff',r:'#ff6b6b'});c.fillStyle='#c0c0c0';c.fillRect(14,5,1,7);c.fillStyle='#c9a84c';c.fillRect(12,8,3,1);c.fillStyle='#8a6030';c.fillRect(13,9,1,2)});
SPR.hero2=mkSpr(16,16,c=>{drawRows(c,['....HHHHHH.....','...HWWWWWwH....','..HWSSWWSwH....','..HWSrrWSwH....','..HWWWWWSWH....','...HHHgHHH.....','..BBBBGBBBB....', '.BDDDDGDDDDB...','BDDDLGLDDDDB...','BDDDLGLDDDDB...','..BBBGGGBBB....','..ssBB...BBss..','..sB.....Bs....', '.KsK.....KsK...','..K.......K....','...............'],{W:'#f5ead0',S:'#c8a870',H:'#1a1a2e',B:'#2176ae',D:'#1450a3',G:'#c9a84c',K:'#0d1b2a',L:'#4fc3f7',s:'#8a6030',g:'#e8c96d',w:'#fff',r:'#ff6b6b'});c.fillStyle='#c0c0c0';c.fillRect(14,5,1,7);c.fillStyle='#c9a84c';c.fillRect(12,8,3,1)});
SPR.yao=mkSpr(16,16,c=>{drawRows(c,['....rRRRRr.....','...RrrrrrRr....','..Rrr..rrrR....','..RreyrreR.....','..RrrrrrrR.....','...RRoooRR.....','..rRRRRRRRr....', '.rRwwRRRwwRr...','rRRwwwRRwwwRR..','..rRRRRRRRRr...','..rRRoooRRr....','...rRrrrRr.....','....RRRR.......','...rRR.RRr.....','...rR...Rr.....','...............'],{R:'#8b0000',r:'#cc2200',o:'#ff4400',y:'#ffaa00',e:'#ff6600',w:'#ffcc88'})});
SPR.tatu=mkSpr(16,16,c=>{drawRows(c,['....PPPPPP.....','...PLLLLLLp....','..PLWWWWWLp....','..PLWrrWWLp....','..PLWWWWWLp....','...PpgpPp......','..BBBBBBBBB....', '.BPPPPgPPPPB...','BPPLrLrPPPPB...','BPPLrLrPPPPB...','..BBBBBBBBB....','..PnP...PnP....','..PnP...PnP....', '.KnnK...KnnK...','..KK.....KK....','...............'],{P:'#4a0080',p:'#7b2fbe',L:'#b14aff',W:'#f0e0ff',B:'#1a0030',g:'#c9a84c',n:'#2a0050',r:'#ff2288',K:'#0a0010'})});
SPR.boss=mkSpr(32,32,c=>{
  const p={G:'#1a5c2a',g:'#2d8a40',L:'#4ab85a',Y:'#e8c96d',r:'#e74c3c',R:'#c0392b',o:'#ff8c00',e:'#ffcc00',n:'#0d2b0d'};
  drawRows(c,['........GGGGGGGGGGGGGGgg........','.......GgggggggggggggggGG.......','......GggLLLLLLLLLLLggGG.......','....GggLLeYYeYYeLLggG..........','....GgLLerrrrreLLgGG...........','....GgLLeYYeYYeLLgGG...........','....GgggLLLLLLLggG.............','...GGgggggggggggGGG............','..GYGGGGgggggGGGYGG............','.GYYGooooooooooGYYG............','GYYGGooooooooooGGYYG...........','GYYGooooRRRRooooGYYG...........','GYYGGooooooooooGGYYG...........','.GYYGooooooooooGYYG............','..GYGGGGGGGGGGGGYGg............','...GGgggggggggggGG.............','....GGGnnnnnGGGG...............','....GnnnnnnnnnG................','....GnnnnnnnG..................','.....GnnnnnnG..................','......GGGGGG...................','............................'],p)});
SPR.chief=mkSpr(16,16,c=>{drawRows(c,['....HHHHHH.....','...HWWWWWwH....','..HWSLWWSgH....','..HWWrrWWgH....','..HWWWWWWgH....','...HHHgHHH.....','..BBBrGrBBB....', '.BBBBrGrBBBB...','BBBBrGrBBBBB...','BBBBrGrBBBBB...','..BBBGGGBBB....','..BKB...BKB....','..BKB...BKB....', '.KKKK...KKKK...','..KK.....KK....','...............'],{W:'#f5ead0',S:'#c8a870',H:'#3a2a0a',B:'#8B4513',G:'#c9a84c',K:'#1a0a00',g:'#e8c96d',w:'#fff',r:'#cc4400',L:'#ffcc88'});c.fillStyle='#8B4513';c.fillRect(14,3,1,12);c.fillStyle='#c9a84c';c.fillRect(13,3,3,2)});
SPR.shop=mkSpr(16,16,c=>{drawRows(c,['....HHHHHH.....','...HWWWWWwH....','..HWSLWWSgH....','..HWWrrWWgH....','..HWWWWWWgH....','...HHHgHHH.....','..BBBrGrBBB....', '.BBBBrGrBBBB...','BBBBrGrBBBBB...','BBBBrGrBBBBB...','..BBBGGGBBB....','..BKB...BKB....','..BKB...BKB....', '.KKKK...KKKK...','..KK.....KK....','...............'],{W:'#ffe0d0',S:'#d4a870',H:'#2a1a2a',B:'#6B238B',G:'#c9a84c',K:'#0a000a',g:'#e8c96d',w:'#fff',r:'#ff88cc',L:'#ffaaee'})});
SPR.ally=mkSpr(16,16,c=>{drawRows(c,['....HHHHHH.....','...HWWWWWwH....','..HWWLWWLwH....','..HWWrrWWwH....','..HWWWWWWwH....','...HHHgHHH.....','..BBBBGBBBB....', '.BDDDDGDDDDB...','BDDDLGLDDDDB...','BDDDLGLDDDDB...','..BBBGGGBBB....','..BsB...BsB....','..BsB...BsB....', '.KssK...KssK...','..KK.....KK....','...............'],{W:'#d0f0d0',H:'#0a2a0a',B:'#1a6a1a',D:'#145a14',G:'#c9a84c',K:'#051005',L:'#aaffaa',s:'#5a3a10',g:'#e8c96d',w:'#fff',r:'#ffaaaa'});c.fillStyle='#8a6030';c.fillRect(14,2,1,12);c.fillStyle='#c0c0c0';c.fillRect(14,1,1,3)});
SPR.guard=mkSpr(16,16,c=>{drawRows(c,['....HHHHHH.....','...HWWWWWwH....','..HWWLWWLwH....','..HWWrrWWwH....','..HWWWWWWwH....','...HHHgHHH.....','..BBBBGBBBB....', '.BDDDDGDDDDB...','BDDDLGLDDDDB...','BDDDLGLDDDDB...','..BBBGGGBBB....','..BsB...BsB....','..BsB...BsB....', '.KssK...KssK...','..KK.....KK....','...............'],{W:'#ffcccc',H:'#2a0000',B:'#550000',D:'#440000',G:'#880000',K:'#1a0000',L:'#ff8888',s:'#3a1a1a',g:'#cc0000',w:'#fff',r:'#ffaaaa'});c.fillStyle='#888';c.fillRect(14,6,1,6);c.fillStyle='#cc0000';c.fillRect(13,9,3,1)});

// ═══════════════════════════════════════════════════
// TILE SPRITES (32x32) — Top-down RPG style
// ═══════════════════════════════════════════════════
const T={};

// ── CỎ — nền xanh mềm, có biến thể texture ──
T.grass=mkSpr(32,32,c=>{
  // Nền cỏ
  const g=c.createLinearGradient(0,0,32,32);
  g.addColorStop(0,'#5c9438');g.addColorStop(1,'#4e8030');
  c.fillStyle=g;c.fillRect(0,0,32,32);
  // Texture vi tế — chấm sáng tối
  [[4,3,'#6aaa42'],[10,7,'#4a7828'],[18,4,'#6aaa42'],[26,9,'#4a7828'],
   [2,14,'#4a7828'],[8,18,'#6aaa42'],[16,15,'#4a7828'],[24,19,'#6aaa42'],
   [5,24,'#6aaa42'],[13,27,'#4a7828'],[21,23,'#6aaa42'],[29,26,'#4a7828']
  ].forEach(([x,y,col])=>{c.fillStyle=col;c.fillRect(x,y,3,1);c.fillRect(x+1,y+1,2,1)});
  // Ngọn cỏ nhỏ — rải rác tự nhiên
  [[3,6],[11,2],[20,8],[28,5],[1,16],[9,20],[17,13],[25,22],[6,28],[14,25],[22,29],[30,17]
  ].forEach(([x,y])=>{c.fillStyle='#78c048';c.fillRect(x,y,1,3);c.fillStyle='#90d858';c.fillRect(x,y,1,1)});
});

// ── ĐƯỜNG ĐẤT — nâu ấm, có đá sỏi nhỏ ──
T.path=mkSpr(32,32,c=>{
  c.fillStyle='#9c7248';c.fillRect(0,0,32,32);
  // Texture đất
  [[0,0,10,8,'#a87c50'],[11,0,10,8,'#906840'],[22,0,10,8,'#a87c50'],
   [5,8,10,8,'#906840'],[16,8,10,8,'#a87c50'],[0,16,10,8,'#906840'],
   [11,16,10,8,'#a87c50'],[22,16,10,8,'#906840'],[5,24,10,8,'#a87c50'],[16,24,10,8,'#906840']
  ].forEach(([x,y,w,h,col])=>{c.fillStyle=col;c.fillRect(x,y,w,h)});
  // Sỏi nhỏ
  [[4,4,'#7a5830'],[14,10,'#c0a070'],[24,6,'#7a5830'],[8,20,'#c0a070'],
   [20,24,'#7a5830'],[28,15,'#c0a070'],[2,28,'#7a5830'],[16,2,'#c0a070']
  ].forEach(([x,y,col])=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,2,1.5,0,0,Math.PI*2);c.fill()});
});

// ── TƯỜNG ĐÁ — gạch xây chắc chắn ──
T.wall=mkSpr(32,32,c=>{
  c.fillStyle='#3a3030';c.fillRect(0,0,32,32);
  // Gạch lệch hàng (Flemish bond)
  const bricks=[[0,0,14,7],[15,0,17,7],[0,8,8,7],[9,8,14,7],[24,8,8,7],[0,16,14,7],[15,16,17,7],[0,24,8,7],[9,24,14,7],[24,24,8,7]];
  bricks.forEach(([x,y,w,h])=>{
    c.fillStyle='#524848';c.fillRect(x,y,w,h);
    c.fillStyle='#625858';c.fillRect(x+1,y+1,w-2,3);
    c.fillStyle='#3a3030';c.fillRect(x,y+h,w,1);
  });
  // Mortar lines
  c.fillStyle='#2a2020';
  [8,16,24].forEach(y=>c.fillRect(0,y,32,1));
  c.fillRect(15,0,1,8);c.fillRect(9,8,1,8);c.fillRect(24,8,1,8);c.fillRect(15,16,1,8);c.fillRect(9,24,1,8);c.fillRect(24,24,1,8);
  // Highlight trên cùng
  c.fillStyle='rgba(255,255,255,0.06)';c.fillRect(0,0,32,2);
});

// ── CÂY — tán tròn đẹp, có chiều sâu, bóng đổ ──
T.tree=mkSpr(32,32,c=>{
  // Bóng đổ dưới đất (ellipse nghiêng)
  ellip(c,18,29,9,3,'#000000',0.18);
  // Thân cây — nâu có vân
  c.fillStyle='#5c3a1a';c.fillRect(13,20,6,12);
  c.fillStyle='#6e4a22';c.fillRect(14,20,3,12);
  c.fillStyle='#4a2e12';c.fillRect(13,24,1,8);c.fillRect(18,22,1,6);
  // Tán lá — 4 lớp tạo hiệu ứng 3D
  arc(c,16,13,13,'#1e5e14');   // lớp ngoài tối
  arc(c,15,12,11,'#2a7a1c');   // lớp giữa
  arc(c,15,11,9,'#36962a');    // lớp sáng
  arc(c,14,9,6,'#44b030');     // lớp trên sáng
  arc(c,13,8,4,'#58c83a');     // highlight
  // Chi tiết lá
  c.fillStyle='#4ab828';
  [[10,6,4,3],[17,7,5,3],[8,12,4,3],[20,11,4,3],[11,15,3,2],[19,14,3,2]].forEach(([x,y,w,h])=>c.fillRect(x,y,w,h));
  // Điểm sáng nhất
  arc(c,12,7,2,'#70e048');
});

// ── CÂY TỐI (rừng) ──
T.treeD=mkSpr(32,32,c=>{
  ellip(c,18,29,9,3,'#000000',0.25);
  c.fillStyle='#2a1a08';c.fillRect(13,20,6,12);c.fillStyle='#3a2810';c.fillRect(14,20,3,12);
  arc(c,16,13,13,'#0e3008');
  arc(c,15,12,11,'#163810');
  arc(c,15,11,9,'#1e4814');
  arc(c,14,9,6,'#265a18');
  arc(c,13,8,4,'#306820');
  c.fillStyle='#285818';[[10,6,4,3],[17,7,5,3],[8,12,4,3],[20,11,4,3]].forEach(([x,y,w,h])=>c.fillRect(x,y,w,h));
  arc(c,12,7,2,'#3a7824');
});

// ── ĐÁ TẢNG — khối 3D nhìn từ trên xuống ──
T.rock=mkSpr(32,32,c=>{
  // Bóng
  ellip(c,18,28,11,4,'#000000',0.2);
  // Mặt đá chính
  c.fillStyle='#6a6058';
  c.beginPath();c.ellipse(15,14,13,10,0,0,Math.PI*2);c.fill();
  // Gradient sáng tối
  c.fillStyle='#7a7068';
  c.beginPath();c.ellipse(14,13,10,8,0,0,Math.PI*2);c.fill();
  c.fillStyle='#8a8078';
  c.beginPath();c.ellipse(13,12,7,5,0,0,Math.PI*2);c.fill();
  // Highlight
  c.fillStyle='#a09888';
  c.beginPath();c.ellipse(11,10,4,3,-0.3,0,Math.PI*2);c.fill();
  c.fillStyle='#c0b8a8';
  c.beginPath();c.ellipse(10,9,2,1.5,-0.3,0,Math.PI*2);c.fill();
  // Mảnh vỡ/vết nứt
  c.strokeStyle='#4a4038';c.lineWidth=1;
  c.beginPath();c.moveTo(14,8);c.lineTo(18,14);c.lineTo(16,18);c.stroke();
  c.beginPath();c.moveTo(8,12);c.lineTo(12,16);c.stroke();
});

// ── NHÀ DÂN (48x48) — top-down đúng logic ──
// Logic: nhìn từ trên xuống hơi nghiêng — thấy mái + tường phía trước
T.house=mkSpr(48,48,c=>{
  // Bóng nhà
  ellip(c,28,45,18,4,'#000000',0.2);

  // === MẶT SÀN / NỀN NHÀ (top-down view) ===
  c.fillStyle='#c8a870';c.fillRect(6,18,36,28); // nền tường

  // === MÁI NHÀ (phần trên, nhìn từ trên xuống) ===
  // Mái là hình thang nhìn từ trên — to ở trên nhỏ ở dưới
  c.fillStyle='#8a2818';
  c.beginPath();c.moveTo(4,4);c.lineTo(44,4);c.lineTo(42,18);c.lineTo(6,18);c.closePath();c.fill();
  // Chi tiết ngói — các đường ngang
  for(let row=0;row<4;row++){
    const y=6+row*3,x1=4+row*0.5,x2=44-row*0.5;
    c.fillStyle=row%2===0?'#a03020':'#be3828';
    for(let i=0;i<6;i++){const bx=x1+(x2-x1)/6*i;c.fillRect(bx,y,(x2-x1)/6-1,2)}
  }
  // Đường gờ mái
  c.fillStyle='#c84030';c.fillRect(4,4,40,2);
  c.fillStyle='#e05040';c.fillRect(5,4,38,1);
  // Đỉnh mái (ridge)
  c.fillStyle='#703018';c.fillRect(20,2,8,3);c.fillRect(18,3,12,1);

  // === TƯỜNG PHÍA TRƯỚC (phần dưới) ===
  c.fillStyle='#d4b878';c.fillRect(6,18,36,28);
  // Viền tường
  c.fillStyle='#b89858';c.fillRect(6,18,36,2);  // gờ trên
  c.fillStyle='#c0a060';c.fillRect(6,44,36,2);  // nền
  c.fillStyle='#a88848';c.fillRect(6,18,2,28);c.fillRect(40,18,2,28); // viền bên

  // Cửa chính — chính giữa
  c.fillStyle='#6b3e18';c.fillRect(19,28,10,18);
  c.fillStyle='#7d5028';c.fillRect(20,29,4,10);c.fillRect(25,29,4,10);
  c.fillStyle='rgba(0,0,0,0.3)';c.fillRect(19,28,10,3);
  // Tay nắm cửa
  c.fillStyle='#c9a84c';c.fillRect(28,37,2,2);

  // Cửa sổ — 2 bên
  [[8,22,10,10],[30,22,10,10]].forEach(([x,y,w,h])=>{
    // Khung cửa sổ
    c.fillStyle='#7a5030';c.fillRect(x,y,w,h);
    // Kính
    c.fillStyle='#b8d8e8';c.fillRect(x+1,y+1,w-2,h-2);
    // Phản chiếu sáng
    c.fillStyle='rgba(255,255,255,0.4)';c.fillRect(x+1,y+1,w/2-1,2);c.fillRect(x+1,y+1,2,h/2-1);
    // Ô kính
    c.fillStyle='#5a3a18';c.fillRect(x+w/2,y,1,h);c.fillRect(x,y+h/2,w,1);
  });

  // Viền cửa sổ
  c.strokeStyle='#8a6030';c.lineWidth=1;
  [[8,22,10,10],[30,22,10,10]].forEach(([x,y,w,h])=>c.strokeRect(x,y,w,h));
});

// ── CỬA HÀNG (48x48) — mái vàng đặc trưng ──
T.shopbld=mkSpr(48,48,c=>{
  ellip(c,28,45,18,4,'#000000',0.2);

  // Nền tường vàng
  c.fillStyle='#c09040';c.fillRect(6,18,36,28);

  // Mái vàng gold — đặc trưng cửa hàng
  c.fillStyle='#b07818';
  c.beginPath();c.moveTo(2,4);c.lineTo(46,4);c.lineTo(42,18);c.lineTo(6,18);c.closePath();c.fill();
  // Chi tiết mái vàng
  for(let row=0;row<4;row++){
    const y=6+row*3,x1=2+row*1,x2=46-row*1;
    c.fillStyle=row%2===0?'#d4961e':'#e8aa28';
    for(let i=0;i<5;i++){const bx=x1+(x2-x1)/5*i;c.fillRect(bx,y,(x2-x1)/5-1,2)}
  }
  c.fillStyle='#f0c030';c.fillRect(2,4,44,2);
  c.fillStyle='#f8d840';c.fillRect(3,4,42,1);

  // Tường vàng
  c.fillStyle='#c89848';c.fillRect(6,18,36,28);
  c.fillStyle='#a87830';c.fillRect(6,18,36,2);c.fillRect(6,18,2,28);c.fillRect(40,18,2,28);

  // Bảng hiệu — nổi bật
  c.fillStyle='#8B1818';c.fillRect(8,20,32,8);
  c.fillStyle='#aa2020';c.fillRect(9,21,30,6);
  c.fillStyle='#f0e040';c.fillRect(9,20,30,1);c.fillRect(9,28,30,1);
  // Chữ trên bảng (pixel art)
  c.fillStyle='#ffe880';
  [[10,23,3,3],[15,23,3,3],[20,23,3,3],[25,23,3,3],[30,23,3,3],[35,23,3,3]].forEach(([x,y,w,h])=>c.fillRect(x,y,w,h));

  // Cửa chính đôi
  c.fillStyle='#7d5028';c.fillRect(16,30,6,16);c.fillRect(26,30,6,16);
  c.fillStyle='#8d6030';c.fillRect(17,31,4,8);c.fillRect(27,31,4,8);
  // Khoảng giữa 2 cánh
  c.fillStyle='#5a3818';c.fillRect(22,30,4,16);
  // Tay nắm
  c.fillStyle='#e8c96d';c.fillRect(21,38,2,2);c.fillRect(25,38,2,2);

  // Cửa sổ nhỏ 2 bên
  [[8,30,8,8],[32,30,8,8]].forEach(([x,y,w,h])=>{
    c.fillStyle='#7a5030';c.fillRect(x,y,w,h);
    c.fillStyle='#d0e8f0';c.fillRect(x+1,y+1,w-2,h-2);
    c.fillStyle='rgba(255,255,255,0.5)';c.fillRect(x+1,y+1,w/2-1,2);
    c.fillStyle='#5a3a18';c.fillRect(x+w/2,y,1,h);c.fillRect(x,y+h/2,w,1);
  });
});

// ── CỔNG DỊCH CHUYỂN — lam ngọc dịu mắt ──
T.portal=mkSpr(32,32,c=>{
  // Nền tối
  c.fillStyle='#0a1418';c.fillRect(0,0,32,32);
  // Vòng tròn ánh sáng lam
  [[15,0.1,'#004848'],[13,0.2,'#006060'],[11,0.3,'#008888'],[9,0.45,'#00aaa0'],[7,0.6,'#00c8b8'],[5,0.8,'#00e0c8'],[3,1,'#40f8e0']].forEach(([r,a,col])=>{
    c.save();c.globalAlpha=a;arc(c,16,16,r,col);c.restore();
  });
  // Hiệu ứng glow
  c.save();c.globalAlpha=0.15;arc(c,16,16,15,'#00e8d0');c.restore();
  // Ký hiệu trong
  c.fillStyle='rgba(0,232,200,0.9)';
  c.fillRect(15,8,2,16);c.fillRect(8,15,16,2);
  c.fillRect(11,11,2,2);c.fillRect(19,11,2,2);c.fillRect(11,19,2,2);c.fillRect(19,19,2,2);
  // Tâm sáng
  arc(c,16,16,2,'#ffffff');
  // Viền ngoài
  c.strokeStyle='rgba(0,200,180,0.5)';c.lineWidth=1;c.strokeRect(1,1,30,30);
});

// ── HANG ĐỘNG ──
T.cave=mkSpr(32,32,c=>{
  c.fillStyle='#0c0810';c.fillRect(0,0,32,32);
  // Miệng hang
  c.fillStyle='#18101e';
  c.beginPath();c.ellipse(16,20,13,10,0,0,Math.PI*2);c.fill();
  c.fillStyle='#241428';
  c.beginPath();c.ellipse(16,21,10,8,0,0,Math.PI*2);c.fill();
  // Bên trong tối
  c.fillStyle='#0a0810';c.beginPath();c.ellipse(16,22,7,5,0,0,Math.PI*2);c.fill();
  // Nhũ đá trên
  c.fillStyle='#1c1020';
  [[6,8,4,7],[12,6,3,5],[18,7,4,6],[24,9,3,5]].forEach(([x,y,w,h])=>{
    c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.lineTo(x+w/2,y+h);c.closePath();c.fill();
  });
  // Ánh tím từ trong
  c.save();c.globalAlpha=0.3;c.fillStyle='#8020c0';c.beginPath();c.ellipse(16,22,6,4,0,0,Math.PI*2);c.fill();c.restore();
  // Viền đá
  c.strokeStyle='#2a1830';c.lineWidth=2;c.beginPath();c.ellipse(16,20,13,10,0,0,Math.PI*2);c.stroke();
});

// ── NƯỚC ANIMATED — xanh dương trong ──
let wFrame=0;const wCache=[];
function getWater(){
  const i=Math.floor(wFrame/8)%8;
  if(!wCache[i]){wCache[i]=mkSpr(32,32,c=>{
    // Nền nước
    const g=c.createLinearGradient(0,0,0,32);
    g.addColorStop(0,'#3898d8');g.addColorStop(1,'#2070b0');
    c.fillStyle=g;c.fillRect(0,0,32,32);
    // Reflection ánh sáng
    c.fillStyle='rgba(180,220,255,0.15)';c.fillRect(0,0,32,8);
    // Sóng — offset theo frame
    const off=i*3;
    c.fillStyle='rgba(200,240,255,0.5)';
    [[off%28,4,10,1],[(off+8)%28,9,8,1],[(off+16)%28,14,12,1],[(off+4)%28,19,9,1],[(off+12)%28,24,11,1],[(off+20)%28,28,8,1]].forEach(([x,y,w,h])=>{
      c.fillRect(x,y,w,h);if(x+w>32)c.fillRect(0,y,x+w-32,h);
    });
    // Highlight nhỏ
    c.fillStyle='rgba(255,255,255,0.3)';
    c.fillRect((off+2)%30,5,3,1);c.fillRect((off+14)%30,15,4,1);c.fillRect((off+22)%30,25,3,1);
    // Viền nước — tạo cảm giác sâu
    c.fillStyle='rgba(20,60,100,0.3)';c.fillRect(0,0,32,2);c.fillRect(0,30,32,2);
  })}
  return wCache[i];
}

// ── CỎ TỐI — rừng hoang ──
T.dforest=mkSpr(32,32,c=>{
  c.fillStyle='#1a2a14';c.fillRect(0,0,32,32);
  // Lá mục, cành khô
  const patches=[[0,0,8,8,'#203018'],[9,0,8,6,'#182410'],[18,1,7,7,'#203018'],[26,0,6,9,'#182410'],[0,9,6,7,'#182410'],[7,8,8,8,'#203018'],[16,9,8,7,'#182410'],[25,10,7,6,'#203018'],[0,18,7,7,'#203018'],[8,17,7,8,'#182410'],[16,18,8,7,'#203018'],[25,17,7,7,'#182410'],[0,26,8,6,'#182410'],[9,25,7,7,'#203018'],[17,26,8,6,'#182410'],[26,25,6,7,'#203018']];
  patches.forEach(([x,y,w,h,col])=>{c.fillStyle=col;c.fillRect(x,y,w,h)});
  // Chi tiết lá khô
  c.fillStyle='#2a3820';[[4,4,3,2],[14,3,2,3],[22,5,3,2],[2,14,2,3],[12,12,3,2],[20,15,2,2],[28,12,2,3],[5,22,3,2],[15,20,2,3],[24,22,3,2],[1,28,2,2],[10,28,3,2],[20,27,2,2],[28,29,2,2]].forEach(([x,y,w,h])=>c.fillRect(x,y,w,h));
});

// ── BOSS TILE — đá nham thạch ──
T.bossTile=mkSpr(32,32,c=>{
  c.fillStyle='#180a08';c.fillRect(0,0,32,32);
  // Mảng đá
  [[0,0,15,8,'#221010'],[16,0,16,8,'#1a0c0c'],[0,9,10,7,'#1a0c0c'],[11,9,12,7,'#221010'],[24,9,8,7,'#1a0c0c'],[0,17,16,8,'#221010'],[17,17,15,8,'#1a0c0c'],[0,25,12,7,'#1a0c0c'],[13,25,10,7,'#221010'],[24,25,8,7,'#1a0c0c']].forEach(([x,y,w,h,col])=>{c.fillStyle=col;c.fillRect(x,y,w,h)});
  // Vết nứt
  c.strokeStyle='#2e1414';c.lineWidth=1;
  c.beginPath();c.moveTo(16,0);c.lineTo(14,10);c.lineTo(18,20);c.lineTo(15,32);c.stroke();
  c.beginPath();c.moveTo(0,16);c.lineTo(10,14);c.lineTo(22,18);c.lineTo(32,15);c.stroke();
  // Ánh lửa nhỏ
  c.fillStyle='rgba(220,40,0,0.1)';c.fillRect(0,0,32,32);
  [[6,7,'rgba(255,80,0,0.15)'],[20,18,'rgba(255,60,0,0.12)'],[10,24,'rgba(255,80,0,0.1)']].forEach(([x,y,col])=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,4,3,0,0,Math.PI*2);c.fill()});
});

// ═══════════════════════════════════════════════════
// DRAW HELPERS
// ═══════════════════════════════════════════════════
function drawSpr(spr,x,y,sc=2,flip=false){
  const sw=spr.width*sc,sh=spr.height*sc;
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(flip){ctx.translate(x+sw,y);ctx.scale(-1,1)}else ctx.translate(x,y);
  ctx.drawImage(spr,0,0,sw,sh);ctx.restore();
}
function drawShadow(x,y,w){
  ctx.save();ctx.globalAlpha=0.2;ctx.fillStyle='#000';
  ctx.beginPath();ctx.ellipse(x+w,y+w*1.6,w*0.75,w*0.25,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function hpBar(x,y,w,pct,col){
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(x,y,w+4,4);
  const g=ctx.createLinearGradient(x,y,x+(w+4)*Math.max(0,pct),y);
  g.addColorStop(0,col);g.addColorStop(1,col+'cc');
  ctx.fillStyle=g;ctx.fillRect(x,y,(w+4)*Math.max(0,pct),4);
}
