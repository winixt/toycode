<template>
    <FCheckboxGroup v-model="selectedFields">
        <FDraggable v-model="innerFields">
            <template #default="{ item }">
                <div class="field-item">
                    <FCheckbox :value="item.id"></FCheckbox>
                    <FInput v-model="item.name" placeholder="字段" />
                    <FInput v-model="item.title" placeholder="字段(中文)" />
                    <slot name="advance" :field="item"></slot>
                </div>
            </template>
        </FDraggable>
    </FCheckboxGroup>
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue';
import {
    FCheckboxGroup,
    FCheckbox,
    FInput,
    FDraggable,
} from '@fesjs/fes-design';
import { Field } from '@/common/interface';

export default defineComponent({
    components: {
        FCheckboxGroup,
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
    setup(props) {
        const innerFields = ref<Field[]>([]);
        const selectedFields = ref<string[]>([]);
        watch(
            () => props.fields,
            () => {
                innerFields.value = props.fields.map((item) => {
                    return {
                        ...item,
                    };
                });

                for (let item of props.fields) {
                    if (item.checked) {
                        selectedFields.value.push(item.id);
                    }
                }
            },
            {
                immediate: true,
            },
        );

        return {
            innerFields,
            selectedFields,
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
