// ═══════════════════════════════════════════════════
const SKILLS=[
  {dmg:90,range:120,type:'melee',c:'#81d4fa'},
  {dmg:220,type:'proj',c:'#ff4400',mp:60},
  {dmg:0,type:'dash',c:'#27ae60',mp:40},
  {dmg:380,range:200,type:'aoe',c:'#f39c12',mp:120},
  {dmg:-220,type:'heal',c:'#2ecc71',mp:80},
];

function spawnFloat(x,y,val,type){
  const cfg={dmg:{c:'#fff',sc:'#cc2200',sz:15},crit:{c:'#ffee00',sc:'#ff6600',sz:22},heal:{c:'#44ff88',sc:'#006622',sz:15},miss:{c:'#aaa',sc:'#444',sz:13},player:{c:'#ff4444',sc:'#880000',sz:14}}[type]||{c:'#fff',sc:'#000',sz:14};
  const pfx=type==='heal'?'+':type==='miss'?'':'-';
  floats.push({x:x+(Math.random()-.5)*20,y:y-8,vy:-(2+Math.random()),vx:(Math.random()-.5)*.6,txt:type==='miss'?'MISS':pfx+val,c:cfg.c,sc:cfg.sc,sz:cfg.sz,life:1,age:0,type});
}
function spawnFX(x,y,c,n=8){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:2+Math.random()*3,c,life:1})}}

function hitEnemy(e,dmg,c,crit){
  const fd=crit?Math.floor(dmg*1.8):dmg;e.hp-=fd;
  spawnFX(e.x+e.w/2,e.y+e.h/2,c,crit?14:7);
  spawnFloat(e.x+e.w/2-camX,e.y-camY,fd,crit?'crit':'dmg');
  if(e.hp<=0){
    player.kills++;player.xp+=e.boss?200:30+wave*5;
    gold+=e.boss?150:8+wave*2;
    spawnFX(e.x+e.w/2,e.y+e.h/2,'#f39c12',e.boss?30:16);
    if(e.boss){bossAlive=false;showMsg('🔥 BOSS TIÊU DIỆT! +150 Vàng',2500);setTimeout(()=>gotoScene('village'),3000);}
    else if(player.kills%5===0)showMsg('⚡ '+player.kills+' DIỆT!',900);
    levelCheck();updateHUD();return false;
  }return true;
}
function levelCheck(){if(player.xp>=150*player.level){player.xp=0;player.level++;player.maxHp+=80;player.hp=player.maxHp;player.maxMp+=40;player.mp=player.maxMp;showMsg('⬆️ THĂNG CẤP! Lv.'+player.level,1500);updateHUD();}}

function useSkill(i){
  const sk=SKILLS[i],now=Date.now();
  if(player.skillCds[i]>now)return;
  if(sk.mp&&player.mp<sk.mp){showMsg('Không đủ MP!');return}
  if(sk.mp)player.mp=Math.max(0,player.mp-sk.mp);
  player.skillCds[i]=now+(player.skillMaxCds[i]||0);
  if(sk.type==='melee'){let hit=false;enemies.forEach(e=>{const d=Math.hypot(e.x-player.x,e.y-player.y);if(d<sk.range){hitEnemy(e,sk.dmg,sk.c,Math.random()<.2);hit=true}});if(!hit)spawnFloat(player.x-camX,player.y-camY-20,0,'miss');spawnFX(player.x,player.y,sk.c,12);}
  else if(sk.type==='proj'){const a=player.facing===1?0:Math.PI;projectiles.push({x:player.x+8,y:player.y+8,vx:Math.cos(a)*7,vy:Math.sin(a)*7,r:6,dmg:sk.dmg,c:sk.c,life:70});}
  else if(sk.type==='dash'){player.x+=player.facing===1?80:-80;player.x=Math.max(0,Math.min(MAP_W-player.w,player.x));spawnFX(player.x,player.y,sk.c,18);showMsg('疾風！');}
  else if(sk.type==='aoe'){let hit=false;enemies.forEach(e=>{const d=Math.hypot(e.x-player.x,e.y-player.y);if(d<sk.range){hitEnemy(e,sk.dmg,sk.c,Math.random()<.35);hit=true}});if(!hit)spawnFloat(player.x-camX,player.y-camY-20,0,'miss');spawnFX(player.x,player.y,sk.c,32);showMsg('✨ Ngộ Đạo Bùng Phát!');}
  else if(sk.type==='heal'){const h=220;player.hp=Math.min(player.maxHp,player.hp+h);spawnFloat(player.x-camX,player.y-camY-20,h,'heal');spawnFX(player.x,player.y,sk.c,20);}
  updateHUD();
}

// ═══════════════════════════════════════════════════
// ENEMY / SOLDIER SPAWNING
// ═══════════════════════════════════════════════════
function spawnEnemy(w){
  const sc=SCENES[currentScene];
  const corners=[[150,150],[sc.mw-150,150],[150,sc.mh-150],[sc.mw-150,sc.mh-150]];
  const sp=corners[Math.floor(Math.random()*4)];
  const isBoss2=enemies.length<2&&Math.random()<.15;
  enemies.push({x:sp[0],y:sp[1],w:16,h:16,hp:isBoss2?300+w*60:70+w*18,maxHp:isBoss2?300+w*60:70+w*18,atk:isBoss2?35+w*7:12+w*3,spd:isBoss2?.8:1.1+w*.08,type:isBoss2?'tatu':Math.random()<.5?'yao':'tatu',boss:false,facing:1,atkTimer:0,wTimer:0,wFrame:0});
}
function spawnBoss(){
  enemies.push({x:MAP_W/2-16,y:160,w:32,h:32,hp:2000,maxHp:2000,atk:60,spd:.7,type:'boss',boss:true,facing:1,atkTimer:0,wTimer:0,wFrame:0,phase:1});
}
function spawnAlly(){
  const a=Math.random()*Math.PI*2,d=60+Math.random()*40;
  soldiers.push({x:player.x+Math.cos(a)*d,y:player.y+Math.sin(a)*d,w:16,h:16,hp:300,maxHp:300,atk:40,spd:1.6,team:'ally',facing:1,atkTimer:0,wTimer:0,wFrame:0,homeX:0,homeY:0,patrolA:Math.random()*Math.PI*2,patrolT:0});
}
function spawnGuard(x,y){
  soldiers.push({x,y,w:16,h:16,hp:250,maxHp:250,atk:30,spd:1.2,team:'guard',facing:-1,atkTimer:0,wTimer:0,wFrame:0,homeX:x,homeY:y,patrolA:Math.random()*Math.PI*2,patrolT:0});
}

// ═══════════════════════════════════════════════════
// UPDATE
