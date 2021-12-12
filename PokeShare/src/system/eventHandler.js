const electron = require('electron')
const { BrowserWindow, app, ipcMain, Menu } = electron;
const daoHandler = require('../dao/PokeShareDAOHandler.js').getInstance()

// console.log(daoHandler);
const path = require('path');
const url = require('url');
var PokeApi = require('pokeapi');

const pdf = require("html-pdf");
const ejs = require("ejs")

var Pokedex = require('pokedex-promise-v2');
var P = new Pokedex();



var mainWindow;





app.on('ready', () => {
  process.on('uncaughtException', function(err, e, e2) {
    console.log('-----------');
    console.log('-----------');
    console.log('-----------');
    let message = 'Caught exception:'+err
    console.log(message);
    console.log(err);
    console.log('-----------');
    console.log('-----------');
    console.log('-----------');
    daoHandler.addError(err.toString());
  });
  createWindow('login');

});

ipcMain.on('test2', (e, data) => {
  // console.log("AAAAAb");
  // console.log(data);
  if(data.a == 2){
    // console.log("Yes, data.a == 2");
    mainWindow.webContents.send('test1', {a: 1, b: 2})
  }
})

var allPosts = [];

async function sendAllPostsWithApiData(data, isDashboardWindow = false){
  allPosts = [];
  for(var i = 0; i < data.length; i++){
    var tempPost = data[i]
    var poke = await P.getPokemonByName(data[i].pokeid)
    tempPost.pokemonApiData = {
      id: poke.id,
      name: poke.name,
      sprite: poke.sprites.front_default,
      sprite_shiny: poke.sprites.front_shiny
    }
    console.log(tempPost);
    allPosts.push(tempPost)
  }
  if(isDashboardWindow){
    windowDashboard.webContents.send('dashboard:posts', allPosts)
  } else {
    mainWindow.webContents.send('getAllPosts:success', {
      allPosts: allPosts,
      userFollowing: loggedUser.following
    })
  }
}

ipcMain.on('requestAllPosts', (e, Xdata) => {
  daoHandler.getAllPosts((data) => {
    console.log('getAllPosts:success');
    console.log(data);
    sendAllPostsWithApiData(data);

  }, () => {
    console.log('getAllPosts:failed');
    mainWindow.webContents.send('createPost:failed')
  })
})

//testGetAllPosts();

// function testGetAllPosts(){
//
// }

ipcMain.on('tabNewPost:createPost', function(e, data){
  console.log("Chegou");
  console.log(data);
  daoHandler.createPost(data, () => {
    console.log('createPost:success');
    mainWindow.webContents.send('createPost:success')
  }, () => {
    console.log('createPost:failed');
    mainWindow.webContents.send('createPost:failed')
  })
})

function removeMenu(){
  const menu = null //Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

var windowAdmin;
var windowDashboard;


function createWindowAdmin(){
  windowAdmin = new BrowserWindow({
    height: 550,
    width: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../ui/preload.js')
    }
  });


  var filePath = '../ui/windowAdmin/windowAdmin.html';

  windowAdmin.loadURL(url.format({
      pathname: path.join(__dirname, filePath),
      protocol: 'file:',
      slashes: true
  }));

}


function createWindowDashboard(){
  windowDashboard = new BrowserWindow({
    height: 550,
    width: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../ui/preload.js')
    }
  });


  var filePath = '../ui/windowDashboard/windowDashboard.html';

  windowDashboard.loadURL(url.format({
      pathname: path.join(__dirname, filePath),
      protocol: 'file:',
      slashes: true
  }));

}



function createWindow(key){
  mainWindow = new BrowserWindow({
    height: (key == 'main') ? 800 : 550,
    width: (key == 'main') ? 1200 : 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../ui/preload.js')
    }
  });


  var filepath;
  if(key === 'main'){
    filePath = '../ui/mainWindow/mainWindow.html'
  } else if(key === 'login') {
    filePath = '../ui/windowLogin/windowLogin.html'
  } else if(key === 'admin') {
    filePath = '../ui/windowAdmin/windowAdmin.html'
  }

  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, filePath),
      protocol: 'file:',
      slashes: true
  }));

  if(key === 'main'){
    mainWindow.on('close', () => {
      app.quit();
    })
    // console.log("AAAAAAAAAAA");
    mainWindow.webContents.send('test1', {a: 1, b: 2})
  }
}


///////////////////////
var loggedUser = {
  id: -1,
  isAdmin: false,
  following: []
}



ipcMain.on('windowLogin:requestLogin', (e, data) => {
  // console.log("ayy");
  daoHandler.login(data.username, data.password, (user) => {
    console.log("Login successful - "+user.username);
    loggedUser.id = user.userid
    loggedUser.isAdmin = (user.role === 'admin')
    console.log("======================================");
    console.log(loggedUser.id);

    daoHandler.getFollowing(user.userid, (following) => {

      user.following = following
      loggedUser.following = following

      console.log("FFFFFFFFFFFFFFFFFFFFFFFFF")
      console.log(following)

      testPokeApi()
      mainWindow.close()
      createWindow('main')
      // console.log("aaaaaaa");
      mainWindow.on('ready-to-show', function(){
        // console.log("bbbbbbb");
        console.log("AAAAAAAA");
        console.log(user);
        mainWindow.webContents.send('user', user)
      })
    })

  }, () => {
    console.log("Error during login")
  });
});


ipcMain.on('windowLogin:createAccount', (e, data) => {
  console.log("ayy");
  daoHandler.createAccount(data.username, data.password, data.username, data.email, 'user', 'false', () => {
    console.log("YESSSSSSSSSSSSSSSSS")
    mainWindow.webContents.send('createAccount:success');
  }, () => {
    console.log("NOOOOOOOOOOOO");
    mainWindow.webContents.send('createAccount:failed');
  })
});









function testPokeApi(){
  var api = PokeApi.v1();
  console.log("Test api");
  var hey = api.get('pokemon', 1).then(function(bulbasaur) {
      console.log("Here's Bulbasaur:", bulbasaur);
  	api.get(bulbasaur.moves).then(function(moves) {
  	    console.log("Full move list:" + moves);
      }, function(err) {
          console.log('ERROR', err);
      })
  }, function(err) {
      console.log('ERROR', err);
  });
  console.log(hey);
}




ipcMain.on('windowAdmin:buildReport', function(e, data){
  ejs.renderFile(path.join(__dirname, ".", "reportModel.ejs"), {
    title: data.title,
    username: loggedUser.id,
    makeTable: true,
    headers: data.headers,
    content: data.table
  }, (err, html) => {
    if(err) console.log(err);
    else {
      console.log(html);
      pdf.create(html, {}).toFile("src/reports/test1.pdf", (err, res) => {
        if(err) console.log(err);
        else console.log(res);
      });
    }
  })

})









ipcMain.on('likesDiff', function(e, data){
  daoHandler.updateLikes(data.postId, data.numLikes);

})







/*

Admin window events

*/


ipcMain.on('openAdminWindow', function(){
  createWindowAdmin();
})





ipcMain.on('windowAdmin:requestAudits', function(){
  daoHandler.getAudits(auditArray => {
    var auditReturnObj = {
      auditArray: []
    };
    for(var i = 0; i < auditArray.length; i++){
      auditReturnObj.auditArray.push({
        type: auditArray[i].type,
        table: auditArray[i].tablename,
        query: auditArray[i].command,
        date: auditArray[i].data,
        new: auditArray[i].newvalue,
        old: auditArray[i].oldvalue,
        userid: auditArray[i].userid,
        username: auditArray[i].username
      })
    }
    windowAdmin.webContents.send("windowAdmin:auditsSuccess", auditReturnObj);
  });
});

ipcMain.on('windowAdmin:requestErrLog', function(){
  daoHandler.getErrLog(errlogArray => {
    var errlogReturnObj = {
      errlogArray: []
    };
    for(var i = 0; i < errlogArray.length; i++){
      errlogReturnObj.errlogArray.push({
        userid: errlogArray[i].userid,
        username: errlogArray[i].username,
        date: errlogArray[i].data,
        err: errlogArray[i].description
      })
    }
    windowAdmin.webContents.send("windowAdmin:errlogSuccess", errlogReturnObj);
  });
});







//DASHBOARD


ipcMain.on('openDashboardWindow', function(){
  console.log("Dashboard2");
  createWindowDashboard();
})


ipcMain.on('dashboard:requestPosts', function(){
  //sendPostsToDashboard()
  daoHandler.getAllPosts((data) => {
    console.log('dashboard:requestPosts:success');
    console.log(data);
    windowDashboard.webContents.send('dashboard:posts', {
      posts: data,
      userid: loggedUser.id,
      isAdmin: loggedUser.isAdmin
    })

  }, () => {
    console.log('dashboard:requestPosts:failed');
    mainWindow.webContents.send('dashboard:requestPosts:failed')
  })
})




/*


//http://127.0.0.1:3000/ElectronProjects/PokeShare/src/ui/windowLogin/

https://docs.pokemontcg.io/api-reference/cards/search-cards

*/
