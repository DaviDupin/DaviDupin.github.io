# Portfólio — Davi Dupin

Site pessoal de Davi Dupin, Product Designer Sênior. HTML, CSS e JavaScript
puros, sem build: os arquivos são servidos exatamente como estão no repositório.

## Estrutura

| Arquivo | O que faz |
| --- | --- |
| `index.html` | Todo o conteúdo: home e os três cases, cada um em um `<main class="view">` |
| `styles.css` | Estilos do site |
| `app.js` | Troca de views por hash, rolagem até as âncoras e o zoom out da hero |
| `anim.js` | Animações ilustrativas dos cards de case |
| `uploads/` | Imagens e o PDF do currículo |

## Rodando localmente

Qualquer servidor estático serve. Por exemplo:

```bash
python -m http.server 8000
```

E abrir <http://localhost:8000>.

## Publicação

Publicado com GitHub Pages a partir da branch `main`. Cada push para `main`
atualiza o site automaticamente.
