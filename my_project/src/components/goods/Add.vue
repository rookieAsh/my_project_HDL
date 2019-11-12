<template>
  <div class="divFont">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center></el-alert>

      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- before-leave返回标签之前的钩子 返回false则阻止切换 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTableave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_nunber">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item>
              <!-- options指定数据源  prop级联选择器的配置项-->
              <span class="demonstration">商品分类</span>
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示要上传的图片的url地址 -->
            <!-- handlePreview 点击图片 预览 -->
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <!-- previewVisible 是否显示图片 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
// 导入深拷贝的包
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: '0',
      tabPosition: 'left',
      // 添加商品 的 表单数据对象
      addForm: {
        goods_name: '',
        // 默认为0
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 校验规则
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品的名称',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品的价格',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品的重量',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品的数量',
            trigger: 'blur'
          }
        ]
      },
      // 商品分类的校验规则
      goods_cat: [
        {
          required: true,
          message: '请选择商品分类',
          trigger: 'blur'
        }
      ],
      // 商品分类列表
      catelist: [],
      // prop级联选择器的配置项
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        checkStrictly: false,
        expandTrigger: 'hover'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态参数列表数据
      onlyTableData: [],
      // 上传的图片url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片地址
      previewPath: '',
      // 隐藏对话框
      previewVisible : false
    }
  },
  created() {
    // 直接调这个函数 函数在下面定义
    this.getCateList()
  },
  // 计算属性
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    // 定义一个函数 获取所有商品分类的数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获得商品数据失败！')
      }
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器选中项的变化 会触发这个函数
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // oldActiveName 即将离开的标签名字
    // activeName 即将进入的标签名字（角标从0开始）
    beforeTableave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    async tabClicked() {
      // 证明访问的是动态参数面板
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 先获得图片的临时路径
      const filePath = file.response.data.tem_path
      // 从pics数组中 找到这个照片对应的索引
      const i = this.addForm.pics.findIndex(x => {
        x.pic === filePath
      })
      // 把图片对象从pics数组中删除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      // 1.拼接得到一个图片的信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息保存在pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    add(){
      // console.log(this.addForm);  
      // 表单预验证
      this.$refs.addFormRef.validate( async valid => {
        if(!valid){
          return this.$message.error('请填写必要的表单项！')
        }
          // 执行添加的业务逻辑
          // 使用深拷贝 拷贝一份一模一样的 原来数据不变
        const form =  _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')

          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id : item.attr_id,
              // 动态参数的attr_value的值 是数组
              // 将数组变字符串 用空格连接
              attr_value : item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })

          // 处理静态函数
          // 静态属性的attr_value的值是字符串
          this.onlyTableData.forEach(item => {
            const newInfo = {attr_id: item.attr_id,attr_value:item.attr_vals}
            this.addForm.attrs.push(newInfo)
          })
          // 因为提交的是form 所以要赋值
          form.attrs == this.addForm.attrs
          console.log(form);
          
          // 发起请求添加商品
          // 商品的名称 必须是唯一的
          const { data : res } = await this.$http.post('goods',form)
          if(res.meta.status !== 201){
            return this.$message.error('添加商品失败！')
          }
          this.$message.success('添加商品成功！')
          // 编程式导航让其跳转去其他页面
          this.$router.push('/goods')
      }) 
    }
  }
}
</script>

<style lang="less" scoped>
.divFont {
  font-size: 15px;
  font-family: '楷体';
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
</style>
