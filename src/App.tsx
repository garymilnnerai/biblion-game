import { useState, useEffect, useRef, useCallback } from "react";
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
};

// ═══════════════════════════════════════════════════════════════
//  BASE DE DATOS DE PREGUNTAS
// ═══════════════════════════════════════════════════════════════
const DB = [
  { id:1,  cat:"Personas", q:"¿Quién fue el primer hombre según Génesis 2?", hints:["Vivió en el jardín del Edén","Fue formado del polvo de la tierra","Su costilla fue usada para crear a la mujer"], a:"Adán" },
  { id:2,  cat:"Personas", q:"¿Quién construyó el arca para salvarse del diluvio?", hints:["Era un hombre justo en su generación","Dios le dio medidas exactas","Entró con su familia y los animales"], a:"Noé" },
  { id:3,  cat:"Personas", q:"¿Quién mató a su hermano Abel según Génesis 4?", hints:["Era agricultor","Dios no aceptó su ofrenda","Su nombre empieza con C"], a:"Caín" },
  { id:4,  cat:"Personas", q:"¿Quién fue el rey más sabio de Israel según 1 Reyes 3?", hints:["Pidió a Dios sabiduría y no riquezas","Construyó el templo de Jerusalén","Era hijo del rey David"], a:"Salomón" },
  { id:5,  cat:"Personas", q:"¿Quién mató al gigante Goliat según 1 Samuel 17?", hints:["Era el menor de los hijos de Isaí","Usó una honda y una piedra","Llegó a ser rey de Israel"], a:"David" },
  { id:6,  cat:"Personas", q:"¿Quién fue tragado por un gran pez según Jonás 1?", hints:["Huyó de Dios en un barco","Estuvo tres días en el vientre del pez","Fue enviado a predicar a Nínive"], a:"Jonás" },
  { id:7,  cat:"Personas", q:"¿Quién fue arrojado al foso de los leones según Daniel 6?", hints:["Era gobernador en Babilonia","Oró tres veces al día","Dios cerró la boca de los leones"], a:"Daniel" },
  { id:8,  cat:"Personas", q:"¿Quién fue vendido como esclavo por sus hermanos según Génesis 37?", hints:["Era el hijo preferido de Jacob","Tenía una túnica de colores","Llegó a ser gobernador de Egipto"], a:"José" },
  { id:9,  cat:"Personas", q:"¿Quién fue la primera mujer según Génesis 2?", hints:["Fue formada de una costilla","Vivió en el jardín del Edén","Su nombre significa madre de todos los vivientes"], a:"Eva" },
  { id:10, cat:"Personas", q:"¿Quién fue el padre de Isaac según Génesis 21?", hints:["Dios le prometió hacerlo padre de muchas naciones","Salió de Ur de los Caldeos","Su nombre fue cambiado de Abram"], a:"Abraham" },
  { id:11, cat:"Personas", q:"¿Quién fue arrebatado al cielo en un carro de fuego según 2 Reyes 2?", hints:["Su sucesor fue Eliseo","Desafió a los profetas de Baal en el Monte Carmelo","Resucitó al hijo de la viuda de Sarepta"], a:"Elías" },
  { id:12, cat:"Personas", q:"¿Quién fue la reina que salvó a su pueblo según Ester 4?", hints:["Su primo Mardoqueo la aconsejó","Dijo: si perezco que perezca","Era reina del rey Asuero de Persia"], a:"Ester" },
  { id:13, cat:"Personas", q:"¿Quién fue la única jueza de Israel mencionada en Jueces 4?", hints:["Animó a Barac a luchar contra Sísara","Era profetisa y juzgaba bajo una palmera","Su nombre significa abeja en hebreo"], a:"Débora" },
  { id:14, cat:"Personas", q:"¿Quién fue el sucesor de Moisés para entrar a la tierra prometida?", hints:["Era de la tribu de Efraín","Fue uno de los 12 espías que dieron buen informe","Su nombre original era Oseas"], a:"Josué" },
  { id:15, cat:"Personas", q:"¿Quién fue el profeta que confrontó al rey David por Urías según 2 Samuel 12?", hints:["Le contó la parábola de la oveja robada","David se arrepintió al escucharle","Su nombre empieza con N"], a:"Natán" },
  { id:16, cat:"Personas", q:"¿Quién fue la mujer moabita que acompañó a su suegra Noemí a Belén?", hints:["Dijo: donde tú mueras moriré yo","Espigó en los campos de Booz","Llegó a ser bisabuela del rey David"], a:"Rut" },
  { id:17, cat:"Personas", q:"¿Quién fue la madre de Samuel que lo dedicó a Dios desde antes de nacer?", hints:["Era estéril y oró con amargura en el tabernáculo","El sacerdote Elí pensó que estaba borracha","Cuando Samuel nació lo llevó al tabernáculo en Silo"], a:"Ana" },
  { id:18, cat:"Personas", q:"¿Quién fue el primer mártir cristiano mencionado en Hechos 7?", hints:["Era uno de los siete diáconos","Fue apedreado por el Sanedrín","Saulo cuidaba las ropas de los que lo apedreaban"], a:"Esteban" },
  { id:19, cat:"Personas", q:"¿Quién negó a Jesús tres veces según Mateo 26?", hints:["Era uno de los 12 apóstoles","Jesús le había dicho que esto pasaría","Era pescador del Mar de Galilea"], a:"Pedro" },
  { id:20, cat:"Personas", q:"¿Quién traicionó a Jesús por 30 monedas de plata según Mateo 26?", hints:["Era uno de los 12 apóstoles","Lo identificó con un beso en el huerto","Luego se arrepintió y devolvió el dinero"], a:"Judas Iscariote" },
  { id:21, cat:"Lugares", q:"¿En qué jardín vivieron Adán y Eva según Génesis 2?", hints:["Dios lo plantó en el oriente","Tenía un árbol del bien y del mal","Fue custodiado por querubines al salir"], a:"Edén" },
  { id:22, cat:"Lugares", q:"¿En qué monte recibió Moisés los mandamientos según Éxodo 19?", hints:["También se llama Horeb","Está en la península del Sinaí","Dios habló desde una nube densa sobre él"], a:"Monte Sinaí" },
  { id:23, cat:"Lugares", q:"¿Qué mar dividió Moisés con su vara según Éxodo 14?", hints:["El ejército de Faraón fue ahogado en él","Está entre África y Arabia","Israel cruzó en seco"], a:"Mar Rojo" },
  { id:24, cat:"Lugares", q:"¿En qué ciudad fue construida la Torre de Babel según Génesis 11?", hints:["Estaba en la tierra de Sinar","Nabucodonosor la hizo grande después","Está en el actual Iraq"], a:"Babilonia" },
  { id:25, cat:"Lugares", q:"¿En qué ciudad nació Jesús según Lucas 2?", hints:["José y María viajaron allí para el censo","Era la ciudad de David","Estaba en Judea al sur de Jerusalén"], a:"Belén" },
  { id:26, cat:"Lugares", q:"¿En qué lugar fue arrestado Jesús según Juan 18?", hints:["Era un huerto al pie del Monte de los Olivos","Allí oró antes de ser arrestado","Su nombre significa prensa de aceite"], a:"Getsemaní" },
  { id:27, cat:"Lugares", q:"¿En qué lugar fue crucificado Jesús según Juan 19?", hints:["Significa lugar de la calavera en hebreo","También se conoce como Calvario en latín","Estaba fuera de las murallas de Jerusalén"], a:"Gólgota" },
  { id:28, cat:"Lugares", q:"¿En qué ciudad de Macedonia fundó Pablo una iglesia según Hechos 16?", hints:["Allí bautizó a Lidia vendedora de púrpura","Pablo y Silas fueron encarcelados allí","Un terremoto abrió las puertas de la cárcel"], a:"Filipos" },
  { id:29, cat:"Lugares", q:"¿En qué ciudad de Grecia predicó Pablo en el Areópago según Hechos 17?", hints:["Mencionó al Dios no conocido","Algunos se burlaron cuando habló de la resurrección","Era la ciudad de los filósofos griegos"], a:"Atenas" },
  { id:30, cat:"Lugares", q:"¿En qué isla quedó varado Pablo después de un naufragio según Hechos 28?", hints:["Los nativos mostraron mucha humanidad","Una víbora se prendió en la mano de Pablo","Pablo sanó al padre del hombre principal de la isla"], a:"Malta" },
  { id:31, cat:"Números", q:"¿Cuántos mandamientos recibió Moisés en el Sinaí según Éxodo 20?", hints:["Escritos en dos tablas de piedra","Corresponden a los dedos de dos manos","Están en Éxodo 20"], a:"10 mandamientos" },
  { id:32, cat:"Números", q:"¿Cuántos días duró la lluvia del diluvio según Génesis 7?", hints:["Es un número muy simbólico en la Biblia","Moisés ayunó este número de días","Es múltiplo de 8 y de 5"], a:"40 días y 40 noches" },
  { id:33, cat:"Números", q:"¿Cuántos años estuvo Israel en el desierto según Números 14?", hints:["Un año por cada día que los espías exploraron","Los espías exploraron 40 días","El número es el mismo que los días de lluvia"], a:"40 años" },
  { id:34, cat:"Números", q:"¿Cuántos hijos tuvo Jacob según Génesis?", hints:["Formaron las tribus de Israel","Uno fue vendido como esclavo","El número es igual al de los apóstoles de Jesús"], a:"12 hijos" },
  { id:35, cat:"Números", q:"¿Cuántos años vivió Matusalén según Génesis 5?", hints:["Es el hombre más longevo de la Biblia","Vivió más de 900 años","Su nombre es sinónimo de vejez extrema"], a:"969 años" },
  { id:36, cat:"Números", q:"¿Cuántos apóstoles eligió Jesús según Lucas 6?", hints:["El número corresponde a las tribus de Israel","Uno lo traicionó","Son una docena"], a:"12 apóstoles" },
  { id:37, cat:"Números", q:"¿Cuántos días estuvo Jesús siendo tentado en el desierto según Mateo 4?", hints:["Ayunó todo ese tiempo","Satanás lo tentó tres veces","El número es 40"], a:"40 días" },
  { id:38, cat:"Números", q:"¿Cuántos libros tiene el Nuevo Testamento?", hints:["Comienzan con los cuatro evangelios","Terminan con el Apocalipsis","El número es 27"], a:"27 libros" },
  { id:39, cat:"Números", q:"¿Cuántas tinajas de piedra llenó Jesús en la boda de Caná según Juan 2?", hints:["Cada una cabía entre dos y tres cántaros","Los criados las llenaron hasta arriba","El número de tinajas era 6"], a:"6 tinajas de piedra" },
  { id:40, cat:"Números", q:"¿Cuántos peces pescaron los discípulos en la pesca milagrosa según Juan 21?", hints:["Jesús les dijo que echaran la red al lado derecho","No podían sacar la red por la cantidad","El número exacto es 153"], a:"153 peces" },
  { id:41, cat:"Animales", q:"¿Qué animal tentó a Eva en el jardín del Edén según Génesis 3?", hints:["Dios lo maldijo por encima de todos los animales","Era el más astuto de los animales del campo","Le habló a Eva sobre el árbol prohibido"], a:"La serpiente" },
  { id:42, cat:"Animales", q:"¿Qué animal habló con Balaam según Números 22?", hints:["Dios le abrió la boca para hablar","Vio al ángel del Señor antes que su amo","Era el animal que Balaam montaba"], a:"La asna de Balaam" },
  { id:43, cat:"Animales", q:"¿En qué tipo de animal entró Jesús a Jerusalén según Mateo 21?", hints:["Era un animal humilde","Se cumplió una profecía de Zacarías","Es un animal de carga muy paciente"], a:"Un asno" },
  { id:44, cat:"Animales", q:"¿En qué forma descendió el Espíritu Santo cuando Jesús fue bautizado según Mateo 3?", hints:["Era una señal visible del cielo","El Padre habló en ese momento","Era un ave símbolo de paz"], a:"Como una paloma" },
  { id:45, cat:"Animales", q:"¿En qué animales entraron los demonios llamados Legión según Marcos 5?", hints:["Los demonios pedían no ser enviados al abismo","Se lanzaron por un precipicio al mar","Eran animales que Israel no comía"], a:"Cerdos" },
  { id:46, cat:"Plantas", q:"¿Desde qué tipo de planta habló Dios a Moisés según Éxodo 3?", hints:["Ardía y no se consumía","Dios habló desde ella","Estaba en el monte Horeb"], a:"La zarza ardiente" },
  { id:47, cat:"Plantas", q:"¿Qué árbol subió Zaqueo para ver a Jesús según Lucas 19?", hints:["Era un árbol de hoja perenne","Su nombre en latín es Ficus sycomorus","Zaqueo era bajo de estatura"], a:"El sicómoro" },
  { id:48, cat:"Plantas", q:"¿En qué tipo de planta comparó Jesús el reino de los cielos según Mateo 13?", hints:["Es la más pequeña de las semillas","Cuando crece se hace un árbol grande","Los pájaros hacen nidos en sus ramas"], a:"La semilla de mostaza" },
  { id:49, cat:"Plantas", q:"¿Qué árbol usó Elías para descansar cuando huyó de Jezabel según 1 Reyes 19?", hints:["Se sentó bajo su sombra y pidió morir","Un ángel lo tocó y le dio de comer","Es un árbol del desierto"], a:"Un enebro" },
  { id:50, cat:"Plantas", q:"¿Qué pasó con la higuera que Jesús maldijo según Mateo 21?", hints:["No tenía frutos aunque tenía hojas","Jesús la maldijo al no encontrar fruto","Al día siguiente estaba completamente seca"], a:"Se secó desde las raíces" },
  { id:51, cat:"Objetos", q:"¿Qué contenía el Arca del Pacto según Hebreos 9?", hints:["Tres objetos sagrados estaban dentro","Uno era la vara que floreció","Otro era el maná guardado"], a:"Las tablas de la ley, la vara de Aarón y el maná" },
  { id:52, cat:"Objetos", q:"¿Con qué arma mató David al gigante Goliat según 1 Samuel 17?", hints:["No usó espada ni lanza","Usó un arma simple de pastor","Una piedra y un instrumento de cuero"], a:"Honda y una piedra" },
  { id:53, cat:"Objetos", q:"¿Qué objeto hizo Moisés para que los israelitas picados vivieran según Números 21?", hints:["Dios le ordenó ponerlo en un asta","Quien miraba a este objeto quedaba vivo","Jesús lo menciona en Juan 3 como figura de sí mismo"], a:"Una serpiente de bronce" },
  { id:54, cat:"Objetos", q:"¿Cuántos brazos tenía el candelero de oro del tabernáculo según Éxodo 25?", hints:["Iluminaba el lugar santo del tabernáculo","Soy símbolo del Estado de Israel hoy","El número de brazos era 7"], a:"7 brazos (el menorá)" },
  { id:55, cat:"Objetos", q:"¿Qué tipo de armadura espiritual menciona Pablo en Efesios 6?", hints:["Incluye el cinturón de la verdad","Incluye el escudo de la fe","Termina con la espada del Espíritu que es la Palabra"], a:"Cinturón, coraza, calzado, escudo, yelmo y espada" },
  { id:56, cat:"Eventos", q:"¿Cuántas plagas envió Dios sobre Egipto según Éxodo?", hints:["La última fue la muerte de los primogénitos","La primera fue el agua en sangre","El número es igual a los dedos de dos manos"], a:"10 plagas" },
  { id:57, cat:"Eventos", q:"¿Qué ocurrió cuando Josué marchó alrededor de Jericó según Josué 6?", hints:["Marcharon durante 7 días","El séptimo día marcharon 7 veces","Al sonar las trompetas y gritar el pueblo los muros cayeron"], a:"Los muros de Jericó cayeron" },
  { id:58, cat:"Eventos", q:"¿Qué ocurrió 50 días después de la Pascua según Hechos 2?", hints:["Los discípulos estaban reunidos en un lugar","El Espíritu Santo descendió como lenguas de fuego","Pedro predicó y 3,000 personas se convirtieron"], a:"Pentecostés: el Espíritu Santo descendió" },
  { id:59, cat:"Eventos", q:"¿Qué dijo la voz del cielo cuando Jesús fue bautizado según Mateo 3?", hints:["El Espíritu Santo bajó como paloma","El Padre habló desde el cielo","Dijo: este es mi Hijo amado en quien tengo complacencia"], a:"Este es mi Hijo amado en quien tengo complacencia" },
  { id:60, cat:"Eventos", q:"¿Qué ocurrió en el templo cuando Jesús murió según Mateo 27?", hints:["Un objeto en el templo se rasgó en dos","Era de arriba abajo","Era el velo del santuario"], a:"El velo del templo se rasgó de arriba abajo" },
  { id:61, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años vivió Matusalén según Génesis 5?", hints:["Es el hombre más longevo de la Biblia","Vivió más de 900 años","El número exacto es 969"], a:"969 años" },
  { id:62, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos peces pescaron los discípulos en Juan 21?", hints:["Jesús les dijo que echaran la red al lado derecho","No podían sacar la red por la cantidad","El número exacto es 153"], a:"153 peces" },
  { id:63, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto tiempo duró la sequía de Elías según Santiago 5?", hints:["Santiago lo menciona como ejemplo de oración eficaz","Elías era un hombre como nosotros","Duró tres años y seis meses"], a:"3 años y 6 meses" },
  { id:64, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años tenía Caleb cuando pidió la tierra de Hebrón según Josué 14?", hints:["Tenía 40 años cuando fue espía","Habían pasado 45 años desde entonces","Tenía 85 años cuando pidió la montaña"], a:"85 años" },
  { id:65, cat:"Desafío", q:"⚡ DESAFÍO: ¿En qué versículo dice: Todo lo puedo en Cristo que me fortalece?", hints:["Está en la carta a los Filipenses","El capítulo es el 4","El versículo es el 13"], a:"Filipenses 4:13" },
  { id:66, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años tardó Salomón en construir su palacio según 1 Reyes 7?", hints:["Tardó más en construir su palacio que el templo","El templo tardó 7 años","Su palacio tardó 13 años"], a:"13 años" },
  { id:67, cat:"Personas", q:"¿Quién era el fariseo que visitó a Jesús de noche según Juan 3?", hints:["Era principal entre los judíos","Jesús le habló del nuevo nacimiento","Después defendió a Jesús en el Sanedrín"], a:"Nicodemo" },
  { id:68, cat:"Personas", q:"¿Quién era el recaudador de impuestos que subió a un árbol para ver a Jesús según Lucas 19?", hints:["Era bajo de estatura","Subió a un sicómoro","Jesús fue a su casa ese día"], a:"Zaqueo" },
  { id:69, cat:"Personas", q:"¿Quién acompañó a Pablo en su primer viaje misionero según Hechos 13?", hints:["Era primo de Marcos","Su nombre original era José","El nombre significa hijo de consolación"], a:"Bernabé" },
  { id:70, cat:"Personas", q:"¿Quién fue el discípulo que reemplazó a Judas Iscariote según Hechos 1?", hints:["La elección fue entre dos candidatos","Echaron suertes","El otro candidato se llamaba José Barsabás"], a:"Matías" },
  { id:71, cat:"Lugares", q:"¿En qué río fue encontrado el bebé Moisés según Éxodo 2?", hints:["Su madre lo puso en una cesta de juncos","La hija del Faraón lo encontró al bañarse","Era el río más importante de Egipto"], a:"El río Nilo" },
  { id:72, cat:"Lugares", q:"¿En qué ciudad reinó David los primeros 7 años según 2 Samuel 2?", hints:["Antes de trasladar su reinado a Jerusalén","Estaba en el territorio de Judá","Allí fue ungido rey de Judá"], a:"Hebrón" },
  { id:73, cat:"Lugares", q:"¿En qué ciudad predicó Jonás el arrepentimiento según Jonás 3?", hints:["Era la ciudad capital del Imperio Asirio","Tenía una extensión de tres días de camino","Todo el pueblo ayunó desde el rey hasta los animales"], a:"Nínive" },
  { id:74, cat:"Lugares", q:"¿En qué lugar fue llamado Moisés por primera vez según Éxodo 3?", hints:["Estaba pastoreando el rebaño de su suegro","Vio una zarza que ardía y no se consumía","Dios le habló desde allí"], a:"Monte Horeb (Sinaí)" },
  { id:75, cat:"Lugares", q:"¿En qué ciudad nació el rey David según 1 Samuel 17?", hints:["También fue el lugar del nacimiento de Jesús","Era en Judea","Su nombre significa casa de pan"], a:"Belén" },
  { id:76, cat:"Números", q:"¿Cuántos profetas de Baal desafió Elías en el Monte Carmelo según 1 Reyes 18?", hints:["También había 400 profetas de Asera","Elías estaba solo frente a todos ellos","El número de profetas de Baal era 450"], a:"450 profetas de Baal" },
  { id:77, cat:"Números", q:"¿Cuántos años tenía Abraham cuando nació Isaac según Génesis 21?", hints:["Sara tenía 90 años","Era humanamente imposible","El número es cien"], a:"100 años" },
  { id:78, cat:"Números", q:"¿Cuántos capítulos tiene el libro de los Salmos?", hints:["Es el libro más largo de la Biblia","El capítulo 119 es el más largo","El número de capítulos es 150"], a:"150 capítulos" },
  { id:79, cat:"Números", q:"¿Cuántos libros tiene la Biblia en total?", hints:["Se dividen en Antiguo y Nuevo Testamento","El AT tiene 39 y el NT tiene 27","El número total es 66"], a:"66 libros" },
  { id:80, cat:"Números", q:"¿Cuántos demonios expulsó Jesús de María Magdalena según Lucas 8?", hints:["Era una mujer de Magdala","Seguía a Jesús y le servía","El número de demonios era 7"], a:"7 demonios" },
  { id:81, cat:"Animales", q:"¿Qué tipo de aves le enviaba Dios a Elías con comida según 1 Reyes 17?", hints:["Le traían pan y carne por la mañana y por la tarde","El arroyo se llamaba Querit","Eran aves negras"], a:"Cuervos" },
  { id:82, cat:"Animales", q:"¿Qué tipo de animales usó Sansón para incendiar los campos de los filisteos según Jueces 15?", hints:["Capturó 300 de ellos","Les ató antorchas en las colas","Las soltó en los sembradíos"], a:"Zorras (o chacales)" },
  { id:83, cat:"Plantas", q:"¿De qué árbol tomaron hojas Adán y Eva para cubrirse según Génesis 3?", hints:["Usaron sus hojas para hacerse delantales","Es un árbol de fruta conocida","Sus hojas son grandes y anchas"], a:"La higuera" },
  { id:84, cat:"Plantas", q:"¿Con qué planta protegió Dios a Jonás del sol según Jonás 4?", hints:["Creció en una noche sobre Jonás","Jonás se alegró mucho por ella","Al día siguiente Dios preparó un gusano que la atacó"], a:"Una calabacera o planta enredadera" },
  { id:85, cat:"Objetos", q:"¿Con qué objeto mató Jael al general Sísara según Jueces 4?", hints:["Era un instrumento de construcción","Lo clavó en la sien de Sísara mientras dormía","Era una estaca de tienda de campaña"], a:"Una estaca de tienda y un mazo" },
  { id:86, cat:"Objetos", q:"¿Qué instrumento musical usó María para celebrar el cruce del Mar Rojo según Éxodo 15?", hints:["Era un instrumento de percusión","María tomó este instrumento y dirigió a las mujeres","Es un instrumento que se toca con las manos"], a:"La pandereta" },
  { id:87, cat:"Eventos", q:"¿Qué ocurrió con los tres amigos de Daniel en el horno de fuego según Daniel 3?", hints:["El rey lo había calentado siete veces más","El rey vio a un cuarto personaje en el horno","Salieron sin que su ropa oliera a humo"], a:"Salieron ilesos y sin olor a humo" },
  { id:88, cat:"Eventos", q:"¿Qué sucedió con el sol cuando Josué peleó contra los amorreos según Josué 10?", hints:["Josué habló al sol y a la luna","No hubo día semejante antes ni después","El sol se detuvo en medio del cielo"], a:"El sol se detuvo" },
  { id:89, cat:"Eventos", q:"¿Qué pasó cuando Pablo y Silas oraban en la cárcel de Filipos según Hechos 16?", hints:["Era a medianoche","Cantaban himnos y los presos los escuchaban","Un terremoto abrió las puertas y soltó las cadenas"], a:"Un terremoto sacudió la cárcel y las puertas se abrieron" },
  { id:90, cat:"Eventos", q:"¿Qué ocurrió en la Transfiguración de Jesús según Mateo 17?", hints:["Ocurrió en un monte alto","Su rostro resplandeció como el sol","Aparecieron Moisés y Elías hablando con él"], a:"Jesús se transfiguró: su rostro brilló y aparecieron Moisés y Elías" },
  { id:91, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuántos años vivió Abraham según Génesis 25?", hints:["Tuvo a Isaac cuando tenía 100 años","Murió en buena vejez","Vivió 175 años"], a:"175 años" },
  { id:92, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto tiempo duró la sequía anunciada por Elías según Santiago 5:17?", hints:["Santiago lo menciona como ejemplo de oración eficaz","Elías era un hombre como nosotros","Duró tres años y seis meses"], a:"3 años y 6 meses" },
  { id:93, cat:"Personas", q:"¿Quién fue el primer rey de Israel según 1 Samuel 10?", hints:["Era de la tribu de Benjamín","Medía más de dos metros","Samuel lo ungió como rey"], a:"Saúl" },
  { id:94, cat:"Personas", q:"¿Quién fue el hermano mayor de Moisés según Éxodo 4?", hints:["Fue el primer sumo sacerdote de Israel","Habló por Moisés ante el Faraón","Su vara floreció milagrosamente"], a:"Aarón" },
  { id:95, cat:"Personas", q:"¿Quién luchó con un ángel toda la noche según Génesis 32?", hints:["Era nieto de Abraham","Al final Dios le cambió el nombre","Su nuevo nombre significa el que lucha con Dios"], a:"Jacob" },
  { id:96, cat:"Lugares", q:"¿En qué lugar Jacob vio la escalera que llegaba al cielo según Génesis 28?", hints:["Iba de viaje a Mesopotamia","Puso una piedra como almohada para dormir","Llamó a ese lugar Betel que significa casa de Dios"], a:"Luz (luego llamada Betel)" },
  { id:97, cat:"Números", q:"¿Cuántos años reinó David según 2 Samuel 5?", hints:["Reinó 7 años en Hebrón primero","Luego reinó 33 años en Jerusalén","En total reinó 40 años"], a:"40 años en total" },
  { id:98, cat:"Eventos", q:"¿Qué señal puso Dios en el cielo después del diluvio según Génesis 9?", hints:["Era una señal del pacto entre Dios y Noé","Aparece cuando llueve","Tiene varios colores"], a:"El arcoíris" },
  { id:99, cat:"Eventos", q:"¿Qué hizo Jesús en la boda de Caná según Juan 2?", hints:["Era su primer milagro","María le dijo a los sirvientes que hicieran lo que él dijera","Convirtió el agua en otra bebida"], a:"Convirtió el agua en vino" },
  { id:100, cat:"Desafío", q:"⚡ DESAFÍO: ¿Cuánto tiempo profetizó la mujer en el desierto según Apocalipsis 12?", hints:["La mujer huyó al desierto","Fue alimentada allí","El tiempo fue 1260 días"], a:"1260 días" },
];

// ═══════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════
const POINTS    = { direct:5, h1:3, h2:2, h3:1, wrong:-2 };
const CHALLENGE = { correct:6, wrong:-3 };
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

  return { startTickTock, stopTickTock, playChallengeSquare, playAvatarSelect, playConfirm, playCorrect, playWrong, playBuzz, playVictory, playNearEnd, playTimerTick };
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
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
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
function IntroScreen({ onStart, onSolo }: { onStart:()=>void; onSolo:()=>void }) {
  const [p,setP]=useState(0);
  useEffect(()=>{ const t=[150,900,1700,2500].map((ms,i)=>setTimeout(()=>setP(i+1),ms)); return ()=>t.forEach(clearTimeout); },[]);
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
function WaitingRoom({ roomCode, players, isHost, myName, onStart, onLeave }: any) {
  const share=()=>{
    const msg=`¡Únete a BIBLION! Código de sala: ${roomCode}\n${window.location.href}`;
    if(navigator.clipboard) navigator.clipboard.writeText(msg).then(()=>alert("¡Mensaje copiado para WhatsApp! 📱"));
  };
  return (
    <div style={S.wrap}>
      <style>{FONTS}</style>
      <h2 style={S.h2}>🏠 Sala de espera</h2>
      {/* Room code */}
      <div style={{background:"rgba(200,146,14,.08)",border:"2px solid rgba(200,146,14,.4)",borderRadius:16,padding:"20px 32px",marginBottom:20,textAlign:"center"}}>
        <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:8}}>CÓDIGO DE SALA</div>
        <div style={{fontFamily:"'Cinzel Decorative',Georgia,serif",fontSize:40,color:"#FFD700",letterSpacing:12,animation:"codePulse 2s ease-in-out infinite"}}>{roomCode}</div>
        <div style={{fontSize:10,color:"#666",marginTop:8}}>Compartí este código con tus jugadores</div>
      </div>
      <button onClick={share} style={{...S.secBtn,marginBottom:20,display:"flex",alignItems:"center",gap:8,fontSize:12}}>
        📱 Copiar código para WhatsApp
      </button>
      {/* Players list */}
      <div style={{width:"100%",maxWidth:380,marginBottom:20}}>
        <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:10,textAlign:"center"}}>JUGADORES EN SALA ({players.length})</div>
        {players.map((p:any,i:number)=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 14px",marginBottom:6,border:p.name===myName?"1px solid rgba(200,146,14,.4)":"1px solid transparent"}}>
            <span style={{fontSize:22}}>{AVATARS[p.avatar]?.emoji||"?"}</span>
            <span style={{flex:1,color:"#e8d8b0",fontFamily:"'Cinzel',Georgia,serif",fontSize:13}}>{p.name}</span>
            {p.name===myName&&<span style={{fontSize:10,color:"#c8920e",background:"rgba(200,146,14,.15)",borderRadius:999,padding:"2px 8px"}}>Tú</span>}
            {i===0&&<span style={{fontSize:10,color:"#888",background:"rgba(255,255,255,.06)",borderRadius:999,padding:"2px 8px"}}>Anfitrión</span>}
          </div>
        ))}
        {players.length<2&&<p style={{textAlign:"center",color:"#555",fontSize:11,marginTop:8}}>Esperando más jugadores...</p>}
      </div>
      <div style={{display:"flex",gap:10}}>
        {isHost&&players.length>=2&&<button style={S.mainBtn} onClick={onStart}>⚡ INICIAR JUEGO</button>}
        {isHost&&players.length<2&&<button style={{...S.mainBtn,opacity:.5,cursor:"not-allowed"}} disabled>Esperando jugadores...</button>}
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
function NarrativeScreen({ onDone }: { onDone:()=>void }) {
  const [step,setStep]=useState(0);
  const lines=["El conocimiento será puesto a prueba…","66 casillas aguardan al sabio y al valiente.","Que comience el camino de la sabiduría."];
  useEffect(()=>{ const t=setTimeout(()=>{ if(step<lines.length-1) setStep(s=>s+1); else setTimeout(onDone,1000); },1300); return ()=>clearTimeout(t); },[step]);
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0d0700",fontFamily:"'Cinzel',Georgia,serif"}}>
      <style>{FONTS}</style>
      <div style={{textAlign:"center",padding:24}}>
        {lines.map((l,i)=>(
          <p key={i} style={{fontSize:i===step?18:14,color:i===step?"#c8a850":i<step?"rgba(200,168,80,.4)":"rgba(200,168,80,.1)",margin:"10px 0",letterSpacing:2,transition:"all .8s ease",fontStyle:"italic"}}>{l}</p>
        ))}
        <div style={{marginTop:32,height:2,background:"linear-gradient(90deg,transparent,rgba(200,146,14,.5),transparent)",width:`${((step+1)/lines.length)*100}%`,transition:"width 1.2s ease",margin:"32px auto 0"}}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  QUESTION SCREEN
// ═══════════════════════════════════════════════════════════════
function QuestionScreen({ question, players, hr, onHint, onBuzz, buzzed, qIdx, total, audio, myName, isHost }: any) {
  const isChallenge=question.cat==="Desafío";
  const catInfo=CATS[question.cat as keyof typeof CATS]||CATS.Eventos;
  const pts=isChallenge?CHALLENGE.correct:ptsFor(hr);
  const [timer,setTimer]=useState(TIMER_SEC);
  const timerRef=useRef<any>(null);

  useEffect(()=>{
    setTimer(TIMER_SEC);
    timerRef.current=setInterval(()=>{
      setTimer(t=>{
        audio.playTimerTick(t);
        if(t<=1){clearInterval(timerRef.current);onBuzz("__timeout__");return 0;}
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[buzzed.length, qIdx]);

  return (
    <div style={{...S.wrap,paddingTop:0,animation:isChallenge?"chalFlash 0.9s infinite":"none"}}>
      <style>{FONTS}</style>
      <div style={{width:"100%",maxWidth:440,height:3,background:"rgba(255,255,255,.08)",borderRadius:999,overflow:"hidden",marginBottom:10}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#c8920e,#d4b060)",borderRadius:999,width:`${((qIdx+1)/total)*100}%`,transition:"width .5s ease"}}/>
      </div>
      <div style={{alignSelf:"flex-start",borderRadius:999,padding:"5px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:6,background:catInfo.bg,border:`1px solid ${catInfo.color}50`}}>
        <span style={{fontSize:14}}>{catInfo.icon}</span>
        <span style={{fontSize:11,fontWeight:"bold",color:catInfo.color,letterSpacing:1}}>{question.cat}</span>
        <span style={{fontSize:9,color:"#888",marginLeft:4}}>P.{qIdx+1}/{total}</span>
      </div>
      <div style={{width:"100%",maxWidth:440,height:6,background:"rgba(255,255,255,.08)",borderRadius:999,overflow:"hidden",marginBottom:12,position:"relative"}}>
        <div style={{height:"100%",borderRadius:999,background:timer>8?"#6BAD74":timer>4?"#D4B95A":"#D4695A",width:`${(timer/TIMER_SEC)*100}%`,transition:"width 1s linear,background .5s"}}/>
        <span style={{position:"absolute",right:4,top:-1,fontSize:9,color:"#888"}}>{timer}s</span>
      </div>
      <div style={{background:isChallenge?"rgba(255,68,68,0.08)":"rgba(200,160,80,.06)",border:`1px solid ${isChallenge?"rgba(255,68,68,0.3)":"rgba(200,160,80,.18)"}`,borderRadius:14,padding:"16px",marginBottom:12,width:"100%",maxWidth:440}}>
        {isChallenge&&<div style={{fontSize:11,color:"#FF6666",letterSpacing:2,marginBottom:8,fontWeight:"bold"}}>⚡ ¡DESAFÍO! Correcto +{CHALLENGE.correct} casillas · Error {CHALLENGE.wrong} casillas</div>}
        <p style={{fontSize:18,fontWeight:"bold",color:"#e8d8b0",lineHeight:1.4,margin:"0 0 10px",fontFamily:"'Cinzel',Georgia,serif"}}>{question.q.replace("⚡ DESAFÍO: ","")}</p>
        {hr>0&&<div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:8}}>
          {question.hints.slice(0,hr).map((h:string,i:number)=>(
            <div key={i} style={{background:"rgba(200,160,50,.08)",border:"1px solid rgba(200,160,50,.18)",borderRadius:8,padding:"6px 10px"}}>
              <span style={{fontSize:9,color:"#d4b060",fontWeight:"bold",letterSpacing:1}}>PISTA {i+1} · </span>
              <span style={{fontSize:12,color:"#e8d8b0"}}>{h}</span>
            </div>
          ))}
        </div>}
        <div style={{fontSize:11,color:"#888"}}>Puntos si aciertas: <b style={{color:isChallenge?"#FF6666":"#d4b060"}}>{pts} {isChallenge?"casillas":"pts"}</b></div>
      </div>
      {hr<question.hints.length&&<button style={{...S.hintBtn,marginBottom:12}} onClick={onHint}>💡 Pista {hr+1} de {question.hints.length}</button>}
      <p style={{color:"#555",fontSize:11,marginBottom:6,letterSpacing:1,fontFamily:"'Cinzel',Georgia,serif"}}>¿QUIÉN RESPONDE PRIMERO?</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,width:"100%",maxWidth:440}}>
        {players.map((p:any)=>{
          const used=buzzed.includes(p.name);
          const isMe=p.name===myName;
          return (
            <button key={p.name} disabled={used||!isMe} onClick={()=>{if(!used&&isMe){audio.playBuzz();onBuzz(p.name);}}}
              style={{border:isMe?"2px solid rgba(255,255,255,.4)":"none",borderRadius:12,padding:"13px 8px",cursor:(used||!isMe)?"not-allowed":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:used?"rgba(255,255,255,.04)":p.color,opacity:used?.3:isMe?1:.6,boxShadow:"0 3px 10px rgba(0,0,0,.4)",fontFamily:"inherit",position:"relative"}}>
              {p.position>=61&&!used&&<div style={{position:"absolute",top:-3,right:-3,width:8,height:8,borderRadius:"50%",background:"#FFD700"}}/>}
              <span style={{fontSize:20}}>{AVATARS[p.avatar]?.emoji||"?"}</span>
              <b style={{fontSize:12,color:"#fff"}}>{p.name}{isMe?" (Tú)":""}</b>
              <small style={{color:"rgba(255,255,255,.75)",fontSize:10}}>{p.score}pts · C{p.position}</small>
            </button>
          );
        })}
      </div>
      <p style={{color:"#444",fontSize:10,marginTop:10}}>Solo podés tocar tu propio botón</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ANSWER SCREEN
// ═══════════════════════════════════════════════════════════════
function AnswerScreen({ question, player, playerObj, hr, onAnswer }: any) {
  const [typed,setTyped]=useState("");
  const [mode,setMode]=useState("opts");
  const isChallenge=question.cat==="Desafío";
  const pts=isChallenge?CHALLENGE.correct:ptsFor(hr);
  const wrong=DB.filter(q=>q.cat===question.cat&&norm(q.a)!==norm(question.a)).map(q=>q.a);
  const opts=shuffle([question.a,...shuffle(wrong).slice(0,3)]);
  return (
    <div style={{...S.wrap,paddingTop:16,background:isChallenge?"#1a0800":"#17120a"}}>
      <style>{FONTS}</style>
      {isChallenge&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#FF4444,#FF8800,#FF4444)",backgroundSize:"200%",animation:"goldShim 1s linear infinite"}}/>}
      <div style={{borderRadius:999,padding:"9px 22px",fontWeight:"bold",fontSize:15,marginBottom:6,color:"#fff",background:playerObj.color,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:20}}>{AVATARS[playerObj.avatar]?.emoji||"?"}</span>
        <span style={{fontFamily:"'Cinzel',Georgia,serif"}}>{player} — ¡Respondé!</span>
      </div>
      <div style={{fontSize:11,color:isChallenge?"#FF8888":"#888",marginBottom:12}}>{isChallenge?`⚡ +${CHALLENGE.correct} casillas si acertás`:`✅ Acierto +${pts}pts · ❌ Error ${POINTS.wrong}pts`}</div>
      <p style={{fontSize:17,fontWeight:"bold",textAlign:"center",marginBottom:12,maxWidth:440,lineHeight:1.5,color:"#e8d8b0",fontFamily:"'Cinzel',Georgia,serif"}}>{question.q.replace("⚡ DESAFÍO: ","")}</p>
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
function ResultScreen({ correct, player, playerObj, pts, ptsLabel, correctAnswer, newPos, onNext, isChallenge, isHost }: any) {
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
      {isChallenge&&<div style={{fontSize:11,color:correct?"#FF8844":"#888",marginBottom:6}}>{correct?"⚡ ¡Desafío superado!":"⚡ Desafío fallido"}</div>}
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
  return (
    <div style={{...S.wrap,justifyContent:"center",textAlign:"center"}}>
      <style>{FONTS}</style>
      <div style={{fontSize:44,marginBottom:8}}>🎆✨🎇</div>
      <span style={{fontSize:52,animation:"popIn .5s ease"}}>{AVATARS[winner.avatar]?.emoji||"?"}</span>
      <h1 style={{fontSize:24,fontWeight:900,color:"#d4b060",margin:"10px 0 4px",fontFamily:"'Cinzel Decorative',Georgia,serif",textShadow:"0 0 40px rgba(212,176,96,.45)",letterSpacing:2}}>¡{winner.name} GANÓ!</h1>
      <p style={{fontSize:12,color:"#c8a850",marginBottom:4,fontStyle:"italic",fontFamily:"'Cinzel',Georgia,serif"}}>"Has recorrido el camino de la sabiduría"</p>
      <p style={{fontSize:10,color:"#888",marginBottom:18}}>🏆 Llegó a la casilla 66</p>
      <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%",maxWidth:320,marginBottom:18}}>
        {sorted.map((p:any,i:number)=>(
          <div key={p.name} style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"9px 12px",display:"flex",alignItems:"center",gap:10,borderLeft:`4px solid ${p.color}`}}>
            <span style={{fontSize:17,width:26}}>{["🥇","🥈","🥉"][i]||`#${i+1}`}</span>
            <span style={{fontSize:14}}>{AVATARS[p.avatar]?.emoji||"?"}</span>
            <span style={{flex:1,fontWeight:"bold",fontSize:13,color:"#e8d8b0",fontFamily:"'Cinzel',Georgia,serif"}}>{p.name}</span>
            <span style={{color:"#d4b060",fontWeight:"bold",fontSize:13}}>{p.score}pts</span>
          </div>
        ))}
      </div>
      <button style={S.mainBtn} onClick={onRestart}>🔁 NUEVA PARTIDA</button>
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
  const [gameState,setGameState]=useState<any>(null);
  const [showBoard,setShowBoard]=useState(false);
  const [popupPlayer,setPopupPlayer]=useState<any>(null);
  const roomRef = useRef<any>(null);
  const prevPositions = useRef<Record<string,number>>({});
  const audio = useAudio();

  // Derived state from Firebase
  const players: any[] = gameState?.players ? Object.values(gameState.players) : [];
  const questions: any[] = gameState?.questions || [];
  const qIdx: number = gameState?.qIdx || 0;
  const hr: number = gameState?.hr || 0;
  const buzzed: string[] = gameState?.buzzed || [];
  const buzzer: string|null = gameState?.buzzer || null;
  const result: any = gameState?.result || null;
  const cQ = questions[qIdx];
  const myPlayer = players.find(p=>p.name===myName);

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
      if(s) setScreen(s);
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
  const handleJoin = async (code:string) => {
    const snap = await get(ref(db,`rooms/${code}`));
    if(!snap.exists()){alert("Sala no encontrada. Verificá el código.");return;}
    setRoomCode(code);
    setIsHost(false);
    setScreen("register");
  };

  // Register name + avatar
  const handleRegister = async (name:string, avatar:number) => {
    setMyName(name);
    // SOLO MODE — sin Firebase
    if(roomCode === "__solo__") {
      const soloPlayer = { name, avatar, score:0, position:1, color:PLAYER_COLORS[0] };
      const qs = shuffle(DB);
      setGameState({ screen:"game", qIdx:0, hr:0, buzzed:[], buzzer:null, result:null, questions:qs, players:{ [name]: soloPlayer } });
      audio.startTickTock();
      setScreen("narrative");
      return;
    }
    let code = roomCode;
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
      const snap=await get(ref(db,`rooms/${code}`));
      const data=snap.val();
      const existingPlayers=Object.values(data.players||{}) as any[];
      const colorIdx=existingPlayers.length%PLAYER_COLORS.length;
      await update(ref(db,`rooms/${code}/players`),{
        [name]:{ name, avatar, score:0, position:1, color:PLAYER_COLORS[colorIdx] }
      });
    }
    setScreen("waiting");
  };

  // HOST: start game
  const handleStart = async () => {
    audio.startTickTock();
    await update(ref(db,`rooms/${roomCode}`),{ screen:"narrative" });
  };

  // After narrative
  const handleNarrativeDone = async () => {
    await update(ref(db,`rooms/${roomCode}`),{ screen:"game" });
  };

  // Buzz
  const handleBuzz = async (name:string) => {
    if(name==="__timeout__"){
      const remaining=players.filter(p=>!buzzed.includes(p.name));
      if(remaining.length<=1){ nextQuestion(); return; }
      await update(ref(db,`rooms/${roomCode}`),{ buzzed:[...buzzed,remaining[0].name] });
      return;
    }
    await update(ref(db,`rooms/${roomCode}`),{ buzzer:name, screen:"answer" });
  };

  // Answer
  const handleAnswer = async (opt:string) => {
    if(!buzzer||!cQ) return;
    const ok=norm(opt)===norm(cQ.a);
    const isChallenge=cQ.cat==="Desafío";
    const steps=ok?(isChallenge?CHALLENGE.correct:ptsFor(hr)):(isChallenge?CHALLENGE.wrong:POINTS.wrong);
    const ptsChange=ok?Math.abs(steps):-Math.abs(steps);
    const ptsLabel=`${ok?"+":""}${ptsChange} ${isChallenge?"casillas":"pts"}`;

    const buzzerPlayer=players.find(p=>p.name===buzzer);
    if(!buzzerPlayer) return;

    const newScore=Math.max(0,buzzerPlayer.score+(ok?Math.abs(steps):0));
    const newPos=Math.min(TOTAL,Math.max(1,buzzerPlayer.position+(ok?Math.abs(steps):-Math.abs(steps))));

    if(ok) audio.playCorrect(); else audio.playWrong();
    audio.playNearEnd(newPos);

    const updates: any = {
      [`players/${buzzer}/score`]: newScore,
      [`players/${buzzer}/position`]: newPos,
      result:{ correct:ok, player:buzzer, playerAvatar:buzzerPlayer.avatar, playerColor:buzzerPlayer.color, pts:ptsChange, ptsLabel, correctAnswer:cQ.a, newPos, isChallenge },
      screen:"result"
    };

    await update(ref(db,`rooms/${roomCode}`),updates);

    if(ok&&newPos>=TOTAL){
      setTimeout(async()=>{ audio.playVictory(); await update(ref(db,`rooms/${roomCode}`),{screen:"win"}); },1500);
    }
  };

  const nextQuestion = async () => {
    const ni=qIdx+1;
    if(ni>=questions.length){ await update(ref(db,`rooms/${roomCode}`),{screen:"win"}); return; }
    await update(ref(db,`rooms/${roomCode}`),{ qIdx:ni, hr:0, buzzed:[], buzzer:null, result:null, screen:"game" });
  };

  const addHint = async () => {
    if(!cQ||hr>=cQ.hints.length) return;
    await update(ref(db,`rooms/${roomCode}`),{ hr:hr+1 });
  };

  const handleRestart = async () => {
    audio.stopTickTock();
    // Clear room and go back to intro
    setRoomCode(""); setMyName(""); setIsHost(false); setGameState(null);
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

      {screen==="intro"&&<IntroScreen onStart={()=>setScreen("lobby")} onSolo={()=>{setIsHost(true);setRoomCode("__solo__");setScreen("register");}}/>}
      {screen==="lobby"&&<LobbyScreen onHost={handleHost} onJoin={handleJoin} onBack={()=>setScreen("intro")}/>}
      {screen==="register"&&<RegisterScreen usedAvatars={usedAvatars} usedNames={usedNames} onDone={handleRegister} audio={audio}/>}
      {screen==="waiting"&&<WaitingRoom roomCode={roomCode} players={players} isHost={isHost} myName={myName} onStart={handleStart} onLeave={handleRestart}/>}
      {screen==="narrative"&&<NarrativeScreen onDone={handleNarrativeDone}/>}
      {screen==="game"&&cQ&&!showBoard&&(
        <QuestionScreen question={cQ} players={players} hr={hr} onHint={addHint}
          onBuzz={handleBuzz} buzzed={buzzed} qIdx={qIdx} total={questions.length}
          audio={audio} myName={myName} isHost={isHost}/>
      )}
      {screen==="answer"&&cQ&&!showBoard&&buzzer&&myName===buzzer&&(
        <AnswerScreen question={cQ} player={buzzer} playerObj={buzzerObj} hr={hr} onAnswer={handleAnswer}/>
      )}
      {screen==="answer"&&cQ&&!showBoard&&buzzer&&myName!==buzzer&&(
        <div style={{...S.wrap,justifyContent:"center",textAlign:"center"}}>
          <style>{FONTS}</style>
          <div style={{fontSize:48,marginBottom:16,animation:"spin 2s linear infinite"}}>⏳</div>
          <p style={{color:"#c8a850",fontFamily:"'Cinzel',Georgia,serif",fontSize:16,letterSpacing:2}}>{buzzer} está respondiendo...</p>
        </div>
      )}
      {screen==="result"&&result&&!showBoard&&resultPlayerObj&&(
        <ResultScreen correct={result.correct} player={result.player} playerObj={resultPlayerObj}
          pts={result.pts} ptsLabel={result.ptsLabel} correctAnswer={result.correctAnswer}
          newPos={result.newPos} isChallenge={result.isChallenge}
          onNext={isHost?nextQuestion:undefined} isHost={isHost}/>
      )}
      {screen==="win"&&winner&&<WinScreen winner={winner} players={players} onRestart={handleRestart}/>}
    </div>
  );
}
