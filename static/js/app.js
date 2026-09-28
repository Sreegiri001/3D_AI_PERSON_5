const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const messages=$("#messages"), input=$("#input"), side=$("#sidePanel");
function addMsg(role,text){const d=document.createElement("div");d.className="msg "+(role==="user"?"user":"model");d.textContent=text;messages.appendChild(d);messages.scrollTop=messages.scrollHeight}
async function loadHistory(){const r=await fetch("/api/history"),data=await r.json();messages.innerHTML="";if(!data.length)addMsg("model","Hi! I'm your 3D AI person. How can I help you today?");else data.forEach(x=>addMsg(x.role==="user"?"user":"model",x.content))}
async function send(text){text=text.trim();if(!text)return;addMsg("user",text);input.value="";$("#statusText").textContent="Thinking…";try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});const d=await r.json();addMsg("model",d.reply||d.error||"No response");speak(d.reply||"");}catch(e){addMsg("model","Connection error: "+e.message)}$("#statusText").textContent="Online • Ready"}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();send(input.value)});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input.value)}});
$$(".quick button").forEach(b=>b.onclick=()=>send(b.textContent));
$("#clearBtn").onclick=async()=>{await fetch("/api/clear",{method:"POST"});loadHistory()};
$("#settingsBtn").onclick=()=>side.classList.toggle("open");$("#closeSide").onclick=()=>side.classList.remove("open");
$("#themeBtn").onclick=()=>document.body.classList.toggle("light");
$("#scale").oninput=e=>window.setAvatarScale(e.target.value);
$$("[data-emotion]").forEach(b=>b.onclick=()=>window.setAvatarEmotion(b.dataset.emotion));
let voices=[];function speak(text){
 if($("#voiceMode").value==="Silent"||!("speechSynthesis"in window)||!text){window.setAvatarTalking(false);return}
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);
 u.rate=.98;
 u.onstart=()=>{window.setAvatarTalking(true);$("#statusText").textContent="Speaking…"};
 u.onend=()=>{window.setAvatarTalking(false);$("#statusText").textContent="Online • Ready"};
 u.onerror=()=>{window.setAvatarTalking(false);$("#statusText").textContent="Online • Ready"};
 speechSynthesis.speak(u);
}
$("#voiceBtn").onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert("Speech recognition is not supported in this browser.");return}const r=new SR();r.lang=$("#language").value==="Tamil"?"ta-IN":$("#language").value==="Hindi"?"hi-IN":"en-IN";r.interimResults=false;r.onstart=()=>$("#statusText").textContent="Listening…";r.onresult=e=>send(e.results[0][0].transcript);r.onerror=e=>$("#statusText").textContent="Voice error";r.onend=()=>$("#statusText").textContent="Online • Ready";r.start()};
$("#exportBtn").onclick=async()=>{const r=await fetch("/api/history"),d=await r.json();const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="3d-ai-person-chat.json";a.click()};
let featureData=[];$("#featuresBtn").onclick=async()=>{if(!featureData.length){featureData=await (await fetch("/api/features")).json()}renderFeatures();$("#featureModal").classList.remove("hidden")};
$("#closeFeatures").onclick=()=>$("#featureModal").classList.add("hidden");$("#featureSearch").oninput=renderFeatures;
function renderFeatures(){const q=$("#featureSearch").value.toLowerCase();const list=$("#featureList");list.innerHTML="";featureData.filter(x=>(x.name+" "+x.category+" "+x.description).toLowerCase().includes(q)).forEach(x=>{const d=document.createElement("div");d.className="feature";d.innerHTML=`<b>${x.id}. ${x.name}<span class="tag">${x.status}</span></b><small>${x.category} — ${x.description}</small>`;list.appendChild(d)})}
loadHistory();