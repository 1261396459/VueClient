<template>
  <div>
    <input v-model="name"/>
    <button @click="login">登录</button>
  </div>
</template>

<script>
  export default{
    name:'LogIn',
    data(){
      return {
        name:''
      }
    },
    methods:{
      async login(){
        this.$store.dispatch('UserLogin',{
           name:this.name,
           isLogin:true
        })
        this.name=''
        this.$router.replace("/")
      }
    }
  }
</script>

<style>

</style>
