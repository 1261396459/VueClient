<template>
  <div class="hello">
  <input v-model="msg"><button @click="setM">获取数据</button>
  <p v-for="item in msgList">{{item.id + " say: " + item.msg}}</p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: '',
      name: '',
      id:'',
      msgList:[]
    }
  },
  methods:{
    setM(){
      this.$socket.emit('chat message',this.msg)
      this.msg=''
    }
  },
  sockets:{
    'connect':function(){
      this.id = this.$socket.id;
    },
    'chat message':function(data){  //监听message事件，方法是后台定义和提供的
        this.msgList.push(data)
    }
  },
  mounted(){

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
