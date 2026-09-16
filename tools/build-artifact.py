#!/usr/bin/env python3
"""Собирает index.html в один файл для публикации артефактом.

Артефакт подставляет свой скелет <html>/<head>/<body>, поэтому обёртку
снимаем, а стили, шрифты и скрипт вшиваем внутрь. Картинки остаются
отдельными файлами и публикуются рядом под теми же именами.

Запуск:  python3 tools/build-artifact.py [куда-положить.html]
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'build' / 'artifact.html'

src = (ROOT / 'index.html').read_text(encoding='utf-8')
body = src[src.index('<body>') + len('<body>'):src.index('</body>')].strip()
body = body.replace('<script src="main.js"></script>', '').strip()

css = "\n".join((ROOT / p).read_text(encoding='utf-8') for p in (
    'assets/fonts/unbounded.css', 'assets/fonts/onest.css',
    'assets/fonts/golos.css', 'styles.css'))
js = (ROOT / 'main.js').read_text(encoding='utf-8')

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(f"<title>ГРАНЬ</title>\n<style>\n{css}\n</style>\n\n{body}\n\n<script>\n{js}\n</script>\n",
               encoding='utf-8')

used = sorted(set(re.findall(r'src="([^"]+\.(?:webp|png))"', src)))
(out.parent / 'artifact-files.json').write_text(
    json.dumps({u: u for u in used}, ensure_ascii=False, indent=1), encoding='utf-8')

kb = lambda n: f"{n // 1024} KB"
print(f"{out}  {kb(out.stat().st_size)}")
print(f"{len(used)} изображений, {kb(sum((ROOT / u).stat().st_size for u in used))}")
print("карта файлов для публикации:", out.parent / 'artifact-files.json')
