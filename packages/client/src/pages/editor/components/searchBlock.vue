<template>
    <InfoBlock title="搜索区域">
        <FieldsEdit :fields="searchFields" />
    </InfoBlock>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FieldsEdit from '@/components/fieldsEdit.vue';
import InfoBlock from './infoBlock.vue';

export default defineComponent({
    components: {
        FieldsEdit,
        InfoBlock,
    },
    setup() {
        const searchFields = [
            {
                id: '1',
                name: 'name',
                title: '名字',
            },
            {
                id: '2',
                name: 'age',
                title: '年龄',
            },
        ];

        return {
            searchFields,
        };
    },
});
</script>
