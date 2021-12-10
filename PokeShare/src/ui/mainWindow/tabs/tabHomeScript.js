var postInfoContainer = "<div class=\"post-info-container\"><div class=\"poster-account\"><div class=\"account-image\"></div><div class=\"account-info\"><div class=\"account-name\">Placeholder</div>";
postInfoContainer += "<div class=\"account-tag\">@placeholder</div></div></div><div class=\"post-msg\"></div><div class=\"post-likes-container\"><div><button class=\"btnLikes\">♡</button><span class=\"numLikes\"></span></div></div>"
postInfoContainer += "</div><div class=\"post-image-container\"><div class=\"post-image\"><img class=\"\" src=\"../../images/placeholder.jpg\" alt=\"\"></div></div>";
postInfoContainer += "<div class=\"post-footer-container\"></div>"

var imgPathTemplate = ["../../images/", "Card.jpg"]
function getImgPath(imgName){
  return imgPathTemplate[0]+imgName+imgPathTemplate[1]

}


var ipcHandlerFuncs = {
  send: function(msg, data){},
  on: function(msg, func){}
}

var ipcReady = {
  send: false,
  on: false
}

function ipcSendSetup(func){
  // console.log("ipcSendSetup");
  // console.log(func);
  ipcHandlerFuncs.send = func;
  ipcReady.send = true;
  if(ipcReady.on == true) onIpcReady()
}

function ipcOnSetup(func){
  // console.log("ipcOnSetup");
  // console.log(func);
  ipcHandlerFuncs.on = func;
  ipcReady.on = true;
  if(ipcReady.send == true) onIpcReady()
}

function onIpcReady(){
  ipcHandlerFuncs.on('test1', function(e, data){
    let ph = true;
    // console.log("Oi!@");
    // console.log(data);
    //$("#test1").html("Oi")
  })
  ipcHandlerFuncs.send('test2', {a:2, b:3})
  // console.log("Hey!");
  // console.log(ipcHandlerFuncs);
}




function createDiv(classes, id){
  var resultDiv = '<div';
  if(classes != ""){
    resultDiv += ' class=\"'+classes+'\"'
  }
  if(id != ""){
    resultDiv += ' id=\"'+id+'\"';
  }
  resultDiv += '></div>';
  return resultDiv;
}

// createNewPost({
//   containerid: 1,
//   username: "Joseph",
//   usertag: "josephthedude",
//   imgtype: 'local',
//   imgpath: "squirtle",
//   message: "Test description for post",
//   likes: 20
// });

function createNewPost(postData){
  containerId = "post"+postData.containerid;
  $("#feedContainer").append(createDiv("post-container", containerId));
  var postContainer = $("#"+containerId);
  postContainer.html(postInfoContainer)
  var accountContainer = postContainer.find(".post-info-container > .poster-account")
  accountContainer.find(".account-info > .account-name").html(postData.username)
  accountContainer.find(".account-info > .account-tag").html(postData.usertag)
  if(postData.imgtype == 'local'){
    postContainer.find(".post-image-container > .post-image > img").attr("src", getImgPath(postData.imgpath))
  } else if(postData.imgtype == 'web'){
    postContainer.find(".post-image-container > .post-image > img").attr("src", postData.imgpath)
  }
  postContainer.find(".post-info-container > .post-msg").html(postData.message)
  //console.log(postData.likes);
  //console.log(((postData?.likes != null && postData.likes > 0) ? postData.likes : 0) + " Likes");
  postContainer.find(".post-info-container > .post-likes-container > div > .numLikes").html(" " + ((postData?.likes != null && postData.likes > 0) ? postData.likes : 0) + " Likes")

  // console.log(postContainer);
}
