import { ref, watch, computed, Ref, WritableComputedRef } from 'vue';
import { isEqual as isEqualFunc, isUndefined } from 'lodash-es';

type UseNormalModelOptions = {
    prop?: string;
    isEqual?: boolean;
    deep?: boolean;
    defaultValue?: any;
};

export const useNormalModel = (
    props: Record<string, any>,
    emit: any,
    config: UseNormalModelOptions = {},
): [WritableComputedRef<any>, (val: any) => void] => {
    const {
        prop = 'modelValue',
        deep = false,
        isEqual = false,
        defaultValue,
    }: UseNormalModelOptions = config;
    const usingProp: string = prop;
    const currentValue: Ref<boolean> = ref(
        !isUndefined(props[usingProp]) ? props[usingProp] : defaultValue,
    );
    const pureUpdateCurrentValue = (value: any) => {
        if (
            value === currentValue.value ||
            (isEqual && isEqualFunc(value, currentValue.value))
        ) {
            return;
        }
        currentValue.value = value;
    };
    const updateCurrentValue = (value: any) => {
        pureUpdateCurrentValue(value);
        emit(`update:${usingProp}`, currentValue.value);
    };

    watch(
        () => props[usingProp],
        (val) => {
            if (val === currentValue.value) {
                return;
            }
            currentValue.value = val;
        },
        {
            deep,
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
