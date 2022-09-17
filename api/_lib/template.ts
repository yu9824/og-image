
import { readFileSync } from 'fs';
import { marked } from 'marked';
import { sanitizeHtml } from './sanitizer';
import { ParsedRequest } from './types';
const twemoji = require('twemoji');
const twOptions = { folder: 'svg', ext: '.svg' };
const emojify = (text: string) => twemoji.parse(text, twOptions);

// Customize fonts.
const rglr = readFileSync(`${__dirname}/../_fonts/MyWebSubsetFont-Regular.woff2`).toString('base64');
const bold = readFileSync(`${__dirname}/../_fonts/MyWebSubsetFont-Medium.woff2`).toString('base64');
const mono = readFileSync(`${__dirname}/../_fonts/Vera-Mono.woff2`).toString('base64');


function getCss(fontSize: string, width: string, textColor: string, textStrongColor: string) {
    return `
    @import url('https://fonts.googleapis.com/css?family=M+PLUS+1p');
    @import url('https://cdn.jsdelivr.net/npm/yakuhanjp@3.4.1/dist/css/yakuhanjp_s.min.css');

    @font-face {
        font-family: 'MyWebSubsetFont';
        font-style:  normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${rglr}) format('woff2');
    }

    @font-face {
        font-family: 'MyWebSubsetFont';
        font-style:  normal;
        font-weight: bold;
        src: url(data:font/woff2;charset=utf-8;base64,${bold}) format('woff2');
    }

    @font-face {
        font-family: 'Vera';
        font-style: normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${mono})  format("woff2");
      }

    body {
        height: 100vh;
        display: flex;
        text-align: center;
        align-items: center;
        justify-content: center;
    }

    body.none {
        background-color: #ffffff;
    }

    body.cross {
        background-color: #ffffff;
        background: radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent) 25px 25px, linear-gradient(#dbdbdb 2px, transparent 2px) 0 -1px, linear-gradient(90deg, #dbdbdb 2px, #ffffff 2px) -1px 0;
        background-size: 100px 100px, 50px 50px, 25px 25px, 25px 25px;
    }

    body.polka {
        background-color: #ffffff;
        background-image:  radial-gradient(#dbdbdb 4px, transparent 2px), radial-gradient(#dbdbdb 4px, #ffffff 2px);
        background-size: 100px 100px;
        background-position: 0 -35px,50px 15px;
    }

    h1,h2,h3,h4,h5,h6,p {
        margin: 0;
    }

    strong {
        color: ${sanitizeHtml(textStrongColor)};
    }

    code {
        color: #fff;
        font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
        white-space: pre-wrap;
        background-color: #282828;
        border-radius: 8px;
        font-size: 0.8em;
    }

    li {
        text-align: left;
    }

    blockquote {
        color: #6a737d;
        padding: 0 12px;
    }

    .logo-wrapper {
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
        justify-items: center;
    }

    .icon{
        display: block;
        position: absolute;
        width: 128px;
        height: 128px;
        top: 36px;
        left: 0;
        right: 0;
        margin:  auto;
      }

    .logo {
        display: block;
        position: absolute;
        width: 128px;
        height: 128px;
        bottom: 36px;
        left: 0;
        right: 0;
        margin:  auto;
    }

    .overlay {
        display: block;
        object-fit: cover;
        position: absolute;
        width: 1200px;
        height: 630px;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin:  auto;
    }

    .plus {
        color: #BBB;
        font-family: Times New Roman, Verdana;
        font-size: 100px;
    }

    .spacer {
        margin: 150px;
    }

    .emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }

    .heading {
        font-family: YakuHanJPs, 'MyWebSubsetFont', 'M PLUS 1p', 'Inter', sans-serif;
        font-size: ${sanitizeHtml(fontSize)};
        font-style: normal;
        color: ${sanitizeHtml(textColor)};
        line-height: 1.4;
        position: absolute;
        display: flex;
        flex-direction: column;
        width: ${sanitizeHtml(width)};
        height: 600px;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        justify-content: center;
        align-items: center;
    }`;
}

export function getHtml(parsedReq: ParsedRequest) {
    const { text, pattern, md, fontSize, width, textColor, textStrongColor, overlay } = parsedReq;
    return `<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.3/dist/katex.min.css" integrity="sha384-ThssJ7YtjywV52Gj4JE/1SQEDoMEckXyhkFVwaf4nDSm5OBlXeedVYjuuUd0Yua+" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.3/dist/katex.min.js" integrity="sha384-Bi8OWqMXO1ta+a4EPkZv7bYGIes7C3krGSZoTGNTAnAn5eYQc7IIXrJ/7ck1drAi" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.3/dist/contrib/auto-render.min.js" integrity="sha384-vZTG03m+2yp6N6BNi5iM4rW4oIwk5DfcNdFfxkk9ZWpDriOkXX8voJBFrAO7MpVl" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
    </head>
    <meta charset="utf-8">
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss(fontSize, width, textColor, textStrongColor)}
    </style>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
        renderMathInElement(document.body, {delimiters: [
            {left: "\\[", right: "\\]", display: true},
            {left: "$", right: "$", display: false}
            ]});
        });
    </script>
    <body class="${pattern}">
        <div>
            ${overlay ? `<img class="overlay" src="${sanitizeHtml(overlay)}">` :""}
            <div class="heading">${emojify(
        md ? marked(text) : sanitizeHtml(text)
    )}
            </div>
        </div>
    </body>
</html>`;
}

