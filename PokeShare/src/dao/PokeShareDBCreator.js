// const { Client } = require('pg');
// const phasher = require('./PHasher.js');





class PokeShareDBCreator {

  constructor(){

  }

  async createDBIfNeeded(PokeShareDAO){
    try{
      let dao = new PokeShareDAO();
      try {
        await dao.connect();
        await dao.query(`SELECT * FROM useracc`);
        await dao.end();
      } catch (error) {
        var dont = true
        if(dont){
          return;
        }
        await dao.query(`CREATE TABLE posts (
          postid SERIAL NOT NULL,
          userid integer NOT NULL,
          description character varying(280),
          date timestamp without time zone,
          likes integer,
          pokeid integer,
          isholo boolean
        ); `);
        await dao.query(`CREATE TABLE comments (
          commentid SERIAL NOT NULL,
          userid integer NOT NULL,
          postid integer NOT NULL,
          message character varying(280),
          date timestamp without time zone
        ); `);
        await dao.query(`CREATE TABLE error_log (
          logid SERIAL NOT NULL,
          description character varying(10000),
          data timestamp without time zone,
          userid integer NOT NULL
        ); `);
        await dao.query(`CREATE TABLE following (
          followed integer,
          follower integer
        );`);
        await dao.query(`CREATE TABLE log (
          logid SERIAL NOT NULL,
          type character varying(10) NOT NULL,
          tablename character varying(100) NOT NULL,
          command character varying(10000) NOT NULL,
          data timestamp without time zone NOT NULL,
          newvalue character varying(10000),
          oldvalue character varying(10000),
          useracc integer
        );`);
        await dao.query(`CREATE TABLE useracc (
          userid SERIAL NOT NULL,
          username character varying(25),
          password character varying(100) NOT NULL,
          name character varying(50) NOT NULL,
          email character varying(50),
          role character varying(10),
          logged boolean
        ); `);
        await dao.query(`CREATE VIEW view_usercards AS
          SELECT u.userid,
          u.username,
          p.pokeid,
          p.isholo
          FROM public.useracc u,
          public.posts p
          WHERE (p.userid = u.userid); `);
          await dao.query(`CREATE VIEW view_userposts AS
            SELECT p.postid,
            u.userid,
            u.username,
            u.name,
            p.description,
            p.date,
            p.likes,
            p.pokeid,
            p.isholo
            FROM public.useracc u,
            public.posts p
            WHERE (p.userid = u.userid);`);

            await dao.query(`CREATE FUNCTION insert_log() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            DECLARE
            v_old_data TEXT;
            v_new_data TEXT;
            BEGIN
            if (TG_OP = 'UPDATE') then
            v_old_data := ROW(OLD.*);
            v_new_data := ROW(NEW.*);
            insert into Log (logid, type, tablename, command, data, newvalue, oldvalue, useracc)
            values (DEFAULT, TG_OP::TEXT,TG_TABLE_NAME::TEXT,current_query(),current_timestamp, v_new_data, v_old_data,(select userid from useracc where logged = true) );
            RETURN NEW;
            elsif (TG_OP = 'DELETE') then
            v_old_data := ROW(OLD.*);
            insert into Log (logid, type, tablename, command,data, oldvalue, useracc)
            values (DEFAULT, TG_OP::TEXT, TG_TABLE_NAME::TEXT, current_query(), current_timestamp, v_old_data,(select userid from useracc where logged = true));
            RETURN OLD;
            elsif (TG_OP = 'INSERT') then
            v_new_data := ROW(NEW.*);
            insert into Log (logid, type, tablename, command,data, newvalue, useracc)
            values (DEFAULT, TG_OP::TEXT, TG_TABLE_NAME::TEXT, current_query(), current_timestamp, v_new_data, (select userid from useracc where logged = true));
            RETURN NEW;
            else
            RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - Other action occurred: %, at %',TG_OP,now();
            RETURN NULL;
            end if;
            END;
            $$;`);

            await dao.query(`CREATE TRIGGER posts_log AFTER INSERT OR DELETE OR UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION insert_log();`);
            await dao.query(`CREATE TRIGGER following_log AFTER INSERT OR DELETE OR UPDATE ON following FOR EACH ROW EXECUTE FUNCTION insert_log();`);
            await dao.query(`CREATE TRIGGER user_log AFTER INSERT OR DELETE OR UPDATE ON useracc FOR EACH ROW EXECUTE FUNCTION insert_log();`);
            await dao.query(`CREATE TRIGGER comments_log AFTER INSERT OR DELETE OR UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION insert_log();`);
            await dao.query(`CREATE FUNCTION .log_in_user(id integer) RETURNS integer
            LANGUAGE plpgsql
            AS $$
            DECLARE
            BEGIN
            UPDATE useracc SET logged = false WHERE logged = true;
            UPDATE useracc SET logged = true WHERE userid = id;
            RETURN 1;
            END;
            $$;`);
            await dao.query(`CREATE FUNCTION unfollow_you() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            DECLARE
            BEGIN
            if(new.followed=new.follower) THEN
            RAISE EXCEPTION 'YOU CANT FOLLOW YOURSELF';
            END IF;
            RETURN NEW;
            END;
            $$;`);
            await dao.query(`CREATE TRIGGER unfollow_you AFTER INSERT ON following FOR EACH ROW EXECUTE FUNCTION unfollow_you();`);
            await dao.query(`CREATE FUNCTION deletepost() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            declare
            begin
            DELETE FROM comments WHERE comments.postid = old.postid;
            RETURN OLD;
            end;
            $$;`);
            await dao.query(`CREATE TRIGGER deletepost BEFORE DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION deletepost();`);
            await dao.query(`CREATE FUNCTION unfollow() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            DECLARE
            BEGIN
            DELETE FROM following WHERE following.followed = old.userid OR following.follower=old.userid;
            RETURN OLD;
            END;
            $$;
            `);
            await dao.query(`ALTER TABLE ONLY posts
              ADD CONSTRAINT posts_userid_fkey FOREIGN KEY (userid) REFERENCES useracc(userid);
              `);
              await dao.query(`ALTER TABLE ONLY log
                ADD CONSTRAINT log_useracc_fkey FOREIGN KEY (useracc) REFERENCES useracc(userid);`);
                await dao.query(`ALTER TABLE ONLY following
                  ADD CONSTRAINT following_follower_fkey FOREIGN KEY (follower) REFERENCES useracc(userid);`);
                  await dao.query(`ALTER TABLE ONLY following
                    ADD CONSTRAINT following_followed_fkey FOREIGN KEY (followed) REFERENCES useracc(userid);`);
                    await dao.query(`ALTER TABLE ONLY error_log
                      ADD CONSTRAINT error_log_userid_fkey FOREIGN KEY (userid) REFERENCES useracc(userid);`);
                      await dao.query(`ALTER TABLE ONLY comments
                        ADD CONSTRAINT comments_userid_fkey FOREIGN KEY (userid) REFERENCES useracc(userid);`);
                        await dao.query(`ALTER TABLE ONLY comments
                          ADD CONSTRAINT comments_postid_fkey FOREIGN KEY (postid) REFERENCES posts(postid);`);
                          await dao.query(`INSERT INTO useracc VALUES(1,'Professor Oak','0000','Samuel Oak','professoroak@gmail.com','admin','false');`);
                          await dao.end();
      }}catch(error){
        console.log(error);
      }
    }
  }



  module.exports = PokeShareDBCreator;
