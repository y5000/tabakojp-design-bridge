/* Fictional public fixtures only. No network, stock, price, account or cart writes. */
(function(root){
const catalog=[
{id:1,name:'Original 01',brand:'A',brandName:'品牌 A',category:'日本香煙',description:'原味 · 盒裝'},
{id:2,name:'Original 02',brand:'A',brandName:'品牌 A',category:'日本香煙',description:'原味 · 盒裝'},
{id:3,name:'Classic 01',brand:'B',brandName:'品牌 B',category:'日本香煙',description:'經典 · 盒裝'},
{id:4,name:'Classic 02',brand:'B',brandName:'品牌 B',category:'日本香煙',description:'經典 · 盒裝'},
{id:5,name:'Classic 03',brand:'B',brandName:'品牌 B',category:'日本香煙',description:'經典 · 盒裝'},
{id:6,name:'Selection 01',brand:'C',brandName:'品牌 C',category:'日本香煙',description:'精選 · 盒裝'},
{id:7,name:'Accessory 01',brand:'C',brandName:'品牌 C',category:'配件',description:'配件 · 示範商品'}];
function query({q='',brand='',page=1,pageSize=4,sort='name'}={}){
const matching=catalog.filter(p=>(p.name+' '+p.brandName+' '+p.category).toLowerCase().includes(q.trim().toLowerCase()));
const facets=[...new Set(matching.map(p=>p.brand))].map(id=>({id,label:matching.find(p=>p.brand===id).brandName,count:matching.filter(p=>p.brand===id).length}));
if(brand&&!facets.some(f=>f.id===brand))throw Object.assign(new Error('品牌不在此搜尋範圍'),{code:'INVALID_BRAND'});
let items=matching.filter(p=>!brand||p.brand===brand).sort((a,b)=>sort==='name-desc'?b.name.localeCompare(a.name):a.name.localeCompare(b.name));
const total=items.length, pages=Math.max(1,Math.ceil(total/pageSize));page=Math.min(Math.max(1,page),pages);
return {items:items.slice((page-1)*pageSize,page*pageSize),total,unfilteredTotal:matching.length,facets,page,pages};
}
const api={catalog,query};if(typeof module!=='undefined')module.exports=api;root.BrandDemo=api;
})(typeof window==='undefined'?globalThis:window);
