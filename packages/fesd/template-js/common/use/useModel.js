import { computed, ref, watch } from 'vue';
import { isEqual } from 'lodash-es';

export const useNormalModel = (
    props,
    emit,
    config = {
        prop: 'modelValue',
    },
) => {
    const usingProp = config?.prop ?? 'modelValue';
    const currentValue = ref(props[usingProp]);
    const pureUpdateCurrentValue = (value) => {
        if (!isEqual(value, currentValue.value))
            currentValue.value = value;
    };
    const updateCurrentValue = (value) => {
        pureUpdateCurrentValue(value);
        emit(`update:${usingProp}`, value);
    };

    watch(
        () => props[usingProp],
        (val) => {
            pureUpdateCurrentValue(val);
        },
    );

    return [
        computed({
            get() {
                return currentValue.value;
            },
            set(value) {
                updateCurrentValue(value);
            },
        }),
        updateCurrentValue,
    ];
};
