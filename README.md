# LINKZIN - Encurtador de Links

Um encurtador de links moderno e responsivo desenvolvido em JavaScript puro.

## 🚀 Funcionalidades

- **Encurtamento de Links**: Transforme URLs longas em links curtos e amigáveis
- **Controle de Limites**: Sistema de limites mensais (5 links gratuitos, 3000 premium)
- **Estatísticas**: Acompanhe cliques e acessos aos seus links
- **Interface Responsiva**: Funciona perfeitamente em desktop, tablet e mobile
- **Armazenamento Local**: Links salvos no localStorage do navegador
- **Validação de URLs**: Verificação automática de URLs válidas
- **Cópia Rápida**: Botão para copiar links encurtados com um clique

## 📁 Estrutura do Projeto

```
SITE ENCURTARDOR DE LINK/
├── index.html          # Página principal com o encurtador
├── shortener.js        # Lógica principal do encurtador
├── linkControl.js      # Controle de limites e estatísticas
├── styles.css          # Estilos CSS
├── test.html           # Página de teste para verificar funcionalidades
└── README.md           # Este arquivo
```

## 🛠️ Como Usar

### 1. Abrir o Encurtador
Abra o arquivo `index.html` em seu navegador para acessar o encurtador.

### 2. Encurtar um Link
1. Cole ou digite a URL que deseja encurtar no campo de entrada
2. Clique no botão "Encurtar Link"
3. O link encurtado será exibido com opções para copiar

### 3. Testar Funcionalidades
Abra o arquivo `test.html` para testar diferentes cenários:
- URLs válidas com protocolo
- URLs sem protocolo (será adicionado automaticamente)
- URLs inválidas (para verificar tratamento de erros)

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos e responsivos
- **JavaScript ES6+**: Lógica de encurtamento e controle
- **Módulos ES6**: Sistema de importação/exportação
- **localStorage**: Armazenamento local dos dados
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia (Inter)

## 📊 Sistema de Limites

### Usuários Gratuitos
- **Limite mensal**: 5 links
- **Reset automático**: Todo mês
- **Funcionalidades**: Encurtamento básico

### Usuários Premium (Futuro)
- **Limite mensal**: 3000 links
- **Funcionalidades adicionais**: Estatísticas avançadas, links personalizados

## 🎨 Personalização

### Cores Principais
```css
--primary-color: #2563eb;    /* Azul principal */
--yellow: #FFB800;           /* Amarelo/dourado */
--accent-color: #000B3F;     /* Azul marinho */
```

### Modificar Limites
Para alterar os limites de links, edite o arquivo `linkControl.js`:
```javascript
this.FREE_LIMIT = 5;        // Limite gratuito
this.PREMIUM_LIMIT = 3000;  // Limite premium
```

## 🔍 Funcionalidades Técnicas

### Validação de URLs
- Aceita URLs com ou sem protocolo (http/https)
- Validação automática de formato
- Tratamento de erros amigável

### Geração de Códigos
- Códigos de 6 caracteres aleatórios
- Combinação de letras maiúsculas, minúsculas e números
- Uso de `crypto.getRandomValues()` para segurança

### Armazenamento
- Links salvos no localStorage
- Estatísticas de cliques
- Controle de limites mensais
- Reset automático mensal

## 🚀 Como Executar

1. **Clone ou baixe** os arquivos do projeto
2. **Abra** o arquivo `index.html` em um navegador moderno
3. **Teste** o encurtador com diferentes URLs
4. **Verifique** o arquivo `test.html` para testes específicos

## 📱 Responsividade

O encurtador é totalmente responsivo e funciona em:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

## 🔒 Segurança

- Validação de URLs para prevenir links maliciosos
- Geração segura de códigos aleatórios
- Sanitização de dados de entrada
- Tratamento de erros robusto

## 🐛 Solução de Problemas

### Erro "shortenUrl is not defined"
- Verifique se está usando um servidor local (devido aos módulos ES6)
- Use `python -m http.server` ou `npx serve` para servir os arquivos

### Links não salvam
- Verifique se o localStorage está habilitado no navegador
- Limpe o cache do navegador se necessário

### Erro de CORS
- Execute através de um servidor local, não abrindo diretamente o arquivo HTML

## 📈 Próximas Funcionalidades

- [ ] Sistema de login/registro
- [ ] Links personalizados
- [ ] QR Code para links
- [ ] API REST para integração
- [ ] Dashboard com estatísticas avançadas
- [ ] Sistema de denúncias
- [ ] Integração com redes sociais

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

---

**Desenvolvido com ❤️ para facilitar o compartilhamento de links** 