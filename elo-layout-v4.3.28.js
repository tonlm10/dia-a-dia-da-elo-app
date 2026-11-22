/* Correções funcionais de enquadramento e toque — Elo 4.3.28. */
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const familyGrid=$('#playPanel .gameLaunchGrid');
  const oldFamily=$("#playPanel .card>button[onclick*=\"openWorldPlace('family')\"]");
  if(familyGrid&&oldFamily&&!$('#playPanel [data-family-launch]')){
    const card=document.createElement('button');card.type='button';card.className='gameLaunch eloCompactGameCard';card.dataset.familyLaunch='1';
    card.setAttribute('aria-label','Abrir Festa da Família');
    card.innerHTML='<div class="familyGameCover" aria-hidden="true">🎉👨‍👩‍👧</div><div class="gameInfo"><b>Festa da Família</b><small>Mímica, duelo e roleta para brincar juntos no mesmo aparelho.</small><span class="gameArrow">›</span></div>';
    card.addEventListener('click',()=>window.openWorldPlace?.('family'));
    familyGrid.appendChild(card);oldFamily.remove();
  }
  // Memory now uses a compact 4×2, 4×4 and 8×4 board; difficulty stays above it.
  const memoryStart=window.startMemory;
  if(typeof memoryStart==='function'&&!memoryStart.__eloFit){
    const fitMemory=function(){const result=memoryStart.apply(this,arguments);const board=$('#memory');if(board){board.dataset.cards=String(board.children.length);board.style.setProperty('--memory-columns',board.classList.contains('hard')?'8':'4');}return result;};
    fitMemory.__eloFit=true;window.startMemory=fitMemory;
  }
  // Keep New Challenge alongside difficulty buttons rather than over the answer grid.
  const tapSection=$('#tapGameSection');
  if(tapSection){const diff=$('.gameStageColLandscape>.diffRow',tapSection),newBtn=$('.gameStageColLandscape>div>button[onclick*="startTapGame"]',tapSection);if(diff&&newBtn&&!newBtn.dataset.eloPlaced){newBtn.dataset.eloPlaced='1';newBtn.classList.add('chip');newBtn.style.minHeight='34px';newBtn.style.padding='4px 7px';newBtn.textContent='↻ Novo jogo';diff.appendChild(newBtn);}}
  // Paint any enclosed white region reliably; original artwork remains as black line art.
  if(typeof window.fillAt==='function'&&typeof ctx!=='undefined'&&typeof canvas!=='undefined'){
    window.fillAt=function(x,y){
      const image=ctx.getImageData(0,0,canvas.width,canvas.height),d=image.data,w=image.width,h=image.height,seed=(y*w+x)*4;
      const target=[d[seed],d[seed+1],d[seed+2],d[seed+3]],lum=(target[0]+target[1]+target[2])/3;
      if(lum<100)return;
      const rgb=hexToRgb(color);if(Math.abs(target[0]-rgb[0])<4&&Math.abs(target[1]-rgb[1])<4&&Math.abs(target[2]-rgb[2])<4)return;
      colorHistory.push(ctx.getImageData(0,0,w,h));if(colorHistory.length>COLOR_HISTORY_LIMIT)colorHistory.shift();
      const seen=new Uint8Array(w*h),stack=[[x,y]],matches=(px,py)=>{if(px<0||py<0||px>=w||py>=h)return false;const k=py*w+px;if(seen[k])return false;const i=k*4,pl=(d[i]+d[i+1]+d[i+2])/3;return pl>100&&Math.abs(d[i]-target[0])<55&&Math.abs(d[i+1]-target[1])<55&&Math.abs(d[i+2]-target[2])<55;};
      let painted=0;while(stack.length){const [sx,sy]=stack.pop();if(!matches(sx,sy))continue;let left=sx;while(left>0&&matches(left-1,sy))left--;for(let px=left;px<w&&matches(px,sy);px++){const k=sy*w+px,i=k*4;seen[k]=1;d[i]=rgb[0];d[i+1]=rgb[1];d[i+2]=rgb[2];d[i+3]=255;painted++;if(sy>0&&!seen[k-w])stack.push([px,sy-1]);if(sy<h-1&&!seen[k+w])stack.push([px,sy+1]);}}
      if(painted)ctx.putImageData(image,0,0);else colorHistory.pop();
    };
  }
  // Draw Elo inside the actual canvas coordinates; the avatar cannot drift outside the scenery.
  const drawScene=window.drawTrailScene;
  if(typeof drawScene==='function'&&!drawScene.__eloCanvasAvatar){
    const fixedDraw=function(dt){const out=drawScene.apply(this,arguments);try{if(trailState?.player&&trailCtx&&typeof drawPlayerElo==='function'){const p=trailState.player;drawPlayerElo(trailCtx,{x:p.x,y:p.y+13},p.inv>0&&Math.floor(p.inv)%4<2);}}catch(_){}return out;};
    fixedDraw.__eloCanvasAvatar=true;window.drawTrailScene=fixedDraw;
  }
  // Keep the family entrance visible among the same-size game cards.
  window.EloLayout428={version:'4.3.28',familyCard:!!$('#playPanel [data-family-launch]'),fitMemory:true,paintRegions:true};
})();
