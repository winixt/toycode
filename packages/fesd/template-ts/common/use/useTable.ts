import { request } from '@fesjs/fes';
import { ref, unref, reactive } from 'vue';

export interface UseTableOptions {
    api: string;
    params?: Record<string, any>;
    formatParams?: <T>(params: T) => T;
    transform?: <T>(input: T) => T;
    dataField?: string;
    pageField?: string;
    isInit?: boolean;
}

export function useSimpleTable(options: UseTableOptions) {
    options = {
        isInit: true,
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
    const queryDataSource = (params?: Record<string, any>) => {
        request(options.api, getParams(params)).then((res) => {
            const result = options.dataField ? res[options.dataField] : res;
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
export function useTable(options: UseTableOptions) {
    options = {
        isInit: true,
        dataField: 'cycle',
        pageField: 'page',
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

    const queryDataSource = (params?: Record<string, any>) => {
        request(options.api, getParams(params)).then((res) => {
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

    const refresh = (params?: Record<string, any>) => {
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
