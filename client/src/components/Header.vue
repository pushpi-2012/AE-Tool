<template>
    <div class="header">
        <img height="25px" src="../assets/logo.svg" />
        <div class="zoom-holder">
            <b-icon icon="dash-square-fill" font-scale="1.75" :class="zoom.value>zoom.min?'btn':'btn-disable'" @click="zoomHandler(zoom.value>zoom.min?-1:0)" />
            <input type="number" style="margin-left:5px; width:60px;" :step="zoom.step" :value="zoom.value" :max="zoom.max" :min="zoom.min" @change="changeZoomValue($event)"/>
            <label style="margin-right:5px; color:black;">%</label>
            <b-icon icon="plus-square-fill" font-scale="1.75" :class="zoom.value<zoom.max?'btn':'btn-disable'" @click="zoomHandler(zoom.value<zoom.max?1:0)" />
        </div>
        <label>After effect tool</label>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { mapGetters, mapActions } from 'vuex';

    export default Vue.extend({
        name: 'Header',
        props: {
            msg: String
        },
        computed:{
			...mapGetters({zoom:'getZoomValue'})
		},
        methods:{
            ...mapActions(['updateZoomValue']),
            zoomHandler(dir:number) {
                this.updateZoomValue(this.zoom.value + (this.zoom.step * dir));
            },
            changeZoomValue(evt:any){
                this.updateZoomValue(Number(evt.target.value));
            }
        }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .header{
        width:100%;
        padding:5px;
        background-color:#a4a4a4;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color:white;
        height: 40px;
    }

    .btn{
        width:50px;
        height: 50px;
        color:black; 
        cursor:pointer;
    }
    .btn-disable{
        color:grey;
    }

    label{
        margin-bottom: 0px;
    }

    .zoom-holder{
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .v-rule{
        width:1px;
        height: 40px;
        background: white;
    }
</style>
    