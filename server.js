const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Substitua pelo seu token de acesso de página
const ACCESS_TOKEN = 'SEU_TOKEN_DE_ACESSO_DO_FACEBOOK_GRAPH_API';

// Função para extrair o shortcode da URL do post
function extractShortcode(url) {
    const match = url.match(/instagram\.com\/p\/([\w-]+)/);
    return match ? match[1] : null;
}

// Função para buscar o ID do post a partir do shortcode
async function getMediaId(shortcode) {
    const url = `https://graph.facebook.com/v19.0/instagram_oembed?url=https://www.instagram.com/p/${shortcode}/&access_token=${ACCESS_TOKEN}`;
    const response = await axios.get(url);
    return response.data.media_id;
}

// Endpoint para buscar comentários
app.post('/api/instagram-comments', async (req, res) => {
    try {
        const { postUrl } = req.body;
        const shortcode = extractShortcode(postUrl);
        if (!shortcode) return res.status(400).json({ error: 'URL inválida.' });

        const mediaId = await getMediaId(shortcode);

        // Busca comentários do post
        const commentsUrl = `https://graph.facebook.com/v19.0/${mediaId}/comments?fields=username,text,timestamp&access_token=${ACCESS_TOKEN}`;
        const commentsRes = await axios.get(commentsUrl);

        res.json({ comments: commentsRes.data.data });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar comentários.' });
    }
});

const PORT = 3000;

// Mapeamento de extensões para tipos MIME
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Log da requisição
    console.log(`${req.method} ${req.url}`);

    // Normalizar a URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Obter a extensão do arquivo
    const extname = path.extname(filePath);
    let contentType = mimeTypes[extname] || 'application/octet-stream';

    // Ler o arquivo
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Arquivo não encontrado
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head>
                            <title>404 - Página não encontrada</title>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                                h1 { color: #e74c3c; }
                                a { color: #3498db; text-decoration: none; }
                                a:hover { text-decoration: underline; }
                            </style>
                        </head>
                        <body>
                            <h1>404 - Página não encontrada</h1>
                            <p>A página que você está procurando não existe.</p>
                            <a href="/">Voltar para o início</a>
                        </body>
                    </html>
                `);
            } else {
                // Erro do servidor
                res.writeHead(500);
                res.end(`Erro do servidor: ${error.code}`);
            }
        } else {
            // Sucesso
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Abra seu navegador e acesse: http://localhost:${PORT}`);
    console.log(`🧪 Para testar: http://localhost:${PORT}/test.html`);
    console.log(`⏹️  Para parar o servidor: Ctrl+C`);
});

// Tratamento de erro do servidor
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${PORT} já está em uso. Tente outra porta.`);
    } else {
        console.error('❌ Erro no servidor:', error);
    }
});

// Tratamento de interrupção
process.on('SIGINT', () => {
    console.log('\n👋 Servidor encerrado.');
    process.exit(0);
}); 