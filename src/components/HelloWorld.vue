<template>
  <div class="hello">
    <p >我：{{name}}</p>
    <div v-for="(key,value) in userList"><p>{{key+' : '+value}}</p><button @click="">通信</button></div>
  <input v-model="msg"><button @click="setM">获取数据</button>
  <p v-for="item in msgList">{{item.name + " say: " + item.msg}}</p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: '',
      name: this.$store.state.token.name,
      id: this.$socket.id,
      msgList:[],
      userList:{},
    }
  },
  methods:{
    setM(){
      this.$socket.emit('chat message',this.msg)
      this.msg=''
      console.log(this.name)
    },
    
  },
  sockets:{
    'connect':function(){
      this.id = this.$socket.id
      this.$socket.emit('update userlist')
    },
    'chat message':function(data){  //向所有用户发送message
      this.msgList.push(data)
    },
    'update userlist':function(data){
      console.log(data)
      this.userList = data
    }
  },
  beforeCreate(){
    // 登录检查
    let isLogin = this.$store.state.token == null ? false : this.$store.state.token.isLogin
    if (!isLogin) {
      this.$router.replace('/login')
    }
  }
 }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
