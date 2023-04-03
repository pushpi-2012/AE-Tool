<template>
    <div class="right-panel">
        <div class="trns-panel" v-if="!preview">
            <div class="row-prop" v-for="(row, i) in projectRow" :key="i">
                <label>{{ capitalize(row.label) }}</label>
                <input :type="row.label!=='name'?'number':'text'" :name="row.label" 
                    v-model="projectDetails[row.label]" @change="changeProjectDetails" />
            </div>
        
            <hr />
            <div v-if="selectedLayerIndex !== -1">
                <div v-if="layers[selectedLayerIndex].element.label==='Video' || layers[selectedLayerIndex].element.label==='Image'" style="display:flex; align-items:center;flex-direction:column;">
                    <b-form-file accept="*" @change="fileSelected" size="sm"  style="width:250px;"/>
                    <hr style="height:2px; width:100%;"/>
                </div>
                
                <div v-for="(prop,i) in Object.keys(layers[selectedLayerIndex].keyframes[selectedKeyframeIndex].elProps)" :key="i">
                    <div class="row-prop" v-if="prop !== 'scaleX' && prop !== 'scaleY'">
                        <label> {{ capitalize(prop) }} </label>
                        <input type="number" :name="prop" step="1" :min="0" 
                            :value="Math.round(layers[selectedLayerIndex].keyframes[selectedKeyframeIndex].elProps[prop])"
                            :max="prop==='angle' ? 360 : prop==='opacity' ? 100 : 3000"
                            @change="changeElement($event, prop)">
                    </div>
                </div>
            </div>
        </div>
    
        <div class="comp-panel">
            <div class="box" v-for="(comp, i) in componentList" :key="i" @click="addLayer(comp)">{{comp.label}}</div>
            <div class="btn" @click="published">Publish</div>
        </div>
    </div>
</template>
    
<script lang="ts">
    import Vue from 'vue';
    import { mapActions, mapGetters } from 'vuex';
    import { IKeyframe, ILayer } from '@/store/commonTypes';
    
    export default Vue.extend({
        name: 'RightPanel',
        data(){
            return {
                img:null,
                bgImg:null,
                projectRow:[{label:"name", type:"input"}, {label:"width", type:"input"}, {label:"height", type:"input"}, {label:"time", type:"input"}]
            }
        },
        computed:{
            ...mapGetters({layers:'getLayers', selectedLayerIndex:'getSelectedLayerIndex', componentList:"getComponentList", 
                            selectedKeyframeIndex:"getSelectedKeyframeIndex", preview:'getPreviewStatus',  projectDetails:'getProjectDetails'})
        },
        methods:{
            ...mapActions(['changeProjectDetails', 'published', 'addLayer', 'updateLayer', 'positionAnimatedFrames']),
            fileSelected(evt:any){
                const files:Array<File> = evt.target.files;
                if (files && files.length) {
                    const layer:ILayer = { ...this.layers[this.selectedLayerIndex], element:{...this.layers[this.selectedLayerIndex].element} };
                    layer.element.src = files[0];
                    this.updateLayer(layer);
                }
            },
            changeElement(evt:any, key:string){
                const layer:ILayer = {...this.layers[this.selectedLayerIndex], keyframes:[...this.layers[this.selectedLayerIndex].keyframes]};
                const keyframe:IKeyframe = {...layer.keyframes[this.selectedKeyframeIndex], 
                                            elProps:{...layer.keyframes[this.selectedKeyframeIndex].elProps, [key]:Math.round(Number(evt.target.value))}};
                layer.keyframes.splice(this.selectedKeyframeIndex, 1, keyframe);

                if(keyframe.locked){
                    this.positionAnimatedFrames(keyframe);
                }else{
                    this.updateLayer(layer);
                }
            },
            capitalize(str:string){
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            }
        },
        updated(){ }
    });
</script>
    
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .right-panel{
        background:#C9C9C9;
        padding:10px;
        min-width: 295px;
    
        .row-prop{
            display:flex;
            flex-direction: row;
            justify-content: space-between;
            height: 24px;
            align-items: center;
        
            input {
                width:75px; 
                height:17px;
            }
        }
    }
    .trns-panel{
        border:black 1px solid;
        background:white;
        width:100%;
        height:50%;
        padding:10px;
    }
    .comp-panel{
        border:black 1px solid;
        background:white;
        width:100%;
        height:50%;
        background:#C9C9C9;
        padding:10px;
    }
    
    .box{
        width:100%;
        height:10%;
        background:white;
        color:black;
        margin-top:10px;
        font-size:14px;
        font-weight:bold;
        cursor:pointer;
        display:flex;
        justify-content:center;
        align-items:center;
    }
    
    .btn{
        width:100%;
        height:40px;
        color:white;
        background:black;
        margin-top:10px;
        display:flex;
        justify-content:center;
        align-items:center;
        cursor:pointer;
    }
</style>
    