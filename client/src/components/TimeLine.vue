<template>
    <div class="timeline">
		<div class="left-panel">
			<div v-for="(layer, i) in layers" :key="i">
				<div class="layer-box" :style="{background:layer.bgClr, border:selectedLayerIndex===i?'2px solid blue':'1px solid black'}"
					draggable  @dragstart="dragHandler(i)" @dragend="dragEnd" >
					<b-icon v-if="layer.element.show" icon="eye-fill" @click="controlVisibility(i)" />
					<b-icon v-if="!layer.element.show" icon="eye-slash-fill" @click="controlVisibility(i)" />
					<hr style="width:20px; background: black; transform: rotate(90deg); position: absolute; left:12px;"/>
					<div @dblclick="dblClickHandler(i)" @click="clickHander(i)" style="margin-left: 5px;">
						<input v-model="layer.label" v-bind:disabled="!listLayers[i]" @blur="blurHandler"
							ref="input" @change="changeLayer" @keyup.enter="blurHandler" />
					</div>
					<b-icon icon="x-circle" variant="danger" @click="removeLayer(i)" />
				</div>
				<div v-if="draging" @drop="dropHandler(i)" @dragover.prevent @dragenter.prevent style="height:5px; background: green; opacity: .5;" />
			</div>
		</div>

		<div id="rightPanel" class="right-panel" ref="rightPanel">
			<Timebar v-if="layers.length>=1" v-bind:width="width"/>
			<div class="layer-holder">
				<div v-for="(layer, i) in layers" :key="i" style="position:relative;" @contextmenu="showContextMenu($event, i)">
					<div class="layer-box" @dblclick="addNewKeyframe($event, i)" :style="{background:layer.bgClr, border:selectedLayerIndex===i?'2px solid blue':'1px solid black'}"></div>
					
					<Keyframe v-for="(keyframe, j) in layer.keyframes" :key="keyframe.time"
						v-bind:layerIndex="i" v-bind:keyframeIndex="j"
						v-bind:enabled="keyframe.enabled" v-bind:time="keyframe.time"
						v-bind:width="width" v-bind:prnt="$refs.rightPanel" 
						v-on:clicked="keyframeSelected($event, j, i)" :id="'key_'+i+'_'+j" />
				</div>
			</div>
		</div>
    </div>
</template>
  
<script lang="ts">
	import Vue from 'vue';
	import { mapGetters, mapActions } from 'vuex';

	import Keyframe from './Keyframe.vue';
	import Timebar from './Timebar.vue';
	import { IContextMenu, IKeyframe, ILayer } from '@/store/commonTypes';
	
	export default Vue.extend({
		name: 'TimeLine',
		mounted(){
			let el:any = this.$refs.rightPanel;
            this.width = el.getBoundingClientRect().width;
			this.shiftX = el.getBoundingClientRect().left;
		},
		data(){
			return {
				listLayers:new Array<boolean>(1).fill(false),
				draging:false,
				width:-1,
				shiftX:0
			}
		},
		components:{ Timebar, Keyframe },
		computed:{
			...mapGetters({layers:'getLayers', selectedLayerIndex:'getSelectedLayerIndex', projectTime:'getProjectTime', 
						selectedKeyframeIndex:'getSelectedKeyframeIndex', previewTime:'getPreviewTime'})
		},
		methods:{
			...mapActions(['removeLayer', 'updateLayer', 'updateSLIndex', 'shuffleLayers', 'addKeyframe', 'updateSKIndex', 
							'updatePreviewTime', 'udpateContextMenuStatus', 'udpateContextMenu', 'updateKeyframe', 'updateLayerVisibility']),
			clickHander(index:number){
				this.updateSLIndex(index);
				let timeDiff:number = this.projectTime;
                let kindex:number = -1;
                this.layers[this.selectedLayerIndex].keyframes.forEach((keyframe:IKeyframe, index:number)=>{
                    if(Math.abs(this.previewTime - keyframe.time) < timeDiff){
                        timeDiff = Math.abs(this.previewTime - keyframe.time);
                        kindex = index;
                    }
                });
				kindex>=0 && this.updateSKIndex(kindex);
			},
			dblClickHandler(index:number){
				this.listLayers = new Array<boolean>(...this.listLayers).fill(false);
				this.listLayers[index] = true;

				let el:any = this.$refs.input;
				setTimeout(()=>el[index].focus(), 50);
			},
			blurHandler(){
				this.listLayers = new Array<boolean>(...this.listLayers).fill(false);
			},
			changeLayer(evt:any){
				const target:any = evt.currentTarget;
				const layer:ILayer = { ...this.layers[this.selectedLayerIndex], element:{...this.layers[this.selectedLayerIndex].element, name:target.value} }
				this.updateLayer(layer);
			},
			dragHandler(index:number){
				this.updateSLIndex(index);
				this.draging = true;
			},
			dropHandler(index:number){
				this.draging = false;
				if(this.selectedLayerIndex != index){
					let tarr:any = [...this.layers];
					let tlayer:any = tarr.splice(this.selectedLayerIndex, 1);
					tarr.splice(index, 0, tlayer[0]);
					this.shuffleLayers(tarr);
				}
			},
			dragEnd(){
				this.draging = false;
			},
			addNewKeyframe(evt:any, layerIndex:number){
				if(layerIndex === this.selectedLayerIndex){
					const time:number = ((evt.clientX - this.shiftX)/this.width)*this.projectTime;
					this.addKeyframe(time);
				}
			},
			keyframeSelected(ktime:any, kindex:number, lindex:number){
				lindex!==this.selectedLayerIndex && this.updateSLIndex(lindex);
				this.updatePreviewTime(ktime);
				this.updateSKIndex(kindex);

				const keyframe:IKeyframe = this.layers[this.selectedLayerIndex].keyframes[kindex];
				keyframe.time = ktime;
				this.updateKeyframe(keyframe);
			},
			controlVisibility(index:number){
				const layer:ILayer = {...this.layers[index], element:{...this.layers[index].element}};
				layer.element.show  = !layer.element.show;
				this.updateLayerVisibility({layer:layer, index:index});
			},
			showContextMenu(evt:any, index:number){
                evt.preventDefault();
				const time:number = (Number(evt.clientX - this.shiftX)/this.width)*this.projectTime.toFixed(2) as number;
                const cmenu:IContextMenu = {
                    show:true,
                    top:evt.clientY,
                    left:evt.clientX,
                    target:evt.target,
					time:evt.target.className.indexOf("key-frame")!==-1?-1:time
                }
				
				if(evt.target.className === "key-frame"){
					this.updateSKIndex(Number(evt.target.getAttribute("id").split("_")[2]));
				}
				this.updateSLIndex(index);
                this.udpateContextMenu(cmenu);
            }
		},
		updated(){  }
	});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
	.timeline{
		width:100%;
		height:22vh;
		border:black 1px solid;
		display: flex;

		.left-panel{
			border-right: 1px solid black;
			padding-top:16px;
			width:180px;

			input{
				width:130px; 
				height:16px; 
				font-size:11px;
				background: transparent;
				border: none;
			}

			.drop-box{
				width:180px; 
				height:5px; 
				background:black;
			}
		}

		.right-panel {
			width: calc(100% - 180px);
			position: relative;

			.ticker{
				width:1px;
				height:16px;
				background:white;
				position:absolute;
				transition: left .25s;
				border:1px solid black;
				z-index:100;
				top:0px;
			}
		}

		.layer-holder {
			height: calc(22vh - 16px);
		}

		.layer-box{
			height: 22px;
			display:flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>
