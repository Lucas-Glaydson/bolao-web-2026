# Prompt de Migração - Backend NestJS
## Sistema: Bet Glaydson - Copa do Mundo 2026 (Grupos + Mata-mata)

## 📋 Contexto

Você está migrando um sistema de bolão que atualmente suporta apenas **fase de grupos** para um sistema completo que inclui **fase de grupos + mata-mata**. O novo backend já existe (NestJS + MongoDB) e suporta mata-mata, mas precisa ser adaptado para também gerenciar a fase de grupos.

## 🎯 Objetivo

Adaptar o backend NestJS existente para:
1. Suportar fase de grupos (12 grupos de 4 times, 3 rodadas)
2. Manter o suporte ao mata-mata já existente
3. Migrar dados históricos do sistema antigo
4. Unificar ranking e estatísticas (grupos + mata-mata)

## 📊 Dados do Sistema Antigo

### Estrutura Completa do JSON

O arquivo `palpites_bolao.json` possui a seguinte estrutura:

```json
{
  "versao": 1,
  "palpites": {
    "1": {
      "Felipe": "2 x 0",
      "Ingrid": "1 x 2",
      "Mauro": "3 x 1",
      "Caetano": "2 x 0",
      "Emmanuel": "3 x 1",
      "Rafael": "2 x 1",
      "Evelin": "2 x 2",
      "Alefe": "2 x 1",
      "Bruno": "1 x 0",
      "AdilsonJR": "2 x 0",
      "Miguel": "1 x 2",
      "Anderson": "3 x 2",
      "Lucas": "0 x 1",
      "Zaine": "3 x 1",
      "Valdemir": "1 x 1"
    },
    "2": { ... },
    ...
    "87": { ... }
  },
  "atualizadoEm": "2026-06-17T16:44:12.369Z"
}
```

### Campos do Arquivo

#### `versao` (number)
- Versão do formato do arquivo
- Valor atual: `1`
- Usado para controlar compatibilidade entre versões

#### `atualizadoEm` (string ISO 8601)
- Timestamp da última atualização
- Formato: ISO 8601 (ex: "2026-06-17T16:44:12.369Z")

#### `palpites` (object)
- **Chave**: ID do jogo como string ("1" a "87")
- **Valor**: Objeto com palpites dos participantes

### Estrutura dos Palpites

Cada jogo contém um objeto onde:
- **Chave**: Nome do participante (string)
- **Valor**: Placar palpitado no formato "X x Y"

**Formato do Placar:**
- Padrão: `"[gols_time_1] x [gols_time_2]"`
- Sempre com espaços: " x " (não "x" ou " X ")
- Números inteiros não negativos
- Exemplo: "2 x 0", "1 x 2", "3 x 1"

### Características

- **Total de jogos**: 87 (IDs de "1" a "87")
  - Fase de grupos: 48 jogos (12 grupos × 4 jogos cada)
  - Oitavas de final: 8 jogos
  - Quartas de final: 4 jogos
  - Semifinais: 2 jogos
  - Disputa de 3º lugar: 1 jogo
  - Final: 1 jogo

- **16 participantes**:
  1. Felipe
  2. Ingrid
  3. Mauro
  4. Caetano
  5. Emmanuel
  6. Rafael
  7. Evelin
  8. Alefe
  9. Bruno
  10. AdilsonJR
  11. Miguel
  12. Anderson
  13. Lucas
  14. Zaine
  15. Valdemir
  16. Paulo

- **Observações importantes**:
  - Nem todos os participantes têm palpites em todos os jogos
  - Alguns jogos podem ter menos de 16 palpites
  - Não há dados sobre qual time é qual no palpite (precisa correlacionar com tabela de jogos)
  - Sistema original tinha placares manuais e automáticos (API externa)

## 🏗️ Arquitetura Alvo (Backend NestJS)

### Stack Atual
- NestJS + MongoDB + Mongoose
- JWT para autenticação
- Arquitetura limpa (domain, application, infrastructure, presentation)
- API externa para placares (football-data.org)

### Schemas Existentes

```typescript
// Match Schema (Precisa adaptação)
{
  externalId: string
  competition: string
  stage: 'GROUP_STAGE' | 'ROUND_OF_16' | 'ROUND_OF_8' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'FINAL'
  group?: string  // ADICIONAR ESTE CAMPO
  round?: number  // ADICIONAR ESTE CAMPO
  roundLabel: string
  homeTeam: string
  awayTeam: string
  kickoffAt: Date
  status: 'SCHEDULED' | 'TIMED' | 'LIVE' | 'FINISHED'
  officialHomeScore?: number
  officialAwayScore?: number
  manualHomeScore?: number  // ADICIONAR para placares manuais
  manualAwayScore?: number  // ADICIONAR para placares manuais
  useManualScore?: boolean  // ADICIONAR flag
  winner?: 'HOME' | 'AWAY' | 'DRAW'
}

// Prediction Schema (OK, não precisa mudanças)
{
  userId: ObjectId
  matchId: ObjectId
  predictedHomeScore: number
  predictedAwayScore: number
  lockedAt?: Date
  pointsAwarded?: number
  exactScoreHit: boolean
  outcomeHit: boolean
}

// User Schema (OK)
{
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  isActive: boolean
}
```

## 📝 Tarefas de Implementação

### 1. Adaptar o Match Schema

**Arquivo**: `src/infrastructure/database/schemas/match.schema.ts`

Adicionar campos para fase de grupos:
```typescript
@Prop({ required: false, type: String, enum: ['A','B','C','D','E','F','G','H','I','J','K','L'] })
group?: string;

@Prop({ required: false, type: Number, min: 1, max: 3 })
round?: number;

@Prop({ required: false, type: Number })
manualHomeScore?: number;

@Prop({ required: false, type: Number })
manualAwayScore?: number;

@Prop({ default: false })
useManualScore: boolean;
```

### 2. Atualizar Tipos TypeScript

**Arquivo**: `src/domain/entities/match.entity.ts`

```typescript
export type MatchStage = 
  | 'GROUP_STAGE' 
  | 'ROUND_OF_16' 
  | 'ROUND_OF_8' 
  | 'QUARTER_FINALS' 
  | 'SEMI_FINALS' 
  | 'FINAL';

export type GroupLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Match {
  id: string;
  externalId?: string;
  competition: string;
  stage: MatchStage;
  group?: GroupLabel;  // Novo
  round?: number;      // Novo
  roundLabel: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  status: MatchStatus;
  officialHomeScore?: number;
  officialAwayScore?: number;
  manualHomeScore?: number;    // Novo
  manualAwayScore?: number;    // Novo
  useManualScore?: boolean;    // Novo
  winner?: MatchWinner;
  // Computed
  finalHomeScore?: number;     // Retorna manual ou official
  finalAwayScore?: number;     // Retorna manual ou official
}
```

### 3. Criar Script de Migração

**Arquivo**: `src/scripts/migrate-old-system.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

interface OldDataFormat {
  versao: number;
  palpites: {
    [matchId: string]: {
      [userName: string]: string; // "X x Y"
    };
  };
  atualizadoEm: string;
}

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectModel('Match') private matchModel: Model<any>,
    @InjectModel('Prediction') private predictionModel: Model<any>,
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  async migrateOldData(filePath = 'old-data.json') {
    this.logger.log('Iniciando migração de dados antigos...');
    
    // 1. Ler arquivo JSON antigo
    const oldData: OldDataFormat = JSON.parse(
      fs.readFileSync(filePath, 'utf8')
    );
    
    this.logger.log(`Versão do arquivo: ${oldData.versao}`);
    this.logger.log(`Última atualização: ${oldData.atualizadoEm}`);
    
    // 2. Criar/verificar usuários (16 participantes)
    const participants = [
      'Felipe', 'Ingrid', 'Mauro', 'Caetano', 'Emmanuel', 
      'Rafael', 'Evelin', 'Alefe', 'Bruno', 'AdilsonJR', 
      'Miguel', 'Anderson', 'Lucas', 'Zaine', 'Valdemir', 'Paulo'
    ];
    
    this.logger.log(`Criando/verificando ${participants.length} usuários...`);
    const userMap = await this.createUsers(participants);
    this.logger.log(`Usuários processados: ${Object.keys(userMap).length}`);
    
    // 3. Verificar se partidas existem
    const totalMatches = Object.keys(oldData.palpites).length;
    this.logger.log(`Total de jogos no arquivo: ${totalMatches}`);
    
    const existingMatches = await this.matchModel.countDocuments();
    this.logger.log(`Partidas já cadastradas no sistema: ${existingMatches}`);
    
    if (existingMatches < totalMatches) {
      this.logger.warn(
        `ATENÇÃO: Faltam ${totalMatches - existingMatches} partidas no sistema!`
      );
      this.logger.warn('Execute o seed de partidas antes de migrar palpites.');
      throw new Error('Partidas insuficientes no sistema');
    }
    
    // 4. Criar mapeamento de IDs antigos para novos
    const matchIdMap = await this.createMatchIdMap(totalMatches);
    
    // 5. Migrar palpites
    this.logger.log('Iniciando migração de palpites...');
    let totalPredictions = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const [oldMatchId, predictions] of Object.entries(oldData.palpites)) {
      const newMatchId = matchIdMap[oldMatchId];
      
      if (!newMatchId) {
        this.logger.warn(`Partida ${oldMatchId} não encontrada no mapeamento`);
        continue;
      }
      
      for (const [userName, scoreStr] of Object.entries(predictions)) {
        totalPredictions++;
        
        try {
          const [homeScore, awayScore] = this.parseScore(scoreStr);
          const userId = userMap[userName];
          
          if (!userId) {
            this.logger.warn(`Usuário ${userName} não encontrado`);
            errorCount++;
            continue;
          }
          
          // Verificar se palpite já existe
          const existing = await this.predictionModel.findOne({
            userId,
            matchId: newMatchId
          });
          
          if (existing) {
            this.logger.debug(
              `Palpite já existe: ${userName} - Jogo ${oldMatchId}`
            );
            continue;
          }
          
          // Criar palpite
          await this.predictionModel.create({
            userId,
            matchId: newMatchId,
            predictedHomeScore: homeScore,
            predictedAwayScore: awayScore,
            createdAt: new Date(oldData.atualizadoEm),
            updatedAt: new Date(oldData.atualizadoEm)
          });
          
          successCount++;
          
          if (successCount % 100 === 0) {
            this.logger.log(`Progresso: ${successCount}/${totalPredictions}`);
          }
          
        } catch (error) {
          this.logger.error(
            `Erro ao migrar palpite: ${userName} - Jogo ${oldMatchId}`,
            error.stack
          );
          errorCount++;
        }
      }
    }
    
    this.logger.log('=== RESUMO DA MIGRAÇÃO ===');
    this.logger.log(`Total de palpites processados: ${totalPredictions}`);
    this.logger.log(`Migrados com sucesso: ${successCount}`);
    this.logger.log(`Erros: ${errorCount}`);
    
    // 6. Recalcular pontuação
    this.logger.log('Recalculando pontuação...');
    await this.recalculatePoints();
    
    this.logger.log('Migração concluída com sucesso!');
    
    return {
      totalPredictions,
      successCount,
      errorCount,
      updatedAt: oldData.atualizadoEm
    };
  }
  
  /**
   * Cria usuários no sistema se não existirem
   */
  private async createUsers(names: string[]): Promise<Record<string, string>> {
    const userMap: Record<string, string> = {};
    
    for (const name of names) {
      // Verificar se usuário já existe
      let user = await this.userModel.findOne({ name });
      
      if (!user) {
        // Criar usuário
        const email = `${name.toLowerCase()}@bolao.local`;
        const password = await bcrypt.hash('senha123', 10); // Senha padrão
        
        user = await this.userModel.create({
          name,
          email,
          password,
          role: 'user',
          isActive: true
        });
        
        this.logger.log(`Usuário criado: ${name} (${email})`);
      }
      
      userMap[name] = user._id.toString();
    }
    
    return userMap;
  }
  
  /**
   * Cria mapeamento entre IDs antigos (1-87) e IDs novos (ObjectId)
   */
  private async createMatchIdMap(totalMatches: number): Promise<Record<string, string>> {
    const matches = await this.matchModel
      .find()
      .sort({ kickoffAt: 1 }) // Ordenar por data
      .limit(totalMatches)
      .exec();
    
    const map: Record<string, string> = {};
    
    matches.forEach((match, index) => {
      const oldId = (index + 1).toString(); // "1", "2", "3", ...
      map[oldId] = match._id.toString();
    });
    
    this.logger.log(`Mapeamento criado para ${Object.keys(map).length} partidas`);
    
    return map;
  }
  
  /**
   * Parser do formato "X x Y" do sistema antigo
   */
  private parseScore(scoreStr: string): [number, number] {
    // Formato: "2 x 0", "1 x 2", etc
    // Sempre tem espaços: " x "
    const parts = scoreStr.split(' x ');
    
    if (parts.length !== 2) {
      throw new Error(`Formato de placar inválido: "${scoreStr}"`);
    }
    
    const home = parseInt(parts[0].trim());
    const away = parseInt(parts[1].trim());
    
    if (isNaN(home) || isNaN(away)) {
      throw new Error(`Placares não numéricos: "${scoreStr}"`);
    }
    
    if (home < 0 || away < 0) {
      throw new Error(`Placares negativos: "${scoreStr}"`);
    }
    
    return [home, away];
  }
  
  /**
   * Recalcula pontuação de todos os palpites
   */
  private async recalculatePoints() {
    // Implementar lógica de recálculo
    // Esta função deve iterar sobre todos os palpites
    // e recalcular pontos com base nos resultados reais
    this.logger.log('TODO: Implementar recálculo de pontos');
  }
  
  /**
   * Valida a integridade dos dados migrados
   */
  async validateMigration(): Promise<void> {
    this.logger.log('Validando migração...');
    
    const userCount = await this.userModel.countDocuments();
    const matchCount = await this.matchModel.countDocuments();
    const predictionCount = await this.predictionModel.countDocuments();
    
    this.logger.log(`Usuários: ${userCount}`);
    this.logger.log(`Partidas: ${matchCount}`);
    this.logger.log(`Palpites: ${predictionCount}`);
    
    // Verificar palpites órfãos
    const orphanPredictions = await this.predictionModel.countDocuments({
      $or: [
        { userId: null },
        { matchId: null }
      ]
    });
    
    if (orphanPredictions > 0) {
      this.logger.warn(`ATENÇÃO: ${orphanPredictions} palpites órfãos encontrados!`);
    } else {
      this.logger.log('✓ Nenhum palpite órfão encontrado');
    }
    
    this.logger.log('Validação concluída');
  }
}
```

### 4. Adicionar Endpoints para Fase de Grupos

**Arquivo**: `src/presentation/controllers/matches.controller.ts`

```typescript
// Adicionar novos endpoints

@Get('group/:group')
@UseGuards(JwtAuthGuard)
async getMatchesByGroup(@Param('group') group: string) {
  return this.getMatchesByGroupUseCase.execute(group);
}

@Get('round/:round')
@UseGuards(JwtAuthGuard)
async getMatchesByRound(@Param('round') round: number) {
  return this.getMatchesByRoundUseCase.execute(round);
}

@Patch(':id/manual-score')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async setManualScore(
  @Param('id') id: string,
  @Body() dto: SetManualScoreDto
) {
  return this.setManualScoreUseCase.execute(id, dto);
}

@Delete(':id/manual-score')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async removeManualScore(@Param('id') id: string) {
  return this.removeManualScoreUseCase.execute(id);
}
```

### 5. Atualizar Sistema de Pontuação

**Arquivo**: `src/application/use-cases/predictions/calculate-points.use-case.ts`

```typescript
export class CalculatePointsUseCase {
  execute(prediction: Prediction, match: Match): number {
    // Usar placar final (manual tem prioridade sobre oficial)
    const homeScore = match.useManualScore 
      ? match.manualHomeScore 
      : match.officialHomeScore;
      
    const awayScore = match.useManualScore 
      ? match.manualAwayScore 
      : match.officialAwayScore;
    
    if (homeScore === undefined || awayScore === undefined) {
      return 0; // Jogo sem placar ainda
    }
    
    // Pontuação por fase
    const basePoints = this.getBasePoints(match.stage);
    
    // Verificar acerto
    const predictedOutcome = this.getOutcome(
      prediction.predictedHomeScore, 
      prediction.predictedAwayScore
    );
    const actualOutcome = this.getOutcome(homeScore, awayScore);
    
    if (predictedOutcome !== actualOutcome) {
      return 0; // Errou
    }
    
    // Acertou resultado
    let points = basePoints;
    
    // Bônus placar exato
    if (prediction.predictedHomeScore === homeScore && 
        prediction.predictedAwayScore === awayScore) {
      points += 2; // Bônus fixo
    }
    
    return points;
  }
  
  private getBasePoints(stage: MatchStage): number {
    switch (stage) {
      case 'GROUP_STAGE': return 1;      // Fase de grupos
      case 'ROUND_OF_16': return 1;
      case 'ROUND_OF_8': return 1;
      case 'QUARTER_FINALS': return 1;
      case 'SEMI_FINALS': return 2;
      case 'FINAL': return 2;
      default: return 1;
    }
  }
}
```

### 6. Atualizar Dashboard

**Arquivo**: `src/application/use-cases/stats/get-dashboard.use-case.ts`

Incluir dados da fase de grupos:
```typescript
export class GetDashboardUseCase {
  async execute(): Promise<DashboardStats> {
    const matches = await this.matchRepository.findAll();
    const predictions = await this.predictionRepository.findAll();
    const users = await this.userRepository.findAll();
    
    // Separar por fase
    const groupMatches = matches.filter(m => m.stage === 'GROUP_STAGE');
    const knockoutMatches = matches.filter(m => m.stage !== 'GROUP_STAGE');
    
    return {
      totalMatches: matches.length,
      groupMatches: groupMatches.length,
      knockoutMatches: knockoutMatches.length,
      finishedMatches: matches.filter(m => m.status === 'FINISHED').length,
      totalUsers: users.length,
      totalPredictions: predictions.length,
      // ... mais stats
    };
  }
}
```

## 🔄 Fluxo de Migração

### Passo a Passo

1. **Backup completo do sistema atual**
```bash
# Exportar dados antigos
curl https://old-system/export > old-data.json

# Backup MongoDB novo (se já tem dados)
mongodump --uri="mongodb://localhost:27017/mata-mata-bolao" --out=backup
```

2. **Atualizar schemas e modelos**
```bash
# Implementar mudanças nos schemas
# Gerar e rodar migrations se necessário
```

3. **Carregar partidas da fase de grupos**
```typescript
// Criar seed com os 87 jogos da fase de grupos
// Incluir grupo, rodada, times, horários
npm run seed:group-stage
```

4. **Executar migração de palpites**
```bash
npm run migrate:old-data -- --file=old-data.json
```

5. **Recalcular pontuação**
```bash
npm run recalculate:points
```

6. **Validar dados**
```bash
npm run validate:migration
```

## 📊 Estrutura de Dados Unificada

### Exemplo de Match (Fase de Grupos)
```json
{
  "_id": "...",
  "externalId": "wc2026-g1-r1-m1",
  "competition": "FIFA World Cup 2026",
  "stage": "GROUP_STAGE",
  "group": "A",
  "round": 1,
  "roundLabel": "Grupo A - Rodada 1",
  "homeTeam": "México",
  "awayTeam": "Canadá",
  "kickoffAt": "2026-06-11T16:00:00Z",
  "status": "FINISHED",
  "officialHomeScore": 2,
  "officialAwayScore": 1,
  "useManualScore": false,
  "winner": "HOME"
}
```

### Exemplo de Match (Mata-mata)
```json
{
  "_id": "...",
  "externalId": "wc2026-r16-m1",
  "competition": "FIFA World Cup 2026",
  "stage": "ROUND_OF_16",
  "roundLabel": "Oitavas de Final - Jogo 1",
  "homeTeam": "Brasil",
  "awayTeam": "Argentina",
  "kickoffAt": "2026-06-29T16:00:00Z",
  "status": "SCHEDULED",
  "winner": null
}
```

## 🎯 Regras de Negócio Unificadas

### Pontuação
- **Fase de Grupos**: 1 ponto por acerto + 2 bônus placar exato
- **Oitavas/Quartas**: 1 ponto por acerto + 2 bônus placar exato
- **Semi/Final**: 2 pontos por acerto + 2 bônus placar exato

### Palpites
- Prazo: até 1h antes do jogo (fase de grupos e mata-mata)
- Edição permitida até o prazo
- Visibilidade: pública após o prazo

### Ranking
- Unificado (fase de grupos + mata-mata)
- Critérios de desempate:
  1. Total de pontos
  2. Placares exatos
  3. Total de acertos

## 🔌 Novos Endpoints

```
GET    /api/v1/matches/group/:group          # Jogos por grupo
GET    /api/v1/matches/round/:round          # Jogos por rodada
GET    /api/v1/matches/group-standings       # Classificação dos grupos
PATCH  /api/v1/matches/:id/manual-score      # Definir placar manual (admin)
DELETE /api/v1/matches/:id/manual-score      # Remover placar manual (admin)
GET    /api/v1/stats/group-stage             # Stats fase de grupos
GET    /api/v1/stats/knockout-stage          # Stats mata-mata
```

## ✅ Checklist de Implementação

- [ ] Atualizar Match Schema (group, round, manual scores)
- [ ] Atualizar tipos TypeScript
- [ ] Criar script de migração
- [ ] Implementar endpoints para grupos
- [ ] Implementar placares manuais
- [ ] Atualizar sistema de pontuação
- [ ] Criar seed de partidas da fase de grupos
- [ ] Migrar palpites antigos
- [ ] Recalcular pontos
- [ ] Atualizar dashboard
- [ ] Atualizar ranking
- [ ] Testes de integração
- [ ] Documentação Swagger
- [ ] Deploy

## 🚀 Comandos Úteis

```bash
# Migração
npm run migrate:prepare          # Preparar migração
npm run migrate:execute          # Executar migração
npm run migrate:rollback         # Reverter se necessário

# Seeds
npm run seed:group-matches       # Popular jogos fase de grupos
npm run seed:users               # Popular usuários

# Utilitários
npm run recalc:points            # Recalcular pontuação
npm run validate:data            # Validar integridade dos dados
npm run export:json              # Exportar dados para JSON
```

## 📄 Documentação Adicional

Após implementação, atualizar:
- README.md com novos endpoints
- Swagger com novos schemas
- Guia de migração para admins
- Script de backup/restore

---

**Importante**: Mantenha backup completo antes de executar a migração. Teste em ambiente de staging primeiro!
