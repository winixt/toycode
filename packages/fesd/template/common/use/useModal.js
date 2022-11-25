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

    const formModel = ref({
        ..._initData.value,
    });

    const resetFormModel = () => {
        formModel.value = _initData.value;
    };

    const confirm = async () => {
        await formRefEl.value.validate();
        await onConfirm({ ...formModel.value });
        updateVisible(false);
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
    const state = reactive({
        visible: false,
    });
    const show = () => {
        state.visible = true;
    };

    return {
        show,
        state,
    };
}

export function useCommonModal() {
    const state = reactive({
        visible: false,
        rowData: null,
    });
    const show = (currentData) => {
        state.visible = true;
        state.rowData = currentData;
    };

    return {
        state,
        show,
    };
}
