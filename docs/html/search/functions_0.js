var searchData=
[
  ['delete_0',['delete',['../server_8js.html#ade31ab42dea1017a8d2d44e862caa91c',1,'delete(&apos;/users/:id/measurements&apos;, async(req, res)=&gt; { const { id }=req.params;try { const result=await pool.query(&apos;DELETE FROM sensors WHERE user_id=$1&apos;, [id]);res.status(200).send({ message:&quot;Successfully deleted measurements for user&quot; });} catch(err) { console.log(err);res.sendStatus(500);} }):&#160;server.js'],['../server_8js.html#af640350ec6bd6015c65a7345cf2f179c',1,'delete(&apos;/reset&apos;, async(req, res)=&gt; { try { await pool.query(&apos;DROP TABLE IF EXISTS sensors&apos;);await pool.query(&apos;DROP TABLE IF EXISTS users&apos;);await pool.query(` CREATE TABLE users(id SERIAL PRIMARY KEY, username VARCHAR(100) NOT NULL);CREATE TABLE sensors(id SERIAL PRIMARY KEY, type VARCHAR(100), value FLOAT, timestamp TIMESTAMP, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE);`);await pool.query(&apos;INSERT INTO users(username) VALUES($1),($2)&apos;, [&apos;user1&apos;, &apos;user2&apos;]);await pool.query(` INSERT INTO sensors(type, value, timestamp, user_id) VALUES($1, $2, $3, $4),($5, $6, $7, $8) `, [&apos;temperature&apos;, 25.5, &apos;2024-09-22T12:00:00Z&apos;, 1, &apos;humidity&apos;, 60.0, &apos;2024-09-22T12:00:00Z&apos;, 2]);res.status(200).send({ message:&quot;Successfully reset users and sensors tables with default data&quot; });} catch(err) { console.log(err);res.sendStatus(500);} }):&#160;server.js'],['../server_8js.html#a01acdbc62169a3111492295809c917b9',1,'delete(&apos;/erase&apos;, async(req, res)=&gt; { try { await pool.query(&apos;DROP TABLE IF EXISTS sensors&apos;);await pool.query(&apos;DROP TABLE IF EXISTS users&apos;);res.status(200).send({ message:&quot;Successfully reset users and sensors tables&quot; });} catch(err) { console.log(err);res.sendStatus(500);} }):&#160;server.js']]],
  ['describe_1',['describe',['../server_8test_8js.html#a70d1e546b373d9c07a6237b86b91d5f3',1,'server.test.js']]]
];