<template>
  <div class="m-iselect">
    <span class="name">按省份选择：</span>
    <el-select v-model="pvalue" placeholder="省份">
      <el-option v-for="item in province" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
    <el-select v-model="cvalue" :disabled="!city.length" placeholder="城市">
      <el-option v-for="item in city" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
    <el-select
      v-model="input"
      filterable
      remote
      reserve-keyword
      clearable
      placeholder="请输入城市中文或拼音"
      :remote-method="remoteMethod"
      :loading="loading"
      @change="handleSelect"
    >
      <el-option v-for="item in cvalues" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  data() {
    return {
      province: [],
      pvalue: "",
      city: [],
      cvalue: "",
      input: "",
      cities: [],
      cvalues: [],
      loading: false
    };
  },
  watch: {
    pvalue: async function(newPvalue) {
      let self = this;
      let {
        status,
        data: { city }
      } = await self.$axios.get(`/geo/province/${newPvalue}`);
      if (status === 200) {
        self.city = city.map(item => {
          return {
            value: item.id,
            label: item.name
          };
        });
        /* 切换省份之后上一次选择的城市要被清空 */
        self.cvalue = "";
      }
    }
  },
  mounted: async function() {
    let self = this;
    let {
      status,
      data: { province }
    } = await self.$axios.get("/geo/province");
    if (status === 200) {
      self.province = province.map(item => {
        return {
          value: item.id,
          label: item.name
        };
      });
    }
  },
  methods: {
    remoteMethod: _.debounce(async function(query) {
      let self = this;
      self.loading = true;
      if (self.cities.length) {
        self.loading = false;
        self.cvalues = self.cities.filter(item => {
          return item.value.indexOf(query) > -1;
        });
        console.log(self.cvalues);
      } else {
        let {
          status,
          data: { city }
        } = await self.$axios.get("/geo/city");
        if (status === 200) {
          self.cities = city.map(item => {
            return {
              value: item.name
            };
          });
          self.loading = false;
          self.cvalues = self.cities.filter(item => {
            return item.value.indexOf(query) > -1;
          });
        } else {
          self.cvalues = [];
        }
      }
    }, 200),
    handleSelect: function(item){
        let self = this
        console.log(item)
        self.$store.commit('geo/setPosition',{city:item})
        location.href = '/'
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/css/changeCity/iselect.scss";
</style>