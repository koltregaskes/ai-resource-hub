import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';
const corrections=JSON.parse(await fs.readFile(new URL('../../src/data/public-link-corrections.json',import.meta.url),'utf8'));
const byUrl=new Map(corrections.map(row=>[row.url,row]));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function correctPublicLinks(html){
 const edits=[];
 function walk(node){
  if(node.tagName==='a'){
   const href=node.attrs.find(a=>a.name==='href')?.value,row=byUrl.get(href),loc=node.sourceCodeLocation;
   if(row&&loc?.startTag&&loc.endTag){
    const attrs=node.attrs.filter(a=>row.replacement||!['href','target','rel','download','role','tabindex'].includes(a.name)).map(a=>({name:a.name,value:a.name==='href'?row.replacement:a.value}));
    if(!row.replacement)attrs.push({name:'title',value:'Link unavailable when checked '+row.checked+'; original attribution retained'});
    const tag=row.replacement?'a':'span',opening='<'+tag+attrs.map(a=>' '+a.name+'="'+escape(a.value)+'"').join('')+'>';
    edits.push({start:loc.startTag.startOffset,end:loc.startTag.endOffset,text:opening},{start:loc.endTag.startOffset,end:loc.endTag.endOffset,text:(row.replacement?'':' <small>(link unavailable)</small>')+'</'+tag+'>'});
   }
  }
  for(const child of node.childNodes||[])walk(child);
 }
 walk(parse(html,{sourceCodeLocationInfo:true}));
 for(const edit of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.text+html.slice(edit.end);
 return html;
}
export default function publicLinks(){return{name:'public-link-corrections',hooks:{'astro:build:done':async({dir})=>{async function visit(folder){for(const item of await fs.readdir(folder,{withFileTypes:true})){const p=path.join(folder,item.name);if(item.isDirectory())await visit(p);else if(item.name.endsWith('.html')){const html=await fs.readFile(p,'utf8'),fixed=correctPublicLinks(html);if(fixed!==html)await fs.writeFile(p,fixed);}}}await visit(fileURLToPath(dir));}}};}
