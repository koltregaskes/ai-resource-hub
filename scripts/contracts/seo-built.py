import json,struct,sys,zlib,functools,xml.etree.ElementTree as ET
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

def local(url):
 target=(ROOT/unquote(urlparse(url).path).lstrip('/')).resolve()
 if not target.is_relative_to(ROOT.resolve()) or any(part=='.env' or part.startswith('.env.') for part in target.parts):return ROOT/'__blocked_reference__'
 return target

@functools.lru_cache(maxsize=None)
def real_png(image):
 try:
  data=image.read_bytes()
  if not data.startswith(b'\x89PNG\r\n\x1a\n'):return False
  offset=8;pixels=b'';header=None;ended=False
  while offset+12<=len(data):
   length=struct.unpack('>I',data[offset:offset+4])[0];kind=data[offset+4:offset+8];chunk=data[offset+8:offset+8+length];crc=data[offset+8+length:offset+12+length]
   if len(chunk)!=length or len(crc)!=4 or zlib.crc32(kind+chunk)!=struct.unpack('>I',crc)[0]:return False
   if kind==b'IHDR':header=struct.unpack('>IIBBBBB',chunk)
   if kind==b'IDAT':pixels+=chunk
   offset+=length+12
   if kind==b'IEND':ended=True;break
  if not ended or offset!=len(data) or header not in [(1200,630,8,6,0,0,0),(1200,630,8,2,0,0,0)]:return False
  channels=4 if header[3]==6 else 3;row=1200*channels+1;decoded=zlib.decompress(pixels)
  return len(decoded)==630*row and all(decoded[i*row]<=4 for i in range(630))
 except (OSError,ValueError,struct.error,zlib.error):return False
def urls(value):
 if isinstance(value,dict):return [v.split('#')[0].rstrip('/') for k,v in value.items() if k in ['url','@id'] and isinstance(v,str)]+[u for v in value.values() for u in urls(v)]
 if isinstance(value,list):return [u for v in value for u in urls(v)]
 return []
errors=[];count=0;indexable=set()
for path in ROOT.rglob('*.html'):
 p=Page(path.read_text(encoding='utf8'))
 if 'noindex' in p.meta.get('robots','') or 'refresh' in p.meta:continue
 count+=1;rel=path.relative_to(ROOT).as_posix();route='/'+rel.removesuffix('index.html');canonical=BASE+route;indexable.add(canonical)
 canon=[a.get('href') for a in p.links if a.get('rel')=='canonical']
 if canon!=[canonical]:errors.append(rel+': canonical mismatch')
 if not p.json or canonical.rstrip('/') not in urls(p.json):errors.append(rel+': JSON-LD must identify this page')
 rss=[a.get('href') for a in p.links if a.get('type')=='application/rss+xml']
 if not rss or not local(rss[0]).is_file():errors.append(rel+': RSS missing')
 image=local(p.meta.get('og:image',''))
 if not real_png(image):errors.append(rel+': valid decodable 1200x630 PNG missing')
sitemap_urls=set()
for sitemap in ROOT.glob('*sitemap*.xml'):
 try:
  tree=ET.parse(sitemap)
  if tree.getroot().tag.endswith('urlset'):sitemap_urls.update(node.text for node in tree.iter() if node.tag.endswith('}loc'))
 except Exception:errors.append(sitemap.name+': invalid XML')
for missing in sorted(indexable-sitemap_urls):errors.append(missing+': missing from sitemap')
for f in ['sitemap-index.xml','rss.xml']:
 try:ET.parse(ROOT/f)
 except Exception:errors.append(f+': invalid XML')
if not (ROOT/'robots.txt').is_file() or not (ROOT/'llms.txt').is_file():errors.append('crawl documents missing')
print('SEO built routes:',count,'errors:',len(errors));print('\n'.join(errors[:30]));sys.exit(bool(errors))
