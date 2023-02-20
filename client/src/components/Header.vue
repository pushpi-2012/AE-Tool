<template>
    <div class="header">
        <img height="25px" src="../assets/logo.svg" />
        <label>After effect tool</label>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    export default Vue.extend({
        name: 'Header',
        props: {
            msg: String
        },
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .header{
        width:100%;
        padding:5px;
        background-color:#7A7A7A;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color:white;
        height: 30px;
    }
</style>
    