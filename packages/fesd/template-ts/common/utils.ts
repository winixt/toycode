// 放工具函数

type OptionValue = number | string | boolean;
export interface Option {
    value: OptionValue;
    label: string;
}
export function getTargetLabel(
    options: Option[],
    value: OptionValue,
): OptionValue {
    const target: Option = options.find((item) => item.value === value);

    return target ? target.label : value;
}

// 只适用于双状态
export function findAnotherValue(
    options: Option[],
    currentValue: OptionValue,
): OptionValue {
    const result: Option = options.find((item) => item.value !== currentValue);

    return result ? result.value : null;
}

export function findAnotherLabel(
    options: Option[],
    currentValue: OptionValue,
): string {
    const result: Option = options.find((item) => item.value !== currentValue);

    return result ? result.label : null;
}

export function appendAll(options: Option[]): Option[] {
    return [{ value: null, label: '全部' }, ...options];
}

export function pickData(
    obj: Record<string, any>,
    pick: string[] = [],
): Record<string, any> {
    let result: Record<string, any> = obj;
    for (const key of pick) {
        if (Object.prototype.toString.call(result) === '[object Object]') {
            result = result[key];
        } else {
            result = null;
            break;
        }
    }
    return result;
}
