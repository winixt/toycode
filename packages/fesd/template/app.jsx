import { access, defineRuntimeConfig } from '@fesjs/fes';
import PageLoading from '@/components/pageLoading.vue';
import UserCenter from '@/components/userCenter.vue';
import { BASE_URL } from '@/common/constants';

export default defineRuntimeConfig({
    beforeRender: {
        loading: <PageLoading />,
        action() {
            const { setRole } = access;
            return new Promise((resolve) => {
                setTimeout(() => {
                    setRole('admin');
                    // 初始化应用的全局状态，可以通过 useModel('@@initialState') 获取，具体用法看@/components/UserCenter 文件
                    resolve({
                        userName: '子一',
                    });
                }, 1000);
            });
        },
    },
    layout: {
        customHeader: <UserCenter />,
    },
    request: {
        baseURL: BASE_URL,
        dataHandler(data) {
            return data?.result ? data.result : data;
        },
        errorHandler(error) {
            if (error.response) {
                // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // 请求已经成功发起，但没有收到响应
                // `error.request` 在浏览器中是 XMLHttpRequest 的实例，
                // 而在node.js中是 http.ClientRequest 的实例
                console.log(error.request);
            } else if (error.type) {
                // 插件异常
                console.log(error.msg);
            } else {
                // 发送请求时出了点问题
                console.log('Error', error.message);
            }
            console.log(error.config);
        },
    },
});
