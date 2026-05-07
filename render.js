// ═══════════════════════════════════════════════════
function renderMap(){
  const sc=SCENES[currentScene];
  const r0=Math.max(0,Math.floor(camY/TILE)),r1=Math.min(sceneMap.length,Math.ceil((camY+H())/TILE));
  const c0=Math.max(0,Math.floor(camX/TILE)),c1=Math.min((sceneMap[0]||[]).length,Math.ceil((camX+W())/TILE));
  const wt=getWater();
  for(let r=r0;r<r1;r++)for(let c=c0;c<c1;c++){
    const tx=c*TILE-camX,ty=r*TILE-camY;
    ctx.imageSmoothingEnabled=false;
    const t=sceneMap[r]?sceneMap[r][c]:'grass';
    if(t==='water')ctx.drawImage(wt,tx,ty,TILE,TILE);
    else if(t==='wall')ctx.drawImage(T.wall,tx,ty,TILE,TILE);
    else if(t==='path')ctx.drawImage(T.path,tx,ty,TILE,TILE);
    else if(t==='dforest')ctx.drawImage(T.dforest,tx,ty,TILE,TILE);
    else if(t==='bossTile')ctx.drawImage(T.bossTile,tx,ty,TILE,TILE);
    else ctx.drawImage(T.grass,tx,ty,TILE,TILE);
  }
}

function renderObjects(){
  sceneObjs.forEach(o=>{
    const tx=o.c*TILE-camX,ty=o.r*TILE-camY;
    ctx.imageSmoothingEnabled=false;
    if(o.type==='house')ctx.drawImage(T.house,tx-8,ty-TILE,TILE*3,TILE*3);
    else if(o.type==='shop')ctx.drawImage(T.shopbld,tx-8,ty-TILE,TILE*3,TILE*3);
    else if(o.type==='tree'){const ts=currentScene==='forest'?T.treeD:T.tree;ctx.drawImage(ts,tx-8,ty-TILE,TILE*2,TILE*2);}
    else if(o.type==='rock')ctx.drawImage(T.rock,tx-4,ty-8,TILE+8,TILE+8);
    else if(o.type==='portal')ctx.drawImage(T.portal,tx,ty,TILE*2,TILE*2);
    else if(o.type==='cave')ctx.drawImage(T.cave,tx,ty,TILE*2,TILE*2);
    else if(o.type==='portal'||o.type==='cave'){
      // Label khi gần
      if(Math.hypot(player.x+8-(o.c*TILE+TILE),player.y+8-(o.r*TILE+TILE))<80){
        ctx.save();ctx.font='bold 11px Segoe UI';ctx.textAlign='center';
        ctx.fillStyle='#000';ctx.fillText(o.label,tx+TILE+1,ty-6+1);
        ctx.fillStyle='#e8c96d';ctx.fillText(o.label,tx+TILE,ty-6);
        ctx.fillStyle='#ffee00';ctx.font='bold 13px Segoe UI';
        ctx.fillText('[F]',tx+TILE,ty-20);
        ctx.restore();
      }
    }
  });
}

function renderNPCs(){
  sceneNpcs.forEach(n=>{
    drawShadow(n.x-camX,n.y-camY,n.w);
    drawSpr(n.type==='chief'?SPR.chief:SPR.shop,n.x-camX,n.y-camY,2,n.facing<0);
    ctx.save();ctx.font='bold 10px Segoe UI';ctx.textAlign='center';
    const nx=n.x-camX+n.w,ny=n.y-camY-8;
    ctx.fillStyle='#000';ctx.fillText(n.name,nx+1,ny+1);
    ctx.fillStyle=n.type==='chief'?'#e8c96d':'#cc88ff';ctx.fillText(n.name,nx,ny);
    if(Math.hypot(player.x-n.x,player.y-n.y)<55){ctx.font='bold 14px Segoe UI';ctx.fillStyle='#ffee00';ctx.fillText('! [F]',nx,ny-12);}
    ctx.restore();
  });
}

function renderEnemies(ts){
  enemies.forEach(e=>{
    const ex=e.x-camX,ey=e.y-camY;
    drawShadow(ex,ey,e.w);
    if(e.boss){
      const sc=SCENES[currentScene];
      ctx.save();ctx.imageSmoothingEnabled=false;
      // Boss glow
      ctx.shadowColor='#ff2200';ctx.shadowBlur=20*(1+Math.sin(ts/200)*.3);
      ctx.translate(ex+e.w,ey);ctx.scale(e.facing*(1+Math.sin(ts/300)*.04),1+Math.sin(ts/300)*.03);
      ctx.drawImage(SPR.boss,0,0,e.w*2,e.h*2);ctx.restore();
      // Boss HP bar
      hpBar(W()/2-100,48,196,e.hp/e.maxHp,'#e74c3c');
      ctx.font='bold 11px Segoe UI';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('💀 Boss: '+e.hp+'/'+e.maxHp,W()/2,44);
    } else {
      drawSpr(e.type==='tatu'?SPR.tatu:SPR.yao,ex,ey,2,e.facing<0);
      hpBar(ex+e.w-14,ey-6,e.w*2+4,e.hp/e.maxHp,e.hp/e.maxHp>.5?'#e74c3c':'#f39c12');
    }
  });
}

function renderSoldiers(){
  soldiers.forEach(s=>{
    const sx=s.x-camX,sy=s.y-camY;
    drawShadow(sx,sy,s.w);
    drawSpr(s.team==='ally'?SPR.ally:SPR.guard,sx,sy,2,s.facing<0);
    hpBar(sx+s.w-14,sy-6,s.w*2+4,s.hp/s.maxHp,s.team==='ally'?'#44ff88':'#ff4444');
    ctx.beginPath();ctx.arc(sx+s.w,sy-10,2.5,0,Math.PI*2);ctx.fillStyle=s.team==='ally'?'#44ff88':'#ff4444';ctx.fill();
  });
}

function renderParticles(){
  particles.forEach(p=>{ctx.beginPath();ctx.arc(p.x-camX,p.y-camY,p.r*p.life,0,Math.PI*2);ctx.fillStyle=p.c+Math.floor(p.life*255).toString(16).padStart(2,'0');ctx.fill()});
}

function renderProjectiles(){
  projectiles.forEach(p=>{
    ctx.beginPath();ctx.arc(p.x-camX,p.y-camY,p.r,0,Math.PI*2);ctx.fillStyle=p.c;ctx.fill();
    ctx.beginPath();ctx.arc(p.x-camX,p.y-camY,p.r*1.8,0,Math.PI*2);ctx.fillStyle=p.c+'44';ctx.fill();
  });
}

function renderFloats(){
  floats.forEach(f=>{
    const a=f.life>0.3?1:f.life/0.3;
    const sc=f.type==='crit'?(1+Math.sin((1-f.life)*Math.PI)*.4):1;
    ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font=`bold ${Math.round(f.sz*sc)}px Segoe UI`;
    ctx.lineWidth=f.type==='crit'?4:3;ctx.strokeStyle=f.sc;ctx.lineJoin='round';ctx.strokeText(f.txt,f.x,f.y);
    ctx.fillStyle=f.c;ctx.fillText(f.txt,f.x,f.y);
    if(f.type==='crit'&&f.life>.5){ctx.font=`bold ${Math.round(f.sz*.5)}px Segoe UI`;ctx.strokeText('CHÍ MẠNG',f.x,f.y-f.sz);ctx.fillText('CHÍ MẠNG',f.x,f.y-f.sz);}
    ctx.restore();
  });
}

function renderMinimap(){
  const mw=70,mh=52,mx=W()-mw-8,my=8;
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(mx,my,mw,mh);
  ctx.strokeStyle='rgba(201,168,76,0.4)';ctx.lineWidth=1;ctx.strokeRect(mx,my,mw,mh);
  const sx=mw/MAP_W,sy=mh/MAP_H;
  enemies.forEach(e=>{ctx.beginPath();ctx.arc(mx+e.x*sx,my+e.y*sy,e.boss?4:1.5,0,Math.PI*2);ctx.fillStyle=e.boss?'#f39c12':'#e74c3c';ctx.fill()});
  soldiers.forEach(s=>{ctx.beginPath();ctx.arc(mx+s.x*sx,my+s.y*sy,1.5,0,Math.PI*2);ctx.fillStyle=s.team==='ally'?'#44ff88':'#ff6666';ctx.fill()});
  ctx.beginPath();ctx.arc(mx+player.x*sx,my+player.y*sy,2.5,0,Math.PI*2);ctx.fillStyle='#4fc3f7';ctx.fill();
}

function renderDialog(){
  if(!activeDialog)return;
  const bw=300,bh=70,bx=W()/2-bw/2,by=H()-bh-68;
  ctx.fillStyle='rgba(8,6,3,.94)';ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle='#c9a84c';ctx.lineWidth=1.5;ctx.strokeRect(bx,by,bw,bh);
  ctx.font='bold 12px Segoe UI';ctx.fillStyle='#e8c96d';ctx.textAlign='left';ctx.fillText(activeDialog.name,bx+10,by+18);
  ctx.font='11px Segoe UI';ctx.fillStyle='#f5ead0';
  const words=activeDialog.text.split(' ');let line='',ly=by+34;
  words.forEach(w=>{const t=line+w+' ';if(ctx.measureText(t).width>bw-18&&line){ctx.fillText(line,bx+10,ly);line=w+' ';ly+=15;}else line=t;});ctx.fillText(line,bx+10,ly);
  ctx.font='10px Segoe UI';ctx.fillStyle='#666';ctx.textAlign='right';ctx.fillText('[F] Đóng',bx+bw-8,by+bh-7);
}

function renderShop(){
  if(!shopOpen)return;
  const sw=320,sh=230,sx=W()/2-sw/2,sy=H()/2-sh/2;
  ctx.fillStyle='rgba(8,6,3,.96)';ctx.fillRect(sx,sy,sw,sh);
  ctx.strokeStyle='#c9a84c';ctx.lineWidth=2;ctx.strokeRect(sx,sy,sw,sh);
  ctx.font='bold 14px Segoe UI';ctx.fillStyle='#e8c96d';ctx.textAlign='center';ctx.fillText('🏪 Cửa Hàng Linh Dược',sx+sw/2,sy+22);
  ctx.font='12px Segoe UI';ctx.fillStyle='#ffee88';ctx.fillText('💰 Vàng: '+gold,sx+sw/2,sy+40);
  SHOP_ITEMS.forEach((item,i)=>{
    const iy=sy+52+i*38;
    ctx.fillStyle=i%2===0?'rgba(255,255,255,.04)':'rgba(255,255,255,.02)';ctx.fillRect(sx+8,iy,sw-16,34);
    ctx.font='13px Segoe UI';ctx.fillStyle='#f5ead0';ctx.textAlign='left';ctx.fillText(item.icon+' '+item.name,sx+16,iy+14);
    ctx.font='10px Segoe UI';ctx.fillStyle='#888';ctx.fillText(item.desc,sx+16,iy+27);
    ctx.font='bold 12px Segoe UI';ctx.fillStyle=gold>=item.cost?'#ffee88':'#555';ctx.textAlign='right';ctx.fillText('💰'+item.cost,sx+sw-16,iy+18);
    ctx.font='11px Segoe UI';ctx.fillStyle='#c9a84c';ctx.fillText('['+( i+1)+']',sx+sw-55,iy+18);
  });
  ctx.font='10px Segoe UI';ctx.fillStyle='#555';ctx.textAlign='center';ctx.fillText('[1-4] Mua   [ESC] Đóng',sx+sw/2,sy+sh-10);
}

// ═══════════════════════════════════════════════════
// HUD
// ═══════════════════════════════════════════════════
function updateHUD(){
  document.getElementById('b-hp').style.width=(player.hp/player.maxHp*100)+'%';
  document.getElementById('b-mp').style.width=(player.mp/player.maxMp*100)+'%';
  document.getElementById('v-hp').textContent=player.hp+'/'+player.maxHp;
  document.getElementById('v-mp').textContent=player.mp+'/'+player.maxMp;
  const realms=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần'];
  document.getElementById('rt').textContent=realms[Math.min(Math.floor((player.level-1)/3),4)]+' · Lv'+player.level;
  document.getElementById('gt').textContent='💰 '+gold;
}
function updateSkillUI(){
  const now=Date.now();
  SKILLS.forEach((_,i)=>{const sk=document.getElementById('sk'+i);const cd=player.skillCds[i]-now;let d=sk.querySelector('.sk-cd');if(cd>0){if(!d){d=document.createElement('div');d.className='sk-cd';sk.appendChild(d)}d.textContent=Math.ceil(cd/1000);}else if(d)d.remove();});
}
function showMsg(txt,dur=1200){const m=document.getElementById('msg');m.textContent=txt;m.classList.add('show');clearTimeout(m._t);m._t=setTimeout(()=>m.classList.remove('show'),dur)}

// ═══════════════════════════════════════════════════
// GAME LOOP
