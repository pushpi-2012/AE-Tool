<template>
    <div class="main-panel" :style="{minWidth:`${projectDetails.width+40}px`}">
        <StageElement />
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
        mounted() { },
        watch:{ },
        computed:{ 
            ...mapGetters({projectDetails:'getProjectDetails'})
        },
        methods:{ },
        updated(){ }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .main-panel{
        height:calc(100vh - 30px - 22vh); 
        overflow:auto;
        display: flex;
        justify-content: center;
        padding:10px;
        background: #efefef;
        position: relative;
    }
</style>
