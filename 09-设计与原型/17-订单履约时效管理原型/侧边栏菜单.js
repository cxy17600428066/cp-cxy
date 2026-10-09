(function(){
 const acceptance=document.getElementById('navAcceptance');
 if(!acceptance||document.getElementById('navReceipts'))return;
 const receipt=document.createElement('a');
 receipt.id='navReceipts';
 receipt.className='sla-nav-item';
 receipt.dataset.group='receipts';
 receipt.href='发货时效预警策略.html#receipts';
 receipt.innerHTML='<svg class="sla-nav-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg><span>回执单列表</span>';
 acceptance.after(receipt);
 const afterSales=document.createElement('a');
 afterSales.id='navAfterSales';
 afterSales.className='sla-nav-item';
 afterSales.dataset.group='after-sales';
 afterSales.href='发货时效预警策略.html#after-sales';
 afterSales.innerHTML='<svg class="sla-nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10a4 4 0 0 1 4 4v1M7 7l3-3M7 7l3 3M17 17H7a4 4 0 0 1-4-4v-1m14 5-3-3m3 3-3 3"/></svg><span>售后时效管理</span>';
 receipt.after(afterSales);
})();
