<div align="center">

# ⚛️ LabQuântico

### Plataforma Computacional Avançada de Físico-Química e Simulações Interativas
**Interactive Computational Platform for Physical Chemistry Education & Numerical Modeling**

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[🌐 Live Production Demo](https://labquantico.netlify.app) • [📖 Architecture & Modules](#-software-architecture) • [🚀 Quick Start Guide](#-quick-start--local-development)

</div>

---

## 🌟 Executive Summary / Visão Geral

**LabQuântico** é uma plataforma computacional moderna, resiliente e bilíngue (**Inglês padrão** 🇺🇸 / **Português** 🇧🇷), desenvolvida para capacitar estudantes e pesquisadores de Físico-Química através de simulações numéricas de alta fidelidade, visualizações gráficas interativas e metodologias ativas de aprendizado.

Baseada nos fundamentos teóricos e computacionais estabelecidos por **Ardith D. Bravenec & Karen D. Ward** (*Journal of Chemical Education*, 2023), a plataforma unifica os modelos matemáticos de:
- **Cinética Química Homogênea** (Reações de Ordem Zero e Primeira Ordem com decaimento exponencial e tempos de meia-vida analíticos);
- **Teoria Cinética dos Gases e Distribuição de Maxwell-Boltzmann** (Distribuição de velocidades moleculares $f(v)$ e densidade de energia cinética $f(E)$ com fração reativa acima da energia de ativação $E_a$);
- **Calorimetria Exploratória Diferencial (DSC)** (Termodesnaturação de proteínas com interpolação por Splines Cúbicos Naturais e integração numérica de entalpia $\Delta H$ por Simpson 1/3 e Regra Trapezoidal Composta).

A solução adota uma **Arquitetura Científica Híbrida Isomórfica**: as simulações podem ser computadas tanto no ecossistema de alta performance em **Java 21 / Spring Boot 3** quanto em um **motor matemático local em TypeScript** no navegador, garantindo operação ininterrupta mesmo sob contingência ou ausência temporária de conexão com a API.

---

## 🔬 Core Capabilities / Funcionalidades Científicas

### 1. 🧮 Unified Formulas & Interactive Calculators Hub (`/formulas`)
Todos os modelos computacionais estão centralizados em 5 blocos dinâmicos com gráficos interativos em tempo real e exportação de dados:
* **Bloco 01 — Cinética de Ordem Zero ($A \rightarrow B$):** Concentração residual $[A](t) = \max(0, [A]_0 - kt)$, tempos analíticos de $1ª, 2ª \text{ e } 3ª$ meia-vida ($t_{1/2}^{(n)} = \frac{[A]_0}{2^n k}$) e tempo de depleção completa ($t_{\text{final}} = [A]_0 / k$).
* **Bloco 02 — Cinética de Primeira Ordem ($A \rightarrow B$):** Decaimento exponencial $[A](t) = [A]_0 e^{-kt}$, tempo de meia-vida invariante ($t_{1/2} = \ln(2)/k$) e tempo de vida característico ($\tau = 1/k$).
* **Bloco 03 — Distribuição de Velocidades de Maxwell-Boltzmann $f(v)$:** Densidade de probabilidade normalizada em escala logarítmica com suporte a gases nobres e diatômicos ($\text{He}, \text{H}_2, \text{N}_2, \text{O}_2, \text{Ar}$ e gases customizados) e velocidades características ($v_{mp}, v_{avg}, v_{rms}$ e velocidade do som $c = \sqrt{\gamma R T / M}$).
* **Bloco 04 — Distribuição de Energia Cinética $f(E)$ e Fração Reativa ($E \ge E_a$):** Distribuição contínua de energia molecular ($\text{kJ/mol}$) e integração numérica da fração de moléculas energeticamente aptas a reagir.
* **Bloco 05 — Calorimetria DSC e Integração Entálpica ($\Delta H$):** Dataset experimental de termodesnaturação da lisozima (23 pontos de $C_p$), interpolação contínua por Splines Cúbicos Naturais, correção de linha de base e integração de entalpia por **Simpson 1/3 Composto** e **Regra Trapezoidal Composta**.

### 2. 🌐 Native Bilingual Internationalization (🇺🇸 EN / 🇧🇷 PT)
* Idioma padrão em **Inglês (`en`)** com chaveamento instantâneo em 1 clique para **Português (`pt`)** na Navbar e telas de acesso.
* Persistência de preferência de idioma e renderização vetorial de bandeiras oficiais (`FlagUS` e `FlagBR`).
* Tradução completa de 100% da interface, nomenclaturas termodinâmicas, eixos cartesianos, presets experimentais e do banco científico de exercícios.

### 3. 🎯 Gamified Active Learning & Class Squads
* **Módulos Científicos Especializados (`/exercicios`):** Desafios contextualizados cobrindo Cinética, Teoria Cinética, Calorimetria e Métodos Numéricos com navegação ergonômica, enunciados expansíveis e economia de pontuação progressiva com dicas teóricas.
* **Turmas e Squads de Classe (`/ranking`):** Formação de turmas colaborativas através de códigos de convite, acompanhamento de sequência diária (*streaks* 🔥), pódios de turma e ranking global integrado.
* **Painel do Usuário (`/perfil`):** Gerenciamento de credenciais, biografia, títulos científicos desbloqueáveis e insígnias temáticas.
* **Modern Feedback & Toast System:** Notificações flutuantes customizadas de alta responsividade para interações, recompensas e validações do sistema.
* **Exportação Universal de Dados:** Geração instantânea de relatórios em `.csv` para análise em softwares externos (Origin, MATLAB, Python/Pandas).

---

## 🏛️ Software Architecture / Arquitetura do Sistema

O projeto segue os princípios de **Clean Architecture** e **Separation of Concerns (SoC)**, dividindo o ecossistema em serviços desacoplados e conteinerizados:

```text
LabQuântico/
├── src/main/java/com/unit/                 # BACKEND CORE (Java 21 + Spring Boot 3)
│   ├── AplicacaoWeb.java                   # Inicializador da API REST Web
│   ├── Main.java                           # Ponto de entrada CLI interativo
│   ├── config/                             # Políticas de CORS, segurança e serialização
│   ├── controller/                         # Endpoints REST (Cinetica, Maxwell, Dsc, Quiz, Usuario, Health)
│   ├── modelo/                             # Entidades de Domínio e Modelos Científicos Polimórficos
│   ├── numerico/                           # Algoritmos Numéricos (Simpson 1/3, Trapezoidal, Spline Cúbico)
│   ├── repositorio/                        # Camada de Persistência (Spring Data JPA)
│   ├── ui/                                 # Interface Gráfica Desktop (JavaFX + XChart)
│   └── util/                               # Constantes Físico-Químicas, Validadores e Exportadores CSV
│
├── frontend/                               # FRONTEND SPA (React 18 + TypeScript + Vite)
│   ├── src/
│   │   ├── components/                     # Componentes reutilizáveis, modais e defesas de integridade UI
│   │   ├── i18n/                           # Dicionários de tradução (EN/PT) e componentes de internacionalização
│   │   ├── pages/                          # Telas da aplicação (Formulas, Exercicios, Ranking, Perfil, Auth)
│   │   └── services/                       # Cliente HTTP Resiliente (api.ts) e Motor Científico Isomórfico
│   ├── .env.example                        # Modelo público de variáveis do frontend
│   └── package.json                        # Dependências e scripts de automação
│
├── Dockerfile                              # Imagem Docker multi-stage cloud-agnostic (Java 21 Alpine)
├── docker-compose.yml                      # Orquestração local conteinerizada (PostgreSQL + PgAdmin)
├── netlify.toml                            # Regras de build de produção, SPA rewrites e HTTP Security Headers
└── .env.example                            # Modelo público de variáveis do backend
```

---

## 🛡️ Enterprise Security & Robustness / Segurança e Conformidade

O LabQuântico foi construído em conformidade com as diretrizes e recomendações da **OWASP Top 10**:

- **Prevenção de Exposição de Credenciais (`WRITE_ONLY`):** Campos sensíveis na camada de dados utilizam a anotação `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` do Jackson, garantindo que credenciais e dados de autenticação sejam aceitos exclusivamente em requisições de entrada, sendo sistematicamente omitidos de qualquer resposta serializada da API.
- **Gerenciamento de Sessão Sanitizado:** A persistência local em cliente armazena perfis estritamente higienizados, expurgando automaticamente qualquer resquício de credenciais antes do salvamento em armazenamento local.
- **Defesas Ativas de Integridade de UI:** Proteções de interface integradas para mitigar inspeções casuais de código, interceptação de ações não autorizadas e salvaguarda do fluxo de avaliação de exercícios.
- **Cabeçalhos HTTP Hardened:** Em produção, a camada de borda aplica cabeçalhos de segurança estritos:
  - `X-Frame-Options: DENY` (Mitigação contra ataques de Clickjacking);
  - `X-Content-Type-Options: nosniff` (Prevenção contra MIME-type sniffing);
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()`.
- **Isolamento de Segredos e Parâmetros:** Nenhuma chave, credencial ou segredo de infraestrutura é versionado no código-fonte. Todos os parâmetros são injetados via variáveis de ambiente orquestradas em tempo de execução, documentados exclusivamente por arquivos modelo `.env.example`.
- **Banco de Dados Seguro:** Em ambientes de produção, os consoles visuais administrativos de bancos em memória permanecem permanentemente inativos (`H2_CONSOLE_ENABLED=false`).

---

## ⚙️ Environment Configuration / Configuração de Ambiente

Para manter a segurança e a integridade do repositório, todos os dados sensíveis ficam estritamente isolados em arquivos de configuração locais (ignorados pelo Git) ou gerenciados diretamente pelo painel do seu provedor de nuvem.

### Modelo Backend (`.env.example` na raiz)
```env
# Porta do servidor HTTP
PORT=8080

# Perfil ativo do Spring Boot (ex: 'h2' para banco em memoria, ou 'default' para PostgreSQL)
SPRING_PROFILES_ACTIVE=h2

# Flag de ativacao do console visual H2 (manter sempre 'false' em producao)
H2_CONSOLE_ENABLED=false

# Parametros de conexao de banco relacional (quando utilizado com PostgreSQL/Docker)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/fisico_quimica
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_secure_password_here
SPRING_JPA_SHOW_SQL=false
```

### Modelo Frontend (`frontend/.env.example`)
```env
# URL de comunicacao com a API REST
# Deixar em branco para deteccao automatica inteligente de ambiente
VITE_API_URL=https://java-para-fisico-quimica.onrender.com
```

---

## 🚀 Quick Start / Como Executar Localmente

### Pré-requisitos
* **Java 21 (JDK 21)** instalado e configurado no `PATH`
* **Node.js 18+** e gerenciador de pacotes **npm**
* **Docker & Docker Compose** *(opcional, para ambiente PostgreSQL)*

### 1. Inicializando o Backend (Spring Boot 3)

```bash
# Opção A: Executar com banco de dados em memória H2 (zero dependências externas):
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2

# Opção B: Executar com PostgreSQL conteinerizado via Docker:
docker compose up -d
./mvnw spring-boot:run
```
O servidor estará disponível e respondendo em `http://localhost:8080`.

### 2. Inicializando o Frontend (React + Vite)

Em um terminal separado:
```bash
cd frontend
npm install
npm run dev
```
Acesse a aplicação no seu navegador em: `http://localhost:5173`.

> **💡 Operação Resiliente Híbrida:** Graças ao motor matemático isomórfico implementado no frontend (`motorCientifico.ts`), todas as simulações, gráficos e cálculos funcionam perfeitamente mesmo antes de inicializar o backend Java!

---

## 🧪 Automated Testing & Quality / Testes Automatizados

O repositório inclui suítes completas de testes unitários e de integração para validar a precisão dos cálculos físicos e a estabilidade da aplicação:

```bash
# Executar testes unitários do Backend (JUnit 5 + MockMvc):
./mvnw test

# Validar tipagem TypeScript e build de produção do Frontend:
cd frontend && npm run build
```

---

## ☁️ Cloud Deployment / Implantação em Produção

A arquitetura foi projetada para ser **100% Cloud-Agnostic**, permitindo implantações fluidas sem dependência de plataformas proprietárias:

1. **Backend (Render, Railway, Fly.io, Cloud Run):**
   - Implantação conteinerizada automática a partir do `Dockerfile` multi-stage padronizado (baseado em `eclipse-temurin:21-jre-alpine`).
   - Variáveis recomendadas em produção: `SPRING_PROFILES_ACTIVE=h2`, `PORT=8080`, `H2_CONSOLE_ENABLED=false`.

2. **Frontend (Netlify, Vercel, Cloudflare Pages):**
   - Configurado de fábrica através do `netlify.toml`, executando `npm run build` na pasta `frontend` e publicando o diretório `frontend/dist`.
   - Inclui regras universais de reescrita SPA (`/* -> /index.html 200`) e injeção automática de cabeçalhos de segurança HTTP.

Consulte o guia complementar [`GUIA_DEPLOY_E_ARQUITETURA.md`](GUIA_DEPLOY_E_ARQUITETURA.md) para detalhes adicionais de infraestrutura.

---

## 📚 References & Scientific Basis / Referências Científicas

* **Bravenec, A. D., & Ward, K. D. (2023).** *Integrating Numerical Methods into the Physical Chemistry Curriculum: Applications in Kinetics and Thermodynamics*. Journal of Chemical Education.
* **Atkins, P., & de Paula, J.** *Physical Chemistry*. Oxford University Press.
* **Burden, R. L., & Faires, J. D.** *Numerical Analysis*. Cengage Learning (Cubic Splines & Numerical Quadrature).

---

<div align="center">
Desenvolvido com excelência técnica para o avanço do ensino e pesquisa em Físico-Química.
</div>
