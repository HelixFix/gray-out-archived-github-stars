async function grayifyArchived() {
    console.log("Starting grayifyArchived...");

    let starredRepos = document.querySelectorAll("div.col-12.d-block.width-full.py-4.border-bottom.color-border-muted");

    console.log("Number of starred repos found:", starredRepos.length);

    // On récupère les résultats en cache s'ils sont disponibles
    let cache = JSON.parse(localStorage.getItem('repoCache')) || {};

    for (const element of starredRepos) {
        let repoName = element.querySelector("h3 a");
        if (repoName) {
            let repoUrl = repoName.href;
            console.log("Checking repo:", repoUrl);

            // On vérifie si le dépôt est dans le cache et si sa date de dernière mise à jour est antérieure à 7 jours
            if (cache[repoUrl] && (new Date() - new Date(cache[repoUrl].lastChecked)) < 7 * 24 * 60 * 60 * 1000) {
                console.log("Repo found in cache:", repoUrl);
                if (cache[repoUrl].archived) {
                    console.log("Repo is archived:", repoUrl);
                    repoName.style.color = "gray";
                } else {
                    console.log("Repo is active:", repoUrl);
                }
            } else {
                console.log("Fetching repo:", repoUrl);
                try {
                    const response = await fetch(repoUrl);
                    const html     = await response.text();
                    console.log("Repo fetched:", repoUrl);
                    let parser    = new DOMParser();
                    let doc       = parser.parseFromString(html, "text/html");
                    let flashWarn = doc.querySelector("div.flash.flash-warn.flash-full.border-top-0.text-center.text-bold.py-2");
                    if (flashWarn) {
                        console.log("Repo is archived:", repoUrl);
                        repoName.style.color = "gray";
                        // On met à jour le cache avec la date de la dernière vérification et le statut "archivé" du dépôt
                        cache[repoUrl] = {lastChecked: new Date().toISOString(), archived: true};
                        localStorage.setItem('repoCache', JSON.stringify(cache));
                    } else {
                        console.log("Repo is active:", repoUrl);
                        // On met à jour le cache avec la date de la dernière vérification et le statut "actif" du dépôt
                        cache[repoUrl] = {lastChecked: new Date().toISOString(), archived: false};
                        localStorage.setItem('repoCache', JSON.stringify(cache));
                    }
                } catch (error) {
                    console.error(`Error while fetching repo ${repoUrl}`, error);
                }
            }
        }
    }
    console.log("Finished grayifyArchived.");
}

grayifyArchived();
