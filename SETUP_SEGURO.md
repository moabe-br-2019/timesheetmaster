# Setup de Deploy Seguro - Passo a Passo

## 📋 Checklist de Configuração

### Etapa 1: Obter Credenciais do Cloudflare

1. **Obter API Token**
   - Acesse: https://dash.cloudflare.com/profile/api-tokens
   - Clique em "Create Token"
   - Use o template "Edit Cloudflare Workers"
   - Ou crie um custom token com as permissões:
     - Account → Cloudflare Pages → Edit
   - Copie o token (você só verá ele uma vez!)

2. **Obter Account ID**
   - Acesse: https://dash.cloudflare.com
   - Clique no seu projeto Pages
   - Na URL você verá: `https://dash.cloudflare.com/[ACCOUNT_ID]/pages/...`
   - Ou encontre no sidebar direito: "Account ID"

---

### Etapa 2: Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: [Cole o token da Etapa 1.1]

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: [Cole o Account ID da Etapa 1.2]

✅ **Checkpoint**: Você deve ter 2 secrets configurados

---

### Etapa 3: Criar Ambiente de Produção no GitHub

1. No repositório, vá em **Settings** → **Environments**
2. Clique em **New environment**
3. Nome: `production`
4. Clique em **Configure environment**

**Configurações importantes:**

5. ✅ Marque **Required reviewers**
6. Adicione você mesmo como reviewer (seu usuário GitHub)
7. (Opcional) Configure **Wait timer**: 5 minutos (tempo mínimo antes de deploy)

✅ **Checkpoint**: Ambiente "production" criado com required reviewers

---

### Etapa 4: Criar Branch Develop

Abra o terminal no seu projeto e execute:

```bash
# 1. Garantir que está na main atualizada
git checkout main
git pull origin main

# 2. Criar branch develop
git checkout -b develop

# 3. Push inicial da develop
git push -u origin develop

# 4. Voltar para main (por enquanto)
git checkout main
```

✅ **Checkpoint**: Branch `develop` criada e publicada no GitHub

---

### Etapa 5: Configurar Branch Protection Rules

#### Para a branch `main`:

1. **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Marque as seguintes opções:

   **Proteções básicas:**
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
     - ✅ Dismiss stale pull request approvals when new commits are pushed

   **Verificações de status:**
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Na caixa de busca, procure e adicione: `test` (vai aparecer depois do primeiro run)

   **Outras proteções:**
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings** (importante!)
   - ✅ **Restrict who can push to matching branches** (adicione apenas você)

4. Clique em **Create**

#### Para a branch `develop`:

1. **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `develop`
3. Marque:
   - ✅ **Require a pull request before merging**
     - Approvals: 0 (pode aprovar você mesmo)
   - ✅ **Require status checks to pass before merging**
     - Procure e adicione: `test`

4. Clique em **Create**

✅ **Checkpoint**: Regras de proteção configuradas para `main` e `develop`

---

### Etapa 6: Verificar Workflow File

O arquivo `.github/workflows/deploy.yml` já foi criado.

Vamos verificar se está correto:

```bash
cat .github/workflows/deploy.yml
```

Se precisar do nome exato do projeto Cloudflare Pages:
1. Acesse: https://dash.cloudflare.com
2. Workers & Pages → seu projeto
3. Nome aparece no topo (ex: `timesheet-app`)

**Se precisar editar:**
- Abra `.github/workflows/deploy.yml`
- Procure por `projectName: timesheet-app`
- Substitua pelo nome exato do seu projeto

---

### Etapa 7: Commit e Push do Workflow

```bash
# 1. Adicionar os arquivos de configuração
git add .github/workflows/deploy.yml
git add DEPLOY_GUIDE.md
git add SETUP_SEGURO.md

# 2. Commit
git commit -m "ci: Adicionar workflow de deploy seguro com staging"

# 3. Push para main (última vez que push direto!)
git push origin main

# 4. Sincronizar develop com main
git checkout develop
git merge main
git push origin develop
```

✅ **Checkpoint**: Workflow commitado e disponível no GitHub

---

## 🧪 Etapa 8: Testar o Workflow

### Teste 1: Deploy Preview (Feature Branch)

```bash
# 1. Criar branch de feature
git checkout develop
git checkout -b feature/teste-deploy

# 2. Fazer uma mudança simples
echo "# Deploy Seguro Configurado" >> README.md
git add README.md
git commit -m "docs: adicionar nota sobre deploy seguro"

# 3. Push da feature
git push origin feature/teste-deploy

# 4. No GitHub: Criar Pull Request
# Base: develop ← Compare: feature/teste-deploy
```

**O que deve acontecer:**
- ✅ GitHub Actions inicia automaticamente
- ✅ Job `test` executa (build, lint)
- ✅ Job `deploy-preview` cria preview deployment
- ✅ Link do preview aparece no PR

### Teste 2: Deploy Staging (Develop)

```bash
# 1. Aprovar e fazer merge do PR acima
# (no GitHub)

# 2. Após merge em develop:
```

**O que deve acontecer:**
- ✅ Deploy automático para staging
- ✅ URL: https://develop.timesheet-app.pages.dev (ou similar)

### Teste 3: Deploy Produção (Main) - COM APROVAÇÃO

```bash
# 1. Criar PR de develop para main
# No GitHub: New Pull Request
# Base: main ← Compare: develop
```

**O que deve acontecer:**
- ✅ Job `test` executa
- ✅ Após merge, job `deploy-production` espera aprovação
- ✅ GitHub notifica você para aprovar
- ✅ Você clica em "Review deployments" e aprova
- ✅ Deploy acontece para produção

---

## 🎯 Resultado Final

Após configuração completa, você terá:

```
┌─────────────────────────────────────────────┐
│  feature/nova-feature                       │
│  (desenvolvimento local)                    │
└─────────────────┬───────────────────────────┘
                  │ PR + Review
                  ↓
┌─────────────────────────────────────────────┐
│  develop                                     │
│  📦 Auto-deploy → staging                   │
│  🔗 develop.timesheet-app.pages.dev         │
└─────────────────┬───────────────────────────┘
                  │ PR + Review + Testes
                  ↓
┌─────────────────────────────────────────────┐
│  main                                        │
│  ⚠️  Deploy requer APROVAÇÃO MANUAL         │
│  🔗 timesheet-app.pages.dev (produção)      │
└─────────────────────────────────────────────┘
```

---

## 🔥 Comandos Úteis Pós-Setup

### Ver status dos workflows
```bash
gh workflow list
gh run list --workflow=deploy.yml
```

### Aprovar deploy via CLI (alternativa)
```bash
gh run list --workflow=deploy.yml
gh run view <RUN_ID>
# Ver link de aprovação ou aprovar via web
```

### Rollback de emergência
```bash
# Ver deploy anterior
git log --oneline -5

# Reverter commit problemático
git revert <commit-hash>
git push origin main

# Ou via Cloudflare Dashboard:
# Pages → Deployments → [...] → Rollback
```

---

## ⚠️ Troubleshooting

### Erro: "Resource not accessible by integration"
- Vá em Settings → Actions → General
- Em "Workflow permissions":
  - Marque "Read and write permissions"
  - Marque "Allow GitHub Actions to create and approve pull requests"

### Erro: "secrets.CLOUDFLARE_API_TOKEN not found"
- Verifique se criou os secrets corretamente (Etapa 2)
- Nome deve ser EXATAMENTE: `CLOUDFLARE_API_TOKEN`

### Job "test" não encontrado nas branch protection rules
- Execute o workflow pelo menos uma vez
- Depois ele aparece na lista de status checks

### Preview deployment não aparece
- Verifique se `projectName` está correto no workflow
- Verifique se o token tem permissão "Cloudflare Pages - Edit"

---

## 📞 Precisa de Ajuda?

Durante o setup, se encontrar algum erro:

1. Copie a mensagem de erro completa
2. Verifique os logs do GitHub Actions:
   - Actions → Workflow run → Job com erro → Expandir step com erro
3. Compartilhe comigo para debug

---

## ✅ Configuração Completa!

Após seguir todos os passos, seu workflow de deploy estará configurado com:

- ✅ Ambientes separados (develop/staging e main/production)
- ✅ Testes automáticos antes de cada deploy
- ✅ Preview deployments para cada PR
- ✅ Aprovação manual obrigatória para produção
- ✅ Branch protection impedindo push direto em main
- ✅ Histórico completo de deploys
- ✅ Rollback fácil via Cloudflare ou Git

**Agora você tem um processo de deploy profissional! 🚀**
