import opentypeLanguageTags from "./opentypeLanguageTags.js";
import { getOpenTypeFeatureName } from "./opentypeFeatureNames.js";

export default class Font {
    constructor(font, url, fileName) {
        this.version = 0;
        this.url = url;
        this.fileName = fileName;
        this.font = font;
        this.platform = (()=>{
            const platform = (navigator.userAgentData?.platform)?.toLowerCase();
            if(platform.startsWith("mac")) return "macintosh";
            return "windows";
            })()
        this.processFont();

    }

    async processFont(){
        this.getNames();
        this.getFeatures();
        this.getPresets();
        this.generateFontFace(this.family);

        const _this = this;

        if(this.url.indexOf('blob') >= 0) {
            // console.log('this is a blob font, should rename url');
            // console.log(this.font);
            // files.forEach(file => {
              // console.log(this.url);
              let blob = await fetch(this.url).then(r => r.blob());
              var reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function () {
                // console.log(`FILEREADER RESULT ${reader.result}`);
                _this.url = reader.result;
                console.log(_this);
              //   file.url = reader.result;
              };
            // });
          }
    }

    getNames(){
        const font = this.font;
        const names = font.names[this.platform];
        this.family = (names.preferredFamily && names.preferredFamily.en) || names.fontFamily.en;
        this.style = (names.preferredSubfamily && names.preferredSubfamily.en) || (names.fontSubfamily && names.fontSubfamily.en) || (names.fontFamily && names.fontFamily.en);

        this.cssFamily = this.family + '-' + this.style;
        this.cssStyle = /(italic|oblique)/gi.test(this.style) ? "italic" : "normal";
        this.cssWeight = font.tables.os2.usWeightClass;

    }
    getFeatures(){
        const font = this.font;
        const names = font.names[this.platform];
        const gpos = font.tables.gpos || {};
        const gsub = font.tables.gsub || {};

        const languageSet = new Set(
        [...(gpos.scripts || []), ...(gsub.scripts || [])]
            .flatMap(s => s.script.langSysRecords).map(lsr => lsr.tag)
        );
        const loclLanguages = Array.from(languageSet)
        .map(tag => {
        // tags are four characters, last most commonly space
            const language = opentypeLanguageTags.find(l => l.opentypeTag === tag);
            const name = language ? language.name : tag;
            const htmlTag = language ? language.htmlTag : tag.toLowerCase();
            return ({ tag, name, htmlTag });
        })
        .sort((a, b) => a.name > b.name);
        loclLanguages.unshift({ tag: '', htmlTag: '', name: 'automatic' });

        const stylisticSetNames = Object.getOwnPropertyNames(names)
        .filter(p => /\d+/.test(p))
        .map(p => names[p].en);
        let i = 0;
        const getStylisticSetName = function () {
            return stylisticSetNames[i++];
        };
        this.gposFeatures = [];
        (gpos.features || []).forEach(f => {
        const duplicate = this.gposFeatures.find(ff => ff.tag == f.tag);
        if (!duplicate) {
            const feature = {
            tag: f.tag,
            name: getOpenTypeFeatureName(f.tag),
            };
            this.gposFeatures.push(feature);
        }
        });

        this.gsubFeatures = [];
        (gsub.features || []).forEach(f => {
        const duplicate = this.gsubFeatures.find(ff => ff.tag == f.tag);
        if (!duplicate) {
            const feature = {
            tag: f.tag,
            name: getOpenTypeFeatureName(f.tag),
            uiName: f.feature.uiName,
            };

            if (f.tag == "locl") {
            feature.languages = loclLanguages;
            feature.selectedLanguage = loclLanguages[0];
            } else if (/ss\d\d/.test(f.tag)) {
            const uiName =  f.feature.uiName;
            feature.uiName = uiName && uiName['en'];
            } else if (/cv\d\d/.test(f.tag)) {
            const uiName =  f.feature.featUiLabelName;
            feature.uiName = uiName && uiName['en'];
            // console.log(feature.uiName)
            }
            this.gsubFeatures.push(feature);
        }
        });

        this.variationAxes = [];
        if (font && font.tables.fvar && font.tables.fvar.axes) {
        this.variationAxes = font && font.tables.fvar && font.tables.fvar.axes;
        }

        console.log(this.gposFeatures, this.gsubFeatures, this.variationAxes)
    }
    getPresets(){
        const font = this.font;
        this.presets = [];
        if (font && font.tables.fvar && font.tables.fvar.instances) {
          this.presets = font && font.tables.fvar && font.tables.fvar.instances;
        }
    
        if(!this.selectedPreset) this.selectedPreset = this.presets[0];
    
        var t = this;
        this.presets.forEach(function(p){
          if(Object.keys(p.name).length === 0){
            p.name.en = 'Regular';
          }
          if(p.name.en == 'Regular'){
            t.selectedPreset = p;
          }
        });
    }
    generateFontFace(style, weight){
        this.fontFace = `
        @font-face {
            font-family: "preview";
            src: url('${this.url}');
        }
        `;
        // ${ this.variationAxes.length === 0 ? 'font-weight: bold' : ''}; 
        // document.getElementById("previewFont").innerHTML = "<style>@font-face{font-family: preview;src: url(" + e.target.result + ");}</style>"

        return this.fontFace;
    }
}