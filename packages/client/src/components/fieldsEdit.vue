<template>
    <FDraggable v-model="innerFields">
        <template #default="{ item }">
            <div class="field-item">
                <FCheckbox v-model="item.checked"></FCheckbox>
                <FInput v-model="item.name" placeholder="字段" />
                <FInput v-model="item.title" placeholder="字段(中文)" />
                <slot name="advance" :field="item"></slot>
            </div>
        </template>
    </FDraggable>
</template>

<script lang="ts">
import { defineComponent, watch, PropType } from 'vue';
import { FCheckbox, FInput, FDraggable } from '@fesjs/fes-design';
import { Field } from '@/common/interface';
import { useNormalModel } from '@/common/use/useModel';

export default defineComponent({
    components: {
        FCheckbox,
        FInput,
        FDraggable,
    },
    props: {
        fields: {
            type: Array as PropType<Field[]>,
            default: () => [],
        },
    },
    emits: ['update:fields'],
    setup(props, { emit }) {
        const [innerFields, updateFields] = useNormalModel(props, emit, {
            prop: 'fields',
        });

        watch(
            innerFields,
            () => {
                updateFields(innerFields.value);
            },
            {
                deep: true,
            },
        );

        return {
            innerFields,
        };
    },
});
</script>

<style lang="less" scoped>
.field-item {
    display: flex;
    align-items: center;
    margin: 8px 0;
    user-select: none;
    > * {
        margin-right: 16px !important;
    }
}
</style>
