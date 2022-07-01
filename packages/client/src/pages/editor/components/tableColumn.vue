<template>
    <InfoBlock title="表格">
        <FieldsEdit :fields="columns">
            <template #advance="{ field }">
                <SettingOutlined
                    style="color: #52c41a; padding: 8px"
                    @click="showModal(field)"
                />
            </template>
        </FieldsEdit>
        <FModal
            v-model:show="visibleModal"
            title="高级配置"
            displayDirective="if"
            @ok="confirm"
        >
            <FForm :labelWidth="80">
                <FFormItem label="绑定枚举">
                    <FSelect
                        v-model="currentField!.mappingId"
                        clearable
                        placeholder="请选择"
                    >
                        <FOption
                            v-for="(item, index) in optionList"
                            :key="index"
                            :value="item"
                            :label="item"
                        ></FOption>
                    </FSelect>
                    <!-- TODO 直接编写代码 -->
                </FFormItem>
            </FForm>
        </FModal>
    </InfoBlock>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { FModal, FForm, FFormItem, FSelect, FOption } from '@fesjs/fes-design';
import { SettingOutlined } from '@fesjs/fes-design/icon';
import FieldsEdit from '@/components/fieldsEdit.vue';
import { Field } from '@/common/interface';
import InfoBlock from './infoBlock.vue';

export default defineComponent({
    components: {
        FieldsEdit,
        InfoBlock,
        SettingOutlined,
        FModal,
        FForm,
        FFormItem,
        FSelect,
        FOption,
    },
    setup() {
        const columns = [
            {
                name: 'name',
                title: '名字',
            },
            {
                name: 'age',
                title: '年龄',
            },
        ];
        const optionList = ['STATUS'];

        const visibleModal = ref(false);
        const currentField = ref<Field>();
        const showModal = (field: Field) => {
            visibleModal.value = true;
            currentField.value = { ...field };
        };
        const confirm = () => {
            if (currentField.value) {
                visibleModal.value = false;
                const index = columns.findIndex(
                    (item) => item.name === currentField.value!.name,
                );
                columns.splice(index, 1, currentField.value);
            }
        };

        return {
            columns,
            optionList,

            showModal,
            visibleModal,
            currentField,
            confirm,
        };
    },
});
</script>
