# Parceiro - Aplicativo do Motorista 🚚💨

Aplicativo web clone de alta fidelidade do aplicativo do motorista parceiro (estilo Lalamove), responsivo para **Desktop** e **Dispositivos Móveis (Celular)**.

## 🚀 Funcionalidades

- **Controle de Status Online / Offline**: Radar de corridas com alerta sonoro e busca de chamados na região.
- **Alertas de Corridas em Tempo Real**: Alerta sonoro característico, pop-up com contagem regressiva (25s) e dados de ganhos, trajeto (Ponto A -> Ponto B), carga e instruções.
- **Fluxo Completo de Corrida (4 Etapas)**:
  1. A caminho da coleta (Ponto A) com mapa GPS e rotas.
  2. Chegada no local e conferência da carga.
  3. Em trânsito para a entrega com ferramentas de contato (ligação mascarada e chat com cliente).
  4. Conclusão da entrega com comprovante/foto e crédito imediato do saldo com som de dinheiro.
- **Carteira & Saque PIX**: Saldo em tempo real, extrato das corridas realizadas e solicitação de transferência Pix imediata.
- **Zonas de Alta Demanda (Tarifa Dinâmica)**: Mapa com indicação de regiões com bônus de até +25%.
- **Simulador Integrado**: Painel de testes flutuante para disparar chamados de Moto, Fiorino ou Carga, ativar chamados automáticos e alternar entre tela cheia ou moldura de smartphone.

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite** (configurado com host `0.0.0.0` para teste em rede Wi-Fi)
- **Tailwind CSS**
- **Leaflet & OpenStreetMap** (rotas e geolocalização)
- **Web Audio API** (alertas sonoros sem dependência de arquivos externos)
- **Lucide Icons**

## 💻 Como Rodar Localmente

### 1. Instalar dependências
```bash
pnpm install
# ou
npm install
```

### 2. Iniciar o servidor
```bash
pnpm run dev
# ou
npm run dev
```

- **No Computador**: acesse `http://localhost:5173`
- **No Celular**: acesse `http://SEU_IP_LOCAL:5173` conectado na mesma rede Wi-Fi
