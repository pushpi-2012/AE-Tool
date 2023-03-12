<template>
    <div class="main-panel" :style="{minWidth:`${projectDetails.width+40}px;`}">
        <StageElement :style="{transform:`matrix(${zoom.value/100}, 0, 0, ${zoom.value/100}, 0, 0)`,  transformOrigin:'center center'}" />
    </div>
</template>
    
<script lang="ts">
    import Vue from 'vue';
    import { mapGetters, mapActions } from 'vuex';
    import StageElement from './StageElement.vue';

    export default Vue.extend ({
        name:"Main",
        components:{
            StageElement
        },
        data(){
            return {
                top:0,
                left:0
            }
        },
        mounted() { },
        watch:{ 
            zoom(){
                //this.left = 
            }
        },
        computed:{ 
            ...mapGetters({projectDetails:'getProjectDetails', zoom:'getZoomValue'})
        },
        methods:{ },
        updated(){ }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .main-panel{
        height:calc(100vh - 40px - 22vh); 
        overflow:auto;
        display: flex;
        justify-content: center;
        padding:10px;
        background: #efefef;
        position: relative;
    }
</style>
