import json,struct,sys,xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
ROOT=Path(sys.argv[1] if len(sys.argv)>1 else 'dist');BASE='https://theairesourcehub.com'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.meta={};self.links=[];self.json=[];self.active=False;self.buf='';self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('name',a.get('property',a.get('http-equiv',''))).lower()]=a.get('content','')
  if tag=='link':self.links.append(a)
  if tag=='script' and a.get('type')=='application/ld+json':self.active=True;self.buf=''
 def handle_data(self,text):
  if self.active:self.buf+=text
 def handle_endtag(self,tag):
  if tag=='script' and self.active:self.json.append(json.loads(self.buf));self.active=False

def local(url):return ROOT/unquote(urlparse(url).path).lstrip('/')
def urls(value):
 if isinstance(value,dict):return [v.split('#')[0].rstrip('/') for k,v in value.items() if k in ['url','@id'] and isinstance(v,str)]+[u for v in value.values() for u in urls(v)]
 if isinstance(value,list):return [u for v in value for u in urls(v)]
 return []
errors=[];count=0
for path in ROOT.rglob('*.html'):
 p=Page(path.read_text(encoding='utf8'))
 if 'noindex' in p.meta.get('robots','') or 'refresh' in p.meta:continue
 count+=1;rel=path.relative_to(ROOT).as_posix();route='/'+rel.removesuffix('index.html');canonical=BASE+route
 canon=[a.get('href') for a in p.links if a.get('rel')=='canonical']
 if canon!=[canonical]:errors.append(rel+': canonical mismatch')
 if not p.json or canonical.rstrip('/') not in urls(p.json):errors.append(rel+': JSON-LD must identify this page')
 rss=[a.get('href') for a in p.links if a.get('type')=='application/rss+xml']
 if not rss or not local(rss[0]).is_file():errors.append(rel+': RSS missing')
 image=local(p.meta.get('og:image',''));data=image.read_bytes() if image.is_file() else b''
 if not data.startswith(b'\x89PNG\r\n\x1a\n') or len(data)<24 or struct.unpack('>II',data[16:24])!=(1200,630):errors.append(rel+': real 1200x630 PNG missing')
for f in ['sitemap-index.xml','rss.xml']:
 try:ET.parse(ROOT/f)
 except Exception:errors.append(f+': invalid XML')
if not (ROOT/'robots.txt').is_file() or not (ROOT/'llms.txt').is_file():errors.append('crawl documents missing')
print('SEO built routes:',count,'errors:',len(errors));print('\n'.join(errors[:30]));sys.exit(bool(errors))
