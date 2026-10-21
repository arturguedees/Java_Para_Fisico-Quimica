# Guia Completo: Arquitetura, Internacionalização (EN/PT), Segurança e Deploy Agnóstico de Nuvem

**Projeto:** LabQuântico — Plataforma Web de Simulação Numérica e Gamificação em Físico-Química  
**Stack:** Java 21 + Spring Boot 3.3.4 (Backend REST API) | React 18 + TypeScript + Vite + TailwindCSS + Chart.js (Frontend SPA)

---

## 1. Resumo das Evoluções Arquiteturais e de Segurança

### 1.1. Internacionalização Completa (Inglês como Padrão + Português com Bandeiras SVG)
- **Idioma Padrão (`en`):** Toda a plataforma inicia em **Inglês (`en`)** por padrão para alcance internacional, permitindo alternar em 1 clique para **Português (`pt`)** (com persistência automática no `localStorage` em `quantum_lab_lang`).
- **Seletor com Bandeiras Oficiais (`FlagUS` e `FlagBR`):** Na `Navbar` (e nas telas de `Login` e `Cadastro`), o componente `LanguageSelector` ([`frontend/src/i18n/i18n.tsx`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/frontend/src/i18n/i18n.tsx)) exibe as bandeiras vetoriais (SVG) dos **Estados Unidos** e do **Brasil** ao lado de cada opção.
- **Catálogo Científico Bilíngue (Frontend + Backend):**
  - Todos os 5 blocos de fórmulas (`/formulas`), controles de simulação, eixos de gráficos, cenários do artigo da *ACS (J. Chem. Educ.)*, loja de insígnias, ranking e perfil traduzem-se instantaneamente.
  - O `QuizController.java` e o fallback `api.ts` servem o banco de 10 questões, dicas de fórmulas e resoluções passo a passo tanto em Inglês (`?lang=en`) quanto em Português (`?lang=pt`).

### 1.2. Blindagem de Segurança e Bloqueio de Inspeção (`Inspect` / DevTools)
- **Bloqueio de "Inspecionar" e Atalhos DevTools ([`ProtecaoInspecao.tsx`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/frontend/src/components/ProtecaoInspecao.tsx)):**
  - Intercepta e bloqueia o menu de contexto do botão direito (`contextmenu`), impedindo o acesso rápido à opção *"Inspect / Inspecionar"*.
  - Bloqueia atalhos de teclado de inspeção e código-fonte no Windows/Linux e macOS: `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+Shift+K`, `Ctrl+U`, `Cmd+Option+I`, `Cmd+Option+J`, `Cmd+Option+C`, `Cmd+Option+K` e `Cmd+Option+U`.
  - Monitora variações bruscas entre `window.outerWidth/innerWidth` e `window.outerHeight/innerHeight` para limpar o console caso o painel lateral seja aberto.
- **Proteção contra Vazamento de Senhas (`WRITE_ONLY` + Sanitização Local):**
  - Na entidade [`Usuario.java`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/src/main/java/com/unit/modelo/entidade/Usuario.java), o campo `senha` recebeu `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)`. O Spring/Jackson aceita a senha no JSON de entrada (`/login` e `/cadastro`), mas **jamais** a inclui nos JSONs de saída.
  - No frontend ([`api.ts`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/frontend/src/services/api.ts)), a função `sanitizarUsuarioSemSenha()` remove qualquer propriedade `senha` antes de salvar o objeto `usuario` no `localStorage`.
- **Hashing Criptográfico SHA-256 + Salt:**
  - Tanto [`UsuarioController.java`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/src/main/java/com/unit/controller/UsuarioController.java) quanto o modo offline em `api.ts` aplicam hash `SHA-256` com *salt* dedicado (`sha256:...`), mantendo compatibilidade transparente com contas legadas.
- **Console H2 Fechado por Padrão e Headers HTTP:**
  - Em [`application-h2.properties`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/src/main/resources/application-h2.properties), o console H2 fica desabilitado em produção (`spring.h2.console.enabled=${H2_CONSOLE_ENABLED:false}`).
  - Em [`netlify.toml`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/netlify.toml), foram adicionados cabeçalhos de segurança (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`).

### 1.3. Remoção do `render.yaml` para Escalabilidade Multi-Cloud
- O arquivo proprietário `render.yaml` foi removido para desacoplar o repositório de um único fornecedor.
- A imagem é construída de forma padronizada pelo [`Dockerfile`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/Dockerfile) multi-estágio (Maven + Eclipse Temurin Java 21 JRE Alpine), podendo rodar em **Render, Railway, Fly.io, Google Cloud Run, AWS App Runner, DigitalOcean App Platform ou Kubernetes** sem alterar uma única linha de código.

---

## 2. Explicação Simples: Arquivos de Ambiente, Redirecionamento SPA e Segredos

### 2.1. Para que servem `.env`, `.env.local` e `.env.example`?
- **`.env` e `.env.local` (Desenvolvimento Local):** Servem para que, quando você baixar o projeto no seu computador e rodar `npm run dev` ou `./mvnw spring-boot:run`, tudo já funcione de primeira sem precisar configurar nada manualmente. Eles ficam listados no `.gitignore` para nunca subirem senhas ou configurações pessoais para o GitHub.
- **`.env.example` (Modelo Público no Git):** É uma cópia de referência (sem segredos reais) que sobe para o GitHub para documentar quais variáveis existem no projeto.
- **Em Produção (Netlify / Render / Railway):** Os servidores na nuvem baixam o código do GitHub (onde o `.env` não está). Por isso, na nuvem nós cadastramos variáveis como `VITE_API_URL` ou `SPRING_PROFILES_ACTIVE=h2` diretamente no painel web (**Environment Variables**) do serviço de hospedagem.

### 2.2. Por que NÃO marcar *"Contains secret values"* no `VITE_API_URL` da Netlify?
- Qualquer variável começando com `VITE_` é substituída pelo Vite diretamente dentro do código JavaScript público do navegador durante o `npm run build` (afinal, o navegador do aluno precisa saber para qual endereço da API enviar as requisições).
- Se você marcar a caixinha **"Contains secret values"** na Netlify, o detector de segredos da Netlify verá a URL dentro do pacote final `dist/` e **bloqueará o deploy** achando que uma senha vazou. Portanto, deixe **"Contains secret values" desmarcado** para `VITE_API_URL`.

### 2.3. Como `netlify.toml` e `_redirects` evitam o Erro 404 ao apertar `F5`?
- O frontend em React é uma *Single Page Application (SPA)*: só existe um arquivo `index.html` físico, e quem troca as telas (`/formulas`, `/exercicios`, `/loja`, `/ranking`) é o JavaScript (`react-router-dom`).
- Sem a regra `/* /index.html 200` no `netlify.toml` e no `frontend/public/_redirects`, quando o usuário está em `https://seu-site.netlify.app/formulas` e aperta `F5`, o servidor procura uma pasta `/formulas` física no disco, não encontra e devolve **404 Not Found**. Com a regra `status = 200`, o servidor entrega o `index.html` e o React abre a página certa.

---

## 3. Passo a Passo para Deploy em Qualquer Nuvem (Render, Railway, Fly.io + Netlify)

### Passo 1:Hospedar o Backend Java via Docker (Exemplo no Render ou Railway)
1. Conecte seu repositório GitHub ao provedor escolhido (Render Web Service, Railway, Fly.io, etc.).
2. O provedor detectará automaticamente o [`Dockerfile`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/Dockerfile) na raiz do projeto.
3. No painel de **Environment Variables** do serviço de backend, adicione:
   - `SPRING_PROFILES_ACTIVE` = `h2`
   - `PORT` = `8080`
   - `H2_CONSOLE_ENABLED` = `false`
4. Após o deploy ficar online, teste o endpoint de saúde:  
   `https://<sua-api-backend>/api/health`

### Passo 2: Hospedar o Frontend React na Netlify
1. No painel da [Netlify](https://app.netlify.com), importe o repositório do GitHub.
2. O arquivo [`netlify.toml`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/netlify.toml) configurará automaticamente:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
3. Em **Site configuration -> Environment variables**, adicione:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://java-para-fisico-quimica.onrender.com` *(ou a URL do seu backend em qualquer outro provedor; não marque "Contains secret values")*
4. Clique em **Deploy site**. Mesmo se você não configurar `VITE_API_URL`, o método `resolverUrlBaseApi()` em [`api.ts`](file:///Users/artur/Documents/Projeto%20de%20Programa%C3%A7%C3%A3o/Java_Para_Fisico-Quimica/frontend/src/services/api.ts) já usa o endereço de produção como fallback automático e aciona o motor local caso o container esteja hibernando!
