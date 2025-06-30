const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');

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
    console.log(`Acesse a ferramenta de sorteio em http://localhost:${port}/sorteador.html`);
}); 