 const typingForm = document.querySelector(".typing-form");
 const chatList = document.querySelector(".chat-list");
 const suggestions = document.querySelectorAll("suggestions-list .suggestions");
 const toggleThemeButton = document.querySelector("#toggle-theme-button");
 const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;


//API configuration
const GEMINI_API_KEY="AIzaSyARR5WbqX9owt4aiCgDfF6wIok_nltlFLY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const loadLocalStorageData = () =>{
     
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor")=== "light_mode");
    //Making sure selected theme is saved after refreshing the page
    document.body.classList.toggle("light_mode" , isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
    
    //Restoring saved chats
    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle(".hide-header" , savedChats);
    chatList.scrollTo(0 , chatList.scrollHeight); // for auto scroll to the bottom
}

loadLocalStorageData(); 

//create a new message element and return it
const createMessageElement = (content , ...classes) =>{
   const div = document.createElement("div");
   div.classList.add("message" , ...classes);
   div.innerHTML = content;
   return div;
}

//Showing typing effects by showing words one by one
const showTypingEffect = (text , textElement) => {
    const words = text.split(' ');
    
    let currentWordIndex=0;

    const typingInterval = setInterval(() => {
        //append each word to the element with a space
      textElement.innerText+= (currentWordIndex===0 ? '' : ' ') + words[currentWordIndex++];

      if(currentWordIndex === words.length)
        clearInterval(typingInterval);
        localStorage.setItem("savedChats" , chatList.innerHTML); // saving chats to inner HTML
        chatList.scrollTo(0 , chatList.scrollHeight); // for auto scroll to the bottom
    } , 75);
}

//Fetch response from API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
 const textElement = incomingMessageDiv.querySelector(".text"); //Get text element
    //send a post request to the API with the user's message
try{
const response = await fetch(API_URL , {
    method: "POST" ,
    headers: {"Content-Type" : "application/json"} ,
    body: JSON.stringify({
        contents: [{
            role: "user" ,
            parts: [{ text: userMessage }]
        }]
    })
});

const data = await response.json();
// console.log(data);

//Get the API response text and remove the asterisk from starting if any sent to make the text bold
const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g , '$1');
showTypingEffect(apiResponse , textElement);
}catch(e){
    console.log(e);
}finally{
    incomingMessageDiv.classList.remove("loading");
}
}

//showing loading animation while awaoting API response
const showLoadingAnimation = () => {
    const html = `    <div class="message-content">
            <img src="images/gemini.svg" alt="Gemini-Image" class="avatar"> 
             <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
           </div>
              <span onclick="copyMessage(this)" class="icon material-symbols-rounded">
                content_copy
                </span>`; 

const incomingMessageDiv = createMessageElement(html , "incoming" , "loading");
chatList.appendChild(incomingMessageDiv);

chatList.scrollTo(0 , chatList.scrollHeight); // for auto scroll to the bottom
generateAPIResponse(incomingMessageDiv);
}

//copy message text to the clipboard
const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done"; //show tick icon
    setTimeout(() => copyIcon.innerText = "content_copy" , 1000);//Revert Icon after 1 sec
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage; //takes the exact message and excludes the extra spaces
    if(!userMessage){
        return ;
    }
    // console.log(userMessage);
    const html = `<div class="message-content">
                <img src="images/download.jpeg" alt="User-Image" class="avatar">
                <p class="text"></p>
            </div>`; 
            
    const outgoingMessageDiv = createMessageElement(html , "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); // clear input  field
    chatList.scrollTo(0 , chatList.scrollHeight); // for auto scroll to the bottom
    document.body.classList.add(".hide-header");//hide the header once the chat gets started
    setTimeout(showLoadingAnimation , 500); // show loading animation after a delay
};
 

//make a suggestion an outgoing message when clicked upon
suggestions.forEach(suggestion => {
    suggestion.addEventListener("click" , ()=>{
        userMessage = suggestion.querySelector("text").innerText;
        handleOutgoingChat();
    });
});

//Toggle between light and dark themes
toggleThemeButton.addEventListener("click" , () =>{
   const isLightMode = document.body.classList.toggle("light_mode");
   localStorage.setItem("themeColor" , isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

//for delete button
deleteChatButton.addEventListener("click" , () => {
  if(confirm("Are you sure you want to delete all the messages?")){
    localStorage.removeItem("savedChats");
   // Clear the chat list UI safely
   while (chatList.firstChild) {
    chatList.removeChild(chatList.firstChild);
  }
    loadLocalStorageData();
  }
});

 typingForm.addEventListener("submit" , (e)=>{
  e.preventDefault();

  handleOutgoingChat();
 });

 //1:04:00
 //28:45
