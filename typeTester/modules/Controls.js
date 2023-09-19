import featureDefaults from "./opentypeFeatureDefaults.js";

const sandbox = document.getElementById('sandbox')
const mainEl = document.getElementById('content')

let settings; 

const cssSettings = new Proxy({}, {
    set(target, prop, val){
        target[prop] = val;

        const varCssStringRaw = JSON.stringify(cssSettings["font-variation-settings"])||''
        const feaCssStringRaw = JSON.stringify(cssSettings["font-feature-settings"])||''

        const varCssString = varCssStringRaw.replaceAll(':',' ').slice(1,-1)
        const feaCssString = feaCssStringRaw.replaceAll('""','').replaceAll(':',' ').slice(1,-1)

        for (const [key, value] of Object.entries(cssSettings.font)){
            sandbox.style[key] = value
        }
        sandbox.style.fontVariationSettings = varCssString;
        sandbox.style.fontFeatureSettings = feaCssString;

        return true;
    }
})

function updateFontCSS(prop, val){
    cssSettings["font"]??={}
    let currentFontSettings = cssSettings["font"]||{}
    currentFontSettings[prop]= val
    const newFontSetting = JSON.parse(JSON.stringify(currentFontSettings))
    cssSettings["font"] = newFontSetting

}
function updateVariationCSS(prop, val){
    cssSettings["font-variation-settings"]??={}
    let currentVarSettings = cssSettings["font-variation-settings"]||{}
    currentVarSettings[prop]=parseFloat(val)
    const newVarSetting = JSON.parse(JSON.stringify(currentVarSettings))
    cssSettings["font-variation-settings"] = newVarSetting
}
function updateFeatureCSS(prop, val){
    cssSettings["font-feature-settings"]??={}
    let currentFeaSettings = cssSettings["font-feature-settings"]||{}
    currentFeaSettings[prop]= val ? '' : 0
    const newFeaSetting = JSON.parse(JSON.stringify(currentFeaSettings))
    cssSettings["font-feature-settings"] = newFeaSetting
}
function updateColor(prop, val){
    mainEl.style[prop] = val
}

class ToolboxHeader extends HTMLElement{
    constructor(){
        super()
    }
    connectedCallback(){
        this.setData()
        this.createNodes()
    }
    createNodes(){
        this.familyEl = document.createElement('h1')
        this.instancesSelect = document.createElement('select')
        this.appendChildren(this.familyEl, this.instancesSelect)

        this.familyEl.textContent = this.family

        if(!this.presets.length){
            this.instancesSelect.disabled = true;
            this.presets.unshift({name:{en:'-'}})
        }
        for(const instance of this.presets){
            const option = document.createElement('option');
            option.textContent = instance.name.en;
            option.value = instance.name.en;
            this.instancesSelect.appendChild(option)
        }
    }
    setData(){
        this.family = settings.font.family
        this.presets = settings.font.presets
    }
}


class InputRange extends HTMLElement{
    constructor(){
        super()
        this.settings = []
        this.name = ''
        this.currentValue;
        this.snaps = []

        this.header = document.createElement('div')
        this.label = document.createElement('label')
        this.inputText = document.createElement('input')
        this.inputRange = document.createElement('input')

        this.inputs = [this.inputRange, this.inputText]

        this.header.classList.add("rangeHeader", "flex")
        this.inputRange.classList.add("sliderRange")
        this.inputText.classList.add("sliderLabel")
        this.inputRange.setAttributes({'type':'range', 'list':'inputSnaps'})
        this.inputText.setAttributes({"type": "text", "inputmode":"decimal", "number":"true", "autocomplete":"off"})
        
    }
    setData(){

        
    }
    connectedCallback(){
        this.setData()
        const _this = this

        for (const input of this.inputs){
            input.min = this.settings.min;
            input.max = this.settings.max;
            this.currentValue = this.settings.default;
            input.step = this.settings.step;

            input.value = this.currentValue;
            updateFontCSS(this.settings.css,`${this.currentValue}${this.settings.unit??''}`)



            input.addEventListener('input', (ev)=>{
                if (ev.target.value < _this.settings.min){
                    _this.currentValue = _this.settings.min
                    console.log('lower than min')
                }else if (ev.target.value > _this.settings.max){
                    _this.currentValue = _this.settings.max
                    console.log('higher than max')
                }else{
                    _this.currentValue = ev.target.value
                }
                for (const input of _this.inputs){
                    input.value = _this.currentValue
                }
                updateFontCSS(_this.settings.css,`${_this.currentValue}${_this.settings.unit??''}`)
            })
        }
        
        this.snaps = [this.settings.min, this.settings.default, this.settings.max]
        this.datalist = document.createElement('datalist')
        this.datalist.id = `${this.settings.css}Snaps`
        this.inputRange.setAttributes({'list':`${this.settings.css}Snaps`})

        for (const snap of this.snaps){
            const option = document.createElement('option')
            option.textContent = snap
            this.datalist.appendChild(option)
        }

        this.appendChildren(this.header, this.inputRange, this.datalist)
        this.header.appendChildren(this.label, this.inputText)
        this.label.textContent = this.name;

    }

}
class VariableInputRange extends HTMLElement{
    constructor(){
        super()

        this.settings = []
        this.name = ''
        this.currentValue;
        this.snaps = []

        this.header = document.createElement('div')
        this.labelName = document.createElement('label')
        this.labelTag = document.createElement('span')
        this.inputText = document.createElement('input')
        this.inputRange = document.createElement('input')

        this.inputs = [this.inputRange, this.inputText]

        this.header.classList.add("rangeHeader", "flex")
        this.inputRange.classList.add("sliderRange")
        this.inputText.classList.add("sliderLabel")
        this.inputRange.setAttributes({'type':'range', 'list':'inputSnaps'})
        this.inputText.setAttributes({"type": "text", "inputmode":"decimal", "number":"true", "autocomplete":"off"})
        
    
    }
    setData(){
        this.tag = this.axis.tag;
        this.name = this.axis.name.en||this.tag;
        this.min = this.axis.minValue;
        this.max = this.axis.maxValue;
        this.default = Math.round(this.axis.defaultValue * 100) / 100;

    }
    connectedCallback(){
        this.setData()
        const _this = this

        for (const input of this.inputs){
            input.min = this.min;
            input.max = this.max;
            this.currentValue = this.default;
            console.log(input, this.currentValue)

            input.step = this.max > 10 ? 1 : this.max > 1 ? 0.1 : 0.01;

            input.value =  this.currentValue;
            updateVariationCSS(this.tag,`${this.currentValue}`)


            input.addEventListener('input', (ev)=>{
                if (ev.target.value < _this.min){
                    _this.currentValue = _this.min
                    console.log('lower than min')
                }else if (ev.target.value > _this.max){
                    _this.currentValue = _this.max
                    console.log('higher than max')
                }else{
                    _this.currentValue = ev.target.value
                }
                for (const input of _this.inputs){
                    input.value = _this.currentValue
                }
                updateVariationCSS(this.tag,`${this.currentValue}`)
            })

        }
        this.snaps = [this.min, this.default, this.max]
        this.datalist = document.createElement('datalist')
        this.datalist.id = `${this.tag}Snaps`
        this.inputRange.setAttributes({'list':`${this.tag}Snaps`})

        for (const snap of this.snaps){
            const option = document.createElement('option')
            option.textContent = snap
            this.datalist.appendChild(option)
        }

        this.appendChildren(this.header, this.inputRange, this.datalist)
        this.header.appendChildren(this.labelName, this.inputText)
        this.labelName.textContent = this.name;
        this.labelName.appendChild(this.labelTag)
        this.labelTag.textContent = this.tag;

    }

}

class FeatureBlock extends HTMLElement{
    constructor(){
        super()
        
        this.checkbox = document.createElement('input')
        this.labelName = document.createElement('label')
        this.labelTag = document.createElement('span')

        this.checkbox.setAttributes({"type": "checkbox"})

    }

    setData(){
        this.name = this.feature.name;
        this.uiName = this.feature.uiName;
        this.tag = this.feature.tag;
        // this.featureGroup = 

    }

    connectedCallback(){
        this.setData()

        this.appendChildren(this.checkbox, this.labelName, this.labelTag)
        this.checkbox.id = `${this.feature.tag}Box`;

        this.labelName.textContent = this.uiName||this.name;
        this.labelName.setAttributes({"for": `${this.feature.tag}Box`})

        this.labelTag.textContent = this.tag;
        this.labelTag.classList.add('sliderLabel')

        if (featureDefaults.indexOf(this.tag )>-1){
            this.checkbox.checked = true;
        }

        updateFeatureCSS(this.tag, this.checkbox.checked)

        this.checkbox.addEventListener('change', (ev)=>{
            updateFeatureCSS(this.tag, this.checkbox.checked)
        })

    }

}

class ColorBlock extends HTMLElement{
    constructor(){
        super()
        
        this.labelName = document.createElement('label')
        this.inputCode = document.createElement('input')
        this.inputColor = document.createElement('input')
        this.inputs = [this.inputCode, this.inputColor]
        this.inputCode.setAttributes({"type": "text"})
        this.inputColor.setAttributes({"type": "color"})
        this.inputCode.classList.add("sliderLabel")
        this.currentValue = ''

    }

    setData(){
        this.colorCode = this.settings.defaultValue;
        this.css = this.settings.css

        this.labelName.textContent = this.name;
        this.inputCode.value = this.colorCode;
        this.inputColor.value = this.colorCode;

    }
    connectedCallback(){
        this.setData()
        
        this.appendChildren(this.labelName, this.inputCode, this.inputColor)

        for (const input of this.inputs){
            this.inputColor.addEventListener('input', (ev)=>{
                this.currentValue = ev.target.value
                input.value = this.currentValue
                updateColor(this.css, this.currentValue)
            })
        }

    }

}

class ToolBox extends HTMLElement{
    constructor(){
        super()
        this.font = settings.font
        this.label = document.createElement('label');
        this.settings = []
    }
    connectedCallback(){
        this.appendChild(this.label)
        switch (this.label.textContent) {
            case this.settings.toolBoxes[0]: 
                this.buildInstanceSelector()
                break;
            case this.settings.toolBoxes[1]: 
                this.buildBasicControls()
                break;
            case this.settings.toolBoxes[2]: 
                this.buildVariableControls()
                break;
            case this.settings.toolBoxes[3]: 
                this.buildFeatureControls()
                break;
            case this.settings.toolBoxes[4]: 
                this.buildColorControls()
                break;
            default:
                break;
        }
    }
    buildInstanceSelector(){
        const toolboxHeader = document.createElement('toolbox-header')
        this.appendChild(toolboxHeader)

    }

    buildBasicControls(){
        for(const [key, value] of Object.entries(this.settings.basicControls)){
            const inputRange = document.createElement('input-range')
            inputRange.name = key
            inputRange.settings = value
            this.appendChild(inputRange)
        }
    }
    
    buildVariableControls(){
        for(const axis of Object.values(this.font.variationAxes)){
            const variableInputRange = document.createElement('variableinput-range')
            variableInputRange.axis = axis
            this.appendChild(variableInputRange)
        }
    }

    buildFeatureControls(){
        for(const feature of this.settings.featureLists){
            const featureBlock = document.createElement('feature-block')
            featureBlock.feature = feature
            this.appendChild(featureBlock)
        }
    }
    buildColorControls(){
        for (const [key, value]  of Object.entries(this.settings.colorCss)){
            const colorBlock = document.createElement('color-block')
            colorBlock.name = key
            colorBlock.settings = value
            this.appendChild(colorBlock)
        }
    }
}


export default class ControlBar extends HTMLElement{
    constructor(){
        super()
    }
    connectedCallback(){
        this.updateFont()
    }
    updateFont(){
        this.setData()
        this.createChild()
    }
    setData(){
        settings = new Settings(currentFont);
        this.controls = settings
    }
    createChild(){
        this.removeChild()
        for (let i in this.controls.settings.toolBoxes){
            if (!this.controls.settings.toolBoxCheckers[i]){continue;}
            const toolBox = document.createElement('tool-box');
            toolBox.settings = this.controls.settings;
            toolBox.label.textContent = this.controls.settings.toolBoxes[i];
            toolBox.label.classList.add('toolBoxName');
            this.appendChild(toolBox);
        }
    }
    removeChild(){
        this.innerHTML= ''
    }
    createUI(){
        const controlsUI = document.createElement('control-bar')
        return controlsUI
    }
}

class Settings{
    constructor(opentypeFont){
        console.log(opentypeFont)
        this.font = opentypeFont;
        this.fileName = opentypeFont.fileName;
        this.variationAxes = this.font.variationAxes;
        this.gsubFeatures = this.font.gsubFeatures;
        this.gposFeatures = this.font.gposFeatures;
        this.featureLists = [this.font.gsubFeatures].concat([this.font.gposFeatures]).flatMap(e=>e);
        this.settings = {
            // textKinds,
            featureLists : this.featureLists,
            toolBoxes : ['Typeface', 'Basic Controls', 'Variable Settings','Opentype Features',  'Colors'],
            toolBoxCheckers : [true, true, this.variationAxes[0], this.featureLists[0],  true],
            basicControls : {
                "Size": {min: 10, max:300, default:100, step:1, css: "fontSize", unit:"px"}, 
                "Line height": {min: 0, max:2, default:1.2, step:0.01, css: "lineHeight"}, 
                "Letter spacing": {min: -1, max:1, default:0, step:0.01, css: "letterSpacing", unit:"rem"}
            },
            capTags: ["smcp", "c2sc", "pcap", "c2pc"],
            figureTags: ["pnum", "tnum", "lnum", "onum"],
            figureHeights: [
                { value: "default", label: "default" },
                { value: "lnum", label: "lining" },
                { value: "onum", label: "oldstyle" },
            ],
            figureHeight: "default",
            figureWidths: [
                { value: "default", label: "default" },
                { value: "pnum", label: "proportional" },
                { value: "tnum", label: "tabular" },
            ],
            figureWidth: "default",
            numberTags: ["sups", "subs", "numr", "dnom", "frac", "zero"],
            stylisticSetTags: Array(20)
                .fill(0)
                .map((_, i) => `ss${(i + 1).toString().padStart(2, "0")}`),
            characterVariantsTags: Array(99)
                .fill(0)
                .map((_, i) => `cv${(i + 1).toString().padStart(2, "0")}`),
            loclTags: ["locl"],
            loclSelectKeys: {
                class: "class",
                label: "name",
                image: "image",
            },
            colorCss: {
                "Typeface":{"css": "color", "defaultValue":"#000000"},
                "Background": {"css": "backgroundColor", "defaultValue":"#FFFFFF"}},
            allPlaying: false,
            easing: '',
            currentInstance : {},
            // updateInstane : ()
        }
    }

}

window.customElements.define('toolbox-header', ToolboxHeader)
window.customElements.define('input-range', InputRange)
window.customElements.define('variableinput-range', VariableInputRange)
window.customElements.define('feature-block', FeatureBlock)
window.customElements.define('color-block', ColorBlock)
window.customElements.define('tool-box', ToolBox)
window.customElements.define('control-bar', ControlBar)
