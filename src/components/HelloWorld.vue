<template>
  <div class="hello">
    <p>我：{{ name }}</p>
    <div v-for="(key, value) in userList">
      <p>{{ key + ' : ' + value }}</p>
      <button @click="StartCall(value, true)">通信</button>
    </div>
    <div>
      <video :srcObject.prop="localStream" autoplay="autoplay">
        您的浏览器不支持 video 视屏播放。
      </video>
      <!-- <button @click="">播放</button> -->
    </div>
    <div id="videos">

    </div>
    <div>
      <input v-model="msg" />
      <button @click="setM">获取数据</button>
      <p v-for="item in msgList">{{ item.name + ' say: ' + item.msg }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: '',
      name: this.$store.state.token.name,
      id: this.$socket.id,
      msgList: [],
      userList: {},
      iceServer: {
        //转向服务器配置
        iceServers: [
          {
            urls: ['stun:tk-turn1.xirsys.com']
          },
          {
            username:
              'p3YkNDPA_FNBGuj8IURZ-sUi7pUfycuntWM4YtoxdyeEXkZczgFI_rxi6KxOBfzYAAAAAF_oiOVhbHNvZWFzeQ==',
            credential: '900d7c8e-4845-11eb-b618-0242ac140004',
            urls: ['turn:tk-turn1.xirsys.com:80?transport=udp']
          }
        ]
      },
      pc: [],
      localStream: null
    };
  },
  methods: {
    setM() {
      this.$socket.emit('chat message', this.msg);
      this.msg = '';
    },
    getUserMedia(constrains, success, error) {
      //兼容获取媒体权限方法
      let promise = null;
      if (navigator.mediaDevices.getUserMedia) {
        //最新标准API
        promise = navigator.mediaDevices
          .getUserMedia(constrains)
          .then(success)
          .catch(error);
      } else if (navigator.webkitGetUserMedia) {
        //webkit内核浏览器
        promise = navigator
          .webkitGetUserMedia(constrains)
          .then(success)
          .catch(error);
      } else if (navigator.mozGetUserMedia) {
        //Firefox浏览器
        promise = navagator
          .mozGetUserMedia(constrains)
          .then(success)
          .catch(error);
      } else if (navigator.getUserMedia) {
        //旧版API
        promise = navigator
          .getUserMedia(constrains)
          .then(success)
          .catch(error);
      }
    },
    canGetUserMediaUse() {
      //是否已获取媒体权限
      return !!(
        navigator.mediaDevices.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      );
    },
    getPower(select) {
      //获取媒体播放权限
      if (this.canGetUserMediaUse()) {
        this.getUserMedia(
          {
            //video: true,//{mediaSource: 'screen'}共享屏幕{ facingMode: "user" } }前置摄像头 { facingMode: { exact: "environment" } } 后置摄像头
            video: true,
            audio: true
          },
          stream => {
            this.localStream = stream;
          },
          err => {
            console.log('访问用户媒体失败: ', err.name, err.message);
          }
        );
      } else {
        alert('您的浏览器不兼容');
      }
    },
    StartCall(parterName, createOffer) {
      //para1 peer标识符 para2 是否创建offer
      let pc = this.pc
      let iceServer = this.iceServer
      let localStream = this.localStream
      let id = this.id
      pc[parterName] = new RTCPeerConnection(iceServer);
      //如果已经有本地流，那么直接获取Tracks并调用addTrack添加到RTC对象中。
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc[parterName].addTrack(track, localStream); //指定要传输的视频流
        });
      } else {
        //否则需要重新启动摄像头并获取
        getPower();
      }
      //如果是呼叫方,那么需要createOffer请求
      if (createOffer) {
        //每当WebRTC基础结构需要你重新启动会话协商过程时，都会调用此函数。它的工作是创建和
        //发送一个请求，给被叫方，要求它与我们联系。
        pc[parterName].onnegotiationneeded = () => {
          pc[parterName]
            .createOffer()
            .then(offer => {
              return pc[parterName].setLocalDescription(offer);
            })
            .then(() => {
              //把发起者的描述信息通过Signal Server发送到接收者
              this.$socket.emit('sdp', {
                type: 'video-offer',
                description: pc[parterName].localDescription,
                to: parterName,
                sender: id
              });
            });
        };
      }

      //当需要你通过信令服务器将一个ICE候选发送给另一个对等端时，本地ICE层将会调用你的
      //icecandidate 事件处理程序。有关更多信息，请参阅Sending ICE candidates 以查看此示例的代码。
      pc[parterName].onicecandidate = ({ candidate }) => {
        this.$socket.emit('ice candidates', {
          candidate: candidate,
          to: parterName,
          sender: id
        });
      };

      //当向连接中添加磁道时，track 事件的此处理程序由本地WebRTC层调用。例如，可以将传入媒体
      //连接到元素以显示它。详见 Receiving new streams 。
      pc[parterName].ontrack = ev => {
        let str = ev.streams[0]; //获取流

        if (document.getElementById(`${parterName}-video`)) {
          document.getElementById(`${parterName}-video`).srcObject = str;
        } else {
          let newVideo = document.createElement('video');
          newVideo.id = `${parterName}-video`; //连接断开时利用id去掉视频
          newVideo.className = 've';
          newVideo.autoplay = true;
          newVideo.controls = true;
          newVideo.srcObject = str;

          document.getElementById('videos').appendChild(newVideo);
        }
      };
    }
  },
  sockets: {
    'connect': function() {
      this.id = this.$socket.id
    },
    'chat message': function(data) {
      //向所有用户发送message
      this.msgList.push(data)
    },
    'update userlist': function(data) {
      this.userList = data
    },
    'sdp': function(data) {
      console.log('sdp: ' + data);
      //如果时offer类型的sdp
      let pc = this.pc
      let id = this.id
      if (data.description.type === 'offer') {
        //那么被呼叫者需要开启RTC的一套流程，同时不需要createOffer，所以第二个参数为false
        this.StartCall(data.sender, false);
        //把发送者(offer)的描述，存储在接收者的remoteDesc中。
        let desc = new RTCSessionDescription(data.description);
        //按1-13流程走的
        pc[data.sender].setRemoteDescription(desc).then(() => {
          pc[data.sender]
            .createAnswer()
            .then(answer => {
              return pc[data.sender].setLocalDescription(answer);
            })
            .then(() => {
              this.$socket.emit('sdp', {
                type: 'video-answer',
                description: pc[data.sender].localDescription,
                to: data.sender,
                sender: id
              });
            })
            .catch(err => {
              console.log('sdp create err ' + err);
            }); //catch error function empty
        });
      } else if (data.description.type === 'answer') {
        //如果使应答类消息（那么接收到这个事件的是呼叫者）
        let desc = new RTCSessionDescription(data.description);
        pc[data.sender].setRemoteDescription(desc);
      }
    },
    'ice candidates': function(data) {
      let pc = this.pc
      console.log('ice candidate: ' + data);
      //{ candidate: candidate, to: partnerName, sender: socketID }
      //如果ice candidate非空（当candidate为空时，那么本次协商流程到此结束了）
      if (data.candidate) {
        var candidate = new RTCIceCandidate(data.candidate);
        //讲对方发来的协商信息保存
        pc[data.sender].addIceCandidate(candidate).catch(); //catch err functionempty
      }
    }
  },
  beforeCreate() {
    // 登录检查
    let isLogin =
      this.$store.state.token == null ? false : this.$store.state.token.isLogin;
    if (!isLogin) {
      this.$router.replace('/login');
    }
  },
  mounted() {
    //setTimeout(this.getPower,2000)
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
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
