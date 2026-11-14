export function geometryFindings() {
 const findings=[];const tolerance=1;
 const skip=n=>{const closed=n.closest('details:not([open])');if(closed&&!closed.querySelector('summary')?.contains(n))return true;if(n.checkVisibility&&!n.checkVisibility({opacityProperty:true,visibilityProperty:true}))return true;return ['SCRIPT','STYLE','NOSCRIPT','TEMPLATE'].includes(n.tagName)||!n.getClientRects().length||getComputedStyle(n).visibility==='hidden'||(n.getBoundingClientRect().width<=1&&n.getBoundingClientRect().height<=1);};
 for(const el of document.querySelectorAll('body *')){
  if(skip(el))continue;
  const rect=el.getBoundingClientRect();const region=el.closest('[data-airh-scroll-region]');const rr=region?.getBoundingClientRect();const managed=region&&region!==el&&region.tabIndex===0&&region.getAttribute('aria-label')&&['auto','scroll'].includes(getComputedStyle(region).overflowX)&&rr.left>=-tolerance&&rr.right<=innerWidth+tolerance;const visible=managed?{...rect,left:Math.min(rr.right,Math.max(rr.left,rect.left)),right:Math.min(rr.right,Math.max(rr.left,rect.right))}:rect;
  if(rect.width&&rect.height&&(visible.left < -tolerance||visible.right>innerWidth+tolerance)) findings.push({kind:'viewport',tag:el.tagName,cls:el.className,left:rect.left,right:rect.right});
  for(let parent=el.parentElement;parent;parent=parent.parentElement){
   const cs=getComputedStyle(parent),r=parent.getBoundingClientRect();
   if(['hidden','clip'].includes(cs.overflowY)&&(rect.top<r.top-tolerance||rect.bottom>r.bottom+tolerance)) findings.push({kind:'clip-y',tag:el.tagName,cls:el.className,parent:parent.tagName});
   const target=managed&&(parent===region||parent.contains(region))?visible:rect;
   if(['hidden','clip','auto','scroll'].includes(cs.overflowX)&& (target.left<r.left-tolerance||target.right>r.right+tolerance)) findings.push({kind:'clip-x',tag:el.tagName,cls:el.className,parent:parent.tagName});
  }
  if(el.children.length===0&&el.textContent.trim()&&el.clientWidth>1&&el.scrollWidth>el.clientWidth+tolerance&&['hidden','clip'].includes(getComputedStyle(el).overflowX))findings.push({kind:'clipped-text',tag:el.tagName,cls:el.className});
 }
 return findings.slice(0,30);
}
