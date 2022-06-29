<template>
    <InfoBlock title="表格">
        <FieldsEdit :fields="columns" />
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
        const columns = [
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
            columns,
        };
    },
});
</script>
