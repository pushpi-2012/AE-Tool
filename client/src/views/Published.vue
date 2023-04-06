<template>
    <div class="publish">
        <div class="header">
            <button @click="clickHandler">Edit</button>
        </div>

        <div class="video-container">
            <video :src="status.fname" :width="projectDetails.width" :height="projectDetails.height" controls autoplay muted />
        </div>
    </div>
</template>

<script lang="ts">
    import router from '@/router';
    import Vue from 'vue';
    import { mapActions, mapGetters } from 'vuex';

    export default Vue.extend({
        name: 'Published',
        computed:{
            ...mapGetters({status:'getPublishStatus', projectDetails:'getProjectDetails'})
        },
        mounted(){
        },
        methods:{
            ...mapActions(['publishStatus']),
            clickHandler(){
                this.publishStatus({msg:"init", fname:""});
                router.push('/');
            }
        }
    })
</script>

<style scoped>
    .publish{
        width:100vw;
        height:100vh;
    }
    .header{
        width: 100%;
        height: 50px;
        background: grey;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0px 10px;
    }
    .video-container{
        width: 100vw;
        height: calc(100vh - 50px);
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
