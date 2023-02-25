<template>
    <div class="time-ticker" ref="timeTicker" @click="clickHandler">
        <div :style="{left:`${(width/projectTime)*i}px`}" v-for="(time, i) in [...Array(Number(projectTime)).keys()]" :key="i">
            <span style="color:#aaaaaa;">|</span>
            <span style="font-size:10px; margin-top:8px; color:#cccccc;">{{ i }}</span>
        </div>
		<Ticker v-bind:ratio="(width/projectTime)"/> 
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { mapActions, mapGetters } from 'vuex';
    import Ticker from './Ticker.vue';

    export default Vue.extend({
        name: 'Timebar',
        props:{
            width:Number
        },
        components:{ Ticker },
        methods:{
            ...mapActions(['updatePreviewTime', 'updatePreviewStatus']),
            clickHandler(evt:any){
                const el:any = this.$refs.timeTicker;
                const posX:number = evt.clientX - el.getBoundingClientRect().left;
                const time:number = parseFloat(Number(posX*(this.projectTime/this.width)).toFixed(2));
                this.updatePreviewTime(time);
                this.preview && this.updatePreviewStatus(false);
            }
        },
        computed:{
            ...mapGetters({projectTime:'getProjectTime', preview:'getPreviewStatus'})
        }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.time-ticker {
    display:flex;
    height:16px;
    border-bottom: 1px solid black;
    position: relative;

    div {
        position: absolute;
        top:-8px; 
    }
}
</style>
