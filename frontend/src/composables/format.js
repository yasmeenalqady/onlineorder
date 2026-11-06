export const money=v=>new Intl.NumberFormat('en-SA',{style:'currency',currency:'SAR'}).format(Number(v))
export const date=v=>new Intl.DateTimeFormat('en-SA',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))
export const statuses={pending:'Order received',preparing:'Preparing',ready:'Ready for pickup',delivered:'Delivered',cancelled:'Cancelled'}
export const transitions={pending:['preparing','cancelled'],preparing:['ready','cancelled'],ready:['delivered','cancelled'],delivered:[],cancelled:[]}
