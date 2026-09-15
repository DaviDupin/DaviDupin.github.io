# -*- coding: utf-8 -*-
"""Gera en/index.html a partir de index.html e build/en.json.

   O português é a fonte da verdade: edite index.html, atualize a entrada
   correspondente em build/en.json e rode `python build/build-en.py`.

   Cada idioma vira uma página estática de verdade, com endereço próprio,
   para que os buscadores indexem as duas — era o que a tradução no
   navegador não conseguia entregar.
"""

import io, json, os, re, sys
from html.parser import HTMLParser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)

EN = json.load(io.open('build/en.json', encoding='utf-8'))
CRUS = ('script', 'style')
VAZIOS = {'img', 'br', 'meta', 'link', 'input', 'hr', 'source'}
EXTERNO = ('#', 'http://', 'https://', 'mailto:', 'tel:', '/', '../')

# Idênticas nos dois idiomas de propósito. Estão aqui, e não escondidas numa
# regra de tamanho, para que qualquer string realmente esquecida derrube o
# build em vez de passar despercebida.
IGUAIS = {'Davi', 'Dupin', '|'}


def escapar_texto(t):
    return (t.replace('&', '&amp;').replace('<', '&lt;').replace('\xa0', '&nbsp;'))


def escapar_attr(v):
    return (v.replace('&', '&amp;').replace('"', '&quot;').replace('\xa0', '&nbsp;'))


def normal(t):
    return re.sub(r'\s+', ' ', t).strip()


class Tradutor(HTMLParser):
    """Reemite o documento inteiro, traduzindo texto e atributos e
       reapontando os caminhos relativos para a pasta acima."""

    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.saida = []
        s.cru = 0
        s.dentro_ms = 0          # ligaduras de ícone: nunca traduzir
        s.faltando = []
        s.traduzidas = 0

    def _abre(s, tag, attrs, fechada):
        d = dict(attrs)
        if tag in CRUS:
            s.cru += 1
        if 'ms' in (d.get('class') or '').split():
            s.dentro_ms += 1

        partes = []
        for chave, valor in attrs:
            if valor is None:
                partes.append(' ' + chave)
                continue

            if chave == 'lang' and tag == 'html':
                valor = 'en'
            elif chave in ('alt', 'aria-label') and normal(valor) in EN:
                valor = EN[normal(valor)]
                s.traduzidas += 1
            elif chave == 'content' and (
                    d.get('name') == 'description'
                    or d.get('property') in ('og:title', 'og:description',
                                             'og:image:alt')):
                if normal(valor) in EN:
                    valor = EN[normal(valor)]
                    s.traduzidas += 1
            elif chave in ('href', 'src') and not valor.startswith(EXTERNO):
                valor = '../' + valor      # a página vive um nível abaixo

            partes.append(' %s="%s"' % (chave, escapar_attr(valor)))

        s.saida.append('<%s%s>' % (tag, ''.join(partes)))
        if fechada and tag in CRUS:
            s.cru -= 1

    def handle_starttag(s, tag, attrs):
        s._abre(tag, attrs, False)

    def handle_startendtag(s, tag, attrs):
        s._abre(tag, attrs, True)
        if 'ms' in (dict(attrs).get('class') or '').split():
            s.dentro_ms -= 1

    def handle_endtag(s, tag):
        if tag in CRUS:
            s.cru = max(0, s.cru - 1)
        if tag not in VAZIOS:
            s.saida.append('</%s>' % tag)

    def handle_data(s, d):
        if s.cru:
            s.saida.append(d)                       # JS e CSS saem intactos
            return
        chave = normal(d)
        if not chave or s.dentro_ms or chave not in EN:
            if chave and not s.dentro_ms and chave not in IGUAIS:
                s.faltando.append(chave)
            s.saida.append(escapar_texto(d))
            return
        antes = re.match(r'^\s*', d).group(0)
        depois = re.search(r'\s*$', d).group(0)
        s.saida.append(antes + escapar_texto(EN[chave]) + depois)
        s.traduzidas += 1

    def handle_endtag_ms(s):
        pass

    def handle_comment(s, c):
        s.saida.append('<!--%s-->' % c)

    def handle_decl(s, d):
        s.saida.append('<!%s>' % d)

    def handle_pi(s, d):
        s.saida.append('<?%s>' % d)


# O fechamento do span de ícone precisa zerar o contador; HTMLParser não
# entrega a classe no endtag, então rastreamos pela pilha de abertura.
class TradutorMS(Tradutor):
    def __init__(s):
        super().__init__()
        s.pilha = []

    def handle_starttag(s, tag, attrs):
        s.pilha.append('ms' in (dict(attrs).get('class') or '').split())
        super().handle_starttag(tag, attrs)

    def handle_endtag(s, tag):
        super().handle_endtag(tag)
        if s.pilha and tag not in VAZIOS:
            if s.pilha.pop():
                s.dentro_ms = max(0, s.dentro_ms - 1)


p = TradutorMS()
p.feed(io.open('index.html', encoding='utf-8').read())
html = ''.join(p.saida)

# --- seletor invertido: em inglês, quem vira link é o português
html = re.sub(
    r'  <div class="lang">.*?\n  </div>\n',
    '''  <div class="lang">
    <a class="lang-btn" href="../" data-base="../" hreflang="pt-br" title="Português"><img class="flag" src="../uploads/br.png" width="22" height="22" alt="Português"></a>
    <span class="lang-btn is-active" aria-current="true" title="English"><img class="flag" src="../uploads/us.png" width="22" height="22" alt="English"></span>
  </div>
''', html, count=1, flags=re.S)

# --- endereço e idioma desta página (canônico e prévia)
for velho, novo_valor in (
        ('<link rel="canonical" href="https://davidupin.com/">',
         '<link rel="canonical" href="https://davidupin.com/en/">'),
        ('<meta property="og:url" content="https://davidupin.com/">',
         '<meta property="og:url" content="https://davidupin.com/en/">'),
        ('<meta property="og:locale" content="pt_BR">',
         '<meta property="og:locale" content="en_US">'),
        ('<meta property="og:locale:alternate" content="en_US">',
         '<meta property="og:locale:alternate" content="pt_BR">')):
    assert velho in html, velho
    html = html.replace(velho, novo_valor, 1)

# --- currículo: o par declarado no HTML em português vira o link definitivo
def trocar_cv(m):
    tag = m.group(0)
    href = re.search(r'data-href-en="([^"]+)"', tag)
    nome = re.search(r'data-download-en="([^"]+)"', tag)
    if href:
        tag = re.sub(r'href="[^"]+"', 'href="../%s"' % href.group(1), tag, count=1)
    if nome:
        tag = re.sub(r'download="[^"]+"', 'download="%s"' % nome.group(1), tag, count=1)
    tag = re.sub(r'\s*data-href-en="[^"]*"', '', tag)
    tag = re.sub(r'\s*data-download-en="[^"]*"', '', tag)
    return tag

html = re.sub(r'<a[^>]*data-href-en[^>]*>', trocar_cv, html)

os.makedirs('en', exist_ok=True)
io.open('en/index.html', 'w', encoding='utf-8', newline='\n').write(html)

faltando = sorted(set(p.faltando))
print('en/index.html gerado')
print('  strings traduzidas: %d' % p.traduzidas)
print('  sem tradução:       %d' % len(faltando))
for f in faltando:
    print('     %r' % f[:70])
if faltando:
    sys.exit(1)
