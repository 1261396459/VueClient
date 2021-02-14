import axios from 'axios';
import address from 'address';

export const apiHost = '/api';
export const Host = (address.ip() || 'http://192.168.2.105')+':3000';

export const client = axios.create({
  baseURL: Host,
  timeout: 30000, // 适应测试服务器延迟
  headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': true}
});
