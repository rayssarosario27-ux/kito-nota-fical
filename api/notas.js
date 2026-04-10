// Função serverless para Vercel: Salva e lista notas fiscais no Neon
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0EjHcsASR6VW@ep-solitary-feather-ams5nlie-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Salvar nova nota
    const {
      cliente, cpf_cnpj, endereco_entrega, contato_cliente,
      data_emissao, data_inicio, data_fim, valor,
      usar_mesas, qtd_mesas, usar_cadeiras, qtd_cadeiras
    } = req.body;
    try {
      await pool.query(
        `INSERT INTO notas (
          cliente, cpf_cnpj, endereco_entrega, contato_cliente,
          data_emissao, data_inicio, data_fim, valor,
          usar_mesas, qtd_mesas, usar_cadeiras, qtd_cadeiras
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          cliente, cpf_cnpj, endereco_entrega, contato_cliente,
          data_emissao, data_inicio, data_fim, valor,
          usar_mesas, qtd_mesas, usar_cadeiras, qtd_cadeiras
        ]
      );
      res.status(201).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'GET') {
    // Listar notas
    try {
      const { rows } = await pool.query('SELECT * FROM notas ORDER BY id DESC');
      res.status(200).json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
