import { ref } from 'vue';
import { request } from '@fesjs/fes';
import { pickData } from '../utils';

/**
 * 
 * @param {*} url 
 * @param {*} options
        params?: SearchParams
        immediate?: boolean
        transform?: (input: DataT) => DataT
        defaultValue?: () => DataT
        pick?: string[]
 */
export function useFetch(url, options) {
    options = Object.assign(
        {
            immediate: true,
        },
        options,
    );
    const data = ref(options.defaultValue?.());
    const pending = ref(false);

    const queryDataSource = async () => {
        try {
            pending.value = true;
            let result = await request(url, options.params || {}, {
                mergeRequest: true,
            });
            if (options.pick) {
                result = pickData(result, options.pick);
            }
            data.value =
                (options.transform ? options.transform(result) : result) ??
                options.defaultValue?.();
        } catch (e) {
            console.log(e);
        } finally {
            pending.value = false;
        }
    };

    if (options.immediate) {
        queryDataSource();
    }

    return {
        data,
        pending,
        refresh: queryDataSource,
    };
}
