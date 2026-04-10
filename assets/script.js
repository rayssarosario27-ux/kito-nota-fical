// SPA: navegação e renderização dinâmica


// Navegação SPA compatível com Vercel (links relativos)
document.addEventListener('DOMContentLoaded', function() {
  const cardGerar = document.getElementById('card-gerar');
  const cardVisualizar = document.getElementById('card-visualizar');
  if (cardGerar) {
    cardGerar.onclick = (e) => {
      e.preventDefault();
      window.location.pathname = window.location.pathname.replace(/\/[^/]*$/, '/gerar.html');
    };
  }
  if (cardVisualizar) {
    cardVisualizar.onclick = (e) => {
      e.preventDefault();
      window.location.pathname = window.location.pathname.replace(/\/[^/]*$/, '/visualizar.html');
    };
  }
});


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
            <input type="text" name="cpf_cnpj" required maxlength="14" pattern="\d+" placeholder="Somente números">
          </label>
        </div>
        <div class="form-row">
          <label>Endereço de Entrega
            <input type="text" name="endereco_entrega" required placeholder="Rua, número, bairro, cidade">
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

  // Validação: só números no CPF/CNPJ
  const cpfCnpjInput = document.querySelector('input[name="cpf_cnpj"]');
  cpfCnpjInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
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
    const enderecoEntrega = form.endereco_entrega.value;
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

    // Cabeçalho profissional
    doc.setFillColor(0, 234, 255);
    doc.roundedRect(20, 12, 170, 28, 12, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 42, 120);
    doc.setFontSize(24);
    doc.text(empresa.nome, 105, 28, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(33,33,33);
    doc.text('Aluguel de Mesas e Cadeiras', 105, 38, { align: 'center' });

    // Linha divisória
    doc.setDrawColor(0, 234, 255);
    doc.setLineWidth(1);
    doc.line(20, 40, 190, 40);

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
    doc.setFontSize(13);
    doc.setTextColor(0, 234, 255);
    doc.text('Dados do Cliente', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(33,33,33);
    y += 7;
    doc.text(`Nome: ${cliente}`, 25, y);
    y += 7;
    doc.text(`CPF/CNPJ: ${cpfCnpj}`, 25, y);
    y += 7;
    doc.text(`Endereço de Entrega: ${enderecoEntrega}`, 25, y);
    y += 7;
    doc.text(`Celular: ${celularCliente}`, 25, y);
    if (emailCliente) {
      y += 7;
      doc.text(`Email: ${emailCliente}`, 25, y);
    }

    // Seção Aluguel
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 234, 255);
    doc.text('Dados do Aluguel', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(33,33,33);
    y += 7;
    doc.text(`Data de Emissão: ${dataEmissao.split('-').reverse().join('/')}`, 25, y);
    y += 7;
    doc.text(`Período: ${dataInicio.split('-').reverse().join('/')} à ${dataFim.split('-').reverse().join('/')}`, 25, y);

    // Seção Itens
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 234, 255);
    doc.text('Itens Alugados', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(33,33,33);
    y += 7;
    doc.text(itensDesc.join(' | '), 25, y);

    // Valor
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 234, 255);
    doc.text('Valor Total', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(33,33,33);
    doc.text(`R$ ${valor}`, 60, y);

    // Espaço para assinaturas
    y += 20;
    doc.setDrawColor(200,200,200);
    doc.line(25, y, 100, y); // Cliente
    doc.line(115, y, 190, y); // Empresa
    doc.setFontSize(10);
    doc.setTextColor(120,120,120);
    doc.text('Assinatura do Cliente', 27, y + 6);
    doc.text('Assinatura Kito Locações', 117, y + 6);

    // Baixa PDF
    doc.save(`nota-fiscal-${cliente.replace(/\s+/g, '_')}.pdf`);
    document.getElementById('pdfLink').innerHTML = '<span style="color:#00eaff">PDF gerado e baixado!</span>';
  });
}

function renderHome() {
  // Não sobrescreve mais o HTML, apenas ativa navegação se necessário
  setupHomeNavigation();
}


// Inicialização SPA após DOM pronto
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('gerar.html')) {
    renderFormNota();
  } else {
    renderHome();
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('logo-img-home') || e.target.classList.contains('header-title-home')) {
    renderHome();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
});

function renderVisualizarNotas() {
  // Não sobrescreve mais o HTML, apenas limpa ou ativa navegação se necessário
}
