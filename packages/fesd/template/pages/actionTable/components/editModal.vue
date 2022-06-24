<template>
    <FModal v-model:show="innerVisible" title="新增" :maskClosable="false" :top="54" @ok="confirm">
        <FForm ref="formRefEl" :rules="formRules" :model="formModel" :labelWidth="80">
            <FFormItem label="输入姓名" prop="name">
                <FInput v-model="formModel.name" placeholder="请输入"></FInput>
            </FFormItem>
            <FFormItem label="选择城市">
                <FSelect v-model="formModel.city" clearable placeholder="请单选">
                    <FOption v-for="(item, index) in optionList" :key="index" :value="item.value" :label="item.label"></FOption>
                </FSelect>
            </FFormItem>
            <FFormItem label="选择性别">
                <FRadioGroup v-model="formModel.sex">
                    <FRadio :value="1">男</FRadio>
                    <FRadio :value="2">女</FRadio>
                </FRadioGroup>
            </FFormItem>
            <FFormItem label="年龄范围">
                <FCheckboxGroup v-model="formModel.ageRange">
                    <FCheckbox :value="1 - 10">1-10</FCheckbox>
                    <FCheckbox :value="11 - 30">11-30</FCheckbox>
                    <FCheckbox :value="31 - 60">31-60</FCheckbox>
                </FCheckboxGroup>
            </FFormItem>
        </FForm>
    </FModal>
</template>

<script setup>
import { ref, watch, reactive, nextTick } from 'vue';
import { FModal, FCheckboxGroup, FCheckbox, FSelect, FOption, FInput, FForm, FFormItem, FRadio, FRadioGroup } from '@fesjs/fes-design';
import { useNormalModel } from '@/common/use/useModel';

const props = defineProps({
    visible: Boolean,
    data: Object,
});
const emit = defineEmits(['update:visible']);

const [innerVisible, updateVisible] = useNormalModel(props, emit, {
    prop: 'visible',
});

const formRefEl = ref();

const formModel = reactive({
    ...props.data,
});

const resetFormModel = () => {
    Object.assign(formModel, props.data);
};
watch(
    () => props.data,
    () => {
        resetFormModel();
    },
);

const formRules = {
    name: { required: true, message: '必填' },
};

const optionList = [
    {
        value: 'HuNan',
        label: '湖南',
    },
    {
        value: 'HuBei',
        label: '湖北',
    },
    {
        value: 'ZheJiang',
        label: '浙江',
    },
    {
        value: 'GuangDong',
        label: '广东',
    },
    {
        value: 'JiangSu',
        label: '江苏',
    },
];

const confirm = async () => {
    try {
        await formRefEl.value.validate();
        console.log(formModel.name);
        updateVisible(false);
    } catch (error) {}
};

watch(innerVisible, () => {
    if (!innerVisible.value) {
        resetFormModel();
        nextTick(() => formRefEl.value.clearValidate());
    }
});
</script>
