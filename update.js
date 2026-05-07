// ═══════════════════════════════════════════════════
function updatePlayer(dt){
  if(shopOpen||activeDialog)return;
  let dx=0,dy=0;
  if(keys['a']||keys['arrowleft']||dpState.l){dx=-1;player.facing=-1}
  if(keys['d']||keys['arrowright']||dpState.r){dx=1;player.facing=1}
  if(keys['w']||keys['arrowup']||dpState.u)dy=-1;
  if(keys['s']||keys['arrowdown']||dpState.d)dy=1;
  const len=Math.sqrt(dx*dx+dy*dy);
  if(len>0){player.x+=dx/len*player.spd;player.y+=dy/len*player.spd;player.wTimer+=dt;if(player.wTimer>8){player.wFrame=(player.wFrame+1)%2;player.wTimer=0}}else player.wFrame=0;
  player.x=Math.max(TILE,Math.min(MAP_W-player.w-TILE,player.x));
  player.y=Math.max(TILE,Math.min(MAP_H-player.h-TILE,player.y));
  if(player.invincible>0)player.invincible-=dt;
  // MP regen
  if(Math.random()<.002)player.mp=Math.min(player.maxMp,player.mp+5);
}

function updateEnemies(dt){
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];if(e.hp<=0){enemies.splice(i,1);continue}
    const dx=player.x-e.x,dy=player.y-e.y,dist=Math.hypot(dx,dy);
    e.facing=dx>0?1:-1;
    if(dist>e.w+player.w+4){e.x+=dx/dist*e.spd;e.y+=dy/dist*e.spd;e.wTimer+=dt;if(e.wTimer>10){e.wFrame=(e.wFrame+1)%2;e.wTimer=0}}
    // Boss phase 2
    if(e.boss&&e.hp<e.maxHp*.5&&e.phase===1){e.phase=2;e.spd=1.2;showMsg('💀 BOSS NỔI GIẬN!',1500);}
    if(dist<e.w+player.w+8){e.atkTimer+=dt;if(e.atkTimer>1300){e.atkTimer=0;if(player.invincible<=0){player.hp=Math.max(0,player.hp-e.atk);spawnFX(player.x,player.y,'#e74c3c',6);spawnFloat(player.x-camX,player.y-camY-20,e.atk,'player');if(player.hp<=0){player.deaths++;player.hp=player.maxHp;player.x=SCENES[currentScene].spawnX;player.y=SCENES[currentScene].spawnY;player.invincible=3000;showMsg('💀 Hồi sinh...',2000);}updateHUD();}}}
  }
}

function updateSoldiers(dt){
  for(let i=soldiers.length-1;i>=0;i--){
    const s=soldiers[i];if(s.hp<=0){spawnFX(s.x+s.w/2,s.y+s.h/2,s.team==='ally'?'#44ff88':'#ff4444',12);soldiers.splice(i,1);continue}
    if(s.team==='ally'){
      let near=null,nd=180;
      enemies.forEach(e=>{const d=Math.hypot(e.x-s.x,e.y-s.y);if(d<nd){nd=d;near=e}});
      soldiers.forEach(g=>{if(g.team!=='guard')return;const d=Math.hypot(g.x-s.x,g.y-s.y);if(d<nd){nd=d;near=g}});
      if(near){const dx=near.x-s.x,dy=near.y-s.y,d=Math.hypot(dx,dy);s.facing=dx>0?1:-1;if(d>s.w+near.w+6){s.x+=dx/d*s.spd;s.y+=dy/d*s.spd;}else{s.atkTimer+=dt;if(s.atkTimer>900){s.atkTimer=0;near.hp-=s.atk;spawnFX(near.x,near.y,'#aaffaa',5);spawnFloat(near.x-camX,near.y-camY,s.atk,'dmg');if(near.hp<=0&&!near.kills){player.kills++;updateHUD();}}}}
      else{const dx=player.x-s.x,dy=player.y-s.y,d=Math.hypot(dx,dy);s.facing=dx>0?1:-1;if(d>50){s.x+=dx/d*s.spd*.8;s.y+=dy/d*s.spd*.8;}}
    } else {
      const dtp=Math.hypot(player.x-s.x,player.y-s.y),dth=Math.hypot(s.homeX-s.x,s.homeY-s.y);
      if(dtp<120){const dx=player.x-s.x,dy=player.y-s.y,d=Math.hypot(dx,dy);s.facing=dx>0?1:-1;if(d>s.w+player.w+6){s.x+=dx/d*s.spd;s.y+=dy/d*s.spd;}else{s.atkTimer+=dt;if(s.atkTimer>1100){s.atkTimer=0;if(player.invincible<=0){player.hp=Math.max(0,player.hp-s.atk);spawnFX(player.x,player.y,'#ff4444',5);spawnFloat(player.x-camX,player.y-camY-20,s.atk,'player');if(player.hp<=0){player.deaths++;player.hp=player.maxHp;player.x=SCENES[currentScene].spawnX;player.y=SCENES[currentScene].spawnY;player.invincible=3000;}updateHUD();}}}}
      else if(dth>80){const dx=s.homeX-s.x,dy=s.homeY-s.y,d=Math.hypot(dx,dy);s.facing=dx>0?1:-1;s.x+=dx/d*s.spd;s.y+=dy/d*s.spd;}
      else{s.patrolT+=dt;if(s.patrolT>2000){s.patrolT=0;s.patrolA+=Math.PI/2+Math.random();}s.x+=Math.cos(s.patrolA)*.5;s.y+=Math.sin(s.patrolA)*.5;s.facing=Math.cos(s.patrolA)>0?1:-1;}
    }
    s.wTimer+=dt;if(s.wTimer>10){s.wFrame=(s.wFrame+1)%2;s.wTimer=0;}
    s.x=Math.max(TILE,Math.min(MAP_W-s.w-TILE,s.x));s.y=Math.max(TILE,Math.min(MAP_H-s.h-TILE,s.y));
  }
}

function updateProjectiles(){
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];p.x+=p.vx;p.y+=p.vy;p.life--;
    if(p.life<=0){projectiles.splice(i,1);continue}
    let hit=false;
    for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(Math.hypot(e.x+e.w/2-p.x,e.y+e.h/2-p.y)<e.w/2+p.r){hitEnemy(e,p.dmg,p.c,Math.random()<.2);spawnFX(p.x,p.y,p.c,10);hit=true;break;}}
    if(hit)projectiles.splice(i,1);
  }
}

function checkPortals(){
  if(fadeDir!==0)return;
  sceneObjs.forEach(o=>{
    if(o.type!=='portal'&&o.type!=='cave')return;
    const ox=o.c*TILE+TILE/2,oy=o.r*TILE+TILE/2;
    if(Math.hypot(player.x+8-ox,player.y+8-oy)<36){
      if(keys['f']){keys['f']=false;gotoScene(o.target);}
    }
  });
}

function checkNPCInteract(){
  if(shopOpen||fadeDir!==0)return;
  sceneNpcs.forEach(n=>{
    if(Math.hypot(player.x-n.x,player.y-n.y)<52&&keys['f']){
      keys['f']=false;
      if(activeDialog){activeDialog=null;return;}
      if(n.type==='shopkeeper')shopOpen=true;
      else activeDialog={name:n.name,text:n.dialog[Math.floor(Math.random()*n.dialog.length)]};
    }
  });
  if(activeDialog&&keys['f']){keys['f']=false;activeDialog=null;}
}

const SHOP_ITEMS=[
  {name:'Hồi Nguyên Đan',desc:'+300 HP',cost:50,icon:'💊',fn:()=>{player.hp=Math.min(player.maxHp,player.hp+300);updateHUD()}},
  {name:'Tụ Linh Đan',desc:'+200 MP',cost:40,icon:'🔮',fn:()=>{player.mp=Math.min(player.maxMp,player.mp+200);updateHUD()}},
  {name:'Cường Thể Đan',desc:'+100 MaxHP',cost:100,icon:'❤️',fn:()=>{player.maxHp+=100;player.hp+=100;updateHUD()}},
  {name:'Tốc Hành Phù',desc:'Tốc độ +0.5',cost:80,icon:'⚡',fn:()=>{player.spd+=0.5}},
];

// ═══════════════════════════════════════════════════
// RENDER
