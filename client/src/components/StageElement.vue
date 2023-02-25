<script lang="ts">
    import Vue from 'vue';
    import { mapActions, mapGetters } from 'vuex';
    
    import { IKeyframe, ILayer } from '@/store/commonTypes';
    const defaultImage = require('../assets/default-image.jpg');
    const playIcon = require('../assets/play-icon.png');
    const pauseIcon = require('../assets/pause-icon.png');

    export default Vue.component('StageElement', {
        computed:{
            ...mapGetters({projectDetails:'getProjectDetails', layers:'getLayers', selectedLayerIndex:'getSelectedLayerIndex', 
                           preview:'getPreviewStatus', previewTime:'getPreviewTime'})
        },
        methods:{
            ...mapActions(['updateSKIndex','updateSLIndex', 'updateLayer']),
            clickHandler(evt:any){
                if(evt.target.className.indexOf("btn-ctrls") !== -1){
                    let el:any = document.querySelector("#videoPlayer");
                    
                    if(evt.target.getAttribute('id') === "btn-play"){
                        this.isPaused = false;
                        el.play();
                    }else{
                        this.isPaused = true;
                        el.pause();
                    }
                    return;
                }
                
                let layerIndex:number = -1;
                for(let j:number=0; j<this.layers.length; j++){
                    if(this.layers[j].id === evt.target.id){
                        layerIndex = j;
                        break;
                    }
                }

                this.updateSLIndex(layerIndex);
                //selected keyframe value should be nearest to preview time value//
                let timeDiff:number = this.projectDetails.time;
                let kindex:number = -1;
                this.layers[layerIndex].keyframes.forEach((keyframe:IKeyframe, index:number)=>{
                    if(Math.abs(this.previewTime - keyframe.time) < timeDiff){
                        timeDiff = Math.abs(this.previewTime - keyframe.time);
                        kindex = index;
                    }
                });

                kindex>=0 && this.updateSKIndex(kindex);
            },
            getKeframeIndex(layer:ILayer):number{
                for(let j:number = layer.keyframes.length-1; j >= 0; j--){
                    if(this.previewTime >= layer.keyframes[j].time || (j === 0 && this.previewTime<=layer.keyframes[j].time)){
                        return j;
                    }
                }
                return -1;
            },
            getImage(layer:ILayer){
                let value:any = ""
                if(layer.element.type === "image" || layer.element.type === "video"){
                    value = (typeof(layer.element.src) !== "string") ? URL.createObjectURL(layer.element.src) : defaultImage;
                }

                return value;
            }
        },
        data(){
            return {
               tmpLayers:new Array<number>(100).fill(0),
               isPaused:false
            }
        },
        watch:{ },
        render(createElement:any) {
            return createElement("div", {
                attrs: {
                    id: "container",
                    style: `width:${this.projectDetails.width}px; height:${this.projectDetails.height}px; background:white`,
                    class:"unit-panel"
                }
            }, 
            this.layers.map((layer:ILayer, index:number) => {
                const cls:string = this.selectedLayerIndex !== index ? "stage-el" : "stage-el resize-drag";
                
                if(!this.preview){
                    this.tmpLayers[index] = this.getKeframeIndex(layer) || 0;
                }else{
                    /* this.tmpLayers[index] = this.previewTime >= layer.keyframes[this.tmpLayers[index]].time ? this.tmpLayers[index]+1 : this.getKeframeIndex(layer);
                    if(this.tmpLayers[index] >= layer.keyframes.length){
                        this.tmpLayers[index] = layer.keyframes.length - 1;
                    } */

                    this.tmpLayers[index] = this.previewTime >= layer.keyframes[this.tmpLayers[index]+1]?.time ? this.tmpLayers[index]+1 : this.tmpLayers[index];
                }

                const videoEl:any = (layer.element.type ==="video" && typeof(layer.element.src) !== "string") && createElement('video', {
                        attrs:{
                            class:'video-container',
                            autoplay:true,
                            muted:true,
                            id:'videoPlayer'
                        }
                    }, [createElement('source', {
                        attrs:{
                            src:this.getImage(layer),
                            type:"video/mp4"
                        }
                    }) 
                ]);

                const vcontrols:any = (layer.element.type ==="video" && typeof(layer.element.src) !== "string") && createElement('div', {
                    attrs:{
                        class:'v-controls',
                    }
                },[createElement('div', {
                    attrs:{
                        id:'btn-play',
                        class:"btn-ctrls"
                    },
                    style:{
                        background:`url(${playIcon})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center center',
                        visibility:this.isPaused?"visible":"hidden"
                    },
                    on:{
                        click:()=>this.clickHandler
                    }
                }), createElement('div', {
                    attrs:{
                        id:'btn-pause',
                        class:"btn-ctrls"
                    },
                    style:{
                        background:`url(${pauseIcon})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center center',
                        visibility:this.isPaused?"hidden":"visible"
                    },
                    on:{
                        click:()=>this.clickHandler
                    }
                })])
                
                return createElement(layer.element.el, {
                    attrs:{
                        class:cls,
                        id:layer.element.id,
                        src:this.getImage(layer)
                    },
                    style:{
                        width:layer.keyframes[this.tmpLayers[index]].elProps.width+"px",
                        height:layer.keyframes[this.tmpLayers[index]].elProps.height+"px",
                        background:layer.element.type!=="text" && layer.element.bgClr,
                        top:layer.keyframes[this.tmpLayers[index]].elProps.top+"px",
                        left:layer.keyframes[this.tmpLayers[index]].elProps.left+"px",
                        opacity:layer.keyframes[this.tmpLayers[index]].elProps.opacity*.01,
                        transform:`rotate(${layer.keyframes[this.tmpLayers[index]].elProps.rotation}deg)`, 
                        border:this.selectedLayerIndex===index ? "2px solid blue" : "1px solid black",
                        objectFit:layer.element.type === "image" && "contain",
                        visibility:layer.element.show ? "visible" : "hidden"
                    },
                    on:{
                        click:this.clickHandler,
                        change:(evt:any)=>{
                            const layer:ILayer = {...this.layers[this.selectedLayerIndex], element:{...this.layers[this.selectedLayerIndex].element, label:evt.target.value}}
                            this.updateLayer(layer);
                        }
                    }
                }, [videoEl, vcontrols])
            }))
        }
    })
</script>

<style scoped>
    .unit-panel{
        border:black 1px solid;
        background:white;
        position: relative;
    }
    .stage-el{
        position:absolute;
        cursor: pointer;
    }

    .v-controls{
        width:100%;
        height:40px;
        position:absolute;
        top:calc(100% - 60px);
        left:50px;
    }

    .btn-ctrls{
        width:40px;
        height:40px;
        position: absolute;
    }

    .video-container{ 
        width:100%;
        height:100%;
        pointer-events:none;
    }

</style>