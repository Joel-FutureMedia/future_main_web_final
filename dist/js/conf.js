const sl=document.querySelector('.slides'),dots=document.querySelector('.dots'),T=document.querySelector('#ctitle'),D=document.querySelector('#cdesc');let i=0,tm;
CONFS.forEach((c,k)=>{const b=document.createElement('button');b.setAttribute('aria-label','Slide '+(k+1));b.onclick=()=>{go(k);reset()};dots.append(b)});
function go(n){i=(n+CONFS.length)%CONFS.length;sl.style.transform=`translateX(-${i*100}%)`;[...dots.children].forEach((d,k)=>d.classList.toggle('on',k==i));T.classList.add('fade');D.classList.add('fade');setTimeout(()=>{T.textContent=CONFS[i][0];D.textContent=CONFS[i][1];T.classList.remove('fade');D.classList.remove('fade')},250)}
const reset=()=>{clearInterval(tm);tm=setInterval(()=>go(i+1),5500)};go(0);reset();
