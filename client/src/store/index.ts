import Vue from 'vue';
import Vuex, { Store, ActionContext } from 'vuex';

import { IComponent, IContextMenu, IElement, IKeyframe, ILayer, IProjectDetails, IPublishType, IState } from './commonTypes';
import BaseJson from './baseJson';
import { uploadFiles } from '@/components/Utils';
import router from '@/router';

Vue.use(Vuex);

const blankLayer:ILayer = {
    id:"",
    label:"",
    bgClr:"",
    element : {
        type:"",
        bgClr:"",
        id:"",
        label:"",
        src:"",
        show:true,
        el:""
    },
    editable:false,
    keyframes:new Array<IKeyframe>(),
    selectedKeyframeIndex:0
}

const blankKeyframe:IKeyframe = {
    time:1,
    enabled:true,
    locked:false,
    elProps:{
        width:0,
        height:0,
        top:0,
        left:0,
        opacity:100,
        rotation:0,
        scaleX:1,
        scaleY:1
    }
}

const state: IState = {
    projectDetails:{
        name:"test-1",
        width:1280,
        height:720,
        time:30,
        publishStatus:{
            status:"init",
            fname:""
        },
        bgClr:"red"
    },
    layers:new Array<ILayer>(),
    totalLayers:0,
    selectedLayerIndex:-1,
    selectedKeyframeIndex:0,
    preview:false,
    previewTime:.5,
    contextMenu:{
        show:false,
        top:0,
        left:0,
        target:"",
        time:-1
    },
    components:new Array<IComponent>({label:"Video", type:"video", el:"div"}, {label:"Image", type:"image", el:"img"},{label:"Input", type:"text", el:"input"})
};

const getLayerIndex = (id:string) => {
    let index = -1;
    for(let j:number=0; j<state.layers.length; j++){
        if(state.layers[j].id === id){
            index = j;
            break;
        }
    }
    return index;
}

const positionKeyframes = (layer:ILayer, start:number, end:number) => {
    const fps:number = 1000/40;
    const timediff:number = (layer.keyframes[end].time - layer.keyframes[start].time)*fps;
    const fw:number = layer.keyframes[end].elProps.width - layer.keyframes[start].elProps.width;
    const fh:number = layer.keyframes[end].elProps.height - layer.keyframes[start].elProps.height;
    const ft:number = layer.keyframes[end].elProps.top - layer.keyframes[start].elProps.top;
    const fl:number = layer.keyframes[end].elProps.left - layer.keyframes[start].elProps.left;
    const fo:number = layer.keyframes[end].elProps.opacity - layer.keyframes[start].elProps.opacity;
    const fr:number = layer.keyframes[end].elProps.rotation - layer.keyframes[start].elProps.rotation;

    for(let i:number=start+1; i<end; i++){
        layer.keyframes[i].elProps.width = parseFloat((layer.keyframes[i-1].elProps.width+(fw/timediff)).toFixed(2));
        layer.keyframes[i].elProps.height = parseFloat((layer.keyframes[i-1].elProps.height+(fh/timediff)).toFixed(2));
        layer.keyframes[i].elProps.top = parseFloat((layer.keyframes[i-1].elProps.top+(ft/timediff)).toFixed(2));
        layer.keyframes[i].elProps.left = parseFloat((layer.keyframes[i-1].elProps.left+(fl/timediff)).toFixed(2));
        layer.keyframes[i].elProps.opacity = parseFloat(layer.keyframes[i-1].elProps.opacity+(fo/timediff).toFixed(2));
        layer.keyframes[i].elProps.rotation = parseFloat(layer.keyframes[i-1].elProps.rotation+(fr/timediff).toFixed(2));
    }
}

const getLayerClr = (type:string) => {
    let clr:string = "#FFFFFF";
    switch(type){
        case "Video":
            clr = "#faf4cf";
            break;
        
        case "Image":
            clr = "#fad6cf";
            break;

        case "Input":
            clr = "#cffadb";
            break;

        case "Gallery":
            clr = "#d7cffa";
            break;
    }

    return clr;
}

const mutations = {
    changeProjectDetails(state: IState, target:HTMLInputElement) {
        state.projectDetails = {...state.projectDetails, [target.name]:target.value}
    },
    addLayer(state: IState, layer:ILayer){
        state.layers.push(layer);
        state.totalLayers++;
    },
    removeLayer(state: IState, index:number){
        state.layers.splice(index, 1);
    },
    publishStatus(state: IState, status:IPublishType){
        state.projectDetails.publishStatus = {...status};
    },
    updateSLIndex(state:IState, index:number=-1){
        state.selectedLayerIndex = index!=-1 ? index : state.layers.length-1;
    },
    updateSKIndex(state:IState, index:number=-1){
        state.selectedKeyframeIndex = index!=-1 ? index : state.layers.length-1;
    },
    updateSLKIndex(state:IState, index:number=0){
        const layers:Array<ILayer> = [...state.layers ];
        layers[state.selectedLayerIndex].selectedKeyframeIndex = index;
        state.layers = layers;
    },
    updateLayer(state:IState, obj:any){
        state.layers.splice(obj.index, 1, obj.layer);
    },
    shuffleLayers(state:IState, list:Array<ILayer>){
        state.layers = list;
    },
    updatePreviewStatus(state:IState, val:boolean){
        state.preview = val;
    },
    updatePreviewTime(state:IState, val:number){
        state.previewTime = parseFloat(val.toFixed(2));
    },
    udpateContextMenu(state:IState, cmenu:IContextMenu){
        state.contextMenu = cmenu;
    }
};

const actions = {
    changeProjectDetails(context: ActionContext<IState, IState>, evt: Event) {
        context.commit('changeProjectDetails', evt.target);
    },
    published(context: ActionContext<IState, IState>){
        context.commit('publishStatus', {status:"processing", fname:""});
        const baseJson = BaseJson;
        baseJson.project.duration = state.projectDetails.time;
		baseJson.project.width = state.projectDetails.width;
		baseJson.project.height = state.projectDetails.height;
		baseJson.project.unit = state.projectDetails.name;
        
        const formData:any = new FormData();
        formData.enctype = "multipart/form-data";
        const videoData:any = new FormData();
        videoData.enctype = "multipart/form-data";

        let vindex:number = 1;
        let iindex:number = 1;
        for(let j:number=0; j<state.layers.length; j++){
            (state.layers[j].element.type === "image") && formData.append("image", state.layers[j].element.src);
            (state.layers[j].element.type === "video") && videoData.append("video", state.layers[j].element.src);

            let obj:any = {
				"type":state.layers[j].element.type,
				"in":0,
				"out":state.projectDetails.time
			}

            //obj.val = obj.type==="video" || obj.type==="image" ? state.layers[j].element.src : state.layers[j].element.label;
            const pattern = /\.([0-9a-z]+)(?:[\?#]|$)/i;
            obj.val = state.layers[j].element.label;
            if(obj.type === "video"){
                obj.val = `assets/videos/video_${vindex}.${state.layers[j].element.src.name?.split(".").pop()}`;
                vindex++;
            }else if(obj.type === "image"){
                obj.val = `assets/image_${iindex}.${state.layers[j].element.src.name?.split(".").pop()}`;
                iindex++;
            }

            let tarr:Array<any> = new Array<any>();
            for(let k:number=0; k<state.layers[j].keyframes.length; k++){
                if(state.layers[j].keyframes[k].enabled){
                    let pos:any = {
                        "w":state.layers[j].keyframes[k].elProps.width,
                        "h":state.layers[j].keyframes[k].elProps.height,
                        "x":state.layers[j].keyframes[k].elProps.left,
                        "y":state.layers[j].keyframes[k].elProps.top,
                        "opacity":state.layers[j].keyframes[k].elProps.opacity,
                        "keyframe":state.layers[j].keyframes[k].time,
                        "animate":true
                    };
                    tarr.push(pos);
                }
            }

            obj.pos = tarr;
            //******static for now will be changed later*****/
            if(state.layers[j].element.type === "text"){
                obj.props = {
                    "clr":"0.0,0.0,0.0",
                    "size":22,
                    "font":"Arial",
                    "style":"bold"
                }
            }
            
            baseJson.project.elements[j] = obj;
            //baseJson.project.elements.splice(1, 0, obj);
        }

        formData.append('folder', state.projectDetails.name);
        videoData.append('folder', state.projectDetails.name);

       uploadFiles(formData, videoData, baseJson).then((resolve:any) => {
            router.push("/video");
            //http://techslides.com/demos/sample-videos/small.mp4
            context.commit('publishStatus', {status:"published", fname:resolve.fname});
        })
    },
    publishStatus(context: ActionContext<IState, IState>, status:IPublishType){
        context.commit('publishStatus', status);
    },
    removeLayer(context: ActionContext<IState, IState>, index:number){
        context.commit('removeLayer', index);
        context.commit('updateSLIndex');
        context.commit('updateSKIndex', 0);
    },
    addLayer(context: ActionContext<IState, IState>, comp:IComponent){
        let layer:ILayer = { ...blankLayer, element:{...blankLayer.element}, keyframes:new Array<IKeyframe>() };
        layer.id = `layer-${state.totalLayers}`;
        layer.label = `${comp.label}-${state.totalLayers}`;
        layer.bgClr = getLayerClr(comp.label);
        layer.element.type = comp.type;
        layer.element.el = comp.el;
        layer.element.bgClr = "0xcccccc";
        layer.element.id = layer.id;
        layer.element.label = comp.label;

        let keyframe:IKeyframe = { ...blankKeyframe, elProps:{...blankKeyframe.elProps}, time:state.previewTime }
        switch(comp.label){
            case "Video" :
                keyframe.elProps.width = state.projectDetails.width;
                keyframe.elProps.height = state.projectDetails.height;
                break;

            case "Image" :
                keyframe.elProps.width = state.projectDetails.width/2;
                keyframe.elProps.height = state.projectDetails.height/2;
                keyframe.elProps.top = (state.projectDetails.height - keyframe.elProps.height)/2;
                keyframe.elProps.left = (state.projectDetails.width - keyframe.elProps.width)/2;
                break;

            case "Input" :
                keyframe.elProps.width = 250;
                keyframe.elProps.height = 60;
                keyframe.elProps.top = (state.projectDetails.height - keyframe.elProps.height)/2;
                keyframe.elProps.left = (state.projectDetails.width - keyframe.elProps.width)/2;
                break;
                
            case "Gallery" :
                keyframe.elProps.width = 600;
                keyframe.elProps.height = 150;
                keyframe.elProps.top = (state.projectDetails.height - keyframe.elProps.height);
                keyframe.elProps.left = 80;
                break;
        }

        layer.keyframes.push(keyframe);
        context.commit('addLayer', layer);
        context.commit('updatePreviewTime', keyframe.time);
        context.commit('updateSLIndex');
        context.commit('updateSKIndex', 0);
    },
    updateSLIndex(context: ActionContext<IState, IState>, index:number){
        context.commit('updateSLIndex', index);
    },
    updateSKIndex(context: ActionContext<IState, IState>, index:number){
        context.commit('updateSKIndex', index);
    },
    updateLayer(context: ActionContext<IState, IState>, layer:ILayer){
        context.commit('updateLayer', {index:state.selectedLayerIndex, layer:layer});
    },
    updateLayerVisibility(context: ActionContext<IState, IState>, obj:any){
        context.commit('updateLayer', {index:obj.index, layer:obj.layer});
    },
    shuffleLayers(context: ActionContext<IState, IState>, list:Array<ILayer>){
        context.commit('shuffleLayers', list);
    },
    //keyframe specific for every layer//
    updateSLKIndex(context: ActionContext<IState, IState>, index:number){
        context.commit('updateSLKIndex', index);
    },
    activateKeyframe(context: ActionContext<IState, IState>, time:number){
        let index:number = -1;
        const layer:ILayer = {...state.layers[state.selectedLayerIndex], keyframes:[...state.layers[state.selectedLayerIndex].keyframes]}
        for(let j:number=0; j<state.layers[state.selectedLayerIndex].keyframes.length; j++){
            if(state.layers[state.selectedLayerIndex].keyframes[j].time === parseFloat(Number(time).toFixed(2))){
                index = j;
                break;
            }
        }

        layer.keyframes[index].enabled = true;
        layer.keyframes[index].locked = true;
        context.commit('updateLayer', {index:state.selectedLayerIndex, layer:layer});
        context.commit('updateSKIndex', index);
    },
    addKeyframe(context: ActionContext<IState, IState>, t:number){
        const time:number = parseFloat(t.toFixed(2))
        const layer:ILayer = {...state.layers[state.selectedLayerIndex] };
        const keyframe:IKeyframe = { ...blankKeyframe, time:time, enabled:true, elProps:{...layer.keyframes[layer.keyframes.length-1].elProps}};
        layer.keyframes.push(keyframe);
        
        //sorting needs to be done with respect to time//
        layer.keyframes.sort((k1:IKeyframe, k2:IKeyframe) => k1.time-k2.time);
        context.commit('updateLayer', {index:state.selectedLayerIndex, layer:layer});
        context.commit('updatePreviewTime', time);
        context.commit('updateSKIndex', layer.keyframes.findIndex((k1:IKeyframe)=>k1.time===time));
    },
    removeKeyframe(context: ActionContext<IState, IState>){
        const layer:ILayer = {...state.layers[state.selectedLayerIndex], keyframes:[...state.layers[state.selectedLayerIndex].keyframes]};
        let leftIndex:number = -1, rightIndex:number = -1;
        
        if(layer.keyframes[state.selectedKeyframeIndex].locked){
            for(let j:number=state.selectedKeyframeIndex-1; j>=0; j--){
                if(layer.keyframes[j].enabled){
                    leftIndex = j;
                    break;
                }
            }

            for(let k:number=state.selectedKeyframeIndex+1; k<layer.keyframes.length; k++){
                if(layer.keyframes[k].enabled){
                    rightIndex = k;
                    break;
                }
            }
        }
        
        leftIndex = leftIndex!==-1 ? leftIndex+1 : state.selectedKeyframeIndex;
        rightIndex = rightIndex!==-1 ? rightIndex : state.selectedKeyframeIndex+1;
        layer.keyframes.splice(leftIndex, rightIndex-leftIndex);

        context.commit('updateLayer', {index:state.selectedLayerIndex, layer:layer});
        context.commit('updateSKIndex', leftIndex>0?leftIndex-1:leftIndex);
    },
    updateKeyframe(context: ActionContext<IState, IState>, kf:IKeyframe){
       const layer:ILayer = {...state.layers[state.selectedLayerIndex], 
                            element:{...state.layers[state.selectedLayerIndex].element},
                            keyframes:[...state.layers[state.selectedLayerIndex].keyframes]};
       layer.keyframes.splice(state.selectedKeyframeIndex, 1, kf);
       context.commit('updateLayer', {index:state.selectedLayerIndex, layer:layer});
    },
    updatePreviewStatus(context: ActionContext<IState, IState>, val:boolean){
        context.commit('updatePreviewStatus', val);
    },
    updatePreviewTime(context: ActionContext<IState, IState>, val:number){
        context.commit('updatePreviewTime', val);
    },
    udpateContextMenu(context: ActionContext<IState, IState>, cmenu:IContextMenu){
        context.commit('udpateContextMenu', cmenu);
    },
    animateKeyframe(context: ActionContext<IState, IState>, obj:any){
        const layer:ILayer = { ...state.layers[state.selectedLayerIndex], keyframes:[...state.layers[state.selectedLayerIndex].keyframes] };
        let leftIndex:number = -1;
        let rightIndex:number = -1;
        const fps:number = .04;

        if(obj.tween){
            for(let i:number=0; i<layer.keyframes.length; i++){
                if(layer.keyframes[i].time > obj.time && layer.keyframes[i].enabled){
                    leftIndex = i-1;
                    break;
                }
            }
            rightIndex = leftIndex+1;
            layer.keyframes.splice(leftIndex, 1, {...layer.keyframes[leftIndex], locked:true});
            layer.keyframes.splice(rightIndex, 1, {...layer.keyframes[rightIndex], locked:true});

            const timediff:number = (layer.keyframes[rightIndex].time - layer.keyframes[leftIndex].time)*1/fps;
            for(let j:number=leftIndex+1; j<leftIndex+Math.round(timediff); j++){
                const keyframe:IKeyframe = { ...blankKeyframe, elProps:{...blankKeyframe.elProps} };
                layer.keyframes.splice(j, 0, keyframe);
                keyframe.enabled = false;
                keyframe.time = Number((layer.keyframes[j-1].time + fps).toFixed(2));
            }

            positionKeyframes(layer, leftIndex, leftIndex+Math.round(timediff));
            context.commit('updateLayer', {index:state.selectedLayerIndex, layer:layer});
            context.commit('updateSKIndex', leftIndex+Math.round(timediff));
        }else{
            for(let i:number=layer.keyframes.length-1; i>=0; i--){
                if(layer.keyframes[i].time < obj.time && layer.keyframes[i].enabled){
                    leftIndex = i;
                    break;
                }
            }
            for(let k:number=leftIndex+1; k<layer.keyframes.length; k++){
                if(layer.keyframes[k].enabled){
                    rightIndex = k;
                    break;
                }
            }

            layer.keyframes.splice(leftIndex, 1, {...layer.keyframes[leftIndex], locked:false});
            layer.keyframes.splice(rightIndex, 1, {...layer.keyframes[rightIndex], locked:false});

            layer.keyframes.splice(leftIndex+1, rightIndex-leftIndex-1);
            context.commit('updateLayer', {index:state.selectedLayerIndex, layer:layer});
            context.commit('updateSKIndex', leftIndex);
        }
    },
    positionAnimatedFrames(context: ActionContext<IState, IState>, selectedKeyframe:IKeyframe){
        const layer:ILayer = {...state.layers[state.selectedLayerIndex], keyframes:[...state.layers[state.selectedLayerIndex].keyframes]};
        layer.keyframes[state.selectedKeyframeIndex] = selectedKeyframe;
        let leftIndex:number = -1, rightIndex:number = -1;

        for(let j:number=state.selectedKeyframeIndex+1; j<layer.keyframes.length; j++){
            if(layer.keyframes[j].enabled){
                rightIndex = j;
                break;
            }
        }
        for(let k:number=state.selectedKeyframeIndex-1; k>=0; k--){
            if(layer.keyframes[k].enabled){
                leftIndex = k;
                break;
            }
        }

        leftIndex !== state.selectedKeyframeIndex && leftIndex !== -1 && positionKeyframes(layer, leftIndex, state.selectedKeyframeIndex);
        rightIndex != state.selectedKeyframeIndex && rightIndex !== -1 && positionKeyframes(layer, state.selectedKeyframeIndex, rightIndex);
        context.commit('updateLayer', {index:state.selectedLayerIndex, layer:layer});
    }
};

const store:Store<IState> =  new Vuex.Store({
    state,
    getters: {
        getProjectDetails(){
            return state.projectDetails;
        },
        getLayers(){
            return state.layers;
        },
        getSelectedLayer(){
            return state.layers[state.selectedLayerIndex];
        },
        getSelectedLayerIndex(){
            return state.selectedLayerIndex;
        },
        getSelectedKeyframeIndex(){
            return state.selectedKeyframeIndex;
        },
        getSelectedLKIndex(){
            return state.layers[state.selectedLayerIndex].selectedKeyframeIndex;
        },
        getComponentList(){
            return state.components
        },
        getProjectTime(){
            return state.projectDetails.time
        },
        getPreviewStatus(){
            return state.preview;
        },
        getPreviewTime(){
            return state.previewTime;
        },
        getContextMenu(){
            return state.contextMenu;
        },
        getSelectedKeyframe(){
            return state.layers[state.selectedLayerIndex].keyframes[state.selectedKeyframeIndex]
        },
        getPublishStatus(){
            return state.projectDetails.publishStatus;
        }
    },
    mutations,
    actions,
    modules: { }
})

export default store;