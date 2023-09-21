import * as opentype from "./modules/opentype.module.js";
import Font  from "./modules/Font.js";
import ControlBar  from "./modules/Controls.js";


const mainEl = document.getElementById('content')
const dropzone = document.getElementById('dropzone')
const sandbox = document.getElementById('sandbox')
const preview = document.getElementById('previewFont')

HTMLElement.prototype.setAttributes = function(attrs){
    for(var key in attrs) {
        this.setAttribute(key, attrs[key]);
    }
}
HTMLElement.prototype.appendChildren = function(...nodes){
    for(const node of nodes){
        this.appendChild(node)
    }
}

function print(str){
    console.trace(str)
}

const showErrorMessage = (err)=>{
    console.log(err)
}

const getFileURL = (fontFile)=>{
    return new Promise((res, rej)=>{
        const reader = new FileReader();
        reader.readAsDataURL(fontFile);    
        reader.onload = (e)=>{
            res(e.target.result)
        }    
        reader.onerror = rej
    })
}


const displayFontData = (font)=>{

    if(!mainEl.querySelector('control-bar')){
        const controlBar = new ControlBar()
        mainEl.appendChild(controlBar)

        sandbox.style.fontFamily = "preview, sans-serif";
        sandbox.style.fontWeight = "unset";

        return
    }
    const controlBar = mainEl.querySelector('control-bar');
    controlBar.updateFont()
    // controlEl.updateData()

}

const setFontFace = (fontFace)=>{
    const newStyle = document.createElement("style");
    newStyle.appendChild(document.createTextNode(fontFace));

    if(preview.children.length > 0){
        preview.replaceChildren(newStyle)
        return
    }
    preview.appendChild(newStyle);
}

const parseFont = async (fontFile)=>{
    try {
        const opentypeFont = opentype.parse(await fontFile.arrayBuffer())
        return opentypeFont
    } catch (error) {
        showErrorMessage(error)
    }
}

const onFontUploaded = async (fontFile)=>{
    console.log(fontFile)
    const fileName = fontFile.name;
    const opentypeFont = await parseFont(fontFile)
    const url = await getFileURL(fontFile);
    window.currentFont = new Font(opentypeFont, url, fileName)
    console.log(opentypeFont)
    displayFontData(currentFont)
    setFontFace(currentFont.fontFace)
}

const dropHandler = (ev)=>{
    ev.preventDefault();
    if  (ev.dataTransfer.items.length > 1) {
        showErrorMessage('Please Select Only One File!!')
    }
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...ev.dataTransfer.items].forEach(async (item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                window.currentFontFile =await item.getAsFile()
                if ( ['.otf', '.ttf', 'woff'].indexOf(currentFontFile.name.slice(-4)) < 0) {
                    showErrorMessage('Please Only Drop Font File!!')
                    return false
                } 
                onFontUploaded(currentFontFile)
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
            console.log(`… file[${i}].name = ${file.name}`);
        });
    }
}
const dragOverHandler = (ev)=>{
    ev.preventDefault();
}

dropzone.addEventListener('drop', dropHandler)
dropzone.addEventListener('dragover', dragOverHandler)
