export interface IPublishType {
    status:string,
    fname:any
}

export interface IProjectDetails {
    name:string,
    width:number,
    height:number,
    time:number,
    publishStatus:IPublishType,
    bgClr:string
}

export interface IEProps {
    width:number,
    height:number,
    top:number,
    left:number,
    scaleX:number,
    scaleY:number,
    opacity:number;
	rotation:number;
}

export interface IElement {
    type:string,
    bgClr:string,
    id:string
    label:string,
    src:any,
    show:boolean,
    el:string
}

export interface IKeyframe {
    time:number,
    enabled:boolean,
    elProps:IEProps,
    locked:boolean
}

export interface ILayer {
    id:string,
    label:string,
    element:IElement,
    bgClr:string,
    keyframes:Array<IKeyframe>,
    editable:boolean,
    selectedKeyframeIndex:number
}

export interface IComponent {
    label:string,
    type:string,
    el:string
}

export interface IContextMenu {
    show:boolean,
    top:number,
    left:number,
    target:string,
    time:number
}

export interface IState {
    projectDetails:IProjectDetails,
    preview:boolean,
    previewTime:number,
    layers:Array<ILayer>,
    totalLayers:number,
    selectedLayerIndex:number,
    selectedKeyframeIndex:number,
    components:Array<IComponent>,
    contextMenu:IContextMenu
}