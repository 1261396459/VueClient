import address from 'address';
export default {
  apiHost : '/api',
  LoaclHost : (address.ip() || 'http://192.168.2.105')+':3000',
  netHost : 'http://332422gr53.zicp.vip',
  nowHost : function(){
    return this.netHost;
  }
};
