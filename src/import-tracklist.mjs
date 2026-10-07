export function parseTracklist(text, format = 'rated') {
  const tracks = [];
  const errors = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    if (format === 'titles') {
      const title = line.replace(/^(?:\d+[.)]\s+|[•●]\s+)/, '').trim();
      if (!title) errors.push(`Ligne ${index + 1} : titre requis.`);
      else tracks.push({title, score: ''});
      return;
    }
    const match = line.match(/^(.+?)(?:\s*[—–;:\t]\s*|\s+-\s*|\s+)(-?\d+(?:[.,]\d+)?)\s*(?:\/\s*10)?\s*$/);
    if (!match) {
      errors.push(`Ligne ${index + 1} : titre et note attendus (ex. MENACE — 10).`);
      return;
    }
    const title = match[1].replace(/^(?:\d+[.)]\s+|[•●]\s+)/, '').trim();
    const score = match[2].replace(',', '.');
    if (!title || Number(score) < 0 || Number(score) > 10) {
      errors.push(`Ligne ${index + 1} : titre requis et note comprise entre 0 et 10.`);
      return;
    }
    tracks.push({title, score});
  });
  if (errors.length) throw new Error(errors.join('\n'));
  if (!tracks.length) throw new Error(format === 'titles' ? 'Collez au moins un titre.' : 'Collez au moins un morceau et sa note.');
  return tracks;
}

export function mergeTracklist(data, imported, mode, makeId) {
  let tracks;
  if (mode === 'replace') {
    const available = [...data.tracks];
    tracks = imported.map(track => {
      const index = available.findIndex(existing => existing.title === track.title);
      const id = index === -1 ? makeId() : available.splice(index, 1)[0].id;
      return {...track, id};
    });
  } else {
    const existing = data.tracks.length === 1 && !data.tracks[0].title.trim() ? [] : data.tracks;
    tracks = [...existing, ...imported.map(track => ({...track, id: makeId()}))];
  }
  return {...data, tracks, top: data.top.map(id => tracks.some(track => track.id === id) ? id : '')};
}
