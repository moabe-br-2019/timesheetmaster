# Guia de Deploy Seguro - Timesheet App

## Problemas do Deploy Atual

1. ❌ Deploy automático direto em produção
2. ❌ Sem ambiente de testes
3. ❌ Sem validação antes de publicar
4. ❌ Difícil fazer rollback

## Solução Recomendada: GitFlow + Ambientes

### Estrutura de Branches

```
main (produção)
  ↑
develop (staging)
  ↑
feature/nova-funcionalidade (desenvolvimento)
```

### Workflow Seguro

1. **Desenvolvimento**: Trabalhar em branches `feature/nome-da-feature`
2. **Review**: Criar Pull Request para `develop`
3. **Testes**: Deploy automático em ambiente de staging
4. **Produção**: Merge para `main` apenas após testes

## Configuração

### 1. Configurar Secrets no GitHub

No seu repositório do GitHub:
1. Ir em Settings → Secrets and variables → Actions
2. Adicionar os seguintes secrets:

```
CLOUDFLARE_API_TOKEN=seu_token_aqui
CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui
```

### 2. Configurar Ambientes no GitHub

1. Settings → Environments → New environment
2. Criar ambiente "production"
3. Adicionar "Required reviewers" (você mesmo)
4. Agora todo deploy para produção precisa de aprovação manual

### 3. Criar Branch Develop

```bash
# Criar branch develop a partir da main
git checkout main
git pull
git checkout -b develop
git push -u origin develop
```

### 4. Configurar Branch Protection

No GitHub, Settings → Branches → Add rule:

**Para `main`:**
- ✅ Require pull request before merging
- ✅ Require status checks to pass (test job)
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

**Para `develop`:**
- ✅ Require pull request before merging
- ✅ Require status checks to pass

## Fluxo de Trabalho Diário

### Desenvolvendo Nova Feature

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar branch da feature
git checkout -b feature/nome-da-feature

# 3. Fazer alterações e commits
git add .
git commit -m "feat: adicionar nova funcionalidade"

# 4. Push da branch
git push origin feature/nome-da-feature

# 5. Criar PR no GitHub para develop
# (no GitHub: New Pull Request → base: develop)
```

### Testando em Staging

```bash
# Após merge do PR em develop, o deploy automático para staging acontece
# URL: https://develop.timesheet-app.pages.dev

# Testar as mudanças no staging
# Se tudo OK, criar PR de develop para main
```

### Deploy para Produção

```bash
# 1. Criar PR de develop para main
# 2. GitHub vai pedir aprovação manual
# 3. Aprovar o deploy
# 4. Deploy automático para produção
```

## Comandos Úteis

### Verificar status do deploy

```bash
# Ver últimos deploys
gh workflow list

# Ver runs de um workflow
gh run list --workflow=deploy.yml

# Ver logs de um run específico
gh run view <run-id> --log
```

### Rollback de Emergência

**Opção 1: Via Cloudflare Dashboard**
1. Acessar Cloudflare Pages
2. Ir em Deployments
3. Clicar em "..." no deploy anterior
4. "Rollback to this deployment"

**Opção 2: Via Git**
```bash
# Reverter commit problemático
git revert <commit-hash>
git push origin main

# Ou fazer hard reset (cuidado!)
git reset --hard <commit-anterior-bom>
git push --force origin main
```

## Alternativas Mais Simples

### Opção A: Deploy Manual com Aprovação

Se não quiser toda essa complexidade, pode:

1. **Desabilitar auto-deploy no Cloudflare**
   - Cloudflare Dashboard → Pages → Settings
   - Remover integração com GitHub

2. **Deploy via CLI apenas quando quiser**
   ```bash
   # Instalar Wrangler
   npm install -g wrangler

   # Build local
   npm run build

   # Deploy manual
   wrangler pages deploy dist --project-name=timesheet-app
   ```

### Opção B: Auto-deploy apenas de uma branch específica

No Cloudflare Dashboard:
1. Settings → Builds & deployments
2. Production branch: `production` (criar branch específica)
3. Preview branches: Todas as outras

Assim:
- `main`: Apenas para código revisado, sem auto-deploy
- `production`: Auto-deploy quando você fizer merge de main → production
- Outras branches: Preview deployments

## Checklist de Segurança

Antes de cada deploy para produção:

- [ ] Código revisado (PR aprovado)
- [ ] Testes locais passando
- [ ] Testado em ambiente de staging/preview
- [ ] Migrations de banco (se houver) testadas
- [ ] Backup do banco de dados feito
- [ ] Documentação atualizada
- [ ] Changelog atualizado

## Monitoramento

Depois do deploy:

1. ✅ Verificar que a aplicação está no ar
2. ✅ Testar login
3. ✅ Testar funcionalidade principal (criar registro, invoice)
4. ✅ Verificar console do browser (sem erros)
5. ✅ Verificar Cloudflare Analytics

## Contatos de Emergência

- Dashboard Cloudflare: https://dash.cloudflare.com
- Status Cloudflare: https://www.cloudflarestatus.com/
- GitHub Status: https://www.githubstatus.com/

---

## Recomendação Final

Para este projeto, sugiro:

1. **Curto prazo**: Desabilitar auto-deploy e usar deploy manual via CLI
2. **Médio prazo**: Implementar branch `develop` + Preview deployments
3. **Longo prazo**: Adicionar testes automatizados + GitHub Actions

O importante é ter **controle** sobre o que vai para produção e **capacidade de rollback rápido** se algo der errado.
