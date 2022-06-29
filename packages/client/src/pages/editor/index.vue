<template>
    <div class="editor">
        <LeftSetting />
        <div class="page-preview">content</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LeftSetting from './components/leftSetting.vue';

export default defineComponent({
    components: {
        LeftSetting,
    },
});
</script>

<style lang="less">
.editor {
    display: flex;
    height: 100vh;
    .page-preview {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
