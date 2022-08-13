import { ref, isRef, reactive, computed, nextTick, watch } from 'vue';
import { useNormalModel } from './useModel';

export function useModal({ props, emit, initData, onConfirm }) {
    const [innerVisible, updateVisible] = useNormalModel(props, emit, {
        prop: 'visible',
    });

    const formRefEl = ref();
    const _initData = computed(() => {
        if (isRef(initData)) {
            return initData.value;
        }
        return initData;
    });

    const formModel = reactive({
        ..._initData.value,
    });

    const resetFormModel = () => {
        Object.assign(formModel, _initData.value);
    };

    const confirm = async () => {
        try {
            await formRefEl.value.validate();
            console.log(formModel.name);
            await onConfirm({ ...formModel });
            updateVisible(false);
        } catch (error) {}
    };

    watch(innerVisible, () => {
        if (!innerVisible.value) {
            resetFormModel();
            nextTick(() => formRefEl.value.clearValidate());
        }
    });

    watch(_initData, () => {
        resetFormModel();
    });

    return {
        innerVisible,
        formRefEl,
        confirm,
        formModel,
    };
}

export function useAddModal() {
    const visible = ref(false);
    const show = () => {
        visible.value = true;
    };

    return {
        show,
        visible,
    };
}

export function useUpdateModal() {
    const visible = ref(false);
    const data = ref();
    const show = (currentData) => {
        visible.value = true;
        data.value = currentData;
    };

    return {
        visible,
        data,
        show,
    };
}
