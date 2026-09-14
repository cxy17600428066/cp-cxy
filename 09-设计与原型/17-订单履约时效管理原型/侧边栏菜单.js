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
})();
