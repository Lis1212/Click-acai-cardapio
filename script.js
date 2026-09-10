const WHATSAPP_NUMERO = "5584921713033";
//const HORA_ABRE = 18;
//const HORA_FECHA = 22;

const FUSO_LOJA = "America/Fortaleza"; // fuso de Natal

const HORARIO_FUNCIONAMENTO = {
  padrao: { abre: 18, fecha: 22 },
  excecoes: {
    // 0: { abre: 18, fecha: 20 }
  },
};

function getAgoraNaLoja(){
  return new Date(new Date().toLocaleString('en-US', { timeZone: FUSO_LOJA }));
}

function getHorarioDoDia(diaSemana){
  return HORARIO_FUNCIONAMENTO.excecoes[diaSemana] || HORARIO_FUNCIONAMENTO.padrao;
}

function formatHora(h){
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return mm ? `${hh}h${String(mm).padStart(2,'0')}` : `${hh}h`;
}

function updateStatusLoja(){
  const agora = getAgoraNaLoja();
  const dia = agora.getDay();
  const horaDecimal = agora.getHours() + agora.getMinutes() / 60;
  const cfg = getHorarioDoDia(dia);
  const aberto = horaDecimal >= cfg.abre && horaDecimal < cfg.fecha;

  const badge = document.getElementById('openBadge');
  const texto = document.getElementById('openText');
  const chip = document.getElementById('horarioChip');

  badge.classList.toggle('closed', !aberto);
  texto.textContent = aberto
    ? `Aberto agora · fecha às ${formatHora(cfg.fecha)}`
    : `Fechado agora · abre às ${formatHora(cfg.abre)}`;
  if(chip) chip.textContent = `🕒 ${formatHora(cfg.abre)}–${formatHora(cfg.fecha)}`;
}
//  CARDÁPIO 
const builders = {
  copo: {
    titulo: "Copo da Felicidade",
    tamanhos: [
      { id:"350", label:"350ml", preco:15.00, foto:"img/Copo350.jpg" },
      { id:"470", label:"470ml", preco:17.00, foto:"img/Copo470.jpg" },
    ],
    baseMax: 2,
    base: ["Açaí","Creme de Ninho","Creme de Cupuaçu","Creme de Amendoim","Creme de Tapioca","Creme de Ovomaltine"],
    recheioMax: 3,
    recheioExtra: 0,
    recheio: ["Leite em pó","Kiwi","Chocopower","Fini","Canudo Wafer","Bombom","Jujuba","Farinha Láctea","Banana","Kitkat","Abacaxi","Doce de Leite","Cob. de Morango","Cob. de Chocolate","Ovomaltine","Uva","Nutella","Morango","Marshmallow","Leite Condensado","Castanha","Granola","Gotas","Coco","Confete","Chocoball","Bis","Oreo"],
    cobertura: ["Leite Condensado","Nutella","Doce de Leite","Cob. de Morango","Cob. de Chocolate","Cob. Fini Beijos"],
  },
  pote: {
    titulo: "Açaí no Pote",
    tamanhos: [
      { id:"350", label:"350ml", preco:15.00, foto:"img/Pote350.jpg" },
      { id:"500", label:"500ml", preco:18.00, foto:"img/Pote500.jpg" },
      { id:"1000", label:"1 Litro", preco:31.00, foto:"img/Pote1000.jpg" },
    ],
    baseMax: 2,
    base: ["Açaí","Creme de Ninho","Creme de Tapioca","Creme de Cupuaçu","Creme de Amendoim","Creme de Ovomaltine"],
    recheioMax: 5,
    recheioExtra: 2.00,
    recheio: ["Leite em pó","Kiwi","Chocopower","Farinha Láctea","Banana","Cob. de Fini Beijo", "Canudo Wafer","Fini", "Bombom","Jujuba","Ovomaltine","Uva","Kitkat","Castanha","Abacaxi","Nutella","Granola","Morango","Doce de Leite","Paçoca","Gotas","Marshmallow","Coco","Confete","Leite Condensado","Chocoball","Bis","Cob. de Morango","Amendoim","Oreo","Cob. de Chocolate"],
    cobertura: null,
  },
};

const cardapio = {
  combos: [
    { id:"comboCasal", nome:"Combo Casal", desc:"2x 350ml + 2 adicionais à escolha.", preco:30.00, emoji:"💜", foto:"img/combocasal.jpg" },
    { id:"comboFamilia", nome:"Combo Família", desc:"1L + 4 adicionais à escolha.", preco:35.00, emoji:"👨‍👩‍👧", foto: "img/combofamilia.jpg" },
  ],
};

let carrinho = {};
let tamanhoSelecionado = {};
const FRETE = 8.00;

function fmt(v){ return v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'}); }
function findItem(id){ for(const c in cardapio){ const f = cardapio[c].find(i=>i.id===id); if(f) return f; } }

function renderCardapio(){
  const container = document.getElementById('list-combos');
  container.innerHTML = cardapio.combos.map(item => `
    <div class="item-row" onclick="addItem('${item.id}')">
      <div class="item-photo">
        ${item.foto ? `<img src="${item.foto}" alt="${item.nome}">` : item.emoji}
      </div>
      <div class="item-body">
        <h3>${item.nome}</h3>
        ${item.desc ? `<p>${item.desc}</p>` : ''}
        <div class="item-bottom">
          <span class="item-price">${fmt(item.preco)}</span>
          <span id="ctrl-${item.id}">
            <button class="add-btn" id="btn-${item.id}" onclick="event.stopPropagation(); addItem('${item.id}')">+</button>
          </span>
        </div>
      </div>
    </div>
  `).join('');

  renderBuilder('copo');
  renderBuilder('pote');
}

function renderBuilder(bid){
  const cfg = builders[bid];
  const el = document.getElementById('builder-' + bid);
  el.innerHTML = `
    <div class="builder-step step-tamanho">
      <div class="build-block">
        <h3>Escolha o tamanho</h3>
        <div class="size-grid">
          ${cfg.tamanhos.map(t => `
            <div class="size-photo-card" onclick="selectTamanho('${bid}','${t.id}')">
              <div class="size-photo">
                ${t.foto
                  ? `<img src="${t.foto}" alt="${cfg.titulo} ${t.label}">`
                  : `<span class="photo-placeholder">📷<br>Foto em breve</span>`
                }
              </div>
              <div class="size-info">
                <span>${t.label}</span><b>${fmt(t.preco)}</b>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="builder-step step-adicionais" style="display:none;">
      <div class="step-tam-label" id="tamLabel-${bid}"></div>

      <div class="build-block">
        <h3>Base <small>escolha até ${cfg.baseMax}</small></h3>
        <div class="option-grid">
          ${cfg.base.map(b => `
            <label class="check-opt">
              <input type="checkbox" data-group="${bid}-base" value="${b}" onchange="onCheckLimit(this,'${bid}','base',${cfg.baseMax})">
              <span>${b}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="build-block">
        <h3>Recheio <small>escolha até ${cfg.recheioMax}${cfg.recheioExtra ? ' · extras a ' + fmt(cfg.recheioExtra) + ' cada' : ''}</small></h3>
        <div class="option-grid">
          ${cfg.recheio.map(r => `
            <label class="check-opt">
              <input type="checkbox" data-group="${bid}-recheio" value="${r}" onchange="onRecheioChange('${bid}', this)">
              <span>${r}</span>
            </label>
          `).join('')}
        </div>
        <div class="build-summary" id="resumo-${bid}"></div>
      </div>

      ${cfg.cobertura ? `
        <div class="build-block">
          <h3>Cobertura <small>escolha 1</small></h3>
          <div class="option-grid">
            ${cfg.cobertura.map(c => `
              <label class="radio-opt small" style="flex:1 1 45%;">
                <input type="radio" name="${bid}-cob" value="${c}">
                <span>${c}</span>
              </label>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <button class="add-build-btn" onclick="addBuilderToCart('${bid}')">Adicionar ao carrinho</button>
      <button class="add-build-btn voltar-tam-btn" onclick="voltarTamanho('${bid}')">← Trocar tamanho</button>
    </div>
  `;
  updateResumo(bid);
}

function selectTamanho(bid, tamId){
  const cfg = builders[bid];
  const tam = cfg.tamanhos.find(t => t.id === tamId);
  tamanhoSelecionado[bid] = tam;

  const root = document.getElementById('builder-' + bid);
  root.querySelector('.step-tamanho').style.display = 'none';
  root.querySelector('.step-adicionais').style.display = 'block';
  document.getElementById('tamLabel-' + bid).innerHTML =
    `${cfg.titulo} · ${tam.label} — ${fmt(tam.preco)} <button class="change-tam" onclick="voltarTamanho('${bid}')">trocar</button>`;

  document.getElementById(bid).scrollIntoView({behavior:'smooth', block:'start'});
}

function voltarTamanho(bid){
  const root = document.getElementById('builder-' + bid);
  root.querySelector('.step-adicionais').style.display = 'none';
  root.querySelector('.step-tamanho').style.display = 'block';
}

function onCheckLimit(input, bid, group, max){
  const checked = document.querySelectorAll(`[data-group="${bid}-${group}"]:checked`);
  if(checked.length > max){
    input.checked = false;
  }
}

function onRecheioChange(bid, el){
  const cfg = builders[bid];
  if(!cfg.recheioExtra){
    onCheckLimit(el, bid, 'recheio', cfg.recheioMax);
  }
  updateResumo(bid);
}

function updateResumo(bid){
  const cfg = builders[bid];
  const checked = document.querySelectorAll(`[data-group="${bid}-recheio"]:checked`);
  const total = checked.length;
  const extra = cfg.recheioExtra ? Math.max(0, total - cfg.recheioMax) : 0;
  const el = document.getElementById('resumo-' + bid);
  if(!el) return;
  if(extra > 0){
    el.innerHTML = `${total} recheios selecionados — <b>${extra} extra(s): +${fmt(extra * cfg.recheioExtra)}</b>`;
  } else {
    el.innerHTML = `${total}/${cfg.recheioMax} recheios selecionados`;
  }
}

function addBuilderToCart(bid){
  const cfg = builders[bid];
  const tam = tamanhoSelecionado[bid];
  if(!tam){ alert('Escolha um tamanho'); return; }

  const base = [...document.querySelectorAll(`[data-group="${bid}-base"]:checked`)].map(i => i.value);
  const recheio = [...document.querySelectorAll(`[data-group="${bid}-recheio"]:checked`)].map(i => i.value);
  const cobEl = cfg.cobertura ? document.querySelector(`input[name="${bid}-cob"]:checked`) : null;

  if(base.length === 0){ alert('Escolha pelo menos 1 base'); return; }
  if(recheio.length === 0){ alert('Escolha pelo menos 1 recheio'); return; }
  if(cfg.cobertura && !cobEl){ alert('Escolha uma cobertura'); return; }

  const extraCount = cfg.recheioExtra ? Math.max(0, recheio.length - cfg.recheioMax) : 0;
  const preco = tam.preco + (extraCount * (cfg.recheioExtra || 0));

  const partes = [];
  if(base.length) partes.push('Base: ' + base.join(', '));
  if(recheio.length) partes.push('Recheio: ' + recheio.join(', '));
  if(cobEl) partes.push('Cobertura: ' + cobEl.value);

  const uid = [
    bid, tam.id,
    base.slice().sort().join('+'),
    recheio.slice().sort().join('+'),
    cobEl ? cobEl.value : ''
  ].join('|');

  if(carrinho[uid]){
    carrinho[uid].qtd++;
  } else {
    carrinho[uid] = {
      item: {
        nome: `${cfg.titulo} ${tam.label}`,
        preco: preco,
        emoji: '🍇',
        desc: partes.join(' · '),
      },
      qtd: 1,
    };
  }

  atualizarTudo();
  openAddedModal(uid);

  delete tamanhoSelecionado[bid];
  renderBuilder(bid);
}

function addItem(id){
  const item = findItem(id);
  if(!carrinho[id]) carrinho[id] = { item, qtd:0 };
  carrinho[id].qtd++;
  refreshRowControl(id);
  atualizarTudo();
  openAddedModal(id);
}
function mudarQtdRow(id, delta, ev){
  ev.stopPropagation();
  if(!carrinho[id]) return;
  carrinho[id].qtd += delta;
  if(carrinho[id].qtd <= 0) delete carrinho[id];
  refreshRowControl(id);
  atualizarTudo();
}
function refreshRowControl(id){
  const ctrl = document.getElementById('ctrl-' + id);
  if(!ctrl) return;
  if(carrinho[id] && carrinho[id].qtd > 0){
    ctrl.innerHTML = `
      <span style="display:flex; align-items:center; gap:8px;">
        <button class="add-btn filled" onclick="mudarQtdRow('${id}', -1, event)">−</button>
        <span class="qty-tag">${carrinho[id].qtd}</span>
        <button class="add-btn filled" onclick="mudarQtdRow('${id}', 1, event)">+</button>
      </span>
    `;
  } else {
    ctrl.innerHTML = `<button class="add-btn" onclick="event.stopPropagation(); addItem('${id}')">+</button>`;
  }
}

function mudarQtd(id, delta){
  if(!carrinho[id]) return;
  carrinho[id].qtd += delta;
  if(carrinho[id].qtd <= 0) delete carrinho[id];
  refreshRowControl(id);
  atualizarTudo();
}

function atualizarTudo(){ renderCarrinho(); renderFab(); }
function totalCarrinho(){ return Object.values(carrinho).reduce((s,l)=> s + l.item.preco*l.qtd, 0); }
function qtdCarrinho(){ return Object.values(carrinho).reduce((s,l)=> s + l.qtd, 0); }

function renderFab(){
  const qtd = qtdCarrinho();
  document.getElementById('cartCount').textContent = qtd;
  document.getElementById('cartFab').classList.toggle('show', qtd > 0);
}

function renderCarrinho(){
  const body = document.getElementById('drawerBody');
  const linhas = Object.entries(carrinho);
  if(linhas.length === 0){
    body.innerHTML = `<div class="empty-cart"><div class="emoji">🍇</div><p>Seu carrinho tá vazio.<br>Bora montar um açaí?</p></div>`;
  } else {
    body.innerHTML = linhas.map(([id, l])=>`
      <div class="cart-line">
        <div class="info">
          <h4>${l.item.emoji} ${l.item.nome}</h4>
          <div class="unit">${fmt(l.item.preco)} cada</div>
          ${l.item.desc ? `<div class="unit" style="margin-top:3px;">${l.item.desc}</div>` : ''}
        </div>
        <div class="qty-control">
          <button onclick="mudarQtd('${id}', -1)">−</button>
          <span>${l.qtd}</span>
          <button onclick="mudarQtd('${id}', 1)">+</button>
        </div>
        <div class="line-total">${fmt(l.item.preco * l.qtd)}</div>
      </div>
    `).join('');
  }
  const subtotal = totalCarrinho();
  const total = linhas.length ? subtotal + FRETE : subtotal;
  document.getElementById('sumSubtotal').textContent = fmt(subtotal);
  document.getElementById('sumFrete').textContent = linhas.length ? fmt(FRETE) : fmt(0);
  document.getElementById('sumTotal').textContent = fmt(total);
  atualizarCheckoutBtn();
}

function onEnderecoChange(){
  atualizarCheckoutBtn();
}

function atualizarCheckoutBtn(){
  const linhas = Object.keys(carrinho).length;
  const endereco = document.getElementById('enderecoInput').value.trim();
  document.getElementById('checkoutBtn').disabled = linhas === 0 || endereco === '';
}

function openDrawer(){ document.getElementById('drawer').classList.add('show'); document.getElementById('overlay').classList.add('show'); }
function closeDrawer(){ document.getElementById('drawer').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); }

let addedModalId = null;

function openAddedModal(id){
  addedModalId = id;
  const linha = carrinho[id];
  if(!linha) return;
  document.getElementById('addedTitle').textContent = `${linha.item.nome} adicionado ao carrinho!`;
  document.getElementById('addedQtd').textContent = linha.qtd;
  document.getElementById('addedModal').classList.add('show');
  document.getElementById('addedOverlay').classList.add('show');
}

function closeAddedModal(){
  document.getElementById('addedModal').classList.remove('show');
  document.getElementById('addedOverlay').classList.remove('show');
  addedModalId = null;
}

function mudarQtdModal(delta){
  const id = addedModalId;
  if(!id || !carrinho[id]) return;
  carrinho[id].qtd += delta;
  if(carrinho[id].qtd <= 0){
    delete carrinho[id];
    closeAddedModal();
    atualizarTudo();
    refreshRowControl(id);
    return;
  }
  document.getElementById('addedQtd').textContent = carrinho[id].qtd;
  refreshRowControl(id);
  atualizarTudo();
}

function irParaCarrinho(){
  closeAddedModal();
  openDrawer();
}



function dentroDoHorario(){
  const agora = getAgoraNaLoja();
  const dia = agora.getDay();
  const horaDecimal = agora.getHours() + agora.getMinutes() / 60;
  const cfg = getHorarioDoDia(dia);
  return horaDecimal >= cfg.abre && horaDecimal < cfg.fecha;
}

function finalizarPedido(){
  const linhas = Object.values(carrinho);
  if(linhas.length === 0) return;

  if(!dentroDoHorario()){
    const agora = getAgoraNaLoja();
    const cfg = getHorarioDoDia(agora.getDay());
    alert(`Estamos fechados agora 😔\nFuncionamos das ${formatHora(cfg.abre)} às ${formatHora(cfg.fecha)}.`);
    return;
  }

  const endereco = document.getElementById('enderecoInput').value.trim();
  if(!endereco){ alert('Preencha o endereço de entrega'); return; }

  let msg = "Oi! Quero fazer um pedido💜\n\n";
  linhas.forEach(l=>{
    msg += `• ${l.qtd}x ${l.item.nome} — ${fmt(l.item.preco * l.qtd)}\n`;
    if(l.item.desc){ msg += `   ${l.item.desc}\n`; }
  });
  const subtotal = totalCarrinho();
  const total = subtotal + FRETE;
  msg += `\nSubtotal: ${fmt(subtotal)}`;
  msg += `\nTaxa de entrega: ${fmt(FRETE)}`;
  msg += `\nTotal: ${fmt(total)}`;
  msg += `\n\nMeu endereço: ${endereco}`;
  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`, '_blank');
}

function toggleBairros(){ document.getElementById('bairrosList').classList.toggle('show'); }

document.querySelectorAll('.cat-pill').forEach(pill=>{
  pill.addEventListener('click', ()=>{
    document.querySelectorAll('.cat-pill').forEach(p=>p.classList.remove('active'));
    pill.classList.add('active');
    document.getElementById(pill.dataset.target).scrollIntoView({behavior:'smooth'});
  });
});

renderCardapio();
renderFab();
updateStatusLoja();
setInterval(updateStatusLoja, 60 * 1000);
