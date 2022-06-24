import { ref, reactive } from 'vue';

export function useForm(options) {
    const formRefEl = ref();
    const formModel = reactive({
        ...options.initData,
    });

    const resetFormModel = () => {
        Object.assign(formModel, options.initData);
    };

    return {
        formRefEl,
        formModel,
        resetFormModel,
    };
}
