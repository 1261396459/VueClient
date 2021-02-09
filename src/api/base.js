import axios from 'axios';

export const apiHost = "/api";
export const Host = 'http://127.0.0.1:3000';

export const client = axios.create({
  baseURL: Host,
  timeout: 30000, // 适应测试服务器延迟
  headers: {'Content-Type': true, 'Authorization': true}
});
