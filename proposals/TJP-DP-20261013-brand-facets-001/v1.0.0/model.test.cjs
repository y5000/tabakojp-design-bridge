const assert=require('node:assert/strict');const {query}=require('./model.js');
const all=query({q:'日本香煙'});assert.equal(all.total,6);assert.equal(all.items.length,4);assert.deepEqual(all.facets.map(f=>f.count),[2,3,1]);
const b=query({q:'日本香煙',brand:'B'});assert.equal(b.total,3);assert(b.items.every(p=>p.brand==='B'));assert.deepEqual(b.facets,all.facets);
assert.equal(query({q:'不存在'}).total,0);assert.throws(()=>query({q:'日本香煙',brand:'X'}),{code:'INVALID_BRAND'});
assert.equal(query({q:'日本香煙',page:2}).items.length,2);assert.equal(query({q:'日本香煙',brand:'B',page:2}).page,1);assert.equal(query({q:'日本香煙',sort:'name-desc'}).items[0].name,'Selection 01');console.log('PASS: global facets, brand membership, empty, invalid, pagination, sort');
