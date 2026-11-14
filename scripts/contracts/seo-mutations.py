import json, re, shutil, subprocess, sys, tempfile, unittest
from pathlib import Path
SOURCE=Path('dist')
class BuiltSeo(unittest.TestCase):
 def probe(self,change,good=False):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);html=(SOURCE/'index.html').read_text(encoding='utf8');image=re.search(r'<meta[^>]*property="og:image"[^>]*content="([^"]+)"',html).group(1);from urllib.parse import urlparse
   relative=urlparse(image).path.lstrip('/');(root/relative).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(SOURCE/relative,root/relative)
   for file in ['rss.xml','sitemap-index.xml','robots.txt','llms.txt']:shutil.copy2(SOURCE/file,root/file)
   (root/'index.html').write_text(change(html),encoding='utf8');r=subprocess.run([sys.executable,'scripts/contracts/seo-built.py',str(root)],capture_output=True,text=True)
   self.assertEqual(r.returncode,0,r.stdout) if good else self.assertNotEqual(r.returncode,0,r.stdout)
 def test_valid(self):self.probe(lambda s:s,True)
 def test_wrong_graph(self):self.probe(lambda s:re.sub(r'(<script[^>]*type="application/ld\+json"[^>]*>).*?(</script>)',lambda m:m[1]+json.dumps({'@context':'https://schema.org','@type':'WebPage','url':'https://example.test/wrong'})+m[2],s,flags=re.S))
 def test_missing_og(self):self.probe(lambda s:s.replace('property="og:image"','property="removed:image"'))
 def test_wrong_canonical(self):self.probe(lambda s:s.replace('rel="canonical"','rel="removed"'))
if __name__=='__main__':unittest.main()
