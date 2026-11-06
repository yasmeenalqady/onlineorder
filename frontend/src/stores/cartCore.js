export function itemCents(i){return Math.round(Number(i.price)*100)*i.quantity}
export function totalCents(items){return items.reduce((sum,i)=>sum+itemCents(i),0)}
export function clampQuantity(q){return Math.max(1,Math.min(20,Math.trunc(Number(q)||1)))}
