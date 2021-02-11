<template>
  <div>
    <input v-model="name"/>
    <button @click="login">登录</button>
  </div>
</template>

<script>
  import {client} from '../api/base.js'
  export default{
    name:'LogIn',
    data(){
      return {
        name:''
      }
    },
    methods:{
      login(){
        this._login()
      },

      async _login(){
        let name = this.name
        this.name=''
        let data = new URLSearchParams()//序列化
        data.append('name',name)
        data.append('id',this.$socket.id)
        const rm = await client.post('/users/login',data)

        if(rm.status == '200'){
          this.$store.dispatch('UserLogin',{
             name,
             isLogin:true
          })
          this.$router.replace('/')
        }
        else{
          alert(rm.statusText)
        }
        return;
      }
    }
  }
</script>

<style>

</style>
