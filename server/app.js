const express = require('express');
const { Server } = require("socket.io");
const http = require('http');
const axios = require('axios');
const API_KEY='8b560cbdb125e0913ac3c9471821d82d'
const app = express();
const server = http.createServer(app);
let users=[]
// 啟用 CORS 中間件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');  // 允許所有來源訪問
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send("AAA");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});
io.on("connection",(socket)=>{
  // 登入
  socket.on('login', function(data){
    if(users.includes(data)){
      console.log(data+"連接失敗")
      socket.emit('loginMsg',{user:data,success:false})
    }else{
      console.log(data+"連接成功")
      io.emit('loginMsg',{user:data,success:true})//告訴所有人誰進來了
      users.push(data)
      console.log(users)
    }
  })
  // 登出
  socket.on('disconnect-message', (data) => {
    console.log(`使用者 ${data}  離線。`);
    io.emit('logout',{user:data,success:true})//告訴所有人誰進來了
    users = users.filter(item => item !== data);
    console.log(users)
  });
  //傳進來的訊息
  socket.on('message', (data) => {

    io.emit('message',data)//告訴所有人誰進來了
    if(data.msg==="問題"){
      
      io.emit('message',{user:"?",msg:"衝啥?",color:"#FF9500"})//告訴所有人誰進來了
    }else if(data.msg.includes("天氣")){
      io.emit('message',{user:"?",msg:"你要查詢天氣嗎?",color:"#FF9500"})//告訴所有人誰進來了
    }else if(data.msg.includes("不查了")){
      io.emit('message',{user:"?",msg:"好喔，那你閉嘴",color:"#FF9500"})//告訴所有人誰進來了
    }else if(data.msg.includes("幫我查")){
      io.emit('message',{user:"?",msg:"你想查哪個縣市的當前氣象?",color:"#FF9500"})//告訴所有人誰進來了
    }else if(data.msg.includes("北部")){
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Taipei&appid=${API_KEY}&lang=zh_tw`)
      .then(response => {
        // Handle the successful response
        io.emit('message',{user:"?",msg:`現在天氣為: ${response.data.weather[0].description}`,color:"#FF9500"})//告訴所有人誰進來了
      })
      .catch(error => {
        // Handle errors
        console.error('Error:', error);
      });
    }else if(data.msg.includes("中部")){
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Taitung&appid=${API_KEY}&lang=zh_tw`)
      .then(response => {
        // Handle the successful response
        io.emit('message',{user:"?",msg:`現在天氣為: ${response.data.weather[0].description}`,color:"#FF9500"})//告訴所有人誰進來了
      })
      .catch(error => {
        // Handle errors
        console.error('Error:', error);
      });
    }else if(data.msg.includes("南部")){
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Tainan&appid=${API_KEY}&lang=zh_tw`)
      .then(response => {
        // Handle the successful response
        io.emit('message',{user:"?",msg:`現在天氣為: ${response.data.weather[0].description}`,color:"#FF9500"})//告訴所有人誰進來了
      })
      .catch(error => {
        // Handle errors
        console.error('Error:', error);
      });
    }else if(data.msg.includes("東部")){
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Hualien&appid=${API_KEY}&lang=zh_tw`)
      .then(response => {
        // Handle the successful response
        io.emit('message',{user:"?",msg:`現在天氣為: ${response.data.weather[0].description}`,color:"#FF9500"})//告訴所有人誰進來了
      })
      .catch(error => {
        // Handle errors
        console.error('Error:', error);
      });
    }
  })

})
// // 直接在全域範圍設置一次 emit
// io.on("connection", (socket) => {


//   // socket.on('login', function(data){
//   //   // console.log(users)
//   //   // console.log(users.includes(data.username))
//   //   if(users.includes(data.username)){
//   //     socket.emit('loginMsg', '連線失敗')
//   //   }else{
//   //     io.emit('loginMsg', {msg:'連線成功',username:data.username})
//   //     console.log(`使用者 ${data.username}  連上 socket.io 了.`);
//   //     users.push(data.username)
//   //     // console.log(users)
//   //   }

//   // })
  

//   // socket.on('message', (data) => {
//   //   // console.log(data)
//   //   io.emit('message', data);
//   // })





// });

server.listen(2000, () => {
  console.log('Socket.IO 伺服器正在監聽 2000 port');
});

app.listen(500, () => {
  console.log('Express 應用程式正在監聽 500 port');
});
