import test from 'node:test';import assert from 'node:assert/strict';
import {topTiming,orderedEntries,validateTop,parseTop,audioVolume,audioLevel,topAudioSegments} from '../src/top/model.mjs';
const image='data:image/jpeg;base64,eA==';const data={name:'Mon top',background:image,entries:Array.from({length:3},(_,i)=>({id:String(i),title:`Titre ${i}`,artist:'Artiste',cover:image})),revealOrder:'countdown',endScreenSeconds:5};
test('Countdown ends at number one; recap keeps original ranking without mutation',()=>{assert.deepEqual(orderedEntries(data).map(e=>e.rank),[3,2,1]);assert.deepEqual(orderedEntries({...data,revealOrder:'ascending'}).map(e=>e.rank),[1,2,3]);assert.equal(data.entries[0].id,'0');});
test('Top duration supports automatic, manual and independently adjustable ending',()=>{const t=topTiming(data);assert.equal(t.duration,495);assert.equal(t.summaryStart,345);assert.equal(topTiming({...data,durationSeconds:20}).duration,600);assert.equal(topTiming({...data,durationSeconds:1}).duration,420);assert.equal(topTiming({...data,endScreenSeconds:10}).duration,645);assert.equal(topTiming({...data,endScreenSeconds:10}).endFrames,300);});
test('Top import preserves names and rejects incomplete lines atomically',()=>{assert.deepEqual(parseTop('1. MENACE — Laylow\nRYUK\tÉté\nA - B'),[{title:'MENACE',artist:'Laylow'},{title:'RYUK',artist:'Été'},{title:'A',artist:'B'}]);assert.throws(()=>parseTop('MENACE — Laylow\nINVALIDE'),/Ligne 2/);assert.throws(()=>parseTop(''));});
test('Top export requires background, title, artist and each cover; remote images rejected',()=>{assert.doesNotThrow(()=>validateTop(data));assert.throws(()=>validateTop({...data,background:'https://example.com/photo.jpg'}));assert.throws(()=>validateTop({...data,entries:[{...data.entries[0],cover:''}]}),/N°1/);assert.throws(()=>validateTop({...data,entries:[{...data.entries[0],artist:''}]}));assert.throws(()=>validateTop({...data,entries:[]}));});

test('Top intro is adjustable and restricts audio to uploaded files and valid offsets',()=>{assert.equal(topTiming(data).introEnd,75);assert.equal(topTiming({...data,introSeconds:1}).introEnd,30);assert.equal(topTiming({...data,introSeconds:6}).introEnd,180);const audioEntry={...data.entries[0],audio:'/api/audio/12345678-1234-1234-1234-123456789abc',audioDuration:10,audioStart:2};assert.doesNotThrow(()=>validateTop({...data,entries:[audioEntry]}));for(const patch of [{audio:'https://example.com/song.mp3'},{audioStart:10},{audioStart:-1}])assert.throws(()=>validateTop({...data,entries:[{...audioEntry,...patch}]}));});

test("Audio fades softly at both ends, including very short excerpts",()=>{assert.equal(audioVolume(0,90),0);assert.equal(audioVolume(6,90),.5);assert.equal(audioVolume(30,90),1);assert.equal(audioVolume(83,90),.5);assert.equal(audioVolume(89,90),0);assert.equal(audioVolume(0,1),0);assert.ok(audioVolume(2,6)<=1);});

test('Track and master volume multiply, including mute and old projects',()=>{assert.equal(audioLevel({},{}),1);assert.equal(audioLevel({audioVolume:50},{audioVolume:50}),.25);assert.equal(audioLevel({audioVolume:0},{audioVolume:100}),0);assert.equal(audioLevel({audioVolume:100},{audioVolume:0}),0);assert.throws(()=>validateTop({...data,audioVolume:101}),/volume/);});


test('Winner audio continues into the recap and respects the remaining source duration',()=>{
 const entries=data.entries.map(e=>({...e,audio:'/api/audio/12345678-1234-1234-1234-123456789abc',audioDuration:30,audioStart:2}));
 const project={...data,entries};const t=topTiming(project);const segments=topAudioSegments(project);
 const winner=segments.find(s=>s.entry.rank===1);assert.equal(winner.from,t.summaryStart-t.itemFrames);assert.equal(winner.from+winner.duration,t.duration);assert.equal(winner.startFrom,60);
 for(const segment of segments.filter(s=>s.entry.rank!==1))assert.ok(segment.from+segment.duration<=t.summaryStart);
 const short=topAudioSegments({...project,entries:[{...entries[0],audioDuration:4}]}).find(s=>s.entry.rank===1);assert.equal(short.duration,60);
 const exhausted=topAudioSegments({...project,entries:[{...entries[0],audioDuration:2}]} );assert.equal(exhausted.length,0);
});
test('Ascending order resumes the winner during the recap without overlapping other ranks',()=>{
 const project={...data,revealOrder:'ascending',entries:data.entries.map(e=>({...e,audio:'/api/audio/12345678-1234-1234-1234-123456789abc',audioDuration:30,audioStart:1}))};
 const t=topTiming(project);const winner=topAudioSegments(project).filter(s=>s.entry.rank===1);assert.equal(winner.length,2);assert.equal(winner[0].from+winner[0].duration,t.introEnd+t.itemFrames);assert.equal(winner[1].from,t.summaryStart);assert.equal(winner[1].startFrom,winner[0].startFrom+winner[0].duration);assert.equal(winner[1].from+winner[1].duration,t.duration);
});
