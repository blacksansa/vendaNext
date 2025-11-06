# Configuração da Role LeaderBoard

## O que foi implementado

A página `/lideres` agora exige a role **`LeaderBoard`** para acesso.

## Como adicionar a role no Keycloak

### 1. Criar a Role no Keycloak

1. Acesse o **Keycloak Admin Console**
2. Selecione seu **Realm**
3. Vá em **Realm Roles** (menu lateral)
4. Clique em **Create Role**
5. Preencha:
   - **Role Name:** `LeaderBoard`
   - **Description:** `Acesso ao painel de líderes e métricas de equipe`
6. Clique em **Save**

### 2. Atribuir a Role aos Usuários

#### Opção A: Atribuir diretamente ao usuário
1. Vá em **Users** → Selecione o usuário
2. Clique na aba **Role Mappings**
3. Em **Available Roles**, selecione `LeaderBoard`
4. Clique em **Add selected**

#### Opção B: Atribuir via Grupo (Recomendado)
1. Vá em **Groups** → Crie ou selecione grupo "Líderes"
2. Clique na aba **Role Mappings**
3. Em **Available Roles**, selecione `LeaderBoard`
4. Clique em **Add selected**
5. Adicione os usuários ao grupo

### 3. Configurar no Client

1. Vá em **Clients** → Selecione seu client (ex: `venda-plus`)
2. Clique na aba **Client Scopes**
3. Clique em **Add client scope**
4. Selecione `roles` ou crie um novo scope
5. Em **Mappers**, certifique-se que há um mapper do tipo **User Realm Role**

### 4. Verificar Token JWT

O token JWT deve incluir a role no campo `realm_access.roles`:

```json
{
  "realm_access": {
    "roles": [
      "LeaderBoard",
      "manageTeams",
      "managePipelines"
    ]
  }
}
```

## Roles Recomendadas para Líderes

Configure um **perfil completo de líder** com estas roles:

```
✅ LeaderBoard       - Acesso ao painel /lideres
✅ manageTeams       - Gerenciar grupos/equipes
✅ managePipelines   - Criar/editar pipelines
✅ manageStages      - Criar/editar estágios
```

## Testando

1. Faça login com um usuário **sem** a role `LeaderBoard`
2. Acesse `/lideres`
3. Deve ver: "Acesso Negado - Role necessária: LeaderBoard"

4. Adicione a role `LeaderBoard` ao usuário
5. Faça logout e login novamente
6. Acesse `/lideres`
7. Agora deve ver o painel normalmente

## Interface na Página de Grupos e Permissões

Quando você marca um usuário como **líder** em "Grupos e Permissões", adicione estas roles:

**Checkbox sugerido:**
```
☐ Líder de Equipe
  Permissões incluídas:
  • LeaderBoard (painel de líderes)
  • manageTeams (gerenciar grupos)
  • managePipelines (gerenciar pipelines)
  • manageStages (gerenciar estágios)
```

## Mensagem de Erro

Se o usuário tentar acessar sem permissão, verá:

```
Acesso Negado
Você não tem permissão para acessar o painel de líderes.
Role necessária: LeaderBoard
```
