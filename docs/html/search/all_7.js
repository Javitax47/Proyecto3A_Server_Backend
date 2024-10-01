var searchData=
[
  ['pool_0',['pool',['../db_8js.html#ab7ab846d8317850d72512f720c6a05e2',1,'pool:&#160;db.js'],['../server_8js.html#ab7ab846d8317850d72512f720c6a05e2',1,'pool:&#160;server.js'],['../server_8test_8js.html#ab7ab846d8317850d72512f720c6a05e2',1,'pool:&#160;server.test.js']]],
  ['port_1',['port',['../server_8js.html#a33d36bbc039be3c3264e5df64b13df7f',1,'server.js']]],
  ['post_2',['post',['../server_8js.html#ada627b72d50508e9ed4b456d3bf85e42',1,'post(&apos;/&apos;, async(req, res)=&gt; { const { type, value, timestamp, userId }=req.body;try { const userExists=await pool.query(&apos;SELECT *FROM users WHERE id=$1&apos;, [userId]);if(userExists.rows.length===0) { return res.status(400).send({ message:&quot;User does not exist&quot; });} await pool.query(&apos;INSERT INTO sensors(type, value, timestamp, user_id) VALUES($1, $2, $3, $4)&apos;, [type, value, timestamp, userId]);res.status(200).send({ message:&quot;Successfully added sensor data&quot; });} catch(err) { console.log(err);res.sendStatus(500);} }):&#160;server.js'],['../server_8js.html#a34dc36f4b2dfd9a9ab83ebb3cc288fde',1,'post(&apos;/users&apos;, async(req, res)=&gt; { const { username }=req.body;try { await pool.query(&apos;INSERT INTO users(username) VALUES($1)&apos;, [username]);res.status(200).send({ message:&quot;Successfully added user&quot; });} catch(err) { console.log(err);res.sendStatus(500);} }):&#160;server.js']]],
  ['previos_3',['Requisitos Previos',['../index.html#autotoc_md5',1,'']]],
  ['proyecto_4',['Estructura del Proyecto',['../index.html#autotoc_md4',1,'']]],
  ['pruebas_5',['Lista de pruebas',['../test.html',1,'']]]
];
