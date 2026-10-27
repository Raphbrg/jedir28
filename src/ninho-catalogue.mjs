import {ninhoAppleMatches} from './ninho-apple-matches.mjs';
// User's project selection. Titles remain available without Apple connectivity.
const titles=`M.I.L.S
Soleil
Sourire
Pour nous
Crésus
Monotonie
Dis moi que tu m'aimes
La Roma
Elle a mal
Bitch Dab
Somnanbule
Tout ira mieux
Malcolm
Ttr
Comme prévu
Chino
Mamacita
Laisse pas traîner ton fils
Roro
HLM ou Palace
Rose
De l'autre côté
Elle m'a eu
Ce soir
Dita
Pourquoi
Lové
Carbozo
M.I.L.S 2.0
Fendi
PGP
Toutes options
Mama No Cry
Pavé
Un Poco
44
Bavard
Chacun son tour
Coffrer
Vrais
Violet
Bob
Sans peine
La vie qu'on mène
Goutte d'eau
Paris c'est magique
Jeune Lossa
Tokarev
La vivance
Big Pac
NI
Maman ne le sait pas
L'ancien
Jamais
Jusqu'à minuit
Putana
A Kinshasa
Zero paluche
Money
Outro
Intro
M.I.L.S 3
Zipette
Gros vendeurs
Promo
Mauvais Djo
La puerta
En chien
Centre commercial
Tu sais qu'on est gang
C'était le rap
Lettre à une femme
Every day
Le jeu
Bali
Millésimes
Filon
Problèmes du matin
Toutes les couleurs
Kitchen
Tout en Gucci
Privilège
Mac 11
Intro
Jefe
VVS
Sky Priority
OG
Arme de poing
Vérité
No Life
RER D
YSL
Aïcha
Mood
Athéna
La maison que je voulais
Outro
La vie de Johnny
Yo moko oyebi
Rich Porter
Blue story
Edouard Nahum
25 G
Respect
Branché sur snap
Bad
Dans la peau
No love
Eurostar
Chiraq
Plus qu'eux
Bon qu'à ça
Grands ensembles
Griot
Mode S Plus
Vinicius
Signes de gang
Christopher Wallace
Boucherie
Jungle
Malsain
Guitare
Coco
Du Sal
Broly
Ghetto Star
HAQ
Collabo
Opinel 12
Waribana
911
Loin d'eux
Authentique
INTRO - LA PRESSION
+971
WALLET
KING VON
RESINE
J'AI PAS CHANGE
AU 33EME
LETTRE A UN FILS
NWAR
DICTIONNAIRES
N.W.A
LES DIAMANTS DE BOKASSA
PILIER
R9
LES MAINS DEDANS
DES PIGES`.split('\n');
export const ninhoCatalogue=titles.map((title,index)=>({id:`ninho-${index+1}`,title,artist:'Ninho',album:'',source:'ninho-project',preview:null}));
export const ninhoAudioCatalogue=ninhoCatalogue.map(track=>({...track,...ninhoAppleMatches[track.id],id:track.id,title:track.title,source:track.source,lookupDone:!!ninhoAppleMatches[track.id]}));
export const catalogueKey=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function filterNinhoCatalogue(query=''){
 const key=catalogueKey(query);return !key||key==='ninho'?ninhoAudioCatalogue:ninhoAudioCatalogue.filter(t=>catalogueKey(t.title).includes(key)).sort((a,b)=>Number(catalogueKey(b.title)===key)-Number(catalogueKey(a.title)===key));
}
