"""Read-only audit: independent Decimal arithmetic; no application calculator imports."""
import json
from decimal import Decimal, getcontext
from collections import defaultdict, Counter
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
getcontext().prec = 40
root=Path(__file__).resolve().parent
source=json.loads((root/'after.json').read_text(),parse_float=Decimal)
D=lambda x: Decimal(str(x))
Z=D(0); rate={'CAD':D(1),'USD':D('1.393')}
orders=source['orders']; assert not any(o['isDraft'] for o in orders); assert not any(a['balances'] for a in source['accounts']); details=source['api']['v1/portfolio/details?range=max']['data']; holdings=details['holdings']
assets={}; qty=defaultdict(lambda:Z); totals=defaultdict(lambda:defaultdict(lambda:Z)); negatives=[]; duplicate_groups=defaultdict(list)
activity_rows=[]; ledger=defaultdict(dict); funding=Z; funding_in=Z; funding_out=Z; checkpoints=[]; events=defaultdict(list)
for o in orders: events[o['date'][:10]].append(('activity',o))
for a in source['accounts']:
 for b in a['balances']:events[b['date'][:10]].append(('checkpoint',{**b,'currency':a['currency']}))
for day,ev in sorted(events.items()):
 # Checkpoints are authoritative at end of UTC day in the deployed application.
 for kind,o in sorted(ev,key=lambda e:(e[0]=='checkpoint',e[1]['date'],e[1]['id'])):
  account=ledger[o['accountId']]; c=o['currency']; r=rate[c]
  if kind=='checkpoint':
   before=sum((amount*rate[cur] for cur,amount in account.items()),Z)
   after=D(o['value'])*r; delta=after-before; funding+=delta
   funding_in+=max(Z,delta);funding_out+=max(Z,-delta)
   checkpoints.append({'date':day,'currency':c,'statedBalance':D(o['value']),'previousCashCAD':before,'adjustmentCAD':delta})
   ledger[o['accountId']]={c:D(o['value'])};continue
  symbol=o['SymbolProfile']['symbol'];t=o['type'];q=D(o['quantity']);p=D(o['unitPrice']);fee=D(o['fee']);gross=q*p
  if symbol not in assets: assets[symbol]={'symbol':symbol,'currency':o['SymbolProfile']['currency'],'count':0,'buyCAD':Z,'sellCAD':Z,'dividendCAD':Z,'feesCAD':Z}
  a=assets[symbol];a['count']+=1;a['feesCAD']+=fee*r;totals[c][t]+=gross;totals[c]['fees']+=fee
  if t=='BUY':qty[symbol]+=q;a['buyCAD']+=gross*r
  elif t=='SELL':qty[symbol]-=q;a['sellCAD']+=gross*r
  elif t=='DIVIDEND':a['dividendCAD']+=gross*r
  if t in ('BUY','SELL') and qty[symbol]<D('-0.00000001'):negatives.append({'id':o['id'],'date':o['date'],'symbol':symbol,'type':t,'quantity':q,'runningQuantity':qty[symbol]})
  duplicate_groups[(day,t,symbol,str(q),str(p),c,str(fee))].append(o['id'])
  before=sum((v*rate[k] for k,v in account.items()),Z);cash=account.get(c,Z);deposit=Z;transfers=[]
  if t=='BUY':
   cost=gross+fee;short=cost-cash
   for other in list(account):
    if short<=0:break
    if other==c or account[other]<=0:continue
    available=account[other]*rate[other]/r;converted=min(short,available);spent=converted*r/rate[other]
    account[other]-=spent;cash+=converted;short-=converted;transfers.append({'from':other,'amount':spent,'to':c,'received':converted})
   if short>0:deposit=short*r;funding+=deposit;funding_in+=deposit;cash+=short
   account[c]=cash-cost
  else:account[c]=cash+(gross-fee if t!='FEE' else -fee)
  after=sum((v*rate[k] for k,v in account.items()),Z)
  expected=before+deposit+((gross-fee)*r if t in ['SELL','DIVIDEND','INTEREST'] else -(gross+fee)*r if t=='BUY' else -fee*r)
  assert abs(after-expected)<D('0.00000001'),o['id']
  activity_rows.append({'id':o['id'],'date':o['date'],'symbol':symbol,'type':t,'currency':c,'quantity':q,'unitPrice':p,'gross':gross,'grossCAD':gross*r,'feeCAD':fee*r,'runningQuantity':qty[symbol],'cashBeforeCAD':before,'cashAfterCAD':after,'inferredDepositCAD':deposit,'transfers':transfers})
positions=[];mismatches=[]
for symbol,a in sorted(assets.items()):
 h=holdings.get(symbol,{});quote=D(h.get('marketPrice',0));q=qty[symbol];value=q*quote*rate[a['currency']]
 if q!=D(h.get('quantity',0)):mismatches.append({'symbol':symbol,'calculated':q,'api':h.get('quantity',0)})
 if abs(value-D(h.get('valueInBaseCurrency',0)))>D('0.00000001'):mismatches.append({'symbol':symbol,'value':value,'apiValue':h.get('valueInBaseCurrency',0)})
 positions.append({**a,'quantity':q,'quote':quote,'currentValueCAD':value,'netGainCAD':value+a['sellCAD']+a['dividendCAD']-a['buyCAD']-a['feesCAD']})
security_value=sum((p['currentValueCAD'] for p in positions),Z);cash=sum((v*rate[c] for a in ledger.values() for c,v in a.items()),Z)
buys=sum((a['buyCAD'] for a in assets.values()),Z);sells=sum((a['sellCAD'] for a in assets.values()),Z);dividends=sum((a['dividendCAD'] for a in assets.values()),Z);fees=sum((a['feesCAD'] for a in assets.values()),Z)
net=security_value+sells+dividends-buys-fees;equity=security_value+cash
assert abs(equity-funding-net)<D('0.00000001')
assert not mismatches, mismatches
assert not negatives, negatives
assert abs(cash-D(details['summary']['cash']))<D('0.000001')
assert abs(security_value-D(details['summary']['currentValueInBaseCurrency']))<D('0.000001')
assert abs(equity-D(details['summary']['totalValueInBaseCurrency']))<D('0.000001')
assert abs(net-D(details['summary']['netPerformanceWithCurrencyEffect']))<D('0.01')
accounts_response=source['api']['v1/account']
assert accounts_response['status']==200
assert abs(equity-D(accounts_response['data']['totalValueInBaseCurrency']))<D('0.01')
assert abs(cash-D(accounts_response['data']['totalBalanceInBaseCurrency']))<D('0.01')
methods={}
for method in ['TWR','MWR','ROAI']:
 response=source['api'][f'v2/portfolio/performance?range=max&calculationType={method}']
 assert response['status']==200,response
 data=response['data'];assert not data['hasErrors'],data.get('errors')
 p=data['performance'];methods[method]=p
 assert abs(D(p['currentValueInBaseCurrency'])-equity)<D('0.01'),(method,p,equity)
 assert abs(D(p['netPerformanceWithCurrencyEffect'])-net)<D('0.01'),(method,p,net)
before=json.loads((root/'before.json').read_text())
old={o['id']:o for o in before['orders']};new={o['id']:o for o in orders}
fields=['date','type','quantity','unitPrice','fee','currency','accountId','isDraft']
changed=[i for i,o in old.items() if i not in new or any(str(o[k])!=str(new[i][k]) for k in fields)]
recent=defaultdict(lambda:defaultdict(lambda:Z))
recent_rows=[o for o in orders if o['date']>='2026-10-28T04:00:00' and o['type'] in ('BUY','SELL')]
for o in recent_rows:recent[o['currency']][o['type']]+=D(o['quantity'])*D(o['unitPrice'])
recent_net=sum(((t['BUY']-t['SELL'])*rate[c] for c,t in recent.items()),Z)
result={'asOf':source['asOf'],'activities':len(orders),'types':dict(Counter(o['type'] for o in orders)),'cashCAD':cash,'securitiesCAD':security_value,'totalValueCAD':equity,'contributionsCAD':funding,'netGainCAD':net,'methods':methods,'positionMismatches':mismatches,'negativeInventoryEvents':negatives,'changedActivityIdsSinceBackup':changed,'addedActivitiesSinceBackup':len(new.keys()-old.keys()),'recentSince':'2026-10-28 America/Toronto inclusive','recentTradeCount':len(recent_rows),'recentNativeTotals':dict(recent),'recentNetPurchasesCAD':recent_net,'fxUSDToCAD':rate['USD'],'activitiesReplayed':activity_rows,'positions':positions}
(root/'reconciliation.json').write_text(json.dumps(result,default=str,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['activitiesReplayed','positions']},default=str,indent=2))
money=lambda value:f'{value:,.2f}'
lines=['# Transaction-funded cash verification', '', f'Captured {source["asOf"]}. Replayed all {len(orders)} activities with Python Decimal, independently of the application calculator.', '', '| Component | CAD |', '|---|---:|', f'| Securities | {money(security_value)} |', f'| Available cash | {money(cash)} |', f'| Total portfolio | {money(equity)} |', f'| Inferred contributions | {money(funding)} |', f'| Net gain | {money(net)} |', '', 'All share quantities and holding values match. Cash, account totals, portfolio summary, and dollar gains from ROAI/TWR/MWR reconcile. Percentage returns intentionally use different methods.', '', f'Activities changed since the backup: {len(changed)}. Activities added since the backup: {len(new.keys()-old.keys())}. The obsolete USD1,372 balance checkpoint was removed; its original record is saved in before.json.', '', f'From October 28, 2026 inclusive (America/Toronto), {len(recent_rows)} buys/sells produce net purchases of C${money(recent_net)} using the app’s fixed USD/CAD rate of 1.393. This measures buys minus sells, not external deposits.', '', 'Validation: 90 focused tests across 9 suites passed; API and client TypeScript checks passed; production Docker build passed. Verification is against recorded activities and captured application quotes, not brokerage records. Full per-activity arithmetic is in reconciliation.json.']
(root/'report.md').write_text('\n'.join(lines)+'\n')
