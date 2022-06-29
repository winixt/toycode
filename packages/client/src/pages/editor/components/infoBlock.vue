<template>
    <div class="info-block">
        <h2 class="info-block-header">
            <span class="info-block-header-left">
                <span>{{ title }}</span>
            </span>
            <DownOutlined
                v-if="visibleIcon"
                :class="['info-block-icon', !visibleRef && 'is-hide']"
                @click="toggleVisible"
            />
        </h2>
        <div :class="['info-block-content', !visibleRef && 'is-hide']">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { DownOutlined } from '@fesjs/fes-design/icon';

export default defineComponent({
    components: {
        DownOutlined,
    },
    props: {
        title: String,
        visibleIcon: {
            type: Boolean,
            default: true,
        },
    },
    setup() {
        const visibleRef = ref(true);
        const toggleVisible = () => {
            visibleRef.value = !visibleRef.value;
        };

        return {
            visibleRef,
            toggleVisible,
        };
    },
});
</script>

<style lang="less" scoped>
.info-block {
    color: #333;
    font-size: 14px;
    background-color: #fff;
    margin: 0 0 16px 8px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e4e4;

    &-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0;
        font-weight: 700;
        line-height: 20px;
        color: #333;
        font-size: 14px;

        &-left {
            display: inline-flex;
            align-items: center;
            > span {
                display: inline-block;
            }
        }
    }

    &-content {
        margin-top: 4px;
        opacity: 1;
        height: auto;

        &.is-hide {
            opacity: 0;
            height: 0;
        }
    }

    &-icon {
        padding: 8px;
        cursor: pointer;
        transition: 0.3s all;
        transform-origin: center center;
        &.is-hide {
            transform: rotate(180deg);
        }
    }
}
</style>
