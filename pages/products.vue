<template>
  <el-row class="page-product">
    <!-- 左边大的 -->
    <el-col :span="19">
      <crumbs :keyword="keyword"></crumbs>
      <categroy :type="types" :areas="areas"></categroy>
      <list :list="list"></list>
    </el-col>
    <!-- 右边的地图 -->
    <el-col :span="5">
      <!-- 变量需要宽高经纬度 -->
      <amap v-if="point.length" :width="230" :height="290" :point="point"></amap>
    </el-col>
  </el-row>
</template>

<script>
import Crumbs from "@/components/products/crumbs.vue";
import Categroy from "@/components/products/categroy.vue";
import List from "@/components/products/list.vue";
import Amap from "@/components/public/map.vue";
export default {
  components: {
    Crumbs,
    Categroy,
    List,
    Amap
  },
  data() {
    return {
      list: [],
      types: [],
      areas: [],
      keyword: "",
      point: []
    };
  },
  async asyncData(ctx) {
    let keyword = ctx.query.keyword;
    let city = ctx.store.state.geo.position.city;
    let {
      status,
      data: { count, pois }
    } = await ctx.$axios.get("/search/resultsByKeywords", {
      params: {
        keyword,
        city
      }
    });
    let {
      status: status2,
      data: { areas, types }
    } = await ctx.$axios.get("/categroy/crumbs", {
      params: {
        city
      }
    });
    if (status === 200 && count > 0 && status2 === 200) {
      return {
        list: pois
          .filter(item => item.photos.length)
          .map(item => {
            return {
              type: item.type,
              img: item.photos[0].url,
              name: item.name,
              comment: Math.floor(Math.random() * 10000),
              rate: Number(item.biz_ext.rating),
              price: Number(item.biz_ext.cost),
              scene: item.tag,
              tel: item.tel,
              status: "可订明日",
              location: item.location,
              module: item.type.split(";")[0]
            };
          }),
        keyword,
        areas: areas.filter(item => item.type !== "").slice(0, 5),
        types: types.filter(item => item.type !== "").slice(0, 5),
        point: (pois.find(item => item.location).location || "").split(",")
      };
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/css/products/index.scss";
</style>