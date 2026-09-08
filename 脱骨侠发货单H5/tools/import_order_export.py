"""Read an OMS export without modifying it; generate the local page's data snapshot."""
import json
import re
import warnings
from collections import Counter
from datetime import datetime
from decimal import Decimal
from pathlib import Path
import pandas as pd

SOURCE = Path(r'C:\Users\admin\Downloads\订单列表.xls')
OUTPUT = Path(__file__).resolve().parents[1] / '订单数据.js'

def cents(value):
    return int((Decimal(str(value or '0')) * 100).quantize(Decimal('1')))

def numeric(value):
    return float(value) if value else None

def unique(frame, column):
    return list(dict.fromkeys(v for v in frame[column] if v))

def text(frame, column):
    return ' / '.join(unique(frame, column))

with warnings.catch_warnings():
    warnings.simplefilter('ignore')
    workbook = pd.ExcelFile(SOURCE, engine='openpyxl')
    sheet_name = workbook.sheet_names[0]
    frame = pd.read_excel(workbook, sheet_name=sheet_name, dtype=str).fillna('')
assert not (frame['订单编号'] == '').any(), 'Missing order identifier'
orders = []
for order_id, lines in frame.groupby('订单编号', sort=False):
    for field in ['订单状态', '接单状态', '财务审核状态', '财务审核时间', '接单时间', '下单时间']:
        assert lines[field].nunique() == 1, f'Conflicting {field}: {order_id}'
    status, audit, accept = (text(lines, c) for c in ['订单状态', '财务审核状态', '接单状态'])
    if status == '已取消':
        node = 'cancelled'
    elif status == '已发货':
        node = 'unassigned'
    elif audit != '已审批':
        node = 'finance'
    elif accept != '已接单':
        node = 'accept'
    elif status == '待发货':
        node = 'ship'
    else:
        node = 'unassigned'
    products = []
    for row_number, row in lines.iterrows():
        products.append({
            'row': int(row_number) + 2, 'name': row['商品名称'], 'sku': row['商品编码'],
            'jointSku': row['联合编码'], 'wdtSku': row['旺店通规格编号'],
            'spec': row['商品规格信息'], 'unit': row['单位'], 'qty': numeric(row['数量']),
            'giftQty': numeric(row['搭赠数量']), 'totalQty': numeric(row['总数量']),
            'price': numeric(row['单价']), 'lineCents': cents(row['合计金额']),
            'totalCents': cents(row['总金额']), 'dueCents': cents(row['应付金额']),
            'tags': [part for part in row['商品规格信息'].split('-') if part],
        })
    start_column = {'finance': '下单时间', 'accept': '财务审核时间', 'ship': '接单时间'}.get(node)
    orders.append({
        'id': order_id, 'parentId': text(lines, '主订单编码'), 'nodeId': node,
        'createdAt': text(lines, '下单时间'), 'startAt': text(lines, start_column) if start_column else None,
        'orderStatus': status, 'auditStatus': audit, 'acceptStatus': accept,
        'auditAt': text(lines, '财务审核时间'), 'acceptAt': text(lines, '接单时间'),
        'auditBy': text(lines, '财务审核人'), 'acceptBy': text(lines, '接单人'),
        'paidAt': text(lines, '付款时间'), 'payStatus': text(lines, '支付状态'),
        'paymentReference': text(lines, '支付渠道金额'), 'invoiceStatus': text(lines, '开票状态'),
        'channel': text(lines, '订单来源'), 'type': text(lines, '订单类型'), 'creator': text(lines, '建单人'),
        'customer': text(lines, '客户名称'), 'customerGroup': text(lines, '集团客户名称'),
        'receiver': text(lines, '收件人'), 'phone': text(lines, '电话'), 'address': text(lines, '收件人详细地址'),
        'salesperson': text(lines, '销售人员'), 'shippingNote': text(lines, '发货备注'),
        'merchantNote': text(lines, '商家备注'), 'buyerNote': text(lines, '买家备注'),
        'warehouse': text(lines, '仓库名称'),
        'waybills': sorted(set(v.strip() for value in lines['物流单号'] for v in re.split('[,，]', value) if v.strip())),
        'shipments': sorted(set(v.strip() for value in lines['发货单号'] for v in re.split('[,，]', value) if v.strip())),
        'totalCents': sum(p['totalCents'] for p in products), 'dueCents': sum(p['dueCents'] for p in products),
        'products': products,
    })
assert len(orders) == frame['订单编号'].nunique()
assert sum(len(o['products']) for o in orders) == len(frame)
assert sum(o['totalCents'] for o in orders) == sum(cents(v) for v in frame['总金额'])
assert sum(o['dueCents'] for o in orders) == sum(cents(v) for v in frame['应付金额'])
payload = {
    'sourceName': SOURCE.name, 'sourceSheet': sheet_name,
    'asOf': datetime.fromtimestamp(SOURCE.stat().st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
    'asOfBasis': '导入文件修改时间（固定快照，不代表实时状态）',
    'orderCount': len(orders), 'lineCount': len(frame),
    'totalCents': sum(o['totalCents'] for o in orders), 'dueCents': sum(o['dueCents'] for o in orders),
    'createdFrom': frame['下单时间'].min(), 'createdTo': frame['下单时间'].max(), 'orders': orders,
}
encoded = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
OUTPUT.write_text('window.OMS_IMPORT = ' + encoded + ';\n', encoding='utf-8')
print(json.dumps({k: v for k, v in payload.items() if k != 'orders'}, ensure_ascii=False))
print(json.dumps(dict(Counter(o['nodeId'] for o in orders)), ensure_ascii=False))
