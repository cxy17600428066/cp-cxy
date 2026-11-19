function activeFundingVersions(history, current, date) {
  const byId = new Map();
  for (const row of [...(history || []), ...current]) {
    if (row.status !== 'active' || row.from > date || row.to < date) continue;
    if ((byId.get(row.id)?.version || 0) < row.version) byId.set(row.id, row);
  }
  return [...byId.values()];
}

function matchSaleFunding(input) {
  const f = state.funding;
  let rules = activeFundingVersions(f.ruleVersions, f.rules, input.date)
    .filter(r => (r.customer === '*' || r.customer === input.customer) &&
      (r.sku === '*' || r.sku === input.sku));
  const exact=rules.filter(r=>r.sku===input.sku);if(exact.length)rules=exact;
  if (rules.length !== 1) throw Error(rules.length ? '资金获取规则冲突，请保证唯一匹配。' : '未匹配有效资金获取规则，请检查业务日期、客户及 SKU。');
  const links = activeFundingVersions(f.bindingVersions, f.bindings, input.date)
    .filter(l => l.customer === input.customer && (!input.policyId || l.policyId === input.policyId));
  if (links.length !== 1) throw Error('客户资金策略缺失或冲突，请选择销售所属的有效合同项目。');
  const link = links[0], configured = rules[0];
  const rule = configured.pool === CONTRACT_POOL ? {...configured,pool:link.sourcePool,byContract:true} : configured;
  const policy = state.policySchemes.find(p => p.id === link.policyId && p.status === 'active' &&
    p.customer === input.customer && p.from <= input.date && p.to >= input.date);
  if (!policy || link.sourcePool !== rule.pool) throw Error('客户政策、来源池与获取规则不一致，请核对。');
  const pool = f.pools.find(p => p.id === rule.pool);
  if (pool?.status !== 'active' || pool.kind !== 'operating' || pool.from > input.date || pool.to < input.date) throw Error('目标资金池在业务日不可用于销售获取。');
  return clone({rule:rule.method==='policy'?{...rule,rate:policy.total}:rule, link:salePackageLink(link), policy});
}

function fundingTrialQuote(t, net) {
  const input = {customer:t.customer, policyId:t.policyId, date:t.fundingDate || state.funding.date,
    sku:t.fundingSku || 'TGX-DEMO-001', qty:t.fundingQty ?? 1};
  const key = JSON.stringify([input.customer, input.policyId, input.date, input.sku]);
  try {
    if (t.check !== 'valid') throw Error('请先解决政策校验异常。');
    const match = t.fundingSnapshot?.key === key ? t.fundingSnapshot.match : matchSaleFunding(input);
    const amount = earningAmount(match.rule, net, input.qty);
    return {amount, snapshot:{key, match}, rule:match.rule};
  } catch (error) { return {error:error.message}; }
}

function trialFundingFields(t) {
  return ff('trialFundingDate','签收业务日',t.fundingDate || state.funding.date,'date','required') +
    ff('trialFundingSku','销售 SKU',t.fundingSku || 'TGX-DEMO-001','text','required') +
    ff('trialFundingQty','净签收数量（已扣退货）',t.fundingQty ?? 1,'number','min="0" step="0.01" required');
}

function trialFundingSummary(t, v) {
  const q = fundingTrialQuote(t,v.net);
  if (q.error) return `<div class="banner warn">预计资金获取待确认 · ${esc(q.error)}</div>`;
  t.fundingSnapshot = q.snapshot;
  const gap = v.total - q.amount;
  return `<h3>签收行总贡献预测</h3><div class="keyval"><span>按获取规则预计${q.rule.timing==='instant'?'即时入池':'期间核验入池'}</span><strong>${money(q.amount)}</strong></div>
    <p class="note">${esc(q.rule.name)} · ${esc(q.rule.id)} / V${q.rule.version} · ${esc(q.rule.pool)}。${gap ? '合同测算额'+(gap>0?'高于':'低于')+'预计获取额 '+money(Math.abs(gap))+'。' : '合同测算额与预计获取额一致。'}计提后先预留客户费用，剩余金额满足合同条件时才可用于活动。</p><p class="note">合同返利条款快照：${clauseList(q.snapshot.match.link).map(x=>esc(x.clauseCode)+'（'+({primary:'主条款',stack:'可叠加',choice:'签收择一'})[x.stackMode]+'）').join('、')}。试算不累计权益。</p><button type="button" data-trial-funding-refresh>按当前生效规则重新匹配</button>`;
}

function validateReceipt(input, match) {
  const receipt = (input.receipt || '').trim(), receiptLine = (input.receiptLine ?? '1').trim();
  const rows = state.funding.sales.filter(s => s.kind === 'sale');
  const sameOrder = rows.filter(s => s.doc === input.doc && s.line === input.line);
  if (!receipt) {
    if (sameOrder.length) throw Error('同一订单行已签收，不能重复计提。分批签收须从首批填写签收单号及订单数量。');
    return {};
  }
  if (!receiptLine || rows.some(s => s.receipt === receipt && s.receiptLine === receiptLine)) throw Error('签收单行为空或已处理，不能重复计提。');
  const orderedQty = Number(input.orderedQty);
  if (!Number.isFinite(orderedQty) || orderedQty <= 0 || input.qty <= 0) throw Error('分批签收请填写正数订单数量和本次签收数量。');
  if (sameOrder.some(s => !s.receipt || s.orderedQty !== orderedQty || s.customer !== input.customer ||
      s.policy.contract !== match.policy.contract || s.sku !== input.sku)) throw Error('同一订单行的客户、合同、SKU 和订单数量须一致。');
  const signed = sum(sameOrder.map(s => Math.round(s.qty * 100))) + Math.round(input.qty * 100);
  if (signed > Math.round(orderedQty * 100)) throw Error('累计签收数量超过订单行数量。');
  return {receipt, receiptLine, orderedQty};
}

function rebateTerms(l) {
  return JSON.stringify([l.rebateMethod || 'rate', l.rebateMethod === 'tier' ? [l.tierMode,l.tiers] : l.rebateRate]);
}

function strategyEpoch(old, next, choice) {
  if (!old || (old.redeemMode||'direct')!==(next.redeemMode||'direct') || old.sourcePool !== next.sourcePool || old.rebateTiming !== next.rebateTiming) return next.version;
  if (rebateTerms(old) === rebateTerms(next)) return old.accumulationVersion || old.version;
  if (!choice) throw Error('返利计算口径有变化，请选择本期承接或分段累计。');
  return choice === 'carry' ? old.accumulationVersion || old.version : next.version;
}

function setFundingEpochs(old, next, choice) {
  const previous = old.policyId === next.policyId ? old : null; if (!choice && ![...state.funding.sales,...(state.funding.openingRights||[])].some(s=>s.link.id===old.id)) choice='split';
  next.accumulationVersion = strategyEpoch(previous, next, choice);
  for (const x of next.strategies) {
    const before = previous?.strategies?.find(p => p.id === x.id);
    x.accumulationVersion = strategyEpoch(before && {...before, version:old.version}, {...x, version:next.version}, choice);
  }
}

function applyCurrentRebateTerms(group, f) {
  const cutoff = group.period.end < f.date ? group.period.end : f.date;
  const epoch = group.link.accumulationVersion || group.link.version;
  for (const config of [...(f.bindingVersions || []), ...f.bindings]) {
    if (config.version <= group.version || config.customer !== group.customer || config.from > cutoff ||
        fundPeriod(config.to, group.link.rebateTiming).end < group.period.end) continue;
    const next = fundingStrategyLinks({link:config}).find(x => x.id === group.link.id &&
      x.policyId === group.link.policyId && (x.accumulationVersion || x.version) === epoch);
    if (next && (!group.link.packageTerms||group.link.redeemMode===(next.redeemMode||'direct'))) {
      if(group.link.packageTerms){next.packageTerms=true;next.lockEarly=true;next.redeemMode=group.link.redeemMode}else if(next.redeemMode){continue}
      group.link = next;
      group.version = next.version;
    }
  }
}

function batchBalance(b, groups = fundingGroups()) {
  const f = state.funding;
  const ledger = f.transfers.filter(t => t.batch === b.id);
  const adjusted = -sum(ledger.filter(t => t.amount < 0).map(t => t.amount));
  const paid = sum(f.payouts.filter(p => p.batch === b.id).map(p => p.amount));
  const remaining = Math.max(0,b.amount - paid - adjusted);
  const deficit = Math.max(0,-(groups.find(g => g.key === b.key)?.delta || 0));
  return {paid, adjusted, remaining, deficit, payable:deficit ? 0 : remaining};
}

function correctRebateBatch(id, amount, ref, recovery) {
  requireFundingFinance();
  const f = state.funding, b = f.batches.find(b => b.id === id && b.kind === 'rebate' && b.status === 'approved');
  if (!b) throw Error('请选择已批准的返利批次。');
  ref = ref.trim();
  if (!ref || f.transfers.some(t => t.adjustRef === ref) || f.payouts.some(p => p.ref === ref)) throw Error('请填写唯一的调整凭证号，不能重复回写。');
  const v = batchBalance(b);
  const unpaid = Math.min(v.remaining,v.deficit);
  const groupUnpaid = sum(f.batches.filter(x => x.key===b.key && x.kind==='rebate' && x.status==='approved').map(x => batchBalance(x).remaining));
  const limit = recovery ? Math.min(v.paid, Math.max(0,v.deficit-groupUnpaid)) : unpaid;
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > limit) throw Error('调整金额超过本批次可冲销或已收回的待追偿金额。');
  const original = f.transfers.find(t => t.batch === id && t.amount > 0);
  if (!original) throw Error('找不到原始划拨流水。');
  const openUsed = sum(f.transfers.filter(t => t.batch === id).map(t => t.openingConsumed || 0));
  const unadjusted = b.amount - v.adjusted;
  const restore = Math.max(0, amount - (unadjusted - openUsed));
  const reversal = {id:nextId('TRANSFER-',f.transfers), batch:id, group:b.key, source:b.pool, target:b.targetPool,
    customer:b.customer, date:f.date, amount:-amount, openingConsumed:-restore, reverses:original.id, adjustRef:ref};
  if (recovery) f.payouts.push({id:nextId('REBATE-PAY-',f.payouts),batch:id,pool:b.targetPool,customer:b.customer,
    amount:-amount,ref,method:'recovery',date:f.date});
  f.transfers.push(reversal);
  b.logs.push({who:'finance',action:recovery?'已追回并冲回来源池':'未付返利冲回来源池',note:ref+' / '+money(amount),date:f.date});
}
