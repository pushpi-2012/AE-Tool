<template>
    <div class="home">
        <Header class="view-1" />
        <Main class="view-2" />
        <RightPanel class="view-3" />
        <TimeLine class="view-4" />

        <ContextMenu v-if="contextMenu.show" />
        <Loader />
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import interact from "interactjs";
    import { mapActions, mapGetters } from 'vuex';

	import ContextMenu from '@/components/ContextMenu.vue';
    import Header from '@/components/Header.vue';
    import Main from '@/components/Main.vue';
    import RightPanel from '@/components/RightPanel.vue';
    import TimeLine from '@/components/TimeLine.vue';
    import Loader from '@/components/Loader.vue';
    import { IKeyframe, ILayer } from '@/store/commonTypes';

    export default Vue.extend({
        name: 'HomeView',
        data(){
            return {
                updateCount:0,
                shiftX:0,
                shiftY:0
            }
        },
        watch:{
            updateCount(){
                const el:HTMLElement = document.querySelector(`#${this.layer.id}`) as HTMLElement;
                let rect:any = el?.getBoundingClientRect();
                const tlayer:ILayer = {...this.layer, element:{...this.layer.element}, keyframes:[...this.layer.keyframes]};
                const keyframe:IKeyframe = {...tlayer.keyframes[this.selectedKeyframeIndex], 
                        elProps:{ ...tlayer.keyframes[this.selectedKeyframeIndex].elProps, width:rect.width, height:rect.height, top:rect.top-this.shiftY, left:rect.left-this.shiftX}};
                
                tlayer.keyframes[this.selectedKeyframeIndex] = keyframe;
                el.style.setProperty("transform", "none");
                el.setAttribute("data-x", "0");
                el.setAttribute("data-y", "0");

                if(keyframe.locked) {
                    this.positionAnimatedFrames(keyframe);
                }else{
                    this.updateLayer(tlayer);
                }
            }
        },
        components: {
            Header,
            Main,
            RightPanel,
            TimeLine,
            ContextMenu,
            Loader
        },
        mounted(){
            const pel:HTMLElement = document.querySelector('.unit-panel') as HTMLElement;
            this.shiftX = pel?.getBoundingClientRect().left;
            this.shiftY = pel?.getBoundingClientRect().top;
                
            const scope = this;
            interact('.resize-drag')
            .resizable({
                // resize from all edges and corners
                edges:{ left: true, right: true, bottom: true, top: true },

                listeners:{
                    move(event:any){
                        var target = event.target;
                        var x = (parseFloat(target.getAttribute('data-x')) || 0);
                        var y = (parseFloat(target.getAttribute('data-y')) || 0);

                        // update the element's style
                        target.style.width = Math.round(event.rect.width) + 'px';
                        target.style.height = Math.round(event.rect.height) + 'px';

                        // translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;
                        
                       /*  scope.top = y;
                        scope.left = x;
                        scope.width = event.rect.width;
                        scope.height = event.rect.height; */

                        target.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';

                        target.setAttribute('data-x', Math.round(x));
                        target.setAttribute('data-y', Math.round(y));
                    },
                    end(){
                        scope.updateCount += 1; 
                    }
                },
                
                modifiers: [
                    // keep the edges inside the parent
                    interact.modifiers.restrictEdges({
                        outer: 'parent'
                    }),

                    // minimum size
                    interact.modifiers.restrictSize({
                        min: { width: 80, height: 40 }
                    })
                ],
                inertia: true
            })
            .draggable({
                listeners: { 
                    move: (evt:any) => {
                        var target = evt.target;
                        var x = (parseFloat(target.getAttribute('data-x')) || 0) + evt.dx;
                        var y = (parseFloat(target.getAttribute('data-y')) || 0) + evt.dy;
                        /* scope.top = y;
                        scope.left = x; */

                        target.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
                        target.setAttribute('data-x', Math.round(x));
                        target.setAttribute('data-y', Math.round(y));
                    },
                    end(){ 
                        scope.updateCount += 1; 
                    }
                },
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true
                    })
                ]
            })
            .on('tap', (evt) => {
                
            })
        },
        computed:{
            ...mapGetters({layer:'getSelectedLayer', selectedKeyframeIndex:"getSelectedKeyframeIndex", contextMenu:'getContextMenu'})
        },
        methods:{
            ...mapActions(['updateLayer','positionAnimatedFrames']),
        }
    });
</script>

<style scoped>
    .home {
        overflow: hidden;
        width:100%;
        display:grid;
        grid-template-areas:
        'header header header header header header header header'
        'main main main main main main main rightPanel'
        'timeLine timeLine timeLine timeLine timeLine timeLine timeLine rightPanel';
        gap:0;
    }

    .view-1 { grid-area: header; }
    .view-2 { grid-area: main; }
    .view-3 { grid-area: rightPanel; justify-content: end; }
    .view-4{ grid-area: timeLine; }
</style>
