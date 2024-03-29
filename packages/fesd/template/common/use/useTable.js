import { request } from '@fesjs/fes';
import { ref, unref, reactive } from 'vue';
/**
 *
 * @param {
 *  api: string;
 *  params: object | reactiveObject,
 *  formatParams: function 格式化请求参数
 *  transform: function 格式化响应内容,
 *  dataField: string | cycle,
 *  method: string
 * } options
 *
 */
export function useSimpleTable(options) {
    options = {
        isInit: true,
        dataField: 'cycle',
        method: 'POST',
        ...options,
    };
    const dataSource = ref([]);

    const innerFormatParams = (params) => {
        if (params && options.formatParams) {
            return options.formatParams(params);
        }
        return params;
    };

    let preParams = {
        ...innerFormatParams(options.params),
    };
    const getParams = (params) => {
        if (params) {
            preParams = innerFormatParams({
                ...preParams,
                ...unref(params),
            });
        }
        return preParams;
    };

    const queryDataSource = (params) => {
        request(options.api, getParams(params), {
            method: options.method,
        }).then((res) => {
            const result = Array.isArray(res) ? res : res[options.dataField];
            dataSource.value = options.transform
                ? options.transform(result)
                : result;
        });
    };

    if (options.isInit) {
        queryDataSource();
    }

    return {
        dataSource,
        refresh: queryDataSource,
    };
}

/**
 *
 * @param {
 *  api: string;
 *  params: object | reactiveObject,
 *  formatParams: function 格式化请求参数
 *  transform: function 格式化响应内容,
 *  dataField: string | 'cycle'
 *  pageField: string | 'page'
 *  isInit: boolean | 'true'
 * } options
 *
 */
export function useTable(options) {
    options = {
        isInit: true,
        dataField: 'cycle',
        pageField: 'page',
        method: 'POST',
        ...options,
    };
    const dataSource = ref([]);

    const pagination = reactive({
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
    });

    const innerFormatParams = (params) => {
        if (params && options.formatParams) {
            return options.formatParams(params);
        }
        return params;
    };

    let preParams = {
        ...innerFormatParams(options.params),
    };
    const getParams = (params) => {
        if (params) {
            preParams = innerFormatParams({
                ...preParams,
                ...unref(params),
            });
        }
        return {
            ...preParams,
            page: {
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
            },
        };
    };

    const queryDataSource = (params) => {
        request(options.api, getParams(params), {
            method: options.method,
        }).then((res) => {
            const result = res[options.dataField];
            dataSource.value = options.transform
                ? options.transform(result, res)
                : result;
            pagination.totalCount = res[options.pageField].totalCount;
        });
    };

    const changePage = (current) => {
        pagination.currentPage = current;
        queryDataSource();
    };
    const changePageSize = (pageSize) => {
        pagination.currentPage = 1;
        pagination.pageSize = pageSize;
        queryDataSource();
    };

    const refresh = (params) => {
        pagination.currentPage = 1;
        queryDataSource(params);
    };

    if (options.isInit) {
        refresh();
    }

    return {
        dataSource,
        pagination,
        changePage,
        changePageSize,
        refresh,
    };
}
