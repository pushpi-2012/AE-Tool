<script lang="ts">
    import Vue from 'vue';
    import { mapActions, mapGetters } from 'vuex';
    
    import { gsap } from "gsap";
    import { IKeyframe, ILayer } from '@/store/commonTypes';
    const defaultImage = require('../assets/default-image.jpg');

    export default Vue.component('StageElement', {
        props:{
            layer:{},
            index:Number,
            cls:String
        },
        computed:{
            ...mapGetters({projectDetails:'getProjectDetails', layers:'getLayers', selectedLayerIndex:'getSelectedLayerIndex', 
                           preview:'getPreviewStatus', previewTime:'getPreviewTime'})
        },
        methods:{
            ...mapActions(['updateSKIndex','updateSLIndex', 'updateLayer']),
            clickHandler(evt:any){
                this.updateSLIndex(Number(evt.target.id.split('-')[1]));
                //selected keyframe value should be nearest to preview time value//
                let timeDiff:number = this.projectDetails.time;
                let kindex:number = -1;
                this.layers[this.selectedLayerIndex].keyframes.forEach((keyframe:IKeyframe, index:number)=>{
                    if(Math.abs(this.previewTime - keyframe.time) < timeDiff){
                        timeDiff = Math.abs(this.previewTime - keyframe.time);
                        kindex = index;
                    }
                });
                kindex>=0 && this.updateSKIndex(kindex);
            },
            getImage(layer:ILayer){
                let value:any = ""
                if(layer.element.type === "img"){
                    if(layer.element.src.length>=3){
                        value = layer.element.src;
                    }else{
                        value = defaultImage;
                    }
                }
                return value;
            }
        },
        render(createElement:any) {
            const layer:ILayer = this.layer as ILayer;
            return createElement(layer.element.type, {
                attrs:{
                    class:this.cls,
                    id:layer.element.id
                },
                style:{
                    width:layer.keyframes[this.index].elProps.width+"px",
                    height:layer.keyframes[this.index].elProps.height+"px",
                    background:layer.element.type!=="input" && layer.element.bgClr,
                    top:layer.keyframes[this.index].elProps.top+"px",
                    left:layer.keyframes[this.index].elProps.left+"px",
                    opacity:layer.keyframes[this.index].elProps.opacity*.01,
                    transform:`rotate(${layer.keyframes[this.index].elProps.rotation}deg)`, 
                    border:this.selectedLayerIndex===this.index ? "2px solid blue" : "1px solid black",
                    objectFit:layer.element.type === "img" && "contain",
                    visibility:layer.element.show ? "visible" : "hidden"
                }
            })
        }
    })
</script>