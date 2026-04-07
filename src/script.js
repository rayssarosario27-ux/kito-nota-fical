document.head.appendChild(script);
// SPA: navegação e renderização dinâmica

function setupHomeNavigation() {
  const appContent = document.getElementById('app-content');
  const cardGerar = document.getElementById('card-gerar');
  const cardVisualizar = document.getElementById('card-visualizar');
  if (cardGerar) {
    cardGerar.onclick = () => {
      renderFormNota();
      window.scrollTo({top: 0, behavior: 'smooth'});
    };
  }
  if (cardVisualizar) {
    cardVisualizar.onclick = () => {
      renderVisualizarNotas();
      window.scrollTo({top: 0, behavior: 'smooth'});
    };
  }

// Carrega jsPDF de CDN
// SPA: navegação e renderização dinâmica

// Carrega jsPDF de CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
document.head.appendChild(script);

function renderFormNota() {
  appContent.innerHTML = `
    <form id="rentalForm" class="container">
      <div class="brand-header centered" style="margin-bottom: 0;">
        <img src="logo.png" alt="Logo Kito Locações" class="logo-img" style="margin-bottom: 0;" />
        <div class="brand-title"><h1>Kito Locações</h1><span class="slogan">Aluguel de Mesas e Cadeiras</span></div>
      </div>
      <div class="form-section">
        <div class="section-title">Dados do Cliente</div>
        <div class="form-row">
          <label>Nome do Cliente
            <input type="text" name="cliente" required placeholder="Nome completo">
          </label>
          <label>CPF/CNPJ
            <input type="text" name="cpf_cnpj" required maxlength="14" pattern="\\d+" placeholder="Somente números">
          </label>
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

  // Validação: só números no CPF/CNPJ
    const cardGerar = document.getElementById('card-gerar');
    const cardVisualizar = document.getElementById('card-visualizar');
  const cpfCnpjInput = document.querySelector('input[name="cpf_cnpj"]');
  cpfCnpjInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
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

  document.getElementById('rentalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const cliente = form.cliente.value;
    const cpfCnpj = form.cpf_cnpj.value;
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
      email: 'marcosandredosantos@27gmail.com'
    };

    // Monta descrição dos itens
    let itensDesc = [];
    if (mesasMarcado && qtdMesas > 0) itensDesc.push(`${qtdMesas} mesa(s)`);
    if (cadeirasMarcado && qtdCadeiras > 0) itensDesc.push(`${qtdCadeiras} cadeira(s)`);
    if (itensDesc.length === 0) itensDesc.push('Nenhum item selecionado');

    // Gera PDF futurista
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Cabeçalho visual
    doc.setFillColor(30, 42, 120);
    doc.roundedRect(15, 12, 180, 28, 10, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20);
    doc.text(empresa.nome, 25, 28);
    doc.setFontSize(12);
    doc.text('Aluguel de Mesas e Cadeiras', 120, 28);

    // Dados da empresa
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0,234,255);
    doc.setFontSize(10);
    doc.text(`CPF: ${empresa.cpf}`, 25, 36);
    doc.text(`Endereço: ${empresa.endereco}`, 25, 41);
    doc.text(`Tel: ${empresa.telefone}  |  ${empresa.email}`, 25, 46);

    // Seção Nota Fiscal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 42, 120);
    doc.text('NOTA FISCAL DE ALUGUEL', 25, 58);
    doc.setDrawColor(0,234,255);
    doc.line(25, 60, 185, 60);

    // Dados do cliente e aluguel
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33,33,33);
    doc.setFontSize(11);
    let y = 70;
    doc.text(`Cliente:`, 25, y);
    doc.text(cliente, 60, y);
    y += 7;
    doc.text(`CPF/CNPJ:`, 25, y);
    doc.text(cpfCnpj, 60, y);
    y += 7;
    doc.text(`Data de Emissão:`, 25, y);
    doc.text(dataEmissao, 70, y);
    y += 7;
    doc.text(`Período do Aluguel:`, 25, y);
    doc.text(`${dataInicio.split('-').reverse().join('/')} à ${dataFim.split('-').reverse().join('/')}`, 70, y);
    y += 7;
    doc.text(`Itens Alugados:`, 25, y);
    doc.text(itensDesc.join(' | '), 70, y);
    y += 7;
    doc.text(`Valor Total:`, 25, y);
    doc.text(`R$ ${valor}`, 60, y);

    // Espaço para assinatura
    y += 20;
    doc.setDrawColor(200,200,200);
    doc.line(25, y, 120, y);
    doc.setFontSize(10);
    doc.setTextColor(120,120,120);
    doc.text('Assinatura do Cliente', 27, y + 6);

    // Baixa PDF
    doc.save(`nota-fiscal-${cliente.replace(/\s+/g, '_')}.pdf`);

    document.getElementById('pdfLink').innerHTML = '<span style="color:#00eaff">PDF gerado e baixado!</span>';
  });
}
// <-- Fim da função submit
}

function renderHome() {
  // Garante que sempre renderiza dentro do container correto
  const container = document.querySelector('.container');
  container.innerHTML = `
    <header class="main-header-home">
      <div class="logo-title-wrap">
        <img src="logo.png" alt="Logo Kito Locações" class="logo-img-home">
        <span class="header-title-home">Kito Locações</span>
      </div>
    </header>
    <main>
      <div class="card-nav-container-home">
        <div class="card-nav-home" id="card-gerar">
          <span class="card-icon-home">📝</span>
          <span class="card-title-home">Gerar Nota Fiscal</span>
        </div>
        <div class="card-nav-home" id="card-visualizar">
          <span class="card-icon-home">📄</span>
          <span class="card-title-home">Visualizar Notas</span>
        </div>
      </div>
      <div id="app-content"></div>
    </main>
  `;
  setupHomeNavigation();
}

// Inicialização SPA após DOM pronto
window.addEventListener('DOMContentLoaded', () => {
  renderHome();
});

// Voltar para home ao clicar no logo ou nome
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('logo-img-home') || e.target.classList.contains('header-title-home')) {
    renderHome();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
});

    // Gera PDF futurista
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Cabeçalho visual
    doc.setFillColor(30, 42, 120);
    doc.roundedRect(15, 12, 180, 28, 10, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20);
    doc.text(empresa.nome, 25, 28);
    doc.setFontSize(12);
    doc.text('Aluguel de Mesas e Cadeiras', 120, 28);

    // Dados da empresa
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0,234,255);
    doc.setFontSize(10);
    doc.text(`CPF: ${empresa.cpf}`, 25, 36);
    doc.text(`Endereço: ${empresa.endereco}`, 25, 41);
    doc.text(`Tel: ${empresa.telefone}  |  ${empresa.email}`, 25, 46);

    // Seção Nota Fiscal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 42, 120);
    doc.text('NOTA FISCAL DE ALUGUEL', 25, 58);
    doc.setDrawColor(0,234,255);
    doc.line(25, 60, 185, 60);

    // Dados do cliente e aluguel
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33,33,33);
    doc.setFontSize(11);
    let y = 70;
    doc.text(`Cliente:`, 25, y);
    doc.text(cliente, 60, y);
    y += 7;
    doc.text(`CPF/CNPJ:`, 25, y);
    doc.text(cpfCnpj, 60, y);
    y += 7;
    doc.text(`Data de Emissão:`, 25, y);
    doc.text(dataEmissao, 70, y);
    y += 7;
    doc.text(`Período do Aluguel:`, 25, y);
    doc.text(`${dataInicio.split('-').reverse().join('/')} à ${dataFim.split('-').reverse().join('/')}`, 70, y);
    y += 7;
    doc.text(`Itens Alugados:`, 25, y);
    doc.text(itensDesc.join(' | '), 70, y);
    y += 7;
    doc.text(`Valor Total:`, 25, y);
    doc.text(`R$ ${valor}`, 60, y);

    // Espaço para assinatura
    y += 20;
    doc.setDrawColor(200,200,200);
    doc.line(25, y, 120, y);
    doc.setFontSize(10);
    doc.setTextColor(120,120,120);
    doc.text('Assinatura do Cliente', 27, y + 6);

    // Baixa PDF
    doc.save(`nota-fiscal-${cliente.replace(/\s+/g, '_')}.pdf`);
    document.getElementById('pdfLink').innerHTML = '<span style="color:#00eaff">PDF gerado e baixado!</span>';
  });

function renderVisualizarNotas() {
  appContent.innerHTML = `
    <div class="container">
      <div class="brand-header centered" style="margin-bottom: 0;">
        <img src="logo.png" alt="Logo Kito Locações" class="logo-img" style="margin-bottom: 0;" />
        <div class="brand-title"><h1>Kito Locações</h1><span class="slogan">Aluguel de Mesas e Cadeiras</span></div>
      </div>
      <div class="form-section">
        <div class="section-title">Filtrar Notas</div>
        <div class="filtros-notas">
          <label>Dia
            <input type="date" id="filtro-dia">
          </label>
          <label>Mês
            <input type="month" id="filtro-mes">
          </label>
          <label>Nome/Empresa
            <input type="text" id="filtro-nome" placeholder="Nome ou Empresa">
          </label>
        </div>
      </div>
      <div class="form-section">
        <div class="section-title">Notas Encontradas</div>
        <div id="notas-lista">
          <div class="nota-card-mock">Nenhuma nota encontrada (mock)</div>
        </div>
      </div>
    </div>
  `;
}


// Inicialização SPA após DOM pronto
window.addEventListener('DOMContentLoaded', () => {
  renderHome();
});
