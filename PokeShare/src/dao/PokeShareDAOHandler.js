//library 'pg' para node - conexão com o servidor pgAdmin
const { Client } = require('pg');
const phasher = require('./PHasher.js');
const PokeShareDBCreator = require('./PokeShareDBCreator.js');
const dbCreator = new PokeShareDBCreator();
let instance;
instance = instance ?? null;
let connectedUser;
connectedUser = connectedUser ?? null;

class PokeShareDAOHandler {

  constructor(){
    dbCreator.createDBIfNeeded(PokeShareDAO)
  }

  disconnectUser(){
    connectedUser = null;
  }

  getConnectedUser(){
    return connectedUser;
  }




  async compareHashed(password, hashedPassword){
    return await phasher.compare(password, hashedPassword);
  }

  async login(username, password, callbackSuccess, callbackFail = function(){}){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      const results = await dao.query("SELECT userID, username, password, name, email, role FROM useracc");
      //console.log(results);
      //filtra array para obter apenas o usuário com o username e senha inseridos
      let userSuccess = results.rows.filter(userObj => {
        return (username === userObj.username || username === userObj.email)
      });
      let success = [];
      for(var i = 0; i < userSuccess.length; i++){
        if(await this.compareHashed(password, userSuccess[i].password)){
          success.push(userSuccess[i]);
        }
      }
      //console.log(success);
      if(success.length > 0){
        //remove a senha do objeto antes de passá-lo na função de callback
        delete success[0].password;
        //console.log("asdasd");
        //console.log(connectedUser);
        connectedUser = success[0];
        //console.log("AAAAAA");
        //console.log(connectedUser);
        //console.log(success);
        console.log(`${success[0].userid}`);
        const newlogged = await dao.query(`SELECT log_in_user(${success[0].userid})`);
        console.log("NEW LOGGED");
        console.log(newlogged);
        callbackSuccess(success[0]);
      } else callbackFail();
      await dao.end();
      dao = null;
    }
    catch(err){
      throw err;
    }
  }

  async getFollowing(userid, callbackSuccess, callbackFail = function(){}){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      const results = await dao.query(`SELECT followed FROM following WHERE follower = ${userid}`);
      let success = results.rows;
      if(success.length > 0){
        callbackSuccess(success);
      } else callbackSuccess([]);
      await dao.end();
      dao = null;
    }
    catch(err){
      throw err;
    }

  }

  async getimgtest(callbackSuccess, callbackFail = function(){}){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      const results = await dao.query("SELECT img FROM image");
      let success = results.rows;
      if(success.length > 0){
        callbackSuccess(success[0]);
      } else callbackFail();
      await dao.end();
      dao = null;
    }
    catch(err){
      throw err;
    }
  }

  async addError(errorm){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      const results = await dao.query(`INSERT INTO error_log(logid, description, userid) VALUES(default, '${errorm}', 2)`);
      console.log(`${errorm}`);
      console.log(results);
      // if(results.rowCount > 0) callbackSuccess();
      // else callbackFail();
      await dao.end();
      dao = null;
    }
    catch(err){
      throw err;
    }
  }

  async createAccount(username, password, name, email, role, logged, callbackSuccess, callbackFail = function(){}){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      //obtém uma id disponível
      // const queryMaxId = await dao.query("SELECT MAX(userid) FROM useracc");
      // const userid = queryMaxId.rows[0].max + 1;
      const hashedPassword = await phasher.hash(password);
      const results = await dao.query(`INSERT INTO useracc(username, password, name, email, role, logged) VALUES('${username}', '${hashedPassword}', '${name}', '${email}', '${role}', '${logged}')`);
      if(results.rowCount > 0) callbackSuccess();
      else callbackFail();
      await dao.end();
      dao = null;
    }
    catch(err){
      throw err;
    }
  }


  async updateLikes(postId, numLikes){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      // const posts = await dao.query(`SELECT postid, userid, description, to_char(date, 'DD/MM/YYYY HH24:mi:ss') AS date, likes, pokeid, isholo FROM posts`);
      // const posts = await dao.query(`SELECT p.postid, u.userid, u.username AS usertag, u.name AS username, p.description, to_char(p.date, 'DD/MM/YYYY HH24:mi:ss') AS date, p.likes, p.pokeid, p.isholo FROM posts p, useracc u WHERE p.userid = u.userid`);
      const posts = await dao.query(`UPDATE posts SET likes = ${numLikes} WHERE postId=${postId}`);
      await dao.end();
      dao = null;
    }
    catch(err){
      console.log(err);
    }
  }



  async getAllPosts(callbackSuccess, callbackFail = function(){}){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      // const posts = await dao.query(`SELECT postid, userid, description, to_char(date, 'DD/MM/YYYY HH24:mi:ss') AS date, likes, pokeid, isholo FROM posts`);
      // const posts = await dao.query(`SELECT p.postid, u.userid, u.username AS usertag, u.name AS username, p.description, to_char(p.date, 'DD/MM/YYYY HH24:mi:ss') AS date, p.likes, p.pokeid, p.isholo FROM posts p, useracc u WHERE p.userid = u.userid`);
      const posts = await dao.query(`SELECT postid, userid, username AS usertag, name AS username, description, to_char(date, 'DD/MM/YYYY HH24:mi:ss') AS date, likes, pokeid, isholo FROM view_userposts`);
      console.log(posts.rows);
      console.log(posts.rowCount);
      if(posts.rowCount > 0) callbackSuccess(posts.rows);
      else callbackFail();
      await dao.end();
      dao = null;
    }
    catch(err){
      callbackFail()
      console.log(err);
    }
  }

  async createPost(data, callbackSuccess, callbackFail = function(){}){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      let getNewPostId = true;

      if(getNewPostId){
        //caso precise gerar uma nova tarefa id, gera uma id disponível
        const queryMaxId = await dao.query("SELECT MAX(postid) FROM posts");
        console.log(queryMaxId);
        const newPostId = queryMaxId.rows[0].max + 1;
        data.postid = newPostId
        console.log("postId");
        console.log(data.postid);
      }
      // const queryPostExists = await dao.query(`SELECT postid FROM posts WHERE postid=${data.postid}`);
      const isHolo = data.isHolo ? 'TRUE' : 'FALSE'
      console.log("holo");
      console.log(isHolo);
      console.log(data);
      const results = await dao.query(`INSERT INTO posts VALUES(${data.postid}, ${data.userid}, '${data.message}', '30/01/2022 00:00:00', 0, ${data.pokemonId}, '${isHolo}')`);
      console.log("results");
      console.log(results);
      if(results && results.rowCount > 0) callbackSuccess();
      else callbackFail();
      await dao.end();
      dao = null;
    }
    catch(err){
      callbackFail();
      console.log(err);
    }
  }

  async getAudits(callbackSuccess, callbackFail = function(){}){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      const results = await dao.query(`SELECT l.type, l.tablename, l.command, to_char(l.data, 'DD/MM/YYYY HH24:mi:ss') AS data, l.newvalue, l.oldvalue, u.userid, u.username FROM Log l, useracc u WHERE u.userid = l.useracc`);
      console.log("results");
      console.log(results);
      if(results && results.rowCount > 0) callbackSuccess(results.rows);
      else callbackFail();
      await dao.end();
      dao = null;
    }
    catch(err){
      callbackFail();
      console.log(err);
    }
  }

  async getErrLog(callbackSuccess, callbackFail = function(){}){
    try{
      let dao = new PokeShareDAO();
      await dao.connect();
      const results = await dao.query(`SELECT e.logid, e.description, to_char(e.data, 'DD/MM/YYYY HH24:mi:ss') AS data, u.userid, u.username FROM error_log e, useracc u WHERE u.userid=e.userid`);
      console.log("results");
      console.log(results);
      if(results && results.rowCount > 0) callbackSuccess(results.rows);
      else callbackFail();
      await dao.end();
      dao = null;
    }
    catch(err){
      callbackFail();
      console.log(err);
    }
  }


  //método para obter a instância utilizada do Handler
  //dessa forma não é preciso passar o handler entre os objetos do sistema
  static getInstance(){
    if(!instance){
      //console.log("new instance");
      //console.log(connectedUser);
      instance = new PokeShareDAOHandler();
    }
    return instance;
  }

}




class PokeShareDAO {

  constructor(){
    this.connection = new Client({
      user: "postgres",
      password: "pgsLostTheGame",
      host: "localhost",
      port: 9786,
      database: "PokeShare"
    });
    this.isConnected = false;
  }

  async connect(){
    // console.log("dao:connect");
    if(!this.isConnected){
      // console.log("dao:connect:ifTrue");
      try{
        // console.log("dao:connect:awaitConnection");
        await this.connection.connect();
        // console.log("dao:connect:connected");
        this.isConnected = true;
        return true;
      } catch(err){
        //console.log(err);
      }
    } else {
      // console.log("dao:connect:ifFalse");
      return true;
    }
  }

  async query(command){
    try{
      // console.log("dao:query");
      const results = await this.connection.query(command);
      // console.log("dao:query:received");
      return results;
    } catch(err){
      //console.log(err);
    }
  }

  async end(){
    await this.connection.end();
    this.isConnected = false;
    return;
  }
}


module.exports = PokeShareDAOHandler;
