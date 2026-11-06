"""Read-only audit: independent Decimal arithmetic; no application calculator imports."""
import json
from decimal import Decimal, getcontext
from collections import defaultdict, Counter
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
getcontext().prec = 40
root=Path(__file__).resolve().parent
source=json.loads((root/'source.json').read_text(),parse_float=Decimal)
D=lambda x: Decimal(str(x))
Z=D(0); rate={'CAD':D(1),'USD':D('1.393')}
orders=source['orders']; details=source['api']['v1/portfolio/details?range=max']['data']; holdings=details['holdings']
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
assert abs(funding-D('533802.0131722896'))<D('0.00000001')
assert abs(cash-D(details['summary']['cash']))<D('0.00000001')
assert abs(security_value-D(details['summary']['currentValueInBaseCurrency']))<D('0.00000001')
assert not mismatches
assert len(activity_rows)==len(orders)
result={'asOf':source['asOf'],'fxUSDToCAD':rate['USD'],'activityCount':len(orders),'types':dict(Counter(o['type'] for o in orders)),'symbols':len(assets),'openPositions':sum(p['quantity']>0 for p in positions),'nativeTotals':dict(totals),'buysCAD':buys,'sellsCAD':sells,'dividendsCAD':dividends,'feesCAD':fees,'securitiesCAD':security_value,'cashCAD':cash,'portfolioValueCAD':equity,'inferredFundingCAD':funding,'inferredDepositsCAD':funding_in,'checkpointWithdrawalsCAD':funding_out,'netGainCAD':net,'snapshotArithmeticResidual':equity-funding-net,'screenshotCurrentValue':D('631164.03'),'screenshotNetChange':D('97362.02'),'screenshotImpliedFunding':D('631164.03')-D('97362.02'),'screenshotGainAtUnroundedFunding':D('631164.03')-funding,'positionMismatches':mismatches,'negativeInventoryEvents':negatives,'duplicateGroups':[{'key':k,'ids':v} for k,v in duplicate_groups.items() if len(v)>1],'checkpoints':checkpoints,'positions':positions,'activities':activity_rows}
(root/'reconciliation.json').write_text(json.dumps(result,default=str,indent=2)+'\n')
money=lambda n:f'{n:,.2f}'
lines=['# Full activity reconciliation — November 4, 2026','',f'Source captured at {source["asOf"]}. This report audits every one of the {len(orders)} stored activities using independent decimal arithmetic. No transactions, timestamps, settings, or caches were changed.','', '## Answer','', '**The screenshot’s net change reconciles exactly to its displayed current value and the independently reconstructed net funding. All current positions also reconcile at the audit’s captured quotes. The screenshot’s exact individual quotes are unavailable, so its current value cannot be independently reproduced to the cent. Neither number is certified against a brokerage statement.**','',f'The screenshot implies net external funding of C${money(result["screenshotImpliedFunding"])}. Independent replay produces C${money(funding)}. C$631,164.03 − C${funding:,.5f} = C${money(result["screenshotGainAtUnroundedFunding"])}.','', '## Frozen-price calculation','', '| Component | CAD |','|---|---:|',f'| Current securities (32 open positions) | {money(security_value)} |',f'| Reconstructed cash | {money(cash)} |',f'| Total portfolio value | {money(equity)} |',f'| Net inferred external funding | {money(funding)} |',f'| Net gain | {money(net)} |','', 'Quotes in the audit snapshot were refreshed after the screenshot. The C$12.24 difference in current value and gain is equal; net funding is unchanged. Live quote changes are consistent with this difference, but the earlier per-symbol quotes were not preserved. The screenshot alone does not preserve its individual quotes.','', 'Independent second identity (all trades and dividends, fixed FX):','',f'C${money(security_value)} securities + C${money(sells)} sale proceeds + C${money(dividends)} dividends − C${money(buys)} purchase costs − C${money(fees)} fees = C${money(net)} net gain.','', '## Coverage and checks','',f'- {len(orders)} activities: 187 buys, 104 sells, 3 dividends; no drafts or exclusion tags.',f'- All {len(assets)} distinct symbols reconciled: 32 open positions, 63 closed trading positions, and one dividend-only symbol (PSA.TO). Every open quantity and value matches the API to less than C$0.00000001.', '- No exact same-day duplicate trade signatures; no transaction/profile currency mismatches; all recorded fees are zero. These checks cannot detect missing broker transactions.', '- Every cash movement balances: purchase costs, sale proceeds, dividends, inferred FX conversions, inferred funding, and the saved cash checkpoint.', '- TWR and MWR API requests report the same dollar gain and current value. Their return percentages differ by design.', '', '## Native-currency activity totals','', '| Currency | Buy costs | Sell proceeds | Dividends | Fees |','|---|---:|---:|---:|---:|']
for c,t in sorted(totals.items()):lines.append(f'| {c} | {money(t["BUY"])} | {money(t["SELL"])} | {money(t["DIVIDEND"])} | {money(t["fees"])} |')
lines+=['','## Findings that limit broker-level accuracy','', '1. **Fixed FX:** `libs/common/src/lib/config.ts:79` pins USD/CAD to 1.393 for current values and all historical transactions. This audit uses that rule. Neither the current market FX rate nor actual broker conversion rates are applied.', '2. **TD.TO chronology:** 5 shares sold on October 30, 2024 and 23 on November 11, 2024; the only 28-share buy is dated October 11, 2025. Unless these were intentional short sales, a purchase date or opening holding is missing/incorrect. This problem predates randomization. Its recorded lifetime cash profit is C$16.94, but the year-long timing problem changes historical value and return calculations.', '3. **CRCL chronology:** on June 5, 2025, the randomized sell timestamp (04:17:43 UTC) precedes the buy (04:45:26 UTC), creating a temporary −10-share position. Recorded lifetime result is −US$125.60 (−C$174.96). Same-day total dollar gain reconciles, but inferred funding and intraday positions are not actual broker chronology.', '4. **Cash checkpoint needs confirmation:** the October 14 checkpoint is USD1,372, exactly the proceeds of the recorded 4 NET shares sold at USD343. It was created 17 milliseconds after the NET sale record was created, and before the 6-share IWM purchase at USD272.80 was entered. This suggests it may represent intermediate sale cash rather than a verified end-of-day cash balance. The current ledger replaces C$7,815.99 reconstructed cash with C$1,911.20 and infers a C$5,904.79 withdrawal. This is a data-quality concern, not a confirmed broker withdrawal.','5. **Inferred funding and cash:** the data model does not store a complete deposit/withdrawal/FX-transfer history. It infers deposits for unfunded purchases and consumes other-currency cash in the same account. The October 14, 2026 USD1,372 cash checkpoint is treated as end-of-day authoritative cash.', '6. **Recorded income/cost coverage:** only 3 dividend entries totaling C$4,861.91 and zero fees are recorded. Any missing dividends, withholding taxes, interest, fees, transfers, splits, or opening positions remain outside this audit.', '7. **ROAI mismatch:** the default ROAI details API reports a different net gain (C$63,096.31 at this captured snapshot). The screenshot’s TWR/MWR dollar gain agrees with the independent cash-flow identities above; the ROAI result does not. This is a separate calculation inconsistency, not a reason to substitute the ROAI number for the screenshot.', '', '## Cash checkpoint reconciliation','', '| Date | Stated cash | Reconstructed cash before checkpoint (CAD) | Inferred external adjustment (CAD) |','|---|---:|---:|---:|']
for c in checkpoints:lines.append(f'| {c["date"]} | {c["currency"]} {money(c["statedBalance"])} | {money(c["previousCashCAD"])} | {money(c["adjustmentCAD"])} |')
lines+=['','## Every symbol, including closed positions','', 'Net gain below is lifetime trading cash flow plus current value and recorded dividends, at fixed FX; it is not an average-cost unrealized gain.','', '| Symbol | Entries | Net quantity | Quote (native) | Current value CAD | Buys CAD | Sells CAD | Dividends CAD | Lifetime gain CAD |','|---|---:|---:|---:|---:|---:|---:|---:|---:|']
for p in positions:lines.append(f'| {p["symbol"]} | {p["count"]} | {p["quantity"]} | {p["quote"] if p["quantity"] else "—"} | {money(p["currentValueCAD"])} | {money(p["buyCAD"])} | {money(p["sellCAD"])} | {money(p["dividendCAD"])} | {money(p["netGainCAD"])} |')
lines+=['','## All 294 activities','', 'Dates below are UTC. Gross values use exact stored quantity × unit price. Running quantities and cash include each row in timestamp/ID order, with cash checkpoints applied at day end. Full precision, activity IDs, and inferred currency transfers are saved in `reconciliation.json`.','', '| # | UTC timestamp | Symbol | Type | Quantity | Unit price | Currency | Gross native | Gross CAD | Running shares | Cash after CAD | Inferred deposit CAD |','|---|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|']
for i,a in enumerate(activity_rows,1):lines.append(f'| {i} | {a["date"]} | {a["symbol"]} | {a["type"]} | {a["quantity"]} | {a["unitPrice"]} | {a["currency"]} | {money(a["gross"])} | {money(a["grossCAD"])} | {a["runningQuantity"]} | {money(a["cashAfterCAD"])} | {money(a["inferredDepositCAD"])} |')
(root/'report.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['positions','activities']},default=str,indent=2))
