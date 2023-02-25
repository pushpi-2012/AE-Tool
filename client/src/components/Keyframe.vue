<template>
    <div :class="{'key-frame':layers[layerIndex].keyframes[keyframeIndex].enabled, 'disabled':!layers[layerIndex].keyframes[keyframeIndex].enabled}" ref="keyframe" 
        :style="{left:`${left}px`}" @mousedown="startDragging" @click="selectKeyframe($event, layers[layerIndex].keyframes[keyframeIndex].enabled)">
        <div v-if="layerIndex===selectedLayerIndex && keyframeIndex===selectedKeyframeIndex" class="keyframe-child"></div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
	import { mapGetters, mapActions } from 'vuex';

    export default Vue.extend({
        name: 'Keyframe',
        props:{
            width:Number,
            prnt:{},
            layerIndex:Number,
            keyframeIndex:Number
        },
        data(){
            const el:any = this.prnt;
            return {
                shiftX:el?.getBoundingClientRect().left,
                left:0,
                updatedTime:0,
                gapX:0,
                dragging:false
            }
        },
        mounted(){
            this.gapX = 5;
            this.updatedTime = this.layers[this.layerIndex].keyframes[this.keyframeIndex].time;
            this.left = (this.width/this.projectTime)*this.updatedTime - this.gapX;
        },
        watch:{ 
            projectTime(){
                this.left = (this.width/this.projectTime)*this.updatedTime - this.gapX;
            }
        },
        computed:{
			...mapGetters({projectTime:'getProjectTime', layers:'getLayers', selectedLayerIndex:'getSelectedLayerIndex', 
                            selectedKeyframeIndex:'getSelectedKeyframeIndex'})
		},
        methods:{
            ...mapActions(['udpateContextMenu']),
            startDragging(evt:any){
                if(!this.layers[this.layerIndex].keyframes[this.keyframeIndex].enabled || 
                    this.layers[this.layerIndex].keyframes[this.keyframeIndex].locked){ return };
                
                this.dragging = true;
                (this.prnt as any).addEventListener("mousemove", this.moveHandler);
                (this.prnt as any).addEventListener("mouseup", this.stopDragging);
            },
            moveHandler(evt:any){
                this.left = evt.clientX - this.shiftX - this.gapX;
            },
            stopDragging(){
                if(this.dragging){
                    this.dragging = false;
                    (this.prnt as any).removeEventListener('mousemove', this.moveHandler);
                    (this.prnt as any).removeEventListener('mouseup', this.stopDragging);
                    this.updatedTime = ((this.left+this.gapX)/this.width)*this.projectTime;
                    this.$emit("clicked", this.updatedTime);
                }
            },
            selectKeyframe(evt:any, enabled:boolean){
                enabled && this.layers[this.layerIndex].keyframes[this.keyframeIndex].enabled && this.$emit("clicked", this.updatedTime);
            }
        }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .key-frame{
        background:white; 
        position:absolute; 
        border-radius:2px; 
        height:12px;
        width:12px;
        padding: 1.5px;
        cursor: pointer;
        top:4px;
        border:2px solid black;
        transform:rotate(45deg);
        z-index: 1;
    }

    .disabled{
        position:absolute; 
        border-radius:2px; 
        height:12px;
        width:12px;
        padding: 1.5px;
        top:4px; 
        transform:rotate(45deg);
        background:blue;
        z-index: 0;
        border:none
    }

    .keyframe-child{
        background:red; 
        width:5px; 
        height:5px;
        pointer-events: none;
    }
</style>
