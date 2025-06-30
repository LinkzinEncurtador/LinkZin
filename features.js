document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Modal
    const modal = document.getElementById('numberDrawerModal');
    const btn = document.getElementById('numberDrawerBtn');
    const span = document.getElementsByClassName('close')[0];
    const drawButton = document.getElementById('drawButton');
    const drawResult = document.getElementById('drawResult');

    // Abrir modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // Fechar modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Fechar modal ao clicar fora
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Função para sortear números
    function drawNumbers(min, max, quantity) {
        const numbers = new Set();
        while(numbers.size < quantity) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(num);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    // Evento de sorteio
    drawButton.addEventListener('click', () => {
        const min = parseInt(document.getElementById('minNumber').value);
        const max = parseInt(document.getElementById('maxNumber').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        // Validações
        if (min >= max) {
            alert('O número mínimo deve ser menor que o máximo');
            return;
        }

        if (quantity > (max - min + 1)) {
            alert('A quantidade de números não pode ser maior que o intervalo disponível');
            return;
        }

        // Realiza o sorteio
        const numbers = drawNumbers(min, max, quantity);
        
        // Exibe o resultado
        drawResult.innerHTML = `
            <h3>Números Sorteados:</h3>
            <div class="numbers">
                ${numbers.map(num => `<span>${num}</span>`).join('')}
            </div>
        `;
        drawResult.classList.add('show');
    });

    // Código existente do contador de cliques
    const clickCounterForm = document.getElementById('clickCounterForm');
    const clickResult = document.getElementById('clickResult');

    clickCounterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const shortUrl = document.getElementById('shortUrl').value.trim();
        
        try {
            const response = await simulateClickCount(shortUrl);
            
            clickResult.innerHTML = `
                <div class="result-content">
                    <h3>Estatísticas do Link</h3>
                    <p>Total de cliques: <strong>${response.clicks}</strong></p>
                    <p>Último clique: <strong>${response.lastClick}</strong></p>
                </div>
            `;
            clickResult.classList.add('show');
            
        } catch (error) {
            clickResult.innerHTML = `
                <div class="error-content">
                    <p>Erro ao buscar estatísticas: ${error.message}</p>
                </div>
            `;
            clickResult.classList.add('show');
        }
    });
});

// Função simulada para contar cliques
async function simulateClickCount(shortUrl) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        clicks: Math.floor(Math.random() * 1000),
        lastClick: new Date().toLocaleString('pt-BR')
    };
} 