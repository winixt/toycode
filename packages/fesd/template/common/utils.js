// 放工具函数

export function getTargetLabel(map, value) {
    const target = map.find((item) => item.value === value);

    return target ? target.label : value;
}