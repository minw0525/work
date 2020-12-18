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
    }
    document.querySelector('#totalGlyphs').textContent = `All Characters (${glyphList.length})`
}
function writeOnHTML(char){
    const underbar = /_*/gm;
    let charTxt = char[1].unicode
    if(charTxt === undefined){
        charTxt = char[1].name.replace(underbar, '')
    }else{
        charTxt = String.fromCharCode(char[1].unicode)
    }
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

document.querySelectorAll('textarea').forEach((el)=>console.log(el))

function auto_grow(element) {
    let h = element.scrollHeight;
    console.log(h)
    //element.style.height = (element.scrollHeight)+"px";
}

