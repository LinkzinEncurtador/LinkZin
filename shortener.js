import { linkController } from './linkControl.js';

class LinkShortener {
    constructor() {
        this.baseUrl = window.location.origin;
        this.shortLinks = new Map();
        this.stats = new Map();
        this.loadFromLocalStorage();
    }

    async shortenUrl(longUrl) {
        try {
            // Verifica se o usuário pode criar mais links
            if (!linkController.canCreateLink()) {
                throw new Error('Limite de links atingido para este mês');
            }

            // Verifica se a URL é válida
            if (!this.isValidUrl(longUrl)) {
                throw new Error('URL inválida. Por favor, insira uma URL válida (ex: https://www.exemplo.com)');
            }

            // Verifica se já existe um link curto para esta URL
            const existingShortLink = this.findExistingShortLink(longUrl);
            if (existingShortLink) {
                return {
                    shortUrl: this.baseUrl + '/' + existingShortLink,
                    code: existingShortLink
                };
            }

            // Gera um novo código curto
            const shortCode = this.generateShortCode();
            
            // Salva o novo link
            this.shortLinks.set(shortCode, longUrl);
            this.stats.set(shortCode, {
                clicks: 0,
                createdAt: new Date().toISOString(),
                lastAccessed: null
            });

            // Incrementa o contador de links criados
            linkController.incrementLinkCount();
            
            // Salva no localStorage
            this.saveToLocalStorage();

            return {
                shortUrl: this.baseUrl + '/' + shortCode,
                code: shortCode
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    findExistingShortLink(longUrl) {
        for (const [code, data] of this.shortLinks) {
            if (data === longUrl) {
                return code;
            }
        }
        return null;
    }

    getLongUrl(shortCode) {
        const longUrl = this.shortLinks.get(shortCode);
        if (longUrl) {
            const stats = this.stats.get(shortCode);
            if (stats) {
                stats.clicks++;
                stats.lastAccessed = new Date().toISOString();
                this.stats.set(shortCode, stats);
                this.saveToLocalStorage();
            }
            return longUrl;
        }
        return null;
    }

    generateShortCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const codeLength = 6;
        let code = '';
        
        // Usando crypto.getRandomValues para gerar números aleatórios seguros
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const randomValues = new Uint32Array(codeLength);
            crypto.getRandomValues(randomValues);
            
            for (let i = 0; i < codeLength; i++) {
                code += chars[randomValues[i] % chars.length];
            }
        } else {
            // Fallback para navegadores mais antigos
            for (let i = 0; i < codeLength; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        return code;
    }

    getLinkStats(shortCode) {
        const stats = this.stats.get(shortCode);
        if (!stats) {
            throw new Error('Link não encontrado');
        }
        return {
            ...stats,
            shortCode,
            longUrl: this.shortLinks.get(shortCode)
        };
    }

    getAllLinks() {
        const links = [];
        for (const [code, data] of this.shortLinks) {
            links.push({
                shortCode: code,
                shortUrl: this.baseUrl + '/' + code,
                longUrl: data,
                ...this.stats.get(code)
            });
        }
        return links;
    }

    saveToLocalStorage() {
        try {
            const data = Array.from(this.shortLinks.entries());
            localStorage.setItem('shortLinks', JSON.stringify(data));
            
            const statsData = Array.from(this.stats.entries());
            localStorage.setItem('shortLinksStats', JSON.stringify(statsData));
        } catch (error) {
            console.warn('Erro ao salvar no localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('shortLinks');
            if (data) {
                this.shortLinks = new Map(JSON.parse(data));
            }
            
            const statsData = localStorage.getItem('shortLinksStats');
            if (statsData) {
                this.stats = new Map(JSON.parse(statsData));
            }
        } catch (error) {
            console.warn('Erro ao carregar do localStorage:', error);
            this.shortLinks = new Map();
            this.stats = new Map();
        }
    }

    deleteLink(shortCode) {
        if (this.shortLinks.has(shortCode)) {
            this.shortLinks.delete(shortCode);
            this.stats.delete(shortCode);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    isValidUrl(url) {
        try {
            // Adiciona protocolo se não estiver presente
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

const shortener = new LinkShortener();
export { shortener }; 