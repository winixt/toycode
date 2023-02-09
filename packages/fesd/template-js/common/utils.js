// 放工具函数

export function getTargetLabel(options, value) {
    const target = options.find(item => item.value === value);

    return target ? target.label : value;
}

// 只适用于双状态
export function findAnotherValue(options, currentValue) {
    const result = options.find(item => item.value !== currentValue);

    return result ? result.value : null;
}

export function findAnotherLabel(options, currentValue) {
    const result = options.find(item => item.value !== currentValue);

    return result ? result.label : null;
}

export function appendAll(options) {
    return [{ value: null, label: '全部' }, ...options];
}

export function pickData(obj, pick = []) {
    let result = obj;
    for (const key of pick) {
        if (Object.prototype.toString.call(result) === '[object Object]') {
            result = result[key];
        }
        else {
            result = null;
            break;
        }
    }
    return result;
}
