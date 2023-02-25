<template>
    <div :style="{left:`${previewTime*ratio}px`}">
        <label style="width:30px; position: absolute; left:-15px; margin-top:-20px;">{{ previewTime }}</label>
        <div class="ticker"></div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { mapActions, mapGetters } from 'vuex';

    export default Vue.extend({
        name: 'Ticker',
        props: {
            ratio:Number
        },
        data(){
            return {
                interval:-1,
                keyPressed:false
            }
        },
        watch:{
            preview(){
                clearInterval(this.interval);
                if(this.preview){
                    //this.updatePreviewTime(0);
                    this.animateTimeline();
                }
            }
        },
        mounted(){
            document.addEventListener('keydown', (evt) => {
                if(evt.key === "Control" && !this.keyPressed){
                    this.keyPressed = true;
                }
			})

			document.addEventListener('keyup', (evt) => {
                !this.keyPressed && evt.key==="Enter" && this.updatePreviewStatus(false);

				if(evt.key === "Enter" && this.keyPressed){
                    this.updatePreviewStatus(!this.preview);
                    this.keyPressed = false;
				}
			})
        },
        computed:{
            ...mapGetters({time:'getProjectTime', preview:'getPreviewStatus', previewTime:'getPreviewTime'})
        },
        methods:{
            ...mapActions(['updatePreviewStatus', 'updatePreviewTime']),
            animateTimeline(){
				this.interval = setInterval(()=>{
                    this.updatePreviewTime(this.previewTime + .04);
				}, 40);
			}
        }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .ticker{
        width:1px;
        height:30px;
        background:red;
        position:absolute;
        transition: left .25s;
        border:1px solid black;
        z-index:100;
        top:0px;
    }
</style>
