// Classe para gerenciar o controle de links
class LinkController {
    constructor() {
        this.FREE_LIMIT = 15; // Limite mensal para usuários gratuitos
        this.PREMIUM_LIMIT = 3000; // Limite mensal para usuários premium
        this.loadFromLocalStorage();
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('linkControl');
            if (data) {
                const parsed = JSON.parse(data);
                this.monthlyCount = parsed.monthlyCount || 0;
                this.lastReset = parsed.lastReset || new Date().toISOString();
                this.isPremium = parsed.isPremium || false;
            } else {
                this.monthlyCount = 0;
                this.lastReset = new Date().toISOString();
                this.isPremium = false;
                this.saveToLocalStorage();
            }
            this.checkMonthReset();
        } catch (error) {
            console.warn('Erro ao carregar dados do localStorage:', error);
            this.monthlyCount = 0;
            this.lastReset = new Date().toISOString();
            this.isPremium = false;
        }
    }

    saveToLocalStorage() {
        try {
            const data = {
                monthlyCount: this.monthlyCount,
                lastReset: this.lastReset,
                isPremium: this.isPremium
            };
            localStorage.setItem('linkControl', JSON.stringify(data));
        } catch (error) {
            console.warn('Erro ao salvar no localStorage:', error);
        }
    }

    checkMonthReset() {
        const lastReset = new Date(this.lastReset);
        const now = new Date();
        
        // Se estamos em um mês diferente do último reset
        if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
            this.monthlyCount = 0;
            this.lastReset = now.toISOString();
            this.saveToLocalStorage();
        }
    }

    canCreateLink() {
        this.checkMonthReset();
        const limit = this.isPremium ? this.PREMIUM_LIMIT : this.FREE_LIMIT;
        return this.monthlyCount < limit;
    }

    incrementLinkCount() {
        this.monthlyCount++;
        this.saveToLocalStorage();
    }

    getRemainingLinks() {
        this.checkMonthReset();
        const limit = this.isPremium ? this.PREMIUM_LIMIT : this.FREE_LIMIT;
        return Math.max(0, limit - this.monthlyCount);
    }

    getMonthlyLimit() {
        return this.isPremium ? this.PREMIUM_LIMIT : this.FREE_LIMIT;
    }

    isUserPremium() {
        return this.isPremium;
    }

    upgradeToPremium() {
        this.isPremium = true;
        this.saveToLocalStorage();
    }

    downgradeToFree() {
        this.isPremium = false;
        this.saveToLocalStorage();
    }

    resetMonthlyCount() {
        this.monthlyCount = 0;
        this.lastReset = new Date().toISOString();
        this.saveToLocalStorage();
    }

    getMonthlyStats() {
        this.checkMonthReset();
        const limit = this.isPremium ? this.PREMIUM_LIMIT : this.FREE_LIMIT;
        return {
            used: this.monthlyCount,
            remaining: Math.max(0, limit - this.monthlyCount),
            limit: limit,
            isPremium: this.isPremium,
            lastReset: this.lastReset
        };
    }
}

const linkController = new LinkController();
export { linkController };
export default linkController; 