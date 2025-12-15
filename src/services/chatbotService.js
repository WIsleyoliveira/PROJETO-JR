import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434';
const conversationHistory = new Map();

async function checkOllamaHealth() {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 2000 });
    return response.status === 200;
  } catch (error) {
    console.log('Ollama não disponível, usando fallback local');
    return false;
  }
}

function localFallback(message) {
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes('serviço') || msgLower.includes('oferecem') || msgLower.includes('produto')) {
    return 'A JR Reboques oferece várias categorias: PADRÃO (R$ 5.990+), TRUCADAS (R$ 8.990+), GAIOLAS (R$ 10.500+), MOTOS (R$ 5.000+), PRANCHAS (R$ 5.000+), NÁUTICO (R$ 5.500+), ANIMAIS (R$ 13.900+). Também fazemos manutenção, oferecemos garantia estendida e suporte 24/7.';
  }
  
  if (msgLower.includes('moto') || msgLower.includes('asa delta')) {
    return 'Temos reboques para motos: 1 moto (R$ 5.600), 2 motos (R$ 6.200), 3 motos (R$ 6.900), 3 motos premium (R$ 9.500), Asa Delta (R$ 5.000) e Asa Delta 2 rampas (R$ 5.900). Todos emplacáveis (+R$ 1.000).';
  }
  
  if (msgLower.includes('prancha')) {
    return 'Pranchas disponíveis: Padrão 2x1,50 (R$ 5.000), Trucada 2x1,50 (R$ 8.000), Trucada 2,5x1,50 (R$ 8.500), Prancha Carro 4x1,90 (R$ 16.900), Gerador 2,5x1,20 (R$ 15.900). Ideais para som, equipamentos e veículos.';
  }
  
  if (msgLower.includes('jetski') || msgLower.includes('barco') || msgLower.includes('berço') || msgLower.includes('nautico')) {
    return 'Linha náutica: Jetski padrão (R$ 5.500), Jetski premium (R$ 10.500), Berços 5m (R$ 5.990), 6m (R$ 6.990), 7m (R$ 7.500), 9m (R$ 8.000) e 9m trucado (R$ 10.900).';
  }
  
  if (msgLower.includes('cavalo') || msgLower.includes('animal') || msgLower.includes('boiadeiro')) {
    return 'Transporte de animais: Boiadeiro 2,5x1,20 (R$ 13.900) e Cavalo 2,5x1,50 (R$ 20.900). Ambos com 2 eixos e 1500kg de capacidade.';
  }
  
  if (msgLower.includes('diferencial') || msgLower.includes('qualidade')) {
    return 'Nossos diferenciais: perfil enrijecido, cubo Fiat Strada blindado 4x100, madeira linha Ipê, pneus novos aro 13 (sem remold). Adicionais: baú frontal e suporte de lona (R$ 400 cada).';
  }
  
  if (msgLower.includes('guincho') || msgLower.includes('24h')) {
    return 'Nosso suporte técnico funciona 24 horas por dia, 7 dias por semana. Ligue (11) 99999-9999 para atendimento imediato!';
  }
  
  if (msgLower.includes('orçamento') || msgLower.includes('preço') || msgLower.includes('valor')) {
    return 'Para solicitar um orçamento detalhado, você pode: 1) Preencher o formulário na seção Contato, 2) Ligar para (11) 99999-9999, ou 3) Enviar email para contato@jrreboques.com.br. Temos 26 modelos diferentes!';
  }
  
  if (msgLower.includes('horário') || msgLower.includes('funcionamento')) {
    return 'Nosso horário de atendimento: Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h | Domingo: Fechado';
  }
  
  if (msgLower.includes('endereço') || msgLower.includes('localização') || msgLower.includes('onde')) {
    return 'Estamos localizados na Av. Industrial, 1234 - São Paulo/SP. Venha nos visitar!';
  }
  
  if (msgLower.includes('emplacamento') || msgLower.includes('emplacar')) {
    return 'Oferecemos emplacamento para todos os modelos por +R$ 1.000 (aprox). Emplacamento avulso: R$ 1.900. Entre em contato para mais detalhes!';
  }
  
  return 'Obrigado pela sua mensagem! Temos 26 modelos de reboques (padrão, trucadas, motos, pranchas, náutico, animais). Para informações específicas, entre em contato: (11) 99999-9999 ou contato@jrreboques.com.br';
}

async function sendMessageToAI(userId, userMessage) {
  try {
    const isOllamaAvailable = await checkOllamaHealth();
    
    if (!isOllamaAvailable) {
      return localFallback(userMessage);
    }

    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }
    
    const history = conversationHistory.get(userId);
    history.push({ role: 'user', content: userMessage });

    const knowledgeBase = `
Você é um assistente da JR Reboques. Informações da empresa:

PRODUTOS E CATEGORIAS:
- PADRÃO: Reboques versáteis 1 eixo (700kg) - R$ 5.990 a R$ 6.990
- TRUCADAS: Reboques reforçados 2 eixos (1500kg) - R$ 8.990 a R$ 10.500
- GAIOLAS: Com altura extra para empilhar - R$ 10.500 a R$ 11.900
- MOTOS: De 1 a 3 motos, incluindo Asa Delta - R$ 5.000 a R$ 10.500
- PRANCHAS: Sem lateral, para som/equipamentos - R$ 5.000 a R$ 17.900
- NÁUTICO: Jetski e berços para barcos 5m a 9m - R$ 5.500 a R$ 11.900
- ANIMAIS: Boiadeiro e Cavalo - R$ 13.900 a R$ 21.900
- ESPECIAIS: Prancha para gerador - R$ 15.900

DIFERENCIAIS:
- Perfil enrijecido (não usamos perfil U)
- Cubo Fiat Strada blindado 4x100
- Madeira linha Ipê de alta qualidade
- Pneus novos aro 13 (sem remold)

ADICIONAIS:
- Baú frontal: R$ 400
- Suporte de lona: R$ 400
- Emplacamento: R$ 1.900

SERVIÇOS:
- Manutenção preventiva e corretiva
- Garantia estendida
- Suporte técnico 24/7

CONTATO:
- Telefone: (11) 99999-9999
- Email: contato@jrreboques.com.br
- Endereço: Av. Industrial, 1234 - São Paulo/SP

HORÁRIO:
- Segunda a Sexta: 8h às 18h
- Sábado: 8h às 12h
- Domingo: Fechado

Responda de forma breve, amigável e objetiva. Se perguntarem sobre produtos específicos, mencione as categorias disponíveis.
`;

    const prompt = `${knowledgeBase}\n\nPergunta do cliente: ${userMessage}\n\nResposta:`;

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: 'llama3.2:3b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 150
        }
      },
      { timeout: 15000 }
    );

    const aiResponse = response.data.response || 'Desculpe, não consegui processar sua pergunta.';
    history.push({ role: 'assistant', content: aiResponse });

    if (history.length > 10) {
      history.splice(0, 2);
    }

    return aiResponse;

  } catch (error) {
    console.error('Erro ao comunicar com Ollama:', error.message);
    return localFallback(userMessage);
  }
}

function clearConversation(userId) {
  conversationHistory.delete(userId);
}

const chatbotService = {
  sendMessageToAI,
  clearConversation,
  checkOllamaHealth
};

export default chatbotService;
