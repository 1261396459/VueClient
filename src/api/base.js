import axios from 'axios';
import host from './config.js'

export const client = axios.create({
  baseURL: host.nowHost(),
  timeout: 30000, // 适应测试服务器延迟
  headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': true}
});
