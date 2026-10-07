# Album Studio
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
Une seule image de fond en mode cover, centrée, floutée et assombrie, et une pochette carrée distincte au premier plan. Zoom du fond continu. Intro 3 s ; tracklist paginée par 8 titres maximum, avec moins de lignes pour les titres longs avec révélations de 0,73 à 1,07 s selon le nombre de titres, puis pause de 1,5 s par page ; note globale 2,83 s ; Top 3 successif ; outro 1,67 s. Les notes utilisent le palier numériquement le plus proche ; en cas d’égalité, le meilleur palier gagne. Titres conservés tels que saisis. Les titres longs passent sur plusieurs lignes et disposent de davantage de hauteur. Les notes peuvent être saisies avec une virgule ou un point.

Export unique à la fois, progression interrogée chaque seconde. Les travaux sont conservés en mémoire du serveur : un redémarrage interrompt leur suivi. Le formulaire reste dans la session du navigateur et n’est pas sauvegardé automatiquement. Le serveur est conçu pour une machine locale de confiance, pas pour un déploiement public.

Le build désactive le tree-shaking Rollup pour éviter un coût de compilation disproportionné avec les modules Remotion ; la compression et la minification restent actives.

## Utiliser sans installation avec GitHub Codespaces

Après publication des fichiers sur GitHub, ouvrir le dépôt, choisir **Code → Codespaces → Create codespace on main**. La configuration `.devcontainer` installe Node.js, Chromium et FFmpeg, installe les dépendances et démarre automatiquement Album Studio. L’aperçu du port 3000 s’ouvre dans le navigateur. Si ce n’est pas le cas, ouvrir l’onglet **Ports**, puis utiliser l’icône **Open in Browser** du port 3000. Garder le Codespace actif pendant les exports. L’aperçu est accessible au propriétaire du Codespace avec son compte GitHub ; GitHub Pages ne peut pas héberger le serveur de rendu vidéo.

## Import rapide de tracklist

Dans **Import rapide**, coller un morceau par ligne, par exemple `MENACE — 10`, `DÉCONNECTÉ — 9` ou `RYUK — 9,5/10`, puis cliquer **Importer la tracklist**. Les séparateurs tiret, tabulation, deux-points, point-virgule et espace sont acceptés. Les listes numérotées `1.` / `1)` sont acceptées. Choisir **Ajouter** pour compléter la liste ou **Remplacer** pour la refaire. En cas de ligne invalide, aucune modification n’est appliquée et le numéro de ligne est indiqué. Le remplacement conserve les sélections Top 3 des titres identiques.
