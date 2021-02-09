<template>
  <div>
    <input v-model="name"/>
    <button @click="login">登录</button>
  </div>
</template>

<script>
  export default{
    name:'LogIn',
    data:{
      name:''
    },
    methods:{
      login:()=>{
        this.name=''
      }
    }
  }
</script>

<style>

</style>
