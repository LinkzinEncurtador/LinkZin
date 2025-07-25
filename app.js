import { shortener } from './shortener.js';
import { LinkController } from './linkControl.js';
const bcrypt = require('bcrypt');
const validator = require('validator');
const rateLimit = require('express-rate-limit');

document.addEventListener('DOMContentLoaded', () => {
    const linkController = new LinkController();
    const urlForm = document.getElementById('urlForm');
    const urlInput = document.getElementById('urlInput');
    const results = document.querySelector('.results');

    urlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Limpa mensagens anteriores
        results.innerHTML = '';
        
        try {

            const longUrl = urlInput.value.trim();
            const result = await shortener.shortenUrl(longUrl);
            
            // Incrementa o contador de links
            linkController.incrementLinkCount();

            // Mostra o resultado
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result';
            resultDiv.innerHTML = `
                <p>Link encurtado: <a href="${result.shortUrl}" target="_blank">${result.shortUrl}</a></p>
                <button class="copy-btn" data-url="${result.shortUrl}">Copiar</button>
            `;
            results.appendChild(resultDiv);

            // Adiciona funcionalidade de cópia
            const copyBtn = resultDiv.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(result.shortUrl)
                    .then(() => {
                        copyBtn.textContent = 'Copiado!';
                        setTimeout(() => {
                            copyBtn.textContent = 'Copiar';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Erro ao copiar:', err);
                    });
            });

            // Limpa o input
            urlInput.value = '';

        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = error.message;
            results.appendChild(errorDiv);
        }
    });
}); 