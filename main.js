import Shortener from './shortener.js';
import LinkController from './linkControl.js';

document.addEventListener('DOMContentLoaded', () => {
    const shortener = new Shortener();
    const linkController = new LinkController();
    
    const urlInput = document.getElementById('urlInput');
    const shortenBtn = document.getElementById('shortenBtn');
    const resultContainer = document.getElementById('resultContainer');
    const linksList = document.getElementById('linksList');
    const remainingLinks = document.getElementById('remainingLinks');

    // Atualiza o contador de links restantes
    function updateRemainingLinks() {
        const plan = linkController.getUserPlan();
        const limit = linkController.getLinkLimit();
        const created = linkController.getLinksCreated();
        remainingLinks.textContent = `${limit - created} links restantes`;
    }

    // Exibe os links existentes
    function displayExistingLinks() {
        const links = shortener.getAllLinks();
        linksList.innerHTML = '';
        
        links.forEach(link => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.innerHTML = `
                <div class="link-info">
                    <a href="${link.shortUrl}" target="_blank">${link.shortUrl}</a>
                    <span class="clicks">${link.clicks} cliques</span>
                </div>
                <div class="link-actions">
                    <button class="copy-btn" data-url="${link.shortUrl}">Copiar</button>
                    <button class="delete-btn" data-code="${link.shortCode}">Excluir</button>
                </div>
            `;
            linksList.appendChild(linkItem);
        });
    }

    // Copia texto para a área de transferência
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Erro ao copiar texto:', err);
            return false;
        }
    }

    // Manipulador do formulário
    async function handleSubmit(e) {
        e.preventDefault();
        
        const longUrl = urlInput.value.trim();
        if (!longUrl) {
            showError('Por favor, insira uma URL');
            return;
        }

        if (!linkController.canCreateMoreLinks()) {
            showError('Limite de links atingido. Atualize seu plano para criar mais links.');
            return;
        }

        try {
            const shortCode = shortener.shortenUrl(longUrl);
            const shortUrl = `${window.location.origin}/${shortCode}`;
            
            linkController.incrementLinksCreated();
            showResult(shortUrl);
            displayExistingLinks();
            updateRemainingLinks();
            
            urlInput.value = '';
        } catch (err) {
            showError(err.message);
        }
    }

    // Exibe mensagem de erro
    function showError(message) {
        resultContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            </div>
        `;
    }

    // Exibe o resultado
    function showResult(shortUrl) {
        resultContainer.innerHTML = `
            <div class="result">
                <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                <button class="copy-btn" data-url="${shortUrl}">Copiar</button>
            </div>
        `;
    }

    // Event Listeners
    shortenBtn.addEventListener('click', handleSubmit);
    
    // Delegação de eventos para botões de copiar e excluir
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('copy-btn')) {
            const url = e.target.dataset.url;
            const success = await copyToClipboard(url);
            if (success) {
                e.target.textContent = 'Copiado!';
                setTimeout(() => {
                    e.target.textContent = 'Copiar';
                }, 2000);
            }
        }
        
        if (e.target.classList.contains('delete-btn')) {
            const code = e.target.dataset.code;
            shortener.deleteLink(code);
            displayExistingLinks();
            updateRemainingLinks();
        }
    });

    // Inicialização
    updateRemainingLinks();
    displayExistingLinks();
}); 