// PLAYER
// ═══════════════════════════════════════════════════
const player={
  x:0,y:0,w:16,h:16,spd:2.5,
  hp:1000,maxHp:1000,mp:500,maxMp:500,
  kills:0,deaths:0,level:1,xp:0,
  facing:1,wFrame:0,wTimer:0,
  skillCds:[0,0,0,0,0],skillMaxCds:[0,5000,3000,9000,0],
  invincible:0
};
let gold=200;

// ═══════════════════════════════════════════════════
// SCENE MANAGER
// ═══════════════════════════════════════════════════
const TILE=32;
let currentScene='village';
let fadeAlpha=0,fadeDir=0,fadeTarget='';
let camX=0,camY=0;

// Shared arrays (cleared on scene change)
let enemies=[],projectiles=[],particles=[],floats=[],soldiers=[];
let activeDialog=null,shopOpen=false;
let spawnTimer=0,waveTimer=0,wave=1,bossAlive=false;
let allyTimer=0;

// ── SCENE DEFINITIONS ──
const SCENES={
  village:{
    name:'🏘️ Tân Thủ Thôn', sub:'Khu vực an toàn',
    mw:1280,mh:960,
    bgTile:'grass', safeZone:true,
    spawnX:640,spawnY:600,
    buildMap(){
      const cols=this.mw/TILE,rows=this.mh/TILE,map=[];
      for(let r=0;r<rows;r++){map[r]=[];for(let c=0;c<cols;c++){
        if(r===0||r===rows-1||c===0||c===cols-1){map[r][c]='wall';continue}
        // Sông ngang
        if(r>=12&&r<=13&&c>=6&&c<=cols-7){map[r][c]='water';continue}
        // Đường đất chính (chữ thập qua làng)
        const cx2=Math.floor(cols/2),cy2=Math.floor(rows/2);
        if((c===cx2||c===cx2+1)&&r>2&&r<rows-2){map[r][c]='path';continue}
        if((r===cy2||r===cy2+1)&&c>2&&c<cols-2){map[r][c]='path';continue}
        map[r][c]='grass';
      }}
      return map;
    },
    objects(){
      const cols=1280/TILE,rows=960/TILE;
      const cx=Math.floor(cols/2),cy=Math.floor(rows/2);
      return [
        // Nhà dân
        {type:'house',c:cx-6,r:cy-1,w:2,h:2},
        {type:'house',c:cx-3,r:cy+1,w:2,h:2},
        {type:'house',c:cx+3,r:cy-1,w:2,h:2},
        {type:'house',c:cx+5,r:cy+1,w:2,h:2},
        // Cửa hàng
        {type:'shop',c:cx-1,r:cy+2,w:2,h:2},
        // Cây
        {type:'tree',c:cx-8,r:cy-4},{type:'tree',c:cx+7,r:cy-4},
        {type:'tree',c:cx-8,r:cy+3},{type:'tree',c:cx+7,r:cy+3},
        {type:'tree',c:cx-2,r:cy-5},{type:'tree',c:cx+1,r:cy-5},
        {type:'tree',c:4,r:4},{type:'tree',c:cols-5,r:4},
        {type:'tree',c:4,r:rows-5},{type:'tree',c:cols-5,r:rows-5},
        // Cổng ra rừng (phía bắc)
        {type:'portal',c:cx,r:1,label:'→ Rừng Hoang',target:'forest'},
        // Cổng hang boss (phía đông)
        {type:'cave',c:cols-3,r:Math.floor(rows/2),label:'→ Hang Động',target:'boss'},
      ];
    },
    npcs(){
      const cx=Math.floor(1280/TILE/2)*TILE,cy=Math.floor(960/TILE/2)*TILE;
      return [
        {x:cx+16,y:cy+TILE,w:16,h:16,type:'chief',name:'Trưởng Làng',facing:1,
         dialog:['Chào mừng đến Tân Thủ Thôn!','Hãy ra Rừng Hoang phía Bắc luyện tập.','Cổng Hang Động phía Đông rất nguy hiểm!','Tu luyện chăm chỉ, thiếu hiệp!']},
        {x:cx,y:cy+TILE*3,w:16,h:16,type:'shopkeeper',name:'Chủ Tiệm Linh Dược',facing:-1,
         dialog:['Chào! Đan dược hảo hạng đây!','Mua gì không thiếu hiệp?','Hàng mới về rồi đó!']},
      ];
    }
  },

  forest:{
    name:'🌲 Rừng Hoang', sub:'Wave 1 · Cẩn thận!',
    mw:1600,mh:1200,
    bgTile:'dforest', safeZone:false,
    spawnX:800,spawnY:1100,
    buildMap(){
      const cols=this.mw/TILE,rows=this.mh/TILE,map=[];
      for(let r=0;r<rows;r++){map[r]=[];for(let c=0;c<cols;c++){
        if(r===0||r===rows-1||c===0||c===cols-1){map[r][c]='wall';continue}
        if((r>3&&r<7&&c>3&&c<8)||(r>3&&r<7&&c>cols-9&&c<cols-4)){map[r][c]='wall';continue}
        if(r>rows/2-2&&r<rows/2+2&&c>cols/2-2&&c<cols/2+2){map[r][c]='water';continue}
        map[r][c]='dforest';
      }}
      return map;
    },
    objects(){
      const cols=1600/TILE,rows=1200/TILE;
      return [
        {type:'tree',c:5,r:5},{type:'tree',c:10,r:3},{type:'tree',c:cols-6,r:5},
        {type:'tree',c:5,r:rows-6},{type:'tree',c:cols-6,r:rows-6},
        {type:'rock',c:8,r:rows/2},{type:'rock',c:cols-9,r:rows/2},
        {type:'rock',c:cols/2,r:5},{type:'rock',c:cols/2-3,r:8},
        // Cổng về làng
        {type:'portal',c:Math.floor(cols/2),r:rows-2,label:'← Về Làng',target:'village'},
      ];
    },
    npcs(){return []}
  },

  boss:{
    name:'💀 Hang Động Tử Thần', sub:'Boss đang chờ...',
    mw:960,mh:960,
    bgTile:'bossTile', safeZone:false,
    spawnX:480,spawnY:860,
    buildMap(){
      const cols=this.mw/TILE,rows=this.mh/TILE,map=[];
      for(let r=0;r<rows;r++){map[r]=[];for(let c=0;c<cols;c++){
        if(r===0||r===rows-1||c===0||c===cols-1){map[r][c]='wall';continue}
        if((r<4||r>rows-5)&&(c<4||c>cols-5)){map[r][c]='wall';continue}
        map[r][c]='bossTile';
      }}
      return map;
    },
    objects(){
      const cols=960/TILE,rows=960/TILE;
      return [
        {type:'rock',c:3,r:3},{type:'rock',c:cols-4,r:3},
        {type:'rock',c:3,r:rows-4},{type:'rock',c:cols-4,r:rows-4},
        {type:'portal',c:Math.floor(cols/2),r:rows-2,label:'← Về Làng',target:'village'},
      ];
    },
    npcs(){return []}
  }
};

let sceneMap=[],sceneObjs=[],sceneNpcs=[];
let MAP_W=1280,MAP_H=960;

function loadScene(name,spawnOverride){
  currentScene=name;
  const sc=SCENES[name];
  MAP_W=sc.mw;MAP_H=sc.mh;
  sceneMap=sc.buildMap();
  sceneObjs=sc.objects();
  sceneNpcs=sc.npcs();
  enemies=[];projectiles=[];particles=[];floats=[];soldiers=[];
  activeDialog=null;shopOpen=false;
  spawnTimer=0;waveTimer=0;wave=1;bossAlive=false;allyTimer=0;
  if(spawnOverride){player.x=spawnOverride.x;player.y=spawnOverride.y;}
  else{player.x=sc.spawnX;player.y=sc.spawnY;}
  // Spawn lính đồng minh ở forest
  if(name==='forest'){spawnAlly();spawnAlly();spawnGuard(200,200);spawnGuard(MAP_W-200,200);}
  // Boss scene: spawn boss
  if(name==='boss'&&!bossAlive){spawnBoss();bossAlive=true;}
  document.getElementById('sn').textContent=sc.name;
  document.getElementById('wt').textContent=sc.sub;
}

// Fade transition
function gotoScene(target){
  if(fadeDir!==0)return;
  fadeDir=1;fadeTarget=target;
}
function updateFade(){
  if(fadeDir===1){fadeAlpha+=0.04;if(fadeAlpha>=1){fadeAlpha=1;loadScene(fadeTarget);fadeDir=-1;}}
  else if(fadeDir===-1){fadeAlpha-=0.04;if(fadeAlpha<=0){fadeAlpha=0;fadeDir=0;}}
}

// ═══════════════════════════════════════════════════
// COMBAT SYSTEM
