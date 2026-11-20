(function(){
"use strict";
const TOTAL=40;
const BOARD_COLORS=[
  "blue","red","green","yellow","blue","red","green","yellow",
  "blue","yellow","green","blue","yellow","red","blue","green",
  "red","yellow","blue","green","yellow","blue","red","green",
  "blue","yellow","green","red","blue","yellow","green","blue",
  "yellow","blue","red","green","yellow","blue","red","green"
];
const SUBJECTS={
  red:{name:"history",article:"a"},
  blue:{name:"geography",article:"a"},
  green:{name:"political science",article:"a"},
  yellow:{name:"economics",article:"an"}
};
const LADDERS=[{from:5,to:22},{from:16,to:31},{from:27,to:38}];
const SNAKES=[{from:35,to:12},{from:23,to:8},{from:14,to:2}];
const GROUPS=[
  {letter:"A",color:"#f05a83"},
  {letter:"B",color:"#ffb42f"},
  {letter:"C",color:"#92c83e"},
  {letter:"D",color:"#58a8f4"}
];
const $=id=>document.getElementById(id);
const board=$("board"),tokenLayer=$("tokens-layer"),teamList=$("team-list");
const positionText=$("position"),turnText=$("turn"),activeChip=$("active-chip");
const teamCountSelect=$("team-count"),rollButton=$("roll"),resetButton=$("reset"),fullscreenButton=$("fullscreen");
const die=$("die"),diceNote=$("dice-note"),status=$("status"),dialog=$("history-dialog");
const closeButton=$("close-card"),cardTitle=$("history-title");
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
let teamCount=Number(teamCountSelect.value)||2;
let positions=[1,1,1,1],scores=[0,0,0,0],teamTokens=[],teamRows=[];
let activeTeam=0,turn=1,busy=false,focusBeforeCard=null,pendingAdvance=false,winnerIndex=null;

function groupName(index){return "Group "+GROUPS[index].letter}
function coords(n){
 if(n<=8)return{col:n-1,row:4};
 if(n<=16)return{col:16-n,row:3};
 if(n<=24)return{col:n-17,row:2};
 if(n<=32)return{col:32-n,row:1};
 return{col:n-33,row:0};
}
function tokenOffsets(count,index,spread){
 if(count===1)return[0,0];
 if(count===2)return[index===0?-spread:spread,0];
 if(count===3)return[[-spread,-spread*.8],[spread,-spread*.8],[0,spread*.8]][index];
 return[[-spread,-spread],[spread,-spread],[-spread,spread],[spread,spread]][index];
}
function createTokens(){
 tokenLayer.replaceChildren();teamTokens=[];
 for(let i=0;i<teamCount;i++){
  const group=GROUPS[i],token=document.createElement("div");
  token.className="player-token";token.setAttribute("role","img");token.dataset.group=group.letter;
  token.innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 5.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM23 27c-5 1-9 4-12 9L5 45c-2 3 0 7 4 7h8l5-7-3 11c-1 3 1 5 4 5h5l4-10 4 10h5c3 0 5-2 4-5l-3-11 5 7h8c4 0 6-4 4-7l-6-9c-3-5-7-8-12-9l-10 4Z" fill="'+group.color+'" stroke="#142638" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  tokenLayer.appendChild(token);teamTokens.push(token);
 }
 placeAllTokens();
}
function placeToken(index){
 const token=teamTokens[index];if(!token)return;
 const occupants=[];for(let i=0;i<teamCount;i++)if(positions[i]===positions[index])occupants.push(i);
 const p=coords(positions[index]),tile=Math.max(34,board.clientWidth/8);
 const size=Math.max(16,Math.min(44,tile*.36)),spread=Math.min(23,tile*.17);
 const [dx,dy]=tokenOffsets(occupants.length,occupants.indexOf(index),spread);
 token.style.width=size+"px";
 token.style.left="calc("+((p.col+.5)*12.5)+"% + "+dx+"px)";
 token.style.top="calc("+(.9+(p.row+.5)*19)+"% + "+dy+"px)";
 token.setAttribute("aria-label",groupName(index)+" token on square "+positions[index]);
 token.classList.toggle("is-active-turn",index===activeTeam&&winnerIndex===null);
}
function placeAllTokens(){for(let i=0;i<teamCount;i++)placeToken(i)}
function setPosition(index,n){positions[index]=n;placeAllTokens();refreshTeamPanel();updateCurrentPosition()}
function createTeamPanel(){
 teamList.replaceChildren();teamRows=[];
 for(let i=0;i<teamCount;i++){
  const group=GROUPS[i],row=document.createElement("div");
  row.className="team-row";row.style.setProperty("--team-color",group.color);
  row.innerHTML='<div class="team-info"><span class="team-swatch" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M32 5.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM23 27c-5 1-9 4-12 9L5 45c-2 3 0 7 4 7h8l5-7-3 11c-1 3 1 5 4 5h5l4-10 4 10h5c3 0 5-2 4-5l-3-11 5 7h8c4 0 6-4 4-7l-6-9c-3-5-7-8-12-9l-10 4Z"/></svg></span><span class="team-name"><strong>Group '+group.letter+'</strong><small>Square <b class="team-position">1</b></small></span></div><button class="score-button score-minus" type="button" aria-label="Subtract one point from Group '+group.letter+'">−1</button><output class="score-value" aria-label="Group '+group.letter+' points"><b>0</b><small>pts</small></output><button class="score-button score-plus-one" type="button" aria-label="Add one point to Group '+group.letter+'">+1</button><button class="score-button score-plus-five" type="button" aria-label="Add five points to Group '+group.letter+'">+5</button>';
  const minus=row.querySelector(".score-minus"),plusOne=row.querySelector(".score-plus-one"),plusFive=row.querySelector(".score-plus-five");
  minus.addEventListener("click",()=>changeScore(i,-1));
  plusOne.addEventListener("click",()=>changeScore(i,1));
  plusFive.addEventListener("click",()=>changeScore(i,5));
  teamList.appendChild(row);
  teamRows.push({row,position:row.querySelector(".team-position"),score:row.querySelector(".score-value b"),scoreOutput:row.querySelector(".score-value"),minus});
 }
 refreshTeamPanel();
}
function refreshTeamPanel(){
 teamRows.forEach((item,i)=>{
  item.row.classList.toggle("is-active",i===activeTeam);
  item.row.classList.toggle("is-winner",i===winnerIndex);
  item.position.textContent=String(positions[i]);item.score.textContent=String(scores[i]);
  item.scoreOutput.setAttribute("aria-label",groupName(i)+" has "+scores[i]+" points");
  item.minus.disabled=scores[i]===0;
 });
}
function changeScore(index,delta){scores[index]=Math.max(0,scores[index]+delta);refreshTeamPanel()}
function updateCurrentPosition(){
 positionText.textContent=String(positions[activeTeam]);
 activeChip.innerHTML="<i aria-hidden=\"true\"></i>"+groupName(activeTeam);
 activeChip.style.setProperty("--team-color",GROUPS[activeTeam].color);
 turnText.textContent=String(turn);
}
function updateInterface(){placeAllTokens();updateCurrentPosition();refreshTeamPanel()}
function showDie(n){
 const spots={1:[[2,2]],2:[[1,1],[3,3]],3:[[1,1],[2,2],[3,3]],4:[[1,1],[1,3],[3,1],[3,3]],5:[[1,1],[1,3],[2,2],[3,1],[3,3]],6:[[1,1],[1,2],[1,3],[3,1],[3,2],[3,3]]};
 die.innerHTML="";
 spots[n].forEach(p=>{const dot=document.createElement("i");dot.className="pip";dot.style.gridRow=String(p[0]);dot.style.gridColumn=String(p[1]);die.appendChild(dot)});
 die.setAttribute("aria-label","Die shows "+n);
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function say(text){status.textContent=text}
function categoryMessage(square){
 const subject=SUBJECTS[BOARD_COLORS[square-1]];
 return "It is "+subject.article+" "+subject.name+" question.";
}
function showQuestion(square){
 cardTitle.textContent=categoryMessage(square);
 focusBeforeCard=document.activeElement;dialog.hidden=false;rollButton.disabled=true;closeButton.focus();
}
function closeCard(){
 if(dialog.hidden)return;
 dialog.hidden=true;
 if(pendingAdvance&&winnerIndex===null){activeTeam=(activeTeam+1)%teamCount;turn++;pendingAdvance=false;updateInterface();say(groupName(activeTeam)+"'s turn. Roll the die.")}
 rollButton.disabled=winnerIndex!==null;
 if(winnerIndex!==null)resetButton.focus();
 else if(focusBeforeCard&&focusBeforeCard!==rollButton)focusBeforeCard.focus();
 else if(!rollButton.disabled)rollButton.focus();
}
function restoreControls(){
 busy=false;rollButton.disabled=winnerIndex!==null;resetButton.disabled=false;fullscreenButton.disabled=false;teamCountSelect.disabled=false;
}
async function roll(){
 if(busy||!dialog.hidden||winnerIndex!==null)return;
 const movingTeam=activeTeam,current=positions[movingTeam],name=groupName(movingTeam),token=teamTokens[movingTeam];
 busy=true;rollButton.disabled=true;resetButton.disabled=true;fullscreenButton.disabled=true;teamCountSelect.disabled=true;
 token.classList.add("is-moving");die.classList.add("rolling");
 diceNote.textContent="Rolling…";
 const result=1+Math.floor(Math.random()*6),duration=reduced.matches?120:620,ticks=reduced.matches?3:10;
 for(let i=0;i<ticks;i++){showDie(1+Math.floor(Math.random()*6));await wait(duration/ticks)}
 showDie(result);die.classList.remove("rolling");diceNote.textContent="You rolled a "+result+".";
 const target=current+result;
 if(target>TOTAL){
  const needed=TOTAL-current;token.classList.remove("is-moving");
  activeTeam=(activeTeam+1)%teamCount;turn++;restoreControls();updateInterface();
  say(name+" needs "+needed+" to reach 40 and stays on square "+current+". "+groupName(activeTeam)+" goes next.");
  return;
 }
 for(let n=current+1;n<=target;n++){setPosition(movingTeam,n);await wait(reduced.matches?35:265)}
 const ladder=LADDERS.find(x=>x.from===positions[movingTeam]),snake=SNAKES.find(x=>x.from===positions[movingTeam]);
 if(ladder){
  await wait(reduced.matches?40:160);token.classList.add("is-climbing");setPosition(movingTeam,ladder.to);
  await wait(reduced.matches?60:690);token.classList.remove("is-climbing");
 }else if(snake){
  await wait(reduced.matches?40:160);token.classList.add("is-sliding");setPosition(movingTeam,snake.to);
  await wait(reduced.matches?60:540);token.classList.remove("is-sliding");
 }
 token.classList.remove("is-moving");
 if(positions[movingTeam]===TOTAL){winnerIndex=movingTeam;say(name+" wins! "+categoryMessage(positions[movingTeam]))}
 else say(name+" landed on square "+positions[movingTeam]+". "+categoryMessage(positions[movingTeam]));
 refreshTeamPanel();placeToken(movingTeam);pendingAdvance=winnerIndex===null;restoreControls();showQuestion(positions[movingTeam]);
}
function newGame(){
 if(busy)return;
 dialog.hidden=true;pendingAdvance=false;winnerIndex=null;
 teamCount=Number(teamCountSelect.value)||2;positions=[1,1,1,1];scores=[0,0,0,0];activeTeam=0;turn=1;
 createTokens();createTeamPanel();showDie(1);diceNote.textContent="Ready when you are";
 say("Group A goes first. Roll the die to begin.");rollButton.disabled=false;resetButton.disabled=false;fullscreenButton.disabled=false;teamCountSelect.disabled=false;
 updateInterface();
}
async function fullScreen(){
 const root=document.documentElement;
 try{
  if(document.fullscreenElement||document.webkitFullscreenElement){
   if(document.exitFullscreen)await document.exitFullscreen();else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
  }else if(root.requestFullscreen)await root.requestFullscreen();
  else if(root.webkitRequestFullscreen)root.webkitRequestFullscreen();
  else say("Full screen is not available here. You can still play normally.");
 }catch(e){say("Full screen could not be opened. Use the browser menu to switch to full screen.")}
 updateFullscreen();
}
function updateFullscreen(){
 const on=Boolean(document.fullscreenElement||document.webkitFullscreenElement);
 fullscreenButton.setAttribute("aria-label",on?"Exit full screen":"Enter full screen");
 fullscreenButton.querySelector("b").textContent=on?"Exit full screen":"Full screen";
}
rollButton.addEventListener("click",roll);
resetButton.addEventListener("click",newGame);
teamCountSelect.addEventListener("change",newGame);
fullscreenButton.addEventListener("click",fullScreen);
closeButton.addEventListener("click",closeCard);
dialog.addEventListener("click",e=>{if(e.target===dialog)closeCard()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!dialog.hidden)closeCard()});
document.addEventListener("fullscreenchange",updateFullscreen);
document.addEventListener("webkitfullscreenchange",updateFullscreen);
window.addEventListener("resize",placeAllTokens);
createTokens();createTeamPanel();showDie(1);updateInterface();
})();
