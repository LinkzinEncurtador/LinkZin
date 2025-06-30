import linkController from './linkControl.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const shortenButton = document.querySelector('.btn-shorten');

    shortenButton.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Por favor, insira uma URL válida');
            return;
        }

        try {
            // Aqui você implementará a lógica de encurtamento
            // Por enquanto, vamos apenas simular
            const shortUrl = 'https://linkzin.com/abc123';
            
            // Criar elemento para mostrar o link encurtado
            const resultDiv = document.createElement('div');
            resultDiv.className = 'url-result';
            resultDiv.innerHTML = `
                <h3>Seu link encurtado:</h3>
                <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                <button class="btn-copy">Copiar</button>
            `;

            // Inserir após o formulário
            const form = document.querySelector('.url-form');
            form.parentNode.insertBefore(resultDiv, form.nextSibling);

            // Adicionar funcionalidade de copiar
            const copyButton = resultDiv.querySelector('.btn-copy');
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(shortUrl);
                copyButton.textContent = 'Copiado!';
                setTimeout(() => {
                    copyButton.textContent = 'Copiar';
                }, 2000);
            });
        } catch (error) {
            alert('Ocorreu um erro ao encurtar o link. Por favor, tente novamente.');
            console.error(error);
        }
    });
});

// Função para redirecionar para a página de login
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Função para redirecionar para a página de cadastro
function redirectToSignup() {
    window.location.href = 'signup.html';
}

// Função para redirecionar para a página de preços
function redirectToPricing() {
    window.location.href = 'pricing.html';
}

// Função para redirecionar para a página inicial
function redirectToHome() {
    window.location.href = 'index.html';
}

// Função para redirecionar para a página de recuperação de senha
function redirectToForgotPassword() {
    window.location.href = 'forgot-password.html';
}

// Objeto para armazenar os dados das URLs encurtadas
const urlDatabase = {
    urls: {},
    getClicks: function(shortUrl) {
        return this.urls[shortUrl]?.clicks || 0;
    },
    incrementClicks: function(shortUrl) {
        if (this.urls[shortUrl]) {
            this.urls[shortUrl].clicks++;
            this.urls[shortUrl].lastClick = new Date();
            this.saveToLocalStorage();
            return this.urls[shortUrl].clicks;
        }
        return 0;
    },
    addUrl: function(longUrl, shortUrl) {
        this.urls[shortUrl] = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            clicks: 0,
            created: new Date(),
            lastClick: null
        };
        this.saveToLocalStorage();
    },
    saveToLocalStorage: function() {
        localStorage.setItem('urlDatabase', JSON.stringify(this.urls));
    },
    loadFromLocalStorage: function() {
        const saved = localStorage.getItem('urlDatabase');
        if (saved) {
            this.urls = JSON.parse(saved);
        }
    },
    checkAndCleanInactive: function() {
        const now = new Date();
        Object.keys(this.urls).forEach(shortUrl => {
            const url = this.urls[shortUrl];
            if (url.lastClick) {
                const lastClickDate = new Date(url.lastClick);
                const monthsSinceLastClick = (now - lastClickDate) / (1000 * 60 * 60 * 24 * 30);
                if (monthsSinceLastClick > 1) {
                    delete this.urls[shortUrl];
                }
            }
        });
        this.saveToLocalStorage();
    }
};

// Função para encurtar URL
async function shortenUrl(longUrl) {
    try {
        // Gera um código único para a URL curta
        const shortCode = Math.random().toString(36).substring(2, 8);
        const shortUrl = window.location.origin + '/' + shortCode;
        
        // Adiciona a URL ao banco de dados
        urlDatabase.addUrl(longUrl, shortUrl);
        
        return shortUrl;
    } catch (error) {
        console.error('Erro ao encurtar URL:', error);
        throw error;
    }
}

// Função para copiar texto para a área de transferência
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar texto:', err);
    });
}

// Função para atualizar o contador de cliques
function updateClicksCounter(shortUrl) {
    const clicksCount = urlDatabase.getClicks(shortUrl);
    const clicksCounter = document.querySelector('.clicks-count');
    if (clicksCounter) {
        clicksCounter.textContent = clicksCount;
    }
}

// Função para resetar o formulário
function resetForm() {
    const urlInput = document.querySelector('.url-input');
    const urlResult = document.querySelector('.url-result');
    
    if (urlInput) urlInput.value = '';
    if (urlResult) urlResult.style.display = 'none';
}

// Adiciona os event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Carrega o banco de dados do localStorage
    urlDatabase.loadFromLocalStorage();
    
    // Verifica e limpa URLs inativas
    urlDatabase.checkAndCleanInactive();

    // Encurtamento de URL
    const urlForm = document.querySelector('.url-form');
    const urlInput = document.querySelector('.url-input');
    const shortenButton = document.querySelector('.btn-shorten');
    const urlResult = document.querySelector('.url-result');
    const shortUrlElement = document.querySelector('.short-url');
    const copyButton = document.querySelector('.btn-copy');
    const newUrlButton = document.querySelector('.btn-new');

    if (urlForm && shortenButton) {
        shortenButton.addEventListener('click', async () => {
            const longUrl = urlInput.value.trim();
            
            if (!longUrl) {
                alert('Por favor, insira uma URL válida');
                return;
            }

            try {
                const shortUrl = await shortenUrl(longUrl);
                shortUrlElement.textContent = shortUrl;
                shortUrlElement.href = shortUrl;
                urlResult.style.display = 'block';
                updateClicksCounter(shortUrl);
            } catch (error) {
                alert('Erro ao encurtar URL. Por favor, tente novamente.');
            }
        });

        if (copyButton) {
            copyButton.addEventListener('click', () => {
                copyToClipboard(shortUrlElement.href);
            });
        }

        if (newUrlButton) {
            newUrlButton.addEventListener('click', resetForm);
        }
    }

    // Intercepta cliques em links encurtados
    document.addEventListener('click', function(e) {
        if (e.target.matches('.short-url')) {
            e.preventDefault();
            const shortUrl = e.target.href;
            urlDatabase.incrementClicks(shortUrl);
            updateClicksCounter(shortUrl);
            window.open(urlDatabase.urls[shortUrl].longUrl, '_blank');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.url-form');
    if (form) {
        form.addEventListener('submit', handleLinkSubmission);
    }
});

async function handleLinkSubmission(event) {
    event.preventDefault();

    // Verifica se o usuário está logado
    const userEmail = getUserEmail(); // Função que retorna o email do usuário logado ou null
    
    // Verifica se o usuário pode criar mais links
    const linkStatus = await linkController.canCreateLink(userEmail);

    if (!linkStatus.canCreate) {
        showLimitMessage(linkStatus.total);
        return;
    }

    // Processa a criação do link
    const urlInput = document.querySelector('#url-input');
    if (urlInput && urlInput.value) {
        try {
            const shortLink = await createShortLink(urlInput.value);
            await linkController.registerNewLink(userEmail);
            showSuccess(shortLink);
            updateRemainingLinks(linkStatus.remainingLinks - 1);
        } catch (error) {
            showError('Erro ao criar link encurtado. Tente novamente.');
        }
    }
}

function getUserEmail() {
    // Verifica se há um usuário logado no localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
        return JSON.parse(userData).email;
    }
    return null;
}

function showLimitMessage(total) {
    const message = document.createElement('div');
    message.className = 'alert alert-warning';
    message.innerHTML = `
        <p>Você atingiu o limite de ${total} links gratuitos este mês.</p>
        <p>Para criar mais links, considere fazer upgrade para o plano Premium.</p>
        <a href="pricing.html" class="btn-yellow">Ver Planos</a>
    `;
    
    const form = document.querySelector('.url-form');
    form.insertAdjacentElement('afterend', message);
}

function updateRemainingLinks(remaining) {
    const counter = document.querySelector('.links-counter');
    if (counter) {
        counter.textContent = `Links restantes este mês: ${remaining}`;
    }
}

function showSuccess(shortLink) {
    const result = document.createElement('div');
    result.className = 'alert alert-success';
    result.innerHTML = `
        <p>Link encurtado criado com sucesso!</p>
        <div class="short-link-container">
            <input type="text" value="${shortLink}" readonly>
            <button onclick="copyToClipboard(this)" class="btn-copy">Copiar</button>
        </div>
    `;
    
    const form = document.querySelector('.url-form');
    form.insertAdjacentElement('afterend', result);
}

function showError(message) {
    const error = document.createElement('div');
    error.className = 'alert alert-error';
    error.textContent = message;
    
    const form = document.querySelector('.url-form');
    form.insertAdjacentElement('afterend', error);
}

async function createShortLink(url) {
    // Aqui você implementaria a lógica real de criação do link curto
    // Por enquanto, retornaremos um exemplo
    return `https://linkzin.com/${Math.random().toString(36).substr(2, 6)}`;
}

// Função para copiar o link para a área de transferência
function copyToClipboard(button) {
    const input = button.previousElementSibling;
    input.select();
    document.execCommand('copy');
    
    const originalText = button.textContent;
    button.textContent = 'Copiado!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Reseta os contadores no primeiro dia do mês
function setupMonthlyReset() {
    const now = new Date();
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const timeUntilReset = firstDayNextMonth - now;

    setTimeout(() => {
        linkController.resetMonthlyCounters();
        setupMonthlyReset(); // Agenda o próximo reset
    }, timeUntilReset);
}

// Inicia o agendamento do reset mensal
setupMonthlyReset(); 