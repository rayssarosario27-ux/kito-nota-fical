# API Notas Fiscais - Vercel Serverless + Neon

## Endpoints
- `POST /api/notas` — Salva uma nova nota fiscal
- `GET /api/notas` — Lista todas as notas fiscais

## Variável de ambiente
- `DATABASE_URL` (string de conexão Neon)

## Exemplo de tabela no Neon (rode no painel SQL):

```sql
CREATE TABLE notas (
  id SERIAL PRIMARY KEY,
  cliente TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  endereco_entrega TEXT NOT NULL,
  contato_cliente TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  usar_mesas BOOLEAN NOT NULL,
  qtd_mesas INTEGER NOT NULL,
  usar_cadeiras BOOLEAN NOT NULL,
  qtd_cadeiras INTEGER NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);
```

## Uso
- Faça deploy no Vercel (ou rode local com `vercel dev`)
- Configure a variável de ambiente `DATABASE_URL` com sua string Neon
- O frontend pode fazer fetch POST/GET para `/api/notas`
