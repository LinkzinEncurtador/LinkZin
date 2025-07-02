const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Habilita o CORS para todas as rotas
app.use(cors());

// Adiciona um endpoint de "Health Check" para o Render
app.get('/', (req, res) => {
    res.status(200).send('Health check OK. Scraper is ready.');
});

// Servir arquivos estáticos do diretório raiz
app.use(express.static(path.join(__dirname)));

// Rota para redirecionamento de links curtos
app.get('/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    
    // Ignora arquivos estáticos e rotas conhecidas
    if (shortCode.includes('.') || 
        ['api', 'login', 'signup', 'dashboard', 'pricing', 'features', 'contato', 'termos', 'privacidade'].includes(shortCode)) {
        return res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
    
    // Tenta carregar os dados do localStorage do servidor (simulado)
    try {
        const linksData = loadLinksFromStorage();
        const longUrl = linksData[shortCode];
        
        if (longUrl) {
            // Incrementa o contador de cliques
            incrementClickCount(shortCode);
            
            // Redireciona para a URL original
            res.redirect(301, longUrl);
        } else {
            // Se não encontrar o link, serve a página 404
            res.status(404).sendFile(path.join(__dirname, '404.html'));
        }
    } catch (error) {
        console.error('Erro ao processar redirecionamento:', error);
        res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
});

// API para criar links curtos
app.post('/api/shorten', express.json(), (req, res) => {
    try {
        const { longUrl, shortCode } = req.body;
        
        if (!longUrl) {
            return res.status(400).json({ error: 'URL longa é obrigatória' });
        }
        
        // Valida a URL
        try {
            new URL(longUrl);
        } catch {
            return res.status(400).json({ error: 'URL inválida' });
        }
        
        // Gera código curto se não fornecido
        const finalShortCode = shortCode || generateShortCode();
        
        // Salva o link
        const success = saveLinkToStorage(finalShortCode, longUrl);
        
        if (success) {
            res.json({
                success: true,
                shortCode: finalShortCode,
                shortUrl: `${req.protocol}://${req.get('host')}/${finalShortCode}`,
                longUrl: longUrl
            });
        } else {
            res.status(500).json({ error: 'Erro ao salvar link' });
        }
        
    } catch (error) {
        console.error('Erro ao criar link curto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// API para obter estatísticas de um link
app.get('/api/stats/:shortCode', (req, res) => {
    try {
        const shortCode = req.params.shortCode;
        const stats = getLinkStats(shortCode);
        
        if (stats) {
            res.json(stats);
        } else {
            res.status(404).json({ error: 'Link não encontrado' });
        }
        
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Função para carregar links do storage (simulação de banco de dados)
function loadLinksFromStorage() {
    try {
        // Em produção, isso seria um banco de dados real
        // Por enquanto, vamos simular com um arquivo JSON
        const dataPath = path.join(__dirname, 'data', 'links.json');
        
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            return JSON.parse(data);
        }
        
        return {};
    } catch (error) {
        console.error('Erro ao carregar links:', error);
        return {};
    }
}

// Função para incrementar contador de cliques
function incrementClickCount(shortCode) {
    try {
        const dataPath = path.join(__dirname, 'data', 'links.json');
        const statsPath = path.join(__dirname, 'data', 'stats.json');
        
        // Garante que o diretório data existe
        const dataDir = path.dirname(dataPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Carrega estatísticas existentes
        let stats = {};
        if (fs.existsSync(statsPath)) {
            stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        }
        
        // Incrementa o contador
        if (!stats[shortCode]) {
            stats[shortCode] = { clicks: 0, lastAccessed: null };
        }
        
        stats[shortCode].clicks++;
        stats[shortCode].lastAccessed = new Date().toISOString();
        
        // Salva as estatísticas
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
        
    } catch (error) {
        console.error('Erro ao incrementar contador:', error);
    }
}

// Função para salvar link no storage
function saveLinkToStorage(shortCode, longUrl) {
    try {
        const dataPath = path.join(__dirname, 'data', 'links.json');
        
        // Garante que o diretório data existe
        const dataDir = path.dirname(dataPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Carrega links existentes
        let links = {};
        if (fs.existsSync(dataPath)) {
            links = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        
        // Adiciona o novo link
        links[shortCode] = longUrl;
        
        // Salva os links
        fs.writeFileSync(dataPath, JSON.stringify(links, null, 2));
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar link:', error);
        return false;
    }
}

// Função para obter estatísticas de um link
function getLinkStats(shortCode) {
    try {
        const statsPath = path.join(__dirname, 'data', 'stats.json');
        const linksPath = path.join(__dirname, 'data', 'links.json');
        
        if (!fs.existsSync(statsPath) || !fs.existsSync(linksPath)) {
            return null;
        }
        
        const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        const links = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
        
        if (!links[shortCode]) {
            return null;
        }
        
        return {
            shortCode,
            longUrl: links[shortCode],
            clicks: stats[shortCode]?.clicks || 0,
            lastAccessed: stats[shortCode]?.lastAccessed || null
        };
        
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        return null;
    }
}

// Função para gerar código curto aleatório
function generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 6;
    let code = '';
    
    for (let i = 0; i < codeLength; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return code;
}

// Novo endpoint para streaming de eventos
app.get('/api/scrape-stream', (req, res) => {
    const postUrl = req.query.url;

    if (!postUrl || !postUrl.includes('instagram.com/p/')) {
        res.status(400).send('URL do post do Instagram inválida ou não fornecida.');
        return;
    }

    // Desativa o timeout para esta requisição, essencial para SSE
    req.setTimeout(0);

    // Configura os headers para Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Envia os headers imediatamente

    // Ping para manter a conexão viva
    const keepAliveInterval = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 15000);

    // Função para enviar eventos para o cliente
    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Inicia o processo de scraping
    (async () => {
        try {
            await scrapeAndStream(postUrl, sendEvent);
            console.log('Streaming concluído com sucesso.');
        } catch (error) {
            console.error('Erro no stream de scraping:', error.message);
            sendEvent({ type: 'error', message: error.message });
        } finally {
            clearInterval(keepAliveInterval); // Para o ping
            res.end(); // Fecha a conexão
        }
    })();

    // Garante que a conexão seja fechada se o cliente se desconectar
    req.on('close', () => {
        console.log('Cliente desconectado. Limpando intervalo.');
        clearInterval(keepAliveInterval);
        res.end();
    });
});

async function scrapeAndStream(postUrl, sendEvent) {
    let browser = null;
    try {
        sendEvent({ type: 'status', message: 'Iniciando navegador otimizado...' });
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Essencial para ambientes como Docker/Render
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // Pode ajudar em ambientes com pouca memória
                '--disable-gpu' // Menos relevante em modo headless, mas não custa
            ]
        });

        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en'
        });
        await page.setViewport({ width: 1280, height: 800 });

        sendEvent({ type: 'status', message: 'Navegando para a página...' });
        await page.goto(postUrl, { waitUntil: 'networkidle2' });

        // Tenta fechar pop-ups (login, cookies, etc.)
        const selectorsToClose = [
            'div[role="dialog"] button > div[aria-label="Close"]', // Pop-up de login
            'button._a9--._a9_1' // Botão de cookies
        ];

        for (const selector of selectorsToClose) {
            try {
                await page.waitForSelector(selector, { timeout: 3000 });
                await page.click(selector);
                sendEvent({ type: 'status', message: 'Pop-up fechado.' });
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
                // Selector não encontrado, o que é esperado se não houver pop-up
            }
        }
        
        sendEvent({ type: 'status', message: 'Procurando e extraindo comentários...' });
        const comments = await scrapeComments(page, sendEvent);
        
        sendEvent({ type: 'done', comments });

    } catch (error) {
        console.error('Erro durante o scraping:', error);
        const errorMessage = 'Falha ao carregar comentários. A postagem pode ser privada, ter os comentários desativados ou o Instagram pode ter bloqueado a solicitação.';
        sendEvent({ type: 'error', message: errorMessage });
        throw new Error(errorMessage);
    } finally {
        if (browser) {
            sendEvent({ type: 'status', message: 'Fechando navegador.' });
            await browser.close();
        }
    }
}

async function scrapeComments(page, sendEvent) {
    const commentsSet = new Set();
    let previousHeight;
    let scrollAttempts = 0;
    const maxScrollAttempts = 100; // Aumentado para posts com muitos comentários

    while (scrollAttempts < maxScrollAttempts) {
        // Seletor mais robusto para os elementos dos comentários
        const commentsNodes = await page.$$('div._a9zr');
        
        for (const node of commentsNodes) {
            try {
                const usernameEl = await node.$('h3 a');
                const commentTextEl = await node.$('span');
                if (usernameEl && commentTextEl) {
                    const username = await page.evaluate(el => el.innerText, usernameEl);
                    const commentText = await page.evaluate(el => el.innerText, commentTextEl);
                    const uniqueComment = JSON.stringify({ username, commentText });
                    
                    if (!commentsSet.has(uniqueComment)) {
                        commentsSet.add(uniqueComment);
                    }
                }
            } catch (e) {
                // Ignora extrações falhas
            }
        }
        
        // Envia uma atualização de progresso
        sendEvent({ type: 'progress', count: commentsSet.size });

        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        
        try {
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 3000 });
        } catch (e) {
            // Tenta clicar no botão de "carregar mais"
            const loadMoreButton = await page.$('svg[aria-label="Load more comments"]');
            if (loadMoreButton) {
                sendEvent({ type: 'status', message: 'Carregando mais comentários...' });
                try {
                    await loadMoreButton.click();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (clickError) {
                    // Botão pode ter sumido, encerra o loop
                    sendEvent({ type: 'status', message: 'Não foi possível clicar em "Carregar mais". Finalizando busca.' });
                    break;
                }
            } else {
                sendEvent({ type: 'status', message: 'Não há mais comentários para carregar.' });
                break;
            }
        }
        scrollAttempts++;
    }
    
    return Array.from(commentsSet).map(c => JSON.parse(c));
}

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Acesse o gerador de QR Code em http://localhost:${port}/geradordeqrcode.html`);
}); 