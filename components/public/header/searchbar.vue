<template>
  <div class="search-panel">
    <!--分为三块，左中右 -->
    <el-row class="m-header-searchbar">
      <el-col :span="3" class="left">
        <img src="//s0.meituan.net/bs/fe-web-meituan/e5eeaef/img/logo.png" alt srcset />
      </el-col>
      <el-col :span="15" class="center">
        <!-- 输入框，分为两个状态，用户输入聚焦时，失去焦点时 -->
        <!-- 输入由内容时，弹出相关内容的搜索，无内容时默认的热门搜索 -->
        <!-- 1.聚焦状态没有输入内容 2.聚焦状态输入内容 3.没有聚焦状态 -->
        <!-- 用两种上下结构实现 -->
        <div class="wrapper">
          <el-input
            v-model="search"
            placeholder="搜索商家或地点"
            @input="input"
            @focus="focus"
            @blur="blur"
          ></el-input>
          <button class="el-button el-button--primary">
            <i class="el-icon-search"></i>
          </button>
          <dl class="hotPlace" v-if="isHotPlace">
            <dt>热门搜索</dt>
            <dd v-for="(item,index) in $store.state.home.hotPlace.slice(0,5)" :key="index">
              <a :href="'/products?keyword='+encodeURIComponent(item.name)">{{item.name}}</a>
            </dd>
          </dl>
          <dl class="searchList" v-if="isSearchList">
            <dd v-for="(item,index) in searchList" :key="index">
              <a :href="'/products?keyword='+encodeURIComponent(item.name)">{{item.name}}</a>
            </dd>
          </dl>
        </div>
        <p class="suggest">
          <a
            :href="'/products?keyword='+encodeURIComponent(item.name)"
            v-for="(item,index) in $store.state.home.hotPlace.slice(0,5)"
            :key="index"
          >{{item.name}}</a>
        </p>
        <ul class="nav">
          <li>
            <nuxt-link to="/" class="takeout">美团外卖</nuxt-link>
          </li>
          <li>
            <nuxt-link to="/" class="movie">猫眼电影</nuxt-link>
          </li>
          <li>
            <nuxt-link to="/" class="hotel">美团酒店</nuxt-link>
          </li>
          <li>
            <nuxt-link to="/" class="apartment">民宿/公寓</nuxt-link>
          </li>
          <li>
            <nuxt-link to="/" class="business">商家入驻</nuxt-link>
          </li>
        </ul>
      </el-col>
      <el-col :span="6" class="right">
        <!-- 再分为三部分 -->
        <ul class="security">
          <li>
            <i class="refund"></i>
            <p class="txt">随时退</p>
          </li>
          <li>
            <i class="single"></i>
            <p class="txt">不满意免单</p>
          </li>
          <li>
            <i class="overdue"></i>
            <p class="txt">过期退</p>
          </li>
        </ul>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  data() {
    return {
      search: "",
      isFocus: false,
      /* 热门词汇，从后台获取 */
      hotPlace: [],
      /* 搜索列表 */
      searchList: []
    };
  },
  computed: {
    isHotPlace: function() {
      /* 用计算属性计算状态 */
      return this.isFocus && !this.search;
    },
    isSearchList: function() {
      return this.isFocus && this.search;
    }
  },
  methods: {
    focus: function() {
      this.isFocus = true;
    },
    blur: function() {
      let self = this;
      setTimeout(function() {
        self.isFocus = false;
      }, 200);
    },
    /* 监听事件，触发向后台发送请求 */
    /* 实现查询接口 */
    /* 延时函数，实现定时发出请求获取数据 */
    input: _.debounce(async function() {
      let self = this;
      let city = self.$store.state.geo.position.city.replace("市", "");
      self.searchList = [];
      let {
        status,
        data: { top }
      } = await self.$axios.get("/search/top", {
        params: {
          input: self.search,
          city
        }
      });
      self.searchList = top.slice(0, 10);
    }, 300)
  }
};
</script>

<style lang="">
</style>