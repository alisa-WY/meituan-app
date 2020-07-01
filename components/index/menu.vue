<template>
  <div class="m-menu">
    <!-- 分为两部分内容，一部分为左侧固定的，一部分为右侧弹窗 -->
    <dl class="nav" @mouseleave="mouseleave">
      <dt>全部分类</dt>
      <dd v-for="(item,index) in $store.state.home.menu" :key="index" @mouseenter="enter">
        <i :class="item.type"></i>
        {{item.name}}
        <span class="arrow"></span>
      </dd>
    </dl>
    <!-- 弹窗，详细列表，点击那个出现哪个共用一个减少dom节点的使用 -->
    <!-- 由于此处与上面的是兄弟不是子节点，所以当鼠标从上层移入到下面时必须给下面一个状态判断-->
    <div class="detail" v-if="kind" @mouseenter="sover" @mouseleave="sout">
      <!-- 模块的循环 -->
      <template v-for="(item,index) in curdetail.child">
        <h4 :key="index">{{item.title}}</h4>
        <span v-for="v in item.child" :key="v">{{v}}</span>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      kind: "",
      menu: [
        {
          type: "food",
          name: "美食",
          child: [
            {
              title: "美食",
              child: ["代金券", "甜点饮品", "火锅", "自助餐", "小吃快餐"]
            }
          ]
        },
        {
          type: "takeout",
          name: "外卖",
          child: [
            {
              title: "外卖",
              child: ["美团外卖"]
            }
          ]
        },
        {
          type: "hotel",
          name: "酒店",
          child: [
            {
              title: "酒店星级",
              child: ["经济型", "舒适/三星", "高档/四星", "豪华/五星"]
            }
          ]
        }
      ]
    };
  },
  computed: {
    /* 计算当前hover的是哪部分内容 */
    curdetail: function() {
      return this.$store.state.home.menu.filter((item) => item.type === this.kind)[0];
    }
  },
  methods: {
    mouseleave: function(){
      let self = this
      self._timer = setTimeout(() => {
        self.kind = ''
      }, 150);
    },
    enter: function(e){
      this.kind = e.target.querySelector('i').className
    },
    sover: function(params) {
        // 不让上面的计时器关掉旁边栏显示
        clearTimeout(this._timer)
    },
    sout: function(params) {
        this.kind=""
    }
  },
};
</script>

<style lang="css">
</style>F