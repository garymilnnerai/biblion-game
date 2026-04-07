import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, off } from "firebase/database";

// ═══════════════════════════════════════════════════════════════
//  FIREBASE CONFIG — Biblion-game
// ═══════════════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyDhesKic9SZPIcwkeSSfUb2eUy9u2UHIBA",
  authDomain: "biblion-game.firebaseapp.com",
  databaseURL: "https://biblion-game-default-rtdb.firebaseio.com",
  projectId: "biblion-game",
  storageBucket: "biblion-game.appspot.com",
  messagingSenderId: "58974260169",
  appId: "1:58974260169:web:951b2cb69615ee3495f618",
  measurementId: "G-W059MNPE4Q"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ═══════════════════════════════════════════════════════════════
//  CATEGORÍAS
// ═══════════════════════════════════════════════════════════════
const CATS: Record<string,{icon:string;color:string;bg:string}> = {
  Personas: { icon:"👤", color:"#9B7FA6", bg:"rgba(155,127,166,0.15)" },
  Lugares:  { icon:"📍", color:"#5AABA6", bg:"rgba(90,171,166,0.15)" },
  Números:  { icon:"🔢", color:"#D4B95A", bg:"rgba(212,185,90,0.15)" },
  Animales: { icon:"🦁", color:"#D4975A", bg:"rgba(212,151,90,0.15)" },
  Plantas:  { icon:"🌿", color:"#6BAD74", bg:"rgba(107,173,116,0.15)" },
  Objetos:  { icon:"📦", color:"#5A9BC4", bg:"rgba(90,155,196,0.15)" },
  Eventos:  { icon:"⭐", color:"#C46891", bg:"rgba(196,104,145,0.15)" },
  Desafío:  { icon:"⚡", color:"#FF4444", bg:"rgba(255,68,68,0.12)" },
  Tesoro:   { icon:"💎", color:"#FFD700", bg:"rgba(255,215,0,0.15)" },
};

// ═══════════════════════════════════════════════════════════════
//  BASE DE DATOS DE PREGUNTAS
// ═══════════════════════════════════════════════════════════════

const DB = [
  // ═══ PERSONAS ═══
  { id:1, cat:"Personas", q:"¿Quién fue el primer hombre según Génesis 2?", hints:["Vivió en el jardín del Edén","Fue formado del polvo de la tierra","Su costilla fue usada para crear a la mujer"], a:"Adán", opts:["Adán","Set","Enoc","Noé"] },
  { id:2, cat:"Personas", q:"¿Quién construyó el arca para salvarse del diluvio?", hints:["Era un hombre justo en su generación","Dios le dio medidas exactas","Entró con su familia y los animales"], a:"Noé", opts:["Noé","Sem","Jafet","Lot"] },
  { id:3, cat:"Personas", q:"¿Quién mató a su hermano Abel según Génesis 4?", hints:["Era agricultor","Dios no aceptó su ofrenda","Su nombre empieza con C"], a:"Caín", opts:["Caín","Set","Lamec","Enós"] },
  { id:4, cat:"Personas", q:"¿Quién fue el rey más sabio de Israel según 1 Reyes 3?", hints:["Pidió a Dios sabiduría y no riquezas","Construyó el templo de Jerusalén","Era hijo del rey David"], a:"Salomón", opts:["Salomón","Roboam","Jeroboam","Josafat"] },
  { id:5, cat:"Personas", q:"¿Quién mató al gigante Goliat según 1 Samuel 17?", hints:["Era el menor de los hijos de Isaí","Usó una honda y una piedra","Llegó a ser rey de Israel"], a:"David", opts:["David","Joab","Abisal","Benaía"] },
  { id:6, cat:"Personas", q:"¿Quién fue tragado por un gran pez según Jonás 1?", hints:["Huyó de Dios en un barco","Estuvo tres días en el vientre del pez","Fue enviado a predicar a Nínive"], a:"Jonás", opts:["Jonás","Amós","Oseas","Miqueas"] },
  { id:7, cat:"Personas", q:"¿Quién fue arrojado al foso de los leones según Daniel 6?", hints:["Era gobernador en Babilonia","Oró tres veces al día","Dios cerró la boca de los leones"], a:"Daniel", opts:["Daniel","Ananías","Misael","Azarías"] },
  { id:8, cat:"Personas", q:"¿Quién fue vendido como esclavo por sus hermanos según Génesis 37?", hints:["Era el hijo preferido de Jacob","Tenía una túnica de colores","Llegó a ser gobernador de Egipto"], a:"José", opts:["José","Benjamín","Rubén","Judá"] },
  { id:9, cat:"Personas", q:"¿Quién fue la primera mujer según Génesis 2?", hints:["Fue formada de una costilla","Vivió en el jardín del Edén","Su nombre significa madre de todos los vivientes"], a:"Eva", opts:["Eva","Sara","Rebeca","Raquel"] },
  { id:10, cat:"Personas", q:"¿Quién fue el padre de Isaac según Génesis 21?", hints:["Dios le prometió hacerlo padre de muchas naciones","Salió de Ur de los Caldeos","Su nombre fue cambiado de Abram"], a:"Abraham", opts:["Abraham","Nacor","Harán","Taré"] },
  { id:11, cat:"Personas", q:"¿Quién fue arrebatado al cielo en un carro de fuego según 2 Reyes 2?", hints:["Su sucesor fue Eliseo","Desafió a los profetas de Baal en el Monte Carmelo","Resucitó al hijo de la viuda de Sarepta"], a:"Elías", opts:["Elías","Eliseo","Ezequías","Moisés"] },
  { id:12, cat:"Personas", q:"¿Quién fue la reina que salvó a su pueblo según Ester 4?", hints:["Su primo Mardoqueo la aconsejó","Dijo: si perezco que perezca","Era reina del rey Asuero de Persia"], a:"Ester", opts:["Ester","Rut","Débora","Rahab"] },
  { id:13, cat:"Personas", q:"¿Quién fue la única jueza de Israel mencionada en Jueces 4?", hints:["Animó a Barac a luchar contra Sísara","Era profetisa y juzgaba bajo una palmera","Su nombre significa abeja en hebreo"], a:"Débora", opts:["Débora","Hulda","Ana","Miriam"] },
  { id:14, cat:"Personas", q:"¿Quién fue el sucesor de Moisés para entrar a la tierra prometida?", hints:["Era de la tribu de Efraín","Fue uno de los 12 espías que dieron buen informe","Su nombre original era Oseas"], a:"Josué", opts:["Josué","Caleb","Finees","Eleazar"] },
  { id:15, cat:"Personas", q:"¿Quién fue el profeta que confrontó al rey David por Urías según 2 Samuel 12?", hints:["Le contó la parábola de la oveja robada","David se arrepintió al escucharle","Su nombre empieza con N"], a:"Natán", opts:["Natán","Gad","Sadoc","Abiatar"] },
  { id:16, cat:"Personas", q:"¿Quién fue la mujer moabita que acompañó a su suegra Noemí a Belén?", hints:["Dijo: donde tú mueras moriré yo","Espigó en los campos de Booz","Llegó a ser bisabuela del rey David"], a:"Rut", opts:["Rut","Orfa","Noemí","Rahab"] },
  { id:17, cat:"Personas", q:"¿Quién fue la madre de Samuel que lo dedicó a Dios desde antes de nacer?", hints:["Era estéril y oró con amargura en el tabernáculo","El sacerdote Elí pensó que estaba borracha","Cuando Samuel nació lo llevó al tabernáculo en Silo"], a:"Ana", opts:["Ana","Penina","Elcana","Hulda"] },
  { id:18, cat:"Personas", q:"¿Quién fue el primer mártir cristiano mencionado en Hechos 7?", hints:["Era uno de los siete diáconos","Fue apedreado por el Sanedrín","Saulo cuidaba las ropas de los que lo apedreaban"], a:"Esteban", opts:["Esteban","Felipe","Prócoro","Nicanor"] },
  { id:19, cat:"Personas", q:"¿Quién negó a Jesús tres veces según Mateo 26?", hints:["Era uno de los 12 apóstoles","Jesús le había dicho que esto pasaría","Era pescador del Mar de Galilea"], a:"Pedro", opts:["Pedro","Andrés","Santiago","Tomás"] },
  { id:20, cat:"Personas", q:"¿Quién traicionó a Jesús por monedas de plata según Mateo 26?", hints:["Era uno de los 12 apóstoles","Lo identificó con un beso en el huerto","Luego se arrepintió y devolvió el dinero"], a:"Judas Iscariote", opts:["Judas Iscariote","Barrabás","Simón el Zelote","Mateo"] },

  // ═══ LUGARES ═══
  { id:21, cat:"Lugares", q:"¿En qué jardín vivieron Adán y Eva según Génesis 2?", hints:["Dios lo plantó en el oriente","Tenía un árbol del bien y del mal","Fue custodiado por querubines al salir"], a:"Edén", opts:["Edén","Getsemaní","Betania","Siloé"] },
  { id:22, cat:"Lugares", q:"¿En qué monte recibió Moisés los mandamientos según Éxodo 19?", hints:["También se llama Horeb","Está en la península del Sinaí","Dios habló desde una nube densa sobre él"], a:"Monte Sinaí", opts:["Monte Sinaí","Monte Hermón","Monte Sión","Monte Carmelo"] },
  { id:23, cat:"Lugares", q:"¿Qué mar dividió Moisés con su vara según Éxodo 14?", hints:["El ejército de Faraón fue ahogado en él","Está entre África y Arabia","Israel cruzó en seco"], a:"Mar Rojo", opts:["Mar Rojo","Mar Muerto","Mar de Galilea","Mar Mediterráneo"] },
  { id:24, cat:"Lugares", q:"¿En qué ciudad fue construida la Torre de Babel según Génesis 11?", hints:["Estaba en la tierra de Sinar","Nabucodonosor la hizo grande después","Está en el actual Iraq"], a:"Babilonia", opts:["Babilonia","Nínive","Ur","Damasco"] },
  { id:25, cat:"Lugares", q:"¿En qué ciudad nació Jesús según Lucas 2?", hints:["José y María viajaron allí para el censo","Era la ciudad de David","Estaba en Judea al sur de Jerusalén"], a:"Belén", opts:["Belén","Nazaret","Jericó","Hebrón"] },
  { id:26, cat:"Lugares", q:"¿En qué lugar fue arrestado Jesús según Juan 18?", hints:["Era un huerto al pie del Monte de los Olivos","Allí oró antes de ser arrestado","Su nombre significa prensa de aceite"], a:"Getsemaní", opts:["Getsemaní","Betfagé","Betania","Siloé"] },
  { id:27, cat:"Lugares", q:"¿En qué lugar fue crucificado Jesús según Juan 19?", hints:["Significa lugar de la calavera en hebreo","También se conoce como Calvario en latín","Estaba fuera de las murallas de Jerusalén"], a:"Gólgota", opts:["Gólgota","Getsemaní","Siloé","Monte de los Olivos"] },
  { id:28, cat:"Lugares", q:"¿En qué ciudad de Macedonia fundó Pablo una iglesia según Hechos 16?", hints:["Allí bautizó a Lidia vendedora de púrpura","Pablo y Silas fueron encarcelados allí","Un terremoto abrió las puertas de la cárcel"], a:"Filipos", opts:["Filipos","Tesalónica","Berea","Anfípolis"] },
  { id:29, cat:"Lugares", q:"¿En qué ciudad de Grecia predicó Pablo en el Areópago según Hechos 17?", hints:["Mencionó al Dios no conocido","Algunos se burlaron cuando habló de la resurrección","Era la ciudad de los filósofos griegos"], a:"Atenas", opts:["Atenas","Corinto","Efeso","Tesalónica"] },
  { id:30, cat:"Lugares", q:"¿En qué isla quedó varado Pablo después de un naufragio según Hechos 28?", hints:["Los nativos mostraron mucha humanidad","Una víbora se prendió en la mano de Pablo","Pablo sanó al padre del hombre principal de la isla"], a:"Malta", opts:["Malta","Creta","Chipre","Patmos"] },
  { id:31, cat:"Lugares", q:"¿En qué río fue encontrado el bebé Moisés según Éxodo 2?", hints:["Su madre lo puso en una cesta de juncos","La hija del Faraón lo encontró al bañarse","Era el río más importante de Egipto"], a:"El río Nilo", opts:["El río Nilo","El río Éufrates","El río Jordán","El río Tigris"] },
  { id:32, cat:"Lugares", q:"¿En qué ciudad reinó David los primeros 7 años según 2 Samuel 2?", hints:["Antes de trasladar su reinado a Jerusalén","Estaba en el territorio de Judá","Allí fue ungido rey de Judá"], a:"Hebrón", opts:["Hebrón","Belén","Betel","Mamré"] },
  { id:33, cat:"Lugares", q:"¿En qué ciudad predicó Jonás el arrepentimiento según Jonás 3?", hints:["Era la ciudad capital del Imperio Asirio","Tenía una extensión de tres días de camino","Todo el pueblo ayunó desde el rey hasta los animales"], a:"Nínive", opts:["Nínive","Babilonia","Asiria","Damasco"] },
  { id:34, cat:"Lugares", q:"¿En qué lugar fue llamado Moisés por primera vez según Éxodo 3?", hints:["Estaba pastoreando el rebaño de su suegro","Vio una zarza que ardía y no se consumía","Dios le habló desde allí"], a:"Monte Horeb", opts:["Monte Horeb","Monte Sinaí","Monte Carmelo","Monte Tabor"] },
  { id:35, cat:"Lugares", q:"¿En qué ciudad nació Abraham según Génesis 11?", hints:["Era una ciudad en Mesopotamia","Su familia vivía allí antes de salir","Su nombre completo era Ur de los Caldeos"], a:"Ur de los Caldeos", opts:["Ur de los Caldeos","Harán","Damasco","Nippur"] },
  { id:36, cat:"Lugares", q:"¿En qué lugar Jacob vio la escalera que llegaba al cielo según Génesis 28?", hints:["Iba de viaje a Mesopotamia","Puso una piedra como almohada para dormir","Llamó a ese lugar Betel que significa casa de Dios"], a:"Luz (Betel)", opts:["Luz (Betel)","Hebrón","Siquem","Peniel"] },
  { id:37, cat:"Lugares", q:"¿En qué ciudad fue coronado Salomón rey según 1 Reyes 1?", hints:["Era una fuente cerca de Jerusalén","El sacerdote Sadoc y el profeta Natán lo ungieron allí","Su nombre empieza con G"], a:"Gihón", opts:["Gihón","Siloé","Betesda","Cedrón"] },
  { id:38, cat:"Lugares", q:"¿En qué ciudad de Grecia fundó Pablo la iglesia a la que escribió dos cartas?", hints:["Era una ciudad portuaria importante","Pablo vivió allí un año y medio","Le escribió sobre la resurrección en 1 Corintios 15"], a:"Corinto", opts:["Corinto","Efeso","Atenas","Filipos"] },
  { id:39, cat:"Lugares", q:"¿En qué monte fue detenido Abraham cuando iba a sacrificar a Isaac?", hints:["Dios proveyó un carnero en su lugar","Abraham llamó al lugar Jehová Jireh","Está en la tierra de Moriah"], a:"Monte Moriah", opts:["Monte Moriah","Monte Sinaí","Monte Horeb","Monte Tabor"] },
  { id:40, cat:"Lugares", q:"¿En qué isla escribió Juan el Apocalipsis según Apocalipsis 1?", hints:["Estaba allí por causa de la palabra de Dios","Era una isla en el Mar Egeo","Su nombre empieza con P"], a:"Patmos", opts:["Patmos","Creta","Chipre","Malta"] },

  // ═══ NÚMEROS ═══
  { id:41, cat:"Números", q:"¿Cuántos mandamientos recibió Moisés en el Sinaí según Éxodo 20?", hints:["Escritos en dos tablas de piedra","Corresponden a los dedos de dos manos","Están en Éxodo 20"], a:"10 mandamientos", opts:["10 mandamientos","7 mandamientos","12 mandamientos","15 mandamientos"] },
  { id:42, cat:"Números", q:"¿Cuántos días duró la lluvia del diluvio según Génesis 7?", hints:["Es un número muy simbólico en la Biblia","Moisés ayunó este número de días","Es múltiplo de 8 y de 5"], a:"40 días y 40 noches", opts:["40 días y 40 noches","30 días y 30 noches","7 días y 7 noches","120 días y 120 noches"] },
  { id:43, cat:"Números", q:"¿Cuántos años estuvo Israel en el desierto según Números 14?", hints:["Un año por cada día que los espías exploraron","Los espías exploraron 40 días","El número es el mismo que los días de lluvia"], a:"40 años", opts:["40 años","70 años","20 años","50 años"] },
  { id:44, cat:"Números", q:"¿Cuántos hijos tuvo Jacob según Génesis?", hints:["Formaron las tribus de Israel","Uno fue vendido como esclavo","El número es igual al de los apóstoles de Jesús"], a:"12 hijos", opts:["12 hijos","10 hijos","14 hijos","7 hijos"] },
  { id:45, cat:"Números", q:"¿Cuántos años vivió Matusalén según Génesis 5?", hints:["Es el hombre más longevo de la Biblia","Vivió más de 900 años","Su nombre es sinónimo de vejez extrema"], a:"969 años", opts:["969 años","950 años","912 años","930 años"] },
  { id:46, cat:"Números", q:"¿Cuántos apóstoles eligió Jesús según Lucas 6?", hints:["El número corresponde a las tribus de Israel","Uno lo traicionó","Son una docena"], a:"12 apóstoles", opts:["12 apóstoles","10 apóstoles","7 apóstoles","70 apóstoles"] },
  { id:47, cat:"Números", q:"¿Cuántos días estuvo Jesús siendo tentado en el desierto según Mateo 4?", hints:["Ayunó todo ese tiempo","Satanás lo tentó tres veces","El número es 40"], a:"40 días", opts:["40 días","20 días","7 días","3 días"] },
  { id:48, cat:"Números", q:"¿Cuántos libros tiene el Nuevo Testamento?", hints:["Comienzan con los cuatro evangelios","Terminan con el Apocalipsis","El número es 27"], a:"27 libros", opts:["27 libros","30 libros","24 libros","39 libros"] },
  { id:49, cat:"Números", q:"¿Cuántas tinajas de piedra llenó Jesús en la boda de Caná según Juan 2?", hints:["Cada una cabía entre dos y tres cántaros","Los criados las llenaron hasta arriba","El número de tinajas era 6"], a:"6 tinajas", opts:["6 tinajas","12 tinajas","3 tinajas","7 tinajas"] },
  { id:50, cat:"Números", q:"¿Cuántos peces pescaron los discípulos en la pesca milagrosa según Juan 21?", hints:["Jesús les dijo que echaran la red al lado derecho","No podían sacar la red por la cantidad","El número exacto es 153"], a:"153 peces", opts:["153 peces","120 peces","276 peces","99 peces"] },
  { id:51, cat:"Números", q:"¿Cuántos años vivió Abraham según Génesis 25?", hints:["Tuvo a Isaac cuando tenía 100 años","Murió en buena vejez","Vivió 175 años"], a:"175 años", opts:["175 años","180 años","148 años","165 años"] },
  { id:52, cat:"Números", q:"¿Cuántos años tardó Salomón en construir el templo según 1 Reyes 6?", hints:["Comenzó en el cuarto año de su reinado","Lo terminó en el undécimo año","El número de años es 7"], a:"7 años", opts:["7 años","10 años","3 años","13 años"] },
  { id:53, cat:"Números", q:"¿Cuántos años tardó Salomón en construir su palacio según 1 Reyes 7?", hints:["Tardó más en construir su palacio que el templo","El templo tardó 7 años","Su palacio tardó 13 años"], a:"13 años", opts:["13 años","20 años","7 años","15 años"] },
  { id:54, cat:"Números", q:"¿Cuántos libros tiene el Antiguo Testamento?", hints:["El Nuevo Testamento tiene 27","Juntos suman 66","El número es 39"], a:"39 libros", opts:["39 libros","36 libros","40 libros","27 libros"] },
  { id:55, cat:"Números", q:"¿Cuántos profetas de Baal desafió Elías en el Monte Carmelo según 1 Reyes 18?", hints:["También había 400 profetas de Asera","Elías estaba solo frente a todos ellos","El número de profetas de Baal era 450"], a:"450 profetas de Baal", opts:["450 profetas de Baal","400 profetas de Baal","500 profetas de Baal","300 profetas de Baal"] },
  { id:56, cat:"Números", q:"¿Cuántos años tenía Abraham cuando nació Isaac según Génesis 21?", hints:["Sara tenía 90 años","Era humanamente imposible","El número es cien"], a:"100 años", opts:["100 años","90 años","80 años","110 años"] },
  { id:57, cat:"Números", q:"¿Cuántos capítulos tiene el libro de los Salmos?", hints:["Es el libro más largo de la Biblia","El capítulo 119 es el más largo","El número de capítulos es 150"], a:"150 capítulos", opts:["150 capítulos","120 capítulos","100 capítulos","175 capítulos"] },
  { id:58, cat:"Números", q:"¿Cuánto tiempo estuvo Israel en Egipto según Éxodo 12:40?", hints:["El número está entre 400 y 500","Dios le había dicho a Abraham que sus descendientes serían forasteros","El número exacto es 430"], a:"430 años", opts:["430 años","400 años","450 años","500 años"] },
  { id:59, cat:"Números", q:"¿Cuántos siclos de plata pagaron los hermanos de José al venderlo según Génesis 37?", hints:["Los ismaelitas lo compraron","El número es veinte","Era el precio de un esclavo en aquella época"], a:"20 siclos de plata", opts:["20 siclos de plata","30 siclos de plata","50 siclos de plata","10 siclos de plata"] },
  { id:60, cat:"Números", q:"¿Cuántos años vivió Noé según Génesis 9?", hints:["Vivió más de 900 años","El diluvio ocurrió cuando tenía 600 años","Vivió 350 años después del diluvio"], a:"950 años", opts:["950 años","969 años","912 años","930 años"] },

  // ═══ ANIMALES ═══
  { id:61, cat:"Animales", q:"¿Qué animal tentó a Eva en el jardín del Edén según Génesis 3?", hints:["Dios lo maldijo por encima de todos los animales","Era el más astuto de los animales del campo","Le habló a Eva sobre el árbol prohibido"], a:"La serpiente", opts:["La serpiente","El chacal","El dragón","La víbora"] },
  { id:62, cat:"Animales", q:"¿Qué animal habló con Balaam según Números 22?", hints:["Dios le abrió la boca para hablar","Vio al ángel del Señor antes que su amo","Era el animal que Balaam montaba"], a:"Una asna", opts:["Una asna","Un camello","Un buey","Un caballo"] },
  { id:63, cat:"Animales", q:"¿En qué tipo de animal entró Jesús a Jerusalén según Mateo 21?", hints:["Era un animal humilde","Se cumplió una profecía de Zacarías","Es un animal de carga muy paciente"], a:"Un asno", opts:["Un asno","Un camello","Un caballo blanco","Una mula"] },
  { id:64, cat:"Animales", q:"¿En qué forma descendió el Espíritu Santo cuando Jesús fue bautizado según Mateo 3?", hints:["Era una señal visible del cielo","El Padre habló en ese momento","Era un ave símbolo de paz"], a:"Como una paloma", opts:["Como una paloma","Como un águila","Como una tórtola","Como un gorrión"] },
  { id:65, cat:"Animales", q:"¿En qué animales entraron los demonios llamados Legión según Marcos 5?", hints:["Los demonios pedían no ser enviados al abismo","Se lanzaron por un precipicio al mar","Eran animales que Israel no comía"], a:"Cerdos", opts:["Cerdos","Cabras","Bueyes","Camellos"] },
  { id:66, cat:"Animales", q:"¿Qué tipo de aves alimentó a Elías junto al arroyo Querit según 1 Reyes 17?", hints:["Le traían pan y carne mañana y tarde","El arroyo se llamaba Querit","Eran aves negras"], a:"Cuervos", opts:["Cuervos","Águilas","Palomas","Cigüeñas"] },
  { id:67, cat:"Animales", q:"¿Qué tipo de animales usó Sansón para incendiar los campos filisteos según Jueces 15?", hints:["Capturó 300 de ellos","Les ató antorchas en las colas","Las soltó en los sembradíos"], a:"Zorras", opts:["Zorras","Chacales","Lobos","Hienas"] },
  { id:68, cat:"Animales", q:"¿Qué tipo de gran animal tragó a Jonás según el libro de Jonás?", hints:["Jonás estuvo 3 días en su vientre","Dios preparó este animal especialmente","El texto hebreo dice 'gran pez'"], a:"Un gran pez", opts:["Un gran pez","Una ballena azul","Un tiburón blanco","Una orca"] },
  { id:69, cat:"Animales", q:"¿Qué tipo de animales enviaron los filisteos con el arca al devolverla según 1 Samuel 6?", hints:["Eran hembras que nunca habían sido uncidas","Jalaron el carro sin haber sido amaestradas","Eran vacas que amamantaban a sus crías"], a:"Vacas recién paridas", opts:["Vacas recién paridas","Bueyes jóvenes","Asnos mansos","Camellos de carga"] },
  { id:70, cat:"Animales", q:"¿Qué animal encontró Pedro con una moneda en la boca según Mateo 17?", hints:["Jesús le dijo que fuera al mar y echara el anzuelo","El primer pez que sacara la tendría","Era un pez del Mar de Galilea"], a:"Un pez", opts:["Un pez","Una ostra","Un cangrejo","Un pulpo"] },

  // ═══ PLANTAS ═══
  { id:71, cat:"Plantas", q:"¿Desde qué tipo de planta habló Dios a Moisés según Éxodo 3?", hints:["Ardía y no se consumía","Dios habló desde ella","Estaba en el monte Horeb"], a:"Una zarza ardiente", opts:["Una zarza ardiente","Una palmera en llamas","Un árbol de cedro ardiendo","Un arbusto de acacia"] },
  { id:72, cat:"Plantas", q:"¿Qué árbol subió Zaqueo para ver a Jesús según Lucas 19?", hints:["Era un árbol de hoja perenne","Su nombre en latín es Ficus sycomorus","Zaqueo era bajo de estatura"], a:"Un sicómoro", opts:["Un sicómoro","Una higuera","Un terebinto","Una palmera"] },
  { id:73, cat:"Plantas", q:"¿Con qué planta comparó Jesús el reino de los cielos según Mateo 13?", hints:["Es la más pequeña de las semillas","Cuando crece se hace un árbol grande","Los pájaros hacen nidos en sus ramas"], a:"La semilla de mostaza", opts:["La semilla de mostaza","La semilla de lino","El grano de trigo","La semilla de comino"] },
  { id:74, cat:"Plantas", q:"¿Qué árbol usó Elías para descansar cuando huyó de Jezabel según 1 Reyes 19?", hints:["Se sentó bajo su sombra y pidió morir","Un ángel lo tocó y le dio de comer","Es un árbol del desierto"], a:"Un enebro", opts:["Un enebro","Una palmera","Un tamarisco","Un terebinto"] },
  { id:75, cat:"Plantas", q:"¿De qué árbol tomaron hojas Adán y Eva para cubrirse según Génesis 3?", hints:["Usaron sus hojas para hacerse delantales","Es un árbol de fruta conocida","Sus hojas son grandes y anchas"], a:"La higuera", opts:["La higuera","La palmera","El sicómoro","El granado"] },
  { id:76, cat:"Plantas", q:"¿Con qué planta protegió Dios a Jonás del sol según Jonás 4?", hints:["Creció en una noche sobre Jonás","Jonás se alegró mucho por ella","Al día siguiente Dios preparó un gusano que la atacó"], a:"Una calabacera", opts:["Una calabacera","Una parra de vid","Una higuera silvestre","Una planta de ricino"] },
  { id:77, cat:"Plantas", q:"¿Qué pasó con la higuera que Jesús maldijo según Mateo 21?", hints:["No tenía frutos aunque tenía hojas","Jesús la maldijo al no encontrar fruto","Al día siguiente estaba completamente seca"], a:"Se secó desde las raíces", opts:["Se secó desde las raíces","Perdió todas sus hojas","Se partió por el tronco","El fuego la consumió"] },
  { id:78, cat:"Plantas", q:"¿Con qué tipo de planta fue fabricada la corona que pusieron a Jesús según Juan 19?", hints:["Era una planta con pinchos","La pusieron en su cabeza para burlarse","Es símbolo del sufrimiento de Cristo"], a:"Espinas", opts:["Espinas","Cardos","Zarzas","Juncos"] },
  { id:79, cat:"Plantas", q:"¿Con qué hicieron a Moisés un cesto para ponerlo en el Nilo según Éxodo 2?", hints:["Era una planta que crece a la orilla del río","También se usa para hacer papel","Su nombre es papiro en griego"], a:"Juncos (papiro)", opts:["Juncos (papiro)","Madera de cedro","Ramas de sauce","Hojas de palmera"] },
  { id:80, cat:"Plantas", q:"¿En qué tipo de planta comparó Jesús el reino de los cielos a la levadura según Mateo 13?", hints:["La mujer la escondió en tres medidas de harina","La levadura fermenta toda la masa","El reino de Dios crece de forma invisible"], a:"La levadura mezclada con harina", opts:["La levadura mezclada con harina","El grano de trigo sembrado","La semilla de mostaza plantada","El árbol de higuera brotando"] },

  // ═══ OBJETOS ═══
  { id:81, cat:"Objetos", q:"¿Qué contenía el Arca del Pacto según Hebreos 9?", hints:["Tres objetos sagrados estaban dentro","Uno era la vara que floreció","Otro era el maná guardado"], a:"Las tablas, la vara de Aarón y el maná", opts:["Las tablas, la vara de Aarón y el maná","Las tablas, el incensario y el aceite","El libro de la ley, las tablas y el maná","Las tablas, el maná y la menorá"] },
  { id:82, cat:"Objetos", q:"¿Con qué arma mató David al gigante Goliat según 1 Samuel 17?", hints:["No usó espada ni lanza","Usó un arma simple de pastor","Una piedra y un instrumento de cuero"], a:"Honda y piedra", opts:["Honda y piedra","Lanza y escudo","Arco y flecha","Espada corta"] },
  { id:83, cat:"Objetos", q:"¿Qué objeto hizo Moisés para que los israelitas picados vivieran según Números 21?", hints:["Dios le ordenó ponerlo en un asta","Quien miraba a este objeto quedaba vivo","Jesús lo menciona en Juan 3"], a:"Una serpiente de bronce", opts:["Una serpiente de bronce","Un toro de bronce","Un becerro de oro","Un águila de plata"] },
  { id:84, cat:"Objetos", q:"¿Cuántos brazos tenía el candelero de oro del tabernáculo según Éxodo 25?", hints:["Iluminaba el lugar santo del tabernáculo","Es símbolo del Estado de Israel hoy","El número de brazos era 7"], a:"7 brazos", opts:["7 brazos","6 brazos","9 brazos","12 brazos"] },
  { id:85, cat:"Objetos", q:"¿Qué instrumento musical usó María para celebrar el cruce del Mar Rojo según Éxodo 15?", hints:["Era un instrumento de percusión","María tomó este instrumento y dirigió a las mujeres","Es un instrumento que se toca con las manos"], a:"La pandereta", opts:["La pandereta","La flauta","El arpa","La trompeta"] },
  { id:86, cat:"Objetos", q:"¿Con qué objeto mató Jael al general Sísara según Jueces 4?", hints:["Era un instrumento de construcción","Lo clavó en la sien de Sísara mientras dormía","Era una estaca de tienda de campaña"], a:"Una estaca de tienda y un mazo", opts:["Una estaca de tienda y un mazo","Una espada y un escudo","Una hoz y una lanza","Una jabalina y una daga"] },
  { id:87, cat:"Objetos", q:"¿Con qué hilo marcó Rahab su ventana para ser salvada según Josué 2?", hints:["Los espías le dijeron que lo colgara","El color es símbolo de sangre y redención","Era un cordón de color rojo escarlata"], a:"Cordón rojo escarlata", opts:["Cordón rojo escarlata","Tela azul real","Cinta de lino blanco","Banda de púrpura"] },
  { id:88, cat:"Objetos", q:"¿Qué ungió la mujer sobre Jesús en casa de Simón el leproso según Mateo 26?", hints:["Era muy costoso","Lo derramó sobre la cabeza de Jesús","Los discípulos se enojaron por el gasto"], a:"Perfume de alabastro muy costoso", opts:["Perfume de alabastro muy costoso","Aceite de oliva común","Aceite de mirra diluido","Vino mezclado con especias"] },
  { id:89, cat:"Objetos", q:"¿Qué tipo de armadura espiritual menciona Pablo en Efesios 6?", hints:["Incluye el cinturón de la verdad","Incluye el escudo de la fe","Termina con la espada del Espíritu"], a:"Cinturón, coraza, calzado, escudo, yelmo y espada", opts:["Cinturón, coraza, calzado, escudo, yelmo y espada","Túnica, casco, lanza, rodela, sandalias y arco","Coraza, yelmo, lanza, espada, escudo y flechas","Manto, cinturón, espada, arco, carcaj y sandalias"] },
  { id:90, cat:"Objetos", q:"¿Qué instituyó Jesús en la última cena según Mateo 26?", hints:["Tomó el pan y lo partió","También tomó la copa","Le llamó el nuevo pacto en su sangre"], a:"El pan y la copa de la Cena del Señor", opts:["El pan y la copa de la Cena del Señor","El cordero y el pan sin levadura","La copa y el incienso sagrado","El pan, la sal y el vino mezclado"] },

  // ═══ EVENTOS ═══
  { id:91, cat:"Eventos", q:"¿Cuántas plagas envió Dios sobre Egipto según Éxodo?", hints:["La última fue la muerte de los primogénitos","La primera fue el agua en sangre","El número es igual a los dedos de dos manos"], a:"10 plagas", opts:["10 plagas","7 plagas","12 plagas","9 plagas"] },
  { id:92, cat:"Eventos", q:"¿Qué ocurrió cuando Josué marchó alrededor de Jericó según Josué 6?", hints:["Marcharon durante 7 días","El séptimo día marcharon 7 veces","Al sonar las trompetas y gritar los muros cayeron"], a:"Los muros de Jericó cayeron", opts:["Los muros de Jericó cayeron","La ciudad se incendió sola","Una inundación destruyó la ciudad","Un terremoto abrió la muralla"] },
  { id:93, cat:"Eventos", q:"¿Qué ocurrió 50 días después de la Pascua según Hechos 2?", hints:["Los discípulos estaban reunidos en un lugar","El Espíritu Santo descendió como lenguas de fuego","Pedro predicó y 3,000 personas se convirtieron"], a:"El Espíritu Santo descendió en Pentecostés", opts:["El Espíritu Santo descendió en Pentecostés","Jesús ascendió al cielo desde el Monte de los Olivos","Pablo fue convertido en el camino a Damasco","Los apóstoles fueron encarcelados por el Sanedrín"] },
  { id:94, cat:"Eventos", q:"¿Qué pasó en el templo cuando Jesús murió según Mateo 27?", hints:["Un objeto en el templo se rasgó en dos","Era de arriba abajo","Era el velo del santuario"], a:"El velo del templo se rasgó de arriba abajo", opts:["El velo del templo se rasgó de arriba abajo","El altar del incienso se cayó solo","Las puertas del templo se abrieron solas","La lámpara del santuario se apagó"] },
  { id:95, cat:"Eventos", q:"¿Qué dijo la voz del cielo cuando Jesús fue bautizado según Mateo 3?", hints:["El Espíritu Santo bajó como paloma","El Padre habló desde el cielo","Dijo: este es mi Hijo amado"], a:"Este es mi Hijo amado en quien me complazco", opts:["Este es mi Hijo amado en quien me complazco","He aquí el Cordero de Dios que quita el pecado","Este es el profeta que había de venir al mundo","Oíd a este mi siervo en quien me he complacido"] },
  { id:96, cat:"Eventos", q:"¿Qué ocurrió con los tres amigos de Daniel en el horno de fuego según Daniel 3?", hints:["El rey lo había calentado siete veces más","El rey vio a un cuarto personaje en el horno","Salieron sin que su ropa oliera a humo"], a:"Salieron ilesos y sin olor a humo", opts:["Salieron ilesos y sin olor a humo","El fuego se apagó milagrosamente antes","Un ángel los sacó volando del horno","El horno se enfrió como si fuera agua"] },
  { id:97, cat:"Eventos", q:"¿Qué sucedió con el sol cuando Josué peleó contra los amorreos según Josué 10?", hints:["Josué habló al sol y a la luna","No hubo día semejante antes ni después","El sol se detuvo en medio del cielo"], a:"El sol se detuvo", opts:["El sol se detuvo","Una oscuridad cubrió el campo de batalla","El sol brilló durante la noche","Cayó granizo de fuego del cielo"] },
  { id:98, cat:"Eventos", q:"¿Qué señal puso Dios en el cielo después del diluvio según Génesis 9?", hints:["Era una señal del pacto entre Dios y Noé","Aparece cuando llueve","Tiene varios colores"], a:"El arcoíris", opts:["El arcoíris","Una estrella brillante","Una nube de fuego","Una columna de luz"] },
  { id:99, cat:"Eventos", q:"¿Qué hizo Jesús en la boda de Caná según Juan 2?", hints:["Era su primer milagro","María le dijo a los sirvientes que hicieran lo que él dijera","Convirtió el agua en otra bebida"], a:"Convirtió el agua en vino", opts:["Convirtió el agua en vino","Multiplicó el vino que quedaba","Sanó al mayordomo de la boda","Hizo aparecer comida para los invitados"] },
  { id:100, cat:"Eventos", q:"¿Qué ocurrió en la Transfiguración de Jesús según Mateo 17?", hints:["Ocurrió en un monte alto","Su rostro resplandeció como el sol","Aparecieron Moisés y Elías hablando con él"], a:"Jesús se transfiguró y aparecieron Moisés y Elías", opts:["Jesús se transfiguró y aparecieron Moisés y Elías","Jesús ascendió al cielo brevemente","Una nube de fuego rodeó a Jesús","Ángeles cantaron alrededor de Jesús"] },

  // ═══ DESAFÍOS ═══
  { id:101, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años vivió Matusalén según Génesis 5?", hints:["Es el hombre más longevo de la Biblia","Vivió más de 900 años","El número exacto es 969"], a:"969 años", opts:["969 años","950 años","930 años","912 años"] },
  { id:102, cat:"Desafío", q:"⚡ DESAFÍO: ¿En qué versículo dice: En el principio era el Verbo?", hints:["Es el comienzo del evangelio de Juan","El Verbo estaba con Dios y era Dios","Es Juan capítulo 1 versículo 1"], a:"Juan 1:1", opts:["Juan 1:1","Génesis 1:1","Colosenses 1:15","Hebreos 1:1"] },
  { id:103, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años reinó Manasés rey de Judá según 2 Reyes 21?", hints:["Era hijo del rey Ezequías","Hizo más mal que los amorreos","Reinó 55 años"], a:"55 años", opts:["55 años","40 años","29 años","52 años"] },
  { id:104, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años llevaba enferma la mujer encorvada que Jesús sanó según Lucas 13?", hints:["Un espíritu de enfermedad la tenía encorvada","No podía enderezarse de ninguna manera","Llevaba 18 años enferma"], a:"18 años", opts:["18 años","38 años","12 años","8 años"] },
  { id:105, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos frutos del Espíritu enumera Pablo en Gálatas 5?", hints:["Son 9 frutos en total","Comienzan con amor gozo paz","Terminan con templanza o dominio propio"], a:"9 frutos", opts:["9 frutos","7 frutos","12 frutos","5 frutos"] },
  { id:106, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántas veces rodearon Jericó en total durante los 7 días según Josué 6?", hints:["Los primeros 6 días rodearon una vez cada día","El séptimo día rodearon 7 veces","El total es 6 más 7 igual 13"], a:"13 veces en total", opts:["13 veces en total","14 veces en total","7 veces en total","12 veces en total"] },
  { id:107, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos capítulos tiene el libro de Apocalipsis?", hints:["Es el último libro de la Biblia","Contiene las 7 cartas a las iglesias","El número es 22"], a:"22 capítulos", opts:["22 capítulos","24 capítulos","20 capítulos","27 capítulos"] },
  { id:108, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto pesaba la punta de la lanza de Goliat según 1 Samuel 17?", hints:["El asta era como el rodillo de un telar","La punta era de hierro","Pesaba 600 siclos de hierro"], a:"600 siclos de hierro", opts:["600 siclos de hierro","500 siclos de bronce","1000 siclos de acero","300 siclos de hierro"] },
  { id:109, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años tenía Josías cuando comenzó a reinar según 2 Reyes 22?", hints:["Era muy joven cuando subió al trono","Comenzó a buscar a Dios en el octavo año de su reinado","Tenía 8 años cuando empezó a reinar"], a:"8 años", opts:["8 años","12 años","16 años","6 años"] },
  { id:110, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto tiempo duró la sequía anunciada por Elías según Santiago 5?", hints:["Santiago lo menciona como ejemplo de oración eficaz","Elías era un hombre como nosotros","Duró tres años y seis meses"], a:"3 años y 6 meses", opts:["3 años y 6 meses","2 años y 6 meses","7 años","4 años"] },

  // ═══ MÁS PERSONAS ═══
  { id:111, cat:"Personas", q:"¿Quién fue la profetisa y hermana de Moisés mencionada en Éxodo 15?", hints:["Tomó una pandereta y dirigió a las mujeres en canto","Fue herida de lepra por murmurar contra Moisés","Su nombre empieza con M"], a:"Miriam", opts:["Miriam","Débora","Hulda","Ana"] },
  { id:112, cat:"Personas", q:"¿Quién fue el suegro de Moisés que le aconsejó delegar la justicia según Éxodo 18?", hints:["Era sacerdote de Madián","Le dijo que el trabajo era demasiado para uno solo","Su nombre empieza con J"], a:"Jetro", opts:["Jetro","Reuel","Hobab","Ragüel"] },
  { id:113, cat:"Personas", q:"¿Quién fue el médico que escribió el evangelio de Lucas según Colosenses 4?", hints:["Pablo lo menciona como médico amado","Escribió también el libro de Hechos","Era compañero de viaje de Pablo"], a:"Lucas", opts:["Lucas","Tito","Timoteo","Silas"] },
  { id:114, cat:"Personas", q:"¿Quién era el ángel que anunció el nacimiento de Jesús a María según Lucas 1?", hints:["También anunció el nacimiento de Juan el Bautista a Zacarías","Aparece también en Daniel","Su nombre significa fuerza de Dios"], a:"Gabriel", opts:["Gabriel","Miguel","Rafael","Uriel"] },
  { id:115, cat:"Personas", q:"¿Quién fue la madre de Juan el Bautista según Lucas 1?", hints:["Era parienta de María la madre de Jesús","Estaba avanzada en años cuando quedó embarazada","Su nombre empieza con E"], a:"Elisabet", opts:["Elisabet","Ana","Marta","Salomé"] },
  { id:116, cat:"Personas", q:"¿Quién fue el padre de Juan el Bautista según Lucas 1?", hints:["Era sacerdote del orden de Abías","Quedó mudo por no creer al ángel Gabriel","Su nombre empieza con Z"], a:"Zacarías", opts:["Zacarías","Simeón","Elí","José"] },
  { id:117, cat:"Personas", q:"¿Quién fue el discípulo amado que estaba al pie de la cruz según Juan 19?", hints:["Jesús le encargó el cuidado de su madre","Era hijo de Zebedeo","Escribió el cuarto evangelio"], a:"Juan el apóstol", opts:["Juan el apóstol","Santiago el mayor","Andrés","Felipe"] },
  { id:118, cat:"Personas", q:"¿Quién fue el sacerdote que crió al niño Samuel en el tabernáculo de Silo según 1 Samuel 1?", hints:["Tenía dos hijos muy malvados Ofni y Finees","Murió al caer de su silla cuando supo que el arca fue capturada","Su nombre empieza con E"], a:"Elí", opts:["Elí","Samuel","Finees","Eleazar"] },
  { id:119, cat:"Personas", q:"¿Quién fue el primer rey de Israel según 1 Samuel 10?", hints:["Era de la tribu de Benjamín","Medía más de dos metros","Samuel lo ungió como rey"], a:"Saúl", opts:["Saúl","David","Isbóset","Abner"] },
  { id:120, cat:"Personas", q:"¿Quién fue el rey de Salem y sacerdote del Dios Altísimo según Génesis 14?", hints:["Salió a recibir a Abraham con pan y vino","Abraham le dio los diezmos de todo","No tiene genealogía registrada en el texto"], a:"Melquisedec", opts:["Melquisedec","Abimelec","Lot","Sem"] },

  // ═══ MÁS LUGARES ═══
  { id:121, cat:"Lugares", q:"¿En qué estanque Jesús sanó al paralítico de 38 años según Juan 5?", hints:["Tenía cinco pórticos","Allí yacía una multitud de enfermos","Su nombre empieza con B"], a:"Betesda", opts:["Betesda","Siloé","Cedrón","Gihón"] },
  { id:122, cat:"Lugares", q:"¿En qué ciudad ocurrió el primer milagro de Jesús según Juan 2?", hints:["Era en Galilea","Había una boda allí","Su nombre empieza con C"], a:"Caná de Galilea", opts:["Caná de Galilea","Capernaum","Nazaret","Betania"] },
  { id:123, cat:"Lugares", q:"¿En qué ciudad fue apedreado Pablo y dado por muerto según Hechos 14?", hints:["Era en la región de Licaonia","Antes los habitantes lo habían querido adorar como dios","Su nombre empieza con L"], a:"Listra", opts:["Listra","Derbe","Iconio","Antioquía de Pisidia"] },
  { id:124, cat:"Lugares", q:"¿En qué monte fue tentado Jesús según Mateo 4?", hints:["El diablo le mostró todos los reinos del mundo desde allí","Fue la tercera tentación","Era un monte muy alto"], a:"Un monte muy alto (no nombrado)", opts:["Un monte muy alto (no nombrado)","Monte Tabor","Monte Hermón","Monte de los Olivos"] },
  { id:125, cat:"Lugares", q:"¿En qué ciudad fue llevada cautiva el arca del pacto según 1 Samuel 5?", hints:["Los filisteos la pusieron junto a su ídolo Dagón","Dagón cayó dos veces ante el arca","Los habitantes fueron afligidos con tumores"], a:"Asdod", opts:["Asdod","Gaza","Ascalón","Ecrón"] },
  { id:126, cat:"Lugares", q:"¿En qué ciudad de Cilicia nació Pablo según Hechos 22?", hints:["Era en Asia Menor","Era una ciudad importante de Cilicia","Pablo dijo que era ciudadano de esa ciudad no pequeña"], a:"Tarso de Cilicia", opts:["Tarso de Cilicia","Antioquía de Siria","Éfeso","Salamina"] },
  { id:127, cat:"Lugares", q:"¿En qué isla escribió Juan el Apocalipsis según Apocalipsis 1?", hints:["Estaba allí por causa de la palabra de Dios","Era una isla en el Mar Egeo","Su nombre empieza con P"], a:"Patmos", opts:["Patmos","Creta","Chipre","Malta"] },
  { id:128, cat:"Lugares", q:"¿En qué ciudad predicó Jonás el arrepentimiento y todos ayunaron hasta los animales?", hints:["Era la capital del Imperio Asirio","Tenía una extensión de tres días de camino","Jonás 3 describe el arrepentimiento masivo"], a:"Nínive", opts:["Nínive","Babilonia","Damasco","Asiria"] },
  { id:129, cat:"Lugares", q:"¿En qué lugar fue convertido Saulo de Tarso según Hechos 9?", hints:["Iba de camino a perseguir cristianos","Una luz del cielo lo derribó","El Señor le habló y quedó ciego tres días"], a:"Camino a Damasco", opts:["Camino a Damasco","Camino a Jerusalén","Camino a Jericó","Camino a Gaza"] },
  { id:130, cat:"Lugares", q:"¿En qué monte proclamó Jesús las Bienaventuranzas según Mateo 5?", hints:["Es conocido como el Sermón del Monte","Estaba cerca del Mar de Galilea","Es un monte sin nombre específico en el texto"], a:"Un monte en Galilea", opts:["Un monte en Galilea","Monte Tabor","Monte Hermón","Monte Carmelo"] },

  // ═══ MÁS NÚMEROS ═══
  { id:131, cat:"Números", q:"¿Cuántos años vivió Isaac según Génesis 35?", hints:["Vivió más que su padre Abraham","Enterró a su padre junto con su hermano Ismael","Vivió 180 años"], a:"180 años", opts:["180 años","175 años","160 años","200 años"] },
  { id:132, cat:"Números", q:"¿Cuántos años tenía José cuando fue vendido por sus hermanos según Génesis 37?", hints:["Era joven cuando fue vendido","Después estuvo en la cárcel y ante el Faraón","Tenía 17 años cuando fue vendido"], a:"17 años", opts:["17 años","20 años","15 años","12 años"] },
  { id:133, cat:"Números", q:"¿Cuántos años llevaba paralítico el hombre de Betesda cuando Jesús lo sanó según Juan 5?", hints:["Jesús le preguntó si quería ser sano","Dijo que no tenía quien lo metiera al agua","Llevaba 38 años enfermo"], a:"38 años", opts:["38 años","18 años","40 años","12 años"] },
  { id:134, cat:"Números", q:"¿Cuántos años llevaba enferma la mujer del flujo de sangre según Lucas 8?", hints:["Había gastado todo en médicos sin sanar","Tocó el borde del manto de Jesús","El número es doce"], a:"12 años", opts:["12 años","18 años","7 años","38 años"] },
  { id:135, cat:"Números", q:"¿Cuántas iglesias de Asia recibieron cartas en Apocalipsis 2 y 3?", hints:["El número corresponde a los 7 candeleros","La primera fue Éfeso","La última fue Laodicea"], a:"7 iglesias", opts:["7 iglesias","10 iglesias","12 iglesias","5 iglesias"] },
  { id:136, cat:"Números", q:"¿Cuántos años reinó Salomón según 1 Reyes 11?", hints:["Comenzó a reinar muy joven","El reino se dividió después de su muerte","Reinó 40 años"], a:"40 años", opts:["40 años","20 años","33 años","50 años"] },
  { id:137, cat:"Números", q:"¿Cuántas bienaventuranzas aparecen en el Sermón del Monte según Mateo 5?", hints:["Todas comienzan con bienaventurados","Hablan de los pobres en espíritu los mansos etc.","El número generalmente reconocido es 8"], a:"8 bienaventuranzas", opts:["8 bienaventuranzas","7 bienaventuranzas","10 bienaventuranzas","9 bienaventuranzas"] },
  { id:138, cat:"Números", q:"¿Cuántos años llevaba el arca del pacto en casa de Abinadab antes de que David la trasladara?", hints:["La habían traído de los filisteos","Eleazar hijo de Abinadab la guardaba","Estuvo 20 años allí según 1 Samuel 7"], a:"20 años", opts:["20 años","7 años","40 años","30 años"] },
  { id:139, cat:"Números", q:"¿Cuántos talentos de oro trajo la reina de Sabá a Salomón según 1 Reyes 10?", hints:["También le trajo especias y piedras preciosas","Nunca más llegaron tantas especias","La cantidad fue 120 talentos de oro"], a:"120 talentos de oro", opts:["120 talentos de oro","100 talentos de oro","200 talentos de oro","60 talentos de oro"] },
  { id:140, cat:"Números", q:"¿Cuántos siclos de plata pagó David por la era de Arauna según 2 Samuel 24?", hints:["El rey no quería ofrecer a Dios lo que no le costaba nada","Arauna ofreció dársela gratis","David pagó 50 siclos de plata"], a:"50 siclos de plata", opts:["50 siclos de plata","100 siclos de plata","20 siclos de plata","600 siclos de oro"] },

  // ═══ MÁS ANIMALES ═══
  { id:141, cat:"Animales", q:"¿Cuántos pares de animales impuros entró Noé en el arca según Génesis 7?", hints:["Los animales puros entraron en grupos de siete","Los impuros entraron de dos en dos","El número de pares de animales impuros era uno"], a:"1 par de cada especie impura", opts:["1 par de cada especie impura","2 pares de cada especie impura","7 parejas de cada especie","3 pares de cada especie"] },
  { id:142, cat:"Animales", q:"¿En qué animal encontró Abraham el sustituto de Isaac en Génesis 22?", hints:["Estaba enredado en un matorral por los cuernos","Dios lo proveyó en el último momento","No era una oveja sino otro animal"], a:"Un carnero", opts:["Un carnero","Un toro","Una cabra","Un becerro"] },
  { id:143, cat:"Animales", q:"¿Qué animal envió Noé primero para ver si las aguas habían disminuido según Génesis 8?", hints:["Salió y volvía porque no encontraba tierra seca","Luego envió una paloma","Era un ave negra"], a:"Un cuervo", opts:["Un cuervo","Una paloma","Un águila","Una golondrina"] },
  { id:144, cat:"Animales", q:"¿Con qué comparó Jesús a los fariseos en Mateo 23 por su hipocresía?", hints:["Los llamó hijos de estos animales","Son animales venenosos","Los llamó también sepulcros blanqueados"], a:"Serpientes y víboras", opts:["Serpientes y víboras","Lobos y chacales","Zorras y culebras","Escorpiones y áspides"] },
  { id:145, cat:"Animales", q:"¿Qué animal simbólico describe Juan en Apocalipsis 5 como digno de abrir el rollo?", hints:["Era símbolo de la tribu de Judá","Pero Juan ve un animal diferente cuando mira","Era como inmolado y tenía 7 cuernos"], a:"Un Cordero", opts:["Un Cordero","Un León","Un Buey","Un Águila"] },
  { id:146, cat:"Animales", q:"¿Qué animal mandó Dios para que destruyera la calabacera de Jonás según Jonás 4?", hints:["Al amanecer atacó la planta de Jonás","La calabacera se secó","Era un pequeño invertebrado"], a:"Un gusano", opts:["Un gusano","Una langosta","Una oruga","Un escarabajo"] },
  { id:147, cat:"Animales", q:"¿Qué tipo de animal usó Sansón cuando mató a mil filisteos según Jueces 15?", hints:["Era parte del cuerpo de un animal muerto","Sansón la encontró en el suelo","Era la mandíbula de un animal común"], a:"La quijada de un asno", opts:["La quijada de un asno","El hueso de un camello","El colmillo de un jabalí","El asta de un buey"] },
  { id:148, cat:"Animales", q:"¿Qué animales enviaba Dios como plaga sobre Egipto en la octava plaga según Éxodo 10?", hints:["Cubrieron toda la superficie del país","Se comieron toda la vegetación que quedaba","Eran insectos que viajan en enjambres enormes"], a:"Langostas", opts:["Langostas","Moscas","Avispas","Saltamontes gigantes"] },
  { id:149, cat:"Animales", q:"¿Qué tipo de insecto comía Juan el Bautista en el desierto según Marcos 1?", hints:["También comía miel silvestre","Era un insecto comestible según la ley de Moisés","Es un insecto que salta"], a:"Langostas", opts:["Langostas","Cigarras","Escarabajos","Grillos"] },
  { id:150, cat:"Animales", q:"¿Qué animal apareció en la visión de Ezequiel 1 junto al hombre el León y el Buey?", hints:["Eran cuatro seres vivientes","Cada uno tenía cuatro caras","El cuarto ser viviente tenía cara de este animal"], a:"Un águila", opts:["Un águila","Un caballo","Un camello","Un avestruz"] },

  // ═══ MÁS PLANTAS ═══
  { id:151, cat:"Plantas", q:"¿Qué material vegetal fue usado para hacer la corona de espinas de Jesús?", hints:["Era una planta con pinchos","La pusieron en su cabeza para burlarse","Es símbolo del sufrimiento de Cristo"], a:"Espinos o zarzas", opts:["Espinos o zarzas","Cardos del campo","Ramas de acacia","Juncos del río"] },
  { id:152, cat:"Plantas", q:"¿Con qué planta hizo Moisés dulce el agua amarga de Mara según Éxodo 15?", hints:["Dios le mostró un árbol específico","Moisés echó el árbol al agua","El agua se volvió dulce milagrosamente"], a:"Un árbol (palo) que Dios mostró", opts:["Un árbol (palo) que Dios mostró","Una rama de hisopo","Hojas de olivo","Madera de cedro"] },
  { id:153, cat:"Plantas", q:"¿Con qué planta se purificaba a los leprosos en el Antiguo Testamento según Levítico 14?", hints:["También se usaba para aplicar la sangre del cordero","Se mojaba en sangre y agua","Era una planta herbácea aromática"], a:"Hisopo", opts:["Hisopo","Mirra","Canela","Aloe"] },
  { id:154, cat:"Plantas", q:"¿Qué tipo de árbol era el de la vida en el jardín del Edén según Génesis 2?", hints:["Quien comía de él vivía para siempre","Dios lo puso en medio del jardín","Fue custodiado por querubines al salir Adán y Eva"], a:"El árbol de la vida", opts:["El árbol de la vida","El árbol de la sabiduría","El árbol del conocimiento","El árbol de la eternidad"] },
  { id:155, cat:"Plantas", q:"¿Qué planta aromática fue una de las ofrendas de los magos a Jesús según Mateo 2?", hints:["Eran tres tipos de ofrendas","Una era oro otra esta planta y otra incienso","Era una resina aromática costosa"], a:"Mirra", opts:["Mirra","Canela","Nardo","Aloe"] },
  { id:156, cat:"Plantas", q:"¿Con qué se fabricaba el incienso sagrado del tabernáculo según Éxodo 30?", hints:["Dios dio una receta específica","Contenía cuatro especias aromáticas","Estaca estrictamente prohibido hacerlo para uso personal"], a:"Estacte, onicha, gálbano e incienso puro", opts:["Estacte, onicha, gálbano e incienso puro","Mirra, canela, cálamo e incienso","Nardo, azafrán, cáñamo y mirra","Cedro, hisopo, grana e incienso"] },
  { id:157, cat:"Plantas", q:"¿De qué madera se construyó el arca de Noé según Génesis 6?", hints:["Dios especificó el tipo de madera","Era madera de gofer","Es una madera resinosa muy resistente"], a:"Madera de gofer", opts:["Madera de gofer","Madera de cedro","Madera de ciprés","Madera de roble"] },
  { id:158, cat:"Plantas", q:"¿De qué tipo de hojas hizo Adán delantales para cubrir su desnudez según Génesis 3?", hints:["Era el árbol que da higos","Sus hojas son grandes y anchas","Es el árbol que Jesús también maldijo"], a:"Hojas de higuera", opts:["Hojas de higuera","Hojas de palma","Hojas de plátano","Hojas de granado"] },
  { id:159, cat:"Plantas", q:"¿Qué planta brotó del bastón de Aarón para demostrar su autoridad según Números 17?", hints:["Brotó, floreció y dio frutos en una noche","Los frutos eran de forma ovalada","El bastón estaba guardado en el tabernáculo"], a:"Almendros (dio almendras)", opts:["Almendros (dio almendras)","Granadas","Dátiles","Higos"] },
  { id:160, cat:"Plantas", q:"¿Con qué tipo de ramas recibió el pueblo a Jesús en su entrada a Jerusalén según Juan 12?", hints:["Era la planta de la victoria y la alegría","Las agitaban al paso de Jesús","Fueron a recibirlo gritando Hosanna"], a:"Ramas de palma", opts:["Ramas de palma","Ramas de olivo","Ramas de higuera","Ramas de cedro"] },

  // ═══ MÁS OBJETOS ═══
  { id:161, cat:"Objetos", q:"¿Qué tipo de instrumento tocaban los levitas en el templo de Salomón según 1 Crónicas 15?", hints:["Eran instrumentos de cuerda y de percusión","Se mencionan arpas salterios y platillos","Era un conjunto musical para adoración"], a:"Arpas, salterios y platillos", opts:["Arpas, salterios y platillos","Flautas, trompetas y tamboriles","Cítaras, liras y trombones","Trompetas, cuernos y panderetas"] },
  { id:162, cat:"Objetos", q:"¿De qué material era el becerro que hizo Aarón en el desierto según Éxodo 32?", hints:["El pueblo le pidió dioses que los guiaran","Aarón pidió los aretes de las mujeres","Era un metal precioso amarillo"], a:"Oro", opts:["Oro","Bronce dorado","Plata pulida","Madera recubierta de oro"] },
  { id:163, cat:"Objetos", q:"¿Con cuántas monedas de plata compró Judas traicionar a Jesús según Mateo 26?", hints:["Era el precio de un esclavo en aquella época","Las devolvió al templo después","El número es 30"], a:"30 monedas de plata", opts:["30 monedas de plata","20 monedas de plata","50 monedas de plata","40 denarios de plata"] },
  { id:164, cat:"Objetos", q:"¿Qué tipo de recipiente rompió Gedeón para confundir a los madianitas según Jueces 7?", hints:["Había antorchas dentro","Al romperse la luz apareció","Cada guerrero tenía uno en la mano izquierda"], a:"Cántaros de barro", opts:["Cántaros de barro","Vasijas de bronce","Cofres de madera","Odres de cuero"] },
  { id:165, cat:"Objetos", q:"¿Qué tipo de arma usó Joab para matar a Abner según 2 Samuel 3?", hints:["Lo golpeó por debajo en el quinto costado","Fue en venganza por la muerte de su hermano Asael","Era un arma corta de cuerpo a cuerpo"], a:"Una espada", opts:["Una espada","Una lanza","Una flecha","Un garrote"] },
  { id:166, cat:"Objetos", q:"¿De qué material estaban hechas las tablas de los mandamientos según Éxodo 31?", hints:["Dios mismo las escribió","Moisés las rompió al ver al becerro de oro","Eran tablas de piedra"], a:"Piedra", opts:["Piedra","Madera de acacia","Barro cocido","Bronce grabado"] },
  { id:167, cat:"Objetos", q:"¿Con qué se untó la puerta de los israelitas en la Pascua según Éxodo 12?", hints:["Era para que el ángel pasara de largo","Se aplicaba con una rama de hisopo","Era de color rojo carmesí"], a:"Sangre del cordero", opts:["Sangre del cordero","Aceite de oliva","Sangre del cordero mezclada con agua","Hisopo y vinagre"] },
  { id:168, cat:"Objetos", q:"¿Qué tipo de cubierta tenía el tabernáculo según Éxodo 26?", hints:["Tenía cuatro capas de cubierta","La más interna era de lino fino","La exterior era de pieles de tejones"], a:"Pieles de carnero teñidas, pieles de tejones, lino y pelo de cabra", opts:["Pieles de carnero teñidas, pieles de tejones, lino y pelo de cabra","Solo lino blanco con bordado azul","Seda púrpura con flecos de oro","Lana de oveja con tinte escarlata"] },
  { id:169, cat:"Objetos", q:"¿Qué moneda pidió Jesús para la pregunta sobre el tributo al César según Mateo 22?", hints:["Tenía la imagen del César","Jesús preguntó de quién era la imagen","Era la moneda romana estándar"], a:"Un denario", opts:["Un denario","Un siclo de plata","Una dracma","Un talento"] },
  { id:170, cat:"Objetos", q:"¿Qué tipo de instrumento musical usó David para tocar ante el rey Saúl según 1 Samuel 16?", hints:["Tocaba cuando el espíritu malo atormentaba a Saúl","Era un instrumento de cuerda","El sonido lo calmaba"], a:"Un arpa (arpa de mano)", opts:["Un arpa (arpa de mano)","Una flauta de caña","Un salterio de cuerdas","Una cítara"] },

  // ═══ MÁS EVENTOS ═══
  { id:171, cat:"Eventos", q:"¿Qué ocurrió cuando el Espíritu Santo descendió sobre Cornelio y su casa según Hechos 10?", hints:["Pedro estaba predicando","Los circuncisos que vinieron con Pedro se asombraron","Comenzaron a hablar en lenguas y a glorificar a Dios"], a:"Hablaron en lenguas y glorificaron a Dios", opts:["Hablaron en lenguas y glorificaron a Dios","Un fuego visible descendió sobre ellos","Una voz del cielo habló audiblemente","Se sacudió el lugar donde estaban"] },
  { id:172, cat:"Eventos", q:"¿Qué dijo Pedro cuando Jesús le preguntó quién era Él según Mateo 16?", hints:["Fue en Cesarea de Filipo","Los discípulos habían dado otras respuestas antes","Pedro dijo: Tú eres el Cristo"], a:"Tú eres el Cristo el Hijo del Dios viviente", opts:["Tú eres el Cristo el Hijo del Dios viviente","Tú eres el profeta que había de venir al mundo","Tú eres Elías que había de venir","Tú eres Juan el Bautista resucitado"] },
  { id:173, cat:"Eventos", q:"¿Qué le pasó a la hija de Jairo según Marcos 5?", hints:["Jairo era principal de la sinagoga","Le dijeron que ya había muerto","Jesús tomó su mano y dijo: talita cumi"], a:"Jesús la resucitó diciendo talita cumi", opts:["Jesús la resucitó diciendo talita cumi","Fue sanada de una fiebre muy alta","Se curó sola al tocar el manto de Jesús","Un ángel la sanó mientras Jesús oraba"] },
  { id:174, cat:"Eventos", q:"¿Qué ocurrió tres días después de la crucifixión de Jesús según Mateo 28?", hints:["Las mujeres fueron al sepulcro el primer día de la semana","Un ángel había quitado la piedra","El sepulcro estaba vacío"], a:"Jesús resucitó de entre los muertos", opts:["Jesús resucitó de entre los muertos","Los discípulos encontraron el cuerpo trasladado","Jesús ascendió directamente al cielo","Un ángel anunció que Jesús había ido a Galilea vivo"] },
  { id:175, cat:"Eventos", q:"¿Qué hizo Josías al encontrar el libro de la ley en el templo según 2 Reyes 22?", hints:["Lo mandó leer ante todo el pueblo","Rasgó sus vestiduras al escuchar las palabras","Renovó el pacto con Dios"], a:"Rasgó sus vestiduras y renovó el pacto", opts:["Rasgó sus vestiduras y renovó el pacto","Quemó todos los ídolos inmediatamente","Ayunó cuarenta días por el pecado del pueblo","Envió al profeta Jeremías a predicar"] },
  { id:176, cat:"Eventos", q:"¿Qué le ocurrió a Coré y sus seguidores que se rebelaron contra Moisés según Números 16?", hints:["La tierra se abrió y los tragó vivos","Sus familias también fueron tragadas","Un fuego consumió a los 250 que ofrecían incienso"], a:"La tierra se abrió y los tragó vivos", opts:["La tierra se abrió y los tragó vivos","Fueron heridos de lepra al instante","Murieron de una plaga repentina","Fueron devorados por un fuego del cielo"] },
  { id:177, cat:"Eventos", q:"¿Qué pasó con la vara de Aarón en el tabernáculo según Números 17?", hints:["Cada tribu dejó su vara en el tabernáculo","La vara de Aarón fue la única que revivió","Dio flores y almendras"], a:"Floreció y dio almendras", opts:["Floreció y dio almendras","Se convirtió en serpiente","Se partió y dio fuego","Brilló como el sol en la oscuridad"] },
  { id:178, cat:"Eventos", q:"¿Qué hizo Gedeón para pedir señal a Dios según Jueces 6?", hints:["Pidió dos señales contrarias","Primera que el vellón esté mojado y el suelo seco","Segunda que el vellón esté seco y el suelo mojado"], a:"La prueba del vellón de lana húmedo y seco", opts:["La prueba del vellón de lana húmedo y seco","Ofreció un sacrificio y esperó fuego del cielo","Pidió que el sol se detuviera un día","Lanzó un tizón encendido y esperó lluvia"] },
  { id:179, cat:"Eventos", q:"¿Qué pasó con el joven Eutico que se quedó dormido en Troas según Hechos 20?", hints:["Pablo predicó hasta la medianoche","El joven cayó desde el tercer piso","Pablo se echó sobre él y lo abrazó"], a:"Cayó muerto del tercer piso y Pablo lo resucitó", opts:["Cayó muerto del tercer piso y Pablo lo resucitó","Se lastimó pero sanó con una oración de Pablo","Quedó dormido pero despertó al tocarle Pablo","Fue sanado por el aceite de los ancianos"] },
  { id:180, cat:"Eventos", q:"¿Qué ocurrió cuando Elías oró sobre el hijo muerto de la viuda de Sarepta según 1 Reyes 17?", hints:["El niño había enfermado y muerto","Elías oró sobre él tres veces","El niño volvió a la vida"], a:"El niño revivió milagrosamente", opts:["El niño revivió milagrosamente","El niño sanó de una fiebre mortal","El niño despertó de un sueño profundo","El ángel del Señor lo revivió sin que Elías tocara"] },

  // ═══ MÁS DESAFÍOS ═══
  { id:181, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años vivió José según Génesis 50?", hints:["Vio a los hijos de Maquir hijo de Manasés","Murió en Egipto y fue embalsamado","Vivió 110 años"], a:"110 años", opts:["110 años","120 años","100 años","130 años"] },
  { id:182, cat:"Desafío", q:"⚡ DESAFÍO: ¿En qué versículo dice: Todo lo puedo en Cristo que me fortalece?", hints:["Está en la carta a los Filipenses","El capítulo es el 4","El versículo es el 13"], a:"Filipenses 4:13", opts:["Filipenses 4:13","Romanos 8:28","Isaías 40:31","Salmos 23:4"] },
  { id:183, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años reinó Asa sobre Judá según 1 Reyes 15?", hints:["Era bisnieto de Salomón","Quitó a los sodomitas y a los ídolos de la tierra","Reinó 41 años"], a:"41 años", opts:["41 años","40 años","29 años","55 años"] },
  { id:184, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto tiempo estuvo el arca del pacto en casa de Obed-edom según 2 Samuel 6?", hints:["David no se atrevió a llevarla a Jerusalén después de la muerte de Uzza","Dios bendijo a Obed-edom durante ese tiempo","El número es tres meses"], a:"3 meses", opts:["3 meses","7 días","40 días","6 meses"] },
  { id:185, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años reinó Manasés rey de Judá según 2 Reyes 21?", hints:["Era hijo del rey Ezequías","Hizo más mal que los amorreos","Reinó 55 años"], a:"55 años", opts:["55 años","40 años","29 años","52 años"] },
  { id:186, cat:"Desafío", q:"⚡ DESAFÍO: ¿A cuántas personas se apareció Jesús resucitado en el mayor testimonio según 1 Corintios 15?", hints:["Pablo los cita como testigos vivos","La mayoría aún vivía cuando Pablo escribió","El número fue más de 500 hermanos"], a:"Más de 500 hermanos a la vez", opts:["Más de 500 hermanos a la vez","120 discípulos reunidos","Los 12 apóstoles más 70 discípulos","Ciento cincuenta hermanos en Galilea"] },
  { id:187, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos sellos tiene el rollo en Apocalipsis 5?", hints:["Solo el Cordero pudo abrirlos","Cada sello abierto trajo un evento","El número es siete"], a:"7 sellos", opts:["7 sellos","12 sellos","4 sellos","10 sellos"] },
  { id:188, cat:"Desafío", q:"⚡ DESAFÍO: ¿Qué número de bestia menciona Apocalipsis 13?", hints:["Requiere sabiduría para entenderlo","Es el número del hombre","El número es 666"], a:"666", opts:["666","777","616","999"] },
  { id:189, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años llevaba en cama el paralítico Eneas que Pedro sanó según Hechos 9?", hints:["Su nombre era Eneas","Pedro le dijo: Eneas Jesucristo te sana","Llevaba 8 años en cama"], a:"8 años", opts:["8 años","38 años","18 años","12 años"] },
  { id:190, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos capítulos tiene el libro de Isaías?", hints:["Es el mismo número que los libros de la Biblia","La Biblia tiene 66 libros","El libro de Isaías tiene 66 capítulos"], a:"66 capítulos", opts:["66 capítulos","52 capítulos","40 capítulos","60 capítulos"] },

  // ═══ PERSONAS (continuación) ═══
  { id:191, cat:"Personas", q:"¿Quién fue el rey de Israel que construyó la ciudad de Samaria según 1 Reyes 16?", hints:["Era padre del rey Acab","La compró por dos talentos de plata","La construyó sobre el cerro de Semer"], a:"Omri", opts:["Omri","Acab","Baasa","Zimri"] },
  { id:192, cat:"Personas", q:"¿Quién fue el profeta que anunció el Emanuel según Isaías 7?", hints:["Es el profeta más citado en el Nuevo Testamento","Anunció que una virgen concebiría","Su libro tiene 66 capítulos"], a:"Isaías", opts:["Isaías","Miqueas","Jeremías","Zacarías"] },
  { id:193, cat:"Personas", q:"¿Quién era Cornelio según Hechos 10?", hints:["Era centurión romano","Era temeroso de Dios y daba limosnas","Pedro fue enviado a su casa a predicarle"], a:"Centurión romano temeroso de Dios en Cesarea", opts:["Centurión romano temeroso de Dios en Cesarea","Gobernador romano de Judea","Tribuno militar de la guardia pretoriana","Oficial judío converso al judaísmo"] },
  { id:194, cat:"Personas", q:"¿Quién fue María Magdalena según los evangelios?", hints:["Jesús expulsó 7 demonios de ella según Lucas 8","Fue al sepulcro el primer día de la semana","Fue la primera en ver a Jesús resucitado según Juan 20"], a:"Mujer de Magdala de quien Jesús expulsó 7 demonios", opts:["Mujer de Magdala de quien Jesús expulsó 7 demonios","Hermana de Lázaro y Marta","La mujer pecadora que ungió los pies de Jesús","La esposa de Cleofas mencionada en Juan 19"] },
  { id:195, cat:"Personas", q:"¿Quién fue el profeta que ungió a David como rey según 1 Samuel 16?", hints:["Dios lo envió a la casa de Isaí en Belén","Pensó que el elegido era Eliab por su apariencia","Su nombre también es el nombre de un libro bíblico"], a:"Samuel", opts:["Samuel","Natán","Gad","Abiatar"] },
  { id:196, cat:"Personas", q:"¿Quién fue el rey que dividió el reino de Israel en dos según 1 Reyes 12?", hints:["Era hijo de Salomón","Respondió duramente al pueblo cuando pidió alivio","Las 10 tribus del norte se separaron bajo Jeroboam"], a:"Roboam", opts:["Roboam","Jeroboam","Abías","Asa"] },
  { id:197, cat:"Personas", q:"¿Quién fue el fariseo que visitó a Jesús de noche según Juan 3?", hints:["Era principal entre los judíos","Jesús le habló del nuevo nacimiento","Después defendió a Jesús en el Sanedrín"], a:"Nicodemo", opts:["Nicodemo","José de Arimatea","Gamaliel","Simón el fariseo"] },
  { id:198, cat:"Personas", q:"¿Quién era Zaqueo según Lucas 19?", hints:["Era bajo de estatura","Subió a un sicómoro","Era jefe de los publicanos en Jericó"], a:"Jefe de los recaudadores de impuestos en Jericó", opts:["Jefe de los recaudadores de impuestos en Jericó","Un fariseo rico de Jericó","El principal de la sinagoga de Jericó","Un centurión romano de Jericó"] },
  { id:199, cat:"Personas", q:"¿Quién fue el hermano mayor de Moisés según Éxodo 4?", hints:["Fue el primer sumo sacerdote de Israel","Habló por Moisés ante el Faraón","Su vara floreció milagrosamente"], a:"Aarón", opts:["Aarón","Miriam","Eleazar","Nadab"] },
  { id:200, cat:"Personas", q:"¿Quién luchó con un ángel toda la noche según Génesis 32?", hints:["Era nieto de Abraham","Al final Dios le cambió el nombre","Su nuevo nombre significa el que lucha con Dios"], a:"Jacob", opts:["Jacob","Esaú","Lot","Isaac"] },

  // ═══ EVENTOS (continuación) ═══
  { id:201, cat:"Eventos", q:"¿Qué ocurrió cuando Pablo y Silas oraban en la cárcel de Filipos según Hechos 16?", hints:["Era a medianoche","Cantaban himnos y los presos los escuchaban","Un terremoto abrió las puertas y soltó las cadenas"], a:"Un terremoto sacudió la cárcel y las puertas se abrieron", opts:["Un terremoto sacudió la cárcel y las puertas se abrieron","Un ángel invisible abrió las cadenas silenciosamente","Un rayo cayó y rompió las puertas","El Espíritu Santo hizo dormir a los guardias"] },
  { id:202, cat:"Eventos", q:"¿Qué ocurrió en la Pascua que el ángel de la muerte pasó de largo en Egipto según Éxodo 12?", hints:["Los israelitas pusieron sangre en los postes","El cordero debía ser sin defecto","Comieron con prisa y con sandalias puestas"], a:"El ángel pasó las casas con sangre en los postes", opts:["El ángel pasó las casas con sangre en los postes","Dios envió una nube de protección sobre Israel","Un viento fuerte alejó al ángel destructor","Los israelitas se encerraron y el ángel no pudo entrar"] },
  { id:203, cat:"Eventos", q:"¿Qué hizo Naamán para ser sanado de lepra según 2 Reyes 5?", hints:["Al principio se negó porque esperaba algo más espectacular","Eliseo le mandó bañarse en el Jordán","Se bañó 7 veces y su piel quedó como la de un niño"], a:"Se bañó 7 veces en el río Jordán y fue sanado", opts:["Se bañó 7 veces en el río Jordán y fue sanado","Se lavó 7 veces en el río Abaná de Damasco","Fue ungido por Eliseo con aceite 7 veces","Ayunó 7 días y su lepra desapareció"] },
  { id:204, cat:"Eventos", q:"¿Qué señal pidió Gedeón a Dios antes de atacar a los madianitas según Jueces 6?", hints:["Pidió dos señales contrarias con un vellón de lana","Primera señal: el vellón mojado y el suelo seco","Segunda señal: el vellón seco y el suelo mojado"], a:"La prueba del vellón húmedo y seco", opts:["La prueba del vellón húmedo y seco","Fuego que consumiera un sacrificio","Una voz audible del cielo","Un sueño donde Dios le prometía la victoria"] },
  { id:205, cat:"Eventos", q:"¿Cómo murió el rey Acab según 1 Reyes 22?", hints:["Un arquero lo hirió entre las junturas de la armadura","La profecía de Micaías se cumplió","Su sangre fue lamida por los perros"], a:"Una flecha casual lo hirió entre las junturas de su armadura", opts:["Una flecha casual lo hirió entre las junturas de su armadura","Una espada lo atravesó en la batalla de Ramot","Una lanza de un carro lo derribó de su caballo","Murió aplastado por su propio carro de guerra"] },
  { id:206, cat:"Eventos", q:"¿Qué pasó en el Monte Carmelo cuando Elías desafió a los profetas de Baal según 1 Reyes 18?", hints:["Elías empapó el altar con agua tres veces","Los profetas de Baal danzaron y se cortaron sin éxito","El fuego de Dios consumió el holocausto y el agua"], a:"El fuego de Dios consumió el holocausto, la leña, las piedras y el agua", opts:["El fuego de Dios consumió el holocausto, la leña, las piedras y el agua","Una nube de fuego bajó y encendió el altar","El altar se encendió cuando Elías oró tres veces","Un relámpago cayó sobre el altar al amanecer"] },
  { id:207, cat:"Eventos", q:"¿Qué visión tuvo Ezequiel al principio de su libro según Ezequiel 1?", hints:["Vio una nube de fuego y cuatro seres vivientes","Cada ser tenía cuatro caras y cuatro alas","Había ruedas dentro de ruedas llenas de ojos"], a:"Una nube de fuego con cuatro seres vivientes y ruedas dentro de ruedas", opts:["Una nube de fuego con cuatro seres vivientes y ruedas dentro de ruedas","Un templo glorioso rodeado de querubines de fuego","Un valle de huesos secos que volvían a vivir","Un río de agua viva que salía del templo"] },
  { id:208, cat:"Eventos", q:"¿Qué ocurrió con Lot y su familia cuando salieron de Sodoma según Génesis 19?", hints:["Dios había ordenado no mirar atrás","La esposa de Lot miró","Se convirtió en estatua de sal"], a:"La esposa de Lot miró atrás y se convirtió en estatua de sal", opts:["La esposa de Lot miró atrás y se convirtió en estatua de sal","La ciudad fue destruida por un volcán mientras huían","Un ángel los cubrió con sus alas para protegerlos","Lot fue herido por el fuego pero sobrevivió"] },
  { id:209, cat:"Eventos", q:"¿Qué milagro hizo Eliseo con el aceite de la viuda según 2 Reyes 4?", hints:["La viuda tenía muchas deudas","Eliseo le dijo que consiguiera muchas vasijas","El aceite siguió fluyendo hasta que no hubo más vasijas"], a:"El aceite se multiplicó llenando todas las vasijas", opts:["El aceite se multiplicó llenando todas las vasijas","La harina de la viuda nunca se acabó durante la hambruna","El aceite se convirtió en monedas de oro","Un mercader pagó más del doble por el aceite de la viuda"] },
  { id:210, cat:"Eventos", q:"¿Qué pasó cuando Moisés levantó su vara sobre el Mar Rojo según Éxodo 14?", hints:["Dios envió un viento recio del oriente","Las aguas se dividieron y quedaron como muros","Israel cruzó por tierra seca"], a:"El mar se dividió formando un muro a cada lado", opts:["El mar se dividió formando un muro a cada lado","El mar se vació completamente como un estanque seco","Las aguas congelaron y cruzaron sobre el hielo","El viento secó el fondo del mar gradualmente"] },

  // ═══ DESAFÍOS adicionales ═══
  { id:211, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años vivió Sem hijo de Noé según Génesis 11?", hints:["Era hijo de Noé","De él desciende la línea que llega a Abraham","Vivió 600 años"], a:"600 años", opts:["600 años","500 años","700 años","438 años"] },
  { id:212, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántas ciudades de refugio estableció Josué según Josué 20?", hints:["Tres al este del Jordán y tres al oeste","Eran para quien matara a alguien sin intención","El número total es seis"], a:"6 ciudades de refugio", opts:["6 ciudades de refugio","12 ciudades de refugio","3 ciudades de refugio","9 ciudades de refugio"] },
  { id:213, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos hombres contó David en el censo de 2 Samuel 24?", hints:["Joab desaconsejó hacer el censo","En Israel había 800,000 y en Judá 500,000","El total fue 1,300,000"], a:"1,300,000 hombres", opts:["1,300,000 hombres","600,000 hombres","1,000,000 hombres","2,000,000 hombres"] },
  { id:214, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto tiempo duró la sequía de Elías según 1 Reyes 17-18?", hints:["Santiago dice que duró tres años y seis meses","El profeta Elías la anunció al rey Acab","Terminó cuando Elías oró en el Carmelo"], a:"3 años y 6 meses", opts:["3 años y 6 meses","7 años","2 años","4 años y 3 meses"] },
  { id:215, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años tenía Caleb cuando pidió la tierra de Hebrón según Josué 14?", hints:["Tenía 40 años cuando fue espía","Habían pasado 45 años desde entonces","Tenía 85 años cuando pidió la montaña"], a:"85 años", opts:["85 años","80 años","75 años","90 años"] },
  { id:216, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años estuvo en pie el templo de Salomón antes de ser destruido por Babilonia?", hints:["Fue construido alrededor del año 960 a.C.","Fue destruido por Nabucodonosor en el 586 a.C.","Aproximadamente 374 años"], a:"Aproximadamente 374 años", opts:["Aproximadamente 374 años","Aproximadamente 400 años","Aproximadamente 200 años","Aproximadamente 500 años"] },
  { id:217, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos versículos tiene el Salmo 119 el más largo de la Biblia?", hints:["Cada sección corresponde a una letra del alfabeto hebreo","El alfabeto hebreo tiene 22 letras","Cada letra tiene 8 versículos: 22x8=176"], a:"176 versículos", opts:["176 versículos","150 versículos","200 versículos","120 versículos"] },
  { id:218, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos días ayunó Moisés cuando recibió la segunda tabla de los mandamientos según Éxodo 34?", hints:["Fue la misma cantidad que la primera vez","No comió pan ni bebió agua","El número es 40 días y 40 noches"], a:"40 días y 40 noches", opts:["40 días y 40 noches","7 días y 7 noches","21 días y 21 noches","3 días y 3 noches"] },
  { id:219, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años vivió Adán según Génesis 5?", hints:["Fue el primer hombre","Vivió menos que Matusalén","Vivió 930 años"], a:"930 años", opts:["930 años","969 años","950 años","912 años"] },
  { id:220, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto pagó Abraham por la cueva de Macpela para sepultar a Sara según Génesis 23?", hints:["La compró a Efrón el heteo","Efrón pidió 400 siclos de plata","Era en Hebrón"], a:"400 siclos de plata", opts:["400 siclos de plata","200 siclos de plata","50 siclos de plata","1000 siclos de plata"] },

  // ═══ PERSONAS (más) ═══
  { id:221, cat:"Personas", q:"¿Quién fue el profeta que vio la visión de los huesos secos según Ezequiel 37?", hints:["Dios le preguntó si podían vivir esos huesos","Profetizó sobre ellos y los huesos revivieron","Era el profeta del exilio babilónico"], a:"Ezequiel", opts:["Ezequiel","Jeremías","Daniel","Zacarías"] },
  { id:222, cat:"Personas", q:"¿Quién fue el rey asirio que invadió Judá en tiempos de Ezequías según 2 Reyes 18?", hints:["Envió a Rabsaces a hablar contra Jehová","Un ángel mató 185,000 de su ejército","Su nombre empieza con Sen"], a:"Senaquerib", opts:["Senaquerib","Salmanasar","Tiglat-pileser","Asurbanipal"] },
  { id:223, cat:"Personas", q:"¿Quién fue el rey de Babilonia que interpretó Daniel su sueño de la gran estatua según Daniel 2?", hints:["Daniel interpretó su sueño de la gran estatua","El rey se postró ante Daniel después","Su nombre empieza con N y es largo"], a:"Nabucodonosor", opts:["Nabucodonosor","Belsasar","Darío el Medo","Ciro el Persa"] },
  { id:224, cat:"Personas", q:"¿Quién fue el discípulo que dudó de la resurrección de Jesús hasta ver sus heridas según Juan 20?", hints:["Jesús lo invitó a tocar sus heridas","Le dijo: pon aquí tu dedo","Su apodo es el Incrédulo"], a:"Tomás", opts:["Tomás","Felipe","Natanael","Tadeo"] },
  { id:225, cat:"Personas", q:"¿Quién fue Bernabé según Hechos 4?", hints:["Su nombre significa hijo de consolación","Era levita de Chipre","Vendió un terreno y puso el dinero a los pies de los apóstoles"], a:"José levita de Chipre llamado Bernabé", opts:["José levita de Chipre llamado Bernabé","Esteban uno de los siete diáconos","Nicanor diácono de Antioquía","Mnasón de Chipre antiguo discípulo"] },
  { id:226, cat:"Personas", q:"¿Quién fue la primera convertida de Europa según Hechos 16?", hints:["Era de la ciudad de Tiatira","Vendía púrpura","El Señor abrió su corazón para que prestara atención a Pablo"], a:"Lidia de Tiatira", opts:["Lidia de Tiatira","Priscila de Roma","Febe de Cencrea","Damaris de Atenas"] },
  { id:227, cat:"Personas", q:"¿Quién fue la suegra de Pedro que Jesús sanó de fiebre según Mateo 8?", hints:["Jesús fue a su casa en Capernaum","Jesús la tocó y la fiebre se fue","Inmediatamente se levantó y comenzó a servirles"], a:"La suegra de Pedro (Simón)", opts:["La suegra de Pedro (Simón)","La madre de los hijos de Zebedeo","La esposa del centurión de Capernaum","La hija del principal de la sinagoga"] },
  { id:228, cat:"Personas", q:"¿Quién fue el carpintero de Nazaret esposo de María según Mateo 13?", hints:["Era el padre adoptivo de Jesús","Tuvo otros hijos después de Jesús","Su nombre empieza con J"], a:"José de Nazaret", opts:["José de Nazaret","Zacarías el sacerdote","Cleofas de Emaús","Alpeo padre de Jacobo"] },
  { id:229, cat:"Personas", q:"¿Quién fue el rey persa que permitió el regreso de los judíos a Jerusalén según Esdras 1?", hints:["Fue el primero en permitir el regreso","Fue ungido por Dios para esta misión según Isaías 45","Su nombre empieza con C"], a:"Ciro el Grande", opts:["Ciro el Grande","Darío el Medo","Artajerjes","Asuero"] },
  { id:230, cat:"Personas", q:"¿Quién fue el reconstructor de los muros de Jerusalén según el libro de Nehemías?", hints:["Era copero del rey Artajerjes","Lloró cuando supo que los muros estaban derruidos","El libro lleva su nombre"], a:"Nehemías", opts:["Nehemías","Esdras","Zorobabel","Josué hijo de Josadac"] },

  // ═══ NÚMEROS (más) ═══
  { id:231, cat:"Números", q:"¿Cuántos pares de animales puros entró Noé en el arca según Génesis 7?", hints:["Más que los impuros","Los impuros entraron de a 2","Los puros entraron de a 7"], a:"7 parejas de cada especie pura", opts:["7 parejas de cada especie pura","3 parejas de cada especie pura","14 parejas de cada especie pura","5 parejas de cada especie pura"] },
  { id:232, cat:"Números", q:"¿Cuántos años vivió Enoc antes de ser llevado por Dios según Génesis 5?", hints:["Caminó con Dios durante su vida","No murió sino que Dios se lo llevó","Vivió 365 años, igual a los días del año solar"], a:"365 años", opts:["365 años","300 años","430 años","500 años"] },
  { id:233, cat:"Números", q:"¿Cuántos días estuvo Jesús apareciendo después de su resurrección antes de ascender según Hechos 1?", hints:["Les habló sobre el reino de Dios","Les mandó que esperaran en Jerusalén","El número es 40 días"], a:"40 días", opts:["40 días","3 días","7 días","50 días"] },
  { id:234, cat:"Números", q:"¿Cuántas personas se convirtieron en Pentecostés según Hechos 2?", hints:["Pedro les predicó el primer sermón","Les dijeron que se bautizaran","Se añadieron a la iglesia ese día"], a:"3,000 personas", opts:["3,000 personas","5,000 personas","1,000 personas","120 personas"] },
  { id:235, cat:"Números", q:"¿Cuántas personas se convirtieron cuando Pedro sanó al cojo de la puerta del templo según Hechos 4?", hints:["Los hombres que creyeron en ese momento","Pedro y Juan fueron arrestados después","El número llegó a 5,000"], a:"5,000 hombres", opts:["5,000 hombres","3,000 hombres","1,000 hombres","10,000 hombres"] },
  { id:236, cat:"Números", q:"¿Cuántos años duró la construcción del templo de Herodes según Juan 2?", hints:["Los judíos le respondieron esto a Jesús","Jesús habló de levantar el templo en 3 días","Los judíos mencionaron este número de años"], a:"46 años", opts:["46 años","40 años","100 años","20 años"] },
  { id:237, cat:"Números", q:"¿Cuántos años vivió Sara esposa de Abraham según Génesis 23?", hints:["Fue la única mujer cuya edad se menciona al morir","Murió en Hebrón","Vivió 127 años"], a:"127 años", opts:["127 años","90 años","150 años","115 años"] },
  { id:238, cat:"Números", q:"¿Cuántos espías envió Moisés a explorar Canaán según Números 13?", hints:["Uno por cada tribu de Israel","Solo dos dieron informe positivo","El número es igual al de las tribus"], a:"12 espías", opts:["12 espías","7 espías","10 espías","2 espías"] },
  { id:239, cat:"Números", q:"¿Cuántos días ayunó Ester antes de ir ante el rey según Ester 4?", hints:["También sus doncellas ayunaron","Le pidió a Mardoqueo que el pueblo ayunara","El número es tres días"], a:"3 días", opts:["3 días","7 días","40 días","1 día"] },
  { id:240, cat:"Números", q:"¿Cuántos años estuvo preso José en Egipto antes de comparecer ante el Faraón según Génesis 41?", hints:["Fue vendido a los 17 años","Tenía 30 años cuando fue puesto al frente de Egipto","Estuvo en la cárcel aproximadamente 2 años"], a:"Aproximadamente 2 años en la cárcel", opts:["Aproximadamente 2 años en la cárcel","10 años en la cárcel","5 años en la cárcel","7 años en la cárcel"] },

  // ═══ ANIMALES (más) ═══
  { id:241, cat:"Animales", q:"¿Con qué animal comparó Jesús a Herodes en Lucas 13?", hints:["Era un animal astuto y cazador","Jesús dijo: decid a esa zorra","Era símbolo de astucia maliciosa"], a:"Una zorra", opts:["Una zorra","Un lobo","Una serpiente","Un chacal"] },
  { id:242, cat:"Animales", q:"¿Qué tipo de animal se menciona en el Apocalipsis como la bestia con 7 cabezas?", hints:["Subía del mar","Tenía 10 cuernos y 7 cabezas","Era como un leopardo pero con patas de oso"], a:"Un animal como leopardo con patas de oso", opts:["Un animal como leopardo con patas de oso","Un dragón de fuego con 7 cabezas","Un toro gigante con 7 cuernos","Un águila con 7 cabezas de serpiente"] },
  { id:243, cat:"Animales", q:"¿Qué animal usó Sansón para hacer la adivinanza del panal de miel según Jueces 14?", hints:["Lo había matado antes y volvió a pasar junto a él","Encontró un panal de abejas dentro de su cuerpo","Era un animal salvaje y feroz"], a:"Un león", opts:["Un león","Un oso","Un toro","Un asno salvaje"] },
  { id:244, cat:"Animales", q:"¿Qué tipo de animal atacó a los israelitas en el desierto que motivó la serpiente de bronce según Números 21?", hints:["Dios los envió como castigo por murmurar","Mordían y morían muchos de Israel","Eran serpientes venenosas"], a:"Serpientes ardientes (venenosas)", opts:["Serpientes ardientes (venenosas)","Escorpiones del desierto","Áspides de arena","Cobras del Nilo"] },
  { id:245, cat:"Animales", q:"¿Qué animal mandó Dios para alimentar al profeta Elías en el desierto según 1 Reyes 19?", hints:["No eran cuervos esta vez","Era un ángel que le cocinó","En realidad fue un ángel y no un animal"], a:"Un ángel (no un animal)", opts:["Un ángel (no un animal)","Un cuervo de nuevo","Una paloma mensajera","Un camello cargado de provisiones"] },
  { id:246, cat:"Animales", q:"¿Con qué animales comparó Jesús a sus discípulos cuando los enviaba según Mateo 10?", hints:["Los enviaba en medio de lobos","Debían ser astutos como uno y simples como otro","Un animal venenoso y otro inocente"], a:"Astutos como serpientes y sencillos como palomas", opts:["Astutos como serpientes y sencillos como palomas","Valientes como leones y pacientes como bueyes","Veloces como águilas y mansos como corderos","Sabios como zorras y puros como ovejas"] },
  { id:247, cat:"Animales", q:"¿Qué tipo de animal fue ofrecido por los pobres en lugar de cordero según Levítico 12?", hints:["María ofreció esto cuando presentó a Jesús en el templo","Era la ofrenda de los que no podían costear un cordero","Eran dos de estos animales"], a:"Dos tórtolas o dos palominos", opts:["Dos tórtolas o dos palominos","Una oveja pequeña","Un cabrito del rebaño","Un becerro de un año"] },
  { id:248, cat:"Animales", q:"¿Qué animal simbólico describe Juan viendo a Jesús según Apocalipsis 5?", hints:["Era símbolo de la tribu de Judá según Génesis 49","La profecía decía que vendría el León de Judá","Pero Juan ve una imagen diferente del sacrificio"], a:"Un Cordero como inmolado", opts:["Un Cordero como inmolado","Un León triunfante","Un Toro blanco","Un Águila real"] },
  { id:249, cat:"Animales", q:"¿Qué animal representó a Israel en la visión del pastor en Ezequiel 34?", hints:["Dios regañó a los pastores que no cuidaban al rebaño","Prometió buscar a los perdidos y débiles","Era el animal más común en los rebaños de Israel"], a:"Ovejas", opts:["Ovejas","Cabras","Bueyes","Camellos"] },
  { id:250, cat:"Animales", q:"¿Qué animal usó Dios para enviar el dinero del tributo a Pedro según Mateo 17?", hints:["Jesús le dijo a Pedro que fuera a pescar","El primer pez que sacara tendría una moneda","Era una moneda de cuatro dracmas"], a:"Un pez (del Mar de Galilea)", opts:["Un pez (del Mar de Galilea)","Un cuervo con la moneda","Una paloma mensajera","Un ciervo con la bolsa"] },

  // ═══ LUGARES (más) ═══
  { id:251, cat:"Lugares", q:"¿En qué ciudad fue encarcelado Pablo durante dos años según Hechos 24?", hints:["Era la capital administrativa de Judea romana","El gobernador Félix lo tuvo preso","Estaba junto al mar Mediterráneo"], a:"Cesarea Marítima", opts:["Cesarea Marítima","Jerusalén","Antioquía","Jericó"] },
  { id:252, cat:"Lugares", q:"¿En qué monte se transfiguró Jesús según la tradición cristiana?", hints:["Era un monte alto en Galilea","Algunos identifican este monte","La tradición dice que fue el Monte Tabor"], a:"Monte Tabor (según tradición)", opts:["Monte Tabor (según tradición)","Monte Hermón","Monte Carmelo","Monte de los Olivos"] },
  { id:253, cat:"Lugares", q:"¿En qué ciudad fue martirizado Esteban según Hechos 7?", hints:["Era la ciudad santa del judaísmo","Lo sacaron de la ciudad para apedrearlo","Saulo de Tarso estaba presente"], a:"Jerusalén", opts:["Jerusalén","Damasco","Antioquía","Cesarea"] },
  { id:254, cat:"Lugares", q:"¿En qué río fue bautizado Jesús según Marcos 1?", hints:["Juan el Bautista bautizaba allí","Es el río que desemboca en el Mar Muerto","Divide Israel de Jordania"], a:"El río Jordán", opts:["El río Jordán","El río Nilo","El río Éufrates","El río Cedrón"] },
  { id:255, cat:"Lugares", q:"¿En qué ciudad estableció Pablo su base misionera en Asia Menor según Hechos 18?", hints:["Allí estuvo tres años según Hechos 20","Era una ciudad importante con el templo de Artemisa","Le escribió una carta en el Nuevo Testamento"], a:"Éfeso", opts:["Éfeso","Corinto","Antioquía","Filipos"] },
  { id:256, cat:"Lugares", q:"¿En qué monte fue sepultado Moisés según Deuteronomio 34?", hints:["Dios le mostró toda la tierra prometida desde allí","Frente a Jericó al otro lado del Jordán","Su nombre significa montaña de Nebo"], a:"Monte Nebo (en Moab)", opts:["Monte Nebo (en Moab)","Monte Sinaí","Monte Horeb","Monte Pisga"] },
  { id:257, cat:"Lugares", q:"¿En qué ciudad nació el profeta Amós según el libro de Amós?", hints:["Era pastor y cultivador de higos silvestres","Vino del sur para profetizar en Israel","La ciudad es Tecoa en Judá"], a:"Tecoa de Judá", opts:["Tecoa de Judá","Belén de Judá","Anatot de Benjamín","Hebrón de Judá"] },
  { id:258, cat:"Lugares", q:"¿En qué ciudad de Siria se curó Naamán según 2 Reyes 5?", hints:["Era la capital de Siria","Tenía ríos que Naamán prefería al Jordán","Los ríos se llamaban Abaná y Farfar"], a:"Damasco", opts:["Damasco","Hamat","Sidón","Tiro"] },
  { id:259, cat:"Lugares", q:"¿En qué ciudad nació el profeta Jeremías según Jeremías 1?", hints:["Era una ciudad de sacerdotes cerca de Jerusalén","Era en el territorio de Benjamín","El nombre de la ciudad es Anatot"], a:"Anatot de Benjamín", opts:["Anatot de Benjamín","Belén de Judá","Tecoa de Judá","Ramá de Benjamín"] },
  { id:260, cat:"Lugares", q:"¿En qué ciudad vivía la sunamita que hospedó a Eliseo según 2 Reyes 4?", hints:["Era una mujer principal de esa ciudad","Construyó un cuarto alto para Eliseo en el techo","Eliseo resucitó a su hijo"], a:"Sunem (en Jezreel)", opts:["Sunem (en Jezreel)","Sarepta de Sidón","Naín de Galilea","Betania de Judea"] },

  // ═══ OBJETOS (más) ═══
  { id:261, cat:"Objetos", q:"¿De qué material era la serpiente que hizo Moisés para sanar a los israelitas según Números 21?", hints:["Dios le ordenó ponerla en un asta","Quien la miraba quedaba sano","Ezequías la destruyó porque el pueblo la adoraba"], a:"Bronce", opts:["Bronce","Oro","Plata","Hierro"] },
  { id:262, cat:"Objetos", q:"¿Con qué tipo de instrumento debían anunciar el año del jubileo según Levítico 25?", hints:["Era cada 50 años","Se tocaba el día del perdón","Era un instrumento de viento de cuerno de animal"], a:"Cuerno de carnero (shofar)", opts:["Cuerno de carnero (shofar)","Trompeta de plata","Flauta de caña","Trombón de bronce"] },
  { id:263, cat:"Objetos", q:"¿De qué material eran las trompetas que Dios ordenó hacer a Moisés según Números 10?", hints:["Dios ordenó hacer dos de ellas","Se usaban para convocar la congregación","Eran de un metal brillante"], a:"Plata", opts:["Plata","Oro","Bronce","Cuerno de animal"] },
  { id:264, cat:"Objetos", q:"¿Qué tipo de oferta trajo Caín al Señor según Génesis 4?", hints:["Era agricultor así que trajo lo que cultivaba","No fue aceptada por Dios","Era del fruto de la tierra"], a:"Frutos de la tierra (vegetales)", opts:["Frutos de la tierra (vegetales)","Un cordero de sus ovejas","Aceite de oliva y trigo","Pan sin levadura y fruta"] },
  { id:265, cat:"Objetos", q:"¿Qué tipo de oferta trajo Abel al Señor según Génesis 4?", hints:["Era pastor así que trajo lo que criaba","Fue aceptada por Dios a diferencia de la de Caín","Era de los primogénitos del rebaño con su gordura"], a:"Primogénitos del rebaño (animales)", opts:["Primogénitos del rebaño (animales)","Frutos selectos de la tierra","Aceite y vino de la mejor calidad","Pan recién horneado con miel"] },
  { id:266, cat:"Objetos", q:"¿De qué material era la cama del gigante Og rey de Basán según Deuteronomio 3?", hints:["Era muy grande por la estatura del rey","Medía nueve codos de largo","Era de un metal resistente y oscuro"], a:"Hierro", opts:["Hierro","Bronce","Cedro de Líbano","Piedra tallada"] },
  { id:267, cat:"Objetos", q:"¿Qué tipo de instrumento tocó Jubal el descendiente de Caín según Génesis 4?", hints:["Fue el padre de los que tocan estos instrumentos","Tuvo hermanos que se dedicaban a la ganadería y al trabajo del metal","Se mencionan dos tipos: de cuerda y de viento"], a:"Arpa y flauta", opts:["Arpa y flauta","Pandereta y trompeta","Salterio y cuerno","Cítara y oboe"] },
  { id:268, cat:"Objetos", q:"¿Con qué ungió el sacerdote Sadoc a Salomón como rey según 1 Reyes 1?", hints:["Lo tomaron del tabernáculo","Era el aceite sagrado que se guardaba allí","Lo derramaron sobre su cabeza"], a:"Aceite del tabernáculo", opts:["Aceite del tabernáculo","Aceite de oliva común","Aceite de mirra perfumada","Aceite mezclado con sangre del altar"] },
  { id:269, cat:"Objetos", q:"¿De qué material era la estatua que vio Nabucodonosor en su sueño según Daniel 2?", hints:["Tenía cabeza de un metal y pies de otro","La cabeza era de oro","Los pies eran de barro mezclado con hierro"], a:"Oro, plata, bronce, hierro y barro", opts:["Oro, plata, bronce, hierro y barro","Solo oro y plata de arriba abajo","Piedra preciosa madera y metales","Todo de oro excepto los pies de piedra"] },
  { id:270, cat:"Objetos", q:"¿Qué tipo de arma lanzó el muchacho al gigante Goliat según 1 Samuel 17?", hints:["Era un instrumento simple de pastor","David la cargaba en una bolsa","Era redonda y lisa del arroyo"], a:"Una piedra lisa lanzada con honda", opts:["Una piedra lisa lanzada con honda","Una flecha de su arco","Una jabalina corta","Una lanza pequeña"] },

  // ═══ EVENTOS (más) ═══
  { id:271, cat:"Eventos", q:"¿Qué pasó cuando Elías fue arrebatado al cielo según 2 Reyes 2?", hints:["Eliseo estaba mirando","Cayó algo desde el cielo que los separó","Elías subió en un torbellino"], a:"Un carro de fuego los separó y Elías subió en torbellino", opts:["Un carro de fuego los separó y Elías subió en torbellino","Un ángel lo tomó de la mano y lo subió","Una nube brillante lo envolvió y desapareció","Elías simplemente caminó hacia el cielo sin morir"] },
  { id:272, cat:"Eventos", q:"¿Qué ocurrió cuando Ananías y Safira mintieron sobre el precio del terreno según Hechos 5?", hints:["Pedro los confrontó separadamente","Primero murió Ananías y luego Safira","Gran temor vino sobre toda la iglesia"], a:"Ambos murieron instantáneamente al ser confrontados", opts:["Ambos murieron instantáneamente al ser confrontados","Fueron expulsados de la iglesia y enfermaron","Quedaron mudos como señal de juicio divino","Les fue quitado el dinero como castigo por la iglesia"] },
  { id:273, cat:"Eventos", q:"¿Qué le pasó a Uzza cuando tocó el arca del pacto según 2 Samuel 6?", hints:["Los bueyes tropezaron y el arca se sacudió","Uzza extendió la mano para sostenerla","Dios lo hirió allí mismo y murió"], a:"Dios lo hirió y murió allí mismo junto al arca", opts:["Dios lo hirió y murió allí mismo junto al arca","Quedó paralítico por tocar el arca","Fue herido de lepra por su irreverencia","Un fuego salió del arca y lo consumió"] },
  { id:274, cat:"Eventos", q:"¿Qué ocurrió cuando los israelitas rodearon Jericó el séptimo día por séptima vez según Josué 6?", hints:["Los sacerdotes tocaron las trompetas","El pueblo gritó con gran voz","Los muros cayeron derrumbándose"], a:"Los muros cayeron derrumbándose y tomaron la ciudad", opts:["Los muros cayeron derrumbándose y tomaron la ciudad","Las puertas de bronce se derritieron solas","La tierra tembló y el muro se abrió en dos","Un ángel con espada derribó la muralla"] },
  { id:275, cat:"Eventos", q:"¿Qué visión tuvo Isaías cuando fue llamado al ministerio según Isaías 6?", hints:["Vio al Señor sentado en un trono alto","Serafines volaban sobre él clamando: Santo Santo Santo","Un serafín tocó sus labios con un carbón ardiente"], a:"El Señor en su trono con serafines clamando Santo Santo Santo", opts:["El Señor en su trono con serafines clamando Santo Santo Santo","Querubines con espadas de fuego guardando el trono","El templo lleno de una gloria como nubes y fuego","Una escalera que llegaba al cielo con ángeles subiendo y bajando"] },
  { id:276, cat:"Eventos", q:"¿Qué ocurrió cuando Pedro predicó en Pentecostés según Hechos 2?", hints:["Citó el Salmo 16 y Joel 2","Explicó la muerte y resurrección de Jesús","3,000 personas se bautizaron ese día"], a:"3,000 personas se convirtieron y bautizaron", opts:["3,000 personas se convirtieron y bautizaron","5,000 hombres creyeron y se añadieron","120 discípulos más 12 apóstoles fueron llenos","Todo el pueblo de Jerusalén creyó ese día"] },
  { id:277, cat:"Eventos", q:"¿Qué pasó cuando Moisés golpeó la roca en Meribá según Números 20?", hints:["Dios le dijo que hablara a la roca","Moisés la golpeó dos veces en cambio","Agua brotó abundantemente pero Moisés fue castigado"], a:"Brotó agua pero Moisés fue castigado por no seguir instrucciones", opts:["Brotó agua pero Moisés fue castigado por no seguir instrucciones","No brotó agua porque Moisés desobedeció","Brotó fuego en lugar de agua como señal de ira","El pueblo murió de sed porque Moisés falló"] },
  { id:278, cat:"Eventos", q:"¿Cómo llegó el Espíritu Santo a los discípulos en Pentecostés según Hechos 2?", hints:["Primero hubo un sonido como de viento recio","Luego aparecieron lenguas como de fuego","Cada uno comenzó a hablar en otras lenguas"], a:"Viento recio, lenguas de fuego y hablar en otras lenguas", opts:["Viento recio, lenguas de fuego y hablar en otras lenguas","Una paloma descendió sobre cada uno de ellos","Un rayo cayó sobre el lugar de reunión","Una voz del cielo habló en idiomas extranjeros"] },
  { id:279, cat:"Eventos", q:"¿Qué milagro hizo Josué pidiendo ayuda mientras luchaba contra los amorreos según Josué 10?", hints:["Josué habló al sol y a la luna","No hubo día semejante antes ni después","El sol se detuvo en el cielo por casi un día entero"], a:"El sol se detuvo aproximadamente un día entero", opts:["El sol se detuvo aproximadamente un día entero","La oscuridad cubrió a los enemigos solamente","El sol brilló durante la noche para Israel","Cayó granizo de fuego sobre los amorreos mientras perseguían"] },
  { id:280, cat:"Eventos", q:"¿Qué sucedió cuando Daniel fue echado al foso de los leones según Daniel 6?", hints:["El rey pasó la noche ayunando sin poder dormir","A la mañana encontró a Daniel vivo","Daniel dijo que Dios había cerrado la boca de los leones"], a:"Dios cerró la boca de los leones y Daniel quedó ileso", opts:["Dios cerró la boca de los leones y Daniel quedó ileso","Los leones durmieron durante toda la noche milagrosamente","Un ángel con espada de fuego espantó a los leones","Los leones lamieron a Daniel sin hacerle daño alguno"] },

  // ═══ DESAFÍOS finales ═══
  { id:281, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años vivió Lamec padre de Noé según Génesis 5?", hints:["Era padre de Noé","Vivió menos que su padre Matusalén","Vivió 777 años"], a:"777 años", opts:["777 años","750 años","800 años","969 años"] },
  { id:282, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos metros medía Goliat según la medida bíblica de seis codos y un palmo?", hints:["Un codo hebreo es aproximadamente 45 cm","Seis codos y un palmo son aproximadamente 2.9 metros","Era excepcionalmente alto para cualquier época"], a:"Aproximadamente 2.9 metros de altura", opts:["Aproximadamente 2.9 metros de altura","Aproximadamente 2 metros de altura","Aproximadamente 3.5 metros de altura","Aproximadamente 4 metros de altura"] },
  { id:283, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años pasó Pablo en Arabia después de su conversión según Gálatas 1?", hints:["Fue antes de ir a Jerusalén a ver a Pedro","Pablo lo menciona en Gálatas al hablar de su llamado","El número es tres años aproximadamente"], a:"Aproximadamente 3 años", opts:["Aproximadamente 3 años","7 años","1 año","14 años"] },
  { id:284, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos ángeles mencionó Jesús que tiene a su disposición según Mateo 26?", hints:["Lo dijo cuando Pedro sacó la espada en Getsemaní","Jesús le dijo que podría pedirlos pero no lo haría","Mencionó doce legiones de ángeles"], a:"Más de doce legiones de ángeles", opts:["Más de doce legiones de ángeles","Siete ángeles de los siete cielos","Cien mil ángeles del ejército celestial","Incontables huestes angelicales sin número"] },
  { id:285, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto pagó Omri por el cerro de Samaria donde construyó su ciudad según 1 Reyes 16?", hints:["Lo compró a Semer","Era para construir una nueva capital para Israel","Pagó dos talentos de plata"], a:"2 talentos de plata", opts:["2 talentos de plata","50 talentos de plata","100 siclos de plata","1 talento de oro"] },
  { id:286, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años vivió Jared el padre de Enoc según Génesis 5?", hints:["Era el padre de Enoc que caminó con Dios","Vivió más de 900 años","Vivió 962 años"], a:"962 años", opts:["962 años","969 años","930 años","950 años"] },
  { id:287, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto tiempo profetizó la mujer en el desierto según Apocalipsis 12?", hints:["La mujer huyó al desierto","Fue alimentada allí por Dios","El tiempo fue 1260 días"], a:"1,260 días", opts:["1,260 días","3,500 días","420 días","7 años"] },
  { id:288, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años tenía Joás cuando comenzó a reinar en Judá según 2 Reyes 11?", hints:["La sacerdotisa Joseba lo escondió durante 6 años","Era niño cuando fue hecho rey","Tenía 7 años cuando comenzó a reinar"], a:"7 años", opts:["7 años","8 años","12 años","10 años"] },
  { id:289, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto pesaba el manto de Acán que causó su pecado según Josué 7?", hints:["Tomó botín de Jericó contra la orden de Dios","Era un manto muy valioso de Babilonia","Pesaba doscientos siclos de plata además del manto"], a:"200 siclos de plata y un manto de Babilonia", opts:["200 siclos de plata y un manto de Babilonia","50 talentos de oro y joyas","30 siclos de oro y una túnica de lino","100 siclos de plata y una espada de Jericó"] },
  { id:290, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos días tardó Esdras en viajar de Babilonia a Jerusalén según Esdras 7?", hints:["Salió el primer día del primer mes","Llegó el primero del quinto mes","Tardó cuatro meses en el viaje"], a:"4 meses aproximadamente", opts:["4 meses aproximadamente","40 días","3 meses","7 meses"] },

  // ═══ ÚLTIMAS PREGUNTAS ═══
  { id:291, cat:"Personas", q:"¿Quién fue la ramera de Jericó que escondió a los espías de Josué según Josué 2?", hints:["Colgó un cordón de grana en la ventana","Su familia fue preservada cuando cayó Jericó","Aparece en la genealogía de Jesús en Mateo 1"], a:"Rahab", opts:["Rahab","Dalila","Jezabel","Tamar"] },
  { id:292, cat:"Personas", q:"¿Quién fue el eunuco etíope a quien Felipe explicó Isaías 53 según Hechos 8?", hints:["Venía de adorar a Dios en Jerusalén","Felipe lo encontró leyendo a Isaías","Pidió ser bautizado en el agua del camino"], a:"El eunuco etíope tesorero de Candace", opts:["El eunuco etíope tesorero de Candace","Cornelio el centurión de Cesarea","El oficial sirio Naamán","El carcelero de Filipos"] },
  { id:293, cat:"Personas", q:"¿Quién fue el ángel que luchó con Jacob en Peniel según Génesis 32?", hints:["Le dislocó el muslo a Jacob","Jacob dijo que había visto a Dios cara a cara","Le cambió el nombre a Israel"], a:"Un ser divino (el Señor o su ángel)", opts:["Un ser divino (el Señor o su ángel)","El ángel Gabriel","El arcángel Miguel","Un ser humano disfrazado de ángel"] },
  { id:294, cat:"Personas", q:"¿Quién fue Mardoqueo en el libro de Ester?", hints:["Era el primo y tutor de Ester","No se arrodilló ante Amán","Descubrió un complot contra el rey"], a:"Primo y tutor de Ester en Susa", opts:["Primo y tutor de Ester en Susa","El rey que adoptó a Ester","El consejero principal del rey Asuero","El sacerdote judío en la corte persa"] },
  { id:295, cat:"Personas", q:"¿Quién fue Dorcas o Tabita que Pedro resucitó según Hechos 9?", hints:["Era discípula que hacía buenas obras","Hacía túnicas y vestidos para los pobres","Murió y Pedro la resucitó en Jope"], a:"Una discípula de Jope que ayudaba a los pobres", opts:["Una discípula de Jope que ayudaba a los pobres","La hija del principal de la sinagoga","La suegra de Simón Pedro en Capernaum","Una mujer de Cesarea que hospedaba a Pablo"] },
  { id:296, cat:"Eventos", q:"¿Qué hizo Ezequías cuando recibió la carta amenazante de Senaquerib según 2 Reyes 19?", hints:["Fue al templo con la carta","La extendió delante de Dios","Oró pidiéndole a Dios que actuara"], a:"Extendió la carta ante Dios en el templo y oró", opts:["Extendió la carta ante Dios en el templo y oró","Quemó la carta y declaró guerra","Envió embajadores a negociar con Senaquerib","Ayunó 40 días antes de responder a la amenaza"] },
  { id:297, cat:"Eventos", q:"¿Qué ocurrió cuando Gedeón redujo su ejército de 32,000 a 300 hombres según Jueces 7?", hints:["Dios dijo que eran demasiados para que Israel no se gloriara","La primera reducción fue dejar ir a los temerosos","La segunda fue por la manera de beber agua del río"], a:"Dios redujo el ejército para que la gloria fuera suya", opts:["Dios redujo el ejército para que la gloria fuera suya","Gedeón eliminó a los menos valientes en combate","Los madianitas atacaron y muchos huyeron antes","Gedeón solo quería los guerreros más experimentados"] },
  { id:298, cat:"Eventos", q:"¿Qué pasó cuando los apóstoles impusieron las manos a los siete diáconos según Hechos 6?", hints:["Necesitaban ayuda para servir las mesas","La iglesia eligió a siete hombres de buen testimonio","Los apóstoles oraron e impusieron las manos sobre ellos"], a:"Los siete fueron apartados para el ministerio de servicio", opts:["Los siete fueron apartados para el ministerio de servicio","Recibieron el don de lenguas inmediatamente","El Espíritu Santo descendió visiblemente sobre ellos","Fueron enviados de misión a diferentes ciudades"] },
  { id:299, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años llevaba el hombre cojo de nacimiento que Pedro y Juan sanaron según Hechos 3?", hints:["Estaba en la puerta llamada la Hermosa","Pedro le dijo: no tengo plata ni oro","Llevaba más de 40 años en esa condición"], a:"Más de 40 años", opts:["Más de 40 años","38 años","8 años","12 años"] },
  { id:300, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos rollos de libros quemó el rey Joacim de la profecía de Jeremías según Jeremías 36?", hints:["El escriba Baruc los leyó primero en el templo","El rey los cortaba columna por columna y los quemaba","Solo había un rollo que el rey fue quemando"], a:"Un rollo que fue quemado columna por columna", opts:["Un rollo que fue quemado columna por columna","Siete rollos de la profecía completa","Tres rollos con todas las profecías","El libro entero de Jeremías en diez rollos"] },

  // ═══ 💎 TESORO — Preguntas excepcionales (+25pts +2 casillas) ═══
  { id:301, cat:"Tesoro", q:"💎 TESORO: ¿Cuántos libros de la Biblia fueron escritos originalmente en arameo parcialmente?", hints:["Son libros del Antiguo Testamento","Uno es Daniel y otro Esdras","Ciertas secciones están en arameo"], a:"Daniel y Esdras (partes en arameo)", opts:["Daniel y Esdras (partes en arameo)","Solo Daniel en su totalidad","Génesis y Job originalmente","Esdras Nehemías y Jeremías"] },
  { id:302, cat:"Tesoro", q:"💎 TESORO: ¿Cuál fue el único profeta mayor cuyo nacimiento fue anunciado con su nombre antes de nacer, además de Jesús?", hints:["Era un profeta del siglo IX a.C.","Fue anunciado al rey Jeroboam por un hombre de Dios","El profeta se llamaría Josías según 1 Reyes 13"], a:"Josías (anunciado 300 años antes en 1 Reyes 13)", opts:["Josías (anunciado 300 años antes en 1 Reyes 13)","Samuel antes de nacer a Ana","Juan el Bautista anunciado a Zacarías","Sansón anunciado a la esposa de Manoa"] },
  { id:303, cat:"Tesoro", q:"💎 TESORO: ¿Cuál es el único libro de la Biblia que no menciona el nombre de Dios directamente?", hints:["Es un libro del Antiguo Testamento","Narra la historia de una reina que salvó a su pueblo","El nombre del libro es el nombre de la protagonista"], a:"Ester", opts:["Ester","Rut","Cantares","Filemón"] },
  { id:304, cat:"Tesoro", q:"💎 TESORO: ¿Qué pasó inmediatamente ANTES de que Elías subiera al cielo según 2 Reyes 2?", hints:["Golpeó las aguas del Jordán con su manto","Las aguas se dividieron como en el tiempo de Moisés","Elías y Eliseo cruzaron al otro lado juntos"], a:"Dividió las aguas del Jordán con su manto", opts:["Dividió las aguas del Jordán con su manto","Oró en el Monte Carmelo por última vez","Se despidió de los hijos de los profetas","Ungió a Eliseo vertiendo aceite sobre él"] },
  { id:305, cat:"Tesoro", q:"💎 TESORO: ¿Cuántas veces aparece la palabra 'amor' (ahavá) en el libro de Cantares?", hints:["Es el libro más romántico de la Biblia","El amor aparece con mucha frecuencia","Aparece exactamente en los 8 capítulos del libro"], a:"Aproximadamente 32 veces en sus 8 capítulos", opts:["Aproximadamente 32 veces en sus 8 capítulos","Solo 7 veces como número perfecto","Exactamente 66 veces como los libros","Más de 100 veces en todo el libro"] },
  { id:306, cat:"Tesoro", q:"💎 TESORO: ¿Qué acontecimiento ocurrió DESPUÉS de que Daniel interpretara el sueño de Nabucodonosor en Daniel 2?", hints:["El rey se postró ante Daniel","Luego hizo algo sorprendente con él","Daniel fue elevado a una posición de gran honor"], a:"El rey se postró y lo hizo gobernador de Babilonia", opts:["El rey se postró y lo hizo gobernador de Babilonia","El rey mandó liberarlo de la cárcel inmediatamente","Daniel fue nombrado sumo sacerdote del templo","El rey se convirtió al Dios de Israel en ese momento"] },
  { id:307, cat:"Tesoro", q:"💎 TESORO: ¿Qué curiosidad tiene el Salmo 117 en relación con toda la Biblia?", hints:["Es el Salmo más corto de la Biblia","Solo tiene 2 versículos","Está exactamente en el centro de la Biblia"], a:"Es el capítulo central de toda la Biblia (cap. 595 de 1189)", opts:["Es el capítulo central de toda la Biblia (cap. 595 de 1189)","Es el único Salmo sin título ni autoría","Es el único capítulo que solo tiene aleluya","Es el Salmo con más idiomas traducidos primero"] },
  { id:308, cat:"Tesoro", q:"💎 TESORO: ¿Qué pasó ANTES de que Pedro sanara al cojo de la puerta Hermosa según Hechos 3?", hints:["Pedro y Juan iban al templo para orar","Era la hora de la oración de la tarde","Subían al templo a la hora novena del día"], a:"Pedro y Juan subían al templo a la hora novena de oración", opts:["Pedro y Juan subían al templo a la hora novena de oración","Pedro había predicado sobre la resurrección esa mañana","El Espíritu Santo les había indicado que irían a sanar","Habían orado toda la noche antes de ir al templo"] },
  { id:309, cat:"Tesoro", q:"💎 TESORO: ¿Cuál es la única mujer mencionada por nombre en la genealogía de Jesús en Mateo 1 que fue extranjera?", hints:["Hay cuatro mujeres en total en esa genealogía","Una era moabita y bisabuela de David","Su historia está en el libro que lleva su nombre"], a:"Rut la moabita", opts:["Rut la moabita","Rahab la cananea","Tamar la cananea","Betsabé la hetea"] },
  { id:310, cat:"Tesoro", q:"💎 TESORO: ¿Qué hecho sorprendente ocurrió con el libro de la ley durante el reinado de Josías según 2 Reyes 22?", hints:["Ocurrió durante las reparaciones del templo","El sumo sacerdote Hilcías lo encontró","Había estado perdido por un largo tiempo"], a:"El libro de la ley fue encontrado en el templo donde estaba perdido", opts:["El libro de la ley fue encontrado en el templo donde estaba perdido","El libro fue revelado por un ángel en una visión","Jeremías lo entregó directamente al rey Josías","Fue descubierto en una cueva cerca de Jerusalén"] },
  { id:311, cat:"Tesoro", q:"💎 TESORO: ¿Cuál es el versículo más largo de toda la Biblia?", hints:["Está en el libro de Ester","Es Ester 8:9 con alrededor de 90 palabras en hebreo","Habla de un decreto del rey Asuero"], a:"Ester 8:9 (el decreto del rey Asuero)", opts:["Ester 8:9 (el decreto del rey Asuero)","Jeremías 33:3 con la gran promesa divina","Romanos 8:38-39 sobre el amor de Dios","Apocalipsis 1:4-5 con el saludo trinitario"] },
  { id:312, cat:"Tesoro", q:"💎 TESORO: ¿Qué sucedió inmediatamente DESPUÉS de que Jesús resucitó a Lázaro según Juan 11?", hints:["Muchos judíos creyeron en Jesús","Pero otros hicieron algo diferente","Los fariseos tomaron una decisión crucial"], a:"Muchos creyeron pero otros informaron a los fariseos que decidieron matar a Jesús", opts:["Muchos creyeron pero otros informaron a los fariseos que decidieron matar a Jesús","Todos los presentes se convirtieron al instante","El Sanedrín invitó a Jesús a hablar en el templo","Lázaro comenzó a predicar inmediatamente"] },
  { id:313, cat:"Tesoro", q:"💎 TESORO: ¿Cuántos idiomas originales fueron usados para escribir la Biblia completa?", hints:["No fue escrita en un solo idioma","El Nuevo Testamento es en griego koiné","El Antiguo Testamento tiene dos idiomas principales"], a:"Tres: hebreo, arameo y griego", opts:["Tres: hebreo, arameo y griego","Solo dos: hebreo y griego","Cuatro incluyendo el latín antiguo","Solo el hebreo bíblico antiguo"] },
  { id:314, cat:"Tesoro", q:"💎 TESORO: ¿Qué pasó ANTES de que Abraham ofreciera a Isaac según Génesis 22?", hints:["Dios habló a Abraham de noche","Abraham se levantó temprano al día siguiente","Partió con Isaac y dos siervos hacia el lugar"], a:"Dios le habló y Abraham se levantó temprano para ir al lugar", opts:["Dios le habló y Abraham se levantó temprano para ir al lugar","Sara rogó a Dios que cambiara la orden divina","Abraham ayunó tres días antes de partir","Un ángel se le apareció de día con la orden"] },
  { id:315, cat:"Tesoro", q:"💎 TESORO: ¿Cuál es la curiosidad del versículo Juan 11:35 en la Biblia?", hints:["Es el versículo más corto de toda la Biblia","Solo tiene dos palabras en español","Habla de la reacción de Jesús ante el sepulcro de Lázaro"], a:"Es el versículo más corto: Jesús lloró", opts:["Es el versículo más corto: Jesús lloró","Es el único versículo donde Jesús ríe","Es donde Jesús pronuncia el discurso más corto","Es el único versículo con solo el nombre de Jesús"] },
  { id:316, cat:"Tesoro", q:"💎 TESORO: ¿Qué profeta del Antiguo Testamento predijo con exactitud el nombre del rey Ciro 150 años antes de que naciera?", hints:["Lo llamó por su nombre en la profecía","La profecía está en el libro más largo del AT","Este profeta tiene 66 capítulos en su libro"], a:"Isaías (Isaías 44:28 y 45:1)", opts:["Isaías (Isaías 44:28 y 45:1)","Jeremías en las cartas a los exiliados","Daniel en la interpretación del sueño","Ezequiel en la visión del templo nuevo"] },
  { id:317, cat:"Tesoro", q:"💎 TESORO: ¿Qué ocurrió DESPUÉS de que los magos adoraron a Jesús según Mateo 2?", hints:["Dios les advirtió en sueños","No volvieron a ver a Herodes","Tomaron otro camino al regresar a su tierra"], a:"Dios los avisó en sueños y volvieron por otro camino", opts:["Dios los avisó en sueños y volvieron por otro camino","Herodes los invitó a un banquete de regreso","Se quedaron en Belén para proteger al niño","Un ángel los acompañó hasta su país de origen"] },
  { id:318, cat:"Tesoro", q:"💎 TESORO: ¿Cuántos años después de la muerte de David construyó Salomón el templo según 1 Reyes 6?", hints:["David murió cuando Salomón comenzó a reinar","Salomón comenzó a construir el templo en su cuarto año","David murió aproximadamente en el año 970 a.C."], a:"Aproximadamente 4 años después de la muerte de David", opts:["Aproximadamente 4 años después de la muerte de David","En el mismo año que David murió","20 años después del reinado de David","David vivió para ver comenzar el templo"] },
  { id:319, cat:"Tesoro", q:"💎 TESORO: ¿Qué curiosa conexión existe entre Génesis 1:1 y Juan 1:1?", hints:["Ambos son el primer versículo de su libro","Ambos comienzan con la misma frase","Génesis dice: en el principio y Juan también"], a:"Ambos comienzan con: En el principio", opts:["Ambos comienzan con: En el principio","Ambos tienen exactamente el mismo número de palabras","Ambos hablan del mismo evento de la creación","Ambos fueron escritos originalmente en hebreo"] },
  { id:320, cat:"Tesoro", q:"💎 TESORO: ¿Cuál fue la primera ciudad que conquistó Josué en Canaán y por qué fue significativa según Josué 6?", hints:["Era una ciudad fuertemente amurallada","Su conquista fue milagrosa sin armas convencionales","Era la llave de entrada a toda la tierra prometida"], a:"Jericó: porque su caída milagrosa abrió la puerta a toda Canaán", opts:["Jericó: porque su caída milagrosa abrió la puerta a toda Canaán","Hai: porque fue la primera batalla con ejército regular","Gabaón: porque sus habitantes hicieron paz voluntariamente","Hebrón: porque allí estaban los gigantes que debían vencer"] },
];

// ═══════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════
const POINTS    = { direct:5, h1:3, h2:2, h3:1, wrong:-5 };
const STEPS     = { correct:1, wrong:-2, challengeCorrect:2, challengeWrong:-2 };
const CHALLENGE = { correct:10, wrong:-8 };
const TESORO    = { correct:25, wrong:-10, steps:2, stepsWrong:-3 };
const BUZZ_LOCK = 3; // segundos bloqueados al inicio
const TOTAL     = 66;
const TIMER_SEC = 15;
const CHALLENGE_SQUARES = [13, 26, 39, 52, 60];
const PLAYER_COLORS = ["#D4845A","#9B7FA6","#5AABA6","#D4695A","#D4B95A","#6BAD74","#C46891","#5A9BC4","#8EBD56","#D4975A"];
const AVATARS = [
  { emoji:"👑", name:"REY",         linaje:"Linaje Real",     color:"#C8920E" },
  { emoji:"💎", name:"REINA",       linaje:"Linaje Real",     color:"#C8920E" },
  { emoji:"⚔️",  name:"GUERRERO",   linaje:"Linaje Valiente", color:"#3A6AAA" },
  { emoji:"🏹", name:"GUERRERA",    linaje:"Linaje Valiente", color:"#3A6AAA" },
  { emoji:"📜", name:"SABIO",       linaje:"Linaje Antiguo",  color:"#8B7340" },
  { emoji:"🌿", name:"SABIA",       linaje:"Linaje Antiguo",  color:"#8B7340" },
  { emoji:"🛡️", name:"GUARDIÁN",   linaje:"Linaje Fiel",     color:"#2A6A5A" },
  { emoji:"🗡️", name:"GUARDIANA",  linaje:"Linaje Fiel",     color:"#2A6A5A" },
  { emoji:"🧭", name:"EXPLORADOR",  linaje:"Linaje Nómada",   color:"#7A5A2A" },
  { emoji:"⭐", name:"EXPLORADORA", linaje:"Linaje Nómada",   color:"#7A5A2A" },
];

// Palabras bíblicas para códigos de sala
const ROOM_WORDS = ["ADÁN","NOÉH","RUTT","JOSÉ","RUTH","EDEN","SIÓN","ARÓN","LEVI","JUDÁ","GADI","DANA","ABIA","EBAN","ORIA"];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(()=>Math.random()-.5); }
function norm(s: string) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim(); }
function ptsFor(hr: number) { return hr===0?POINTS.direct:hr===1?POINTS.h1:hr===2?POINTS.h2:POINTS.h3; }
function genRoomCode() { return ROOM_WORDS[Math.floor(Math.random()*ROOM_WORDS.length)]; }

// ═══════════════════════════════════════════════════════════════
//  WEB AUDIO ENGINE
// ═══════════════════════════════════════════════════════════════
function useAudio() {
  const ctx = useRef<AudioContext|null>(null);
  const tickRef = useRef<any>(null);
  const bgGain = useRef<GainNode|null>(null);

  const getCtx = useCallback(() => {
    if (!ctx.current) ctx.current = new (window.AudioContext||(window as any).webkitAudioContext)();
    return ctx.current;
  }, []);

  const tone = useCallback((freq:number, dur:number, vol=0.3, type:OscillatorType="sine", delay=0) => {
    try {
      const c=getCtx(), o=c.createOscillator(), g=c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type=type; o.frequency.setValueAtTime(freq,c.currentTime+delay);
      g.gain.setValueAtTime(0,c.currentTime+delay);
      g.gain.linearRampToValueAtTime(vol,c.currentTime+delay+0.01);
      g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+delay+dur);
      o.start(c.currentTime+delay); o.stop(c.currentTime+delay+dur+0.05);
    } catch(e){}
  }, [getCtx]);

  const startTickTock = useCallback(() => {
    try {
      const c=getCtx();
      bgGain.current=c.createGain();
      bgGain.current.gain.value=0.06;
      bgGain.current.connect(c.destination);
      const tick=()=>{
        try {
          const c2=getCtx();
          const o1=c2.createOscillator(),g1=c2.createGain();
          o1.connect(g1);g1.connect(bgGain.current!);
          o1.type="sine";o1.frequency.value=1200;
          g1.gain.setValueAtTime(0,c2.currentTime);
          g1.gain.linearRampToValueAtTime(0.5,c2.currentTime+0.005);
          g1.gain.exponentialRampToValueAtTime(0.001,c2.currentTime+0.04);
          o1.start(c2.currentTime);o1.stop(c2.currentTime+0.05);
          setTimeout(()=>{
            try {
              const c3=getCtx();
              const o2=c3.createOscillator(),g2=c3.createGain();
              o2.connect(g2);g2.connect(bgGain.current!);
              o2.type="sine";o2.frequency.value=900;
              g2.gain.setValueAtTime(0,c3.currentTime);
              g2.gain.linearRampToValueAtTime(0.35,c3.currentTime+0.005);
              g2.gain.exponentialRampToValueAtTime(0.001,c3.currentTime+0.04);
              o2.start(c3.currentTime);o2.stop(c3.currentTime+0.05);
            } catch(e){}
          },500);
        } catch(e){}
      };
      tick();
      tickRef.current=setInterval(tick,1000);
    } catch(e){}
  }, [getCtx]);

  const stopTickTock = useCallback(() => {
    if(tickRef.current){clearInterval(tickRef.current);tickRef.current=null;}
    if(bgGain.current){try{bgGain.current.gain.value=0;}catch(e){}bgGain.current=null;}
  }, []);

  const playTrumpet = useCallback(() => {
    [523,659,784,1047].forEach((n,i)=>tone(n,0.25,0.45,"sawtooth",i*0.12));
  }, [tone]);

  const playDrum = useCallback(() => {
    try {
      const c=getCtx();
      const o=c.createOscillator(),g=c.createGain();
      o.connect(g);g.connect(c.destination);
      o.type="sine";
      o.frequency.setValueAtTime(160,c.currentTime);
      o.frequency.exponentialRampToValueAtTime(40,c.currentTime+0.3);
      g.gain.setValueAtTime(0,c.currentTime);
      g.gain.linearRampToValueAtTime(0.8,c.currentTime+0.01);
      g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.4);
      o.start(c.currentTime);o.stop(c.currentTime+0.45);
    } catch(e){}
  }, [getCtx]);

  const playTambourine = useCallback(() => {
    try {
      const c=getCtx();
      [0,0.06,0.12,0.18,0.25].forEach(d=>{
        const buf=c.createBuffer(1,c.sampleRate*0.05,c.sampleRate);
        const data=buf.getChannelData(0);
        for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/200);
        const s=c.createBufferSource(),g=c.createGain();
        s.buffer=buf;s.connect(g);g.connect(c.destination);
        g.gain.value=0.4;s.start(c.currentTime+d);
      });
      tone(3500,0.08,0.2,"sine",0);
    } catch(e){}
  }, [getCtx, tone]);

  const playHarp = useCallback(() => {
    [261,329,392,523,659,784,1047,1319].forEach((n,i)=>tone(n,0.4,0.35,"sine",i*0.07));
  }, [tone]);

  const playChallengeSquare = useCallback((sq:number) => {
    if(sq===13) playTrumpet();
    else if(sq===26) playDrum();
    else if(sq===39) playTambourine();
    else if(sq===52) playHarp();
    else if(sq===60) { playTrumpet(); setTimeout(playDrum,300); }
  }, [playTrumpet, playDrum, playTambourine, playHarp]);

  const playAvatarSelect = useCallback(() => {
    [523,659,784,1047].forEach((n,i)=>tone(n,0.55,0.22,"sine",i*0.07));
    tone(2093,0.9,0.07,"sine",0.2);
  }, [tone]);

  const playConfirm = useCallback(() => {
    [523,784,1047].forEach((n,i)=>tone(n,0.3,0.32,"sawtooth",i*0.18));
  }, [tone]);

  const playCorrect = useCallback(() => {
    tone(523,0.12,0.3); tone(659,0.12,0.3,"sine",0.13); tone(784,0.25,0.3,"sine",0.26);
  }, [tone]);

  const playWrong = useCallback(() => {
    tone(300,0.15,0.3,"sawtooth"); tone(220,0.25,0.2,"sawtooth",0.18);
  }, [tone]);

  const playBuzz = useCallback(() => { tone(440,0.08,0.4,"square"); }, [tone]);

  const playVictory = useCallback(() => {
    playTrumpet();
    setTimeout(()=>playDrum(),400);
    setTimeout(()=>playHarp(),700);
    setTimeout(()=>playTrumpet(),1100);
  }, [playTrumpet, playDrum, playHarp]);

  const playNearEnd = useCallback((pos:number) => {
    if(pos===61){tone(880,0.2,0.4);tone(1100,0.2,0.35,"sine",0.25);}
    else if(pos===63){[0,0.15,0.3].forEach(d=>tone(1047,0.12,0.4,"sine",d));}
    else if(pos===65){[784,880,988,1047,1175].forEach((f,i)=>tone(f,0.12,0.45,"sine",i*0.08));}
  }, [tone]);

  const playTimerTick = useCallback((secs:number) => {
    if(secs<=5) tone(900,0.04,0.2,"square");
  }, [tone]);

  const playTesoro = useCallback(() => {
    // Sonido mágico y brillante: arpegio ascendente con campanas
    try {
      const c=getCtx();
      [[523,0],[659,0.1],[784,0.2],[1047,0.3],[1319,0.4],[1568,0.5],[2093,0.65]].forEach(([freq,delay])=>{
        const o=c.createOscillator(),g=c.createGain();
        o.connect(g);g.connect(c.destination);
        o.type="sine";o.frequency.value=freq as number;
        g.gain.setValueAtTime(0,c.currentTime+(delay as number));
        g.gain.linearRampToValueAtTime(0.3,c.currentTime+(delay as number)+0.02);
        g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+(delay as number)+0.6);
        o.start(c.currentTime+(delay as number));
        o.stop(c.currentTime+(delay as number)+0.65);
      });
      // Shimmer final
      setTimeout(()=>tone(2093,0.8,0.15,"sine",0),900);
      setTimeout(()=>tone(2637,0.6,0.12,"sine",0),1050);
    } catch(e){}
  }, [getCtx, tone]);

  // 🎵 Bienvenida: arpa glissando ascendente + campana
  const playWelcome = useCallback(() => {
    try {
      const c=getCtx();
      // Arpa glissando ascendente
      [261,293,329,349,392,440,494,523,587,659,784,880,1047].forEach((n,i)=>
        tone(n,0.35,0.18,"sine",i*0.06)
      );
      // Campana al final
      setTimeout(()=>{
        try {
          const o=c.createOscillator(),g=c.createGain();
          o.connect(g);g.connect(c.destination);
          o.type="sine";o.frequency.value=1760;
          g.gain.setValueAtTime(0,c.currentTime);
          g.gain.linearRampToValueAtTime(0.4,c.currentTime+0.01);
          g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+1.8);
          o.start(c.currentTime);o.stop(c.currentTime+2);
          // Segundo armónico
          const o2=c.createOscillator(),g2=c.createGain();
          o2.connect(g2);g2.connect(c.destination);
          o2.type="sine";o2.frequency.value=2093;
          g2.gain.setValueAtTime(0,c.currentTime);
          g2.gain.linearRampToValueAtTime(0.2,c.currentTime+0.01);
          g2.gain.exponentialRampToValueAtTime(0.001,c.currentTime+1.2);
          o2.start(c.currentTime);o2.stop(c.currentTime+1.5);
        } catch(e){}
      },780);
    } catch(e){}
  }, [getCtx, tone]);

  // ⏰ Timeout respuesta: arpa descendente de tensión
  const playAnswerTimeout = useCallback(() => {
    try {
      [1047,880,784,659,523,440,392,329,261].forEach((n,i)=>
        tone(n,0.3,0.25,"sine",i*0.09)
      );
      // Buzzer final
      setTimeout(()=>tone(180,0.5,0.4,"sawtooth",0),820);
    } catch(e){}
  }, [tone]);

  // 🔔 Dong ancestral para frases motivadoras
  const playDong = useCallback(() => {
    try {
      const c=getCtx();
      // Nota grave profunda tipo gong/campana tibetana
      [[130,0,0.35,2.5],[196,0,0.2,2.0],[261,0.05,0.15,1.5]].forEach(([freq,delay,vol,dur])=>{
        const o=c.createOscillator(),g=c.createGain();
        o.connect(g);g.connect(c.destination);
        o.type="sine";o.frequency.value=freq as number;
        g.gain.setValueAtTime(0,c.currentTime+(delay as number));
        g.gain.linearRampToValueAtTime(vol as number,c.currentTime+(delay as number)+0.015);
        g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+(delay as number)+(dur as number));
        o.start(c.currentTime+(delay as number));
        o.stop(c.currentTime+(delay as number)+(dur as number)+0.1);
      });
    } catch(e){}
  }, [getCtx]);

  return { startTickTock, stopTickTock, playChallengeSquare, playAvatarSelect, playConfirm, playCorrect, playWrong, playBuzz, playVictory, playNearEnd, playTimerTick, playTesoro, playWelcome, playAnswerTimeout, playDong };
}

// ═══════════════════════════════════════════════════════════════
//  FONTS & KEYFRAMES
// ═══════════════════════════════════════════════════════════════
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&display=swap');
@keyframes dustUp{0%{opacity:0;transform:translateY(0)}60%{opacity:.5}100%{opacity:0;transform:translateY(-60px)}}
@keyframes goldShim{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes glowP{0%,100%{filter:drop-shadow(0 2px 8px rgba(200,146,14,.2))}50%{filter:drop-shadow(0 2px 28px rgba(200,146,14,.65))}}
@keyframes btnGlow{0%,100%{box-shadow:0 0 18px rgba(200,146,14,.2)}50%{box-shadow:0 0 44px rgba(200,146,14,.5)}}
@keyframes chalFlash{0%,100%{background:#17120a}50%{background:#2a0800}}
@keyframes tesoroFlash{0%{background:#17120a;box-shadow:none}25%{background:#1a1400;box-shadow:inset 0 0 80px rgba(255,215,0,.3)}50%{background:#221a00;box-shadow:inset 0 0 120px rgba(255,215,0,.5)}75%{background:#1a1400;box-shadow:inset 0 0 80px rgba(255,215,0,.3)}100%{background:#17120a;box-shadow:none}}
@keyframes tesoroGlow{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
@keyframes winFlash{0%{opacity:0}10%{opacity:1;background:rgba(255,255,255,.95)}30%{opacity:.7;background:rgba(255,255,255,.6)}50%{opacity:.4;background:rgba(255,255,255,.3)}70%{opacity:.6;background:rgba(255,255,255,.5)}85%{opacity:.2;background:rgba(255,255,255,.15)}100%{opacity:0}}
@keyframes goldParticle{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-120px) rotate(720deg);opacity:0}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes phraseGlow{0%{opacity:0;transform:scale(.95) translateY(10px)}35%{opacity:1;transform:scale(1.03) translateY(0)}65%{opacity:1;transform:scale(1) translateY(0)}100%{opacity:.9;transform:scale(1) translateY(0)}}
@keyframes nearPulse{from{opacity:1;transform:translateX(-50%) scale(1)}to{opacity:.3;transform:translateX(-50%) scale(1.6)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes codePulse{0%,100%{opacity:1}50%{opacity:.6}}
`;

const DUST = Array.from({length:16},(_,i)=>({id:i,left:`${Math.random()*100}%`,top:`${40+Math.random()*55}%`,size:1.5+Math.random()*2.5,delay:`${Math.random()*7}s`,dur:`${4+Math.random()*5}s`}));

// ═══════════════════════════════════════════════════════════════
//  RACE BOARD
// ═══════════════════════════════════════════════════════════════
function RaceBoard({ players, onPlayerClick }: { players:any[]; onPlayerClick:(p:any)=>void }) {
  const CH_LABELS: Record<number,string> = { 13:"🎺", 26:"🥁", 39:"🪘", 52:"🎵", 60:"⚡" };
  return (
    <div style={{background:"#0e0b06",borderRadius:14,padding:"10px 10px 8px",border:"1px solid rgba(200,146,14,.2)",fontFamily:"'Cinzel',Georgia,serif",userSelect:"none"}}>
      <div style={{position:"relative",marginBottom:4}}>
        <div style={{height:3,borderRadius:2,background:"linear-gradient(90deg,transparent 2%,#FFD700 50%,transparent 98%)"}}/>
        <span style={{position:"absolute",right:0,top:-16,fontSize:9,color:"#FFD700",letterSpacing:2}}>🏆 META — Casilla 66</span>
      </div>
      <div style={{position:"relative",height:260}}>
        {CHALLENGE_SQUARES.map(sq => {
          const pct=((sq-1)/(TOTAL-1))*100;
          return (
            <div key={sq} style={{position:"absolute",left:0,right:0,bottom:`${pct}%`,zIndex:1,pointerEvents:"none"}}>
              <div style={{height:1,background:"rgba(255,80,80,0.3)",position:"relative"}}>
                <span style={{position:"absolute",right:2,top:-12,fontSize:8,color:"rgba(255,120,120,0.7)"}}>{CH_LABELS[sq]} C{sq}</span>
              </div>
            </div>
          );
        })}
        <div style={{display:"flex",alignItems:"flex-end",height:"100%",gap:players.length>6?2:4,padding:`0 ${players.length>8?2:6}px`,position:"relative",zIndex:2}}>
          {players.map((p:any) => {
            const pct=Math.max(2,((p.position-1)/(TOTAL-1))*100);
            const isNear=p.position>=61, isWin=p.position>=TOTAL;
            return (
              <div key={p.name} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end",minWidth:0}}>
                <div style={{flex:1,width:"100%",background:"rgba(255,255,255,.04)",borderRadius:"3px 3px 0 0",position:"relative",overflow:"visible"}}>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${pct}%`,background:p.color,borderRadius:"3px 3px 0 0",opacity:.85,transition:"height .7s cubic-bezier(.34,1.56,.64,1)"}}/>
                  <div style={{position:"absolute",bottom:`${Math.min(pct+1,88)}%`,left:0,right:0,textAlign:"center",fontSize:8,color:"rgba(255,255,255,.8)",fontWeight:"bold",transition:"bottom .7s ease"}}>{p.position}</div>
                  {isNear&&!isWin&&<div style={{position:"absolute",top:-4,left:"50%",width:6,height:6,borderRadius:"50%",background:"#FFD700",animation:"nearPulse .7s ease-in-out infinite alternate"}}/>}
                  {isWin&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",fontSize:10}}>🏆</div>}
                </div>
                <div onClick={()=>onPlayerClick(p)} style={{fontSize:players.length>7?16:20,cursor:"pointer",lineHeight:1}}>{AVATARS[p.avatar]?.emoji||"?"}</div>
                <div style={{fontSize:7,color:"#c8a850",textAlign:"center",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:7,color:"#666"}}>{p.score}pts</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PLAYER POPUP
// ═══════════════════════════════════════════════════════════════
function PlayerPopup({ player, onClose }: any) {
  if(!player) return null;
  const pct=Math.round(((player.position-1)/(TOTAL-1))*100);
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#1c1508",border:`2px solid ${player.color}`,borderRadius:16,padding:24,textAlign:"center",minWidth:210,animation:"popIn .3s ease"}} onClick={(e)=>e.stopPropagation()}>
        <style>{FONTS}</style>
        <div style={{fontSize:48,marginBottom:6}}>{AVATARS[player.avatar]?.emoji||"?"}</div>
        <h3 style={{fontFamily:"'Cinzel Decorative',Georgia,serif",color:player.color,fontSize:16,margin:"0 0 4px",letterSpacing:2}}>{player.name}</h3>
        <p style={{color:"#888",fontSize:11,margin:"0 0 12px",fontStyle:"italic"}}>{AVATARS[player.avatar]?.linaje}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:12}}>
          {[["Casilla",player.position],["Puntos",player.score],["Progreso",pct+"%"]].map(([l,v])=>(
            <div key={l as string} style={{background:"rgba(255,255,255,.06)",borderRadius:8,padding:"6px 10px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:"bold",color:"#d4b060"}}>{v}</div>
              <div style={{fontSize:9,color:"#888"}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{height:5,background:"rgba(255,255,255,.08)",borderRadius:999,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",background:player.color,borderRadius:999,width:`${pct}%`,transition:"width .5s ease"}}/>
        </div>
        {player.position>=61&&<p style={{color:"#FFD700",fontSize:10,margin:"0 0 8px"}}>🏆 ¡Cerca de la meta!</p>}
        <button onClick={onClose} style={{background:"rgba(200,160,80,.1)",border:"1px solid rgba(200,160,80,.2)",borderRadius:8,padding:"6px 18px",color:"#c8a850",cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Cerrar</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  INTRO SCREEN
// ═══════════════════════════════════════════════════════════════
function IntroScreen({ onStart, onSolo, audio }: { onStart:()=>void; onSolo:()=>void; audio:any }) {
  const [p,setP]=useState(0);
  useEffect(()=>{
    const t=[150,900,1700,2500].map((ms,i)=>setTimeout(()=>setP(i+1),ms));
    // 🎵 Sonido de bienvenida cuando p llega a 1 (pantalla visible)
    const welcome=setTimeout(()=>{ try{ audio.playWelcome(); }catch(e){} },600);
    return ()=>{ t.forEach(clearTimeout); clearTimeout(welcome); };
  },[]);
  const vis=(min:number)=>({opacity:p>=min?1:0,transform:p>=min?"translateY(0)":"translateY(24px)",transition:"opacity 1s ease,transform 1s cubic-bezier(.22,1,.36,1)"});
  const share=()=>{
    const url=window.location.href;
    if(navigator.clipboard) navigator.clipboard.writeText(url).then(()=>alert("¡Link copiado! Pégalo en WhatsApp 📱"));
    else { const t=document.createElement("textarea");t.value=url;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t);alert("¡Link copiado! 📱"); }
  };
  return (
    <div style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"linear-gradient(160deg,#0d0700 0%,#1a0a00 40%,#0a0d00 100%)"}}>
      <style>{FONTS}</style>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 100% 70% at 50% 45%,#2a1f10 0%,#17120a 65%,#0c0904 100%)"}}>
        {DUST.map(d=><div key={d.id} style={{position:"absolute",left:d.left,top:d.top,width:d.size,height:d.size,borderRadius:"50%",background:"rgba(215,190,130,.55)",animation:`dustUp ${d.dur} ${d.delay} ease-in-out infinite`}}/>)}
      </div>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 85% 75% at 50% 50%,transparent 35%,rgba(0,0,0,.85) 100%)"}}/>
      <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",padding:"44px 24px",maxWidth:520,width:"100%",textAlign:"center",fontFamily:"'Cinzel',Georgia,serif"}}>
        <div style={{...vis(1),display:"flex",alignItems:"center",gap:14,width:"100%",maxWidth:300,marginBottom:22}}>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(195,160,70,.5),transparent)"}}/>
          <span style={{fontSize:12,color:"rgba(200,165,80,.7)"}}>◆</span>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(195,160,70,.5),transparent)"}}/>
        </div>
        <div style={{...vis(2),position:"relative",marginBottom:14}}>
          <h1 style={{position:"absolute",top:6,left:0,right:0,fontFamily:"'Cinzel Decorative',Georgia,serif",fontSize:"clamp(52px,12vw,84px)",fontWeight:900,margin:0,letterSpacing:"8px",lineHeight:1,color:"transparent",WebkitTextStroke:"1px rgba(0,0,0,.9)",filter:"blur(8px)",opacity:.7,userSelect:"none",pointerEvents:"none"}}>BIBLION</h1>
          <h1 style={{position:"relative",zIndex:1,margin:0,fontFamily:"'Cinzel Decorative',Georgia,serif",fontSize:"clamp(52px,12vw,84px)",fontWeight:900,letterSpacing:"8px",lineHeight:1,background:"linear-gradient(175deg,#fffbe8 0%,#f5d060 18%,#c8920e 52%,#7a4e08 78%,#c8920e 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"glowP 4s ease-in-out infinite"}}>BIBLION</h1>
          <h1 style={{position:"absolute",top:0,left:0,right:0,zIndex:2,margin:0,fontFamily:"'Cinzel Decorative',Georgia,serif",fontSize:"clamp(52px,12vw,84px)",fontWeight:900,letterSpacing:"8px",lineHeight:1,background:"linear-gradient(108deg,transparent 28%,rgba(255,252,220,.5) 48%,transparent 68%)",backgroundSize:"220% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"goldShim 3.5s linear infinite",userSelect:"none",pointerEvents:"none"}}>BIBLION</h1>
        </div>
        <div style={{...vis(2),display:"flex",alignItems:"center",gap:8,width:"100%",maxWidth:260,marginBottom:20,transition:"opacity .8s ease .3s"}}>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(180,140,55,.45),transparent)"}}/>
          <div style={{width:7,height:7,background:"rgba(195,160,70,.55)",transform:"rotate(45deg)",flexShrink:0}}/>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(180,140,55,.45),transparent)"}}/>
        </div>
        <div style={{...vis(3),marginBottom:0}}>
          <p style={{margin:"0 0 7px",fontFamily:"'Cinzel',Georgia,serif",fontSize:12,letterSpacing:3,background:"linear-gradient(90deg,#a07830,#d4b060,#a07830)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"goldShim 5s linear infinite",textTransform:"uppercase"}}>El Camino de la Sabiduría</p>
          <p style={{margin:0,fontSize:10,color:"rgba(175,145,85,.45)",letterSpacing:1}}>Juego bíblico · hasta 10 jugadores · 66 casillas</p>
        </div>
        <div style={{...vis(3),display:"flex",alignItems:"center",gap:14,width:"100%",maxWidth:300,margin:"22px 0 36px"}}>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(195,160,70,.5),transparent)"}}/>
          <span style={{fontSize:12,color:"rgba(200,165,80,.7)"}}>◆</span>
          <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(195,160,70,.5),transparent)"}}/>
        </div>
        <div style={{opacity:p>=4?1:0,transform:p>=4?"translateY(0)":"translateY(16px)",transition:"opacity .6s ease,transform .6s ease",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <button onClick={onSolo} style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:14,fontWeight:700,letterSpacing:4,color:"#c8920e",background:"transparent",border:"1px solid rgba(200,150,50,.4)",borderRadius:2,padding:"14px 48px",cursor:"pointer",textTransform:"uppercase",animation:"btnGlow 3s ease-in-out infinite",outline:"none"}}>🧍 INDIVIDUAL</button>
          <button onClick={onStart} style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:11,letterSpacing:3,color:"rgba(200,165,80,.7)",background:"transparent",border:"1px solid rgba(200,150,50,.25)",borderRadius:2,padding:"10px 32px",cursor:"pointer",textTransform:"uppercase",outline:"none"}}>🌐 Multijugador en red</button>
          <button onClick={share} style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:11,letterSpacing:2,color:"rgba(200,165,80,.5)",background:"transparent",border:"1px solid rgba(200,150,50,.15)",borderRadius:2,padding:"8px 24px",cursor:"pointer",textTransform:"uppercase",display:"flex",alignItems:"center",gap:8,outline:"none"}}>🔗 Compartir enlace</button>
          <p style={{margin:0,fontSize:10,color:"rgba(155,125,65,.38)",letterSpacing:1,textTransform:"uppercase"}}>🎺 🥁 🪘 🎵 · Individual o multijugador</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LOBBY SCREEN — crear o unirse a sala
// ═══════════════════════════════════════════════════════════════
function LobbyScreen({ onHost, onJoin, onBack }: { onHost:()=>void; onJoin:(code:string)=>void; onBack:()=>void }) {
  const [joinCode,setJoinCode]=useState("");
  const [err,setErr]=useState("");
  const handleJoin=()=>{
    const code=joinCode.trim().toUpperCase();
    if(code.length<3){setErr("Ingresá el código de sala");return;}
    onJoin(code);
  };
  return (
    <div style={S.wrap}>
      <style>{FONTS}</style>
      <div style={{display:"flex",alignItems:"center",gap:12,width:"100%",maxWidth:340,marginBottom:18}}>
        <button onClick={onBack} style={{background:"rgba(200,160,80,.07)",border:"1px solid rgba(200,160,80,.18)",borderRadius:10,padding:"8px 14px",color:"#c8a850",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>← Volver</button>
        <h2 style={{...S.h2,margin:0,flex:1}}>🌐 Multijugador</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:340}}>
        <button style={{...S.modeBtn,flexDirection:"column",alignItems:"center",gap:8,padding:"20px"}} onClick={onHost}>
          <span style={{fontSize:36}}>🏠</span>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:15,color:"#c8a850",letterSpacing:1}}>Crear sala</div>
            <div style={{fontSize:11,color:"#888",marginTop:3}}>Generás un código y lo compartís</div>
          </div>
        </button>
        <div style={{background:"rgba(200,160,80,.06)",border:"1px solid rgba(200,160,80,.18)",borderRadius:14,padding:"18px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:14,color:"#c8a850",letterSpacing:1,textAlign:"center"}}>Unirse a sala</div>
          <input
            style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(200,160,80,.28)",borderRadius:8,padding:"12px",color:"#e8d8b0",fontSize:18,outline:"none",fontFamily:"'Cinzel',Georgia,serif",textAlign:"center",letterSpacing:6,textTransform:"uppercase"}}
            placeholder="CÓDIGO" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={6}
            onKeyDown={e=>e.key==="Enter"&&handleJoin()}
          />
          {err&&<p style={{color:"#ff7070",fontSize:12,textAlign:"center",margin:0}}>{err}</p>}
          <button style={S.mainBtn} onClick={handleJoin}>Unirse ➜</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  WAITING ROOM — sala de espera con código
// ═══════════════════════════════════════════════════════════════
function WaitingRoom({ roomCode, players, pending, isHost, myName, onStart, onLeave, onAdmit }: any) {
  const prevPlayers = useRef(players.length);
  const prevPending = useRef((pending||[]).length);

  // 🔔 Ping cuando alguien nuevo solicita unirse (solo anfitrión)
  useEffect(()=>{
    const newPending = (pending||[]).length;
    if(isHost && newPending > prevPending.current) {
      try {
        const ctx = new (window.AudioContext||(window as any).webkitAudioContext)();
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type="sine"; o.frequency.value=880;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.4, ctx.currentTime+0.01);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.45);
        o.start(ctx.currentTime); o.stop(ctx.currentTime+0.5);
        const o2=ctx.createOscillator(), g2=ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.type="sine"; o2.frequency.value=1100;
        g2.gain.setValueAtTime(0, ctx.currentTime+0.18);
        g2.gain.linearRampToValueAtTime(0.3, ctx.currentTime+0.19);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.5);
        o2.start(ctx.currentTime+0.18); o2.stop(ctx.currentTime+0.55);
      } catch(e){}
    }
    prevPending.current = newPending;
  }, [(pending||[]).length]);

  // 🎺 Trompeta cuando alguien es admitido
  useEffect(()=>{
    if(players.length > prevPlayers.current) {
      try {
        const ctx = new (window.AudioContext||(window as any).webkitAudioContext)();
        [[392,0],[523,0.15],[659,0.3]].forEach(([freq,delay])=>{
          const o=ctx.createOscillator(), g=ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type="sawtooth"; o.frequency.value=freq as number;
          g.gain.setValueAtTime(0, ctx.currentTime+(delay as number));
          g.gain.linearRampToValueAtTime(0.35, ctx.currentTime+(delay as number)+0.02);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+(delay as number)+0.22);
          o.start(ctx.currentTime+(delay as number));
          o.stop(ctx.currentTime+(delay as number)+0.25);
        });
      } catch(e){}
    }
    prevPlayers.current = players.length;
  }, [players.length]);

  const share=()=>{
    const msg=`¡Únete a BIBLION! Código de sala: ${roomCode}\n${window.location.href}`;
    if(navigator.clipboard) navigator.clipboard.writeText(msg).then(()=>alert("¡Mensaje copiado para WhatsApp! 📱"));
  };

  // ¿El invitado ya fue admitido?
  const iAmAdmitted = players.find((p:any)=>p.name===myName);
  // ¿Estoy en pending esperando?
  const iAmPending = !isHost && !iAmAdmitted;

  return (
    <div style={S.wrap}>
      <style>{FONTS}</style>
      <h2 style={S.h2}>🏠 Sala de espera</h2>

      {/* Código de sala */}
      <div style={{background:"rgba(200,146,14,.08)",border:"2px solid rgba(200,146,14,.4)",borderRadius:16,padding:"18px 28px",marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:6}}>CÓDIGO DE SALA</div>
        <div style={{fontFamily:"'Cinzel Decorative',Georgia,serif",fontSize:38,color:"#FFD700",letterSpacing:12,animation:"codePulse 2s ease-in-out infinite"}}>{roomCode}</div>
        <div style={{fontSize:10,color:"#666",marginTop:6}}>Compartí este código con tus jugadores</div>
      </div>

      <button onClick={share} style={{...S.secBtn,marginBottom:14,display:"flex",alignItems:"center",gap:8,fontSize:12}}>
        📱 Copiar código para WhatsApp
      </button>

      {/* VISTA INVITADO — esperando ser admitido */}
      {iAmPending&&(
        <div style={{background:"rgba(200,146,14,.07)",border:"1px solid rgba(200,146,14,.3)",borderRadius:14,padding:"20px",marginBottom:14,textAlign:"center",width:"100%",maxWidth:380}}>
          <div style={{fontSize:32,marginBottom:10,animation:"spin 3s linear infinite"}}>⏳</div>
          <div style={{fontFamily:"'Cinzel',Georgia,serif",color:"#c8a850",fontSize:15,letterSpacing:1,marginBottom:6}}>Esperando admisión…</div>
          <div style={{fontSize:11,color:"#666"}}>El anfitrión recibirá una notificación y te admitirá en breve</div>
        </div>
      )}

      {/* VISTA ANFITRIÓN — solicitudes de ingreso */}
      {isHost&&(pending||[]).length>0&&(
        <div style={{width:"100%",maxWidth:380,marginBottom:14}}>
          <div style={{fontSize:11,color:"#FF8844",letterSpacing:2,marginBottom:8,textAlign:"center",display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
            <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#FF8844",animation:"nearPulse .7s ease-in-out infinite alternate"}}/>
            🔔 SOLICITUDES DE INGRESO ({(pending||[]).length})
          </div>
          {(pending||[]).map((p:any)=>(
            <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,136,68,.08)",borderRadius:10,padding:"10px 14px",marginBottom:6,border:"1px solid rgba(255,136,68,.3)",animation:"slideUp .3s ease"}}>
              <span style={{fontSize:22}}>{AVATARS[p.avatar]?.emoji||"?"}</span>
              <span style={{flex:1,color:"#e8d8b0",fontFamily:"'Cinzel',Georgia,serif",fontSize:13}}>{p.name}</span>
              <button onClick={()=>onAdmit(p)} style={{background:"linear-gradient(135deg,#c8920e,#7a4e08)",border:"none",borderRadius:8,padding:"7px 16px",color:"#fffbe8",fontSize:12,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",letterSpacing:1}}>
                ✅ Admitir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lista de jugadores admitidos */}
      <div style={{width:"100%",maxWidth:380,marginBottom:16}}>
        <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:8,textAlign:"center"}}>
          EN SALA ({players.length})
        </div>
        {players.map((p:any,i:number)=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 14px",marginBottom:6,border:p.name===myName?"1px solid rgba(200,146,14,.4)":"1px solid transparent",animation:"slideUp .4s ease"}}>
            <span style={{fontSize:22}}>{AVATARS[p.avatar]?.emoji||"?"}</span>
            <span style={{flex:1,color:"#e8d8b0",fontFamily:"'Cinzel',Georgia,serif",fontSize:13}}>{p.name}</span>
            {p.name===myName&&<span style={{fontSize:10,color:"#c8920e",background:"rgba(200,146,14,.15)",borderRadius:999,padding:"2px 8px"}}>Tú</span>}
            {i===0&&<span style={{fontSize:10,color:"#888",background:"rgba(255,255,255,.06)",borderRadius:999,padding:"2px 8px"}}>Anfitrión</span>}
          </div>
        ))}
        {players.length<2&&isHost&&<p style={{textAlign:"center",color:"#555",fontSize:11,marginTop:8}}>Admití al menos un jugador para iniciar</p>}
        {iAmAdmitted&&!isHost&&players.length>=2&&<p style={{textAlign:"center",color:"#555",fontSize:11,marginTop:8}}>⏳ Esperando que el anfitrión inicie la partida…</p>}
      </div>

      {/* Botones */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
        {isHost&&players.length>=2&&(
          <button style={S.mainBtn} onClick={onStart}>
            ⚡ INICIAR PARTIDA ({players.length} jugadores)
          </button>
        )}
        {isHost&&players.length<2&&(
          <button style={{...S.mainBtn,opacity:.45,cursor:"not-allowed"}} disabled>
            Admití mínimo 2 jugadores
          </button>
        )}
        <button style={S.secBtn} onClick={onLeave}>← Salir</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  REGISTER — nombre + avatar para unirse
// ═══════════════════════════════════════════════════════════════
function RegisterScreen({ usedAvatars, usedNames, onDone, audio }: any) {
  const [name,setName]=useState("");
  const [avatar,setAvatar]=useState<number|null>(null);
  const [sel,setSel]=useState(false);
  const [err,setErr]=useState("");

  const go=()=>{
    if(!name.trim()){setErr("Ingresá tu nombre");return;}
    if(usedNames.includes(name.trim())){setErr("Ese nombre ya está en uso");return;}
    if(avatar===null){setErr("Elegí tu avatar");return;}
    setErr(""); audio.playConfirm();
    onDone(name.trim(),avatar);
  };

  return (
    <div style={S.wrap}>
      <style>{FONTS}</style>
      {sel&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.9)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#1c1508",border:"1px solid rgba(200,146,14,.3)",borderRadius:18,padding:24,maxWidth:340,width:"90%"}}>
            <p style={{fontFamily:"'Cinzel',Georgia,serif",color:"#c8a850",textAlign:"center",marginBottom:16,fontSize:13,letterSpacing:2}}>ELIGE TU LINAJE</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:16}}>
              {AVATARS.map((av,i)=>{
                const blocked=usedAvatars.includes(i);
                return (
                  <div key={i} onClick={()=>{if(!blocked){audio.playAvatarSelect();setAvatar(i);setSel(false);}}} style={{cursor:blocked?"not-allowed":"pointer",opacity:blocked?.3:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:50,height:50,borderRadius:"50%",padding:2,background:`linear-gradient(135deg,${av.color},#3A2000,${av.color})`,boxShadow:avatar===i?"0 0 0 2px #FFD700":"none"}}>
                      <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"#1c1508",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{av.emoji}</div>
                    </div>
                    <span style={{fontSize:7,color:"#c8a850",textAlign:"center",fontFamily:"'Cinzel',Georgia,serif"}}>{av.name}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={()=>setSel(false)} style={{width:"100%",padding:9,background:"rgba(200,146,14,.1)",border:"1px solid rgba(200,146,14,.2)",borderRadius:8,color:"#888",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>Cancelar</button>
          </div>
        </div>
      )}
      <h2 style={S.h2}>👤 Tu perfil</h2>
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:320}}>
        <input style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(200,160,80,.18)",borderRadius:8,padding:"12px 14px",color:"#e8d8b0",fontSize:16,outline:"none",fontFamily:"inherit",textAlign:"center"}}
          placeholder="Tu nombre" value={name} onChange={e=>setName(e.target.value)} maxLength={14}
          onKeyDown={e=>e.key==="Enter"&&go()}/>
        <button onClick={()=>setSel(true)} style={{background:"rgba(200,146,14,.08)",border:"1px solid rgba(200,146,14,.25)",borderRadius:12,padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"inherit"}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:avatar!==null?`linear-gradient(135deg,${AVATARS[avatar].color},#3A2000)`:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
            {avatar!==null?AVATARS[avatar].emoji:"?"}
          </div>
          <div style={{textAlign:"left"}}>
            <div style={{color:"#c8a850",fontSize:13,fontFamily:"'Cinzel',Georgia,serif"}}>{avatar!==null?AVATARS[avatar].name:"Elige tu avatar"}</div>
            <div style={{color:"#666",fontSize:11}}>{avatar!==null?AVATARS[avatar].linaje:"Toca para elegir"}</div>
          </div>
        </button>
        {err&&<p style={{color:"#ff7070",fontSize:12,textAlign:"center",margin:0}}>{err}</p>}
        <button style={S.mainBtn} onClick={go}>CONFIRMAR ✦</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  NARRATIVE SCREEN
// ═══════════════════════════════════════════════════════════════
function NarrativeScreen({ onDone, audio }: { onDone:()=>void; audio:any }) {
  const FRASES = [
    "El camino de la sabiduría comienza aquí.",
    "Demuestra lo que sabes.",
    "Solo el sabio avanza.",
    "Piensa antes de responder.",
    "¿Estás listo para la prueba?",
    "Un paso más hacia la cima.",
    "El pergamino se abre... ¡adelante!",
    "La victoria aguarda al que sabe.",
    "El camino es largo. El premio, épico.",
    "El desafío ha comenzado.",
  ];
  const frase = useRef(FRASES[Math.floor(Math.random()*FRASES.length)]);
  const [step,setStep]=useState(0);
  const lines=["El conocimiento será puesto a prueba…","66 casillas aguardan al sabio y al valiente.","Que comience el camino de la sabiduría."];

  useEffect(()=>{
    // 🔔 Dong ancestral al abrir la pantalla
    try { audio.playDong(); } catch(e){}
  },[]);

  useEffect(()=>{
    const t=setTimeout(()=>{
      if(step<lines.length-1) setStep(s=>s+1);
      else setTimeout(onDone,1000);
    },1400);
    return ()=>clearTimeout(t);
  },[step]);

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0d0700",fontFamily:"'Cinzel',Georgia,serif"}}>
      <style>{FONTS}</style>
      <div style={{textAlign:"center",padding:24,maxWidth:500}}>

        {/* Frase motivadora — aparece con efecto phraseGlow */}
        <div style={{
          marginBottom:32,padding:"18px 24px",
          border:"1px solid rgba(200,146,14,.3)",borderRadius:14,
          background:"rgba(200,146,14,.05)",
          animation:"phraseGlow 1.4s ease forwards"
        }}>
          <p style={{
            fontSize:20,fontWeight:"bold",color:"#c8920e",margin:0,
            fontFamily:"'Cinzel Decorative',Georgia,serif",
            letterSpacing:2,lineHeight:1.4,
            textShadow:"0 0 24px rgba(200,146,14,.35)"
          }}>❝ {frase.current} ❞</p>
        </div>

        {/* Línea separadora */}
        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(200,146,14,.35),transparent)",marginBottom:24}}/>

        {/* Líneas narrativas */}
        {lines.map((l,i)=>(
          <p key={i} style={{
            fontSize:i===step?16:13,
            color:i===step?"#c8a850":i<step?"rgba(200,168,80,.35)":"rgba(200,168,80,.07)",
            margin:"10px 0",letterSpacing:2,
            transition:"all .9s ease",fontStyle:"italic"
          }}>{l}</p>
        ))}

        {/* Barra de progreso */}
        <div style={{
          marginTop:24,height:2,
          background:"linear-gradient(90deg,transparent,rgba(200,146,14,.55),transparent)",
          width:`${((step+1)/lines.length)*100}%`,
          transition:"width 1.3s ease",margin:"24px auto 0"
        }}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  QUESTION SCREEN
// ═══════════════════════════════════════════════════════════════
function QuestionScreen({ question, players, hr, onHint, onBuzz, buzzed, qIdx, total, audio, myName, isHost }: any) {
  const isChallenge=question.cat==="Desafío";
  const isTesoro=question.cat==="Tesoro";
  const catInfo=CATS[question.cat as keyof typeof CATS]||CATS.Eventos;
  const pts=isTesoro?TESORO.correct:isChallenge?CHALLENGE.correct:ptsFor(hr);
  const lockTime=isTesoro?4:BUZZ_LOCK; // 4 segundos para Tesoro
  const [timer,setTimer]=useState(TIMER_SEC);
  const [buzzLock,setBuzzLock]=useState(true);
  const [lockCount,setLockCount]=useState(lockTime);
  const [tesoroRevealed,setTesoroRevealed]=useState(false);
  const timerRef=useRef<any>(null);
  const lockRef=useRef<any>(null);
  const isSolo=players.length===1;

  useEffect(()=>{
    setTimer(TIMER_SEC);
    setTesoroRevealed(false);
    setBuzzLock(!isSolo);
    setLockCount(lockTime);
    if(isTesoro) { try { audio.playTesoro(); } catch(e){} }
    if(!isSolo){
      lockRef.current=setInterval(()=>{
        setLockCount(c=>{
          if(c<=1){
            clearInterval(lockRef.current);
            setBuzzLock(false);
            if(isTesoro) setTesoroRevealed(true);
            return 0;
          }
          return c-1;
        });
      },1000);
    }
    timerRef.current=setInterval(()=>{
      setTimer(t=>{
        audio.playTimerTick(t);
        if(t<=1){clearInterval(timerRef.current);onBuzz("__timeout__");return 0;}
        return t-1;
      });
    },1000);
    return ()=>{clearInterval(timerRef.current);clearInterval(lockRef.current);};
  },[buzzed.length,qIdx]);

  const myPlayer=players.find((p:any)=>p.name===myName)||players[0];
  const otherPlayers=players.filter((p:any)=>p.name!==myName);
  const myUsed=buzzed.includes(myPlayer?.name);

  return (
    <div style={{...S.wrap,paddingTop:0,animation:isTesoro?"tesoroFlash 2s ease-in-out infinite":isChallenge?"chalFlash 0.9s infinite":"none",position:"relative"}}>
      {/* Tesoro shimmer particles */}
      {isTesoro&&[...Array(12)].map((_,i)=>(
        <div key={i} style={{position:"fixed",left:`${8+i*7.5}%`,bottom:`${20+Math.random()*30}%`,width:4+Math.random()*4,height:4+Math.random()*4,borderRadius:"50%",background:"#FFD700",opacity:.7,animation:`goldParticle ${1.5+Math.random()*2}s ${Math.random()*2}s ease-out infinite`,pointerEvents:"none",zIndex:0}}/>
      ))}
      <style>{FONTS}</style>
      {/* Progreso */}
      <div style={{width:"100%",maxWidth:440,height:3,background:"rgba(255,255,255,.08)",borderRadius:999,overflow:"hidden",marginBottom:10}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#c8920e,#d4b060)",borderRadius:999,width:`${((qIdx+1)/total)*100}%`,transition:"width .5s ease"}}/>
      </div>
      {/* Categoría */}
      <div style={{alignSelf:"flex-start",borderRadius:999,padding:"5px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:6,background:catInfo.bg,border:`1px solid ${catInfo.color}50`}}>
        <span style={{fontSize:14}}>{catInfo.icon}</span>
        <span style={{fontSize:11,fontWeight:"bold",color:catInfo.color,letterSpacing:1}}>{question.cat}</span>
        <span style={{fontSize:9,color:"#888",marginLeft:4}}>P.{qIdx+1}/{total}</span>
      </div>
      {/* Temporizador */}
      <div style={{width:"100%",maxWidth:440,height:6,background:"rgba(255,255,255,.08)",borderRadius:999,overflow:"hidden",marginBottom:12,position:"relative"}}>
        <div style={{height:"100%",borderRadius:999,background:timer>8?"#6BAD74":timer>4?"#D4B95A":"#D4695A",width:`${(timer/TIMER_SEC)*100}%`,transition:"width 1s linear,background .5s"}}/>
        <span style={{position:"absolute",right:4,top:-1,fontSize:9,color:"#888"}}>{timer}s</span>
      </div>
      {/* Pregunta */}
      <div style={{background:isChallenge?"rgba(255,68,68,0.08)":"rgba(200,160,80,.06)",border:`1px solid ${isChallenge?"rgba(255,68,68,0.3)":"rgba(200,160,80,.18)"}`,borderRadius:14,padding:"16px",marginBottom:12,width:"100%",maxWidth:440}}>
        {isChallenge&&<div style={{fontSize:11,color:"#FF6666",letterSpacing:2,marginBottom:8,fontWeight:"bold"}}>⚡ ¡DESAFÍO! +{CHALLENGE.correct}pts +{STEPS.challengeCorrect} cas. · Error: {CHALLENGE.wrong}pts {STEPS.challengeWrong} cas.</div>}
        <p style={{fontSize:18,fontWeight:"bold",color:isTesoro?"#ffe580":"#e8d8b0",lineHeight:1.4,margin:"0 0 10px",fontFamily:"'Cinzel',Georgia,serif"}}>{question.q.replace("⚡ DESAFÍO: ","").replace("💎 TESORO: ","")}</p>
        {hr>0&&<div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:8}}>
          {question.hints.slice(0,hr).map((h:string,i:number)=>(
            <div key={i} style={{background:"rgba(200,160,50,.08)",border:"1px solid rgba(200,160,50,.18)",borderRadius:8,padding:"6px 10px"}}>
              <span style={{fontSize:9,color:"#d4b060",fontWeight:"bold",letterSpacing:1}}>PISTA {i+1} · </span>
              <span style={{fontSize:12,color:"#e8d8b0"}}>{h}</span>
            </div>
          ))}
        </div>}
        <div style={{display:"flex",gap:16,fontSize:11}}>
          <span>✅ <b style={{color:"#6BAD74"}}>+{pts}pts +1 cas.</b></span>
          <span>❌ <b style={{color:"#D4695A"}}>{POINTS.wrong}pts {STEPS.wrong} cas.</b></span>
        </div>
      </div>
      {/* Pista */}
      {hr<question.hints.length&&<button style={{...S.hintBtn,marginBottom:12}} onClick={onHint}>💡 Pista {hr+1} de {question.hints.length}</button>}

      {/* BUZZ LOCK */}
      {buzzLock&&!isSolo&&(
        <div style={{width:"100%",maxWidth:440,background:isTesoro?"rgba(255,215,0,.08)":"rgba(255,68,68,.07)",border:`1px solid ${isTesoro?"rgba(255,215,0,.4)":"rgba(255,68,68,.25)"}`,borderRadius:12,padding:"12px 14px",textAlign:"center",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:isTesoro?"rgba(255,215,0,.15)":"rgba(255,68,68,.15)",border:`2px solid ${isTesoro?"#FFD700":"#FF6666"}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:isTesoro?"#FFD700":"#FF6666",fontSize:18,fontFamily:"'Cinzel',Georgia,serif",flexShrink:0,animation:isTesoro?"tesoroGlow 1s ease-in-out infinite":"none"}}>{lockCount}</div>
          <div>
            <div style={{color:isTesoro?"#FFD700":"#FF8888",fontSize:13,letterSpacing:2,fontFamily:"'Cinzel',Georgia,serif"}}>{isTesoro?"💎 ¡TESORO! LEÉD BIEN":"🔒 LEÉD LA PREGUNTA"}</div>
            <div style={{fontSize:10,color:isTesoro?"#c8a030":"#555",marginTop:2}}>{isTesoro?`+${TESORO.correct}pts +${TESORO.steps} casillas si acertás`:""} Los botones se habilitan en {lockCount}s</div>
          </div>
        </div>
      )}

      {/* Avatares de otros jugadores (pequeños, decorativos) */}
      {!isSolo&&otherPlayers.length>0&&(
        <div style={{display:"flex",gap:12,marginBottom:10,justifyContent:"center",flexWrap:"wrap"}}>
          {otherPlayers.map((p:any)=>{
            const used=buzzed.includes(p.name);
            return (
              <div key={p.name} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,opacity:used?.15:buzzLock?.4:.55,transition:"opacity .4s"}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:p.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:`2px solid ${p.color}60`}}>
                  {AVATARS[p.avatar]?.emoji||"?"}
                </div>
                <span style={{fontSize:9,color:"#666",fontFamily:"'Cinzel',Georgia,serif"}}>{p.name}</span>
                <span style={{fontSize:8,color:"#444"}}>{p.score}pts</span>
              </div>
            );
          })}
        </div>
      )}

      {/* BOTÓN GRANDE — propio jugador */}
      {myPlayer&&(
        <button
          disabled={buzzLock||myUsed}
          onClick={()=>{if(!buzzLock&&!myUsed){audio.playBuzz();onBuzz(myPlayer.name);}}}
          style={{
            width:"100%",maxWidth:440,padding:isSolo?"18px":"22px 16px",
            background:buzzLock?"rgba(255,255,255,.04)":myUsed?"rgba(255,255,255,.04)":`linear-gradient(160deg,${myPlayer.color}cc,${myPlayer.color}88)`,
            border:buzzLock?"2px solid rgba(255,68,68,.2)":myUsed?"2px solid rgba(255,255,255,.05)":`2px solid ${myPlayer.color}`,
            borderRadius:18,
            cursor:buzzLock||myUsed?"not-allowed":"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:6,
            boxShadow:(!buzzLock&&!myUsed)?`0 0 35px ${myPlayer.color}50,0 4px 20px rgba(0,0,0,.5)`:"0 2px 8px rgba(0,0,0,.3)",
            transition:"all .35s",opacity:myUsed?.25:1,
            fontFamily:"inherit",
            animation:(!buzzLock&&!myUsed)?"btnGlow 2s ease-in-out infinite":"none",
            position:"relative"
          }}>
          {myPlayer.position>=61&&!myUsed&&<div style={{position:"absolute",top:-8,right:-8,fontSize:12,background:"#1a1000",borderRadius:999,padding:"2px 8px",border:"1px solid #FFD700",color:"#FFD700"}}>🏆 CERCA</div>}
          <span style={{fontSize:isSolo?32:44,filter:myUsed?"grayscale(1)":"none",transition:"filter .3s"}}>{AVATARS[myPlayer.avatar]?.emoji||"?"}</span>
          <span style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:isSolo?14:18,fontWeight:"bold",color:buzzLock?"#444":myUsed?"#333":"#fff",letterSpacing:3,textShadow:(!buzzLock&&!myUsed)?"0 0 20px rgba(255,255,255,.3)":"none"}}>
            {isSolo?(myUsed?"RESPONDIDO":"⚡ RESPONDER"):buzzLock?`🔒 ESPERA ${lockCount}s`:myUsed?"YA BUZZASTE":"⚡ RESPONDER"}
          </span>
          <span style={{fontSize:10,color:buzzLock?"#333":myUsed?"#222":"rgba(255,255,255,.6)"}}>
            {myPlayer.name} · {myPlayer.score}pts · Casilla {myPlayer.position}
          </span>
        </button>
      )}
      {!isSolo&&<p style={{color:"#2a2a2a",fontSize:9,marginTop:8,letterSpacing:1,textAlign:"center"}}>⚠ Error: {POINTS.wrong}pts y {STEPS.wrong} casillas · Penalidad alta</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ANSWER SCREEN
// ═══════════════════════════════════════════════════════════════
function AnswerScreen({ question, player, playerObj, hr, onAnswer, audio }: any) {
  const [typed,setTyped]=useState("");
  const [mode,setMode]=useState("opts");
  const [answerTimer,setAnswerTimer]=useState(10);
  const [timedOut,setTimedOut]=useState(false);
  const timerRef=useRef<any>(null);
  const isChallenge=question.cat==="Desafío";
  const isTesoro=question.cat==="Tesoro";
  const pts=isTesoro?TESORO.correct:isChallenge?CHALLENGE.correct:ptsFor(hr);
  const opts = useMemo(()=>
    question.opts
      ? shuffle(question.opts)
      : shuffle([question.a, ...shuffle(DB.filter((q:any)=>q.cat===question.cat&&norm(q.a)!==norm(question.a)).map((q:any)=>q.a)).slice(0,3)])
  , [question.id]);

  useEffect(()=>{
    setAnswerTimer(10);
    setTimedOut(false);
    timerRef.current=setInterval(()=>{
      setAnswerTimer(t=>{
        if(t<=1){
          clearInterval(timerRef.current);
          setTimedOut(true);
          try{ audio.playAnswerTimeout(); }catch(e){}
          // Penalidad por no responder a tiempo
          setTimeout(()=>onAnswer("__timeout__"),1200);
          return 0;
        }
        if(t<=4) try{ audio.playTimerTick(t); }catch(e){}
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[]);
  return (
    <div style={{...S.wrap,paddingTop:16,background:isTesoro?"#0f0e00":isChallenge?"#1a0800":"#17120a"}}>
      <style>{FONTS}</style>
      {isTesoro&&<div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#7a6000,#FFD700,#c8920e,#FFD700,#7a6000)",backgroundSize:"200%",animation:"goldShim 1.5s linear infinite"}}/>}
      {isChallenge&&!isTesoro&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#FF4444,#FF8800,#FF4444)",backgroundSize:"200%",animation:"goldShim 1s linear infinite"}}/>}

      {/* Timer de respuesta */}
      <div style={{width:"100%",maxWidth:440,marginBottom:10}}>
        <div style={{width:"100%",height:8,background:"rgba(255,255,255,.06)",borderRadius:999,overflow:"hidden",position:"relative"}}>
          <div style={{
            height:"100%",borderRadius:999,
            background:answerTimer>6?"#6BAD74":answerTimer>3?"#D4B95A":"#D4695A",
            width:`${(answerTimer/10)*100}%`,
            transition:"width 1s linear,background .5s"
          }}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
          <span style={{fontSize:9,color:"#555",letterSpacing:1}}>TIEMPO PARA RESPONDER</span>
          <span style={{fontSize:11,color:answerTimer<=3?"#D4695A":"#888",fontWeight:"bold"}}>{timedOut?"⏰ ¡TIEMPO!":answerTimer+"s"}</span>
        </div>
      </div>

      {/* Overlay de timeout */}
      {timedOut&&(
        <div style={{position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
          <div style={{fontSize:56,animation:"popIn .3s ease"}}>⏰</div>
          <p style={{color:"#D4695A",fontFamily:"'Cinzel Decorative',Georgia,serif",fontSize:20,letterSpacing:3}}>¡TIEMPO!</p>
          <p style={{color:"#888",fontSize:12}}>{POINTS.wrong}pts {STEPS.wrong} casillas por no responder</p>
        </div>
      )}

      <div style={{borderRadius:999,padding:"9px 22px",fontWeight:"bold",fontSize:15,marginBottom:6,color:isTesoro?"#1a1200":"#fff",background:isTesoro?"#FFD700":playerObj.color,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:20}}>{AVATARS[playerObj.avatar]?.emoji||"?"}</span>
        <span style={{fontFamily:"'Cinzel',Georgia,serif"}}>{player} — {isTesoro?"💎 ¡TESORO!":"¡Respondé!"}</span>
      </div>
      <div style={{fontSize:11,color:isTesoro?"#FFD700":isChallenge?"#FF8888":"#888",marginBottom:12}}>
        {isTesoro?`💎 +${TESORO.correct}pts +${TESORO.steps} casillas · Error: ${TESORO.wrong}pts ${TESORO.stepsWrong} casillas`:
         isChallenge?`⚡ +${CHALLENGE.correct}pts si acertás · Error: ${CHALLENGE.wrong}pts`:
         `✅ Acierto +${pts}pts · ❌ Error ${POINTS.wrong}pts`}
      </div>
      <p style={{fontSize:17,fontWeight:"bold",textAlign:"center",marginBottom:12,maxWidth:440,lineHeight:1.5,color:isTesoro?"#ffe580":"#e8d8b0",fontFamily:"'Cinzel',Georgia,serif"}}>{question.q.replace("⚡ DESAFÍO: ","").replace("💎 TESORO: ","")}</p>
      {hr>0&&<div style={{background:"rgba(210,175,55,.07)",border:"1px solid rgba(210,175,55,.18)",borderRadius:10,padding:"9px 12px",marginBottom:12,width:"100%",maxWidth:440}}>
        {question.hints.slice(0,hr).map((h:string,i:number)=><div key={i} style={{fontSize:12,color:"#c8a850",marginBottom:4}}>💡 {h}</div>)}
      </div>}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {["opts","type"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:"6px 16px",background:mode===m?"rgba(200,160,80,.18)":"rgba(255,255,255,.05)",border:`1px solid ${mode===m?"rgba(200,160,80,.35)":"rgba(255,255,255,.08)"}`,borderRadius:7,color:mode===m?"#c8a850":"#888",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{m==="opts"?"Opciones":"Escribir"}</button>)}
      </div>
      {mode==="opts"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%",maxWidth:440}}>
        {opts.map((o:string,i:number)=><button key={i} style={{background:"rgba(200,160,80,.07)",border:"1px solid rgba(200,160,80,.18)",borderRadius:10,padding:"12px 10px",color:"#e8d8b0",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,textAlign:"left",fontFamily:"inherit"}} onClick={()=>onAnswer(o)}>
          <span style={{background:"rgba(200,160,80,.18)",borderRadius:5,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:11,flexShrink:0,color:"#c8a850"}}>{["A","B","C","D"][i]}</span>{o}
        </button>)}
      </div>}
      {mode==="type"&&<div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:400}}>
        <input style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(200,160,80,.28)",borderRadius:8,padding:"12px 14px",color:"#e8d8b0",fontSize:15,outline:"none",fontFamily:"inherit"}}
          value={typed} onChange={e=>setTyped(e.target.value)} placeholder="Escribe tu respuesta…"
          onKeyDown={e=>e.key==="Enter"&&typed.trim()&&onAnswer(typed.trim())}/>
        <button style={{background:"linear-gradient(135deg,#c8920e,#7a4e08)",border:"none",borderRadius:8,padding:"12px",color:"#fffbe8",fontWeight:"bold",fontSize:14,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>typed.trim()&&onAnswer(typed.trim())}>Responder ➜</button>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RESULT SCREEN
// ═══════════════════════════════════════════════════════════════
function ResultScreen({ correct, player, playerObj, pts, ptsLabel, correctAnswer, newPos, onNext, isChallenge, isTesoro, isHost }: any) {
  return (
    <div style={{...S.wrap,justifyContent:"center"}}>
      <style>{FONTS}</style>
      <div style={{fontSize:58,marginBottom:8,animation:"popIn .4s ease"}}>{correct?"✅":"❌"}</div>
      <h2 style={{fontSize:26,fontWeight:"bold",letterSpacing:3,margin:"0 0 10px",color:correct?"#6BAD74":"#D4695A",fontFamily:"'Cinzel Decorative',Georgia,serif",animation:"slideUp .4s ease"}}>{correct?"¡CORRECTO!":"INCORRECTO"}</h2>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontSize:24}}>{AVATARS[playerObj.avatar]?.emoji||"?"}</span>
        <span style={{color:playerObj.color,fontWeight:"bold",fontSize:15,fontFamily:"'Cinzel',Georgia,serif"}}>{player}</span>
        <span style={{color:"#ddd",fontSize:13}}>{correct?`+${ptsLabel} 🔥`:`${ptsLabel}`}</span>
      </div>
      {isTesoro&&<div style={{fontSize:12,color:correct?"#FFD700":"#888",marginBottom:6,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:1}}>{correct?"💎 ¡TESORO CONQUISTADO! +25pts +2 casillas":"💎 Tesoro perdido..."}</div>}
      {!isTesoro&&isChallenge&&<div style={{fontSize:11,color:correct?"#FF8844":"#888",marginBottom:6}}>{correct?"⚡ ¡Desafío superado!":"⚡ Desafío fallido"}</div>}
      {!correct&&<p style={{fontSize:13,color:"#aaa",marginBottom:12}}>Respuesta: <b style={{color:"#d4b060"}}>{correctAnswer}</b></p>}
      <p style={{fontSize:13,color:"#c8a850",marginBottom:8}}>{correct?`📍 Avanza → Casilla ${newPos}`:`📍 Retrocede → Casilla ${newPos}`}</p>
      {newPos>=61&&<div style={{background:"rgba(255,215,0,.09)",border:"1px solid rgba(255,215,0,.3)",borderRadius:10,padding:"8px 16px",marginBottom:12,textAlign:"center"}}>
        <span style={{color:"#FFD700",fontSize:12,fontFamily:"'Cinzel',Georgia,serif"}}>🏆 ¡{player} está cerca de la meta!</span>
      </div>}
      {isHost?<button style={S.mainBtn} onClick={onNext}>SIGUIENTE ➜</button>:<p style={{color:"#555",fontSize:11}}>Esperando al anfitrión...</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  WIN SCREEN
// ═══════════════════════════════════════════════════════════════
function WinScreen({ winner, players, onRestart }: any) {
  const sorted=[...players].sort((a:any,b:any)=>b.score-a.score);
  const [flash,setFlash]=useState(true);

  useEffect(()=>{
    // Flash effect — multiple pulses
    const t=setTimeout(()=>setFlash(false),2200);
    return ()=>clearTimeout(t);
  },[]);

  return (
    <div style={{...S.wrap,justifyContent:"center",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <style>{FONTS}</style>

      {/* White flash overlay */}
      {flash&&(
        <div style={{
          position:"fixed",inset:0,zIndex:999,pointerEvents:"none",
          animation:"winFlash 2.2s ease-out forwards",
          background:"rgba(255,255,255,0)"
        }}/>
      )}

      {/* Gold particles */}
      {[...Array(20)].map((_,i)=>(
        <div key={i} style={{
          position:"fixed",
          left:`${Math.random()*100}%`,
          bottom:`${Math.random()*40}%`,
          width:6+Math.random()*8,height:6+Math.random()*8,
          borderRadius:"50%",
          background:["#FFD700","#FFF","#c8920e","#fffbe8"][i%4],
          animation:`goldParticle ${1.5+Math.random()*2}s ${Math.random()*1.5}s ease-out infinite`,
          pointerEvents:"none",zIndex:1,opacity:.8
        }}/>
      ))}

      <div style={{fontSize:44,marginBottom:8,animation:"popIn .5s ease"}}>🎆✨🎇</div>
      <span style={{fontSize:64,animation:"popIn .5s ease",filter:"drop-shadow(0 0 20px gold)"}}>{AVATARS[winner.avatar]?.emoji||"?"}</span>
      <h1 style={{fontSize:26,fontWeight:900,color:"#FFD700",margin:"10px 0 4px",fontFamily:"'Cinzel Decorative',Georgia,serif",textShadow:"0 0 40px rgba(255,215,0,.7)",letterSpacing:2,animation:"glowP 2s ease-in-out infinite"}}>¡{winner.name} GANÓ!</h1>
      <p style={{fontSize:12,color:"#c8a850",marginBottom:4,fontStyle:"italic",fontFamily:"'Cinzel',Georgia,serif"}}>"Has recorrido el camino de la sabiduría"</p>
      <p style={{fontSize:10,color:"#888",marginBottom:18}}>🏆 Llegó a la casilla 66</p>
      <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%",maxWidth:320,marginBottom:18,position:"relative",zIndex:2}}>
        {sorted.map((p:any,i:number)=>(
          <div key={p.name} style={{background:i===0?"rgba(255,215,0,.08)":"rgba(255,255,255,.04)",borderRadius:10,padding:"9px 12px",display:"flex",alignItems:"center",gap:10,borderLeft:`4px solid ${i===0?"#FFD700":p.color}`,boxShadow:i===0?"0 0 20px rgba(255,215,0,.2)":"none"}}>
            <span style={{fontSize:17,width:26}}>{["🥇","🥈","🥉"][i]||`#${i+1}`}</span>
            <span style={{fontSize:14}}>{AVATARS[p.avatar]?.emoji||"?"}</span>
            <span style={{flex:1,fontWeight:"bold",fontSize:13,color:i===0?"#FFD700":"#e8d8b0",fontFamily:"'Cinzel',Georgia,serif"}}>{p.name}</span>
            <span style={{color:"#d4b060",fontWeight:"bold",fontSize:13}}>{p.score}pts</span>
          </div>
        ))}
      </div>
      <button style={{...S.mainBtn,position:"relative",zIndex:2}} onClick={onRestart}>🔁 NUEVA PARTIDA</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED STYLES
// ═══════════════════════════════════════════════════════════════
const S: Record<string,any> = {
  wrap:{ position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"18px 14px 28px",background:"#17120a",fontFamily:"'Cinzel',Georgia,serif",color:"#e8d8b0" },
  h2:{ fontFamily:"'Cinzel',Georgia,serif",fontSize:17,color:"#c8a850",margin:"0 0 18px",letterSpacing:2 },
  mainBtn:{ background:"linear-gradient(135deg,#c8920e,#7a4e08)",border:"none",borderRadius:12,padding:"12px 26px",color:"#fffbe8",fontSize:14,fontWeight:"bold",cursor:"pointer",fontFamily:"'Cinzel',Georgia,serif",letterSpacing:2,boxShadow:"0 4px 18px rgba(200,140,30,.25)" },
  secBtn:{ background:"rgba(200,160,80,.07)",border:"1px solid rgba(200,160,80,.18)",borderRadius:10,padding:"9px 18px",color:"#c8a850",cursor:"pointer",fontSize:13,fontFamily:"inherit" },
  modeBtn:{ background:"rgba(200,160,80,.06)",border:"1px solid rgba(200,160,80,.18)",borderRadius:14,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,color:"#e8d8b0",fontFamily:"inherit" },
  hintBtn:{ background:"rgba(210,175,55,.09)",border:"1px solid rgba(210,175,55,.22)",color:"#d4b060",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:13,fontFamily:"inherit",width:"100%",maxWidth:440 },
};

// ═══════════════════════════════════════════════════════════════
//  MAIN APP — Firebase multiplayer logic
// ═══════════════════════════════════════════════════════════════
export default function App() {
  type Screen = "intro"|"lobby"|"register"|"waiting"|"narrative"|"game"|"answer"|"result"|"win";
  const [screen,setScreen]=useState<Screen>("intro");
  const [roomCode,setRoomCode]=useState("");
  const [myName,setMyName]=useState("");
  const [isHost,setIsHost]=useState(false);
  const [isSoloMode,setIsSoloMode]=useState(false);
  const [gameState,setGameState]=useState<any>(null);
  const [showBoard,setShowBoard]=useState(false);
  const [popupPlayer,setPopupPlayer]=useState<any>(null);
  // Solo mode local state
  const [soloPlayers,setSoloPlayers]=useState<any[]>([]);
  const [soloQuestions,setSoloQuestions]=useState<any[]>([]);
  const soloQuestionsRef = useRef<any[]>([]);
  const [soloQIdx,setSoloQIdx]=useState(0);
  const [soloHr,setSoloHr]=useState(0);
  const [soloBuzzed,setSoloBuzzed]=useState<string[]>([]);
  const [soloResult,setSoloResult]=useState<any>(null);
  const roomRef = useRef<any>(null);
  const prevPositions = useRef<Record<string,number>>({});
  const audio = useAudio();

  const isSolo = isSoloMode;

  // Derived state — solo or Firebase
  const players: any[] = isSolo ? soloPlayers : (gameState?.players ? Object.values(gameState.players) : []);
  const questions: any[] = isSolo ? (soloQuestions.length > 0 ? soloQuestions : soloQuestionsRef.current) : (gameState?.questions || []);
  const qIdx: number = isSolo ? soloQIdx : (gameState?.qIdx || 0);
  const hr: number = isSolo ? soloHr : (gameState?.hr || 0);
  const buzzed: string[] = isSolo ? soloBuzzed : (gameState?.buzzed || []);
  const buzzer: string|null = isSolo ? (soloBuzzed.length===0 ? null : null) : (gameState?.buzzer || null);
  const result: any = isSolo ? soloResult : (gameState?.result || null);
  const pending: any[] = gameState?.pending ? Object.values(gameState.pending) : [];
  const cQ = questions[qIdx];

  // Subscribe to room
  useEffect(()=>{
    if(!roomCode) return;
    const rRef = ref(db, `rooms/${roomCode}`);
    roomRef.current = rRef;
    const unsub = onValue(rRef, snap=>{
      const data = snap.val();
      if(!data) return;
      setGameState(data);
      const s = data.screen as Screen;
      // Solo avanzar pantallas del juego — nunca retroceder a waiting desde register
      if(s === "narrative" || s === "game" || s === "answer" || s === "result" || s === "win") {
        setScreen(s);
      }
      // Detect challenge square crossings
      if(data.players){
        Object.values(data.players).forEach((p:any)=>{
          const prev = prevPositions.current[p.name]||1;
          CHALLENGE_SQUARES.forEach(sq=>{
            if(prev<sq && p.position>=sq) audio.playChallengeSquare(sq);
          });
          prevPositions.current[p.name]=p.position;
        });
      }
    });
    return ()=>off(rRef);
  },[roomCode]);

  // HOST: create room
  const handleHost = async () => {
    setIsHost(true);
    setScreen("register");
  };

  // JOIN: join existing room
  const pendingRoomCode = useRef("");

  const handleJoin = async (code:string) => {
    const snap = await get(ref(db,`rooms/${code}`));
    if(!snap.exists()){alert("Sala no encontrada. Verificá el código.");return;}
    // Guardamos el código en un ref pero NO en state todavía
    // para que el listener Firebase no se active antes del registro
    pendingRoomCode.current = code;
    setIsHost(false);
    setScreen("register");
  };

  // Register name + avatar
  const handleRegister = async (name:string, avatar:number) => {
    setMyName(name);
    // SOLO MODE — sin Firebase
    if(isSoloMode) {
      const soloPlayer = { name, avatar, score:0, position:1, color:PLAYER_COLORS[0] };
      const qs = shuffle(DB);
      soloQuestionsRef.current = qs;
      setSoloPlayers([soloPlayer]);
      setSoloQuestions(qs);
      setSoloQIdx(0); setSoloHr(0); setSoloBuzzed([]); setSoloResult(null);
      prevPositions.current = { [name]: 1 };
      audio.startTickTock();
      setScreen("narrative");
      return;
    }
    // Para invitados usar el código pendiente (no está en roomCode todavía)
    let code = isHost ? roomCode : (pendingRoomCode.current || roomCode);
    if(isHost){
      code = genRoomCode();
      let attempts=0;
      while(attempts<10){
        const snap=await get(ref(db,`rooms/${code}`));
        if(!snap.exists()) break;
        code=genRoomCode(); attempts++;
      }
      setRoomCode(code);
      const qs = shuffle(DB);
      await set(ref(db,`rooms/${code}`),{
        screen:"waiting",
        qIdx:0, hr:0,
        buzzed:[], buzzer:null, result:null,
        questions: qs,
        players:{
          [name]:{ name, avatar, score:0, position:1, color:PLAYER_COLORS[0] }
        }
      });
    } else {
      // Invitado: ahora sí seteamos roomCode para activar el listener Firebase
      const snap=await get(ref(db,`rooms/${code}`));
      if(!snap.exists()){alert("Sala no encontrada. Verificá el código.");return;}
      // Verificar nombre duplicado
      const data=snap.val();
      if(data.players && data.players[name]){alert("Ya hay un jugador con ese nombre en la sala.");return;}
      // Subir a pending
      await update(ref(db,`rooms/${code}/pending`),{
        [name]:{ name, avatar }
      });
      // Activar listener DESPUÉS de registrarse
      setRoomCode(code);
      pendingRoomCode.current = "";
    }
    setScreen("waiting");
  };

  // HOST: admitir jugador desde pending a players
  const handleAdmit = async (p: any) => {
    const colorIdx = players.length % PLAYER_COLORS.length;
    await update(ref(db,`rooms/${roomCode}/players`),{
      [p.name]:{ name:p.name, avatar:p.avatar, score:0, position:1, color:PLAYER_COLORS[colorIdx] }
    });
    await update(ref(db,`rooms/${roomCode}/pending`),{ [p.name]: null });
  };

  // HOST: start game
  const handleStart = async () => {
    audio.startTickTock();
    await update(ref(db,`rooms/${roomCode}`),{ screen:"narrative" });
  };

  // After narrative
  const handleNarrativeDone = async () => {
    if(isSolo){ setScreen("game"); return; }
    await update(ref(db,`rooms/${roomCode}`),{ screen:"game" });
  };

  // Buzz
  const handleBuzz = async (name:string) => {
    if(name==="__timeout__"){
      const remaining=players.filter(p=>!buzzed.includes(p.name));
      if(remaining.length<=1){ nextQuestion(); return; }
      if(isSolo){ setSoloBuzzed(b=>[...b,remaining[0].name]); return; }
      await update(ref(db,`rooms/${roomCode}`),{ buzzed:[...buzzed,remaining[0].name] });
      return;
    }
    if(isSolo){ setScreen("answer"); return; }
    await update(ref(db,`rooms/${roomCode}`),{ buzzer:name, screen:"answer" });
  };

  // Answer
  const handleAnswer = async (opt:string) => {
    if(!cQ) return;
    const activeName = isSolo ? myName : buzzer;
    if(!activeName) return;
    // Timeout counts as wrong answer
    const isTimeout = opt === "__timeout__";
    const ok = !isTimeout && norm(opt)===norm(cQ.a);
    const isChallenge=cQ.cat==="Desafío";
    const isTesoro=cQ.cat==="Tesoro";
    const steps=ok
      ? (isTesoro?TESORO.steps : isChallenge?STEPS.challengeCorrect : STEPS.correct)
      : (isTesoro?TESORO.stepsWrong : isChallenge?STEPS.challengeWrong : STEPS.wrong);
    const ptsChange=ok
      ? (isTesoro?TESORO.correct : isChallenge?CHALLENGE.correct : ptsFor(hr))
      : (isTesoro?TESORO.wrong : isChallenge?CHALLENGE.wrong : POINTS.wrong);
    const ptsLabel=`${ok?"+":""}${ptsChange} pts · ${steps>0?"+"+steps:steps} casilla${Math.abs(steps)!==1?"s":""}`;

    const activePlayer=players.find((p:any)=>p.name===activeName)||players[0];
    if(!activePlayer) return;

    const newScore=Math.max(0,activePlayer.score+ptsChange);
    const newPos=Math.min(TOTAL,Math.max(1,activePlayer.position+steps));

    if(ok) audio.playCorrect(); else audio.playWrong();
    audio.playNearEnd(newPos);

    const resultData = { correct:ok, player:activeName, playerAvatar:activePlayer.avatar, playerColor:activePlayer.color, pts:ptsChange, ptsLabel, correctAnswer:cQ.a, newPos, isChallenge, isTesoro };

    if(isSolo){
      setSoloPlayers(prev=>prev.map(p=>p.name===activeName?{...p,score:newScore,position:newPos}:p));
      setSoloResult(resultData);
      setScreen("result");
      if(ok&&newPos>=TOTAL){ setTimeout(()=>{ audio.playVictory(); setScreen("win"); },1500); }
      return;
    }

    const updates: any = {
      [`players/${activeName}/score`]: newScore,
      [`players/${activeName}/position`]: newPos,
      result: resultData,
      screen:"result"
    };
    await update(ref(db,`rooms/${roomCode}`),updates);
    if(ok&&newPos>=TOTAL){
      setTimeout(async()=>{ audio.playVictory(); await update(ref(db,`rooms/${roomCode}`),{screen:"win"}); },1500);
    }
  };

  const nextQuestion = async () => {
    const ni=qIdx+1;
    if(isSolo){
      const totalQ = soloQuestionsRef.current.length || soloQuestions.length;
      if(ni>=totalQ){ setScreen("win"); return; }
      setSoloQIdx(ni); setSoloHr(0); setSoloBuzzed([]); setSoloResult(null);
      setScreen("game"); return;
    }
    if(ni>=questions.length){ await update(ref(db,`rooms/${roomCode}`),{screen:"win"}); return; }
    await update(ref(db,`rooms/${roomCode}`),{ qIdx:ni, hr:0, buzzed:[], buzzer:null, result:null, screen:"game" });
  };

  const addHint = async () => {
    if(!cQ||hr>=cQ.hints.length) return;
    if(isSolo){ setSoloHr(h=>h+1); return; }
    await update(ref(db,`rooms/${roomCode}`),{ hr:hr+1 });
  };

  const handleRestart = async () => {
    audio.stopTickTock();
    setRoomCode(""); setMyName(""); setIsHost(false); setGameState(null);
    setIsSoloMode(false);
    pendingRoomCode.current = "";
    soloQuestionsRef.current = [];
    setSoloPlayers([]); setSoloQuestions([]); setSoloQIdx(0); setSoloHr(0); setSoloBuzzed([]); setSoloResult(null);
    setScreen("intro");
  };

  const winner = players.find(p=>p.position>=TOTAL)||[...players].sort((a,b)=>b.score-a.score)[0];
  const usedAvatars = players.map(p=>p.avatar).filter(a=>a!=null);
  const usedNames = players.map(p=>p.name);

  // Buzzer player object for answer/result screens
  const buzzerObj = buzzer ? players.find(p=>p.name===buzzer)||{avatar:0,color:"#888"} : {avatar:0,color:"#888"};
  const resultPlayerObj = result ? { avatar:result.playerAvatar, color:result.playerColor, name:result.player, position:result.newPos } : null;

  return (
    <div style={{minHeight:"100vh",background:"#17120a",position:"relative",overflowX:"hidden"}}>
      <style>{FONTS}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at 20% 10%,#2a1f10 0%,#17120a 55%),radial-gradient(ellipse at 80% 90%,#0a0d05 0%,transparent 60%)"}}/>

      {/* TOP BAR */}
      {(screen==="game"||screen==="answer"||screen==="result")&&(
        <div style={{position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",gap:8,background:"rgba(23,18,10,.96)",borderBottom:"1px solid rgba(200,160,80,.2)",padding:"7px 12px",backdropFilter:"blur(8px)"}}>
          <span style={{fontFamily:"'Cinzel Decorative',Georgia,serif",fontSize:11,color:"#c8920e",fontWeight:"bold",flex:1,letterSpacing:2,background:"linear-gradient(135deg,#fffbe8,#c8920e)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>📖 BIBLION</span>
          {roomCode&&<span style={{fontSize:9,color:"#555",background:"rgba(200,146,14,.08)",padding:"2px 8px",borderRadius:999,border:"1px solid rgba(200,146,14,.2)"}}>{roomCode}</span>}
          <span style={{fontSize:9,color:"#666"}}>P.{qIdx+1}/{questions.length}</span>
          <button onClick={()=>setShowBoard(b=>!b)} style={{background:"rgba(200,160,80,.1)",border:"1px solid rgba(200,160,80,.25)",color:"#c8a850",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{showBoard?"🃏 Juego":"🏁 Carrera"}</button>
          <button onClick={()=>{if(window.confirm("¿Salir de la partida?")){handleRestart();}}} style={{background:"rgba(255,80,80,.08)",border:"1px solid rgba(255,80,80,.2)",color:"#ff7070",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>↺ Salir</button>
        </div>
      )}

      {/* BOARD OVERLAY */}
      {showBoard&&(screen==="game"||screen==="answer"||screen==="result")&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:"#17120a",overflowY:"auto",padding:"12px 10px 80px"}}>
          <style>{FONTS}</style>
          <p style={{textAlign:"center",fontFamily:"'Cinzel Decorative',Georgia,serif",fontSize:12,color:"#c8920e",letterSpacing:2,marginBottom:8}}>🏁 CARRERA · {roomCode}</p>
          <p style={{textAlign:"center",fontSize:10,color:"#555",marginBottom:10}}>🎺 C13 · 🥁 C26 · 🪘 C39 · 🎵 C52 · ⚡ C60</p>
          <RaceBoard players={players} onPlayerClick={setPopupPlayer}/>
          <button onClick={()=>setShowBoard(false)} style={{display:"block",margin:"14px auto 0",background:"#c8920e",color:"#17120a",border:"none",borderRadius:10,padding:"10px 24px",fontWeight:"bold",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>✕ Cerrar</button>
        </div>
      )}

      {popupPlayer&&<PlayerPopup player={popupPlayer} onClose={()=>setPopupPlayer(null)}/>}

      {screen==="intro"&&<IntroScreen onStart={()=>setScreen("lobby")} onSolo={()=>{setIsSoloMode(true);setIsHost(false);setScreen("register");}} audio={audio}/>}
      {screen==="lobby"&&<LobbyScreen onHost={handleHost} onJoin={handleJoin} onBack={()=>setScreen("intro")}/>}
      {screen==="register"&&<RegisterScreen usedAvatars={usedAvatars} usedNames={usedNames} onDone={handleRegister} audio={audio}/>}
      {screen==="waiting"&&<WaitingRoom roomCode={roomCode} players={players} pending={pending} isHost={isHost} myName={myName} onStart={handleStart} onLeave={handleRestart} onAdmit={handleAdmit}/>}
      {screen==="narrative"&&<NarrativeScreen onDone={handleNarrativeDone} audio={audio}/>}
      {screen==="game"&&cQ&&!showBoard&&(
        <QuestionScreen question={cQ} players={players} hr={hr} onHint={addHint}
          onBuzz={handleBuzz} buzzed={buzzed} qIdx={qIdx} total={questions.length}
          audio={audio} myName={myName} isHost={isHost||isSolo}/>
      )}
      {screen==="answer"&&cQ&&!showBoard&&(isSolo||(buzzer&&myName===buzzer))&&(
        <AnswerScreen question={cQ} player={isSolo?myName:buzzer}
          playerObj={isSolo?players[0]:(buzzer?players.find((p:any)=>p.name===buzzer)||{avatar:0,color:"#888"}:{avatar:0,color:"#888"})}
          hr={hr} onAnswer={handleAnswer} audio={audio}/>
      )}
      {screen==="answer"&&cQ&&!showBoard&&!isSolo&&buzzer&&myName!==buzzer&&(
        <div style={{...S.wrap,justifyContent:"center",textAlign:"center"}}>
          <style>{FONTS}</style>
          <div style={{fontSize:48,marginBottom:16,animation:"spin 2s linear infinite"}}>⏳</div>
          <p style={{color:"#c8a850",fontFamily:"'Cinzel',Georgia,serif",fontSize:16,letterSpacing:2}}>{buzzer} está respondiendo...</p>
        </div>
      )}
      {screen==="result"&&result&&!showBoard&&(
        <ResultScreen correct={result.correct} player={result.player}
          playerObj={{avatar:result.playerAvatar,color:result.playerColor,name:result.player,position:result.newPos}}
          pts={result.pts} ptsLabel={result.ptsLabel} correctAnswer={result.correctAnswer}
          newPos={result.newPos} isChallenge={result.isChallenge} isTesoro={result.isTesoro}
          onNext={nextQuestion} isHost={true}/>
      )}
      {screen==="win"&&winner&&<WinScreen winner={winner} players={players} onRestart={handleRestart}/>}
    </div>
  );
}
