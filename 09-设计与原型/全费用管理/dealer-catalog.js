// 从用户指定页面提取的19类演示规则，保留类型、公式与口径。
const dealerCatalog=[
  {
    "id": "STR-001",
    "kind": "采购返利",
    "name": "核心经销商季度采购返利",
    "rule": "净采购15万元，命中2%档，全额返利3,000元。",
    "note": "鼓励核心渠道持续补货。按季度净采购额确定返利档位，退货后重算；本期按活动有效日期截取统计。",
    "route": "rebate",
    "stage": "期间达成核验",
    "fields": [
      [
        "threshold1",
        "第一档门槛（元）",
        50000
      ],
      [
        "rate1",
        "第一档比例 %",
        1
      ],
      [
        "threshold2",
        "第二档门槛（元）",
        100000
      ],
      [
        "rate2",
        "第二档比例 %",
        2
      ],
      [
        "threshold3",
        "第三档门槛（元）",
        200000
      ],
      [
        "rate3",
        "第三档比例 %",
        3
      ],
      [
        "mode",
        "全额0 / 分段1",
        0
      ],
      [
        "cap",
        "累计封顶（元）",
        20000
      ]
    ],
    "inputs": [
      [
        "amount",
        "期间净采购额（元）",
        150000
      ]
    ],
    "params": {
      "threshold1": 50000,
      "rate1": 1,
      "threshold2": 100000,
      "rate2": 2,
      "threshold3": 200000,
      "rate3": 3,
      "mode": 0,
      "cap": 20000
    },
    "values": {
      "amount": 150000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "按条件筛选",
      "sRegion": "华东",
      "sLevel": "核心经销商",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "20000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sName": "核心经销商季度采购返利",
      "sNote": "鼓励核心渠道持续补货。按季度净采购额确定返利档位，退货后重算；本期按活动有效日期截取统计。",
      "test": 150000,
      "example": "净采购15万元，命中2%档，全额返利3,000元。",
      "tiers": [
        {
          "min": 50000,
          "rate": 1
        },
        {
          "min": 100000,
          "rate": 2
        },
        {
          "min": 200000,
          "rate": 3
        }
      ]
    },
    "version": 1
  },
  {
    "id": "STR-002",
    "kind": "进货折扣",
    "name": "新经销商首单进货折扣",
    "rule": "首单商品净额3万元，享95折，优惠1,500元，实付28,500元。",
    "note": "仅首次有效采购订单参与，单笔商品净额满1万元享95折。优惠在订单中直接抵扣；奖励方式、回款及后返结算字段不适用。",
    "route": "price",
    "stage": "订单定价",
    "fields": [
      [
        "discount",
        "折扣（折）",
        9.5
      ],
      [
        "minimum",
        "起享金额（元）",
        10000
      ],
      [
        "cap",
        "单笔封顶（元）",
        2000
      ]
    ],
    "inputs": [
      [
        "amount",
        "首次订单商品净额（元）",
        30000
      ]
    ],
    "params": {
      "discount": 9.5,
      "minimum": 10000,
      "cap": 2000
    },
    "values": {
      "amount": 30000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "按条件筛选",
      "sRegion": "全部区域",
      "sLevel": "新经销商",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "指定品类",
      "sProducts": "品牌主推产品,门店配套产品",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "9.5",
      "sCondition": "10000",
      "sCap": "2000",
      "sReward": "账户余额",
      "sSettle": "审核后结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sName": "新经销商首单进货折扣",
      "sNote": "仅首次有效采购订单参与，单笔商品净额满1万元享95折。优惠在订单中直接抵扣；奖励方式、回款及后返结算字段不适用。",
      "test": 30000,
      "example": "首单商品净额3万元，享95折，优惠1,500元，实付28,500元。"
    },
    "version": 1
  },
  {
    "id": "STR-003",
    "kind": "回款奖励",
    "name": "提前15天回款奖励",
    "rule": "符合提前15天条件的回款20万元，奖励2,000元。",
    "note": "对指定经销商提前至少15天到账的合格回款，按实际到账金额奖励1%；以合同到期日与银行到账日核验。",
    "route": "rebate",
    "stage": "期间达成核验",
    "fields": [
      [
        "rate",
        "奖励比例 %",
        1
      ],
      [
        "days",
        "至少提前天数",
        15
      ],
      [
        "cap",
        "封顶（元）",
        5000
      ]
    ],
    "inputs": [
      [
        "amount",
        "实际回款（元）",
        200000
      ],
      [
        "days",
        "实际提前天数",
        15
      ]
    ],
    "params": {
      "rate": 1,
      "days": 15,
      "cap": 5000
    },
    "values": {
      "amount": 200000,
      "days": 15
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "指定经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "D0001,D0008,D0016",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "15",
      "sCap": "5000",
      "sReward": "现金返还",
      "sSettle": "月度结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "可与其他类型策略叠加",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sName": "提前15天回款奖励",
      "sNote": "对指定经销商提前至少15天到账的合格回款，按实际到账金额奖励1%；以合同到期日与银行到账日核验。",
      "test": 200000,
      "example": "符合提前15天条件的回款20万元，奖励2,000元。"
    },
    "version": 1
  },
  {
    "id": "STR-004",
    "kind": "动销奖励",
    "name": "新品终端动销激励",
    "rule": "核验售出800件 × 5元 = 4,000元，受上限限制，奖励3,000元。",
    "note": "指定新品每件奖励5元；以核验通过的终端销售件数计提，退货商品对应奖励扣回。",
    "route": "activity",
    "stage": "履约凭证核销",
    "fields": [
      [
        "reward",
        "每件奖励（元）",
        5
      ],
      [
        "cap",
        "封顶（元）",
        3000
      ]
    ],
    "inputs": [
      [
        "quantity",
        "凭证核验件数",
        800
      ]
    ],
    "params": {
      "reward": 5,
      "cap": 3000
    },
    "values": {
      "quantity": 800
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "按条件筛选",
      "sRegion": "华南",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "指定商品",
      "sProducts": "TGX-NEW-001,TGX-NEW-002",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "5",
      "sCondition": "提交终端订单、支付凭证和商品序列号；同一序列号仅核销一次",
      "sCap": "3000",
      "sReward": "货补额度",
      "sSettle": "审核后结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "可与其他类型策略叠加",
      "sPriority": "10",
      "sReturn": "退货订单奖励全额扣回",
      "sApprover": "李敏 · 渠道负责人",
      "sName": "新品终端动销激励",
      "sNote": "指定新品每件奖励5元；以核验通过的终端销售件数计提，退货商品对应奖励扣回。",
      "test": 800,
      "example": "核验售出800件 × 5元 = 4,000元，受上限限制，奖励3,000元。"
    },
    "version": 1
  },
  {
    "id": "STR-005",
    "kind": "市场补贴",
    "name": "门店推广费用支持",
    "rule": "核验费用8,000元 × 50% = 4,000元，封顶补贴3,000元。",
    "note": "审核通过的市场活动费用补贴50%，单经销商活动期累计不超过3,000元；同一费用凭证不得重复报销。采购回款和商品退货规则不适用，撤销凭证需扣回补贴。",
    "route": "activity",
    "stage": "履约凭证核销",
    "fields": [
      [
        "rate",
        "补贴比例 %",
        50
      ],
      [
        "cap",
        "封顶（元）",
        3000
      ]
    ],
    "inputs": [
      [
        "amount",
        "合规核销费用（元）",
        8000
      ]
    ],
    "params": {
      "rate": 50,
      "cap": 3000
    },
    "values": {
      "amount": 8000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "指定经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "D0021,D0025",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "50",
      "sCondition": "已审批门店活动的物料制作与场地费用，提供发票、活动照片及付款凭证",
      "sCap": "3000",
      "sReward": "现金返还",
      "sSettle": "审核后结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sName": "门店推广费用支持",
      "sNote": "审核通过的市场活动费用补贴50%，单经销商活动期累计不超过3,000元；同一费用凭证不得重复报销。采购回款和商品退货规则不适用，撤销凭证需扣回补贴。",
      "test": 8000,
      "example": "核验费用8,000元 × 50% = 4,000元，封顶补贴3,000元。"
    },
    "version": 1
  },
  {
    "id": "STR-006",
    "kind": "满额减免",
    "name": "整单采购满额立减",
    "rule": "单笔满2万元减800元，不循环",
    "note": "按扣除商品优惠后的净额判断门槛；下单直接减免。",
    "route": "price",
    "stage": "订单定价",
    "fields": [
      [
        "threshold",
        "起减金额（元）",
        20000
      ],
      [
        "discount",
        "每次减免（元）",
        800
      ],
      [
        "repeat",
        "循环满减（0否 / 1是）",
        0
      ]
    ],
    "inputs": [
      [
        "amount",
        "订单商品净额（元）",
        45000
      ]
    ],
    "params": {
      "threshold": 20000,
      "discount": 800,
      "repeat": 0
    },
    "values": {
      "amount": 45000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "按扣除商品优惠后的净额判断门槛；下单直接减免。"
    },
    "version": 1
  },
  {
    "id": "STR-007",
    "kind": "买赠 / 满赠",
    "name": "整箱采购买100赠5",
    "rule": "每买100箱赠5箱，单笔最多20箱",
    "note": "赠品为 TGX-GIFT-001 同款整箱；赠品库存不足时须人工确认，不折现。",
    "route": "physical",
    "stage": "领用出退库",
    "fields": [
      [
        "quantity",
        "每档购买数量（箱）",
        100
      ],
      [
        "gift",
        "每档赠送数量（箱）",
        5
      ],
      [
        "maxGift",
        "单笔赠送上限（箱）",
        20
      ]
    ],
    "inputs": [
      [
        "quantity",
        "实际采购数量（箱）",
        260
      ]
    ],
    "params": {
      "quantity": 100,
      "gift": 5,
      "maxGift": 20
    },
    "values": {
      "quantity": 260
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "赠品为 TGX-GIFT-001 同款整箱；赠品库存不足时须人工确认，不折现。"
    },
    "version": 1
  },
  {
    "id": "STR-008",
    "kind": "组合采购优惠",
    "name": "品牌主推产品组合采购",
    "rule": "A、B商品各50件为一组，每组减600元",
    "note": "按完整组合计提；剩余商品不参与，优惠不得超过组合商品实际净额。",
    "route": "price",
    "stage": "订单定价",
    "fields": [
      [
        "a",
        "A商品每组数量（件）",
        50
      ],
      [
        "b",
        "B商品每组数量（件）",
        50
      ],
      [
        "reward",
        "每组优惠（元）",
        600
      ]
    ],
    "inputs": [
      [
        "a",
        "TGX-MAIN-001采购件数",
        120
      ],
      [
        "b",
        "TGX-MAIN-002采购件数",
        80
      ]
    ],
    "params": {
      "a": 50,
      "b": 50,
      "reward": 600
    },
    "values": {
      "a": 120,
      "b": 80
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "按完整组合计提；剩余商品不参与，优惠不得超过组合商品实际净额。"
    },
    "version": 1
  },
  {
    "id": "STR-009",
    "kind": "采购增长奖励",
    "name": "季度采购增长奖励",
    "rule": "同比上季度增长≥20%，增长部分返2%",
    "note": "比较相邻完整季度，同口径扣除退货；有效期设为四季度，基期为三季度。",
    "route": "rebate",
    "stage": "期间达成核验",
    "fields": [
      [
        "growth",
        "最低增长率（%）",
        20
      ],
      [
        "rate",
        "增长部分奖励（%）",
        2
      ]
    ],
    "inputs": [
      [
        "base",
        "上季度净采购额（元）",
        100000
      ],
      [
        "current",
        "本季度净采购额（元）",
        150000
      ]
    ],
    "params": {
      "growth": 20,
      "rate": 2
    },
    "values": {
      "base": 100000,
      "current": 150000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "比较相邻完整季度，同口径扣除退货；有效期设为四季度，基期为三季度。"
    },
    "version": 1
  },
  {
    "id": "STR-010",
    "kind": "连续采购奖励",
    "name": "连续三个月稳定采购奖励",
    "rule": "连续3个月每月满2万元，奖励1000元",
    "note": "每月均按净采购核验；任一月未达标则连续月份清零。",
    "route": "rebate",
    "stage": "期间达成核验",
    "fields": [
      [
        "months",
        "连续月份数",
        3
      ],
      [
        "minimum",
        "每月最低采购（元）",
        20000
      ],
      [
        "reward",
        "达成一次奖励（元）",
        1000
      ]
    ],
    "inputs": [
      [
        "months",
        "已连续达标月份数",
        3
      ]
    ],
    "params": {
      "months": 3,
      "minimum": 20000,
      "reward": 1000
    },
    "values": {
      "months": 3
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "每月均按净采购核验；任一月未达标则连续月份清零。"
    },
    "version": 1
  },
  {
    "id": "STR-011",
    "kind": "年度目标奖励",
    "name": "年度百万目标奖励",
    "rule": "年度满100万元奖1万元，超额部分再返1%",
    "note": "按自然年度累计，回款核验后结算；与季度返利是否叠加按第四步设置。",
    "route": "rebate",
    "stage": "期间达成核验",
    "fields": [
      [
        "target",
        "年度采购目标（元）",
        1000000
      ],
      [
        "reward",
        "达标固定奖励（元）",
        10000
      ],
      [
        "extra",
        "超额部分奖励（%）",
        1
      ]
    ],
    "inputs": [
      [
        "amount",
        "年度净采购额（元）",
        1200000
      ]
    ],
    "params": {
      "target": 1000000,
      "reward": 10000,
      "extra": 1
    },
    "values": {
      "amount": 1200000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "按自然年度累计，回款核验后结算；与季度返利是否叠加按第四步设置。"
    },
    "version": 1
  },
  {
    "id": "STR-012",
    "kind": "运费补贴",
    "name": "区域配送运费补贴",
    "rule": "单笔满5000元补实际运费，最高200元",
    "note": "仅华东指定线路，须提供物流账单，不含二次配送及异常附加费。",
    "route": "activity",
    "stage": "履约凭证核销",
    "fields": [
      [
        "minimum",
        "订单起补金额（元）",
        5000
      ],
      [
        "rate",
        "实付运费补贴（%）",
        100
      ],
      [
        "limit",
        "单笔运费补贴上限（元）",
        200
      ]
    ],
    "inputs": [
      [
        "amount",
        "订单商品净额（元）",
        8000
      ],
      [
        "freight",
        "核验实付运费（元）",
        260
      ]
    ],
    "params": {
      "minimum": 5000,
      "rate": 100,
      "limit": 200
    },
    "values": {
      "amount": 8000,
      "freight": 260
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "仅华东指定线路，须提供物流账单，不含二次配送及异常附加费。"
    },
    "version": 1
  },
  {
    "id": "STR-013",
    "kind": "新品试销支持",
    "name": "新品首批试销与换货支持",
    "rule": "首批限100件享9折，30天内可申请20%等值换货",
    "note": "仅 TGX-NEW-003；换货须包装完好且未经销售。换货是权益额度，不计现金返利。",
    "route": "price",
    "stage": "订单定价",
    "fields": [
      [
        "limit",
        "首批优惠数量上限（件）",
        100
      ],
      [
        "discount",
        "首批采购折扣（折）",
        9
      ],
      [
        "exchange",
        "原价等值换货比例（%）",
        20
      ],
      [
        "days",
        "换货申请期限（天）",
        30
      ]
    ],
    "inputs": [
      [
        "quantity",
        "首批采购件数",
        80
      ],
      [
        "price",
        "单件采购原价（元）",
        100
      ],
      [
        "days",
        "签收后天数",
        20
      ]
    ],
    "params": {
      "limit": 100,
      "discount": 9,
      "exchange": 20,
      "days": 30
    },
    "values": {
      "quantity": 80,
      "price": 100,
      "days": 20
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "仅 TGX-NEW-003；换货须包装完好且未经销售。换货是权益额度，不计现金返利。"
    },
    "version": 1
  },
  {
    "id": "STR-014",
    "kind": "库存价保 / 调换支持",
    "name": "官方降价库存价保",
    "rule": "降价后15天内，按核验库存及单价差补差",
    "note": "仅官方调价前已采购且未售出的库存；须核对批次及采购凭证，不含已获其他价保补偿商品。",
    "route": "activity",
    "stage": "履约凭证核销",
    "fields": [
      [
        "days",
        "降价后申请期限（天）",
        15
      ]
    ],
    "inputs": [
      [
        "old",
        "原采购单价（元）",
        100
      ],
      [
        "new",
        "官方调整后单价（元）",
        90
      ],
      [
        "stock",
        "核验可保护库存（件）",
        200
      ],
      [
        "days",
        "降价后已过天数",
        7
      ]
    ],
    "params": {
      "days": 15
    },
    "values": {
      "old": 100,
      "new": 90,
      "stock": 200,
      "days": 7
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "仅官方调价前已采购且未售出的库存；须核对批次及采购凭证，不含已获其他价保补偿商品。"
    },
    "version": 1
  },
  {
    "id": "STR-015",
    "kind": "陈列奖励",
    "name": "门店标准陈列月度奖励",
    "rule": "每店每月陈列审核通过奖500元",
    "note": "须满足专属陈列面积、物料及位置要求，并提交带时间和门店信息的照片；每店每月限一次。",
    "route": "activity",
    "stage": "履约凭证核销",
    "fields": [
      [
        "reward",
        "每店每月奖励（元）",
        500
      ]
    ],
    "inputs": [
      [
        "stores",
        "本月审核通过门店数",
        6
      ]
    ],
    "params": {
      "reward": 500
    },
    "values": {
      "stores": 6
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "须满足专属陈列面积、物料及位置要求，并提交带时间和门店信息的照片；每店每月限一次。"
    },
    "version": 1
  },
  {
    "id": "STR-016",
    "kind": "经销商推荐奖励",
    "name": "推荐新渠道首单回款奖励",
    "rule": "推荐新经销商首单满1万元并回款，奖励800元/人",
    "note": "注册前绑定唯一推荐关系；同一主体不能自荐，首单退货后不达标则扣回奖励。",
    "route": "activity",
    "stage": "履约凭证核销",
    "fields": [
      [
        "minimum",
        "被推荐人最低首单（元）",
        10000
      ],
      [
        "reward",
        "每位有效推荐奖励（元）",
        800
      ],
      [
        "limit",
        "活动期有效推荐人数上限",
        10
      ]
    ],
    "inputs": [
      [
        "people",
        "首单及全额回款均核验通过人数",
        4
      ]
    ],
    "params": {
      "minimum": 10000,
      "reward": 800,
      "limit": 10
    },
    "values": {
      "people": 4
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "注册前绑定唯一推荐关系；同一主体不能自荐，首单退货后不达标则扣回奖励。"
    },
    "version": 1
  },
  {
    "id": "STR-017",
    "kind": "沉默经销商激活",
    "name": "90天沉默经销商回归礼",
    "rule": "未购90天，邀请后15天内首单满1万元减500元",
    "note": "按最近一次有效采购日期判断沉默状态，取消及全额退货订单不作为有效采购。",
    "route": "price",
    "stage": "订单定价",
    "fields": [
      [
        "silent",
        "最低未购天数",
        90
      ],
      [
        "window",
        "邀请后有效天数",
        15
      ],
      [
        "minimum",
        "回归首单门槛（元）",
        10000
      ],
      [
        "discount",
        "首单减免（元）",
        500
      ]
    ],
    "inputs": [
      [
        "silent",
        "邀请前未采购天数",
        100
      ],
      [
        "days",
        "邀请后下单天数",
        10
      ],
      [
        "amount",
        "回归首单商品净额（元）",
        12000
      ]
    ],
    "params": {
      "silent": 90,
      "window": 15,
      "minimum": 10000,
      "discount": 500
    },
    "values": {
      "silent": 100,
      "days": 10,
      "amount": 12000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "按最近一次有效采购日期判断沉默状态，取消及全额退货订单不作为有效采购。"
    },
    "version": 1
  },
  {
    "id": "STR-018",
    "kind": "合同扣点",
    "name": "年度经销合同扣点",
    "rule": "合同约定净结算额扣点3%，按月核算",
    "note": "演示合同 TGX-HT-2026-001；扣点从应付经销商结算款中扣除，基数采用已核验含税净结算额，扣除退货、不含运费。实际扣款方向及口径以合同为准。",
    "route": "deduction",
    "stage": "合同结算扣款",
    "fields": [
      [
        "rate",
        "合同扣点比例（%）",
        3
      ]
    ],
    "inputs": [
      [
        "amount",
        "本期合同结算基数（元）",
        100000
      ]
    ],
    "params": {
      "rate": 3
    },
    "values": {
      "amount": 100000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "演示合同 TGX-HT-2026-001；扣点从应付经销商结算款中扣除，基数采用已核验含税净结算额，扣除退货、不含运费。实际扣款方向及口径以合同为准。"
    },
    "version": 1
  },
  {
    "id": "STR-019",
    "kind": "年返",
    "name": "年度净采购阶梯返利",
    "rule": "年度满50万/100万/200万元，全额返1%/2%/3%",
    "note": "按自然年度含税商品净采购额累计，扣除退货及订单优惠、不含运费；年终核对并完成回款后结算。采用达档全额返利，已结算年返须扣除；与季度返利是否同享需在方案中明确。",
    "route": "rebate",
    "stage": "期间达成核验",
    "fields": [
      [
        "threshold1",
        "第一档年度净采购门槛（元）",
        500000
      ],
      [
        "rate1",
        "第一档返利比例（%）",
        1
      ],
      [
        "threshold2",
        "第二档年度净采购门槛（元）",
        1000000
      ],
      [
        "rate2",
        "第二档返利比例（%）",
        2
      ],
      [
        "threshold3",
        "第三档年度净采购门槛（元）",
        2000000
      ],
      [
        "rate3",
        "第三档返利比例（%）",
        3
      ]
    ],
    "inputs": [
      [
        "amount",
        "年度累计净采购额（元）",
        1200000
      ],
      [
        "settled",
        "本年度已结算年返（元）",
        5000
      ]
    ],
    "params": {
      "threshold1": 500000,
      "rate1": 1,
      "threshold2": 1000000,
      "rate2": 2,
      "threshold3": 2000000,
      "rate3": 3
    },
    "values": {
      "amount": 1200000,
      "settled": 5000
    },
    "sourceConfig": {
      "sOwner": "陈晓 · 渠道运营",
      "sStart": "2026-11-01",
      "sEnd": "2026-12-31",
      "sScope": "全部经销商",
      "sRegion": "全部区域",
      "sLevel": "全部等级",
      "sDealers": "",
      "sExclude": "D0099",
      "sProductScope": "全部商品",
      "sProducts": "",
      "sProductExclude": "SKU-CLEAR-001",
      "sPeriod": "季度累计",
      "sMode": "whole",
      "sBasis": "含税商品净额（不含运费）",
      "sValue": "1",
      "sCondition": "",
      "sCap": "10000",
      "sReward": "账户余额",
      "sSettle": "周期结束后次月结算",
      "sPayment": "完成全额回款后结算",
      "sStack": "不叠加，同类策略择优",
      "sPriority": "10",
      "sReturn": "重算达标档位并扣回差额",
      "sApprover": "李敏 · 渠道负责人",
      "sNote": "按自然年度含税商品净采购额累计，扣除退货及订单优惠、不含运费；年终核对并完成回款后结算。采用达档全额返利，已结算年返须扣除；与季度返利是否同享需在方案中明确。"
    },
    "version": 1
  }
];
const dealerFormulas={"STR-001":(p,v)=>{const t=[{min:p.threshold1,rate:p.rate1},{min:p.threshold2,rate:p.rate2},{min:p.threshold3,rate:p.rate3}];let n=0;if(!p.mode){n=v.amount*(t.filter(x=>v.amount>=x.min).at(-1)?.rate||0)/100}else t.forEach((x,i)=>n+=Math.max(0,Math.min(v.amount,t[i+1]?.min??v.amount)-x.min)*x.rate/100);return[Math.min(n,p.cap),'元','按全额或分段阶梯，扣除退货后核算；封顶控制']},
"STR-002":(p,v)=>[v.amount>=p.minimum?Math.min(v.amount*(1-p.discount/10),p.cap):0,'元价格让利','仅首次有效采购订单，需核验首单资格'],
"STR-003":(p,v)=>[v.days>=p.days?Math.min(v.amount*p.rate/100,p.cap):0,'元','按实际回款及提前天数核验'],
"STR-004":(p,v)=>[Math.min(Math.floor(v.quantity)*p.reward,p.cap),'元','序列号和终端凭证核验后确认'],
"STR-005":(p,v)=>[Math.min(v.amount*p.rate/100,p.cap),'元','核销合规费用比例，受封顶控制'],
"STR-006":(p,v)=>{const times=v.amount>=p.threshold?(p.repeat?Math.floor(v.amount/p.threshold):1):0;return [Math.min(v.amount,times*p.discount),'元',times+'次 × '+p.discount+'元']},
"STR-007":(p,v)=>[Math.min(p.maxGift,Math.floor(v.quantity/p.quantity)*p.gift),'箱赠品',Math.floor(v.quantity/p.quantity)+'档 × '+p.gift+'箱，受赠送上限控制'],
"STR-008":(p,v)=>{const n=Math.min(Math.floor(v.a/p.a),Math.floor(v.b/p.b));return [n*p.reward,'元',n+'个完整组合 × '+p.reward+'元']},
"STR-009":(p,v)=>{if(v.base<=0)return [0,'元','基期为0时不计算增长奖励，需另行制定新客政策'];const g=(v.current-v.base)/v.base*100;return [g>=p.growth?Math.max(0,v.current-v.base)*p.rate/100:0,'元','增长率'+g.toFixed(1)+'%；仅对增长部分计奖']},
"STR-010":(p,v)=>[v.months>=p.months?p.reward:0,'元',v.months>=p.months?'连续达标，本活动只奖励一次':'尚未连续达标；中断后重新累计'],
"STR-011":(p,v)=>[v.amount>=p.target?p.reward+(v.amount-p.target)*p.extra/100:0,'元',v.amount>=p.target?'达标固定奖励 + 超额部分奖励':'年度目标尚未完成'],
"STR-012":(p,v)=>[v.amount>=p.minimum?Math.min(v.freight*p.rate/100,p.limit):0,'元',v.amount>=p.minimum?'按实际运费比例补贴，并受单笔上限限制':'未达到订单起补金额'],
"STR-013":(p,v)=>{const qty=Math.min(v.quantity,p.limit);const saving=qty*v.price*(1-p.discount/10);return [saving,'元优惠','限量优惠'+qty+'件；'+(v.days<=p.days?'最多可申请'+Math.floor(qty*p.exchange/100)+'件等值换货':'已超过换货申请期限')]},
"STR-014":(p,v)=>[v.days<=p.days?Math.max(0,v.old-v.new)*Math.floor(v.stock):0,'元',v.days<=p.days?'正向单价差 × 核验库存件数':'超出申请期限，不计补差'],
"STR-015":(p,v)=>[Math.floor(v.stores)*p.reward,'元',Math.floor(v.stores)+'家门店 × '+p.reward+'元'],
"STR-016":(p,v)=>[Math.min(Math.floor(v.people),p.limit)*p.reward,'元',Math.min(Math.floor(v.people),p.limit)+'位有效新经销商 × '+p.reward+'元'],
"STR-017":(p,v)=>[v.silent>=p.silent&&v.days<=p.window&&v.amount>=p.minimum?Math.min(p.discount,v.amount):0,'元','需同时满足沉默时长、邀请有效期、首单金额；每人限一次'],
"STR-018":(p,v)=>[v.amount*p.rate/100,'元','合同结算基数 × '+p.rate+'%；结算应付扣减，非额外现金奖励'],
"STR-019":(p,v)=>{const rate=v.amount>=p.threshold3?p.rate3:v.amount>=p.threshold2?p.rate2:v.amount>=p.threshold1?p.rate1:0;const entitlement=v.amount*rate/100;return [Math.max(0,entitlement-v.settled),'元','全年净采购额 × '+rate+'% = '+entitlement.toFixed(2)+'元；扣除已结算'+v.settled+'元。'+(v.settled>entitlement?'已结算超出应享金额，需另行核对扣回差额。':'')]}};
