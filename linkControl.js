// Classe para gerenciar o controle de links
class LinkController {
    constructor() {
        this.FREE_LIMIT = Infinity; // Sem limite para usuários gratuitos
        this.PREMIUM_LIMIT = Infinity; // Sem limite para usuários premium
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
        // Sem limites - sempre permite criar links
        return true;
    }

    incrementLinkCount() {
        this.monthlyCount++;
        this.saveToLocalStorage();
    }

    getRemainingLinks() {
        // Sem limites - sempre retorna ilimitado
        return 'Ilimitado';
    }

    getMonthlyLimit() {
        return 'Ilimitado';
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
        return {
            used: this.monthlyCount,
            remaining: 'Ilimitado',
            limit: 'Ilimitado',
            isPremium: this.isPremium,
            lastReset: this.lastReset
        };
    }
}

const linkController = new LinkController();
export { linkController };
export default linkController; 