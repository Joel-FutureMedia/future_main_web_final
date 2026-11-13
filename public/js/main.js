const NAV=[
  {href:"/advertise.html",label:"Advertise",menu:[["/advertise.html","Solutions"],["/index.html#offers","Offers"]]},
  {href:"/conferences.html",label:"Conferences"},
  {href:"/brands.html",label:"Brands",menu:[["/brands.html","Broadcast"],["/digital.html","Digital"]]},
  {href:"/audience.html",label:"Audience Insights",menu:[["/audience.html","Insights"],["/media-audit.html","Media Audit"]]},
  {href:"/news.html",label:"News"}
];
const file=(location.pathname.split("/").filter(Boolean).pop()||"index").replace(/\.html$/,"");
const page=file+".html";
const brandPages=["brands.html","digital.html"];
const link=(href,label,mark)=>{
  const path=href.split("#")[0].split("/").pop();
  const on=mark&&(path===page||(label==="Brands"&&brandPages.includes(page)));
  return `<a href="${href}" class="${on?"on":""}">${label}</a>`;
};
document.querySelector("#hdr").innerHTML=`<header><a class="logo" href="/index.html"><img src="/assets/logo.png" alt="FutureMedia"></a>
<div class="nav-bar"><nav id="nav">${NAV.map(item=>item.menu?`<div class="drop">${link(item.href,item.label,true)}<div class="menu">${item.menu.map(([h,t])=>link(h,t,item.label==="Brands")).join("")}</div></div>`:link(item.href,item.label,true)).join("")}</nav>
<div class="head-actions"><a class="pill" href="/contact.html">Contact Us</a><a class="search" href="/search.html" aria-label="Search"><img src="/assets/search.svg" alt=""></a></div></div>
<button class="burger" aria-label="Menu" onclick="nav.classList.toggle('open')">☰</button></header>`;
document.querySelectorAll(".drop").forEach(drop=>{
  drop.querySelector(":scope > a").addEventListener("click",e=>{
    if(window.matchMedia("(max-width:900px)").matches){e.preventDefault();drop.classList.toggle("open")}
  });
});
document.querySelector("#ftr").innerHTML=`<footer>
<a class="lg" href="/index.html" aria-label="FutureMedia"><img src="/assets/Logos/logo-cirlce.png" alt=""></a>
<ul><li><a href="/team.html">Team</a></li><li><a href="/gallery.html">Gallery</a></li><li><a href="/about.html">About Us</a></li></ul>
<ul><li><a href="/vacancies.html">Vacancies</a></li><li><a href="/terms.html">Privacy Policy</a></li><li><a href="/audience.html" data-company-profile>Company Profile</a></li></ul>
<div class="ct">Unit 44, Hyper Motor City, Maxwell Street, Windhoek<br><a href="tel:+264830001000">+264 83 000 1000</a><br><a href="mailto:sales@futuremedia.com.na">sales@futuremedia.com.na</a>
<form data-subscribe class="sub-form"><input name="fullName" placeholder="Name" required><input name="email" type="email" placeholder="Email" required><button type="submit">Subscribe</button></form>
</div>
</footer>
<button class="wa" id="waOpen" type="button" aria-label="Chat with FutureMedia"><img src="/assets/chat-icon.png" alt=""></button>
<div class="chat" id="chat" hidden role="dialog" aria-label="FutureMedia chat">
<div class="chat-head"><span class="chat-avatar"><img src="/assets/chat-icon.png" alt=""></span><div><b>FutureMedia</b><small><i></i>online</small></div><button type="button" id="chatClose" aria-label="Close chat">×</button></div>
<div class="chat-log" id="chatLog"></div>
<div class="chat-quick" id="chatQuick"></div>
<form id="chatForm"><input id="chatInput" autocomplete="off" placeholder="Type a message"><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.2 20.8 21.2 12 3.2 3.2l.2 6.7L15.2 12 3.4 14.1z"/></svg></button></form>
</div>`;
document.querySelectorAll(".panel[data-offers], .panel[data-list]").forEach(panel=>{
  const rows=panel.querySelector(".rows");
  if(!rows)return;
  if(panel.dataset.list){
    const items=JSON.parse(panel.dataset.list);
    rows.classList.add("list");
    rows.innerHTML=items.map(([label,href])=>`<a href="${href}">${label}</a>`).join("");
  }else{
    const offers=JSON.parse(panel.dataset.offers);
    rows.innerHTML=offers.map(o=>{
      const fit=o[4]==="contain"||o[4]==="icon"?o[4]:"cover";
      const img=`<img class="${fit}" src="${o[3]}" alt="" decoding="async" loading="lazy">`;
      return `<a class="offer" href="${o[2]}"><span class="thumb">${img}</span><span><b>${o[0]}</b><small>${o[1]}</small></span></a>`;
    }).join("");
  }
  let arrows=panel.querySelector(".arrows");
  if(!arrows){
    arrows=document.createElement("div");
    arrows.className="arrows";
    arrows.innerHTML=`<button type="button" data-dir="-1" aria-label="Previous offers">↑</button><button type="button" data-dir="1" aria-label="Next offers">↓</button>`;
    const top=panel.querySelector(".top");
    if(top) top.appendChild(arrows); else panel.appendChild(arrows);
  }
  arrows.onclick=e=>{
    const btn=e.target.closest("button");
    if(!btn)return;
    const step=Math.max(96,Math.round(rows.clientHeight*.72));
    rows.scrollBy({top:Number(btn.dataset.dir)*step,behavior:"smooth"});
  };
});

(()=>{
  const quotes=document.querySelector(".quotes");
  if(!quotes)return;
  const slides=[...quotes.querySelectorAll("article")];
  if(slides.length<2)return;
  quotes.classList.add("quotes-slider");
  const viewport=document.createElement("div");
  viewport.className="quotes-viewport";
  const track=document.createElement("div");
  track.className="quotes-track";
  slides.forEach(slide=>{
    slide.classList.add("quote-slide");
    track.appendChild(slide);
  });
  viewport.appendChild(track);
  quotes.innerHTML="";
  quotes.appendChild(viewport);
  const dots=document.createElement("div");
  dots.className="quotes-dots";
  slides.forEach((_,i)=>{
    const b=document.createElement("button");
    b.type="button";
    b.setAttribute("aria-label","Testimonial "+(i+1));
    b.onclick=()=>go(i);
    dots.appendChild(b);
  });
  quotes.appendChild(dots);
  let i=0,timer;
  const go=n=>{
    i=(n+slides.length)%slides.length;
    track.style.transform=`translate3d(-${i*viewport.clientWidth}px,0,0)`;
    slides.forEach((slide,k)=>slide.classList.toggle("is-active",k===i));
    [...dots.children].forEach((d,k)=>d.classList.toggle("on",k===i));
  };
  const reset=()=>{clearInterval(timer);timer=setInterval(()=>go(i+1),5200)};
  go(0);reset();
  window.addEventListener("resize",()=>{track.style.transition="none";go(i);requestAnimationFrame(()=>{track.style.transition="";})});
})();
document.querySelectorAll("[data-bg]").forEach(el=>{
  const io=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;
    el.style.backgroundImage=el.dataset.bg;
    io.disconnect();
  },{rootMargin:"700px"});
  io.observe(el);
});
const chat=document.querySelector("#chat");
const chatLog=document.querySelector("#chatLog");
const chatForm=document.querySelector("#chatForm");
const chatInput=document.querySelector("#chatInput");
const chatQuick=document.querySelector("#chatQuick");
let chatStarted=false;
const chatIntents={
  advertise:{
    reply:"Perfect — Future Media places brands across radio, TV and digital. Tell sales what you’re building and they’ll map the mix.",
    link:["/advertise.html","See advertising solutions"],
    follow:["Speak to sales","Start a media audit","Contact us"]
  },
  offers:{
    reply:"Here are the latest packages and promotions live across the network.",
    link:["/index.html#offers","View latest offers"],
    follow:["Advertise with us","See our solutions","Contact us"]
  },
  solutions:{
    reply:"From radio and television to digital, studio and conferences — browse the solutions we run every day.",
    link:["/advertise.html","Explore solutions"],
    follow:["Advertise with us","Book a conference","Start a media audit"]
  },
  sales:{
    reply:"A sales consultant can help with budgets, flighting and the right brand mix. Share your details on Contact Us, or chat on WhatsApp.",
    link:["/contact.html","Talk to sales"],
    follow:["Contact us","Advertise with us","Start a media audit"]
  },
  contact:{
    reply:"You can reach us on +264 83 000 1000 or sales@futuremedia.com.na — or send a message on the Contact page.",
    link:["/contact.html","Open Contact Us"],
    follow:["Speak to sales","Advertise with us","See our solutions"]
  },
  audit:{
    reply:"The free media audit is seven short questions. We’ll point you to the mix that fits audience, timing and budget.",
    link:["/media-audit.html","Start media audit"],
    follow:["Advertise with us","See our solutions","Contact us"]
  },
  conference:{
    reply:"Future of Business and our other conferences put brands in the room with decision makers.",
    link:["/conferences.html","See conferences"],
    follow:["Book a conference table","Advertise with us","Contact us"]
  },
  brands:{
    reply:"Seven broadcast brands and five digital platforms — one network. Scroll the decks to find your audience.",
    link:["/brands.html","Browse broadcast brands"],
    follow:["See digital brands","Advertise with us","See audience insights"]
  },
  digital:{
    reply:"Specials.na, Shop Beat, Property News, PromoBasket and Entryfy reach shoppers and browsers across Namibia.",
    link:["/digital.html","Browse digital brands"],
    follow:["Advertise with us","See our solutions","Contact us"]
  },
  insights:{
    reply:"Audience, engagement and media plays across the Future Media network — plus briefings you can request.",
    link:["/audience.html","Open Audience Insights"],
    follow:["Start a media audit","Advertise with us","Contact us"]
  },
  careers:{
    reply:"We’re hiring across radio, digital, video and sales. Browse open roles or join the freelancer list.",
    link:["/vacancies.html","See vacancies"],
    follow:["Contact us","See our solutions","Main menu"]
  },
  news:{
    reply:"Campaigns, conferences and brand stories from around the group.",
    link:["/news.html","Read the news"],
    follow:["See conferences","Advertise with us","Main menu"]
  }
};
const chatStarter=[
  ["Do you want to advertise with us?","advertise"],
  ["Have a look at our latest offers.","offers"],
  ["Do you want to see our solutions on offer?","solutions"],
  ["Do you want to speak to a sales consultant?","sales"],
  ["Contact us directly","contact"],
  ["Start a free media audit","audit"],
  ["Tell me about conferences","conference"],
  ["Show me broadcast brands","brands"],
  ["Show me digital brands","digital"],
  ["See audience insights","insights"],
  ["Are you hiring?","careers"],
  ["What’s in the news?","news"]
];
const chatFollowMap={
  "Speak to sales":"sales",
  "Advertise with us":"advertise",
  "See our solutions":"solutions",
  "Contact us":"contact",
  "Start a media audit":"audit",
  "Book a conference table":"conference",
  "See digital brands":"digital",
  "See audience insights":"insights",
  "Main menu":"menu"
};
function chatBubble(text,who){
  const bubble=document.createElement("div");
  bubble.className="bubble "+who;
  bubble.textContent=text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop=chatLog.scrollHeight;
  return bubble;
}
function chatLink(href,label){
  const link=document.createElement("a");
  link.className="bubble bot link";
  link.href=href;
  link.textContent=label;
  chatLog.appendChild(link);
  chatLog.scrollTop=chatLog.scrollHeight;
}
function paintQuick(items){
  chatQuick.innerHTML="";
  items.forEach(([label,key])=>{
    const button=document.createElement("button");
    button.type="button";
    button.textContent=label;
    button.addEventListener("click",()=>handleChatChoice(label,key));
    chatQuick.appendChild(button);
  });
}
function showChatMenu(){
  chatInput.disabled=false;
  chatInput.placeholder="Or type your question…";
  paintQuick(chatStarter);
}
function botReply(text,after){
  const typing=chatBubble("…","bot typing");
  setTimeout(()=>{
    typing.remove();
    chatBubble(text,"bot");
    if(after) after();
  },480);
}
function handleChatChoice(label,key){
  chatBubble(label,"me");
  if(key==="menu"){
    botReply("Sure — pick another option below, or type your own question.",showChatMenu);
    return;
  }
  const intent=chatIntents[key];
  if(!intent){
    botReply("I can help with advertising, offers, solutions, sales, conferences and more. Choose an option below.",showChatMenu);
    return;
  }
  botReply(intent.reply,()=>{
    if(intent.link) chatLink(intent.link[0],intent.link[1]);
    const follow=(intent.follow||[]).map(text=>[text,chatFollowMap[text]||"menu"]);
    follow.push(["Main menu","menu"]);
    paintQuick(follow);
    chatInput.disabled=false;
    chatInput.placeholder="Or type your question…";
  });
}
function matchChatIntent(text){
  const q=text.toLowerCase();
  if(/advert|campaign|radio|tv|spot/.test(q)) return "advertise";
  if(/offer|special|promo|package/.test(q)) return "offers";
  if(/solution|studio|product/.test(q)) return "solutions";
  if(/sales|consultant|rep|account/.test(q)) return "sales";
  if(/contact|email|phone|call|whatsapp/.test(q)) return "contact";
  if(/audit|recommend|mix/.test(q)) return "audit";
  if(/conference|event|future of business|table/.test(q)) return "conference";
  if(/digital|shopbeat|specials|property news/.test(q)) return "digital";
  if(/brand|station|99fm|fresh|omulunga|nova|wave|one africa/.test(q)) return "brands";
  if(/insight|audience|reach|metric/.test(q)) return "insights";
  if(/job|vacanc|career|hire|freelance/.test(q)) return "careers";
  if(/news|story|update/.test(q)) return "news";
  return null;
}
function startChat(){
  chatLog.innerHTML="";
  botReply("Hi, I’m Nia from Future Media. Pick a question below — or type your own.",showChatMenu);
}
document.querySelector("#waOpen").addEventListener("click",()=>{
  chat.hidden=!chat.hidden;
  if(!chat.hidden&&!chatStarted){chatStarted=true;startChat()}
  if(!chat.hidden) chatInput.focus();
});
document.querySelector("#chatClose").addEventListener("click",()=>{chat.hidden=true});
if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
  const revealNodes=[...document.querySelectorAll(".team h1, .member, .about-story, .about-stats, .belief, .careers-intro, .careers-body .job-grid, .careers-body .job-freelance, main.sub > *, .wrap .card, .hero .panel, .upc h2, .upc .e, .quotes:not(.quotes-slider) article, .quotes.quotes-slider")];
  const reveal=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target;
      el.style.transitionDelay=(revealNodes.indexOf(el)%4)*70+"ms";
      el.classList.add("reveal-in");
      reveal.unobserve(el);
    });
  },{rootMargin:"0px 0px -6% 0px",threshold:.14});
  revealNodes.forEach(el=>reveal.observe(el));
}
chatForm.addEventListener("submit",event=>{
  event.preventDefault();
  const value=(chatInput.value||"").trim();
  if(!value) return;
  chatInput.value="";
  const key=matchChatIntent(value);
  if(key){handleChatChoice(value,key);return}
  chatBubble(value,"me");
  botReply("Thanks — I can help with advertising, offers, solutions, sales, conferences, brands and careers. Choose an option below, or contact sales directly.",()=>{
    chatLink("/contact.html","Contact us");
    showChatMenu();
  });
});
