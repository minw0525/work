async function make(){
    const font = await opentype.load('https://files.cargocollective.com/c891600/Hesiod-Regular.otf');
    const glyphsData = font.glyphs.glyphs
    console.log(glyphsData);
    let glyphList = Object.entries(glyphsData).sort((a,b)=>{b[0].localeCompare(a[0])})
    glyphList= glyphList.reverse();
    glyphList.pop();
    glyphList.reverse();
    console.log(glyphList.length)
    for(char of glyphList){
        writeOnHTML(char)
        //console.log(char)
        //console.log(char[1].name)
        //console.log(char[1].unicode)
    }
    document.querySelector('#totalGlyphs').textContent = `All Characters (${glyphList.length})`
}
function writeOnHTML(char){
    // console.log(charTxt)
    const charDiv = document.createElement('div');
    charDiv.setAttribute('class','charDiv');
    const charName = document.createElement('div');
    charName.setAttribute('class','charname');
    document.querySelector('#glyphs').appendChild(charDiv);

    //console.log(char)
    const underbar = /_*/gm;
    const afterDot = /\.[\d|\D]*/gm;
    let charTxt = char[1].unicode;
    if(charTxt === undefined){
        charTxt = char[1].name.replace(underbar,'')
        charTxt = charTxt.replace(afterDot,'')
        switch (charTxt) {
            case 'Racute':
                charTxt = 'Ŕ'
                break;
            case 'Rcaron':
                charTxt = 'Ř'
                break;
            case 'Rcommaaccent':
                charTxt = 'Ŗ'
                break;
            case 'idotaccent':
                charTxt = 'i'
                break;
            default:
                break;
        }
        charDiv.classList.add('salt');
    }else{
        charTxt = String.fromCharCode(char[1].unicode)
    }
    charDiv.textContent = charTxt;
    charName.textContent = char[1].name.replace(afterDot,'');
    charDiv.appendChild(charName);
    charDiv.addEventListener('click',(e)=>{
        e.stopPropagation();
        const txt = e.target.firstChild.textContent;
        const nameTxt = e.target.lastChild.textContent;
        const modal = document.querySelector('.modal');
        const char = document.querySelector('.char');
        const name = document.querySelector('.name');
        char.textContent = txt;
        name.textContent = nameTxt;
        modal.style.display = 'flex';
        console.log(e.target)
        if(e.target.classList.contains('salt')){
            console.log('yes')
            char.classList.add('salt')
        }
    })

}
document.addEventListener('click',(e)=>{
    const modal = document.querySelector('.modal');
    const char = document.querySelector('.char');
    const name = document.querySelector('.name');
    if(e.target === modal || e.target === char || e.target === name) return;
    modal.style.display = 'none';
})
make();


const szChange = function(i){
    const target = document.querySelectorAll('textarea')[i];
    let val = document.querySelectorAll('[data-control=size]')[i].value;
    target.style.fontSize = val+'px';
    document.querySelectorAll('.curSz')[i].innerHTML = val + 'px';
    target.style.height = "0px";
    target.style.height = target.scrollHeight+'px';
}   


let dligChkd = [false, false, false];
const dlig = function(i){
    const txt = document.querySelectorAll('textarea')[i];
    if (!dligChkd[i]){
        txt.classList.add('dlig');
        dligChkd[i] = true;
    }else{
        txt.classList.remove('dlig');
        dligChkd[i] = false;
    }
}
let saltChkd = [false, false, false];
const salt = function(i){
    const txt = document.querySelectorAll('textarea')[i];
    if (!saltChkd[i]){
        txt.classList.add('salt');
        saltChkd[i] = true;
    }else{
        txt.classList.remove('salt');
        saltChkd[i] = false;
    }
}

let colorIndex = 0;
const colorShft = function(){
    colorIndex++;
    console.log(colorIndex)
    if(colorIndex === 0){
    document.documentElement.style.setProperty('--color','255, 255, 255');
    document.documentElement.style.setProperty('--bgColor','0, 0, 0');
    }else if(colorIndex===1){
        document.documentElement.style.setProperty('--color','0, 0, 0');
        document.documentElement.style.setProperty('--bgColor','255, 255, 255');
    }else {
        function getRandomBg(){
            let randomR =  Math.floor(Math.random()*122);
            let randomG =  Math.floor(Math.random()*122);
            let randomB =  Math.floor(Math.random()*122)
            console.log( `${randomR},${randomB},${randomG}`)
            return `${randomR},${randomB},${randomG}`
        }
        function getRandomCol(){
            let randomR =  Math.floor(Math.random()*122)+123;
            let randomG =  Math.floor(Math.random()*122)+123;
            let randomB =  Math.floor(Math.random()*122)+123;
            console.log( `${randomR},${randomB},${randomG}`)
            return `${randomR},${randomB},${randomG}`
        }
        document.documentElement.style.setProperty('--color', getRandomCol());
        document.documentElement.style.setProperty('--bgColor',getRandomBg());
        if (colorIndex === 6) {colorIndex = -1}
    }
}
window.onload = ()=>{
    console.log(window.innerWidth)
    if(window.innerWidth <= 576){
        document.querySelectorAll('textarea')[0].style.fontSize = "60px"
        document.querySelectorAll('[data-control=size]')[0].value = "60"
        document.querySelectorAll('.curSz')[0].textContent = "60px"
        document.querySelectorAll('textarea')[1].style.fontSize = "40px"
        document.querySelectorAll('[data-control=size]')[1].value = "40"
        document.querySelectorAll('.curSz')[1].textContent = "40px"
        document.querySelectorAll('textarea')[2].style.fontSize = "20px"
        document.querySelectorAll('[data-control=size]')[2].value = "20"
        document.querySelectorAll('.curSz')[2].textContent = "20px"
    }
    document.querySelectorAll('textarea').forEach((el)=>{
        console.log(el)
        el.style.height = '0px';
        console.log(el.scrollHeight)
        console.log(el.style.height)
        let h = el.scrollHeight;
        console.log(h)
        el.style.height = (el.scrollHeight)+'px';
    })
    document.querySelector('.modal').addEventListener('click',(e)=>{
        document.querySelector('.modal').style.display = 'none';
    })

}

function auto_grow(element) {
    let h = element.scrollHeight;
    element.style.height = "0px";
    element.style.height = (element.scrollHeight)+"px";
}
document.querySelector('#toMain').addEventListener('click',(el)=>{
    window.scrollTo(0,0);
})
