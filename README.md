# Studios vidéo : Album Studio & LE TOP
Application locale React + Remotion pour créer des vidéos de notation d’albums, MP4 H.264 1080 × 1920, 30 FPS. Serveur Express pour le rendu, aperçu Remotion Player utilisant la même composition.

## Démarrer
Prérequis : Node.js 22 ou 24, npm, Chromium et ses dépendances Linux. Dans ce cloud Chromium est disponible à `/usr/bin/chromium`. Sur une autre machine définir `CHROME_PATH` avec le chemin du navigateur Chromium/Chrome.

```sh
npm ci
npm run dev
```
Ouvrir http://localhost:3000 dans un navigateur local. Importer une pochette, saisir les métadonnées, ajouter et ordonner les morceaux, sélectionner trois morceaux distincts, puis générer et télécharger. Le rendu reste sur la machine, sans API externe ni clé. La pochette est normalisée en JPEG (1600 pixels maximum) à l’import. Les exports se trouvent dans `exports/`. Pas de piste audio incluse.

```sh
npm test
npm run build
# Serveur déjà démarré pour ce test de parcours complet avec véritable export :
npm run test:browser
# Images de validation des albums de 8 et 20 morceaux :
npm run test:video
NODE_ENV=production npm run dev
```

## Animation et notation
Une seule image de fond en mode cover, centrée, floutée et assombrie, et une pochette carrée distincte au premier plan. Zoom du fond continu. Intro 3 s ; tracklist paginée par 12 titres courts maximum, avec moins de lignes pour les titres longs avec révélations de 0,73 à 1,07 s selon le nombre de titres, puis pause de 1,5 s par page ; note globale 2,83 s ; Top 3 successif ; bilan final 5 s par défaut. Les notes utilisent le palier numériquement le plus proche ; en cas d’égalité, le meilleur palier gagne. Titres conservés tels que saisis. Les titres longs passent sur plusieurs lignes et disposent de davantage de hauteur. Les notes peuvent être saisies avec une virgule ou un point.

Export unique à la fois, progression interrogée chaque seconde. Les travaux sont conservés en mémoire du serveur : un redémarrage interrompt leur suivi. Le formulaire reste dans la session du navigateur et n’est pas sauvegardé automatiquement. Le serveur est conçu pour une machine locale de confiance, pas pour un déploiement public.

Le build désactive le tree-shaking Rollup pour éviter un coût de compilation disproportionné avec les modules Remotion ; la compression et la minification restent actives.

## Utiliser sans installation avec GitHub Codespaces

Après publication des fichiers sur GitHub, ouvrir le dépôt, choisir **Code → Codespaces → Create codespace on main**. La configuration `.devcontainer` installe Node.js, Chromium et FFmpeg, installe les dépendances et démarre automatiquement Album Studio. L’aperçu du port 3000 s’ouvre dans le navigateur. Si ce n’est pas le cas, ouvrir l’onglet **Ports**, puis utiliser l’icône **Open in Browser** du port 3000. Garder le Codespace actif pendant les exports. L’aperçu est accessible au propriétaire du Codespace avec son compte GitHub ; GitHub Pages ne peut pas héberger le serveur de rendu vidéo.

## Import rapide de tracklist

Dans **Import rapide**, coller un morceau par ligne, par exemple `MENACE — 10`, `DÉCONNECTÉ — 9` ou `RYUK — 9,5/10`, puis cliquer **Importer la tracklist**. Les séparateurs tiret, tabulation, deux-points, point-virgule et espace sont acceptés. Les listes numérotées `1.` / `1)` sont acceptées. Choisir **Ajouter** pour compléter la liste ou **Remplacer** pour la refaire. En cas de ligne invalide, aucune modification n’est appliquée et le numéro de ligne est indiqué. Le remplacement conserve les sélections Top 3 des titres identiques.

## Ajuster la durée

Sous l’aperçu, le réglage **Durée de la vidéo** propose un mode automatique adapté à la tracklist et un mode **Personnalisée** avec un curseur en secondes. Pour les durées courtes, le rythme des morceaux accélère et les étapes intro/note/Top 3 sont raccourcies. Le bilan final reste affiché 5 secondes par défaut. Le minimum évolue avec le nombre de morceaux et de pages pour préserver la lisibilité. L’aperçu et le MP4 utilisent le même réglage.

Le mode **Titres seuls** de l’import rapide accepte un titre par ligne sans note. Les notes importées restent vides et les pastilles sont neutres jusqu’à leur saisie manuelle. Les nombres faisant partie d’un titre (par exemple `PARTIE 2` ou `24/7`) restent dans le titre. Choisir **Titres et notes** pour conserver l’import avec notation. Toutes les notes doivent être remplies avant de générer la vidéo.

## Bilan final et format court

La vidéo se termine par une carte récapitulative de 5 secondes par défaut : pochette, artiste, album, note globale, toute la tracklist avec notes et pastilles, puis Top 3. La liste passe en colonnes pour les albums longs. En mode Personnalisée, le minimum est abaissé (14 secondes pour 3 morceaux, 21 secondes pour 20 morceaux courts avec un bilan de 5 secondes) ; l’animation accélère et les étapes se raccourcissent automatiquement. Pour les listes exceptionnellement longues, vérifier la lisibilité du bilan dans l’aperçu.

Le réglage **Durée du bilan final** permet de conserver l’écran récapitulatif entre 3 et 15 secondes (5 par défaut), indépendamment du rythme des titres. La durée totale et son minimum prennent ce réglage en compte. La note globale est aussi convertie en étoiles sur 5, arrondies à la demi-étoile la plus proche : `8,6/10 → 4,5/5`, `8,1/10 → 4/5`, `10/10 → 5/5`. Les demi-étoiles sont remplies à moitié. Les pages de défilement contiennent jusqu’à 12 titres courts, avec une pagination plus aérée pour les titres longs.

## Transitions

La pochette principale passe progressivement de 390 à 310 pixels entre la note globale et le Top 3, puis se déplace vers son emplacement du bilan final. Une seule pochette au premier plan reste montée pendant tout le rendu. Les phases et pages s’enchaînent avec des fondus de 0,8 à 1 seconde et des mouvements amortis. Le minimum des vidéos courtes conserve davantage de temps pour les titres. Les étoiles remplies et demi-étoiles sont toujours jaunes ; aucun nombre sur 5 n’est affiché à côté, et la note originale sur 10 reste visible.

## Deuxième application : LE TOP

Ouvrir `/le-top.html` (ou cliquer **LE TOP** dans l’en-tête d’Album Studio). Le même serveur sur le port 3000 sert deux interfaces et deux compositions Remotion distinctes.

- Importer une photo d’artiste pour le fond, assombri et légèrement flouté avec zoom continu.
- Donner un nom au classement. Chaque entrée contient une pochette carrée, un titre et un artiste.
- Saisir le meilleur titre en première position ; les flèches changent le classement. La révélation par défaut va du dernier au n°1. Le bilan final conserve l’ordre du n°1 au dernier.
- **Import rapide** accepte `Titre — Artiste` (un par ligne) et l’import de plusieurs pochettes en une sélection. Le nom de fichier préremplit le titre ; l’artiste reste à compléter. Les imports sont locaux, PNG/JPEG/WebP, 10 Mo maximum par image.
- L’aperçu et le bilan utilisent la même composition que l’export. **Voir le bilan** permet de contrôler immédiatement le classement avec les petites pochettes.
- Durée automatique : intro 2 secondes, 3 secondes par titre, puis bilan de 5 secondes. Durée totale personnalisable, avec au moins 2 secondes par titre. Le bilan se règle indépendamment de 3 à 15 secondes. Le n°1 bénéficie d’une animation et d’une couleur de rang plus marquées.
- Export MP4 H.264, 1080 × 1920, 30 FPS. Un export à la fois pour les deux applications. Pas de piste musicale ajoutée. Le formulaire reste dans la session du navigateur.

```sh
# Serveur démarré pour le test du formulaire et du véritable MP4 :
npm run test:top:browser
# Images du décompte, du n°1 et du bilan pour 3 et 20 titres :
npm run test:top:video
```

L’API `POST /api/top/render` crée un export LE TOP ; les endpoints de progression et téléchargement restent `/api/jobs/:id` et `/api/download/:id`. Le bilan de classements exceptionnellement longs doit être contrôlé dans l’aperçu pour la lisibilité.

### Audio dans LE TOP
Chaque titre peut recevoir un fichier MP3, WAV, M4A, AAC, FLAC ou OGG (100 Mo maximum) et un point de départ en secondes. L’extrait joue pendant la révélation de sa pochette, avec des fondus ; un extrait trop court se termine sans boucle. Le bilan final reste silencieux. Les fichiers audio sont stockés localement dans `exports/audio/`, nécessaire à l’aperçu et au rendu ; le dossier `exports/` peut être purgé lorsque les projets ne sont plus utilisés. Les moteurs FFprobe et FFmpeg sont installés par npm : aucune installation système supplémentaire pour l’import. Les fichiers sont convertis en MP3 compatible, en conservant uniquement le son, même si une pochette est intégrée au fichier. Les fichiers protégés Apple Music ne sont pas pris en charge. Les liens Apple Music et TikTok ne sont pas des imports audio : pour utiliser la bibliothèque TikTok, exportez sans audio puis choisissez la musique au moment de publier.
