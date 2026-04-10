console.log('Kito SPA JS carregado');
// SPA: navegação e renderização dinâmica

function setupKitoSPA() {
  const cardGerar = document.getElementById('card-gerar');
  const cardVisualizar = document.getElementById('card-visualizar');
  if (cardGerar) {
    cardGerar.onclick = (e) => {
      e.preventDefault();
      renderFormNota();
    };
  }
  if (cardVisualizar) {
    cardVisualizar.onclick = (e) => {
      e.preventDefault();
      renderVisualizarNotas();
    };
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupKitoSPA);
} else {
  setupKitoSPA();
}

// Renderização SPA para Visualizar Notas
function renderVisualizarNotas() {
  const container = document.getElementById('app-content');
  if (container) {
    container.innerHTML = `<div class='nota-card-mock'>Nenhuma nota encontrada (mock)</div>`;
  }
}


// Carrega jsPDF de CDN e garante disponibilidade antes de usar
let jsPDFReady = false;
let jsPDFResolve;
const jsPDFPromise = new Promise((resolve) => { jsPDFResolve = resolve; });
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
script.onload = () => {
  jsPDFReady = true;
  jsPDFResolve();
};
document.head.appendChild(script);

function renderFormNota() {
  // Template único do formulário
  const formHtml = `
    <form id="rentalForm" class="container">
      <div class="brand-header centered" style="margin-bottom: 0;">
        <img src="assets/logo.png" alt="Logo Kito Locações" class="logo-img" style="margin-bottom: 0;" />
        <div class="brand-title">
          <h1 style="font-size:2.1em; font-weight:900; color:#00eaff; letter-spacing:2px; margin-bottom:0;">Kito Locações</h1>
          <span class="slogan" style="font-size:1.1em; color:#232a4d; font-weight:700;">Aluguel de Mesas e Cadeiras</span>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title">Dados do Cliente</div>
        <div class="form-row">
          <label>Nome do Cliente
            <input type="text" name="cliente" required placeholder="Nome completo">
          </label>
          <label>CPF/CNPJ
            <input type="text" name="cpf_cnpj" required maxlength="18" placeholder="CPF ou CNPJ">
          </label>
        </div>
        <div class="form-row">
          <label>Endereço de Entrega
            <input type="text" name="endereco_entrega" required placeholder="Rua, bairro, cidade">
          </label>
          <label>Número
            <input type="text" name="numero_entrega" required placeholder="Nº">
          </label>
        </div>
        <div class="form-row">
          <label>CEP
            <input type="text" name="cep_entrega" id="cep_entrega" maxlength="9" placeholder="00000-000">
          </label>
          <label style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="semCep" name="semCep" style="width:18px; height:18px;"> Sem CEP
          </label>
        </div>
        <div class="form-row">
          <label>Celular
            <input type="text" name="celular_cliente" required placeholder="(99) 99999-9999" maxlength="15">
          </label>
          <label style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="soCelular" name="soCelular" checked style="width:18px; height:18px;"> Somente celular
          </label>
        </div>
        <div class="form-row" id="emailRow" style="display:none;">
          <label>Email
            <input type="email" name="email_cliente" placeholder="email@exemplo.com">
          </label>
        </div>
      </div>
      </div>
      <div class="form-section">
        <div class="section-title">Dados do Aluguel</div>
        <div class="form-row">
          <label>Data de Emissão
            <input type="date" name="data_emissao" required>
          </label>
          <label>Período do Aluguel
            <input type="date" name="data_inicio" required> até <input type="date" name="data_fim" required>
          </label>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title">Itens Alugados</div>
        <div class="form-row" style="gap: 32px;">
          <label class="checkbox-label">
            <input type="checkbox" name="usar_mesas" id="usar_mesas" checked>
            Mesas
            <input type="number" name="qtd_mesas" id="qtd_mesas" min="0" value="0" style="width:80px; margin-left:8px;">
          </label>
          <label class="checkbox-label">
            <input type="checkbox" name="usar_cadeiras" id="usar_cadeiras" checked>
            Cadeiras
            <input type="number" name="qtd_cadeiras" id="qtd_cadeiras" min="0" value="0" style="width:80px; margin-left:8px;">
          </label>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title">Valor</div>
        <div class="form-row">
          <label>Valor Total (R$)
            <input type="number" name="valor" step="0.01" required>
          </label>
        </div>
      </div>
      <button type="submit" class="btn-main">Gerar Nota Fiscal (PDF)</button>
      <div id="pdfLink"></div>
    </form>
  `;

  let container;
  if (document.getElementById('app-content')) {
    container = document.getElementById('app-content');
    container.innerHTML = formHtml;
  } else {
    container = document.querySelector('.container.futurista');
    // Remove formulário antigo se existir
    const formSection = container.querySelector('form#rentalForm');
    if (formSection) formSection.remove();
    const div = document.createElement('div');
    div.innerHTML = formHtml;
    container.appendChild(div.firstElementChild);
  }

  // Máscara dinâmica para CPF/CNPJ
  const cpfCnpjInput = document.querySelector('input[name="cpf_cnpj"]');
  cpfCnpjInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length <= 11) {
      // CPF: 000.000.000-00
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      v = v.replace(/(\d{2})(\d)/, '$1.$2');
      v = v.replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
      v = v.replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    }
    e.target.value = v;
  });

  // Máscara de celular
  const celInput = document.querySelector('input[name="celular_cliente"]');
  celInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0,11);
    if (v.length > 6) e.target.value = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    else if (v.length > 2) e.target.value = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    else e.target.value = v;
  });
  // Alternar campo email
  const soCelular = document.getElementById('soCelular');
  const emailRow = document.getElementById('emailRow');
  soCelular.addEventListener('change', () => {
    emailRow.style.display = soCelular.checked ? 'none' : 'flex';
    document.querySelector('input[name="email_cliente"]').required = !soCelular.checked;
  });

  // Alinhar checkboxes e quantidades
  const usarMesas = document.getElementById('usar_mesas');
  const usarCadeiras = document.getElementById('usar_cadeiras');
  const qtdMesas = document.getElementById('qtd_mesas');
  const qtdCadeiras = document.getElementById('qtd_cadeiras');
  function toggleMesas() {
    qtdMesas.disabled = !usarMesas.checked;
    if (!usarMesas.checked) qtdMesas.value = 0;
  }
  function toggleCadeiras() {
    qtdCadeiras.disabled = !usarCadeiras.checked;
    if (!usarCadeiras.checked) qtdCadeiras.value = 0;
  }
  usarMesas.addEventListener('change', toggleMesas);
  usarCadeiras.addEventListener('change', toggleCadeiras);
  toggleMesas();
  toggleCadeiras();

  document.getElementById('rentalForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await jsPDFPromise;
    const form = e.target;
    const cliente = form.cliente.value;
    const cpfCnpj = form.cpf_cnpj.value;
    // Validação simples de CPF/CNPJ (apenas formato, não dígito verificador)
    const cpfCnpjLimpo = cpfCnpj.replace(/\D/g, '');
    if (!(cpfCnpjLimpo.length === 11 || cpfCnpjLimpo.length === 14)) {
      alert('Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
      return;
    }
    const enderecoEntrega = form.endereco_entrega.value;
    const numeroEntrega = form.numero_entrega.value;
    const cepEntrega = form.semCep.checked ? 'Sem CEP' : form.cep_entrega.value;
    const celularCliente = form.celular_cliente.value;
    const emailCliente = form.soCelular.checked ? '' : form.email_cliente.value;
    const dataEmissao = form.data_emissao.value;
    const dataInicio = form.data_inicio.value;
    const dataFim = form.data_fim.value;
    const valor = parseFloat(form.valor.value).toFixed(2);
    const mesasMarcado = form.usar_mesas.checked;
    const cadeirasMarcado = form.usar_cadeiras.checked;
    const qtdMesas = mesasMarcado ? parseInt(form.qtd_mesas.value) : 0;
    const qtdCadeiras = cadeirasMarcado ? parseInt(form.qtd_cadeiras.value) : 0;

    // Dados da empresa
    const empresa = {
      nome: 'Kito Locações',
      cpf: '145.452.747-14',
      endereco: 'Rua Maria Botelho Santiago, 326 - Campo Grande, Rio de Janeiro',
      telefone: '(21) 96912-8210',
      email: 'marcosandredosantos97@gmail.com'
    };

    // Monta descrição dos itens
    let itensDesc = [];
    if (mesasMarcado && qtdMesas > 0) itensDesc.push(`${qtdMesas} mesa(s)`);
    if (cadeirasMarcado && qtdCadeiras > 0) itensDesc.push(`${qtdCadeiras} cadeira(s)`);
    if (itensDesc.length === 0) itensDesc.push('Nenhum item selecionado');

    // Gera PDF com layout moderno
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();


    // Cabeçalho simples
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(20);
    doc.text(empresa.nome, 105, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Aluguel de Mesas e Cadeiras', 105, 30, { align: 'center' });
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(20, 34, 190, 34);

    // Dados da empresa
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`CPF: ${empresa.cpf}`, 20, 47);
    doc.text(`Endereço: ${empresa.endereco}`, 20, 53);
    doc.text(`Tel: ${empresa.telefone}`, 20, 59);
    doc.text(`Email: ${empresa.email}`, 20, 65);

    // Seção Cliente
    let y = 75;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Dados do Cliente', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(33,33,33);
    y += 7;
    doc.text(`Nome: ${cliente}`, 25, y);
    y += 7;
    doc.text(`CPF/CNPJ: ${cpfCnpj}`, 25, y);
    y += 7;
    doc.text(`Endereço de Entrega: ${enderecoEntrega}, Nº ${numeroEntrega}`, 25, y);
    y += 7;
    doc.text(`CEP: ${cepEntrega}`, 25, y);
    y += 7;
    doc.text(`Celular: ${celularCliente}`, 25, y);
    if (emailCliente) {
      y += 7;
      doc.text(`Email: ${emailCliente}`, 25, y);
    }

    // Seção Aluguel
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Dados do Aluguel', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(33,33,33);
    y += 7;
    doc.text(`Data de Emissão: ${dataEmissao.split('-').reverse().join('/')}`, 25, y);
    y += 7;
    doc.text(`Período: ${dataInicio.split('-').reverse().join('/')} à ${dataFim.split('-').reverse().join('/')}`, 25, y);

    // Seção Itens
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Itens Alugados', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(33,33,33);
    y += 7;
    doc.text(itensDesc.join(' | '), 25, y);

    // Valor
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Valor Total', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(33,33,33);
    doc.text(`R$ ${valor}`, 60, y);

    // Cláusula de responsabilidade
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('Cláusula de Responsabilidade e Danos', 105, y, { align: 'center' });
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60,60,60);
    const clausula = [
      '7. DA CONSERVAÇÃO E DEVOLUÇÃO:',
      'O LOCATÁRIO declara receber o mobiliário (mesas e cadeiras) em perfeito estado de conservação e limpeza,',
      'obrigando-se a devolvê-lo da mesma forma.',
      '',
      '7.1. Danos e Avarias: Em caso de quebra, furos, queimaduras de cigarro, manchas persistentes (tinta, gordura ou mofo)',
      'ou qualquer dano que inutilize o material, o LOCATÁRIO arcará com o valor de reposição de mercado de cada item danificado.',
      '',
      '7.2. Extravio: Em caso de perda ou furto dos itens locados, o LOCATÁRIO deverá indenizar a Kito Locações',
      'pelo valor total de um item novo equivalente.',
      '',
      '7.3. Limpeza: As mesas e cadeiras não devem ser riscadas ou receber colagem de adesivos/fitas que danifiquem a pintura ou o material plástico.',
      '',
      '7.4. Prazo: A não devolução na data estipulada acarretará em multa diária de 10% sobre o valor total do contrato,',
      'além do custo da diária adicional.'
    ];
    let cy = y + 4;
    clausula.forEach(l => {
      doc.text(l, 20, cy, { maxWidth: 170 });
      cy += 5.2;
    });
    y = cy + 16;
    // Assinaturas (após cláusulas, centralizadas)
    doc.setLineWidth(0.5);
    doc.setDrawColor(120, 120, 120);
    doc.line(35, y, 95, y); // Cliente
    doc.line(115, y, 175, y); // Empresa
    doc.setFontSize(10);
    doc.setTextColor(120,120,120);
    doc.text('Assinatura do Cliente', 65, y + 7, { align: 'center' });
    doc.text('Assinatura Kito Locações', 145, y + 7, { align: 'center' });
    // Baixa PDF
    doc.save(`Nota_Kito_Locacoes_${cliente.replace(/\s+/g, '_')}.pdf`);
  }); // FECHA O SUBMIT
} // FECHA O RENDERFORMNOTA
