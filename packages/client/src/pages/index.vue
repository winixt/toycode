<template>
    <div style="padding: 32px">hello world</div>
</template>

<script lang="ts">
import { defineRouteMeta } from '@fesjs/fes';

defineRouteMeta({
    name: 'index',
    title: '首页',
});
export default {
    setup() {
        return {};
    },
};
</script>
