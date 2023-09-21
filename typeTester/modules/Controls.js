import featureDefaults from "./opentypeFeatureDefaults.js";

const sandbox = document.getElementById('sandbox')
const mainEl = document.getElementById('content')

const cssSettings = new Proxy({}, {
    set(target, prop, val){
        target[prop] = val;

        const varCssStringRaw = JSON.stringify(cssSettings["font-variation-settings"])||''
        const feaCssStringRaw = JSON.stringify(cssSettings["font-feature-settings"])||''

        const varCssString = varCssStringRaw.replaceAll(':',' ').slice(1,-1)
        const feaCssString = feaCssStringRaw.replaceAll('""','').replaceAll(':',' ').slice(1,-1)


        if(cssSettings.font){
            for (const [key, value] of Object.entries(cssSettings.font)){
                sandbox.style[key] = value
            }
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
        this.familyEl = document.createElement('h1')
        this.instancesSelect = document.createElement('select')
        
        this.prop = 'instance'

        this.currentState = {}
    }
    connectedCallback(){
        console.log(this.controls)
        this.setData()
        this.initializeUI()
    }
    setData(){
        this.family = this.controls.font.family;
        this.presets = this.controls.font.presets;
        this.styleName = this.controls.font.style;
    }
    initializeUI(){
        this.appendChildren(this.familyEl, this.instancesSelect)
        this.instancesSelect.addEventListener('change', this.changeHandler.bind(this))

        this.currentState[this.prop] = (()=>{
            for(const idx in this.presets){
                if (this.presets[idx].name.en === this.styleName) {
                    this.optIdx = idx
                    return this.presets[idx]
                };
            }
        })()

        this.instancesSelect.innerHTML = ''
        for(const idx in this.presets){
            const option = document.createElement('option');
            option.textContent = this.presets[idx].name.en;
            option.value = idx;
            this.instancesSelect.appendChild(option)
        }
        if(!this.presets.length){
            this.instancesSelect.disabled = true;
            this.presets.unshift({"name":{"en": this.styleName}})
        }
        
        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()
    }

    updateUI(){
        this.familyEl.textContent = this.controls.currentState[this.prop].name.en;
        this.controls.settings.updateInstance()
    }
    changeHandler(ev){
        this.currentState[this.prop] = this.presets[ev.target.value]
        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()
    }

    updateState(prop, value){
        this.controls.currentState[prop] = value;
    }
}


class InputRange extends HTMLElement{
    constructor(){
        super()
        this.header = document.createElement('div')
        this.label = document.createElement('label')
        this.inputText = document.createElement('input')
        this.inputRange = document.createElement('input')
        this.datalist = document.createElement('datalist')

        this.inputs = [this.inputRange, this.inputText]

        this.header.classList.add("rangeHeader", "flex")
        this.inputRange.classList.add("sliderRange")
        this.inputText.classList.add("sliderLabel")
        this.inputRange.setAttributes({'type':'range', 'list':'inputSnaps'})
        this.inputText.setAttributes({"type": "text", "inputmode":"decimal", "number":"true", "autocomplete":"off"})

        this.header.appendChildren(this.label, this.inputText)

        this.currentState = {}
    }
    connectedCallback(){
        this.setData()
        this.initializeUI()
    }
    setData(){
        this.min = this.data.min;
        this.max = this.data.max;
        this.default = this.data.default;
        this.step = this.data.step;
        this.prop = this.data.prop;
        this.unit = this.data.unit??'';
    }

    initializeUI(){
        this.appendChildren(this.header, this.inputRange, this.datalist)
        this.label.textContent = this.name;

        this.currentState[this.prop] = this.default;

        for (const input of this.inputs){
            input.min = this.min;
            input.max = this.max;
            input.step = this.step;
            input.value = this.default;
            input.addEventListener('input', this.inputHandler.bind(this))
        }

        this.snaps = [this.data.min, this.data.default, this.data.max]
        this.datalist.id = `${this.prop}Snaps`
        this.inputRange.setAttributes({'list':`${this.prop}Snaps`})

        for (const snap of this.snaps){
            const option = document.createElement('option')
            option.textContent = snap
            this.datalist.appendChild(option)
        }

        this.updateState(this.prop, [ this.currentState[this.prop], this.unit??''])
        this.updateUI()
    }
    updateUI(){
        for (const input of this.inputs){
            input.value = this.controls.currentState[this.prop][0];
            console.log(this.controls.currentState[this.prop]);
        }
        updateFontCSS(this.prop,`${this.controls.currentState[this.prop][0]}${this.controls.currentState[this.prop][1]}`);
    }

    inputHandler(ev){
        if (ev.target.value < this.min){
            this.currentState[this.prop] = this.min
        }else if (ev.target.value > this.max){
            this.currentState[this.prop] = this.max
        }else{
            this.currentState[this.prop] = ev.target.value
        }
        this.updateState(this.prop, [ this.currentState[this.prop], this.unit??''])
        this.updateUI()
    }

    updateState(prop, value){
        this.controls.currentState[prop] = value;
    }
    
}

class VariableInputRange extends HTMLElement{
    constructor(){
        super()
        this.header = document.createElement('div')
        this.labelName = document.createElement('label')
        this.labelTag = document.createElement('span')
        this.inputText = document.createElement('input')
        this.inputRange = document.createElement('input')
        this.datalist = document.createElement('datalist')

        this.inputs = [this.inputRange, this.inputText]

        this.header.classList.add("rangeHeader", "flex")
        this.inputRange.classList.add("sliderRange")
        this.inputText.classList.add("sliderLabel")
        this.inputRange.setAttributes({'type':'range', 'list':'inputSnaps'})
        this.inputText.setAttributes({"type": "text", "inputmode":"decimal", "number":"true", "autocomplete":"off"})
        
        this.header.appendChildren(this.labelName, this.inputText)
        this.labelName.appendChild(this.labelTag)

        this.currentState = {}
    }
    connectedCallback(){
        this.setData()
        this.initializeUI()
    }
    setData(){
        this.name = this.axis.name.en||this.tag;
        this.min = this.axis.minValue;
        this.max = this.axis.maxValue;
        this.default = Math.round(this.axis.defaultValue * 100) / 100;
        this.prop = this.axis.tag;
    }
    initializeUI(){
        this.appendChildren(this.header, this.inputRange, this.datalist)
        this.labelName.textContent = this.name;
        this.labelTag.textContent = this.tag;

        this.currentState[this.prop] = this.default;

        for (const input of this.inputs){
            input.min = this.min;
            input.max = this.max;
            input.step = this.max > 10 ? 1 : this.max > 1 ? 0.1 : 0.01;
            input.value = this.default;

            input.addEventListener('input', this.inputHandler.bind(this))
            
            input.classList.add(`${this.prop}input`)
        }
        this.snaps = [this.min, this.default, this.max]
        this.datalist.id = `${this.prop}Snaps`
        this.inputRange.setAttributes({'list':`${this.prop}Snaps`})

        for (const snap of this.snaps){
            const option = document.createElement('option')
            option.textContent = snap
            this.datalist.appendChild(option)
        }
        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()
    }
    updateUI(){
        for (const input of this.inputs){
            input.value = this.controls.currentState[this.prop];
            // console.log(this.controls.currentState[this.prop]);
        }
        console.log(this.prop, this.controls.currentState[this.prop])
        updateVariationCSS(this.prop, this.controls.currentState[this.prop]);
    }
    inputHandler(ev){
        if (ev.target.value < this.min){
            this.currentState[this.prop] = this.min
        }else if (ev.target.value > this.max){
            this.currentState[this.prop] = this.max
        }else{
            this.currentState[this.prop] = ev.target.value
        }
        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()
    }
    updateState(prop, value){
        this.controls.currentState[prop] = value;
    }

}

class FeatureBlock extends HTMLElement{
    constructor(){
        super()
        
        this.checkbox = document.createElement('input')
        this.labelName = document.createElement('label')
        this.labelTag = document.createElement('span')

        this.checkbox.setAttributes({"type": "checkbox"})
        this.labelTag.classList.add('sliderLabel')

        this.currentState = {}
    }
    connectedCallback(){
        this.setData()
        this.initializeUI()
    }
    setData(){
        this.name = this.feature.name;
        this.uiName = this.feature.uiName;
        this.prop = this.feature.tag;
        // this.featureGroup = 

    }
    initializeUI(){
        this.appendChildren(this.checkbox, this.labelName, this.labelTag)

        if (featureDefaults.indexOf(this.prop )>-1){
            this.checkbox.checked = true;
        }

        this.currentState[this.prop] = this.checkbox.checked

        this.checkbox.id = `${this.prop}Box`;

        this.labelName.textContent = this.uiName||this.name;
        this.labelName.setAttributes({"for": `${this.feature.prop}Box`})

        this.labelTag.textContent = this.prop;


        this.checkbox.addEventListener('change', this.changeHandler.bind(this))

        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()
    }
    updateUI(){
        updateFeatureCSS(this.prop, this.controls.currentState[this.prop])
    }
    changeHandler(ev){
        this.currentState[this.prop] = this.checkbox.checked;
        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()
    }
    updateState(prop, value){
        this.controls.currentState[prop] = value;
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
        
        this.currentState = {}

    }
    connectedCallback(){
        this.setData()
        this.initializeUI()
    }
    setData(){
        this.colorCode = this.data.defaultValue;
        this.prop = this.data.prop;
        this.default = this.data.defaultValue;
    }
    initializeUI(){
        this.appendChildren(this.labelName, this.inputCode, this.inputColor)
        this.inputColor.addEventListener('input', this.inputHandler.bind(this));
        this.inputCode.addEventListener('change', this.changeHandler.bind(this));
        this.labelName.textContent = this.name;
        this.currentState[this.prop] = `#${this.default}`;

        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()
    }
    updateUI(){
        this.inputCode.value = this.controls.currentState[this.prop];
        this.inputColor.value = this.controls.currentState[this.prop];

        updateColor(this.prop, this.controls.currentState[this.prop])
    }
    inputHandler(ev){
        this.currentState[this.prop] = ev.target.value.toUpperCase()

        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()
    }
    changeHandler(ev){
        let temp;
        if(!ev.target.value.startsWith('#')){
            temp = parseInt(checkIf3letters(ev.target.value), 16) || this.default;
            temp = `#${temp.toString(16)}`
            console.log(temp)

        }else{
            console.log(ev.target.value)
            temp = parseInt(checkIf3letters(ev.target.value.slice(1)),16) || this.default;
            console.log(temp)
            temp = `#${temp.toString(16)}`
        }
        this.currentState[this.prop] = temp.slice(0,7).toUpperCase().padEnd(7,'0')

        this.updateState(this.prop, this.currentState[this.prop])
        this.updateUI()

        function checkIf3letters(str){
            if (str.length === 3){
                return str.split('').flatMap(e=>[e,e]).join('')
            }else{ return str }
        }
    }
    updateState(prop, value){
        this.controls.currentState[prop] = value;
    }
}

class ToolBox extends HTMLElement{
    constructor(){
        super()
        this.label = document.createElement('label');

    }
    connectedCallback(){
        this.setData();
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
    setData(){
        this.font = this.controls.font
        this.settings = this.controls.settings;
        this.label.textContent = this.name;
        this.label.classList.add('toolBoxName');
    }
    buildInstanceSelector(){
        const toolboxHeader = document.createElement('toolbox-header')
        toolboxHeader.controls = this.controls
        this.appendChild(toolboxHeader)
    }

    buildBasicControls(){
        for(const [key, value] of Object.entries(this.settings.basicControls)){
            const inputRange = document.createElement('input-range')
            inputRange.name = key
            inputRange.data = value
            inputRange.controls = this.controls
            this.appendChild(inputRange)
        }
    }
    
    buildVariableControls(){
        for(const axis of Object.values(this.font.variationAxes)){
            const variableInputRange = document.createElement('variableinput-range')
            variableInputRange.axis = axis
            variableInputRange.controls = this.controls
            this.appendChild(variableInputRange)
        }
    }

    buildFeatureControls(){
        for(const feature of this.settings.featureLists){
            const featureBlock = document.createElement('feature-block')
            featureBlock.feature = feature
            featureBlock.controls = this.controls
            this.appendChild(featureBlock)
        }
    }
    buildColorControls(){
        for (const [key, value]  of Object.entries(this.settings.colorData)){
            const colorBlock = document.createElement('color-block')
            colorBlock.name = key
            colorBlock.data = value
            colorBlock.controls = this.controls
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
        this.initializeUI()
    }
    setData(){
        this.font = currentFont
        const controls = new Controls(this.font);
        this.controls = controls;
        this.controls.parent = this;
    }
    initializeUI(){
        this.removeChild()
        for (let i in this.controls.settings.toolBoxes){
            if (!this.controls.settings.toolBoxCheckers[i]){continue;}
            const toolBox = document.createElement('tool-box');
            toolBox.controls = this.controls;
            toolBox.name = this.controls.settings.toolBoxes[i];
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

class Controls{
    constructor(opentypeFont){
        console.log(opentypeFont)
        const _this = this;
        this.font = opentypeFont;
        this.fileName = opentypeFont.fileName;
        this.variationAxes = this.font.variationAxes;
        this.gsubFeatures = this.font.gsubFeatures;
        this.gposFeatures = this.font.gposFeatures;
        this.featureLists = [this.font.gsubFeatures].concat([this.font.gposFeatures]).flatMap(e=>e);
        this.currentState = {};
        this.settings = {
            // textKinds,
            featureLists : this.featureLists,
            toolBoxes : ['Typeface', 'Basic Controls', 'Variable Settings','Opentype Features',  'Colors'],
            toolBoxCheckers : [true, true, this.variationAxes[0], this.featureLists[0],  true],
            basicControls : {
                "Size": {min: 10, max:300, default:100, step:1, prop: "fontSize", unit:"px"}, 
                "Line height": {min: 0, max:2, default:1.2, step:0.01, prop: "lineHeight"}, 
                "Letter spacing": {min: -1, max:1, default:0, step:0.01, prop: "letterSpacing", unit:"rem"}
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
            colorData: {
                "Typeface":{prop: "color", defaultValue:"000000"},
                "Background": {prop: "backgroundColor", defaultValue:"FFFFFF"}},
            allPlaying: false,
            easing: '',
            updateInstance(){
                console.log(_this.currentState.instance)
                const coordinates = _this.currentState.instance.coordinates;

                for (const [axis, value] of Object.entries(coordinates)){
                    const inputs = _this.parent.querySelectorAll(`.${axis}input`)
                    for (const input of inputs){
                        input.value = value;
                    }
                    updateVariationCSS(axis, value)
                }
            }
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
