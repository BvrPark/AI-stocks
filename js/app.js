document.addEventListener("DOMContentLoaded",initApp);

async function initApp(){
initializeMenu();
initializeButtons();
updateDate();
await checkApiStatus();
await loadDashboard();
}

function initializeMenu(){
const menus=document.querySelectorAll(".menu-item");

menus.forEach(menu=>{
menu.addEventListener("click",()=>{
menus.forEach(item=>item.classList.remove("active"));
menu.classList.add("active");
});
});
}

function initializeButtons(){
const refresh=document.getElementById("refresh-button");

if(refresh){
refresh.addEventListener("click",async()=>{
await loadDashboard();
});
}
}

async function checkApiStatus(){
const status=document.getElementById("sidebar-api-status");
const dot=document.getElementById("sidebar-api-dot");

try{
const result=await checkTossConnection();

if(status) status.textContent="연결 완료";
if(dot) dot.style.background="#16a34a";

}catch(error){

if(status) status.textContent="연결 필요";
if(dot) dot.style.background="#ef4444";

}
}

async function loadDashboard(){

try{

if(typeof loadPortfolio==="function"){
await loadPortfolio();
}

if(typeof loadTrades==="function"){
await loadTrades();
}

await loadAccount();

}catch(error){
console.error(error);
}

}

async function loadAccount(){

try{

const data=await getAccount();

setText("account-total-value",formatMoney(data.totalValue));
setText("account-buy-value",formatMoney(data.buyValue));
setText("account-cash",formatMoney(data.cash));
setText("account-profit",formatMoney(data.profit));
setText("account-return",formatPercent(data.returnRate));

}catch(error){
console.log("계좌 데이터 대기");
}

}

async function loadMarketData(){

try{

const data=await apiRequest("market");

setText("vix-value",data.vix);
setText("nasdaq-value",data.nasdaq);
setText("fear-greed-value",data.fearGreed);
setText("exchange-value",data.exchange);

}catch(error){
console.log("시장 데이터 대기");
}

}

function setText(id,value){

const element=document.getElementById(id);

if(element){
element.textContent=value??"-";
}

}

function updateDate(){

const element=document.querySelector(".date");

if(element){
element.textContent=new Date().toLocaleDateString("ko-KR");
}

}
