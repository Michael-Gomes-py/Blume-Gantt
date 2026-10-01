# Blume Gantt

![Blume Gantt](screenshots/blume-desktop.png)

Aplicação web de gerenciamento de projetos com cronograma Gantt, desenvolvida como projeto de portfólio usando HTML, CSS e JavaScript.

O Blume foi criado para permitir que você organize tarefas, responsáveis, prazos e status em uma interface visual. A aplicação roda no navegador e não exige backend para funcionar.

## Preview

### Desktop

![Blume Gantt Desktop](screenshots/blume-desktop.png)

### Mobile

![Blume Gantt Mobile](screenshots/blume-mobile.png)

## Funcionalidades

- Cronograma Gantt visual e responsivo.
- Criação, edição e exclusão de tarefas.
- Data de início com calendário nativo do navegador.
- Duração em dias e cálculo automático da data de término.
- Responsáveis por tarefa.
- Status de tarefa: não iniciada, em andamento, concluída e cancelada.
- Identificação de tarefas atrasadas.
- Filtro por responsável.
- Filtro por status.
- Colunas principais fixas durante a rolagem horizontal.
- Zoom e ajuste do Gantt ao espaço disponível.
- Gerenciamento de projetos.
- Perfis locais para separar projetos e tarefas no mesmo navegador.
- Salvamento manual e automático no navegador.
- Backup do perfil em JSON.
- Restauração de backup JSON.
- Exportação do Gantt para Excel.
- Exportação do Gantt como imagem.

## Tecnologias

### Front-end

- HTML5
- CSS3
- JavaScript puro, sem framework
- CSS Grid, Flexbox e posicionamento sticky
- HTML `<input type="date">` para seleção de datas

### Armazenamento

- `localStorage` para dados locais de perfis, projetos e tarefas.
- JSON para exportação e restauração de backups.

### Bibliotecas externas

- [xlsx-js-style](https://github.com/gitbrent/xlsx-js-style) para geração de arquivos `.xlsx` com estilos.
- [html2canvas](https://html2canvas.hertzen.com/) para exportação da interface como imagem.
- As bibliotecas externas são carregadas pelo jsDelivr no `index.html`.

### Publicação

- GitHub Pages para hospedagem estática.

## Estrutura do projeto

```text
Blume-Gantt/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── screenshots/
│   ├── blume-desktop.png
│   └── blume-mobile.png
└── README.md
```

## Como executar localmente

O projeto não precisa de instalação de dependências ou processo de build.

1. Baixe ou clone o repositório.
2. Extraia os arquivos mantendo a estrutura de pastas.
3. Abra o arquivo `index.html` no navegador.
4. Use o Blume normalmente.

A estrutura precisa permanecer assim:

```text
index.html
css/style.css
js/app.js
```

Se você mover o `index.html`, o CSS ou o JavaScript sem ajustar os caminhos, a interface poderá aparecer sem estilo ou sem funcionamento.

## Como publicar no GitHub Pages

O Blume é uma aplicação estática. O GitHub Pages consegue publicar o projeto diretamente a partir de um branch do repositório. O GitHub permite configurar o branch e a pasta raiz como fonte de publicação. Consulte a documentação oficial: [Configurar uma fonte de publicação para o GitHub Pages](https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

### Passo a passo

1. Crie um repositório no GitHub.
2. Envie `index.html`, a pasta `css`, a pasta `js` e a pasta `screenshots` para a raiz do repositório.
3. Abra `Settings` no repositório.
4. Entre em `Pages`.
5. Em `Build and deployment`, selecione `Deploy from a branch`.
6. Selecione o branch `main`.
7. Selecione a pasta `/ (root)`.
8. Clique em `Save`.
9. Aguarde a publicação do site.

O GitHub informa que a publicação pode levar alguns minutos depois do envio das alterações. A configuração por branch é documentada pelo próprio GitHub. Consulte também o [guia rápido do GitHub Pages](https://docs.github.com/pt/pages/quickstart).

## Como usar os perfis

O Blume permite criar perfis locais para separar os dados dentro do mesmo navegador.

Exemplo:

```text
Perfil: João
├── Projeto TCC
└── Projeto Redes

Perfil: Maria
├── Projeto Faculdade
└── Projeto Trabalho
```

Os perfis são armazenados no navegador usando `localStorage`. Eles não são contas online e não existe sincronização entre computadores.

Para levar um perfil para outro computador:

1. Abra o perfil desejado.
2. Clique em `Backup do perfil`.
3. Guarde o arquivo `.json`.
4. No outro computador, abra o Blume.
5. Clique em `Restaurar perfil`.
6. Selecione o arquivo de backup.

## Modelo de armazenamento

O Blume foi projetado para funcionar sem servidor ou banco de dados.

```text
Navegador
   ↓
localStorage
   ↓
Perfil
   ↓
Projetos
   ↓
Tarefas
```

Essa abordagem mantém o projeto simples e gratuito para uso pessoal e para demonstração em portfólio.

## Limitações atuais

- Os dados não são sincronizados automaticamente entre computadores.
- Os perfis são locais ao navegador e ao dispositivo.
- O backup depende do usuário guardar o arquivo JSON.
- O projeto não possui autenticação ou banco de dados remoto.
- As bibliotecas de Excel e imagem são carregadas da internet. Sem acesso a elas, essas exportações específicas deixam de funcionar.

## Roadmap

Algumas evoluções possíveis para as próximas versões:

- Separar completamente componentes e módulos JavaScript.
- Criar uma tela inicial para seleção de perfil e projeto.
- Adicionar marcos e dependências entre tarefas.
- Adicionar barra de progresso por tarefa.
- Adicionar histórico de alterações.
- Transformar o projeto em PWA.
- Adicionar autenticação e sincronização em nuvem com backend.
- Criar testes automatizados para as regras de datas e armazenamento.

## Objetivo do projeto

O Blume foi desenvolvido como projeto de portfólio para praticar desenvolvimento web, organização de código, manipulação do DOM, persistência local, exportação de dados, responsividade e publicação de aplicações estáticas.

## Licença

Este repositório ainda não define uma licença de código aberto. Escolha uma licença antes de declarar o projeto como open source.
