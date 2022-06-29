import { ref, watch, computed, WritableComputedRef } from 'vue';
import { isEqual } from 'lodash-es';

export const useNormalModel = (
    props: Record<string, any>,
    emit: any,
    config: {
        prop?: string;
    } = {
        prop: 'modelValue',
    },
): [WritableComputedRef<any>, (val: any) => void] => {
    const usingProp = config?.prop ?? 'modelValue';
    const currentValue = ref(props[usingProp]);
    const pureUpdateCurrentValue = (value: any) => {
        if (!isEqual(value, currentValue.value)) {
            currentValue.value = value;
        }
    };
    const updateCurrentValue = (value: any) => {
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
