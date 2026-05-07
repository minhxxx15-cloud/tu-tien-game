// ═══════════════════════════════════════════════════
let lastTime=0;
function gameLoop(ts){
  const dt=ts-lastTime;lastTime=ts;
  wFrame++;

  updatePlayer(dt);
  updateFade();

  camX=Math.max(0,Math.min(MAP_W-W(),player.x+8-W()/2));
  camY=Math.max(0,Math.min(MAP_H-H(),player.y+8-H()/2));

  const sc=SCENES[currentScene];
  if(!sc.safeZone){
    updateEnemies(dt);
    updateSoldiers(dt);
    updateProjectiles();
    spawnTimer+=dt;if(spawnTimer>1800-wave*40&&!bossAlive){spawnTimer=0;if(enemies.length<6+wave*2)spawnEnemy(wave);}
    waveTimer+=dt;if(waveTimer>25000){waveTimer=0;wave++;document.getElementById('wt').textContent='Wave '+wave;showMsg('🌊 WAVE '+wave+'!',1500);}
    allyTimer+=dt;if(allyTimer>15000&&soldiers.filter(s=>s.team==='ally').length<3){allyTimer=0;spawnAlly();showMsg('⚔️ Lính đồng minh!',1000);}
  }
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life-=.04;if(p.life<=0)particles.splice(i,1)}
  for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.age+=dt;f.x+=f.vx;f.y+=f.vy;f.vy*=.95;if(f.age>400)f.vy*=.85;f.life-=dt/1200;if(f.life<=0)floats.splice(i,1)}

  checkPortals();checkNPCInteract();

  // Shop input
  if(shopOpen){
    ['1','2','3','4'].forEach((k,i)=>{if(keys[k]){keys[k]=false;const it=SHOP_ITEMS[i];if(it&&gold>=it.cost){gold-=it.cost;it.fn();showMsg('✅ '+it.name,1200);}else if(it)showMsg('Không đủ vàng!',800);}});
    if(keys['escape']){shopOpen=false;}
  }
  if(keys['q'])useSkill(0);if(keys['e'])useSkill(2);if(keys['r'])useSkill(3);

  // ── DRAW ──
  ctx.clearRect(0,0,W(),H());
  ctx.imageSmoothingEnabled=false;
  renderMap();
  renderObjects();
  renderParticles();
  renderEnemies(ts);
  renderSoldiers();
  renderNPCs();
  if(player.invincible<=0||Math.floor(ts/120)%2===0){drawShadow(player.x-camX,player.y-camY,player.w);drawSpr(player.wFrame===0?SPR.hero:SPR.hero2,player.x-camX,player.y-camY,2,player.facing<0);}
  renderProjectiles();
  renderFloats();
  renderMinimap();
  renderDialog();
  renderShop();
  updateSkillUI();
  updateHUD();

  // Fade overlay
  if(fadeAlpha>0){ctx.fillStyle=`rgba(0,0,0,${fadeAlpha})`;ctx.fillRect(0,0,W(),H());}

  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click',e=>{
  if(shopOpen||activeDialog)return;
  const r=canvas.getBoundingClientRect();
  const mx=(e.clientX-r.left)*(canvas.width/r.width)+camX;
  player.facing=mx>player.x+8?1:-1;useSkill(0);
});
canvas.addEventListener('contextmenu',e=>{e.preventDefault();useSkill(1)});

// INIT
loadScene('village');
updateHUD();
requestAnimationFrame(t=>{lastTime=t;requestAnimationFrame(gameLoop)});
