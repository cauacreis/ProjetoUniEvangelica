# Visão Geral

Esta API fornece funcionalidades para gerenciar blocos, salas, reservas e relatórios em um sistema de agendamento de espaços acadêmicos.

## Pré-requisitos 📋

Node.js (versão 17 ou superior)\n
MongoDB\n
Postman\n

## Processo de Iniciamento

Baixe a aplicação do GITHUB.
Inicie o MongoDB Compass, crie um banco de dados denominado como "atividade" e 3 coleções chamadas: "bloco", 
"reservas", "sala". E logo após criar, conecte-se ao banco de dados.
Depois inicie o CMD e copie o endereço da pasta da aplicação baixada. Digite no CMD o seguinte comando:
cd C:\Users\PC\Desktop\XXXXXXXXXX  <-Isso com o seu endereço
Logo após instale os pacotes com npm i, apos a finalização, inicie o projeto com npm run dev
Abra o POSTMAN, aperte em "Get Started", logo após crie uma nova coleção e digite na barra o seguinte comando "http://localhost:21047/", com isso feito você poderá seguir com as utilidades da API, colocando cada comando na frente desse comando que disponibilizei agora.

## Rotas da API
Blocos
| GET /bloco - Lista todos os blocos
|
| GET /bloco/:id - Obtém um bloco específico
|
| POST /bloco - Cria um novo bloco
| * Você deve apertar em BODY e preencher as informações necessárias:
| "nome": XXXXX
| "identificacao": XXXXX
|
| PUT /bloco/:id - Atualiza um bloco
|
| DELETE /bloco/:id - Remove um bloco
## Salas
| GET /sala - Lista todas as salas
|
| GET /sala/:id - Obtém uma sala específica
|
| POST /sala - Cria uma nova sala
| "nome": "XXXXX"
| "bloco": "ID do bloco"
| "capacidade": "XXXXX"
| "recursos": "XXXXX"
|
| PUT /sala/:id - Atualiza uma sala
|
| DELETE /sala/:id - Remove uma sala
## Reservas
| POST /reserva - Cria uma nova reserva
|
|  "bloco": "ID do bloco",
|  "sala": "ID da sala",
|  "dataHoraInicio": "DD/MM/YYYY HH:mm:ss",
|  "dataHoraFinal": "DD/MM/YYYY HH:mm:ss",
|  "professor": "Nome do Professor",
|  "motivo": "Finalidade da reserva",
|  "recorrencia": "true" caso não tenha recorrência, não é necessário preencher os dados apartir de recorrencia.
|  "periodo": "diario|semanal|mensal"
|  "dataFinalPeriodo": "DD/MM/YYYY"
|
| GET /reserva - Lista todas as reservas
| 
| GET /reserva/:id - Obtém uma reserva específica
|
| POST /disponibilidade - Verifica disponibilidade de salas
|
| "dataHoraInicio": "DD/MM/YYYY HH:mm:ss",
| "dataHoraFinal": "DD/MM/YYYY HH:mm:ss"
|
| DELETE /reserva/:id - Cancela uma reserva
|
## Relatórios
POST /relatorios - Gera relatórios
|
| "periodo": "diario|semanal|mensal",
| "data": "DD/MM/YYYY"
|
# Notificações
| sistema envia notificações automaticamente às 7h de segunda a sexta-feira sobre as reservas do dia.