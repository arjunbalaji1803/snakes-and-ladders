(function(){
"use strict";
const TOTAL=40;
const BOARD_COLORS=[
  "blue","red","green","yellow","blue","red","green","yellow",
  "blue","yellow","green","blue","yellow","red","blue","green",
  "red","yellow","blue","green","yellow","blue","red","green",
  "blue","yellow","green","red","blue","yellow","green","blue",
  "green","red","blue","yellow","green","red","blue","yellow"
];
const SUBJECTS={
  red:{name:"history",article:"a"},
  blue:{name:"geography",article:"a"},
  green:{name:"political science",article:"a"},
  yellow:{name:"economics",article:"an"}
};
const LADDERS=[{from:5,to:12},{from:17,to:31},{from:27,to:35}];
const SNAKES=[{from:38,to:12},{from:23,to:8},{from:14,to:2}];
const $=id=>document.getElementById(id);
const token=$("token"),positionText=$("position"),turnText=$("turn");
const rollButton=$("roll"),resetButton=$("reset"),fullscreenButton=$("fullscreen");
const die=$("die"),diceNote=$("dice-note"),status=$("status"),dialog=$("history-dialog");
const closeButton=$("close-card"),cardTitle=$("history-title");
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
let position=1,turn=0,busy=false,focusBeforeCard=null;

function coords(n){
 if(n<=8)return{col:n-1,row:4};
 if(n<=16)return{col:16-n,row:3};
 if(n<=24)return{col:n-17,row:2};
 if(n<=32)return{col:32-n,row:1};
 return{col:40-n,row:0};
}
function setPosition(n){
 const p=coords(n);
 token.style.left=((p.col+.5)*12.5)+"%";
 token.style.top=((p.row+.5)*19.2)+"%";
 token.setAttribute("aria-label","Player token on square "+n);
 positionText.textContent=String(n);
 position=n;
}
function showDie(n){
 const spots={1:[[2,2]],2:[[1,1],[3,3]],3:[[1,1],[2,2],[3,3]],4:[[1,1],[1,3],[3,1],[3,3]],5:[[1,1],[1,3],[2,2],[3,1],[3,3]],6:[[1,1],[1,2],[1,3],[3,1],[3,2],[3,3]]};
 die.innerHTML="";
 spots[n].forEach(p=>{const dot=document.createElement("i");dot.className="pip";dot.style.gridRow=String(p[0]);dot.style.gridColumn=String(p[1]);die.appendChild(dot)});
 die.setAttribute("aria-label","Die shows "+n);
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function say(text){status.textContent=text}
function categoryMessage(square){
 const color=BOARD_COLORS[square-1],subject=SUBJECTS[color];
 return "It is "+subject.article+" "+subject.name+" question.";
}
function showQuestion(square){
 cardTitle.textContent=categoryMessage(square);
 focusBeforeCard=document.activeElement;
 dialog.hidden=false;
 rollButton.disabled=true;
 closeButton.focus();
}
function closeCard(){
 if(dialog.hidden)return;
 dialog.hidden=true;
 if(!busy)rollButton.disabled=position===TOTAL;
 if(focusBeforeCard)focusBeforeCard.focus();
}
async function roll(){
 if(busy||!dialog.hidden||position>=TOTAL)return;
 busy=true;
 rollButton.disabled=true;resetButton.disabled=true;fullscreenButton.disabled=true;
 token.classList.add("is-moving");die.classList.add("rolling");
 diceNote.textContent="Rolling…";turn++;turnText.textContent=String(turn);
 const result=1+Math.floor(Math.random()*6),duration=reduced.matches?120:620,ticks=reduced.matches?3:10;
 for(let i=0;i<ticks;i++){showDie(1+Math.floor(Math.random()*6));await wait(duration/ticks)}
 showDie(result);die.classList.remove("rolling");diceNote.textContent="You rolled a "+result+".";
 const target=position+result;
 if(target>TOTAL){
  say("You need "+(TOTAL-position)+" to reach 40. Stay on "+position+" and try again.");
  token.classList.remove("is-moving");busy=false;
  rollButton.disabled=false;resetButton.disabled=false;fullscreenButton.disabled=false;
  return;
 }
 for(let n=position+1;n<=target;n++){setPosition(n);await wait(reduced.matches?35:265)}
 const ladder=LADDERS.find(x=>x.from===position),snake=SNAKES.find(x=>x.from===position);
 if(ladder){
  await wait(reduced.matches?40:160);token.classList.add("is-climbing");setPosition(ladder.to);
  await wait(reduced.matches?60:690);token.classList.remove("is-climbing");
 }else if(snake){
  await wait(reduced.matches?40:160);token.classList.add("is-sliding");setPosition(snake.to);
  await wait(reduced.matches?60:540);token.classList.remove("is-sliding");
 }
 token.classList.remove("is-moving");
 say(categoryMessage(position));
 if(position===TOTAL)rollButton.disabled=true;
 busy=false;resetButton.disabled=false;fullscreenButton.disabled=false;
 showQuestion(position);
}
function newGame(){
 if(busy)return;
 closeCard();position=1;turn=0;setPosition(1);showDie(1);
 turnText.textContent="1";diceNote.textContent="Ready when you are";
 say("Roll the die to begin.");rollButton.disabled=false;
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
fullscreenButton.addEventListener("click",fullScreen);
closeButton.addEventListener("click",closeCard);
dialog.addEventListener("click",e=>{if(e.target===dialog)closeCard()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!dialog.hidden)closeCard()});
document.addEventListener("fullscreenchange",updateFullscreen);
document.addEventListener("webkitfullscreenchange",updateFullscreen);
setPosition(1);showDie(1);
})();
