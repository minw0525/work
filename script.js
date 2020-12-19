String.prototype.fillZero = function(width){
    return this.length >= width ? this:new Array(width-this.length+1).join('0')+this;//남는 길이만큼 0으로 채움
}

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
    }
    document.querySelector('#totalGlyphs').textContent = `All Characters (${glyphList.length})`
}
function writeOnHTML(char){
    //console.log(char)
    const underbar = /_*/gm;
    let charTxt = char[1].unicode;
    let f;
    if(charTxt === undefined){
        f = false
    }else{
        charTxt = String.fromCharCode(char[1].unicode)
    }
    if(f === false) return
    // console.log(charTxt)
    const charDiv = document.createElement('div');
    charDiv.setAttribute('class','charDiv');
    charDiv.textContent = charTxt;
    document.querySelector('#glyphs').appendChild(charDiv);
    const charName = document.createElement('div');
    charName.setAttribute('class','charname')
    charName.textContent = char[1].name;
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


const szChange = function(){
    let target = document.querySelector('#text');
    var val = document.querySelector('#size').value;
    target.style.fontSize = val+'px';
    document.querySelector('#curSz').innerHTML = val + 'px';
    target.style.height = "0px";
    target.style.height = target.scrollHeight+'px';
}   
const htChange = function(){
    var val = document.querySelector('#lineHeight').value;
    document.querySelector('#text').style.lineHeight = val;
    document.querySelector('#curHt').innerHTML = val;
}   

const spChange = function(){
    var val = document.querySelector('#spacing').value;
    document.querySelector('#text').style.letterSpacing = val+'px';
    document.querySelector('#curSp').innerHTML = val + 'px';
}
let colorIndex = 0;
const colorShft = function(){
    colorIndex++;
    console.log(colorIndex)
    if(colorIndex === 0){
    document.documentElement.style.setProperty('--color','white');
    document.documentElement.style.setProperty('--bgColor','black');
    }else if(colorIndex===1){
        document.documentElement.style.setProperty('--color','black');
        document.documentElement.style.setProperty('--bgColor','white');
    }else {
        function getRandomBg(){
            let randomR =  (Math.floor(Math.random()*122)).toString(16).fillZero(2);
            let randomG =  (Math.floor(Math.random()*122)).toString(16).fillZero(2);
            let randomB =  (Math.floor(Math.random()*122)).toString(16).fillZero(2);
            //console.log(`#${randomR+randomB+randomG}`)
            return `#${randomR+randomB+randomG}`
        }
        function getRandomCol(){
            let randomR =  (Math.floor(Math.random()*122)+123).toString(16).fillZero(2);
            let randomG =  (Math.floor(Math.random()*122)+123).toString(16).fillZero(2);
            let randomB =  (Math.floor(Math.random()*122)+123).toString(16).fillZero(2);
            //console.log(`#${randomR+randomB+randomG}`)
            return `#${randomR+randomB+randomG}`
        }
        document.documentElement.style.setProperty('--color', getRandomCol());
        document.documentElement.style.setProperty('--bgColor',getRandomBg());
        if (colorIndex === 6) {colorIndex = -1}
    }
}


const dlig = function(){
    var txt = $('textarea');
    txt.toggleClass('dlig');
}

document.querySelectorAll('textarea').forEach((el)=>{
   //console.log(el)
    //console.log(el.scrollHeight)
    //console.log(el.style.height)
    let h = el.scrollHeight;
    el.style.height = h+'px';
})

function auto_grow(element) {
    let h = element.scrollHeight;
    element.style.height = "0px";
    element.style.height = (element.scrollHeight)+"px";
}
document.querySelector('#toMain').addEventListener('click',(el)=>{
    window.scrollTo(0,0);
})
