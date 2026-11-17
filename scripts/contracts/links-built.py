import json,sys,re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,urljoin,unquote
ROOT=Path(sys.argv[1] if len(sys.argv)>1 else 'dist');BASE='https://theairesourcehub.com/'
class Links(HTMLParser):
 def __init__(self,text):super().__init__();self.refs=[];self.ids=set();self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get("id"):self.ids.add(a["id"])
  if tag=="a" and a.get("name"):self.ids.add(a["name"])
  if tag=="meta" and a.get("http-equiv", "").lower()=="refresh":
   match=re.search(r"url\s*=\s*[\"\']?([^\"\']+)",a.get("content", ""),re.I)
   if match:self.refs.append(("redirect",match.group(1).strip()))
  for key in ['href','src','poster']:
   if a.get(key):self.refs.append((tag,a[key]))
errors=set();external=set();pages=list(ROOT.rglob('*.html'));parsed_pages={}
for page in pages:
 route='/'+page.relative_to(ROOT).as_posix().removesuffix('index.html')
 document=Links(page.read_text(encoding='utf8'));parsed_pages[page]=document
 for tag,value in document.refs:
  parsed=urlparse(urljoin(BASE.rstrip('/')+route,value))
  if parsed.scheme in ['mailto','tel','data']:continue
  if parsed.scheme not in ['http','https']:errors.add('Unsafe scheme '+parsed.scheme+' in '+route);continue
  if parsed.hostname!='theairesourcehub.com':
   if tag=='a':external.add(parsed._replace(fragment='').geturl())
   continue
  target=ROOT/unquote(parsed.path).lstrip('/')
  if target.is_dir():target=target/'index.html'
  if not target.is_file():errors.add(parsed.path)
  elif parsed.fragment and target.suffix=='.html':
   destination=parsed_pages.get(target) or Links(target.read_text(encoding='utf8'))
   if unquote(parsed.fragment) not in destination.ids:errors.add(parsed.path+'#'+parsed.fragment)
print('Built links:',len(pages),'pages;',len(external),'external;',len(errors),'broken/unsafe internal')
print('\n'.join(sorted(errors)[:80]));Path('.review').mkdir(exist_ok=True);Path('.review/external-links.json').write_text(json.dumps(sorted(external)))
sys.exit(bool(errors))
