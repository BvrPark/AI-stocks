let trades=[];

const TRADE_KEY="wafer-trades";


document.addEventListener("DOMContentLoaded",()=>{
loadTrades();
});



async function loadTrades(){

try{

const data=await getTrades();

trades=data||[];

renderTrades();

}catch(error){

trades=JSON.parse(localStorage.getItem(TRADE_KEY)||"[]");

renderTrades();

}

}



function renderTrades(){

const tbody=document.getElementById("trade-list");

if(!tbody)return;


if(trades.length===0){

tbody.innerHTML=`
<tr>
<td colspan="5">등록된 매매 기록이 없습니다.</td>
</tr>
`;

return;

}


tbody.innerHTML=trades.map(item=>`

<tr>
<td>${item.date||"-"}</td>
<td>${item.symbol||"-"}</td>
<td>${item.type||"-"}</td>
<td class="${item.returnRate>=0?"positive":"negative"}">
${formatPercent(item.returnRate)}
</td>
<td>${item.memo||"-"}</td>
</tr>

`).join("");

}




function addTrade(trade){

trades.push({
...trade,
id:Date.now()
});

localStorage.setItem(
TRADE_KEY,
JSON.stringify(trades)
);

renderTrades();

}




function deleteTrade(id){

trades=
trades.filter(
item=>item.id!==id
);

localStorage.setItem(
TRADE_KEY,
JSON.stringify(trades)
);

renderTrades();

}



function getTradeSummary(){

const total=trades.length;

const profitCount=
trades.filter(
item=>item.returnRate>0
).length;


return{

total,

winRate:
total===0
?0
:(profitCount/total)*100

};

}
