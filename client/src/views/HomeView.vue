<template>
  <main  style="display: flex;flex-direction: column;width: 100vw;height:100vh;justify-content: center;align-items: center;" @keydown.enter="sendMessage">

    <div style="width: 50%;height:80%;display: flex;flex-direction: column;justify-content: space-between;align-items: center;padding: 1rem;border-radius: 2rem;border: 2px solid gray;position: relative;">

      <!-- header -->
      <div style="display: flex;width: 90%;justify-content: center;"> 
        <el-input v-model="name" placeholder="請輸入使用者名稱" :disabled="isInputDisabled"/>
        <el-color-picker v-model="color1" style="margin-left: 10px;"  :disabled="isInputDisabled" @change="handleColorChange" @active-change="handleActiveChange" :predefine="predefineColors"/>
        <el-button type="success"  style="margin-left: 1rem;" @click="link" v-if="!connectionStatus">Link</el-button>
        <el-button type="danger"  style="margin-left: 1rem;" @click="disconnect"  v-if="connectionStatus">stop</el-button>
       
      </div>

      <!-- main -->
      <div style=" width:90%;  height: -webkit-fill-available;position: relative;">
        <div id="msg"  style="position: absolute;"></div>
        <div class="waiting"  style="position: absolute; bottom: 0.5rem;left:0rem;">
          <div  v-if="someoneinputing" class="animated-messageA">...</div>
        </div>
      </div>


      <!-- input -->
      <div style="width: 90%;display: flex;">
        <el-input v-model="messageInput" placeholder="請輸入訊息..."/>
        <el-button :icon="Search" circle @click="sendMessage" style="margin-left:1rem"/>
      </div>


    </div>
   
  </main>
</template>

<script setup>
import { ref,onMounted,watch } from 'vue';
import { io } from 'socket.io-client';
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
let socket; // 声明 socket 为全局变量

const messageInput = ref('');
const connectionStatus = ref(false);
const name=ref("")
const isInputDisabled=ref(false)
const someoneinputing=ref(false)
const color1 = ref('#C2C2C2')
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585'
])
const handleActiveChange=(color)=>{
  color1.value=color
}
const handleColorChange=(newColor)=>{

  color1.value=newColor
}
const link = () => {
  if(name.value!==""){

    socket = io('http://localhost:2000');//有輸入使用者名稱才連線
    socket.emit('login', name.value)//註冊使用者名稱

    //監聽登入狀況
    socket.on('loginMsg', (data) => {
      // 登入成功
        if(data.success){

          const status_div =document.createElement("div")
          const p_tag = document.createElement("p");
          const msg_div =document.querySelector("#msg")
          //自己的話
          if(data.user===name.value){
            
            msg_div.style.backgroundColor = 'rgb(208, 219, 239)';
            connectionStatus.value=true
            status_div.classList.add("status");
            p_tag.innerText =`進入聊天室`;
            status_div.appendChild(p_tag);
            msg_div.appendChild(status_div);
            isInputDisabled.value = true;
          //別人的話
          }else{

            msg_div.style.backgroundColor = 'rgb(208, 219, 239)';
            connectionStatus.value=true
            status_div.classList.add("status");
            p_tag.innerText =`${data.user} 進入聊天室`;
            status_div.appendChild(p_tag);
            msg_div.appendChild(status_div);
          }
          msg_div.scrollTop = msg_div.scrollHeight;

      // 登入失敗
        }else{
          socket.disconnect(); // 斷開socket連線
          ElMessage.error('登入失敗，使用者已存在')
          name.value=""
          
        }
    })
    //監聽登出狀況
    socket.on('logout', (data) => {
    // 登出成功
      if(data.success){
        const status_div =document.createElement("div")
        const p_tag = document.createElement("p");
        const msg_div =document.querySelector("#msg")
        //自己登出
        if(data.user===name.value){
          msg_div.style.backgroundColor = 'rgb(255, 213, 213)';
          connectionStatus.value=false
          status_div.classList.add("status_leave");
          p_tag.innerText =`已離開`;
          status_div.appendChild(p_tag);
          msg_div.appendChild(status_div);
          isInputDisabled.value = false;
          socket.disconnect();
          name.value=""

        //他人登出
        }else{

          msg_div.style.backgroundColor = 'rgb(208, 219, 239)';
          status_div.classList.add("status_leave");
          p_tag.innerText =`${data.user} 已離開聊天室`;
          status_div.appendChild(p_tag);
          msg_div.appendChild(status_div);
          
        }
        msg_div.scrollTop = msg_div.scrollHeight;
      }
    })
    //監聽訊息狀況
    socket.on('message', (data) => {
        //自己發訊息的話
        if(data.user===name.value){

            const msg_div = document.querySelector("#msg");
            const msgB_div = document.createElement("div");
            msgB_div.innerHTML =`<p style="background-color:${color1.value}">${data.msg}</p>`
            msgB_div.classList.add("right");
            msg_div.appendChild(msgB_div);

            // 滚动到底部
            msg_div.scrollTop = msg_div.scrollHeight;

        }else if(data.user==="?"){
            const msg_div = document.querySelector("#msg");
            const msgB_div = document.createElement("div");
            if(data.msg==="你要查詢天氣嗎?"){
              msgB_div.innerHTML = `
                                    <label class="AI" style="background-color:${data.color}">${data.user[0]}</label>
                                    <p>
                                      ${data.msg}
                                      <button class="se_we">是</button>
                                      <button class="no_se_we">否</button>
                                    </p>
                                  `;

            }else if(data.msg==="衝啥?"){
                msgB_div.innerHTML = `
                                      <label class="AI" style="background-color:${data.color}">${data.user[0]}</label>
                                      <p>
                                        ${data.msg}
                                      </p>
                                    `;
            }else if(data.msg==="好喔，那你閉嘴"){
                msgB_div.innerHTML = `
                                      <label class="AI" style="background-color:${data.color}">${data.user[0]}</label>
                                      <p>
                                        ${data.msg}
                                      </p>
                                    `;
            }else if(data.msg==="你想查哪個縣市的當前氣象?"){
              msgB_div.innerHTML = `
                                      <label class="AI" style="background-color:${data.color}">${data.user[0]}</label>
                                      <p>
                                        ${data.msg}
                                        <select placeholder="please select your zone">
                                          <option label="北部" value="北部" />
                                          <option label="中部" value="中部" />
                                          <option label="南部" value="南部" />
                                          <option label="東部" value="東部" />
                                        </select>
                                        <button class="search_we">查詢</button>
                                      </p>
                                    `;
            }else if(data.msg.includes("現在天氣為")){
              msgB_div.innerHTML = `
                                      <label class="AI" style="background-color:${data.color}">${data.user[0]}</label>
                                      <p>
                                        ${data.msg}
                                      </p>
                                    `;
            }
           
            msgB_div.classList.add("left");
            msg_div.appendChild(msgB_div);
            msgB_div.addEventListener("click", (event) => {
              if (event.target.classList.contains("se_we")) {
                socket.emit('message', { msg: "幫我查", user: name.value, color: color1.value });
              } else if (event.target.classList.contains("no_se_we")) {
                socket.emit('message', { msg: "不查了", user: name.value, color: color1.value });
              } else if (event.target.classList.contains("search_we")) {
                socket.emit('message', { msg: event.target.previousElementSibling.value, user: name.value, color: color1.value });
              }
            });
            // 滚动到底部
            msg_div.scrollTop = msg_div.scrollHeight;
        
        //他人發訊息
        }else{
            const msg_div = document.querySelector("#msg");
            const msgB_div = document.createElement("div");
            msgB_div.innerHTML =`<label style="background-color:${data.color}">${data.user[0]}</label><p>${data.msg}</p>`
            msgB_div.classList.add("left");
            msg_div.appendChild(msgB_div);

            // 滚动到底部
            msg_div.scrollTop = msg_div.scrollHeight;
        }
    })


  }else{
    socket.disconnect();
  }
};

// //發訊息
const sendMessage = () => {
  if(socket.connected){//是否有建立連線

    if(socket.connected){//連線成功?
      if(messageInput.value){//如果有送出訊息的話
          socket.emit('message', {msg:messageInput.value,user:name.value,color:color1.value});
          messageInput.value = '';
      }
    }
  }
  
};

//離線01.手動離線
const disconnect = () => {
  // 中斷連線
    socket.emit('disconnect-message', name.value);
    isInputDisabled.value = false;
    connectionStatus.value = '已中斷連線';
    document.querySelector("#msg").style.backgroundColor = '#ffd5d5';
   
};

//離線02.關閉視窗離線
window.addEventListener('beforeunload', function() {
    // 发送事件或请求告知服务器
    socket.emit('disconnect-message', name.value);
    isInputDisabled.value = false;
    connectionStatus.value = '已中斷連線';

});

onMounted(()=>{
  document.querySelector("#msg").style.backgroundColor = '#ffd5d5';
})



</script>

<style lang="scss">
#msg {
  background-color: rgb(208, 219, 239);
  width:100%;
  height: -webkit-fill-available;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  margin: 0.5rem 0;

}
.AI{
  border: 2px solid white;
}
.left {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  flex-wrap: wrap;
  label{
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: white;
    font-weight: bold;
  }
  p{
    background-color:white;
    max-width:50%;

    margin: 0.5rem;
    padding: 0.2rem 1rem;
    border-radius: 0.5rem;

  }
}

.right {
  display: flex;
  flex-direction: row-reverse;

  flex-wrap: wrap;
  p{
    max-width:50%;
    background-color: rgb(255, 255, 255);

    margin: 0.5rem;
    padding: 0.2rem 1rem;
    border-radius: 0.5rem;

  }
}
.waiting{
  background-color: rgba(255, 255, 255, 0.473);
  width:100%;
}
.animated-messageA {
  margin:0 0 0 1rem;
  font-size: 12px;
  padding:10px;
  /* 添加你想要的动画样式，这里以透明度的变化为例 */
  animation: fadeInOut 1s infinite;

}

.status{
  width:100%;
  display: flex;
  justify-content: center;
  align-items: center;
  p{
    font-size: 10px;
    background-color: rgb(174, 174, 174);
    padding: 0.2rem 1rem;
    border-radius: 50px;
    color: white;
    font-weight: bold;
    margin: 0.5rem 0;
  }
}

.status_leave{
  width:100%;
  display: flex;
  justify-content: center;
  align-items: center;
  p{
    font-size: 10px;
    background-color: rgb(174, 174, 174);
    padding: 0.2rem 1rem;
    border-radius: 50px;
    color: white;
    font-weight: bold;
    margin: 0.5rem 0;
  }
}
.el-color-picker, .el-color-picker__panel{
  margin-left: 10px;
}
@keyframes fadeInOut {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
