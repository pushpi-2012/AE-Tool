<template>
    <div class="right-menu" @click="clickHandler" @contextmenu="(evt)=>evt.preventDefault()">
        <div class="rmenu-card" :style="{left:`${left}px`, top:`${top}px`}">
            <div :class="{'rmenu-btn':contextMenu.target!=='key-frame', 'disabled':contextMenu.target==='key-frame' || contextMenu.target==='disabled'}" 
                @click="animateHandler($event, true)">Add Tween</div>
            <div :class="{'rmenu-btn':contextMenu.target==='disabled', 'disabled':contextMenu.target==='key-frame' || contextMenu.target!=='disabled'}" 
                @click="animateHandler($event, false)">Remove Tween</div>
            <div :class="{'rmenu-btn':contextMenu.target!=='key-frame', 'disabled':contextMenu.target==='key-frame'}" 
                @click="keyframeHandler($event, true)">Add keyframe</div>
            <div :class="{'rmenu-btn':contextMenu.target==='key-frame', 'disabled':contextMenu.target!=='key-frame' || layer.keyframes.length<=1}" 
                @click="keyframeHandler($event, false)">Remove keyframe</div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { mapActions, mapGetters } from 'vuex';
    import { IContextMenu } from '@/store/commonTypes';

    export default Vue.extend({
        name:"ContextMenu",
        data(){
            return {
                top:0,
                left:0
            }
        },
        mounted(){
            this.top = this.contextMenu.top-250;
            this.left = this.contextMenu.left-125;
        },
        computed:{
           ...mapGetters({contextMenu:'getContextMenu', layer:'getSelectedLayer'})
        },
        methods:{
            ...mapActions(['udpateContextMenu', 'removeKeyframe','addKeyframe', 'animateKeyframe']),
            clickHandler(){
                const cmenu:IContextMenu = {
                    show:false,
                    top:0,
                    left:0,
                    target:"",
                    time:-1
                }
                this.udpateContextMenu(cmenu);
            },
            animateHandler(evt:any, val:boolean){
                const cls:any = (evt.target as any).className;
                if(cls.indexOf('disabled')===-1){
                    this.animateKeyframe({tween:val, time:this.contextMenu.time});
                    this.clickHandler();
                }
            },
            keyframeHandler(evt:any, val:boolean){
                const cls:any = (evt.target as any).className;
                if(cls.indexOf('disabled')!==-1){ return; }

                this.clickHandler();
                if(!val){
                    this.removeKeyframe();
                }else{
                    this.addKeyframe();
                }
            }
        }
    })
</script>

<style scoped lang="scss">
    .right-menu {
        width:100vw;
        height:100vh;
        position:absolute;
        background:rgba(0, 0, 0, 0.15);
        z-index:900;
    }

    .rmenu-card{
        width:250px;
        height:200px;
        box-shadow:0px 0px 5px grey;
        border-radius:5px;
        background:white;
        position:absolute;
        padding:10px;
    }
    
    .rmenu-btn {
        height:30px;
        cursor:pointer;
        display: flex;
        align-items: center;
        padding-left:10px;
        &:hover{
            background: #dedede;
        }
    }

    .disabled{
        height:30px;
        cursor:auto;
        display: flex;
        align-items: center;
        padding-left:10px;
        opacity: .5;
        &:hover{
            background: white;
        }
    }
</style>