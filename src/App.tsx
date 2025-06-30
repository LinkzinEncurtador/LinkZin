import React, { useState } from 'react';
import styled from 'styled-components';
import logo from '../LOGO_LINKZIN.png';

// Cores personalizadas
const colors = {
  navy: '#003366', // Azul marinho
  black: '#000000',
  white: '#FFFFFF',
  yellow: '#FFD700', // Amarelo sol
  gray: '#666666',
  lightGray: '#F5F5F5'
};

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Header = styled.header`
  width: 100%;
  padding: 20px 40px;
  background-color: ${colors.white};
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  z-index: 1000;
`;

const Logo = styled.img`
  height: 32px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavLink = styled.a`
  color: ${colors.black};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    color: ${colors.navy};
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const LoginButton = styled(Button)`
  background: transparent;
  border: 1px solid ${colors.navy};
  color: ${colors.navy};
  
  &:hover {
    background: ${colors.lightGray};
  }
`;

const SignUpButton = styled(Button)`
  background: ${colors.yellow};
  border: none;
  color: ${colors.black};
  
  &:hover {
    background: #FFC000;
  }
`;

const Hero = styled.section`
  padding: 160px 40px 80px;
  background: linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%);
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  color: ${colors.black};
  margin-bottom: 20px;
  font-weight: 700;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  color: ${colors.gray};
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background: ${colors.white};
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${colors.navy};
  }
`;

const SubmitButton = styled(Button)`
  background: ${colors.navy};
  color: ${colors.white};
  border: none;
  padding: 12px 24px;
  
  &:hover {
    background: #002244;
  }
`;

const Features = styled.section`
  padding: 80px 40px;
  background: ${colors.white};
`;

const FeaturesTitle = styled.h2`
  font-size: 36px;
  color: ${colors.black};
  text-align: center;
  margin-bottom: 40px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  padding: 30px;
  background: ${colors.lightGray};
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  color: ${colors.black};
  margin-bottom: 16px;
`;

const FeatureDescription = styled.p`
  color: ${colors.gray};
  line-height: 1.6;
`;

const PlatformSection = styled.section`
  padding: 80px 40px;
  background: ${colors.navy};
  color: ${colors.white};
  text-align: center;
`;

const PlatformTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 20px;
`;

const PlatformSubtitle = styled.p`
  font-size: 20px;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const PlatformButton = styled(Button)`
  background: ${colors.yellow};
  color: ${colors.black};
  padding: 12px 24px;
  font-size: 16px;
  
  &:hover {
    background: #FFC000;
  }
`;

function App() {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de encurtamento aqui
  };

  return (
    <AppContainer>
      <Header>
        <Logo src={logo} alt="LINKZIN" />
        <Nav>
          <NavLink href="#">Plataforma</NavLink>
          <NavLink href="#">Soluções</NavLink>
          <NavLink href="#">Preços</NavLink>
          <NavLink href="#">Recursos</NavLink>
          <LoginButton>Entrar</LoginButton>
          <SignUpButton>Começar Grátis</SignUpButton>
        </Nav>
      </Header>

      <Hero>
        <HeroTitle>Construa conexões digitais mais fortes</HeroTitle>
        <HeroSubtitle>
          Use nosso encurtador de URL, QR Codes e páginas de destino para envolver seu público e conectá-lo às informações certas.
        </HeroSubtitle>
        <FormContainer>
          <Form onSubmit={handleSubmit}>
            <Input
              type="url"
              placeholder="Cole seu link aqui"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <SubmitButton type="submit">Encurtar</SubmitButton>
          </Form>
        </FormContainer>
      </Hero>

      <PlatformSection>
        <PlatformTitle>Plataforma LINKZIN</PlatformTitle>
        <PlatformSubtitle>
          Todos os produtos que você precisa para construir conexões de marca, gerenciar links e QR Codes, e se conectar com públicos em todos os lugares, em uma única plataforma unificada.
        </PlatformSubtitle>
        <PlatformButton>Começar Grátis</PlatformButton>
      </PlatformSection>

      <Features>
        <FeaturesTitle>Por que escolher o LINKZIN?</FeaturesTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureTitle>Encurtador de URL</FeatureTitle>
            <FeatureDescription>
              Uma solução completa para tornar cada ponto de conexão entre seu conteúdo e seu público mais poderoso.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureTitle>QR Codes</FeatureTitle>
            <FeatureDescription>
              Soluções de QR Code para cada experiência de cliente, negócio e marca.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureTitle>Páginas de Destino</FeatureTitle>
            <FeatureDescription>
              Crie páginas de destino envolventes e otimizadas para dispositivos móveis em minutos.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </Features>
    </AppContainer>
  );
}

export default App; 