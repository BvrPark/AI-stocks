let portfolioData=[];

document.addEventListener("DOMContentLoaded",()=>{
loadPortfolio();
});


async function loadPortfolio(){

try{

const data=await getPortfolio();

portfolioData=data.holdings||[];

renderPortfolio(portfolioData);
updatePortfolioSummary(data);

}catch(error){

console.log("포트폴리오 데이터 대기");

renderEmptyPortfolio();

}

}


function renderPortfolio(data){

const container=document.getElementById("portfolio-list");

if(!container)return;


if(!data||data.length===0){

renderEmptyPortfolio();
return;

}


container.innerHTML=data.map(item=>{

const profit=item.currentPrice*item.quantity-item.averagePrice*item.quantity;

const rate=((item.currentPrice-item.averagePrice)/item.averagePrice)*100;


return `
<tr>
<td>${item.symbol}</td>
<td>${formatNumber(item.quantity)}</td>
<td>${formatMoney(item.averagePrice)}</td>
<td>${formatMoney(item.currentPrice)}</td>
<td class="${profit>=0?"positive":"negative"}">${formatMoney(profit)}</td>
<td class="${rate>=0?"positive":"negative"}">${formatPercent(rate)}</td>
</tr>
`;

}).join("");

}



function renderEmptyPortfolio(){

const container=document.getElementById("portfolio-list");

if(!container)return;

container.innerHTML=`
<tr>
<td colspan="6">
API 연결 후 보유 종목이 표시됩니다.
</td>
</tr>
`;

}



function updatePortfolioSummary(data){

if(!data)return;

setValue(
"account-total-value",
formatMoney(data.totalValue)
);

setValue(
"account-buy-value",
formatMoney(data.buyValue)
);

setValue(
"account-cash",
formatMoney(data.cash)
);

}



function setValue(id,value){

const element=document.getElementById(id);

if(element){
element.textContent=value||"-";
}

}
