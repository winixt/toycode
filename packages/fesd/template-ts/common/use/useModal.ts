import type {
    ComputedRef,
    WritableComputedRef,
} from 'vue';
import {
    computed,
    isRef,
    nextTick,
    reactive,
    ref,
    watch,
} from 'vue';
import { useNormalModel } from './useModel';

interface useModalOptions {
    props: Record<string, any>
    emit: any
    initData?: ComputedRef<any>
    onConfirm?: any
}

export function useModal({
    props,
    emit,
    initData,
    onConfirm,
}: useModalOptions) {
    const [innerVisible, updateVisible]: [
        WritableComputedRef<any>,
        (val: any) => void,
    ] = useNormalModel(props, emit, {
        prop: 'visible',
    });

    const formRefEl = ref();
    const _initData = computed(() => {
        return isRef(initData) ? initData.value : initData;
    });

    const formModel = ref({
        ..._initData.value,
    });

    const resetFormModel = () => {
        formModel.value = {
            ..._initData.value,
        };
    };

    const confirm = async () => {
        await formRefEl.value.validate();
        await onConfirm({ ...formModel.value });
        updateVisible(false);
    };

    watch(innerVisible, () => {
        if (!innerVisible.value) {
            nextTick(() => {
                resetFormModel();
                nextTick(() => {
                    formRefEl.value.clearValidate();
                });
            });
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

export interface ModalState {
    visible: boolean
    rowData: Record<string, any>
}
export function useCommonModal() {
    const state = reactive<ModalState>({
        visible: false,
        rowDate: null,
    });
    const show = (currentData: any) => {
        state.visible = true;
        state.rowData = currentData;
    };

    return {
        state,
        show,
    };
}
