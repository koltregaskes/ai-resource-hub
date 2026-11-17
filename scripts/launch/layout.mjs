import {geometryFindings} from './geometry.mjs';
export async function measureLayout(page) {
 const geometry=await page.evaluate(geometryFindings);
 const {scrollWidth,viewport}=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
 return {geometry,scrollWidth,viewport,failed:geometry.length>0||scrollWidth>viewport+1};
}
export async function invisibleOverflowControls(page) {
 let count=0;
 for(const width of [320,390])for(const style of ['opacity:0','visibility:hidden']){
  await page.setViewportSize({width,height:900});
  await page.setContent('<style>html,body{margin:0;overflow:visible}</style><div style="'+style+'"><div style="width:600px;height:40px">Invisible overflow</div></div>');
  const result=await measureLayout(page);
  if(result.geometry.length!==0||result.scrollWidth!==600||!result.failed)throw new Error('Invisible overflow control escaped: '+JSON.stringify({width,style,...result}));
  count++;
 }
 return count;
}
